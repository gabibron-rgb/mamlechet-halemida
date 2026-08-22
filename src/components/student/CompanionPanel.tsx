import { useState } from 'react';

import {
  COMPANION_STAGE_ORDER,
  COMPANION_VISUALS,
  MAX_ACTIVE_FLOURISHES,
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
import { COMPANION_FLOURISHES } from '../../data/companionFlourishes';
import {
  companionStageForProgress,
  getCompanionBehaviorDayCount,
  getCompanionEvolutionProgress,
} from '../../data/companionEvolution';
import { getCompanionInteractionBondBonus } from '../../data/companionSkills';
import {
  COMPANION_TRAITS,
  getCompanionTraitCounts,
} from '../../data/companionTraits';
import {
  COMPANION_TRAIT_CHALLENGE_TITLES,
  type CompanionTraitChallenge,
} from '../../data/companionTraitChallenges';
import { useGameStore, type StudentState } from '../../store/useGameStore';
import CompanionFlourishEffects from './CompanionFlourishEffects';
import CompanionSkillsPanel from './CompanionSkillsPanel';
import CompanionBehaviorProfile from './CompanionBehaviorProfile';
import CompanionTraitChallengePanel from './CompanionTraitChallengePanel';
import CompanionJournal from './CompanionJournal';
import CompanionReactionCard from './CompanionReactionCard';

type Props = {
  student: StudentState;
};

const COMPANION_UNLOCK_LEVEL = 5;

const STAGE_LABEL_HE: Record<CompanionStage, string> = {
  egg: 'ביצה קסומה',
  hatchling: 'חיית מחמד קטנטנה',
  young: 'חיית מחמד צעירה',
  grown: 'חיית מחמד בוגרת',
  legendary: 'חיית מחמד אגדית',
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
    description: 'הקשר ביניכם התחזק, וגם ההתנהגות בכיתה הראתה שהיא מוכנה לגדול.',
    button: 'להמשיך לגדול יחד 💫',
  },
  grown: {
    title: 'התפתחות מושלמת! 👑',
    description: 'הקשר, ההתמדה והאופי שנבנה בכיתה הביאו את חיית המחמד לשלב הבוגר.',
    button: 'להמשיך לעבר האגדה 🏆',
  },
  legendary: {
    title: 'התפתחות אגדית! 🌟👑🌟',
    description:
      'הקשר ביניכם והדרך שעשית בכיתה הגיעו לעוצמה נדירה — והחיה קיבלה את הצורה האגדית שלה!',
    button: 'לחשוף את הכוח האגדי ✨',
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
  const evolutionProgress = nextStage
    ? getCompanionEvolutionProgress(
        nextStage.stage,
        companion.bond,
        companion.behaviorMemories ?? [],
        companion.traitChallenges ?? []
      )
    : null;
  const stageProgress = evolutionProgress?.overallPercent ?? 100;
  const displayStage =
    import.meta.env.DEV && previewStage ? previewStage : companion.stage;
  const companionDisplayName =
    companion.name?.trim() || companionVisuals?.nameHe || 'חיית המחמד';
  const unlockedSkills = companion.unlockedSkills ?? [];
  const availableInteractions = COMPANION_INTERACTIONS.filter(
    interaction =>
      !interaction.requiredSkillId ||
      unlockedSkills.includes(interaction.requiredSkillId)
  );
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
  const petPoints = companion.petPoints ?? 0;
  const nextStepGuidance = (() => {
    if (!nextStage || !evolutionProgress) {
      return {
        emoji: '👑',
        title: 'הגעתם לשלב האגדי!',
        text: 'כל שלבי ההתפתחות הושלמו. עכשיו אפשר להמשיך לחזק כישורים, לאסוף אותות ולבנות יחד עוד זיכרונות.',
      };
    }

    if (!evolutionProgress.bondReady) {
      if (petPoints > 0) {
        return {
          emoji: '🐾',
          title: 'יש לך מה לעשות עכשיו',
          text: `יש לך ${petPoints} נקודות חיה. בחר פעילות ממש כאן למטה כדי לחזק את הקשר עם ${companionDisplayName}.`,
        };
      }

      const missingBond = Math.max(
        0,
        evolutionProgress.bondRequired - evolutionProgress.bond
      );
      return {
        emoji: '💞',
        title: 'הקשר צריך עוד קצת זמן',
        text: `חסרות עוד ${missingBond} נקודות קשר. נקודות חיה שתקבל מהמורה בכיתה יאפשרו לך לעשות פעילויות ולחזק את הקשר.`,
      };
    }

    if (!evolutionProgress.behaviorDaysReady) {
      const missingDays = Math.max(
        0,
        evolutionProgress.behaviorDaysRequired - evolutionProgress.behaviorDays
      );
      return {
        emoji: '🌟',
        title: 'הקשר כבר מספיק חזק',
        text: `עכשיו החיה מחכה לראות את הדרך שלך בכיתה. חסרים עוד ${missingDays} ימי התנהגות משמעותיים.`,
      };
    }

    if (!evolutionProgress.distinctTraitsReady) {
      const missingTraits = Math.max(
        0,
        evolutionProgress.distinctTraitsRequired - evolutionProgress.distinctTraits
      );
      return {
        emoji: '🌈',
        title: 'כמעט שם — צריך להראות עוד צד באופי',
        text: `כבר צברת מספיק ימים, אבל להתפתחות חסרים עוד ${missingTraits} סוגי תכונות שונים שיבואו לידי ביטוי בכיתה.`,
      };
    }

    if (!evolutionProgress.completedChallengesReady) {
      const missingChallenges = Math.max(
        0,
        evolutionProgress.completedChallengesRequired -
          evolutionProgress.completedChallenges
      );
      return {
        emoji: '🎯',
        title: 'השלב הבא תלוי באתגרי האופי',
        text: `נשאר להשלים עוד ${missingChallenges} אתגרי אופי. האתגר הנוכחי מופיע מיד אחרי הדרך להתפתחות.`,
      };
    }

    return {
      emoji: '✨',
      title: 'מוכנים להתפתחות!',
      text: 'כל התנאים הושלמו. ההתפתחות הבאה כבר מוכנה להיפתח.',
    };
  })();

  function showMessage(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2400);
  }

  function confirmWorld() {
    if (!selectedTheme || !canUnlock) return;

    const accumulatedBond = companion.bond ?? 0;
    const actualStage = companionStageForProgress({
      bond: accumulatedBond,
      currentStage: companion.unlocked ? companion.stage : 'egg',
      behaviorMemories: companion.behaviorMemories ?? [],
      traitChallenges: companion.traitChallenges ?? [],
    });

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
        unlockedSkills,
        treasuresFound: companion.treasuresFound ?? 0,
      },
    });

    setIsChangingWorld(false);
  }

  function handleInteraction(actionId: CompanionInteractionId) {
    const action = COMPANION_INTERACTIONS.find(item => item.id === actionId);
    if (!action) return;
    if (
      action.requiredSkillId &&
      !unlockedSkills.includes(action.requiredSkillId)
    ) {
      showMessage('צריך לפתוח קודם את הכישרון המתאים');
      return;
    }

    const availablePetPoints = companion.petPoints ?? 0;

    if (availablePetPoints < action.petPointCost) {
      showMessage('אין מספיק נקודות חיה לפעילות הזאת');
      return;
    }

    if (action.petPointCost > 0) {
      const bondBonus = getCompanionInteractionBondBonus(
        unlockedSkills,
        action.id,
        true
      );
      const nextBond = companion.bond + action.bondGain + bondBonus;

      updateStudent(student.id, {
        companion: {
          ...companion,
          petPoints: availablePetPoints - action.petPointCost,
          bond: nextBond,
          stage: companionStageForProgress({
            bond: nextBond,
            currentStage: companion.stage,
            behaviorMemories: companion.behaviorMemories ?? [],
            traitChallenges: companion.traitChallenges ?? [],
          }),
          celebratedStages: companion.celebratedStages ?? ['egg'],
          unlockedSkills,
          treasuresFound:
            (companion.treasuresFound ?? 0) +
            (action.id === 'treasure' ? 1 : 0),
        },
      });

      const bonusText = bondBonus > 0 ? ` · בונוס כישורים +${bondBonus}` : '';
      showMessage(
        `${action.emoji} ${companionDisplayName}: ${action.reactionHe}${bonusText}`
      );
      return;
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

  function toggleFlourish(flourishId: string) {
    const ownedFlourishes = companion.ownedFlourishes ?? [];
    const activeFlourishes = companion.activeFlourishes ?? [];

    if (!ownedFlourishes.includes(flourishId)) return;

    const isActive = activeFlourishes.includes(flourishId);

    if (!isActive && activeFlourishes.length >= MAX_ACTIVE_FLOURISHES) {
      showMessage(`אפשר להפעיל עד ${MAX_ACTIVE_FLOURISHES} עיטורים במקביל`);
      return;
    }

    const nextActiveFlourishes = isActive
      ? activeFlourishes.filter(id => id !== flourishId)
      : [...activeFlourishes, flourishId];

    updateStudent(student.id, {
      companion: {
        ...companion,
        activeFlourishes: nextActiveFlourishes,
        ownedFlourishes,
      },
    });

    showMessage(isActive ? 'העיטור הוסר מהחיה' : 'העיטור הופעל בהצלחה ✨');
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
      {message && (
        <div className="fixed bottom-6 left-1/2 z-[120] w-[min(92vw,34rem)] -translate-x-1/2 rounded-2xl border border-white/15 bg-slate-950/95 px-4 py-3 text-center text-sm font-black text-white shadow-2xl backdrop-blur">
          {message}
        </div>
      )}

      {ceremonyStage && ceremonyStage !== 'egg' && (
        <EvolutionCeremony
          stage={ceremonyStage}
          visuals={companionVisuals}
          petName={companionDisplayName}
          bond={companion.bond}
          behaviorMemories={companion.behaviorMemories ?? []}
          traitChallenges={companion.traitChallenges ?? []}
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

        <div className="flex items-center justify-center gap-2">
          <h2 className="text-3xl font-black text-magic-accent">
            {companionDisplayName}
          </h2>
          <button
            type="button"
            onClick={() => {
              setNameDraft(companion.name ?? '');
              setIsRenaming(true);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-magic-soft/70 transition-colors hover:border-fuchsia-300/40 hover:bg-fuchsia-500/10 hover:text-fuchsia-100"
            aria-label="שינוי שם החיה"
            title="שינוי שם החיה"
          >
            ✏️
          </button>
        </div>

        {isRenaming && (
          <div className="mx-auto mt-3 flex max-w-md flex-col gap-2 rounded-2xl border border-fuchsia-300/20 bg-fuchsia-500/10 p-3 sm:flex-row">
            <input
              type="text"
              value={nameDraft}
              onChange={event => setNameDraft(event.target.value)}
              maxLength={20}
              placeholder="שם באורך 2–20 תווים"
              autoFocus
              className="min-w-0 flex-1 rounded-xl border border-white/15 bg-magic-bg/65 px-4 py-2.5 text-sm text-white outline-none placeholder:text-magic-soft/35 focus:border-fuchsia-300/60"
              onKeyDown={event => {
                if (event.key === 'Enter') saveCompanionName();
                if (event.key === 'Escape') {
                  setNameDraft(companion.name ?? '');
                  setIsRenaming(false);
                }
              }}
            />
            <button
              type="button"
              onClick={saveCompanionName}
              disabled={nameDraft.trim().length < 2}
              className="rounded-xl bg-fuchsia-300 px-4 py-2.5 text-xs font-black text-purple-950 disabled:cursor-not-allowed disabled:opacity-35"
            >
              שמירה
            </button>
            <button
              type="button"
              onClick={() => {
                setNameDraft(companion.name ?? '');
                setIsRenaming(false);
              }}
              className="rounded-xl bg-magic-bg/50 px-3 py-2.5 text-xs font-bold text-magic-soft"
            >
              ביטול
            </button>
          </div>
        )}

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
          activeFlourishes={companion.activeFlourishes ?? []}
          hasLegendaryBond={unlockedSkills.includes('legendary_bond')}
        />

        <CompanionReactionCard
          companion={companion}
          petName={companionDisplayName}
          motif={companionVisuals.motif}
        />

        <section className="mt-4 rounded-3xl border border-emerald-300/30 bg-emerald-500/10 p-5 text-right shadow-[0_0_28px_rgba(52,211,153,0.08)]">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <div className="text-[10px] font-black tracking-wide text-emerald-200/65">
                הפעולה המרכזית
              </div>
              <h3 className="mt-1 text-2xl font-black text-white">
                🐾 לאמן ולחזק את {companionDisplayName}
              </h3>
              <p className="mt-1 max-w-xl text-xs leading-5 text-magic-soft/65">
                נקודות חיה שהתקבלו מהנקודות של המורה הופכות כאן לזמן משותף ולקשר חזק יותר.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-300/20 bg-black/20 px-4 py-3 text-center">
              <div className="text-[10px] font-bold text-emerald-100/60">נקודות חיה זמינות</div>
              <div className="mt-1 text-lg font-black text-emerald-200">
                {petPoints} 🐾
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start gap-3">
              <div className="text-3xl">{nextStepGuidance.emoji}</div>
              <div>
                <div className="text-sm font-black text-white">
                  {nextStepGuidance.title}
                </div>
                <div className="mt-1 text-xs leading-5 text-magic-soft/70">
                  {nextStepGuidance.text}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {availableInteractions.map(action => {
              const lacksPetPoints = petPoints < action.petPointCost;
              const bondBonus = getCompanionInteractionBondBonus(
                unlockedSkills,
                action.id,
                action.petPointCost > 0
              );
              const totalBondGain = action.bondGain + bondBonus;

              return (
                <button
                  key={action.id}
                  type="button"
                  disabled={lacksPetPoints}
                  onClick={() => handleInteraction(action.id)}
                  className="rounded-2xl border border-white/10 bg-magic-bg/50 p-4 text-center transition-all hover:-translate-y-0.5 hover:border-emerald-300/45 hover:bg-magic-bg/75 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
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
                      : `${action.petPointCost} נקודות חיה · +${totalBondGain} קשר`}
                  </div>
                  {bondBonus > 0 && (
                    <div className="mt-1 text-[10px] font-bold text-cyan-200">
                      כולל בונוס כישורים +{bondBonus}
                    </div>
                  )}
                  {lacksPetPoints && (
                    <div className="mt-1 text-[10px] text-rose-300">
                      אין מספיק נקודות חיה
                    </div>
                  )}
                </button>
              );
            })}
          </div>

        </section>

        <section className="mt-4 rounded-3xl border border-purple-300/20 bg-purple-500/10 p-5 text-right">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xl font-black text-white">
                🌱 הדרך להתפתחות הבאה
              </h3>
              <p className="mt-1 text-xs leading-5 text-magic-soft/65">
                החיה מתפתחת כשגם הקשר ביניכם מתחזק וגם נבנית דרך אמיתית של התנהגות בכיתה.
              </p>
            </div>
            <div className="flex gap-2 text-center text-xs font-bold">
              <div className="rounded-xl bg-black/20 px-3 py-2 text-purple-100">
                {STAGE_LABEL_HE[displayStage]}
              </div>
              <div className="rounded-xl bg-black/20 px-3 py-2 text-fuchsia-200">
                {companion.bond} קשר 💞
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-magic-bg/35 p-4">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold">
              <span className="text-magic-soft/65">
                {nextStage ? nextStage.labelHe : 'כל שלבי ההתפתחות הושלמו'}
              </span>
              <span className="text-magic-accent">
                {nextStage && evolutionProgress
                  ? `${stageProgress}% מהדרך`
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

            {nextStage && evolutionProgress && (
              <>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <EvolutionRequirement
                    label="קשר"
                    value={`${evolutionProgress.bond}/${evolutionProgress.bondRequired}`}
                    ready={evolutionProgress.bondReady}
                  />
                  <EvolutionRequirement
                    label="ימי התנהגות"
                    value={`${evolutionProgress.behaviorDays}/${evolutionProgress.behaviorDaysRequired}`}
                    ready={evolutionProgress.behaviorDaysReady}
                  />
                  <EvolutionRequirement
                    label="תכונות שונות"
                    value={`${evolutionProgress.distinctTraits}/${evolutionProgress.distinctTraitsRequired}`}
                    ready={evolutionProgress.distinctTraitsReady}
                  />
                  <EvolutionRequirement
                    label="אתגרי אופי"
                    value={
                      evolutionProgress.completedChallengesRequired > 0
                        ? `${evolutionProgress.completedChallenges}/${evolutionProgress.completedChallengesRequired}`
                        : 'לא נדרש'
                    }
                    ready={evolutionProgress.completedChallengesReady}
                  />
                </div>

                <div className="mt-3 rounded-xl border border-white/5 bg-black/15 px-3 py-2 text-[11px] leading-5 text-magic-soft/70">
                  אותה תכונה באותו יום נספרת פעם אחת בלבד. כך ההתפתחות משקפת דרך לאורך זמן ולא כמות לחיצות.
                </div>
              </>
            )}
          </div>
        </section>

        <CompanionTraitChallengePanel companion={companion} />

        <CompanionBehaviorProfile companion={companion} />

        <CompanionSkillsPanel
          studentId={student.id}
          companion={companion}
        />

        <div className="mt-4 rounded-3xl border border-fuchsia-300/20 bg-fuchsia-500/10 p-5 text-right">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xl font-black text-white">אותות ועיטורים</h3>
              <p className="mt-1 text-xs text-magic-soft/60">
                אותות מיוחדים שהמורה מעניקה על התנהגות ומאמץ בכיתה.
              </p>
            </div>
            <div className="rounded-xl bg-black/20 px-3 py-2 text-center text-xs font-bold text-fuchsia-200">
              פעילים: {(companion.activeFlourishes ?? []).length}/
              {MAX_ACTIVE_FLOURISHES}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {COMPANION_FLOURISHES.map(flourish => {
              const owned = (companion.ownedFlourishes ?? []).includes(
                flourish.id
              );
              const active = (companion.activeFlourishes ?? []).includes(
                flourish.id
              );

              return (
                <button
                  key={flourish.id}
                  type="button"
                  disabled={!owned}
                  onClick={() => toggleFlourish(flourish.id)}
                  className={`rounded-2xl border p-3 text-center transition-all ${
                    active
                      ? 'border-fuchsia-200 bg-fuchsia-400/20 shadow-[0_0_20px_rgba(232,121,249,0.2)]'
                      : owned
                        ? 'border-white/15 bg-magic-bg/45 hover:border-fuchsia-300/40'
                        : 'cursor-not-allowed border-white/5 bg-black/10 opacity-35'
                  }`}
                >
                  <div className={`text-3xl ${owned ? '' : 'grayscale'}`}>
                    {owned ? flourish.emoji : '🔒'}
                  </div>
                  <div className="mt-2 text-xs font-black text-white">
                    {flourish.nameHe}
                  </div>
                  <div className="mt-1 min-h-8 text-[9px] leading-4 text-magic-soft/55">
                    {flourish.descriptionHe}
                  </div>
                  <div
                    className={`mt-2 text-[10px] font-black ${
                      active
                        ? 'text-fuchsia-200'
                        : owned
                          ? 'text-emerald-200'
                          : 'text-magic-soft/45'
                    }`}
                  >
                    {active ? '✓ פעיל' : owned ? 'לחיצה להפעלה' : 'טרם התקבל'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <CompanionJournal companion={companion} />

        {import.meta.env.DEV && (
          <div className="mt-4 rounded-2xl border border-dashed border-fuchsia-300/30 bg-fuchsia-500/5 p-4">
            <div className="text-xs font-black text-fuchsia-200">
              בדיקת שלבי התפתחות — מקומית בלבד
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {(
                [
                  'egg',
                  'hatchling',
                  'young',
                  'grown',
                  'legendary',
                ] as CompanionStage[]
              ).map(stage => (
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
              ))}
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

function EvolutionRequirement({
  label,
  value,
  ready,
}: {
  label: string;
  value: string;
  ready: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-center ${
        ready
          ? 'border-emerald-300/25 bg-emerald-500/10'
          : 'border-white/10 bg-black/15'
      }`}
    >
      <div className="text-[9px] font-bold text-magic-soft/50">{label}</div>
      <div
        className={`mt-1 text-xs font-black ${
          ready ? 'text-emerald-200' : 'text-white'
        }`}
      >
        {ready ? '✓ ' : ''}
        {value}
      </div>
    </div>
  );
}


function CompanionAvatar({
  stage,
  visuals,
  themeName,
  petName,
  activeFlourishes = [],
  hasLegendaryBond = false,
}: {
  stage: CompanionStage;
  visuals: CompanionWorldVisuals;
  themeName: string;
  petName: string;
  activeFlourishes?: string[];
  hasLegendaryBond?: boolean;
}) {
  if (stage === 'egg') {
    return (
      <div className="relative mx-auto my-8 flex h-56 w-48 items-center justify-center">
        <CompanionFlourishEffects activeFlourishes={activeFlourishes} />
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
        : stage === 'grown'
          ? 'h-48 w-44'
          : 'h-52 w-48';
  const eyeSize = stage === 'hatchling' ? 'h-7 w-7' : 'h-8 w-8';
  const isLegendary = stage === 'legendary';
  const isChessPegasus = isLegendary && visuals.theme === 'chess';

  return (
    <div className="relative mx-auto my-8 flex h-60 w-60 items-end justify-center">
      <CompanionFlourishEffects activeFlourishes={activeFlourishes} />
      {hasLegendaryBond && (
        <>
          <div className="absolute inset-1 animate-pulse rounded-full border-2 border-cyan-200/55 shadow-[0_0_75px_rgba(103,232,249,0.68)]" />
          <div className="absolute left-3 top-12 animate-bounce text-2xl text-yellow-200">
            ✨
          </div>
          <div className="absolute right-3 top-24 animate-pulse text-2xl text-cyan-100">
            ✦
          </div>
        </>
      )}
      {(stage === 'grown' || isLegendary) && (
        <div
          className={`absolute top-0 z-30 text-5xl ${
            isLegendary ? 'animate-pulse' : 'animate-bounce'
          }`}
        >
          👑
        </div>
      )}
      {isLegendary && (
        <div className="absolute inset-4 animate-pulse rounded-full border-2 border-yellow-200/60 shadow-[0_0_70px_rgba(250,204,21,0.65)]" />
      )}
      {isChessPegasus && (
        <>
          <div className="absolute left-0 top-24 z-0 -rotate-12 text-8xl drop-shadow-[0_0_18px_rgba(255,255,255,0.75)]">
            🪽
          </div>
          <div className="absolute right-0 top-24 z-0 rotate-12 scale-x-[-1] text-8xl drop-shadow-[0_0_18px_rgba(255,255,255,0.75)]">
            🪽
          </div>
        </>
      )}
      {stage !== 'hatchling' && (
        <>
          <div className="absolute left-6 top-14 text-2xl text-yellow-200">✦</div>
          <div className="absolute right-4 top-24 text-xl text-fuchsia-200">✧</div>
        </>
      )}

      <div
        aria-label={`${STAGE_LABEL_HE[stage]} בשם ${petName} מעולם ${themeName}`}
        className={`relative z-10 flex ${bodySize} animate-[bounce_3s_ease-in-out_infinite] flex-col items-center rounded-[48%_48%_42%_42%] border-4 shadow-2xl ${
          isLegendary ? 'border-yellow-200/75' : 'border-white/35'
        }`}
        style={{
          background: `radial-gradient(circle at 35% 22%, rgba(255,255,255,0.8), transparent 18%), linear-gradient(145deg, ${visuals.eggColor}, ${visuals.eggColor}99 55%, rgba(20,10,45,0.9))`,
          boxShadow: `0 0 ${isLegendary ? 95 : stage === 'grown' ? 70 : 48}px ${visuals.eggColor}85`,
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
        {isLegendary && (
          <div className="absolute -bottom-3 z-20 rounded-full border border-yellow-200/50 bg-purple-950/90 px-3 py-1 text-[10px] font-black tracking-wide text-yellow-200 shadow-lg">
            אגדי
          </div>
        )}
      </div>

      <div className="absolute bottom-0 h-5 w-40 rounded-[50%] bg-black/35 blur-sm" />
    </div>
  );
}

const EVOLUTION_SPARKS = [
  { left: '8%', top: '12%', symbol: '✦', delay: '0ms' },
  { left: '18%', top: '72%', symbol: '✨', delay: '420ms' },
  { left: '29%', top: '18%', symbol: '✧', delay: '180ms' },
  { left: '42%', top: '8%', symbol: '✦', delay: '620ms' },
  { left: '58%', top: '15%', symbol: '✨', delay: '300ms' },
  { left: '73%', top: '10%', symbol: '✧', delay: '760ms' },
  { left: '88%', top: '24%', symbol: '✦', delay: '120ms' },
  { left: '92%', top: '69%', symbol: '✨', delay: '520ms' },
  { left: '66%', top: '84%', symbol: '✧', delay: '240ms' },
  { left: '33%', top: '88%', symbol: '✦', delay: '680ms' },
] as const;

const EVOLUTION_STAGE_REVEAL: Record<
  Exclude<CompanionStage, 'egg'>,
  { eyebrow: string; stageName: string; icon: string }
> = {
  hatchling: {
    eyebrow: 'התחלה חדשה',
    stageName: 'שלב קטנטנה',
    icon: '🐾',
  },
  young: {
    eyebrow: 'הקשר מתחזק',
    stageName: 'שלב צעירה',
    icon: '✨',
  },
  grown: {
    eyebrow: 'דרך של אופי',
    stageName: 'שלב בוגרת',
    icon: '👑',
  },
  legendary: {
    eyebrow: 'LEGENDARY',
    stageName: 'שלב אגדי',
    icon: '🌟',
  },
};

function EvolutionCeremony({
  stage,
  visuals,
  petName,
  bond,
  behaviorMemories,
  traitChallenges,
  onClose,
}: {
  stage: Exclude<CompanionStage, 'egg'>;
  visuals: CompanionWorldVisuals;
  petName: string;
  bond: number;
  behaviorMemories: StudentState['companion']['behaviorMemories'];
  traitChallenges: CompanionTraitChallenge[];
  onClose: () => void;
}) {
  const [step, setStep] = useState<'journey' | 'reveal'>('journey');
  const content = STAGE_CEREMONY[stage];
  const stageReveal = EVOLUTION_STAGE_REVEAL[stage];
  const behaviorDays = getCompanionBehaviorDayCount(behaviorMemories);
  const traitCounts = getCompanionTraitCounts(behaviorMemories);
  const strongestTraits = [...COMPANION_TRAITS]
    .filter(trait => traitCounts[trait.id] > 0)
    .sort((first, second) => traitCounts[second.id] - traitCounts[first.id])
    .slice(0, 3);
  const completedChallenges = traitChallenges.filter(
    challenge => challenge.completedAt !== null
  );
  const recentChallenge = completedChallenges.at(-1) ?? null;
  const previousStageIndex = Math.max(0, COMPANION_STAGE_ORDER.indexOf(stage) - 1);
  const previousStage = COMPANION_STAGE_ORDER[previousStageIndex] ?? 'egg';
  const isLegendary = stage === 'legendary';

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden p-3 backdrop-blur-lg sm:p-5 ${
        isLegendary ? 'bg-indigo-950/95' : 'bg-purple-950/92'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={`טקס ההתפתחות של ${petName}`}
    >
      <div
        className={`absolute inset-0 ${
          isLegendary
            ? 'animate-pulse bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.42),rgba(192,38,211,0.18)_38%,transparent_68%)]'
            : 'bg-[radial-gradient(circle_at_center,rgba(216,180,254,0.26),rgba(250,204,21,0.12)_42%,transparent_72%)]'
        }`}
      />

      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {EVOLUTION_SPARKS.map((spark, index) => (
          <span
            key={index}
            className={`absolute animate-pulse select-none ${
              isLegendary ? 'text-yellow-200' : 'text-purple-200'
            } ${index % 3 === 0 ? 'text-3xl' : 'text-xl'}`}
            style={{
              left: spark.left,
              top: spark.top,
              animationDelay: spark.delay,
            }}
          >
            {spark.symbol}
          </span>
        ))}
      </div>

      <div
        className={`relative max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-gradient-to-b from-purple-900 via-magic-panel to-indigo-950 p-5 text-center text-white sm:p-8 ${
          isLegendary
            ? 'border-2 border-yellow-200 shadow-[0_0_140px_rgba(250,204,21,0.62)]'
            : 'border border-purple-200/35 shadow-[0_0_110px_rgba(192,132,252,0.42)]'
        }`}
      >
        <div className="absolute -left-16 -top-16 h-44 w-44 rounded-full bg-fuchsia-400/15 blur-3xl" />
        <div className="absolute -bottom-20 -right-14 h-52 w-52 rounded-full bg-yellow-300/15 blur-3xl" />

        {step === 'journey' ? (
          <div className="relative">
            <div
              className={`text-xs font-black uppercase tracking-[0.28em] ${
                isLegendary ? 'text-yellow-200' : 'text-purple-200/80'
              }`}
            >
              {stageReveal.eyebrow}
            </div>
            <h2 className="mt-3 text-4xl font-black text-yellow-300 drop-shadow sm:text-5xl">
              הגיע הרגע...
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/80 sm:text-base">
              ההתפתחות של <span className="font-black text-white">{petName}</span> לא קרתה רק
              בגלל מד שהתמלא. הדרך שלך בכיתה היא חלק ממה שהביא אתכם לכאן.
            </p>

            <div className="relative mx-auto my-6 flex h-36 w-36 items-center justify-center">
              <div
                className="absolute inset-0 animate-ping rounded-full border border-yellow-200/25"
                style={{ animationDuration: '2.4s' }}
              />
              <div
                className="absolute inset-3 animate-pulse rounded-full blur-xl"
                style={{ backgroundColor: `${visuals.eggColor}55` }}
              />
              <div
                className="relative flex h-28 w-28 items-center justify-center rounded-full border-2 border-white/30 bg-black/20 text-6xl shadow-2xl"
                style={{
                  boxShadow: `0 0 55px ${visuals.eggColor}80`,
                }}
              >
                {visuals.motif}
              </div>
            </div>

            <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-black/15 p-4 text-right">
              <div className="text-center text-xs font-black tracking-wide text-purple-200/70">
                הדברים שבנו את ההתפתחות הזאת
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <EvolutionJourneyStat label="קשר" value={String(bond)} emoji="💞" />
                <EvolutionJourneyStat
                  label="ימי התנהגות"
                  value={String(behaviorDays)}
                  emoji="📅"
                />
                <EvolutionJourneyStat
                  label="אתגרי אופי"
                  value={String(completedChallenges.length)}
                  emoji="🏅"
                />
              </div>

              {strongestTraits.length > 0 && (
                <div className="mt-4 space-y-2">
                  {strongestTraits.map(trait => (
                    <div
                      key={trait.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{trait.emoji}</span>
                        <span className="font-black text-white">{trait.nameHe}</span>
                      </div>
                      <div className="text-xs font-bold text-purple-100/75">
                        {traitCounts[trait.id]} {traitCounts[trait.id] === 1 ? 'יום הוכחה' : 'ימי הוכחה'}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {recentChallenge && (
                <div className="mt-3 rounded-xl border border-yellow-200/20 bg-yellow-300/10 px-3 py-3 text-center">
                  <div className="text-[10px] font-black uppercase tracking-widest text-yellow-200/60">
                    אתגר אופי שהושלם
                  </div>
                  <div className="mt-1 font-black text-yellow-100">
                    🏆 {COMPANION_TRAIT_CHALLENGE_TITLES[recentChallenge.traitId]}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setStep('reveal')}
              className="mt-6 w-full rounded-2xl bg-gradient-to-l from-yellow-300 to-amber-400 px-6 py-4 text-base font-black text-purple-950 shadow-lg transition-transform hover:scale-[1.015]"
            >
              לגלות את הצורה החדשה ✨
            </button>
          </div>
        ) : (
          <div className="relative">
            <div
              className={`text-xs font-black uppercase tracking-[0.3em] ${
                isLegendary ? 'animate-pulse text-yellow-200' : 'text-purple-200/80'
              }`}
            >
              {stageReveal.eyebrow}
            </div>

            <div className="mt-2 text-5xl" aria-hidden="true">
              {stageReveal.icon}
            </div>

            <CompanionAvatar
              stage={stage}
              visuals={visuals}
              themeName={visuals.nameHe}
              petName={petName}
            />

            <div className="inline-flex rounded-full border border-yellow-200/35 bg-yellow-300/10 px-4 py-1.5 text-xs font-black text-yellow-100">
              {STAGE_LABEL_HE[previousStage]} → {stageReveal.stageName}
            </div>

            <h2 className="mt-4 text-3xl font-black text-yellow-300 drop-shadow sm:text-4xl">
              {content.title}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/80 sm:text-base">
              {content.description}
              <br />
              <span className="font-black text-white">
                ההתפתחות הזאת מספרת גם משהו על הדרך שלך בכיתה.
              </span>
            </p>

            {strongestTraits.length > 0 && (
              <div className="mx-auto mt-5 flex max-w-lg flex-wrap justify-center gap-2">
                {strongestTraits.map(trait => (
                  <span
                    key={trait.id}
                    className="rounded-full border border-white/12 bg-white/5 px-3 py-2 text-xs font-black text-white"
                  >
                    {trait.emoji} {trait.nameHe} · {traitCounts[trait.id]}
                  </span>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="mt-7 w-full rounded-2xl bg-gradient-to-l from-yellow-300 to-amber-400 px-6 py-4 text-base font-black text-purple-950 shadow-lg transition-transform hover:scale-[1.015]"
            >
              {content.button}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function EvolutionJourneyStat({
  label,
  value,
  emoji,
}: {
  label: string;
  value: string;
  emoji: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-3">
      <div className="text-xl">{emoji}</div>
      <div className="mt-1 text-lg font-black text-white">{value}</div>
      <div className="text-[9px] font-bold text-purple-100/60">{label}</div>
    </div>
  );
}
