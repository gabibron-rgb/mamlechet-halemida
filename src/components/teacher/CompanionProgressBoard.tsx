import { useMemo, useState } from 'react';

import {
  COMPANION_STAGE_ORDER,
  COMPANION_VISUALS,
  nextCompanionStage,
  type CompanionStage,
} from '../../data/companionWorlds';
import { COMPANION_SKILLS } from '../../data/companionSkills';
import { THEMES, type ThemeId } from '../../data/themes';
import type { StudentState } from '../../store/useGameStore';

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

  const rows = useMemo(() => {
    const nextRows = students.map(student => {
      const companion = student.companion;
      const bond = Math.max(0, companion.bond ?? 0);
      const nextStage = nextCompanionStage(companion.stage);
      const remaining = nextStage
        ? Math.max(0, nextStage.bondRequired - bond)
        : Number.POSITIVE_INFINITY;
      const progress = nextStage
        ? Math.min(100, Math.round((bond / nextStage.bondRequired) * 100))
        : 100;
      const visuals = companion.theme
        ? COMPANION_VISUALS[companion.theme]
        : null;

      return {
        student,
        bond,
        nextStage,
        remaining,
        progress,
        visuals,
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

  return (
    <section className="mb-4 rounded-3xl border border-emerald-300/15 bg-magic-panel/80 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-bold text-magic-accent">🐾 מעקב חיות הכיתה</h2>
          <p className="mt-1 text-xs text-magic-soft/65">
            תצוגה לקריאה בלבד — הנתונים מתעדכנים יחד עם רשימת התלמידים.
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

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <SummaryBox label="בחרו חיה" value={`${unlockedCount}/${students.length}`} />
        <SummaryBox label="מחכות לטקס" value={pendingCount} accent={pendingCount > 0} />
        <SummaryBox label="חיות אגדיות" value={legendaryCount} legendary />
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
                        </div>
                        <div className="self-start rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-magic-soft/60 sm:self-auto">
                          🔒 טרם נפתחה
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
                          row.nextStage
                            ? `${row.nextStage.bondRequired} קשר`
                            : 'הושלם 🌟'
                        }
                      />
                    </div>

                    <div className="mt-3">
                      <div className="mb-1 flex justify-between gap-3 text-[10px] font-bold text-magic-soft/55">
                        <span>
                          {row.nextStage
                            ? row.nextStage.labelHe
                            : 'כל שלבי ההתפתחות הושלמו'}
                        </span>
                        <span>
                          {row.nextStage
                            ? `חסרות ${row.remaining}`
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
    </section>
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
