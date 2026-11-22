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
  minimal?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenHowToPlay,
  onOpenSettings,
  onHomeClick,
  isMuted,
  onToggleMute,
  showHomeButton = false,
  minimal = false,
}) => {
  return (
    <header className="w-full max-w-lg mx-auto px-2 sm:px-4 py-2.5 flex items-center justify-between">
      {/* Brand & Home */}
      <div className="flex items-center gap-2">
        {showHomeButton && onHomeClick && (
          <button
            onClick={() => {
              soundManager.playClick();
              onHomeClick();
            }}
            aria-label="Back to home"
            className="w-10 h-10 rounded-2xl bg-white border-2 border-[#E2E8F0] shadow-[0_3px_0_#CBD5E1] active:translate-y-0.5 flex items-center justify-center text-[#25233A] hover:bg-gray-50 transition-all"
          >
            <Home className="w-5 h-5 text-[#6558E8]" />
          </button>
        )}

        {!minimal && (
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={onHomeClick}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6558E8] to-[#9186F8] flex items-center justify-center shadow-md shadow-[#6558E8]/25 text-white font-black text-lg">
              🎲
            </div>
            <span className="font-extrabold text-lg tracking-tight text-[#25233A] hidden sm:inline">
              Snakes &amp; Ladders
            </span>
          </div>
        )}
      </div>

      {/* Action shortcuts */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Sound toggle */}
        <button
          onClick={onToggleMute}
          aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
          className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all active:translate-y-0.5 ${
            isMuted
              ? 'bg-[#F1ECE4] border-[#DCD3C7] shadow-[0_3px_0_#DCD3C7] text-[#77758A]'
              : 'bg-white border-[#E2E8F0] shadow-[0_3px_0_#CBD5E1] text-[#6558E8] hover:bg-gray-50'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* How to Play */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenHowToPlay();
          }}
          aria-label="How to play"
          className="w-10 h-10 rounded-2xl bg-white border-2 border-[#E2E8F0] shadow-[0_3px_0_#CBD5E1] active:translate-y-0.5 flex items-center justify-center text-[#25233A] hover:bg-gray-50 transition-all"
        >
          <HelpCircle className="w-4 h-4 text-[#25233A]" />
        </button>

        {/* Settings */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenSettings();
          }}
          aria-label="Settings"
          className="w-10 h-10 rounded-2xl bg-white border-2 border-[#E2E8F0] shadow-[0_3px_0_#CBD5E1] active:translate-y-0.5 flex items-center justify-center text-[#25233A] hover:bg-gray-50 transition-all"
        >
          <Settings className="w-4 h-4 text-[#25233A]" />
        </button>
      </div>
    </header>
  );
};
