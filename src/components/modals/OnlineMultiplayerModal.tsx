'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/common/Dialog';
import { Button } from '@/components/common/Button';
import { Users, WifiOff, Copy, Check, Info } from 'lucide-react';
import { soundManager } from '@/lib/audio/sound';

interface OnlineMultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnlineMultiplayerModal: React.FC<OnlineMultiplayerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const sampleRoomCode = 'LADDER-88';

  const handleCopy = () => {
    soundManager.playClick();
    navigator.clipboard.writeText(sampleRoomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Play with Friends"
      description="Online multiplayer setup"
      maxWidth="md"
    >
      <div className="space-y-4 py-1 select-none">
        {/* Specification setup notice */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <p className="font-extrabold text-amber-950 mb-1">
              Backend Integration Notice
            </p>
            In accordance with the project specification (Phase 1–5 Local MVP first),
            live online rooms require Supabase &amp; Firebase keys configured in{' '}
            <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">.env.local</code>.
            Local pass-and-play is fully active and 100% playable right now!
          </div>
        </div>

        {/* Room Preview UI */}
        <div className="p-4 rounded-2xl bg-[#FFF8EF] border border-[#E9E2D9] space-y-3">
          <label className="text-xs font-bold text-[#77758A] uppercase tracking-wider block">
            Room Code Preview
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={sampleRoomCode}
              className="flex-1 px-4 py-3 bg-white border-2 border-[#E9E2D9] rounded-xl font-mono font-bold text-center text-lg text-[#25233A] tracking-wider select-all"
            />
            <Button
              variant="secondary"
              onClick={handleCopy}
              className="px-3.5 py-3 h-auto"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            fullWidth
            onClick={onClose}
          >
            Play Local Pass &amp; Play Now
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
