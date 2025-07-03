"use client";
import { useEffect, useState } from "react";
import AdminPanel from "./AdminPanel";

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

export default function JoinGamePage({ params }: { params: { id: string } }) {
  const [name, setName] = useState("");
  const [partida, setPartida] = useState<GameData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Polling for partida
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await fetch(`/api/partida`);
        const data: GameData = await res.json();
        if (data.id !== params.id) return;
        setPartida(data);
      } catch {}
    };
    fetchGame();
    const interval = setInterval(fetchGame, 1500);
    return () => clearInterval(interval);
  }, [params.id]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/partida`);
      const data: GameData = await res.json();
      if (data.id !== params.id) {
        setError("Partida não encontrada.");
        setLoading(false);
        return;
      }
      if (data.jogadores.length >= 6) {
        setError("Máximo de 6 jogadores atingido.");
        setLoading(false);
        return;
      }
      if (data.jogadores.some((p) => p.nome === name)) {
        setError("Nome já utilizado.");
        setLoading(false);
        return;
      }
      const updated = {
        ...data,
        jogadores: [...data.jogadores, { nome: name, cartas: [] }],
      };
      const putRes = await fetch(`/api/partida`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!putRes.ok) throw new Error();
      setPartida(updated);
      setName("");
    } catch {
      setError("Erro ao entrar na partida.");
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = !!(partida && partida.jogadores && partida.jogadores.length > 0 && partida.jogadores[0].nome === name);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-4">
      <h1 className="text-2xl font-bold text-white mb-6">Entrar na Partida</h1>
      <form onSubmit={handleJoin} className="flex flex-col items-center gap-4 w-full max-w-xs">
        <input
          type="text"
          placeholder="Seu nome ou apelido"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-4 py-2 rounded border w-full"
          required
          minLength={2}
          maxLength={16}
          disabled={!!(loading || (partida && partida.jogadores.length >= 6))}
        />
        <button
          type="submit"
          className="px-6 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition disabled:opacity-50"
          disabled={!!(loading || (partida && partida.jogadores.length >= 6) || !name.trim())}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
      {error && <p className="text-red-400 mt-2">{error}</p>}
      {partida && isAdmin ? (
        <AdminPanel partida={partida} onUpdate={setPartida} />
      ) : (
        <div className="mt-8 bg-white/90 rounded p-4 shadow w-full max-w-xs">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Jogadores</h2>
          <ul className="space-y-1">
            {partida?.jogadores.map((p) => (
              <li key={p.nome} className="text-gray-700">{p.nome}</li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-gray-500">
            {partida && partida.jogadores.length < 2
              ? "Aguardando mais jogadores... (mínimo 2)"
              : partida && partida.jogadores.length === 6
              ? "Máximo de jogadores atingido. Aguarde o início."
              : "Aguardando início da partida..."}
          </p>
        </div>
      )}
    </main>
  );
} 