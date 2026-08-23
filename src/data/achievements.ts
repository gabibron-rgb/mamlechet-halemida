import type { BoxTier } from './boxes';
import { ITEMS } from './items';
import type { StudentClassGoal } from './classGoals';
import type { StudentMission } from './missions';
import type { CompanionStage } from './companionWorlds';
import { COMPANION_STAGE_ORDER } from './companionWorlds';
import type { ThemeId } from './themes';

export type AchievementCategory =
  | 'collection'
  | 'exploration'
  | 'companion'
  | 'missions'
  | 'kingdom'
  | 'room'
  | 'recognition'
  | 'progress';

export type AchievementDifficulty =
  | 'easy'
  | 'medium'
  | 'hard'
  | 'legendary';

export type SpecialUnlockKind =
  | 'pet'
  | 'title'
  | 'room'
  | 'character'
  | 'feature';

export type AchievementReward =
  | {
      kind: 'box';
      tier: BoxTier;
      labelHe: string;
    }
  | {
      kind: 'inventoryItem';
      itemId: string;
      inventoryKind: 'item' | 'cosmetic';
      labelHe: string;
    }
  | {
      kind: 'themeUnlock';
      themeId: ThemeId;
      labelHe: string;
    }
  | {
      kind: 'specialUnlock';
      unlockKind: SpecialUnlockKind;
      unlockId: string;
      labelHe: string;
    };

export type AchievementCondition =
  | { kind: 'uniqueCollectibles'; target: number }
  | { kind: 'completedCollections'; target: number }
  | { kind: 'unlockedThemes'; target: number }
  | { kind: 'legendaryCollectibles'; target: number }
  | { kind: 'collectibleThemesOwned'; target: number }
  | { kind: 'studentLevel'; target: number }
  | { kind: 'completedMissions'; target: number }
  | { kind: 'companionStage'; stage: CompanionStage }
  | { kind: 'distinctTrophyThemes'; target: number }
  | { kind: 'roomItems'; target: number }
  | { kind: 'completedClassGoalsContributed'; target: number };

export type AchievementDefinition = {
  id: string;
  titleHe: string;
  descriptionHe: string;
  emoji: string;
  category: AchievementCategory;
  difficulty: AchievementDifficulty;
  hidden?: boolean;
  condition: AchievementCondition;
  rewards?: AchievementReward[];
};

export type AchievementRecord = {
  achievementId: string;
  achievedAt: number;
  rewardClaimedAt: number | null;
};

export type SpecialUnlockEntry = {
  unlockId: string;
  kind: SpecialUnlockKind;
  labelHe: string;
  sourceAchievementId: string;
  unlockedAt: number;
};

export type AchievementStudentLike = {
  id: string;
  level: number;
  inventory: Array<{
    itemId: string;
    kind?: 'item' | 'cosmetic' | 'box';
    placedZone?: unknown;
    roomX?: number | null;
    roomY?: number | null;
  }>;
  unlockedThemes: ThemeId[];
  companion: {
    stage: CompanionStage;
  };
  missions: StudentMission[];
  classGoals: StudentClassGoal[];
  trophies: Array<{ trophyTheme: string }>;
  specialUnlocks?: Array<{ kind: SpecialUnlockKind; unlockId: string }>;
};

