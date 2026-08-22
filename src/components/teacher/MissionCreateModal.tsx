import { useEffect, useMemo, useState } from 'react';
import Modal from '../shared/Modal';
import {
  MISSION_REWARD_PRESETS,
  MISSION_REWARD_TIERS,
} from '../../data/missions';
import type { MissionRewardTier } from '../../data/missions';
import { useGameStore } from '../../store/useGameStore';
import type { StudentState } from '../../store/useGameStore';

type Props = {
  open: boolean;
  onClose: () => void;
  students: StudentState[];
};

export default function MissionCreateModal({ open, onClose, students }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rewardTier, setRewardTier] = useState<MissionRewardTier>('small');
  const [dueDate, setDueDate] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const assignMissionToStudents = useGameStore(s => s.assignMissionToStudents);

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

  function reset() {
    setTitle('');
    setDescription('');
    setRewardTier('small');
    setDueDate('');
    setSelected(new Set());
    setSaving(false);
  }

  function close() {
    reset();
    onClose();
  }

  function toggleStudent(studentId: string) {
    setSelected(current => {
      const next = new Set(current);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  }

  function toggleAll() {
    setSelected(
      allSelected ? new Set() : new Set(students.map(student => student.id))
    );
  }

  async function confirm() {
    const cleanTitle = title.trim();
    if (!cleanTitle || selected.size === 0 || saving) return;

    setSaving(true);
    const dueAt = dueDate
      ? new Date(`${dueDate}T23:59:59`).getTime()
      : null;
    const success = await assignMissionToStudents(Array.from(selected), {
      title: cleanTitle,
      description: description.trim(),
      rewardTier,
      dueAt: Number.isFinite(dueAt) ? dueAt : null,
    });

    if (success) {
      close();
      return;
    }

    setSaving(false);
  }

  const reward = MISSION_REWARD_PRESETS[rewardTier];

  return (
    <Modal open={open} onClose={close} title="📋 משימה חדשה">
      <div className="flex flex-col gap-5 text-right">
        <div>
          <label className="mb-1 block text-sm font-bold text-magic-soft">
            שם המשימה
          </label>
          <input
            value={title}
            onChange={event => setTitle(event.target.value)}
            maxLength={80}
            placeholder="למשל: אתגר החשיבה של השבוע"
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
            placeholder="תיאור קצר וברור לילדים..."
            className="w-full resize-none rounded-xl border border-white/15 bg-magic-bg/55 px-3 py-2 text-white outline-none placeholder:text-magic-soft/35 focus:border-magic-accent/60"
          />
        </div>

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
            הפרסים קבועים בכוונה כדי שמשימות לא יאיצו מדי את קצב ההתקדמות.
            המשימה לא מעניקה XP ישירות.
          </p>
        </div>

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
          <strong>הפרס שנבחר:</strong> {reward.emoji} +{reward.points} נקודות לכל
          תלמיד/ה שהמורה יסמן כהושלם. נקודות המשימה יכולות לשמש במשחק ובחיה,
          אבל אינן נחשבות כהוכחת התנהגות לצורך התפתחות החיה.
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={close}
            className="flex-1 rounded-xl bg-magic-bg/60 py-3 font-bold text-magic-soft"
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
