"use client";
import { use, useState, useEffect } from "react";
import { isValidMove, PileType } from '@/domain/isValidMove';
import GameEndOverlay from '@/components/GameEndOverlay';
import PlayerNameForm from '@/components/PlayerNameForm';
import Hand, { PilesType } from '@/components/Hand';
import Piles from '@/components/Piles';
import GameRules from '@/components/GameRules';
import TurnActions from '@/components/TurnActions';
import GameStatsPanel from '@/components/GameStatsPanel';
import { usePartidaSocket } from '@/hooks/usePartidaSocket';
import { useAudioFeedback } from '@/hooks/useAudioFeedback';
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice';
import { fetchPartida, updatePartida, replenishHand } from '@/services/partidaService';
import type { IPartida, IPlayer } from '@/domain/types';

export default function PlayerHandPage({ params }: { params: Promise<{ id: string; pid: string }> }) {
  const { id, pid } = use(params);
  const [partida, setPartida] = useState<IPartida | null>(null);
  const [player, setPlayer] = useState<IPlayer | null>(null);
  const [nomeInput, setNomeInput] = useState("");
  const [nomeLoading, setNomeLoading] = useState(false);
  const [nomeError, setNomeError] = useState<string | null>(null);
  const [draggedCard, setDraggedCard] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [playedThisTurn, setPlayedThisTurn] = useState<number[]>([]);
  const [endTurnError, setEndTurnError] = useState<string | null>(null);
  const [lastDrop, setLastDrop] = useState<string | null>(null);
  const [errorDrop, setErrorDrop] = useState<string | null>(null);
  const [gameStartNotification, setGameStartNotification] = useState(false);

  const isMyTurn = (partida?.status === "em_andamento" || partida?.status === "in_progress") && partida?.jogadorAtual === pid;
  const isTouchDevice = useIsTouchDevice();
  usePartidaSocket({ id, pid, setPartida, setPlayer, setGameStartNotification });
  useAudioFeedback(partida?.status);

  // Sempre sincroniza o player com a partida e pid
  useEffect(() => {
    if (!partida || !pid) return;
    const foundPlayer = partida.jogadores.find((j: IPlayer) => j.id === pid) || null;
    setPlayer(foundPlayer);
  }, [partida, pid]);

  // Debug: logar partida, pid, player e player.name
  useEffect(() => {
    console.log('[DEBUG] partida:', partida);
    console.log('[DEBUG] pid:', pid);
    console.log('[DEBUG] player:', player);
    if (player) {
      console.log('[DEBUG] player.name:', player.name);
    }
  }, [partida, pid, player]);

  // Fetch inicial da partida
  useEffect(() => {
    if (!id) return;
    fetch(`/api/partida?gameId=${id}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setPartida(data);
      });
  }, [id]);

  // Polling para atualização periódica do estado da partida (a cada 3 segundos)
  useEffect(() => {
    if (!id) return;
    const interval = setInterval(() => {
      fetch(`/api/partida?gameId=${id}`)
        .then(res => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(data => {
          setPartida(prev => {
            // Só atualiza se mudou
            if (JSON.stringify(prev) !== JSON.stringify(data)) {
              return data;
            }
            return prev;
          });
        })
        .catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, [id]);

  // Handlers
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNomeLoading(true);
    setNomeError(null);
    const name = nomeInput.trim();
    if (!name) {
      setNomeError("O nome não pode ser vazio.");
      setNomeLoading(false);
      return;
    }
    if (partida?.jogadores.some(j => j && j.name && j.name.toLowerCase() === name.toLowerCase())) {
      setNomeError("Este nome já está em uso por outro jogador.");
      setNomeLoading(false);
      return;
    }
    const updated = {
      ...partida!,
      jogadores: partida!.jogadores.map(j =>
        j.id === player!.id ? { ...j, name } : j
      ),
    };
    try {
      const res = await fetch("/api/partida", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: id, partida: updated }),
      });
      if (!res.ok) throw new Error();
      const data = await fetchPartida(id);
      setPartida(data);
      const updatedPlayer = data.jogadores.find((j: IPlayer) => j.id === player!.id);
      if (updatedPlayer) setPlayer(updatedPlayer);
      setNomeInput("");
    } catch {
      setNomeError("Erro ao salvar nome. Tente novamente.");
    } finally {
      setNomeLoading(false);
    }
  };

  const handlePlayCard = async (card: number, pileKey: keyof PilesType) => {
    if (!isMyTurn || !partida || !player) return;
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
    const updatedPlayers = partida.jogadores.map((j) =>
      j.id === player.id
        ? { ...j, cards: j.cards.filter((c) => c !== card), cartas: j.cards.filter((c) => c !== card) }
        : j
    );
    const updatedPiles = {
      ...partida.pilhas,
      [pileKey]: [...partida.pilhas[pileKey], card],
    };
    const remainingCards = updatedPlayers.find(j => j.id === player.id)?.cards || [];
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
      body: JSON.stringify({ gameId: id, partida: updated }),
    });
    const data = await fetchPartida(id);
    setPartida(data);
    setPlayer(data.jogadores.find((j: IPlayer) => j.id === pid) || null);
    setPlayedThisTurn((prev) => [...prev, card]);
    setDraggedCard(null);
    setDropTarget(null);
    setLastDrop(pileKey);
    setTimeout(() => setLastDrop(null), 500);
  };

  const handleEndTurn = async () => {
    if (!isMyTurn || !partida || !player) return;
    const minPlays = partida.baralho.length === 0 ? 1 : 2;
    if (playedThisTurn.length < minPlays) {
      setEndTurnError(`Você deve jogar pelo menos ${minPlays} carta${minPlays > 1 ? 's' : ''} neste turno.`);
      return;
    }
    setEndTurnError(null);
    // Repor cartas do jogador antes de passar a vez
    const { newHand, newDeck } = replenishHand(player, partida.baralho);
    const updatedPlayers = partida.jogadores.map(j =>
      j.id === player.id ? { ...j, cartas: newHand } : j
    );
    const idx = partida.ordemJogadores.indexOf(player.id);
    const nextIdx = (idx + 1) % partida.ordemJogadores.length;
    const nextPlayerId = partida.ordemJogadores[nextIdx];
    const updated = {
      ...partida,
      jogadores: updatedPlayers,
      baralho: newDeck,
      jogadorAtual: nextPlayerId,
    };
    await updatePartida(id, updated, true);
    const data = await fetchPartida(id);
    setPartida(data);
    setPlayer(data.jogadores.find((j: IPlayer) => j.id === pid) || null);
    setPlayedThisTurn([]);
  };

  const canDropCard = (card: number, pileKey: keyof PilesType) => {
    const pileType: PileType = pileKey.startsWith('asc') ? 'asc' : 'desc';
    const topCard = partida!.pilhas[pileKey][partida!.pilhas[pileKey].length - 1];
    return isValidMove(pileType, topCard, card);
  };

  const calculateCompletedRounds = () => {
    if (!partida || partida.status !== "em_andamento") return 0;
    const totalPlayers = partida.ordemJogadores.length;
    const currentPlayerIndex = partida.ordemJogadores.indexOf(partida.jogadorAtual);
    const initialCards = totalPlayers * 6;
    const currentCards = partida.jogadores.reduce((acc, p) => acc + (p && p.cards ? p.cards.length : 0), 0);
    const cardsPlayed = initialCards - currentCards;
    const averageCardsPerTurn = partida.baralho.length === 0 ? 1.5 : 2.2;
    const estimatedTurns = Math.floor(cardsPlayed / averageCardsPerTurn);
    let completedRounds = Math.floor(estimatedTurns / totalPlayers);
    if (currentPlayerIndex === 0 && estimatedTurns > 0) {
      completedRounds = Math.max(completedRounds, Math.floor((estimatedTurns - 1) / totalPlayers));
    }
    return Math.max(0, completedRounds);
  };

  if (!partida) {
    console.log('[DEBUG] Render: Partida não encontrada');
    return <div className="flex items-center justify-center min-h-screen text-red-500">Partida não encontrada.</div>;
  }
  if (!player) {
    console.log('[DEBUG] Render: Jogador não encontrado');
    return <div className="flex items-center justify-center min-h-screen text-red-500">Jogador não encontrado.</div>;
  }
  if (!player?.name) {
    console.log('[DEBUG] Render: PlayerNameForm');
    return (
      <PlayerNameForm
        value={nomeInput}
        onChange={setNomeInput}
        onSave={handleSaveName}
        loading={nomeLoading}
        error={nomeError}
      />
    );
  }

  return (
    <main className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-4">
      <h1 className="text-2xl font-bold text-white mb-2">{player.name || "Jogador"}</h1>
      <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-6 items-start">
        <aside className="lg:w-1/3 w-full mb-4 lg:mb-0">
          <GameRules variant="desktop" />
        </aside>
        <div className="bg-white/90 rounded-lg shadow p-6 w-full lg:w-2/3 flex flex-col gap-6">
          <section>
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Suas cartas</h2>
            <Hand
              cartas={player.cards || []}
              isMyTurn={isMyTurn}
              isTouchDevice={isTouchDevice}
              draggedCard={draggedCard}
              selectedCard={selectedCard}
              setDraggedCard={setDraggedCard}
              setSelectedCard={setSelectedCard}
              setErrorDrop={setErrorDrop}
            />
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Pilhas (topo)</h2>
            <Piles
              pilhas={partida.pilhas}
              isMyTurn={isMyTurn}
              isTouchDevice={isTouchDevice}
              draggedCard={draggedCard}
              selectedCard={selectedCard}
              setSelectedCard={setSelectedCard}
              setErrorDrop={setErrorDrop}
              handlePlayCard={handlePlayCard}
              canDropCard={canDropCard}
              dropTarget={dropTarget}
              setDropTarget={setDropTarget}
              lastDrop={lastDrop}
              errorDrop={errorDrop}
            />
          </section>
          <GameStatsPanel
            totalCardsPlayed={98 - (partida.baralho.length + partida.jogadores.reduce((acc, p) => acc + (p && p.cards ? p.cards.length : 0), 0))}
            cardsLeft={partida.baralho.length}
            playersLeft={partida.jogadores.filter(p => p && p.cards && p.cards.length > 0).length}
            rounds={calculateCompletedRounds()}
          />
          <TurnActions
            isMyTurn={isMyTurn}
            onEndTurn={handleEndTurn}
            endTurnError={endTurnError}
          />
        </div>
      </div>
      <div className="block lg:hidden w-full max-w-4xl mt-8">
        <GameRules variant="mobile" />
      </div>
      <GameEndOverlay
        status={partida.status}
        stats={{
          totalCardsPlayed: 98 - (partida.baralho.length + partida.jogadores.reduce((acc, p) => acc + (p && p.cards ? p.cards.length : 0), 0)),
          rounds: calculateCompletedRounds(),
        }}
      />
      <footer className="mt-12 text-xs text-gray-400">Desenvolvido com Next.js, TypeScript e Tailwind CSS</footer>
      {gameStartNotification && (
        <div className="fixed bottom-20 left-0 w-full flex justify-center">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <span>🎮</span>
            <span className="font-semibold">Jogo iniciado automaticamente! Boa sorte!</span>
          </div>
        </div>
      )}
    </main>
  );
} 