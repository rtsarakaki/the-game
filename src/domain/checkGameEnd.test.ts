import { checkGameEnd } from './checkGameEnd';
import { IPlayer, Piles } from './types';

describe('checkGameEnd', () => {
  const piles: Piles = {
    asc1: [1],
    asc2: [1],
    desc1: [100],
    desc2: [100],
  };

  it('should return victory if all hands and deck are empty', () => {
    const players: IPlayer[] = [
      { name: 'A', cards: [] },
      { name: 'B', cards: [] },
    ];
    const deck: number[] = [];
    const isMovePossible = jest.fn();
    expect(checkGameEnd(deck, players, piles, isMovePossible)).toBe('victory');
  });

  it('should return defeat if no moves are possible', () => {
    const players: IPlayer[] = [
      { name: 'A', cards: [10] },
      { name: 'B', cards: [20] },
    ];
    const deck: number[] = [1, 2];
    const isMovePossible = jest.fn().mockReturnValue(false);
    expect(checkGameEnd(deck, players, piles, isMovePossible)).toBe('defeat');
  });

  it('should return in_progress if there are still moves possible', () => {
    const players: IPlayer[] = [
      { name: 'A', cards: [10] },
      { name: 'B', cards: [20] },
    ];
    const deck: number[] = [1, 2];
    const isMovePossible = jest.fn().mockReturnValue(true);
    expect(checkGameEnd(deck, players, piles, isMovePossible)).toBe('in_progress');
  });
}); 