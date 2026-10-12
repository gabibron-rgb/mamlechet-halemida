import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getLichessRapidStatus,
  syncLichessRapid,
  type LichessRapidStatus,
  type LichessRapidTask,
} from '../../lib/lichessIntegration';

type Props = {
  studentId: string;
  onAfterSync?: () => Promise<void> | void;
};

const AUTO_SYNC_INTERVAL_MS = 2 * 60 * 1000;

function progressPercent(task: LichessRapidTask): number {
  if (task.requiredGames <= 0) return 0;
  return Math.min(100, Math.max(0, (task.progressGames / task.requiredGames) * 100));
}

export default function LichessRapidCard({ studentId, onAfterSync }: Props) {
  const [status, setStatus] = useState<LichessRapidStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedTask, setCompletedTask] = useState<LichessRapidTask | null>(null);
  const [awardMessage, setAwardMessage] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const next = await getLichessRapidStatus(studentId);
      setStatus(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'לא הצלחנו לטעון את משימת ליצ׳ס.');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  const syncNow = useCallback(async () => {
    if (syncing) return;

    setSyncing(true);
    try {
      const next = await syncLichessRapid(studentId);
      setStatus(next);
      setError(null);

      const awardedPoints = Math.max(0, next.awardedPoints ?? 0);
      if (awardedPoints > 0) {
        setCompletedTask(next.completedTask ?? next.lastCompletedTask ?? null);
        setAwardMessage(`🎉 המשימה הושלמה! קיבלת ${awardedPoints} נקודות.`);
      }

      await onAfterSync?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'לא הצלחנו לבדוק משחקים חדשים.');
    } finally {
      setSyncing(false);
    }
  }, [onAfterSync, studentId, syncing]);

  useEffect(() => {
    void loadStatus().then(() => void syncNow());
  }, [loadStatus]);

  useEffect(() => {
    if (!status?.linked || !status.activeTask) return;

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void syncNow();
      }
    }, AUTO_SYNC_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void syncNow();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [status?.linked, status?.activeTask?.id, syncNow]);

  const task = status?.activeTask ?? null;
  const remaining = useMemo(() => {
    if (!task) return 0;
    return Math.max(0, task.requiredGames - task.progressGames);
  }, [task]);

  if (loading) return null;

  if (!task && !awardMessage) return null;

  if (!task && awardMessage) {
    return (
      <section className="mb-5 rounded-3xl border border-emerald-300/25 bg-emerald-500/10 p-5 text-center">
        <div className="text-4xl">🏆</div>
        <div className="mt-2 text-lg font-black text-emerald-100">{awardMessage}</div>
        {completedTask && (
          <div className="mt-1 text-xs font-bold text-emerald-100/65">
            השלמת {completedTask.requiredGames} משחקי Rapid תקינים בליצ׳ס.
          </div>
        )}
      </section>
    );
  }

  if (!task) return null;

  return (
    <section className="mb-6 rounded-3xl border border-cyan-300/20 bg-cyan-500/5 p-5 text-right">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-lg font-black text-white">♟️ אתגר Rapid בליצ׳ס</div>
          <div className="mt-1 text-xs text-cyan-100/65" dir="ltr">
            @{status?.username}
          </div>
        </div>

        <div className="shrink-0 rounded-2xl border border-yellow-300/25 bg-yellow-400/10 px-4 py-2 text-center">
          <div className="text-xl font-black text-yellow-200">+{task.rewardPoints}</div>
          <div className="text-[10px] font-bold text-yellow-100/65">נקודות בסיום</div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-magic-bg/45 p-4">
        <div className="flex items-center justify-between gap-3 text-sm font-bold">
          <span className="text-magic-soft/75">התקדמות במשימה</span>
          <span className="font-black text-cyan-100" dir="ltr">
            {task.progressGames} / {task.requiredGames}
          </span>
        </div>

        <div className="mt-2 h-3 overflow-hidden rounded-full bg-magic-bg/70">
          <div
            className="h-full rounded-full bg-gradient-to-l from-cyan-300 to-blue-400 transition-all duration-500"
            style={{ width: `${progressPercent(task)}%` }}
          />
        </div>

        <div className="mt-2 text-xs font-bold text-cyan-50/80">
          {remaining === 1
            ? 'עוד משחק תקין אחד להשלמת המשימה.'
            : `עוד ${remaining} משחקים תקינים להשלמת המשימה.`}
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2 text-[11px] leading-5 text-magic-soft/60">
        משחק Rapid נספר אם ניצחת, או אם שני הצדדים השלימו לפחות {status?.minMovesEach ?? 15} מסעים.
        הפסד או תיקו קצר יותר לא נספרים.
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <a
          href="https://lichess.org/"
          target="_blank"
          rel="noreferrer"
          className="flex-1 rounded-xl bg-cyan-200 px-4 py-2.5 text-center text-sm font-black text-cyan-950"
        >
          לשחק בליצ׳ס ↗
        </a>
        <button
          type="button"
          onClick={() => void syncNow()}
          disabled={syncing}
          className="flex-1 rounded-xl border border-cyan-300/20 bg-cyan-500/10 px-4 py-2.5 text-sm font-black text-cyan-100 disabled:opacity-40"
        >
          {syncing ? 'בודק משחקים...' : 'בדיקה עכשיו'}
        </button>
      </div>

      {error && (
        <div className="mt-3 rounded-xl border border-amber-300/20 bg-amber-500/8 px-3 py-2 text-center text-xs font-bold text-amber-100/80">
          {error} ננסה שוב בהמשך.
        </div>
      )}
    </section>
  );
}
