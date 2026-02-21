import * as Colyseus from "@colyseus/sdk";

const isProd = import.meta.env.PROD;
const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const defaultUrl = isProd ? `${protocol}//${window.location.host}` : "ws://localhost:2567";

const WS_URL = import.meta.env.VITE_SERVER_URL || defaultUrl;

export const client = new Colyseus.Client(WS_URL);
