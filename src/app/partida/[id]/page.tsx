"use client";
import { useEffect, useState } from "react";
import AdminPanel from "./AdminPanel";
import GameBoard from "@/components/GameBoard";
import { Piles } from "@/domain/types";
import { nextPlayer } from "@/domain/nextPlayer";
import PlayerList from "@/components/PlayerList";
import GameStatus from "@/components/GameStatus";
import { checkGameEnd } from "@/domain/checkGameEnd";
import { isMovePossible } from "@/domain/isMovePossible";

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
  const [playedThisTurn, setPlayedThisTurn] = useState<number[]>([]);

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

  // Helper: retorna o jogador atual
  const currentPlayer = partida?.jogadorAtual;
  const isCurrentPlayer = currentPlayer === name;
  const playerObj = partida?.jogadores.find((p) => p.nome === name);

  // Lógica de jogar carta
  const handlePlay = async (card: number, pileKey: keyof Piles) => {
    if (!partida || !playerObj) return;
    // Remove carta do jogador
    const updatedPlayers = partida.jogadores.map((p) =>
      p.nome === name ? { ...p, cartas: p.cartas.filter((c) => c !== card) } : p
    );
    // Atualiza pilha
    const updatedPiles = {
      ...partida.pilhas,
      [pileKey]: [...partida.pilhas[pileKey], card],
    };
    // Checa fim de jogo
    const iPlayers = updatedPlayers.map(p => ({ name: p.nome, cards: p.cartas }));
    const status = checkGameEnd(
      partida.baralho,
      iPlayers,
      updatedPiles,
      isMovePossible
    );
    const updated = {
      ...partida,
      jogadores: updatedPlayers,
      pilhas: updatedPiles,
      status,
    };
    setPartida(updated);
    setPlayedThisTurn((prev) => [...prev, card]);
    await fetch(`/api/partida`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
  };

  const handleEndTurn = async () => {
    if (!partida || !playerObj) return;
    const minPlays = partida.baralho.length === 0 ? 1 : 2;
    if (playedThisTurn.length < minPlays) {
      setError(`Você deve jogar pelo menos ${minPlays} carta${minPlays > 1 ? 's' : ''} neste turno.`);
      return;
    }
    // Compra de cartas
    let newBaralho = [...partida.baralho];
    const newPlayers = [...partida.jogadores];
    const playerIdx = newPlayers.findIndex((p) => p.nome === name);
    while (newBaralho.length > 0 && newPlayers[playerIdx].cartas.length < 6) {
      newPlayers[playerIdx].cartas.push(newBaralho[0]);
      newBaralho = newBaralho.slice(1);
    }
    // Checa fim de jogo
    const iPlayers2 = newPlayers.map(p => ({ name: p.nome, cards: p.cartas }));
    const status2 = checkGameEnd(
      newBaralho,
      iPlayers2,
      partida.pilhas,
      isMovePossible
    );
    // Avançar para o próximo jogador
    const next = nextPlayer(partida.ordemJogadores, name);
    const updated = {
      ...partida,
      jogadorAtual: next,
      jogadores: newPlayers,
      baralho: newBaralho,
      status: status2,
    };
    setPartida(updated);
    setPlayedThisTurn([]);
    await fetch(`/api/partida`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
  };

  // Reset playedThisTurn quando mudar de jogador
  useEffect(() => {
    setPlayedThisTurn([]);
  }, [partida?.jogadorAtual]);

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
          <PlayerList players={partida?.jogadores.map((p) => p.nome) ?? []} currentPlayer={partida?.jogadorAtual} />
          <p className="mt-2 text-sm text-gray-500">
            {partida && partida.jogadores.length < 2
              ? "Aguardando mais jogadores... (mínimo 2)"
              : partida && partida.jogadores.length === 6
              ? "Máximo de jogadores atingido. Aguarde o início."
              : "Aguardando início da partida..."}
          </p>
        </div>
      )}
      {partida && partida.status === "em_andamento" && playerObj && (
        <>
          <GameBoard
            piles={partida.pilhas}
            player={{ name: playerObj.nome, cards: playerObj.cartas }}
            onPlay={handlePlay}
            isCurrentPlayer={isCurrentPlayer}
          />
          {isCurrentPlayer && (
            <button
              className="mt-6 px-6 py-2 bg-purple-600 text-white rounded shadow hover:bg-purple-700 transition disabled:opacity-50"
              onClick={handleEndTurn}
              disabled={playedThisTurn.length < (partida.baralho.length === 0 ? 1 : 2)}
            >
              Encerrar turno
            </button>
          )}
        </>
      )}
      {partida && ["vitoria", "derrota"].includes(partida.status) && (
        <GameStatus
          status={partida.status}
          stats={{
            totalCardsPlayed:
              98 - (partida.baralho.length + partida.jogadores.reduce((acc, p) => acc + p.cartas.length, 0)),
            rounds: partida.ordemJogadores.length,
          }}
        />
      )}
    </main>
  );
} 