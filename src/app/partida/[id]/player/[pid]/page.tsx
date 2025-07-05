"use client";
import React, { use, useState, useEffect } from "react";
import { isValidMove, PileType } from '@/domain/isValidMove';
import { isMovePossible } from '@/domain/isMovePossible';
import GameEndOverlay from '@/components/GameEndOverlay';
import PlayerNameForm from '@/components/PlayerNameForm';
import Hand, { PilesType } from '@/components/Hand';
import Piles from '@/components/Piles';
import GameRules from '@/components/GameRules';
import TurnActions from '@/components/TurnActions';
import GameStatsPanel from '@/components/GameStatsPanel';
import { useGameSocket } from '@/hooks/useGameSocket';
import { useGamePolling } from '@/hooks/useGamePolling';
import { useAudioFeedback } from '@/hooks/useAudioFeedback';
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice';
import { fetchGame, updateGame } from '@/services/gameService';
import { playCard } from '@/services/playCardService';
import type { IGame, IPlayer } from '@/domain/types';
import AppFooter from '@/components/AppFooter';
import SectionCard from '@/components/SectionCard';

type BackendError = Error & {
  debug?: unknown;
  stack?: string;
};

// Utility to replenish hand locally
function getReplenishedHand(player: IPlayer, deck: number[], maxHand = 6): { newHand: number[]; newDeck: number[] } {
  const newHand = [...player.cards];
  const newDeck = [...deck];
  while (newHand.length < maxHand && newDeck.length > 0) {
    newHand.push(newDeck.shift()!);
  }
  return { newHand, newDeck };
}

