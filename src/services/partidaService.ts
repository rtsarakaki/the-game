// Service para regras de negócio e API de partida

import type { IPartida, IPlayer } from '@/domain/types';

export async function fetchPartida(gameId: string): Promise<IPartida> {
  const res = await fetch(`/api/partida?gameId=${gameId}`);
  if (!res.ok) throw new Error('Erro ao buscar partida');
  return res.json();
}

export async function updatePartida(gameId: string, partida: IPartida, endTurn?: boolean): Promise<IPartida> {
  const res = await fetch('/api/partida', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId, partida, ...(endTurn ? { endTurn: true } : {}) }),
  });
  if (!res.ok) throw new Error('Erro ao atualizar partida');
  return res.json();
}

export function replenishHand(player: IPlayer, deck: number[], maxHand = 6): { newHand: number[]; newDeck: number[] } {
  const newHand = [...player.cards];
  const newDeck = [...deck];
  while (newHand.length < maxHand && newDeck.length > 0) {
    newHand.push(newDeck.shift()!);
  }
  return { newHand, newDeck };
} 