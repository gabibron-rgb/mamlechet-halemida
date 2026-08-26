export type ClassRoomChoiceGroupId =
  | 'path_gift'
  | 'kingdom_identity'
  | 'legacy_gift';

export type ClassRoomItemId =
  | 'royal_banner'
  | 'unity_shield'
  | 'star_portrait'
  | 'kingdom_trophy'
  | 'star_globe'
  | 'crystal_plant'
  | 'treasure_chest'
  | 'courage_lantern'
  | 'persistence_clock'
  | 'curiosity_books'
  | 'imagination_crystal'
  | 'unity_statue'
  | 'inspiration_crown'
  | 'dream_compass'
  | 'light_tree'
  | 'achievement_fountain';

export type ClassRoomItemCategory = 'decor' | 'object';
export type ClassRoomItemRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type ClassRoomItemUnlockKind = 'automatic' | 'choice';

export type ClassRoomItemArtKind =
  | 'banner'
  | 'shield'
  | 'portrait'
  | 'trophy'
  | 'globe'
  | 'plant'
  | 'chest'
  | 'lantern'
  | 'clock'
  | 'books'
  | 'crystal'
  | 'statue'
  | 'crown'
  | 'compass'
  | 'tree'
  | 'fountain';

export type ClassRoomItemDefinition = {
  id: ClassRoomItemId;
  nameHe: string;
  descriptionHe: string;
  defaultX: number;
  defaultY: number;
  defaultScale: number;
  artKind: ClassRoomItemArtKind;
  category: ClassRoomItemCategory;
  rarity: ClassRoomItemRarity;
  unlockStars: number;
  unlockTitleHe: string;
  unlockReasonHe: string;
  unlockKind: ClassRoomItemUnlockKind;
  choiceGroupId?: ClassRoomChoiceGroupId;
};

export type ClassRoomChoiceGroupDefinition = {
  id: ClassRoomChoiceGroupId;
  stars: number;
  titleHe: string;
  subtitleHe: string;
  descriptionHe: string;
  optionIds: ClassRoomItemId[];
};

