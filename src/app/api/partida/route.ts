import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { shuffleDeck } from '@/domain/shuffleDeck';
import { dealCards } from '@/domain/dealCards';
import { isValidMove } from '@/domain/isValidMove';

interface Player {
  id: string;
  name: string;
  cartas: number[];
}

interface Partida {
  id: string;
  timestamp: number;
  jogadores: Player[];
  pilhas: {
    asc1: number[];
    asc2: number[];
    desc1: number[];
    desc2: number[];
  };
  baralho: number[];
  ordemJogadores: string[];
  jogadorAtual: string;
  status: string;
  autoStarted?: boolean;
  jogadasTurnoAtual?: number;
  rodadasCompletas?: number;
}

interface GameStorage {
  [gameId: string]: Partida;
}

const isVercel = !!process.env.VERCEL;
const GAMES_PATH = isVercel
  ? '/tmp/games.json'
  : path.resolve(process.cwd(), 'src/data/games.json');

const TTL_24_HOURS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Function to clean expired games
const cleanExpiredGames = async (): Promise<GameStorage> => {
  try {
    const data = await fs.readFile(GAMES_PATH, 'utf-8');
    const games: GameStorage = JSON.parse(data);
    const now = Date.now();
    const cleanedGames: GameStorage = {};
    
    let removedCount = 0;
    for (const [gameId, game] of Object.entries(games)) {
      if (now - game.timestamp < TTL_24_HOURS) {
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
const getGame = async (gameId: string): Promise<Partida | null> => {
  const games = await cleanExpiredGames();
  return games[gameId] || null;
};

// Function to save a game
const saveGame = async (gameId: string, partida: Partida): Promise<void> => {
  const games = await cleanExpiredGames();
  games[gameId] = partida;
  await fs.writeFile(GAMES_PATH, JSON.stringify(games, null, 2));
};

// Function to notify clients via WebSocket
const notifyClients = async (eventType: string, data: Partida): Promise<void> => {
  try {
    // In a real implementation, you would send this to your WebSocket server
    // For now, we'll just log it and rely on client-side polling
    console.log(`WebSocket event: ${eventType}`, data);
  } catch (error) {
    console.error('Failed to notify clients:', error);
  }
};

// Function to check if game should auto-start
const checkAndAutoStart = async (gameId: string, partida: Partida): Promise<Partida> => {
  const allNamesProvided = partida.jogadores.length >= 2 && 
    partida.jogadores.every((j: Player) => j.name && j.name.trim().length > 0);
  
  if (allNamesProvided && partida.status === "esperando_jogadores") {
    // Auto-start the game
    const shuffled = shuffleDeck(Array.from({ length: 98 }, (_, i) => i + 2));
    const { players, deck } = dealCards(shuffled, partida.jogadores.map((j: Player) => j.name), 6);
    
    const updatedPartida: Partida = {
      ...partida,
      jogadores: players.map((p) => ({ 
        name: p.name, 
        cartas: p.cards, 
        id: partida.jogadores.find((j: Player) => j.name === p.name)?.id || "" 
      })),
      baralho: deck,
      ordemJogadores: partida.jogadores.map((j: Player) => j.id),
      jogadorAtual: partida.jogadores[0].id,
      status: "em_andamento",
      autoStarted: true, // Flag to indicate auto-start
    };
    
    // Save the updated partida
    await saveGame(gameId, updatedPartida);
    
    // Notify all clients that the game has started
    await notifyClients('game:started', updatedPartida);
    
    return updatedPartida;
  }
  
  return partida;
};

// Função para repor cartas apenas para o jogador que acabou de jogar
const replenishCardsForPreviousPlayer = (partida: Partida, previousPlayerId: string): Partida => {
  if (partida.status !== "em_andamento") {
    return partida;
  }
  let newBaralho = [...partida.baralho];
  const newPlayers = partida.jogadores.map(player => {
    if (player.id !== previousPlayerId) return player;
    const newHand = [...player.cartas];
    while (newBaralho.length > 0 && newHand.length < 6) {
      newHand.push(newBaralho[0]);
      newBaralho = newBaralho.slice(1);
    }
    return { ...player, cartas: newHand };
  });
  return {
    ...partida,
    jogadores: newPlayers,
    baralho: newBaralho
  };
};

// Função utilitária para mapear cartas -> cards
function mapPartidaToFrontend(partida: Partida) {
  return {
    ...partida,
    jogadores: partida.jogadores.map((j: Player) => ({
      ...j,
      cards: j.cartas
    }))
  };
}

export async function GET(req: NextRequest) {
  try {
    await cleanExpiredGames();
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get('gameId');
    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }
    let partida = await getGame(gameId);
    if (!partida) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    partida = await checkAndAutoStart(gameId, partida);
    return NextResponse.json(mapPartidaToFrontend(partida));
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
    const { gameId, partida } = body;
    
    if (!gameId || !partida) {
      return NextResponse.json({ error: 'Game ID and partida are required' }, { status: 400 });
    }
    
    await saveGame(gameId, partida);
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
    const { gameId, partida, endTurn } = body;
    if (!gameId || !partida) {
      return NextResponse.json({ error: 'Game ID and partida are required' }, { status: 400 });
    }
    let updatedPartida = await checkAndAutoStart(gameId, partida);
    // Inicializa campos se não existirem
    if (typeof updatedPartida.jogadasTurnoAtual !== 'number') updatedPartida.jogadasTurnoAtual = 0;
    if (typeof updatedPartida.rodadasCompletas !== 'number') updatedPartida.rodadasCompletas = 0;
    // Se for um PUT de finalizar turno (endTurn === true)
    if (endTurn) {
      const currentPlayer = updatedPartida.jogadores.find((j: Player) => j.id === updatedPartida.jogadorAtual);
      const minCardsPerTurn = updatedPartida.baralho.length === 0 ? 1 : 2;
      const cardsPlayed = (partida.jogadores.find((j: Player) => j.id === updatedPartida.jogadorAtual)?.cartas.length ?? 0) - (currentPlayer?.cartas.length ?? 0);
      // Se não jogou o mínimo obrigatório
      if (cardsPlayed < minCardsPerTurn) {
        // Verifica se ainda pode jogar mais alguma carta
        const canStillPlay = (currentPlayer?.cartas ?? []).some((card: number) => {
          return Object.entries(updatedPartida.pilhas).some(([pileKey, pile]) => {
            const pileType = pileKey.startsWith('asc') ? 'asc' : 'desc';
            const topCard = pile[pile.length - 1];
            return isValidMove(pileType, topCard, card);
          });
        });
        if (canStillPlay) {
          return NextResponse.json({ error: `Você deve jogar pelo menos ${minCardsPerTurn} carta(s) ou não pode jogar mais nenhuma.` }, { status: 400 });
        } else {
          // Derrota
          updatedPartida = { ...updatedPartida, status: 'defeat' };
        }
      } else {
        // Passa o turno normalmente
        const idx = updatedPartida.ordemJogadores.indexOf(updatedPartida.jogadorAtual);
        const nextIdx = (idx + 1) % updatedPartida.ordemJogadores.length;
        const nextPlayerId = updatedPartida.ordemJogadores[nextIdx];
        // Incrementa rodadasCompletas se voltou ao primeiro jogador
        let rodadasCompletas = updatedPartida.rodadasCompletas || 0;
        if (nextIdx === 0) rodadasCompletas++;
        updatedPartida = { ...updatedPartida, jogadorAtual: nextPlayerId, jogadasTurnoAtual: 0, rodadasCompletas };
        // Se o próximo não pode jogar nenhuma carta, derrota
        const nextPlayer = updatedPartida.jogadores.find((j: Player) => j.id === nextPlayerId);
        const canNextPlay = (nextPlayer?.cartas ?? []).some((card: number) => {
          return Object.entries(updatedPartida.pilhas).some(([pileKey, pile]) => {
            const pileType = pileKey.startsWith('asc') ? 'asc' : 'desc';
            const topCard = pile[pile.length - 1];
            return isValidMove(pileType, topCard, card);
          });
        });
        if (!canNextPlay) {
          updatedPartida = { ...updatedPartida, status: 'defeat' };
        }
      }
      // Repor cartas para o jogador que acabou de jogar
      if (updatedPartida.status === 'em_andamento') {
        updatedPartida = replenishCardsForPreviousPlayer(updatedPartida, partida.jogadorAtual);
      }
    } else {
      // Jogada de carta: incrementa jogadasTurnoAtual
      updatedPartida.jogadasTurnoAtual = (updatedPartida.jogadasTurnoAtual || 0) + 1;
    }
    await saveGame(gameId, updatedPartida);
    await notifyClients('partida:updated', updatedPartida);
    return NextResponse.json({ ok: true, data: mapPartidaToFrontend(updatedPartida) });
  } catch (error) {
    console.error('Error in PUT:', error);
    return NextResponse.json({ error: 'Could not update game' }, { status: 500 });
  }
} 