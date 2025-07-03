import React from "react";

interface GameStatusProps {
  status: "em_andamento" | "vitoria" | "derrota" | string;
  stats?: {
    totalCardsPlayed: number;
    rounds: number;
  };
}

export default function GameStatus({ status, stats }: GameStatusProps) {
  if (status === "em_andamento") return null;
  if (status === "vitoria") {
    return (
      <div className="mt-8 bg-green-100 border border-green-400 text-green-800 rounded p-4 text-center">
        <h2 className="text-xl font-bold mb-2">Vitória!</h2>
        <p>Parabéns, todas as cartas foram jogadas!</p>
        {stats && (
          <div className="mt-2 text-sm">
            <p>Cartas jogadas: {stats.totalCardsPlayed}</p>
            <p>Rodadas: {stats.rounds}</p>
          </div>
        )}
      </div>
    );
  }
  if (status === "derrota") {
    return (
      <div className="mt-8 bg-red-100 border border-red-400 text-red-800 rounded p-4 text-center">
        <h2 className="text-xl font-bold mb-2">Derrota</h2>
        <p>O jogo travou, não há mais jogadas possíveis.</p>
        {stats && (
          <div className="mt-2 text-sm">
            <p>Cartas jogadas: {stats.totalCardsPlayed}</p>
            <p>Rodadas: {stats.rounds}</p>
          </div>
        )}
      </div>
    );
  }
  return null;
} 