export type AchievementProgress = {
  current: number;
  target: number;
  pct: number;
  complete: boolean;
};

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first_collectible',
    titleHe: 'הפריט הראשון באוסף',
    descriptionHe: 'לגלות חפץ ראשון שמגיע מאחת מקופסאות הנושא.',
    emoji: '📦',
    category: 'collection',
    difficulty: 'easy',
    condition: { kind: 'uniqueCollectibles', target: 1 },
  },
  {
    id: 'collector_10',
    titleHe: 'אספן מתחיל',
    descriptionHe: 'לגלות 10 חפצי קופסאות שונים.',
    emoji: '🎒',
    category: 'collection',
    difficulty: 'easy',
    condition: { kind: 'uniqueCollectibles', target: 10 },
  },
  {
    id: 'collector_25',
    titleHe: 'המדפים מתמלאים',
    descriptionHe: 'לגלות 25 חפצי קופסאות שונים.',
    emoji: '🗃️',
    category: 'collection',
    difficulty: 'medium',
    condition: { kind: 'uniqueCollectibles', target: 25 },
    rewards: [
      {
        kind: 'inventoryItem',
        itemId: 'achievement_collector_statuette',
        inventoryKind: 'item',
        labelHe: '🏺 פסלון האספן — פריט בלעדי להישג',
      },
    ],
  },
  {
    id: 'collector_50',
    titleHe: 'אספן רציני',
    descriptionHe: 'לגלות 50 חפצי קופסאות שונים.',
    emoji: '💎',
    category: 'collection',
    difficulty: 'hard',
    condition: { kind: 'uniqueCollectibles', target: 50 },
    rewards: [
      {
        kind: 'inventoryItem',
        itemId: 'achievement_crystal_showcase',
        inventoryKind: 'item',
        labelHe: '💎 ויטרינת הקריסטל — פריט בלעדי להישג',
      },
    ],
  },
  {
    id: 'collector_100',
    titleHe: 'אוצר הממלכה',
    descriptionHe: 'לגלות 100 חפצי קופסאות שונים.',
    emoji: '👑',
    category: 'collection',
    difficulty: 'legendary',
    condition: { kind: 'uniqueCollectibles', target: 100 },
    rewards: [
      {
        kind: 'inventoryItem',
        itemId: 'achievement_kingdom_treasure_statue',
        inventoryKind: 'item',
        labelHe: '👑 פסל אוצר הממלכה — פריט בלעדי להישג',
      },
      {
        kind: 'specialUnlock',
        unlockKind: 'room',
        unlockId: 'room_treasure_gallery',
        labelHe: '🏰 חדר נוסף: גלריית האוצרות',
      },
    ],
  },
  {
    id: 'collection_complete_1',
    titleHe: 'אוסף מושלם',
    descriptionHe: 'להשלים אוסף נושא אחד במלואו.',
    emoji: '🏆',
    category: 'collection',
    difficulty: 'medium',
    condition: { kind: 'completedCollections', target: 1 },
  },
  {
    id: 'collection_complete_3',
    titleHe: 'אספן הממלכה',
    descriptionHe: 'להשלים שלושה אוספי נושא שונים במלואם.',
    emoji: '🗝️',
    category: 'collection',
    difficulty: 'hard',
    condition: { kind: 'completedCollections', target: 3 },
    rewards: [
      { kind: 'box', tier: 'golden', labelHe: 'קופסת זהב לבחירת נושא' },
      {
        kind: 'specialUnlock',
        unlockKind: 'title',
        unlockId: 'title_kingdom_collector',
        labelHe: 'התואר “אספן הממלכה”',
      },
    ],
  },
  {
    id: 'collection_complete_5',
    titleHe: 'שומר האוספים',
    descriptionHe: 'להשלים חמישה אוספי נושא שונים במלואם.',
    emoji: '🏛️',
    category: 'collection',
    difficulty: 'legendary',
    condition: { kind: 'completedCollections', target: 5 },
    rewards: [
      { kind: 'box', tier: 'mystic', labelHe: 'קופסה מסתורית לבחירת נושא' },
      {
        kind: 'specialUnlock',
        unlockKind: 'title',
        unlockId: 'title_master_collector',
        labelHe: 'התואר “אוצר האוספים”',
      },
    ],
  },
  {
    id: 'themes_5',
    titleHe: 'חוקר עולמות',
    descriptionHe: 'לפתוח חמישה נושאים שונים לקופסאות.',
    emoji: '🌍',
    category: 'exploration',
    difficulty: 'medium',
    condition: { kind: 'unlockedThemes', target: 5 },
  },
  {
    id: 'first_legendary',
    titleHe: 'זה באמת אגדי',
    descriptionHe: 'לגלות חפץ Legendary ראשון מתוך קופסה.',
    emoji: '✨',
    category: 'collection',
    difficulty: 'medium',
    condition: { kind: 'legendaryCollectibles', target: 1 },
  },
  {
    id: 'legendary_5',
    titleHe: 'חמש אגדות',
    descriptionHe: 'לגלות חמישה חפצי Legendary שונים מתוך קופסאות.',
    emoji: '🔥',
    category: 'collection',
    difficulty: 'hard',
    condition: { kind: 'legendaryCollectibles', target: 5 },
    rewards: [
      {
        kind: 'inventoryItem',
        itemId: 'achievement_legends_pedestal',
        inventoryKind: 'item',
        labelHe: '🔥 כן האגדות — פריט בלעדי להישג',
      },
    ],
  },
  {
    id: 'mission_1',
    titleHe: 'המשימה הראשונה',
    descriptionHe: 'להשלים משימה אישית ראשונה.',
    emoji: '🎯',
    category: 'missions',
    difficulty: 'easy',
    condition: { kind: 'completedMissions', target: 1 },
  },
  {
    id: 'mission_10',
    titleHe: 'אפשר לסמוך עליי',
    descriptionHe: 'להשלים 10 משימות אישיות.',
    emoji: '📋',
    category: 'missions',
    difficulty: 'hard',
    condition: { kind: 'completedMissions', target: 10 },
  },
  {
    id: 'class_goal_contributor',
    titleHe: 'חלק מהממלכה',
    descriptionHe: 'לתרום אישית ליעד כיתתי שהושלם.',
    emoji: '🏰',
    category: 'kingdom',
    difficulty: 'easy',
    condition: { kind: 'completedClassGoalsContributed', target: 1 },
  },
  {
    id: 'room_first_item',
    titleHe: 'מרגיש כמו בבית',
    descriptionHe: 'להציב חפץ ראשון בחדר.',
    emoji: '🏠',
    category: 'room',
    difficulty: 'easy',
    condition: { kind: 'roomItems', target: 1 },
  },
  {
    id: 'companion_hatchling',
    titleHe: 'חבר חדש',
    descriptionHe: 'לעזור לביצה לבקוע.',
    emoji: '🐣',
    category: 'companion',
    difficulty: 'medium',
    condition: { kind: 'companionStage', stage: 'hatchling' },
  },
  {
    id: 'companion_grown',
    titleHe: 'גדלים ביחד',
    descriptionHe: 'לעזור לחיית המחמד להגיע לשלב הבוגר.',
    emoji: '🐾',
    category: 'companion',
    difficulty: 'hard',
    condition: { kind: 'companionStage', stage: 'grown' },
  },
  {
    id: 'companion_legendary',
    titleHe: 'חברות אגדית',
    descriptionHe: 'לעזור לחיית המחמד להגיע לצורה האגדית שלה.',
    emoji: '🌟',
    category: 'companion',
    difficulty: 'legendary',
    condition: { kind: 'companionStage', stage: 'legendary' },
    rewards: [
      {
        kind: 'specialUnlock',
        unlockKind: 'title',
        unlockId: 'title_legendary_companion',
        labelHe: 'התואר “חברות אגדית”',
      },
    ],
  },
  {
    id: 'level_6_room',
    titleHe: 'הבית מתרחב',
    descriptionHe: 'להגיע לרמה אישית 6 ולפתוח את חדר התחביבים.',
    emoji: '🧩',
    category: 'progress',
    difficulty: 'easy',
    condition: { kind: 'studentLevel', target: 6 },
  },
  {
    id: 'level_10',
    titleHe: 'ותיק בממלכה',
    descriptionHe: 'להגיע לרמה אישית 10.',
    emoji: '🔟',
    category: 'progress',
    difficulty: 'medium',
    condition: { kind: 'studentLevel', target: 10 },
  },
  {
    id: 'level_15',
    titleHe: 'שם מוכר בממלכה',
    descriptionHe: 'להגיע לרמה אישית 15.',
    emoji: '🌠',
    category: 'progress',
    difficulty: 'hard',
    condition: { kind: 'studentLevel', target: 15 },
  },
  {
    id: 'all_trophy_types',
    titleHe: 'שישה צדדים של מצוינות',
    descriptionHe: 'לקבל לאורך הדרך לפחות גביע אחד מכל ששת סוגי הגביעים.',
    emoji: '🏆',
    category: 'recognition',
    difficulty: 'legendary',
    condition: { kind: 'distinctTrophyThemes', target: 6 },
    rewards: [
      {
        kind: 'specialUnlock',
        unlockKind: 'title',
        unlockId: 'title_six_lights',
        labelHe: 'התואר “ששת האורות”',
      },
      {
        kind: 'inventoryItem',
        itemId: 'achievement_hall_of_fame_banner',
        inventoryKind: 'item',
        labelHe: '🏛️ דגל היכל התהילה — פריט בלעדי להישג',
      },
    ],
  },

  // הישגים סודיים — השם והתיאור נחשפים רק לאחר ההשלמה.
  {
    id: 'secret_three_legendaries',
    titleHe: 'אגדה לא באה לבד',
    descriptionHe: 'לגלות שלושה חפצי Legendary שונים.',
    emoji: '🌌',
    category: 'collection',
    difficulty: 'hard',
    hidden: true,
    condition: { kind: 'legendaryCollectibles', target: 3 },
  },
  {
    id: 'secret_eight_worlds',
    titleHe: 'מטייל בין עולמות',
    descriptionHe: 'להחזיק חפצי קופסאות משמונה נושאים שונים.',
    emoji: '🧭',
    category: 'exploration',
    difficulty: 'hard',
    hidden: true,
    condition: { kind: 'collectibleThemesOwned', target: 8 },
  },
  {
    id: 'secret_room_12',
    titleHe: 'אין מקום על הקירות',
    descriptionHe: 'להציב 12 חפצים שונים בחדר בו-זמנית.',
    emoji: '😄',
    category: 'room',
    difficulty: 'medium',
    hidden: true,
    condition: { kind: 'roomItems', target: 12 },
  },
];

