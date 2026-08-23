import { ITEMS, type Zone } from './items';
import { COSMETICS, type CosmeticCategory } from './cosmetics';
import {
  EXCLUSIVE_ACHIEVEMENT_ITEMS,
} from './exclusiveAchievementRewards';
import type { Rarity } from './boxes';
import type { DisplayKind } from './roomSurfaces';

export type ItemLabSource =
  | 'box'
  | 'levelReward'
  | 'shop'
  | 'teacherTrophy'
  | 'classUnlock'
  | 'achievement';

export type ItemLabItem = {
  id: string;
  nameHe: string;
  descriptionHe: string;
  rarity: Rarity;
  zones: Zone[];
  size: 1 | 2 | 3;
  theme: string;
  source: ItemLabSource;
  modelRef: string;
  displayKind?: DisplayKind;
};

function zonesForCosmeticCategory(category: CosmeticCategory): Zone[] {
  if (category === 'frame' || category === 'banner' || category === 'wall' || category === 'badge') {
    return ['wall', 'special'];
  }

  if (category === 'desk' || category === 'lighting') {
    return ['desk', 'shelf', 'special'];
  }

  if (category === 'shelf') {
    return ['shelf', 'wall', 'special'];
  }

  if (category === 'pet') {
    return ['shelf', 'floor', 'special', 'petarea'];
  }

  return ['special'];
}

function displayKindForCosmeticCategory(category: CosmeticCategory): DisplayKind | undefined {
  if (category === 'frame' || category === 'banner' || category === 'wall' || category === 'badge') {
    return 'wallDecor';
  }

  if (category === 'desk' || category === 'lighting') {
    return 'tableItem';
  }

  if (category === 'shelf') {
    return 'shelfItem';
  }

  if (category === 'pet') {
    return 'floorItem';
  }

  return undefined;
}

const normalItems: ItemLabItem[] = ITEMS.map(item => ({
  id: item.id,
  nameHe: item.nameHe,
  descriptionHe: item.descriptionHe,
  rarity: item.rarity,
  zones: item.zones,
  size: item.size,
  theme: item.theme,
  source: item.source,
  modelRef: item.modelRef,
  displayKind: item.displayKind,
}));

const normalIds = new Set(normalItems.map(item => item.id));

// cosmetics.ts is still the source used by the level-up reward picker.
// Most entries also exist in ITEMS, but this keeps the lab complete even when
// a cosmetic (for example banner_kingdom) exists only in the reward pool.
const cosmeticOnlyItems: ItemLabItem[] = COSMETICS.filter(
  cosmetic => !normalIds.has(cosmetic.id),
).map(cosmetic => ({
  id: cosmetic.id,
  nameHe: cosmetic.nameHe,
  descriptionHe: cosmetic.descHe,
  rarity: cosmetic.rarity,
  zones: zonesForCosmeticCategory(cosmetic.category),
  size: 1,
  theme: 'generic',
  source: 'levelReward',
  modelRef: cosmetic.id,
  displayKind: displayKindForCosmeticCategory(cosmetic.category),
}));

const achievementItems: ItemLabItem[] = EXCLUSIVE_ACHIEVEMENT_ITEMS.map(item => ({
  id: item.id,
  nameHe: item.nameHe,
  descriptionHe: item.descriptionHe,
  rarity: item.rarity,
  zones: item.zones,
  size: item.size,
  theme: 'achievement',
  source: 'achievement',
  modelRef: item.id,
  displayKind: item.displayKind,
}));

export const ITEM_LAB_ITEMS: ItemLabItem[] = [
  ...normalItems,
  ...cosmeticOnlyItems,
  ...achievementItems,
];

export const ITEM_LAB_SOURCE_LABEL_HE: Record<ItemLabSource, string> = {
  box: 'תיבות',
  levelReward: 'עליית רמה / קוסמטיקה',
  shop: 'חנות',
  teacherTrophy: 'פרסי מורה',
  classUnlock: 'פרסי כיתה',
  achievement: 'פרסי הישגים',
};
