interface WordHintProps {
    hint: string;
    phase: string;
}

export default function WordHint({ hint, phase }: WordHintProps) {
    if (!hint || phase === "lobby" || phase === "gameOver") return null;

    return (
        <div className="text-center">
            <span className="text-4xl font-sketch tracking-[0.4em] text-slate-800">
                {hint}
            </span>
        </div>
    );
}