export const ACHIEVEMENT_CATEGORY_LABELS: Record<AchievementCategory, string> = {
  collection: 'אוספים',
  exploration: 'גילוי',
  companion: 'חיית מחמד',
  missions: 'משימות',
  kingdom: 'הממלכה',
  room: 'החדר',
  recognition: 'הוקרה',
  progress: 'התקדמות',
};

export const ACHIEVEMENT_DIFFICULTY_LABELS: Record<AchievementDifficulty, string> = {
  easy: 'אבן דרך',
  medium: 'הישג',
  hard: 'הישג קשה',
  legendary: 'הישג נדיר במיוחד',
};

const COLLECTIBLE_ITEMS = ITEMS.filter(item => item.source === 'box');
const COLLECTIBLE_ITEM_IDS = new Set(COLLECTIBLE_ITEMS.map(item => item.id));
const LEGENDARY_COLLECTIBLE_IDS = new Set(
  COLLECTIBLE_ITEMS.filter(item => item.rarity === 'legendary').map(item => item.id)
);

function uniqueOwnedCollectibleIds(student: AchievementStudentLike): Set<string> {
  return new Set(
    student.inventory
      .filter(entry => entry.kind !== 'box' && COLLECTIBLE_ITEM_IDS.has(entry.itemId))
      .map(entry => entry.itemId)
  );
}

