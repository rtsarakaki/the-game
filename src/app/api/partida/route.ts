import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { shuffleDeck } from '@/domain/shuffleDeck';
import { dealCards } from '@/domain/dealCards';
import { isValidMove } from '@/domain/isValidMove';
import { checkGameEnd } from '@/domain/checkGameEnd';
import { isMovePossible } from '@/domain/isMovePossible';
import type { IGame, IPlayer } from '@/domain/types';

const isVercel = !!process.env.VERCEL;
const GAMES_PATH = isVercel
  ? '/tmp/games.json'
  : path.resolve(process.cwd(), 'src/data/games.json');

const TTL_24_HOURS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Function to clean expired games
const cleanExpiredGames = async (): Promise<Record<string, IGame>> => {
  try {
    const data = await fs.readFile(GAMES_PATH, 'utf-8');
    const games: Record<string, IGame> = JSON.parse(data);
    const now = Date.now();
    const cleanedGames: Record<string, IGame> = {};
    let removedCount = 0;
    for (const [gameId, game] of Object.entries(games)) {
      if (now - (game.timestamp ?? 0) < TTL_24_HOURS) {
        cleanedGames[gameId] = game;
      } else {
        removedCount++;
      }
    }
    if (removedCount > 0) {
      console.log(`🧹 Cleaned ${removedCount} expired games`);
      await fs.writeFile(GAMES_PATH, JSON.stringify(cleanedGames, null, 2));
    }
    return cleanedGames;
  } catch {
    // If file doesn't exist, return empty object
    await fs.writeFile(GAMES_PATH, JSON.stringify({}, null, 2));
    return {};
  }
};

// Function to get a specific game
const getGame = async (gameId: string): Promise<IGame | null> => {
  const games = await cleanExpiredGames();
  return games[gameId] || null;
};

// Function to save a game
const saveGame = async (gameId: string, game: IGame): Promise<void> => {
  const games = await cleanExpiredGames();
  games[gameId] = game;
  await fs.writeFile(GAMES_PATH, JSON.stringify(games, null, 2));
};

// Function to notify clients via WebSocket
const notifyClients = async (eventType: string, data: IGame): Promise<void> => {
  try {
    // In a real implementation, you would send this to your WebSocket server
    // For now, we'll just log it and rely on client-side polling
    console.log(`WebSocket event: ${eventType}`, data);
  } catch (error) {
    console.error('Failed to notify clients:', error);
  }
};

// Function to check if game should auto-start
const checkAndAutoStart = async (gameId: string, game: IGame): Promise<IGame> => {
  const allNamesProvided = game.players.length >= 2 && 
    game.players.every((player: IPlayer) => player.name && player.name.trim().length > 0);
  if (allNamesProvided && game.status === "waiting_players") {
    // Auto-start the game
    const shuffled = shuffleDeck(Array.from({ length: 98 }, (_, i) => i + 2));
    const { players, deck } = dealCards(shuffled, game.players.map((player: IPlayer) => player.name), 6);
    const updatedGame: IGame = {
      ...game,
      players: players.map((p) => ({ 
        name: p.name, 
        cards: p.cards, 
        id: game.players.find((player: IPlayer) => player.name === p.name)?.id || "" 
      })),
      deck,
      playerOrder: game.players.map((player: IPlayer) => player.id),
      currentPlayer: game.players[0].id,
      status: "in_progress",
      autoStarted: true, // Flag to indicate auto-start
    };
    // Save the updated game
    await saveGame(gameId, updatedGame);
    // Notify all clients that the game has started
    await notifyClients('game:started', updatedGame);
    return updatedGame;
  }
  // Se ainda não tem todos os nomes, mantenha status waiting_players
  if (!allNamesProvided && game.status !== "waiting_players") {
    return { ...game, status: "waiting_players" };
  }
  return game;
};

// Function to replenish cards for the previous player
const replenishCardsForPreviousPlayer = (game: IGame, previousPlayerId: string): IGame => {
  if (game.status !== "in_progress") {
    return game;
  }
  let newDeck = [...game.deck];
  const newPlayers = game.players.map(player => {
    if (player.id !== previousPlayerId) return player;
    const newHand = [...player.cards];
    while (newDeck.length > 0 && newHand.length < 6) {
      newHand.push(newDeck[0]);
      newDeck = newDeck.slice(1);
    }
    return { ...player, cards: newHand };
  });
  return {
    ...game,
    players: newPlayers,
    deck: newDeck
  };
};

// Utility function to map backend to frontend (if needed)
function mapGameToFrontend(game: IGame) {
  return {
    ...game,
    players: game.players.map((player: IPlayer) => ({
      ...player,
      cards: player.cards
    }))
  };
}

function validateMinCardsPlayed(
  beforeCards: number[],
  afterCards: number[],
  minCardsPerTurn: number,
  piles: Record<string, number[]>
): { valid: boolean; debugInfo: { minCardsPerTurn: number; cardsPlayed: number; beforeCards: number[]; afterCards: number[]; canStillPlay: boolean } } {
  const cardsPlayed = beforeCards.length - afterCards.length;
  const canStillPlay = (afterCards ?? []).some((card: number) => {
    return Object.entries(piles).some(([pileKey, pile]: [string, number[]]) => {
      const pileType = pileKey.startsWith('asc') ? 'asc' : 'desc';
      const topCard = pile[pile.length - 1];
      return isValidMove(pileType, topCard, card);
    });
  });
  const debugInfo = {
    minCardsPerTurn,
    cardsPlayed,
    beforeCards,
    afterCards,
    canStillPlay
  };
  if (cardsPlayed < minCardsPerTurn && canStillPlay) {
    console.log('[DEBUG][validateMinCardsPlayed] Failed:', debugInfo);
    return { valid: false, debugInfo };
  }
  return { valid: true, debugInfo };
}

