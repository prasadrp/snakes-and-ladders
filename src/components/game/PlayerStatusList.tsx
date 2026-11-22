'use client';

import React from 'react';
import { Player } from '@/lib/game/types';
import { Bot, User } from 'lucide-react';

interface PlayerStatusListProps {
  players: Player[];
  currentPlayerIndex: number;
}

export const PlayerStatusList: React.FC<PlayerStatusListProps> = ({
  players,
  currentPlayerIndex,
}) => {
  return (
    <div className="w-full max-w-md mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2 select-none">
      {players.map((p, idx) => {
        const isCurrent = idx === currentPlayerIndex;
        return (
          <div
            key={p.id}
            style={{
              borderColor: isCurrent ? p.color.bgHex : '#E9E2D9',
            }}
            className={`rounded-2xl p-2.5 bg-white border-2 transition-all flex flex-col justify-between ${
              isCurrent
                ? 'shadow-md shadow-[#6558E8]/15 ring-2 ring-[#6558E8]/30 scale-[1.02]'
                : 'opacity-90'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <div
                style={{ backgroundColor: p.color.bgHex }}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white font-extrabold text-xs shadow-sm shrink-0 border border-white"
              >
                {p.isBot ? <Bot className="w-4 h-4" /> : p.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-bold text-xs text-[#25233A] truncate">
                {p.name}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-[#77758A]">
              <span>Pos</span>
              <span
                className={`font-black ${
                  p.position > 0 ? 'text-[#25233A]' : 'text-amber-600'
                }`}
              >
                {p.position > 0 ? `#${p.position}` : 'Yard'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
