import { useEffect, useMemo, useState } from "react";
import { useSocket } from "../context/SocketContext";
import "./Grid.css";

const createEmptyGrid = () =>
  Array.from({ length: 10 }, () => Array(10).fill(""));

const Grid = () => {
  const socket = useSocket();
  const [grid, setGrid] = useState<string[][]>(createEmptyGrid);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleUpdate = (data: string[][]) => setGrid(data);
    socket.on("gridUpdate", handleUpdate);
    socket.emit("requestGrid");
    return () => {
      socket.off("gridUpdate", handleUpdate);
    };
  }, [socket]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const intervalId = window.setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [cooldownSeconds]);

  useEffect(() => {
    const handleCooldownStart = ({ seconds }: { seconds: number }) => {
      setCooldownSeconds(Math.max(seconds, 0));
    };

    const handleCooldownStatus = ({
      secondsRemaining,
    }: {
      secondsRemaining: number;
    }) => {
      setCooldownSeconds(Math.max(secondsRemaining, 0));
    };

    socket.on("cooldownStarted", handleCooldownStart);
    socket.on("cooldownStatus", handleCooldownStatus);

    return () => {
      socket.off("cooldownStarted", handleCooldownStart);
      socket.off("cooldownStatus", handleCooldownStatus);
    };
  }, [socket]);

  useEffect(() => {
    const handleInvalidCharacter = ({ message }: { message: string }) => {
      setErrorMessage(message);
    };

    socket.on("invalidCharacter", handleInvalidCharacter);

    return () => {
      socket.off("invalidCharacter", handleInvalidCharacter);
    };
  }, [socket]);

  useEffect(() => {
    if (!errorMessage) return;

    const timeoutId = window.setTimeout(() => setErrorMessage(""), 3000);

    return () => window.clearTimeout(timeoutId);
  }, [errorMessage]);

  const handleClick = (row: number, col: number) => {
    if (cooldownSeconds > 0 || grid[row][col] !== "") return;

    const char = prompt("Enter a Unicode character (e.g. 😀, A, ★):");
    if (!char) return;

    const trimmed = char.trim();
    if (!trimmed) return;

    const glyphs = Array.from(trimmed);
    if (glyphs.length !== 1) {
      setErrorMessage("Please enter exactly one character.");
      return;
    }

    socket.emit("updateBlock", { row, col, char: glyphs[0] });
  };

  const flattenedGrid = useMemo(
    () =>
      grid.flatMap((row, rowIndex) =>
        row.map((cell, colIndex) => ({
          rowIndex,
          colIndex,
          value: cell,
          isFilled: cell !== "",
        }))
      ),
    [grid]
  );

  const visibleCountdown =
    cooldownSeconds > 0 ? Math.max(cooldownSeconds - 1, 0) : 0;
  const isOnCooldown = cooldownSeconds > 0;

  return (
    <div className="grid-wrapper">
      {isOnCooldown && (
        <div className="grid-countdown" role="status" aria-live="polite">
          ⏱ Please wait {visibleCountdown}s before your next move
        </div>
      )}
      {errorMessage && (
        <div className="grid-message" role="alert">
          {errorMessage}
        </div>
      )}
      <div className="grid-board">
        {flattenedGrid.map(({ rowIndex, colIndex, value, isFilled }) => {
          const isLocked = isOnCooldown && !isFilled;
          const classes = [
            "grid-cell",
            isFilled ? "grid-cell--filled" : "grid-cell--empty",
            isLocked ? "grid-cell--locked" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={`${rowIndex}-${colIndex}`}
              type="button"
              className={classes}
              onClick={() => handleClick(rowIndex, colIndex)}
              disabled={isLocked || isFilled}
            >
              <span>{value}</span>
            </button>
          );
        })}
      </div>
      
    </div>
  );
};

export default Grid;
