import { useMemo, useState } from 'react';

import {
  COMPANION_STAGE_ORDER,
  COMPANION_VISUALS,
  nextCompanionStage,
  type CompanionStage,
} from '../../data/companionWorlds';
import { COMPANION_SKILLS } from '../../data/companionSkills';
import { getCompanionEvolutionProgress } from '../../data/companionEvolution';
import {
  getCompanionTrait,
  getDominantCompanionTrait,
} from '../../data/companionTraits';
import {
  getCompanionTraitChallengeProgress,
  getLatestCompanionTraitChallenge,
} from '../../data/companionTraitChallenges';
import { THEMES, type ThemeId } from '../../data/themes';
import type { StudentState } from '../../store/useGameStore';
import CompanionTraitChallengeModal from './CompanionTraitChallengeModal';
import CompanionJournalModal from './CompanionJournalModal';

type Props = {
  students: StudentState[];
};

type SortMode = 'name' | 'stage' | 'next';

const STAGE_LABEL_HE: Record<CompanionStage, string> = {
  egg: 'ביצה',
  hatchling: 'קטנטנה',
  young: 'צעירה',
  grown: 'בוגרת',
  legendary: 'אגדית',
};

const STAGE_STYLE: Record<CompanionStage, string> = {
  egg: 'border-white/15 bg-white/5 text-magic-soft',
  hatchling: 'border-cyan-300/25 bg-cyan-500/10 text-cyan-200',
  young: 'border-violet-300/25 bg-violet-500/10 text-violet-200',
  grown: 'border-yellow-300/25 bg-yellow-500/10 text-yellow-200',
  legendary:
    'border-amber-200/60 bg-gradient-to-l from-fuchsia-500/20 to-yellow-400/20 text-yellow-200 shadow-[0_0_18px_rgba(250,204,21,0.16)]',
};

function themeNameOf(themeId: ThemeId | null): string {
  if (!themeId) return 'טרם נבחר';
  return THEMES.find(theme => theme.id === themeId)?.nameHe ?? themeId;
}

function hasPendingCeremony(student: StudentState): boolean {
  const stageIndex = COMPANION_STAGE_ORDER.indexOf(student.companion.stage);
  const celebrated = new Set(
    student.companion.celebratedStages ?? ['egg']
  );

  return COMPANION_STAGE_ORDER.some(
    (stage, index) =>
      stage !== 'egg' && index <= stageIndex && !celebrated.has(stage)
  );
}

