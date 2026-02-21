import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

/**
 * Represents a single player in the game.
 */
export class Player extends Schema {
  @type("string") sessionId: string = "";
  @type("string") name: string = "";
  @type("uint8") team: number = 0; // 0 = blue, 1 = green
  @type("boolean") isDrawing: boolean = false;
  @type("boolean") isHost: boolean = false;
  @type("boolean") connected: boolean = true;
}

/**
 * A single chat message.
 */
export class ChatMessage extends Schema {
  @type("string") senderName: string = "";
  @type("uint8") team: number = 0;
  @type("string") text: string = "";
  @type("boolean") isSystem: boolean = false;
  @type("number") timestamp: number = 0;
}

/**
 * A single draw stroke (line segment).
 */
export class DrawLine extends Schema {
  @type(["number"]) points = new ArraySchema<number>();
  @type("string") color: string = "#000000";
  @type("uint8") strokeWidth: number = 3;
  @type("string") tool: string = "pen"; // "pen" | "eraser"
}

/**
 * Game phase types:
 * - "lobby"    : waiting for players, host can start
 * - "choosing" : drawer is choosing 1 of 3 words
 * - "drawing"  : active team guessing (60s)
 * - "stealing" : other team guessing (30s)
 * - "roundEnd" : brief pause between rounds
 * - "gameOver" : a team reached 10 points
 */
export type GamePhase =
  | "lobby"
  | "choosing"
  | "drawing"
  | "stealing"
  | "roundEnd"
  | "gameOver";

/**
 * The main synchronized game state.
 */
export class SketchRaceState extends Schema {
  // Game phase
  @type("string") phase: GamePhase = "lobby";

  // Players (keyed by sessionId)
  @type({ map: Player }) players = new MapSchema<Player>();

  // Team scores [blue, green]
  @type(["uint8"]) teamScores = new ArraySchema<number>(0, 0);

  // Current round info
  @type("string") currentDrawer: string = "";   // sessionId of drawer
  @type("uint8") currentTeam: number = 0;        // active team (0 or 1)
  @type("string") wordHint: string = "";          // "_ _ _ _ _"
  @type("number") timeRemaining: number = 0;      // seconds left
  @type("uint16") roundNumber: number = 0;

  // Drawing data
  @type([DrawLine]) drawLines = new ArraySchema<DrawLine>();

  // Chat messages (last N messages)
  @type([ChatMessage]) chatMessages = new ArraySchema<ChatMessage>();

  // Winner (-1 = no winner yet)
  @type("int8") winningTeam: number = -1;

  // Room code
  @type("string") roomCode: string = "";

  // Language setting
  @type("string") language: string = "hu"; // "hu" | "en"

  // Rotation indices (not synced, server only tracks internally)
  // These are managed in the Room class
}
