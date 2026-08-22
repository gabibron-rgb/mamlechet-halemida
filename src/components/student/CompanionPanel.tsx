import { useState } from 'react';

import {
  COMPANION_VISUALS,
  type CompanionStage,
} from '../../data/companionWorlds';
import {
  COMPANION_WORLD_OPTIONS,
  THEMES,
  type ThemeId,
} from '../../data/themes';
import {
  applyCompanionCare,
  careXpForAction,
  companionCareStatus,
  COMPANION_CARE_ACTIONS,
  HATCH_BOND_REQUIRED,
  type CompanionCareActionId,
} from '../../logic/companion';
import { useGameStore, type StudentState } from '../../store/useGameStore';

type Props = {
  student: StudentState;
};

const COMPANION_UNLOCK_LEVEL = 5;

const STAGE_LABEL_HE: Record<CompanionStage, string> = {
  egg: 'ביצה קסומה',
  hatchling: 'בקיעה צעירה',
  young: 'חיית מחמד צעירה',
  grown: 'חיית מחמד בוגרת',
};

function themeNameOf(themeId: ThemeId): string {
  return THEMES.find(theme => theme.id === themeId)?.nameHe ?? themeId;
}

export default function CompanionPanel({ student }: Props) {
  const updateStudent = useGameStore(state => state.updateStudent);
  const [selectedTheme, setSelectedTheme] = useState<ThemeId | null>(
    student.companion.theme
  );
  const [isChangingWorld, setIsChangingWorld] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [hatchedNow, setHatchedNow] = useState(false);

  const companion = student.companion;
  const companionVisuals = companion.theme
    ? COMPANION_VISUALS[companion.theme]
    : null;
  const canUnlock = student.level >= COMPANION_UNLOCK_LEVEL;
  const canChangeWorld =
    companion.unlocked && companion.stage === 'egg' && companion.bond === 0;
  const shouldShowPicker =
    canUnlock && (!companion.unlocked || !companionVisuals || isChangingWorld);
  const careStatus = companionCareStatus(student);
  const hatchProgress = Math.min(
    100,
    Math.round((companion.bond / HATCH_BOND_REQUIRED) * 100)
  );

  function confirmWorld() {
    if (!selectedTheme || !canUnlock) return;

    updateStudent(student.id, {
      companion: {
        ...companion,
        unlocked: true,
        theme: selectedTheme,
        stage: companion.unlocked ? companion.stage : 'egg',
        bond: companion.unlocked ? companion.bond : 0,
        lastCareDate: companion.unlocked ? companion.lastCareDate : null,
        careXpToday: companion.unlocked ? companion.careXpToday : 0,
        activeFlourishes: companion.activeFlourishes ?? [],
        ownedFlourishes: companion.ownedFlourishes ?? [],
      },
    });

    setIsChangingWorld(false);
  }

  function handleCare(actionId: CompanionCareActionId) {
    const result = applyCompanionCare(student, actionId);

    if (!result.ok) {
      setMessage(result.reason);
      window.setTimeout(() => setMessage(null), 2200);
      return;
    }

    updateStudent(student.id, result.patch);
    setMessage(
      `${result.action.emoji} ${result.action.nameHe}: +${result.bondGain} קשר, +${result.xpGain} XP`
    );
    window.setTimeout(() => setMessage(null), 2200);

    if (result.hatched) setHatchedNow(true);
  }

  if (!companion.unlocked && !canUnlock) {
    const progress = Math.min(
      100,
      Math.round((student.level / COMPANION_UNLOCK_LEVEL) * 100)
    );

    return (
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-4 text-6xl grayscale">🥚</div>
        <h2 className="text-3xl font-black text-magic-accent">
          חיית המחמד עדיין ישנה
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-magic-soft/75">
          ברמה {COMPANION_UNLOCK_LEVEL} אפשר לבחור עולם לחיית המחמד ולקבל
          ביצה קסומה שתגדל יחד איתך.
        </p>

        <div className="mx-auto mt-6 max-w-md rounded-2xl border border-white/10 bg-magic-bg/40 p-4">
          <div className="mb-2 flex justify-between text-xs font-bold text-magic-soft/70">
            <span>הרמה שלך: {student.level}</span>
            <span>נפתחת ברמה {COMPANION_UNLOCK_LEVEL}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-black/30">
            <div
              className="h-full rounded-full bg-gradient-to-l from-magic-accent to-purple-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (shouldShowPicker) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 text-center">
          <div className="mb-2 text-5xl">🐾</div>
          <h2 className="text-3xl font-black text-magic-accent">
            {companion.unlocked
              ? 'בחירת עולם חדש לביצה'
              : 'בחירת עולם לחיית המחמד'}
          </h2>
          <p className="mt-2 text-sm text-magic-soft/70">
            העולם יקבע את המראה והאופי של חיית המחמד שתבקע מהביצה.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {COMPANION_WORLD_OPTIONS.map(themeId => {
            const visuals = COMPANION_VISUALS[themeId];
            if (!visuals) return null;

            const isSelected = selectedTheme === themeId;

            return (
              <button
                key={themeId}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedTheme(themeId)}
                className={`rounded-2xl border p-4 text-center transition-all ${
                  isSelected
                    ? 'scale-[1.02] border-yellow-300 bg-yellow-400/15 shadow-[0_0_24px_rgba(250,204,21,0.25)]'
                    : 'border-white/10 bg-magic-bg/40 hover:border-magic-accent/50 hover:bg-magic-bg/60'
                }`}
              >
                <div className="mb-2 text-4xl">{visuals.motif}</div>
                <div className="font-black text-white">
                  עולם {themeNameOf(themeId)}
                </div>
                <div className="mt-1 text-xs leading-5 text-magic-soft/65">
                  {visuals.descriptionHe}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/15 p-4 text-center">
          {selectedTheme ? (
            <div className="mb-3 text-sm font-bold text-white">
              בחרת בעולם {themeNameOf(selectedTheme)}{' '}
              {COMPANION_VISUALS[selectedTheme]?.motif}
            </div>
          ) : (
            <div className="mb-3 text-sm text-magic-soft/60">
              צריך לבחור עולם אחד כדי להמשיך.
            </div>
          )}

          <div className="flex flex-col justify-center gap-2 sm:flex-row">
            <button
              type="button"
              disabled={!selectedTheme}
              onClick={confirmWorld}
              className="rounded-xl bg-magic-accent px-6 py-3 font-black text-magic-bg disabled:cursor-not-allowed disabled:opacity-40"
            >
              אישור וקבלת הביצה 🥚
            </button>

            {companion.unlocked && (
              <button
                type="button"
                onClick={() => {
                  setSelectedTheme(companion.theme);
                  setIsChangingWorld(false);
                }}
                className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-bold text-magic-soft hover:bg-white/10"
              >
                ביטול
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!companionVisuals || !companion.theme) return null;

  return (
    <>
      {hatchedNow && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-purple-950/90 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border border-yellow-300/60 bg-gradient-to-b from-purple-900 via-magic-panel to-indigo-950 p-7 text-center shadow-[0_0_90px_rgba(250,204,21,0.45)]">
            <div className="mb-3 animate-bounce text-8xl">
              {companionVisuals.motif}
            </div>
            <div className="text-4xl font-black text-yellow-300">
              הביצה בקעה! 🎉
            </div>
            <p className="mt-3 text-sm leading-6 text-white/80">
              {companionVisuals.nameHe} הצטרף לממלכה שלך. המשיכו לטפל בו
              ולחזק את הקשר ביניכם.
            </p>
            <button
              type="button"
              onClick={() => setHatchedNow(false)}
              className="mt-6 w-full rounded-xl bg-yellow-300 py-3 font-black text-purple-950 hover:bg-yellow-200"
            >
              להכיר את חיית המחמד 🐾
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl text-center">
      <div className="mb-2 text-sm font-black text-magic-soft/65">
        עולם {themeNameOf(companion.theme)}
      </div>
      <h2 className="text-3xl font-black text-magic-accent">
        {companionVisuals.nameHe}
      </h2>
      <p className="mt-2 text-sm text-magic-soft/70">
        {companionVisuals.descriptionHe}
      </p>

      <div className="relative mx-auto my-8 flex h-56 w-48 items-center justify-center">
        {companion.stage === 'egg' ? (
          <div
            aria-label={`${STAGE_LABEL_HE[companion.stage]} מעולם ${themeNameOf(companion.theme)}`}
            className="relative flex h-52 w-40 animate-[bounce_3s_ease-in-out_infinite] items-center justify-center overflow-hidden rounded-[50%_50%_46%_46%] border-4 border-white/35 shadow-2xl"
            style={{
              background: `radial-gradient(circle at 32% 24%, rgba(255,255,255,0.85), transparent 22%), radial-gradient(circle at 68% 72%, rgba(255,255,255,0.20), transparent 25%), ${companionVisuals.eggColor}`,
              boxShadow: `0 0 45px ${companionVisuals.eggColor}75`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/20" />
            <div className="relative text-6xl drop-shadow-lg">
              {companionVisuals.motif}
            </div>
          </div>
        ) : (
          <div
            aria-label={`${STAGE_LABEL_HE[companion.stage]} מעולם ${themeNameOf(companion.theme)}`}
            className="relative flex h-48 w-48 animate-[bounce_3s_ease-in-out_infinite] items-center justify-center rounded-full border-4 border-white/30 bg-gradient-to-br from-white/15 via-purple-500/20 to-black/20 shadow-2xl"
            style={{
              boxShadow: `0 0 55px ${companionVisuals.eggColor}85`,
            }}
          >
            <div className="text-8xl drop-shadow-lg">
              {companionVisuals.motif}
            </div>
          </div>
        )}
        <div className="absolute bottom-0 h-5 w-36 rounded-[50%] bg-black/35 blur-sm" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-magic-bg/40 p-4">
          <div className="text-xs text-magic-soft/60">שלב התפתחות</div>
          <div className="mt-1 font-black text-white">
            {STAGE_LABEL_HE[companion.stage]}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-magic-bg/40 p-4">
          <div className="text-xs text-magic-soft/60">רמת קשר</div>
          <div className="mt-1 font-black text-white">{companion.bond}</div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-magic-bg/35 p-4 text-right">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold">
          <span className="text-magic-soft/65">
            {companion.stage === 'egg'
              ? 'התקדמות לקראת בקיעה'
              : 'הביצה בקעה בהצלחה'}
          </span>
          <span className="text-magic-accent">
            {companion.stage === 'egg'
              ? `${companion.bond} / ${HATCH_BOND_REQUIRED}`
              : '100%'}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-black/30">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              companion.stage === 'egg'
                ? 'bg-gradient-to-l from-purple-500 to-magic-accent'
                : 'bg-gradient-to-l from-emerald-400 to-yellow-300'
            }`}
            style={{
              width: `${companion.stage === 'egg' ? hatchProgress : 100}%`,
            }}
          />
        </div>

        {import.meta.env.DEV && companion.stage === 'egg' && (
          <button
            type="button"
            onClick={() => setHatchedNow(true)}
            className="mt-3 text-xs font-bold text-purple-300 underline hover:text-yellow-300"
          >
            הצגת אנימציית בקיעה — בדיקה מקומית בלבד
          </button>
        )}
      </div>

      <div className="mt-6 rounded-3xl border border-emerald-300/20 bg-emerald-500/10 p-5 text-right">
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-xl font-black text-white">טיפול יומי</h3>
            <p className="mt-1 text-xs text-magic-soft/60">
              טיפול עולה נקודות, מחזק את הקשר ומעניק XP.
            </p>
          </div>
          <div className="rounded-xl bg-black/20 px-3 py-2 text-center text-xs font-bold text-emerald-200">
            XP היום: {careStatus.careXpToday}/{careStatus.dailyCap}
          </div>
        </div>

        <div className="mb-4 h-2 overflow-hidden rounded-full bg-black/30">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all"
            style={{
              width: `${Math.round(
                (careStatus.careXpToday / careStatus.dailyCap) * 100
              )}%`,
            }}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {COMPANION_CARE_ACTIONS.map(action => {
            const xpGain = careXpForAction(action);
            const lacksPoints = student.points < action.pointCost;
            const exceedsDailyCap = xpGain > careStatus.remainingXp;

            return (
              <button
                key={action.id}
                type="button"
                disabled={lacksPoints || exceedsDailyCap}
                onClick={() => handleCare(action.id)}
                className="rounded-2xl border border-white/10 bg-magic-bg/50 p-4 text-center transition-colors hover:border-emerald-300/40 hover:bg-magic-bg/75 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <div className="text-4xl">{action.emoji}</div>
                <div className="mt-2 font-black text-white">
                  {action.nameHe}
                </div>
                <div className="mt-1 min-h-10 text-[11px] leading-5 text-magic-soft/60">
                  {action.descriptionHe}
                </div>
                <div className="mt-2 text-xs font-bold text-emerald-300">
                  {action.pointCost} נק׳ · +{action.bondGain} קשר · +{xpGain}{' '}
                  XP
                </div>
                {lacksPoints && (
                  <div className="mt-1 text-[10px] text-rose-300">
                    אין מספיק נקודות
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {careStatus.remainingXp === 0 && (
          <div className="mt-4 rounded-xl bg-black/20 px-3 py-2 text-center text-xs font-bold text-emerald-200">
            השלמת את הטיפול להיום. אפשר לחזור מחר 🌙
          </div>
        )}

        {message && (
          <div className="mt-4 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-center text-sm font-bold text-white">
            {message}
          </div>
        )}
      </div>

      {canChangeWorld && (
        <button
          type="button"
          onClick={() => {
            setSelectedTheme(companion.theme);
            setIsChangingWorld(true);
          }}
          className="mt-4 text-xs font-bold text-magic-soft/55 underline hover:text-magic-accent"
        >
          שינוי עולם הביצה
        </button>
      )}
      </div>
    </>
  );
}
