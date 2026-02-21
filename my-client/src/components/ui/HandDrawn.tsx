import React from 'react';

interface HandDrawnProps {
    children: React.ReactNode;
    className?: string;
    type?: 'card' | 'panel' | 'button' | 'bubble';
    rotation?: number;
}

export default function HandDrawn({
    children,
    className = "",
    type = 'card',
    rotation
}: HandDrawnProps) {

    const getStyles = () => {
        switch (type) {
            case 'card':
                return 'bg-white border-2 border-slate-800 shadow-[4px_6px_0_rgba(0,0,0,0.1)] rounded-[4px_12px_6px_14px/14px_6px_12px_4px]';
            case 'panel':
                return 'bg-white/40 border-2 border-slate-700/50 rounded-[10px_200px_15px_150px/150px_15px_200px_10px]';
            case 'bubble':
                return 'bg-white border-2 border-slate-800 rounded-[20px_15px_30px_12px/12px_30px_15px_20px] shadow-[2px_3px_0_rgba(0,0,0,0.1)]';
            case 'button':
                return 'bg-white border-2 border-slate-800 hover:shadow-[3px_4px_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-0.5 rounded-[15px_4px_15px_4px/4px_15px_4px_15px] transition-all';
            default:
                return '';
        }
    };

    const style: React.CSSProperties = rotation !== undefined ? { transform: `rotate(${rotation}deg)` } : {};

    return (
        <div
            className={`relative ${getStyles()} ${className}`}
            style={style}
        >
            {children}
        </div>
    );
}
