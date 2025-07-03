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
  const { players, deckLeft } = playerNames.reduce(
    (acc, name) => {
      const cards = acc.deckLeft.slice(0, cardsPerPlayer);
      return {
        players: [...acc.players, { name, cards }],
        deckLeft: acc.deckLeft.slice(cardsPerPlayer),
      };
    },
    { players: [] as IPlayer[], deckLeft: [...deck] }
  );
  return { deck: deckLeft, players };
}; 