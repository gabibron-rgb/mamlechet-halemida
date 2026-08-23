import { useEffect, useMemo, useState } from 'react';

import {
  SPECIAL_JOURNEYS,
  journeyCompletedStageCount,
  journeyConditionLabel,
  journeyConditionProgress,
  journeyNeedsThemeChoice,
  journeyRewardLabel,
  type SpecialJourneyDefinition,
} from '../../data/specialJourneys';
import { THEMES, type ThemeId } from '../../data/themes';
import { studentTitleDisplayLabel } from '../../data/studentTitles';
import { useGameStore, type StudentState } from '../../store/useGameStore';

type Props = {
  student: StudentState;
};

function journeyRewardLabelForStudent(
  reward: SpecialJourneyDefinition['rewards'][number],
  student: StudentState
): string {
  if (reward.kind === 'specialUnlock' && reward.unlockKind === 'title') {
    return `התואר “${studentTitleDisplayLabel(
      reward.unlockId,
      reward.labelHe,
      student.gender
    )}”`;
  }

  return journeyRewardLabel(reward);
}

function rewardEmoji(kind: string): string {
  if (kind === 'pet') return '🦄';
  if (kind === 'room') return '🏛️';
  if (kind === 'character') return '🧙';
  if (kind === 'title') return '👑';
  return '✨';
}

export default function SpecialJourneysPanel({ student }: Props) {
  const reconcileSpecialJourneys = useGameStore(
    state => state.reconcileSpecialJourneys
  );
  const claimSpecialJourneyReward = useGameStore(
    state => state.claimSpecialJourneyReward
  );

  const fallbackTheme =
    student.unlockedThemes.find(themeId => themeId !== 'generic') ?? 'generic';
  const [selectedThemes, setSelectedThemes] = useState<Record<string, ThemeId>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const journeySignature = useMemo(
    () =>
      [
        student.level,
        student.inventory
          .map(entry => `${entry.itemId}:${entry.kind ?? 'item'}`)
          .join('|'),
        student.companion.stage,
        (student.companion.behaviorMemories ?? [])
          .map(memory => `${memory.id}:${memory.awardedAt}`)
          .join('|'),
        (student.missions ?? [])
          .map(mission => `${mission.id}:${mission.completedAt ?? ''}:${mission.cancelledAt ?? ''}`)
          .join('|'),
        (student.classGoals ?? [])
          .map(goal =>
            `${goal.id}:${goal.completedAt ?? ''}:${goal.cancelledAt ?? ''}:${goal.contributionIds.join(',')}`
          )
          .join('|'),
      ].join('::'),
    [student]
  );

  useEffect(() => {
    let active = true;

    void reconcileSpecialJourneys(student.id).then(result => {
      if (!active) return;
      if (result.newlyCompletedIds.length > 0) {
        setMessage('✨ מסע מיוחד הושלם! הפרס מחכה לך.');
      }
    });

    return () => {
      active = false;
    };
  }, [journeySignature, reconcileSpecialJourneys, student.id]);

  const recordById = useMemo(
    () =>
      new Map(
        (student.journeyRecords ?? []).map(record => [record.journeyId, record])
      ),
    [student.journeyRecords]
  );

  const visibleJourneys = SPECIAL_JOURNEYS.filter(journey => {
    if (!journey.hidden) return true;
    return recordById.has(journey.id);
  });
  const hiddenUndiscoveredCount = SPECIAL_JOURNEYS.filter(
    journey => journey.hidden && !recordById.has(journey.id)
  ).length;

  const availableThemes = THEMES.filter(
    theme => theme.id === 'generic' || student.unlockedThemes.includes(theme.id)
  );

  async function handleClaim(journey: SpecialJourneyDefinition) {
    const selectedTheme = journeyNeedsThemeChoice(journey)
      ? selectedThemes[journey.id] ?? fallbackTheme
      : undefined;

    setBusyId(journey.id);
    setMessage(null);
    const ok = await claimSpecialJourneyReward(
      student.id,
      journey.id,
      selectedTheme
    );
    setBusyId(null);

    if (!ok) {
      setMessage('לא הצלחתי לאסוף את פרס המסע. כדאי לרענן ולנסות שוב.');
      return;
    }

    setMessage(
      `${journey.emoji} המסע הושלם והפרס נאסף: ${journey.rewards
        .map(reward => journeyRewardLabelForStudent(reward, student))
        .join(' + ')}`
    );
  }

  return (
    <div className="mt-8 overflow-hidden rounded-3xl border border-fuchsia-400/25 bg-gradient-to-l from-fuchsia-950/35 via-indigo-950/35 to-cyan-950/25 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-2xl font-black text-white">🗺️ מסעות מיוחדים</div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-magic-soft/70">
            יש בממלכה דברים שלא קונים ולא מוצאים במקרה בקופסה. מסעות מיוחדים
            מחברים בין הדרך שלך בכיתה לבין ההתקדמות בממלכה ופותחים פרסים
            ייחודיים באמת.
          </p>
        </div>
        <div className="shrink-0 rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-center">
          <div className="text-3xl">🧭</div>
          <div className="mt-1 text-xs font-black text-white">
            {visibleJourneys.length} מסעות שהתגלו
          </div>
        </div>
      </div>

      {message && (
        <div className="mt-4 rounded-2xl border border-yellow-300/25 bg-yellow-300/10 p-3 text-center text-sm font-black text-yellow-50">
          {message}
        </div>
      )}

      <div className="mt-5 space-y-4">
        {visibleJourneys.map(journey => {
          const record = recordById.get(journey.id) ?? null;
          return (
            <JourneyCard
              key={journey.id}
              journey={journey}
              student={student}
              record={record}
              busy={busyId === journey.id}
              selectedTheme={selectedThemes[journey.id] ?? fallbackTheme}
              availableThemes={availableThemes}
              onThemeChange={themeId =>
                setSelectedThemes(current => ({
                  ...current,
                  [journey.id]: themeId,
                }))
              }
              onClaim={() => void handleClaim(journey)}
            />
          );
        })}
      </div>

      {hiddenUndiscoveredCount > 0 && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-center text-xs font-bold text-fuchsia-100/55">
          🔒 יש עוד {hiddenUndiscoveredCount} מסעות סודיים שעדיין לא התגלו.
        </div>
      )}

      <div className="mt-4 text-xs font-bold text-fuchsia-100/60">
        רמז: מסעות לא מתקדמים דרך קנייה. הם מגיבים לדברים שעשית לאורך הדרך.
      </div>
    </div>
  );
}

