'use client';

import React from 'react';
import { Dialog } from '@/components/common/Dialog';
import { Button } from '@/components/common/Button';
import { AlertTriangle } from 'lucide-react';

interface ExitGameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExit: () => void;
}

export const ExitGameDialog: React.FC<ExitGameDialogProps> = ({
  isOpen,
  onClose,
  onConfirmExit,
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Leave game?"
      description="Your current game progress will be lost."
      maxWidth="sm"
    >
      <div className="flex flex-col items-center text-center py-2">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <p className="text-sm text-[#77758A] mb-6">
          Are you sure you want to return to the home screen?
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            variant="secondary"
            fullWidth
            onClick={onClose}
          >
            Keep Playing
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={onConfirmExit}
          >
            Exit Game
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
