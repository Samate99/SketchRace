import { Room, Client } from "colyseus";
import {
  SketchRaceState,
  Player,
  ChatMessage,
  DrawLine,
  type GamePhase,
} from "./schema/MyRoomState.js";
import {
  getRandomWords,
  isCorrectGuess,
  generateWordHint,
} from "../data/words.js";

// Constants
const DRAWING_TIME = 60;       // seconds for active team
const STEALING_TIME = 30;      // seconds for stealing team
const CHOOSING_TIME = 15;      // seconds to choose a word
const ROUND_END_DELAY = 3000;  // ms pause between rounds
const POINTS_TO_WIN = 10;
const MAX_CHAT_MESSAGES = 50;
const ROOM_CODE_LENGTH = 4;
const IS_DEV = process.env.DEV === "true";

/**
 * Generate a random room code (e.g. "ABCD")
 */
function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I, O to avoid confusion
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

interface RoomCreateOptions {
  playerName: string;
  language?: "hu" | "en";
  customWords?: string[];
}

interface RoomJoinOptions {
  playerName: string;
}

export class SketchRaceRoom extends Room<{ state: SketchRaceState }> {
  maxClients = 20;
  state = new SketchRaceState();

  // Server-only state (not synced)
  private currentWord: string = "";
  private customWords: string[] = [];
  private bluePlayerOrder: string[] = [];
  private greenPlayerOrder: string[] = [];
  private blueDrawerIndex: number = 0;
  private greenDrawerIndex: number = 0;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private roundEndTimeout: ReturnType<typeof setTimeout> | null = null;

  /** Helper to pick HU/EN text based on room language */
  private lang(hu: string, en: string): string {
    return this.state.language === "en" ? en : hu;
  }

  // ─── LIFECYCLE ──────────────────────────────────────────────

  onCreate(options: RoomCreateOptions) {
    this.state.roomCode = generateRoomCode();
    this.state.language = options.language || "hu";
    this.customWords = options.customWords || [];

    // Set room metadata for findability by code
    this.setMetadata({ roomCode: this.state.roomCode });

    console.log(
      `[SketchRace] Room created: ${this.state.roomCode} (language: ${this.state.language})`
    );

    // Register message handlers
    this.onMessage("startGame", (client) => this.handleStartGame(client));
    this.onMessage("selectWord", (client, data) => this.handleSelectWord(client, data));
    this.onMessage("draw", (client, data) => this.handleDraw(client, data));
    this.onMessage("clearCanvas", (client) => this.handleClearCanvas(client));
    this.onMessage("chat", (client, data) => this.handleChat(client, data));
    this.onMessage("closeRoom", (client) => this.handleCloseRoom(client));
    this.onMessage("undoLine", (client) => this.handleUndoLine(client));
  }

  onJoin(client: Client, options: RoomJoinOptions) {
    const player = new Player();
    player.sessionId = client.sessionId;
    player.name = options.playerName || `Player ${this.clients.length}`;
    player.connected = true;

    // First player is host
    if (this.state.players.size === 0) {
      player.isHost = true;
    }

    // Assign team (balance teams)
    const blueCount = this.getTeamPlayers(0).length;
    const greenCount = this.getTeamPlayers(1).length;
    if (blueCount <= greenCount) {
      player.team = 0;
    } else {
      player.team = 1;
    }

    this.state.players.set(client.sessionId, player);

    // Add to rotation order
    if (player.team === 0) {
      this.bluePlayerOrder.push(client.sessionId);
    } else {
      this.greenPlayerOrder.push(client.sessionId);
    }

    const teamLabel = player.team === 0
      ? this.lang("Kék", "Blue")
      : this.lang("Zöld", "Green");
    this.addSystemMessage(
      this.lang(
        `${player.name} csatlakozott! (${teamLabel} csapat)`,
        `${player.name} joined! (${teamLabel} team)`
      )
    );
    this.broadcast("playerJoined", { name: player.name, team: player.team });
    console.log(`[SketchRace] ${player.name} joined room ${this.state.roomCode} (team ${player.team})`);
  }

