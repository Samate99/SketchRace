import { useState, useCallback } from "react";
import type { Room } from "@colyseus/sdk";
import LobbyPage from "./pages/LobbyPage";
import GamePage from "./pages/GamePage";

function App() {
  const [room, setRoom] = useState<Room | null>(null);

  const handleJoinRoom = useCallback((joinedRoom: Room) => {
    setRoom(joinedRoom);

    joinedRoom.onLeave(() => {
      setRoom(null);
    });
  }, []);

  const handleLeaveRoom = useCallback(() => {
    setRoom(null);
  }, []);

  if (room) {
    return <GamePage room={room} onLeave={handleLeaveRoom} />;
  }

  return <LobbyPage onJoinRoom={handleJoinRoom} />;
}

export default App;
