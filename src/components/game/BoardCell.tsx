'use client';

import React from 'react';
import { BoardTheme } from '@/lib/storage/preferences';
import { VINTAGE_CELL_COLORS } from '@/lib/game/vintageBoard';

interface BoardCellProps {
  number: number;
  isEven: boolean;
  boardTheme?: BoardTheme;
  hasLadderStart?: boolean;
  hasLadderEnd?: boolean;
  hasSnakeHead?: boolean;
  hasSnakeTail?: boolean;
}

export const BoardCell: React.FC<BoardCellProps> = ({
  number,
  isEven,
  boardTheme = 'vintage-paper',
  hasLadderStart,
  hasLadderEnd,
  hasSnakeHead,
  hasSnakeTail,
}) => {
  const isGoal = number === 100;
  const isStart = number === 1;

  if (boardTheme === 'vintage-photo') {
    // Transparent cell allowing original photo to shine through
    return (
      <div
        data-cell={number}
        className="relative w-full h-full flex flex-col justify-between p-0.5 select-none overflow-hidden"
      >
        <span className="text-[8px] sm:text-[10px] font-black text-black/40 tabular-nums">
          {number}
        </span>
      </div>
    );
  }

  if (boardTheme === 'vintage-paper') {
    const vintageStyle = VINTAGE_CELL_COLORS[number] || {
      bg: '#FFF176',
      text: '#1A1828',
      border: '#1A1828',
    };

    return (
      <div
        data-cell={number}
        style={{
          backgroundColor: vintageStyle.bg,
          borderColor: 'rgba(26, 24, 40, 0.55)',
        }}
        className="relative w-full h-full flex flex-col justify-between p-0.5 sm:p-1 border-[1px] select-none overflow-hidden"
      >
        {/* Cell Number in authentic retro serif/newspaper font */}
        <span
          className={`font-serif font-black leading-none tabular-nums text-[#1A1828] ${isGoal || isStart
            ? 'text-sm sm:text-lg font-black'
            : 'text-[10px] sm:text-xs font-extrabold'
            }`}
        >
          {number}
        </span>

        {isGoal && (
          <span className="self-center text-[10px] sm:text-xs font-black font-serif text-[#1A1828] uppercase tracking-tighter">
            WIN
          </span>
        )}
        {isStart && (
          <span className="self-center text-[9px] sm:text-[11px] font-black font-serif text-[#1A1828] uppercase tracking-tighter">
            START
          </span>
        )}

        <div className="flex justify-end items-center opacity-85">
          {hasLadderStart && (
            <span className="text-[10px] sm:text-xs" title="Ladder start">
              🪜
            </span>
          )}
          {hasSnakeHead && (
            <span className="text-[10px] sm:text-xs" title="Snake head">
              🐍
            </span>
          )}
        </div>
      </div>
    );
  }

  // Modern Theme
  let cellBg = isEven ? 'bg-[#FFFDF8]' : 'bg-[#F4E9D8]';
  if (isGoal) {
    cellBg = 'bg-gradient-to-br from-[#FEF08A] to-[#FDE047]';
  } else if (isStart) {
    cellBg = 'bg-gradient-to-br from-[#DCFCE7] to-[#BBF7D0]';
  }

  return (
    <div
      data-cell={number}
      className={`relative w-full h-full flex flex-col justify-between p-0.5 sm:p-1 border border-[#E9E2D9]/70 select-none overflow-hidden transition-colors ${cellBg}`}
    >
      <span
        className={`text-[9px] sm:text-xs font-bold leading-none tabular-nums ${isGoal
          ? 'text-[#854D0E] font-black'
          : isStart
            ? 'text-[#166534] font-black'
            : 'text-[#77758A]'
          }`}
      >
        {number}
      </span>

      {isGoal && (
        <span className="self-center text-xs sm:text-base font-black animate-bounce-short">
          🏆
        </span>
      )}
      {isStart && !isGoal && (
        <span className="self-center text-[10px] sm:text-xs font-bold text-[#166534]">
          START
        </span>
      )}

      <div className="flex justify-end items-center opacity-85">
        {hasLadderStart && (
          <span className="text-[10px] sm:text-xs" title="Ladder start">
            🪜
          </span>
        )}
        {hasSnakeHead && (
          <span className="text-[10px] sm:text-xs" title="Snake head">
            🐍
          </span>
        )}
      </div>
    </div>
  );
};
