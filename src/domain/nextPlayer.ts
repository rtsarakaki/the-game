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