import { useMemo } from 'react';

import {
  STUDENT_AVATARS,
  getStudentAvatar,
} from '../../data/studentAvatars';
import { studentTitleDisplayLabel } from '../../data/studentTitles';
import { useGameStore, type StudentState } from '../../store/useGameStore';

export default function StudentProfilePanel({
  student,
}: {
  student: StudentState;
}) {
  const updateStudent = useGameStore(state => state.updateStudent);
  const avatar = getStudentAvatar(student.activeAvatarId);

  const activeTitle = useMemo(
    () =>
      (student.specialUnlocks ?? []).find(
        unlock =>
          unlock.kind === 'title' &&
          unlock.unlockId === student.activeTitleUnlockId
      ) ?? null,
    [student.specialUnlocks, student.activeTitleUnlockId]
  );

  const activeTitleLabel =
    student.gender && activeTitle
      ? studentTitleDisplayLabel(
          activeTitle.unlockId,
          activeTitle.labelHe,
          student.gender
        )
      : null;

  return (
    <section className="mt-6 rounded-3xl border border-cyan-300/15 bg-gradient-to-br from-cyan-500/5 via-indigo-500/5 to-fuchsia-500/5 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-white/15 bg-black/20 text-5xl shadow-lg">
            {avatar.emoji}
          </div>

          <div>
            <div className="text-xs font-black text-cyan-100/55">הפרופיל שלי</div>
            <div className="mt-1 text-xl font-black text-white">{student.name}</div>
            <div className="mt-1 text-xs font-bold text-magic-soft/60">
              {avatar.nameHe}
              {activeTitleLabel ? ` · 👑 ${activeTitleLabel}` : ''}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-center text-[11px] leading-5 text-magic-soft/55">
          דמות הפרופיל מופיעה גם בחדרי הכיתה.
          <br />
          הבחירה נשמרת אוטומטית.
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <div className="font-black text-white">בחר/י דמות פרופיל</div>
            <div className="mt-1 text-xs text-magic-soft/50">
              אפשר להחליף בכל רגע. אין לזה השפעה על נקודות או התקדמות.
            </div>
          </div>
          <div className="text-[10px] font-bold text-magic-soft/35">12 אפשרויות</div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {STUDENT_AVATARS.map(option => {
            const selected = option.id === student.activeAvatarId;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  updateStudent(student.id, { activeAvatarId: option.id })
                }
                aria-pressed={selected}
                title={option.descriptionHe}
                className={`rounded-2xl border p-3 text-center transition ${
                  selected
                    ? 'border-cyan-300/55 bg-cyan-300/15 shadow-[0_0_18px_rgba(103,232,249,0.12)]'
                    : 'border-white/10 bg-black/15 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                <div className="text-3xl">{option.emoji}</div>
                <div className="mt-2 truncate text-[10px] font-black text-white/80">
                  {option.nameHe}
                </div>
                {selected && (
                  <div className="mt-1 text-[9px] font-black text-cyan-100">נבחר</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-yellow-300/10 bg-yellow-300/5 px-4 py-3 text-[11px] leading-5 text-yellow-50/55">
        👑 את התואר שמופיע ליד השם ממשיכים לבחור באזור ההישגים והתארים למטה.
      </div>
    </section>
  );
}
