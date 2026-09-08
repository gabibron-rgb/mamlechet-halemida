import { achievementById, ACHIEVEMENTS } from '../data/achievements';
import { RARITY_LABEL_HE, type Rarity } from '../data/boxes';
import { getExclusiveAchievementItem } from '../data/exclusiveAchievementRewards';
import { getItemById, ITEMS } from '../data/items';
import { SPECIAL_JOURNEYS } from '../data/specialJourneys';
import { THEMES } from '../data/themes';

type InventoryLikeEntry = {
  id?: string;
  itemId: string;
  kind?: 'item' | 'cosmetic' | 'box';
  acquiredAt?: number | null;
};

export type ItemHistoryInfo = {
  acquiredDateHe: string | null;
  originTitleHe: string;
  originDetailHe: string | null;
  collectionProgressHe: string | null;
  rarityContextHe: string | null;
  exclusive: boolean;
};

const EXTRA_THEME_NAMES: Record<string, string> = {
  ballet: 'בלט',
};

function themeNameOf(themeId: string): string {
  return (
    THEMES.find(theme => theme.id === themeId)?.nameHe ??
    EXTRA_THEME_NAMES[themeId] ??
    themeId
  );
}

function formatAcquiredDate(value: number | null | undefined): string | null {
  if (!value || !Number.isFinite(value) || value <= 0) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function achievementOrigin(itemId: string): { title: string; detail: string } | null {
  const exclusive = getExclusiveAchievementItem(itemId);
  if (exclusive) {
    const achievement = achievementById(exclusive.achievementId);
    return {
      title: 'פריט בלעדי מהישג',
      detail: achievement
        ? `${achievement.emoji} ${achievement.titleHe} — ${achievement.descriptionHe}`
        : 'הפריט הזה ניתן רק דרך הישג מיוחד.',
    };
  }

  const achievement = ACHIEVEMENTS.find(definition =>
    (definition.rewards ?? []).some(
      reward => reward.kind === 'inventoryItem' && reward.itemId === itemId
    )
  );

  if (!achievement) return null;

  return {
    title: 'פרס מהישג',
    detail: `${achievement.emoji} ${achievement.titleHe} — ${achievement.descriptionHe}`,
  };
}

function journeyOrigin(itemId: string): { title: string; detail: string } | null {
  const journey = SPECIAL_JOURNEYS.find(definition =>
    definition.rewards.some(
      reward => reward.kind === 'inventoryItem' && reward.itemId === itemId
    )
  );

  if (!journey) return null;

  return {
    title: 'פרס ממסע מיוחד',
    detail: `${journey.emoji} ${journey.titleHe}`,
  };
}

function itemRarity(itemId: string): Rarity | null {
  const regular = getItemById(itemId);
  if (regular) return regular.rarity;

  return getExclusiveAchievementItem(itemId)?.rarity ?? null;
}

export function buildItemHistory(
  entry: InventoryLikeEntry,
  inventory: InventoryLikeEntry[]
): ItemHistoryInfo {
  const item = getItemById(entry.itemId);
  const exclusive = getExclusiveAchievementItem(entry.itemId);
  const acquiredDateHe = formatAcquiredDate(entry.acquiredAt);

  const achievement = achievementOrigin(entry.itemId);
  const journey = journeyOrigin(entry.itemId);

  let originTitleHe = 'פריט מהדרך שלך בממלכה';
  let originDetailHe: string | null = null;

  if (achievement) {
    originTitleHe = achievement.title;
    originDetailHe = achievement.detail;
  } else if (journey) {
    originTitleHe = journey.title;
    originDetailHe = journey.detail;
  } else if (item?.source === 'box') {
    originTitleHe = `התגלה בקופסת ${themeNameOf(item.theme)}`;
    originDetailHe = 'זהו חפץ מאוסף קופסאות הנושא.';
  } else if (item?.source === 'shop') {
    originTitleHe = 'נרכש בחנות';
    originDetailHe = 'הפריט נקנה בנקודות שנצברו בממלכה.';
  } else if (item?.source === 'levelReward' || entry.kind === 'cosmetic') {
    originTitleHe = 'פרס מהתקדמות ברמות';
    originDetailHe = 'פריט שנפתח לאורך ההתקדמות בממלכה.';
  } else if (item?.source === 'teacherTrophy') {
    originTitleHe = 'פרס אישי מהמורה';
    originDetailHe = 'פריט מיוחד שהוענק כהוקרה.';
  } else if (item?.source === 'classUnlock') {
    originTitleHe = 'נפתח דרך הממלכה הכיתתית';
    originDetailHe = 'פריט שנפתח כחלק מההתקדמות המשותפת של הכיתה.';
  } else if (exclusive) {
    originTitleHe = 'פריט בלעדי';
    originDetailHe = 'אי אפשר לקבל את הפריט הזה מקופסה רגילה.';
  }

  let collectionProgressHe: string | null = null;
  if (item?.source === 'box') {
    const themeItems = ITEMS.filter(
      candidate => candidate.source === 'box' && candidate.theme === item.theme
    );
    const ownedIds = new Set(
      inventory
        .filter(candidate => candidate.kind !== 'box')
        .map(candidate => candidate.itemId)
    );
    const ownedCount = themeItems.filter(candidate => ownedIds.has(candidate.id)).length;

    collectionProgressHe = `אוסף ${themeNameOf(item.theme)}: ${ownedCount} מתוך ${themeItems.length}`;
  }

  const rarity = itemRarity(entry.itemId);
  let rarityContextHe: string | null = null;
  if (rarity === 'rare' || rarity === 'epic' || rarity === 'legendary') {
    const ownedUnique = new Set<string>();

    for (const candidate of inventory) {
      if (candidate.kind === 'box') continue;
      if (itemRarity(candidate.itemId) === rarity) {
        ownedUnique.add(candidate.itemId);
      }
    }

    rarityContextHe = `כרגע יש באוסף הזה ${ownedUnique.size} פריטי ${RARITY_LABEL_HE[rarity]} שונים.`;
  }

  return {
    acquiredDateHe,
    originTitleHe,
    originDetailHe,
    collectionProgressHe,
    rarityContextHe,
    exclusive: Boolean(achievement || journey || exclusive),
  };
}
