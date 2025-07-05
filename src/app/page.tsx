"use client";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { DiceIcon } from "@/components/ShareIcons";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numPlayers, setNumPlayers] = useState(2);
  const router = useRouter();

  const handleCreateGame = async () => {
    setLoading(true);
    setError(null);
    
    const gameId = uuidv4();
    const timestamp = Date.now();
    
    // Generate unique IDs for each player
    const players = Array.from({ length: numPlayers }, () => ({
      id: uuidv4(),
      nome: "",
      cartas: [],
    }));
    
    // Create game object
    const partida = {
      id: gameId,
      timestamp,
      jogadores: players,
      pilhas: {
        asc1: [1],
        asc2: [1],
        desc1: [100],
        desc2: [100],
      },
      baralho: Array.from({ length: 98 }, (_, i) => i + 2),
      ordemJogadores: players.map(p => p.id),
      jogadorAtual: players[0].id,
      status: "esperando_jogadores",
    };
    
    try {
      const res = await fetch("/api/partida", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, partida }),
      });
      
      if (!res.ok) throw new Error("Erro ao criar partida");
      
      // Redirect to game board
      router.push(`/partida/${gameId}`);
    } catch {
      setError("Não foi possível criar a partida. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8 bg-gray-50">
      <h1 className="text-4xl font-bold mb-4 text-gray-800">The Game Online</h1>
      
      <div className="text-center max-w-lg">
        <p className="mb-6 text-gray-600 text-lg">
          Crie uma nova partida e compartilhe com seus amigos!
        </p>
        <p className="mb-8 text-sm text-gray-500">
          Cada partida tem duração de 24 horas e suporta de 2 a 6 jogadores.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div>
            <label htmlFor="numPlayers" className="block text-gray-700 font-medium mb-2">
              Número de jogadores
            </label>
            <input
              id="numPlayers"
              type="number"
              min={2}
              max={6}
              value={numPlayers}
              onChange={e => setNumPlayers(Math.max(2, Math.min(6, Number(e.target.value))))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-center text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50 text-lg font-semibold flex items-center justify-center gap-2"
            onClick={handleCreateGame}
            disabled={loading}
            aria-label="Criar nova partida"
            title="Criar nova partida"
          >
            {loading ? (
              "Criando partida..."
            ) : (
              <>
                <DiceIcon size={24} className="text-white" />
                Criar Nova Partida
              </>
            )}
          </button>
          
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="text-center max-w-md">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">Como jogar:</h2>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Cada jogador deve jogar pelo menos 2 cartas por turno</li>
          <li>• Use as pilhas ascendentes (1→100) e descendentes (100→1)</li>
          <li>• Você pode voltar 10 números em qualquer pilha</li>
          <li>• Objetivo: jogar todas as 98 cartas</li>
        </ul>
      </div>

      <footer className="mt-8 text-xs text-gray-400">
        Desenvolvido com Next.js, TypeScript e Tailwind CSS
      </footer>
    </div>
  );
}
