import { useEffect, useRef } from "react";
import { useUserInteraction } from '@/context/UserInteractionContext';

export function useAudioFeedback(status: string | undefined) {
  const defeatPlayedRef = useRef(false);
  const hasUserInteracted = useUserInteraction();
  useEffect(() => {
    if (!status) return;
    if ((status === 'defeat' || status === 'derrota') && !defeatPlayedRef.current && hasUserInteracted) {
      const audio = new Audio('/sounds/lose.mp3');
      audio.play();
      defeatPlayedRef.current = true;
    }
    if (status !== 'defeat' && status !== 'derrota') {
      defeatPlayedRef.current = false;
    }
  }, [status, hasUserInteracted]);
} 