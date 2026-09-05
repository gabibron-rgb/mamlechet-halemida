import { useEffect, useMemo, useState } from 'react';

import {
  ACHIEVEMENTS,
  ACHIEVEMENT_CATEGORY_LABELS,
  ACHIEVEMENT_DIFFICULTY_LABELS,
  achievementHasMissingDurableReward,
  achievementHasReward,
  achievementNeedsThemeChoice,
  achievementProgress,
  achievementRewardLabel,
  type AchievementDefinition,
  type AchievementReward,
} from '../../data/achievements';
import { THEMES, type ThemeId } from '../../data/themes';
import { studentTitleDisplayLabel } from '../../data/studentTitles';
import { useGameStore, type StudentState } from '../../store/useGameStore';
import SpecialJourneysPanel from './SpecialJourneysPanel';
import StudentTitlesPanel from './StudentTitlesPanel';
import { getExclusiveAchievementItem } from '../../data/exclusiveAchievementRewards';
import { playGameSound } from '../../lib/gameSounds';

type Props = {
  student: StudentState;
};

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(timestamp));
}

function rewardLabelForStudent(
  reward: AchievementReward,
  student: StudentState
): string {
  if (reward.kind === 'specialUnlock' && reward.unlockKind === 'title') {
    return `התואר “${studentTitleDisplayLabel(
      reward.unlockId,
      reward.labelHe,
      student.gender
    )}”`;
  }

  return achievementRewardLabel(reward);
}

function difficultyClass(definition: AchievementDefinition): string {
  if (definition.difficulty === 'legendary') {
    return 'border-yellow-300/50 bg-yellow-300/10 text-yellow-200';
  }
  if (definition.difficulty === 'hard') {
    return 'border-purple-400/40 bg-purple-400/10 text-purple-200';
  }
  if (definition.difficulty === 'medium') {
    return 'border-blue-400/35 bg-blue-400/10 text-blue-200';
  }
  return 'border-white/15 bg-white/5 text-magic-soft/70';
}

