import type { IGame } from '@/domain/types';

export function useGameStatusDisplay(game: IGame | null) {
  const getStatusDisplay = () => {
    if (!game) return '';
    switch (game.status) {
      case 'esperando_jogadores':
        return '⏳ Waiting for Players';
      case 'em_andamento':
        return '🎮 In Progress';
      case 'victory':
        return '🏆 Victory!';
      case 'defeat':
        return '💀 Defeat';
      default:
        return game.status;
    }
  };

  const getCurrentPlayerName = () => {
    if (!game) return '';
    const currentPlayer = game.players.find(p => p.id === game.currentPlayer);
    return currentPlayer?.name || 'Unnamed Player';
  };

  const getTimeRemaining = () => {
    if (!game) return '';
    const now = Date.now();
    const elapsed = now - (game.timestamp ?? 0);
    const remaining = (24 * 60 * 60 * 1000) - elapsed;
    if (remaining <= 0) return 'Expired';
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m remaining`;
  };

  return { getStatusDisplay, getCurrentPlayerName, getTimeRemaining };
} 