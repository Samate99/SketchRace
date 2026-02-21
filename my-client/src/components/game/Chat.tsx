import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { t, type Lang } from "../../lib/i18n";

interface ChatProps {
    messages: any[];
    onSendMessage: (text: string) => void;
    canType: boolean;
    mySessionId: string;
    lang: Lang;
}

export default function Chat({ messages, onSendMessage, canType, lang }: ChatProps) {
    const [input, setInput] = useState("");
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !canType) return;
        onSendMessage(input.trim());
        setInput("");
    };

    const getTeamColor = (team: number, isSystem: boolean) => {
        if (isSystem) return "text-amber-600";
        return team === 0 ? "text-blue-600" : "text-green-600";
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="pb-3 border-b-2 border-slate-100 shrink-0">
                <h3 className="text-xl font-sketch text-slate-800 flex items-center gap-2">
                    {t("chat.title", lang)}
                </h3>
            </div>

            {/* Messages */}
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto py-4 space-y-2 scroll-smooth custom-scrollbar"
                style={{ overscrollBehavior: "contain" }}
            >
                {messages.map((msg: any, i: number) => (
                    <div
                        key={i}
                        className={`px-1 py-0.5 animate-slide-up font-hand text-xl`}
                    >
                        {msg.isSystem ? (
                            <span className="text-amber-600 italic text-lg opacity-80">~ {msg.text}</span>
                        ) : (
                            <div className="flex flex-wrap items-baseline gap-2">
                                <span className={`font-bold shrink-0 ${getTeamColor(msg.team, false)}`}>
                                    {msg.senderName}:
                                </span>
                                <span className="text-slate-700 break-words">{msg.text}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="pt-4 shrink-0">
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={canType ? t("chat.placeholder", lang) : t("chat.disabled", lang)}
                        disabled={!canType}
                        className="sketch-input flex-1 !text-2xl"
                        maxLength={100}
                    />
                    <button
                        type="submit"
                        disabled={!canType || !input.trim()}
                        className="sketch-button p-2 disabled:opacity-30"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
