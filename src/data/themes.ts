export type ThemeId =
  | 'chess' | 'space' | 'nature' | 'animals' | 'science'
  | 'building' | 'sports' | 'music' | 'books' | 'math'
  | 'fantasy' | 'robotics' | 'art' | 'generic';
export type Theme = {
  id: ThemeId;
  nameHe: string;
  emoji: string;
  color: string;
};
export const THEMES: Theme[] = [
  { id: 'chess',    nameHe: 'שחמט',    emoji: '♟️', color: '#8b7355' },
  { id: 'space',    nameHe: 'חלל',     emoji: '🚀', color: '#4a5fc1' },
  { id: 'nature',   nameHe: 'טבע',     emoji: '🌳', color: '#4ade80' },
  { id: 'animals',  nameHe: 'חיות',    emoji: '🦊', color: '#f59e0b' },
  { id: 'science',  nameHe: 'מדע',     emoji: '🔬', color: '#06b6d4' },
  { id: 'building', nameHe: 'בנייה',   emoji: '🏗️', color: '#94a3b8' },
  { id: 'sports',   nameHe: 'ספורט',   emoji: '⚽', color: '#ef4444' },
  { id: 'music',    nameHe: 'מוזיקה',  emoji: '🎵', color: '#ec4899' },
  { id: 'books',    nameHe: 'ספרים',   emoji: '📚', color: '#a16207' },
  { id: 'math',     nameHe: 'מתמטיקה', emoji: '🔢', color: '#7c3aed' },
  { id: 'fantasy',  nameHe: 'פנטזיה',  emoji: '🐉', color: '#c026d3' },
  { id: 'robotics', nameHe: 'רובוטיקה', emoji: '🤖', color: '#64748b' },
  { id: 'art',      nameHe: 'אומנות',  emoji: '🎨', color: '#f43f5e' },
  { id: 'generic',  nameHe: 'כללי',    emoji: '✨', color: '#b8a4ff' },
];
// Themes unlocked by default at level 1
export const DEFAULT_UNLOCKED_THEMES: ThemeId[] = ['chess', 'generic'];
// Companion world picker options at Level 5 (curated)
export const COMPANION_WORLD_OPTIONS: ThemeId[] = [
  'chess', 'science', 'space', 'animals',
  'nature', 'robotics', 'fantasy', 'art',
];