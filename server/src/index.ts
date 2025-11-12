import express from "express";
import http from "http";
import net from "net";
import { Server } from "socket.io";
import cors from "cors";
import registerSocketHandlers from "./socket";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

registerSocketHandlers(io);

app.get("/", (_req, res) => res.send("🟢 Multiplayer Grid Server is running"));


const PORT = 5000;

server.listen(PORT, () => {
  console.log(`Server running at 5000`);
});

