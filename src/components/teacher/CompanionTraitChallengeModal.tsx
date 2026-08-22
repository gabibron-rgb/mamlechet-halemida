import { useEffect, useState } from 'react';

import {
  COMPANION_TRAIT_CHALLENGE_TARGETS,
  COMPANION_TRAIT_CHALLENGE_TITLES,
  getCompanionTraitChallengeProgress,
  getLatestCompanionTraitChallenge,
} from '../../data/companionTraitChallenges';
import {
  COMPANION_TRAITS,
  getCompanionTrait,
  type CompanionTraitId,
} from '../../data/companionTraits';
import { useGameStore, type StudentState } from '../../store/useGameStore';
import Modal from '../shared/Modal';

type Props = {
  open: boolean;
  onClose: () => void;
  student: StudentState | null;
};

export default function CompanionTraitChallengeModal({
  open,
  onClose,
  student,
}: Props) {
  const [traitId, setTraitId] = useState<CompanionTraitId>('determination');
  const [targetDays, setTargetDays] = useState<number>(3);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignChallenge = useGameStore(
    state => state.assignCompanionTraitChallenge
  );
  const cancelChallenge = useGameStore(
    state => state.cancelCompanionTraitChallenge
  );

  useEffect(() => {
    if (!open) return;
    setTraitId('determination');
    setTargetDays(3);
    setIsSaving(false);
    setConfirmingCancel(false);
    setError(null);
  }, [open, student?.id]);

  const challenges = student?.companion.traitChallenges ?? [];
  const latest = getLatestCompanionTraitChallenge(challenges);
  const activeChallenge = latest?.completedAt === null ? latest : null;
  const activeTrait = activeChallenge
    ? getCompanionTrait(activeChallenge.traitId)
    : null;
  const activeProgress =
    activeChallenge && student
      ? getCompanionTraitChallengeProgress(
          activeChallenge,
          student.companion.behaviorMemories ?? []
        )
      : 0;
  const targetOptions: number[] = import.meta.env.DEV
    ? [1, ...COMPANION_TRAIT_CHALLENGE_TARGETS]
    : [...COMPANION_TRAIT_CHALLENGE_TARGETS];

  async function handleAssign() {
    if (!student || isSaving || activeChallenge) return;

    setIsSaving(true);
    setError(null);
    const success = await assignChallenge(student.id, traitId, targetDays);
    setIsSaving(false);

    if (!success) {
      setError('לא ניתן היה להגדיר את האתגר. ייתכן שכבר קיים אתגר פעיל.');
      return;
    }

    onClose();
  }

  async function handleCancel() {
    if (!student || !activeChallenge || isSaving) return;

    if (!confirmingCancel) {
      setConfirmingCancel(true);
      return;
    }

    setIsSaving(true);
    setError(null);
    const success = await cancelChallenge(student.id);
    setIsSaving(false);

    if (!success) {
      setError('לא ניתן היה לבטל את האתגר. כדאי לסגור ולנסות שוב.');
      return;
    }

    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="אתגר אופי אישי">
      {!student ? (
        <div className="py-6 text-center text-sm text-magic-soft/65">
          התלמיד/ה לא נמצא/ה.
        </div>
      ) : activeChallenge && activeTrait ? (
        <div className="space-y-4 text-right">
          <div
            className="rounded-3xl border p-5 text-center"
            style={{
              borderColor: `${activeTrait.color}60`,
              backgroundColor: `${activeTrait.color}14`,
            }}
          >
            <div className="text-5xl">{activeTrait.emoji}</div>
            <div className="mt-2 text-xl font-black text-white">
              אתגר {activeTrait.nameHe} של {student.name}
            </div>
            <div className="mt-1 text-xs text-magic-soft/60">
              {activeTrait.descriptionHe}
            </div>

            <div className="mt-4 text-3xl font-black text-white">
              {activeProgress}/{activeChallenge.targetDays}
            </div>
            <div className="text-[10px] font-bold text-magic-soft/50">
              ימי לימוד שונים
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/30">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      (activeProgress / activeChallenge.targetDays) * 100
                    )
                  )}%`,
                  backgroundColor: activeTrait.color,
                }}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-magic-bg/35 p-4 text-xs leading-6 text-magic-soft/65">
            ההתקדמות מתרחשת רק כאשר המורה מעניקה נקודות ובוחרת סיבה השייכת
            לתכונת {activeTrait.nameHe}. כמה הענקות באותו יום נספרות כיום אחד.
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 p-3 text-xs font-bold text-red-200">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 rounded-xl bg-magic-bg/55 px-4 py-3 text-sm font-bold text-magic-soft"
            >
              סגירה
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-black ${
                confirmingCancel
                  ? 'bg-red-400 text-red-950'
                  : 'border border-red-300/20 bg-red-500/10 text-red-200'
              }`}
            >
              {isSaving
                ? 'שומר...'
                : confirmingCancel
                  ? 'אישור סופי לביטול'
                  : 'ביטול האתגר'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5 text-right">
          {latest?.completedAt && (
            <div className="rounded-2xl border border-yellow-300/20 bg-yellow-500/10 p-4 text-center">
              <div className="text-2xl">🏅</div>
              <div className="mt-1 text-xs text-yellow-100/65">
                האתגר האחרון הושלם
              </div>
              <div className="mt-1 font-black text-yellow-200">
                {COMPANION_TRAIT_CHALLENGE_TITLES[latest.traitId]}
              </div>
            </div>
          )}

          <div>
            <div className="mb-2 text-sm font-black text-white">
              איזו תכונה תרצי לחזק אצל {student.name}?
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {COMPANION_TRAITS.map(trait => {
                const selected = trait.id === traitId;
                return (
                  <button
                    key={trait.id}
                    type="button"
                    onClick={() => setTraitId(trait.id)}
                    className={`rounded-2xl border p-3 text-center transition-colors ${
                      selected
                        ? 'border-cyan-300/45 bg-cyan-500/15 text-white'
                        : 'border-white/10 bg-magic-bg/35 text-magic-soft'
                    }`}
                  >
                    <div className="text-2xl">{trait.emoji}</div>
                    <div className="mt-1 text-xs font-black">
                      {trait.nameHe}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-black text-white">
              כמה ימי הוכחה נדרשים?
            </div>
            <div className="flex flex-wrap gap-2">
              {targetOptions.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTargetDays(option)}
                  className={`rounded-xl px-4 py-2 text-xs font-black ${
                    targetDays === option
                      ? 'bg-magic-accent text-magic-bg'
                      : 'bg-magic-bg/40 text-white'
                  }`}
                >
                  {option === 1 ? 'יום אחד — בדיקה מקומית' : `${option} ימים`}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-violet-300/15 bg-violet-500/10 p-4 text-xs leading-6 text-violet-100/75">
            האתגר לא מעניק נקודות ולא מקצר את ההתפתחות. בסיום ייפתח התואר{' '}
            <span className="font-black text-white">
              “{COMPANION_TRAIT_CHALLENGE_TITLES[traitId]}”
            </span>{' '}
            כסמל להתנהגות עקבית שנצפתה בכיתה.
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 p-3 text-xs font-bold text-red-200">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 rounded-xl bg-magic-bg/55 px-4 py-3 text-sm font-bold text-magic-soft"
            >
              ביטול
            </button>
            <button
              type="button"
              onClick={handleAssign}
              disabled={isSaving}
              className="flex-1 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-black text-cyan-950 disabled:opacity-40"
            >
              {isSaving ? 'שומר...' : 'הגדרת האתגר 🧭'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
