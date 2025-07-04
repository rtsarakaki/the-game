"use client";
import { use, useEffect, useState, useRef } from "react";
import { isValidMove, PileType } from '@/domain/isValidMove';
import Card from "@/components/Card";
import StatsPanel from '@/components/StatsPanel';
import GameEndOverlay from '@/components/GameEndOverlay';

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

export default function PlayerHandPage({ params }: { params: Promise<{ id: string; pid: string }> }) {
  const { id, pid } = use(params);
  const [partida, setPartida] = useState<Partida | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [nomeInput, setNomeInput] = useState("");
  const [nomeLoading, setNomeLoading] = useState(false);
  const [nomeError, setNomeError] = useState<string | null>(null);
  const isMyTurn = (partida?.status === "em_andamento" || partida?.status === "in_progress") && partida?.jogadorAtual === pid;
  const [draggedCard, setDraggedCard] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [playedThisTurn, setPlayedThisTurn] = useState<number[]>([]);
  const [endTurnError, setEndTurnError] = useState<string | null>(null);
  const [lastDrop, setLastDrop] = useState<string | null>(null);
  const [errorDrop, setErrorDrop] = useState<string | null>(null);
  const defeatPlayedRef = useRef(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchPartida = async () => {
      try {
        const res = await fetch("/api/partida");
        const data = await res.json();
        if (data.id === id && mounted) {
          setPartida(data);
          setPlayer(data.jogadores.find((j: Player) => j.id === pid) || null);
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
  }, [id, pid]);

  useEffect(() => {
    setPlayedThisTurn([]);
    setEndTurnError(null);
    setSelectedCard(null);
  }, [partida?.jogadorAtual]);

  // Toca som de derrota apenas uma vez por transição
  useEffect(() => {
    if (!partida) return;
    if ((partida.status === 'defeat' || partida.status === 'derrota') && !defeatPlayedRef.current) {
      const audio = new Audio('/sounds/lose.mp3');
      audio.play();
      defeatPlayedRef.current = true;
    }
    if (partida.status !== 'defeat' && partida.status !== 'derrota') {
      defeatPlayedRef.current = false;
    }
  }, [partida?.status]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
    }
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }
  if (!partida || !player) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">Jogador ou partida não encontrada.</div>;
  }

  // Se o nome do jogador está vazio, mostrar input para digitar nome
  if (!player.nome) {
    const handleSaveName = async (e: React.FormEvent) => {
      e.preventDefault();
      setNomeLoading(true);
      setNomeError(null);
      const nome = nomeInput.trim();
      if (!nome) {
        setNomeError("O nome não pode ser vazio.");
        setNomeLoading(false);
        return;
      }
      // Verifica se nome já existe
      if (partida.jogadores.some(j => j.nome.toLowerCase() === nome.toLowerCase())) {
        setNomeError("Este nome já está em uso por outro jogador.");
        setNomeLoading(false);
        return;
      }
      // Atualiza nome do jogador
      const updated = {
        ...partida,
        jogadores: partida.jogadores.map(j =>
          j.id === player.id ? { ...j, nome } : j
        ),
      };
      try {
        const res = await fetch("/api/partida", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
        if (!res.ok) throw new Error();
        setPlayer({ ...player, nome });
        setNomeInput("");
      } catch {
        setNomeError("Erro ao salvar nome. Tente novamente.");
      } finally {
        setNomeLoading(false);
      }
    };
    return (
      <main className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-4">
        <div className="bg-white/90 rounded-lg shadow p-6 w-full max-w-md flex flex-col gap-6 items-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Identifique-se</h1>
          <form onSubmit={handleSaveName} className="flex flex-col gap-4 w-full max-w-xs">
            <input
              type="text"
              placeholder="Digite seu nome"
              value={nomeInput}
              onChange={e => setNomeInput(e.target.value)}
              className="px-4 py-2 rounded border w-full text-lg"
              minLength={2}
              maxLength={16}
              disabled={nomeLoading}
              autoFocus
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition disabled:opacity-50"
              disabled={nomeLoading || !nomeInput.trim()}
            >
              {nomeLoading ? "Salvando..." : "Salvar nome"}
            </button>
            {nomeError && <p className="text-red-500 text-sm">{nomeError}</p>}
          </form>
        </div>
        <footer className="mt-12 text-xs text-gray-400">Desenvolvido com Next.js, TypeScript e Tailwind CSS</footer>
      </main>
    );
  }

  // Função para jogar carta
  const handlePlayCard = async (card: number, pileKey: keyof Piles) => {
    if (!isMyTurn) return;
    // Validação da jogada
    const pileType: PileType = pileKey.startsWith('asc') ? 'asc' : 'desc';
    const topCard = partida.pilhas[pileKey][partida.pilhas[pileKey].length - 1];
    if (!isValidMove(pileType, topCard, card)) {
      setEndTurnError('Jogada inválida para esta pilha!');
      const audio = new Audio('/sounds/error.mp3');
      audio.play();
      setDraggedCard(null);
      setDropTarget(null);
      return;
    }
    setEndTurnError(null);
    // Remove carta do jogador
    const updatedPlayers = partida.jogadores.map((j) =>
      j.id === player.id ? { ...j, cartas: j.cartas.filter((c) => c !== card) } : j
    );
    // Atualiza pilha
    const updatedPiles = {
      ...partida.pilhas,
      [pileKey]: [...partida.pilhas[pileKey], card],
    };
    // Após atualizar as cartas e pilhas, verificar se o jogador ainda pode jogar
    const remainingCards = updatedPlayers.find(j => j.id === player.id)?.cartas || [];
    const canStillPlay = remainingCards.some(card => {
      return Object.entries(updatedPiles).some(([pileKey, pile]) => {
        const pileType: PileType = pileKey.startsWith('asc') ? 'asc' : 'desc';
        const topCard = pile[pile.length - 1];
        return isValidMove(pileType, topCard, card);
      });
    });
    let updated = {
      ...partida,
      jogadores: updatedPlayers,
      pilhas: updatedPiles,
    };
    if (!canStillPlay && remainingCards.length > 0) {
      updated = { ...updated, status: 'defeat' };
    }
    await fetch("/api/partida", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    const res = await fetch("/api/partida");
    if (res.ok) {
      const data = await res.json();
      setPartida(data);
    }
    setPlayedThisTurn((prev) => [...prev, card]);
    setDraggedCard(null);
    setDropTarget(null);
    setLastDrop(pileKey);
    setTimeout(() => setLastDrop(null), 500);
  };

  // Função para encerrar turno
  const handleEndTurn = async () => {
    if (!isMyTurn) return;
    const minPlays = partida.baralho.length === 0 ? 1 : 2;
    if (playedThisTurn.length < minPlays) {
      setEndTurnError(`Você deve jogar pelo menos ${minPlays} carta${minPlays > 1 ? 's' : ''} neste turno.`);
      return;
    }
    setEndTurnError(null);
    // Repor cartas até 6 ou até deck acabar
    let newBaralho = [...partida.baralho];
    const newPlayers = [...partida.jogadores];
    const playerIdx = newPlayers.findIndex((j) => j.id === player.id);
    while (newBaralho.length > 0 && newPlayers[playerIdx].cartas.length < 6) {
      newPlayers[playerIdx] = {
        ...newPlayers[playerIdx],
        cartas: [...newPlayers[playerIdx].cartas, newBaralho[0]],
      };
      newBaralho = newBaralho.slice(1);
    }
    // Avançar para o próximo jogador
    const idx = partida.ordemJogadores.indexOf(player.id);
    const nextIdx = (idx + 1) % partida.ordemJogadores.length;
    const nextPlayerId = partida.ordemJogadores[nextIdx];
    const updated = {
      ...partida,
      jogadores: newPlayers,
      baralho: newBaralho,
      jogadorAtual: nextPlayerId,
    };
    await fetch("/api/partida", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setPlayedThisTurn([]);
  };

  // Função para validar se a carta pode ser jogada na pilha
  const canDropCard = (card: number, pileKey: keyof Piles) => {
    const pileType: PileType = pileKey.startsWith('asc') ? 'asc' : 'desc';
    const topCard = partida.pilhas[pileKey][partida.pilhas[pileKey].length - 1];
    return isValidMove(pileType, topCard, card);
  };

  return (
    <main className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-4">
      <h1 className="text-2xl font-bold text-white mb-2">{player.nome || "Jogador"}</h1>
      <div className="bg-white/90 rounded-lg shadow p-6 w-full max-w-md flex flex-col gap-6">
        <section>
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Suas cartas</h2>
          <div className="flex justify-center items-end" style={{ minHeight: 150 }}>
            {player.cartas.map((c, idx) => (
              <span
                key={c}
                className={`relative select-none card-baralho inline-block bg-white text-gray-900 rounded-lg border-2 border-gray-300 shadow-lg px-6 py-8 md:px-8 md:py-12 text-2xl md:text-3xl font-extrabold text-center transition-transform duration-150 cursor-${isMyTurn ? (isTouchDevice ? "pointer" : "grab") : "not-allowed"} ${draggedCard === c || selectedCard === c ? "opacity-60 scale-105 border-blue-500" : "hover:scale-105 hover:border-blue-400"} ${idx > 0 ? '-ml-4 md:-ml-8' : ''}`}
                draggable={isMyTurn && !isTouchDevice}
                onDragStart={() => !isTouchDevice && setDraggedCard(c)}
                onDragEnd={() => !isTouchDevice && setDraggedCard(null)}
                onClick={() => {
                  if (!isMyTurn) return;
                  if (isTouchDevice) {
                    setSelectedCard(selectedCard === c ? null : c);
                  } else {
                    setSelectedCard(c);
                  }
                  setErrorDrop(null);
                }}
                style={{ minWidth: 96, minHeight: 140, maxWidth: 96, maxHeight: 140, zIndex: draggedCard === c ? 10 : idx + 1 }}
              >
                <span className="absolute top-2 left-3 text-base text-gray-500 font-bold">{c}</span>
                <span className="absolute bottom-2 right-3 text-base text-gray-500 font-bold rotate-180">{c}</span>
                <span className="block h-full flex items-center justify-center text-3xl md:text-4xl font-extrabold">{c}</span>
              </span>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Pilhas (topo)</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(partida.pilhas).map(([key, pile]) => {
              const type = key.startsWith("asc") ? "asc" : "desc";
              return (
                <div
                  key={key}
                  className={`flex flex-col items-center ${dropTarget === key ? "border-blue-500 border-2" : "border-transparent"} ${lastDrop === key ? "ring-4 ring-green-400 scale-105 animate-pulse" : ""} ${errorDrop === key ? "border-red-500 ring-2 ring-red-400" : ""}`}
                  onDragOver={e => {
                    if (isTouchDevice) return;
                    e.preventDefault();
                    if (isMyTurn) setDropTarget(key);
                    if (isMyTurn && draggedCard !== null && !canDropCard(draggedCard, key as keyof Piles)) {
                      setErrorDrop(key);
                    } else {
                      setErrorDrop(null);
                    }
                  }}
                  onDragLeave={() => {
                    if (isTouchDevice) return;
                    setDropTarget(null);
                    setErrorDrop(null);
                  }}
                  onDrop={e => {
                    if (isTouchDevice) return;
                    e.preventDefault();
                    if (isMyTurn && draggedCard !== null) {
                      if (!canDropCard(draggedCard, key as keyof Piles)) {
                        setErrorDrop(key);
                        setTimeout(() => setErrorDrop(null), 500);
                        return;
                      }
                      handlePlayCard(draggedCard, key as keyof Piles);
                    }
                    setDropTarget(null);
                  }}
                  onClick={() => {
                    if (!isMyTurn || !isTouchDevice) return;
                    if (selectedCard !== null) {
                      if (!canDropCard(selectedCard, key as keyof Piles)) {
                        setErrorDrop(key);
                        setTimeout(() => setErrorDrop(null), 500);
                        return;
                      }
                      handlePlayCard(selectedCard, key as keyof Piles);
                      setSelectedCard(null);
                    }
                  }}
                >
                  <span className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    {key.toUpperCase()} <span>{type === "asc" ? "⬆️" : "⬇️"}</span>
                  </span>
                  <Card value={pile[pile.length - 1]} selected={false} onClick={() => {}} disabled variant="pile" />
                </div>
              );
            })}
          </div>
        </section>
        <StatsPanel
          totalCardsPlayed={98 - (partida.baralho.length + partida.jogadores.reduce((acc, p) => acc + p.cartas.length, 0))}
          cardsLeft={partida.baralho.length}
          playersLeft={partida.jogadores.filter(p => p.cartas.length > 0).length}
          rounds={partida.ordemJogadores.length}
        />
        <section className="flex flex-col gap-2 mt-4">
          {isMyTurn && (
            <>
              <button
                className="px-6 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition disabled:opacity-50"
                onClick={handleEndTurn}
              >
                Encerrar turno
              </button>
              {endTurnError && <span className="text-red-500 text-sm mt-2">{endTurnError}</span>}
            </>
          )}
        </section>
      </div>
      <GameEndOverlay
        status={partida.status}
        stats={{
          totalCardsPlayed: 98 - (partida.baralho.length + partida.jogadores.reduce((acc, p) => acc + p.cartas.length, 0)),
          rounds: partida.ordemJogadores.length,
        }}
      />
      <footer className="mt-12 text-xs text-gray-400">Desenvolvido com Next.js, TypeScript e Tailwind CSS</footer>
    </main>
  );
}

/* Adicione ao final do arquivo para responsividade e efeito leque */
/* .card-baralho { transition: box-shadow 0.2s, border-color 0.2s, transform 0.2s; } */ 