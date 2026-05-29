import { BOX_TIERS } from '../data/boxes';
import type { BoxTier, Rarity } from '../data/boxes';
import { ITEMS } from '../data/items';
import type { Item } from '../data/items';
import type { ThemeId } from '../data/themes';

const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

function rarityRank(rarity: Rarity): number {
  return RARITY_ORDER.indexOf(rarity);
}

function rollRarity(boxTier: BoxTier, pityCount: number): Rarity {
  const box = BOX_TIERS[boxTier];

  if (box.pity && pityCount + 1 >= box.pity.within) {
    return box.pity.rarity;
  }

  const roll = Math.random();
  let running = 0;

  for (const rarity of RARITY_ORDER) {
    running += box.odds[rarity] ?? 0;
    if (roll <= running) return rarity;
  }

  return 'common';
}

function pickRandom<T>(arr: T[]): T | null {
  if (arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

export type BoxOpenResult = {
  item: Item;
  newPityCount: number;
  pityTriggered: boolean;
};

export function openBoxReward(
  boxTier: BoxTier,
  theme: ThemeId,
  pityCount: number
): BoxOpenResult | null {
  const targetRarity = rollRarity(boxTier, pityCount);

  // קופסה כללית יכולה לתת רק פרסים כלליים.
  // קופסה נושאית, למשל שחמט, תנסה לתת רק פרסים של אותו נושא.
  const themeRewards = ITEMS.filter(item => {
    if (item.source !== 'box') return false;

    if (theme === 'generic') {
      return item.theme === 'generic';
    }

    return item.theme === theme;
  });

  // אם אין בכלל פרסים לנושא הזה, רק אז ניפול חזרה לפרסים כלליים
  // כדי שהמשחק לא ייתקע.
  const rewardsPool =
    themeRewards.length > 0
      ? themeRewards
      : ITEMS.filter(item => item.source === 'box' && item.theme === 'generic');

  if (rewardsPool.length === 0) return null;

  let candidates = rewardsPool.filter(item => item.rarity === targetRarity);

  if (candidates.length === 0) {
    candidates = rewardsPool.filter(
      item => rarityRank(item.rarity) >= rarityRank(targetRarity)
    );
  }

  if (candidates.length === 0) {
    candidates = rewardsPool;
  }

  const item = pickRandom(candidates);
  if (!item) return null;

  const box = BOX_TIERS[boxTier];
  const pityTriggered =
    !!box.pity &&
    pityCount + 1 >= box.pity.within &&
    rarityRank(item.rarity) >= rarityRank(box.pity.rarity);

  const newPityCount = pityTriggered ? 0 : pityCount + 1;

  return {
    item,
    newPityCount,
    pityTriggered,
  };
}