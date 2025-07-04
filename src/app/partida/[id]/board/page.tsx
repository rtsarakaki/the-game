"use client";
import { use, useEffect, useState } from "react";
import { shuffleDeck } from "@/domain/shuffleDeck";
import { dealCards } from "@/domain/dealCards";
import GameStatus from '@/components/GameStatus';
import Card from "@/components/Card";
import StatsPanel from '@/components/StatsPanel';

interface Player {
  id: string;
  nome: string;
  cartas: number[];
}
interface Piles {
  asc1: number[];
  asc2: number[];
  desc1: number[];
  desc2: number[];
}
interface Partida {
  id: string;
  jogadores: Player[];
  pilhas: Piles;
  baralho: number[];
  ordemJogadores: string[];
  jogadorAtual: string;
  status: string;
}

export default function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [partida, setPartida] = useState<Partida | null>(null);
  const [loading, setLoading] = useState(true);
  const [startLoading, setStartLoading] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchPartida = async () => {
      try {
        const res = await fetch("/api/partida");
        const data = await res.json();
        if (data.id === id && mounted) {
          setPartida(data);
        }
      } catch {}
      setLoading(false);
    };
    fetchPartida();
    const interval = setInterval(fetchPartida, 2000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }
  if (!partida) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">Partida não encontrada.</div>;
  }

  const allNamesFilled = partida.jogadores.length >= 2 && partida.jogadores.every(j => j.nome && j.nome.trim().length > 0);
  const canStart = allNamesFilled && partida.status === "esperando_jogadores";

  const handleStartGame = async () => {
    setStartLoading(true);
    setStartError(null);
    try {
      const shuffled = shuffleDeck(Array.from({ length: 98 }, (_, i) => i + 2));
      const { players, deck } = dealCards(shuffled, partida.jogadores.map(j => j.nome), 6);
      const updated = {
        ...partida,
        jogadores: players.map(p => ({ nome: p.name, cartas: p.cards, id: partida.jogadores.find(j => j.nome === p.name)?.id || "" })),
        baralho: deck,
        ordemJogadores: partida.jogadores.map(j => j.id),
        jogadorAtual: partida.jogadores[0].id,
        status: "em_andamento",
        id: partida.id,
        pilhas: partida.pilhas,
      };
      const res = await fetch("/api/partida", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error();
      setPartida(updated);
    } catch {
      setStartError("Erro ao iniciar a partida. Tente novamente.");
    } finally {
      setStartLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-4">
      <h1 className="text-2xl font-bold text-white mb-4">Tabuleiro Principal</h1>
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6 items-start">
        <aside className="md:w-1/3 w-full mb-4 md:mb-0">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow text-gray-800">
            <h2 className="text-lg font-bold mb-2 text-yellow-700">Regras do Jogo</h2>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>O objetivo é jogar todas as cartas nas pilhas centrais, cooperando com os outros jogadores.</li>
              <li>Existem 4 pilhas: 2 crescentes (de 1 a 99) e 2 decrescentes (de 100 a 2).</li>
              <li>Em pilhas crescentes, só pode jogar carta maior que o topo ou exatamente 10 abaixo.</li>
              <li>Em pilhas decrescentes, só pode jogar carta menor que o topo ou exatamente 10 acima.</li>
              <li>No seu turno, jogue pelo menos 2 cartas (ou 1 se o baralho acabou).</li>
              <li>Após jogar, compre cartas até ficar com 6 (se houver no baralho).</li>
              <li>Se nenhum jogador puder jogar, o jogo termina em derrota.</li>
              <li>Se todas as cartas forem jogadas, todos vencem!</li>
            </ul>
          </div>
        </aside>
        <div className="bg-white/90 rounded-lg shadow p-6 w-full md:w-2/3 flex flex-col gap-6">
          <section>
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Jogadores</h2>
            <ul className="flex flex-col gap-2">
              {partida.jogadores.map((j) => (
                <li
                  key={j.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg shadow-sm transition-all
                    ${partida.jogadorAtual === j.id ? "bg-blue-100 border-l-4 border-blue-500 font-bold text-blue-900 scale-105" : "bg-gray-50 text-gray-700"}
                  `}
                >
                  <span className={`flex items-center justify-center rounded-full font-bold text-white text-sm w-8 h-8 shadow ${partida.jogadorAtual === j.id ? 'bg-blue-500' : 'bg-gray-400'}`}>
                    {j.nome.slice(0,2).toUpperCase()}
                  </span>
                  <span className="truncate max-w-[120px]">{j.nome}</span>
                  {partida.jogadorAtual === j.id && <span className="ml-2 text-xs text-blue-600 font-semibold">(Vez)</span>}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Pilhas</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(partida.pilhas).map(([key, pile]) => (
                <div key={key} className="flex flex-col items-center">
                  <span className="text-xs text-gray-500 mb-1">{key.toUpperCase()}</span>
                  <Card value={pile[pile.length - 1]} selected={false} onClick={() => {}} disabled variant="hand" />
                </div>
              ))}
            </div>
          </section>
          <StatsPanel
            totalCardsPlayed={98 - (partida.baralho.length + (partida.jogadores.reduce((acc, p) => acc + (p.cartas ? p.cartas.length : 0), 0)))}
            cardsLeft={partida.baralho.length}
            playersLeft={partida.jogadores.filter(p => p.cartas && p.cartas.length > 0).length}
            rounds={partida.ordemJogadores.length}
          />
        </div>
      </div>
      {/* Painel de vitória/derrota */}
      {['victory','defeat','vitoria','derrota'].includes(partida.status) && (
        <GameStatus
          status={partida.status}
          stats={{
            totalCardsPlayed:
              98 - (partida.baralho.length + (partida.jogadores.reduce((acc, p) => acc + (p.cartas ? p.cartas.length : 0), 0))),
            rounds: partida.ordemJogadores.length,
          }}
        />
      )}
      <footer className="mt-12 text-xs text-gray-400">Desenvolvido com Next.js, TypeScript e Tailwind CSS</footer>
      {canStart && (
        <div className="fixed bottom-8 left-0 w-full flex justify-center">
          <button
            className="px-8 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50 text-lg font-semibold"
            onClick={handleStartGame}
            disabled={startLoading}
          >
            {startLoading ? "Iniciando..." : "Iniciar partida"}
          </button>
        </div>
      )}
      {startError && <div className="fixed bottom-20 left-0 w-full flex justify-center"><span className="text-red-500 bg-white/90 rounded px-4 py-2 shadow">{startError}</span></div>}
    </main>
  );
} 