function completedCollectionCount(student: AchievementStudentLike): number {
  const owned = uniqueOwnedCollectibleIds(student);
  const byTheme = new Map<string, string[]>();

  for (const item of COLLECTIBLE_ITEMS) {
    const ids = byTheme.get(item.theme) ?? [];
    ids.push(item.id);
    byTheme.set(item.theme, ids);
  }

  let completed = 0;
  for (const ids of byTheme.values()) {
    if (ids.length > 0 && ids.every(id => owned.has(id))) completed += 1;
  }
  return completed;
}

function completedMissionCount(student: AchievementStudentLike): number {
  return (student.missions ?? []).filter(
    mission => mission.completedAt !== null && mission.cancelledAt === null
  ).length;
}

function roomItemCount(student: AchievementStudentLike): number {
  return student.inventory.filter(entry => {
    if (entry.kind === 'box') return false;
    return (
      entry.placedZone != null ||
      (typeof entry.roomX === 'number' && typeof entry.roomY === 'number')
    );
  }).length;
}

function contributedCompletedClassGoalCount(student: AchievementStudentLike): number {
  return (student.classGoals ?? []).filter(goal => {
    if (goal.completedAt === null || goal.cancelledAt !== null) return false;

    return goal.contributionIds.some(contributionId =>
      contributionId.startsWith(`mission:${student.id}:`) ||
      contributionId.startsWith(`behavior:${student.id}:`) ||
      contributionId.startsWith(`behavior-day:${goal.id}:${student.id}:`)
    );
  }).length;
}

