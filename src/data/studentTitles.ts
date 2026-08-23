import { COMPANION_STAGE_ORDER, type CompanionStage } from './companionWorlds';
import { ITEMS } from './items';
import type { SpecialUnlockEntry } from './achievements';
import type { ThemeId } from './themes';

export type StudentGender = 'male' | 'female';
export type StudentTitleTier = 'basic' | 'rare' | 'epic' | 'legendary';

type GenderedTitleLabel = {
  male: string;
  female: string;
};

const TITLE_LABELS: Record<string, GenderedTitleLabel> = {
  title_kingdom_resident: {
    male: 'תושב הממלכה',
    female: 'תושבת הממלכה',
  },
  title_young_adventurer: {
    male: 'הרפתקן צעיר',
    female: 'הרפתקנית צעירה',
  },
  title_beginner_collector: {
    male: 'אספן מתחיל',
    female: 'אספנית מתחילה',
  },
  title_room_designer: {
    male: 'מעצב החדר',
    female: 'מעצבת החדר',
  },
  title_animal_friend: {
    male: 'ידיד החיות',
    female: 'ידידת החיות',
  },
  title_mission_doer: {
    male: 'מבצע המשימות',
    female: 'מבצעת המשימות',
  },
  title_kingdom_partner: {
    male: 'שותף לממלכה',
    female: 'שותפה לממלכה',
  },
  title_treasure_hunter: { male: 'צייד האוצרות', female: 'ציידת האוצרות' },
  title_world_explorer: { male: 'חוקר העולמות', female: 'חוקרת העולמות' },
  title_mission_keeper: { male: 'שומר המשימות', female: 'שומרת המשימות' },
  title_kingdom_defender: { male: 'מגן הממלכה', female: 'מגינת הממלכה' },
  title_creature_trainer: { male: 'מאלף היצורים', female: 'מאלפת היצורים' },
  title_legend_hunter: { male: 'צייד האגדות', female: 'ציידת האגדות' },
  title_collection_guardian: { male: 'שומר האוסף', female: 'שומרת האוסף' },
  title_kingdom_veteran: { male: 'ותיק הממלכה', female: 'ותיקת הממלכה' },
  title_world_walker: { male: 'הולך בין עולמות', female: 'הולכת בין עולמות' },
  title_mission_champion: { male: 'אלוף המשימות', female: 'אלופת המשימות' },
  title_kingdom_legend: { male: 'אגדת הממלכה', female: 'אגדת הממלכה' },
  title_lord_of_legends: { male: 'אדון האגדות', female: 'גבירת האגדות' },
  title_soul_of_kingdom: { male: 'נשמת הממלכה', female: 'נשמת הממלכה' },
  title_world_roamer: { male: 'נווד העולמות', female: 'נוודת העולמות' },
  title_kingdom_collector: {
    male: 'אספן הממלכה',
    female: 'אספנית הממלכה',
  },
  title_master_collector: {
    male: 'אוצר האוספים',
    female: 'אוצר האוספים',
  },
  title_legendary_companion: {
    male: 'חברות אגדית',
    female: 'חברות אגדית',
  },
  title_six_lights: {
    male: 'ששת האורות',
    female: 'ששת האורות',
  },
  title_friend_of_the_unicorn: {
    male: 'ידיד חד־הקרן',
    female: 'ידידת חד־הקרן',
  },
};

const TITLE_TIERS: Record<string, StudentTitleTier> = {
  title_kingdom_resident: 'basic', title_young_adventurer: 'basic', title_beginner_collector: 'basic',
  title_room_designer: 'basic', title_animal_friend: 'basic', title_mission_doer: 'basic', title_kingdom_partner: 'basic',
  title_treasure_hunter: 'rare', title_world_explorer: 'rare', title_mission_keeper: 'rare', title_kingdom_defender: 'rare', title_creature_trainer: 'rare',
  title_legend_hunter: 'epic', title_collection_guardian: 'epic', title_kingdom_veteran: 'epic', title_world_walker: 'epic', title_mission_champion: 'epic', title_kingdom_collector: 'epic',
  title_kingdom_legend: 'legendary', title_lord_of_legends: 'legendary', title_soul_of_kingdom: 'legendary', title_world_roamer: 'legendary',
  title_master_collector: 'legendary', title_legendary_companion: 'legendary', title_six_lights: 'legendary', title_friend_of_the_unicorn: 'legendary',
};

