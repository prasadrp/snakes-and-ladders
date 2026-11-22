'use client';

import React from 'react';
import { Player } from '@/lib/game/types';
import { getCellCoordinates } from '@/lib/game/board';

interface PlayerTokenProps {
  player: Player;
  isCurrentTurn: boolean;
  sharedCellIndex: number;
  sharedTotal: number;
}

export const PlayerToken: React.FC<PlayerTokenProps> = ({
  player,
  isCurrentTurn,
  sharedCellIndex,
  sharedTotal,
}) => {
  // If player hasn't entered, do not show on board grid
  if (player.position === 0) {
    return null;
  }

  const coord = getCellCoordinates(player.position);

  // Offset if multiple players are in the same cell
  let offsetX = 0;
  let offsetY = 0;

  if (sharedTotal === 2) {
    offsetX = sharedCellIndex === 0 ? -11 : 11;
  } else if (sharedTotal >= 3) {
    const offsets = [
      { x: -11, y: -11 },
      { x: 11, y: -11 },
      { x: -11, y: 11 },
      { x: 11, y: 11 },
    ];
    const off = offsets[sharedCellIndex % offsets.length];
    offsetX = off.x;
    offsetY = off.y;
  }

  return (
    <div
      style={{
        left: `${coord.xPercent}%`,
        top: `${coord.yPercent}%`,
        transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`,
      }}
      className={`absolute z-20 transition-all duration-300 ease-out pointer-events-none select-none`}
    >
      <div
        style={{
          backgroundColor: player.color.bgHex,
          borderColor: '#FFFFFF',
          boxShadow: isCurrentTurn
            ? `0 0 0 3px #FFFFFF, 0 0 16px ${player.color.glowHex}, 0 6px 12px rgba(0,0,0,0.3)`
            : '0 2px 6px rgba(0,0,0,0.25)',
        }}
        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center text-white font-black text-[10px] sm:text-xs shadow-md ${
          isCurrentTurn ? 'scale-110 animate-pulse-subtle' : ''
        }`}
      >
        {player.name.charAt(0).toUpperCase()}
      </div>

      {isCurrentTurn && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#6558E8] text-white text-[8px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow">
          Turn
        </div>
      )}
    </div>
  );
};
