// Service para regras de negócio e API de partida

interface Player {
  id: string;
  nome: string;
  cartas: number[];
}

interface Partida {
  id: string;
  jogadores: Player[];
  pilhas: Record<string, number[]>;
  baralho: number[];
  ordemJogadores: string[];
  jogadorAtual: string;
  status: string;
  autoStarted: boolean;
}

export async function fetchPartida(gameId: string): Promise<Partida> {
  const res = await fetch(`/api/partida?gameId=${gameId}`);
  if (!res.ok) throw new Error('Erro ao buscar partida');
  return res.json();
}

export async function updatePartida(gameId: string, partida: Partida): Promise<Partida> {
  const res = await fetch('/api/partida', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId, partida }),
  });
  if (!res.ok) throw new Error('Erro ao atualizar partida');
  return res.json();
}

export function replenishHand(player: Player, deck: number[], maxHand = 6): { newHand: number[]; newDeck: number[] } {
  const newHand = [...player.cartas];
  const newDeck = [...deck];
  while (newHand.length < maxHand && newDeck.length > 0) {
    newHand.push(newDeck.shift()!);
  }
  return { newHand, newDeck };
} 