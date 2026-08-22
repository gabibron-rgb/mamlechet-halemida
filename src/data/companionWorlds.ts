import type { ThemeId } from './themes';

export type CompanionStage =
  | 'egg'
  | 'hatchling'
  | 'young'
  | 'grown'
  | 'legendary';

export const COMPANION_STAGE_ORDER: CompanionStage[] = [
  'egg',
  'hatchling',
  'young',
  'grown',
  'legendary',
];

export const HATCH_BOND_REQUIRED = 30;
export const YOUNG_BOND_REQUIRED = 90;
export const GROWN_BOND_REQUIRED = 180;
export const LEGENDARY_BOND_REQUIRED = 600;

export type CompanionNextStage = {
  stage: CompanionStage;
  bondRequired: number;
  labelHe: string;
} | null;

export function companionStageForBond(
  bond: number,
  currentStage: CompanionStage = 'egg'
): CompanionStage {
  let stageFromBond: CompanionStage = 'egg';

  if (bond >= LEGENDARY_BOND_REQUIRED) stageFromBond = 'legendary';
  else if (bond >= GROWN_BOND_REQUIRED) stageFromBond = 'grown';
  else if (bond >= YOUNG_BOND_REQUIRED) stageFromBond = 'young';
  else if (bond >= HATCH_BOND_REQUIRED) stageFromBond = 'hatchling';

  return COMPANION_STAGE_ORDER.indexOf(stageFromBond) >
    COMPANION_STAGE_ORDER.indexOf(currentStage)
    ? stageFromBond
    : currentStage;
}

export function nextCompanionStage(stage: CompanionStage): CompanionNextStage {
  if (stage === 'egg') {
    return {
      stage: 'hatchling',
      bondRequired: HATCH_BOND_REQUIRED,
      labelHe: 'בקיעת הביצה',
    };
  }

  if (stage === 'hatchling') {
    return {
      stage: 'young',
      bondRequired: YOUNG_BOND_REQUIRED,
      labelHe: 'גדילה לחיית מחמד צעירה',
    };
  }

  if (stage === 'young') {
    return {
      stage: 'grown',
      bondRequired: GROWN_BOND_REQUIRED,
      labelHe: 'גדילה לחיית מחמד בוגרת',
    };
  }

  if (stage === 'grown') {
    return {
      stage: 'legendary',
      bondRequired: LEGENDARY_BOND_REQUIRED,
      labelHe: 'התפתחות אגדית',
    };
  }

  return null;
}

export type CompanionWorldVisuals = {
  theme: ThemeId;
  nameHe: string;
  eggColor: string;
  eggPattern: string;
  motif: string; // emoji-based motif for MVP
  descriptionHe: string;
};

export const COMPANION_VISUALS: Record<string, CompanionWorldVisuals> = {
  chess: {
    theme: 'chess', nameHe: 'עוזר שחמט',
    eggColor: '#f5f5dc', eggPattern: 'checker', motif: '♟️',
    descriptionHe: 'יצור חכם שאוהב חידות ואסטרטגיה',
  },
  science: {
    theme: 'science', nameHe: 'עוזר מדען',
    eggColor: '#06b6d4', eggPattern: 'bubbles', motif: '🔬',
    descriptionHe: 'יצור סקרן שאוהב ניסויים',
  },
  space: {
    theme: 'space', nameHe: 'עוזר חלל',
    eggColor: '#4a5fc1', eggPattern: 'stars', motif: '🌟',
    descriptionHe: 'יצור מהכוכבים שאוהב הרפתקאות',
  },
  animals: {
    theme: 'animals', nameHe: 'עוזר חיות',
    eggColor: '#f59e0b', eggPattern: 'spots', motif: '🐾',
    descriptionHe: 'יצור חמים שאוהב חברה',
  },
  nature: {
    theme: 'nature', nameHe: 'עוזר טבע',
    eggColor: '#4ade80', eggPattern: 'leaves', motif: '🍃',
    descriptionHe: 'יצור שקט שגדל מהשמש',
  },
  robotics: {
    theme: 'robotics', nameHe: 'עוזר רובוט',
    eggColor: '#64748b', eggPattern: 'circuits', motif: '⚙️',
    descriptionHe: 'יצור טכנולוגי שאוהב לבנות',
  },
  fantasy: {
    theme: 'fantasy', nameHe: 'עוזר קסם',
    eggColor: '#c026d3', eggPattern: 'runes', motif: '✨',
    descriptionHe: 'יצור קסום מעולם רחוק',
  },
  art: {
    theme: 'art', nameHe: 'עוזר אומן',
    eggColor: '#f43f5e', eggPattern: 'splashes', motif: '🎨',
    descriptionHe: 'יצור יצירתי שאוהב צבעים',
  },
};

// Max active flourishes from teacher badges
export const MAX_ACTIVE_FLOURISHES = 3;

