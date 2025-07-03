import { isMovePossible } from './isMovePossible';
import { IPlayer, Piles } from './types';

describe('isMovePossible', () => {
  const basePiles: Piles = {
    asc1: [50],
    asc2: [60],
    desc1: [10],
    desc2: [20],
  };

  it('should return true if at least one move is possible', () => {
    const player: IPlayer = { name: 'A', cards: [51, 20] };
    expect(isMovePossible(player, basePiles)).toBe(true); // 51 on asc1
  });

  it('should return false if no moves are possible', () => {
    const player: IPlayer = { name: 'A', cards: [49, 59, 11, 21] };
    expect(isMovePossible(player, basePiles)).toBe(false);
  });

  it('should return true if move is possible on a descending pile', () => {
    const player: IPlayer = { name: 'A', cards: [9] };
    expect(isMovePossible(player, basePiles)).toBe(true); // 9 on desc1
  });
}); 