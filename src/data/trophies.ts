export type TrophyDef = {
  id: string;
  nameHe: string;
  emoji: string;
  /** Optional realistic trophy asset stored in R2 under assets/trophies/teacher/. */
  imageFilename?: string;
};

// Teachers pick from these when awarding a trophy.
// Trophy themes without an imageFilename keep using their emoji until a
// matching realistic trophy asset is created.
export const TROPHY_THEMES: TrophyDef[] = [
  {
    id: 'effort',
    nameHe: 'גביע המאמץ',
    emoji: '🏆',
    imageFilename: 'effort.png',
  },
  {
    id: 'kindness',
    nameHe: 'גביע החברות',
    emoji: '💝',
    imageFilename: 'kindness.png',
  },
  {
    id: 'creativity',
    nameHe: 'גביע היצירתיות',
    emoji: '🎨',
    imageFilename: 'creativity.png',
  },
  {
    id: 'curiosity',
    nameHe: 'גביע הסקרנות',
    emoji: '🔍',
    imageFilename: 'curiosity.png',
  },
  {
    id: 'leadership',
    nameHe: 'גביע המנהיגות',
    emoji: '👑',
    imageFilename: 'leadership.png',
  },
  {
    id: 'growth',
    nameHe: 'גביע ההתקדמות',
    emoji: '🌱',
    imageFilename: 'growth.png',
  },
];

export function getTrophyDefinition(themeId: string): TrophyDef | undefined {
  return TROPHY_THEMES.find(theme => theme.id === themeId);
}

// Teacher badges add cosmetic flourishes to companion
export type BadgeDef = {
  id: string;
  nameHe: string;
  emoji: string;
  flourishKind: 'glow' | 'sparkle' | 'aura' | 'accessory';
};

export const BADGES: BadgeDef[] = [
  { id: 'gold_glow', nameHe: 'הילת זהב', emoji: '✨', flourishKind: 'glow' },
  {
    id: 'star_sparkle',
    nameHe: 'ניצוצות כוכב',
    emoji: '⭐',
    flourishKind: 'sparkle',
  },
  { id: 'rainbow_aura', nameHe: 'הילת קשת', emoji: '🌈', flourishKind: 'aura' },
  { id: 'crown', nameHe: 'כתר קטן', emoji: '👑', flourishKind: 'accessory' },
  { id: 'wings', nameHe: 'כנפיים קטנות', emoji: '🪶', flourishKind: 'accessory' },
];
