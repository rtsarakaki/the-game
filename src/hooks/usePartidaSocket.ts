import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import type { IPartida, IPlayer } from '@/domain/types';

let socket: Socket | null = null;

export function usePartidaSocket({
  id,
  pid,
  setPartida,
  setPlayer,
  setGameStartNotification,
}: {
  id: string;
  pid: string;
  setPartida: (p: IPartida) => void;
  setPlayer: (p: IPlayer | null) => void;
  setGameStartNotification?: (b: boolean) => void;
}) {
  useEffect(() => {
    if (!id) return;
    if (!socket) {
      socket = io({ path: "/api/socket" });
    }
    // Join room for this game
    socket.emit("join", id);

    // Listen for partida updates
    const handleUpdate = (data: IPartida) => {
      if (data.id !== id) return;
      setPartida(data);
      setPlayer(data.jogadores.find((j: IPlayer) => j.id === pid) || null);
      if (setGameStartNotification && data.status === "em_andamento" && data.autoStarted) {
        setGameStartNotification(true);
        setTimeout(() => setGameStartNotification(false), 3000);
      }
    };
    socket.on("partida:updated", handleUpdate);

    return () => {
      socket?.off("partida:updated", handleUpdate);
      socket?.emit("leave", id);
    };
  }, [id, pid]);
} 