function collectibleThemeCount(student: AchievementStudentLike): number {
  const owned = uniqueOwnedCollectibleIds(student);
  return new Set(
    COLLECTIBLE_ITEMS
      .filter(item => owned.has(item.id))
      .map(item => item.theme)
  ).size;
}

export function achievementProgress(
  definition: AchievementDefinition,
  student: AchievementStudentLike
): AchievementProgress {
  const condition = definition.condition;
  let current = 0;
  let target = 1;

  switch (condition.kind) {
    case 'uniqueCollectibles':
      current = uniqueOwnedCollectibleIds(student).size;
      target = condition.target;
      break;
    case 'completedCollections':
      current = completedCollectionCount(student);
      target = condition.target;
      break;
    case 'unlockedThemes':
      current = new Set(
        (student.unlockedThemes ?? []).filter(themeId => themeId !== 'generic')
      ).size;
      target = condition.target;
      break;
    case 'legendaryCollectibles': {
      const owned = uniqueOwnedCollectibleIds(student);
      current = [...owned].filter(id => LEGENDARY_COLLECTIBLE_IDS.has(id)).length;
      target = condition.target;
      break;
    }
    case 'collectibleThemesOwned':
      current = collectibleThemeCount(student);
      target = condition.target;
      break;
    case 'studentLevel':
      current = Math.max(0, student.level ?? 0);
      target = condition.target;
      break;
    case 'completedMissions':
      current = completedMissionCount(student);
      target = condition.target;
      break;
    case 'companionStage': {
      const currentIndex = Math.max(0, COMPANION_STAGE_ORDER.indexOf(student.companion.stage));
      const targetIndex = Math.max(1, COMPANION_STAGE_ORDER.indexOf(condition.stage));
      current = currentIndex;
      target = targetIndex;
      break;
    }
    case 'distinctTrophyThemes':
      current = new Set((student.trophies ?? []).map(trophy => trophy.trophyTheme)).size;
      target = condition.target;
      break;
    case 'roomItems':
      current = roomItemCount(student);
      target = condition.target;
      break;
    case 'completedClassGoalsContributed':
      current = contributedCompletedClassGoalCount(student);
      target = condition.target;
      break;
  }

  const safeTarget = Math.max(1, target);
  return {
    current,
    target: safeTarget,
    pct: Math.min(100, Math.round((current / safeTarget) * 100)),
    complete: current >= safeTarget,
  };
}

export function normalizeAchievementRecords(value: unknown): AchievementRecord[] {
  if (!Array.isArray(value)) return [];
  const validIds = new Set(ACHIEVEMENTS.map(achievement => achievement.id));
  const byId = new Map<string, AchievementRecord>();

  for (const raw of value) {
    if (!raw || typeof raw !== 'object') continue;
    const entry = raw as Record<string, unknown>;
    const achievementId = typeof entry.achievementId === 'string' ? entry.achievementId : '';
    if (!validIds.has(achievementId)) continue;

    const achievedAt =
      typeof entry.achievedAt === 'number' && Number.isFinite(entry.achievedAt)
        ? Math.max(0, Math.floor(entry.achievedAt))
        : Date.now();
    const rewardClaimedAt =
      typeof entry.rewardClaimedAt === 'number' && Number.isFinite(entry.rewardClaimedAt)
        ? Math.max(0, Math.floor(entry.rewardClaimedAt))
        : null;

    const current = byId.get(achievementId);
    if (!current || achievedAt < current.achievedAt) {
      byId.set(achievementId, { achievementId, achievedAt, rewardClaimedAt });
    } else if (rewardClaimedAt !== null && current.rewardClaimedAt === null) {
      byId.set(achievementId, { ...current, rewardClaimedAt });
    }
  }

  return [...byId.values()].sort((a, b) => a.achievedAt - b.achievedAt);
}

