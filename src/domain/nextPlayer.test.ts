import { nextPlayer, nextPlayerWhoCanPlay } from './nextPlayer';
import { IPlayer, Piles } from './types';

describe('nextPlayer', () => {
  it('should return the next player in order', () => {
    const order = ['A', 'B', 'C'];
    expect(nextPlayer(order, 'A')).toBe('B');
    expect(nextPlayer(order, 'B')).toBe('C');
    expect(nextPlayer(order, 'C')).toBe('A');
  });

  it('should return empty string if player not found', () => {
    const order = ['A', 'B', 'C'];
    expect(nextPlayer(order, 'D')).toBe('');
  });

  it('should return empty string if order is empty', () => {
    expect(nextPlayer([], 'A')).toBe('');
  });
});

describe('nextPlayerWhoCanPlay', () => {
  const mockPiles: Piles = {
    asc1: [1, 50],
    asc2: [1, 60],
    desc1: [100, 70],
    desc2: [100, 80]
  };

  const players = [
    { id: 'player1', name: 'Alice', cards: [51, 52] }, // Can play on asc1
    { id: 'player2', name: 'Bob', cards: [90, 91] }, // Cannot play anywhere
    { id: 'player3', name: 'Charlie', cards: [69, 68] } // Can play on desc1
  ];

  const order = ['player1', 'player2', 'player3'];

  it('should return the next player who can make moves', () => {
    const mockIsMovePossible = jest.fn()
      .mockImplementation((player: IPlayer) => {
        // Alice and Charlie can play, Bob cannot
        return player.name === 'Alice' || player.name === 'Charlie';
      });

    // Starting from player1 (Alice), next who can play is player3 (Charlie)
    const result = nextPlayerWhoCanPlay(order, 'player1', players, mockPiles, mockIsMovePossible);
    expect(result).toBe('player3');
  });

  it('should skip players who cannot make moves', () => {
    const mockIsMovePossible = jest.fn()
      .mockImplementation((player: IPlayer) => {
        // Only Charlie can play
        return player.name === 'Charlie';
      });

    // Starting from player1 (Alice), skip Bob, find Charlie
    const result = nextPlayerWhoCanPlay(order, 'player1', players, mockPiles, mockIsMovePossible);
    expect(result).toBe('player3');
  });

  it('should return null if no player can make moves', () => {
    const mockIsMovePossible = jest.fn().mockReturnValue(false);

    const result = nextPlayerWhoCanPlay(order, 'player1', players, mockPiles, mockIsMovePossible);
    expect(result).toBeNull();
  });

  it('should return current player if they can make moves and are next in rotation', () => {
    const mockIsMovePossible = jest.fn()
      .mockImplementation((player: IPlayer) => {
        // Only Alice can play
        return player.name === 'Alice';
      });

    // Starting from player3 (Charlie), next is player1 (Alice) who can play
    const result = nextPlayerWhoCanPlay(order, 'player3', players, mockPiles, mockIsMovePossible);
    expect(result).toBe('player1');
  });

  it('should handle circular order correctly', () => {
    const mockIsMovePossible = jest.fn()
      .mockImplementation((player: IPlayer) => {
        // Alice and Charlie can play, Bob cannot
        return player.name === 'Alice' || player.name === 'Charlie';
      });

    // Starting from player2 (Bob), next who can play is player3 (Charlie)
    const result = nextPlayerWhoCanPlay(order, 'player2', players, mockPiles, mockIsMovePossible);
    expect(result).toBe('player3');
  });

  it('should prevent infinite loops with maxIterations', () => {
    const mockIsMovePossible = jest.fn().mockReturnValue(false);

    const result = nextPlayerWhoCanPlay(order, 'player1', players, mockPiles, mockIsMovePossible, 2);
    expect(result).toBeNull();
    expect(mockIsMovePossible).toHaveBeenCalledTimes(2);
  });

  it('should handle scenario where player is not found', () => {
    const mockIsMovePossible = jest.fn().mockReturnValue(true);
    const playersWithMissingId = [
      { id: 'player1', name: 'Alice', cards: [51, 52] },
      // player2 is missing
      { id: 'player3', name: 'Charlie', cards: [69, 68] }
    ];

    const result = nextPlayerWhoCanPlay(order, 'player1', playersWithMissingId, mockPiles, mockIsMovePossible);
    expect(result).toBeNull();
  });
}); 