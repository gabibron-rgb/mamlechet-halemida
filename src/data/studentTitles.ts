import { ITEMS } from './items';
import type { SpecialUnlockEntry } from './achievements';

export type StudentGender = 'male' | 'female';

type GenderedTitleLabel = {
  male: string;
  female: string;
};

const TITLE_LABELS: Record<string, GenderedTitleLabel> = {
  title_kingdom_resident: {
    male: 'תושב הממלכה',
    female: 'תושבת הממלכה',
  },
  title_young_adventurer: {
    male: 'הרפתקן צעיר',
    female: 'הרפתקנית צעירה',
  },
  title_beginner_collector: {
    male: 'אספן מתחיל',
    female: 'אספנית מתחילה',
  },
  title_room_designer: {
    male: 'מעצב החדר',
    female: 'מעצבת החדר',
  },
  title_animal_friend: {
    male: 'ידיד החיות',
    female: 'ידידת החיות',
  },
  title_mission_doer: {
    male: 'מבצע המשימות',
    female: 'מבצעת המשימות',
  },
  title_kingdom_partner: {
    male: 'שותף לממלכה',
    female: 'שותפה לממלכה',
  },
  title_kingdom_collector: {
    male: 'אספן הממלכה',
    female: 'אספנית הממלכה',
  },
  title_master_collector: {
    male: 'אוצר האוספים',
    female: 'אוצר האוספים',
  },
  title_legendary_companion: {
    male: 'חברות אגדית',
    female: 'חברות אגדית',
  },
  title_six_lights: {
    male: 'ששת האורות',
    female: 'ששת האורות',
  },
  title_friend_of_the_unicorn: {
    male: 'ידיד חד־הקרן',
    female: 'ידידת חד־הקרן',
  },
};

