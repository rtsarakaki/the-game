// Service for business rules and Game API

import type { IGame } from '@/domain/types';
import { v4 as uuidv4 } from 'uuid';
import { shuffleDeck } from '@/domain/shuffleDeck';
import { dealCards } from '@/domain/dealCards';

export async function fetchGame(gameId: string): Promise<IGame> {
  const response = await fetch(`/api/partida?gameId=${gameId}`);
  if (!response.ok) throw new Error('Failed to fetch game');
  return response.json();
}

export async function updateGame(gameId: string, game: IGame): Promise<void> {
  if (game.status === 'defeat' || game.status === 'victory' || game.status === 'in_progress') {
    debugger;
    console.log('[FRONT][updateGame] PUT /api/partida', { gameId, status: game.status });
  }
  const response = await fetch('/api/partida', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId, game }),
  });
  if (!response.ok) throw new Error('Failed to update game');
}

export async function replenishHand(gameId: string, playerId: string): Promise<IGame> {
  const res = await fetch(`/api/partida/replenish?gameId=${gameId}&playerId=${playerId}`);
  if (!res.ok) throw new Error('Failed to replenish hand');
  return res.json();
}

export async function createGame(numPlayers: number): Promise<string> {
  const gameId = uuidv4();
  const timestamp = Date.now();
  const players = Array.from({ length: numPlayers }, () => ({
    id: uuidv4(),
    name: "",
    cards: [],
  }));
  const game = {
    id: gameId,
    timestamp,
    players,
    piles: {
      asc1: [1],
      asc2: [1],
      desc1: [100],
      desc2: [100],
    },
    deck: Array.from({ length: 98 }, (_, i) => i + 2),
    playerOrder: players.map(p => p.id),
    currentPlayer: players[0].id,
    status: "waiting_players",
  };
  const res = await fetch("/api/partida", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameId, game }),
  });
  if (!res.ok) throw new Error("Erro ao criar partida");
  return gameId;
}

export async function restartGame(game: IGame): Promise<IGame> {
  const shuffledDeck = shuffleDeck(Array.from({ length: 98 }, (_, i) => i + 2));
  const { players, deck } = dealCards(shuffledDeck, game.players.map(player => player.name), 6);
  const playerOrder = game.players.map(player => player.id);
  const restartedGame: IGame = {
    ...game,
    timestamp: Date.now(),
    players: game.players.map((player, idx) => ({
      ...player,
      cards: players[idx].cards,
    })),
    piles: {
      asc1: [1],
      asc2: [1],
      desc1: [100],
      desc2: [100],
    },
    deck,
    playerOrder,
    currentPlayer: playerOrder[0],
    status: "in_progress",
  };
  if (restartedGame.status === 'defeat' || restartedGame.status === 'victory' || restartedGame.status === 'in_progress') {
    debugger;
    console.log('[FRONT][restartGame] PUT /api/partida', { gameId: game.id, status: restartedGame.status });
  }
  const res = await fetch("/api/partida", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameId: game.id, game: restartedGame }),
  });
  if (!res.ok) throw new Error("Erro ao reiniciar partida");
  return await res.json();
} 