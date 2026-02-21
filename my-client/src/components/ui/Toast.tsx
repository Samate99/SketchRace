import { useEffect, useState } from "react";
import { X, AlertTriangle, Info, UserMinus } from "lucide-react";
import HandDrawn from "./HandDrawn";

export type ToastType = "error" | "info" | "playerLeft";

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

let toastId = 0;

interface ToastContainerProps {
    toasts: Toast[];
    onDismiss: (id: number) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
    return (
        <div className="fixed top-6 right-6 z-[100] flex flex-col gap-4 max-w-sm w-full pointer-events-none">
            {toasts.map((toast, index) => (
                <ToastItem key={toast.id} toast={toast} index={index} onDismiss={onDismiss} />
            ))}
        </div>
    );
}

function ToastItem({ toast, index, onDismiss }: { toast: Toast; index: number; onDismiss: (id: number) => void }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Animate in
        requestAnimationFrame(() => setVisible(true));

        // Auto-dismiss after 4s
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onDismiss(toast.id), 300);
        }, 4500);

        return () => clearTimeout(timer);
    }, [toast.id, onDismiss]);

    const styles = {
        error: {
            bg: "bg-red-50/90",
            border: "border-red-400",
            text: "text-red-700",
            icon: AlertTriangle,
        },
        playerLeft: {
            bg: "bg-orange-50/90",
            border: "border-orange-400",
            text: "text-orange-700",
            icon: UserMinus,
        },
        info: {
            bg: "bg-blue-50/90",
            border: "border-blue-400",
            text: "text-blue-700",
            icon: Info,
        },
    }[toast.type];

    const Icon = styles.icon;
    // Alternate rotation based on index for variety
    const rotation = (index % 2 === 0 ? 1 : -1) * (1 + (index % 3) * 0.5);

    return (
        <HandDrawn
            type="bubble"
            rotation={rotation}
            className={`pointer-events-auto flex items-start gap-3 p-4 shadow-xl border-2 transition-all duration-300 ${styles.bg} ${styles.border} ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
                }`}
        >
            <div className={`p-2 rounded-full ${styles.bg} border ${styles.border} shrink-0`}>
                <Icon className={`w-5 h-5 ${styles.text}`} />
            </div>

            <p className={`font-hand text-xl leading-snug flex-1 pt-1 ${styles.text}`}>
                {toast.message}
            </p>

            <button
                onClick={() => {
                    setVisible(false);
                    setTimeout(() => onDismiss(toast.id), 300);
                }}
                className={`${styles.text} opacity-40 hover:opacity-100 transition-opacity shrink-0 p-1`}
            >
                <X className="w-5 h-5" />
            </button>
        </HandDrawn>
    );
}

// Hook for managing toasts
export function useToasts() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (message: string, type: ToastType = "info") => {
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, message, type }]);
    };

    const dismissToast = (id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return { toasts, addToast, dismissToast };
}
