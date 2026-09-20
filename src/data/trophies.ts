export type TrophyDef = {
  id: string;
  nameHe: string;
  emoji: string;
  /** Filename inside the trophy asset folder selected by assetKind. */
  imageFilename?: string;
  /** Teacher trophies use assets/trophies/teacher; personal trophies use assets/trophies/personal. */
  assetKind?: 'teacher' | 'personal';
  /** Marks a real-world trophy that was recreated inside the game. */
  realWorld?: boolean;
  /** Optional fixed context line for a specific real-world trophy. */
  detailLineHe?: string;
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

export const CESARIA_REAL_TROPHY_THEME_ID =
  'cesaria_summer_u6_third_2026';

export const PERSONAL_TROPHY_THEMES: TrophyDef[] = [
  {
    id: CESARIA_REAL_TROPHY_THEME_ID,
    nameHe: 'גביע אליפות הקיץ עד גיל 6',
    emoji: '🏆',
    imageFilename: 'cesaria-summer-u6-third-2026.png',
    assetKind: 'personal',
    realWorld: true,
    detailLineHe: 'ראשון לציון · יולי 2026',
  },
];

export type TrophyGrantEntry = {
  id: string;
  trophyTheme: string;
  caption: string;
  awardedAt: number;
};

export type PersonalTrophyGrant = {
  studentNames: string[];
  trophy: TrophyGrantEntry;
};

export const CESARIA_REAL_TROPHY_GRANT: PersonalTrophyGrant = {
  studentNames: ['קיסריה טראכטנברג', 'קיסריה'],
  trophy: {
    id: 'personal:cesaria:summer-u6-third-2026',
    trophyTheme: CESARIA_REAL_TROPHY_THEME_ID,
    caption: 'זכייה במקום השלישי באליפות הקיץ עד גיל 6',
    // Replaced with Date.now() when the trophy is actually granted in the game.
    awardedAt: 0,
  },
};

export const PERSONAL_TROPHY_GRANTS: PersonalTrophyGrant[] = [
  CESARIA_REAL_TROPHY_GRANT,
];

function normalizedStudentName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

/**
 * Adds configured personal trophies without mutating the supplied student.
 * The stable trophy id makes the grant idempotent across repeated logins.
 */
export function applyPersonalTrophyGrants<
  T extends { name: string; trophies: TrophyGrantEntry[] }
>(student: T): { student: T; changed: boolean } {
  const studentName = normalizedStudentName(student.name);
  let trophies = student.trophies;
  let changed = false;

  for (const grant of PERSONAL_TROPHY_GRANTS) {
    const matchesStudent = grant.studentNames.some(
      name => normalizedStudentName(name) === studentName
    );
    if (!matchesStudent) continue;

    if (trophies.some(trophy => trophy.id === grant.trophy.id)) continue;

    trophies = [
      ...trophies,
      {
        ...grant.trophy,
        // Trophy-room placement follows the order trophies enter the game,
        // while the real competition date is displayed separately in detailLineHe.
        awardedAt: Date.now(),
      },
    ];
    changed = true;
  }

  return changed
    ? { student: { ...student, trophies }, changed: true }
    : { student, changed: false };
}

export function getTrophyDefinition(themeId: string): TrophyDef | undefined {
  return (
    TROPHY_THEMES.find(theme => theme.id === themeId) ??
    PERSONAL_TROPHY_THEMES.find(theme => theme.id === themeId)
  );
}

export function isPersonalTrophyTheme(themeId: string): boolean {
  return PERSONAL_TROPHY_THEMES.some(theme => theme.id === themeId);
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
