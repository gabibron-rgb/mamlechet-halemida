import { useState } from 'react';
import { getItemById } from '../../data/items';
import { COSMETIC_BY_ID } from '../../data/cosmetics';
import { useGameStore, type StudentState } from '../../store/useGameStore';
import { canSell, sellValueOf } from '../../logic/economy';
import RarityBadge from '../shared/RarityBadge';
import { BOX_TIERS, RARITY_LABEL_HE } from '../../data/boxes';
import type { BoxTier, Rarity } from '../../data/boxes';
import { getBoxRewardPool, openBoxReward } from '../../logic/boxes';
import { THEMES } from '../../data/themes';
import type { ThemeId } from '../../data/themes';
import Modal from '../shared/Modal';

type Props = {
  student: StudentState;
};

type OpenedReward = {
  nameHe: string;
  descriptionHe?: string;
  rarity: keyof typeof RARITY_LABEL_HE;
  pityTriggered: boolean;
};

type BoxPreview = {
  tier: BoxTier;
  theme: ThemeId;
};

type KindFilter = 'all' | 'item' | 'box' | 'cosmetic';
type PlacementFilter = 'all' | 'placed' | 'unplaced';

type InventoryRow = {
  entry: StudentState['inventory'][number];
  originalIndex: number;
  kind: Exclude<KindFilter, 'all'>;
  themeId: string | null;
  rarity: Rarity | null;
  isPlaced: boolean;
  searchText: string;
};

const RARITY_ORDER: Rarity[] = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
];

const EXTRA_THEME_NAMES: Record<string, string> = {
  ballet: 'בלט',
};

function themeNameOf(themeId: string | null): string {
  if (!themeId) return '';

  return (
    THEMES.find((theme) => theme.id === themeId)?.nameHe ??
    EXTRA_THEME_NAMES[themeId] ??
    themeId
  );
}

function formatPercent(value: number): string {
  const percentage = value * 100;
  return Number.isInteger(percentage)
    ? `${percentage}%`
    : `${Number(percentage.toFixed(1))}%`;
}

