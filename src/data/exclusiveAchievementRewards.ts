import type { Rarity } from './boxes';
import type { Zone } from './items';
import type { DisplayKind } from './roomSurfaces';

export type ExclusiveAchievementItem = {
  id: string;
  nameHe: string;
  descriptionHe: string;
  rarity: Rarity;
  emoji: string;
  zones: Zone[];
  displayKind: DisplayKind;
  size: 1 | 2 | 3;
  achievementId: string;
};

export const EXCLUSIVE_ACHIEVEMENT_ITEMS: ExclusiveAchievementItem[] = [
  {
    id: 'achievement_collector_statuette',
    nameHe: 'פסלון האספן',
    descriptionHe: 'פסלון בלעדי למי שאסף 25 חפצי קופסאות שונים. אי אפשר להשיג אותו בקופסה או בחנות.',
    rarity: 'rare',
    emoji: '🏺',
    zones: ['shelf', 'desk'],
    displayKind: 'shelfItem',
    size: 1,
    achievementId: 'collector_25',
  },
  {
    id: 'achievement_crystal_showcase',
    nameHe: 'ויטרינת הקריסטל',
    descriptionHe: 'ויטרינה זוהרת בלעדית לאספנים שהגיעו ל־50 חפצים שונים.',
    rarity: 'epic',
    emoji: '💎',
    zones: ['floor', 'special'],
    displayKind: 'furniture',
    size: 2,
    achievementId: 'collector_50',
  },
  {
    id: 'achievement_kingdom_treasure_statue',
    nameHe: 'פסל אוצר הממלכה',
    descriptionHe: 'פסל אגדי שמסמן אוסף של 100 חפצים שונים. רק אספנים יוצאי דופן יכולים להציג אותו.',
    rarity: 'legendary',
    emoji: '👑',
    zones: ['floor', 'special'],
    displayKind: 'furniture',
    size: 3,
    achievementId: 'collector_100',
  },
  {
    id: 'achievement_legends_pedestal',
    nameHe: 'כן האגדות',
    descriptionHe: 'כן בוהק שנפתח רק לאחר איסוף חמישה חפצי Legendary שונים.',
    rarity: 'epic',
    emoji: '🔥',
    zones: ['floor', 'special'],
    displayKind: 'floorItem',
    size: 2,
    achievementId: 'legendary_5',
  },
  {
    id: 'achievement_hall_of_fame_banner',
    nameHe: 'דגל היכל התהילה',
    descriptionHe: 'דגל אגדי שמוענק למי שקיבל לפחות גביע אחד מכל ששת סוגי הגביעים.',
    rarity: 'legendary',
    emoji: '🏛️',
    zones: ['wall'],
    displayKind: 'wallDecor',
    size: 2,
    achievementId: 'all_trophy_types',
  },
];

export const EXCLUSIVE_ACHIEVEMENT_ITEM_BY_ID: Record<string, ExclusiveAchievementItem> =
  Object.fromEntries(EXCLUSIVE_ACHIEVEMENT_ITEMS.map(item => [item.id, item]));

export function getExclusiveAchievementItem(
  itemId: string
): ExclusiveAchievementItem | null {
  return EXCLUSIVE_ACHIEVEMENT_ITEM_BY_ID[itemId] ?? null;
}

export type StudentRoomId = 'main' | 'hobby_room' | 'treasure_gallery';

export type StudentRoomDefinition = {
  id: StudentRoomId;
  nameHe: string;
  shortNameHe: string;
  emoji: string;
  descriptionHe: string;
  unlockId: string | null;
  levelRequired: number;
};

export const STUDENT_ROOMS: StudentRoomDefinition[] = [
  {
    id: 'main',
    nameHe: 'החדר הראשי',
    shortNameHe: 'חדר ראשי',
    emoji: '🏰',
    descriptionHe: 'החדר הראשון של הממלכה שלך.',
    unlockId: null,
    levelRequired: 1,
  },
  {
    id: 'hobby_room',
    nameHe: 'חדר התחביבים',
    shortNameHe: 'חדר התחביבים',
    emoji: '🧩',
    descriptionHe: 'חדר נוסף וחופשי שנפתח ברמה 6 ונותן מקום לעוד אוספים, יצירות ותחביבים.',
    unlockId: null,
    levelRequired: 6,
  },
  {
    id: 'treasure_gallery',
    nameHe: 'גלריית האוצרות',
    shortNameHe: 'גלריית האוצרות',
    emoji: '👑',
    descriptionHe: 'חדר נוסף ובלעדי לאספנים שהגיעו ל־100 חפצים שונים.',
    unlockId: 'room_treasure_gallery',
    levelRequired: 1,
  },
];

export function availableStudentRooms(
  specialUnlocks: Array<{ kind: string; unlockId: string }> | undefined,
  studentLevel = 1
): StudentRoomDefinition[] {
  const unlockKeys = new Set(
    (specialUnlocks ?? []).map(unlock => `${unlock.kind}:${unlock.unlockId}`)
  );

  return STUDENT_ROOMS.filter(room => {
    if (studentLevel < room.levelRequired) return false;
    return room.unlockId === null || unlockKeys.has(`room:${room.unlockId}`);
  });
}
