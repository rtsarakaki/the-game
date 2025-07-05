import React from "react";

interface StatsPanelProps {
  cardsLeft: number;
  currentPlayerName?: string;
  gameStatus?: string;
}

export default function StatsPanel({ cardsLeft, currentPlayerName, gameStatus }: StatsPanelProps) {
  return (
    <div className="mt-4 bg-gray-100 border border-gray-300 text-gray-800 rounded p-4 text-center text-sm flex flex-col gap-1">
      {gameStatus && (
        <div className="font-bold text-base mb-1">
          Status: <span className="uppercase text-blue-700">{gameStatus}</span>
        </div>
      )}
      <div>Cartas restantes: <span className="font-bold">{cardsLeft}</span></div>
      {currentPlayerName && (
        <div className="text-green-600 font-bold animate-pulse mt-1">{currentPlayerName} jogando</div>
      )}
    </div>
  );
} 