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
  const deckLength = Array.isArray(game.deck) ? game.deck.length : 0;
  const playersArray = Array.isArray(game.players) ? game.players : [];
  const totalCardsPlayed = 98 - (deckLength + playersArray.reduce((acc, player) => acc + (Array.isArray(player?.cards) ? player.cards.length : 0), 0));
  const cardsLeft = deckLength;
  const playersLeft = playersArray.filter(player => player && Array.isArray(player.cards) && player.cards.length > 0).length;
  const rounds = typeof game.completedRounds === 'number' ? game.completedRounds : 0;
  return {
    totalCardsPlayed,
    cardsLeft,
    playersLeft,
    rounds,
  };
} 