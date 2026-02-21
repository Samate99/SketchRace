import assert from "assert";
import { ColyseusTestServer, boot } from "@colyseus/testing";

import appConfig from "../src/app.config.js";
import { SketchRaceState } from "../src/rooms/schema/MyRoomState.js";

describe("SketchRace Room Tests", () => {
  let colyseus: ColyseusTestServer<typeof appConfig>;

  before(async () => colyseus = await boot(appConfig));
  after(async () => colyseus.shutdown());

  beforeEach(async () => await colyseus.cleanup());

  it("should allow a client to connect to sketch_race room", async () => {
    const room = await colyseus.createRoom<SketchRaceState>("sketch_race", {
      playerName: "TestPlayer1",
      language: "hu",
    });

    const client1 = await colyseus.connectTo(room, { playerName: "TestPlayer1" });

    assert.strictEqual(client1.sessionId, room.clients[0].sessionId);

    await room.waitForNextPatch();

    // Check initial state
    assert.strictEqual(client1.state.phase, "lobby");
    assert.strictEqual(client1.state.language, "hu");
  });

  it("should assign players to balanced teams", async () => {
    const room = await colyseus.createRoom<SketchRaceState>("sketch_race", {
      playerName: "Host",
      language: "hu",
    });

    const client1 = await colyseus.connectTo(room, { playerName: "Player1" });
    const client2 = await colyseus.connectTo(room, { playerName: "Player2" });
    const client3 = await colyseus.connectTo(room, { playerName: "Player3" });
    const client4 = await colyseus.connectTo(room, { playerName: "Player4" });

    await room.waitForNextPatch();

    // Count teams
    let blueCount = 0;
    let greenCount = 0;
    client1.state.players.forEach((player: any) => {
      if (player.team === 0) blueCount++;
      else greenCount++;
    });

    assert.strictEqual(blueCount, 2);
    assert.strictEqual(greenCount, 2);
  });
});