export default function Inventory({ student }: Props) {
  const updateStudent = useGameStore((s) => s.updateStudent);

  const [message, setMessage] = useState<string | null>(null);
  const [openedReward, setOpenedReward] = useState<OpenedReward | null>(null);
  const [boxPreview, setBoxPreview] = useState<BoxPreview | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<KindFilter>('all');
  const [themeFilter, setThemeFilter] = useState('all');
  const [rarityFilter, setRarityFilter] = useState<'all' | Rarity>('all');
  const [placementFilter, setPlacementFilter] =
    useState<PlacementFilter>('all');

  const ownedItemIds = new Set(
    student.inventory
      .filter((entry) => entry.kind !== 'box')
      .map((entry) => entry.itemId)
  );

  const inventoryRows: InventoryRow[] = student.inventory
    .map((entry, originalIndex): InventoryRow | null => {
      if (entry.kind === 'box') {
        if (!entry.boxTier || !BOX_TIERS[entry.boxTier]) return null;

        const themeId =
          entry.boxTheme ?? student.unlockedThemes[0] ?? 'generic';
        const box = BOX_TIERS[entry.boxTier];

        return {
          entry,
          originalIndex,
          kind: 'box',
          themeId,
          rarity: null,
          isPlaced: false,
          searchText: `${box.nameHe} ${themeNameOf(themeId)}`.toLowerCase(),
        };
      }

      const item = getItemById(entry.itemId);
      const cosmetic = COSMETIC_BY_ID[entry.itemId];
      if (!item && !cosmetic) return null;

      const name = item?.nameHe ?? cosmetic?.nameHe ?? '';
      const description = item?.descriptionHe ?? cosmetic?.descHe ?? '';
      const themeId = item?.theme ?? null;
      const rarity = item?.rarity ?? cosmetic?.rarity ?? null;
      const isCosmetic = entry.kind === 'cosmetic' || (!item && !!cosmetic);
      const isPlaced =
        entry.placedZone !== null && entry.placedZone !== undefined
          ? true
          : entry.roomX !== null &&
            entry.roomX !== undefined &&
            entry.roomY !== null &&
            entry.roomY !== undefined;

      return {
        entry,
        originalIndex,
        kind: isCosmetic ? 'cosmetic' : 'item',
        themeId,
        rarity,
        isPlaced,
        searchText: `${name} ${description} ${themeNameOf(themeId)}`.toLowerCase(),
      };
    })
    .filter((row): row is InventoryRow => row !== null);

  const inventoryThemeOptions = [
    ...new Set(
      inventoryRows
        .map((row) => row.themeId)
        .filter((themeId): themeId is string => themeId !== null)
    ),
  ].sort((a, b) => themeNameOf(a).localeCompare(themeNameOf(b), 'he'));

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const visibleInventoryRows = inventoryRows.filter((row) => {
    if (kindFilter !== 'all' && row.kind !== kindFilter) return false;
    if (themeFilter !== 'all' && row.themeId !== themeFilter) return false;
    if (rarityFilter !== 'all' && row.rarity !== rarityFilter) return false;

    if (placementFilter !== 'all') {
      if (row.kind === 'box') return false;
      if (placementFilter === 'placed' && !row.isPlaced) return false;
      if (placementFilter === 'unplaced' && row.isPlaced) return false;
    }

    return !normalizedSearch || row.searchText.includes(normalizedSearch);
  });

  const hasActiveFilters =
    searchQuery !== '' ||
    kindFilter !== 'all' ||
    themeFilter !== 'all' ||
    rarityFilter !== 'all' ||
    placementFilter !== 'all';

  function resetFilters() {
    setSearchQuery('');
    setKindFilter('all');
    setThemeFilter('all');
    setRarityFilter('all');
    setPlacementFilter('all');
  }

  const previewBox = boxPreview ? BOX_TIERS[boxPreview.tier] : null;
  const previewTheme = boxPreview
    ? THEMES.find((theme) => theme.id === boxPreview.theme)
    : null;
  const previewRewards = boxPreview
    ? getBoxRewardPool(boxPreview.tier, boxPreview.theme)
    : [];
  const remainingPreviewRewardCount = previewRewards.filter(
    (item) => !ownedItemIds.has(item.id)
  ).length;

  function sell(idx: number) {
    const entry = student.inventory[idx];
    if (!entry) return;

    const item = getItemById(entry.itemId);

    // פרסים קוסמטיים מעליית רמה לא נמכרים כרגע
    if (!item || !canSell(item)) {
      setMessage('לא ניתן למכור את הפריט הזה');
      setTimeout(() => setMessage(null), 1500);
      return;
    }

    const refund = sellValueOf(item);
    const nextInv = [...student.inventory];
    nextInv.splice(idx, 1);

    updateStudent(student.id, {
      points: student.points + refund,
      inventory: nextInv,
    });

    setMessage(`מכרת את ${item.nameHe} (+${refund} נק׳)`);
    setTimeout(() => setMessage(null), 1500);
  }

  function openBox(idx: number) {
    const entry = student.inventory[idx];

    if (!entry || entry.kind !== 'box' || !entry.boxTier) {
      return;
    }

    const boxTheme = entry.boxTheme ?? student.unlockedThemes[0] ?? 'generic';
    const pityKey = `${entry.boxTier}_${boxTheme}`;
    const currentPity = student.pityCounters[pityKey] ?? 0;

    const ownedItemIds = student.inventory
      .filter((inventoryEntry) => inventoryEntry.kind !== 'box')
      .map((inventoryEntry) => inventoryEntry.itemId);

    const reward = openBoxReward(
      entry.boxTier,
      boxTheme,
      currentPity,
      ownedItemIds
    );

    if (!reward) {
      setMessage(
        'כבר קיבלת את כל החפצים האפשריים מהקופסה הזאת. כדאי לפתוח קופסה מסוג אחר.'
      );
      setTimeout(() => setMessage(null), 2500);
      return;
    }

    const nextInv = [...student.inventory];

    // מוציאים את הקופסה מהמלאי
    nextInv.splice(idx, 1);

    // מוסיפים את הפרס שהתקבל
    nextInv.push({
      id: `${reward.item.id}_${Date.now()}`,
      itemId: reward.item.id,
      kind: 'item',
      acquiredAt: Date.now(),

      placedZone: null,
      placedSlot: null,

      roomX: null,
      roomY: null,
      roomScale: 1,
      roomRotation: 0,
    });

    updateStudent(student.id, {
      inventory: nextInv,
      pityCounters: {
        ...student.pityCounters,
        [pityKey]: reward.newPityCount,
      },
    });

    setOpenedReward({
      nameHe: reward.item.nameHe,
      descriptionHe: reward.item.descriptionHe,
      rarity: reward.item.rarity,
      pityTriggered: reward.pityTriggered,
    });

    setMessage(null);
  }

  if (student.inventory.length === 0) {
    return (
      <p className="text-magic-soft/70 text-sm text-center py-4">
        עדיין אין פריטים במלאי
      </p>
    );
  }

  return (
    <div>
      {boxPreview && previewBox && (
        <Modal
          open={boxPreview !== null}
          onClose={() => setBoxPreview(null)}
          title={`מה יכול לצאת מ${previewBox.nameHe}?`}
        >
          <div className="mb-4 text-center">
            <div className="text-sm text-magic-soft/75">
              נושא: {previewTheme?.nameHe ?? 'כללי'}
            </div>
            <div className="mt-1 text-lg font-black text-white">
              {previewRewards.length} חפצים במאגר
            </div>
            <div className="mt-1 text-sm font-bold text-emerald-300">
              {remainingPreviewRewardCount} עדיין חסרים לך
            </div>
            <div className="mt-2 text-xs leading-5 text-magic-soft/60">
              תחילה מוגרלת נדירות, ואז נבחר חפץ שעדיין אינו בבעלותך.
              בגרסה הנוכחית, נדירות עם סיכוי בסיסי של 0% אינה מוגרלת
              ישירות, אך עדיין עשויה להיבחר דרך מנגנון מניעת הכפילויות.
            </div>
          </div>

          <div className="space-y-5">
            {RARITY_ORDER.map((rarity) => {
              const odds = previewBox.odds[rarity] ?? 0;
              const rarityItems = previewRewards.filter(
                (item) => item.rarity === rarity
              );
              if (rarityItems.length === 0) return null;

              return (
                <section key={rarity}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <RarityBadge rarity={rarity} />
                    <div
                      className={`text-xs font-bold ${
                        odds > 0 ? 'text-magic-soft/70' : 'text-amber-300'
                      }`}
                    >
                      {odds > 0
                        ? `סיכוי בסיסי: ${formatPercent(odds)}`
                        : '0% ישיר · אפשרי רק דרך מניעת כפילויות'}{' '}
                      · {rarityItems.length} חפצים
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {rarityItems.map((item) => {
                      const isOwned = ownedItemIds.has(item.id);

                      return (
                        <div
                          key={item.id}
                          className={`flex min-h-12 items-center justify-between gap-3 rounded-xl border px-3 py-2 ${
                            isOwned
                              ? 'border-emerald-400/35 bg-emerald-500/10'
                              : 'border-white/10 bg-magic-bg/40'
                          }`}
                        >
                          <div className="text-sm font-bold text-white">
                            {item.nameHe}
                          </div>
                          {isOwned && (
                            <div className="shrink-0 text-[10px] font-bold text-emerald-300">
                              בבעלותך ✓
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setBoxPreview(null)}
            className="mt-6 w-full rounded-xl bg-magic-accent py-2.5 font-bold text-magic-bg"
          >
            סגירה
          </button>
        </Modal>
      )}

      {openedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
          <div className="w-full max-w-md rounded-3xl bg-magic-panel border border-magic-accent/50 p-6 text-center shadow-2xl">
            <div className="text-6xl mb-4 animate-bounce">🎁</div>

            <div className="text-magic-accent font-black text-2xl mb-2">
              קיבלת פרס!
            </div>

            <div className="bg-magic-bg/50 rounded-2xl p-4 mb-4">
              <div className="text-5xl mb-3">✨</div>

              <div className="text-white font-black text-xl mb-1">
                {openedReward.nameHe}
              </div>

              {openedReward.descriptionHe && (
                <div className="text-magic-soft/80 text-sm mb-2">
                  {openedReward.descriptionHe}
                </div>
              )}

              <div className="inline-block rounded-full border border-magic-accent/60 px-3 py-1 text-xs text-magic-accent">
                {RARITY_LABEL_HE[openedReward.rarity]}
              </div>
            </div>

            {openedReward.pityTriggered && (
              <div className="text-yellow-300 text-sm mb-4">
                ✨ מזל מובטח הופעל!
              </div>
            )}

            <button
              type="button"
              onClick={() => setOpenedReward(null)}
              className="w-full rounded-xl bg-magic-accent py-3 font-bold text-magic-bg"
            >
              מעולה!
            </button>
          </div>
        </div>
      )}

      {message && (
        <div className="bg-magic-soft/20 border border-magic-soft text-magic-soft rounded-xl p-2 mb-3 text-sm text-center">
          {message}
        </div>
      )}

      <div className="mb-4 rounded-2xl border border-white/10 bg-magic-bg/30 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="font-black text-white">חיפוש וסינון</div>
            <div className="text-xs text-magic-soft/55">
              מצא/י במהירות את מה שחיפשת במלאי
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="shrink-0 rounded-lg border border-magic-accent/30 px-3 py-1.5 text-xs font-bold text-magic-accent hover:bg-magic-accent/10"
            >
              איפוס
            </button>
          )}
        </div>

        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="חיפוש לפי שם החפץ..."
          className="mb-3 w-full rounded-xl border border-white/10 bg-magic-bg/70 px-4 py-2.5 text-sm text-white outline-none placeholder:text-magic-soft/35 focus:border-magic-accent/60"
        />

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-bold text-magic-soft/65">
            סוג
            <select
              value={kindFilter}
              onChange={(event) =>
                setKindFilter(event.target.value as KindFilter)
              }
              className="mt-1 w-full rounded-xl border border-white/10 bg-magic-bg px-3 py-2 text-sm text-white outline-none focus:border-magic-accent/60"
            >
              <option value="all">הכול</option>
              <option value="item">חפצים</option>
              <option value="box">קופסאות</option>
              <option value="cosmetic">פרסים קוסמטיים</option>
            </select>
          </label>

          <label className="text-xs font-bold text-magic-soft/65">
            נושא
            <select
              value={themeFilter}
              onChange={(event) => setThemeFilter(event.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-magic-bg px-3 py-2 text-sm text-white outline-none focus:border-magic-accent/60"
            >
              <option value="all">כל הנושאים</option>
              {inventoryThemeOptions.map((themeId) => (
                <option key={themeId} value={themeId}>
                  {themeNameOf(themeId)}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-bold text-magic-soft/65">
            נדירות
            <select
              value={rarityFilter}
              onChange={(event) =>
                setRarityFilter(event.target.value as 'all' | Rarity)
              }
              className="mt-1 w-full rounded-xl border border-white/10 bg-magic-bg px-3 py-2 text-sm text-white outline-none focus:border-magic-accent/60"
            >
              <option value="all">כל הנדירויות</option>
              {RARITY_ORDER.map((rarity) => (
                <option key={rarity} value={rarity}>
                  {RARITY_LABEL_HE[rarity]}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-bold text-magic-soft/65">
            מיקום
            <select
              value={placementFilter}
              onChange={(event) =>
                setPlacementFilter(event.target.value as PlacementFilter)
              }
              className="mt-1 w-full rounded-xl border border-white/10 bg-magic-bg px-3 py-2 text-sm text-white outline-none focus:border-magic-accent/60"
            >
              <option value="all">כל החפצים</option>
              <option value="placed">מונחים בחדר</option>
              <option value="unplaced">לא מונחים בחדר</option>
            </select>
          </label>
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between text-xs text-magic-soft/70">
        <span>
          מוצגים {visibleInventoryRows.length} מתוך {inventoryRows.length}
        </span>
        <span dir="ltr">
          {student.inventory.length} / {student.capacities.inventory}
        </span>
      </div>

      {visibleInventoryRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-magic-bg/20 px-4 py-10 text-center">
          <div className="mb-2 text-3xl">🔎</div>
          <div className="font-bold text-white">לא נמצאו פריטים מתאימים</div>
          <div className="mt-1 text-xs text-magic-soft/55">
            אפשר לשנות את החיפוש או לאפס את המסננים.
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-2 gap-3">
        {visibleInventoryRows.map(({ entry, originalIndex: idx, isPlaced }) => {
          if (entry.kind === 'box' && entry.boxTier) {
            const boxTier = entry.boxTier;
            const boxTheme =
              entry.boxTheme ?? student.unlockedThemes[0] ?? 'generic';
            const box = BOX_TIERS[boxTier];
            const themeName = themeNameOf(boxTheme) || 'כללי';

            return (
              <div
                key={`${entry.id}_${idx}`}
                className="bg-magic-bg/40 rounded-2xl p-3"
              >
                <div className="flex justify-between mb-1">
                  <div>
                    <div className="text-white font-bold text-sm">
                      {box.nameHe}
                    </div>

                    <div className="text-magic-soft/60 text-xs mt-0.5">
                      נושא: {themeName}
                    </div>
                  </div>

                  <span className="text-xl">{box.emoji}</span>
                </div>

                <div className="text-magic-soft/70 text-xs mb-2">
                  קופסה סגורה — פתח/י כדי לקבל פרס.
                </div>

                <div className="mt-2 grid gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setBoxPreview({ tier: boxTier, theme: boxTheme })
                    }
                    className="w-full rounded-xl border border-magic-accent/40 bg-magic-accent/10 py-2 text-sm font-bold text-magic-accent hover:bg-magic-accent/20"
                  >
                    מה יכול לצאת?
                  </button>

                  <button
                    type="button"
                    onClick={() => openBox(idx)}
                    className="w-full rounded-xl bg-magic-accent py-2 text-sm font-bold text-magic-bg"
                  >
                    פתח/י קופסה
                  </button>
                </div>
              </div>
            );
          }

          const item = getItemById(entry.itemId);
          const cosmetic = COSMETIC_BY_ID[entry.itemId];

          if (!item && !cosmetic) return null;

          const name = item?.nameHe ?? cosmetic?.nameHe;
          const description = item?.descriptionHe ?? cosmetic?.descHe;
          const rarity = item?.rarity ?? cosmetic?.rarity;
          const icon = cosmetic?.icon ?? '✨';

          return (
            <div
              key={`${entry.itemId}_${idx}`}
              className="bg-magic-bg/40 rounded-2xl p-3"
            >
              <div className="flex justify-between mb-1">
                <span className="text-xl">{icon}</span>
                {rarity && <RarityBadge rarity={rarity} />}
              </div>

              <div className="text-white font-bold text-sm">{name}</div>

              {description && (
                <div className="text-magic-soft/70 text-xs mt-1">
                  {description}
                </div>
              )}

              {isPlaced && (
                <div className="mt-2 text-[10px] font-bold text-sky-300">
                  🏠 מונח בחדר
                </div>
              )}

              {item && canSell(item) ? (
                <button
                  type="button"
                  onClick={() => sell(idx)}
                  className="text-magic-soft/70 hover:text-magic-accent text-xs mt-2"
                >
                  מכור/י (+{sellValueOf(item)} נק׳)
                </button>
              ) : (
                <span className="text-magic-soft/40 text-xs mt-2 block">
                  פרס קוסמטי
                </span>
              )}
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
