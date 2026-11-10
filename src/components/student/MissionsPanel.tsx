import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  isLichessRapidMission,
  isMissionActive,
  isMissionCompleted,
  isMissionOverdue,
  missionRewardPreset,
} from '../../data/missions';
import type { StudentMission } from '../../data/missions';
import { useGameStore, type StudentState } from '../../store/useGameStore';
import { syncLichessRapid } from '../../lib/lichessIntegration';

type Props = {
  student: StudentState;
};

const AUTO_SYNC_INTERVAL_MS = 2 * 60 * 1000;

export default function MissionsPanel({ student }: Props) {
  const loadStudentFromSupabase = useGameStore(s => s.loadStudentFromSupabase);
  const [syncingLichess, setSyncingLichess] = useState(false);
  const [lichessError, setLichessError] = useState<string | null>(null);
  const [awardMessage, setAwardMessage] = useState<string | null>(null);

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

  const activeLichessMission = useMemo(
    () => active.find(isLichessRapidMission) ?? null,
    [active]
  );

  const syncLichess = useCallback(async () => {
    if (!activeLichessMission || syncingLichess) return;

    setSyncingLichess(true);
    setLichessError(null);

    try {
      const result = await syncLichessRapid(student.supabaseId ?? student.id);
      const awardedPoints = Math.max(0, result.awardedPoints ?? 0);
      const roundsCompleted = Math.max(0, result.roundsCompletedAdded ?? 0);

      if (awardedPoints > 0) {
        setAwardMessage(
          roundsCompleted > 1
            ? `🎉 השלמת ${roundsCompleted} סבבי Rapid! קיבלת ${awardedPoints} נקודות.`
            : `🎉 סבב ה־Rapid הושלם! קיבלת ${awardedPoints} נקודות.`
        );
      }

      await loadStudentFromSupabase(student.supabaseId ?? student.id);
    } catch (err) {
      setLichessError(
        err instanceof Error ? err.message : 'לא הצלחנו לבדוק משחקים חדשים בליצ׳ס.'
      );
    } finally {
      setSyncingLichess(false);
    }
  }, [
    activeLichessMission?.id,
    loadStudentFromSupabase,
    student.id,
    student.supabaseId,
    syncingLichess,
  ]);

  useEffect(() => {
    if (!activeLichessMission) return;
    void syncLichess();
    // Sync once when this Lichess mission becomes active.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLichessMission?.id]);

  useEffect(() => {
    if (!activeLichessMission) return;

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void syncLichess();
      }
    }, AUTO_SYNC_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void syncLichess();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [activeLichessMission?.id, syncLichess]);

  return (
    <div className="text-right">
      <div className="mb-6 text-center">
        <div className="mb-2 text-5xl">📋</div>
        <h2 className="text-3xl font-black text-magic-accent">המשימות שלי</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-magic-soft/75">
          משימות רגילות מאושרות על ידי המורה. במשימות Lichess Rapid המערכת
          מזהה את המשחקים ומסיימת את המשימה אוטומטית.
        </p>
      </div>

      {awardMessage && (
        <div className="mb-5 rounded-3xl border border-emerald-300/25 bg-emerald-500/10 p-4 text-center text-sm font-black text-emerald-100">
          {awardMessage}
        </div>
      )}

      {lichessError && activeLichessMission && (
        <div className="mb-4 rounded-2xl border border-amber-300/20 bg-amber-500/8 px-3 py-2 text-center text-xs font-bold text-amber-100/80">
          {lichessError} ננסה שוב בהמשך.
        </div>
      )}

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
            {active.map(mission =>
              isLichessRapidMission(mission) ? (
                <LichessMissionCard
                  key={mission.id}
                  mission={mission}
                  syncing={syncingLichess}
                  onSync={() => void syncLichess()}
                />
              ) : (
                <ManualMissionCard key={mission.id} mission={mission} />
              )
            )}
          </div>
        )}
      </section>

      {completed.length > 0 && (
        <section>
          <h3 className="mb-3 text-lg font-black text-white">הושלמו לאחרונה 🎉</h3>
          <div className="flex flex-col gap-2">
            {completed.map(mission => {
              const lichess = isLichessRapidMission(mission);
              return (
                <div
                  key={mission.id}
                  className="flex flex-col gap-2 rounded-2xl border border-emerald-300/15 bg-emerald-500/8 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="font-bold text-white">
                      {lichess ? '♟️ ' : ''}{mission.title}
                    </div>
                    <div className="mt-0.5 text-xs text-magic-soft/50">
                      {lichess ? 'הושלמה אוטומטית ' : 'הושלמה '}
                      {formatRelativeDate(mission.completedAt ?? Date.now())}
                      {lichess && mission.lichessRecurrenceMode !== 'none' && mission.lichessSeriesRound
                        ? ` · סבב ${mission.lichessSeriesRound}`
                        : ''}
                    </div>
                  </div>
                  <div className="text-sm font-black text-emerald-200">
                    ✓ קיבלת +{mission.rewardPoints} נקודות
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function ManualMissionCard({ mission }: { mission: StudentMission }) {
  const preset = missionRewardPreset(mission.rewardTier);
  const overdue = isMissionOverdue(mission);

  return (
    <article
      className={`rounded-3xl border p-5 ${
        overdue
          ? 'border-rose-300/30 bg-rose-500/10'
          : 'border-white/10 bg-magic-bg/40'
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-black text-white">{mission.title}</div>
          <div className="mt-1 text-xs font-bold text-magic-soft/55">
            {preset.emoji} {preset.labelHe}
          </div>
        </div>
        <RewardBadge points={mission.rewardPoints} />
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
        <DueDate mission={mission} overdue={overdue} />
      </div>
    </article>
  );
}

function LichessMissionCard({
  mission,
  syncing,
  onSync,
}: {
  mission: StudentMission;
  syncing: boolean;
  onSync: () => void;
}) {
  const overdue = isMissionOverdue(mission);
  const required = Math.max(1, mission.lichessRequiredGames ?? 1);
  const progress = Math.min(required, Math.max(0, mission.lichessProgressGames ?? 0));
  const remaining = Math.max(0, required - progress);
  const pct = Math.round((progress / required) * 100);
  const recurrenceMode = mission.lichessRecurrenceMode ?? 'none';
  const recurrenceRound = Math.max(1, mission.lichessSeriesRound ?? 1);
  const recurrenceTotal = mission.lichessSeriesTotalRounds ?? null;
  const recurring = recurrenceMode !== 'none';

  return (
    <article
      className={`rounded-3xl border p-5 ${
        overdue
          ? 'border-rose-300/30 bg-rose-500/10'
          : 'border-cyan-300/25 bg-cyan-500/5'
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-black text-white">♟️ {mission.title}</div>
          <div className="mt-1 text-xs font-bold text-cyan-100/65">
            Lichess Rapid · השלמה אוטומטית{recurring ? ' · 🔁 חוזרת' : ''}
          </div>
        </div>
        <RewardBadge points={mission.rewardPoints} />
      </div>

      {mission.description && (
        <p className="mb-4 whitespace-pre-wrap text-sm leading-6 text-magic-soft/80">
          {mission.description}
        </p>
      )}

      {recurring && (
        <div className="mb-3 rounded-xl border border-cyan-300/15 bg-cyan-500/5 px-3 py-2 text-xs font-bold text-cyan-50/75">
          🔁 {recurrenceTotal !== null
            ? `סבב ${recurrenceRound} מתוך ${recurrenceTotal}`
            : `סבב ${recurrenceRound} · המשימה תתחיל מחדש אחרי כל השלמה עד שהמורה יעצור אותה`}
        </div>
      )}

      <div className="rounded-2xl bg-magic-bg/45 p-4">
        <div className="flex items-center justify-between gap-3 text-sm font-bold">
          <span className="text-magic-soft/75">התקדמות</span>
          <span className="font-black text-cyan-100" dir="ltr">
            {progress} / {required}
          </span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-magic-bg/70">
          <div
            className="h-full rounded-full bg-gradient-to-l from-cyan-300 to-blue-400 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 text-xs font-bold text-cyan-50/80">
          {remaining === 1
            ? 'עוד משחק תקין אחד להשלמת המשימה.'
            : `עוד ${remaining} משחקים תקינים להשלמת המשימה.`}
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2 text-[11px] leading-5 text-magic-soft/60">
        משחק Rapid נספר אם ניצחת, או אם שני הצדדים השלימו לפחות 15 מסעים.
        הפסד או תיקו קצר יותר לא נספרים.
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <a
          href="https://lichess.org/"
          target="_blank"
          rel="noreferrer"
          className="rounded-xl bg-cyan-200 px-3 py-2.5 text-center text-xs font-black text-cyan-950"
        >
          לשחק בליצ׳ס ↗
        </a>
        <button
          type="button"
          onClick={onSync}
          disabled={syncing}
          className="rounded-xl border border-cyan-300/20 bg-cyan-500/10 px-3 py-2.5 text-xs font-black text-cyan-100 disabled:opacity-40"
        >
          {syncing ? 'בודק...' : 'בדיקה עכשיו'}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-3 text-xs">
        <span className="font-bold text-cyan-100/75">
          🤖 {recurring ? 'בסיום הסבב הפרס ניתן והסבב הבא מתחיל אוטומטית' : 'המערכת מסיימת את המשימה אוטומטית'}
        </span>
        <DueDate mission={mission} overdue={overdue} />
      </div>
    </article>
  );
}

function RewardBadge({ points }: { points: number }) {
  return (
    <div className="shrink-0 rounded-2xl border border-yellow-300/25 bg-yellow-400/10 px-3 py-2 text-center">
      <div className="text-lg font-black text-yellow-200">+{points}</div>
      <div className="text-[10px] text-yellow-100/60">נקודות</div>
    </div>
  );
}

function DueDate({
  mission,
  overdue,
}: {
  mission: StudentMission;
  overdue: boolean;
}) {
  if (mission.dueAt === null) return null;

  return (
    <span
      className={overdue ? 'font-bold text-rose-200' : 'text-magic-soft/55'}
    >
      {overdue ? '⚠️ עבר התאריך · ' : '🗓️ עד '}
      {formatDate(mission.dueAt)}
    </span>
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
