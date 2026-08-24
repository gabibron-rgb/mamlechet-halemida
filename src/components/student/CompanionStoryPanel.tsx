import { useEffect, useMemo, useState } from 'react';

import {
  COMPANION_EVOLUTION_STAGE_BY_ID,
  companionEvolutionLevel,
  type CompanionEvolutionLevel,
  type CompanionStage,
} from '../../data/companionWorlds';
import {
  COMPANION_STORIES,
  renderCompanionStoryText,
} from '../../data/companionStories';
import type { ThemeId } from '../../data/themes';

type Props = {
  theme: ThemeId;
  stage: CompanionStage;
  petName: string;
};

const LEVEL_LABEL_HE: Record<CompanionEvolutionLevel, string> = {
  1: COMPANION_EVOLUTION_STAGE_BY_ID.hatchling.shortLabelHe,
  2: COMPANION_EVOLUTION_STAGE_BY_ID.young.shortLabelHe,
  3: COMPANION_EVOLUTION_STAGE_BY_ID.grown.shortLabelHe,
  4: COMPANION_EVOLUTION_STAGE_BY_ID.magical.shortLabelHe,
  5: COMPANION_EVOLUTION_STAGE_BY_ID.legendary.shortLabelHe,
};

export default function CompanionStoryPanel({ theme, stage, petName }: Props) {
  const story = COMPANION_STORIES[theme];
  const unlockedLevel = companionEvolutionLevel(stage);
  const [selectedLevel, setSelectedLevel] = useState<CompanionEvolutionLevel>(1);

  useEffect(() => {
    if (unlockedLevel !== 0) {
      setSelectedLevel(unlockedLevel);
    }
  }, [theme, unlockedLevel]);

  const chapters = story?.chapters ?? [];
  const selectedChapter = useMemo(
    () => chapters.find(chapter => chapter.level === selectedLevel),
    [selectedLevel, chapters]
  );

  if (!story) return null;

  return (
    <section className="mx-auto mt-5 max-w-3xl rounded-3xl border border-amber-200/20 bg-gradient-to-br from-amber-500/10 via-fuchsia-500/5 to-indigo-500/10 p-5 text-right shadow-[0_0_32px_rgba(251,191,36,0.06)]">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="text-[10px] font-black tracking-[0.12em] text-amber-200/65">
            📖 סיפור מתפתח
          </div>
          <h3 className="mt-1 text-xl font-black text-white">
            הסיפור של {petName}
          </h3>
          <div className="mt-1 text-sm font-bold text-amber-100/80">
            {story.storyTitleHe}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-center text-xs font-bold text-magic-soft/70">
          {unlockedLevel > 0 ? `${unlockedLevel}/5 פרקים נפתחו` : 'הסיפור עוד לא התחיל'}
        </div>
      </div>

      {unlockedLevel === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-black/15 px-4 py-5 text-center text-sm text-magic-soft/65">
          🔒 הפרק הראשון ייפתח כשהביצה תבקע.
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-5 gap-1.5">
            {story.chapters.map(chapter => {
              const unlocked = chapter.level <= unlockedLevel;
              const selected = chapter.level === selectedLevel;

              return (
                <button
                  key={chapter.level}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => setSelectedLevel(chapter.level)}
                  title={unlocked ? renderCompanionStoryText(chapter.titleHe, petName) : `נפתח בצורת ${chapter.level}`}
                  className={`rounded-xl border px-1.5 py-2 text-center transition-all ${
                    selected
                      ? 'border-amber-200/60 bg-amber-300/20 text-white shadow-[0_0_18px_rgba(251,191,36,0.14)]'
                      : unlocked
                        ? 'border-white/10 bg-black/20 text-amber-50 hover:bg-black/30'
                        : 'cursor-not-allowed border-white/5 bg-black/10 text-magic-soft/30'
                  }`}
                >
                  <div className="text-[10px] font-black">
                    פרק {chapter.level}
                  </div>
                  <div className="mt-0.5 text-[9px] font-bold">
                    {unlocked ? LEVEL_LABEL_HE[chapter.level] : '🔒 ???'}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedChapter && selectedChapter.level <= unlockedLevel && (
            <article className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] font-black text-amber-200/60">
                    פרק {selectedChapter.level} · {LEVEL_LABEL_HE[selectedChapter.level]}
                  </div>
                  <h4 className="mt-1 text-lg font-black text-white">
                    {renderCompanionStoryText(selectedChapter.titleHe, petName)}
                  </h4>
                </div>
                {selectedChapter.level === unlockedLevel && (
                  <span className="rounded-full bg-amber-300/15 px-3 py-1 text-[10px] font-black text-amber-100">
                    הפרק החדש ביותר ✨
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-3 text-sm leading-7 text-magic-soft/85">
                {renderCompanionStoryText(selectedChapter.textHe, petName)
                  .split('\n\n')
                  .map((paragraph, index) => (
                    <p key={`${selectedChapter.level}-${index}`}>{paragraph}</p>
                  ))}
              </div>
            </article>
          )}

          {unlockedLevel < 5 && (
            <div className="mt-3 text-center text-[11px] font-bold text-magic-soft/45">
              🔒 הפרק הבא ייפתח כשהחיה תגיע לצורה {unlockedLevel + 1}.
            </div>
          )}
        </>
      )}
    </section>
  );
}
