import { useState } from 'react';
import Modal from '../shared/Modal';
import { REASONS, AWARD_SIZES } from '../../data/reasons';
import { useGameStore } from '../../store/useGameStore';
import type { StudentState } from '../../store/useGameStore';
import { useClassStore } from '../../store/useClassStore';
import { xpFromSpending } from '../../logic/economy';

type Props = {
  open: boolean;
  onClose: () => void;
  classId: string;
  students: StudentState[];
  preselectedStudentId?: string | null;
};

export default function AwardModal({
  open, onClose, classId, students, preselectedStudentId,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(preselectedStudentId ? [preselectedStudentId] : [])
  );
  const [amount, setAmount] = useState<number>(3);
  const [reasonId, setReasonId] = useState<string | null>(null);

  const addPoints = useGameStore(s => s.addPoints);
  const logAward = useClassStore(s => s.logAward);

  function reset() {
    setSelected(new Set(preselectedStudentId ? [preselectedStudentId] : []));
    setAmount(3);
    setReasonId(null);
  }

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  }

  function selectAll() {
    setSelected(new Set(students.map(s => s.id)));
  }

  function confirm() {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    ids.forEach(id => addPoints(id, amount));
    logAward({
      classId,
      studentIds: ids,
      amount,
      reasonId,
    });
    reset();
    onClose();
  }

  // Note: receiving points does NOT grant XP. xpFromSpending is for spending only.
  // We keep it imported here just to make the rule explicit when reviewing the file.
  void xpFromSpending;

  return (
    <Modal open={open} onClose={onClose} title="מתן נקודות">
      <div className="flex flex-col gap-4">
        {/* Students */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-magic-soft text-sm">תלמידים</span>
            <button
              onClick={selectAll}
              className="text-magic-accent text-sm hover:underline"
            >
              בחר/י את כל הכיתה
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {students.map(st => {
              const isSel = selected.has(st.id);
              return (
                <button
                  key={st.id}
                  onClick={() => toggle(st.id)}
                  className={`rounded-xl p-2 text-sm text-right transition-colors ${
                    isSel
                      ? 'bg-magic-accent text-magic-bg font-bold'
                      : 'bg-magic-bg/40 text-white hover:bg-magic-bg/60'
                  }`}
                >
                  {st.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Amount */}
        <div>
          <div className="text-magic-soft text-sm mb-2">כמות</div>
          <div className="flex gap-2 flex-wrap">
            {AWARD_SIZES.map(n => (
              <button
                key={n}
                onClick={() => setAmount(n)}
                className={`px-4 py-2 rounded-xl font-bold transition-colors ${
                  amount === n
                    ? 'bg-magic-accent text-magic-bg'
                    : 'bg-magic-bg/40 text-white hover:bg-magic-bg/60'
                }`}
              >
                +{n}
              </button>
            ))}
          </div>
        </div>

        {/* Reason */}
        <div>
          <div className="text-magic-soft text-sm mb-2">סיבה (אופציונלי)</div>
          <div className="flex gap-2 flex-wrap">
            {REASONS.map(r => (
              <button
                key={r.id}
                onClick={() => setReasonId(reasonId === r.id ? null : r.id)}
                className={`px-3 py-2 rounded-xl text-sm transition-colors ${
                  reasonId === r.id
                    ? 'bg-magic-soft text-magic-bg font-bold'
                    : 'bg-magic-bg/40 text-white hover:bg-magic-bg/60'
                }`}
              >
                {r.emoji} {r.labelHe}
              </button>
            ))}
          </div>
        </div>

        {/* Confirm */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={onClose}
            className="flex-1 bg-magic-bg/60 text-magic-soft font-bold py-3 rounded-xl"
          >
            ביטול
          </button>
          <button
            onClick={confirm}
            disabled={selected.size === 0}
            className="flex-1 bg-magic-accent text-magic-bg font-bold py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            תן/י +{amount} ל-{selected.size} תלמידים
          </button>
        </div>
      </div>
    </Modal>
  );
}
