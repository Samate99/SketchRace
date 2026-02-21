import {
    defineServer,
    defineRoom,
    monitor,
    playground,
} from "colyseus";
import { matchMaker } from "@colyseus/core";

import { SketchRaceRoom } from "./rooms/MyRoom.js";
import path from "path";
import express from "express";

const server = defineServer({
    rooms: {
        sketch_race: defineRoom(SketchRaceRoom),
    },

    express: (app) => {
        // Serve static files from the client
        const clientPath = path.resolve("..", "my-client", "dist");
        app.use(express.static(clientPath));

        // Find room by code
        app.get("/api/find-room/:code", async (req, res) => {
            try {
                const code = req.params.code.toUpperCase();
                const rooms = await matchMaker.query({ name: "sketch_race" });
                const room = rooms.find((r: any) => r.metadata?.roomCode === code);
                if (room) {
                    res.json({ roomId: room.roomId });
                } else {
                    res.status(404).json({ error: "Room not found" });
                }
            } catch (e) {
                res.status(500).json({ error: "Server error" });
            }
        });

        // Colyseus Monitor
        app.use("/monitor", monitor());

        if (process.env.NODE_ENV !== "production") {
            app.use("/", playground());
        }

        // Fallback to index.html for React routing
        app.get("*", (req, res) => {
            res.sendFile(path.resolve("..", "my-client", "dist", "index.html"));
        });
    },
});

export default server;