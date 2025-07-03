import React from "react";

interface StatsPanelProps {
  totalCardsPlayed: number;
  rounds: number;
  cardsLeft: number;
  playersLeft: number;
}

export default function StatsPanel({ totalCardsPlayed, rounds, cardsLeft, playersLeft }: StatsPanelProps) {
  return (
    <div className="mt-4 bg-gray-100 border border-gray-300 text-gray-800 rounded p-4 text-center text-sm flex flex-col gap-1">
      <div>Cartas jogadas: <span className="font-bold">{totalCardsPlayed}</span></div>
      <div>Cartas restantes: <span className="font-bold">{cardsLeft}</span></div>
      <div>Jogadores restantes: <span className="font-bold">{playersLeft}</span></div>
      <div>Rodadas: <span className="font-bold">{rounds}</span></div>
    </div>
  );
} 