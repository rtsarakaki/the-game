export interface IPlayer {
  id: string;
  name: string;
  cards: number[];
}

export interface Piles {
  asc1: number[];
  asc2: number[];
  desc1: number[];
  desc2: number[];
}

export interface IGame {
  id: string;
  players: IPlayer[];
  piles: Piles;
  deck: number[];
  playerOrder: string[];
  currentPlayer: string;
  status: string;
  autoStarted: boolean;
  timestamp?: number;
  completedRounds?: number;
  currentTurnPlays?: number;
} 