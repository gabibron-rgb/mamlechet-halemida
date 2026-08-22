import { getCompanionReaction } from '../../data/companionReactions';
import type { CompanionState } from '../../store/useGameStore';

type Props = {
  companion: CompanionState;
  petName: string;
  motif: string;
};

export default function CompanionReactionCard({
  companion,
  petName,
  motif,
}: Props) {
  const reaction = getCompanionReaction({
    stage: companion.stage,
    memories: companion.behaviorMemories ?? [],
    journalEntries: companion.journalEntries ?? [],
  });

  return (
    <section
      className="relative mb-4 overflow-hidden rounded-3xl border p-5 text-right"
      style={{
        borderColor: `${reaction.accentColor}65`,
        background: `linear-gradient(135deg, ${reaction.accentColor}1f, rgba(13, 8, 35, 0.74) 62%)`,
        boxShadow: `0 0 34px ${reaction.accentColor}18`,
      }}
      aria-live="polite"
    >
      <div
        className="pointer-events-none absolute -left-8 -top-10 h-32 w-32 rounded-full blur-3xl"
        style={{ backgroundColor: `${reaction.accentColor}24` }}
      />
      <div className="pointer-events-none absolute left-6 top-5 animate-pulse text-lg opacity-50">
        ✦
      </div>
      <div className="pointer-events-none absolute bottom-5 right-7 animate-pulse text-sm opacity-35">
        ✨
      </div>

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/15 text-3xl shadow-inner"
          style={{ backgroundColor: `${reaction.accentColor}24` }}
          aria-hidden="true"
        >
          <span className="relative">
            {motif}
            <span className="absolute -bottom-2 -left-3 text-lg">
              {reaction.emoji}
            </span>
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
            <div>
              <div className="text-[10px] font-black text-white/45">
                💬 {petName} רוצה לומר
              </div>
              <h3 className="mt-1 text-lg font-black text-white">
                {reaction.titleHe}
              </h3>
            </div>
            <div className="self-start rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[9px] font-bold text-white/55">
              {reaction.sourceHe}
            </div>
          </div>

          <p className="mt-3 text-sm font-bold leading-6 text-white/80">
            “{reaction.messageHe}”
          </p>

          {reaction.quoteHe && (
            <blockquote
              className="mt-3 rounded-2xl border-r-4 bg-black/20 px-4 py-3 text-xs leading-6 text-amber-50/75"
              style={{ borderRightColor: reaction.accentColor }}
            >
              {reaction.quoteHe}
            </blockquote>
          )}

          {reaction.personalityHe && (
            <div className="mt-3 rounded-xl bg-white/5 px-3 py-2 text-[10px] font-bold leading-5 text-white/55">
              🧭 {reaction.personalityHe}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3 text-[9px] text-white/35">
            <span>
              התגובה משקפת התנהגות שתועדה בכיתה ואינה מעניקה נקודות נוספות.
            </span>
            {reaction.occurredAt && (
              <time dateTime={new Date(reaction.occurredAt).toISOString()}>
                {new Date(reaction.occurredAt).toLocaleDateString('he-IL')}
              </time>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
