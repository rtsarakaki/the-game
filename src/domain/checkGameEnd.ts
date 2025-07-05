import { IPlayer, Piles } from './types';
import { isValidMove } from './isValidMove';
import { nextPlayer } from './nextPlayer';

export type GameStatus = 'victory' | 'defeat' | 'in_progress';

export const checkGameEnd = (
  deck: number[],
  players: IPlayer[],
  piles: Piles,
  isMovePossible: (player: IPlayer, piles: Piles) => boolean,
  currentPlayerIndex?: number,
  minCardsPerTurn?: number,
  currentTurnPlays?: number,
  playerOrder?: string[],
  currentPlayerId?: string
): GameStatus => {
  // Check for victory: all cards played and deck empty
  const allHandsEmpty = players.every((p) => p.cards.length === 0);
  const deckEmpty = deck.length === 0;
  if (allHandsEmpty && deckEmpty) return 'victory';

  // Check if ANY player can still make moves
  const anyPlayerCanPlay = players.some(p => isMovePossible(p, piles));
  if (!anyPlayerCanPlay) return 'defeat';

  if (typeof currentPlayerIndex === 'number' && typeof minCardsPerTurn === 'number') {
    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer) {
      const canCurrentPlay = isMovePossible(currentPlayer, piles);
      // Conta quantas jogadas possíveis para o mínimo
      let possibleMoves = 0;
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
      // 1. Se não cumpriu o mínimo e não pode jogar, derrota
      if ((typeof currentTurnPlays === 'number' && currentTurnPlays < minCardsPerTurn) && !canCurrentPlay) {
        return 'defeat';
      }
      // 2. Se já cumpriu o mínimo e não pode jogar, verifica o próximo jogador
      if ((typeof currentTurnPlays === 'number' && currentTurnPlays >= minCardsPerTurn) && !canCurrentPlay) {
        if (playerOrder && currentPlayerId) {
          const nextId = nextPlayer(playerOrder, currentPlayerId);
          const next = players.find(p => p.id === nextId);
          if (next && !isMovePossible(next, piles)) {
            return 'defeat';
          }
        }
        return 'in_progress';
      }
      // 3. Se pode jogar, ou não está travado, jogo continua normalmente
    }
  }
  return 'in_progress';
}; 