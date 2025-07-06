import { useEffect, useRef } from "react";
import { useUserInteraction } from '@/context/UserInteractionContext';

function canPlayDefeatSoundNow(status: string | undefined, canPlayAudioByUserPolicy: boolean, defeatSoundPlayed: boolean) {
  return (
    (status === 'defeat' || status === 'derrota') &&
    !defeatSoundPlayed &&
    canPlayAudioByUserPolicy
  );
}

export function useAudioFeedback(status: string | undefined) {
  const defeatSoundPlayedRef = useRef(false);
  const canPlayAudioByUserPolicy = useUserInteraction();
  useEffect(() => {
    const shouldPlayDefeat = canPlayDefeatSoundNow(status, canPlayAudioByUserPolicy, defeatSoundPlayedRef.current);
    if (shouldPlayDefeat) {
      const audio = new Audio('/sounds/lose.mp3');
      audio.play();
      defeatSoundPlayedRef.current = true;
    }
    if (status !== 'defeat' && status !== 'derrota') {
      defeatSoundPlayedRef.current = false;
    }
  }, [status, canPlayAudioByUserPolicy]);
} 