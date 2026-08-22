import {
  classGoalMetricDefinition,
  classGoalProgress,
  isClassGoalActive,
  isClassGoalCompleted,
  isClassGoalOverdue,
} from '../../data/classGoals';
import type { StudentClassGoal } from '../../data/classGoals';

type Props = {
  goals: StudentClassGoal[];
};

export default function ClassGoalBanner({ goals }: Props) {
  const active = [...goals]
    .filter(isClassGoalActive)
    .sort((first, second) => second.createdAt - first.createdAt)[0];
  const recentCompleted = [...goals]
    .filter(isClassGoalCompleted)
    .sort((first, second) => (second.completedAt ?? 0) - (first.completedAt ?? 0))[0];
  const goal = active ?? recentCompleted;

  if (!goal) return null;

  const progress = classGoalProgress(goal);
  const pct = Math.min(100, Math.round((progress / goal.target) * 100));
  const metric = classGoalMetricDefinition(goal.metric);
  const completed = isClassGoalCompleted(goal);
  const overdue = isClassGoalOverdue(goal);

  return (
    <div
      className={`mb-4 rounded-3xl border p-5 text-right ${
        completed
          ? 'border-emerald-300/30 bg-emerald-500/10'
          : overdue
            ? 'border-rose-300/30 bg-rose-500/10'
            : 'border-cyan-300/25 bg-cyan-500/10'
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-xs font-black text-cyan-100/65">🎯 היעד הכיתתי שלנו</div>
          <div className="mt-1 text-xl font-black text-white">{goal.title}</div>
          {goal.description && (
            <p className="mt-1 max-w-2xl text-sm leading-6 text-magic-soft/75">
              {goal.description}
            </p>
          )}
        </div>

        <div className="shrink-0 rounded-2xl border border-white/10 bg-black/10 px-4 py-2 text-center">
          <div className="text-2xl font-black text-white">
            {progress}/{goal.target}
          </div>
          <div className="text-[11px] text-magic-soft/55">צעדים של כל הכיתה</div>
        </div>
      </div>

      <div className="mt-4 h-4 overflow-hidden rounded-full bg-magic-bg/70">
        <div
          className="h-full bg-gradient-to-l from-magic-accent to-magic-soft transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-3 flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between">
        <span className="font-bold text-magic-soft/70">
          {metric.emoji} {metric.labelHe}
        </span>

        {completed ? (
          <span className="font-black text-emerald-200">
            🎉 הצלחנו יחד! ההישג הכיתתי הושלם
          </span>
        ) : overdue ? (
          <span className="font-black text-rose-200">⚠️ עבר תאריך היעד — המורה עדיין יכול/ה להמשיך</span>
        ) : (
          <span className="font-bold text-cyan-100/75">
            נשארו עוד {Math.max(0, goal.target - progress)} צעדים
          </span>
        )}
      </div>
    </div>
  );
}
