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
      { id: 'A', name: 'A', cards: [] },
      { id: 'B', name: 'B', cards: [] },
    ];
    const deck: number[] = [];
    const isMovePossible = jest.fn();
    expect(checkGameEnd(deck, players, piles, isMovePossible)).toBe('victory');
  });

  it('should return defeat if no moves are possible for any player', () => {
    const players: IPlayer[] = [
      { id: 'A', name: 'A', cards: [10] },
      { id: 'B', name: 'B', cards: [20] },
    ];
    const deck: number[] = [1, 2];
    const isMovePossible = jest.fn().mockReturnValue(false);
    expect(checkGameEnd(deck, players, piles, isMovePossible)).toBe('defeat');
  });

  it('should return in_progress if there are still moves possible', () => {
    const players: IPlayer[] = [
      { id: 'A', name: 'A', cards: [10] },
      { id: 'B', name: 'B', cards: [20] },
    ];
    const deck: number[] = [1, 2];
    const isMovePossible = jest.fn().mockReturnValue(true);
    expect(checkGameEnd(deck, players, piles, isMovePossible)).toBe('in_progress');
  });

  it('should return in_progress when current player cannot meet minimum but other players can play', () => {
    const players: IPlayer[] = [
      { id: 'A', name: 'A', cards: [50] }, // Current player - can't make 2 moves
      { id: 'B', name: 'B', cards: [2, 3] }, // Other player - can make moves
    ];
    const deck: number[] = [1, 2];
    
    // Mock: A can't play, B can play
    const isMovePossible = jest.fn()
      .mockImplementation((player: IPlayer) => player.id === 'B');
    
    const result = checkGameEnd(deck, players, piles, isMovePossible, 0, 2);
    expect(result).toBe('in_progress');
  });

  it('should return defeat when current player cannot meet minimum and no other players can play', () => {
    const players: IPlayer[] = [
      { id: 'A', name: 'A', cards: [50] }, // Current player - can't make 2 moves
      { id: 'B', name: 'B', cards: [60] }, // Other player - also can't play
    ];
    const deck: number[] = [1, 2];
    
    // Mock: no one can play
    const isMovePossible = jest.fn().mockReturnValue(false);
    
    const result = checkGameEnd(deck, players, piles, isMovePossible, 0, 2);
    expect(result).toBe('defeat');
  });

  it('should return in_progress when current player can meet minimum requirements', () => {
    const players: IPlayer[] = [
      { id: 'A', name: 'A', cards: [2, 3] }, // Current player - can make 2 moves
      { id: 'B', name: 'B', cards: [60] }, // Other player - doesn't matter
    ];
    const deck: number[] = [1, 2];
    
    // Mock: A can play (has valid moves)
    const isMovePossible = jest.fn()
      .mockImplementation((player: IPlayer) => player.id === 'A');
    
    const result = checkGameEnd(deck, players, piles, isMovePossible, 0, 2);
    expect(result).toBe('in_progress');
  });

  it('should handle scenario where current player has cards but no moves, other player can play', () => {
    // Simulating the real scenario from partida.json
    const players: IPlayer[] = [
      { id: 'Ricardo', name: 'Ricardo', cards: [25, 36, 65, 7, 95, 76] }, // Can play 25, 7 on DESC2
      { id: 'Leonardo', name: 'Leonardo', cards: [58] }, // Cannot play 58 anywhere
    ];
    const deck: number[] = [53, 61, 5]; // Not empty
    
    const pilesReal: Piles = {
      asc1: [1, 99],
      asc2: [1, 91, 97],
      desc1: [100, 83, 4],
      desc2: [100, 84, 27],
    };
    
    // Mock based on real scenario: Ricardo can play, Leonardo cannot
    const isMovePossible = jest.fn()
      .mockImplementation((player: IPlayer) => player.id === 'Ricardo');
    
    // Leonardo is current player (index 1), needs minimum 2 cards
    const result = checkGameEnd(deck, players, pilesReal, isMovePossible, 1, 2);
    expect(result).toBe('in_progress'); // Game should continue, not end in defeat
  });
}); 