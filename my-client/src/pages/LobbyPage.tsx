import { useState } from "react";
import { client, HTTP_URL } from "../lib/colyseus";
import type { Room } from "@colyseus/sdk";
import { Pencil, Users, Plus, LogIn, Globe, Settings } from "lucide-react";
import { t, type Lang } from "../lib/i18n";
import SoundToggle from "../components/ui/SoundToggle";
import HandDrawn from "../components/ui/HandDrawn";

interface LobbyPageProps {
    onJoinRoom: (room: Room) => void;
}

export default function LobbyPage({ onJoinRoom }: LobbyPageProps) {
    const [mode, setMode] = useState<"menu" | "create" | "join">("menu");
    const [playerName, setPlayerName] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const [language, setLanguage] = useState<"hu" | "en">("hu");
    const [customWords, setCustomWords] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Language for UI — always follows the selector
    const lang: Lang = language;

    const handleCreateRoom = async () => {
        if (!playerName.trim()) {
            setError(t("lobby.errNoName", lang));
            return;
        }
        setLoading(true);
        setError("");
        try {
            const room = await client.create("sketch_race", {
                playerName: playerName.trim(),
                language,
                customWords: customWords
                    .split(",")
                    .map((w) => w.trim())
                    .filter((w) => w.length > 0),
            });
            onJoinRoom(room);
        } catch (e: any) {
            setError(e.message || t("lobby.errCreate", lang));
        }
        setLoading(false);
    };

    const handleJoinRoom = async () => {
        if (!playerName.trim()) {
            setError(t("lobby.errNoName", lang));
            return;
        }
        if (!roomCode.trim()) {
            setError(t("lobby.errNoCode", lang));
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${HTTP_URL}/api/find-room/${roomCode.trim().toUpperCase()}`);
            if (!res.ok) {
                setError(t("lobby.errNoRoom", lang));
                setLoading(false);
                return;
            }
            const { roomId } = await res.json();
            const room = await client.joinById(roomId, {
                playerName: playerName.trim(),
            });
            onJoinRoom(room);
        } catch (e: any) {
            setError(e.message || t("lobby.errJoin", lang));
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Sound controls */}
            <div className="absolute top-4 right-4 z-10">
                <SoundToggle />
            </div>

            <div className="w-full max-w-md relative z-0">
                {/* Decorative Doodles (Optional subtle effect) */}
                <div className="absolute -top-10 -left-10 opacity-10 rotate-[-15deg] pointer-events-none hidden sm:block">
                    <Pencil size={80} />
                </div>

                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-4 mb-2">
                        <HandDrawn type="card" rotation={-5} className="w-16 h-16 flex items-center justify-center bg-yellow-50">
                            <Pencil className="w-8 h-8 text-slate-800" />
                        </HandDrawn>
                        <h1 className="text-6xl font-sketch text-slate-800 tracking-tight">
                            SketchRace
                        </h1>
                    </div>
                    <p className="font-hand text-2xl text-slate-500 mt-1">{t("lobby.subtitle", lang)}</p>
                </div>

                {/* Main Interface */}
                <HandDrawn type="card" className="p-8">
                    {mode === "menu" && (
                        <div className="space-y-6">
                            {/* Language Selector */}
                            <div className="flex justify-center gap-4 mb-4">
                                <button
                                    onClick={() => setLanguage("hu")}
                                    className={`font-hand text-lg transition-all ${language === "hu"
                                        ? "text-team-blue scale-110 underline decoration-2 underline-offset-4"
                                        : "text-slate-400 hover:text-slate-600"
                                        }`}
                                >
                                    🇭🇺 Magyar
                                </button>
                                <button
                                    onClick={() => setLanguage("en")}
                                    className={`font-hand text-lg transition-all ${language === "en"
                                        ? "text-team-blue scale-110 underline decoration-2 underline-offset-4"
                                        : "text-slate-400 hover:text-slate-600"
                                        }`}
                                >
                                    🇬🇧 English
                                </button>
                            </div>

                            {/* Player Name */}
                            <div className="space-y-2">
                                <label className="block font-sketch text-xl text-slate-700">
                                    {t("lobby.yourName", lang)}
                                </label>
                                <input
                                    type="text"
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    placeholder={t("lobby.namePlaceholder", lang)}
                                    className="sketch-input"
                                    maxLength={20}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button
                                    onClick={() => setMode("create")}
                                    className="sketch-button sketch-button-blue flex flex-col items-center gap-2 py-4"
                                >
                                    <Plus className="w-6 h-6" />
                                    <span>{t("lobby.createRoom", lang)}</span>
                                </button>
                                <button
                                    onClick={() => setMode("join")}
                                    className="sketch-button sketch-button-green flex flex-col items-center gap-2 py-4"
                                >
                                    <LogIn className="w-6 h-6" />
                                    <span>{t("lobby.joinRoom", lang)}</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {mode === "create" && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3 mb-2">
                                <button
                                    onClick={() => { setMode("menu"); setError(""); }}
                                    className="text-slate-400 hover:text-slate-800 transition text-2xl"
                                >
                                    ←
                                </button>
                                <h2 className="text-2xl font-sketch flex items-center gap-2 text-slate-800">
                                    <Settings className="w-5 h-5" />
                                    {t("lobby.roomSettings", lang)}
                                </h2>
                            </div>

                            {/* Word Language */}
                            <div className="space-y-3">
                                <label className="block font-sketch text-xl text-slate-700 flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    {t("lobby.wordBankLang", lang)}
                                </label>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setLanguage("hu")}
                                        className={`flex-1 sketch-button ${language === "hu" ? "bg-team-blue/10 border-team-blue text-team-blue" : "text-slate-400"}`}
                                    >
                                        🇭🇺 Magyar
                                    </button>
                                    <button
                                        onClick={() => setLanguage("en")}
                                        className={`flex-1 sketch-button ${language === "en" ? "bg-team-blue/10 border-team-blue text-team-blue" : "text-slate-400"}`}
                                    >
                                        🇬🇧 English
                                    </button>
                                </div>
                            </div>

                            {/* Custom Words */}
                            <div className="space-y-2">
                                <label className="block font-sketch text-xl text-slate-700">
                                    {t("lobby.customWords", lang)}
                                </label>
                                <textarea
                                    value={customWords}
                                    onChange={(e) => setCustomWords(e.target.value)}
                                    placeholder={t("lobby.customWordsPlaceholder", lang)}
                                    rows={2}
                                    className="sketch-input h-20 resize-none"
                                />
                                <p className="font-hand text-sm text-slate-400">{t("lobby.commaSeparated", lang)}</p>
                            </div>

                            <button
                                onClick={handleCreateRoom}
                                disabled={loading}
                                className="w-full sketch-button bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50 py-4 text-2xl"
                            >
                                {loading ? t("lobby.creating", lang) : t("lobby.createBtn", lang)}
                            </button>
                        </div>
                    )}

                    {mode === "join" && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3 mb-2">
                                <button
                                    onClick={() => { setMode("menu"); setError(""); }}
                                    className="text-slate-400 hover:text-slate-800 transition text-2xl"
                                >
                                    ←
                                </button>
                                <h2 className="text-2xl font-sketch flex items-center gap-2 text-slate-800">
                                    <Users className="w-5 h-5" />
                                    {t("lobby.joinTitle", lang)}
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-center font-sketch text-2xl text-slate-700">
                                    {t("lobby.roomCode", lang)}
                                </label>
                                <input
                                    type="text"
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                    placeholder="CODE"
                                    className="w-full text-center font-sketch text-5xl tracking-[0.3em] bg-yellow-50/50 border-2 border-slate-200 rounded-xl py-4 focus:border-team-green outline-none transition uppercase"
                                    maxLength={4}
                                />
                            </div>

                            <button
                                onClick={handleJoinRoom}
                                disabled={loading}
                                className="w-full sketch-button bg-team-green text-white hover:bg-green-600 disabled:opacity-50 py-4 text-2xl"
                            >
                                {loading ? t("lobby.joining", lang) : t("lobby.joinBtn", lang)}
                            </button>
                        </div>
                    )}

                    {error && (
                        <HandDrawn type="bubble" className="mt-6 p-3 bg-red-50 border-red-200 text-red-600 text-center font-hand text-lg animate-bounce">
                            {error}
                        </HandDrawn>
                    )}
                </HandDrawn>
            </div>
        </div>
    );
}

