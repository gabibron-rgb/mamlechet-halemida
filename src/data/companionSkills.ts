import {
  COMPANION_STAGE_ORDER,
  type CompanionStage,
} from './companionWorlds';

export type CompanionSkillId =
  | 'playful_spirit'
  | 'focused_training'
  | 'keen_senses'
  | 'joyful_companion'
  | 'training_mastery'
  | 'treasure_hunter'
  | 'legendary_bond';

export type CompanionSkillBranch =
  | 'joy'
  | 'training'
  | 'adventure'
  | 'legendary';

export type CompanionSkill = {
  id: CompanionSkillId;
  branch: CompanionSkillBranch;
  nameHe: string;
  emoji: string;
  descriptionHe: string;
  effectHe: string;
  cost: number;
  requiredStage: CompanionStage;
  prerequisites: CompanionSkillId[];
};

export const COMPANION_SKILLS: CompanionSkill[] = [
  {
    id: 'playful_spirit',
    branch: 'joy',
    nameHe: 'רוח שובבה',
    emoji: '🧶',
    descriptionHe: 'החיה לומדת להפוך כל משחק לרגע מיוחד.',
    effectHe: 'משחק משותף מעניק עוד נקודת קשר אחת.',
    cost: 10,
    requiredStage: 'hatchling',
    prerequisites: [],
  },
  {
    id: 'focused_training',
    branch: 'training',
    nameHe: 'ריכוז באימון',
    emoji: '🎯',
    descriptionHe: 'החיה לומדת להתרכז ולהתקדם בכל תרגיל.',
    effectHe: 'תרגיל קסום מעניק עוד 2 נקודות קשר.',
    cost: 15,
    requiredStage: 'hatchling',
    prerequisites: [],
  },
  {
    id: 'keen_senses',
    branch: 'adventure',
    nameHe: 'חושים חדים',
    emoji: '🧭',
    descriptionHe: 'החיה מתחילה לזהות שבילים וסודות בחדר.',
    effectHe: 'פותח את הפעילות מסע קטן.',
    cost: 20,
    requiredStage: 'young',
    prerequisites: [],
  },
  {
    id: 'joyful_companion',
    branch: 'joy',
    nameHe: 'חבר מלא שמחה',
    emoji: '🎉',
    descriptionHe: 'המשחק המשותף הופך לכוח אמיתי של חברות.',
    effectHe: 'משחק משותף מעניק עוד 2 נקודות קשר נוספות.',
    cost: 35,
    requiredStage: 'young',
    prerequisites: ['playful_spirit'],
  },
  {
    id: 'training_mastery',
    branch: 'training',
    nameHe: 'מומחיות באימון',
    emoji: '🏅',
    descriptionHe: 'החיה מתאמנת בסבלנות ומגיעה לביצועים מרשימים.',
    effectHe: 'תרגיל קסום מעניק עוד 3 נקודות קשר נוספות.',
    cost: 50,
    requiredStage: 'grown',
    prerequisites: ['focused_training'],
  },
  {
    id: 'treasure_hunter',
    branch: 'adventure',
    nameHe: 'מגלה אוצרות',
    emoji: '🗺️',
    descriptionHe: 'החיה יודעת לעקוב אחרי רמזים ולגלות אוצרות נסתרים.',
    effectHe: 'פותח חיפוש אוצרות וסופר את האוצרות שהתגלו.',
    cost: 60,
    requiredStage: 'grown',
    prerequisites: ['keen_senses'],
  },
  {
    id: 'legendary_bond',
    branch: 'legendary',
    nameHe: 'קשר אגדי',
    emoji: '👑',
    descriptionHe: 'החיה והתלמיד פועלים יחד בהרמוניה נדירה.',
    effectHe: 'כל פעילות בתשלום מעניקה עוד 2 נקודות קשר.',
    cost: 100,
    requiredStage: 'legendary',
    prerequisites: [
      'joyful_companion',
      'training_mastery',
      'treasure_hunter',
    ],
  },
];

export const COMPANION_SKILL_BY_ID = Object.fromEntries(
  COMPANION_SKILLS.map(skill => [skill.id, skill])
) as Record<CompanionSkillId, CompanionSkill>;

export function getCompanionSkill(
  skillId: string
): CompanionSkill | undefined {
  return COMPANION_SKILLS.find(skill => skill.id === skillId);
}

export function companionStageMeetsRequirement(
  currentStage: CompanionStage,
  requiredStage: CompanionStage
): boolean {
  return (
    COMPANION_STAGE_ORDER.indexOf(currentStage) >=
    COMPANION_STAGE_ORDER.indexOf(requiredStage)
  );
}

export function getCompanionInteractionBondBonus(
  unlockedSkillIds: string[],
  interactionId: string,
  isPaidInteraction: boolean
): number {
  let bonus = 0;

  if (interactionId === 'play') {
    if (unlockedSkillIds.includes('playful_spirit')) bonus += 1;
    if (unlockedSkillIds.includes('joyful_companion')) bonus += 2;
  }

  if (interactionId === 'train') {
    if (unlockedSkillIds.includes('focused_training')) bonus += 2;
    if (unlockedSkillIds.includes('training_mastery')) bonus += 3;
  }

  if (isPaidInteraction && unlockedSkillIds.includes('legendary_bond')) {
    bonus += 2;
  }

  return bonus;
}

export function getCompanionSkillName(skillId: string): string {
  return getCompanionSkill(skillId)?.nameHe ?? skillId;
}