  onLeave(client: Client, code?: number) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    const wasHost = player.isHost;
    const playerName = player.name;

    // Broadcast playerLeft event so clients can show UI feedback
    this.broadcast("playerLeft", { name: playerName, team: player.team });

    // Remove player
    this.removePlayerFromRotation(client.sessionId);
    this.addSystemMessage(this.lang(`${playerName} kilépett.`, `${playerName} left.`));
    this.state.players.delete(client.sessionId);

    // If HOST left, end the game for everyone
    if (wasHost) {
      this.clearTimers();
      this.addSystemMessage(
        this.lang(
          "A host kilépett, a szoba bezáródik.",
          "The host left, the room is closing."
        )
      );
      // Broadcast hostLeft so clients can show a notice and redirect
      this.broadcast("hostLeft", { name: playerName });
      // Give clients a moment to see the message, then kick everyone
      setTimeout(() => {
        // Spread into array to avoid mutation during iteration
        const allClients = [...this.clients];
        for (const c of allClients) {
          c.leave(4000); // code 4000 = consented
        }
        try { this.disconnect(); } catch (_e) { /* already disposed */ }
      }, 2000);
      return;
    }

    // If the drawer left during an active round, end the round
    if (
      this.state.currentDrawer === client.sessionId &&
      (this.state.phase === "drawing" || this.state.phase === "choosing")
    ) {
      this.endRound(false);
    }

