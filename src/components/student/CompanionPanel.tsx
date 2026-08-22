import { useState } from 'react';

import {
  COMPANION_STAGE_ORDER,
  COMPANION_VISUALS,
  companionStageForBond,
  nextCompanionStage,
  type CompanionStage,
  type CompanionWorldVisuals,
} from '../../data/companionWorlds';
import {
  COMPANION_WORLD_OPTIONS,
  THEMES,
  type ThemeId,
} from '../../data/themes';
import {
  COMPANION_INTERACTIONS,
  type CompanionInteractionId,
} from '../../logic/companion';
import { useGameStore, type StudentState } from '../../store/useGameStore';

type Props = {
  student: StudentState;
};

const COMPANION_UNLOCK_LEVEL = 5;

const STAGE_LABEL_HE: Record<CompanionStage, string> = {
  egg: 'ביצה קסומה',
  hatchling: 'חיית מחמד קטנטנה',
  young: 'חיית מחמד צעירה',
  grown: 'חיית מחמד בוגרת',
};

const STAGE_CEREMONY: Record<
  Exclude<CompanionStage, 'egg'>,
  { title: string; description: string; button: string }
> = {
  hatchling: {
    title: 'הביצה בקעה! 🎉',
    description: 'חיית המחמד החדשה הצטרפה לממלכה שלך.',
    button: 'להכיר את חיית המחמד 🐾',
  },
  young: {
    title: 'חיית המחמד גדלה! ✨',
    description: 'הקשר ביניכם התחזק והיא הפכה לחיית מחמד צעירה.',
    button: 'להמשיך לגדול יחד 💫',
  },
  grown: {
    title: 'התפתחות מושלמת! 👑',
    description: 'חיית המחמד הגיעה לשלב הבוגר והשלימה את מסע ההתפתחות.',
    button: 'לחגוג יחד 🏆',
  },
};

function themeNameOf(themeId: ThemeId): string {
  return THEMES.find(theme => theme.id === themeId)?.nameHe ?? themeId;
}

