import { useState } from 'react';
import { BOX_TIERS } from '../../data/boxes';
import {
  classGoalMetricDefinition,
  classGoalProgress,
  type StudentClassGoal,
} from '../../data/classGoals';
import {
  CLASS_KINGDOM_MILESTONES,
  CLASS_KINGDOM_REWARDS,
  activeClassGoal,
  classKingdomLevel,
  classKingdomLevelProgress,
  classKingdomStars,
  completedClassGoals,
  nextClassKingdomLevel,
  nextClassKingdomMilestone,
  nextClassKingdomReward,
  type ClassKingdomReward,
} from '../../data/classKingdom';
import { THEMES, type ThemeId } from '../../data/themes';
import { useGameStore, type StudentState } from '../../store/useGameStore';

type Props = {
  student: StudentState;
};

export default function ClassKingdomPanel({ student }: Props) {
  const goals = student.classGoals ?? [];
  const completed = completedClassGoals(goals);
  const active = activeClassGoal(goals);
  const stars = classKingdomStars(goals);
  const level = classKingdomLevel(stars);
  const nextLevel = nextClassKingdomLevel(stars);
  const levelProgress = classKingdomLevelProgress(stars);
  const nextMilestone = nextClassKingdomMilestone(stars);
  const nextReward = nextClassKingdomReward(stars);
  const claimReward = useGameStore(state => state.claimClassKingdomReward);

  const [selectedThemes, setSelectedThemes] = useState<Record<number, ThemeId>>({});
  const [busyLevel, setBusyLevel] = useState<number | null>(null);
  const [rewardMessage, setRewardMessage] = useState<string | null>(null);

  const unlockedThemeDefs = THEMES.filter(
    theme => theme.id === 'generic' || student.unlockedThemes.includes(theme.id)
  );
  const fallbackTheme = unlockedThemeDefs[0]?.id ?? 'generic';
  const claimedLevels = student.claimedClassKingdomRewards ?? [];

  async function handleClaim(reward: ClassKingdomReward) {
    if (busyLevel !== null) return;

    const selectedTheme =
      reward.kind === 'box'
        ? selectedThemes[reward.level] ?? fallbackTheme
        : undefined;

    setBusyLevel(reward.level);
    setRewardMessage(null);

    const allThemesOpen = THEMES.filter(theme => theme.id !== 'generic').every(
      theme => student.unlockedThemes.includes(theme.id)
    );

    const ok = await claimReward(student.id, reward.level, selectedTheme);
    setBusyLevel(null);

    if (!ok) {
      setRewardMessage('לא הצלחתי לאסוף את הפרס. נסו לרענן ולנסות שוב.');
      return;
    }

    if (reward.kind === 'themeUnlock') {
      setRewardMessage(
        allThemesOpen
          ? '🎁 כל הנושאים כבר פתוחים, אז קיבלת קופסת כסף במקום!'
          : '🗝️ נפתח לך פרס לבחירת נושא חדש! אפשר לבחור אותו מההתראה בחלק העליון של המסך.'
      );
      return;
    }

    const boxName = reward.boxTier
      ? BOX_TIERS[reward.boxTier].nameHe
      : 'קופסה';
    setRewardMessage(`🎁 ${boxName} נוספה למלאי שלך!`);
  }

  return (
    <div className="text-right">
      <section className="overflow-hidden rounded-3xl border border-yellow-300/20 bg-gradient-to-br from-indigo-950/80 via-magic-bg/55 to-purple-950/70 p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-black text-yellow-100/60">🏰 ההתקדמות המשותפת של הכיתה</div>
            <h2 className="mt-1 text-3xl font-black text-magic-accent">הממלכה הכיתתית</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-magic-soft/75">
              כל יעד כיתתי שהכיתה משלימה מוסיף ⭐ כוכב ממלכה אחד. הכוכבים שייכים לכולם יחד — ואין כאן דירוג אישי.
            </p>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-3">
            <SummaryBadge icon="⭐" value={stars} label="כוכבי ממלכה" />
            <SummaryBadge icon={level.emoji} value={level.level} label="רמת ממלכה" />
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-black/15 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm font-black text-white">
                {level.emoji} רמה {level.level}: {level.titleHe}
              </div>
              <div className="mt-1 text-xs text-magic-soft/65">{level.descriptionHe}</div>
            </div>

            {nextLevel ? (
              <div className="text-xs font-bold text-yellow-100/70">
                עוד {Math.max(0, nextLevel.minStars - stars)} כוכבים לרמה {nextLevel.level}
              </div>
            ) : (
              <div className="text-xs font-black text-yellow-200">✨ הגעתם לרמת הממלכה הגבוהה ביותר כרגע</div>
            )}
          </div>

          <div className="mt-4 h-4 overflow-hidden rounded-full bg-magic-bg/70">
            <div
              className="h-full bg-gradient-to-l from-yellow-300 via-magic-accent to-magic-soft transition-all duration-500"
              style={{ width: `${levelProgress.pct}%` }}
            />
          </div>

          {nextReward && (
            <div className="mt-4 rounded-2xl border border-yellow-300/15 bg-yellow-400/8 px-4 py-3">
              <div className="text-xs font-black text-yellow-100/80">
                🎁 ברמה {nextReward.level} ייפתח: {nextReward.titleHe}
              </div>
              <div className="mt-1 text-[11px] text-magic-soft/55">
                {nextReward.descriptionHe}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mt-5 rounded-3xl border border-yellow-300/15 bg-magic-bg/35 p-5">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="font-black text-white">🎁 פרסי רמות הממלכה</h3>
            <p className="mt-1 text-xs text-magic-soft/55">
              אלה פרסים אישיים שנפתחים בזכות ההצלחה המשותפת של כל הכיתה. כל פרס ניתן לאיסוף פעם אחת.
            </p>
          </div>
          <div className="text-xs font-black text-yellow-200">
            {claimedLevels.length}/{CLASS_KINGDOM_REWARDS.length} נאספו
          </div>
        </div>

        {rewardMessage && (
          <div className="mb-4 rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-100">
            {rewardMessage}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {CLASS_KINGDOM_REWARDS.map(reward => {
            const unlocked = stars >= reward.minStars;
            const claimed = claimedLevels.includes(reward.level);
            const selectedTheme = selectedThemes[reward.level] ?? fallbackTheme;
            const boxName = reward.boxTier
              ? BOX_TIERS[reward.boxTier].nameHe
              : null;

            return (
              <div
                key={reward.level}
                className={`rounded-2xl border p-4 transition-colors ${
                  claimed
                    ? 'border-emerald-300/20 bg-emerald-500/8'
                    : unlocked
                      ? 'border-yellow-300/25 bg-yellow-400/10'
                      : 'border-white/8 bg-black/10 opacity-55'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{claimed ? '✅' : unlocked ? reward.emoji : '🔒'}</div>
                    <div>
                      <div className="text-[10px] font-black text-yellow-100/55">
                        רמת ממלכה {reward.level} · {reward.minStars} ⭐
                      </div>
                      <div className="mt-1 font-black text-white">{reward.titleHe}</div>
                    </div>
                  </div>
                  {claimed && (
                    <div className="shrink-0 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-black text-emerald-200">
                      נאסף
                    </div>
                  )}
                </div>

                <p className="mt-3 text-xs leading-5 text-magic-soft/65">
                  {reward.descriptionHe}
                </p>

                {!unlocked && (
                  <div className="mt-3 text-xs font-black text-magic-soft/45">
                    חסרים {Math.max(0, reward.minStars - stars)} כוכבים
                  </div>
                )}

                {unlocked && !claimed && reward.kind === 'box' && boxName && (
                  <div className="mt-4">
                    <label className="mb-1 block text-[11px] font-bold text-magic-soft/60">
                      בחרו נושא ל{boxName}
                    </label>
                    <select
                      value={selectedTheme}
                      onChange={event =>
                        setSelectedThemes(current => ({
                          ...current,
                          [reward.level]: event.target.value as ThemeId,
                        }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-magic-bg/80 px-3 py-2 text-sm font-bold text-white outline-none focus:border-magic-accent"
                    >
                      {unlockedThemeDefs.map(theme => (
                        <option key={theme.id} value={theme.id}>
                          {theme.emoji} {theme.nameHe}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {unlocked && !claimed && (
                  <button
                    type="button"
                    disabled={busyLevel !== null}
                    onClick={() => void handleClaim(reward)}
                    className="mt-4 w-full rounded-xl bg-magic-accent px-4 py-2.5 text-sm font-black text-magic-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busyLevel === reward.level
                      ? 'שומר...'
                      : reward.kind === 'themeUnlock'
                        ? '🗝️ קבלו את מפתח הנושא'
                        : `🎁 קבלו ${boxName ?? 'את הפרס'}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-3xl border border-cyan-300/15 bg-magic-bg/35 p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-white">🎯 היעד המשותף עכשיו</h3>
              <p className="mt-0.5 text-xs text-magic-soft/55">זה הדבר הבא שמוסיף כוכב לממלכה.</p>
            </div>
          </div>

          {active ? <ActiveGoal goal={active} /> : (
            <div className="rounded-2xl border border-white/10 bg-black/10 p-5 text-center text-sm text-magic-soft/60">
              אין כרגע יעד כיתתי פעיל. כשהמורה יפתח יעד חדש, הוא יופיע כאן.
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-fuchsia-300/15 bg-magic-bg/35 p-5">
          <h3 className="font-black text-white">🔓 אבן הדרך הבאה</h3>
          {nextMilestone ? (
            <div className="mt-3 rounded-2xl border border-fuchsia-300/15 bg-fuchsia-500/8 p-4">
              <div className="flex items-start gap-3">
                <div className="text-4xl">{nextMilestone.emoji}</div>
                <div>
                  <div className="font-black text-fuchsia-100">{nextMilestone.titleHe}</div>
                  <div className="mt-1 text-xs leading-5 text-magic-soft/65">{nextMilestone.descriptionHe}</div>
                  <div className="mt-3 text-xs font-black text-fuchsia-200">
                    נפתח ב־{nextMilestone.stars} כוכבים · חסרים {Math.max(0, nextMilestone.stars - stars)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-yellow-300/15 bg-yellow-400/8 p-4 text-sm font-bold text-yellow-100/80">
              👑 פתחתם את כל חותמות הממלכה שקיימות כרגע.
            </div>
          )}
        </section>
      </div>

      <section className="mt-5 rounded-3xl border border-white/10 bg-magic-bg/35 p-5">
        <div className="mb-4">
          <h3 className="font-black text-white">🏅 חותמות הממלכה</h3>
          <p className="mt-1 text-xs text-magic-soft/55">אבני דרך סמליות שנפתחות רק מהצלחות משותפות של הכיתה.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CLASS_KINGDOM_MILESTONES.map(milestone => {
            const unlocked = stars >= milestone.stars;
            return (
              <div
                key={milestone.stars}
                className={`rounded-2xl border p-4 text-center transition-colors ${
                  unlocked
                    ? 'border-yellow-300/20 bg-yellow-400/10'
                    : 'border-white/8 bg-black/10 opacity-45'
                }`}
              >
                <div className="text-3xl">{unlocked ? milestone.emoji : '🔒'}</div>
                <div className="mt-2 text-sm font-black text-white">{milestone.titleHe}</div>
                <div className="mt-1 text-[11px] text-magic-soft/55">{milestone.stars} ⭐</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-5 rounded-3xl border border-emerald-300/15 bg-magic-bg/35 p-5">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="font-black text-white">📖 ספר ההישגים הכיתתי</h3>
            <p className="mt-1 text-xs text-magic-soft/55">כל יעד שהושלם נשאר כאן כחלק מההיסטוריה של הכיתה.</p>
          </div>
          <div className="text-xs font-black text-emerald-200">{completed.length} הישגים</div>
        </div>

        {completed.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/10 p-5 text-center text-sm text-magic-soft/60">
            ספר ההישגים עדיין מחכה לפרק הראשון שלו. ⭐
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {completed.map(goal => {
              const metric = classGoalMetricDefinition(goal.metric);
              return (
                <div
                  key={goal.id}
                  className="flex flex-col gap-2 rounded-2xl border border-emerald-300/10 bg-emerald-500/8 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="font-bold text-white">⭐ {goal.title}</div>
                    <div className="mt-1 text-xs text-magic-soft/55">
                      {metric.emoji} {metric.labelHe} · {goal.target} צעדים
                    </div>
                  </div>
                  <div className="text-xs font-black text-emerald-200">
                    {goal.completedAt ? formatDate(goal.completedAt) : 'הושלם'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function ActiveGoal({ goal }: { goal: StudentClassGoal }) {
  const progress = classGoalProgress(goal);
  const pct = Math.min(100, Math.round((progress / goal.target) * 100));
  const metric = classGoalMetricDefinition(goal.metric);

  return (
    <div className="rounded-2xl border border-cyan-300/15 bg-cyan-500/8 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-black text-white">{goal.title}</div>
          {goal.description && (
            <div className="mt-1 text-xs leading-5 text-magic-soft/65">{goal.description}</div>
          )}
          <div className="mt-2 text-xs font-bold text-cyan-100/70">
            {metric.emoji} {metric.labelHe}
          </div>
        </div>
        <div className="shrink-0 text-center">
          <div className="text-2xl font-black text-white">{progress}/{goal.target}</div>
          <div className="text-[10px] text-magic-soft/45">צעדים</div>
        </div>
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-magic-bg/70">
        <div
          className="h-full bg-gradient-to-l from-magic-accent to-magic-soft transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 text-xs font-black text-cyan-100/75">
        עוד {Math.max(0, goal.target - progress)} צעדים לכוכב הממלכה הבא ⭐
      </div>
    </div>
  );
}

function SummaryBadge({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div className="min-w-28 rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-center">
      <div className="text-2xl">{icon}</div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-[10px] font-bold text-magic-soft/55">{label}</div>
    </div>
  );
}

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(new Date(timestamp));
}
