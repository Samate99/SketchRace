import { Trophy } from "lucide-react";
import { t, type Lang } from "../../lib/i18n";
import HandDrawn from "../ui/HandDrawn";

interface WinnerScreenProps {
    winningTeam: number;
    teamScores: number[];
    onBackToLobby: () => void;
    lang: Lang;
}

export default function WinnerScreen({ winningTeam, teamScores, onBackToLobby, lang }: WinnerScreenProps) {
    const isBlue = winningTeam === 0;
    const teamName = isBlue ? t("winner.blue", lang) : t("winner.green", lang);
    const teamTextColor = isBlue ? "text-blue-700" : "text-green-700";
    const emoji = isBlue ? "🔵" : "🟢";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6">
            <HandDrawn type="panel" className="max-w-2xl w-full p-12 bg-white text-center flex flex-col items-center">
                {/* Trophy */}
                <div className="relative mb-8 transform rotate-6">
                    <HandDrawn type="bubble" className="p-4 bg-yellow-50 border-yellow-400">
                        <Trophy className="w-16 h-16 text-yellow-600" />
                    </HandDrawn>
                    <div className="absolute -top-4 -right-4 text-4xl animate-bounce">✨</div>
                    <div className="absolute -bottom-2 -left-6 text-4xl animate-bounce delay-100">🎊</div>
                </div>

                {/* Winner Text */}
                <h1 className={`font-sketch text-6xl ${teamTextColor} mb-4 leading-tight`}>
                    {emoji} {teamName} {emoji}
                </h1>
                <p className="font-hand text-3xl text-slate-500 mb-10">{t("winner.congrats", lang)}</p>

                {/* Score Board */}
                <div className="flex items-center justify-center gap-12 mb-12 border-y-2 border-slate-100 py-6 w-full max-w-md">
                    <div className="text-center group">
                        <div className="font-sketch text-6xl text-blue-700 transform group-hover:scale-110 transition-transform">
                            {teamScores?.[0] || 0}
                        </div>
                        <div className="font-hand text-xl text-slate-400">{t("winner.blueLabel", lang)}</div>
                    </div>
                    <div className="font-sketch text-4xl text-slate-300 transform -rotate-12 translate-y-2">VS</div>
                    <div className="text-center group">
                        <div className="font-sketch text-6xl text-green-700 transform group-hover:scale-110 transition-transform">
                            {teamScores?.[1] || 0}
                        </div>
                        <div className="font-hand text-xl text-slate-400">{t("winner.greenLabel", lang)}</div>
                    </div>
                </div>

                {/* Back button */}
                <button
                    onClick={onBackToLobby}
                    className="sketch-button sketch-button-blue text-2xl px-12 py-3"
                >
                    {t("winner.back", lang)}
                </button>
            </HandDrawn>
        </div>
    );
}
