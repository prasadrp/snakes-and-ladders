'use client';

import React from 'react';
import { Player } from '@/lib/game/types';
import { Button } from '@/components/common/Button';
import { Trophy, RotateCcw, Home } from 'lucide-react';

interface WinnerPanelProps {
  winner: Player;
  players: Player[];
  onPlayAgain: () => void;
  onHome: () => void;
}

export const WinnerPanel: React.FC<WinnerPanelProps> = ({
  winner,
  players,
  onPlayAgain,
  onHome,
}) => {
  // Sort players by position descending
  const sortedPlayers = [...players].sort((a, b) => b.position - a.position);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-[#E9E2D9] text-center select-none">
        {/* Animated Trophy badge */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-[#F59E0B] to-[#FDE047] flex items-center justify-center shadow-lg shadow-amber-500/30 mb-4 animate-bounce-short">
          <Trophy className="w-11 h-11 text-white fill-white" />
        </div>

        <span className="text-xs font-black tracking-widest uppercase text-[#FFB84D] block mb-1">
          VICTORY!
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#25233A] mb-1">
          {winner.name} Won!
        </h2>
        <p className="text-sm text-[#77758A] mb-6">
          First to cross square 100 with an exact roll!
        </p>

        {/* Final Standings List */}
        <div className="bg-[#FFF8EF] rounded-2xl p-3 border border-[#E9E2D9] mb-6 text-left">
          <h3 className="text-xs font-bold text-[#77758A] uppercase tracking-wider mb-2 px-1">
            Final Standings
          </h3>
          <div className="space-y-1.5">
            {sortedPlayers.map((player, idx) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E9E2D9]/70 text-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 font-black text-xs text-[#77758A]">
                    #{idx + 1}
                  </span>
                  <div
                    style={{ backgroundColor: player.color.bgHex }}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-[#25233A]">
                    {player.name}
                  </span>
                </div>
                <span className="font-extrabold text-xs text-[#6558E8]">
                  {player.position === 100 ? 'WINNER 🏆' : `Square ${player.position}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onPlayAgain}
            className="flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Play Again</span>
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={onHome}
            className="flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5 text-[#6558E8]" />
            <span>Home</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
