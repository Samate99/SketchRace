import { t, type Lang } from "../../lib/i18n";
import HandDrawn from "../ui/HandDrawn";

interface WordSelectProps {
    words: string[];
    onSelect: (word: string) => void;
    timeRemaining: number;
    lang: Lang;
}

export default function WordSelect({ words, onSelect, timeRemaining, lang }: WordSelectProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4">
            <HandDrawn type="card" className="max-w-md w-full p-8 bg-white" rotation={-0.5}>
                <h2 className="text-3xl font-sketch text-center mb-2">{t("wordSelect.title", lang)}</h2>
                <div className="text-center mb-8 flex flex-col items-center gap-1">
                    <p className="font-hand text-2xl text-slate-500">
                        {t("wordSelect.subtitle", lang)}
                    </p>
                    <div className="font-sketch text-2xl text-amber-600 animate-scribble">
                        {timeRemaining} {t("wordSelect.timer", lang)} {t("wordSelect.timerSuffix", lang)}
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {words.map((word, i) => (
                        <button
                            key={i}
                            onClick={() => onSelect(word)}
                            className="sketch-button sketch-button-blue text-3xl py-4 transition-transform hover:scale-105 active:scale-95"
                        >
                            {word}
                        </button>
                    ))}
                </div>
            </HandDrawn>
        </div>
    );
}
