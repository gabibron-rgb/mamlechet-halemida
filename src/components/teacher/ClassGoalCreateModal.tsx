import { useEffect, useState } from 'react';
import Modal from '../shared/Modal';
import {
  CLASS_GOAL_METRICS,
  type ClassGoalMetric,
} from '../../data/classGoals';
import { useGameStore } from '../../store/useGameStore';

type Props = {
  open: boolean;
  onClose: () => void;
  classId: string;
  studentCount: number;
};

export default function ClassGoalCreateModal({
  open,
  onClose,
  classId,
  studentCount,
}: Props) {
  const createClassGoal = useGameStore(s => s.createClassGoal);
  const [title, setTitle] = useState('אתגר שיתוף הפעולה השבועי');
  const [description, setDescription] = useState('');
  const [metric, setMetric] = useState<ClassGoalMetric>('missions');
  const [target, setTarget] = useState(30);
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle('אתגר שיתוף הפעולה השבועי');
    setDescription('');
    setMetric('missions');
    setTarget(30);
    setDueDate('');
    setSaving(false);
    setError(null);
  }, [open]);

  async function confirm() {
    const cleanTitle = title.trim();
    if (!cleanTitle || saving || studentCount === 0) return;

    setSaving(true);
    setError(null);

    const dueAt = dueDate
      ? new Date(`${dueDate}T23:59:59`).getTime()
      : null;
    const ok = await createClassGoal(classId, {
      title: cleanTitle,
      description,
      metric,
      target,
      dueAt,
    });

    setSaving(false);

    if (!ok) {
      setError('לא הצלחתי ליצור את היעד. ודא/י שאין כבר יעד פעיל ושיש תלמידים בכיתה.');
      return;
    }

    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="🎯 יעד כיתתי חדש">
      <div className="flex flex-col gap-5 text-right">
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-500/10 p-3 text-sm leading-6 text-cyan-50/80">
          היעד משותף לכל הכיתה. אין עליו נקודות או XP אישיים — ההצלחה עצמה נשמרת כהישג כיתתי.
        </div>

        {error && (
          <div className="rounded-xl border border-rose-300/30 bg-rose-500/10 p-3 text-sm font-bold text-rose-100">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-bold text-magic-soft">שם היעד</label>
          <input
            value={title}
            onChange={event => setTitle(event.target.value)}
            maxLength={80}
            className="w-full rounded-xl border border-white/15 bg-magic-bg/55 px-3 py-2 text-white outline-none focus:border-magic-accent/60"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-magic-soft">תיאור (אופציונלי)</label>
          <textarea
            value={description}
            onChange={event => setDescription(event.target.value)}
            maxLength={240}
            rows={3}
            placeholder="למשל: עובדים יחד, עוזרים אחד לשני ומשלימים מטרות של הכיתה."
            className="w-full resize-none rounded-xl border border-white/15 bg-magic-bg/55 px-3 py-2 text-white outline-none focus:border-magic-accent/60"
          />
        </div>

        <div>
          <div className="mb-2 text-sm font-bold text-magic-soft">מה מקדם את היעד?</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(CLASS_GOAL_METRICS) as ClassGoalMetric[]).map(item => {
              const definition = CLASS_GOAL_METRICS[item];
              const active = metric === item;
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => setMetric(item)}
                  className={`rounded-2xl border p-4 text-right transition-colors ${
                    active
                      ? 'border-magic-accent/60 bg-magic-accent/15'
                      : 'border-white/10 bg-magic-bg/35 hover:bg-magic-bg/55'
                  }`}
                >
                  <div className="font-black text-white">
                    {definition.emoji} {definition.labelHe}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-magic-soft/60">
                    {definition.helperHe}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-magic-soft">כמה צעדים צריך?</label>
          <input
            type="number"
            min={5}
            max={200}
            value={target}
            onChange={event => setTarget(Math.min(200, Math.max(5, Number(event.target.value) || 5)))}
            className="w-full rounded-xl border border-white/15 bg-magic-bg/55 px-3 py-2 text-white outline-none focus:border-magic-accent/60"
          />
          <p className="mt-1 text-xs text-magic-soft/50">
            מומלץ להתחיל ב־20–40 צעדים, לפי גודל הכיתה ואורך האתגר.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-magic-soft">תאריך יעד (אופציונלי)</label>
          <input
            type="date"
            value={dueDate}
            onChange={event => setDueDate(event.target.value)}
            className="w-full rounded-xl border border-white/15 bg-magic-bg/55 px-3 py-2 text-white outline-none focus:border-magic-accent/60"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-magic-bg/60 py-3 font-bold text-magic-soft"
          >
            ביטול
          </button>
          <button
            type="button"
            onClick={() => void confirm()}
            disabled={!title.trim() || saving || studentCount === 0}
            className="flex-1 rounded-xl bg-magic-accent py-3 font-black text-magic-bg disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? 'שומר...' : 'צור/י יעד כיתתי'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
