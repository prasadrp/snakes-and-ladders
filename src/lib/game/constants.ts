import { PlayerColorInfo } from './types';

export const PLAYER_COLORS: PlayerColorInfo[] = [
  {
    id: 'red',
    name: 'Ruby Red',
    bgHex: '#EF4444',
    borderHex: '#B91C1C',
    glowHex: 'rgba(239, 68, 68, 0.4)',
    textColor: '#FFFFFF',
  },
  {
    id: 'blue',
    name: 'Ocean Blue',
    bgHex: '#3B82F6',
    borderHex: '#1D4ED8',
    glowHex: 'rgba(59, 130, 246, 0.4)',
    textColor: '#FFFFFF',
  },
  {
    id: 'green',
    name: 'Emerald Green',
    bgHex: '#10B981',
    borderHex: '#047857',
    glowHex: 'rgba(16, 185, 129, 0.4)',
    textColor: '#FFFFFF',
  },
  {
    id: 'gold',
    name: 'Sun Amber',
    bgHex: '#F59E0B',
    borderHex: '#B45309',
    glowHex: 'rgba(245, 158, 11, 0.4)',
    textColor: '#FFFFFF',
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    bgHex: '#8B5CF6',
    borderHex: '#6D28D9',
    glowHex: 'rgba(139, 92, 246, 0.4)',
    textColor: '#FFFFFF',
  },
  {
    id: 'pink',
    name: 'Coral Pink',
    bgHex: '#EC4899',
    borderHex: '#BE185D',
    glowHex: 'rgba(236, 72, 153, 0.4)',
    textColor: '#FFFFFF',
  },
];

// Classic balanced Snakes & Ladders positions (10x10)
export const DEFAULT_LADDERS: Record<number, number> = {
  4: 14,
  9: 31,
  20: 38,
  28: 84,
  40: 59,
  51: 67,
  63: 81,
  71: 91,
};

export const DEFAULT_SNAKES: Record<number, number> = {
  17: 7,
  54: 34,
  62: 19,
  64: 60,
  87: 24,
  93: 73,
  95: 75,
  99: 78,
};

export const BOARD_SIZE = 10;
export const TOTAL_CELLS = 100;
