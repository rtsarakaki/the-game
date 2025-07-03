import { nextPlayer } from './nextPlayer';

describe('nextPlayer', () => {
  it('should return the next player in the order', () => {
    const order = ['A', 'B', 'C'];
    expect(nextPlayer(order, 'A')).toBe('B');
    expect(nextPlayer(order, 'B')).toBe('C');
  });

  it('should cycle back to the first player after the last', () => {
    const order = ['A', 'B', 'C'];
    expect(nextPlayer(order, 'C')).toBe('A');
  });

  it('should return empty string if current player is not found', () => {
    const order = ['A', 'B', 'C'];
    expect(nextPlayer(order, 'D')).toBe('');
  });

  it('should return empty string if order is empty', () => {
    expect(nextPlayer([], 'A')).toBe('');
  });
}); 