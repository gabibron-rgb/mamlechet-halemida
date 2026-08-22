import { useState } from 'react';

import { RARITY_COLOR, RARITY_LABEL_HE } from '../../data/boxes';
import type { Rarity } from '../../data/boxes';
import { ITEMS } from '../../data/items';
import type { Item } from '../../data/items';
import { THEMES } from '../../data/themes';
import type { StudentState } from '../../store/useGameStore';
import RarityBadge from '../shared/RarityBadge';
import ItemSprite from './ItemSprite';

type Props = {
  student: StudentState;
};

type ThemeDisplay = {
  id: Item['theme'];
  nameHe: string;
  emoji: string;
  color: string;
};

const RARITY_ORDER: Rarity[] = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
];

const EXTRA_THEME_DISPLAY: Record<
  string,
  Pick<ThemeDisplay, 'nameHe' | 'emoji' | 'color'>
> = {
  ballet: { nameHe: 'בלט', emoji: '🩰', color: '#f9a8d4' },
};

const COLLECTIBLE_ITEMS = ITEMS.filter((item) => item.source === 'box');

function getThemeDisplays(): ThemeDisplay[] {
  const collectibleThemeIds = new Set(
    COLLECTIBLE_ITEMS.map((item) => item.theme)
  );

  const knownThemes: ThemeDisplay[] = THEMES.filter((theme) =>
    collectibleThemeIds.has(theme.id)
  );

  const knownThemeIds = new Set(knownThemes.map((theme) => theme.id));
  const extraThemes = [...collectibleThemeIds]
    .filter((themeId) => !knownThemeIds.has(themeId))
    .map((themeId) => {
      const display = EXTRA_THEME_DISPLAY[themeId];

      return {
        id: themeId,
        nameHe: display?.nameHe ?? themeId,
        emoji: display?.emoji ?? '✨',
        color: display?.color ?? '#b8a4ff',
      };
    });

  return [...knownThemes, ...extraThemes];
}

function sortItemsByRarity(items: Item[]): Item[] {
  return [...items].sort((a, b) => {
    const rarityDiff =
      RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);

    if (rarityDiff !== 0) return rarityDiff;
    return a.nameHe.localeCompare(b.nameHe, 'he');
  });
}

