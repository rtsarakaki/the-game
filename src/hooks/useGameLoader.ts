import { useState, useCallback, useEffect } from 'react';
import { fetchGame } from '@/services/gameService';
import type { IGame } from '@/domain/types';

export function useGameLoader(gameId: string | undefined) {
  const [game, setGame] = useState<IGame | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reloadGame = useCallback(async () => {
    if (!gameId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGame(gameId);
      setGame(data);
      setError(null);
    } catch {
      setError('Error loading game');
      setGame(null);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    reloadGame();
  }, [reloadGame]);

  return { game, error, loading, reloadGame, setGame, setError };
} 