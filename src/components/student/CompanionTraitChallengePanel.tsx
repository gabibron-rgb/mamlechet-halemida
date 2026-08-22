import {
  COMPANION_TRAIT_CHALLENGE_TITLES,
  getCompanionTraitChallengeProgress,
  getLatestCompanionTraitChallenge,
} from '../../data/companionTraitChallenges';
import { getCompanionTrait } from '../../data/companionTraits';
import type { CompanionState } from '../../store/useGameStore';

type Props = {
  companion: CompanionState;
};

export default function CompanionTraitChallengePanel({ companion }: Props) {
  const challenges = companion.traitChallenges ?? [];
  const latest = getLatestCompanionTraitChallenge(challenges);
  const completedChallenges = challenges.filter(
    challenge => challenge.completedAt !== null
  );

  if (!latest) {
    return (
      <div className="mt-4 rounded-3xl border border-dashed border-cyan-300/20 bg-cyan-500/5 p-5 text-right">
        <h3 className="text-lg font-black text-white">🧭 אתגר האופי שלי</h3>
        <p className="mt-2 text-xs leading-5 text-magic-soft/60">
          עדיין לא הוגדר אתגר אישי. כשהמורה תבחר תכונה לחיזוק, ההתקדמות
          תופיע כאן ותתבסס רק על התנהגות שנצפתה בכיתה.
        </p>
      </div>
    );
  }

  const trait = getCompanionTrait(latest.traitId);
  const progress = getCompanionTraitChallengeProgress(
    latest,
    companion.behaviorMemories ?? []
  );
  const progressPercent = Math.min(
    100,
    Math.round((progress / latest.targetDays) * 100)
  );
  const isCompleted = latest.completedAt !== null;

  return (
    <div
      className="mt-4 rounded-3xl border p-5 text-right"
      style={{
        borderColor: `${trait.color}55`,
        backgroundColor: `${trait.color}12`,
        boxShadow: isCompleted ? `0 0 30px ${trait.color}18` : undefined,
      }}
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="text-[10px] font-black text-white/50">
            {isCompleted ? 'האתגר האחרון הושלם' : 'האתגר שהמורה בחרה'}
          </div>
          <h3 className="mt-1 text-xl font-black text-white">
            {trait.emoji} אתגר {trait.nameHe}
          </h3>
          <p className="mt-1 text-xs text-magic-soft/60">
            {trait.descriptionHe}
          </p>
        </div>

        <div className="rounded-2xl bg-black/20 px-5 py-3 text-center">
          <div className="text-2xl font-black text-white">
            {progress}/{latest.targetDays}
          </div>
          <div className="text-[9px] font-bold text-magic-soft/50">
            ימי לימוד שונים
          </div>
        </div>
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/30">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: trait.color,
          }}
        />
      </div>

      <div className="mt-3 rounded-xl bg-black/15 px-3 py-2 text-[10px] leading-5 text-magic-soft/60">
        גם אם מתקבלות כמה הענקות על {trait.nameHe} באותו יום, הן נחשבות
        ליום הוכחה אחד בלבד. כמות הנקודות אינה מקצרת את האתגר.
      </div>

      {isCompleted && (
        <div className="mt-4 rounded-2xl border border-yellow-300/25 bg-yellow-400/10 p-4 text-center">
          <div className="text-3xl">🏅</div>
          <div className="mt-1 text-xs font-bold text-yellow-100/65">
            תואר האופי שנפתח
          </div>
          <div className="mt-1 text-lg font-black text-yellow-200">
            {COMPANION_TRAIT_CHALLENGE_TITLES[latest.traitId]}
          </div>
          <div className="mt-1 text-[10px] text-magic-soft/55">
            התואר מסמל התנהגות עקבית בכיתה ואינו מעניק נקודות נוספות.
          </div>
        </div>
      )}

      {completedChallenges.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-[10px] font-black text-white/50">
            תארי אופי שהושגו
          </div>
          <div className="flex flex-wrap gap-2">
            {completedChallenges.map(challenge => {
              const completedTrait = getCompanionTrait(challenge.traitId);
              return (
                <span
                  key={challenge.id}
                  className="rounded-full border border-yellow-300/20 bg-yellow-500/10 px-3 py-1 text-[10px] font-bold text-yellow-100"
                >
                  {completedTrait.emoji}{' '}
                  {COMPANION_TRAIT_CHALLENGE_TITLES[challenge.traitId]}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
