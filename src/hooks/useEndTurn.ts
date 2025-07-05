import { useState } from 'react';
import { fetchGame, updateGame } from '@/services/gameService';
import type { IGame, IPlayer } from '@/domain/types';

interface UseEndTurnParams {
  isMyTurn: boolean;
  game: IGame | null;
  player: IPlayer | null;
  playerId: string;
  playedThisTurn: number[];
  setGame: (game: IGame) => void;
  setPlayer: (player: IPlayer | null) => void;
  setPlayedThisTurn: (cards: number[]) => void;
}

function getReplenishedHand(player: IPlayer, deck: number[], maxHand = 6): { newHand: number[]; newDeck: number[] } {
  const newHand = [...player.cards];
  const newDeck = [...deck];
  while (newHand.length < maxHand && newDeck.length > 0) {
    newHand.push(newDeck.shift()!);
  }
  return { newHand, newDeck };
}

export function useEndTurn({ isMyTurn, game, player, playerId, playedThisTurn, setGame, setPlayer, setPlayedThisTurn }: UseEndTurnParams) {
  const [endTurnError, setEndTurnError] = useState<string | null>(null);

  const handleEndTurn = async () => {
    if (!isMyTurn || !game || !player) return;
    const minPlays = game.deck.length === 0 ? 1 : 2;
    const canStillPlay = player.cards.length > 0; // Simplificação: pode ser ajustado para lógica de jogada possível
    if (playedThisTurn.length < minPlays && canStillPlay) {
      setEndTurnError(`You must play at least ${minPlays} card(s) or have no possible moves.`);
      return;
    }
    setEndTurnError(null);
    const latestGame = await fetchGame(game.id);
    const updatedPlayers = latestGame.players.map(currentPlayer =>
      currentPlayer.id === player.id ? { ...currentPlayer, cards: player.cards } : currentPlayer
    );
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
      await updateGame(game.id, updated);
      const data = await fetchGame(game.id);
      setGame(data);
      setPlayer(data.players.find((currentPlayer: IPlayer) => currentPlayer.id === playerId) || null);
      setPlayedThisTurn([]);
    } catch {
      setEndTurnError('Unknown error ending turn.');
    }
  };

  return { handleEndTurn, endTurnError };
} 