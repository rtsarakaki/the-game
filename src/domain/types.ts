export interface IPlayer {
  id: string;
  name: string;
  nome?: string;
  cards: number[];
}

export interface Piles {
  asc1: number[];
  asc2: number[];
  desc1: number[];
  desc2: number[];
}

export interface IPartida {
  id: string;
  jogadores: IPlayer[];
  pilhas: Piles;
  baralho: number[];
  ordemJogadores: string[];
  jogadorAtual: string;
  status: string;
  autoStarted: boolean;
  timestamp?: number;
} 