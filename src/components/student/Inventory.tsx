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
import ItemSprite from './ItemSprite';

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

const RARITY_ORDER: Rarity[] = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
];

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

  const ownedItemIds = new Set(
    student.inventory
      .filter((entry) => entry.kind !== 'box')
      .map((entry) => entry.itemId)
  );

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

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {rarityItems.map((item) => {
                      const isOwned = ownedItemIds.has(item.id);

                      return (
                        <div
                          key={item.id}
                          className={`rounded-xl border p-2 text-center ${
                            isOwned
                              ? 'border-emerald-400/35 bg-emerald-500/10'
                              : 'border-white/10 bg-magic-bg/40'
                          }`}
                        >
                          <div className="mx-auto mb-2 h-20 w-20">
                            <ItemSprite itemId={item.id} rarity={item.rarity} />
                          </div>
                          <div className="text-xs font-bold text-white">
                            {item.nameHe}
                          </div>
                          {isOwned && (
                            <div className="mt-1 text-[10px] font-bold text-emerald-300">
                              כבר בבעלותך ✓
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

      <div className="text-magic-soft/70 text-xs mb-2 text-left" dir="ltr">
        {student.inventory.length} / {student.capacities.inventory}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {student.inventory.map((entry, idx) => {
          if (entry.kind === 'box' && entry.boxTier) {
            const boxTier = entry.boxTier;
            const boxTheme =
              entry.boxTheme ?? student.unlockedThemes[0] ?? 'generic';
            const box = BOX_TIERS[boxTier];
            const theme = THEMES.find((t) => t.id === boxTheme);
            const themeName = theme?.nameHe ?? 'כללי';

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
    </div>
  );
}
