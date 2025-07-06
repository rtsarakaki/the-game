"use client";
import { useState } from "react";
import { shuffleDeck } from "@/domain/shuffleDeck";
import { dealCards } from "@/domain/dealCards";
import ErrorMessage from '@/components/ErrorMessage';

interface Player {
  nome: string;
  cartas: number[];
}

interface GameData {
  id: string;
  players: Player[];
  piles: {
    asc1: number[];
    asc2: number[];
    desc1: number[];
    desc2: number[];
  };
  deck: number[];
  playerOrder: string[];
  currentPlayer: string;
  status: string;
}

export default function AdminPanel({ game, onUpdate }: { game: GameData; onUpdate: (data: GameData) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartGame = async () => {
    setLoading(true);
    setError(null);
    try {
      // Shuffle deck
      const shuffled = shuffleDeck(Array.from({ length: 98 }, (_, i) => i + 2));
      // Deal cards
      const { players, deck } = dealCards(shuffled, game.players.map(j => j.nome), 6);
      // Set order and current player
      const playerOrder = players.map(p => p.name);
      const updated: GameData = {
        ...game,
        players: players.map(p => ({ nome: p.name, cartas: p.cards })),
        deck,
        playerOrder,
        currentPlayer: playerOrder[0],
        status: "em_andamento",
      };
      if (updated.status === 'defeat' || updated.status === 'victory' || updated.status === 'in_progress') {
        debugger;
        console.log('[FRONT][AdminPanel] PUT /api/partida', { status: updated.status });
      }
      const res = await fetch(`/api/partida`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error();
      onUpdate(updated);
    } catch {
      setError("Erro ao iniciar a partida.");
    } finally {
      setLoading(false);
    }
  };

  const allNamesFilled = game.players.length >= 2 && game.players.every(j => j.nome && j.nome.trim().length > 0);

  return (
    <div className="bg-white/90 rounded p-4 shadow w-full max-w-xs mt-8">
      <h2 className="text-lg font-semibold mb-2 text-gray-800">Players</h2>
      <ul className="space-y-1 mb-4">
        {game.players.map((p) => (
          <li key={p.nome} className="text-gray-700">{p.nome}</li>
        ))}
      </ul>
      <button
        className="px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition disabled:opacity-50 w-full"
        onClick={handleStartGame}
        disabled={loading || !allNamesFilled || game.status !== "esperando_jogadores"}
      >
        {loading ? "Iniciando..." : "Iniciar partida"}
      </button>
      <ErrorMessage message={error} className="mt-2" />
    </div>
  );
} 