import {
    defineServer,
    defineRoom,
    monitor,
    playground,
} from "colyseus";
import { matchMaker } from "@colyseus/core";

import { SketchRaceRoom } from "./rooms/MyRoom.js";

const server = defineServer({
    rooms: {
        sketch_race: defineRoom(SketchRaceRoom),
    },

    express: (app) => {
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

        // Colyseus Playground (dev only)
        if (process.env.NODE_ENV !== "production") {
            app.use("/", playground());
        }
    },
});

export default server;