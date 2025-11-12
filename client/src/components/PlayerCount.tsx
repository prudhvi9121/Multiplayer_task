import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";

const PlayerCount = () => {
  const socket = useSocket();
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const handlePlayerCount = (data: number) => setCount(data);
    socket.on("playerCount", handlePlayerCount);
    socket.emit("requestPlayerCount");
    return () => {
      socket.off("playerCount", handlePlayerCount);
    };
  }, [socket]);

  return (
    <div className="player-count" aria-live="polite">
      <span className="player-count__icon" role="img" aria-hidden="true">
        🧑‍🤝‍🧑
      </span>
      <span className="player-count__label">Players Online</span>
      <span className="player-count__value">{count}</span>
    </div>
  );
};

export default PlayerCount;
