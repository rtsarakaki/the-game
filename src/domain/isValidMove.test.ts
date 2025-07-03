import { isValidMove, PileType } from './isValidMove';

describe('isValidMove', () => {
  describe('ascending pile', () => {
    const pileType: PileType = 'asc';
    it('should allow playing a higher card', () => {
      expect(isValidMove(pileType, 10, 15)).toBe(true);
    });
    it('should allow playing exactly 10 less (backwards jump)', () => {
      expect(isValidMove(pileType, 20, 10)).toBe(true);
    });
    it('should not allow playing a lower card (not backwards jump)', () => {
      expect(isValidMove(pileType, 30, 25)).toBe(false);
    });
    it('should not allow playing the same card', () => {
      expect(isValidMove(pileType, 40, 40)).toBe(false);
    });
  });

  describe('descending pile', () => {
    const pileType: PileType = 'desc';
    it('should allow playing a lower card', () => {
      expect(isValidMove(pileType, 50, 40)).toBe(true);
    });
    it('should allow playing exactly 10 more (backwards jump)', () => {
      expect(isValidMove(pileType, 60, 70)).toBe(true);
    });
    it('should allow playing exactly 10 more (backwards jump, e.g. 80 -> 90)', () => {
      expect(isValidMove(pileType, 80, 90)).toBe(true);
    });
    it('should not allow playing a higher card (not backwards jump)', () => {
      expect(isValidMove(pileType, 80, 95)).toBe(false);
    });
    it('should not allow playing the same card', () => {
      expect(isValidMove(pileType, 90, 90)).toBe(false);
    });
  });
}); 