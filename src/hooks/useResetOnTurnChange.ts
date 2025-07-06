import { useEffect, useRef } from "react";

export function useResetOnTurnChange(isMyTurn: boolean, currentPlayer: string | null, resetFn: () => void) {
  const prevPlayerRef = useRef<string | null>(null);

  useEffect(() => {
    if (isMyTurn && currentPlayer !== prevPlayerRef.current) {
      resetFn();
      prevPlayerRef.current = currentPlayer;
    }
  }, [isMyTurn, currentPlayer, resetFn]);
} 