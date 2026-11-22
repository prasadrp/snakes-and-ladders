import {
  GameConfig,
  GameEvent,
  GameState,
  Player,
  PlayMode,
} from './types';
import {
  DEFAULT_LADDERS,
  DEFAULT_SNAKES,
  PLAYER_COLORS,
  TOTAL_CELLS,
} from './constants';
import {
  calculateNextPosition,
  checkSnakesAndLadders,
  rollDice,
} from './rules';

export function createInitialGame(
  playerNames: string[],
  configOverrides?: Partial<GameConfig>,
  botFlags?: boolean[]
): GameState {
  const mode: PlayMode = configOverrides?.mode || 'vs-computer';
  const count = (Math.min(
    Math.max(playerNames.length, 2),
    4
  ) as 2 | 3 | 4) || 2;

  const config: GameConfig = {
    mode,
    playerCount: count,
    requireSixToStart: true,
    exactRollToFinish: true,
    extraTurnOnSix: false,
    snakes: DEFAULT_SNAKES,
    ladders: DEFAULT_LADDERS,
    ...configOverrides,
  };

  const players: Player[] = playerNames.slice(0, config.playerCount).map((name, i) => {
    const color = PLAYER_COLORS[i % PLAYER_COLORS.length];
    const isBot = botFlags ? botFlags[i] : mode === 'vs-computer' ? i > 0 : false;
    return {
      id: `player-${i + 1}`,
      name: name.trim() || (isBot ? (i === 1 ? 'Robo 🤖' : `Robo ${i} 🤖`) : `Player ${i + 1}`),
      colorId: color.id,
      color,
      position: 0,
      hasEntered: false,
      isWinner: false,
      isBot,
    };
  });

  return {
    id: `game-${Date.now()}`,
    config,
    players,
    currentPlayerIndex: 0,
    diceValue: null,
    status: 'playing',
    winnerId: null,
    lastEvent: {
      id: `evt-${Date.now()}`,
      type: 'stay',
      text: `Game started! ${players[0].name}'s turn. Roll a 6 to enter.`,
      playerId: players[0].id,
      playerName: players[0].name,
      timestamp: Date.now(),
    },
    moveHistory: [],
    isRolling: false,
    isMoving: false,
    turnNumber: 1,
  };
}

export interface TurnExecutionResult {
  nextState: GameState;
  events: GameEvent[];
  intermediatePosition: number;
  finalPosition: number;
  hasLadderOrSnake: boolean;
  featureTriggered: 'ladder' | 'snake' | null;
  extraTurn: boolean;
}

/**
 * Pure function to execute a turn given a dice value
 */
export function executeTurn(
  currentState: GameState,
  diceValue: number
): TurnExecutionResult {
  if (currentState.status === 'finished') {
    return {
      nextState: currentState,
      events: [],
      intermediatePosition: 0,
      finalPosition: 0,
      hasLadderOrSnake: false,
      featureTriggered: null,
      extraTurn: false,
    };
  }

  const currentPlayer = currentState.players[currentState.currentPlayerIndex];
  const events: GameEvent[] = [];
  const now = Date.now();

  // 1. Calculate raw movement
  const moveStep = calculateNextPosition(currentPlayer, diceValue, currentState.config);
  const intermediatePos = moveStep.nextPosition;

  events.push({
    id: `evt-${now}-roll`,
    type: moveStep.event,
    text: moveStep.message,
    playerId: currentPlayer.id,
    playerName: currentPlayer.name,
    diceValue,
    from: currentPlayer.position,
    to: intermediatePos,
    timestamp: now,
  });

  // 2. Check for snake or ladder
  let finalPos = intermediatePos;
  let featureTriggered: 'ladder' | 'snake' | null = null;
  let hasLadderOrSnake = false;

  if (moveStep.nextPosition > 0 && moveStep.nextPosition <= TOTAL_CELLS) {
    const special = checkSnakesAndLadders(
      intermediatePos,
      currentState.config,
      currentPlayer.name
    );

    if (special.hasTriggered && special.type) {
      hasLadderOrSnake = true;
      featureTriggered = special.type;
      finalPos = special.to;
      events.push({
        id: `evt-${now}-${special.type}`,
        type: special.type,
        text: special.message,
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        from: special.from,
        to: special.to,
        timestamp: now + 50,
      });
    }
  }

  // 3. Check for win
  const isWinner = finalPos === TOTAL_CELLS;
  if (isWinner) {
    events.push({
      id: `evt-${now}-win`,
      type: 'win',
      text: `🏆 Congratulations! ${currentPlayer.name} reached square 100 and won the game!`,
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      to: TOTAL_CELLS,
      timestamp: now + 100,
    });
  }

  // 4. Update player list
  const updatedPlayers = currentState.players.map((p, idx) => {
    if (idx === currentState.currentPlayerIndex) {
      return {
        ...p,
        position: finalPos,
        hasEntered: moveStep.entered || p.hasEntered,
        isWinner,
      };
    }
    return p;
  });

  // 5. Determine extra turn / next player
  const grantsExtraTurn =
    !isWinner && currentState.config.extraTurnOnSix && diceValue === 6;

  if (grantsExtraTurn) {
    events.push({
      id: `evt-${now}-bonus`,
      type: 'extra_turn',
      text: `${currentPlayer.name} rolled a 6 and earned an extra roll!`,
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      timestamp: now + 80,
    });
  }

  const nextPlayerIndex = isWinner
    ? currentState.currentPlayerIndex
    : grantsExtraTurn
      ? currentState.currentPlayerIndex
      : (currentState.currentPlayerIndex + 1) % currentState.players.length;

  const nextState: GameState = {
    ...currentState,
    players: updatedPlayers,
    currentPlayerIndex: nextPlayerIndex,
    diceValue,
    status: isWinner ? 'finished' : 'playing',
    winnerId: isWinner ? currentPlayer.id : null,
    lastEvent: events[events.length - 1] || null,
    moveHistory: [...currentState.moveHistory, ...events],
    isRolling: false,
    isMoving: false,
    turnNumber: currentState.turnNumber + 1,
  };

  return {
    nextState,
    events,
    intermediatePosition: intermediatePos,
    finalPosition: finalPos,
    hasLadderOrSnake,
    featureTriggered,
    extraTurn: grantsExtraTurn,
  };
}

export { rollDice };