export default function CompanionProgressBoard({ students }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('name');
  const [challengeStudentId, setChallengeStudentId] = useState<string | null>(
    null
  );
  const [journalStudentId, setJournalStudentId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const nextRows = students.map(student => {
      const companion = student.companion;
      const bond = Math.max(0, companion.bond ?? 0);
      const nextStage = nextCompanionStage(companion.stage);
      const evolutionProgress = nextStage
        ? getCompanionEvolutionProgress(
            nextStage.stage,
            bond,
            companion.behaviorMemories ?? [],
            companion.traitChallenges ?? []
          )
        : null;
      const progress = evolutionProgress?.overallPercent ?? 100;
      const remaining = nextStage
        ? Math.max(0, 100 - progress)
        : Number.POSITIVE_INFINITY;
      const visuals = companion.theme
        ? COMPANION_VISUALS[companion.theme]
        : null;
      const dominantTrait = getDominantCompanionTrait(
        companion.behaviorMemories ?? []
      );
      const latestChallenge = getLatestCompanionTraitChallenge(
        companion.traitChallenges ?? []
      );
      const challengeTrait = latestChallenge
        ? getCompanionTrait(latestChallenge.traitId)
        : null;
      const challengeProgress = latestChallenge
        ? getCompanionTraitChallengeProgress(
            latestChallenge,
            companion.behaviorMemories ?? []
          )
        : 0;

      return {
        student,
        bond,
        nextStage,
        evolutionProgress,
        remaining,
        progress,
        visuals,
        dominantTrait,
        latestChallenge,
        challengeTrait,
        challengeProgress,
        pendingCeremony: hasPendingCeremony(student),
        stageIndex: COMPANION_STAGE_ORDER.indexOf(companion.stage),
      };
    });

    nextRows.sort((first, second) => {
      if (sortMode === 'stage') {
        return (
          second.stageIndex - first.stageIndex ||
          second.bond - first.bond ||
          first.student.name.localeCompare(second.student.name, 'he')
        );
      }

      if (sortMode === 'next') {
        if (first.pendingCeremony !== second.pendingCeremony) {
          return first.pendingCeremony ? -1 : 1;
        }

        if (
          first.student.companion.unlocked !==
          second.student.companion.unlocked
        ) {
          return first.student.companion.unlocked ? -1 : 1;
        }

        return (
          first.remaining - second.remaining ||
          first.student.name.localeCompare(second.student.name, 'he')
        );
      }

      return first.student.name.localeCompare(second.student.name, 'he');
    });

    return nextRows;
  }, [sortMode, students]);

  const unlockedCount = students.filter(
    student => student.companion.unlocked
  ).length;
  const pendingCount = students.filter(hasPendingCeremony).length;
  const legendaryCount = students.filter(
    student =>
      student.companion.unlocked && student.companion.stage === 'legendary'
  ).length;
  const totalBond = students.reduce(
    (sum, student) => sum + Math.max(0, student.companion.bond ?? 0),
    0
  );
  const activeChallengeCount = students.filter(student => {
    const latest = getLatestCompanionTraitChallenge(
      student.companion.traitChallenges ?? []
    );
    return latest?.completedAt === null;
  }).length;
  const challengeStudent = challengeStudentId
    ? students.find(student => student.id === challengeStudentId) ?? null
    : null;
  const journalStudent = journalStudentId
    ? students.find(student => student.id === journalStudentId) ?? null
    : null;

  return (
    <section className="mb-4 rounded-3xl border border-emerald-300/15 bg-magic-panel/80 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-bold text-magic-accent">🐾 מעקב חיות הכיתה</h2>
          <p className="mt-1 text-xs text-magic-soft/65">
            מעקב אחר התפתחות החיות והגדרת אתגרי אופי אישיים.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(current => !current)}
          className="rounded-xl border border-emerald-300/25 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-200 transition-colors hover:bg-emerald-500/20"
          aria-expanded={isOpen}
        >
          {isOpen ? 'סגירת הלוח ▲' : 'פתיחת הלוח ▼'}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <SummaryBox label="בחרו חיה" value={`${unlockedCount}/${students.length}`} />
        <SummaryBox label="מחכות לטקס" value={pendingCount} accent={pendingCount > 0} />
        <SummaryBox label="חיות אגדיות" value={legendaryCount} legendary />
        <SummaryBox label="אתגרי אופי פעילים" value={activeChallengeCount} />
        <SummaryBox label="סה״כ נקודות קשר" value={totalBond} />
      </div>

      {isOpen && (
        <div className="mt-5 border-t border-white/10 pt-5">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="text-sm font-black text-white">
              מצב החיות של {students.length} תלמידים
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-magic-soft/70">
              מיון:
              <select
                value={sortMode}
                onChange={event => setSortMode(event.target.value as SortMode)}
                className="rounded-lg border border-white/15 bg-magic-bg/70 px-3 py-2 text-xs font-bold text-white outline-none focus:border-magic-accent/60"
              >
                <option value="name">לפי שם</option>
                <option value="stage">לפי שלב</option>
                <option value="next">הקרובים להתפתחות</option>
              </select>
            </label>
          </div>

          {rows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-magic-bg/30 p-6 text-center text-sm text-magic-soft/60">
              עדיין אין תלמידים בכיתה.
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map(row => {
                const { student } = row;
                const { companion } = student;

                if (!companion.unlocked) {
                  return (
                    <article
                      key={student.id}
                      className="rounded-2xl border border-white/10 bg-magic-bg/30 p-4 opacity-75"
                    >
                      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                        <div>
                          <div className="font-black text-white">{student.name}</div>
                          <div className="mt-1 text-xs text-magic-soft/60">
                            {student.level < 5
                              ? `החיה תיפתח ברמה 5 · כרגע ברמה ${student.level}`
                              : 'אפשר כבר לבחור עולם ולקבל ביצה'}
                          </div>
                          {row.dominantTrait && (
                            <div className="mt-2 text-[11px] font-bold text-violet-200">
                              {row.dominantTrait.emoji} האופי שכבר נבנה: {' '}
                              {row.dominantTrait.nameHe}
                            </div>
                          )}
                          {row.nextStage && row.evolutionProgress && (
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] sm:grid-cols-4">
                        <TeacherEvolutionRequirement
                          label="קשר"
                          value={`${row.evolutionProgress.bond}/${row.evolutionProgress.bondRequired}`}
                          ready={row.evolutionProgress.bondReady}
                        />
                        <TeacherEvolutionRequirement
                          label="ימי התנהגות"
                          value={`${row.evolutionProgress.behaviorDays}/${row.evolutionProgress.behaviorDaysRequired}`}
                          ready={row.evolutionProgress.behaviorDaysReady}
                        />
                        <TeacherEvolutionRequirement
                          label="תכונות"
                          value={`${row.evolutionProgress.distinctTraits}/${row.evolutionProgress.distinctTraitsRequired}`}
                          ready={row.evolutionProgress.distinctTraitsReady}
                        />
                        <TeacherEvolutionRequirement
                          label="אתגרים"
                          value={
                            row.evolutionProgress.completedChallengesRequired > 0
                              ? `${row.evolutionProgress.completedChallenges}/${row.evolutionProgress.completedChallengesRequired}`
                              : 'לא נדרש'
                          }
                          ready={row.evolutionProgress.completedChallengesReady}
                        />
                      </div>
                    )}

                    {row.latestChallenge && row.challengeTrait && (
                            <div className="mt-1 text-[11px] font-bold text-cyan-200">
                              {row.challengeTrait.emoji} אתגר{' '}
                              {row.challengeTrait.nameHe}:{' '}
                              {row.latestChallenge.completedAt
                                ? 'הושלם'
                                : `${row.challengeProgress}/${row.latestChallenge.targetDays} ימים`}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 sm:items-end">
                          <div className="self-start rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-magic-soft/60 sm:self-auto">
                            🔒 טרם נפתחה
                          </div>
                          <button
                            type="button"
                            onClick={() => setChallengeStudentId(student.id)}
                            className="rounded-xl border border-cyan-300/25 bg-cyan-500/10 px-3 py-2 text-[11px] font-black text-cyan-100 hover:bg-cyan-500/20"
                          >
                            {row.latestChallenge?.completedAt === null
                              ? 'צפייה באתגר 🧭'
                              : 'הגדרת אתגר אופי 🧭'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setJournalStudentId(student.id)}
                            className="rounded-xl border border-amber-300/20 bg-amber-500/10 px-3 py-2 text-[11px] font-black text-amber-100 hover:bg-amber-500/20"
                          >
                            יומן החיה ({(companion.journalEntries ?? []).length}) 📖
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                }

                const companionName =
                  companion.name?.trim() || row.visuals?.nameHe || 'ללא שם';

                return (
                  <article
                    key={student.id}
                    className={`rounded-2xl border p-4 ${
                      row.pendingCeremony
                        ? 'border-fuchsia-300/35 bg-fuchsia-500/10'
                        : companion.stage === 'legendary'
                          ? 'border-yellow-300/30 bg-yellow-500/10'
                          : 'border-white/10 bg-magic-bg/35'
                    }`}
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 text-2xl shadow-inner"
                          style={{
                            backgroundColor: `${row.visuals?.eggColor ?? '#6d5a99'}35`,
                          }}
                        >
                          {row.visuals?.motif ?? '🐾'}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-black text-white">
                            {student.name}
                          </div>
                          <div className="mt-1 truncate text-xs text-magic-soft/65">
                            {companionName} · עולם {themeNameOf(companion.theme)}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setJournalStudentId(student.id)}
                          className="rounded-full border border-amber-300/20 bg-amber-500/10 px-3 py-1 text-[11px] font-black text-amber-100 hover:bg-amber-500/20"
                        >
                          יומן ({(companion.journalEntries ?? []).length}) 📖
                        </button>
                        <button
                          type="button"
                          onClick={() => setChallengeStudentId(student.id)}
                          className="rounded-full border border-cyan-300/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-black text-cyan-100 hover:bg-cyan-500/20"
                        >
                          {row.latestChallenge?.completedAt === null
                            ? 'האתגר הפעיל 🧭'
                            : 'אתגר אופי חדש 🧭'}
                        </button>
                        {row.dominantTrait && (
                          <span className="rounded-full border border-violet-300/25 bg-violet-500/10 px-3 py-1 text-[11px] font-black text-violet-100">
                            {row.dominantTrait.emoji} אופי: {row.dominantTrait.nameHe}
                          </span>
                        )}
                        {row.pendingCeremony && (
                          <span className="rounded-full border border-fuchsia-300/35 bg-fuchsia-500/15 px-3 py-1 text-[11px] font-black text-fuchsia-200">
                            ✨ מחכה לטקס
                          </span>
                        )}
                        <span
                          className={`rounded-full border px-3 py-1 text-[11px] font-black ${STAGE_STYLE[companion.stage]}`}
                        >
                          {companion.stage === 'legendary' && '🌟 '}
                          {STAGE_LABEL_HE[companion.stage]}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <MiniStat label="נקודות קשר" value={row.bond} />
                      <MiniStat
                        label="נקודות חיה זמינות"
                        value={`${companion.petPoints ?? 0} 🐾`}
                      />
                      <MiniStat
                        label="כישורים פתוחים"
                        value={`${(companion.unlockedSkills ?? []).length}/${COMPANION_SKILLS.length}`}
                      />
                      <MiniStat
                        label="היעד הבא"
                        value={
                          row.nextStage && row.evolutionProgress
                            ? `${row.progress}% מוכן`
                            : 'הושלם 🌟'
                        }
                      />
                    </div>

                    {row.nextStage && row.evolutionProgress && (
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] sm:grid-cols-4">
                        <TeacherEvolutionRequirement
                          label="קשר"
                          value={`${row.evolutionProgress.bond}/${row.evolutionProgress.bondRequired}`}
                          ready={row.evolutionProgress.bondReady}
                        />
                        <TeacherEvolutionRequirement
                          label="ימי התנהגות"
                          value={`${row.evolutionProgress.behaviorDays}/${row.evolutionProgress.behaviorDaysRequired}`}
                          ready={row.evolutionProgress.behaviorDaysReady}
                        />
                        <TeacherEvolutionRequirement
                          label="תכונות"
                          value={`${row.evolutionProgress.distinctTraits}/${row.evolutionProgress.distinctTraitsRequired}`}
                          ready={row.evolutionProgress.distinctTraitsReady}
                        />
                        <TeacherEvolutionRequirement
                          label="אתגרים"
                          value={
                            row.evolutionProgress.completedChallengesRequired > 0
                              ? `${row.evolutionProgress.completedChallenges}/${row.evolutionProgress.completedChallengesRequired}`
                              : 'לא נדרש'
                          }
                          ready={row.evolutionProgress.completedChallengesReady}
                        />
                      </div>
                    )}

                    {row.latestChallenge && row.challengeTrait && (
                      <div
                        className="mt-3 rounded-xl border border-cyan-300/15 bg-cyan-500/5 px-3 py-2 text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-black text-cyan-100">
                            {row.challengeTrait.emoji} אתגר{' '}
                            {row.challengeTrait.nameHe}
                          </span>
                          <span className="font-bold text-magic-soft/60">
                            {row.latestChallenge.completedAt
                              ? 'הושלם 🏅'
                              : `${row.challengeProgress}/${row.latestChallenge.targetDays} ימים`}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="mt-3">
                      <div className="mb-1 flex justify-between gap-3 text-[10px] font-bold text-magic-soft/55">
                        <span>
                          {row.nextStage
                            ? row.nextStage.labelHe
                            : 'כל שלבי ההתפתחות הושלמו'}
                        </span>
                        <span>
                          {row.nextStage
                            ? `${row.progress}% מהדרך`
                            : 'אגדי 👑'}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-black/30">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            companion.stage === 'legendary'
                              ? 'bg-gradient-to-l from-yellow-300 to-fuchsia-400'
                              : 'bg-gradient-to-l from-emerald-400 to-cyan-400'
                          }`}
                          style={{ width: `${row.progress}%` }}
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      <CompanionTraitChallengeModal
        open={challengeStudentId !== null}
        onClose={() => setChallengeStudentId(null)}
        student={challengeStudent}
      />

      <CompanionJournalModal
        open={journalStudentId !== null}
        onClose={() => setJournalStudentId(null)}
        student={journalStudent}
      />
    </section>
  );
}

function TeacherEvolutionRequirement({
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
      className={`rounded-xl border px-2 py-2 text-center ${
        ready
          ? 'border-emerald-300/20 bg-emerald-500/10 text-emerald-100'
          : 'border-white/10 bg-black/15 text-magic-soft/70'
      }`}
    >
      <div className="font-bold opacity-70">{label}</div>
      <div className="mt-0.5 font-black">
        {ready ? '✓ ' : ''}
        {value}
      </div>
    </div>
  );
}


function SummaryBox({
  label,
  value,
  accent = false,
  legendary = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  legendary?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-3 text-center ${
        legendary
          ? 'border-yellow-300/25 bg-yellow-500/10'
          : accent
            ? 'border-fuchsia-300/30 bg-fuchsia-500/10'
            : 'border-white/10 bg-magic-bg/35'
      }`}
    >
      <div
        className={`text-lg font-black ${
          legendary
            ? 'text-yellow-200'
            : accent
              ? 'text-fuchsia-200'
              : 'text-white'
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-[10px] font-bold text-magic-soft/55">{label}</div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  wideOnMobile = false,
}: {
  label: string;
  value: string | number;
  wideOnMobile?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-black/15 p-2 text-center ${
        wideOnMobile ? 'col-span-2 sm:col-span-1' : ''
      }`}
    >
      <div className="text-[10px] text-magic-soft/50">{label}</div>
      <div className="mt-1 text-xs font-black text-white">{value}</div>
    </div>
  );
}