export default function AchievementsPanel({ student }: Props) {
  const reconcileAchievements = useGameStore(s => s.reconcileAchievements);
  const claimAchievementReward = useGameStore(s => s.claimAchievementReward);

  const fallbackTheme =
    student.unlockedThemes.find(themeId => themeId !== 'generic') ?? 'generic';
  const [selectedThemes, setSelectedThemes] = useState<Record<string, ThemeId>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const achievementSignature = useMemo(
    () =>
      [
        student.level,
        student.inventory
          .map(entry =>
            `${entry.itemId}:${entry.kind ?? 'item'}:${String(entry.placedZone ?? '')}:${String(entry.roomX ?? '')}:${String(entry.roomY ?? '')}`
          )
          .join('|'),
        student.unlockedThemes.join('|'),
        student.companion.stage,
        (student.missions ?? [])
          .map(mission => `${mission.id}:${mission.completedAt ?? ''}:${mission.cancelledAt ?? ''}`)
          .join('|'),
        (student.classGoals ?? [])
          .map(goal =>
            `${goal.id}:${goal.completedAt ?? ''}:${goal.cancelledAt ?? ''}:${goal.contributionIds.join(',')}`
          )
          .join('|'),
        student.trophies.map(trophy => trophy.trophyTheme).join('|'),
      ].join('::'),
    [student]
  );

  useEffect(() => {
    void reconcileAchievements(student.id);
  }, [achievementSignature, reconcileAchievements, student.id]);

  const recordById = useMemo(
    () =>
      new Map(
        (student.achievementRecords ?? []).map(record => [
          record.achievementId,
          record,
        ])
      ),
    [student.achievementRecords]
  );

  const normalAchievements = ACHIEVEMENTS.filter(achievement => !achievement.hidden);
  const secretAchievements = ACHIEVEMENTS.filter(achievement => achievement.hidden);
  const achievedCount = ACHIEVEMENTS.filter(achievement =>
    recordById.has(achievement.id)
  ).length;
  const claimableCount = ACHIEVEMENTS.filter(achievement => {
    const record = recordById.get(achievement.id);
    return (
      record &&
      achievementHasReward(achievement) &&
      (record.rewardClaimedAt === null ||
        achievementHasMissingDurableReward(achievement, student))
    );
  }).length;

  const availableThemes = THEMES.filter(
    theme => theme.id === 'generic' || student.unlockedThemes.includes(theme.id)
  );

  async function handleClaim(definition: AchievementDefinition) {
    const selectedTheme = achievementNeedsThemeChoice(definition)
      ? selectedThemes[definition.id] ?? fallbackTheme
      : undefined;

    setBusyId(definition.id);
    setMessage(null);
    const ok = await claimAchievementReward(
      student.id,
      definition.id,
      selectedTheme
    );
    setBusyId(null);

    if (!ok) {
      setMessage('לא הצלחתי לאסוף את הפרס. כדאי לרענן ולנסות שוב.');
      return;
    }

    playGameSound('achievement');

    const rewardText = (definition.rewards ?? [])
      .map(reward => rewardLabelForStudent(reward, student))
      .join(' + ');
    setMessage(`🎉 הפרס נאסף: ${rewardText}`);
  }

  return (
    <section className="mt-8 border-t border-white/10 pt-8 text-right">
      <StudentTitlesPanel student={student} />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 text-4xl">🏅</div>
          <h2 className="text-2xl font-black text-magic-accent">
            אבני דרך והישגים
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-magic-soft/70">
            הממלכה זוכרת דברים מיוחדים שעשית לאורך הדרך. רוב ההישגים הם
            מזכרת למסע שלך, והקשים במיוחד יכולים לפתוח פרסים שלא מקבלים על
            הישגים רגילים.
          </p>
        </div>

        <div className="flex gap-2 text-center">
          <div className="rounded-2xl bg-magic-bg/45 px-4 py-3">
            <div className="text-xl font-black text-magic-accent">
              {achievedCount}/{ACHIEVEMENTS.length}
            </div>
            <div className="text-[10px] text-magic-soft/55">הושגו</div>
          </div>
          {claimableCount > 0 && (
            <div className="rounded-2xl border border-yellow-300/30 bg-yellow-300/10 px-4 py-3">
              <div className="text-xl font-black text-yellow-200">🎁 {claimableCount}</div>
              <div className="text-[10px] text-yellow-100/70">פרסים מחכים</div>
            </div>
          )}
        </div>
      </div>

      {message && (
        <div className="mb-4 rounded-2xl border border-magic-accent/25 bg-magic-accent/10 p-3 text-center text-sm font-bold text-white">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {normalAchievements.map(definition => (
          <AchievementCard
            key={definition.id}
            definition={definition}
            student={student}
            record={recordById.get(definition.id) ?? null}
            selectedTheme={selectedThemes[definition.id] ?? fallbackTheme}
            availableThemes={availableThemes}
            busy={busyId === definition.id}
            onThemeChange={themeId =>
              setSelectedThemes(current => ({
                ...current,
                [definition.id]: themeId,
              }))
            }
            onClaim={() => void handleClaim(definition)}
          />
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-purple-400/20 bg-purple-950/20 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-black text-purple-100">🕯️ הישגים סודיים</div>
            <div className="mt-1 text-xs text-purple-100/55">
              התנאים לא נחשפים מראש. אם גילית אחד — כנראה עשית משהו ששווה לזכור.
            </div>
          </div>
          <div className="text-xs font-bold text-purple-200/70">
            {secretAchievements.filter(achievement => recordById.has(achievement.id)).length}/
            {secretAchievements.length}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {secretAchievements.map(definition => {
            const record = recordById.get(definition.id) ?? null;
            return (
              <AchievementCard
                key={definition.id}
                definition={definition}
                student={student}
                record={record}
                selectedTheme={selectedThemes[definition.id] ?? fallbackTheme}
                availableThemes={availableThemes}
                busy={busyId === definition.id}
                hiddenUntilAchieved={!record}
                onThemeChange={themeId =>
                  setSelectedThemes(current => ({
                    ...current,
                    [definition.id]: themeId,
                  }))
                }
                onClaim={() => void handleClaim(definition)}
              />
            );
          })}
        </div>
      </div>

      {(student.specialUnlocks ?? []).some(unlock => unlock.kind !== 'title') && (
        <div className="mt-6 rounded-3xl border border-yellow-300/20 bg-yellow-300/5 p-5">
          <div className="mb-3 font-black text-yellow-100">✨ פרסים מיוחדים שכבר פתחת</div>
          <div className="flex flex-wrap gap-2">
            {(student.specialUnlocks ?? [])
              .filter(unlock => unlock.kind !== 'title')
              .map(unlock => (
                <div
                  key={`${unlock.kind}:${unlock.unlockId}`}
                  className="rounded-xl border border-yellow-300/20 bg-black/15 px-3 py-2 text-xs font-bold text-yellow-50"
                >
                  ✨ {unlock.labelHe}
                </div>
              ))}
          </div>
        </div>
      )}

      <SpecialJourneysPanel student={student} />
    </section>
  );
}

function AchievementCard({
  definition,
  student,
  record,
  selectedTheme,
  availableThemes,
  busy,
  hiddenUntilAchieved = false,
  onThemeChange,
  onClaim,
}: {
  definition: AchievementDefinition;
  student: StudentState;
  record: StudentState['achievementRecords'][number] | null;
  selectedTheme: ThemeId;
  availableThemes: typeof THEMES;
  busy: boolean;
  hiddenUntilAchieved?: boolean;
  onThemeChange: (themeId: ThemeId) => void;
  onClaim: () => void;
}) {
  if (hiddenUntilAchieved) {
    return (
      <div className="rounded-2xl border border-purple-400/15 bg-black/15 p-4 text-center">
        <div className="text-4xl text-purple-100/30">?</div>
        <div className="mt-2 font-black text-purple-100/55">???</div>
        <div className="mt-1 text-xs text-purple-100/35">הישג סודי שעדיין לא התגלה</div>
      </div>
    );
  }

  const progress = achievementProgress(definition, student);
  const achieved = record !== null;
  const hasReward = achievementHasReward(definition);
  const hasMissingDurableReward = achievementHasMissingDurableReward(
    definition,
    student
  );
  const rewardClaimed =
    record?.rewardClaimedAt != null && !hasMissingDurableReward;
  const needsTheme =
    achievementNeedsThemeChoice(definition) && record?.rewardClaimedAt == null;
  const hasExclusiveReward = (definition.rewards ?? []).some(reward =>
    reward.kind === 'inventoryItem'
      ? getExclusiveAchievementItem(reward.itemId) !== null
      : reward.kind === 'specialUnlock' && reward.unlockKind === 'room'
  );

  return (
    <div
      className={`rounded-2xl border p-4 ${
        achieved
          ? 'border-magic-accent/30 bg-magic-accent/8'
          : 'border-white/10 bg-magic-bg/30'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black/20 text-3xl">
          {achieved ? definition.emoji : '🔒'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-black text-white">{definition.titleHe}</div>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${difficultyClass(definition)}`}
            >
              {ACHIEVEMENT_DIFFICULTY_LABELS[definition.difficulty]}
            </span>
          </div>
          <div className="mt-1 text-[11px] font-bold text-magic-accent/65">
            {ACHIEVEMENT_CATEGORY_LABELS[definition.category]}
          </div>
          <p className="mt-2 text-xs leading-5 text-magic-soft/65">
            {definition.descriptionHe}
          </p>
        </div>
      </div>

      {!achieved && (
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-[10px] font-bold text-magic-soft/50">
            <span>התקדמות</span>
            <span dir="ltr">
              {Math.min(progress.current, progress.target)} / {progress.target}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-black/25">
            <div
              className="h-full rounded-full bg-gradient-to-l from-magic-accent to-purple-500 transition-all"
              style={{ width: `${progress.pct}%` }}
            />
          </div>
        </div>
      )}

      {achieved && record && (
        <div className="mt-3 text-xs font-bold text-emerald-200/80">
          ✅ הושג ב־{formatDate(record.achievedAt)}
        </div>
      )}

      {hasReward && (
        <div className="mt-4 rounded-xl border border-yellow-300/20 bg-yellow-300/5 p-3">
          <div className="text-xs font-black text-yellow-100">🎁 פרס הישג</div>
          <div className="mt-1 text-xs text-yellow-50/75">
            {(definition.rewards ?? [])
              .map(reward => rewardLabelForStudent(reward, student))
              .join(' + ')}
          </div>
          {hasExclusiveReward && (
            <div className="mt-2 rounded-lg border border-yellow-200/15 bg-black/15 px-2 py-1.5 text-[10px] font-black text-yellow-100/80">
              🔒 בלעדי להישג — אי אפשר להשיג בקופסאות או בחנות
            </div>
          )}

          {achieved && !rewardClaimed && needsTheme && (
            <label className="mt-3 block text-[11px] font-bold text-magic-soft/70">
              לאיזה נושא לקבל את הקופסה?
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

          {achieved && !rewardClaimed && (
            <button
              type="button"
              disabled={busy}
              onClick={onClaim}
              className="mt-3 w-full rounded-xl bg-yellow-300 px-3 py-2 text-sm font-black text-indigo-950 disabled:opacity-50"
            >
              {busy ? 'אוסף...' : 'לאסוף את הפרס 🎁'}
            </button>
          )}

          {rewardClaimed && (
            <div className="mt-2 text-xs font-black text-yellow-100/65">
              ✅ הפרס נאסף
            </div>
          )}
        </div>
      )}
    </div>
  );
}
