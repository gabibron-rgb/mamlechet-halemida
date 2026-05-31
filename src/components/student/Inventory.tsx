import { useState } from 'react';
import { getItemById } from '../../data/items';
import { COSMETIC_BY_ID } from '../../data/cosmetics';
import { useGameStore, type StudentState } from '../../store/useGameStore';
import { canSell, sellValueOf } from '../../logic/economy';
import RarityBadge from '../shared/RarityBadge';
import { BOX_TIERS, RARITY_LABEL_HE } from '../../data/boxes';
import { openBoxReward } from '../../logic/boxes';
import { THEMES } from '../../data/themes';

type Props = {
  student: StudentState;
};

type OpenedReward = {
  nameHe: string;
  descriptionHe?: string;
  rarity: keyof typeof RARITY_LABEL_HE;
  pityTriggered: boolean;
};

export default function Inventory({ student }: Props) {
  const updateStudent = useGameStore((s) => s.updateStudent);

  const [message, setMessage] = useState<string | null>(null);
  const [openedReward, setOpenedReward] = useState<OpenedReward | null>(null);

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
            const box = BOX_TIERS[entry.boxTier];
            const theme = THEMES.find((t) => t.id === entry.boxTheme);
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

                <button
                  type="button"
                  onClick={() => openBox(idx)}
                  className="bg-magic-accent text-magic-bg font-bold py-2 rounded-xl text-sm mt-2 w-full"
                >
                  פתח/י קופסה
                </button>
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