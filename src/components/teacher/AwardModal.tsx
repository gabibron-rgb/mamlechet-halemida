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
  const [addToJournal, setAddToJournal] = useState(false);
  const [journalNote, setJournalNote] = useState('');

  const awardBehaviorPoints = useGameStore(s => s.awardBehaviorPoints);
  const logAward = useClassStore(s => s.logAward);

  function reset() {
    setSelected(new Set(preselectedStudentId ? [preselectedStudentId] : []));
    setAmount(3);
    setReasonId(null);
    setAddToJournal(false);
    setJournalNote('');
  }

  function close() {
    reset();
    onClose();
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
    if (addToJournal && !journalNote.trim()) return;
    const ids = Array.from(selected);
    const cleanJournalNote = addToJournal ? journalNote.trim() : null;
    const activityId = logAward({
      classId,
      studentIds: ids,
      amount,
      reasonId,
      ...(cleanJournalNote ? { note: cleanJournalNote } : {}),
    });
    ids.forEach(id =>
      void awardBehaviorPoints(
        id,
        amount,
        reasonId,
        activityId,
        cleanJournalNote
      )
    );
    reset();
    onClose();
  }

  // Note: receiving points does NOT grant XP. xpFromSpending is for spending only.
  // We keep it imported here just to make the rule explicit when reviewing the file.
  void xpFromSpending;

  return (
    <Modal open={open} onClose={close} title="מתן נקודות">
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
          <div
            className={`mt-3 rounded-xl px-3 py-2 text-[10px] font-bold leading-5 ${
              reasonId
                ? 'border border-violet-300/20 bg-violet-500/10 text-violet-100'
                : 'bg-magic-bg/30 text-magic-soft/45'
            }`}
          >
            {reasonId
              ? 'הסיבה תישמר בזיכרונות החיה. אותה תכונה משפיעה על מפת האופי ועל האתגר פעם אחת בלבד בכל יום.'
              : 'ללא בחירת סיבה יתקבלו נקודות רגילות ונקודות חיה, אך לא ייווצר זיכרון אופי.'}
          </div>
        </div>

        {/* Reason */}
        <div>
          <div className="text-magic-soft text-sm mb-2">סיבה (אופציונלי)</div>
          <div className="flex gap-2 flex-wrap">
            {REASONS.map(r => (
              <button
                key={r.id}
                onClick={() => {
                  const nextReasonId = reasonId === r.id ? null : r.id;
                  setReasonId(nextReasonId);
                  if (!nextReasonId) {
                    setAddToJournal(false);
                    setJournalNote('');
                  }
                }}
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

        {reasonId && (
          <div className="rounded-2xl border border-amber-300/20 bg-amber-500/10 p-4 text-right">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={addToJournal}
                onChange={event => {
                  setAddToJournal(event.target.checked);
                  if (!event.target.checked) setJournalNote('');
                }}
                className="h-4 w-4 accent-amber-300"
              />
              <div>
                <div className="text-sm font-black text-amber-100">
                  הוספת רגע מיוחד ליומן החיה 📖
                </div>
                <div className="mt-0.5 text-[10px] text-magic-soft/55">
                  הרשומה אינה מעניקה נקודות נוספות ואינה מאיצה התפתחות.
                </div>
              </div>
            </label>

            {addToJournal && (
              <div className="mt-3">
                <textarea
                  value={journalNote}
                  onChange={event => setJournalNote(event.target.value)}
                  maxLength={240}
                  rows={3}
                  autoFocus
                  placeholder="למשל: לא ויתרת גם כשהתרגיל נעשה קשה..."
                  className="w-full resize-none rounded-xl border border-white/15 bg-magic-bg/55 px-3 py-2 text-sm text-white outline-none placeholder:text-magic-soft/35 focus:border-amber-300/55"
                />
                <div className="mt-1 flex justify-between gap-2 text-[9px] text-magic-soft/40">
                  <span>
                    {selected.size > 1
                      ? 'אותה הודעה תופיע ביומן של כל התלמידים שנבחרו.'
                      : 'ההודעה תופיע ביומן האישי של התלמיד/ה.'}
                  </span>
                  <span>{journalNote.length}/240</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Confirm */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={close}
            className="flex-1 bg-magic-bg/60 text-magic-soft font-bold py-3 rounded-xl"
          >
            ביטול
          </button>
          <button
            onClick={confirm}
            disabled={
              selected.size === 0 ||
              (addToJournal && journalNote.trim().length === 0)
            }
            className="flex-1 bg-magic-accent text-magic-bg font-bold py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            תן/י +{amount} ל-{selected.size} תלמידים
          </button>
        </div>
      </div>
    </Modal>
  );
}
