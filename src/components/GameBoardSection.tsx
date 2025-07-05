import React from 'react';
import GameBoard from './GameBoard';
import WaitingForPlayersInfo from './WaitingForPlayersInfo';
import type { Piles, IPlayer } from '@/domain/types';

interface GameBoardSectionProps {
  title: string;
  status: string;
  children?: React.ReactNode;
  piles: Piles;
  player: IPlayer;
  onPlay: (card: number, pileKey: keyof Piles) => void;
  isCurrentPlayer: boolean;
  showWaitingInfo?: boolean;
}

const GameBoardSection: React.FC<GameBoardSectionProps> = ({
  title,
  status,
  children,
  piles,
  player,
  onPlay,
  isCurrentPlayer,
  showWaitingInfo,
}) => (
  <div className="bg-white rounded-lg shadow-lg p-6">
    <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
    <div className="mb-2 text-sm text-gray-600">{status}</div>
    {children}
    <GameBoard
      piles={piles}
      player={player}
      onPlay={onPlay}
      isCurrentPlayer={isCurrentPlayer}
    />
    {showWaitingInfo && <WaitingForPlayersInfo />}
  </div>
);

export default GameBoardSection; 