function passTurnToNextPlayer(game: IGame): IGame {
  const currentIndex = game.playerOrder.indexOf(game.currentPlayer);
  const nextIndex = (currentIndex + 1) % game.playerOrder.length;
  const nextPlayerId = game.playerOrder[nextIndex];
  let completedRounds = game.completedRounds || 0;
  if (nextIndex === 0) completedRounds++;
  return { ...game, currentPlayer: nextPlayerId, currentTurnPlays: 0, completedRounds };
}

function checkGameStatus(game: IGame, currentPlayerIndex?: number, minCardsPerTurn?: number): IGame {
  const status = checkGameEnd(
    game.deck,
    game.players,
    game.piles,
    isMovePossible,
    typeof currentPlayerIndex === 'number' ? currentPlayerIndex : undefined,
    typeof minCardsPerTurn === 'number' ? minCardsPerTurn : undefined,
    typeof game.currentTurnPlays === 'number' ? game.currentTurnPlays : undefined,
    game.playerOrder,
    game.currentPlayer
  );
  return { ...game, status };
}

async function saveAndNotify(gameId: string, game: IGame): Promise<void> {
  await saveGame(gameId, game);
  await notifyClients('game:updated', game);
}

export async function GET(req: NextRequest) {
  try {
    await cleanExpiredGames();
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get('gameId');
    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }
    let game = await getGame(gameId);
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    game = await checkAndAutoStart(gameId, game);
    // Só valida status de fim de jogo se o jogo já começou
    if (game.status !== 'in_progress') {
      // Nunca roda checkGameEnd antes do jogo começar
      return NextResponse.json(mapGameToFrontend(game));
    }
    // Validate game status before returning
    const currentPlayerIndex = game.players.findIndex((p) => p.id === game.currentPlayer);
    const minCardsPerTurn = game.deck.length === 0 ? 1 : 2;
    const checkedGame = checkGameStatus(game, currentPlayerIndex, minCardsPerTurn);
    if (checkedGame.status !== game.status) {
      await saveGame(gameId, checkedGame);
    }
    return NextResponse.json(mapGameToFrontend(checkedGame));
  } catch (error) {
    console.error('Error in GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Clean expired games first
    await cleanExpiredGames();
    const body = await req.json();
    const { gameId, game } = body;
    if (!gameId || !game) {
      return NextResponse.json({ error: 'Game ID and game are required' }, { status: 400 });
    }
    await saveGame(gameId, game);
    console.log(`🎮 Created new game: ${gameId}`);
    return NextResponse.json({ ok: true, gameId });
  } catch (error) {
    console.error('Error in POST:', error);
    return NextResponse.json({ error: 'Could not create game' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { gameId, game, endTurn } = body;
    if (!gameId || !game) {
      return NextResponse.json({ error: 'Game ID and game are required' }, { status: 400 });
    }
    // Log before saving
    const before = (await getGame(gameId))?.players.map(player => ({ id: player.id, cards: player.cards }));
    console.log('[DEBUG][PUT] Before saving:', before);
    let updatedGame = await checkAndAutoStart(gameId, game);
    if (typeof updatedGame.currentTurnPlays !== 'number') updatedGame.currentTurnPlays = 0;
    if (typeof updatedGame.completedRounds !== 'number') updatedGame.completedRounds = 0;
    if (endTurn) {
      const currentPlayer = updatedGame.players.find((player: IPlayer) => player.id === updatedGame.currentPlayer);
      const minCardsPerTurn = updatedGame.deck.length === 0 ? 1 : 2;
      const beforeCards = game.players.find((player: IPlayer) => player.id === updatedGame.currentPlayer)?.cards || [];
      const afterCards = currentPlayer?.cards || [];
      const validation = validateMinCardsPlayed(beforeCards, afterCards, minCardsPerTurn, updatedGame.piles as unknown as Record<string, number[]>);
      if (!validation.valid) {
        return NextResponse.json({ error: `You must play at least ${minCardsPerTurn} card(s) or not be able to play any more.`, debug: validation.debugInfo }, { status: 400 });
      }
      updatedGame = passTurnToNextPlayer(updatedGame);
      const nextPlayerIndex = updatedGame.players.findIndex((p) => p.id === updatedGame.currentPlayer);
      updatedGame = checkGameStatus(updatedGame, nextPlayerIndex, minCardsPerTurn);
      if (updatedGame.status === 'in_progress') {
        updatedGame = replenishCardsForPreviousPlayer(updatedGame, game.currentPlayer);
      }
    } else {
      updatedGame.currentTurnPlays = (updatedGame.currentTurnPlays || 0) + 1;
      const currentPlayerIndex2 = updatedGame.players.findIndex((p) => p.id === updatedGame.currentPlayer);
      updatedGame = checkGameStatus(updatedGame, currentPlayerIndex2, updatedGame.deck.length === 0 ? 1 : 2);
    }
    // Log after saving
    const after = updatedGame.players.map(player => ({ id: player.id, cards: player.cards }));
    console.log('[DEBUG][PUT] After saving:', after);
    await saveAndNotify(gameId, updatedGame);
    return NextResponse.json({ ok: true, data: mapGameToFrontend(updatedGame) });
  } catch (error) {
    console.error('Error in PUT:', error);
    return NextResponse.json({ error: 'Could not update game', details: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined }, { status: 500 });
  }
} 