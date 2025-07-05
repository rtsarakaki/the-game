"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { useGameSocket } from '@/hooks/useGameSocket';
import { restartGame } from '@/services/gameService';
import { useGameLoader } from '@/hooks/useGameLoader';
import { usePlayerLinks } from '@/hooks/usePlayerLinks';
import { useGameStatusDisplay } from '@/hooks/useGameStatusDisplay';
import { useShareActions } from '@/hooks/useShareActions';
import GameHeader from '@/components/GameHeader';
import PlayerLinksPanel from '@/components/PlayerLinksPanel';
import ErrorScreen from '@/components/ErrorScreen';
import NotFoundScreen from '@/components/NotFoundScreen';
import GameBoardSection from '@/components/GameBoardSection';
import LoadingScreen from '@/components/LoadingScreen';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params ? (Array.isArray(params.id) ? params.id[0] : params.id) : '';
  const [restarting, setRestarting] = useState(false);

  const {
    game,
    error,
    setGame,
    setError,
    loading,
  } = useGameLoader(gameId);

  useGameSocket({
    id: gameId,
    playerId: 'observer',
    setGame,
    setPlayer: () => {},
  });

  const playerLinks = usePlayerLinks(game, gameId);
  const { getStatusDisplay, getCurrentPlayerName, getTimeRemaining } = useGameStatusDisplay(game);
  const {
    copiedLinkId: sharedCopiedLinkId,
    copyToClipboard,
    shareViaEmail,
    shareViaWhatsApp,
    copyAllLinks,
  } = useShareActions();

  // Early return if no gameId
  if (!gameId) {
    return (
      <ErrorScreen
        title="Error"
        message="Game ID not found"
        actionLabel="Back to Home"
        onAction={() => router.push("/")}
      />
    );
  }

  const handleRestart = async () => {
    if (!game) return;
    setRestarting(true);
    try {
      const updatedGame = await restartGame(game);
      setGame(updatedGame);
    } catch {
      setError("Error restarting game");
    } finally {
      setRestarting(false);
    }
  };

  const navigateToHomePage = () => {
    router.push("/");
  };

  if (error) {
    return (
      <ErrorScreen
        title="Error"
        message={error}
        actionLabel="Back to Home"
        onAction={navigateToHomePage}
      />
    );
  }

  if (loading) {
    return <LoadingScreen message="Loading game..." />;
  }

  if (!game) {
    return <NotFoundScreen onAction={navigateToHomePage} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-4">
      <div className="max-w-7xl mx-auto">
        <GameHeader
          gameId={gameId}
          statusDisplay={getStatusDisplay()}
          currentPlayerName={getCurrentPlayerName()}
          timeRemaining={getTimeRemaining()}
          onRestart={handleRestart}
          onHome={navigateToHomePage}
          restarting={restarting}
          gameStatus={game.status}
        />

        <PlayerLinksPanel
          playerLinks={playerLinks}
          copiedLinkId={sharedCopiedLinkId}
          onCopy={copyToClipboard}
          onEmail={shareViaEmail}
          onWhatsApp={shareViaWhatsApp}
          onCopyAll={() => copyAllLinks(playerLinks)}
        />

        {/* Game Board */}
        <GameBoardSection
          title="Game Board"
          status={getStatusDisplay()}
          piles={game.piles}
          player={{ id: "observer", name: "Observer", cards: [] }}
          onPlay={() => {}}
          isCurrentPlayer={false}
          showWaitingInfo={game.status === "esperando_jogadores"}
        />
      </div>
    </div>
  );
} 