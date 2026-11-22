'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/common/Dialog';
import {
  getPreferences,
  savePreferences,
  AppPreferences,
  DICE_COLOR_OPTIONS,
  BOARD_THEMES,
  BoardTheme,
} from '@/lib/storage/preferences';
import { Volume2, VolumeX, Gauge, Palette, Check, Layout, Sparkles } from 'lucide-react';
import { soundManager } from '@/lib/audio/sound';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChanged?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsChanged,
}) => {
  const [prefs, setPrefs] = useState<AppPreferences>(getPreferences());

  useEffect(() => {
    if (isOpen) {
      setPrefs(getPreferences());
    }
  }, [isOpen]);

  const update = (partial: Partial<AppPreferences>) => {
    const updated = savePreferences(partial);
    setPrefs(updated);
    if (partial.soundEnabled !== undefined) {
      soundManager.setMuted(!partial.soundEnabled);
    }
    if (partial.soundVolume !== undefined) {
      soundManager.setVolume(partial.soundVolume);
    }
    onSettingsChanged?.();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      description="Personalize your board theme and dice style"
      maxWidth="md"
    >
      <div className="space-y-4 py-1 max-h-[70vh] overflow-y-auto pr-1">
        {/* Board Theme Selection */}
        <div className="p-3.5 rounded-2xl bg-[#FFF8EF] border border-[#E9E2D9] space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#E9E2D9] flex items-center justify-center text-[#6558E8] shadow-sm">
              <Layout className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-[#25233A] block">
                Board Style / Interface
              </span>
              <span className="text-xs text-[#77758A]">
                Switch between Vintage Paper and Modern boards
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            {BOARD_THEMES.map((theme) => {
              const isSelected = prefs.boardTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    update({ boardTheme: theme.id as BoardTheme });
                  }}
                  className={`p-2.5 rounded-2xl border-2 text-left transition-all active:scale-95 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white border-[#6558E8] shadow-md ring-2 ring-[#6558E8]/20'
                      : 'bg-white/80 border-[#E9E2D9] hover:bg-white hover:border-[#D5CDC2]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xl">{theme.previewIcon}</span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#6558E8] text-white flex items-center justify-center text-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-[#25233A] block">
                      {theme.name}
                    </span>
                    <span className="text-[10px] text-[#77758A] leading-tight line-clamp-2 mt-0.5">
                      {theme.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dice Dot Color Customization */}
        <div className="p-3.5 rounded-2xl bg-[#FFF8EF] border border-[#E9E2D9] space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#E9E2D9] flex items-center justify-center text-[#6558E8] shadow-sm">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-[#25233A] block">
                3D Dice Dot Color
              </span>
              <span className="text-xs text-[#77758A]">
                Customize the color of the dice pips
              </span>
            </div>
          </div>

          {/* Color palette chips */}
          <div className="grid grid-cols-7 gap-2 pt-1">
            {DICE_COLOR_OPTIONS.map((opt) => {
              const isSelected = prefs.diceDotColor === opt.hex;
              return (
                <button
                  key={opt.id}
                  type="button"
                  title={opt.name}
                  onClick={() => {
                    soundManager.playClick();
                    update({ diceDotColor: opt.hex });
                  }}
                  className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 ${opt.bgClass} shadow-sm active:scale-90 ${
                    isSelected
                      ? 'ring-3 ring-offset-2 ring-[#6558E8] scale-105'
                      : 'hover:scale-105 opacity-90'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sound toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF8EF] border border-[#E9E2D9]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#E9E2D9] flex items-center justify-center text-[#6558E8] shadow-sm">
              {prefs.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </div>
            <div>
              <span className="font-extrabold text-sm text-[#25233A] block">
                Sound Effects
              </span>
              <span className="text-xs text-[#77758A]">
                Dice rattle, token step &amp; fanfares
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => update({ soundEnabled: !prefs.soundEnabled })}
            className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
              prefs.soundEnabled ? 'bg-[#6558E8]' : 'bg-gray-300'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                prefs.soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Volume slider */}
        {prefs.soundEnabled && (
          <div className="p-3.5 rounded-2xl bg-[#FFF8EF] border border-[#E9E2D9]">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-xs text-[#25233A]">Volume</span>
              <span className="text-xs font-bold text-[#6558E8]">
                {Math.round(prefs.soundVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={prefs.soundVolume}
              onChange={(e) => update({ soundVolume: parseFloat(e.target.value) })}
              className="w-full accent-[#6558E8] cursor-pointer"
            />
          </div>
        )}

        {/* Fast Mode toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF8EF] border border-[#E9E2D9]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#E9E2D9] flex items-center justify-center text-amber-600 shadow-sm">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-[#25233A] block">
                Fast Pace Mode
              </span>
              <span className="text-xs text-[#77758A]">
                Accelerate step animations
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => update({ fastMode: !prefs.fastMode })}
            className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
              prefs.fastMode ? 'bg-[#6558E8]' : 'bg-gray-300'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                prefs.fastMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </Dialog>
  );
};
