import { IPlayer, Piles } from './types';
import { isValidMove } from './isValidMove';

export type GameStatus = 'victory' | 'defeat' | 'in_progress';

export const checkGameEnd = (
  deck: number[],
  players: IPlayer[],
  piles: Piles,
  isMovePossible: (player: IPlayer, piles: Piles) => boolean,
  currentPlayerIndex?: number,
  minCardsPerTurn?: number
): GameStatus => {
  // Check for victory: all cards played and deck empty
  const allHandsEmpty = players.every((p) => p.cards.length === 0);
  const deckEmpty = deck.length === 0;
  if (allHandsEmpty && deckEmpty) return 'victory';

  // Check if ANY player can still make moves
  const anyPlayerCanPlay = players.some(p => isMovePossible(p, piles));
  
  // If no player can make any moves, game ends in defeat
  if (!anyPlayerCanPlay) return 'defeat';

  // If we have a current player context, check if they can meet minimum requirements
  if (typeof currentPlayerIndex === 'number' && typeof minCardsPerTurn === 'number') {
    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer) {
      let possibleMoves = 0;
      
      // Count how many moves the current player can make
      for (const card of currentPlayer.cards) {
        for (const [pileKey, pile] of Object.entries(piles)) {
          const pileType = pileKey.startsWith('asc') ? 'asc' : 'desc';
          const topCard = pile[pile.length - 1];
          if (isValidMove(pileType, topCard, card)) {
            possibleMoves++;
            if (possibleMoves >= minCardsPerTurn) break;
          }
        }
        if (possibleMoves >= minCardsPerTurn) break;
      }
      
      // If current player can't meet minimum requirements but OTHER players can still play,
      // the current player should pass their turn (not end the game)
      if (possibleMoves < minCardsPerTurn) {
        // Check if other players can still play
        const otherPlayersCanPlay = players.some((p, index) => 
          index !== currentPlayerIndex && isMovePossible(p, piles)
        );
        
        // Only end in defeat if NO ONE can play (already checked above)
        // If others can play, the game should continue (current player passes turn)
        if (otherPlayersCanPlay) {
          return 'in_progress'; // Game continues, current player will be forced to pass
        }
        
        // If we reach here, no one can play, so it's defeat (but this is redundant with the check above)
        return 'defeat';
      }
    }
  }

  return 'in_progress';
}; 