import { useMemo, useState } from 'react';
import {
  classGoalMetricDefinition,
  classGoalProgress,
  isClassGoalActive,
  isClassGoalCompleted,
  isClassGoalOverdue,
  type StudentClassGoal,
} from '../../data/classGoals';
import { useGameStore, type StudentState } from '../../store/useGameStore';

type Props = {
  classId: string;
  students: StudentState[];
  onCreateGoal: () => void;
};

export default function ClassGoalBoard({ classId, students, onCreateGoal }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [busy, setBusy] = useState(false);
  const cancelClassGoal = useGameStore(s => s.cancelClassGoal);
  const goals = useMemo(() => mergeClassGoals(students), [students]);
  const active = goals
    .filter(isClassGoalActive)
    .sort((first, second) => second.createdAt - first.createdAt)[0] ?? null;
  const completed = goals
    .filter(isClassGoalCompleted)
    .sort((first, second) => (second.completedAt ?? 0) - (first.completedAt ?? 0))
    .slice(0, 3);

  async function cancelActiveGoal() {
    if (!active || busy) return;
    setBusy(true);
    await cancelClassGoal(classId, active.id);
    setBusy(false);
  }

  return (
    <div className="mb-4 rounded-3xl bg-magic-panel/80 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={() => setExpanded(value => !value)} className="text-right">
          <div className="font-black text-magic-accent">🎯 יעד כיתתי משותף</div>
          <div className="mt-0.5 text-sm text-magic-soft/65">
            {active ? `${classGoalProgress(active)}/${active.target} צעדים · לחצו לפרטים` : 'אין כרגע יעד פעיל'}
          </div>
        </button>

        <button
          type="button"
          onClick={onCreateGoal}
          disabled={students.length === 0 || active !== null}
          className="rounded-xl bg-magic-accent px-5 py-2 font-black text-magic-bg transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
          title={active ? 'מסיימים או מבטלים את היעד הפעיל לפני יצירת יעד חדש' : undefined}
        >
          + יעד חדש
        </button>
      </div>

      {expanded && (
        <div className="mt-5">
          {active ? (
            <ActiveGoalCard goal={active} busy={busy} onCancel={cancelActiveGoal} />
          ) : (
            <div className="rounded-2xl border border-white/10 bg-magic-bg/30 p-5 text-center text-sm text-magic-soft/65">
              צרו מטרה אחת שכל הכיתה מתקדמת אליה יחד. אין דירוג אישי ואין פרס נקודות — רק הישג משותף.
            </div>
          )}

          {completed.length > 0 && (
            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="mb-2 text-xs font-black uppercase tracking-wide text-magic-soft/45">
                הישגים כיתתיים אחרונים
              </div>
              <div className="flex flex-col gap-2">
                {completed.map(goal => (
                  <div
                    key={goal.id}
                    className="flex flex-col gap-1 rounded-2xl border border-emerald-300/10 bg-emerald-500/8 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="font-bold text-white">🏆 {goal.title}</span>
                    <span className="text-xs font-black text-emerald-200">
                      ⭐ כוכב ממלכה · {goal.target} צעדים
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ActiveGoalCard({
  goal,
  busy,
  onCancel,
}: {
  goal: StudentClassGoal;
  busy: boolean;
  onCancel: () => Promise<void>;
}) {
  const progress = classGoalProgress(goal);
  const pct = Math.min(100, Math.round((progress / goal.target) * 100));
  const metric = classGoalMetricDefinition(goal.metric);
  const overdue = isClassGoalOverdue(goal);

  return (
    <div className={`rounded-2xl border p-4 ${overdue ? 'border-rose-300/25 bg-rose-500/8' : 'border-cyan-300/20 bg-cyan-500/8'}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-lg font-black text-white">{goal.title}</div>
          {goal.description && (
            <p className="mt-1 max-w-xl whitespace-pre-wrap text-xs leading-5 text-magic-soft/65">
              {goal.description}
            </p>
          )}
          <div className="mt-2 text-xs font-bold text-cyan-100/70">
            {metric.emoji} {metric.labelHe}
          </div>
        </div>
        <div className="shrink-0 text-center">
          <div className="text-3xl font-black text-white">{progress}/{goal.target}</div>
          <div className="text-[10px] text-magic-soft/50">צעדים משותפים</div>
        </div>
      </div>

      <div className="mt-4 h-4 overflow-hidden rounded-full bg-magic-bg/70">
        <div
          className="h-full bg-gradient-to-l from-magic-accent to-magic-soft transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-3 flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
        <span className={overdue ? 'font-bold text-rose-200' : 'text-magic-soft/55'}>
          {goal.dueAt !== null ? `${overdue ? '⚠️ עבר היעד · ' : '🗓️ עד '}${formatDate(goal.dueAt)}` : 'ללא תאריך סיום'}
        </span>
        <button
          type="button"
          onClick={() => void onCancel()}
          disabled={busy}
          className="rounded-lg border border-white/10 bg-magic-bg/45 px-3 py-1.5 font-bold text-magic-soft/65 disabled:opacity-40"
        >
          {busy ? 'מבטל...' : 'בטל יעד'}
        </button>
      </div>
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

      const contributionIds = Array.from(new Set([...current.contributionIds, ...goal.contributionIds]));
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

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'numeric',
  }).format(new Date(timestamp));
}