function JourneyCard({
  journey,
  student,
  record,
  busy,
  selectedTheme,
  availableThemes,
  onThemeChange,
  onClaim,
}: {
  journey: SpecialJourneyDefinition;
  student: StudentState;
  record: StudentState['journeyRecords'][number] | null;
  busy: boolean;
  selectedTheme: ThemeId;
  availableThemes: typeof THEMES;
  onThemeChange: (themeId: ThemeId) => void;
  onClaim: () => void;
}) {
  const liveCompletedStages = journeyCompletedStageCount(journey, student);
  const recordedCompletedStages = record?.completedStageIds.length ?? 0;
  const completedStages = Math.max(liveCompletedStages, recordedCompletedStages);
  const complete = record?.completedAt != null || completedStages >= journey.stages.length;
  const rewardClaimed = record?.rewardClaimedAt != null;
  const needsTheme = journeyNeedsThemeChoice(journey);

  return (
    <div className="rounded-3xl border border-fuchsia-300/25 bg-black/20 p-5 shadow-[0_0_35px_rgba(217,70,239,0.08)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-fuchsia-200/20 bg-fuchsia-300/10 text-4xl">
            {journey.emoji}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-black text-white">{journey.titleHe}</h3>
              <span className="rounded-full border border-yellow-300/25 bg-yellow-300/10 px-2 py-0.5 text-[10px] font-black text-yellow-100">
                {journey.difficultyHe}
              </span>
            </div>
            <div className="mt-1 text-xs font-bold text-fuchsia-100/70">
              {journey.subtitleHe}
            </div>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-magic-soft/60">
              {journey.descriptionHe}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-magic-bg/45 px-4 py-3 text-center">
          <div className="text-lg font-black text-white">
            {completedStages}/{journey.stages.length}
          </div>
          <div className="text-[10px] font-bold text-magic-soft/55">שלבים הושלמו</div>
        </div>
      </div>

      <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-black/30">
        <div
          className="h-full rounded-full bg-gradient-to-l from-fuchsia-400 via-purple-400 to-cyan-300 transition-all duration-500"
          style={{
            width: `${Math.round((completedStages / journey.stages.length) * 100)}%`,
          }}
        />
      </div>

      <div className="mt-5 space-y-3">
        {journey.stages.map((stage, index) => {
          const stageNumber = index + 1;
          const stageComplete = index < completedStages;
          const isActive = index === completedStages && !complete;
          const isFuture = index > completedStages;

          if (isFuture) {
            return (
              <div
                key={stage.id}
                className="rounded-2xl border border-white/8 bg-black/10 p-4 opacity-55"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/20 text-xl">
                    🔒
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-magic-soft/40">
                      שלב {stageNumber}
                    </div>
                    <div className="font-black text-magic-soft/55">שלב נסתר</div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={stage.id}
              className={`rounded-2xl border p-4 ${
                stageComplete
                  ? 'border-emerald-300/25 bg-emerald-400/8'
                  : isActive
                    ? 'border-fuchsia-300/35 bg-fuchsia-400/10 shadow-[0_0_22px_rgba(217,70,239,0.08)]'
                    : 'border-white/10 bg-black/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/20 text-2xl">
                  {stageComplete ? '✅' : stage.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-black text-fuchsia-100/50">
                    שלב {stageNumber}
                  </div>
                  <div className="font-black text-white">{stage.titleHe}</div>
                  <p className="mt-1 text-xs leading-5 text-magic-soft/65">
                    {stage.storyHe}
                  </p>

                  <div className="mt-3 space-y-2">
                    {stage.conditions.map((condition, conditionIndex) => {
                      const progress = journeyConditionProgress(condition, student);
                      return (
                        <div
                          key={`${stage.id}:${conditionIndex}`}
                          className="rounded-xl border border-white/8 bg-black/15 px-3 py-2"
                        >
                          <div className="flex items-center justify-between gap-3 text-[11px] font-bold">
                            <span className={progress.complete ? 'text-emerald-200' : 'text-magic-soft/70'}>
                              {progress.complete ? '✓ ' : ''}
                              {journeyConditionLabel(condition, student)}
                            </span>
                            {!progress.complete && (
                              <span className="shrink-0 text-fuchsia-100/55">
                                {progress.pct}%
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`mt-5 rounded-2xl border p-4 ${
        complete
          ? 'border-yellow-300/35 bg-yellow-300/10'
          : 'border-white/10 bg-black/15'
      }`}>
        <div className="text-xs font-black text-yellow-100">🎁 פרס המסע</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {journey.rewards.map((reward, index) => (
            <span
              key={`${reward.kind}:${index}`}
              className="rounded-full border border-yellow-300/20 bg-yellow-300/5 px-3 py-1.5 text-xs font-bold text-yellow-50/85"
            >
              {reward.kind === 'specialUnlock'
                ? rewardEmoji(reward.unlockKind)
                : '🎁'}{' '}
              {journeyRewardLabelForStudent(reward, student)}
            </span>
          ))}
        </div>

        {complete && !rewardClaimed && needsTheme && (
          <label className="mt-3 block text-[11px] font-bold text-magic-soft/70">
            בחירת נושא לפרס
            <select
              value={selectedTheme}
              onChange={event => onThemeChange(event.target.value as ThemeId)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-magic-bg px-3 py-2 text-sm text-white"
            >
              {availableThemes.map(theme => (
                <option key={theme.id} value={theme.id}>
                  {theme.emoji} {theme.nameHe}
                </option>
              ))}
            </select>
          </label>
        )}

        {complete && !rewardClaimed && (
          <button
            type="button"
            disabled={busy}
            onClick={onClaim}
            className="mt-4 w-full rounded-xl bg-gradient-to-l from-yellow-300 to-amber-400 px-4 py-3 text-sm font-black text-indigo-950 shadow-lg disabled:opacity-50"
          >
            {busy ? 'פותח את השער...' : `לאסוף את פרס המסע ${journey.emoji}`}
          </button>
        )}

        {rewardClaimed && (
          <div className="mt-3 rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-center text-xs font-black text-emerald-100">
            ✅ פרס המסע נאסף — זהו פרס ייחודי שלא קיים בקופסאות או בחנות.
          </div>
        )}
      </div>
    </div>
  );
}
