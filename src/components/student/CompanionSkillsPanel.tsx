import { useState } from 'react';

import {
  COMPANION_SKILLS,
  companionStageMeetsRequirement,
  getCompanionSkillName,
  type CompanionSkill,
} from '../../data/companionSkills';
import type { CompanionStage } from '../../data/companionWorlds';
import {
  useGameStore,
  type CompanionState,
} from '../../store/useGameStore';

type Props = {
  studentId: string;
  companion: CompanionState;
};

const STAGE_LABEL_HE: Record<CompanionStage, string> = {
  egg: 'ביצה',
  hatchling: 'קטנטנה',
  young: 'צעירה',
  grown: 'בוגרת',
  magical: 'קסומה',
  legendary: 'אגדית',
};

const BRANCH_STYLE: Record<
  CompanionSkill['branch'],
  { label: string; className: string }
> = {
  joy: {
    label: 'מסלול השמחה',
    className: 'border-rose-300/25 bg-rose-500/10 text-rose-100',
  },
  training: {
    label: 'מסלול האימון',
    className: 'border-cyan-300/25 bg-cyan-500/10 text-cyan-100',
  },
  adventure: {
    label: 'מסלול ההרפתקה',
    className: 'border-emerald-300/25 bg-emerald-500/10 text-emerald-100',
  },
  legendary: {
    label: 'כישרון אגדי',
    className: 'border-yellow-300/40 bg-yellow-400/10 text-yellow-100',
  },
};

export default function CompanionSkillsPanel({
  studentId,
  companion,
}: Props) {
  const unlockCompanionSkill = useGameStore(
    state => state.unlockCompanionSkill
  );
  const [pendingSkillId, setPendingSkillId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const unlockedSkills = companion.unlockedSkills ?? [];

  async function handleUnlock(skill: CompanionSkill) {
    if (pendingSkillId) return;

    setPendingSkillId(skill.id);
    setMessage(null);

    const result = await unlockCompanionSkill(studentId, skill.id);

    setPendingSkillId(null);

    if (result === 'unlocked') {
      setMessage(`${skill.emoji} הכישרון ${skill.nameHe} נפתח בהצלחה!`);
      return;
    }

    const messageByResult = {
      'not-found': 'הכישרון לא נמצא.',
      'already-owned': 'הכישרון הזה כבר פתוח.',
      'stage-locked': 'שלב ההתפתחות של החיה עדיין לא מספיק גבוה.',
      'prerequisite-locked': 'צריך לפתוח קודם את הכישורים הקודמים במסלול.',
      'insufficient-points': 'אין מספיק נקודות חיה לפתיחת הכישרון.',
    } as const;

    setMessage(messageByResult[result]);
  }

  return (
    <div className="mt-4 rounded-3xl border border-cyan-300/20 bg-cyan-500/10 p-5 text-right">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-xl font-black text-white">אקדמיית החיה</h3>
          <p className="mt-1 max-w-xl text-xs leading-5 text-magic-soft/65">
            פותחים כישורים באמצעות נקודות חיה שהתקבלו מהנקודות שהמורה העניקה
            בכיתה. פתיחת כישרון אינה משתמשת בנקודות החנות.
          </p>
        </div>
        <div className="flex gap-2 text-center text-xs font-bold">
          <div className="rounded-xl bg-black/20 px-3 py-2 text-cyan-100">
            {unlockedSkills.length}/{COMPANION_SKILLS.length} כישורים
          </div>
          <div className="rounded-xl bg-black/20 px-3 py-2 text-emerald-200">
            {companion.petPoints ?? 0} 🐾
          </div>
          {(companion.treasuresFound ?? 0) > 0 && (
            <div className="rounded-xl bg-black/20 px-3 py-2 text-yellow-200">
              {companion.treasuresFound} אוצרות 🗝️
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {COMPANION_SKILLS.map(skill => {
          const unlocked = unlockedSkills.includes(skill.id);
          const stageReady = companionStageMeetsRequirement(
            companion.stage,
            skill.requiredStage
          );
          const missingPrerequisites = skill.prerequisites.filter(
            prerequisite => !unlockedSkills.includes(prerequisite)
          );
          const prerequisitesReady = missingPrerequisites.length === 0;
          const enoughPoints = (companion.petPoints ?? 0) >= skill.cost;
          const canUnlock =
            !unlocked && stageReady && prerequisitesReady && enoughPoints;
          const branchStyle = BRANCH_STYLE[skill.branch];
          const isPending = pendingSkillId === skill.id;

          let buttonText = `${skill.cost} נקודות חיה`;
          if (unlocked) buttonText = '✓ נפתח';
          else if (!stageReady) {
            buttonText = `נפתח בשלב ${STAGE_LABEL_HE[skill.requiredStage]}`;
          } else if (!prerequisitesReady) buttonText = 'חסר כישרון קודם';
          else if (!enoughPoints) {
            buttonText = `חסרות ${skill.cost - (companion.petPoints ?? 0)} 🐾`;
          }

          return (
            <div
              key={skill.id}
              className={`flex flex-col rounded-2xl border p-4 ${branchStyle.className} ${
                skill.branch === 'legendary' ? 'sm:col-span-2 lg:col-span-3' : ''
              } ${unlocked ? 'shadow-[0_0_22px_rgba(34,211,238,0.12)]' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black opacity-65">
                    {branchStyle.label}
                  </div>
                  <div className="mt-1 text-base font-black text-white">
                    {skill.nameHe}
                  </div>
                </div>
                <div className={`text-4xl ${unlocked ? '' : 'grayscale-[35%]'}`}>
                  {skill.emoji}
                </div>
              </div>

              <p className="mt-3 text-[11px] leading-5 text-white/65">
                {skill.descriptionHe}
              </p>
              <div className="mt-2 rounded-lg bg-black/15 px-3 py-2 text-[10px] font-bold leading-5 text-white/80">
                {skill.effectHe}
              </div>

              {skill.prerequisites.length > 0 && (
                <div className="mt-2 text-[9px] text-white/50">
                  דורש:{' '}
                  {skill.prerequisites.map(getCompanionSkillName).join(', ')}
                </div>
              )}

              <button
                type="button"
                disabled={!canUnlock || pendingSkillId !== null}
                onClick={() => void handleUnlock(skill)}
                className={`mt-auto rounded-xl px-3 py-2.5 text-xs font-black transition-colors ${
                  unlocked
                    ? 'cursor-default bg-emerald-400/15 text-emerald-200'
                    : canUnlock
                      ? 'bg-cyan-200 text-cyan-950 hover:bg-cyan-100'
                      : 'cursor-not-allowed bg-black/20 text-white/40'
                }`}
              >
                {isPending ? 'שומר...' : buttonText}
              </button>
            </div>
          );
        })}
      </div>

      {message && (
        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-center text-xs font-bold text-white">
          {message}
        </div>
      )}
    </div>
  );
}