export default function CollectionAlbum({ student }: Props) {
  const [selectedThemeId, setSelectedThemeId] = useState<Item['theme'] | null>(
    null
  );

  const ownedItemIds = new Set(
    student.inventory
      .filter((entry) => entry.kind !== 'box')
      .map((entry) => entry.itemId)
  );

  const themeDisplays = getThemeDisplays();
  const totalOwned = COLLECTIBLE_ITEMS.filter((item) =>
    ownedItemIds.has(item.id)
  ).length;
  const completedThemes = themeDisplays.filter((theme) => {
    const themeItems = COLLECTIBLE_ITEMS.filter(
      (item) => item.theme === theme.id
    );

    return (
      themeItems.length > 0 &&
      themeItems.every((item) => ownedItemIds.has(item.id))
    );
  }).length;
  const ownedLegendaryCount = COLLECTIBLE_ITEMS.filter(
    (item) => item.rarity === 'legendary' && ownedItemIds.has(item.id)
  ).length;

  const selectedTheme = selectedThemeId
    ? themeDisplays.find((theme) => theme.id === selectedThemeId) ?? null
    : null;

  if (selectedTheme) {
    const themeItems = sortItemsByRarity(
      COLLECTIBLE_ITEMS.filter((item) => item.theme === selectedTheme.id)
    );
    const ownedInTheme = themeItems.filter((item) =>
      ownedItemIds.has(item.id)
    ).length;
    const completionPct = Math.round((ownedInTheme / themeItems.length) * 100);
    const isUnlocked = student.unlockedThemes.includes(selectedTheme.id);

    return (
      <div>
        <button
          type="button"
          onClick={() => setSelectedThemeId(null)}
          className="mb-5 rounded-xl bg-magic-bg/50 px-4 py-2 text-sm font-bold text-magic-soft transition-colors hover:bg-magic-bg/80"
        >
          → חזרה לכל הנושאים
        </button>

        <div className="mb-5 rounded-3xl bg-magic-bg/40 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="text-4xl">{selectedTheme.emoji}</span>
                <h2 className="text-2xl font-black text-white">
                  אוסף {selectedTheme.nameHe}
                </h2>
              </div>

              <p className="text-sm text-magic-soft/70">
                {isUnlocked
                  ? 'כל חפץ חדש מהנושא יתווסף לכאן אוטומטית.'
                  : 'הנושא עדיין נעול, אבל אפשר כבר להציץ באלבום.'}
              </p>
            </div>

            <div className="text-left">
              <div className="text-2xl font-black text-magic-accent" dir="ltr">
                {ownedInTheme} / {themeItems.length}
              </div>
              <div className="text-xs text-magic-soft/60">נאספו</div>
            </div>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-magic-bg/70">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${completionPct}%`,
                backgroundColor: selectedTheme.color,
              }}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {RARITY_ORDER.map((rarity) => {
              const rarityItems = themeItems.filter(
                (item) => item.rarity === rarity
              );
              if (rarityItems.length === 0) return null;

              const ownedOfRarity = rarityItems.filter((item) =>
                ownedItemIds.has(item.id)
              ).length;

              return (
                <div
                  key={rarity}
                  className="rounded-xl border bg-magic-bg/40 p-2 text-center"
                  style={{ borderColor: `${RARITY_COLOR[rarity]}66` }}
                >
                  <div
                    className="text-lg font-black"
                    style={{ color: RARITY_COLOR[rarity] }}
                    dir="ltr"
                  >
                    {ownedOfRarity} / {rarityItems.length}
                  </div>
                  <div className="text-[11px] text-magic-soft/70">
                    {RARITY_LABEL_HE[rarity]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {themeItems.map((item) => {
            const isOwned = ownedItemIds.has(item.id);

            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-3 text-center transition-colors ${
                  isOwned
                    ? 'bg-magic-bg/45'
                    : 'border-white/10 bg-magic-bg/20'
                }`}
                style={
                  isOwned
                    ? { borderColor: `${RARITY_COLOR[item.rarity]}70` }
                    : undefined
                }
              >
                <div className="mx-auto mb-3 h-28 w-28 max-w-full">
                  {isOwned ? (
                    <ItemSprite
                      itemId={item.id}
                      rarity={item.rarity}
                      fitWithinFrame
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-2xl bg-black/20 text-5xl font-black text-magic-soft/20">
                      ?
                    </div>
                  )}
                </div>

                {isOwned ? (
                  <>
                    <div className="mb-2 min-h-10 text-sm font-black text-white">
                      {item.nameHe}
                    </div>
                    <RarityBadge rarity={item.rarity} />
                  </>
                ) : (
                  <>
                    <div className="mb-2 min-h-10 text-xs font-bold text-magic-soft/45">
                      חפץ שעדיין לא התגלה
                    </div>
                    <RarityBadge rarity={item.rarity} />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const overallPct = COLLECTIBLE_ITEMS.length
    ? Math.round((totalOwned / COLLECTIBLE_ITEMS.length) * 100)
    : 0;

  return (
    <div>
      <div className="mb-6 text-center">
        <div className="mb-2 text-5xl">📖</div>
        <h2 className="text-3xl font-black text-magic-accent">האוסף שלי</h2>
        <p className="mt-2 text-sm text-magic-soft/75">
          כל חפץ ייחודי שקיבלת מקופסה מופיע כאן. חפצים כפולים נספרים פעם
          אחת בלבד.
        </p>
      </div>

      <div className="mb-6 rounded-3xl bg-magic-bg/40 p-5">
        <div className="grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
          <AlbumStat
            value={`${totalOwned}/${COLLECTIBLE_ITEMS.length}`}
            label="חפצים שהתגלו"
          />
          <AlbumStat
            value={`${completedThemes}/${themeDisplays.length}`}
            label="אוספים שהושלמו"
          />
          <AlbumStat value={ownedLegendaryCount} label="חפצים אגדיים" />
        </div>

        <div className="mt-4 h-4 overflow-hidden rounded-full bg-magic-bg/70">
          <div
            className="h-full rounded-full bg-gradient-to-l from-magic-accent to-purple-500 transition-all duration-500"
            style={{ width: `${overallPct}%` }}
          />
        </div>
        <div className="mt-2 text-center text-xs font-bold text-magic-soft/60">
          {overallPct}% מהאוסף הכולל
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {themeDisplays.map((theme) => {
          const themeItems = COLLECTIBLE_ITEMS.filter(
            (item) => item.theme === theme.id
          );
          const ownedInTheme = themeItems.filter((item) =>
            ownedItemIds.has(item.id)
          ).length;
          const completionPct = Math.round(
            (ownedInTheme / themeItems.length) * 100
          );
          const isComplete = ownedInTheme === themeItems.length;
          const isUnlocked = student.unlockedThemes.includes(theme.id);

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => setSelectedThemeId(theme.id)}
              className="rounded-2xl border border-white/10 bg-magic-bg/35 p-4 text-right transition-all hover:-translate-y-0.5 hover:border-magic-accent/40 hover:bg-magic-bg/55"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                    style={{ backgroundColor: `${theme.color}25` }}
                  >
                    {theme.emoji}
                  </div>

                  <div>
                    <div className="font-black text-white">
                      {theme.nameHe}
                    </div>
                    <div className="mt-0.5 text-xs text-magic-soft/55">
                      {isComplete
                        ? 'האוסף הושלם! 🏆'
                        : isUnlocked
                          ? 'נושא פתוח'
                          : 'נעול כרגע 🔒'}
                    </div>
                  </div>
                </div>

                <div className="text-left">
                  <div className="font-black text-magic-accent" dir="ltr">
                    {ownedInTheme}/{themeItems.length}
                  </div>
                  <div className="text-[10px] text-magic-soft/50">נאספו</div>
                </div>
              </div>

              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-magic-bg/80">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${completionPct}%`,
                    backgroundColor: theme.color,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AlbumStat({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-2xl bg-magic-panel/45 p-4">
      <div className="text-2xl font-black text-magic-accent" dir="ltr">
        {value}
      </div>
      <div className="mt-1 text-xs text-magic-soft/65">{label}</div>
    </div>
  );
}
