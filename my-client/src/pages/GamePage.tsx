import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { Room } from "@colyseus/sdk";
import { useRoom, useRoomMessage } from "../hooks/useRoom";
import DrawingCanvas from "../components/game/DrawingCanvas";
import Chat from "../components/game/Chat";
import Scoreboard from "../components/game/Scoreboard";
import Timer from "../components/game/Timer";
import WordHint from "../components/game/WordHint";
import WordSelect from "../components/game/WordSelect";
import WinnerScreen from "../components/game/WinnerScreen";
import CorrectGuessOverlay from "../components/game/CorrectGuessOverlay";
import { ToastContainer, useToasts } from "../components/ui/Toast";
import SoundToggle from "../components/ui/SoundToggle";
import HandDrawn from "../components/ui/HandDrawn";
import { Copy, Check, Play, X, Pencil } from "lucide-react";
import { t, type Lang } from "../lib/i18n";
import {
    initAudio,
    startMusic,
    stopMusic,
    playCorrectGuess,
    playSteal,
    playTick,
    playBuzzer,
    playGameStart,
    playVictory,
    playPlayerJoin,
    playPlayerLeft,
    playWordSelected,
    playChooseWord,
    playError,
    playChatPop,
} from "../lib/sounds";

interface GamePageProps {
    room: Room;
    onLeave: () => void;
}