    // Check if game can continue
    if (this.state.phase !== "lobby" && this.state.phase !== "gameOver") {
      if (this.getTeamPlayers(0).length === 0 || this.getTeamPlayers(1).length === 0) {
        this.addSystemMessage(
          this.lang(
            "Nincs elég játékos, a játék véget ért.",
            "Not enough players, the game has ended."
          )
        );
        this.resetToLobby();
      }
    }
  }

  onDispose() {
    this.clearTimers();
    console.log(`[SketchRace] Room ${this.state.roomCode} disposed.`);
  }

  // ─── MESSAGE HANDLERS ──────────────────────────────────────

  private handleStartGame(client: Client) {
    const player = this.state.players.get(client.sessionId);
    if (!player?.isHost) return;
    if (this.state.phase !== "lobby") return;

    // Check minimum players
    const blueCount = this.getTeamPlayers(0).length;
    const greenCount = this.getTeamPlayers(1).length;
    const minPerTeam = IS_DEV ? 1 : 2;
    if (blueCount < minPerTeam || greenCount < minPerTeam) {
      client.send("error", {
        message: this.lang(
          IS_DEV
            ? "Mindkét csapatban legalább 1 játékos kell!"
            : "Mindkét csapatban legalább 2 játékos kell!",
          IS_DEV
            ? "At least 1 player per team is required!"
            : "At least 2 players per team are required!"
        ),
      });
      return;
    }

    // Reset scores
    this.state.teamScores[0] = 0;
    this.state.teamScores[1] = 0;
    this.state.roundNumber = 0;
    this.state.winningTeam = -1;

    // Reset rotation
    this.blueDrawerIndex = 0;
    this.greenDrawerIndex = 0;

    // Randomize starting team
    this.state.currentTeam = Math.random() < 0.5 ? 0 : 1;

    this.addSystemMessage(this.lang("A játék elkezdődött! 🎨", "The game has started! 🎨"));
    this.startNewRound();
  }

  private handleSelectWord(client: Client, data: { word: string }) {
    if (client.sessionId !== this.state.currentDrawer) return;
    if (this.state.phase !== "choosing") return;

    this.currentWord = data.word;
    this.state.wordHint = generateWordHint(data.word);
    this.setPhase("drawing");
    this.state.drawLines.clear();

    // Send the selected word privately to the drawer so they can see it
    const drawerClient = this.clients.find((c) => c.sessionId === client.sessionId);
    if (drawerClient) {
      drawerClient.send("wordSelected", { word: data.word });
    }

    this.addSystemMessage(
      this.lang(
        `A rajzoló kiválasztotta a szót! (${this.state.wordHint})`,
        `The drawer has chosen a word! (${this.state.wordHint})`
      )
    );

    // Start drawing timer
    this.startTimer(DRAWING_TIME);
  }

  private handleDraw(client: Client, data: { points: number[]; color: string; strokeWidth: number; tool: string }) {
    if (client.sessionId !== this.state.currentDrawer) return;
    if (this.state.phase !== "drawing" && this.state.phase !== "stealing") return;

    const line = new DrawLine();
    for (const p of data.points) {
      line.points.push(p);
    }
    line.color = data.color;
    line.strokeWidth = data.strokeWidth || 3;
    line.tool = data.tool || "pen";
    this.state.drawLines.push(line);
  }

  private handleClearCanvas(client: Client) {
    if (client.sessionId !== this.state.currentDrawer) return;
    if (this.state.phase !== "drawing" && this.state.phase !== "stealing") return;
    this.state.drawLines.clear();
  }

  private handleUndoLine(client: Client) {
    if (client.sessionId !== this.state.currentDrawer) return;
    if (this.state.phase !== "drawing" && this.state.phase !== "stealing") return;
    if (this.state.drawLines.length > 0) {
      this.state.drawLines.splice(this.state.drawLines.length - 1, 1);
    }
  }

  private handleChat(client: Client, data: { text: string }) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;
    if (!data.text || data.text.trim().length === 0) return;

    // Drawer cannot chat during drawing/stealing
    if (
      client.sessionId === this.state.currentDrawer &&
      (this.state.phase === "drawing" || this.state.phase === "stealing")
    ) {
      return;
    }

    // During stealing phase, only the non-active team can type
    if (this.state.phase === "stealing" && player.team === this.state.currentTeam) {
      return;
    }

    // During drawing phase, only the active team can type (excluding drawer)
    if (this.state.phase === "drawing" && player.team !== this.state.currentTeam) {
      return;
    }

    // Check if it's a correct guess
    if (
      (this.state.phase === "drawing" || this.state.phase === "stealing") &&
      isCorrectGuess(data.text, this.currentWord)
    ) {
      // Don't show the correct word in chat
      this.handleCorrectGuess(client, player);
      return;
    }

    // Normal chat message
    this.addChatMessage(player.name, player.team, data.text, false);
  }

  private handleCloseRoom(client: Client) {
    const player = this.state.players.get(client.sessionId);
    if (!player?.isHost) return;

    this.clearTimers();
    this.addSystemMessage(this.lang("A host bezárta a szobát.", "The host closed the room."));
    this.broadcast("hostLeft", { name: player.name });

    // Explicitly kick all clients after a short delay
    setTimeout(() => {
      const allClients = [...this.clients];
      for (const c of allClients) {
        c.leave(4000);
      }
      try { this.disconnect(); } catch (_e) { /* already disposed */ }
    }, 500);
  }

  // ─── GAME FLOW ─────────────────────────────────────────────

  private startNewRound() {
    this.clearTimers();
    this.state.roundNumber++;
    this.state.drawLines.clear();
    this.currentWord = "";
    this.state.wordHint = "";

    // Get next drawer
    const drawer = this.getNextDrawer();
    if (!drawer) {
      this.addSystemMessage(this.lang("Nincs elég játékos a folytatáshoz.", "Not enough players to continue."));
      this.resetToLobby();
      return;
    }

    // Set all players as not drawing
    this.state.players.forEach((p) => (p.isDrawing = false));

    // Set the new drawer
    this.state.currentDrawer = drawer.sessionId;
    drawer.isDrawing = true;

    // Generate 3 word choices
    const words = getRandomWords(3, this.state.language as "hu" | "en", this.customWords);

    // Send word choices ONLY to the drawer (private message)
    const drawerClient = this.clients.find((c) => c.sessionId === drawer.sessionId);
    if (drawerClient) {
      drawerClient.send("wordChoices", { words });
    }

    this.setPhase("choosing");

    const teamName = this.state.currentTeam === 0
      ? this.lang("Kék", "Blue")
      : this.lang("Zöld", "Green");
    this.addSystemMessage(
      this.lang(
        `${teamName} csapat köre! ${drawer.name} rajzol. 🎨`,
        `${teamName} team's turn! ${drawer.name} is drawing. 🎨`
      )
    );

    // Auto-timeout for choosing
    this.startTimer(CHOOSING_TIME);
  }

  private handleCorrectGuess(client: Client, player: Player) {
    const guessingTeam = player.team;
    let scoringTeam: number;

    if (this.state.phase === "drawing") {
      // Active team guessed correctly
      scoringTeam = this.state.currentTeam;
    } else {
      // Steal!
      scoringTeam = guessingTeam;
    }

    // Award point
    const currentScore = this.state.teamScores[scoringTeam];
    this.state.teamScores[scoringTeam] = currentScore + 1;

    const teamName = scoringTeam === 0
      ? this.lang("Kék", "Blue")
      : this.lang("Zöld", "Green");
    const isSteal = this.state.phase === "stealing";

    this.addSystemMessage(
      this.lang(
        `🎉 ${player.name} kitalálta! A szó: "${this.currentWord}" (+1 pont ${teamName} csapat)${isSteal ? " 🏴‍☠️ LOPÁS!" : ""}`,
        `🎉 ${player.name} guessed it! The word was: "${this.currentWord}" (+1 point ${teamName} team)${isSteal ? " 🏴‍☠️ STEAL!" : ""}`
      )
    );

    // Broadcast correctGuess to all clients for celebration overlay
    this.broadcast("correctGuess", {
      guesser: player.name,
      word: this.currentWord,
      team: scoringTeam,
      isSteal,
    });

    // Check win condition
    if (this.state.teamScores[scoringTeam] >= POINTS_TO_WIN) {
      this.handleGameOver(scoringTeam);
      return;
    }

    this.endRound(true);
  }

  private endRound(wasGuessed: boolean) {
    this.clearTimers();

    if (!wasGuessed && this.currentWord) {
      this.addSystemMessage(
        this.lang(
          `Senki nem találta ki. A szó: "${this.currentWord}" volt.`,
          `Nobody guessed it. The word was: "${this.currentWord}".`
        )
      );
    }

    this.setPhase("roundEnd");

    // Reset drawing state
    this.state.players.forEach((p) => (p.isDrawing = false));

    // Switch teams
    this.state.currentTeam = this.state.currentTeam === 0 ? 1 : 0;

    // Start next round after delay
    this.roundEndTimeout = setTimeout(() => {
      if (this.state.phase === "roundEnd") {
        this.startNewRound();
      }
    }, ROUND_END_DELAY);
  }

  private startStealPhase() {
    this.clearTimers();
    this.setPhase("stealing");

    const stealTeam = this.state.currentTeam === 0
      ? this.lang("Zöld", "Green")
      : this.lang("Kék", "Blue");
    this.addSystemMessage(
      this.lang(
        `⏰ Idő lejárt! ${stealTeam} csapat megpróbálhatja kitalálni! (30 mp)`,
        `⏰ Time's up! ${stealTeam} team can try to steal! (30s)`
      )
    );

    this.startTimer(STEALING_TIME);
  }

  private handleGameOver(winningTeam: number) {
    this.clearTimers();
    this.state.winningTeam = winningTeam;
    this.setPhase("gameOver");

    const teamName = winningTeam === 0
      ? this.lang("Kék", "Blue")
      : this.lang("Zöld", "Green");
    this.addSystemMessage(
      this.lang(
        `🏆 ${teamName} csapat nyert! Gratulálunk! 🎊`,
        `🏆 ${teamName} team wins! Congratulations! 🎊`
      )
    );
  }

  // ─── TIMER ─────────────────────────────────────────────────

  private startTimer(seconds: number) {
    this.clearTimerInterval();
    this.state.timeRemaining = seconds;

    this.timerInterval = setInterval(() => {
      this.state.timeRemaining--;

      if (this.state.timeRemaining <= 0) {
        this.clearTimerInterval();
        this.onTimerExpired();
      }
    }, 1000);
  }

  private onTimerExpired() {
    if (this.state.phase === "choosing") {
      // Auto-select first word if drawer didn't choose
      const words = getRandomWords(1, this.state.language as "hu" | "en", this.customWords);
      this.currentWord = words[0];
      this.state.wordHint = generateWordHint(words[0]);
      this.setPhase("drawing");
      this.state.drawLines.clear();

      // Send word to drawer privately
      const drawerClient = this.clients.find((c) => c.sessionId === this.state.currentDrawer);
      if (drawerClient) {
        drawerClient.send("wordSelected", { word: words[0] });
      }

      this.addSystemMessage(
        this.lang(
          `A rajzoló nem választott, automatikus szó! (${this.state.wordHint})`,
          `The drawer didn't choose, auto-selected word! (${this.state.wordHint})`
        )
      );
      this.startTimer(DRAWING_TIME);
    } else if (this.state.phase === "drawing") {
      // Time's up for active team, start steal
      this.startStealPhase();
    } else if (this.state.phase === "stealing") {
      // Steal time expired, no one guessed
      this.endRound(false);
    }
  }

  // ─── HELPERS ───────────────────────────────────────────────

  private getTeamPlayers(team: number): Player[] {
    const players: Player[] = [];
    this.state.players.forEach((player) => {
      if (player.team === team) {
        players.push(player);
      }
    });
    return players;
  }

  private getNextDrawer(): Player | null {
    const team = this.state.currentTeam;
    const order = team === 0 ? this.bluePlayerOrder : this.greenPlayerOrder;
    const indexKey = team === 0 ? "blueDrawerIndex" : "greenDrawerIndex";

    // Clean up disconnected players from order
    const validOrder = order.filter((id) => {
      const p = this.state.players.get(id);
      return p && p.connected;
    });

    if (team === 0) {
      this.bluePlayerOrder = validOrder;
    } else {
      this.greenPlayerOrder = validOrder;
    }

    if (validOrder.length === 0) return null;

    let index = team === 0 ? this.blueDrawerIndex : this.greenDrawerIndex;
    if (index >= validOrder.length) {
      index = 0;
    }

    const drawerId = validOrder[index];

    // Advance index
    if (team === 0) {
      this.blueDrawerIndex = (index + 1) % validOrder.length;
    } else {
      this.greenDrawerIndex = (index + 1) % validOrder.length;
    }

    return this.state.players.get(drawerId) || null;
  }

  private removePlayerFromRotation(sessionId: string) {
    this.bluePlayerOrder = this.bluePlayerOrder.filter((id) => id !== sessionId);
    this.greenPlayerOrder = this.greenPlayerOrder.filter((id) => id !== sessionId);
  }

  private transferHost() {
    let newHost: Player | null = null;
    this.state.players.forEach((player) => {
      if (!newHost && player.connected) {
        newHost = player;
      }
    });
    if (newHost) {
      (newHost as Player).isHost = true;
      this.addSystemMessage(
        this.lang(
          `${(newHost as Player).name} az új host.`,
          `${(newHost as Player).name} is the new host.`
        )
      );
    }
  }

  private setPhase(phase: GamePhase) {
    this.state.phase = phase;
  }

  private resetToLobby() {
    this.clearTimers();
    this.state.phase = "lobby";
    this.state.currentDrawer = "";
    this.state.wordHint = "";
    this.state.timeRemaining = 0;
    this.state.drawLines.clear();
    this.currentWord = "";
    this.state.players.forEach((p) => (p.isDrawing = false));
  }

  private addSystemMessage(text: string) {
    this.addChatMessage("System", 0, text, true);
  }

  private addChatMessage(
    senderName: string,
    team: number,
    text: string,
    isSystem: boolean,
  ) {
    const msg = new ChatMessage();
    msg.senderName = senderName;
    msg.team = team;
    msg.text = text;
    msg.isSystem = isSystem;
    msg.timestamp = Date.now();
    this.state.chatMessages.push(msg);

    // Keep only last N messages
    while (this.state.chatMessages.length > MAX_CHAT_MESSAGES) {
      this.state.chatMessages.splice(0, 1);
    }
  }

  private clearTimers() {
    this.clearTimerInterval();
    if (this.roundEndTimeout) {
      clearTimeout(this.roundEndTimeout);
      this.roundEndTimeout = null;
    }
  }

  private clearTimerInterval() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}
