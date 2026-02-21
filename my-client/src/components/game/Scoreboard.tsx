import { Users } from "lucide-react";
import { t, type Lang } from "../../lib/i18n";
import HandDrawn from "../ui/HandDrawn";

interface ScoreboardProps {
    players: Record<string, any>;
    teamScores: number[];
    mySessionId: string;
    lang: Lang;
}

export default function Scoreboard({ players, teamScores, mySessionId, lang }: ScoreboardProps) {
    const playerArray = Object.values(players || {});
    const blueTeam = playerArray.filter((p: any) => p.team === 0);
    const greenTeam = playerArray.filter((p: any) => p.team === 1);

    const TeamList = ({
        teamPlayers,
        textColor,
        bgColor,
        score,
        label,
        emoji,
        rotation,
    }: {
        teamPlayers: any[];
        textColor: string;
        bgColor: string;
        score: number;
        label: string;
        emoji: string;
        rotation: number;
    }) => (
        <HandDrawn
            type="card"
            rotation={rotation}
            className={`p-4 ${bgColor}`}
        >
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-1">
                <h3 className={`font-sketch text-2xl ${textColor}`}>
                    {emoji} {label}
                </h3>
                <span className={`font-sketch text-4xl ${textColor}`}>{score}</span>
            </div>
            <div className="space-y-2">
                {teamPlayers.map((player: any) => (
                    <div
                        key={player.sessionId}
                        className={`flex items-center gap-2 group ${player.sessionId === mySessionId ? "font-bold" : ""}`}
                    >
                        <div className="w-6 flex items-center justify-center">
                            {player.isDrawing && <span className="text-xl animate-bounce">✏️</span>}
                            {!player.isDrawing && player.isHost && <span className="text-sm">👑</span>}
                        </div>
                        <span className={`font-hand text-xl transition-all ${!player.connected ? "opacity-30 line-through" : "text-slate-700"} ${player.sessionId === mySessionId ? "text-slate-900 border-b-2 border-slate-900/10" : ""}`}>
                            {player.name}
                        </span>
                    </div>
                ))}
                {teamPlayers.length === 0 && (
                    <div className="font-hand text-lg text-slate-400 italic">No one yet...</div>
                )}
            </div>
        </HandDrawn>
    );

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 px-1 border-b-2 border-slate-100 pb-2">
                <Users className="w-5 h-5 text-slate-500" />
                <span className="font-sketch text-2xl text-slate-800">{t("scoreboard.title", lang)}</span>
            </div>

            <TeamList
                teamPlayers={blueTeam}
                textColor="text-blue-700"
                bgColor="bg-blue-50/20"
                score={teamScores?.[0] || 0}
                label={t("scoreboard.blue", lang)}
                emoji="🔵"
                rotation={-1.5}
            />

            <TeamList
                teamPlayers={greenTeam}
                textColor="text-green-700"
                bgColor="bg-green-50/20"
                score={teamScores?.[1] || 0}
                label={t("scoreboard.green", lang)}
                emoji="🟢"
                rotation={1.2}
            />
        </div>
    );
}
