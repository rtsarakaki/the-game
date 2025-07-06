import { useEffect, useState } from 'react';
import type { IGame, IPlayer } from '@/domain/types';
import { logger } from '@/utils/logger';

export function usePlayerLoader(game: IGame | null, playerId: string) {
  const [player, setPlayer] = useState<IPlayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  logger.debug('usePlayerLoader: game', game);
  logger.debug('usePlayerLoader: playerId', playerId);

  useEffect(() => {
    if (!game || !playerId) {
      logger.info('usePlayerLoader: game or playerId missing, waiting for data...');
      setLoading(true);
      return;
    }
    setLoading(true);
    const foundPlayer = Array.isArray(game.players)
      ? game.players.find((p) => p.id === playerId) || null
      : null;
    logger.debug('usePlayerLoader: foundPlayer', foundPlayer);
    setPlayer(foundPlayer);
    setError(foundPlayer ? null : 'Player not found');
    if (!foundPlayer) {
      logger.warning('usePlayerLoader: Player not found for playerId', playerId);
    }
    setLoading(false);
  }, [game, playerId]);

  return { player, setPlayer, loading, error };
} 