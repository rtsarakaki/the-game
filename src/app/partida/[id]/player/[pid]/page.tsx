"use client";
import React, { use, useState } from "react";
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
import type { IGame, IPlayer } from '@/domain/types';
import { usePlayCard } from '@/hooks/usePlayCard';
import { useEndTurn } from '@/hooks/useEndTurn';
import AppFooter from '@/components/AppFooter';
import SectionCard from '@/components/SectionCard';
import PlayerNameSection from '@/components/PlayerNameSection';
import { isMovePossible } from '@/domain/isMovePossible';
import { useResetOnTurnChange } from '@/hooks/useResetOnTurnChange';

export default function PlayerHandPage({ params }: { params: Promise<{ id: string; pid: string }> }) {
  const { id: gameId, pid: playerId } = use(params);
  const [cardValueBeingDragged, setCardValueBeingDragged] = useState<number | null>(null);
  const [cardValueSelectedByCurrentPlayer, setCardValueSelectedByCurrentPlayer] = useState<number | null>(null);
  const [pileKeyTargetedForDrop, setPileKeyTargetedForDrop] = useState<string | null>(null);
  const [cardsPlayedByCurrentPlayerThisTurn, setCardsPlayedByCurrentPlayerThisTurn] = useState<number[]>([]);
  const [lastPileKeyCardWasDroppedOn, setLastPileKeyCardWasDroppedOn] = useState<string | null>(null);
  const [pileKeyWithDropError, setPileKeyWithDropError] = useState<string | null>(null);

  const {
    game: gameRaw,
    setGame,
    error: gameError,
    loading: gameLoading,
  } = useGameLoader(gameId);

  const {
    player: playerRaw,
    setPlayer,
    error: playerError,
    loading: playerLoading,
  } = usePlayerLoader(gameRaw, playerId);

  // Chame todos os hooks custom antes de qualquer return condicional
  const isTouchDevice = useIsTouchDevice();
  useGamePolling({ id: gameId, playerId, setGame, setPlayer });
  useAudioFeedback(gameRaw?.status);
  useResetOnTurnChange(
    gameRaw?.currentPlayer === playerId && gameRaw?.status === "in_progress",
    gameRaw?.currentPlayer || null,
    () => setCardsPlayedByCurrentPlayerThisTurn([])
  );
  const gameStats = useGameStats(gameRaw);
  const { handlePlayCard } = usePlayCard({
    isMyTurn: gameRaw?.currentPlayer === playerId && gameRaw?.status === "in_progress",
    game: gameRaw,
    player: playerRaw,
    playerId,
    isValidMove,
    setGame,
    setPlayer,
  });
  const { handleEndTurn, endTurnError: endTurnErrorFromHook } = useEndTurn({
    isMyTurn: gameRaw?.currentPlayer === playerId && gameRaw?.status === "in_progress",
    game: gameRaw,
    player: playerRaw,
    playerId,
    playedThisTurn: cardsPlayedByCurrentPlayerThisTurn,
    setGame,
    setPlayer,
    setPlayedThisTurn: setCardsPlayedByCurrentPlayerThisTurn,
  });

  if (gameLoading) {
    return <LoadingScreen message="Carregando dados do jogo..." />;
  }
  if (!gameRaw) {
    return <ErrorScreen title="Erro" message="Dados da partida não carregados (gameRaw nulo)." actionLabel="Voltar para o início" onAction={() => window.location.assign('/')} />;
  }
  if (playerLoading) {
    return <LoadingScreen message="Carregando dados do jogador..." />;
  }
  const isGameInProgress = gameRaw!.status === "in_progress";
  if (playerRaw === null && isGameInProgress) {
    return <ErrorScreen title="Erro" message="Jogador não encontrado na partida (playerRaw nulo)." actionLabel="Voltar para o início" onAction={() => window.location.assign('/')} />;
  }

  const iAmTheCurrentPlayer = gameRaw!.currentPlayer === playerId;
  const isMyTurn = iAmTheCurrentPlayer && isGameInProgress ;

  const CARD_DROP_FEEDBACK_TIMEOUT_MS = 500;

  const canCurrentCardBeDroppedOnPile = (card: number, pileKey: keyof PilesType) => {
    const pileType: PileType = pileKey.startsWith('asc') ? 'asc' : 'desc';
    const topCard = (gameRaw!.piles as PilesType)[pileKey][(gameRaw!.piles as PilesType)[pileKey].length - 1];
    return isValidMove(pileType, topCard, card);
  };

  const currentPlayerHasPossibleMoves = isMovePossible(playerRaw!, gameRaw!.piles as PilesType, isGameInProgress);

  const currentPlayerName = Array.isArray(gameRaw.players)
    ? gameRaw.players.find(p => p.id === gameRaw.currentPlayer)?.name
    : undefined;

  const GAME_OVER_STATUSES = ["victory", "defeat"];
  const isGameOver = GAME_OVER_STATUSES.includes(gameRaw?.status);

  // --- Handlers ---
  const handleEndTurnWithReset = async () => {
    await handleEndTurn();
  };

  function createHandlePlayCardOnPile({
    handlePlayCard,
    setCardsPlayedByCurrentPlayerThisTurn,
    setCardValueBeingDragged,
    setPileKeyTargetedForDrop,
    setLastPileKeyCardWasDroppedOn,
  }: {
    handlePlayCard: (card: number, pileKey: keyof PilesType) => Promise<void>;
    setCardsPlayedByCurrentPlayerThisTurn: React.Dispatch<React.SetStateAction<number[]>>;
    setCardValueBeingDragged: React.Dispatch<React.SetStateAction<number | null>>;
    setPileKeyTargetedForDrop: React.Dispatch<React.SetStateAction<string | null>>;
    setLastPileKeyCardWasDroppedOn: React.Dispatch<React.SetStateAction<string | null>>;
  }) {
    return async (card: number, pileKey: keyof PilesType) => {
      await handlePlayCard(card, pileKey);
      setCardsPlayedByCurrentPlayerThisTurn((prev) => [...prev, card]);
      setCardValueBeingDragged(null);
      setPileKeyTargetedForDrop(null);
      setLastPileKeyCardWasDroppedOn(pileKey);
      setTimeout(() => setLastPileKeyCardWasDroppedOn(null), CARD_DROP_FEEDBACK_TIMEOUT_MS);
    };
  }

  const handlePlayCardOnPile = createHandlePlayCardOnPile({
    handlePlayCard,
    setCardsPlayedByCurrentPlayerThisTurn,
    setCardValueBeingDragged,
    setPileKeyTargetedForDrop,
    setLastPileKeyCardWasDroppedOn,
  });

  function getPlayerPageGuardElement({
    gameLoading,
    playerLoading,
    gameError,
    playerError,
    game,
    player,
    setGame,
    setPlayer
  }: {
    gameLoading: boolean;
    playerLoading: boolean;
    gameError: string | null;
    playerError: string | null;
    game: IGame | null;
    player: IPlayer | null;
    setGame: (game: IGame) => void;
    setPlayer: (player: IPlayer | null) => void;
  }) {
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
    return null;
  }

  const guardElement = getPlayerPageGuardElement({
    gameLoading,
    playerLoading,
    gameError,
    playerError,
    game: gameRaw,
    player: playerRaw,
    setGame,
    setPlayer
  });
  if (guardElement) return guardElement;

  // Após o guard, garantimos que game e player não são null
  const game = gameRaw;
  const player = playerRaw;

  return (
    <main className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-4">
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
        {player?.name || "Player"}
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
            cards={player?.cards || []}
            isMyTurn={isMyTurn}
            isTouchDevice={isTouchDevice}
            draggedCard={cardValueBeingDragged}
            selectedCard={cardValueSelectedByCurrentPlayer}
            setDraggedCard={setCardValueBeingDragged}
            setSelectedCard={setCardValueSelectedByCurrentPlayer}
            setErrorDrop={setPileKeyWithDropError}
          />
          <PilesSection
            piles={game.piles as PilesType}
            isMyTurn={isMyTurn}
            isTouchDevice={isTouchDevice}
            draggedCard={cardValueBeingDragged}
            selectedCard={cardValueSelectedByCurrentPlayer}
            setSelectedCard={setCardValueSelectedByCurrentPlayer}
            setErrorDrop={setPileKeyWithDropError}
            handlePlayCard={handlePlayCardOnPile}
            canDropCard={canCurrentCardBeDroppedOnPile}
            dropTarget={pileKeyTargetedForDrop}
            setDropTarget={setPileKeyTargetedForDrop}
            lastDrop={lastPileKeyCardWasDroppedOn}
            errorDrop={pileKeyWithDropError}
          />
          <div className="flex flex-col-reverse gap-4 lg:flex-col">
            <div className="flex flex-col gap-1">
              <TurnActions
                isMyTurn={isMyTurn}
                onEndTurn={handleEndTurnWithReset}
                endTurnError={currentPlayerHasPossibleMoves ? endTurnErrorFromHook : null}
              />
            </div>
            <GameStatsPanel
              cardsLeft={gameStats.cardsLeft}
              currentPlayerName={currentPlayerName}
              gameStatus={game?.status}
            />
          </div>
        </SectionCard>
      </div>
      <div className="block lg:hidden w-full max-w-4xl mt-8">
        <GameRules variant="mobile" />
      </div>
      {isGameOver && (
        <GameEndOverlay
          status={game?.status}
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