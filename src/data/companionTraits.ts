export type CompanionTraitId =
  | 'determination'
  | 'friendship'
  | 'creativity'
  | 'curiosity'
  | 'responsibility'
  | 'resourcefulness';

export type CompanionTrait = {
  id: CompanionTraitId;
  nameHe: string;
  emoji: string;
  descriptionHe: string;
  color: string;
};

export type CompanionBehaviorMemory = {
  id: string;
  traitId: CompanionTraitId;
  reasonId: string;
  pointAmount: number;
  awardedAt: number;
  source: 'points' | 'flourish';
};

export const COMPANION_TRAITS: CompanionTrait[] = [
  {
    id: 'determination',
    nameHe: 'נחישות',
    emoji: '🔥',
    descriptionHe: 'המשך מאמץ, התמדה ואומץ מול אתגר',
    color: '#fb923c',
  },
  {
    id: 'friendship',
    nameHe: 'חברות',
    emoji: '❤️',
    descriptionHe: 'עזרה, שיתוף פעולה ויחס טוב לאחרים',
    color: '#fb7185',
  },
  {
    id: 'creativity',
    nameHe: 'יצירתיות',
    emoji: '🎨',
    descriptionHe: 'רעיונות מקוריים וחשיבה בדרך חדשה',
    color: '#e879f9',
  },
  {
    id: 'curiosity',
    nameHe: 'סקרנות',
    emoji: '🔬',
    descriptionHe: 'שאלות עמוקות ורצון אמיתי לגלות',
    color: '#22d3ee',
  },
  {
    id: 'responsibility',
    nameHe: 'אחריות',
    emoji: '🛡️',
    descriptionHe: 'בחירות טובות ושיקול דעת בכיתה',
    color: '#60a5fa',
  },
  {
    id: 'resourcefulness',
    nameHe: 'תושייה',
    emoji: '🧩',
    descriptionHe: 'פתרון בעיות והתגברות חכמה על מכשולים',
    color: '#a78bfa',
  },
];

const REASON_TO_TRAIT: Record<string, CompanionTraitId> = {
  effort: 'determination',
  perseverance: 'determination',
  help_friend: 'friendship',
  teamwork: 'friendship',
  creativity: 'creativity',
  deep_question: 'curiosity',
  good_choice: 'responsibility',
  problem_solve: 'resourcefulness',
};

export function companionTraitForReason(
  reasonId: string | null | undefined
): CompanionTraitId | null {
  if (!reasonId) return null;
  return REASON_TO_TRAIT[reasonId] ?? null;
}

export function getCompanionTrait(
  traitId: CompanionTraitId
): CompanionTrait {
  const trait = COMPANION_TRAITS.find(item => item.id === traitId);
  if (!trait) {
    throw new Error(`Unknown companion trait: ${traitId}`);
  }
  return trait;
}

export function getCompanionTraitCounts(
  memories: CompanionBehaviorMemory[]
): Record<CompanionTraitId, number> {
  const counts: Record<CompanionTraitId, number> = {
    determination: 0,
    friendship: 0,
    creativity: 0,
    curiosity: 0,
    responsibility: 0,
    resourcefulness: 0,
  };

  memories.forEach(memory => {
    counts[memory.traitId] += 1;
  });

  return counts;
}

export function getDominantCompanionTrait(
  memories: CompanionBehaviorMemory[]
): CompanionTrait | null {
  if (memories.length === 0) return null;

  const counts = getCompanionTraitCounts(memories);
  const sortedTraits = [...COMPANION_TRAITS].sort(
    (first, second) => counts[second.id] - counts[first.id]
  );

  return sortedTraits[0] ?? null;
}

export function normalizeCompanionBehaviorMemories(
  value: unknown
): CompanionBehaviorMemory[] {
  if (!Array.isArray(value)) return [];

  return value.filter((memory): memory is CompanionBehaviorMemory => {
    if (!memory || typeof memory !== 'object') return false;

    const candidate = memory as Partial<CompanionBehaviorMemory>;
    return (
      typeof candidate.id === 'string' &&
      typeof candidate.reasonId === 'string' &&
      typeof candidate.pointAmount === 'number' &&
      typeof candidate.awardedAt === 'number' &&
      (candidate.source === 'points' || candidate.source === 'flourish') &&
      COMPANION_TRAITS.some(trait => trait.id === candidate.traitId)
    );
  });
}