function cleanStoredTitleLabel(labelHe: string): string {
  const clean = labelHe.trim();
  const quoted = clean.match(/^התואר\s+[“\"](.+)[”\"]$/);
  if (quoted?.[1]) return quoted[1].trim();

  return clean.replace(/^התואר\s+/, '').replace(/^[“\"]|[”\"]$/g, '').trim();
}

export function studentTitleDisplayLabel(
  unlockId: string,
  labelHe: string,
  gender: StudentGender | null | undefined
): string {
  const variants = TITLE_LABELS[unlockId];

  if (variants) {
    if (variants.male === variants.female) return variants.male;
    if (gender === 'male') return variants.male;
    if (gender === 'female') return variants.female;
    return 'ממתין להגדרת בן/בת';
  }

  const fallback = cleanStoredTitleLabel(labelHe);
  if (!gender && fallback.includes('/')) return 'ממתין להגדרת בן/בת';
  return fallback;
}

export type BasicStudentTitleDefinition = {
  unlockId: string;
  labelHe: string;
  descriptionHe: string;
  isUnlocked: (student: BasicTitleStudentLike) => boolean;
};

type BasicTitleStudentLike = {
  id: string;
  level: number;
  inventory: Array<{
    itemId: string;
    kind?: 'item' | 'cosmetic' | 'box';
    placedZone?: unknown;
    roomX?: number | null;
    roomY?: number | null;
  }>;
  companion: {
    unlocked: boolean;
  };
  missions: Array<{
    completedAt: number | null;
    cancelledAt: number | null;
  }>;
  classGoals: Array<{
    id: string;
    completedAt: number | null;
    cancelledAt: number | null;
    contributionIds: string[];
  }>;
};

const COLLECTIBLE_ITEM_IDS = new Set(ITEMS.map(item => item.id));

function uniqueCollectibleCount(student: BasicTitleStudentLike): number {
  return new Set(
    (student.inventory ?? [])
      .filter(entry => entry.kind !== 'box' && COLLECTIBLE_ITEM_IDS.has(entry.itemId))
      .map(entry => entry.itemId)
  ).size;
}

function roomItemCount(student: BasicTitleStudentLike): number {
  return (student.inventory ?? []).filter(entry => {
    if (entry.kind === 'box') return false;
    return (
      entry.placedZone != null ||
      (typeof entry.roomX === 'number' && typeof entry.roomY === 'number')
    );
  }).length;
}

function completedMissionCount(student: BasicTitleStudentLike): number {
  return (student.missions ?? []).filter(
    mission => mission.completedAt !== null && mission.cancelledAt === null
  ).length;
}

function contributedCompletedClassGoalCount(student: BasicTitleStudentLike): number {
  return (student.classGoals ?? []).filter(goal => {
    if (goal.completedAt === null || goal.cancelledAt !== null) return false;

    return (goal.contributionIds ?? []).some(contributionId =>
      contributionId.startsWith(`mission:${student.id}:`) ||
      contributionId.startsWith(`behavior:${student.id}:`) ||
      contributionId.startsWith(`behavior-day:${goal.id}:${student.id}:`)
    );
  }).length;
}

export const BASIC_STUDENT_TITLES: BasicStudentTitleDefinition[] = [
  {
    unlockId: 'title_kingdom_resident',
    labelHe: 'התואר “תושב הממלכה”',
    descriptionHe: 'תואר בסיסי שפתוח לכל תלמיד בממלכה.',
    isUnlocked: () => true,
  },
  {
    unlockId: 'title_young_adventurer',
    labelHe: 'התואר “הרפתקן צעיר”',
    descriptionHe: 'להגיע לרמה 2.',
    isUnlocked: student => student.level >= 2,
  },
  {
    unlockId: 'title_beginner_collector',
    labelHe: 'התואר “אספן מתחיל”',
    descriptionHe: 'לאסוף 10 חפצים שונים.',
    isUnlocked: student => uniqueCollectibleCount(student) >= 10,
  },
  {
    unlockId: 'title_room_designer',
    labelHe: 'התואר “מעצב החדר”',
    descriptionHe: 'להציב לפחות 5 חפצים בחדר.',
    isUnlocked: student => roomItemCount(student) >= 5,
  },
  {
    unlockId: 'title_animal_friend',
    labelHe: 'התואר “ידיד החיות”',
    descriptionHe: 'לפתוח את חיית המחמד הראשונה.',
    isUnlocked: student => student.companion?.unlocked === true,
  },
  {
    unlockId: 'title_mission_doer',
    labelHe: 'התואר “מבצע המשימות”',
    descriptionHe: 'להשלים 3 משימות אישיות.',
    isUnlocked: student => completedMissionCount(student) >= 3,
  },
  {
    unlockId: 'title_kingdom_partner',
    labelHe: 'התואר “שותף לממלכה”',
    descriptionHe: 'לתרום ליעד כיתתי שהושלם.',
    isUnlocked: student => contributedCompletedClassGoalCount(student) >= 1,
  },
];

export function reconcileBasicStudentTitles(
  student: BasicTitleStudentLike,
  currentUnlocks: SpecialUnlockEntry[],
  now = Date.now()
): { unlocks: SpecialUnlockEntry[]; newlyUnlockedIds: string[] } {
  const next = [...(currentUnlocks ?? [])];
  const existingTitleIds = new Set(
    next.filter(unlock => unlock.kind === 'title').map(unlock => unlock.unlockId)
  );
  const newlyUnlockedIds: string[] = [];

  for (const definition of BASIC_STUDENT_TITLES) {
    if (existingTitleIds.has(definition.unlockId)) continue;
    if (!definition.isUnlocked(student)) continue;

    next.push({
      unlockId: definition.unlockId,
      kind: 'title',
      labelHe: definition.labelHe,
      sourceAchievementId: `basic-title:${definition.unlockId}`,
      unlockedAt: now,
    });
    existingTitleIds.add(definition.unlockId);
    newlyUnlockedIds.push(definition.unlockId);
  }

  return { unlocks: next, newlyUnlockedIds };
}
