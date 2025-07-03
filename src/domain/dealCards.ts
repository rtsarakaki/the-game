import { IPlayer } from './types';

export interface DealCardsResult {
  deck: number[];
  players: IPlayer[];
}

/**
 * Distributes cards to players.
 * @param deck The deck to draw from
 * @param playerNames Array of player names
 * @param cardsPerPlayer Number of cards per player
 * @returns New deck and array of players with their cards
 */
export const dealCards = (
  deck: number[],
  playerNames: string[],
  cardsPerPlayer: number
): DealCardsResult => {
  let deckCopy = [...deck];
  const players: IPlayer[] = playerNames.map((name) => {
    const cards = deckCopy.slice(0, cardsPerPlayer);
    deckCopy = deckCopy.slice(cardsPerPlayer);
    return { name, cards };
  });
  return { deck: deckCopy, players };
}; 