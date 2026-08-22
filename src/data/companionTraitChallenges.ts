import {
  COMPANION_TRAITS,
  type CompanionBehaviorMemory,
  type CompanionTraitId,
} from './companionTraits';

export type CompanionTraitChallenge = {
  id: string;
  traitId: CompanionTraitId;
  targetDays: number;
  assignedAt: number;
  completedAt: number | null;
};

export const COMPANION_TRAIT_CHALLENGE_TARGETS = [3, 5, 8] as const;

export const COMPANION_TRAIT_CHALLENGE_TITLES: Record<
  CompanionTraitId,
  string
> = {
  determination: 'להבת הנחישות',
  friendship: 'לב החברות',
  creativity: 'ניצוץ היצירה',
  curiosity: 'עין הסקרנות',
  responsibility: 'מגן האחריות',
  resourcefulness: 'מפתח התושייה',
};

export function companionLocalDayKey(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getLatestCompanionTraitChallenge(
  challenges: CompanionTraitChallenge[]
): CompanionTraitChallenge | null {
  return challenges[challenges.length - 1] ?? null;
}

export function getCompanionTraitChallengeEvidenceDays(
  challenge: CompanionTraitChallenge,
  memories: CompanionBehaviorMemory[]
): string[] {
  const days = new Set<string>();

  memories.forEach(memory => {
    if (
      memory.traitId !== challenge.traitId ||
      memory.awardedAt < challenge.assignedAt
    ) {
      return;
    }

    days.add(companionLocalDayKey(memory.awardedAt));
  });

  return Array.from(days).sort();
}

export function getCompanionTraitChallengeProgress(
  challenge: CompanionTraitChallenge,
  memories: CompanionBehaviorMemory[]
): number {
  return Math.min(
    challenge.targetDays,
    getCompanionTraitChallengeEvidenceDays(challenge, memories).length
  );
}

export function reconcileLatestCompanionTraitChallenge(
  challenges: CompanionTraitChallenge[],
  memories: CompanionBehaviorMemory[],
  completedAt: number
): CompanionTraitChallenge[] {
  if (challenges.length === 0) return challenges;

  const latestIndex = challenges.length - 1;
  const latest = challenges[latestIndex];
  if (!latest) return challenges;

  const progress = getCompanionTraitChallengeProgress(latest, memories);
  const shouldBeCompleted = progress >= latest.targetDays;
  const nextCompletedAt = shouldBeCompleted
    ? latest.completedAt ?? completedAt
    : null;

  if (nextCompletedAt === latest.completedAt) return challenges;

  return challenges.map((challenge, index) =>
    index === latestIndex
      ? { ...challenge, completedAt: nextCompletedAt }
      : challenge
  );
}

export function normalizeCompanionTraitChallenges(
  value: unknown
): CompanionTraitChallenge[] {
  if (!Array.isArray(value)) return [];

  return value.filter((challenge): challenge is CompanionTraitChallenge => {
    if (!challenge || typeof challenge !== 'object') return false;

    const candidate = challenge as Partial<CompanionTraitChallenge>;
    return (
      typeof candidate.id === 'string' &&
      typeof candidate.targetDays === 'number' &&
      Number.isFinite(candidate.targetDays) &&
      candidate.targetDays >= 1 &&
      typeof candidate.assignedAt === 'number' &&
      (candidate.completedAt === null ||
        typeof candidate.completedAt === 'number') &&
      COMPANION_TRAITS.some(trait => trait.id === candidate.traitId)
    );
  });
}
