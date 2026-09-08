import { useEffect, useState } from 'react';

import {
  COMPANION_FLOURISHES,
  getCompanionFlourishLevelDefinition,
  getCompanionFlourishLevelForDays,
  getCompanionFlourishProgress,
  hasCompanionFlourishAwardOnDay,
} from '../../data/companionFlourishes';
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
  const memories = student?.companion.behaviorMemories ?? [];
  const selectedProgress = selectedFlourish
    ? getCompanionFlourishProgress(memories, selectedFlourish.id)
    : null;
  const selectedStoredLevel = selectedFlourish
    ? Math.max(
        selectedProgress?.level ?? 0,
        student?.companion.flourishLevels?.[selectedFlourish.id] ?? 0
      )
    : 0;
  const selectedLevelDefinition = getCompanionFlourishLevelDefinition(
    selectedStoredLevel
  );
  const selectedAlreadyCountedToday = selectedFlourish
    ? hasCompanionFlourishAwardOnDay(memories, selectedFlourish.id)
    : false;
  const projectedDays = selectedProgress
    ? selectedProgress.days + (selectedAlreadyCountedToday ? 0 : 1)
    : 0;
  const projectedLevel = getCompanionFlourishLevelForDays(projectedDays);
  const projectedLevelDefinition = getCompanionFlourishLevelDefinition(
    projectedLevel
  );
  const willLevelUp = projectedLevel > selectedStoredLevel;

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

    const flourishMemoryId = await awardCompanionFlourish(
      student.id,
      selectedFlourish.id,
      pointBonus
    );

    if (!flourishMemoryId) {
      setIsSaving(false);
      setReviewing(false);
      setError('לא ניתן היה להעניק את האות. יש לנסות שוב.');
      return;
    }

    logAward({
      classId,
      studentIds: [student.id],
      amount: pointBonus,
      reasonId: selectedFlourish.reasonId,
      note: `הענקת ${selectedFlourish.nameHe}`,
      flourishId: selectedFlourish.id,
      flourishMemoryId,
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
            <div className="mt-3 inline-flex rounded-full bg-black/20 px-3 py-1 text-xs font-black text-white/80">
              {selectedLevelDefinition
                ? `${selectedLevelDefinition.icon} ${selectedLevelDefinition.nameHe} · ${selectedProgress?.days ?? 0} ימים`
                : '🌱 האות ייפתח עכשיו'}
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
              {selectedStoredLevel === 0
                ? 'האות ייפתח ויתחיל מסלול התפתחות של 5 דרגות.'
                : 'ההענקה תתווסף למסלול של האות. המורה לא צריכה לבחור דרגה.'}
            </div>
          </div>

          {selectedAlreadyCountedToday ? (
            <div className="rounded-xl border border-amber-300/20 bg-amber-500/10 px-4 py-3 text-center text-xs font-bold leading-5 text-amber-100">
              האות הזה כבר נספר היום למסלול. ההענקה עדיין תיתן נקודות, אבל לא תוסיף יום התקדמות נוסף.
            </div>
          ) : willLevelUp && projectedLevelDefinition ? (
            <div className="rounded-xl border border-yellow-300/25 bg-yellow-500/10 px-4 py-3 text-center text-xs font-black leading-5 text-yellow-100">
              ✨ ההענקה הזאת תעלה את האות לדרגת {projectedLevelDefinition.icon}{' '}
              {projectedLevelDefinition.nameHe}.
            </div>
          ) : selectedProgress?.next ? (
            <div className="rounded-xl border border-fuchsia-300/15 bg-fuchsia-500/5 px-4 py-3 text-center text-xs font-bold text-fuchsia-100">
              אחרי ההענקה: {projectedDays}/{selectedProgress.next.minDays} ימים בדרך ל־
              {selectedProgress.next.icon} {selectedProgress.next.nameHe}
            </div>
          ) : (
            <div className="rounded-xl border border-yellow-300/20 bg-yellow-500/10 px-4 py-3 text-center text-xs font-black text-yellow-100">
              👑 האות כבר בדרגת מאסטר. אפשר להמשיך להעניק אותו כהכרה בהתנהגות טובה.
            </div>
          )}

          {!student.companion.unlocked && (
            <div className="rounded-xl border border-cyan-300/20 bg-cyan-500/10 px-4 py-3 text-center text-xs font-bold text-cyan-100">
              החיה עדיין לא נפתחה. האות וההתקדמות שלו יישמרו ויחכו לה עד רמה 5.
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
                const progress = getCompanionFlourishProgress(
                  memories,
                  flourish.id
                );
                const storedLevel = Math.max(
                  progress.level,
                  student.companion.flourishLevels?.[flourish.id] ?? 0
                );
                const levelDefinition = getCompanionFlourishLevelDefinition(
                  storedLevel
                );

                return (
                  <button
                    type="button"
                    key={flourish.id}
                    onClick={() => {
                      setSelectedId(flourish.id);
                      setError(null);
                    }}
                    className={`rounded-2xl border p-3 text-center transition-colors ${
                      selected
                        ? 'border-fuchsia-300 bg-fuchsia-500/15 text-fuchsia-100'
                        : storedLevel >= 5
                          ? 'border-yellow-300/25 bg-yellow-500/10 text-white hover:bg-yellow-500/15'
                          : 'border-white/10 bg-magic-bg/35 text-white hover:bg-magic-bg/60'
                    }`}
                  >
                    <div className="text-3xl">{flourish.emoji}</div>
                    <div className="mt-2 text-xs font-black">
                      {flourish.nameHe}
                    </div>
                    <div className="mt-1 text-[9px] font-bold text-magic-soft/70">
                      {levelDefinition
                        ? `${levelDefinition.icon} ${levelDefinition.nameHe} · ${progress.days} ימים`
                        : 'טרם נפתח'}
                    </div>
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
              הבונוס יתווסף גם לנקודות החיה. אותה תכונה באותו יום מקדמת את מסלול האות פעם אחת בלבד.
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