export default function CompanionPanel({ student }: Props) {
  const updateStudent = useGameStore(state => state.updateStudent);
  const companion = student.companion;

  const [selectedTheme, setSelectedTheme] = useState<ThemeId | null>(
    companion.theme
  );
  const [isChangingWorld, setIsChangingWorld] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [celebratedStage, setCelebratedStage] =
    useState<CompanionStage | null>(null);
  const [previewStage, setPreviewStage] = useState<CompanionStage | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(companion.name ?? '');

  const companionVisuals = companion.theme
    ? COMPANION_VISUALS[companion.theme]
    : null;
  const canUnlock = student.level >= COMPANION_UNLOCK_LEVEL;
  const canChangeWorld =
    companion.unlocked && companion.stage === 'egg' && companion.bond === 0;
  const shouldShowPicker =
    canUnlock && (!companion.unlocked || !companionVisuals || isChangingWorld);
  const nextStage = nextCompanionStage(companion.stage);
  const stageProgress = nextStage
    ? Math.min(100, Math.round((companion.bond / nextStage.bondRequired) * 100))
    : 100;
  const displayStage =
    import.meta.env.DEV && previewStage ? previewStage : companion.stage;
  const companionDisplayName =
    companion.name?.trim() || companionVisuals?.nameHe || 'חיית המחמד';
  const celebratedStages = companion.celebratedStages ?? ['egg'];
  const actualStageIndex = COMPANION_STAGE_ORDER.indexOf(companion.stage);
  const pendingEvolutionStage =
    COMPANION_STAGE_ORDER.find(
      (stage, index) =>
        stage !== 'egg' &&
        index <= actualStageIndex &&
        !celebratedStages.includes(stage)
    ) ?? null;
  const ceremonyStage = celebratedStage ?? pendingEvolutionStage;
  const isPreviewCeremony = celebratedStage !== null;

  function showMessage(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2400);
  }

  function confirmWorld() {
    if (!selectedTheme || !canUnlock) return;

    const accumulatedBond = companion.bond ?? 0;
    const actualStage = companionStageForBond(
      accumulatedBond,
      companion.unlocked ? companion.stage : 'egg'
    );

    updateStudent(student.id, {
      companion: {
        ...companion,
        unlocked: true,
        theme: selectedTheme,
        name: companion.name ?? null,
        stage: actualStage,
        bond: accumulatedBond,
        petPoints: companion.petPoints ?? 0,
        lastCareDate: companion.lastCareDate ?? null,
        careXpToday: companion.careXpToday ?? 0,
        celebratedStages: companion.celebratedStages ?? ['egg'],
        activeFlourishes: companion.activeFlourishes ?? [],
        ownedFlourishes: companion.ownedFlourishes ?? [],
      },
    });

    setIsChangingWorld(false);
  }

  function handleInteraction(actionId: CompanionInteractionId) {
    const action = COMPANION_INTERACTIONS.find(item => item.id === actionId);
    if (!action) return;

    const availablePetPoints = companion.petPoints ?? 0;

    if (availablePetPoints < action.petPointCost) {
      showMessage('אין מספיק נקודות חיה לפעילות הזאת');
      return;
    }

    if (action.petPointCost > 0) {
      const nextBond = companion.bond + action.bondGain;

      updateStudent(student.id, {
        companion: {
          ...companion,
          petPoints: availablePetPoints - action.petPointCost,
          bond: nextBond,
          stage: companionStageForBond(nextBond, companion.stage),
          celebratedStages: companion.celebratedStages ?? ['egg'],
        },
      });
    }

    showMessage(`${action.emoji} ${companionDisplayName}: ${action.reactionHe}`);
  }

  function saveCompanionName() {
    const cleanName = nameDraft.trim().replace(/\s+/g, ' ');

    if (cleanName.length < 2) {
      showMessage('השם צריך להכיל לפחות שני תווים');
      return;
    }

    updateStudent(student.id, {
      companion: {
        ...companion,
        name: cleanName,
      },
    });

    setNameDraft(cleanName);
    setIsRenaming(false);
    showMessage(`השם ${cleanName} נשמר בהצלחה ✨`);
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
      {ceremonyStage && ceremonyStage !== 'egg' && (
        <EvolutionCeremony
          stage={ceremonyStage}
          visuals={companionVisuals}
          petName={companionDisplayName}
          onClose={() => {
            if (isPreviewCeremony) {
              setCelebratedStage(null);
              return;
            }

            updateStudent(student.id, {
              companion: {
                ...companion,
                celebratedStages: Array.from(
                  new Set([...celebratedStages, ceremonyStage])
                ),
              },
            });
          }}
        />
      )}

      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-2 text-sm font-black text-magic-soft/65">
          עולם {themeNameOf(companion.theme)}
        </div>
        <h2 className="text-3xl font-black text-magic-accent">
          {companionDisplayName}
        </h2>
        <p className="mt-2 text-sm text-magic-soft/70">
          {companion.name?.trim() && (
            <span className="font-bold text-white/75">
              {companionVisuals.nameHe} ·{' '}
            </span>
          )}
          {companionVisuals.descriptionHe}
        </p>

        <CompanionAvatar
          stage={displayStage}
          visuals={companionVisuals}
          themeName={themeNameOf(companion.theme)}
          petName={companionDisplayName}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-magic-bg/40 p-4">
            <div className="text-xs text-magic-soft/60">שלב התפתחות</div>
            <div className="mt-1 font-black text-white">
              {STAGE_LABEL_HE[displayStage]}
              {previewStage && (
                <span className="mr-2 text-[10px] text-fuchsia-300">
                  תצוגה מקומית
                </span>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-magic-bg/40 p-4">
            <div className="text-xs text-magic-soft/60">רמת קשר</div>
            <div className="mt-1 font-black text-white">{companion.bond}</div>
          </div>
          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-4">
            <div className="text-xs text-emerald-100/65">נקודות חיה זמינות</div>
            <div className="mt-1 font-black text-emerald-200">
              {companion.petPoints ?? 0} 🐾
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-magic-bg/35 p-4 text-right">
          <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold">
            <span className="text-magic-soft/65">
              {nextStage ? nextStage.labelHe : 'כל שלבי ההתפתחות הושלמו'}
            </span>
            <span className="text-magic-accent">
              {nextStage
                ? `${companion.bond} / ${nextStage.bondRequired}`
                : 'מושלם 👑'}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-black/30">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                nextStage
                  ? 'bg-gradient-to-l from-purple-500 to-magic-accent'
                  : 'bg-gradient-to-l from-emerald-400 to-yellow-300'
              }`}
              style={{ width: `${stageProgress}%` }}
            />
          </div>
          {nextStage && (
            <>
              <div className="mt-2 text-[10px] text-magic-soft/45">
                חסרות עוד{' '}
                {Math.max(0, nextStage.bondRequired - companion.bond)} נקודות
                קשר לשלב הבא.
              </div>
              <div className="mt-2 rounded-lg bg-black/15 px-3 py-2 text-[11px] leading-5 text-magic-soft/70">
                כל נקודה שהמורה מעניקה בכיתה מוסיפה גם נקודת חיה. משתמשים
                בנקודות החיה במשחק ובפעילויות כדי לחזק את הקשר ולהתפתח. קניות
                בחנות אינן משפיעות עליהן.
              </div>
            </>
          )}
        </div>

        <div className="mt-4 rounded-2xl border border-fuchsia-300/20 bg-fuchsia-500/10 p-4">
            {companion.name?.trim() && !isRenaming ? (
              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <div className="text-right">
                  <div className="text-xs text-fuchsia-200/65">השם שבחרת</div>
                  <div className="text-xl font-black text-white">
                    {companion.name}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNameDraft(companion.name ?? '');
                    setIsRenaming(true);
                  }}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-fuchsia-100 hover:bg-white/10"
                >
                  שינוי שם ✏️
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-3 text-sm font-black text-white">
                  {companion.name?.trim()
                    ? 'בחירת שם חדש לחיית המחמד'
                    : companion.stage === 'egg'
                      ? 'אפשר לבחור כבר עכשיו שם שיחכה לחיה שתבקע!'
                      : 'הגיע הזמן לתת לחיית המחמד שם!'}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={nameDraft}
                    onChange={event => setNameDraft(event.target.value)}
                    maxLength={20}
                    placeholder="שם באורך 2–20 תווים"
                    className="min-w-0 flex-1 rounded-xl border border-white/15 bg-magic-bg/55 px-4 py-3 text-sm text-white outline-none placeholder:text-magic-soft/35 focus:border-fuchsia-300/60"
                  />
                  <button
                    type="button"
                    onClick={saveCompanionName}
                    disabled={nameDraft.trim().length < 2}
                    className="rounded-xl bg-fuchsia-300 px-5 py-3 text-sm font-black text-purple-950 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    שמירת השם
                  </button>
                  {companion.name?.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        setNameDraft(companion.name ?? '');
                        setIsRenaming(false);
                      }}
                      className="rounded-xl bg-magic-bg/50 px-4 py-3 text-sm font-bold text-magic-soft"
                    >
                      ביטול
                    </button>
                  )}
                </div>
              </div>
            )}
        </div>

        {import.meta.env.DEV && (
          <div className="mt-4 rounded-2xl border border-dashed border-fuchsia-300/30 bg-fuchsia-500/5 p-4">
            <div className="text-xs font-black text-fuchsia-200">
              בדיקת שלבי התפתחות — מקומית בלבד
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(['egg', 'hatchling', 'young', 'grown'] as CompanionStage[]).map(
                stage => (
                  <button
                    type="button"
                    key={stage}
                    onClick={() => setPreviewStage(stage)}
                    className={`rounded-xl px-3 py-2 text-xs font-bold ${
                      displayStage === stage
                        ? 'bg-fuchsia-300 text-purple-950'
                        : 'bg-magic-bg/55 text-magic-soft'
                    }`}
                  >
                    {STAGE_LABEL_HE[stage]}
                  </button>
                )
              )}
            </div>
            <div className="mt-3 flex flex-col justify-center gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  setCelebratedStage(
                    displayStage === 'egg' ? 'hatchling' : displayStage
                  )
                }
                className="rounded-xl bg-fuchsia-500/20 px-4 py-2 text-xs font-bold text-fuchsia-100 hover:bg-fuchsia-500/30"
              >
                הצגת טקס השלב
              </button>
              {previewStage && (
                <button
                  type="button"
                  onClick={() => setPreviewStage(null)}
                  className="rounded-xl bg-magic-bg/55 px-4 py-2 text-xs font-bold text-magic-soft"
                >
                  חזרה לשלב האמיתי
                </button>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 rounded-3xl border border-emerald-300/20 bg-emerald-500/10 p-5 text-right">
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xl font-black text-white">זמן יחד</h3>
              <p className="mt-1 text-xs text-magic-soft/60">
                בוחרים איך לשחק עם החיה. הפעילות משתמשת רק בנקודות חיה שנצברו
                מהנקודות שהמורה העניקה בכיתה.
              </p>
            </div>
            <div className="rounded-xl bg-black/20 px-3 py-2 text-center text-xs font-bold text-emerald-200">
              זמינות: {companion.petPoints ?? 0} נקודות חיה 🐾
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {COMPANION_INTERACTIONS.map(action => {
              const lacksPetPoints =
                (companion.petPoints ?? 0) < action.petPointCost;

              return (
                <button
                  key={action.id}
                  type="button"
                  disabled={lacksPetPoints}
                  onClick={() => handleInteraction(action.id)}
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
                    {action.petPointCost === 0
                      ? 'חינם · בשביל הכיף'
                      : `${action.petPointCost} נקודות חיה · +${action.bondGain} קשר`}
                  </div>
                  {lacksPetPoints && (
                    <div className="mt-1 text-[10px] text-rose-300">
                      אין מספיק נקודות חיה
                    </div>
                  )}
                </button>
              );
            })}
          </div>

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

function CompanionAvatar({
  stage,
  visuals,
  themeName,
  petName,
}: {
  stage: CompanionStage;
  visuals: CompanionWorldVisuals;
  themeName: string;
  petName: string;
}) {
  if (stage === 'egg') {
    return (
      <div className="relative mx-auto my-8 flex h-56 w-48 items-center justify-center">
        <div
          aria-label={`ביצה קסומה מעולם ${themeName}`}
          className="relative flex h-52 w-40 animate-[bounce_3s_ease-in-out_infinite] items-center justify-center overflow-hidden rounded-[50%_50%_46%_46%] border-4 border-white/35 shadow-2xl"
          style={{
            background: `radial-gradient(circle at 32% 24%, rgba(255,255,255,0.85), transparent 22%), radial-gradient(circle at 68% 72%, rgba(255,255,255,0.20), transparent 25%), ${visuals.eggColor}`,
            boxShadow: `0 0 45px ${visuals.eggColor}75`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/20" />
          <div className="relative text-6xl drop-shadow-lg">{visuals.motif}</div>
        </div>
        <div className="absolute bottom-0 h-5 w-36 rounded-[50%] bg-black/35 blur-sm" />
      </div>
    );
  }

  const bodySize =
    stage === 'hatchling'
      ? 'h-36 w-36'
      : stage === 'young'
        ? 'h-44 w-40'
        : 'h-48 w-44';
  const eyeSize = stage === 'hatchling' ? 'h-7 w-7' : 'h-8 w-8';

  return (
    <div className="relative mx-auto my-8 flex h-60 w-60 items-end justify-center">
      {stage === 'grown' && (
        <div className="absolute top-0 z-20 animate-bounce text-5xl">👑</div>
      )}
      {stage !== 'hatchling' && (
        <>
          <div className="absolute left-6 top-14 text-2xl text-yellow-200">✦</div>
          <div className="absolute right-4 top-24 text-xl text-fuchsia-200">✧</div>
        </>
      )}

      <div
        aria-label={`${STAGE_LABEL_HE[stage]} בשם ${petName} מעולם ${themeName}`}
        className={`relative z-10 flex ${bodySize} animate-[bounce_3s_ease-in-out_infinite] flex-col items-center rounded-[48%_48%_42%_42%] border-4 border-white/35 shadow-2xl`}
        style={{
          background: `radial-gradient(circle at 35% 22%, rgba(255,255,255,0.8), transparent 18%), linear-gradient(145deg, ${visuals.eggColor}, ${visuals.eggColor}99 55%, rgba(20,10,45,0.9))`,
          boxShadow: `0 0 ${stage === 'grown' ? 70 : 48}px ${visuals.eggColor}85`,
        }}
      >
        <div
          className="absolute -left-2 top-3 h-16 w-10 -rotate-[28deg] rounded-[80%_20%_55%_45%] border-2 border-white/25"
          style={{ backgroundColor: visuals.eggColor }}
        />
        <div
          className="absolute -right-2 top-3 h-16 w-10 rotate-[28deg] rounded-[20%_80%_45%_55%] border-2 border-white/25"
          style={{ backgroundColor: visuals.eggColor }}
        />

        <div className="relative z-10 mt-10 flex gap-5">
          {[0, 1].map(eye => (
            <div
              key={eye}
              className={`${eyeSize} flex items-center justify-center rounded-full bg-white shadow-inner`}
            >
              <div className="h-3 w-3 rounded-full bg-indigo-950" />
            </div>
          ))}
        </div>

        <div className="relative z-10 mt-3 h-4 w-8 rounded-b-full border-b-4 border-indigo-950/80" />
        <div className="relative z-10 mt-auto mb-5 rounded-full border border-white/35 bg-white/20 px-3 py-2 text-3xl drop-shadow-lg">
          {visuals.motif}
        </div>
      </div>

      <div className="absolute bottom-0 h-5 w-40 rounded-[50%] bg-black/35 blur-sm" />
    </div>
  );
}

function EvolutionCeremony({
  stage,
  visuals,
  petName,
  onClose,
}: {
  stage: Exclude<CompanionStage, 'egg'>;
  visuals: CompanionWorldVisuals;
  petName: string;
  onClose: () => void;
}) {
  const content = STAGE_CEREMONY[stage];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-purple-950/90 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.2),transparent_60%)]" />
      <div className="relative w-full max-w-md rounded-3xl border border-yellow-300/60 bg-gradient-to-b from-purple-900 via-magic-panel to-indigo-950 p-7 text-center shadow-[0_0_90px_rgba(250,204,21,0.45)]">
        <CompanionAvatar
          stage={stage}
          visuals={visuals}
          themeName={visuals.nameHe}
          petName={petName}
        />
        <div className="text-3xl font-black text-yellow-300">
          {content.title}
        </div>
        <p className="mt-3 text-sm leading-6 text-white/80">
          <span className="font-black text-white">{petName}</span>{' '}
          {content.description}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-yellow-300 py-3 font-black text-purple-950 hover:bg-yellow-200"
        >
          {content.button}
        </button>
      </div>
    </div>
  );
}
