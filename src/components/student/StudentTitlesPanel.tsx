import { useMemo, useState } from 'react';

import { studentTitleDisplayLabel } from '../../data/studentTitles';
import { useGameStore, type StudentState } from '../../store/useGameStore';

type Props = {
  student: StudentState;
};

function sourceLabel(sourceAchievementId: string): string {
  if (sourceAchievementId.startsWith('journey:')) return 'מסע מיוחד';
  if (sourceAchievementId.startsWith('basic-title:')) return 'תואר בסיסי';
  return 'הישג';
}


export default function StudentTitlesPanel({ student }: Props) {
  const setActiveTitle = useGameStore(s => s.setActiveTitle);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const titles = useMemo(
    () =>
      [...(student.specialUnlocks ?? [])]
        .filter(unlock => unlock.kind === 'title')
        .sort((first, second) => second.unlockedAt - first.unlockedAt),
    [student.specialUnlocks]
  );

  const activeTitle =
    titles.find(unlock => unlock.unlockId === student.activeTitleUnlockId) ?? null;

  async function chooseTitle(unlockId: string | null) {
    setBusyId(unlockId ?? '__none__');
    setMessage(null);

    const ok = await setActiveTitle(student.id, unlockId);
    setBusyId(null);

    if (!ok) {
      setMessage('לא הצלחתי לשנות את התואר כרגע. כדאי לרענן ולנסות שוב.');
      return;
    }

    setMessage(unlockId ? '👑 התואר החדש מוצג עכשיו בפרופיל שלך.' : 'התואר הוסר מהפרופיל.');
  }

  return (
    <div className="mb-7 rounded-3xl border border-yellow-300/20 bg-gradient-to-l from-yellow-300/8 to-purple-500/5 p-5 text-right">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-lg font-black text-yellow-100">👑 התואר שלי</div>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-magic-soft/60">
            תארים נפתחים לאורך הדרך — חלקם פשוטים ומהירים, ואחרים נדירים ומגיעים מהישגים וממסעות מיוחדים. אפשר לבחור תואר אחד שיופיע ליד השם שלך וגם כשחברים מבקרים בחדר שלך.
          </p>
        </div>

        <div className="rounded-2xl border border-yellow-300/15 bg-black/15 px-4 py-3 text-center">
          <div className="text-[10px] font-bold text-magic-soft/45">מוצג עכשיו</div>
          <div className="mt-1 text-sm font-black text-yellow-100">
            {activeTitle ? `👑 ${studentTitleDisplayLabel(activeTitle.unlockId, activeTitle.labelHe, student.gender)}` : 'ללא תואר'}
          </div>
        </div>
      </div>

      {message && (
        <div className="mt-4 rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-center text-xs font-bold text-white/80">
          {message}
        </div>
      )}

      {!student.gender && (
        <div className="mt-4 rounded-2xl border border-sky-300/20 bg-sky-400/8 px-4 py-4 text-center text-sm text-sky-100/80">
          התארים שלך כבר נשמרים, אבל המורה עדיין צריך להגדיר אם להציג אותם בניסוח לבן או לבת. אחרי ההגדרה הם יופיעו כאן אוטומטית.
        </div>
      )}

      {!student.gender ? null : titles.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-black/10 px-4 py-5 text-center text-sm text-magic-soft/50">
          תואר בסיסי אמור להיפתח כאן אוטומטית. אם עדיין לא מופיע תואר, כדאי לרענן את המסך.
        </div>
      ) : (
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {titles.map(title => {
            const selected = title.unlockId === student.activeTitleUnlockId;
            const busy = busyId === title.unlockId;

            return (
              <button
                key={title.unlockId}
                type="button"
                disabled={busyId !== null}
                onClick={() => void chooseTitle(title.unlockId)}
                className={`rounded-2xl border p-3 text-right transition disabled:opacity-50 ${
                  selected
                    ? 'border-yellow-300/45 bg-yellow-300/12'
                    : 'border-white/10 bg-black/10 hover:border-yellow-300/25 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-black text-yellow-50">👑 {studentTitleDisplayLabel(title.unlockId, title.labelHe, student.gender)}</div>
                  {selected && (
                    <span className="rounded-full bg-yellow-300 px-2 py-0.5 text-[9px] font-black text-indigo-950">
                      מוצג
                    </span>
                  )}
                </div>
                <div className="mt-1 text-[10px] text-magic-soft/45">
                  {sourceLabel(title.sourceAchievementId)}
                </div>
                {busy && <div className="mt-2 text-[10px] font-bold text-yellow-100/60">שומר...</div>}
              </button>
            );
          })}
        </div>
      )}

      {student.gender && activeTitle && (
        <button
          type="button"
          disabled={busyId !== null}
          onClick={() => void chooseTitle(null)}
          className="mt-4 text-xs font-bold text-magic-soft/45 underline decoration-white/10 underline-offset-4 hover:text-magic-soft/70 disabled:opacity-50"
        >
          להציג את השם בלי תואר
        </button>
      )}
    </div>
  );
}
