import React, { useEffect, useRef } from "react";

interface GameStatusProps {
  status: "em_andamento" | "vitoria" | "derrota" | "victory" | "defeat" | string;
  stats?: {
    totalCardsPlayed: number;
    rounds: number;
  };
}

export default function GameStatus({ status, stats }: GameStatusProps) {
  const playedSuccess = useRef(false);
  const playedDefeat = useRef(false);

  useEffect(() => {
    if ((status === "vitoria" || status === "victory") && !playedSuccess.current) {
      const audio = new Audio("/sounds/success.mp3");
      audio.play();
      playedSuccess.current = true;
    }
    if ((status === "derrota" || status === "defeat") && !playedDefeat.current) {
      const audio = new Audio("/sounds/lose.mp3");
      audio.play();
      playedDefeat.current = true;
    }
    if (status !== "vitoria" && status !== "victory") {
      playedSuccess.current = false;
    }
    if (status !== "derrota" && status !== "defeat") {
      playedDefeat.current = false;
    }
  }, [status]);

  if (status === "em_andamento" || status === "in_progress") return null;
  if (status === "vitoria" || status === "victory") {
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
  if (status === "derrota" || status === "defeat") {
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