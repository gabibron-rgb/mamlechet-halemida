import {
  GROWN_BOND_REQUIRED,
  HATCH_BOND_REQUIRED,
  LEGENDARY_BOND_REQUIRED,
  YOUNG_BOND_REQUIRED,
  COMPANION_STAGE_ORDER,
  type CompanionStage,
} from './companionWorlds';
import {
  getCompanionTraitCounts,
  type CompanionBehaviorMemory,
} from './companionTraits';
import type { CompanionTraitChallenge } from './companionTraitChallenges';

export type CompanionEvolutionRequirement = {
  stage: Exclude<CompanionStage, 'egg'>;
  bondRequired: number;
  behaviorDaysRequired: number;
  distinctTraitsRequired: number;
  completedChallengesRequired: number;
};

export type CompanionEvolutionProgress = CompanionEvolutionRequirement & {
  bond: number;
  behaviorDays: number;
  distinctTraits: number;
  completedChallenges: number;
  bondReady: boolean;
  behaviorDaysReady: boolean;
  distinctTraitsReady: boolean;
  completedChallengesReady: boolean;
  ready: boolean;
  overallPercent: number;
};

/**
 * התפתחות החיה תלויה גם בקשר שנבנה במשחק וגם בהתנהגות שנצפתה בכיתה.
 * הדרישות הולכות ונעשות עמוקות יותר ככל שהחיה מתקדמת.
 */
export const COMPANION_EVOLUTION_REQUIREMENTS: Record<
  Exclude<CompanionStage, 'egg'>,
  CompanionEvolutionRequirement
> = {
  hatchling: {
    stage: 'hatchling',
    bondRequired: HATCH_BOND_REQUIRED,
    behaviorDaysRequired: 2,
    distinctTraitsRequired: 1,
    completedChallengesRequired: 0,
  },
  young: {
    stage: 'young',
    bondRequired: YOUNG_BOND_REQUIRED,
    behaviorDaysRequired: 5,
    distinctTraitsRequired: 2,
    completedChallengesRequired: 0,
  },
  grown: {
    stage: 'grown',
    bondRequired: GROWN_BOND_REQUIRED,
    behaviorDaysRequired: 10,
    distinctTraitsRequired: 3,
    completedChallengesRequired: 1,
  },
  legendary: {
    stage: 'legendary',
    bondRequired: LEGENDARY_BOND_REQUIRED,
    behaviorDaysRequired: 20,
    distinctTraitsRequired: 4,
    completedChallengesRequired: 3,
  },
};

function localDayKey(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCompanionBehaviorDayCount(
  memories: CompanionBehaviorMemory[]
): number {
  return new Set(memories.map(memory => localDayKey(memory.awardedAt))).size;
}

export function getCompanionDistinctTraitCount(
  memories: CompanionBehaviorMemory[]
): number {
  const counts = getCompanionTraitCounts(memories);
  return Object.values(counts).filter(count => count > 0).length;
}

export function getCompletedCompanionTraitChallengeCount(
  challenges: CompanionTraitChallenge[]
): number {
  return challenges.filter(challenge => challenge.completedAt !== null).length;
}

function requirementPercent(current: number, required: number): number {
  if (required <= 0) return 100;
  return Math.min(100, Math.round((current / required) * 100));
}

export function getCompanionEvolutionProgress(
  stage: CompanionStage,
  bond: number,
  memories: CompanionBehaviorMemory[],
  challenges: CompanionTraitChallenge[]
): CompanionEvolutionProgress {
  if (stage === 'egg') {
    throw new Error('Egg is not an evolution target stage.');
  }

  const requirement = COMPANION_EVOLUTION_REQUIREMENTS[stage];
  const safeBond = Math.max(0, bond);
  const behaviorDays = getCompanionBehaviorDayCount(memories);
  const distinctTraits = getCompanionDistinctTraitCount(memories);
  const completedChallenges = getCompletedCompanionTraitChallengeCount(challenges);

  const bondReady = safeBond >= requirement.bondRequired;
  const behaviorDaysReady = behaviorDays >= requirement.behaviorDaysRequired;
  const distinctTraitsReady = distinctTraits >= requirement.distinctTraitsRequired;
  const completedChallengesReady =
    completedChallenges >= requirement.completedChallengesRequired;
  const ready =
    bondReady &&
    behaviorDaysReady &&
    distinctTraitsReady &&
    completedChallengesReady;

  const overallPercent = Math.min(
    requirementPercent(safeBond, requirement.bondRequired),
    requirementPercent(behaviorDays, requirement.behaviorDaysRequired),
    requirementPercent(distinctTraits, requirement.distinctTraitsRequired),
    requirementPercent(
      completedChallenges,
      requirement.completedChallengesRequired
    )
  );

  return {
    ...requirement,
    bond: safeBond,
    behaviorDays,
    distinctTraits,
    completedChallenges,
    bondReady,
    behaviorDaysReady,
    distinctTraitsReady,
    completedChallengesReady,
    ready,
    overallPercent,
  };
}

export function companionStageForProgress({
  bond,
  currentStage = 'egg',
  behaviorMemories,
  traitChallenges,
}: {
  bond: number;
  currentStage?: CompanionStage;
  behaviorMemories: CompanionBehaviorMemory[];
  traitChallenges: CompanionTraitChallenge[];
}): CompanionStage {
  let resolvedStage = currentStage;

  for (const stage of COMPANION_STAGE_ORDER) {
    if (stage === 'egg') continue;

    const progress = getCompanionEvolutionProgress(
      stage,
      bond,
      behaviorMemories,
      traitChallenges
    );

    if (!progress.ready) break;

    if (
      COMPANION_STAGE_ORDER.indexOf(stage) >
      COMPANION_STAGE_ORDER.indexOf(resolvedStage)
    ) {
      resolvedStage = stage;
    }
  }

  return resolvedStage;
}
