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
  const allHandsEmpty = players.every((p) => p.cards.length === 0);
  const deckEmpty = deck.length === 0;
  if (allHandsEmpty && deckEmpty) return 'victory';
  const anyCanPlay = players.some(p => isMovePossible(p, piles));
  if (!anyCanPlay) return 'defeat';
  if (typeof currentPlayerIndex === 'number' && typeof minCardsPerTurn === 'number') {
    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer) {
      let moves = 0;
      for (const card of currentPlayer.cards) {
        for (const [pileKey, pile] of Object.entries(piles)) {
          const pileType = pileKey.startsWith('asc') ? 'asc' : 'desc';
          const topCard = pile[pile.length - 1];
          if (isValidMove(pileType, topCard, card)) {
            moves++;
            if (moves >= minCardsPerTurn) break;
          }
        }
        if (moves >= minCardsPerTurn) break;
      }
      if (moves < minCardsPerTurn) return 'defeat';
    }
  }
  return 'in_progress';
}; 