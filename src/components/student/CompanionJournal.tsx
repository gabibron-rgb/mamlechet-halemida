import { getCompanionTrait } from '../../data/companionTraits';
import { REASONS } from '../../data/reasons';
import type { CompanionState } from '../../store/useGameStore';

type Props = {
  companion: CompanionState;
};

const SOURCE_LABELS = {
  teacher_note: 'רגע שהמורה בחרה לשמור',
  flourish: 'אות מיוחד מהמורה',
  challenge: 'ציון דרך באופי',
} as const;

export default function CompanionJournal({ companion }: Props) {
  const entries = [...(companion.journalEntries ?? [])].sort(
    (first, second) => second.createdAt - first.createdAt
  );

  return (
    <div className="mt-4 rounded-3xl border border-amber-300/20 bg-amber-500/5 p-5 text-right">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-xl font-black text-white">
            📖 יומן המסע של החיה
          </h3>
          <p className="mt-1 text-xs leading-5 text-magic-soft/60">
            רגעים משמעותיים שהמורה בחרה לשמור, אותות מיוחדים ואתגרי אופי
            שהושלמו. היומן מספר את הסיפור ואינו מעניק נקודות.
          </p>
        </div>
        <div className="rounded-xl bg-black/20 px-4 py-2 text-center text-xs font-bold text-amber-100">
          {entries.length} רגעים שמורים
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-black/10 p-5 text-center">
          <div className="text-3xl">📜</div>
          <div className="mt-2 font-black text-white">
            היומן עדיין מחכה לרגע הראשון
          </div>
          <div className="mt-1 text-xs leading-5 text-magic-soft/50">
            לא כל הענקת נקודות נכנסת לכאן. המורה בוחרת אילו רגעים ראויים
            להישמר כחלק מהסיפור של החיה.
          </div>
        </div>
      ) : (
        <div className="mt-4 max-h-[28rem] space-y-3 overflow-y-auto pl-1">
          {entries.map(entry => {
            const trait = getCompanionTrait(entry.traitId);
            const reason = entry.reasonId
              ? REASONS.find(item => item.id === entry.reasonId)
              : null;

            return (
              <article
                key={entry.id}
                className="rounded-2xl border border-white/10 bg-magic-bg/35 p-4"
                style={{ borderRightColor: `${trait.color}90` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
                      style={{ backgroundColor: `${trait.color}20` }}
                    >
                      {trait.emoji}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-magic-soft/45">
                        {SOURCE_LABELS[entry.source]}
                      </div>
                      <div className="mt-0.5 text-sm font-black text-white">
                        {reason?.labelHe ?? trait.nameHe}
                      </div>
                    </div>
                  </div>
                  <time className="shrink-0 text-[9px] text-magic-soft/40">
                    {new Date(entry.createdAt).toLocaleDateString('he-IL')}
                  </time>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-amber-50/80">
                  {entry.message}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
