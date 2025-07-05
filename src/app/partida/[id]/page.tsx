"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import GameBoard from "@/components/GameBoard";
import { CopyIcon, EmailIcon, WhatsAppIcon, CopyAllIcon, CheckIcon, OpenInNewTabIcon, IncognitoIcon } from "@/components/ShareIcons";
import React from "react";
import { shuffleDeck } from "@/domain/shuffleDeck";
import { dealCards } from "@/domain/dealCards";
import { useGameSocket } from '@/hooks/useGameSocket';
import type { IGame } from '@/domain/types';
import PlayerLinksTip from '@/components/PlayerLinksTip';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params ? (Array.isArray(params.id) ? params.id[0] : params.id) : '';
  
  const [game, setGame] = useState<IGame | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restarting, setRestarting] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  useGameSocket({
    id: gameId,
    playerId: 'observer',
    setGame,
    setPlayer: () => {},
  });

  // Initial fetch of the game
  useEffect(() => {
    if (!gameId) return;
    console.log('[DEBUG] Starting initial fetch of game', gameId);
    fetch(`/api/partida?gameId=${gameId}`)
      .then(res => {
        console.log('[DEBUG] Initial fetch response', res);
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        console.log('[DEBUG] Data received from initial fetch', data);
        setGame(data);
        setError(null);
      })
      .catch((err) => {
        console.error('[DEBUG] Error loading game', err);
        setError('Error loading game');
      });
  }, [gameId]);

  // Debug for WebSocket events
  useEffect(() => {
    if (!game) return;
    console.log('[DEBUG] Game state updated via WebSocket or fetch', game);
  }, [game]);

  // Early return if no gameId
  if (!gameId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-4">
        <div className="bg-red-100 border border-red-400 rounded-lg p-6 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-700 mb-2">Erro</h1>
          <p className="text-red-600 mb-4">ID da partida não encontrado</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  const handleRestart = async () => {
    if (!game) return;
    setRestarting(true);
    try {
      // Embaralhar e redistribuir cartas
      const shuffled = shuffleDeck(Array.from({ length: 98 }, (_, i) => i + 2));
      const { players, deck } = dealCards(shuffled, game.players.map(j => j.name), 6);
      const ordemJogadores = game.players.map(j => j.id);
      const newGame = {
        ...game,
        timestamp: Date.now(),
        players: game.players.map((j, idx) => ({
          ...j,
          cards: players[idx].cards,
        })),
        piles: {
          asc1: [1],
          asc2: [1],
          desc1: [100],
          desc2: [100],
        },
        baralho: deck,
        ordemJogadores,
        currentPlayer: ordemJogadores[0],
        status: "em_andamento",
      };
      const res = await fetch("/api/partida", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, game: newGame }),
      });
      if (!res.ok) throw new Error("Erro ao reiniciar partida");
      // Buscar o estado atualizado imediatamente após reiniciar
      const data = await fetch(`/api/partida?gameId=${gameId}`).then(r => r.json());
      setGame(data);
    } catch (err) {
      setError("Erro ao reiniciar partida");
      console.error(err);
    } finally {
      setRestarting(false);
    }
  };

  const copyToClipboard = async (text: string, linkId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLinkId(linkId);
      setTimeout(() => setCopiedLinkId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareViaEmail = (playerName: string, url: string) => {
    const subject = encodeURIComponent(`The Game - Convite para Partida`);
    const body = encodeURIComponent(
      `Olá ${playerName}!\n\n` +
      `Você foi convidado(a) para jogar The Game!\n\n` +
      `Clique no link abaixo para entrar na partida:\n${url}\n\n` +
      `Divirta-se! 🎮`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaWhatsApp = (playerName: string, url: string) => {
    const message = encodeURIComponent(
      `🎮 *The Game - Convite para Partida*\n\n` +
      `Olá ${playerName}!\n\n` +
      `Você foi convidado(a) para jogar The Game!\n\n` +
      `Clique no link para entrar na partida:\n${url}\n\n` +
      `Divirta-se! 🎯`
    );
    window.open(`https://wa.me/?text=${message}`);
  };

  const copyAllLinks = () => {
    if (!game) return;
    
    const allLinks = game.players.map((player, index) => 
      `Jogador ${index + 1}: ${window.location.origin}/partida/${gameId}/player/${player.id}`
    ).join('\n');
    
    copyToClipboard(allLinks, 'all-links');
  };

  const getStatusDisplay = () => {
    if (!game) return "";
    
    switch (game.status) {
      case "esperando_jogadores":
        return "⏳ Aguardando Jogadores";
      case "em_andamento":
        return "🎮 Em Andamento";
      case "victory":
        return "🏆 Vitória!";
      case "defeat":
        return "💀 Derrota";
      default:
        return game.status;
    }
  };

  const getCurrentPlayerName = () => {
    if (!game) return "";
    const currentPlayer = game.players.find(p => p.id === game.currentPlayer);
    return currentPlayer?.name || "Jogador sem nome";
  };

  const getTimeRemaining = () => {
    if (!game) return "";
    const now = Date.now();
    const elapsed = now - (game.timestamp ?? 0);
    const remaining = (24 * 60 * 60 * 1000) - elapsed; // 24 hours - elapsed
    
    if (remaining <= 0) return "Expirado";
    
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    return `${hours}h ${minutes}m restantes`;
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-4">
        <div className="bg-red-100 border border-red-400 rounded-lg p-6 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-700 mb-2">Erro</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-4">
        <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-6 max-w-md text-center">
          <h1 className="text-2xl font-bold text-yellow-700 mb-2">Partida não encontrada</h1>
          <p className="text-yellow-600 mb-4">Verifique o link ou tente novamente.</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  const playerLinks = game.players.map((player, index) => ({
    id: player.id,
    name: player.name || `Jogador ${index + 1}`,
    url: `${window.location.origin}/partida/${gameId}/player/${player.id}`,
    hasName: !!player.name?.trim(),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">The Game - Partida {gameId.slice(0, 8)}</h1>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                  {getStatusDisplay()}
                </span>
                {game.status === "em_andamento" && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
                    Turno: {getCurrentPlayerName()}
                  </span>
                )}
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                  {getTimeRemaining()}
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/")}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                🏠 Início
              </button>
              <button
                onClick={handleRestart}
                disabled={restarting}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
              >
                {restarting ? "Reiniciando..." : "🔄 Reiniciar Partida"}
              </button>
            </div>
          </div>
        </div>

        {/* Player Links */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Links dos Jogadores</h2>
            <button
              onClick={copyAllLinks}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition flex items-center gap-1"
            >
              {copiedLinkId === 'all-links' ? (
                <>
                  <CheckIcon size={14} className="text-white" />
                  Copiados!
                </>
              ) : (
                <>
                  <CopyAllIcon size={14} className="text-white" />
                  Copiar Todos
                </>
              )}
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {playerLinks.map((player, index) => (
              <div
                key={player.id}
                className={`p-4 rounded-lg border-2 ${
                  player.hasName
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">
                      {player.hasName ? player.name : `Jogador ${index + 1}`}
                    </span>
                    {player.hasName ? (
                      <span className="text-green-600 text-xs bg-green-100 px-2 py-1 rounded-full">✓ Conectado</span>
                    ) : (
                      <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded-full">⏳ Aguardando</span>
                    )}
                  </div>
                </div>
                
                <div className="mb-3">
                  <input
                    type="text"
                    value={player.url}
                    readOnly
                    className="w-full p-2 text-xs bg-gray-100 border rounded font-mono text-gray-600"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(player.url, player.id)}
                    className="p-2 bg-blue-100 hover:bg-blue-200 rounded transition flex items-center justify-center"
                    title="Copiar link"
                    aria-label="Copiar link"
                  >
                    {copiedLinkId === player.id ? (
                      <CheckIcon size={16} className="text-blue-600" />
                    ) : (
                      <CopyIcon size={16} className="text-blue-600" />
                    )}
                  </button>
                  <button
                    onClick={() => window.open(player.url, '_blank')}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded transition flex items-center justify-center"
                    title="Abrir em nova aba"
                    aria-label="Abrir em nova aba"
                  >
                    <OpenInNewTabIcon size={16} className="text-gray-700" />
                  </button>
                  <button
                    onClick={() => {
                      copyToClipboard(player.url, player.id);
                      alert('Link copiado! Abra manualmente uma aba anônima e cole o link.');
                    }}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded transition flex items-center justify-center"
                    title="Abrir em aba anônima (copiar link)"
                    aria-label="Abrir em aba anônima"
                  >
                    <IncognitoIcon size={16} className="text-gray-700" />
                  </button>
                  <button
                    onClick={() => shareViaEmail(player.hasName ? player.name : `Jogador ${index + 1}`, player.url)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded transition flex items-center justify-center"
                    title="Compartilhar por Email"
                    aria-label="Compartilhar por Email"
                  >
                    <EmailIcon size={16} className="text-gray-700" />
                  </button>
                  <button
                    onClick={() => shareViaWhatsApp(player.hasName ? player.name : `Jogador ${index + 1}`, player.url)}
                    className="p-2 bg-green-100 hover:bg-green-200 rounded transition flex items-center justify-center"
                    title="Compartilhar no WhatsApp"
                    aria-label="Compartilhar no WhatsApp"
                  >
                    <WhatsAppIcon size={16} className="text-green-700" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <PlayerLinksTip />
        </div>

        {/* Game Board */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Tabuleiro do Jogo</h2>
          <GameBoard 
            piles={game.piles}
            player={{ id: "observer", name: "Observador", cards: [] }} // Observer mode - no player interaction
            onPlay={() => {}} // No interaction for observers
            isCurrentPlayer={false} // Observers can't play
          />
          
          {game.status === "esperando_jogadores" && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <p className="text-blue-700 font-medium mb-2">
                Aguardando jogadores se conectarem...
              </p>
              <p className="text-blue-600 text-sm">
                Compartilhe os links acima para que os jogadores possam entrar na partida.
                O jogo iniciará automaticamente quando todos fornecerem seus nomes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 