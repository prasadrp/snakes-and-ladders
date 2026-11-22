'use client';

import { useState, useEffect, useCallback } from 'react';
import { soundManager } from '@/lib/audio/sound';
import { getPreferences, savePreferences } from '@/lib/storage/preferences';

export function useSound() {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.6);

  useEffect(() => {
    const prefs = getPreferences();
    setIsMuted(!prefs.soundEnabled);
    setVolumeState(prefs.soundVolume);
    soundManager.setMuted(!prefs.soundEnabled);
    soundManager.setVolume(prefs.soundVolume);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      soundManager.setMuted(next);
      savePreferences({ soundEnabled: !next });
      if (!next) {
        soundManager.playClick();
      }
      return next;
    });
  }, []);

  const setVolume = useCallback((val: number) => {
    setVolumeState(val);
    soundManager.setVolume(val);
    savePreferences({ soundVolume: val });
  }, []);

  return {
    isMuted,
    volume,
    toggleMute,
    setVolume,
    playClick: () => soundManager.playClick(),
    playDiceRoll: () => soundManager.playDiceRoll(),
    playStep: () => soundManager.playStep(),
    playLadder: () => soundManager.playLadder(),
    playSnake: () => soundManager.playSnake(),
    playVictory: () => soundManager.playVictory(),
  };
}
