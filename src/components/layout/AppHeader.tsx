'use client';

import React from 'react';
import { Volume2, VolumeX, HelpCircle, Settings, Home } from 'lucide-react';
import { soundManager } from '@/lib/audio/sound';

interface AppHeaderProps {
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
  onHomeClick?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  showHomeButton?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenHowToPlay,
  onOpenSettings,
  onHomeClick,
  isMuted,
  onToggleMute,
  showHomeButton = false,
}) => {
  return (
    <header className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-2.5 flex items-center justify-between">
      {/* Brand & Home */}
      <div className="flex items-center gap-2">
        {showHomeButton && onHomeClick && (
          <button
            onClick={() => {
              soundManager.playClick();
              onHomeClick();
            }}
            aria-label="Back to home"
            className="w-11 h-11 rounded-2xl bg-white border border-[#E9E2D9] flex items-center justify-center text-[#25233A] hover:bg-[#F9F5EF] active:scale-95 transition-all shadow-sm"
          >
            <Home className="w-5 h-5 text-[#6558E8]" />
          </button>
        )}

        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={onHomeClick}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6558E8] to-[#9186F8] flex items-center justify-center shadow-md shadow-[#6558E8]/25 text-white font-black text-xl">
            🎲
          </div>
          <span className="font-extrabold text-lg tracking-tight text-[#25233A] hidden sm:inline">
            Snakes &amp; Ladders
          </span>
        </div>
      </div>

      {/* Action shortcuts */}
      <div className="flex items-center gap-2">
        {/* Sound toggle */}
        <button
          onClick={onToggleMute}
          aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
          className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all active:scale-95 shadow-sm ${
            isMuted
              ? 'bg-[#F4E9D8] border-[#E9E2D9] text-[#77758A]'
              : 'bg-white border-[#E9E2D9] text-[#6558E8] hover:bg-[#F9F5EF]'
          }`}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        {/* How to Play */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenHowToPlay();
          }}
          aria-label="How to play"
          className="w-11 h-11 rounded-2xl bg-white border border-[#E9E2D9] flex items-center justify-center text-[#25233A] hover:bg-[#F9F5EF] active:scale-95 transition-all shadow-sm"
        >
          <HelpCircle className="w-5 h-5 text-[#25233A]" />
        </button>

        {/* Settings */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenSettings();
          }}
          aria-label="Settings"
          className="w-11 h-11 rounded-2xl bg-white border border-[#E9E2D9] flex items-center justify-center text-[#25233A] hover:bg-[#F9F5EF] active:scale-95 transition-all shadow-sm"
        >
          <Settings className="w-5 h-5 text-[#25233A]" />
        </button>
      </div>
    </header>
  );
};
