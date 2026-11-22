'use client';

import React from 'react';
import { getCellCoordinates } from '@/lib/game/board';
import { BoardTheme } from '@/lib/storage/preferences';

interface BoardArtworkProps {
  snakes: Record<number, number>;
  ladders: Record<number, number>;
  boardTheme?: BoardTheme;
}

export const BoardArtwork: React.FC<BoardArtworkProps> = ({
  snakes,
  ladders,
  boardTheme = 'vintage-paper',
}) => {
  if (boardTheme === 'vintage-photo') {
    // The photo already has artwork printed on it
    return null;
  }

  const getSvgPoint = (pos: number) => {
    const coord = getCellCoordinates(pos);
    return {
      x: coord.col * 100 + 50,
      y: coord.row * 100 + 50,
    };
  };

  const isVintage = boardTheme === 'vintage-paper';

  return (
    <svg
      viewBox="0 0 1000 1000"
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      aria-hidden="true"
    >
      <defs>
        <filter id="ladder-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.3" />
        </filter>

        <filter id="snake-shadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="3" dy="5" stdDeviation="4" floodOpacity="0.35" />
        </filter>

        {/* Vintage green snake skin gradient */}
        <linearGradient id="vintage-snake-skin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2E7D32" />
          <stop offset="50%" stopColor="#43A047" />
          <stop offset="100%" stopColor="#1B5E20" />
        </linearGradient>

        {/* Vintage yellow wooden ladder */}
        <linearGradient id="vintage-ladder-wood" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FDD835" />
          <stop offset="50%" stopColor="#FFF176" />
          <stop offset="100%" stopColor="#FBC02D" />
        </linearGradient>

        {/* Modern Gradients */}
        <linearGradient id="snake-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="50%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#EAB308" />
        </linearGradient>

        <linearGradient id="snake-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="50%" stopColor="#14B8A6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>

        <linearGradient id="snake-grad-3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>

        <linearGradient id="ladder-wood" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#854D0E" />
          <stop offset="50%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
      </defs>

      {/* Render Ladders */}
      {Object.entries(ladders).map(([fromStr, to]) => {
        const from = Number(fromStr);
        const start = getSvgPoint(from);
        const end = getSvgPoint(to);

        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        const ladderWidth = isVintage ? 24 : 22;
        const nx = -Math.sin(angle) * (ladderWidth / 2);
        const ny = Math.cos(angle) * (ladderWidth / 2);

        const rungSpacing = isVintage ? 30 : 36;
        const numRungs = Math.max(2, Math.floor(length / rungSpacing));

        const railStroke = isVintage ? 'url(#vintage-ladder-wood)' : 'url(#ladder-wood)';
        const outlineStroke = isVintage ? '#78350F' : 'none';

        return (
          <g key={`ladder-${from}-${to}`} filter="url(#ladder-shadow)">
            {/* Outline if vintage */}
            {isVintage && (
              <>
                <line
                  x1={start.x + nx}
                  y1={start.y + ny}
                  x2={end.x + nx}
                  y2={end.y + ny}
                  stroke={outlineStroke}
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <line
                  x1={start.x - nx}
                  y1={start.y - ny}
                  x2={end.x - nx}
                  y2={end.y - ny}
                  stroke={outlineStroke}
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </>
            )}

            {/* Left rail */}
            <line
              x1={start.x + nx}
              y1={start.y + ny}
              x2={end.x + nx}
              y2={end.y + ny}
              stroke={railStroke}
              strokeWidth={isVintage ? '6' : '6'}
              strokeLinecap="round"
            />
            {/* Right rail */}
            <line
              x1={start.x - nx}
              y1={start.y - ny}
              x2={end.x - nx}
              y2={end.y - ny}
              stroke={railStroke}
              strokeWidth={isVintage ? '6' : '6'}
              strokeLinecap="round"
            />
            {/* Rungs */}
            {Array.from({ length: numRungs }).map((_, rIdx) => {
              const t = (rIdx + 1) / (numRungs + 1);
              const rx = start.x + dx * t;
              const ry = start.y + dy * t;
              return (
                <g key={`rung-${rIdx}`}>
                  {isVintage && (
                    <line
                      x1={rx + nx}
                      y1={ry + ny}
                      x2={rx - nx}
                      y2={ry - ny}
                      stroke="#78350F"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                  )}
                  <line
                    x1={rx + nx}
                    y1={ry + ny}
                    x2={rx - nx}
                    y2={ry - ny}
                    stroke={isVintage ? '#FDD835' : '#D97706'}
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Render Snakes */}
      {Object.entries(snakes).map(([fromStr, to], index) => {
        const from = Number(fromStr);
        const head = getSvgPoint(from);
        const tail = getSvgPoint(to);

        const dx = tail.x - head.x;
        const dy = tail.y - head.y;
        const length = Math.sqrt(dx * dx + dy * dy);

        const perpX = -dy / length;
        const perpY = dx / length;

        const waveStrength = Math.min(85, Math.max(45, length * 0.22)) * (index % 2 === 0 ? 1 : -1);

        const cp1x = head.x + dx * 0.3 + perpX * waveStrength;
        const cp1y = head.y + dy * 0.3 + perpY * waveStrength;

        const cp2x = head.x + dx * 0.7 - perpX * waveStrength;
        const cp2y = head.y + dy * 0.7 - perpY * waveStrength;

        const pathD = `M ${head.x} ${head.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${tail.x} ${tail.y}`;
        const strokeColor = isVintage ? 'url(#vintage-snake-skin)' : `url(#snake-grad-${(index % 3) + 1})`;

        return (
          <g key={`snake-${from}-${to}`} filter="url(#snake-shadow)">
            {/* Outer body */}
            <path
              d={pathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth={isVintage ? '22' : '20'}
              strokeLinecap="round"
            />
            {/* Vintage crosshatch or modern dots */}
            <path
              d={pathD}
              fill="none"
              stroke={isVintage ? '#FFEB3B' : '#FFF'}
              strokeWidth={isVintage ? '5' : '4'}
              strokeDasharray={isVintage ? '4,10' : '8,16'}
              strokeLinecap="round"
              opacity={isVintage ? '0.85' : '0.65'}
            />
            {/* Head */}
            <circle
              cx={head.x}
              cy={head.y}
              r={isVintage ? '19' : '17'}
              fill={isVintage ? '#2E7D32' : index % 2 === 0 ? '#EF4444' : '#10B981'}
              stroke={isVintage ? '#1B5E20' : 'none'}
              strokeWidth={isVintage ? '2' : '0'}
            />
            {/* Eyes */}
            <circle cx={head.x - 5} cy={head.y - 4} r="4.5" fill={isVintage ? '#FFEB3B' : '#FFFFFF'} />
            <circle cx={head.x - 5} cy={head.y - 4} r="2.2" fill="#000000" />
            <circle cx={head.x + 5} cy={head.y - 4} r="4.5" fill={isVintage ? '#FFEB3B' : '#FFFFFF'} />
            <circle cx={head.x + 5} cy={head.y - 4} r="2.2" fill="#000000" />
            {/* Forked Tongue */}
            <path
              d={`M ${head.x} ${head.y + 12} L ${head.x} ${head.y + 24} L ${head.x - 4} ${head.y + 30} M ${head.x} ${head.y + 24} L ${head.x + 4} ${head.y + 30}`}
              stroke="#D32F2F"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        );
      })}
    </svg>
  );
};
