export type BoardTheme = 'vintage-paper' | 'modern' | 'vintage-photo';

export interface AppPreferences {
  soundEnabled: boolean;
  soundVolume: number;
  reducedMotion: 'system' | 'on' | 'off';
  fastMode: boolean;
  diceDotColor: string;
  boardTheme: BoardTheme;
}

const PREF_KEY = 'snakes_ladders_preferences_v1';

export const BOARD_THEMES = [
  {
    id: 'vintage-paper',
    name: 'Vintage Paper',
    description: 'Classic retro folding paper board with 4-color tiles and center seam',
    previewIcon: '📜',
  },
  {
    id: 'vintage-photo',
    name: 'Original Board Photo',
    description: 'Real vintage cardboard board texture directly from the photo',
    previewIcon: '📷',
  },
  {
    id: 'modern',
    name: 'Modern Adventure',
    description: 'Clean, warm, contemporary casual style',
    previewIcon: '🎨',
  },
];

export const DICE_COLOR_OPTIONS = [
  { id: 'violet', name: 'Royal Violet', hex: '#6558E8', bgClass: 'bg-[#6558E8]' },
  { id: 'red', name: 'Ruby Crimson', hex: '#EF4444', bgClass: 'bg-[#EF4444]' },
  { id: 'blue', name: 'Ocean Blue', hex: '#3B82F6', bgClass: 'bg-[#3B82F6]' },
  { id: 'green', name: 'Emerald', hex: '#10B981', bgClass: 'bg-[#10B981]' },
  { id: 'amber', name: 'Golden Amber', hex: '#F59E0B', bgClass: 'bg-[#F59E0B]' },
  { id: 'dark', name: 'Midnight Obsidian', hex: '#1E1B4B', bgClass: 'bg-[#1E1B4B]' },
  { id: 'pink', name: 'Hot Coral', hex: '#EC4899', bgClass: 'bg-[#EC4899]' },
];

export const DEFAULT_PREFERENCES: AppPreferences = {
  soundEnabled: true,
  soundVolume: 0.6,
  reducedMotion: 'system',
  fastMode: false,
  diceDotColor: '#6558E8',
  boardTheme: 'vintage-paper',
};

export function getPreferences(): AppPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: Partial<AppPreferences>): AppPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const current = getPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(PREF_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}
