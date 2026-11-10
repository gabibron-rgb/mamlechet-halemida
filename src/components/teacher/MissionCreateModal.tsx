import { useEffect, useMemo, useState } from 'react';
import Modal from '../shared/Modal';
import {
  MISSION_REWARD_PRESETS,
  MISSION_REWARD_TIERS,
} from '../../data/missions';
import type { MissionRewardTier } from '../../data/missions';
import { useGameStore } from '../../store/useGameStore';
import type { StudentState } from '../../store/useGameStore';
import { useSessionStore } from '../../store/useSessionStore';
import { genId } from '../../utils/storage';
import {
  createLichessRapidTask,
  getLichessRapidStatus,
} from '../../lib/lichessIntegration';
import type { LichessRecurrenceMode } from '../../lib/lichessIntegration';

type Props = {
  open: boolean;
  onClose: () => void;
  students: StudentState[];
};

type MissionKind = 'manual' | 'lichess_rapid';

export default function MissionCreateModal({ open, onClose, students }: Props) {
  const [missionKind, setMissionKind] = useState<MissionKind>('manual');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rewardTier, setRewardTier] = useState<MissionRewardTier>('small');
  const [dueDate, setDueDate] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lichessGames, setLichessGames] = useState('5');
  const [lichessPoints, setLichessPoints] = useState('3');
  const [lichessRecurrenceMode, setLichessRecurrenceMode] =
    useState<LichessRecurrenceMode>('none');
  const [lichessAdditionalRepeats, setLichessAdditionalRepeats] = useState('3');

  const assignMissionToStudents = useGameStore(s => s.assignMissionToStudents);
  const loadStudentFromSupabase = useGameStore(s => s.loadStudentFromSupabase);
  const teacherId = useSessionStore(s => s.currentTeacherId);

  useEffect(() => {
    if (!open) return;
    setSelected(new Set(students.map(student => student.id)));
    // We intentionally initialize the selection only when the modal opens.
    // TeacherHome refreshes students from Supabase every 10 seconds, and we do
    // not want that polling to overwrite a teacher's manual selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const allSelected = useMemo(
    () => students.length > 0 && selected.size === students.length,
    [selected, students.length]
  );

  const selectedStudents = useMemo(
    () => students.filter(student => selected.has(student.id)),
    [selected, students]
  );

  function reset() {
    setMissionKind('manual');
    setTitle('');
    setDescription('');
    setRewardTier('small');
    setDueDate('');
    setSelected(new Set());
    setSaving(false);
    setError(null);
    setLichessGames('5');
    setLichessPoints('3');
    setLichessRecurrenceMode('none');
    setLichessAdditionalRepeats('3');
  }

  function close() {
    if (saving) return;
    reset();
    onClose();
  }

  function chooseMissionKind(nextKind: MissionKind) {
    setMissionKind(nextKind);
    setError(null);

    if (nextKind === 'lichess_rapid' && !title.trim()) {
      setTitle('אתגר Rapid בליצ׳ס');
    }
    if (nextKind === 'manual' && title.trim() === 'אתגר Rapid בליצ׳ס') {
      setTitle('');
    }
    if (nextKind === 'manual') {
      setLichessRecurrenceMode('none');
    }
  }

  function toggleStudent(studentId: string) {
    setSelected(current => {
      const next = new Set(current);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
    setError(null);
  }

  function toggleAll() {
    setSelected(
      allSelected ? new Set() : new Set(students.map(student => student.id))
    );
    setError(null);
  }

  function dueAtFromInput(): number | null {
    if (!dueDate) return null;
    const value = new Date(`${dueDate}T23:59:59`).getTime();
    return Number.isFinite(value) ? value : null;
  }

  async function confirmManualMission() {
    const cleanTitle = title.trim();
    if (!cleanTitle || selected.size === 0) return false;

    return assignMissionToStudents(Array.from(selected), {
      title: cleanTitle,
      description: description.trim(),
      rewardTier,
      dueAt: dueAtFromInput(),
    });
  }

  async function confirmLichessMission() {
    if (!teacherId) {
      throw new Error('לא נמצא חשבון המורה המחובר.');
    }

    const cleanTitle = title.trim();
    const requiredGames = Number(lichessGames);
    const rewardPoints = Number(lichessPoints);
    const additionalRepeats = Number(lichessAdditionalRepeats);

    if (!cleanTitle) throw new Error('יש להזין שם למשימה.');
    if (!Number.isInteger(requiredGames) || requiredGames < 1 || requiredGames > 100) {
      throw new Error('מספר משחקי ה־Rapid צריך להיות בין 1 ל־100.');
    }
    if (!Number.isInteger(rewardPoints) || rewardPoints < 1 || rewardPoints > 1000) {
      throw new Error('מספר הנקודות צריך להיות בין 1 ל־1000.');
    }
    if (selectedStudents.length === 0) {
      throw new Error('יש לבחור לפחות תלמיד/ה אחד/ת.');
    }
    if (
      lichessRecurrenceMode === 'finite' &&
      (!Number.isInteger(additionalRepeats) ||
        additionalRepeats < 1 ||
        additionalRepeats > 99)
    ) {
      throw new Error('מספר החזרות הנוספות צריך להיות בין 1 ל־99.');
    }

    // Preflight first, so we do not knowingly create a group mission for only
    // part of the selected students.
    const statuses = await Promise.all(
      selectedStudents.map(async student => ({
        student,
        status: await getLichessRapidStatus(student.supabaseId ?? student.id),
      }))
    );

    const notLinked = statuses
      .filter(item => !item.status.linked)
      .map(item => item.student.name);
    if (notLinked.length > 0) {
      throw new Error(
        `אין חשבון Lichess מחובר עבור: ${notLinked.join(', ')}. יש לחבר אותו קודם בפרטי התלמיד/ה.`
      );
    }

    const alreadyActive = statuses
      .filter(item => Boolean(item.status.activeTask))
      .map(item => item.student.name);
    if (alreadyActive.length > 0) {
      throw new Error(
        `כבר קיימת משימת Rapid פעילה עבור: ${alreadyActive.join(', ')}.`
      );
    }

    const missionId = genId('mission');
    const dueAt =
      lichessRecurrenceMode === 'none' ? dueAtFromInput() : null;
    const recurrenceTotalRounds =
      lichessRecurrenceMode === 'finite' ? additionalRepeats + 1 : null;

    for (const student of selectedStudents) {
      await createLichessRapidTask({
        studentId: student.supabaseId ?? student.id,
        teacherId,
        missionId,
        title: cleanTitle,
        description: description.trim(),
        requiredGames,
        rewardPoints,
        dueAt,
        recurrenceMode: lichessRecurrenceMode,
        recurrenceTotalRounds,
      });
    }

    await Promise.all(
      selectedStudents.map(student =>
        loadStudentFromSupabase(student.supabaseId ?? student.id)
      )
    );

    return true;
  }

  async function confirm() {
    if (!title.trim() || selected.size === 0 || saving) return;

    setSaving(true);
    setError(null);

    try {
      const success =
        missionKind === 'lichess_rapid'
          ? await confirmLichessMission()
          : await confirmManualMission();

      if (success) {
        reset();
        onClose();
        return;
      }

      setError('לא הצלחנו ליצור את המשימה. כדאי לנסות שוב.');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'לא הצלחנו ליצור את המשימה.'
      );
    } finally {
      setSaving(false);
    }
  }

  const reward = MISSION_REWARD_PRESETS[rewardTier];

  return (
    <Modal open={open} onClose={close} title="📋 משימה חדשה">
      <div className="flex flex-col gap-5 text-right">
        <div>
          <div className="mb-2 text-sm font-bold text-magic-soft">סוג המשימה</div>
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-magic-bg/25 p-2">
            <button
              type="button"
              onClick={() => chooseMissionKind('manual')}
              className={`rounded-xl px-3 py-3 text-sm font-black transition-colors ${
                missionKind === 'manual'
                  ? 'bg-magic-accent text-magic-bg'
                  : 'text-magic-soft hover:bg-white/5'
              }`}
            >
              📋 משימה רגילה
            </button>
            <button
              type="button"
              onClick={() => chooseMissionKind('lichess_rapid')}
              className={`rounded-xl px-3 py-3 text-sm font-black transition-colors ${
                missionKind === 'lichess_rapid'
                  ? 'bg-cyan-200 text-cyan-950'
                  : 'text-magic-soft hover:bg-white/5'
              }`}
            >
              ♟️ משימת Lichess Rapid
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-magic-soft">
            שם המשימה
          </label>
          <input
            value={title}
            onChange={event => setTitle(event.target.value)}
            maxLength={80}
            placeholder={
              missionKind === 'lichess_rapid'
                ? 'למשל: אתגר Rapid של השבוע'
                : 'למשל: אתגר החשיבה של השבוע'
            }
            className="w-full rounded-xl border border-white/15 bg-magic-bg/55 px-3 py-2 text-white outline-none placeholder:text-magic-soft/35 focus:border-magic-accent/60"
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <label className="text-sm font-bold text-magic-soft">מה צריך לעשות?</label>
            <span className="text-[10px] text-magic-soft/40">
              {description.length}/240
            </span>
          </div>
          <textarea
            value={description}
            onChange={event => setDescription(event.target.value)}
            maxLength={240}
            rows={3}
            placeholder={
              missionKind === 'lichess_rapid'
                ? 'הערה אופציונלית לתלמידים...'
                : 'תיאור קצר וברור לילדים...'
            }
            className="w-full resize-none rounded-xl border border-white/15 bg-magic-bg/55 px-3 py-2 text-white outline-none placeholder:text-magic-soft/35 focus:border-magic-accent/60"
          />
        </div>

        {missionKind === 'manual' ? (
          <div>
            <div className="mb-2 text-sm font-bold text-magic-soft">גודל המשימה והפרס</div>
            <div className="grid gap-2 sm:grid-cols-3">
              {MISSION_REWARD_TIERS.map(tier => {
                const preset = MISSION_REWARD_PRESETS[tier];
                const active = rewardTier === tier;
                return (
                  <button
                    type="button"
                    key={tier}
                    onClick={() => setRewardTier(tier)}
                    className={`rounded-2xl border p-3 text-right transition-colors ${
                      active
                        ? 'border-magic-accent/60 bg-magic-accent/15'
                        : 'border-white/10 bg-magic-bg/35 hover:bg-magic-bg/55'
                    }`}
                  >
                    <div className="font-black text-white">
                      {preset.emoji} {preset.labelHe}
                    </div>
                    <div className="mt-1 text-lg font-black text-magic-accent">
                      +{preset.points} נקודות
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs leading-5 text-magic-soft/55">
              במשימה רגילה המורה מסמן ידנית כשהיא הושלמה.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-500/5 p-4">
            <div className="text-sm font-black text-cyan-100">♟️ תנאי משימת Rapid</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-bold text-magic-soft">מספר משחקים</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={lichessGames}
                  onChange={event => {
                    setLichessGames(event.target.value);
                    setError(null);
                  }}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-magic-bg/60 px-3 py-2 text-center text-lg font-black text-white outline-none focus:border-cyan-300/60"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-magic-soft">נקודות בסיום</span>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={lichessPoints}
                  onChange={event => {
                    setLichessPoints(event.target.value);
                    setError(null);
                  }}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-magic-bg/60 px-3 py-2 text-center text-lg font-black text-yellow-200 outline-none focus:border-yellow-300/60"
                />
              </label>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-magic-bg/30 p-3">
              <label className="flex cursor-pointer items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-black text-white">🔁 משימה חוזרת אוטומטית</div>
                  <div className="mt-1 text-[11px] leading-5 text-magic-soft/55">
                    בכל פעם שהיעד מושלם, הפרס ניתן והמשימה מתחילה מחדש עם אותם מספר משחקים ונקודות.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={lichessRecurrenceMode !== 'none'}
                  onChange={event => {
                    setLichessRecurrenceMode(event.target.checked ? 'finite' : 'none');
                    setError(null);
                  }}
                  className="h-5 w-5 shrink-0 accent-cyan-300"
                />
              </label>

              {lichessRecurrenceMode !== 'none' && (
                <div className="mt-3 border-t border-white/8 pt-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setLichessRecurrenceMode('finite')}
                      className={`rounded-xl border px-3 py-2 text-xs font-black ${
                        lichessRecurrenceMode === 'finite'
                          ? 'border-cyan-300/50 bg-cyan-300/15 text-cyan-100'
                          : 'border-white/10 bg-magic-bg/40 text-magic-soft/65'
                      }`}
                    >
                      מספר חזרות מוגדר
                    </button>
                    <button
                      type="button"
                      onClick={() => setLichessRecurrenceMode('until_stopped')}
                      className={`rounded-xl border px-3 py-2 text-xs font-black ${
                        lichessRecurrenceMode === 'until_stopped'
                          ? 'border-cyan-300/50 bg-cyan-300/15 text-cyan-100'
                          : 'border-white/10 bg-magic-bg/40 text-magic-soft/65'
                      }`}
                    >
                      עד שאעצור אותה
                    </button>
                  </div>

                  {lichessRecurrenceMode === 'finite' && (
                    <label className="mt-3 block">
                      <span className="text-xs font-bold text-magic-soft">מספר חזרות נוספות</span>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={lichessAdditionalRepeats}
                        onChange={event => {
                          setLichessAdditionalRepeats(event.target.value);
                          setError(null);
                        }}
                        className="mt-1 w-full rounded-xl border border-white/15 bg-magic-bg/60 px-3 py-2 text-center text-lg font-black text-white outline-none focus:border-cyan-300/60"
                      />
                      <span className="mt-1 block text-[10px] leading-4 text-magic-soft/45">
                        לדוגמה: 4 חזרות נוספות = 5 השלמות ו־5 פרסים בסך הכול.
                      </span>
                    </label>
                  )}

                  {lichessRecurrenceMode === 'until_stopped' && (
                    <div className="mt-3 rounded-xl border border-cyan-300/15 bg-cyan-500/5 px-3 py-2 text-[11px] leading-5 text-cyan-50/70">
                      אחרי כל השלמה יתחיל סבב חדש אוטומטית, עד שתעצור/י את הסדרה ממסך המשימות.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-3 text-xs leading-5 text-cyan-50/70">
              ההשלמה אוטומטית. משחק Rapid נספר אם התלמיד/ה ניצח/ה, או אם שני הצדדים השלימו לפחות 15 מסעים. כשהיעד מושלם, הנקודות ניתנות אוטומטית והמשימה נספרת גם ביעד הכיתתי של השלמת משימות.
            </div>
          </div>
        )}

        {missionKind !== 'lichess_rapid' || lichessRecurrenceMode === 'none' ? (
          <div>
            <label className="mb-1 block text-sm font-bold text-magic-soft">
              תאריך יעד (אופציונלי)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={event => setDueDate(event.target.value)}
              className="w-full rounded-xl border border-white/15 bg-magic-bg/55 px-3 py-2 text-white outline-none focus:border-magic-accent/60"
            />
          </div>
        ) : (
          <div className="rounded-xl border border-white/8 bg-magic-bg/30 px-3 py-2 text-xs leading-5 text-magic-soft/55">
            למשימה חוזרת אין תאריך יעד קבוע: כל סבב מתחיל מיד כשהסבב הקודם מושלם.
          </div>
        )}

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-magic-soft">
              למי המשימה? ({selected.size})
            </span>
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs font-bold text-magic-accent hover:underline"
            >
              {allSelected ? 'נקה בחירה' : 'בחר/י את כל הכיתה'}
            </button>
          </div>
          <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto rounded-2xl border border-white/10 bg-magic-bg/25 p-2 sm:grid-cols-3">
            {students.map(student => {
              const active = selected.has(student.id);
              return (
                <button
                  type="button"
                  key={student.id}
                  onClick={() => toggleStudent(student.id)}
                  className={`rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                    active
                      ? 'bg-magic-accent text-magic-bg'
                      : 'bg-magic-bg/55 text-white hover:bg-magic-bg/80'
                  }`}
                >
                  {student.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-300/15 bg-emerald-500/8 p-3 text-xs leading-5 text-emerald-100/75">
          {missionKind === 'manual' ? (
            <>
              <strong>הפרס שנבחר:</strong> {reward.emoji} +{reward.points} נקודות לכל
              תלמיד/ה שהמורה יסמן כהושלם. נקודות המשימה יכולות לשמש במשחק ובחיה,
              אבל אינן נחשבות כהוכחת התנהגות לצורך התפתחות החיה.
            </>
          ) : (
            <>
              <strong>השלמה אוטומטית:</strong> כשהמערכת מזהה את מספר משחקי ה־Rapid שנקבע,
              היא מעניקה את הנקודות בלי פעולה נוספת של המורה.
              {lichessRecurrenceMode !== 'none' && ' בסדרה חוזרת, סבב חדש נפתח מיד עם אותם תנאים.'}
            </>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-center text-xs font-bold text-red-200">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={close}
            disabled={saving}
            className="flex-1 rounded-xl bg-magic-bg/60 py-3 font-bold text-magic-soft disabled:opacity-40"
          >
            ביטול
          </button>
          <button
            type="button"
            onClick={() => void confirm()}
            disabled={!title.trim() || selected.size === 0 || saving}
            className="flex-1 rounded-xl bg-magic-accent py-3 font-black text-magic-bg disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? 'שומר...' : `צור/י משימה ל־${selected.size}`}
          </button>
        </div>
      </div>
    </Modal>
  );
}
