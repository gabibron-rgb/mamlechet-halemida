import type { ThemeId } from './themes';

export type CompanionStage =
  | 'egg'
  | 'hatchling'
  | 'young'
  | 'grown'
  | 'magical'
  | 'legendary';

export type CompanionEvolutionStage = Exclude<CompanionStage, 'egg'>;
export type CompanionEvolutionLevel = 1 | 2 | 3 | 4 | 5;

export const COMPANION_STAGE_ORDER: CompanionStage[] = [
  'egg',
  'hatchling',
  'young',
  'grown',
  'magical',
  'legendary',
];

export const HATCH_BOND_REQUIRED = 30;
export const YOUNG_BOND_REQUIRED = 90;
export const GROWN_BOND_REQUIRED = 180;
export const MAGICAL_BOND_REQUIRED = 350;
export const LEGENDARY_BOND_REQUIRED = 600;

export type CompanionEvolutionStageDefinition = {
  stage: CompanionEvolutionStage;
  level: CompanionEvolutionLevel;
  shortLabelHe: string;
  labelHe: string;
  descriptionHe: string;
};

export const COMPANION_EVOLUTION_STAGES: CompanionEvolutionStageDefinition[] = [
  {
    stage: 'hatchling',
    level: 1,
    shortLabelHe: 'קטנטנה',
    labelHe: 'צורה 1 — קטנטנה',
    descriptionHe: 'הצורה הראשונה לאחר הבקיעה. קטנה, סקרנית ורק מתחילה לגלות את העולם.',
  },
  {
    stage: 'young',
    level: 2,
    shortLabelHe: 'צעירה',
    labelHe: 'צורה 2 — צעירה',
    descriptionHe: 'החיה כבר גדלה מעט והאופי שלה מתחיל להיות ברור יותר.',
  },
  {
    stage: 'grown',
    level: 3,
    shortLabelHe: 'בוגרת',
    labelHe: 'צורה 3 — בוגרת',
    descriptionHe: 'צורה מרשימה ובטוחה יותר שנפתחת אחרי דרך משמעותית בכיתה.',
  },
  {
    stage: 'magical',
    level: 4,
    shortLabelHe: 'קסומה',
    labelHe: 'צורה 4 — קסומה',
    descriptionHe: 'החיה מקבלת מאפיינים קסומים חדשים ומתחילה להיראות נדירה באמת.',
  },
  {
    stage: 'legendary',
    level: 5,
    shortLabelHe: 'אגדית',
    labelHe: 'צורה 5 — אגדית',
    descriptionHe: 'צורת העל הנדירה ביותר, שמסמלת התמדה ארוכה והתנהגות משמעותית לאורך זמן.',
  },
];

export const COMPANION_EVOLUTION_STAGE_BY_ID = Object.fromEntries(
  COMPANION_EVOLUTION_STAGES.map(definition => [definition.stage, definition])
) as Record<CompanionEvolutionStage, CompanionEvolutionStageDefinition>;

export function companionEvolutionLevel(
  stage: CompanionStage
): CompanionEvolutionLevel | 0 {
  if (stage === 'egg') return 0;
  return COMPANION_EVOLUTION_STAGE_BY_ID[stage].level;
}

export type CompanionLayerAnimation =
  | 'none'
  | 'bodyBreath'
  | 'headIdle'
  | 'blink'
  | 'blinkOverlay'
  | 'headBlinkOverlay'
  | 'earLeft'
  | 'earRight'
  | 'frontLegLeft'
  | 'frontLegRight'
  | 'backLegLeft'
  | 'backLegRight'
  | 'mane'
  | 'wingLeft'
  | 'wingRight'
  | 'tail'
  | 'pendant'
  | 'pulse'
  | 'sparkle';

export type CompanionArtLayer = {
  id: string;
  src: string;
  /** מיקום יחסי בתוך קנבס של 100x100. */
  x?: number;
  y?: number;
  width?: number;
  rotation?: number;
  flipX?: boolean;
  zIndex?: number;
  transformOrigin?: string;
  animation?: CompanionLayerAnimation;
  /** אופציונלי: מאפשר לכל איבר לזוז בקצב מעט שונה כדי למנוע תחושה רובוטית. */
  animationDurationMs?: number;
  /** ערך שלילי מתחיל את האנימציה באמצע המחזור וכך מסנכרן פחות שכבות. */
  animationDelayMs?: number;
  className?: string;
};

export type CompanionFormArt = {
  /**
   * תאימות לאחור: תמונת PNG אחת עדיין נתמכת.
   * משפחות חדשות יכולות לעבור ל-layers כדי לקבל ריג 2.5D מלא:
   * גוף, ראש, עיניים, אוזניים, רגליים, רעמה, כנפיים, זנב, הילה ואביזרים.
   * כל איבר יכול לקבל אנימציה עצמאית בלי להחליף את כל התמונה בכל frame.
   */
  imageSrc?: string;
  layers?: CompanionArtLayer[];
  nameHe?: string;
};

export const COMPANION_FORM_ART: Partial<
  Record<ThemeId, Partial<Record<CompanionEvolutionStage, CompanionFormArt>>>
