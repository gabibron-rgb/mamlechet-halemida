import type { AchievementReward, AchievementStudentLike } from './achievements';
import { ITEMS } from './items';
import { COMPANION_STAGE_ORDER, type CompanionStage } from './companionWorlds';
import { THEMES, type ThemeId } from './themes';

export type JourneyCondition =
  | { kind: 'studentLevel'; target: number }
  | { kind: 'themeCollectibles'; themeId: ThemeId; target: number }
  | { kind: 'companionStage'; stage: CompanionStage }
  | { kind: 'completedMissions'; target: number }
  | { kind: 'completedClassGoalsContributed'; target: number }
  | { kind: 'behaviorDays'; target: number }
  | { kind: 'uniqueCollectibles'; target: number };

export type JourneyStageDefinition = {
  id: string;
  titleHe: string;
  storyHe: string;
  emoji: string;
  conditions: JourneyCondition[];
};

export type SpecialJourneyDefinition = {
  id: string;
  titleHe: string;
  subtitleHe: string;
  descriptionHe: string;
  emoji: string;
  difficultyHe: string;
  hidden?: boolean;
  discoveryConditions?: JourneyCondition[];
  stages: JourneyStageDefinition[];
  rewards: AchievementReward[];
};

export type JourneyRecord = {
  journeyId: string;
  discoveredAt: number;
  completedStageIds: string[];
  completedAt: number | null;
  rewardClaimedAt: number | null;
};

export type JourneyStudentLike = AchievementStudentLike & {
  companion: AchievementStudentLike['companion'] & {
    behaviorMemories?: Array<{ awardedAt: number }>;
  };
};

export type JourneyConditionProgress = {
  current: number;
  target: number;
  pct: number;
  complete: boolean;
};

export const SPECIAL_JOURNEYS: SpecialJourneyDefinition[] = [
  {
    id: 'unicorn_path',
    titleHe: 'מסע חד־הקרן',
    subtitleHe: 'בעומק היער הקסום מחכה יצור שלא ניתן לקנות או למצוא בקופסה.',
    descriptionHe:
      'זהו מסע ארוך שמחבר בין הדרך שלך בכיתה לבין מה שבנית בממלכה. כל שלב פותח את החלק הבא בסיפור.',
    emoji: '🦄',
    difficultyHe: 'מסע אגדי',
    stages: [
      {
        id: 'whisper_in_the_woods',
        titleHe: 'שמועה בין העצים',
        storyHe:
          'רחש מוזר עובר ביער. כדי שהשביל יבחין בך, צריך קודם להראות שכבר התחלת לבנות לעצמך מקום בממלכה.',
        emoji: '🌲',
        conditions: [{ kind: 'studentLevel', target: 8 }],
      },
      {
        id: 'sparkling_tracks',
        titleHe: 'עקבות של קסם',
        storyHe:
          'בין העלים מופיעים סימנים נוצצים. הם מגיבים רק למי שכבר אסף מספיק חפצים מעולם הפנטזיה.',
        emoji: '✨',
        conditions: [
          { kind: 'themeCollectibles', themeId: 'fantasy', target: 4 },
        ],
      },
      {
        id: 'friend_of_creatures',
        titleHe: 'ידיד היצורים',
        storyHe:
          'חד־קרן לא מתקרב למי שרק אוסף אוצרות. הוא מחפש מישהו שכבר למד לטפל בחיה ולגדול יחד איתה.',
        emoji: '🐾',
        conditions: [{ kind: 'companionStage', stage: 'young' }],
      },
      {
        id: 'heart_of_the_kingdom',
        titleHe: 'לב הממלכה',
        storyHe:
          'השביל מוביל אל שער עתיק. הוא נפתח רק בפני מי שעזר לאחרים ולא התקדם לבדו.',
        emoji: '🏰',
        conditions: [
          { kind: 'completedClassGoalsContributed', target: 2 },
        ],
      },
      {
        id: 'moonlit_gate',
        titleHe: 'שער אור הירח',
        storyHe:
          'השלב האחרון אינו דורש כסף או מזל. הוא דורש דרך: התמדה לאורך זמן ומשימות שהושלמו באמת.',
        emoji: '🌙',
        conditions: [
          { kind: 'behaviorDays', target: 10 },
          { kind: 'completedMissions', target: 5 },
        ],
      },
    ],
    rewards: [
      {
        kind: 'specialUnlock',
        unlockKind: 'pet',
        unlockId: 'pet_magical_unicorn',
        labelHe: 'חד־הקרן הקסום',
      },
      {
        kind: 'specialUnlock',
        unlockKind: 'title',
        unlockId: 'title_friend_of_the_unicorn',
        labelHe: 'התואר “ידיד/ת חד־הקרן”',
      },
    ],
  },
];

const COLLECTIBLE_ITEMS = ITEMS.filter(item => item.source === 'box');
const COLLECTIBLE_ITEM_IDS = new Set(COLLECTIBLE_ITEMS.map(item => item.id));

