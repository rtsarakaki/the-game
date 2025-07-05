import { useState } from 'react';
import { updatePlayerName } from '@/services/playerService';
import type { IGame, IPlayer } from '@/domain/types';

export function useUpdatePlayerName(game: IGame | null, player: IPlayer | null, setGame: (game: IGame) => void, setPlayer: (player: IPlayer | null) => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdatePlayerName = async (name: string) => {
    if (!game || !player) return;
    setLoading(true);
    try {
      const updatedGame = await updatePlayerName(game.id, player.id, name, game);
      setGame(updatedGame);
      const updatedPlayer = updatedGame.players.find(p => p.id === player.id) || null;
      setPlayer(updatedPlayer);
    } catch {
      setError('Failed to update player name. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return { handleUpdatePlayerName, loading, error, setError };
} 