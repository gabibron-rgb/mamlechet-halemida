import { useState } from 'react';
import { getItemById, ITEMS } from '../../data/items';
import { COSMETIC_BY_ID } from '../../data/cosmetics';
import { useGameStore, type StudentState } from '../../store/useGameStore';
import { canSell, sellValueOf } from '../../logic/economy';
import RarityBadge from '../shared/RarityBadge';
import { BOX_TIERS, RARITY_COLOR, RARITY_LABEL_HE } from '../../data/boxes';
import type { BoxTier, Rarity } from '../../data/boxes';
import { getBoxRewardPool, openBoxReward } from '../../logic/boxes';
import { THEMES } from '../../data/themes';
import type { ThemeId } from '../../data/themes';
import Modal from '../shared/Modal';
import ItemSprite from './ItemSprite';

type Props = {
  student: StudentState;
  onGoRoom: () => void;
};

type OpenedReward = {
  itemId: string;
  nameHe: string;
  descriptionHe?: string;
  rarity: keyof typeof RARITY_LABEL_HE;
  pityTriggered: boolean;
  themeId?: string;
  collectionOwned?: number;
  collectionTotal?: number;
  isPreview?: boolean;
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

const REWARD_TITLE_HE: Record<Rarity, string> = {
  common: 'גילית חפץ חדש!',
  uncommon: 'חפץ יוצא דופן!',
  rare: '💎 חפץ נדיר! 💎',
  epic: '✨ פרס אפי! ✨',
  legendary: '👑 חפץ אגדי!!! 👑',
};

const REWARD_SUBTITLE_HE: Record<Rarity, string> = {
  common: 'החפץ נוסף למלאי שלך',
  uncommon: 'מציאה מיוחדת נוספה למלאי שלך',
  rare: 'לא בכל יום מגלים חפץ כזה',
  epic: 'אנרגיית קסם אדירה ממלאת את הממלכה!',
  legendary: 'אחד האוצרות הנדירים ביותר בממלכת הלמידה!',
};

const CELEBRATION_PARTICLES = [
  { top: '7%', left: '8%', delay: '0s', rare: '✦', epic: '✦', legendary: '★' },
  { top: '13%', left: '78%', delay: '0.2s', rare: '◆', epic: '◆', legendary: '✦' },
  { top: '28%', left: '18%', delay: '0.5s', rare: '✧', epic: '✧', legendary: '✨' },
  { top: '35%', left: '88%', delay: '0.8s', rare: '✦', epic: '✦', legendary: '★' },
  { top: '55%', left: '6%', delay: '0.3s', rare: '◆', epic: '◆', legendary: '✧' },
  { top: '63%', left: '82%', delay: '0.6s', rare: '✧', epic: '✧', legendary: '✨' },
  { top: '79%', left: '15%', delay: '0.9s', rare: '✦', epic: '✦', legendary: '★' },
  { top: '84%', left: '72%', delay: '0.4s', rare: '◆', epic: '◆', legendary: '✦' },
  { top: '47%', left: '30%', delay: '0.7s', rare: '✧', epic: '✧', legendary: '✨' },
  { top: '20%', left: '48%', delay: '1s', rare: '✦', epic: '✦', legendary: '★' },
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

export default function Inventory({ student, onGoRoom }: Props) {
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

  const isRareReward = openedReward?.rarity === 'rare';
  const isEpicReward = openedReward?.rarity === 'epic';
  const isLegendaryReward = openedReward?.rarity === 'legendary';
  const isMajorReward = isEpicReward || isLegendaryReward;
  const isCelebrationReward = isRareReward || isMajorReward;

  function resetFilters() {
    setSearchQuery('');
    setKindFilter('all');
    setThemeFilter('all');
    setRarityFilter('all');
    setPlacementFilter('all');
  }

  function previewRewardCelebration(rarity: 'rare' | 'epic' | 'legendary') {
    const item = ITEMS.find(
      candidate => candidate.source === 'box' && candidate.rarity === rarity
    );

    if (!item) return;

    setOpenedReward({
      itemId: item.id,
      nameHe: item.nameHe,
      descriptionHe: item.descriptionHe,
      rarity: item.rarity,
      pityTriggered: false,
      isPreview: true,
    });
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

    const rewardThemeItems = ITEMS.filter(
      item => item.source === 'box' && item.theme === reward.item.theme
    );
    const ownedBeforeOpening = new Set(ownedItemIds);
    const ownedInRewardTheme = rewardThemeItems.filter(item =>
      ownedBeforeOpening.has(item.id)
    ).length;

    setOpenedReward({
      itemId: reward.item.id,
      nameHe: reward.item.nameHe,
      descriptionHe: reward.item.descriptionHe,
      rarity: reward.item.rarity,
      pityTriggered: reward.pityTriggered,
      themeId: reward.item.theme,
      collectionOwned: Math.min(
        ownedInRewardTheme + 1,
        rewardThemeItems.length
      ),
      collectionTotal: rewardThemeItems.length,
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
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4 backdrop-blur-sm sm:p-6 ${
            isLegendaryReward
              ? 'bg-amber-950/90'
              : isEpicReward
                ? 'bg-purple-950/90'
                : isRareReward
                  ? 'bg-blue-950/85'
                  : 'bg-black/70'
          }`}
        >
          {isCelebrationReward && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              {isMajorReward && (
                <>
                  <div
                    className={`absolute left-1/2 top-1/2 h-[78vmin] w-[78vmin] -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-4 border-dashed border-t-transparent opacity-40 ${
                      isLegendaryReward
                        ? 'border-yellow-300'
                        : 'border-fuchsia-400'
                    }`}
                  />
                  <div
                    className={`absolute left-1/2 top-1/2 h-[48vmin] w-[48vmin] -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border-4 opacity-25 ${
                      isLegendaryReward
                        ? 'border-amber-200'
                        : 'border-purple-300'
                    }`}
                  />
                </>
              )}

              {(isRareReward
                ? CELEBRATION_PARTICLES.slice(0, 6)
                : CELEBRATION_PARTICLES
              ).map((particle, index) => (
                <span
                  key={`${particle.top}-${particle.left}`}
                  className={`absolute animate-bounce font-black ${
                    index % 3 === 0
                      ? 'text-4xl'
                      : index % 3 === 1
                        ? 'text-3xl'
                        : 'text-2xl'
                  } ${
                    isLegendaryReward
                      ? 'text-yellow-200'
                      : isEpicReward
                        ? 'text-fuchsia-300'
                        : 'text-blue-300'
                  }`}
                  style={{
                    top: particle.top,
                    left: particle.left,
                    animationDelay: particle.delay,
                    textShadow: isLegendaryReward
                      ? '0 0 18px rgba(250, 204, 21, 0.95)'
                      : isEpicReward
                        ? '0 0 18px rgba(217, 70, 239, 0.95)'
                        : '0 0 14px rgba(59, 130, 246, 0.9)',
                  }}
                >
                  {isLegendaryReward
                    ? particle.legendary
                    : isEpicReward
                      ? particle.epic
                      : particle.rare}
                </span>
              ))}
            </div>
          )}

          <div
            className={`relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-3xl border p-6 text-center shadow-2xl ${
              isLegendaryReward
                ? 'max-w-lg bg-gradient-to-b from-amber-950 via-magic-panel to-purple-950'
                : isEpicReward
                  ? 'max-w-lg bg-gradient-to-b from-purple-950 via-magic-panel to-indigo-950'
                  : isRareReward
                    ? 'max-w-md bg-gradient-to-b from-blue-950 via-magic-panel to-indigo-950'
                    : 'max-w-md bg-magic-panel'
            }`}
            style={{
              borderColor: `${RARITY_COLOR[openedReward.rarity]}99`,
              boxShadow: isLegendaryReward
                ? `0 0 90px ${RARITY_COLOR.legendary}aa`
                : isEpicReward
                  ? `0 0 70px ${RARITY_COLOR.epic}99`
                  : isRareReward
                    ? `0 0 52px ${RARITY_COLOR.rare}88`
                    : `0 0 38px ${RARITY_COLOR[openedReward.rarity]}45`,
            }}
          >
            {openedReward.isPreview && (
              <div className="mb-3 inline-block rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[10px] font-black text-white/70">
                תצוגת בדיקה בלבד
              </div>
            )}

            <div
              className={`mb-2 animate-bounce ${
                isLegendaryReward
                  ? 'text-7xl'
                  : isEpicReward
                    ? 'text-6xl'
                    : isRareReward
                      ? 'text-6xl'
                      : 'text-5xl'
              }`}
            >
              {isLegendaryReward
                ? '👑'
                : isEpicReward
                  ? '💥'
                  : isRareReward
                    ? '💎'
                    : '🎁'}
            </div>

            <div
              className={`mb-1 font-black ${
                isLegendaryReward
                  ? 'text-4xl text-yellow-300'
                  : isEpicReward
                    ? 'text-3xl text-fuchsia-300'
                    : isRareReward
                      ? 'text-3xl text-blue-300'
                      : 'text-2xl text-magic-accent'
              }`}
              style={
                isCelebrationReward
                  ? {
                      textShadow: `0 0 20px ${RARITY_COLOR[openedReward.rarity]}`,
                    }
                  : undefined
              }
            >
              {REWARD_TITLE_HE[openedReward.rarity]}
            </div>

            <div
              className={`mb-4 ${
                isCelebrationReward
                  ? 'text-sm font-bold text-white/80'
                  : 'text-xs text-magic-soft/60'
              }`}
            >
              {openedReward.isPreview
                ? 'התצוגה אינה צורכת קופסה ואינה מוסיפה חפץ למלאי'
                : REWARD_SUBTITLE_HE[openedReward.rarity]}
            </div>

            {!openedReward.isPreview &&
              openedReward.collectionOwned !== undefined &&
              openedReward.collectionTotal !== undefined && (
                <div
                  className={`mb-4 rounded-2xl border px-4 py-3 ${
                    openedReward.collectionOwned ===
                    openedReward.collectionTotal
                      ? 'border-yellow-300/60 bg-yellow-400/15'
                      : 'border-emerald-300/35 bg-emerald-400/10'
                  }`}
                >
                  <div
                    className={`font-black ${
                      openedReward.collectionOwned ===
                      openedReward.collectionTotal
                        ? 'text-lg text-yellow-300'
                        : 'text-emerald-300'
                    }`}
                  >
                    {openedReward.collectionOwned ===
                    openedReward.collectionTotal
                      ? `🏆 השלמת את אוסף ${themeNameOf(openedReward.themeId ?? null)}!`
                      : '🌟 חדש באוסף!'}
                  </div>

                  <div className="mt-1 text-xs font-bold text-white/75">
                    אוסף {themeNameOf(openedReward.themeId ?? null)}:{' '}
                    {openedReward.collectionOwned}/
                    {openedReward.collectionTotal}
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/30">
                    <div
                      className={`h-full rounded-full transition-all ${
                        openedReward.collectionOwned ===
                        openedReward.collectionTotal
                          ? 'bg-yellow-300'
                          : 'bg-emerald-400'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            (openedReward.collectionOwned /
                              Math.max(openedReward.collectionTotal, 1)) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

            <div
              className={`relative mb-4 overflow-hidden rounded-2xl border p-4 ${
                isLegendaryReward
                  ? 'bg-gradient-to-br from-yellow-500/20 via-magic-bg/70 to-purple-700/25'
                  : isEpicReward
                    ? 'bg-gradient-to-br from-fuchsia-600/20 via-magic-bg/70 to-indigo-700/25'
                    : isRareReward
                      ? 'bg-gradient-to-br from-blue-500/20 via-magic-bg/70 to-indigo-700/20'
                      : 'bg-magic-bg/55'
              }`}
              style={{
                borderColor: `${RARITY_COLOR[openedReward.rarity]}66`,
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                  background: `radial-gradient(circle, ${RARITY_COLOR[openedReward.rarity]} 0%, transparent 68%)`,
                }}
              />

              <div
                className={`relative mx-auto mb-3 max-w-full ${
                  isLegendaryReward
                    ? 'h-60 w-60'
                    : isEpicReward
                      ? 'h-52 w-52'
                      : isRareReward
                        ? 'h-48 w-48'
                        : 'h-44 w-44'
                }`}
              >
                {isMajorReward && (
                  <>
                    <div
                      className={`absolute inset-1 animate-spin rounded-full border-4 border-t-transparent ${
                        isLegendaryReward
                          ? 'border-yellow-300'
                          : 'border-fuchsia-400'
                      }`}
                    />
                    <div
                      className={`absolute inset-7 animate-ping rounded-full border-4 opacity-35 ${
                        isLegendaryReward
                          ? 'border-amber-100'
                          : 'border-purple-200'
                      }`}
                    />
                  </>
                )}

                {isRareReward && (
                  <div className="absolute inset-2 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                )}

                <div className="relative z-10 h-full w-full animate-pulse p-3">
                  <ItemSprite
                    itemId={openedReward.itemId}
                    rarity={openedReward.rarity}
                    fitWithinFrame
                  />
                </div>
              </div>

              <div
                className={`relative mb-1 font-black text-white ${
                  isCelebrationReward ? 'text-2xl' : 'text-xl'
                }`}
              >
                {openedReward.nameHe}
              </div>

              {openedReward.descriptionHe && (
                <div className="relative mb-3 text-sm text-magic-soft/80">
                  {openedReward.descriptionHe}
                </div>
              )}

              <div className="relative">
                <RarityBadge rarity={openedReward.rarity} />
              </div>
            </div>

            {openedReward.pityTriggered && (
              <div className="text-yellow-300 text-sm mb-4">
                ✨ מזל מובטח הופעל!
              </div>
            )}

            {openedReward.isPreview ? (
              <button
                type="button"
                onClick={() => setOpenedReward(null)}
                className="w-full rounded-xl bg-white/15 py-3 font-bold text-white hover:bg-white/20"
              >
                סגירת תצוגת הבדיקה
              </button>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setOpenedReward(null)}
                  className="rounded-xl bg-magic-accent py-3 font-bold text-magic-bg"
                >
                  להישאר במלאי
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOpenedReward(null);
                    onGoRoom();
                  }}
                  className="rounded-xl border border-magic-accent/40 bg-magic-accent/10 py-3 font-bold text-magic-accent hover:bg-magic-accent/20"
                >
                  לעבור לחדר 🏠
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {message && (
        <div className="bg-magic-soft/20 border border-magic-soft text-magic-soft rounded-xl p-2 mb-3 text-sm text-center">
          {message}
        </div>
      )}

      {import.meta.env.DEV && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-fuchsia-400/25 bg-fuchsia-500/10 p-3">
          <div>
            <div className="text-sm font-black text-fuchsia-200">
              בדיקת חגיגת זכייה — מקומי בלבד
            </div>
            <div className="text-[11px] text-magic-soft/55">
              לא צורך קופסה ולא משנה את המלאי
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => previewRewardCelebration('rare')}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-black text-white hover:bg-blue-500"
            >
              הצג נדיר
            </button>
            <button
              type="button"
              onClick={() => previewRewardCelebration('epic')}
              className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-black text-white hover:bg-purple-500"
            >
              הצג אפי
            </button>
            <button
              type="button"
              onClick={() => previewRewardCelebration('legendary')}
              className="rounded-lg bg-yellow-400 px-3 py-1.5 text-xs font-black text-yellow-950 hover:bg-yellow-300"
            >
              הצג אגדי
            </button>
          </div>
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
              <div className="mb-3 rounded-xl bg-black/15 p-2">
                <div className="mx-auto h-28 w-28 max-w-full">
                  {item ? (
                    <ItemSprite
                      itemId={entry.itemId}
                      rarity={rarity}
                      fitWithinFrame
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl">
                      {icon}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-1 flex items-start justify-between gap-2">
                <div className="text-white font-bold text-sm">{name}</div>
                {rarity && <RarityBadge rarity={rarity} />}
              </div>

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