function uniqueOwnedCollectibleIds(student: JourneyStudentLike): Set<string> {
  return new Set(
    student.inventory
      .filter(entry => entry.kind !== 'box' && COLLECTIBLE_ITEM_IDS.has(entry.itemId))
      .map(entry => entry.itemId)
  );
}

function completedMissionCount(student: JourneyStudentLike): number {
  return (student.missions ?? []).filter(
    mission => mission.completedAt !== null && mission.cancelledAt === null
  ).length;
}

function contributedCompletedClassGoalCount(student: JourneyStudentLike): number {
  return (student.classGoals ?? []).filter(goal => {
    if (goal.completedAt === null || goal.cancelledAt !== null) return false;

    return goal.contributionIds.some(contributionId =>
      contributionId.startsWith(`mission:${student.id}:`) ||
      contributionId.startsWith(`behavior:${student.id}:`) ||
      contributionId.startsWith(`behavior-day:${goal.id}:${student.id}:`)
    );
  }).length;
}

function themeCollectibleCount(
  student: JourneyStudentLike,
  themeId: ThemeId
): number {
  const owned = uniqueOwnedCollectibleIds(student);
  return COLLECTIBLE_ITEMS.filter(
    item => item.theme === themeId && owned.has(item.id)
  ).length;
}

