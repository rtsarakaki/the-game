import type { IGame, IPlayer } from '@/domain/types';
import type { PileType } from '@/domain/isValidMove';
import type { PilesType } from '@/components/Hand';

export interface PlayCardParams {
  isMyTurn: boolean;
  game: IGame | null;
  player: IPlayer | null;
  card: number;
  pileKey: keyof PilesType;
  playerId: string;
  fetchGame: (id: string) => Promise<IGame>;
  isValidMove: (pileType: PileType, topCard: number, card: number) => boolean;
  id: string;
}

export interface PlayCardResult {
  error?: string;
  updatedGame?: IGame;
  updatedPlayer?: IPlayer | null;
  playedCard?: number;
  pileKey?: keyof PilesType;
}

function validateTurn(isMyTurn: boolean, game: IGame | null, player: IPlayer | null) {
  return isMyTurn && game && player;
}

function validateMove(isValidMove: (pileType: PileType, topCard: number, card: number) => boolean, pileType: PileType, topCard: number, card: number) {
  return isValidMove(pileType, topCard, card);
}

function buildUpdatedGameState(latestGame: IGame, latestPlayer: IPlayer, card: number, pileKey: keyof PilesType) {
  const updatedPlayers = latestGame.players.map((player) =>
    player.id === latestPlayer.id
      ? { ...player, cards: player.cards.filter((handCard) => handCard !== card) }
      : player
  );
  const updatedPiles = {
    ...latestGame.piles,
    [pileKey]: [...latestGame.piles[pileKey], card],
  };
  return {
    ...latestGame,
    players: updatedPlayers,
    piles: updatedPiles,
  };
}

async function sendGameStateToBackend(id: string, updated: IGame) {
  if (updated.status === 'defeat' || updated.status === 'victory' || updated.status === 'in_progress') {
    debugger;
    console.log('[FRONT][sendGameStateToBackend] PUT /api/partida', { gameId: id, status: updated.status });
  }
  await fetch("/api/partida", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameId: id, game: updated }),
  });
}

export async function playCard(params: PlayCardParams): Promise<PlayCardResult> {
  const { isMyTurn, game, player, card, pileKey, playerId, fetchGame, isValidMove, id } = params;
  if (!validateTurn(isMyTurn, game, player)) {
    return { error: 'Not your turn or missing game/player data.' };
  }
  const latestGame = await fetchGame(id);
  const latestPlayer = latestGame.players.find((currentPlayer) => currentPlayer.id === playerId);
  if (!latestPlayer) {
    return { error: 'Player not found.' };
  }
  const pileType: PileType = pileKey.startsWith('asc') ? 'asc' : 'desc';
  const topCard = latestGame.piles[pileKey][latestGame.piles[pileKey].length - 1];
  if (!validateMove(isValidMove, pileType, topCard, card)) {
    return { error: 'Invalid move for this pile!' };
  }
  const updated = buildUpdatedGameState(latestGame, latestPlayer, card, pileKey);
  await sendGameStateToBackend(id, updated);
  const updatedGame = await fetchGame(id);
  const updatedPlayer = updatedGame.players.find((currentPlayer) => currentPlayer.id === playerId) || null;
  return {
    updatedGame,
    updatedPlayer,
    playedCard: card,
    pileKey,
  };
} 