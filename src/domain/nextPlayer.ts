import { IPlayer, Piles } from './types';

/**
 * Returns the next player in the order, cycling back to the start if at the end.
 * @param order Array of player names in turn order
 * @param currentPlayer Current player's name
 * @returns Next player's name
 */
export const nextPlayer = (order: string[], currentPlayer: string): string => {
  const idx = order.indexOf(currentPlayer);
  if (idx === -1 || order.length === 0) return '';
  return order[(idx + 1) % order.length];
};

/**
 * Finds the next player who can make at least one move
 * @param order Array of player IDs in order
 * @param currentPlayerId Current player ID
 * @param players Array of all players
 * @param piles Current game piles
 * @param isMovePossible Function to check if player can move
 * @param maxIterations Maximum iterations to prevent infinite loop
 * @returns Next player ID who can make moves, or null if no one can play
 */
export const nextPlayerWhoCanPlay = (
  order: string[],
  currentPlayerId: string,
  players: Array<{ id: string; name: string; cards: number[] }>,
  piles: Piles,
  isMovePossible: (player: IPlayer, piles: Piles) => boolean,
  maxIterations: number = 10
): string | null => {
  let nextId = currentPlayerId;
  let iterations = 0;
  
  do {
    // Get next player in order
    const currentIndex = order.indexOf(nextId);
    const nextIndex = (currentIndex + 1) % order.length;
    nextId = order[nextIndex];
    
    // Find player object
    const player = players.find(p => p.id === nextId);
    if (!player) break;
    
    // Check if this player can make moves
    const playerForCheck: IPlayer = { id: player.id, name: player.name, cards: player.cards };
    if (isMovePossible(playerForCheck, piles)) {
      return nextId;
    }
    
    iterations++;
  } while (nextId !== currentPlayerId && iterations < maxIterations);
  
  // No player can make moves
  return null;
}; 