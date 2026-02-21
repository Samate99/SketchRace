import { t, type Lang } from "../../lib/i18n";
import HandDrawn from "../ui/HandDrawn";

interface TimerProps {
    timeRemaining: number;
    phase: string;
    lang: Lang;
}

export default function Timer({ timeRemaining, phase, lang }: TimerProps) {
    const isUrgent = timeRemaining <= 10 && timeRemaining > 0;
    const isSteal = phase === "stealing";

    return (
        <HandDrawn
            type="bubble"
            className={`py-2 px-6 flex items-center justify-center gap-3 transition-colors ${isUrgent ? "bg-red-50 border-red-500 text-red-600 animate-scribble" : "bg-white"
                }`}
        >
            <span className="text-2xl">⏱️</span>
            <span className="font-sketch text-4xl leading-none pt-1">
                {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, "0")}
            </span>
            {isSteal && <span className="font-hand text-xl text-orange-600 ml-2">{t("timer.steal", lang)}</span>}
        </HandDrawn>
    );
}