export function normalizeSpecialUnlocks(value: unknown): SpecialUnlockEntry[] {
  if (!Array.isArray(value)) return [];
  const validKinds = new Set<SpecialUnlockKind>([
    'pet',
    'title',
    'room',
    'character',
    'feature',
  ]);
  const byKey = new Map<string, SpecialUnlockEntry>();

  for (const raw of value) {
    if (!raw || typeof raw !== 'object') continue;
    const entry = raw as Record<string, unknown>;
    const unlockId = typeof entry.unlockId === 'string' ? entry.unlockId.trim() : '';
    const kind = entry.kind as SpecialUnlockKind;
    const labelHe = typeof entry.labelHe === 'string' ? entry.labelHe.trim() : '';
    const sourceAchievementId =
      typeof entry.sourceAchievementId === 'string'
        ? entry.sourceAchievementId.trim()
        : '';
    const unlockedAt =
      typeof entry.unlockedAt === 'number' && Number.isFinite(entry.unlockedAt)
        ? Math.max(0, Math.floor(entry.unlockedAt))
        : Date.now();

    if (!unlockId || !labelHe || !sourceAchievementId || !validKinds.has(kind)) continue;
    byKey.set(`${kind}:${unlockId}`, {
      unlockId,
      kind,
      labelHe,
      sourceAchievementId,
      unlockedAt,
    });
  }

  return [...byKey.values()].sort((a, b) => a.unlockedAt - b.unlockedAt);
}

export function reconcileAchievementRecords(
  student: AchievementStudentLike,
  records: AchievementRecord[],
  now = Date.now()
): { records: AchievementRecord[]; newlyAchievedIds: string[] } {
  const normalized = normalizeAchievementRecords(records);
  const existingIds = new Set(normalized.map(record => record.achievementId));
  const newlyAchievedIds: string[] = [];
  const next = [...normalized];

  for (const definition of ACHIEVEMENTS) {
    if (existingIds.has(definition.id)) continue;
    if (!achievementProgress(definition, student).complete) continue;

    next.push({
      achievementId: definition.id,
      achievedAt: now,
      rewardClaimedAt: null,
    });
    existingIds.add(definition.id);
    newlyAchievedIds.push(definition.id);
  }

  return {
    records: next.sort((a, b) => a.achievedAt - b.achievedAt),
    newlyAchievedIds,
  };
}

export function achievementById(id: string): AchievementDefinition | null {
  return ACHIEVEMENTS.find(achievement => achievement.id === id) ?? null;
}

export function achievementHasMissingDurableReward(
  definition: AchievementDefinition,
  student: AchievementStudentLike
): boolean {
  return (definition.rewards ?? []).some(reward => {
    if (reward.kind === 'inventoryItem') {
      return !(student.inventory ?? []).some(entry => entry.itemId === reward.itemId);
    }

    if (reward.kind === 'themeUnlock') {
      return !(student.unlockedThemes ?? []).includes(reward.themeId);
    }

    if (reward.kind === 'specialUnlock') {
      return !(student.specialUnlocks ?? []).some(
        unlock =>
          unlock.kind === reward.unlockKind && unlock.unlockId === reward.unlockId
      );
    }

    return false;
  });
}

export function achievementHasReward(definition: AchievementDefinition): boolean {
  return (definition.rewards?.length ?? 0) > 0;
}

export function achievementNeedsThemeChoice(definition: AchievementDefinition): boolean {
  return (definition.rewards ?? []).some(reward => reward.kind === 'box');
}

export function achievementRewardLabel(reward: AchievementReward): string {
  return reward.labelHe;
}
