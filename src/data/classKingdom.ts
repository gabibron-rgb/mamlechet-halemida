import type { BoxTier } from './boxes';
import {
  isClassGoalActive,
  isClassGoalCompleted,
  type StudentClassGoal,
} from './classGoals';

export type ClassKingdomLevel = {
  level: number;
  minStars: number;
  titleHe: string;
  emoji: string;
  descriptionHe: string;
};

export type ClassKingdomMilestone = {
  stars: number;
  titleHe: string;
  emoji: string;
  descriptionHe: string;
};

export type ClassKingdomReward = {
  level: number;
  minStars: number;
  titleHe: string;
  emoji: string;
  descriptionHe: string;
  kind: 'box' | 'themeUnlock';
  boxTier?: BoxTier;
};

export const CLASS_KINGDOM_LEVELS: ClassKingdomLevel[] = [
  {
    level: 1,
    minStars: 0,
    titleHe: 'הממלכה מתחילה',
    emoji: '🌱',
    descriptionHe: 'הכיתה מתחילה לבנות סיפור משותף.',
  },
  {
    level: 2,
    minStars: 2,
    titleHe: 'ממלכה צומחת',
    emoji: '🌿',
    descriptionHe: 'כבר יש כמה הצלחות שאפשר להתגאות בהן.',
  },
  {
    level: 3,
    minStars: 5,
    titleHe: 'ממלכה מאוחדת',
    emoji: '🤝',
    descriptionHe: 'שיתוף הפעולה של הכיתה כבר מתחיל לבנות מסורת.',
  },
  {
    level: 4,
    minStars: 9,
    titleHe: 'ממלכה משגשגת',
    emoji: '🏰',
    descriptionHe: 'הכיתה צברה רצף מרשים של הישגים משותפים.',
  },
  {
    level: 5,
    minStars: 14,
    titleHe: 'ממלכת מצוינות',
    emoji: '👑',
    descriptionHe: 'ההשקעה המשותפת כבר הפכה לחלק מהזהות של הכיתה.',
  },
  {
    level: 6,
    minStars: 20,
    titleHe: 'ממלכה אגדית',
    emoji: '✨',
    descriptionHe: 'הממלכה נבנתה לאורך זמן מתוך המון הצלחות משותפות.',
  },
];

export const CLASS_KINGDOM_REWARDS: ClassKingdomReward[] = [
  {
    level: 2,
    minStars: 2,
    titleHe: 'מתנת הממלכה הראשונה',
    emoji: '📦',
    descriptionHe: 'קופסת עץ חינם בנושא שכבר פתחת.',
    kind: 'box',
    boxTier: 'wooden',
  },
  {
    level: 3,
    minStars: 5,
    titleHe: 'מפתח לעולם חדש',
    emoji: '🗝️',
    descriptionHe: 'פתיחת נושא נוסף לקופסאות. אם כל הנושאים כבר פתוחים, מתקבלת קופסת כסף במקום.',
    kind: 'themeUnlock',
  },
  {
    level: 4,
    minStars: 9,
    titleHe: 'אוצר הכסף',
    emoji: '🎁',
    descriptionHe: 'קופסת כסף חינם בנושא שכבר פתחת.',
    kind: 'box',
    boxTier: 'silver',
  },
  {
    level: 5,
    minStars: 14,
    titleHe: 'אוצר הכתר',
    emoji: '🏆',
    descriptionHe: 'קופסת זהב חינם בנושא שכבר פתחת.',
    kind: 'box',
    boxTier: 'golden',
  },
  {
    level: 6,
    minStars: 20,
    titleHe: 'מתנת הממלכה האגדית',
    emoji: '🔮',
    descriptionHe: 'קופסה מסתורית חינם בנושא שכבר פתחת.',
    kind: 'box',
    boxTier: 'mystic',
  },
];