export default function PlayerHandPage({ params }: { params: Promise<{ id: string; pid: string }> }) {
  const { id, pid } = use(params);
  const [game, setGame] = useState<IGame | null>(null);
  const [player, setPlayer] = useState<IPlayer | null>(null);
  const [nomeInput, setNomeInput] = useState("");
  const [nomeLoading, setNomeLoading] = useState(false);
  const [nomeError, setNomeError] = useState<string | null>(null);
  const [draggedCard, setDraggedCard] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [playedThisTurn, setPlayedThisTurn] = useState<number[]>([]);
  const [endTurnError, setEndTurnError] = useState<React.ReactNode | null>(null);
  const [lastDrop, setLastDrop] = useState<string | null>(null);
  const [errorDrop, setErrorDrop] = useState<string | null>(null);
  const [gameStartNotification, setGameStartNotification] = useState(false);
  const [turnPlays, setTurnPlays] = useState(0);

  const isMyTurn = (game?.status === "em_andamento" || game?.status === "in_progress") && game?.currentPlayer === pid;
  const isTouchDevice = useIsTouchDevice();
  useGameSocket({ id, playerId: pid, setGame, setPlayer, setGameStartNotification });
  useGamePolling({ id, playerId: pid, setGame, setPlayer });
  useAudioFeedback(game?.status);

  // Sempre sincroniza o player com a partida e pid
  useEffect(() => {
    if (!game || !pid) return;
    const foundPlayer = game.players.find((j: IPlayer) => j.id === pid) || null;
    setPlayer(foundPlayer);
  }, [game, pid]);

  // Debug: logar partida, pid, player e player.name
  useEffect(() => {
    console.log('[DEBUG] game:', game);
    console.log('[DEBUG] pid:', pid);
    console.log('[DEBUG] player:', player);
    if (player) {
      console.log('[DEBUG] player.name:', player.name);
    }
  }, [game, pid, player]);

  // Fetch inicial da partida
  useEffect(() => {
    if (!id) return;
    fetch(`/api/partida?gameId=${id}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setGame(data);
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
          setGame(prev => {
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

  // Sincroniza jogadasTurnoAtual do backend com o estado local
  useEffect(() => {
    if (game && typeof game.currentTurnPlays === 'number') {
      setTurnPlays(game.currentTurnPlays);
    }
  }, [game]);

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
    if (game?.players.some(j => j && j.name && j.name.toLowerCase() === name.toLowerCase())) {
      setNomeError("Este nome já está em uso por outro jogador.");
      setNomeLoading(false);
      return;
    }
    const updated = {
      ...game!,
      players: game!.players.map(j =>
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
      const data = await fetchGame(id);
      setGame(data);
      const updatedPlayer = data.players.find((j: IPlayer) => j.id === player!.id);
      if (updatedPlayer) setPlayer(updatedPlayer);
      setNomeInput("");
    } catch {
      setNomeError("Erro ao salvar nome. Tente novamente.");
    } finally {
      setNomeLoading(false);
    }
  };

  const handlePlayCard = async (card: number, pileKey: keyof PilesType) => {
    const result = await playCard({
      isMyTurn,
      game,
      player,
      card,
      pileKey,
      playerId: pid,
      fetchGame,
      isValidMove,
      id,
    });
    if (result.error) {
      setEndTurnError(result.error === 'Invalid move for this pile!' ? 'Jogada inválida para esta pilha!' : result.error);
      if (result.error === 'Invalid move for this pile!') {
        const audio = new Audio('/sounds/error.mp3');
        audio.play();
        setDraggedCard(null);
        setDropTarget(null);
      }
      return;
    }
    setEndTurnError(null);
    if (result.updatedGame) setGame(result.updatedGame);
    if (result.updatedPlayer) setPlayer(result.updatedPlayer);
    setPlayedThisTurn((prev) => [...prev, card]);
    setDraggedCard(null);
    setDropTarget(null);
    setLastDrop(pileKey);
    setTimeout(() => setLastDrop(null), 500);
  };

  const handleEndTurn = async () => {
    if (!isMyTurn || !game || !player) return;
    const minPlays = game.deck.length === 0 ? 1 : 2;
    const canStillPlay = isMovePossible(player, game.piles);
    if (playedThisTurn.length < minPlays && canStillPlay) {
      setEndTurnError(`You must play at least ${minPlays} card(s) or have no possible moves.`);
      return;
    }
    setEndTurnError(null);
    // Fetch the latest game state before ending the turn
    const latestGame = await fetchGame(id);
    // Use the local player's state to ensure correct cards
    const updatedPlayers = latestGame.players.map(currentPlayer =>
      currentPlayer.id === player.id ? { ...currentPlayer, cards: player.cards } : currentPlayer
    );
    // Replenish player's hand before passing the turn
    const { newHand, newDeck } = getReplenishedHand({ ...player, cards: player.cards }, latestGame.deck);
    const finalPlayers = updatedPlayers.map(currentPlayer =>
      currentPlayer.id === player.id ? { ...currentPlayer, cards: newHand } : currentPlayer
    );
    const idx = latestGame.playerOrder.indexOf(player.id);
    const nextIdx = (idx + 1) % latestGame.playerOrder.length;
    const nextPlayerId = latestGame.playerOrder[nextIdx];
    const updated = {
      ...latestGame,
      players: finalPlayers,
      deck: newDeck,
      currentPlayer: nextPlayerId,
    };
    try {
      await updateGame(id, updated);
      // Always fetch the updated game state from the backend after ending the turn
      const data = await fetchGame(id);
      setGame(data);
      setPlayer(data.players.find((currentPlayer: IPlayer) => currentPlayer.id === pid) || null);
      setPlayedThisTurn([]);
    } catch (err: unknown) {
      function isBackendError(e: unknown): e is BackendError {
        return typeof e === 'object' && e !== null && 'message' in e;
      }
      if (isBackendError(err)) {
        setEndTurnError(
          <>
            <div>{String(err.message)}</div>
            {err.debug ? (
              <pre style={{ fontSize: 10, color: 'gray', background: '#f8f8f8', padding: 8 }}>
                {JSON.stringify(err.debug, null, 2)}
              </pre>
            ) : null}
            {err.stack ? (
              <pre style={{ fontSize: 10, color: 'red', background: '#fff0f0', padding: 8 }}>
                {String(err.stack)}
              </pre>
            ) : null}
          </>
        );
      } else {
        setEndTurnError('Erro desconhecido ao encerrar turno.');
      }
    }
  };

  const canDropCard = (card: number, pileKey: keyof PilesType) => {
    const pileType: PileType = pileKey.startsWith('asc') ? 'asc' : 'desc';
    const topCard = game!.piles[pileKey][game!.piles[pileKey].length - 1];
    return isValidMove(pileType, topCard, card);
  };

  const calculateCompletedRounds = () => {
    if (!game || game.status !== "em_andamento") return 0;
    if (typeof game.completedRounds === 'number') return game.completedRounds;
    // fallback legacy calculation
    const totalPlayers = game.playerOrder.length;
    const currentPlayerIndex = game.playerOrder.indexOf(game.currentPlayer);
    const initialCards = totalPlayers * 6;
    const currentCards = game.players.reduce((acc, currentPlayer) => acc + (currentPlayer && currentPlayer.cards ? currentPlayer.cards.length : 0), 0);
    const cardsPlayed = initialCards - currentCards;
    const averageCardsPerTurn = game.deck.length === 0 ? 1.5 : 2.2;
    const estimatedTurns = Math.floor(cardsPlayed / averageCardsPerTurn);
    let completedRounds = Math.floor(estimatedTurns / totalPlayers);
    if (currentPlayerIndex === 0 && estimatedTurns > 0) {
      completedRounds = Math.max(completedRounds, Math.floor((estimatedTurns - 1) / totalPlayers));
    }
    return Math.max(0, completedRounds);
  };

  if (!game) {
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
        <SectionCard className="bg-white/90 w-full lg:w-2/3 flex flex-col gap-6 p-6">
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
              pilhas={game.piles}
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
          <div className="flex flex-col-reverse gap-4 lg:flex-col">
            <GameStatsPanel
              totalCardsPlayed={98 - (game.deck.length + game.players.reduce((acc, p) => acc + (p && p.cards ? p.cards.length : 0), 0))}
              cardsLeft={game.deck.length}
              playersLeft={game.players.filter(p => p && p.cards && p.cards.length > 0).length}
              rounds={calculateCompletedRounds()}
            />
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 mb-1">Jogadas neste turno: <span className="font-semibold">{turnPlays}</span></span>
              <TurnActions
                isMyTurn={isMyTurn}
                onEndTurn={handleEndTurn}
                endTurnError={endTurnError}
              />
            </div>
          </div>
        </SectionCard>
      </div>
      <div className="block lg:hidden w-full max-w-4xl mt-8">
        <GameRules variant="mobile" />
      </div>
      <GameEndOverlay
        status={game.status}
        stats={{
          totalCardsPlayed: 98 - (game.deck.length + game.players.reduce((acc, p) => acc + (p && p.cards ? p.cards.length : 0), 0)),
          rounds: calculateCompletedRounds(),
        }}
      />
      <AppFooter />
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