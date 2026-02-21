import * as Colyseus from "@colyseus/sdk";

const WS_URL = import.meta.env.VITE_SERVER_URL || "ws://localhost:2567";

export const client = new Colyseus.Client(WS_URL);
