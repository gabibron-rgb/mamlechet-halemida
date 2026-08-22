export type ClassGoalMetric = 'missions' | 'behavior';

export type ClassGoalMetricDefinition = {
  id: ClassGoalMetric;
  labelHe: string;
  helperHe: string;
  emoji: string;
};

export const CLASS_GOAL_METRICS: Record<ClassGoalMetric, ClassGoalMetricDefinition> = {
  missions: {
    id: 'missions',
    labelHe: 'השלמת משימות',
    helperHe: 'כל משימה שהמורה מאשר כהושלמה מוסיפה צעד אחד ליעד הכיתתי.',
    emoji: '📋',
  },
  behavior: {
    id: 'behavior',
    labelHe: 'התנהגות והשקעה בכיתה',
    helperHe: 'כל הענקת נקודות עם סיבת התנהגות מוכרת מוסיפה צעד אחד ליעד הכיתתי.',
    emoji: '🌟',
  },
};

export type StudentClassGoal = {
  id: string;
  title: string;
  description: string;
  metric: ClassGoalMetric;
  target: number;
  contributionIds: string[];
  createdAt: number;
  dueAt: number | null;
  completedAt: number | null;
  cancelledAt: number | null;
};

export function classGoalMetricDefinition(metric: ClassGoalMetric) {
  return CLASS_GOAL_METRICS[metric];
}

export function normalizeStudentClassGoals(value: unknown): StudentClassGoal[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((candidate): StudentClassGoal[] => {
    if (!candidate || typeof candidate !== 'object') return [];

    const raw = candidate as Record<string, unknown>;
    const id = typeof raw.id === 'string' ? raw.id.trim() : '';
    const title = typeof raw.title === 'string' ? raw.title.trim() : '';
    const description =
      typeof raw.description === 'string' ? raw.description.trim() : '';
    const metric = isClassGoalMetric(raw.metric) ? raw.metric : 'missions';
    const target =
      typeof raw.target === 'number' && Number.isFinite(raw.target)
        ? Math.max(1, Math.round(raw.target))
        : 20;
    const contributionIds = Array.isArray(raw.contributionIds)
      ? Array.from(
          new Set(
            raw.contributionIds
              .filter((item): item is string => typeof item === 'string')
              .map(item => item.trim())
              .filter(Boolean)
          )
        )
      : [];
    const createdAt =
      typeof raw.createdAt === 'number' && Number.isFinite(raw.createdAt)
        ? raw.createdAt
        : Date.now();
    const dueAt = nullableTimestamp(raw.dueAt);
    const completedAt = nullableTimestamp(raw.completedAt);
    const cancelledAt = nullableTimestamp(raw.cancelledAt);

    if (!id || !title) return [];

    return [
      {
        id,
        title,
        description,
        metric,
        target,
        contributionIds,
        createdAt,
        dueAt,
        completedAt,
        cancelledAt,
      },
    ];
  });
}

export function classGoalProgress(goal: StudentClassGoal): number {
  return Math.min(goal.target, goal.contributionIds.length);
}

export function isClassGoalActive(goal: StudentClassGoal): boolean {
  return goal.completedAt === null && goal.cancelledAt === null;
}

export function isClassGoalCompleted(goal: StudentClassGoal): boolean {
  return goal.completedAt !== null && goal.cancelledAt === null;
}

export function isClassGoalOverdue(
  goal: StudentClassGoal,
  now = Date.now()
): boolean {
  return isClassGoalActive(goal) && goal.dueAt !== null && goal.dueAt < now;
}

export function withClassGoalContribution(
  goal: StudentClassGoal,
  contributionId: string,
  at = Date.now()
): StudentClassGoal {
  if (!isClassGoalActive(goal)) return goal;

  const cleanId = contributionId.trim();
  if (!cleanId || goal.contributionIds.includes(cleanId)) return goal;

  const contributionIds = [...goal.contributionIds, cleanId];
  const completedAt = contributionIds.length >= goal.target ? at : null;

  return {
    ...goal,
    contributionIds,
    completedAt,
  };
}

export function withoutClassGoalContribution(
  goal: StudentClassGoal,
  contributionId: string
): StudentClassGoal {
  const cleanId = contributionId.trim();
  if (!cleanId || !goal.contributionIds.includes(cleanId)) return goal;
  if (goal.cancelledAt !== null) return goal;

  const contributionIds = goal.contributionIds.filter(id => id !== cleanId);

  return {
    ...goal,
    contributionIds,
    completedAt: contributionIds.length >= goal.target ? goal.completedAt : null,
  };
}

function isClassGoalMetric(value: unknown): value is ClassGoalMetric {
  return value === 'missions' || value === 'behavior';
}

function nullableTimestamp(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
