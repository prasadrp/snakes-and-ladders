'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { soundManager } from '@/lib/audio/sound';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        soundManager.playClick();
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-sm transition-opacity"
        onClick={() => {
          soundManager.playClick();
          onClose();
        }}
      />

      {/* Modal card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-white rounded-3xl p-6 shadow-2xl border border-[#E9E2D9] z-10 animate-in fade-in zoom-in-95 duration-150`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E9E2D9]/60">
          <div>
            <h2 id="dialog-title" className="text-xl font-extrabold text-[#25233A]">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-[#77758A] mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            aria-label="Close"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#77758A] hover:bg-gray-100 active:scale-95 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
};
