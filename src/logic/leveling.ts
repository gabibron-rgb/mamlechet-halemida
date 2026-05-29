import { XP_TABLE, MAX_LEVEL } from '../data/levels';

export function levelFromXp(xp: number): number {
  let level = 1;
  for (let i = 0; i < XP_TABLE.length; i++) {
    if (xp >= XP_TABLE[i]) level = i + 1;
    else break;
  }
  return Math.min(level, MAX_LEVEL);
}

export function xpToNextLevel(xp: number): {
  current: number;
  needed: number;
  level: number;
  isMax: boolean;
} {
  const level = levelFromXp(xp);
  const currentLevelXp = XP_TABLE[level - 1] ?? 0;
  const nextLevelXp = XP_TABLE[level]; // undefined if no next level defined

  // Max level reached, either by cap or by running out of table entries
  if (level >= MAX_LEVEL || nextLevelXp === undefined) {
    return {
      current: xp - currentLevelXp,
      needed: xp - currentLevelXp, // makes ratio = 1 (full bar)
      level,
      isMax: true,
    };
  }

  return {
    current: xp - currentLevelXp,
    needed: nextLevelXp - currentLevelXp,
    level,
    isMax: false,
  };
}
