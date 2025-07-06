import { useEffect } from 'react';
import type { IGame, IPlayer } from '@/domain/types';
import { isValidMove, PileType } from '@/domain/isValidMove';

interface UseGamePollingParams {
  id: string;
  playerId: string;
  setGame: (game: IGame) => void;
  setPlayer: (player: IPlayer | null) => void;
}

const GAME_POLLING_INTERVAL_MS = 2000;

function isGameDefeat(game: IGame): boolean {
  // Encontra o jogador atual
  const currentPlayer = game.players.find(p => p.id === game.currentPlayer);
  if (!currentPlayer) return false; // Não deveria acontecer, mas previne crash

  // Determina o número mínimo de jogadas obrigatórias
  const minRequiredPlays = game.deck.length === 0 ? 1 : 2;
  const currentTurnPlays = typeof game.currentTurnPlays === 'number' ? game.currentTurnPlays : 0;

  // Verifica se o jogador atual pode jogar alguma carta
  let canCurrentPlayerPlay = false;
  for (const cardValue of currentPlayer.cards) {
    for (const [pileKey, pileCards] of Object.entries(game.piles)) {
      const pileType: PileType = pileKey.startsWith('asc') ? 'asc' : 'desc';
      const topCardValue: number = pileCards[pileCards.length - 1];
      if (isValidMove(pileType, topCardValue, cardValue)) {
        canCurrentPlayerPlay = true;
        break;
      }
    }
    if (canCurrentPlayerPlay) break;
  }

  // Se não fez o mínimo de jogadas obrigatórias e não pode jogar, derrota
  if (currentTurnPlays < minRequiredPlays && !canCurrentPlayerPlay) {
    return true;
  }
  // Se já fez o mínimo, pode passar a vez (não é derrota)
  return false;
}

// Força o status de derrota localmente no frontend para feedback visual imediato
function setGameStatusToDefeatLocally(game: IGame): IGame {
  return { ...game, status: 'defeat' };
}

export function useGamePolling({
  id: gameId,
  playerId,
  setGame,
  setPlayer,
}: UseGamePollingParams) {
  useEffect(() => {
    // Pré-condição: IDs válidos
    const hasValidGameAndPlayerId = Boolean(gameId && playerId);
    if (!hasValidGameAndPlayerId) return;

    // Função de polling do estado do jogo
    const pollGameState = async () => {
      try {
        const response = await fetch(`/api/partida?gameId=${gameId}`);
        if (!response.ok) return;

        let gameFromServer: IGame = await response.json();

        // Checagem de status do jogo
        const isGameInProgress = gameFromServer.status === 'in_progress';
        let isGameDefeated = false;
        debugger;
        if (isGameInProgress) {
          isGameDefeated = isGameDefeat(gameFromServer);
          // Se o jogo está em andamento mas não há mais jogadas possíveis, força derrota
          if (isGameDefeated) {
            gameFromServer = setGameStatusToDefeatLocally(gameFromServer);
          }
        }
        if (['defeat', 'victory', 'in_progress'].includes(gameFromServer.status)) {
          debugger;
        }
        setGame(gameFromServer);

        // Busca o jogador correspondente ao playerId deste cliente na lista de jogadores do jogo
        const allPlayersInCurrentGame: IPlayer[] = gameFromServer.players;
        const playerIdOfThisClient: string = playerId;
        const playerWithMatchingId: IPlayer | undefined = allPlayersInCurrentGame.find((player) => player.id === playerIdOfThisClient);
        // Se não encontrar, define como null para indicar que o jogador não está na partida
        const playerRepresentingThisClient: IPlayer | null = playerWithMatchingId ?? null;
        // Atualiza o estado do jogador do cliente atual no React
        setPlayer(playerRepresentingThisClient);
      } catch {
        // Silencia erros de polling
      }
    };

    // Inicia o polling
    const intervalId = setInterval(pollGameState, GAME_POLLING_INTERVAL_MS);

    // Limpa o polling ao desmontar
    return () => clearInterval(intervalId);
  }, [gameId, playerId, setGame, setPlayer]);
} 