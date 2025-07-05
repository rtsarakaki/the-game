import { useEffect, useState } from 'react';
import type { IGame, IPlayer } from '@/domain/types';

export function usePlayerLoader(game: IGame | null, playerId: string) {
  const [player, setPlayer] = useState<IPlayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!game || !playerId) {
      setPlayer(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const foundPlayer = game.players.find((p) => p.id === playerId) || null;
    setPlayer(foundPlayer);
    setError(foundPlayer ? null : 'Player not found');
    setLoading(false);
  }, [game, playerId]);

  return { player, setPlayer, loading, error };
} 