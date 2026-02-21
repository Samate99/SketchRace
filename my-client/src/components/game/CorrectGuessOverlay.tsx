import { useEffect, useState } from "react";
import { t, type Lang } from "../../lib/i18n";
import HandDrawn from "../ui/HandDrawn";

interface CorrectGuessOverlayProps {
    guesser: string;
    word: string;
    team: number;
    isSteal: boolean;
    lang: Lang;
    onDone: () => void;
}

export default function CorrectGuessOverlay({
    guesser,
    word,
    team,
    isSteal,
    lang,
    onDone,
}: CorrectGuessOverlayProps) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onDone();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onDone]);

    if (!visible) return null;

    const teamTextColor = team === 0 ? "text-blue-700" : "text-green-700";

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none p-6">
            <HandDrawn type="panel" className="max-w-md w-full p-10 bg-white text-center animate-bounce-in shadow-2xl">
                {/* Celebration emojis */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-4 text-6xl">
                    <span className="animate-bounce">🎉</span>
                    <span className="animate-bounce delay-100">✨</span>
                    <span className="animate-bounce delay-200">🎊</span>
                </div>

                {/* Guesser name */}
                <div className={`font-sketch text-4xl ${teamTextColor} mb-4 leading-tight`}>
                    {guesser} {t("correctGuess.title", lang)}
                </div>

                {/* The word */}
                <div className="font-hand text-2xl text-slate-400 mb-2 italic">
                    {t("correctGuess.word", lang)}
                </div>
                <div className="font-sketch text-7xl text-slate-900 mb-8 decoration-wavy underline decoration-slate-200">
                    «{word}»
                </div>

                {isSteal && (
                    <div className="font-sketch text-3xl text-orange-600 animate-scribble flex items-center justify-center gap-3">
                        🏴‍☠️ {t("correctGuess.steal", lang)} 🏴‍☠️
                    </div>
                )}
            </HandDrawn>
        </div>
    );
}
