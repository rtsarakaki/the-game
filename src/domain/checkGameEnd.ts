export type GameStatus = 'victory' | 'defeat' | 'in_progress';

export interface IPlayer {
  name: string;
  cards: number[];
}

export interface Piles {
  asc1: number[];
  asc2: number[];
  desc1: number[];
  desc2: number[];
}

export const checkGameEnd = (
  deck: number[],
  players: IPlayer[],
  piles: Piles,
  isMovePossible: (player: IPlayer, piles: Piles) => boolean
): GameStatus => {
  const allHandsEmpty = players.every((p) => p.cards.length === 0);
  const deckEmpty = deck.length === 0;
  if (allHandsEmpty && deckEmpty) return 'victory';
  const anyMovePossible = players.some((p) => isMovePossible(p, piles));
  if (!anyMovePossible) return 'defeat';
  return 'in_progress';
}; 