import type { CapacityKey } from '../data/levels';
import { CAPACITY_BUMP_CYCLE, pointBonusForLevel } from '../data/levels';
import type { Cosmetic } from '../data/cosmetics';
import { COSMETICS } from '../data/cosmetics';

/**
 * Which capacity gets bumped when reaching `newLevel`.
 * Level 2 -> index 0, level 3 -> index 1, ... cycles.
 */
export function capacityBumpForLevel(newLevel: number): CapacityKey {
  const idx = (newLevel - 2) % CAPACITY_BUMP_CYCLE.length;
  return CAPACITY_BUMP_CYCLE[(idx + CAPACITY_BUMP_CYCLE.length) % CAPACITY_BUMP_CYCLE.length];
}

/**
 * Roll 3 distinct cosmetic choices for the player, excluding ones they already own.
 * Weighted by rarity so common is most likely, legendary rarest.
 */
const RARITY_WEIGHT: Record<string, number> = {
  common: 60,
  rare: 28,
  epic: 10,
  legendary: 2,
};

export function rollCosmeticChoices(
  ownedIds: string[],
  count = 3,
  rng: () => number = Math.random,
): Cosmetic[] {
  const owned = new Set(ownedIds);
  const pool = COSMETICS.filter((c) => !owned.has(c.id));
  if (pool.length === 0) return [];

  const picks: Cosmetic[] = [];
  const working = [...pool];

  while (picks.length < count && working.length > 0) {
    const totalWeight = working.reduce(
      (sum, c) => sum + (RARITY_WEIGHT[c.rarity] ?? 1),
      0,
    );
    let r = rng() * totalWeight;
    let chosenIdx = 0;
    for (let i = 0; i < working.length; i++) {
      r -= RARITY_WEIGHT[working[i].rarity] ?? 1;
      if (r <= 0) {
        chosenIdx = i;
        break;
      }
    }
    picks.push(working[chosenIdx]);
    working.splice(chosenIdx, 1);
  }

  return picks;
}

export function pointBonus(newLevel: number): number {
  return pointBonusForLevel(newLevel);
}
