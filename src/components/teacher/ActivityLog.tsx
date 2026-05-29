import { useMemo } from 'react';
import { useClassStore } from '../../store/useClassStore';
import { useGameStore } from '../../store/useGameStore';
import { REASONS } from '../../data/reasons';

type Props = { classId: string };

export default function ActivityLog({ classId }: Props) {
  const allActivity = useClassStore(s => s.activity);
  const students = useGameStore(s => s.students);
  const undoAward = useClassStore(s => s.undoAward);
  const addPoints = useGameStore(s => s.addPoints);

  const activity = useMemo(
    () => allActivity.filter(a => a.classId === classId).slice(0, 15),
    [allActivity, classId]
  );

  function handleUndo(entryId: string) {
    const entry = undoAward(entryId);
    if (!entry) return;

    entry.studentIds.forEach(id => addPoints(id, -entry.amount));
  }

  if (activity.length === 0) {
    return (
      <p className="text-magic-soft/70 text-sm text-center py-4">
        עדיין אין פעילות
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {activity.map(entry => {
        const names = entry.studentIds
          .map(id => students[id]?.name)
          .filter(Boolean)
          .join(', ');

        const reason = REASONS.find(r => r.id === entry.reasonId);
        const timeAgo = formatTime(entry.createdAt);

        return (
          <li
            key={entry.id}
            className={`flex justify-between items-center bg-magic-bg/40 rounded-xl p-3 ${
              entry.undone ? 'opacity-40' : ''
            }`}
          >
            <div className="flex flex-col text-right">
              <span className="text-white text-sm">
                <span className="text-magic-accent font-bold">
                  {entry.amount > 0 ? '+' : ''}
                  {entry.amount}
                </span>
                {' · '}
                {names || '(לא ידוע)'}
                {reason && (
                  <span className="text-magic-soft/70">
                    {' · '}
                    {reason.emoji} {reason.labelHe}
                  </span>
                )}
              </span>
              <span className="text-magic-soft/50 text-xs">{timeAgo}</span>
            </div>

            {!entry.undone && (
              <button
                onClick={() => handleUndo(entry.id)}
                className="text-magic-soft/70 hover:text-magic-accent text-sm"
              >
                בטל
              </button>
            )}

            {entry.undone && (
              <span className="text-magic-soft/40 text-xs">בוטל</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function formatTime(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);

  if (diff < 60) return 'לפני רגע';
  if (diff < 3600) return `לפני ${Math.floor(diff / 60)} דק׳`;
  if (diff < 86400) return `לפני ${Math.floor(diff / 3600)} שעות`;

  return `לפני ${Math.floor(diff / 86400)} ימים`;
}