export const CLASS_ROOM_ITEMS: ClassRoomItemDefinition[] = [
  {
    id: 'royal_banner',
    nameHe: 'דגל ההתחלה',
    descriptionHe: 'דגל סגול־זהב שמנציח את היעד הכיתתי הראשון שהושלם.',
    defaultX: 24,
    defaultY: 38,
    defaultScale: 1,
    artKind: 'banner',
    category: 'decor',
    rarity: 'common',
    unlockStars: 1,
    unlockTitleHe: 'המזכרת הראשונה',
    unlockReasonHe: 'נפתח יחד עם כוכב הממלכה הראשון — ההוכחה שהכיתה יצאה לדרך משותפת.',
    unlockKind: 'automatic',
  },
  {
    id: 'unity_shield',
    nameHe: 'מגן השותפות',
    descriptionHe: 'סמל שמייצג שיתוף פעולה והצלחות שמגיעות מעבודה משותפת.',
    defaultX: 76,
    defaultY: 38,
    defaultScale: 1,
    artKind: 'shield',
    category: 'decor',
    rarity: 'common',
    unlockStars: 2,
    unlockTitleHe: 'שתי הצלחות יחד',
    unlockReasonHe: 'נפתח ב־2 כוכבים, כשהממלכה כבר מתחילה להפוך ממאמץ חד־פעמי להרגל כיתתי.',
    unlockKind: 'automatic',
  },
  {
    id: 'star_portrait',
    nameHe: 'תמונת הדרך',
    descriptionHe: 'תמונה ממוסגרת של שמי הממלכה, לזכר שלושת היעדים הראשונים.',
    defaultX: 20,
    defaultY: 49,
    defaultScale: 1,
    artKind: 'portrait',
    category: 'decor',
    rarity: 'rare',
    unlockStars: 3,
    unlockTitleHe: 'חותם השותפות',
    unlockReasonHe: 'נפתחת ב־3 כוכבים יחד עם אבן הדרך הראשונה שמרגישה כבר כמו מסורת כיתתית.',
    unlockKind: 'automatic',
  },
  {
    id: 'courage_lantern',
    nameHe: 'פנס האומץ',
    descriptionHe: 'פנס זהוב שמסמל את הרגע שבו הכיתה בחרה להמשיך גם כשמשהו היה קשה.',
    defaultX: 18,
    defaultY: 62,
    defaultScale: 1,
    artKind: 'lantern',
    category: 'object',
    rarity: 'rare',
    unlockStars: 4,
    unlockTitleHe: 'מתנת הדרך הראשונה',
    unlockReasonHe: 'אחת משלוש מזכרות לבחירה ב־4 כוכבים.',
    unlockKind: 'choice',
    choiceGroupId: 'path_gift',
  },
  {
    id: 'persistence_clock',
    nameHe: 'שעון ההתמדה',
    descriptionHe: 'שעון קסום שמזכיר שהתקדמות גדולה נוצרת מהמון רגעים קטנים של התמדה.',
    defaultX: 50,
    defaultY: 32,
    defaultScale: 1,
    artKind: 'clock',
    category: 'decor',
    rarity: 'rare',
    unlockStars: 4,
    unlockTitleHe: 'מתנת הדרך הראשונה',
    unlockReasonHe: 'אחת משלוש מזכרות לבחירה ב־4 כוכבים.',
    unlockKind: 'choice',
    choiceGroupId: 'path_gift',
  },
  {
    id: 'curiosity_books',
    nameHe: 'מדף הסקרנות',
    descriptionHe: 'אוסף ספרים קטן שמייצג שאלות טובות, רעיונות חדשים והרצון לדעת עוד.',
    defaultX: 82,
    defaultY: 64,
    defaultScale: 1,
    artKind: 'books',
    category: 'object',
    rarity: 'rare',
    unlockStars: 4,
    unlockTitleHe: 'מתנת הדרך הראשונה',
    unlockReasonHe: 'אחת משלוש מזכרות לבחירה ב־4 כוכבים.',
    unlockKind: 'choice',
    choiceGroupId: 'path_gift',
  },
  {
    id: 'star_globe',
    nameHe: 'גלובוס הכוכבים',
    descriptionHe: 'כדור קסום שמציג מסלולי כוכבים ומסמל את התרחבות הממלכה.',
    defaultX: 58,
    defaultY: 78,
    defaultScale: 1,
    artKind: 'globe',
    category: 'object',
    rarity: 'rare',
    unlockStars: 5,
    unlockTitleHe: 'הממלכה מתרחבת',
    unlockReasonHe: 'נפתח ב־5 כוכבים, כשהכיתה מגיעה לרמת ממלכה מאוחדת ומתחילה לפתוח אזורים חדשים.',
    unlockKind: 'automatic',
  },
  {
    id: 'crystal_plant',
    nameHe: 'צמח ההתמדה',
    descriptionHe: 'צמח קריסטל זוהר שמסמל התקדמות שנבנתה לאורך זמן.',
    defaultX: 34,
    defaultY: 84,
    defaultScale: 1,
    artKind: 'plant',
    category: 'object',
    rarity: 'rare',
    unlockStars: 6,
    unlockTitleHe: 'חותם ההתמדה',
    unlockReasonHe: 'נפתח ב־6 כוכבים — מזכרת לכך שהכיתה המשיכה גם אחרי ההתלהבות של ההתחלה.',
    unlockKind: 'automatic',
  },
  {
    id: 'imagination_crystal',
    nameHe: 'קריסטל הדמיון',
    descriptionHe: 'קריסטל זוהר שמשנה גוון ומסמל פתרונות יצירתיים ורעיונות שלא היו שם קודם.',
    defaultX: 28,
    defaultY: 72,
    defaultScale: 1,
    artKind: 'crystal',
    category: 'object',
    rarity: 'epic',
    unlockStars: 8,
    unlockTitleHe: 'בחירת הזהות של הממלכה',
    unlockReasonHe: 'אחת משלוש מזכרות לבחירה ב־8 כוכבים.',
    unlockKind: 'choice',
    choiceGroupId: 'kingdom_identity',
  },
  {
    id: 'unity_statue',
    nameHe: 'פסל האחדות',
    descriptionHe: 'פסל כיתתי שמסמל כוח שנוצר כשכל אחד מביא משהו אחר אל הקבוצה.',
    defaultX: 50,
    defaultY: 73,
    defaultScale: 1,
    artKind: 'statue',
    category: 'object',
    rarity: 'epic',
    unlockStars: 8,
    unlockTitleHe: 'בחירת הזהות של הממלכה',
    unlockReasonHe: 'אחת משלוש מזכרות לבחירה ב־8 כוכבים.',
    unlockKind: 'choice',
    choiceGroupId: 'kingdom_identity',
  },
  {
    id: 'inspiration_crown',
    nameHe: 'כתר ההשראה',
    descriptionHe: 'כתר חגיגי שמוקדש לרגעים שבהם תלמידים מצליחים להרים זה את זה ולתת השראה.',
    defaultX: 72,
    defaultY: 36,
    defaultScale: 1,
    artKind: 'crown',
    category: 'decor',
    rarity: 'epic',
    unlockStars: 8,
    unlockTitleHe: 'בחירת הזהות של הממלכה',
    unlockReasonHe: 'אחת משלוש מזכרות לבחירה ב־8 כוכבים.',
    unlockKind: 'choice',
    choiceGroupId: 'kingdom_identity',
  },
  {
    id: 'kingdom_trophy',
    nameHe: 'גביע עשרת היעדים',
    descriptionHe: 'גביע כיתתי חגיגי שמנציח הישג דו־ספרתי ראשון.',
    defaultX: 42,
    defaultY: 78,
    defaultScale: 1,
    artKind: 'trophy',
    category: 'object',
    rarity: 'epic',
    unlockStars: 10,
    unlockTitleHe: 'עשרה הישגים משותפים',
    unlockReasonHe: 'נפתח ב־10 כוכבים. זה כבר לא רצף קצר — זו היסטוריה כיתתית שאפשר להציג בגאווה.',
    unlockKind: 'automatic',
  },
  {
    id: 'dream_compass',
    nameHe: 'מצפן החלומות',
    descriptionHe: 'מצפן שלא מצביע לצפון אלא אל הדבר הבא שהכיתה רוצה לגלות ולהשיג.',
    defaultX: 24,
    defaultY: 76,
    defaultScale: 1,
    artKind: 'compass',
    category: 'object',
    rarity: 'epic',
    unlockStars: 12,
    unlockTitleHe: 'מתנת המורשת הראשונה',
    unlockReasonHe: 'אחת משלוש מזכרות לבחירה ב־12 כוכבים.',
    unlockKind: 'choice',
    choiceGroupId: 'legacy_gift',
  },
  {
    id: 'light_tree',
    nameHe: 'עץ האור',
    descriptionHe: 'עץ קסום קטן שכל נקודת אור בו מייצגת הצלחה שנוספה לסיפור המשותף.',
    defaultX: 50,
    defaultY: 75,
    defaultScale: 1,
    artKind: 'tree',
    category: 'object',
    rarity: 'epic',
    unlockStars: 12,
    unlockTitleHe: 'מתנת המורשת הראשונה',
    unlockReasonHe: 'אחת משלוש מזכרות לבחירה ב־12 כוכבים.',
    unlockKind: 'choice',
    choiceGroupId: 'legacy_gift',
  },
  {
    id: 'achievement_fountain',
    nameHe: 'מזרקת ההישגים',
    descriptionHe: 'מזרקה זוהרת שמסמלת ממלכה שכבר צברה מספיק סיפורים כדי להתחיל מסורת אמיתית.',
    defaultX: 76,
    defaultY: 78,
    defaultScale: 1,
    artKind: 'fountain',
    category: 'object',
    rarity: 'epic',
    unlockStars: 12,
    unlockTitleHe: 'מתנת המורשת הראשונה',
    unlockReasonHe: 'אחת משלוש מזכרות לבחירה ב־12 כוכבים.',
    unlockKind: 'choice',
    choiceGroupId: 'legacy_gift',
  },
  {
    id: 'treasure_chest',
    nameHe: 'תיבת האוצר הכיתתית',
    descriptionHe: 'תיבה חגיגית שמסמלת אוסף גדול של זיכרונות והצלחות משותפות.',
    defaultX: 66,
    defaultY: 84,
    defaultScale: 1,
    artKind: 'chest',
    category: 'object',
    rarity: 'legendary',
    unlockStars: 15,
    unlockTitleHe: 'אוצר הממלכה',
    unlockReasonHe: 'נפתחת ב־15 כוכבים — אבן דרך גדולה שמסמלת ממלכה עם סיפור ארוך משלה.',
    unlockKind: 'automatic',
  },
];

