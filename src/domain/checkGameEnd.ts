import { IPlayer, Piles } from './types';

export type GameStatus = 'victory' | 'defeat' | 'in_progress';

export const checkGameEnd = (
  deck: number[],
  players: IPlayer[],
  piles: Piles,
  isMovePossible: (player: IPlayer, piles: Piles) => boolean
): GameStatus => {
  const allHandsEmpty = players.every((p) => p.cards.length === 0);
  const deckEmpty = deck.length === 0;
  if (allHandsEmpty && deckEmpty) return 'victory';
  const anyCanPlay = players.some(p => isMovePossible(p, piles));
  if (!anyCanPlay) return 'defeat';
  return 'in_progress';
}; 