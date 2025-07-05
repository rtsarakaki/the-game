import { useEffect } from 'react';
import type { IGame, IPlayer } from '@/domain/types';
import { isValidMove, PileType } from '@/domain/isValidMove';

interface UseGamePollingParams {
  id: string;
  playerId: string;
  setGame: (game: IGame) => void;
  setPlayer: (player: IPlayer | null) => void;
}

function isGameDefeat(game: IGame): boolean {
  return !game.players.some((player) =>
    player.cards.some((card) =>
      Object.entries(game.piles).some(([pileKey, pile]) => {
        const pileType: PileType = pileKey.startsWith('asc') ? 'asc' : 'desc';
        const topCard = pile[pile.length - 1];
        return isValidMove(pileType, topCard, card);
      })
    )
  );
}

export function useGamePolling({ id, playerId, setGame, setPlayer }: UseGamePollingParams) {
  useEffect(() => {
    if (!id || !playerId) return;
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/partida?gameId=${id}`);
        if (!response.ok) return;
        let game: IGame = await response.json();
        if (game.status !== 'defeat' && isGameDefeat(game)) {
          game = { ...game, status: 'defeat' };
        }
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