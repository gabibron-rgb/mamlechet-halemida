import type { ThemeId } from './themes';

export type CollectionCompletionAward = {
  themeId: ThemeId;
  achievementId: string;
  achievementTitleHe: string;
  prizeNameHe: string;
  prizeEmoji: string;
  descriptionHe: string;
};

export const COLLECTION_COMPLETION_AWARDS: CollectionCompletionAward[] = [
  {
    themeId: 'generic',
    achievementId: 'collection_generic_complete',
    achievementTitleHe: 'אספן הממלכה',
    prizeNameHe: 'כוכב הממלכה',
    prizeEmoji: '✨',
    descriptionHe: 'פרס תצוגה מיוחד על השלמת אוסף החפצים הכללי במלואו.',
  },
  {
    themeId: 'chess',
    achievementId: 'collection_chess_complete',
    achievementTitleHe: 'אמן הלוח',
    prizeNameHe: 'כתר הלוח',
    prizeEmoji: '♛',
    descriptionHe: 'פרס תצוגה מיוחד על השלמת אוסף השחמט במלואו.',
  },
  {
    themeId: 'space',
    achievementId: 'collection_space_complete',
    achievementTitleHe: 'מגלה הגלקסיה',
    prizeNameHe: 'כוכב המסע',
    prizeEmoji: '🌟',
    descriptionHe: 'פרס תצוגה מיוחד על השלמת אוסף החלל במלואו.',
  },
  {
    themeId: 'nature',
    achievementId: 'collection_nature_complete',
    achievementTitleHe: 'שומר הטבע',
    prizeNameHe: 'עלה הזהב',
    prizeEmoji: '🍃',
    descriptionHe: 'פרס תצוגה מיוחד על השלמת אוסף הטבע במלואו.',
  },
  {
    themeId: 'animals',
    achievementId: 'collection_animals_complete',
    achievementTitleHe: 'חבר החיות',
    prizeNameHe: 'טביעת הכף המלכותית',
    prizeEmoji: '🐾',
    descriptionHe: 'פרס תצוגה מיוחד על השלמת אוסף החיות במלואו.',
  },
  {
    themeId: 'science',
    achievementId: 'collection_science_complete',
    achievementTitleHe: 'חוקר הממלכה',
    prizeNameHe: 'גביש המעבדה',
    prizeEmoji: '⚗️',
    descriptionHe: 'פרס תצוגה מיוחד על השלמת אוסף המדע במלואו.',
  },
  {
    themeId: 'building',
    achievementId: 'collection_building_complete',
    achievementTitleHe: 'בונה הממלכה',
    prizeNameHe: 'לבנת המייסדים',
    prizeEmoji: '🧱',
    descriptionHe: 'פרס תצוגה מיוחד על השלמת אוסף הבנייה במלואו.',
  },
  {
    themeId: 'sports',
    achievementId: 'collection_sports_complete',
    achievementTitleHe: 'אלוף האוסף',
    prizeNameHe: 'מדליית האלופים',
    prizeEmoji: '🥇',
    descriptionHe: 'פרס תצוגה מיוחד על השלמת אוסף הספורט במלואו.',
  },
  {
    themeId: 'music',
    achievementId: 'collection_music_complete',
    achievementTitleHe: 'מנצח התזמורת',
    prizeNameHe: 'תו הזהב',
    prizeEmoji: '🎼',
    descriptionHe: 'פרס תצוגה מיוחד על השלמת אוסף המוזיקה במלואו.',
  },
  {
    themeId: 'books',
    achievementId: 'collection_books_complete',
    achievementTitleHe: 'שומר הספרייה',
    prizeNameHe: 'ספר הזהב',
    prizeEmoji: '📖',
    descriptionHe: 'פרס תצוגה מיוחד על השלמת אוסף הספרים במלואו.',
  },
  {
    themeId: 'math',
    achievementId: 'collection_math_complete',
    achievementTitleHe: 'אמן המספרים',
    prizeNameHe: 'סמל האינסוף',
    prizeEmoji: '∞',
    descriptionHe: 'פרס תצוגה מיוחד על השלמת אוסף המתמטיקה במלואו.',
  },
  {
    themeId: 'fantasy',
    achievementId: 'collection_fantasy_complete',
    achievementTitleHe: 'שומר האגדות',
    prizeNameHe: 'עין הדרקון',
    prizeEmoji: '🐲',
    descriptionHe: 'פרס תצוגה מיוחד על השלמת אוסף הפנטזיה במלואו.',
  },
  {
    themeId: 'robotics',
    achievementId: 'collection_robotics_complete',
    achievementTitleHe: 'מהנדס הממלכה',
    prizeNameHe: 'ליבת הרובוט',
    prizeEmoji: '⚙️',
    descriptionHe: 'פרס תצוגה מיוחד על השלמת אוסף הרובוטיקה במלואו.',
  },
  {
    themeId: 'art',
    achievementId: 'collection_art_complete',
    achievementTitleHe: 'אמן הגלריה',
    prizeNameHe: 'פלטת האמן',
    prizeEmoji: '🖌️',
    descriptionHe: 'פרס תצוגה מיוחד על השלמת אוסף האומנות במלואו.',
  },
  {
    themeId: 'ballet',
    achievementId: 'collection_ballet_complete',
    achievementTitleHe: 'כוכב הבמה',
    prizeNameHe: 'נעל הבמה',
    prizeEmoji: '🩰',
    descriptionHe: 'פרס תצוגה מיוחד על השלמת אוסף הבלט במלואו.',
  },
];

const BY_ACHIEVEMENT_ID = new Map(
  COLLECTION_COMPLETION_AWARDS.map(award => [award.achievementId, award])
);

const BY_THEME_ID = new Map(
  COLLECTION_COMPLETION_AWARDS.map(award => [award.themeId, award])
);

export function getCollectionCompletionAwardByAchievementId(
  achievementId: string
): CollectionCompletionAward | null {
  return BY_ACHIEVEMENT_ID.get(achievementId) ?? null;
}

export function getCollectionCompletionAwardByTheme(
  themeId: ThemeId
): CollectionCompletionAward | null {
  return BY_THEME_ID.get(themeId) ?? null;
}
