import { GameConfig, Player } from './types';
import { TOTAL_CELLS } from './constants';

export interface MoveStepResult {
  nextPosition: number;
  entered: boolean;
  event: 'enter' | 'move' | 'overshoot' | 'stay';
  message: string;
}

export interface SnakeOrLadderResult {
  hasTriggered: boolean;
  type: 'snake' | 'ladder' | null;
  from: number;
  to: number;
  message: string;
}

/**
 * Calculates raw next position before snake or ladder
 */
export function calculateNextPosition(
  player: Player,
  diceValue: number,
  config: GameConfig
): MoveStepResult {
  // If player has not yet entered the board
  if (!player.hasEntered || player.position === 0) {
    if (config.requireSixToStart) {
      if (diceValue === 6) {
        return {
          nextPosition: 1,
          entered: true,
          event: 'enter',
          message: `${player.name} rolled a 6 and entered the board at square 1!`,
        };
      } else {
        return {
          nextPosition: 0,
          entered: false,
          event: 'stay',
          message: `${player.name} rolled a ${diceValue}. Needs a 6 to enter.`,
        };
      }
    } else {
      // If 6 is not required to start, enter at square 1 and advance
      const target = Math.min(1 + diceValue - 1, TOTAL_CELLS);
      return {
        nextPosition: target,
        entered: true,
        event: 'enter',
        message: `${player.name} entered the board at square ${target}!`,
      };
    }
  }

  // Normal movement
  const target = player.position + diceValue;

  if (target > TOTAL_CELLS) {
    if (config.exactRollToFinish) {
      const needed = TOTAL_CELLS - player.position;
      return {
        nextPosition: player.position,
        entered: true,
        event: 'overshoot',
        message: `${player.name} rolled a ${diceValue}, but needs exact ${needed} to finish. Stayed at ${player.position}.`,
      };
    } else {
      return {
        nextPosition: TOTAL_CELLS,
        entered: true,
        event: 'move',
        message: `${player.name} rolled a ${diceValue} and reached square 100!`,
      };
    }
  }

  return {
    nextPosition: target,
    entered: true,
    event: 'move',
    message: `${player.name} rolled a ${diceValue} and moved from ${player.position} to ${target}.`,
  };
}

/**
 * Check if the position triggers a Snake or Ladder
 */
export function checkSnakesAndLadders(
  position: number,
  config: GameConfig,
  playerName: string
): SnakeOrLadderResult {
  if (config.ladders[position]) {
    const to = config.ladders[position];
    return {
      hasTriggered: true,
      type: 'ladder',
      from: position,
      to,
      message: `🎉 Great climb! ${playerName} took a ladder from ${position} to ${to}!`,
    };
  }

  if (config.snakes[position]) {
    const to = config.snakes[position];
    return {
      hasTriggered: true,
      type: 'snake',
      from: position,
      to,
      message: `🐍 Oops! ${playerName} was bitten by a snake at ${position} and slid down to ${to}!`,
    };
  }

  return {
    hasTriggered: false,
    type: null,
    from: position,
    to: position,
    message: '',
  };
}

/**
 * Roll a standard 6-sided die
 */
export function rollDice(randomFn: () => number = Math.random): number {
  return Math.floor(randomFn() * 6) + 1;
}
