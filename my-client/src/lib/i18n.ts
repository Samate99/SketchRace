export type Lang = "hu" | "en";

const translations = {
    // Lobby
    "lobby.yourName": { hu: "Neved", en: "Your name" },
    "lobby.namePlaceholder": { hu: "Írd be a neved...", en: "Enter your name..." },
    "lobby.createRoom": { hu: "Szoba létrehozás", en: "Create Room" },
    "lobby.joinRoom": { hu: "Csatlakozás", en: "Join Room" },
    "lobby.roomSettings": { hu: "Szoba beállítások", en: "Room Settings" },
    "lobby.wordBankLang": { hu: "Szóbank nyelve", en: "Word Bank Language" },
    "lobby.customWords": { hu: "Egyedi szavak (opcionális)", en: "Custom words (optional)" },
    "lobby.customWordsPlaceholder": { hu: "szó1, szó2, szó3...", en: "word1, word2, word3..." },
    "lobby.commaSeparated": { hu: "Vesszővel elválasztva", en: "Comma separated" },
    "lobby.createBtn": { hu: "Szoba létrehozása 🎮", en: "Create Room 🎮" },
    "lobby.creating": { hu: "Létrehozás...", en: "Creating..." },
    "lobby.joinTitle": { hu: "Csatlakozás szobához", en: "Join a Room" },
    "lobby.roomCode": { hu: "Szoba kód", en: "Room Code" },
    "lobby.roomCodePlaceholder": { hu: "pl. ABCD", en: "e.g. ABCD" },
    "lobby.joinBtn": { hu: "Csatlakozás 🚀", en: "Join 🚀" },
    "lobby.joining": { hu: "Csatlakozás...", en: "Joining..." },
    "lobby.subtitle": { hu: "Rajzolj, találd ki, győzz! 🎨", en: "Draw, guess, win! 🎨" },
    "lobby.errNoName": { hu: "Adj meg egy nevet!", en: "Please enter a name!" },
    "lobby.errNoCode": { hu: "Adj meg egy szoba kódot!", en: "Enter a room code!" },
    "lobby.errNoRoom": { hu: "Nincs ilyen szoba, ellenőrizd a kódot!", en: "Room not found, check the code!" },
    "lobby.errCreate": { hu: "Nem sikerült létrehozni a szobát.", en: "Failed to create room." },
    "lobby.errJoin": { hu: "Nem sikerült csatlakozni.", en: "Failed to join." },

    // Game Page
    "game.code": { hu: "Kód", en: "Code" },
    "game.round": { hu: "Kör", en: "Round" },
    "game.start": { hu: "Indítás", en: "Start" },
    "game.closeRoom": { hu: "Szoba bezárása", en: "Close Room" },
    "game.leave": { hu: "Kilépés", en: "Leave" },
    "game.connecting": { hu: "Csatlakozás...", en: "Connecting..." },
    "game.yourWord": { hu: "A szavad", en: "Your word" },

    // Phase banners
    "phase.lobby": { hu: "⏳ Várakozás a játékosokra...", en: "⏳ Waiting for players..." },
    "phase.choosingDrawer": { hu: "Válassz egy szót!", en: "Choose a word!" },
    "phase.choosingOther": { hu: "🎨 A rajzoló választja a szót...", en: "🎨 The drawer is choosing a word..." },
    "phase.drawingDrawer": { hu: "Rajzolj! A csapatod próbálja kitalálni.", en: "Draw! Your team is guessing." },
    "phase.drawingTeam": { hu: "💡 Találd ki mit rajzol!", en: "💡 Guess what's being drawn!" },
    "phase.drawingOther": { hu: "👀 Figyeld a rajzot... (lopási esély jön!)", en: "👀 Watch the drawing... (steal chance coming!)" },
    "phase.stealingActive": { hu: "🏴‍☠️ LOPÁS IDEJE! Találd ki!", en: "🏴‍☠️ STEAL TIME! Guess it!" },
    "phase.stealingWait": { hu: "⏳ A másik csapat próbálja kitalálni...", en: "⏳ The other team is trying to guess..." },
    "phase.roundEnd": { hu: "📋 Kör vége, következő kör indul...", en: "📋 Round over, next round starting..." },

    // Chat
    "chat.title": { hu: "💬 Chat & Tippelés", en: "💬 Chat & Guessing" },
    "chat.placeholder": { hu: "Írd be a tipped...", en: "Type your guess..." },
    "chat.disabled": { hu: "Nem írhatsz most...", en: "You can't type now..." },

    // Scoreboard
    "scoreboard.title": { hu: "Csapatok", en: "Teams" },
    "scoreboard.blue": { hu: "Kék csapat", en: "Blue Team" },
    "scoreboard.green": { hu: "Zöld csapat", en: "Green Team" },
    "scoreboard.you": { hu: "(te)", en: "(you)" },

    // Word Select
    "wordSelect.title": { hu: "🎨 Válassz egy szót!", en: "🎨 Choose a word!" },
    "wordSelect.subtitle": { hu: "Neked kell lerajzolnod — a csapatod megpróbálja kitalálni.", en: "You have to draw it — your team will try to guess." },
    "wordSelect.timer": { hu: "mp", en: "s" },
    "wordSelect.timerSuffix": { hu: "van a választásra.", en: "to choose." },

    // Timer
    "timer.steal": { hu: "LOPÁS", en: "STEAL" },

    // Winner Screen
    "winner.blue": { hu: "Kék csapat nyert!", en: "Blue Team wins!" },
    "winner.green": { hu: "Zöld csapat nyert!", en: "Green Team wins!" },
    "winner.congrats": { hu: "🎉 Gratulálunk! 🎊", en: "🎉 Congratulations! 🎊" },
    "winner.blueLabel": { hu: "🔵 Kék", en: "🔵 Blue" },
    "winner.greenLabel": { hu: "🟢 Zöld", en: "🟢 Green" },
    "winner.back": { hu: "Vissza a lobbiba 🏠", en: "Back to lobby 🏠" },

    // Drawing Canvas
    "canvas.pen": { hu: "Toll", en: "Pen" },
    "canvas.eraser": { hu: "Radír", en: "Eraser" },
    "canvas.undo": { hu: "Visszavonás", en: "Undo" },
    "canvas.clear": { hu: "Törlés", en: "Clear" },

    // Correct guess
    "correctGuess.title": { hu: "kitalálta!", en: "guessed it!" },
    "correctGuess.word": { hu: "A szó", en: "The word was" },
    "correctGuess.steal": { hu: "LOPÁS!", en: "STEAL!" },

    // Toast / notifications
    "toast.hostLeft": { hu: "A host kilépett, a szoba bezáródik...", en: "The host left, the room is closing..." },
    "toast.playerLeft": { hu: "kilépett", en: "left the game" },
} as const;

type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang): string {
    return translations[key]?.[lang] || translations[key]?.["hu"] || key;
}
