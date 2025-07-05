import type { IGame } from '@/domain/types';

interface IPlayerLink {
  id: string;
  name: string;
  url: string;
  hasName: boolean;
}

export type { IPlayerLink };

export function usePlayerLinks(game: IGame | null, gameId: string): IPlayerLink[] {
  if (!game) return [];
  return game.players.map((player, index) => ({
    id: player.id,
    name: player.name || `Player ${index + 1}`,
    url: `${typeof window !== 'undefined' ? window.location.origin : ''}/partida/${gameId}/player/${player.id}`,
    hasName: !!player.name?.trim(),
  }));
} 