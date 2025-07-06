import type { IGame } from '@/domain/types';

export async function updatePlayerName(gameId: string, playerId: string, name: string, game: IGame): Promise<IGame> {
  const updatedGame = {
    ...game,
    players: game.players.map(player =>
      player.id === playerId ? { ...player, name } : player
    ),
  };
  if (updatedGame.status === 'defeat' || updatedGame.status === 'victory' || updatedGame.status === 'in_progress') {
    debugger;
    console.log('[FRONT][updatePlayerName] PUT /api/partida', { gameId, status: updatedGame.status });
  }
  const res = await fetch("/api/partida", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameId, game: updatedGame }),
  });
  if (!res.ok) throw new Error('Failed to update player name');
  return await res.json();
} 