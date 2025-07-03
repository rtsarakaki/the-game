import { shuffleDeck } from './shuffleDeck';

describe('shuffleDeck', () => {
  it('should return a new array with the same elements in a different order', () => {
    const deck = Array.from({ length: 98 }, (_, i) => i + 2); // [2, ..., 99]
    const shuffled = shuffleDeck(deck);
    expect(shuffled).toHaveLength(deck.length);
    expect(shuffled).toEqual(expect.arrayContaining(deck));
    // There is a small chance the order is the same, but for 98 elements it's negligible
    expect(shuffled).not.toEqual(deck);
  });

  it('should not mutate the original array', () => {
    const deck = [2, 3, 4, 5, 6];
    const copy = [...deck];
    shuffleDeck(deck);
    expect(deck).toEqual(copy);
  });
}); 