export const STUDENT_TITLE_TIER_LABELS: Record<StudentTitleTier, string> = { basic: 'בסיסי', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' };

export function studentTitleTier(unlockId: string, sourceAchievementId?: string): StudentTitleTier {
  const explicitTier = TITLE_TIERS[unlockId];
  if (explicitTier) return explicitTier;
  if (sourceAchievementId?.startsWith('journey:')) return 'legendary';
  if (sourceAchievementId?.startsWith('advanced-title:')) return 'rare';
  if (sourceAchievementId?.startsWith('basic-title:')) return 'basic';
  if (sourceAchievementId) return 'epic';
  return 'basic';
}

function cleanStoredTitleLabel(labelHe: string): string {
  const clean = labelHe.trim();
  const quoted = clean.match(/^התואר\s+[“\"](.+)[”\"]$/);
  if (quoted?.[1]) return quoted[1].trim();

  return clean.replace(/^התואר\s+/, '').replace(/^[“\"]|[”\"]$/g, '').trim();
}

export function studentTitleDisplayLabel(
  unlockId: string,
  labelHe: string,
  gender: StudentGender | null | undefined
): string {
  const variants = TITLE_LABELS[unlockId];

  if (variants) {
    if (variants.male === variants.female) return variants.male;
    if (gender === 'male') return variants.male;
    if (gender === 'female') return variants.female;
    return 'ממתין להגדרת בן/בת';
  }

  const fallback = cleanStoredTitleLabel(labelHe);
  if (!gender && fallback.includes('/')) return 'ממתין להגדרת בן/בת';
  return fallback;
}

export type StudentTitleDefinition = {
  unlockId: string; labelHe: string; descriptionHe: string; tier: StudentTitleTier;
  isUnlocked: (student: TitleStudentLike) => boolean;
};

type TitleStudentLike = {
  id: string; level: number;
  inventory: Array<{ itemId: string; kind?: 'item' | 'cosmetic' | 'box'; placedZone?: unknown; roomX?: number | null; roomY?: number | null; }>;
  unlockedThemes: ThemeId[];
  companion: { unlocked: boolean; stage: CompanionStage; };
  missions: Array<{ completedAt: number | null; cancelledAt: number | null; }>;
  classGoals: Array<{ id: string; completedAt: number | null; cancelledAt: number | null; contributionIds: string[]; }>;
};

const BOX_COLLECTIBLE_ITEMS = ITEMS.filter(item => item.source === 'box');
const BOX_COLLECTIBLE_ITEM_IDS = new Set(BOX_COLLECTIBLE_ITEMS.map(item => item.id));
const LEGENDARY_COLLECTIBLE_IDS = new Set(BOX_COLLECTIBLE_ITEMS.filter(item => item.rarity === 'legendary').map(item => item.id));
const COLLECTIBLE_ITEM_IDS = new Set(ITEMS.map(item => item.id));

function uniqueCollectibleCount(student: TitleStudentLike): number {
  return new Set(
    (student.inventory ?? [])
      .filter(entry => entry.kind !== 'box' && COLLECTIBLE_ITEM_IDS.has(entry.itemId))
      .map(entry => entry.itemId)
  ).size;
}

function roomItemCount(student: TitleStudentLike): number {
  return (student.inventory ?? []).filter(entry => {
    if (entry.kind === 'box') return false;
    return (
      entry.placedZone != null ||
      (typeof entry.roomX === 'number' && typeof entry.roomY === 'number')
    );
  }).length;
}

function completedMissionCount(student: TitleStudentLike): number {
  return (student.missions ?? []).filter(
    mission => mission.completedAt !== null && mission.cancelledAt === null
  ).length;
}

function contributedCompletedClassGoalCount(student: TitleStudentLike): number {
  return (student.classGoals ?? []).filter(goal => {
    if (goal.completedAt === null || goal.cancelledAt !== null) return false;

    return (goal.contributionIds ?? []).some(contributionId =>
      contributionId.startsWith(`mission:${student.id}:`) ||
      contributionId.startsWith(`behavior:${student.id}:`) ||
      contributionId.startsWith(`behavior-day:${goal.id}:${student.id}:`)
    );
  }).length;
}

function uniqueBoxCollectibleIds(student: TitleStudentLike): Set<string> {
  return new Set((student.inventory ?? []).filter(entry => entry.kind !== 'box' && BOX_COLLECTIBLE_ITEM_IDS.has(entry.itemId)).map(entry => entry.itemId));
}
function uniqueBoxCollectibleCount(student: TitleStudentLike): number { return uniqueBoxCollectibleIds(student).size; }
function legendaryCollectibleCount(student: TitleStudentLike): number { return [...uniqueBoxCollectibleIds(student)].filter(id => LEGENDARY_COLLECTIBLE_IDS.has(id)).length; }
function completedCollectionCount(student: TitleStudentLike): number {
  const owned = uniqueBoxCollectibleIds(student); const byTheme = new Map<string, string[]>();
  for (const item of BOX_COLLECTIBLE_ITEMS) { const ids = byTheme.get(item.theme) ?? []; ids.push(item.id); byTheme.set(item.theme, ids); }
  let completed = 0; for (const ids of byTheme.values()) if (ids.length > 0 && ids.every(id => owned.has(id))) completed += 1; return completed;
}
function collectibleThemeCount(student: TitleStudentLike): number { const owned = uniqueBoxCollectibleIds(student); return new Set(BOX_COLLECTIBLE_ITEMS.filter(item => owned.has(item.id)).map(item => item.theme)).size; }
function unlockedThemeCount(student: TitleStudentLike): number { return new Set((student.unlockedThemes ?? []).filter(themeId => themeId !== 'generic')).size; }
function companionAtLeast(student: TitleStudentLike, targetStage: CompanionStage): boolean { const currentIndex = COMPANION_STAGE_ORDER.indexOf(student.companion.stage); const targetIndex = COMPANION_STAGE_ORDER.indexOf(targetStage); return currentIndex >= targetIndex && targetIndex >= 0; }

export const BASIC_STUDENT_TITLES: StudentTitleDefinition[] = [
  {
    unlockId: 'title_kingdom_resident',
    labelHe: 'התואר “תושב הממלכה”',
    descriptionHe: 'תואר בסיסי שפתוח לכל תלמיד בממלכה.',
    tier: 'basic',
    isUnlocked: () => true,
  },
  {
    unlockId: 'title_young_adventurer',
    labelHe: 'התואר “הרפתקן צעיר”',
    descriptionHe: 'להגיע לרמה 2.',
    tier: 'basic',
    isUnlocked: student => student.level >= 2,
  },
  {
    unlockId: 'title_beginner_collector',
    labelHe: 'התואר “אספן מתחיל”',
    descriptionHe: 'לאסוף 10 חפצים שונים.',
    tier: 'basic',
    isUnlocked: student => uniqueCollectibleCount(student) >= 10,
  },
  {
    unlockId: 'title_room_designer',
    labelHe: 'התואר “מעצב החדר”',
    descriptionHe: 'להציב לפחות 5 חפצים בחדר.',
    tier: 'basic',
    isUnlocked: student => roomItemCount(student) >= 5,
  },
  {
    unlockId: 'title_animal_friend',
    labelHe: 'התואר “ידיד החיות”',
    descriptionHe: 'לפתוח את חיית המחמד הראשונה.',
    tier: 'basic',
    isUnlocked: student => student.companion?.unlocked === true,
  },
  {
    unlockId: 'title_mission_doer',
    labelHe: 'התואר “מבצע המשימות”',
    descriptionHe: 'להשלים 3 משימות אישיות.',
    tier: 'basic',
    isUnlocked: student => completedMissionCount(student) >= 3,
  },
  {
    unlockId: 'title_kingdom_partner',
    labelHe: 'התואר “שותף לממלכה”',
    descriptionHe: 'לתרום ליעד כיתתי שהושלם.',
    tier: 'basic',
    isUnlocked: student => contributedCompletedClassGoalCount(student) >= 1,
  },
];

export const ADVANCED_STUDENT_TITLES: StudentTitleDefinition[] = [
  { unlockId: 'title_treasure_hunter', labelHe: 'התואר “צייד האוצרות”', descriptionHe: 'לאסוף 25 חפצי קופסאות שונים.', tier: 'rare', isUnlocked: student => uniqueBoxCollectibleCount(student) >= 25 },
  { unlockId: 'title_world_explorer', labelHe: 'התואר “חוקר העולמות”', descriptionHe: 'לפתוח 5 נושאי קופסאות שונים.', tier: 'rare', isUnlocked: student => unlockedThemeCount(student) >= 5 },
  { unlockId: 'title_mission_keeper', labelHe: 'התואר “שומר המשימות”', descriptionHe: 'להשלים 10 משימות אישיות.', tier: 'rare', isUnlocked: student => completedMissionCount(student) >= 10 },
  { unlockId: 'title_kingdom_defender', labelHe: 'התואר “מגן הממלכה”', descriptionHe: 'לתרום ל־3 יעדים כיתתיים שהושלמו.', tier: 'rare', isUnlocked: student => contributedCompletedClassGoalCount(student) >= 3 },
  { unlockId: 'title_creature_trainer', labelHe: 'התואר “מאלף היצורים”', descriptionHe: 'לעזור לחיית המחמד להגיע לשלב הבוגר.', tier: 'rare', isUnlocked: student => companionAtLeast(student, 'grown') },
  { unlockId: 'title_legend_hunter', labelHe: 'התואר “צייד האגדות”', descriptionHe: 'לאסוף 3 חפצי Legendary שונים.', tier: 'epic', isUnlocked: student => legendaryCollectibleCount(student) >= 3 },
  { unlockId: 'title_collection_guardian', labelHe: 'התואר “שומר האוסף”', descriptionHe: 'להשלים אוסף נושא אחד במלואו.', tier: 'epic', isUnlocked: student => completedCollectionCount(student) >= 1 },
  { unlockId: 'title_kingdom_veteran', labelHe: 'התואר “ותיק הממלכה”', descriptionHe: 'להגיע לרמה 15.', tier: 'epic', isUnlocked: student => student.level >= 15 },
  { unlockId: 'title_world_walker', labelHe: 'התואר “הולך בין עולמות”', descriptionHe: 'להחזיק חפצי קופסאות מ־8 נושאים שונים.', tier: 'epic', isUnlocked: student => collectibleThemeCount(student) >= 8 },
  { unlockId: 'title_mission_champion', labelHe: 'התואר “אלוף המשימות”', descriptionHe: 'להשלים 20 משימות אישיות.', tier: 'epic', isUnlocked: student => completedMissionCount(student) >= 20 },
  { unlockId: 'title_kingdom_legend', labelHe: 'התואר “אגדת הממלכה”', descriptionHe: 'להגיע לרמה המקסימלית, רמה 20.', tier: 'legendary', isUnlocked: student => student.level >= 20 },
  { unlockId: 'title_lord_of_legends', labelHe: 'התואר “אדון האגדות”', descriptionHe: 'לאסוף 7 חפצי Legendary שונים.', tier: 'legendary', isUnlocked: student => legendaryCollectibleCount(student) >= 7 },
  { unlockId: 'title_soul_of_kingdom', labelHe: 'התואר “נשמת הממלכה”', descriptionHe: 'לתרום ל־8 יעדים כיתתיים שהושלמו.', tier: 'legendary', isUnlocked: student => contributedCompletedClassGoalCount(student) >= 8 },
  { unlockId: 'title_world_roamer', labelHe: 'התואר “נווד העולמות”', descriptionHe: 'להחזיק חפצי קופסאות מ־10 נושאים שונים.', tier: 'legendary', isUnlocked: student => collectibleThemeCount(student) >= 10 },
];
const ALL_AUTOMATIC_TITLES = [...BASIC_STUDENT_TITLES, ...ADVANCED_STUDENT_TITLES];

export function reconcileBasicStudentTitles(
  student: TitleStudentLike,
  currentUnlocks: SpecialUnlockEntry[],
  now = Date.now()
): { unlocks: SpecialUnlockEntry[]; newlyUnlockedIds: string[] } {
  const next = [...(currentUnlocks ?? [])];
  const existingTitleIds = new Set(
    next.filter(unlock => unlock.kind === 'title').map(unlock => unlock.unlockId)
  );
  const newlyUnlockedIds: string[] = [];

  for (const definition of ALL_AUTOMATIC_TITLES) {
    if (existingTitleIds.has(definition.unlockId)) continue;
    if (!definition.isUnlocked(student)) continue;

    next.push({
      unlockId: definition.unlockId,
      kind: 'title',
      labelHe: definition.labelHe,
      sourceAchievementId: `${definition.tier === 'basic' ? 'basic-title' : 'advanced-title'}:${definition.unlockId}`,
      unlockedAt: now,
    });
    existingTitleIds.add(definition.unlockId);
    newlyUnlockedIds.push(definition.unlockId);
  }

  return { unlocks: next, newlyUnlockedIds };
}
