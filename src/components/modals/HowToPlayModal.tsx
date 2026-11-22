'use client';

import React from 'react';
import { Dialog } from '@/components/common/Dialog';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  isOpen,
  onClose,
}) => {
  const steps = [
    {
      num: '1',
      title: 'Roll a 6 to Enter',
      desc: 'Each player begins in their yard. You must roll a 6 on your turn to enter square 1.',
      icon: '🎲',
    },
    {
      num: '2',
      title: 'Zigzag Up the Board',
      desc: 'Tokens move along the 100 squares alternating left-to-right and right-to-left.',
      icon: '📐',
    },
    {
      num: '3',
      title: 'Climb Ladders',
      desc: 'Land on a square at the bottom of a ladder to zoom directly up to the top!',
      icon: '🪜',
    },
    {
      num: '4',
      title: 'Avoid Snakes',
      desc: 'Watch out! Landing on a snake’s head causes your token to slide down to its tail.',
      icon: '🐍',
    },
    {
      num: '5',
      title: 'Exact Roll to 100',
      desc: 'To win, you must land directly on square 100. Any overshoot means you stay in place.',
      icon: '🏆',
    },
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="How to Play"
      description="Rules & tips for Snakes & Ladders"
      maxWidth="md"
    >
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {steps.map((step) => (
          <div
            key={step.num}
            className="flex items-start gap-3 p-3 rounded-2xl bg-[#FFF8EF] border border-[#E9E2D9]"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-[#E9E2D9] flex items-center justify-center text-xl shrink-0 shadow-sm">
              {step.icon}
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-[#25233A]">
                {step.num}. {step.title}
              </h4>
              <p className="text-xs text-[#77758A] mt-0.5 leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Dialog>
  );
};
