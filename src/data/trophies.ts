export type TrophyDef = {
  id: string;
  nameHe: string;
  emoji: string;
};

// Teachers pick from these when awarding a trophy
export const TROPHY_THEMES: TrophyDef[] = [
  { id: 'effort',      nameHe: 'גביע המאמץ',     emoji: '🏆' },
  { id: 'kindness',    nameHe: 'גביע החברות',    emoji: '💝' },
  { id: 'creativity',  nameHe: 'גביע היצירתיות', emoji: '🎨' },
  { id: 'curiosity',   nameHe: 'גביע הסקרנות',   emoji: '🔍' },
  { id: 'leadership',  nameHe: 'גביע המנהיגות',  emoji: '👑' },
  { id: 'growth',      nameHe: 'גביע ההתקדמות',  emoji: '🌱' },
];

// Teacher badges add cosmetic flourishes to companion
export type BadgeDef = {
  id: string;
  nameHe: string;
  emoji: string;
  flourishKind: 'glow' | 'sparkle' | 'aura' | 'accessory';
};

export const BADGES: BadgeDef[] = [
  { id: 'gold_glow',    nameHe: 'הילת זהב',      emoji: '✨', flourishKind: 'glow' },
  { id: 'star_sparkle', nameHe: 'ניצוצות כוכב',  emoji: '⭐', flourishKind: 'sparkle' },
  { id: 'rainbow_aura', nameHe: 'הילת קשת',      emoji: '🌈', flourishKind: 'aura' },
  { id: 'crown',        nameHe: 'כתר קטן',       emoji: '👑', flourishKind: 'accessory' },
  { id: 'wings',        nameHe: 'כנפיים קטנות',  emoji: '🪶', flourishKind: 'accessory' },
];
