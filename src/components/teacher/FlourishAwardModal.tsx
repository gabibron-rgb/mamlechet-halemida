import { useEffect, useMemo, useState } from 'react';

import { COMPANION_FLOURISHES } from '../../data/companionFlourishes';
import { AWARD_SIZES } from '../../data/reasons';
import { useClassStore } from '../../store/useClassStore';
import { useGameStore, type StudentState } from '../../store/useGameStore';
import Modal from '../shared/Modal';

type Props = {
  open: boolean;
  onClose: () => void;
  classId: string;
  student: StudentState | null;
};

export default function FlourishAwardModal({
  open,
  onClose,
  classId,
  student,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pointBonus, setPointBonus] = useState<number>(5);
  const [reviewing, setReviewing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const awardCompanionFlourish = useGameStore(
    state => state.awardCompanionFlourish
  );
  const logAward = useClassStore(state => state.logAward);

  const selectedFlourish = COMPANION_FLOURISHES.find(
    flourish => flourish.id === selectedId
  );
  const ownedFlourishIds = useMemo(
    () => new Set(student?.companion.ownedFlourishes ?? []),
    [student?.companion.ownedFlourishes]
  );

  useEffect(() => {
    if (!open) return;

    setSelectedId(null);
    setPointBonus(5);
    setReviewing(false);
    setIsSaving(false);
    setError(null);
  }, [open, student?.id]);

  function close() {
    if (isSaving) return;

    setSelectedId(null);
    setPointBonus(5);
    setReviewing(false);
    setError(null);
    onClose();
  }

  async function confirmAward() {
    if (!student || !selectedFlourish || isSaving) return;

    setIsSaving(true);
    setError(null);

    const success = await awardCompanionFlourish(
      student.id,
      selectedFlourish.id,
      pointBonus
    );

    if (!success) {
      setIsSaving(false);
      setReviewing(false);
      setError('לא ניתן היה להעניק את האות. ייתכן שהוא כבר בבעלות התלמיד/ה.');
      return;
    }

    logAward({
      classId,
      studentIds: [student.id],
      amount: pointBonus,
      reasonId: selectedFlourish.reasonId,
      note: `הענקת ${selectedFlourish.nameHe}`,
      flourishId: selectedFlourish.id,
    });

    setIsSaving(false);
    setSelectedId(null);
    setPointBonus(5);
    setReviewing(false);
    setError(null);
    onClose();
  }

  return (
    <Modal open={open} onClose={close} title="הענקת אות לחיית המחמד">
      {!student ? (
        <div className="py-6 text-center text-sm text-magic-soft/70">
          התלמיד/ה לא נמצא/ה. יש לסגור ולנסות שוב.
        </div>
      ) : reviewing && selectedFlourish ? (
        <div className="flex flex-col gap-4">
          <div
            className="rounded-3xl border p-5 text-center"
            style={{
              borderColor: `${selectedFlourish.glowColor}70`,
              backgroundColor: `${selectedFlourish.glowColor}18`,
              boxShadow: `0 0 34px ${selectedFlourish.glowColor}25`,
            }}
          >
            <div className="text-6xl">{selectedFlourish.emoji}</div>
            <div className="mt-2 text-xl font-black text-white">
              {selectedFlourish.nameHe}
            </div>
            <div className="mt-2 text-sm text-magic-soft/75">
              {selectedFlourish.descriptionHe}
            </div>
          </div>

          <div className="rounded-2xl bg-magic-bg/45 p-4 text-sm leading-6 text-white">
            <div>
              לתלמיד/ה: <span className="font-black">{student.name}</span>
            </div>
            <div className="mt-2 text-emerald-200">
              +{pointBonus} נקודות רגילות וגם +{pointBonus} נקודות חיה
            </div>
            <div className="mt-1 text-fuchsia-200">
              העיטור ייפתח אצל חיית המחמד ויהיה זמין להפעלה.
            </div>
          </div>

          {!student.companion.unlocked && (
            <div className="rounded-xl border border-cyan-300/20 bg-cyan-500/10 px-4 py-3 text-center text-xs font-bold text-cyan-100">
              החיה עדיין לא נפתחה. האות יישמר ויחכה לה עד רמה 5.
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setReviewing(false)}
              disabled={isSaving}
              className="flex-1 rounded-xl bg-magic-bg/60 py-3 font-bold text-magic-soft disabled:opacity-40"
            >
              חזרה
            </button>
            <button
              type="button"
              onClick={() => void confirmAward()}
              disabled={isSaving}
              className="flex-1 rounded-xl bg-fuchsia-300 py-3 font-black text-purple-950 disabled:opacity-40"
            >
              {isSaving ? 'שומר...' : 'אישור סופי והענקה'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="rounded-xl bg-magic-bg/45 px-4 py-3 text-center text-sm text-magic-soft/75">
            הענקת אות ל־<span className="font-black text-white">{student.name}</span>
          </div>

          <div>
            <div className="mb-2 text-sm font-bold text-magic-soft">
              1. בחירת אות התנהגות
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {COMPANION_FLOURISHES.map(flourish => {
                const selected = selectedId === flourish.id;
                const alreadyOwned = ownedFlourishIds.has(flourish.id);

                return (
                  <button
                    type="button"
                    key={flourish.id}
                    disabled={alreadyOwned}
                    onClick={() => {
                      setSelectedId(flourish.id);
                      setError(null);
                    }}
                    className={`rounded-2xl border p-3 text-center transition-colors ${
                      alreadyOwned
                        ? 'cursor-not-allowed border-white/5 bg-white/[0.03] opacity-40'
                        : selected
                          ? 'border-fuchsia-300 bg-fuchsia-500/15 text-fuchsia-100'
                          : 'border-white/10 bg-magic-bg/35 text-white hover:bg-magic-bg/60'
                    }`}
                  >
                    <div className="text-3xl">{flourish.emoji}</div>
                    <div className="mt-2 text-xs font-black">
                      {flourish.nameHe}
                    </div>
                    {alreadyOwned && (
                      <div className="mt-1 text-[9px] font-bold">
                        כבר התקבל
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-bold text-magic-soft">
              2. בונוס נקודות
            </div>
            <div className="flex flex-wrap gap-2">
              {AWARD_SIZES.map(amount => (
                <button
                  type="button"
                  key={amount}
                  onClick={() => setPointBonus(amount)}
                  className={`rounded-xl px-4 py-2 font-bold ${
                    pointBonus === amount
                      ? 'bg-magic-accent text-magic-bg'
                      : 'bg-magic-bg/40 text-white hover:bg-magic-bg/60'
                  }`}
                >
                  +{amount}
                </button>
              ))}
            </div>
            <div className="mt-2 text-[10px] text-magic-soft/50">
              הבונוס יתווסף גם לנקודות החיה, בדיוק כמו כל נקודה שהמורה מעניקה.
            </div>
          </div>

          {selectedFlourish && (
            <div className="rounded-xl border border-fuchsia-300/20 bg-fuchsia-500/10 px-4 py-3 text-xs leading-5 text-fuchsia-100">
              {selectedFlourish.emoji} {selectedFlourish.descriptionHe}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-300/25 bg-rose-500/10 px-4 py-3 text-center text-xs font-bold text-rose-200">
              {error}
            </div>
          )}

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
              onClick={() => setReviewing(true)}
              disabled={!selectedFlourish}
              className="flex-1 rounded-xl bg-fuchsia-300 py-3 font-black text-purple-950 disabled:cursor-not-allowed disabled:opacity-35"
            >
              המשך לבדיקה
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
