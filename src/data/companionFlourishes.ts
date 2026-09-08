import type { CompanionBehaviorMemory } from './companionTraits';

export type CompanionFlourishId =
  | 'perseverance'
  | 'friendship'
  | 'creativity'
  | 'curiosity'
  | 'helping'
  | 'breakthrough';

export type CompanionFlourish = {
  id: CompanionFlourishId;
  nameHe: string;
  emoji: string;
  descriptionHe: string;
  effectParticles: [string, string];
  glowColor: string;
  reasonId: string;
  ceremonyMessageHe: string;
};

export type CompanionFlourishLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type CompanionFlourishLevelDefinition = {
  level: Exclude<CompanionFlourishLevel, 0>;
  minDays: number;
  nameHe: string;
  icon: string;
};

export type CompanionFlourishProgress = {
  days: number;
  level: CompanionFlourishLevel;
  current: CompanionFlourishLevelDefinition | null;
  next: CompanionFlourishLevelDefinition | null;
  daysToNext: number;
  percentToNext: number;
};

export const COMPANION_FLOURISH_LEVELS: CompanionFlourishLevelDefinition[] = [
  { level: 1, minDays: 1, nameHe: 'התחלה', icon: '🌱' },
  { level: 2, minDays: 3, nameHe: 'מתפתח', icon: '🥉' },
  { level: 3, minDays: 7, nameHe: 'חזק', icon: '🥈' },
  { level: 4, minDays: 12, nameHe: 'מצטיין', icon: '🥇' },
  { level: 5, minDays: 20, nameHe: 'מאסטר', icon: '👑' },
];

export const COMPANION_FLOURISHES: CompanionFlourish[] = [
  {
    id: 'perseverance',
    nameHe: 'אות ההתמדה',
    emoji: '🔥',
    descriptionHe: 'על המשך מאמץ גם כשהאתגר קשה',
    effectParticles: ['🔥', '✨'],
    glowColor: '#fb923c',
    reasonId: 'perseverance',
    ceremonyMessageHe: 'ראיתי שלא ויתרת גם כשהיה קשה. אני רוצה לזכור את זה.',
  },
  {
    id: 'friendship',
    nameHe: 'אות החברות',
    emoji: '❤️',
    descriptionHe: 'על חברות, אכפתיות ויחס טוב לאחרים',
    effectParticles: ['💗', '💕'],
    glowColor: '#fb7185',
    reasonId: 'teamwork',
    ceremonyMessageHe: 'כשחיזקת אחרים והיית חבר טוב, גם אני הרגשתי שאנחנו חזקים יותר יחד.',
  },
  {
    id: 'creativity',
    nameHe: 'אות היצירתיות',
    emoji: '🎨',
    descriptionHe: 'על רעיון מקורי וחשיבה בדרך חדשה',
    effectParticles: ['🎨', '🌈'],
    glowColor: '#e879f9',
    reasonId: 'creativity',
    ceremonyMessageHe: 'זה היה רעיון מיוחד משלך — דרך חדשה שאף אחד אחר לא היה חייב לחשוב עליה.',
  },
  {
    id: 'curiosity',
    nameHe: 'אות הסקרנות',
    emoji: '🔬',
    descriptionHe: 'על שאלות עמוקות ורצון אמיתי לגלות',
    effectParticles: ['💡', '❓'],
    glowColor: '#22d3ee',
    reasonId: 'deep_question',
    ceremonyMessageHe: 'השאלה הזאת פתחה לנו דרך חדשה לגלות. אני אוהב כשאנחנו ממשיכים לחפש.',
  },
  {
    id: 'helping',
    nameHe: 'אות העזרה לאחר',
    emoji: '🤝',
    descriptionHe: 'על עזרה משמעותית לחבר או לכיתה',
    effectParticles: ['🤝', '✨'],
    glowColor: '#34d399',
    reasonId: 'help_friend',
    ceremonyMessageHe: 'עשית משהו שהיה חשוב למישהו אחר. זה סוג כוח שאני רוצה לקחת איתנו.',
  },
  {
    id: 'breakthrough',
    nameHe: 'אות פריצת הדרך',
    emoji: '🌟',
    descriptionHe: 'על התקדמות מיוחדת והתגברות על קושי',
    effectParticles: ['🌟', '⚡'],
    glowColor: '#fde047',
    reasonId: 'problem_solve',
    ceremonyMessageHe: 'משהו שהיה קשה פעם כבר לא עוצר אותך. זאת באמת פריצת דרך!',
  },
];

