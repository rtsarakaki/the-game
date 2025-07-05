import React from 'react';
import ActionButton from './ActionButton';
import HomeIcon from './icons/HomeIcon';
import RestartIcon from './icons/RestartIcon';

interface GameHeaderProps {
  gameId: string;
  statusDisplay: string;
  currentPlayerName: string;
  timeRemaining: string;
  onRestart: () => void;
  onHome: () => void;
  restarting: boolean;
  gameStatus: string;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  gameId,
  statusDisplay,
  currentPlayerName,
  timeRemaining,
  onRestart,
  onHome,
  restarting,
  gameStatus,
}) => (
  <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">The Game - Game {gameId.slice(0, 8)}</h1>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
            {statusDisplay}
          </span>
          {gameStatus === 'em_andamento' && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
              Turn: {currentPlayerName}
            </span>
          )}
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
            {timeRemaining}
          </span>
        </div>
      </div>
      <div className="flex gap-3">
        <ActionButton onClick={onHome} color="secondary" aria-label="Home">
          <HomeIcon size={20} className="inline mr-2 align-text-bottom" />
          Home
        </ActionButton>
        <ActionButton onClick={onRestart} color="danger" disabled={restarting} aria-label="Restart Game">
          <RestartIcon size={20} className="inline mr-2 align-text-bottom" />
          {restarting ? 'Restarting...' : 'Restart Game'}
        </ActionButton>
      </div>
    </div>
  </div>
);

export default GameHeader; 