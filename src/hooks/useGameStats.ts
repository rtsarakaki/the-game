import type { IGame } from '@/domain/types';

export function useGameStats(game: IGame | null) {
  if (!game) {
    return {
      totalCardsPlayed: 0,
      cardsLeft: 0,
      playersLeft: 0,
      rounds: 0,
    };
  }
  const totalCardsPlayed = 98 - (game.deck.length + game.players.reduce((acc, player) => acc + (player?.cards?.length || 0), 0));
  const cardsLeft = game.deck.length;
  const playersLeft = game.players.filter(player => player && player.cards && player.cards.length > 0).length;
  const rounds = typeof game.completedRounds === 'number' ? game.completedRounds : 0;
  return {
    totalCardsPlayed,
    cardsLeft,
    playersLeft,
    rounds,
  };
} 