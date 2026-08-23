import { useEffect, useMemo, useState } from 'react';
import { transferStudentWithinTeacherClasses } from '../../lib/studentTransfers';
import type { ClassDef } from '../../store/useClassStore';
import type { StudentState } from '../../store/useGameStore';
import Modal from '../shared/Modal';

type Props = {
  open: boolean;
  onClose: () => void;
  teacherId: string | null;
  student: StudentState | null;
  currentClass: ClassDef;
  teacherClasses: ClassDef[];
  onTransferred: (studentName: string, targetClass: ClassDef) => Promise<void> | void;
};

export default function StudentManagementModal({
  open,
  onClose,
  teacherId,
  student,
  currentClass,
  teacherClasses,
  onTransferred,
}: Props) {
  const [targetClassId, setTargetClassId] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetClasses = useMemo(
    () =>
      teacherClasses
        .filter(cls => cls.id !== currentClass.id)
        .sort((first, second) => first.nameHe.localeCompare(second.nameHe, 'he')),
    [currentClass.id, teacherClasses]
  );

  const targetClass =
    targetClasses.find(cls => cls.id === targetClassId) ?? null;

  useEffect(() => {
    if (!open) return;
    setTargetClassId('');
    setConfirming(false);
    setSaving(false);
    setError(null);
  }, [open, student?.id]);

  function close() {
    if (saving) return;
    setTargetClassId('');
    setConfirming(false);
    setError(null);
    onClose();
  }

  async function confirmTransfer() {
    if (!student || !teacherId || !targetClass || saving) return;

    setSaving(true);
    setError(null);

    const result = await transferStudentWithinTeacherClasses({
      teacherId,
      studentId: student.id,
      sourceClassId: currentClass.id,
      targetClassId: targetClass.id,
    });

    if (!result.ok) {
      setError(result.message);
      setSaving(false);
      return;
    }

    await onTransferred(student.name, targetClass);
    setSaving(false);
    onClose();
  }

  return (
    <Modal open={open} onClose={close} title="ניהול תלמיד/ה">
      {!student ? (
        <div className="py-6 text-center text-sm text-magic-soft/70">
          התלמיד/ה לא נמצא/ה. יש לסגור ולנסות שוב.
        </div>
      ) : (
        <div className="flex flex-col gap-5 text-right">
          <div className="rounded-xl bg-magic-bg/45 px-4 py-3">
            <div className="font-black text-white">{student.name}</div>
            <div className="mt-1 text-xs text-magic-soft/55">
              {currentClass.nameHe} · רמה {student.level} · {student.points} נק׳
            </div>
          </div>

          {!confirming ? (
            <section className="rounded-2xl border border-white/10 bg-magic-bg/30 p-4">
              <div className="mb-1 text-sm font-black text-white">
                העברה לכיתה אחרת
              </div>
              <p className="mb-4 text-xs leading-5 text-magic-soft/55">
                פעולה ניהולית נדירה. אפשר להעביר כרגע רק בין כיתות של אותו חשבון מורה.
              </p>

              {targetClasses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/15 p-4 text-center text-sm text-magic-soft/60">
                  אין כיתה אחרת זמינה להעברה.
                </div>
              ) : (
                <>
                  <label className="mb-1 block text-xs font-bold text-magic-soft">
                    כיתת יעד
                  </label>
                  <select
                    value={targetClassId}
                    onChange={event => {
                      setTargetClassId(event.target.value);
                      setError(null);
                    }}
                    className="w-full rounded-xl border border-white/15 bg-magic-bg/70 px-3 py-2 text-white outline-none focus:border-magic-accent/60"
                  >
                    <option value="">בחר/י כיתה...</option>
                    {targetClasses.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.nameHe}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      if (!targetClass) return;
                      setConfirming(true);
                      setError(null);
                    }}
                    disabled={!targetClass}
                    className="mt-4 w-full rounded-xl border border-magic-accent/30 bg-magic-accent/10 py-2.5 text-sm font-black text-magic-accent transition-colors hover:bg-magic-accent/15 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    המשך להעברה
                  </button>
                </>
              )}
            </section>
          ) : targetClass ? (
            <section className="rounded-2xl border border-amber-300/20 bg-amber-500/8 p-4">
              <div className="text-center text-sm font-black text-amber-100">
                להעביר את {student.name}?
              </div>

              <div className="my-4 flex items-center justify-center gap-3 text-sm font-bold">
                <span className="rounded-lg bg-magic-bg/55 px-3 py-2 text-white">
                  {currentClass.nameHe}
                </span>
                <span className="text-xl text-magic-accent">←</span>
                <span className="rounded-lg bg-magic-accent/15 px-3 py-2 text-magic-accent">
                  {targetClass.nameHe}
                </span>
              </div>

              <div className="flex flex-col gap-2 text-xs leading-5">
                <div className="rounded-xl border border-emerald-300/15 bg-emerald-500/8 px-3 py-2 text-emerald-100/80">
                  ✓ נשמרים: נקודות, XP, רמה, חדר, מלאי, חיה, גביעים, הישגים, נושאים ומשימות אישיות.
                </div>
                <div className="rounded-xl border border-sky-300/15 bg-sky-500/8 px-3 py-2 text-sky-100/80">
                  ↻ מתחלפים: היעדים ומצב הממלכה הכיתתית — התלמיד/ה יצטרף/תצטרף למצב של {targetClass.nameHe}.
                </div>
              </div>

              <p className="mt-3 text-[11px] leading-5 text-magic-soft/45">
                פרסים שכבר התקבלו נשארים בחשבון האישי. זכאות עתידית לפרסי הממלכה תחושב לפי הכיתה החדשה.
              </p>

              {error && (
                <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-center text-xs font-bold text-red-200">
                  {error}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setConfirming(false);
                    setError(null);
                  }}
                  disabled={saving}
                  className="flex-1 rounded-xl bg-magic-bg/60 py-2.5 text-sm font-bold text-magic-soft disabled:opacity-40"
                >
                  חזרה
                </button>
                <button
                  type="button"
                  onClick={() => void confirmTransfer()}
                  disabled={saving}
                  className="flex-1 rounded-xl bg-amber-300 py-2.5 text-sm font-black text-magic-bg disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {saving ? 'מעביר...' : 'כן, להעביר'}
                </button>
              </div>
            </section>
          ) : null}

          {error && !confirming && (
            <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-center text-xs font-bold text-red-200">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={close}
            disabled={saving}
            className="rounded-xl bg-magic-bg/60 py-3 font-bold text-magic-soft disabled:opacity-40"
          >
            סגירה
          </button>
        </div>
      )}
    </Modal>
  );
}
