import { GameType } from '../../core/models/game.model';

export const GAME_CONSTRAINTS: Record<GameType, { min: number; max: number }> = {
  'dirty-clubs': { min: 3, max: 6 },
  canasta: { min: 2, max: 6 },
  '5-crowns': { min: 2, max: 7 },
  open: { min: 2, max: 8 },
};

export const GAME_LABELS: Record<GameType, string> = {
  'dirty-clubs': 'Dirty Clubs',
  canasta: 'Canasta',
  '5-crowns': '5 Crowns',
  open: 'Open Scoring',
};

export const ALL_GAMES: GameType[] = ['dirty-clubs', 'canasta', '5-crowns', 'open'];

export interface GameDef {
  type: GameType;
  icon: string;
  name: string;
  genre: string;
  range: string;
}

export const GAME_DEFS: Record<GameType, GameDef> = {
  'dirty-clubs': {
    type: 'dirty-clubs',
    icon: '♣',
    name: 'Dirty Clubs',
    genre: 'Trump trick-taking · first to 15 pts',
    range: '3 – 6 players',
  },
  canasta: {
    type: 'canasta',
    icon: '🃏',
    name: 'Canasta',
    genre: 'Meld & draw · point totals',
    range: '2 – 6 players',
  },
  '5-crowns': {
    type: '5-crowns',
    icon: '👑',
    name: '5 Crowns',
    genre: 'Rummy variant · lowest score wins',
    range: '2 – 7 players',
  },
  open: {
    type: 'open',
    icon: '✏️',
    name: 'Open Scoring',
    genre: 'Any game · you set the rules',
    range: '2 – 8 players',
  },
};

export interface AvatarColor {
  bg: string;
  text: string;
}

export const AVATAR_COLORS: { light: AvatarColor; dark: AvatarColor }[] = [
  {
    light: { bg: '#d9f2e1', text: '#16643c' },
    dark: { bg: 'rgba(26,127,75,0.25)', text: '#7dd0a0' },
  },
  {
    light: { bg: '#fef9c3', text: '#a16207' },
    dark: { bg: 'rgba(234,179,8,0.2)', text: '#facc15' },
  },
  {
    light: { bg: '#ffe0e2', text: '#e51d2b' },
    dark: { bg: 'rgba(248,59,72,0.2)', text: '#ff8089' },
  },
  {
    light: { bg: '#dbeafe', text: '#1d4ed8' },
    dark: { bg: 'rgba(96,165,250,0.2)', text: '#93c5fd' },
  },
  {
    light: { bg: '#f3e8ff', text: '#7c3aed' },
    dark: { bg: 'rgba(192,132,252,0.2)', text: '#d8b4fe' },
  },
  {
    light: { bg: '#ffedd5', text: '#c2410c' },
    dark: { bg: 'rgba(251,146,60,0.2)', text: '#fdba74' },
  },
];

export function getAvatarColor(position: number, isDark: boolean): AvatarColor {
  const idx = (position - 1) % AVATAR_COLORS.length;
  return isDark ? AVATAR_COLORS[idx].dark : AVATAR_COLORS[idx].light;
}

export interface SetupPlayer {
  id: string;
  name: string;
  avatarPosition: number; // 1-indexed for avatar colour assignment
}