export const CLASS_KINGDOM_MILESTONES: ClassKingdomMilestone[] = [
  {
    stars: 1,
    titleHe: 'חותם ההתחלה',
    emoji: '⭐',
    descriptionHe: 'היעד הכיתתי הראשון הושלם.',
  },
  {
    stars: 3,
    titleHe: 'חותם השותפות',
    emoji: '🤝',
    descriptionHe: 'שלושה יעדים הושלמו בעבודה משותפת.',
  },
  {
    stars: 6,
    titleHe: 'חותם ההתמדה',
    emoji: '🔥',
    descriptionHe: 'הכיתה ממשיכה להתקדם גם לאורך זמן.',
  },
  {
    stars: 10,
    titleHe: 'מגן הממלכה',
    emoji: '🛡️',
    descriptionHe: 'עשרה הישגים משותפים כבר נכנסו להיסטוריה.',
  },
  {
    stars: 15,
    titleHe: 'מפתח הגילוי',
    emoji: '🗝️',
    descriptionHe: 'הממלכה הגיעה לאבן דרך גדולה במיוחד.',
  },
  {
    stars: 22,
    titleHe: 'כתר האחדות',
    emoji: '👑',
    descriptionHe: 'הכיתה בנתה אוסף נדיר של הצלחות משותפות.',
  },
];

export function completedClassGoals(goals: StudentClassGoal[]): StudentClassGoal[] {
  const byId = new Map<string, StudentClassGoal>();

  for (const goal of goals) {
    if (!isClassGoalCompleted(goal)) continue;

    const current = byId.get(goal.id);
    if (!current || (goal.completedAt ?? 0) > (current.completedAt ?? 0)) {
      byId.set(goal.id, goal);
    }
  }

  return Array.from(byId.values()).sort(
    (first, second) => (second.completedAt ?? 0) - (first.completedAt ?? 0)
  );
}

export function activeClassGoal(goals: StudentClassGoal[]): StudentClassGoal | null {
  return (
    [...goals]
      .filter(isClassGoalActive)
      .sort((first, second) => second.createdAt - first.createdAt)[0] ?? null
  );
}

export function classKingdomStars(goals: StudentClassGoal[]): number {
  return completedClassGoals(goals).length;
}

export function classKingdomLevel(stars: number): ClassKingdomLevel {
  const safeStars = Math.max(0, Math.floor(stars));
  let result = CLASS_KINGDOM_LEVELS[0];

  for (const level of CLASS_KINGDOM_LEVELS) {
    if (safeStars >= level.minStars) result = level;
  }

  return result;
}

export function nextClassKingdomLevel(stars: number): ClassKingdomLevel | null {
  const safeStars = Math.max(0, Math.floor(stars));
  return CLASS_KINGDOM_LEVELS.find(level => level.minStars > safeStars) ?? null;
}

export function classKingdomLevelProgress(stars: number): {
  current: number;
  needed: number;
  pct: number;
} {
  const safeStars = Math.max(0, Math.floor(stars));
  const currentLevel = classKingdomLevel(safeStars);
  const nextLevel = nextClassKingdomLevel(safeStars);

  if (!nextLevel) {
    return { current: 1, needed: 1, pct: 100 };
  }

  const span = Math.max(1, nextLevel.minStars - currentLevel.minStars);
  const current = Math.max(0, safeStars - currentLevel.minStars);

  return {
    current,
    needed: span,
    pct: Math.min(100, Math.round((current / span) * 100)),
  };
}

export function normalizeClassKingdomClaimedRewards(value: unknown): number[] {
  if (!Array.isArray(value)) return [];

  const validLevels = new Set(CLASS_KINGDOM_REWARDS.map(reward => reward.level));
  return Array.from(
    new Set(
      value
        .filter((entry): entry is number => typeof entry === 'number' && Number.isFinite(entry))
        .map(entry => Math.floor(entry))
        .filter(level => validLevels.has(level))
    )
  ).sort((first, second) => first - second);
}

export function classKingdomRewardForLevel(
  level: number
): ClassKingdomReward | null {
  return CLASS_KINGDOM_REWARDS.find(reward => reward.level === level) ?? null;
}

export function unlockedClassKingdomRewards(
  stars: number
): ClassKingdomReward[] {
  const safeStars = Math.max(0, Math.floor(stars));
  return CLASS_KINGDOM_REWARDS.filter(reward => safeStars >= reward.minStars);
}

export function nextClassKingdomReward(
  stars: number
): ClassKingdomReward | null {
  const safeStars = Math.max(0, Math.floor(stars));
  return CLASS_KINGDOM_REWARDS.find(reward => reward.minStars > safeStars) ?? null;
}

export function unlockedClassKingdomMilestones(
  stars: number
): ClassKingdomMilestone[] {
  return CLASS_KINGDOM_MILESTONES.filter(milestone => stars >= milestone.stars);
}

export function nextClassKingdomMilestone(
  stars: number
): ClassKingdomMilestone | null {
  return CLASS_KINGDOM_MILESTONES.find(milestone => milestone.stars > stars) ?? null;
}
