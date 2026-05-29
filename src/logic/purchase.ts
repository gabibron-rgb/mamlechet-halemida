import type { Item } from '../data/items';
import { xpFromSpending } from './economy';
import { levelFromXp } from './leveling';
import type { StudentState } from '../store/useGameStore';

export type PurchaseResult = {
  ok: boolean;
  reason?: string;
  pointsAfter?: number;
  xpAfter?: number;
  levelBefore?: number;
  levelAfter?: number;
  leveledUp?: boolean;
};

export type SpendKind = 'shop' | 'box' | 'upgrade' | 'companionCare' | 'classDonation';

export function canAffordItem(student: StudentState, item: Item): PurchaseResult {
  if (student.level < item.levelRequired) {
    return { ok: false, reason: 'רמה לא מספיקה' };
  }
  if (item.price <= 0) {
    return { ok: false, reason: 'הפריט לא זמין לקנייה' };
  }
  if (student.points < item.price) {
    return { ok: false, reason: 'אין מספיק נקודות' };
  }
  if (student.inventory.length >= student.capacities.inventory) {
    return { ok: false, reason: 'המלאי מלא' };
  }
  return { ok: true };
}

export function xpForSpend(amount: number, kind: SpendKind): number {
  let mult = 1;
  if (kind === 'classDonation') mult = 1.25;
  if (kind === 'companionCare') mult = 1.25;
  return xpFromSpending(amount, mult);
}

/**
 * Compute the new student state after a purchase. Does NOT mutate.
 * Returns null if not affordable.
 */
export function applyPurchase(
  student: StudentState,
  item: Item,
  kind: SpendKind = 'shop'
): { next: StudentState; result: PurchaseResult } | null {
  const check = canAffordItem(student, item);
  if (!check.ok) return { next: student, result: check } as any;

  const xpGain = xpForSpend(item.price, kind) + (item.xpOnPurchaseBonus ?? 0);
  const newPoints = student.points - item.price;
  const newXp = student.xp + xpGain;
  const levelBefore = student.level;
  const levelAfter = levelFromXp(newXp);
  const leveledUp = levelAfter > levelBefore;

  const next: StudentState = {
    ...student,
    points: newPoints,
    xp: newXp,
    level: levelAfter,
    inventory: [
      ...student.inventory,
      {
        itemId: item.id,
        acquiredAt: Date.now(),
        placedZone: null,
        placedSlot: null,
      },
    ],
    pendingLevelUps: student.pendingLevelUps + (leveledUp ? (levelAfter - levelBefore) : 0),
  };

  return {
    next,
    result: {
      ok: true,
      pointsAfter: newPoints,
      xpAfter: newXp,
      levelBefore,
      levelAfter,
      leveledUp,
    },
  };
}
