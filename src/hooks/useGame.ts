'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, GameConfig, Player } from '@/lib/game/types';
import { createInitialGame, executeTurn, rollDice } from '@/lib/game/engine';
import { TOTAL_CELLS } from '@/lib/game/constants';
import { soundManager } from '@/lib/audio/sound';
import confetti from 'canvas-confetti';

export function useGame() {
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGame(['You', 'Robo 🤖'], { mode: 'vs-computer' })
  );
  const [isRolling, setIsRolling] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [displayedDice, setDisplayedDice] = useState<number | null>(null);
  const isActionLockedRef = useRef(false);

  // Initialize or restart a game
  const startGame = useCallback(
    (playerNames: string[], config?: Partial<GameConfig>, botFlags?: boolean[]) => {
      isActionLockedRef.current = false;
      setIsRolling(false);
      setIsMoving(false);
      setDisplayedDice(null);
      const newGame = createInitialGame(playerNames, config, botFlags);
      setGameState(newGame);
    },
    []
  );

  const restartCurrentGame = useCallback(() => {
    if (!gameState) return;
    const names = gameState.players.map((p) => p.name);
    const botFlags = gameState.players.map((p) => Boolean(p.isBot));
    startGame(names, gameState.config, botFlags);
  }, [gameState, startGame]);

  // Execute a dice roll and step-by-step token movement
  const handleRollDice = useCallback(async () => {
    if (
      isActionLockedRef.current ||
      isRolling ||
      isMoving ||
      gameState.status === 'finished'
    ) {
      return;
    }

    isActionLockedRef.current = true;
    setIsRolling(true);
    soundManager.playDiceRoll();

    // 3D physics tumble duration
    await new Promise((r) => setTimeout(r, 650));

    // Determine actual dice value
    const finalDice = rollDice();
    setDisplayedDice(finalDice);
    setIsRolling(false);

    // Allow 3D die to settle on the target face before starting token movement
    await new Promise((r) => setTimeout(r, 450));

    // Calculate game mechanics
    const turnResult = executeTurn(gameState, finalDice);
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const prevPos = currentPlayer.position;
    const intermediatePos = turnResult.intermediatePosition;
    const finalPos = turnResult.finalPosition;

    // Handle token movement animation
    setIsMoving(true);

    if (intermediatePos === prevPos) {
      // Stayed in yard or overshoot
      await new Promise((r) => setTimeout(r, 650));
    } else if (prevPos === 0 && intermediatePos > 0) {
      // Entered the board
      soundManager.playStep();
      setGameState((prev) => ({
        ...prev,
        players: prev.players.map((p, idx) =>
          idx === prev.currentPlayerIndex
            ? { ...p, position: 1, hasEntered: true }
            : p
        ),
      }));
      await new Promise((r) => setTimeout(r, 450));
    } else {
      // Step-by-step movement along the board
      const start = prevPos;
      const target = intermediatePos;
      const stepCount = target - start;

      for (let s = 1; s <= stepCount; s++) {
        const curStep = start + s;
        soundManager.playStep();
        setGameState((prev) => ({
          ...prev,
          players: prev.players.map((p, idx) =>
            idx === prev.currentPlayerIndex
              ? { ...p, position: curStep, hasEntered: true }
              : p
          ),
        }));
        await new Promise((r) => setTimeout(r, 220));
      }
    }

    // If snake or ladder triggered, pause and slide/climb
    if (turnResult.hasLadderOrSnake) {
      await new Promise((r) => setTimeout(r, 350));
      if (turnResult.featureTriggered === 'ladder') {
        soundManager.playLadder();
      } else {
        soundManager.playSnake();
      }

      setGameState((prev) => ({
        ...prev,
        players: prev.players.map((p, idx) =>
          idx === prev.currentPlayerIndex
            ? { ...p, position: finalPos }
            : p
        ),
      }));
      await new Promise((r) => setTimeout(r, 600));
    }

    // Update full game state with next player / winner / history
    setGameState(turnResult.nextState);
    setIsMoving(false);
    isActionLockedRef.current = false;

    // Check for win
    if (turnResult.nextState.status === 'finished') {
      soundManager.playVictory();
      try {
        confetti({
          particleCount: 120,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#6558E8', '#FFB84D', '#36B879', '#EF4444', '#3B82F6'],
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [gameState, isRolling, isMoving]);

  // Automatic Computer / Bot turn execution
  useEffect(() => {
    if (
      gameState.status === 'playing' &&
      !isRolling &&
      !isMoving &&
      !isActionLockedRef.current
    ) {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      if (currentPlayer?.isBot) {
        const timer = setTimeout(() => {
          handleRollDice();
        }, 950);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState, isRolling, isMoving, handleRollDice]);

  return {
    gameState,
    isRolling,
    isMoving,
    displayedDice,
    handleRollDice,
    startGame,
    restartCurrentGame,
  };
}
