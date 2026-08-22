import {
  COMPANION_TRAITS,
  type CompanionTraitId,
} from './companionTraits';

export type CompanionJournalEntrySource =
  | 'teacher_note'
  | 'flourish'
  | 'challenge';

export type CompanionJournalEntry = {
  id: string;
  traitId: CompanionTraitId;
  reasonId: string | null;
  message: string;
  createdAt: number;
  source: CompanionJournalEntrySource;
};

export function normalizeCompanionJournalEntries(
  value: unknown
): CompanionJournalEntry[] {
  if (!Array.isArray(value)) return [];

  return value.filter((entry): entry is CompanionJournalEntry => {
    if (!entry || typeof entry !== 'object') return false;

    const candidate = entry as Partial<CompanionJournalEntry>;
    return (
      typeof candidate.id === 'string' &&
      (typeof candidate.reasonId === 'string' || candidate.reasonId === null) &&
      typeof candidate.message === 'string' &&
      candidate.message.trim().length > 0 &&
      typeof candidate.createdAt === 'number' &&
      Number.isFinite(candidate.createdAt) &&
      (candidate.source === 'teacher_note' ||
        candidate.source === 'flourish' ||
        candidate.source === 'challenge') &&
      COMPANION_TRAITS.some(trait => trait.id === candidate.traitId)
    );
  });
}
