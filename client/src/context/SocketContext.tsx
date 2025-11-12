import { createContext, useContext } from "react";
import { io, Socket } from "socket.io-client";

const socket: Socket = io("https://multiplayer-task.onrender.com");

const SocketContext = createContext<Socket>(socket);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
);
