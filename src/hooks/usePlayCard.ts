import { useState } from 'react';
import { playCard } from '@/services/playCardService';
import { fetchGame } from '@/services/gameService';
import type { IGame, IPlayer } from '@/domain/types';
import type { PileType } from '@/domain/isValidMove';
import type { PilesType } from '@/components/Piles';

interface UsePlayCardParams {
  isMyTurn: boolean;
  game: IGame | null;
  player: IPlayer | null;
  playerId: string;
  isValidMove: (pileType: PileType, topCard: number, card: number) => boolean;
  setGame: (game: IGame) => void;
  setPlayer: (player: IPlayer | null) => void;
}

export function usePlayCard({ isMyTurn, game, player, playerId, isValidMove, setGame, setPlayer }: UsePlayCardParams) {
  const [playError, setPlayError] = useState<string | null>(null);

  const handlePlayCard = async (card: number, pileKey: keyof PilesType) => {
    setPlayError(null);
    if (!game) return;
    const result = await playCard({
      isMyTurn,
      game,
      player,
      card,
      pileKey,
      playerId,
      fetchGame,
      isValidMove,
      id: game.id,
    });
    if (result.error) {
      setPlayError(result.error);
      return;
    }
    if (result.updatedGame) setGame(result.updatedGame);
    if (result.updatedPlayer) setPlayer(result.updatedPlayer);
  };

  return { handlePlayCard, playError };
} 