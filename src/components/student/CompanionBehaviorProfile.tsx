import {
  COMPANION_TRAITS,
  getCompanionTraitCounts,
  getDominantCompanionTrait,
} from '../../data/companionTraits';
import { REASONS } from '../../data/reasons';
import type { CompanionState } from '../../store/useGameStore';

type Props = {
  companion: CompanionState;
};

export default function CompanionBehaviorProfile({ companion }: Props) {
  const memories = companion.behaviorMemories ?? [];
  const counts = getCompanionTraitCounts(memories);
  const dominantTrait = getDominantCompanionTrait(memories);
  const highestCount = Math.max(1, ...Object.values(counts));
  const recentMemories = [...memories]
    .sort((first, second) => second.awardedAt - first.awardedAt)
    .slice(0, 5);

  return (
    <div className="mt-4 rounded-3xl border border-violet-300/20 bg-violet-500/10 p-5 text-right">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-xl font-black text-white">
            מפת האופי של החיה
          </h3>
          <p className="mt-1 max-w-xl text-xs leading-5 text-magic-soft/65">
            האופי נבנה רק מהתנהגויות שהמורה בחרה לציין בזמן הענקת נקודות.
            כל הענקה מנומקת יוצרת זיכרון אחד, ללא קשר לכמות הנקודות.
          </p>
        </div>
        <div className="rounded-xl bg-black/20 px-4 py-2 text-center text-xs font-bold text-violet-100">
          {memories.length} זיכרונות מהכיתה
        </div>
      </div>

      {dominantTrait ? (
        <div
          className="mt-4 rounded-2xl border p-4 text-center"
          style={{
            borderColor: `${dominantTrait.color}65`,
            backgroundColor: `${dominantTrait.color}16`,
            boxShadow: `0 0 26px ${dominantTrait.color}18`,
          }}
        >
          <div className="text-[10px] font-black text-white/55">
            התכונה המובילה כרגע
          </div>
          <div className="mt-1 text-4xl">{dominantTrait.emoji}</div>
          <div className="mt-1 text-lg font-black text-white">
            {dominantTrait.nameHe}
          </div>
          <div className="mt-1 text-xs text-white/60">
            {dominantTrait.descriptionHe}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-black/10 p-5 text-center">
          <div className="text-3xl">🌱</div>
          <div className="mt-2 font-black text-white">
            האופי עדיין מתחיל להיבנות
          </div>
          <div className="mt-1 text-xs leading-5 text-magic-soft/55">
            בפעם הבאה שהמורה תעניק נקודות ותבחר סיבה, ייווצר כאן הזיכרון
            הראשון. נתונים ישנים אינם משתנים ואינם מושלמים אוטומטית.
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {COMPANION_TRAITS.map(trait => {
          const count = counts[trait.id];
          const progress = Math.round((count / highestCount) * 100);

          return (
            <div
              key={trait.id}
              className="rounded-2xl border border-white/10 bg-magic-bg/35 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-black text-white">
                    {trait.nameHe}
                  </div>
                  <div className="mt-0.5 text-[9px] text-magic-soft/45">
                    {count} זיכרונות
                  </div>
                </div>
                <div className="text-2xl">{trait.emoji}</div>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/25">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${count === 0 ? 0 : progress}%`,
                    backgroundColor: trait.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {recentMemories.length > 0 && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/15 p-4">
          <div className="mb-3 text-xs font-black text-violet-100">
            זיכרונות אחרונים
          </div>
          <div className="space-y-2">
            {recentMemories.map(memory => {
              const trait = COMPANION_TRAITS.find(
                item => item.id === memory.traitId
              );
              const reason = REASONS.find(item => item.id === memory.reasonId);

              return (
                <div
                  key={memory.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-magic-bg/35 px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-lg">{trait?.emoji ?? '✨'}</span>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-black text-white">
                        {reason?.labelHe ?? trait?.nameHe ?? 'זיכרון מיוחד'}
                      </div>
                      <div className="text-[9px] text-magic-soft/45">
                        {memory.source === 'flourish'
                          ? 'אות מיוחד מהמורה'
                          : `הענקת +${memory.pointAmount} נקודות`}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-[9px] text-magic-soft/40">
                    {new Date(memory.awardedAt).toLocaleDateString('he-IL')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
