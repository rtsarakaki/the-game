import { useEffect } from 'react';
import type { IGame, IPlayer } from '@/domain/types';

interface UseGamePollingParams {
  id: string;
  playerId: string;
  setGame: (game: IGame) => void;
  setPlayer: (player: IPlayer | null) => void;
}

export function useGamePolling({ id, playerId, setGame, setPlayer }: UseGamePollingParams) {
  useEffect(() => {
    if (!id || !playerId) return;
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/partida?gameId=${id}`);
        if (!response.ok) return;
        const game: IGame = await response.json();
        setGame(game);
        const foundPlayer = game.players.find((player) => player.id === playerId) || null;
        setPlayer(foundPlayer);
      } catch {
        // ignore
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [id, playerId, setGame, setPlayer]);
} 