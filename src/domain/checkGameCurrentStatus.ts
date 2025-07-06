import { IPlayer, Piles } from './types';
import { logger } from '../utils/logger';

export type GameCurrentStatus = 'victory' | 'defeat' | 'in_progress' | 'waiting_players';

function areAllPlayerNamesFilled(players: IPlayer[]): boolean {
  logger.debug('Checking if all player names are filled', players);
  const result = players.every(player => player.name && player.name.trim().length > 0);
  logger.debug('All player names filled:', result);
  return result;
}

function areAllHandsEmpty(players: IPlayer[]): boolean {
  logger.debug('Checking if all hands are empty', players);
  const result = players.every(player => player.cards.length === 0);
  logger.debug('All hands empty:', result);
  return result;
}

function isDeckEmpty(deck: number[]): boolean {
  logger.debug('Checking if deck is empty', deck);
  const result = deck.length === 0;
  logger.debug('Deck is empty:', result);
  return result;
}

function haveAllPilesReceivedAtLeastOnePlay(piles: Piles): boolean {
  logger.debug('Checking if all piles have received at least one play', piles);
  const result = Object.values(piles).every(pile => pile.length > 1);
  logger.debug('All piles have at least one play:', result);
  return result;
}

function doesCurrentPlayerFailToMeetMinimumAndCannotPlay(
  currentPlayer: IPlayer,
  piles: Piles,
  minCardsPerTurn: number,
  currentTurnPlays: number,
  isMovePossible: (player: IPlayer, piles: Piles) => boolean
): boolean {
  logger.debug('Checking if current player fails to meet minimum and cannot play', {
    currentPlayer,
    piles,
    minCardsPerTurn,
    currentTurnPlays
  });
  const hasNotMetMinimum = currentTurnPlays < minCardsPerTurn;
  const cannotPlay = !isMovePossible(currentPlayer, piles);
  logger.debug('Current player has not met minimum:', hasNotMetMinimum);
  logger.debug('Current player cannot play:', cannotPlay);
  const result = hasNotMetMinimum && cannotPlay;
  logger.debug('Current player fails to meet minimum and cannot play:', result);
  return result;
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
  logger.info('Checking game current status', {
    deck,
    players,
    piles,
    currentPlayerIndex,
    minCardsPerTurn,
    currentTurnPlays
  });
  // 1. Esperando todos os jogadores preencherem seus nomes
  const allPlayerNamesFilled = areAllPlayerNamesFilled(players);
  if (!allPlayerNamesFilled) {
    logger.info('Game status: waiting_players');
    return 'waiting_players';
  }

  // 2. Vitória: deck vazio e todas as mãos vazias
  const deckIsEmpty = isDeckEmpty(deck);
  const handsAreEmpty = areAllHandsEmpty(players);
  if (deckIsEmpty && handsAreEmpty) {
    logger.info('Game status: victory');
    return 'victory';
  }

  // 3. Enquanto alguma pilha não recebeu pelo menos uma jogada, não pode haver derrota
  const allPilesHaveAtLeastOnePlay = haveAllPilesReceivedAtLeastOnePlay(piles);
  if (!allPilesHaveAtLeastOnePlay) {
    logger.info('Game status: in_progress (not all piles have at least one play)');
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
      logger.info('Game status: defeat');
      return 'defeat';
    }
  }

  // 5. Caso contrário, o jogo está em andamento
  logger.info('Game status: in_progress');
  return 'in_progress';
}; 