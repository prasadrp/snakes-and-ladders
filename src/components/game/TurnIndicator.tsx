'use client';

import React from 'react';
import { Player } from '@/lib/game/types';
import { Bot, User } from 'lucide-react';

interface TurnIndicatorProps {
  currentPlayer: Player;
  isRolling: boolean;
  isMoving: boolean;
  lastMessage?: string | null;
}

export const TurnIndicator: React.FC<TurnIndicatorProps> = ({
  currentPlayer,
  isRolling,
  isMoving,
  lastMessage,
}) => {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl p-3 border border-[#E9E2D9] shadow-sm flex items-center justify-between gap-3 select-none">
      <div className="flex items-center gap-3">
        {/* Player Avatar */}
        <div
          style={{ backgroundColor: currentPlayer.color.bgHex }}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-md shrink-0 border-2 border-white relative"
        >
          {currentPlayer.isBot ? (
            <Bot className="w-5 h-5" />
          ) : (
            currentPlayer.name.charAt(0).toUpperCase()
          )}
        </div>

        {/* Player Turn text */}
        <div className="text-left leading-tight">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#25233A] text-base">
              {currentPlayer.name}
            </span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                currentPlayer.isBot
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-[#6558E8]/10 text-[#6558E8]'
              }`}
            >
              {currentPlayer.isBot ? 'Bot Turn' : 'Your Turn'}
            </span>
          </div>
          <div className="text-xs text-[#77758A] mt-0.5 font-medium line-clamp-1">
            {!currentPlayer.hasEntered
              ? 'Needs a 6 to enter the board'
              : `At square ${currentPlayer.position} • ${100 - currentPlayer.position} to win`}
          </div>
        </div>
      </div>

      {/* Status indicator pulse */}
      <div className="flex items-center gap-1.5 pr-1">
        <span
          style={{ backgroundColor: currentPlayer.color.bgHex }}
          className="w-2.5 h-2.5 rounded-full animate-ping"
        />
        <span
          style={{ backgroundColor: currentPlayer.color.bgHex }}
          className="w-2.5 h-2.5 rounded-full"
        />
      </div>
    </div>
  );
};
