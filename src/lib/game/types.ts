export type PlayerId = string;

export interface PlayerColorInfo {
  id: string;
  name: string;
  bgHex: string;
  borderHex: string;
  glowHex: string;
  textColor: string;
}

export interface Player {
  id: PlayerId;
  name: string;
  colorId: string;
  color: PlayerColorInfo;
  position: number; // 0 = in start yard (not entered), 1-100 = board cell
  hasEntered: boolean;
  isWinner: boolean;
  isBot?: boolean; // If true, controlled automatically by the computer
  rank?: number;
}

export type PlayMode = 'vs-computer' | 'pass-and-play';

export interface GameConfig {
  mode: PlayMode;
  playerCount: 2 | 3 | 4;
  requireSixToStart: boolean;
  exactRollToFinish: boolean;
  extraTurnOnSix: boolean;
  snakes: Record<number, number>; // head -> tail
  ladders: Record<number, number>; // bottom -> top
}

export type GameEventType =
  | 'roll'
  | 'enter'
  | 'move'
  | 'ladder'
  | 'snake'
  | 'overshoot'
  | 'stay'
  | 'win'
  | 'extra_turn';

export interface GameEvent {
  id: string;
  type: GameEventType;
  text: string;
  playerId: PlayerId;
  playerName: string;
  diceValue?: number;
  from?: number;
  to?: number;
  timestamp: number;
}

export interface GameState {
  id: string;
  config: GameConfig;
  players: Player[];
  currentPlayerIndex: number;
  diceValue: number | null;
  status: 'setup' | 'playing' | 'finished';
  winnerId: PlayerId | null;
  lastEvent: GameEvent | null;
  moveHistory: GameEvent[];
  isRolling: boolean;
  isMoving: boolean;
  turnNumber: number;
}

export interface CellCoord {
  row: number; // 0 to 9 from top
  col: number; // 0 to 9 from left
  xPercent: number; // 0% to 100% center
  yPercent: number;
}
