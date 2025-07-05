"use client";
import React, { use, useState, useEffect, useRef } from "react";
import { isValidMove, PileType } from '@/domain/isValidMove';
import GameEndOverlay from '@/components/GameEndOverlay';
import GameRules from '@/components/GameRules';
import TurnActions from '@/components/TurnActions';
import GameStatsPanel from '@/components/GameStatsPanel';
import { useGamePolling } from '@/hooks/useGamePolling';
import { useAudioFeedback } from '@/hooks/useAudioFeedback';
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice';
import { useGameLoader } from '@/hooks/useGameLoader';
import { usePlayerLoader } from '@/hooks/usePlayerLoader';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import NotFoundScreen from '@/components/NotFoundScreen';
import { useGameStats } from '@/hooks/useGameStats';
import PlayerHandSection from '@/components/PlayerHandSection';
import PilesSection from '@/components/PilesSection';
import type { PilesType } from '@/components/Piles';
import { usePlayCard } from '@/hooks/usePlayCard';
import { useEndTurn } from '@/hooks/useEndTurn';
import AppFooter from '@/components/AppFooter';
import SectionCard from '@/components/SectionCard';
import PlayerNameSection from '@/components/PlayerNameSection';
import { isMovePossible } from '@/domain/isMovePossible';

export default function PlayerHandPage({ params }: { params: Promise<{ id: string; pid: string }> }) {
  const { id: gameId, pid: playerId } = use(params);
  const [draggedCard, setDraggedCard] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [playedThisTurn, setPlayedThisTurn] = useState<number[]>([]);
  const [lastDrop, setLastDrop] = useState<string | null>(null);
  const [errorDrop, setErrorDrop] = useState<string | null>(null);

  const {
    game,
    setGame,
    error: gameError,
    loading: gameLoading,
  } = useGameLoader(gameId);

  const {
    player,
    setPlayer,
    error: playerError,
    loading: playerLoading,
  } = usePlayerLoader(game, playerId);

  const isMyTurn = (game?.status === "em_andamento" || game?.status === "in_progress") && game?.currentPlayer === playerId;
  const isTouchDevice = useIsTouchDevice();
  useGamePolling({ id: gameId, playerId, setGame, setPlayer });
  useAudioFeedback(game?.status);

  // Reset turnPlays e playedThisTurn ao receber um novo turno
  const prevPlayerRef = useRef<string | null>(null);
  useEffect(() => {
    if (isMyTurn && game?.currentPlayer !== prevPlayerRef.current) {
      setPlayedThisTurn([]);
      prevPlayerRef.current = game?.currentPlayer || null;
    }
  }, [isMyTurn, game?.currentPlayer]);

  const { handlePlayCard } = usePlayCard({
    isMyTurn,
    game,
    player,
    playerId,
    isValidMove,
    setGame,
    setPlayer,
  });

  const { handleEndTurn, endTurnError: endTurnErrorFromHook } = useEndTurn({
    isMyTurn,
    game,
    player,
    playerId,
    playedThisTurn,
    setGame,
    setPlayer,
    setPlayedThisTurn,
  });

  const canDropCard = (card: number, pileKey: keyof PilesType) => {
    const pileType: PileType = pileKey.startsWith('asc') ? 'asc' : 'desc';
    const topCard = (game!.piles as PilesType)[pileKey][(game!.piles as PilesType)[pileKey].length - 1];
    return isValidMove(pileType, topCard, card);
  };

  const gameStats = useGameStats(game);

  const canStillPlay = player && game ? isMovePossible(player, game.piles as PilesType) : false;

  const currentPlayerName = game?.players.find(p => p.id === game.currentPlayer)?.name;

  // Wrapper para passar a vez, sem reset local imediato
  const handleEndTurnWithReset = async () => {
    await handleEndTurn();
  };

  if (gameLoading || playerLoading) {
    return <LoadingScreen message="Loading game..." />;
  }
  if (gameError) {
    return <ErrorScreen title="Error" message={gameError} actionLabel="Back to Home" onAction={() => window.location.assign('/')} />;
  }
  if (playerError) {
    return <NotFoundScreen onAction={() => window.location.assign('/')} />;
  }
  if (!game) {
    return <NotFoundScreen onAction={() => window.location.assign('/')} />;
  }
  if (!player) {
    return <NotFoundScreen onAction={() => window.location.assign('/')} />;
  }
  if (!player?.name) {
    return <PlayerNameSection game={game} player={player} setGame={setGame} setPlayer={setPlayer} />;
  }

  return (
    <main className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-4">
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
        {player.name || "Player"}
        {isMyTurn && (
          <span className="animate-pulse text-base font-bold text-green-400 drop-shadow">Sua Vez de Jogar!</span>
        )}
      </h1>
      <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-6 items-start">
        <aside className="lg:w-1/3 w-full mb-4 lg:mb-0">
          <GameRules variant="desktop" />
        </aside>
        <SectionCard className="bg-white/90 w-full lg:w-2/3 flex flex-col gap-6 p-6">
          <PlayerHandSection
            cards={player.cards || []}
            isMyTurn={isMyTurn}
            isTouchDevice={isTouchDevice}
            draggedCard={draggedCard}
            selectedCard={selectedCard}
            setDraggedCard={setDraggedCard}
            setSelectedCard={setSelectedCard}
            setErrorDrop={setErrorDrop}
          />
          <PilesSection
            piles={game.piles as PilesType}
            isMyTurn={isMyTurn}
            isTouchDevice={isTouchDevice}
            draggedCard={draggedCard}
            selectedCard={selectedCard}
            setSelectedCard={setSelectedCard}
            setErrorDrop={setErrorDrop}
            handlePlayCard={async (card, pileKey) => {
              await handlePlayCard(card, pileKey);
              setPlayedThisTurn((prev) => [...prev, card]);
              setDraggedCard(null);
              setDropTarget(null);
              setLastDrop(pileKey);
              setTimeout(() => setLastDrop(null), 500);
            }}
            canDropCard={canDropCard}
            dropTarget={dropTarget}
            setDropTarget={setDropTarget}
            lastDrop={lastDrop}
            errorDrop={errorDrop}
          />
          <div className="flex flex-col-reverse gap-4 lg:flex-col">
            <div className="flex flex-col gap-1">
              <TurnActions
                isMyTurn={isMyTurn}
                onEndTurn={handleEndTurnWithReset}
                endTurnError={canStillPlay ? endTurnErrorFromHook : null}
              />
            </div>
            <GameStatsPanel
              cardsLeft={gameStats.cardsLeft}
              currentPlayerName={currentPlayerName}
              gameStatus={game.status}
            />
          </div>
        </SectionCard>
      </div>
      <div className="block lg:hidden w-full max-w-4xl mt-8">
        <GameRules variant="mobile" />
      </div>
      {['victory', 'defeat', 'vitoria', 'derrota'].includes(game.status) && (
        <GameEndOverlay
          status={game.status}
          stats={{
            totalCardsPlayed: gameStats.totalCardsPlayed,
            rounds: gameStats.rounds,
          }}
        />
      )}
      <AppFooter />
    </main>
  );
} 