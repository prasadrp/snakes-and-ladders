'use client';

import React, { useMemo } from 'react';
import { GameState } from '@/lib/game/types';
import { generateBoardCells } from '@/lib/game/board';
import { BoardCell } from './BoardCell';
import { BoardArtwork } from './BoardArtwork';
import { PlayerToken } from './PlayerToken';
import { BoardTheme } from '@/lib/storage/preferences';

interface GameBoardProps {
  gameState: GameState;
  boardTheme?: BoardTheme;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  boardTheme = 'vintage-paper',
}) => {
  const cells = useMemo(() => generateBoardCells(), []);

  // Map players by cell position to arrange tokens clustering
  const playersByPosition = useMemo(() => {
    const map = new Map<number, typeof gameState.players>();
    gameState.players.forEach((p) => {
      if (p.position > 0) {
        const list = map.get(p.position) || [];
        list.push(p);
        map.set(p.position, list);
      }
    });
    return map;
  }, [gameState.players]);

  const isVintagePaper = boardTheme === 'vintage-paper';
  const isVintagePhoto = boardTheme === 'vintage-photo';

  return (
    <div className="w-full flex items-center justify-center">
      {/* Aspect-square responsive board container */}
      <div
        style={
          isVintagePhoto
            ? {
                backgroundImage: "url('/images/vintage-board.jpg')",
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }
            : isVintagePaper
            ? {
                backgroundColor: '#1E232A',
                boxShadow:
                  '0 12px 32px rgba(0,0,0,0.35), inset 0 0 12px rgba(0,0,0,0.5)',
              }
            : {}
        }
        className={`relative w-full max-w-[480px] aspect-square rounded-2xl sm:rounded-3xl p-1 sm:p-2 shadow-2xl overflow-hidden select-none ${
          isVintagePaper
            ? 'border-4 border-[#242A35]'
            : isVintagePhoto
            ? 'border-4 border-[#25233A]'
            : 'bg-[#FFFFFF] border-2 sm:border-4 border-[#E9E2D9]'
        }`}
      >
        {/* 10x10 Grid */}
        <div
          className={`grid grid-cols-10 grid-rows-10 w-full h-full rounded-xl sm:rounded-2xl overflow-hidden relative ${
            isVintagePaper ? 'border-2 border-[#1A1828]' : ''
          }`}
        >
          {cells.map((cell) => {
            const hasLadderStart = Boolean(gameState.config.ladders[cell.number]);
            const hasLadderEnd = Object.values(gameState.config.ladders).includes(cell.number);
            const hasSnakeHead = Boolean(gameState.config.snakes[cell.number]);
            const hasSnakeTail = Object.values(gameState.config.snakes).includes(cell.number);

            return (
              <BoardCell
                key={cell.number}
                number={cell.number}
                isEven={cell.isEven}
                boardTheme={boardTheme}
                hasLadderStart={hasLadderStart}
                hasLadderEnd={hasLadderEnd}
                hasSnakeHead={hasSnakeHead}
                hasSnakeTail={hasSnakeTail}
              />
            );
          })}
        </div>

        {/* Vintage Paper Board Authentic Seam Fold (down the middle) */}
        {isVintagePaper && (
          <div
            className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-2 z-15 pointer-events-none flex items-center justify-center"
            aria-hidden="true"
          >
            {/* Left crease shadow */}
            <div className="w-1 h-full bg-gradient-to-r from-transparent to-black/30" />
            {/* Center stitched white tape seam */}
            <div className="w-[3px] h-full bg-[#FAF6E8] shadow-inner opacity-90" />
            {/* Right crease highlight & shadow */}
            <div className="w-1 h-full bg-gradient-to-l from-transparent to-black/25" />
          </div>
        )}

        {/* Vintage Retro Footer Stamp */}
        {isVintagePaper && (
          <div className="absolute bottom-1 right-2 z-20 pointer-events-none font-serif text-[8px] font-bold text-black/60 tracking-wider">
            No. 189.
          </div>
        )}

        {/* SVG Snakes and Ladders overlay */}
        <BoardArtwork
          snakes={gameState.config.snakes}
          ladders={gameState.config.ladders}
          boardTheme={boardTheme}
        />

        {/* Player Tokens layer */}
        {gameState.players.map((player) => {
          const sharing = playersByPosition.get(player.position) || [];
          const sharedIndex = sharing.findIndex((p) => p.id === player.id);
          const isCurrentTurn =
            gameState.players[gameState.currentPlayerIndex]?.id === player.id;

          return (
            <PlayerToken
              key={player.id}
              player={player}
              isCurrentTurn={isCurrentTurn}
              sharedCellIndex={sharedIndex >= 0 ? sharedIndex : 0}
              sharedTotal={sharing.length}
            />
          );
        })}
      </div>
    </div>
  );
};
