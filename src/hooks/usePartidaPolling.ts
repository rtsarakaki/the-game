import { useEffect, Dispatch, SetStateAction } from "react";
import type { IPartida, IPlayer } from '@/domain/types';

export function usePartidaPolling({
  id,
  pid,
  partida,
  setPartida,
  setPlayer,
  setLoading,
  setGameStartNotification,
}: {
  id: string;
  pid: string;
  partida: IPartida | null;
  setPartida: Dispatch<SetStateAction<IPartida | null>>;
  setPlayer: Dispatch<SetStateAction<IPlayer | null>>;
  setLoading: (b: boolean) => void;
  setGameStartNotification: (b: boolean) => void;
}) {
  useEffect(() => {
    let mounted = true;
    const fetchPartida = async () => {
      try {
        const res = await fetch(`/api/partida?gameId=${id}`);
        const data = await res.json();
        if (data.id === id && mounted) {
          if (data.status === "em_andamento" && data.autoStarted && partida?.status === "esperando_jogadores") {
            setGameStartNotification(true);
            setTimeout(() => setGameStartNotification(false), 3000);
          }
          setPartida(data);
          setPlayer(data.jogadores.find((j: IPlayer) => j.id === pid) || null);
        }
      } catch {}
      setLoading(false);
    };
    fetchPartida();
    const interval = setInterval(fetchPartida, 2000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [id, pid, partida]);
} 