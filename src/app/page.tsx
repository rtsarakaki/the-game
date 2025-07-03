"use client";
import { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

interface PlayerLink {
  id: string;
  url: string;
}

export default function HomePage() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numPlayers, setNumPlayers] = useState(2);
  const [playerLinks, setPlayerLinks] = useState<PlayerLink[]>([]);
  const [boardLink, setBoardLink] = useState<string | null>(null);
  const created = !!gameId;
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCreateGame = async () => {
    setLoading(true);
    setError(null);
    const id = uuidv4();
    // Gera ids únicos para cada jogador
    const players = Array.from({ length: numPlayers }, () => ({
      id: uuidv4(),
      nome: "",
      cartas: [],
    }));
    // Gera links
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const board = `${base}/partida/${id}/board`;
    const links = players.map((p) => ({
      id: p.id,
      url: `${base}/partida/${id}/player/${p.id}`,
    }));
    // Cria objeto da partida
    const partida = {
      id,
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
        body: JSON.stringify(partida),
      });
      if (!res.ok) throw new Error("Erro ao criar partida");
      setGameId(id);
      setPlayerLinks(links);
      setBoardLink(board);
    } catch {
      setError("Não foi possível criar a partida. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">The Game Online</h1>
      <p className="mb-6 text-gray-600 text-center max-w-md">
        Crie uma partida, defina o número de jogadores e compartilhe os links individuais.<br />
        O tabuleiro principal pode ser projetado para todos acompanharem as jogadas.
      </p>
      {!created && (
        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
          <label htmlFor="numPlayers" className="text-gray-700 font-medium">Quantidade de jogadores</label>
          <input
            id="numPlayers"
            type="number"
            min={2}
            max={6}
            value={numPlayers}
            onChange={e => setNumPlayers(Math.max(2, Math.min(6, Number(e.target.value))))}
            className="px-4 py-2 rounded border w-full text-center text-lg"
            ref={inputRef}
          />
          <button
            className="px-8 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition mb-6 disabled:opacity-50 text-lg font-semibold"
            onClick={handleCreateGame}
            disabled={loading}
          >
            {loading ? "Criando..." : "Criar partida"}
          </button>
        </div>
      )}
      {created && (
        <div className="bg-white rounded p-4 shadow text-center border border-blue-200 w-full max-w-xs">
          <p className="mb-2 text-gray-800 font-medium">Compartilhe os links abaixo:</p>
          <div className="mb-4">
            <span className="block text-gray-600 font-semibold mb-1">Tabuleiro principal:</span>
            <a href={boardLink!} className="text-blue-700 underline break-all text-sm" target="_blank" rel="noopener noreferrer">{boardLink}</a>
          </div>
          <div className="mb-2">
            <span className="block text-gray-600 font-semibold mb-1">Links dos jogadores:</span>
            <ul className="space-y-1">
              {playerLinks.map((link, i) => (
                <li key={link.id} className="text-gray-700 text-sm">
                  <span className="font-medium">Jogador {i + 1}:</span> <a href={link.url} className="text-blue-700 underline break-all" target="_blank" rel="noopener noreferrer">{link.url}</a>
                </li>
              ))}
            </ul>
          </div>
          <button
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition disabled:opacity-50 w-full font-semibold"
            onClick={() => {
              setGameId(null);
              setPlayerLinks([]);
              setBoardLink(null);
              setError(null);
            }}
          >
            Nova partida
          </button>
        </div>
      )}
      {error && <p className="text-red-500 mt-4">{error}</p>}
      <footer className="mt-12 text-xs text-gray-400">Desenvolvido com Next.js, TypeScript e Tailwind CSS</footer>
    </div>
  );
}
