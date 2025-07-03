"use client";
import { useState } from "react";
import { shuffleDeck } from "@/domain/shuffleDeck";
import { dealCards } from "@/domain/dealCards";

interface Player {
  nome: string;
  cartas: number[];
}

interface GameData {
  id: string;
  jogadores: Player[];
  pilhas: {
    asc1: number[];
    asc2: number[];
    desc1: number[];
    desc2: number[];
  };
  baralho: number[];
  ordemJogadores: string[];
  jogadorAtual: string;
  status: string;
}

export default function AdminPanel({ partida, onUpdate }: { partida: GameData; onUpdate: (data: GameData) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartGame = async () => {
    setLoading(true);
    setError(null);
    try {
      // Shuffle deck
      const shuffled = shuffleDeck(Array.from({ length: 98 }, (_, i) => i + 2));
      // Deal cards
      const { players, deck } = dealCards(shuffled, partida.jogadores.map(j => j.nome), 6);
      // Set order and current player
      const ordemJogadores = players.map(p => p.name);
      const updated: GameData = {
        ...partida,
        jogadores: players.map(p => ({ nome: p.name, cartas: p.cards })),
        baralho: deck,
        ordemJogadores,
        jogadorAtual: ordemJogadores[0],
        status: "em_andamento",
      };
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

  const allNamesFilled = partida.jogadores.length >= 2 && partida.jogadores.every(j => j.nome && j.nome.trim().length > 0);

  return (
    <div className="bg-white/90 rounded p-4 shadow w-full max-w-xs mt-8">
      <h2 className="text-lg font-semibold mb-2 text-gray-800">Jogadores</h2>
      <ul className="space-y-1 mb-4">
        {partida.jogadores.map((p) => (
          <li key={p.nome} className="text-gray-700">{p.nome}</li>
        ))}
      </ul>
      <button
        className="px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition disabled:opacity-50 w-full"
        onClick={handleStartGame}
        disabled={loading || !allNamesFilled || partida.status !== "esperando_jogadores"}
      >
        {loading ? "Iniciando..." : "Iniciar partida"}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
} 