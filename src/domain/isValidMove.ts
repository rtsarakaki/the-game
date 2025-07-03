export type PileType = 'asc' | 'desc';

/**
 * Checks if a move is valid according to The Game rules.
 * @param pileType 'asc' for ascending, 'desc' for descending
 * @param topCard The current top card of the pile
 * @param card The card the player wants to play
 * @returns true if the move is valid, false otherwise
 */
export const isValidMove = (
  pileType: PileType,
  topCard: number,
  card: number
): boolean => {
  if (pileType === 'asc') {
    if (card > topCard) return true;
    if (card === topCard - 10) return true; // backwards jump
    return false;
  }
  if (pileType === 'desc') {
    if (card < topCard) return true;
    if (card === topCard + 10) return true; // backwards jump
    return false;
  }
  return false;
}; 