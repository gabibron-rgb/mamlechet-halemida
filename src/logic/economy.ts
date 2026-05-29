import type { Item } from '../data/items';

// Base XP rate: 1 XP per 2 points spent.
export function xpFromSpending(pointsSpent: number, multiplier = 1): number {
  return Math.floor((pointsSpent / 2) * multiplier);
}

export const XP_MULT_CLASS_DONATION = 1.25;
export const XP_MULT_COMPANION_CARE = 1.25;

export function sellValueOf(item: Item): number {
  if (item.isBound) return 0;
  return item.sellValue;
}

export function canSell(item: Item): boolean {
  return !item.isBound && item.sellValue > 0;
}
