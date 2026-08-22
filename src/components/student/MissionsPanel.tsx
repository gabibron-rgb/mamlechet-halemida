import {
  isMissionActive,
  isMissionCompleted,
  isMissionOverdue,
  missionRewardPreset,
} from '../../data/missions';
import type { StudentState } from '../../store/useGameStore';

type Props = {
  student: StudentState;
};

export default function MissionsPanel({ student }: Props) {
  const missions = student.missions ?? [];
  const active = missions
    .filter(isMissionActive)
    .sort((first, second) => {
      const firstDue = first.dueAt ?? Number.MAX_SAFE_INTEGER;
      const secondDue = second.dueAt ?? Number.MAX_SAFE_INTEGER;
      return firstDue - secondDue || second.assignedAt - first.assignedAt;
    });
  const completed = missions
    .filter(isMissionCompleted)
    .sort((first, second) => (second.completedAt ?? 0) - (first.completedAt ?? 0))
    .slice(0, 8);

  return (
    <div className="text-right">
      <div className="mb-6 text-center">
        <div className="mb-2 text-5xl">📋</div>
        <h2 className="text-3xl font-black text-magic-accent">המשימות שלי</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-magic-soft/75">
          כאן מופיעות משימות שהמורה נתן לך. כשסיימת, אין צורך ללחוץ על
          שום דבר — המורה יסמן את המשימה כהושלמה והפרס ייכנס אוטומטית.
        </p>
      </div>

      <section className="mb-7">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-lg font-black text-white">
            משימות פעילות ({active.length})
          </h3>
          {active.length > 0 && (
            <span className="rounded-full border border-magic-accent/25 bg-magic-accent/10 px-3 py-1 text-xs font-bold text-magic-accent">
              בחר/י משימה אחת והתמקד/י בה
            </span>
          )}
        </div>

        {active.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-magic-bg/35 p-8 text-center">
            <div className="mb-2 text-4xl">✨</div>
            <div className="font-black text-white">אין כרגע משימות פעילות</div>
            <p className="mt-1 text-sm text-magic-soft/65">
              כשמורה ייתן משימה חדשה, היא תופיע כאן.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {active.map(mission => {
              const preset = missionRewardPreset(mission.rewardTier);
              const overdue = isMissionOverdue(mission);

              return (
                <article
                  key={mission.id}
                  className={`rounded-3xl border p-5 ${
                    overdue
                      ? 'border-rose-300/30 bg-rose-500/10'
                      : 'border-white/10 bg-magic-bg/40'
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-black text-white">
                        {mission.title}
                      </div>
                      <div className="mt-1 text-xs font-bold text-magic-soft/55">
                        {preset.emoji} {preset.labelHe}
                      </div>
                    </div>
                    <div className="shrink-0 rounded-2xl border border-yellow-300/25 bg-yellow-400/10 px-3 py-2 text-center">
                      <div className="text-lg font-black text-yellow-200">
                        +{mission.rewardPoints}
                      </div>
                      <div className="text-[10px] text-yellow-100/60">נקודות</div>
                    </div>
                  </div>

                  {mission.description && (
                    <p className="mb-4 whitespace-pre-wrap text-sm leading-6 text-magic-soft/80">
                      {mission.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-3 text-xs">
                    <span className="font-bold text-emerald-200/80">
                      ⏳ מחכה לאישור המורה
                    </span>
                    {mission.dueAt !== null && (
                      <span
                        className={
                          overdue
                            ? 'font-bold text-rose-200'
                            : 'text-magic-soft/55'
                        }
                      >
                        {overdue ? '⚠️ עבר התאריך · ' : '🗓️ עד '}
                        {formatDate(mission.dueAt)}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {completed.length > 0 && (
        <section>
          <h3 className="mb-3 text-lg font-black text-white">הושלמו לאחרונה 🎉</h3>
          <div className="flex flex-col gap-2">
            {completed.map(mission => (
              <div
                key={mission.id}
                className="flex flex-col gap-2 rounded-2xl border border-emerald-300/15 bg-emerald-500/8 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-bold text-white">{mission.title}</div>
                  <div className="mt-0.5 text-xs text-magic-soft/50">
                    הושלמה {formatRelativeDate(mission.completedAt ?? Date.now())}
                  </div>
                </div>
                <div className="text-sm font-black text-emerald-200">
                  ✓ קיבלת +{mission.rewardPoints} נקודות
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'numeric',
  }).format(new Date(timestamp));
}

function formatRelativeDate(timestamp: number): string {
  const days = Math.floor((Date.now() - timestamp) / 86_400_000);
  if (days <= 0) return 'היום';
  if (days === 1) return 'אתמול';
  if (days < 7) return `לפני ${days} ימים`;
  return `ב־${formatDate(timestamp)}`;
}