export const CLASS_ROOM_CHOICE_GROUPS: ClassRoomChoiceGroupDefinition[] = [
  {
    id: 'path_gift',
    stars: 4,
    titleHe: 'מתנת הדרך הראשונה',
    subtitleHe: 'ב־4 כוכבים הכיתה בוחרת את המזכרת הראשונה שבאמת מייחדת אותה.',
    descriptionHe: 'בחרו פריט אחד בלבד. במערכת האמיתית הבחירה תהיה כיתתית וקבועה; במפת הניסויים אפשר לאפס כדי לבדוק אפשרויות אחרות.',
    optionIds: ['courage_lantern', 'persistence_clock', 'curiosity_books'],
  },
  {
    id: 'kingdom_identity',
    stars: 8,
    titleHe: 'בחירת הזהות של הממלכה',
    subtitleHe: 'כשהממלכה מתבססת, הכיתה בוחרת איזה סמל ייצג אותה בחדר.',
    descriptionHe: 'שלוש האפשרויות שונות בכיוון ובאופי. רק הפריט שנבחר נכנס לאוסף הכיתתי.',
    optionIds: ['imagination_crystal', 'unity_statue', 'inspiration_crown'],
  },
  {
    id: 'legacy_gift',
    stars: 12,
    titleHe: 'מתנת המורשת הראשונה',
    subtitleHe: 'ב־12 כוכבים כבר יש לכיתה היסטוריה, ולכן היא בוחרת סמל למקום שאליו היא רוצה להגיע.',
    descriptionHe: 'זו כבר בחירה אפית: מצפן, עץ אור או מזרקה. הבחירה משנה את האוסף שהכיתה יכולה להציג.',
    optionIds: ['dream_compass', 'light_tree', 'achievement_fountain'],
  },
];

