'use client';

import React from 'react';
import { Play, Loader2, Bot } from 'lucide-react';

interface RollButtonProps {
  onRoll: () => void;
  disabled: boolean;
  isRolling: boolean;
  isMoving: boolean;
  isBotTurn?: boolean;
  botName?: string;
}

export const RollButton: React.FC<RollButtonProps> = ({
  onRoll,
  disabled,
  isRolling,
  isMoving,
  isBotTurn = false,
  botName = 'Robo',
}) => {
  return (
    <button
      onClick={() => {
        if (!disabled && !isBotTurn) {
          onRoll();
        }
      }}
      disabled={disabled || isBotTurn}
      className={`w-full max-w-xs sm:max-w-sm h-14 rounded-2xl font-black text-lg tracking-wide flex items-center justify-center gap-2.5 transition-all duration-150 select-none shadow-[0_6px_20px_rgba(101,88,232,0.35)] ${
        isBotTurn
          ? 'bg-amber-500 text-white shadow-[0_6px_20px_rgba(245,158,11,0.35)] cursor-wait'
          : disabled
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
          : 'bg-[#6558E8] text-white hover:bg-[#5245DA] active:scale-95'
      }`}
    >
      {isBotTurn ? (
        <>
          <Bot className="w-5 h-5 animate-bounce-short" />
          <span className="truncate max-w-[200px]">{botName} Rolling...</span>
        </>
      ) : isRolling ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Rolling Dice...</span>
        </>
      ) : isMoving ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Moving Token...</span>
        </>
      ) : (
        <>
          <Play className="w-5 h-5 fill-current" />
          <span>Roll Dice</span>
        </>
      )}
    </button>
  );
};
