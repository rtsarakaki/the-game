import { IPlayer, Piles } from './types';

export type GameCurrentStatus = 'victory' | 'defeat' | 'in_progress' | 'waiting_players';

function areAllPlayerNamesFilled(players: IPlayer[]): boolean {
  return players.every(player => player.name && player.name.trim().length > 0);
}

function areAllHandsEmpty(players: IPlayer[]): boolean {
  return players.every(player => player.cards.length === 0);
}

function isDeckEmpty(deck: number[]): boolean {
  return deck.length === 0;
}

function haveAllPilesReceivedAtLeastOnePlay(piles: Piles): boolean {
  // Cada pilha deve ter pelo menos 2 cartas: a inicial e uma jogada
  return Object.values(piles).every(pile => pile.length > 1);
}

function doesCurrentPlayerFailToMeetMinimumAndCannotPlay(
  currentPlayer: IPlayer,
  piles: Piles,
  minCardsPerTurn: number,
  currentTurnPlays: number,
  isMovePossible: (player: IPlayer, piles: Piles) => boolean
): boolean {
  const hasNotMetMinimum = currentTurnPlays < minCardsPerTurn;
  const cannotPlay = !isMovePossible(currentPlayer, piles);
  return hasNotMetMinimum && cannotPlay;
}

export const checkGameCurrentStatus = (
  deck: number[],
  players: IPlayer[],
  piles: Piles,
  isMovePossible: (player: IPlayer, piles: Piles) => boolean,
  currentPlayerIndex?: number,
  minCardsPerTurn?: number,
  currentTurnPlays?: number
): GameCurrentStatus => {
  // 1. Esperando todos os jogadores preencherem seus nomes
  const allPlayerNamesFilled = areAllPlayerNamesFilled(players);
  if (!allPlayerNamesFilled) {
    return 'waiting_players';
  }

  // 2. Vitória: deck vazio e todas as mãos vazias
  const deckIsEmpty = isDeckEmpty(deck);
  const handsAreEmpty = areAllHandsEmpty(players);
  if (deckIsEmpty && handsAreEmpty) {
    return 'victory';
  }

  // 3. Enquanto alguma pilha não recebeu pelo menos uma jogada, não pode haver derrota
  const allPilesHaveAtLeastOnePlay = haveAllPilesReceivedAtLeastOnePlay(piles);
  if (!allPilesHaveAtLeastOnePlay) {
    return 'in_progress';
  }

  // 4. Derrota: jogador atual não consegue cumprir o mínimo e não pode jogar
  if (
    typeof currentPlayerIndex === 'number' &&
    typeof minCardsPerTurn === 'number' &&
    typeof currentTurnPlays === 'number'
  ) {
    const currentPlayer = players[currentPlayerIndex];
    const currentPlayerCannotMeetMinimumAndCannotPlay = currentPlayer && doesCurrentPlayerFailToMeetMinimumAndCannotPlay(
      currentPlayer,
      piles,
      minCardsPerTurn,
      currentTurnPlays,
      isMovePossible
    );
    if (currentPlayerCannotMeetMinimumAndCannotPlay) {
      return 'defeat';
    }
  }

  // 5. Caso contrário, o jogo está em andamento
  return 'in_progress';
}; 