export default function GamePage({ room, onLeave }: GamePageProps) {
    const state = useRoom(room);
    const [wordChoices, setWordChoices] = useState<string[]>([]);
    const [drawerWord, setDrawerWord] = useState<string>("");
    const [copied, setCopied] = useState(false);
    const [correctGuessData, setCorrectGuessData] = useState<{
        guesser: string;
        word: string;
        team: number;
        isSteal: boolean;
    } | null>(null);

    const handleClearCorrectGuess = useCallback(() => {
        setCorrectGuessData(null);
    }, []);

    const { toasts, addToast, dismissToast } = useToasts();

    const lang: Lang = (state?.language as Lang) || "hu";

    // Listen for private word choices
    useRoomMessage<{ words: string[] }>(room, "wordChoices", (data) => {
        setWordChoices(data.words);
        playChooseWord();
    });

    // Listen for word selected (private to drawer)
    useRoomMessage<{ word: string }>(room, "wordSelected", (data) => {
        setDrawerWord(data.word);
        playWordSelected();
    });

    // Listen for correct guess celebration
    useRoomMessage<{ guesser: string; word: string; team: number; isSteal: boolean }>(
        room,
        "correctGuess",
        (data) => {
            setCorrectGuessData(data);
            setDrawerWord("");
            if (data.isSteal) playSteal();
            else playCorrectGuess();
        }
    );

    // Listen for errors — show as toast
    useRoomMessage<{ message: string }>(room, "error", (data) => {
        addToast(data.message, "error");
        playError();
    });

    // Listen for player joining — show sound only
    useRoomMessage<{ name: string; team: number }>(room, "playerJoined", (_data) => {
        playPlayerJoin();
    });

    // Listen for player leaving — show toast
    useRoomMessage<{ name: string; team: number }>(room, "playerLeft", (data) => {
        addToast(`${data.name} ${t("toast.playerLeft", lang)}`, "playerLeft");
        playPlayerLeft();
    });

    // Listen for host leaving — show toast & redirect after delay
    useRoomMessage<{ name: string }>(room, "hostLeft", (_data) => {
        addToast(t("toast.hostLeft", lang), "error");
        playError();
        setTimeout(() => onLeave(), 2500);
    });

    const mySessionId = room.sessionId;
    const myPlayer = state?.players?.[mySessionId];
    const isHost = myPlayer?.isHost;
    const isDrawer = state?.currentDrawer === mySessionId;
    const phase = state?.phase || "lobby";
    const prevPhaseRef = useRef(phase);

    // Sound effects based on phase transitions
    useEffect(() => {
        const prev = prevPhaseRef.current;
        prevPhaseRef.current = phase;

        if (phase === "lobby" || phase === "choosing" || phase === "gameOver") {
            setDrawerWord("");
            setCorrectGuessData(null);
        }

        // Game just started
        if (prev === "lobby" && phase === "choosing") {
            playGameStart();
        }
        // Game over
        if (phase === "gameOver" && prev !== "gameOver") {
            playVictory();
        }
        // Time's up (round ended)
        if (phase === "roundEnd" && (prev === "drawing" || prev === "stealing")) {
            playBuzzer();
        }
    }, [phase]);

    // Timer tick sound for last 10 seconds
    useEffect(() => {
        if (!state) return;
        const time = state.timeRemaining;
        if (
            (phase === "drawing" || phase === "stealing" || phase === "choosing") &&
            time > 0 &&
            time <= 10
        ) {
            playTick();
        }
    }, [state?.timeRemaining, phase]);

    // Chat message sound
    useEffect(() => {
        if (state?.chatMessages?.length > 0) {
            playChatPop();
        }
    }, [state?.chatMessages?.length]);

    // Init audio on first interaction & start music
    useEffect(() => {
        const handleInteraction = () => {
            initAudio();
            startMusic();
            window.removeEventListener("click", handleInteraction);
        };
        window.addEventListener("click", handleInteraction);
        return () => {
            window.removeEventListener("click", handleInteraction);
            stopMusic();
        };
    }, []);

    // Determine if current user can type in chat
    const canType = useMemo(() => {
        if (!myPlayer || !state) return false;
        if (phase === "lobby" || phase === "gameOver" || phase === "roundEnd") return true;
        if (isDrawer) return false;
        if (phase === "drawing") return myPlayer.team === state.currentTeam;
        if (phase === "stealing") return myPlayer.team !== state.currentTeam;
        return false;
    }, [myPlayer, state, phase, isDrawer]);

    const showWordSelect = phase === "choosing" && isDrawer && wordChoices.length > 0;

    const handleSelectWord = useCallback(
        (word: string) => {
            room.send("selectWord", { word });
            setWordChoices([]);
        },
        [room]
    );

    const handleDraw = useCallback(
        (data: any) => {
            room.send("draw", data);
        },
        [room]
    );

    const handleClear = useCallback(() => {
        room.send("clearCanvas");
    }, [room]);

    const handleUndo = useCallback(() => {
        room.send("undoLine");
    }, [room]);

    const handleChat = useCallback(
        (text: string) => {
            room.send("chat", { text });
        },
        [room]
    );

    const handleStartGame = useCallback(() => {
        room.send("startGame");
    }, [room]);

    const handleCloseRoom = useCallback(() => {
        room.send("closeRoom");
    }, [room]);

    const handleLeave = useCallback(() => {
        room.leave();
        onLeave();
    }, [room, onLeave]);

    const handleCopyCode = useCallback(() => {
        navigator.clipboard.writeText(state?.roomCode || "");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [state?.roomCode]);

    if (!state) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="font-sketch text-2xl text-slate-400 animate-pulse">{t("game.connecting", lang)}</div>
            </div>
        );
    }

    const drawLines = state.drawLines || [];
    const chatMessages = state.chatMessages || [];

    // Phase banner text
    const getPhaseBanner = (): string => {
        if (phase === "lobby") return t("phase.lobby", lang);
        if (phase === "choosing") return isDrawer ? t("phase.choosingDrawer", lang) : t("phase.choosingOther", lang);
        if (phase === "drawing") {
            if (isDrawer) return t("phase.drawingDrawer", lang);
            return state.currentTeam === myPlayer?.team ? t("phase.drawingTeam", lang) : t("phase.drawingOther", lang);
        }
        if (phase === "stealing") {
            return state.currentTeam !== myPlayer?.team ? t("phase.stealingActive", lang) : t("phase.stealingWait", lang);
        }
        if (phase === "roundEnd") return t("phase.roundEnd", lang);
        return "";
    };
    const phaseBanner = getPhaseBanner();

    return (
        <div className="h-screen flex flex-col overflow-hidden text-slate-800">
            {/* Toast notifications */}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />

            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b-2 border-slate-900/10 shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Pencil className="w-5 h-5 text-slate-800" />
                        <span className="font-sketch text-3xl text-slate-800">
                            SketchRace
                        </span>
                    </div>
                    <button
                        onClick={handleCopyCode}
                        className="flex items-center gap-2 px-3 py-1 bg-white border-2 border-slate-800 rounded-[15px_4px_15px_4px/4px_15px_4px_15px] text-sm font-hand text-lg hover:shadow-[2px_2px_0_rgba(0,0,0,0.1)] transition"
                    >
                        <span className="text-slate-400">{t("game.code", lang)}:</span>
                        <span className="text-slate-800 font-bold">{state.roomCode}</span>
                        {copied ? (
                            <Check className="w-4 h-4 text-green-600" />
                        ) : (
                            <Copy className="w-4 h-4 text-slate-400" />
                        )}
                    </button>
                    {state.roundNumber > 0 && (
                        <span className="font-hand text-xl text-slate-500">{t("game.round", lang)} {state.roundNumber}</span>
                    )}
                </div>

                <div className="flex items-center gap-6">
                    <SoundToggle />

                    <div className="flex items-center gap-3">
                        {isHost && phase === "lobby" && (
                            <button
                                onClick={handleStartGame}
                                className="sketch-button sketch-button-green flex items-center gap-2 text-xl"
                            >
                                <Play className="w-5 h-5" />
                                {t("game.start", lang)}
                            </button>
                        )}
                        {isHost ? (
                            <button
                                onClick={handleCloseRoom}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                title={t("game.closeRoom", lang)}
                            >
                                <X className="w-6 h-6" />
                            </button>
                        ) : (
                            <button
                                onClick={handleLeave}
                                className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition"
                                title={t("game.leave", lang)}
                            >
                                <X className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Phase banner + Drawer word display */}
            {(phaseBanner || (isDrawer && drawerWord)) && (
                <div className="relative shrink-0 flex justify-center py-2">
                    <HandDrawn type="bubble" className={`px-6 py-2 flex items-center gap-4 ${phase === "stealing" ? "bg-orange-50 border-orange-200" : "bg-white"}`}>
                        <span className="font-sketch text-2xl">{phaseBanner}</span>
                        {isDrawer && drawerWord && (phase === "drawing" || phase === "stealing") && (
                            <div className="flex items-center gap-2 border-l-2 border-slate-100 pl-4">
                                <span className="font-hand text-xl text-slate-500">{t("game.yourWord", lang)}:</span>
                                <span className="font-sketch text-3xl text-team-blue decoration-wavy underline">
                                    {drawerWord}
                                </span>
                            </div>
                        )}
                    </HandDrawn>
                </div>
            )}

            {/* Main Game Content */}
            <div className="flex-1 flex gap-6 p-6 overflow-hidden min-h-0 relative z-0">
                {/* Left sidebar - Scoreboard */}
                <HandDrawn type="panel" className="w-64 shrink-0 hidden lg:flex flex-col overflow-hidden p-4">
                    <Scoreboard
                        players={state.players}
                        teamScores={state.teamScores}
                        mySessionId={mySessionId}
                        lang={lang}
                    />
                </HandDrawn>

                {/* Center - Canvas + Timer + Hint */}
                <div className="flex-1 flex flex-col gap-4 min-w-0">
                    {/* Timer + Word Hint */}
                    {phase !== "lobby" && (
                        <div className="flex items-center justify-between gap-4 shrink-0">
                            <Timer timeRemaining={state.timeRemaining} phase={phase} lang={lang} />
                            <WordHint hint={state.wordHint} phase={phase} />
                            <div className="w-32 hidden sm:block" />
                        </div>
                    )}

                    {/* Canvas */}
                    <div className="flex-1 min-h-0 relative">
                        {/* Canvas Sketch Frame */}
                        <div className="absolute inset-0 border-4 border-slate-800 rounded-[8px_15px_10px_12px/12px_10px_15px_8px] pointer-events-none z-10" />
                        <div className="h-full w-full bg-white relative rounded-lg overflow-hidden shadow-inner">
                            <DrawingCanvas
                                isDrawer={isDrawer && (phase === "drawing" || phase === "stealing")}
                                drawLines={drawLines}
                                onDraw={handleDraw}
                                onClear={handleClear}
                                onUndo={handleUndo}
                                lang={lang}
                            />
                        </div>
                    </div>
                </div>

                {/* Right sidebar - Chat */}
                <div className="w-80 shrink-0 flex flex-col min-h-0 gap-4">
                    <div className="lg:hidden">
                        <HandDrawn type="panel" className="p-3">
                            <Scoreboard
                                players={state.players}
                                teamScores={state.teamScores}
                                mySessionId={mySessionId}
                                lang={lang}
                            />
                        </HandDrawn>
                    </div>
                    <HandDrawn type="panel" className="flex-1 flex flex-col overflow-hidden p-4">
                        <Chat
                            messages={chatMessages}
                            onSendMessage={handleChat}
                            canType={canType}
                            mySessionId={mySessionId}
                            lang={lang}
                        />
                    </HandDrawn>
                </div>
            </div>

            {/* Overlays */}
            {showWordSelect && (
                <WordSelect
                    words={wordChoices}
                    onSelect={handleSelectWord}
                    timeRemaining={state.timeRemaining}
                    lang={lang}
                />
            )}

            {correctGuessData && (
                <CorrectGuessOverlay
                    guesser={correctGuessData.guesser}
                    word={correctGuessData.word}
                    team={correctGuessData.team}
                    isSteal={correctGuessData.isSteal}
                    lang={lang}
                    onDone={handleClearCorrectGuess}
                />
            )}

            {phase === "gameOver" && (
                <WinnerScreen
                    winningTeam={state.winningTeam}
                    teamScores={state.teamScores}
                    onBackToLobby={handleLeave}
                    lang={lang}
                />
            )}
        </div>
    );
}