> = {
  chess: {
    hatchling: {
      nameHe: 'פרשון — הפרש הקטן',
      layers: [
        {
          id: 'tail',
          src: '/assets/companions/chess/form1/chess-form1-tail.png',
          x: 76.4,
          y: 47.9,
          width: 30,
          rotation: -3,
          zIndex: 2,
          transformOrigin: '18% 52%',
          animation: 'tail',
          animationDurationMs: 2400,
        },
        {
          id: 'back-left-leg',
          src: '/assets/companions/chess/form1/chess-form1-back-left-leg.png',
          x: 60.7,
          y: 71.4,
          width: 15.4,
          zIndex: 4,
          transformOrigin: '50% 12%',
          animation: 'backLegLeft',
          animationDurationMs: 5100,
          animationDelayMs: -1100,
        },
        {
          id: 'back-right-leg',
          src: '/assets/companions/chess/form1/chess-form1-back-right-leg.png',
          x: 70.7,
          y: 71.4,
          width: 16,
          zIndex: 5,
          transformOrigin: '50% 12%',
          animation: 'backLegRight',
          animationDurationMs: 5500,
          animationDelayMs: -2400,
        },
        {
          id: 'body',
          src: '/assets/companions/chess/form1/chess-form1-body.png',
          x: 50,
          y: 50.7,
          width: 52.9,
          zIndex: 8,
          animation: 'bodyBreath',
          animationDurationMs: 3200,
        },
        {
          id: 'front-left-leg',
          src: '/assets/companions/chess/form1/chess-form1-front-left-leg.png',
          x: 35.7,
          y: 71.4,
          width: 14.9,
          zIndex: 11,
          transformOrigin: '50% 12%',
          animation: 'frontLegLeft',
          animationDurationMs: 4300,
          animationDelayMs: -800,
        },
        {
          id: 'front-right-leg',
          src: '/assets/companions/chess/form1/chess-form1-front-right-leg.png',
          x: 45,
          y: 71.4,
          width: 14.3,
          zIndex: 12,
          transformOrigin: '50% 12%',
          animation: 'frontLegRight',
          animationDurationMs: 4900,
          animationDelayMs: -2100,
        },
        {
          id: 'head',
          src: '/assets/companions/chess/form1/chess-form1-head.png',
          x: 29.3,
          y: 27.1,
          width: 35.4,
          zIndex: 20,
          transformOrigin: '58% 78%',
          animation: 'headIdle',
          animationDurationMs: 4100,
        },
        {
          id: 'head-closed',
          src: '/assets/companions/chess/form1/chess-form1-head-closed.png',
          x: 29.3,
          y: 27.1,
          width: 35.4,
          zIndex: 24,
          transformOrigin: '58% 78%',
          animation: 'headBlinkOverlay',
          animationDurationMs: 5200,
          animationDelayMs: -700,
        },
        {
          id: 'pendant',
          src: '/assets/companions/chess/form1/chess-form1-pendant.png',
          x: 38.1,
          y: 48.6,
          width: 6.3,
          zIndex: 26,
          transformOrigin: '50% 6%',
          animation: 'pendant',
          animationDurationMs: 2600,
          animationDelayMs: -500,
        },
      ],
    },
  },
};

export function getCompanionFormArt(
  theme: ThemeId,
  stage: CompanionStage
): CompanionFormArt | null {
  if (stage === 'egg') return null;
  return COMPANION_FORM_ART[theme]?.[stage] ?? null;
}

export type CompanionNextStage = {
  stage: CompanionEvolutionStage;
  bondRequired: number;
  labelHe: string;
  evolutionLevel: CompanionEvolutionLevel;
} | null;

export function companionStageForBond(
  bond: number,
  currentStage: CompanionStage = 'egg'
): CompanionStage {
  let stageFromBond: CompanionStage = 'egg';

  if (bond >= LEGENDARY_BOND_REQUIRED) stageFromBond = 'legendary';
  else if (bond >= MAGICAL_BOND_REQUIRED) stageFromBond = 'magical';
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
      labelHe: 'בקיעת הביצה — צורה 1',
      evolutionLevel: 1,
    };
  }

  if (stage === 'hatchling') {
    return {
      stage: 'young',
      bondRequired: YOUNG_BOND_REQUIRED,
      labelHe: 'התפתחות לצורה 2',
      evolutionLevel: 2,
    };
  }

  if (stage === 'young') {
    return {
      stage: 'grown',
      bondRequired: GROWN_BOND_REQUIRED,
      labelHe: 'התפתחות לצורה 3',
      evolutionLevel: 3,
    };
  }

  if (stage === 'grown') {
    return {
      stage: 'magical',
      bondRequired: MAGICAL_BOND_REQUIRED,
      labelHe: 'התפתחות לצורה הקסומה — צורה 4',
      evolutionLevel: 4,
    };
  }

  if (stage === 'magical') {
    return {
      stage: 'legendary',
      bondRequired: LEGENDARY_BOND_REQUIRED,
      labelHe: 'התפתחות לצורה האגדית — צורה 5',
      evolutionLevel: 5,
    };
  }

  return null;
}

export type CompanionWorldVisuals = {
  theme: ThemeId;
  nameHe: string;
  eggColor: string;
  eggPattern: string;
  motif: string; // emoji-based motif until dedicated form images are added
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