export function journeyConditionProgress(
  condition: JourneyCondition,
  student: JourneyStudentLike
): JourneyConditionProgress {
  let current = 0;
  let target = 1;

  switch (condition.kind) {
    case 'studentLevel':
      current = Math.max(0, student.level ?? 0);
      target = condition.target;
      break;
    case 'themeCollectibles':
      current = themeCollectibleCount(student, condition.themeId);
      target = condition.target;
      break;
    case 'companionStage': {
      const currentIndex = Math.max(
        0,
        COMPANION_STAGE_ORDER.indexOf(student.companion.stage)
      );
      const targetIndex = Math.max(
        1,
        COMPANION_STAGE_ORDER.indexOf(condition.stage)
      );
      current = currentIndex;
      target = targetIndex;
      break;
    }
    case 'completedMissions':
      current = completedMissionCount(student);
      target = condition.target;
      break;
    case 'completedClassGoalsContributed':
      current = contributedCompletedClassGoalCount(student);
      target = condition.target;
      break;
    case 'behaviorDays': {
      const days = new Set(
        (student.companion.behaviorMemories ?? []).map(memory => {
          const date = new Date(memory.awardedAt);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        })
      );
      current = days.size;
      target = condition.target;
      break;
    }
    case 'uniqueCollectibles':
      current = uniqueOwnedCollectibleIds(student).size;
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

export function journeyConditionLabel(
  condition: JourneyCondition,
  student: JourneyStudentLike
): string {
  const progress = journeyConditionProgress(condition, student);

  switch (condition.kind) {
    case 'studentLevel':
      return `להגיע לרמה ${condition.target}`;
    case 'themeCollectibles': {
      const themeName =
        THEMES.find(theme => theme.id === condition.themeId)?.nameHe ?? 'הנושא';
      return `לאסוף ${condition.target} חפצי ${themeName} שונים (${Math.min(progress.current, progress.target)}/${progress.target})`;
    }
    case 'companionStage':
      return condition.stage === 'young'
        ? 'לעזור לחיית המחמד להגיע לשלב הצעיר'
        : 'לקדם את חיית המחמד לשלב הנדרש';
    case 'completedMissions':
      return `להשלים ${condition.target} משימות אישיות (${Math.min(progress.current, progress.target)}/${progress.target})`;
    case 'completedClassGoalsContributed':
      return `לתרום ל־${condition.target} יעדים כיתתיים שהושלמו (${Math.min(progress.current, progress.target)}/${progress.target})`;
    case 'behaviorDays':
      return `לצבור ${condition.target} ימי התנהגות משמעותיים (${Math.min(progress.current, progress.target)}/${progress.target})`;
    case 'uniqueCollectibles':
      return `לאסוף ${condition.target} חפצים שונים (${Math.min(progress.current, progress.target)}/${progress.target})`;
  }
}

export function journeyStageComplete(
  stage: JourneyStageDefinition,
  student: JourneyStudentLike
): boolean {
  return stage.conditions.every(condition =>
    journeyConditionProgress(condition, student).complete
  );
}

export function journeyCompletedStageCount(
  journey: SpecialJourneyDefinition,
  student: JourneyStudentLike
): number {
  let completed = 0;

  for (const stage of journey.stages) {
    if (!journeyStageComplete(stage, student)) break;
    completed += 1;
  }

  return completed;
}

export function journeyIsComplete(
  journey: SpecialJourneyDefinition,
  student: JourneyStudentLike
): boolean {
  return journeyCompletedStageCount(journey, student) >= journey.stages.length;
}

function discoveryComplete(
  journey: SpecialJourneyDefinition,
  student: JourneyStudentLike
): boolean {
  if (!journey.hidden) return true;
  const conditions = journey.discoveryConditions ?? [];
  return conditions.length > 0 && conditions.every(condition =>
    journeyConditionProgress(condition, student).complete
  );
}

export function normalizeJourneyRecords(value: unknown): JourneyRecord[] {
  if (!Array.isArray(value)) return [];
  const journeyByJourneyId = new Map(
    SPECIAL_JOURNEYS.map(journey => [journey.id, journey])
  );
  const byId = new Map<string, JourneyRecord>();

  for (const raw of value) {
    if (!raw || typeof raw !== 'object') continue;
    const entry = raw as Record<string, unknown>;
    const journeyId = typeof entry.journeyId === 'string' ? entry.journeyId : '';
    const journey = journeyByJourneyId.get(journeyId);
    if (!journey) continue;

    const validStageIds = new Set(journey.stages.map(stage => stage.id));
    const completedStageIds = Array.isArray(entry.completedStageIds)
      ? Array.from(
          new Set(
            entry.completedStageIds.filter(
              (stageId): stageId is string =>
                typeof stageId === 'string' && validStageIds.has(stageId)
            )
          )
        )
      : [];
    const orderedCompletedStageIds = journey.stages
      .map(stage => stage.id)
      .filter(stageId => completedStageIds.includes(stageId));

    const discoveredAt =
      typeof entry.discoveredAt === 'number' && Number.isFinite(entry.discoveredAt)
        ? Math.max(0, Math.floor(entry.discoveredAt))
        : Date.now();
    const completedAt =
      typeof entry.completedAt === 'number' && Number.isFinite(entry.completedAt)
        ? Math.max(0, Math.floor(entry.completedAt))
        : null;
    const rewardClaimedAt =
      typeof entry.rewardClaimedAt === 'number' && Number.isFinite(entry.rewardClaimedAt)
        ? Math.max(0, Math.floor(entry.rewardClaimedAt))
        : null;

    const current = byId.get(journeyId);
    if (!current || discoveredAt < current.discoveredAt) {
      byId.set(journeyId, {
        journeyId,
        discoveredAt,
        completedStageIds: orderedCompletedStageIds,
        completedAt,
        rewardClaimedAt,
      });
      continue;
    }

    const mergedStageIds = journey.stages
      .map(stage => stage.id)
      .filter(
        stageId =>
          current.completedStageIds.includes(stageId) ||
          orderedCompletedStageIds.includes(stageId)
      );

    byId.set(journeyId, {
      ...current,
      completedStageIds: mergedStageIds,
      completedAt: current.completedAt ?? completedAt,
      rewardClaimedAt: current.rewardClaimedAt ?? rewardClaimedAt,
    });
  }

  return [...byId.values()].sort((a, b) => a.discoveredAt - b.discoveredAt);
}

export function reconcileJourneyRecords(
  student: JourneyStudentLike,
  records: JourneyRecord[],
  now = Date.now()
): {
  records: JourneyRecord[];
  newlyDiscoveredIds: string[];
  newlyCompletedStageIds: Array<{ journeyId: string; stageId: string }>;
  newlyCompletedIds: string[];
} {
  const normalized = normalizeJourneyRecords(records);
  const byId = new Map(normalized.map(record => [record.journeyId, record]));
  const newlyDiscoveredIds: string[] = [];
  const newlyCompletedStageIds: Array<{ journeyId: string; stageId: string }> = [];
  const newlyCompletedIds: string[] = [];

  for (const journey of SPECIAL_JOURNEYS) {
    if (!discoveryComplete(journey, student)) continue;

    let record = byId.get(journey.id);
    if (!record) {
      record = {
        journeyId: journey.id,
        discoveredAt: now,
        completedStageIds: [],
        completedAt: null,
        rewardClaimedAt: null,
      };
      byId.set(journey.id, record);
      newlyDiscoveredIds.push(journey.id);
    }

    const completedStageIds = [...record.completedStageIds];
    const completedSet = new Set(completedStageIds);

    for (const stage of journey.stages) {
      if (completedSet.has(stage.id)) continue;
      if (!journeyStageComplete(stage, student)) break;

      completedSet.add(stage.id);
      completedStageIds.push(stage.id);
      newlyCompletedStageIds.push({ journeyId: journey.id, stageId: stage.id });
    }

    const journeyComplete = completedStageIds.length >= journey.stages.length;
    const completedAt =
      record.completedAt ?? (journeyComplete ? now : null);

    if (record.completedAt === null && completedAt !== null) {
      newlyCompletedIds.push(journey.id);
    }

    byId.set(journey.id, {
      ...record,
      completedStageIds,
      completedAt,
    });
  }

  return {
    records: [...byId.values()].sort((a, b) => a.discoveredAt - b.discoveredAt),
    newlyDiscoveredIds,
    newlyCompletedStageIds,
    newlyCompletedIds,
  };
}

export function journeyById(id: string): SpecialJourneyDefinition | null {
  return SPECIAL_JOURNEYS.find(journey => journey.id === id) ?? null;
}

export function journeyNeedsThemeChoice(journey: SpecialJourneyDefinition): boolean {
  return journey.rewards.some(reward => reward.kind === 'box');
}

export function journeyRewardLabel(reward: AchievementReward): string {
  return reward.labelHe;
}
