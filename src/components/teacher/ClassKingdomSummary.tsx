import {
  classKingdomLevel,
  classKingdomLevelProgress,
  classKingdomStars,
  nextClassKingdomLevel,
  nextClassKingdomMilestone,
  nextClassKingdomReward,
} from '../../data/classKingdom';
import type { StudentClassGoal } from '../../data/classGoals';
import type { StudentState } from '../../store/useGameStore';

type Props = {
  students: StudentState[];
};

export default function ClassKingdomSummary({ students }: Props) {
  const goals = mergeClassGoals(students);
  const stars = classKingdomStars(goals);
  const level = classKingdomLevel(stars);
  const nextLevel = nextClassKingdomLevel(stars);
  const nextMilestone = nextClassKingdomMilestone(stars);
  const nextReward = nextClassKingdomReward(stars);
  const progress = classKingdomLevelProgress(stars);

  return (
    <div className="mb-4 rounded-3xl border border-yellow-300/15 bg-magic-panel/80 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-black text-magic-accent">🏰 הממלכה הכיתתית</div>
          <div className="mt-1 text-sm text-magic-soft/65">
            כל יעד שהכיתה משלימה מוסיף כוכב אחד. אין נקודות אישיות ואין דירוג בין תלמידים.
          </div>
        </div>

        <div className="flex gap-2 text-center">
          <div className="rounded-xl border border-yellow-300/15 bg-yellow-400/10 px-4 py-2">
            <div className="text-xl font-black text-white">⭐ {stars}</div>
            <div className="text-[10px] text-magic-soft/50">כוכבי ממלכה</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-magic-bg/40 px-4 py-2">
            <div className="text-xl font-black text-white">{level.emoji} {level.level}</div>
            <div className="text-[10px] text-magic-soft/50">רמת ממלכה</div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-magic-bg/30 p-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-black text-white">{level.titleHe}</span>
          {nextLevel ? (
            <span className="text-xs font-bold text-yellow-100/65">
              עוד {Math.max(0, nextLevel.minStars - stars)} כוכבים לרמה {nextLevel.level}
            </span>
          ) : (
            <span className="text-xs font-black text-yellow-200">הרמה הגבוהה ביותר כרגע</span>
          )}
        </div>

        <div className="mt-3 h-3 overflow-hidden rounded-full bg-magic-bg/70">
          <div
            className="h-full bg-gradient-to-l from-yellow-300 via-magic-accent to-magic-soft transition-all duration-500"
            style={{ width: `${progress.pct}%` }}
          />
        </div>
      </div>

      {nextReward && (
        <div className="mt-3 flex flex-col gap-1 rounded-2xl border border-yellow-300/10 bg-yellow-400/8 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-bold text-white">
            {nextReward.emoji} פרס הרמה הבא: {nextReward.titleHe}
          </span>
          <span className="text-xs font-black text-yellow-200">
            ברמה {nextReward.level} · {nextReward.minStars} ⭐
          </span>
        </div>
      )}

      {nextMilestone && (
        <div className="mt-3 flex flex-col gap-1 rounded-2xl border border-fuchsia-300/10 bg-fuchsia-500/8 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-bold text-white">
            {nextMilestone.emoji} אבן הדרך הבאה: {nextMilestone.titleHe}
          </span>
          <span className="text-xs font-black text-fuchsia-200">
            ב־{nextMilestone.stars} ⭐ · חסרים {Math.max(0, nextMilestone.stars - stars)}
          </span>
        </div>
      )}
    </div>
  );
}

function mergeClassGoals(students: StudentState[]): StudentClassGoal[] {
  const byId = new Map<string, StudentClassGoal>();

  for (const student of students) {
    for (const goal of student.classGoals ?? []) {
      const current = byId.get(goal.id);
      if (!current) {
        byId.set(goal.id, { ...goal, contributionIds: [...goal.contributionIds] });
        continue;
      }

      const contributionIds = Array.from(
        new Set([...current.contributionIds, ...goal.contributionIds])
      );
      byId.set(goal.id, {
        ...current,
        contributionIds,
        completedAt: current.completedAt ?? goal.completedAt,
        cancelledAt: current.cancelledAt ?? goal.cancelledAt,
      });
    }
  }

  return Array.from(byId.values());
}