export const COMPANION_FLOURISH_BY_ID = Object.fromEntries(
  COMPANION_FLOURISHES.map(flourish => [flourish.id, flourish])
) as Record<CompanionFlourishId, CompanionFlourish>;

export function getCompanionFlourish(
  flourishId: string
): CompanionFlourish | undefined {
  return COMPANION_FLOURISHES.find(flourish => flourish.id === flourishId);
}

export function getCompanionFlourishLevelDefinition(
  level: number
): CompanionFlourishLevelDefinition | null {
  return (
    COMPANION_FLOURISH_LEVELS.find(definition => definition.level === level) ??
    null
  );
}

export function getCompanionFlourishLevelForDays(
  days: number
): CompanionFlourishLevel {
  const safeDays = Math.max(0, Math.floor(days));
  let level: CompanionFlourishLevel = 0;

  for (const definition of COMPANION_FLOURISH_LEVELS) {
    if (safeDays >= definition.minDays) {
      level = definition.level;
    }
  }

  return level;
}

function flourishDayKey(timestamp: number): string {
  const date = new Date(timestamp);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export function getCompanionFlourishDayCount(
  memories: CompanionBehaviorMemory[],
  flourishId: string
): number {
  const flourish = getCompanionFlourish(flourishId);
  if (!flourish) return 0;

  const days = new Set<string>();

  for (const memory of memories) {
    if (memory.source !== 'flourish') continue;
    if (memory.reasonId !== flourish.reasonId) continue;
    days.add(flourishDayKey(memory.awardedAt));
  }

  return days.size;
}

export function hasCompanionFlourishAwardOnDay(
  memories: CompanionBehaviorMemory[],
  flourishId: string,
  timestamp: number = Date.now()
): boolean {
  const flourish = getCompanionFlourish(flourishId);
  if (!flourish) return false;
  const targetDay = flourishDayKey(timestamp);

  return memories.some(
    memory =>
      memory.source === 'flourish' &&
      memory.reasonId === flourish.reasonId &&
      flourishDayKey(memory.awardedAt) === targetDay
  );
}

export function getCompanionFlourishProgress(
  memories: CompanionBehaviorMemory[],
  flourishId: string
): CompanionFlourishProgress {
  const days = getCompanionFlourishDayCount(memories, flourishId);
  const level = getCompanionFlourishLevelForDays(days);
  const current = getCompanionFlourishLevelDefinition(level);
  const next =
    COMPANION_FLOURISH_LEVELS.find(definition => definition.minDays > days) ??
    null;

  if (!next) {
    return {
      days,
      level,
      current,
      next: null,
      daysToNext: 0,
      percentToNext: 100,
    };
  }

  const currentFloor = current?.minDays ?? 0;
  const span = Math.max(1, next.minDays - currentFloor);
  const progressWithinLevel = Math.max(0, days - currentFloor);

  return {
    days,
    level,
    current,
    next,
    daysToNext: Math.max(0, next.minDays - days),
    percentToNext: Math.max(
      0,
      Math.min(100, Math.round((progressWithinLevel / span) * 100))
    ),
  };
}

export function normalizeCompanionFlourishLevelRecord(
  value: unknown,
  fallbackIds: string[] = []
): Record<string, CompanionFlourishLevel> {
  const result: Record<string, CompanionFlourishLevel> = {};

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, rawLevel] of Object.entries(value as Record<string, unknown>)) {
      if (!getCompanionFlourish(key)) continue;
      if (typeof rawLevel !== 'number' || !Number.isFinite(rawLevel)) continue;

      const safeLevel = Math.max(0, Math.min(5, Math.floor(rawLevel))) as CompanionFlourishLevel;
      if (safeLevel > 0) result[key] = safeLevel;
    }
  }

  for (const flourishId of fallbackIds) {
    if (getCompanionFlourish(flourishId) && !result[flourishId]) {
      result[flourishId] = 1;
    }
  }

  return result;
}
