import { Server, Socket } from "socket.io";

let grid: string[][] = Array.from({ length: 10 }, () => Array(10).fill(""));
let playersOnline = 0;
const lastMoveAt = new Map<string, number>();

const COOLDOWN_MS = 60_000;

const emitPlayerCount = (io: Server) => {
  io.emit("playerCount", playersOnline);
};

export default function registerSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    playersOnline++;
    console.log(` ${socket.id} connected`);
    emitPlayerCount(io);

    // ensure the joining socket always gets the latest value
    socket.emit("playerCount", playersOnline);

    // Send current grid to new player
    socket.emit("gridUpdate", grid);

    socket.on("requestGrid", () => {
      socket.emit("gridUpdate", grid);
    });

    // Answer count requests (used by clients after listeners mount)
    socket.on("requestPlayerCount", () => {
      socket.emit("playerCount", playersOnline);
    });

    // Handle block updates
    socket.on("updateBlock", ({ row, col, char }) => {
      if (!char || row < 0 || col < 0 || row > 9 || col > 9) return;

      const normalized = typeof char === "string" ? char.trim() : "";
      if (!normalized) return;

      const glyphs = Array.from(normalized);
      if (glyphs.length !== 1) {
        socket.emit("invalidCharacter", {
          message: "Please enter exactly one character.",
        });
        return;
      }

      const glyph = glyphs[0];

      if (grid[row][col] !== "") return;

      const now = Date.now();
      const lastMove = lastMoveAt.get(socket.id);

      if (lastMove) {
        const elapsed = now - lastMove;
        if (elapsed < COOLDOWN_MS) {
          const secondsRemaining = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
          socket.emit("cooldownStatus", { secondsRemaining });
          return;
        }
      }

      grid[row][col] = glyph;
      lastMoveAt.set(socket.id, now);

      console.log(` ${socket.id} placed '${glyph}' at [${row},${col}]`);
      io.emit("gridUpdate", grid); // Broadcast to everyone
      socket.emit("cooldownStarted", { seconds: COOLDOWN_MS / 1000 });
    });

    socket.on("disconnect", () => {
      playersOnline = Math.max(playersOnline - 1, 0);
      lastMoveAt.delete(socket.id);
      console.log(` ${socket.id} disconnected`);
      emitPlayerCount(io);
    });
  });
}
