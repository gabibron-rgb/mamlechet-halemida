import { useState } from 'react';

import { TROPHY_THEMES } from '../../data/trophies';
import type { StudentState } from '../../store/useGameStore';

type Props = {
  student: StudentState;
};

type TrophyEntry = StudentState['trophies'][number];

const SAMPLE_TROPHIES: TrophyEntry[] = [
  {
    id: 'preview_effort',
    trophyTheme: 'effort',
    caption: 'על התמדה יוצאת דופן גם כשהאתגר היה קשה',
    awardedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: 'preview_creativity',
    trophyTheme: 'creativity',
    caption: 'על פתרון מקורי שהפתיע את כולם',
    awardedAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
  },
  {
    id: 'preview_kindness',
    trophyTheme: 'kindness',
    caption: 'על עזרה לחברה ברגע שהיה חשוב במיוחד',
    awardedAt: Date.now() - 1000 * 60 * 60 * 24 * 28,
  },
];

function trophyDefinition(themeId: string) {
  return TROPHY_THEMES.find(theme => theme.id === themeId);
}

function formatAwardDate(timestamp: number): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export default function TrophyRoom({ student }: Props) {
  const [showLocalPreview, setShowLocalPreview] = useState(false);
  const trophies = showLocalPreview ? SAMPLE_TROPHIES : student.trophies;
  const sortedTrophies = [...trophies].sort(
    (first, second) => second.awardedAt - first.awardedAt
  );
  const collectedThemeIds = new Set(
    trophies.map(trophy => trophy.trophyTheme)
  );
  const latestTrophy = sortedTrophies[0];
  const latestDefinition = latestTrophy
    ? trophyDefinition(latestTrophy.trophyTheme)
    : null;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="mb-2 text-5xl">🏆</div>
          <h2 className="text-3xl font-black text-magic-accent">
            חדר הפרסים שלי
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-magic-soft/70">
            כאן נשמרים גביעים מיוחדים שהוענקו לך על מאמץ, חברות,
            יצירתיות, סקרנות, מנהיגות והתקדמות.
          </p>
        </div>

        {import.meta.env.DEV && (
          <button
            type="button"
            onClick={() => setShowLocalPreview(value => !value)}
            className="shrink-0 rounded-xl border border-fuchsia-300/30 bg-fuchsia-500/10 px-4 py-2 text-xs font-black text-fuchsia-200 hover:bg-fuchsia-500/20"
          >
            {showLocalPreview ? 'חזרה לפרסים האמיתיים' : 'הצגת חדר לדוגמה'}
          </button>
        )}
      </div>

      {showLocalPreview && (
        <div className="mb-5 rounded-xl border border-fuchsia-300/25 bg-fuchsia-500/10 px-4 py-2 text-center text-xs font-bold text-fuchsia-200">
          תצוגת בדיקה מקומית בלבד — הדוגמאות אינן נשמרות בחשבון
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon="🏅"
          label="גביעים בחדר"
          value={String(trophies.length)}
        />
        <StatCard
          icon="✨"
          label="סוגים שהתגלו"
          value={`${collectedThemeIds.size}/${TROPHY_THEMES.length}`}
        />
        <StatCard
          icon={latestDefinition?.emoji ?? '🔒'}
          label="הפרס האחרון"
          value={latestDefinition?.nameHe ?? 'עדיין אין'}
          compact
        />
      </div>

      <div className="mb-6 rounded-3xl border border-yellow-300/15 bg-gradient-to-b from-amber-950/30 via-magic-bg/35 to-magic-bg/55 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-xl font-black text-white">מדף הגביעים</h3>
          <div className="text-xs text-magic-soft/50">
            {trophies.length} פרסים
          </div>
        </div>

        {sortedTrophies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-black/15 px-5 py-12 text-center">
            <div className="mb-3 text-6xl grayscale opacity-50">🏆</div>
            <div className="text-lg font-black text-white">
              המדף מחכה לפרס הראשון
            </div>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-magic-soft/60">
              כאשר המורה יעניק לך גביע, הוא יופיע כאן יחד עם ההקדשה
              והתאריך.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedTrophies.map((trophy, index) => (
              <TrophyCard
                key={`${trophy.id}_${index}`}
                trophy={trophy}
                isLatest={index === 0}
              />
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-white/10 bg-magic-bg/30 p-5">
        <h3 className="mb-4 text-lg font-black text-white">
          סוגי הפרסים בממלכה
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {TROPHY_THEMES.map(theme => {
            const isCollected = collectedThemeIds.has(theme.id);

            return (
              <div
                key={theme.id}
                className={`rounded-2xl border p-3 text-center ${
                  isCollected
                    ? 'border-yellow-300/35 bg-yellow-400/10'
                    : 'border-white/10 bg-black/10 opacity-45'
                }`}
              >
                <div className={`text-3xl ${isCollected ? '' : 'grayscale'}`}>
                  {isCollected ? theme.emoji : '❔'}
                </div>
                <div className="mt-2 text-xs font-bold text-white">
                  {isCollected ? theme.nameHe : 'עדיין לא התגלה'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TrophyCard({
  trophy,
  isLatest,
}: {
  trophy: TrophyEntry;
  isLatest: boolean;
}) {
  const definition = trophyDefinition(trophy.trophyTheme);
  const name = definition?.nameHe ?? 'גביע מיוחד';
  const emoji = definition?.emoji ?? '🏆';

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border bg-magic-panel/65 p-4 text-center shadow-xl ${
        isLatest ? 'border-yellow-300/55' : 'border-white/10'
      }`}
    >
      {isLatest && (
        <div className="absolute left-3 top-3 rounded-full bg-yellow-300 px-2 py-1 text-[9px] font-black text-amber-950">
          חדש
        </div>
      )}

      <div className="relative mx-auto mb-3 flex h-28 w-28 items-center justify-center">
        <div className="absolute bottom-0 h-5 w-24 rounded-[50%] bg-black/35 blur-sm" />
        <div className="relative text-7xl drop-shadow-[0_0_18px_rgba(250,204,21,0.45)]">
          {emoji}
        </div>
      </div>

      <h4 className="font-black text-yellow-200">{name}</h4>
      <p className="mt-2 min-h-12 text-xs leading-5 text-magic-soft/70">
        {trophy.caption?.trim() || 'פרס מיוחד מהמורה'}
      </p>
      <div className="mt-3 text-[10px] font-bold text-magic-soft/45">
        {formatAwardDate(trophy.awardedAt)}
      </div>
    </article>
  );
}

function StatCard({
  icon,
  label,
  value,
  compact = false,
}: {
  icon: string;
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-magic-bg/40 p-4 text-center">
      <div className="text-3xl">{icon}</div>
      <div
        className={`mt-2 font-black text-magic-accent ${
          compact ? 'text-base' : 'text-2xl'
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-xs text-magic-soft/55">{label}</div>
    </div>
  );
}
