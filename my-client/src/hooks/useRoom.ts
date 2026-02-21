import { useState, useEffect, useRef } from "react";
import type { Room } from "@colyseus/sdk";

/**
 * Hook for listening to Colyseus room state and messages.
 */
export function useRoom(room: Room | null) {
    const [state, setState] = useState<any>(null);

    useEffect(() => {
        if (!room) return;

        // Initial state
        setState(room.state.toJSON());

        // Listen for state changes
        const onChange = () => {
            setState(room.state.toJSON());
        };

        room.onStateChange(onChange);

        return () => {
            room.removeAllListeners();
        };
    }, [room]);

    return state;
}

/**
 * Hook for listening to specific Colyseus messages.
 */
export function useRoomMessage<T = any>(
    room: Room | null,
    messageType: string,
    callback: (data: T) => void
) {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
        if (!room) return;

        const handler = (data: T) => {
            callbackRef.current(data);
        };

        room.onMessage(messageType, handler);

        return () => {
            // Messages don't have explicit removal in Colyseus SDK 
        };
    }, [room, messageType]);
}
