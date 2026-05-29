// XP needed to REACH this level (cumulative). Index 0 = level 1 = 0 XP.
// Curve: ~17% growth per level, gentle start.
function buildXpTable(maxLevel: number): number[] {
  const table: number[] = [0]; // level 1
  let cost = 20; // XP to go from 1 -> 2
  let cumulative = 0;
  for (let l = 2; l <= maxLevel; l++) {
    cumulative += Math.round(cost);
    table.push(cumulative);
    cost *= 1.17;
  }
  return table;
}

export const MAX_LEVEL = 20;
export const XP_TABLE = buildXpTable(MAX_LEVEL);

// Point bonus given at each level-up
export function pointBonusForLevel(level: number): number {
  if (level <= 3) return 5;
  if (level <= 6) return 10;
  if (level <= 10) return 15;
  return 20;
}

// What capacity gets bumped at each level (cycles through)
export const CAPACITY_BUMP_CYCLE = [
  'inventory', 'displayShelf', 'wallSlots', 'desk', 'petArea',
] as const;
export type CapacityKey = typeof CAPACITY_BUMP_CYCLE[number];
