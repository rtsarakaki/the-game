import { useEffect, useRef } from "react";

export function useAudioFeedback(status: string | undefined) {
  const defeatPlayedRef = useRef(false);
  useEffect(() => {
    if (!status) return;
    if ((status === 'defeat' || status === 'derrota') && !defeatPlayedRef.current) {
      const audio = new Audio('/sounds/lose.mp3');
      audio.play();
      defeatPlayedRef.current = true;
    }
    if (status !== 'defeat' && status !== 'derrota') {
      defeatPlayedRef.current = false;
    }
  }, [status]);
} 