export function classRoomItemById(id: ClassRoomItemId): ClassRoomItemDefinition | null {
  return CLASS_ROOM_ITEMS.find(item => item.id === id) ?? null;
}

export function classRoomChoiceGroupById(id: ClassRoomChoiceGroupId): ClassRoomChoiceGroupDefinition | null {
  return CLASS_ROOM_CHOICE_GROUPS.find(group => group.id === id) ?? null;
}

export function isClassRoomItemUnlocked(
  item: ClassRoomItemDefinition,
  stars: number,
  selectedChoiceItemIds: readonly ClassRoomItemId[] = []
): boolean {
  const safeStars = Math.max(0, Math.floor(stars));
  if (safeStars < item.unlockStars) return false;
  if (item.unlockKind === 'automatic') return true;
  return selectedChoiceItemIds.includes(item.id);
}

export function unlockedClassRoomItems(
  stars: number,
  selectedChoiceItemIds: readonly ClassRoomItemId[] = []
): ClassRoomItemDefinition[] {
  return CLASS_ROOM_ITEMS.filter(item => isClassRoomItemUnlocked(item, stars, selectedChoiceItemIds));
}

export function automaticClassRoomItems(): ClassRoomItemDefinition[] {
  return CLASS_ROOM_ITEMS.filter(item => item.unlockKind === 'automatic');
}

export function classRoomCollectionCapacity(): number {
  return automaticClassRoomItems().length + CLASS_ROOM_CHOICE_GROUPS.length;
}

export function nextClassRoomItem(stars: number): ClassRoomItemDefinition | null {
  const safeStars = Math.max(0, Math.floor(stars));
  return CLASS_ROOM_ITEMS
    .filter(item => item.unlockKind === 'automatic')
    .find(item => item.unlockStars > safeStars) ?? null;
}
