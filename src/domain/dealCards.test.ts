import { dealCards } from './dealCards';
import { IPlayer } from './types';

describe('dealCards', () => {
  it('should distribute the correct number of cards to each player', () => {
    const deck = Array.from({ length: 20 }, (_, i) => i + 1);
    const playerNames = ['Alice', 'Bob', 'Carol'];
    const cardsPerPlayer = 5;
    const { deck: newDeck, players } = dealCards(deck, playerNames, cardsPerPlayer);
    expect(players).toHaveLength(3);
    players.forEach((player) => {
      expect(player.cards).toHaveLength(5);
    });
    expect(newDeck).toHaveLength(5);
  });

  it('should not mutate the original deck', () => {
    const deck = [1, 2, 3, 4, 5, 6];
    const copy = [...deck];
    dealCards(deck, ['A', 'B'], 2);
    expect(deck).toEqual(copy);
  });

  it('should distribute fewer cards if deck is too small', () => {
    const deck = [1, 2, 3, 4];
    const playerNames = ['A', 'B'];
    const cardsPerPlayer = 3;
    const { players, deck: newDeck } = dealCards(deck, playerNames, cardsPerPlayer);
    expect(players[0].cards).toEqual([1, 2, 3]);
    expect(players[1].cards).toEqual([4]);
    expect(newDeck).toEqual([]);
  });
}); 