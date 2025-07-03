import { IPlayer, Piles } from './types';
import { isValidMove, PileType } from './isValidMove';

/**
 * Checks if the player can make at least one valid move on any pile.
 * @param player The player
 * @param piles The piles
 * @returns true if at least one move is possible
 */
export const isMovePossible = (player: IPlayer, piles: Piles): boolean => {
  const pileTypes: [keyof Piles, PileType][] = [
    ['asc1', 'asc'],
    ['asc2', 'asc'],
    ['desc1', 'desc'],
    ['desc2', 'desc'],
  ];
  return player.cards.some((card) =>
    pileTypes.some(([pileKey, pileType]) =>
      isValidMove(pileType, piles[pileKey][piles[pileKey].length - 1], card)
    )
  );
}; 