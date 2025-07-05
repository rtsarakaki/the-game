import { useEffect, useRef } from "react";
import type { IGame, IPlayer } from '@/domain/types';

interface UseGameSocketParams {
  id: string;
  playerId: string;
  setGame: (game: IGame) => void;
  setPlayer: (player: IPlayer | null) => void;
  setGameStartNotification?: (value: boolean) => void;
}

export function useGameSocket({ id, playerId, setGame, setPlayer, setGameStartNotification }: UseGameSocketParams) {
  const prevStatusRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!id || !playerId) return;
    // Simulate socket by polling for now
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/partida?gameId=${id}`);
        if (!response.ok) return;
        const game: IGame = await response.json();
        setGame(game);
        const foundPlayer = game.players.find((player) => player.id === playerId) || null;
        setPlayer(foundPlayer);
        if (
          setGameStartNotification &&
          game.status === 'in_progress' &&
          prevStatusRef.current !== 'in_progress'
        ) {
          setGameStartNotification(true);
        }
        prevStatusRef.current = game.status;
      } catch {
        // ignore
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [id, playerId, setGame, setPlayer, setGameStartNotification]);
} 