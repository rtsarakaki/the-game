import { Server as IOServer } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";

// Tipagem extendida para suportar .server.io
type NextApiResponseWithSocket = NextApiResponse & {
  socket: NetSocket & {
    server: HTTPServer & {
      io?: IOServer;
    };
  };
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    const io = new IOServer(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: "*",
      },
    });
    res.socket.server.io = io;
    io.on("connection", (socket) => {
      // Recebe evento de atualização da partida e repassa para todos
      socket.on("partida:update", (data) => {
        socket.broadcast.emit("partida:update", data);
      });
    });
  }
  res.end();
};

export default ioHandler; 