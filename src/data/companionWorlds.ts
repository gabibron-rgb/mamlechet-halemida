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

export type CompanionMovementProfile = 'ground' | 'flying';

export type CompanionFrameAnimation = {
  /** פריים קבוע לתצוגת Static. */
  staticSrc: string;
  /** פריימים של נשימה/עמידה. אם חסר, staticSrc משמש כ-fallback. */
  idleFrames?: string[];
  /** פריימים של הליכה/ריצה. אם חסר, המנוע נופל חזרה לאנימציית הריג. */
  runFrames?: string[];
  idleFrameDurationMs?: number;
  runFrameDurationMs?: number;
};

export type CompanionFormArt = {
  /**
   * תאימות לאחור: תמונת PNG אחת עדיין נתמכת.
   * layers משמש לריג 2.5D, ו-frameAnimation מאפשר אנימציית ספרייט
   * של גוף מלא — הדרך היציבה לצורות שלא כדאי לפרק לרגליים נפרדות.
   */
  imageSrc?: string;
  layers?: CompanionArtLayer[];
  frameAnimation?: CompanionFrameAnimation;
  movementProfile?: CompanionMovementProfile;
  nameHe?: string;
};

// CHESS_HATCHLING_RIG_UPDATED_2026_08_23
export const COMPANION_FORM_ART: Partial<
  Record<ThemeId, Partial<Record<CompanionEvolutionStage, CompanionFormArt>>>
> = {

  science: {
    hatchling: {
      nameHe: 'אטומי — מדען קטן',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/science/form1/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/science/form1/frames/idle-1.png',
          '/assets/companions/science/form1/frames/idle-2.png',
          '/assets/companions/science/form1/frames/idle-3.png',
          '/assets/companions/science/form1/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/science/form1/frames/run-1.png',
          '/assets/companions/science/form1/frames/run-2.png',
          '/assets/companions/science/form1/frames/run-3.png',
          '/assets/companions/science/form1/frames/run-4.png',
          '/assets/companions/science/form1/frames/run-5.png',
        ],
        idleFrameDurationMs: 360,
        runFrameDurationMs: 135,
      },
    },
  },
  space: {
    hatchling: {
      nameHe: 'נובה — שועל כוכבים קטן',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/space/form1/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/space/form1/frames/idle-1.png',
          '/assets/companions/space/form1/frames/idle-2.png',
          '/assets/companions/space/form1/frames/idle-3.png',
          '/assets/companions/space/form1/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/space/form1/frames/run-1.png',
          '/assets/companions/space/form1/frames/run-2.png',
          '/assets/companions/space/form1/frames/run-3.png',
          '/assets/companions/space/form1/frames/run-4.png',
          '/assets/companions/space/form1/frames/run-5.png',
        ],
        idleFrameDurationMs: 360,
        runFrameDurationMs: 135,
      },
    },
  },
  animals: {
    hatchling: {
      nameHe: 'פיץ — חבר חיות קטן',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/animals/form1/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/animals/form1/frames/idle-1.png',
          '/assets/companions/animals/form1/frames/idle-2.png',
          '/assets/companions/animals/form1/frames/idle-3.png',
          '/assets/companions/animals/form1/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/animals/form1/frames/run-1.png',
          '/assets/companions/animals/form1/frames/run-2.png',
          '/assets/companions/animals/form1/frames/run-3.png',
          '/assets/companions/animals/form1/frames/run-4.png',
          '/assets/companions/animals/form1/frames/run-5.png',
        ],
        idleFrameDurationMs: 360,
        runFrameDurationMs: 135,
      },
    },
  },
  nature: {
    hatchling: {
      nameHe: 'עלה — איילונת יער',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/nature/form1/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/nature/form1/frames/idle-1.png',
          '/assets/companions/nature/form1/frames/idle-2.png',
          '/assets/companions/nature/form1/frames/idle-3.png',
          '/assets/companions/nature/form1/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/nature/form1/frames/run-1.png',
          '/assets/companions/nature/form1/frames/run-2.png',
          '/assets/companions/nature/form1/frames/run-3.png',
          '/assets/companions/nature/form1/frames/run-4.png',
          '/assets/companions/nature/form1/frames/run-5.png',
        ],
        idleFrameDurationMs: 360,
        runFrameDurationMs: 135,
      },
    },
  },
  robotics: {
    hatchling: {
      nameHe: 'ביט — כלבלב רובוטי קטן',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/robotics/form1/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/robotics/form1/frames/idle-1.png',
          '/assets/companions/robotics/form1/frames/idle-2.png',
          '/assets/companions/robotics/form1/frames/idle-3.png',
          '/assets/companions/robotics/form1/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/robotics/form1/frames/run-1.png',
          '/assets/companions/robotics/form1/frames/run-2.png',
          '/assets/companions/robotics/form1/frames/run-3.png',
          '/assets/companions/robotics/form1/frames/run-4.png',
          '/assets/companions/robotics/form1/frames/run-5.png',
        ],
        idleFrameDurationMs: 360,
        runFrameDurationMs: 135,
      },
    },
  },
  fantasy: {
    hatchling: {
      nameHe: 'לונה — פגקורן קסום קטן',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/fantasy/form1/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/fantasy/form1/frames/idle-1.png',
          '/assets/companions/fantasy/form1/frames/idle-2.png',
          '/assets/companions/fantasy/form1/frames/idle-3.png',
          '/assets/companions/fantasy/form1/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/fantasy/form1/frames/run-1.png',
          '/assets/companions/fantasy/form1/frames/run-2.png',
          '/assets/companions/fantasy/form1/frames/run-3.png',
          '/assets/companions/fantasy/form1/frames/run-4.png',
          '/assets/companions/fantasy/form1/frames/run-5.png',
        ],
        idleFrameDurationMs: 360,
        runFrameDurationMs: 135,
      },
    },
  },
  art: {
    hatchling: {
      nameHe: 'פלטה — שועלת צבעים קטנה',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/art/form1/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/art/form1/frames/idle-1.png',
          '/assets/companions/art/form1/frames/idle-2.png',
          '/assets/companions/art/form1/frames/idle-3.png',
          '/assets/companions/art/form1/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/art/form1/frames/run-1.png',
          '/assets/companions/art/form1/frames/run-2.png',
          '/assets/companions/art/form1/frames/run-3.png',
          '/assets/companions/art/form1/frames/run-4.png',
          '/assets/companions/art/form1/frames/run-5.png',
        ],
        idleFrameDurationMs: 360,
        runFrameDurationMs: 135,
      },
    },
  },

  building: {
    hatchling: {
      nameHe: 'בוני — בונה קטן',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/building/form1/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/building/form1/frames/idle-1.png',
          '/assets/companions/building/form1/frames/idle-2.png',
          '/assets/companions/building/form1/frames/idle-3.png',
          '/assets/companions/building/form1/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/building/form1/frames/run-1.png',
          '/assets/companions/building/form1/frames/run-2.png',
          '/assets/companions/building/form1/frames/run-3.png',
          '/assets/companions/building/form1/frames/run-4.png',
          '/assets/companions/building/form1/frames/run-5.png',
        ],
        idleFrameDurationMs: 360,
        runFrameDurationMs: 135,
      },
    },
  },

  sports: {
    hatchling: {
      nameHe: 'ספרינט — טיגרון ספורטיבי',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/sports/form1/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/sports/form1/frames/idle-1.png',
          '/assets/companions/sports/form1/frames/idle-2.png',
          '/assets/companions/sports/form1/frames/idle-3.png',
          '/assets/companions/sports/form1/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/sports/form1/frames/run-1.png',
          '/assets/companions/sports/form1/frames/run-2.png',
          '/assets/companions/sports/form1/frames/run-3.png',
          '/assets/companions/sports/form1/frames/run-4.png',
          '/assets/companions/sports/form1/frames/run-5.png',
        ],
        idleFrameDurationMs: 360,
        runFrameDurationMs: 135,
      },
    },
  },

  music: {
    hatchling: {
      nameHe: 'מנגינה — ציפור שיר קטנה',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/music/form1/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/music/form1/frames/idle-1.png',
          '/assets/companions/music/form1/frames/idle-2.png',
          '/assets/companions/music/form1/frames/idle-3.png',
          '/assets/companions/music/form1/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/music/form1/frames/run-1.png',
          '/assets/companions/music/form1/frames/run-2.png',
          '/assets/companions/music/form1/frames/run-3.png',
          '/assets/companions/music/form1/frames/run-4.png',
          '/assets/companions/music/form1/frames/run-5.png',
        ],
        idleFrameDurationMs: 360,
        runFrameDurationMs: 135,
      },
    },
  },

  books: {
    hatchling: {
      nameHe: 'דפדף — ינשופון קורא',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/books/form1/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/books/form1/frames/idle-1.png',
          '/assets/companions/books/form1/frames/idle-2.png',
          '/assets/companions/books/form1/frames/idle-3.png',
          '/assets/companions/books/form1/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/books/form1/frames/run-1.png',
          '/assets/companions/books/form1/frames/run-2.png',
          '/assets/companions/books/form1/frames/run-3.png',
          '/assets/companions/books/form1/frames/run-4.png',
          '/assets/companions/books/form1/frames/run-5.png',
        ],
        idleFrameDurationMs: 360,
        runFrameDurationMs: 135,
      },
    },
  },

  math: {
    hatchling: {
      nameHe: 'פאי — פנדה חכמה קטנה',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/math/form1/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/math/form1/frames/idle-1.png',
          '/assets/companions/math/form1/frames/idle-2.png',
          '/assets/companions/math/form1/frames/idle-3.png',
          '/assets/companions/math/form1/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/math/form1/frames/run-1.png',
          '/assets/companions/math/form1/frames/run-2.png',
          '/assets/companions/math/form1/frames/run-3.png',
          '/assets/companions/math/form1/frames/run-4.png',
          '/assets/companions/math/form1/frames/run-5.png',
        ],
        idleFrameDurationMs: 360,
        runFrameDurationMs: 135,
      },
    },
  },

  generic: {
    hatchling: {
      nameHe: 'ניצוץ — חתלתול הממלכה',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/generic/form1/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/generic/form1/frames/idle-1.png',
          '/assets/companions/generic/form1/frames/idle-2.png',
          '/assets/companions/generic/form1/frames/idle-3.png',
          '/assets/companions/generic/form1/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/generic/form1/frames/run-1.png',
          '/assets/companions/generic/form1/frames/run-2.png',
          '/assets/companions/generic/form1/frames/run-3.png',
          '/assets/companions/generic/form1/frames/run-4.png',
          '/assets/companions/generic/form1/frames/run-5.png',
        ],
        idleFrameDurationMs: 360,
        runFrameDurationMs: 135,
      },
    },
  },

  ballet: {
    hatchling: {
      nameHe: 'ברבורית — ברבורה בלרינה קטנה',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/ballet/form1/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/ballet/form1/frames/idle-1.png',
          '/assets/companions/ballet/form1/frames/idle-2.png',
          '/assets/companions/ballet/form1/frames/idle-3.png',
          '/assets/companions/ballet/form1/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/ballet/form1/frames/run-1.png',
          '/assets/companions/ballet/form1/frames/run-2.png',
          '/assets/companions/ballet/form1/frames/run-3.png',
          '/assets/companions/ballet/form1/frames/run-4.png',
          '/assets/companions/ballet/form1/frames/run-5.png',
        ],
        idleFrameDurationMs: 360,
        runFrameDurationMs: 135,
      },
    },
  },
  chess: {
    hatchling: {
      nameHe: 'פרשון — הפרש הקטן',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/chess/form1/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/chess/form1/frames/idle-1.png',
          '/assets/companions/chess/form1/frames/idle-1.png',
          '/assets/companions/chess/form1/frames/idle-2.png',
          '/assets/companions/chess/form1/frames/idle-1.png',
          '/assets/companions/chess/form1/frames/idle-3.png',
          '/assets/companions/chess/form1/frames/idle-1.png'
        ],
        runFrames: [
          '/assets/companions/chess/form1/frames/run-1.png',
          '/assets/companions/chess/form1/frames/run-2.png',
          '/assets/companions/chess/form1/frames/run-3.png',
          '/assets/companions/chess/form1/frames/run-4.png',
          '/assets/companions/chess/form1/frames/run-5.png',
          '/assets/companions/chess/form1/frames/run-6.png'
        ],
        idleFrameDurationMs: 340,
        runFrameDurationMs: 155,
      },
    },
    young: {
      nameHe: 'פרש צעיר — צורה 2',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/chess/form2/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/chess/form2/frames/idle-1.png',
          '/assets/companions/chess/form2/frames/idle-1.png',
          '/assets/companions/chess/form2/frames/idle-2.png',
          '/assets/companions/chess/form2/frames/idle-1.png',
          '/assets/companions/chess/form2/frames/idle-1.png',
          '/assets/companions/chess/form2/frames/idle-4.png',
          '/assets/companions/chess/form2/frames/idle-1.png',
          '/assets/companions/chess/form2/frames/idle-1.png',
          '/assets/companions/chess/form2/frames/idle-3.png',
          '/assets/companions/chess/form2/frames/idle-1.png',
        ],
        runFrames: [
          '/assets/companions/chess/form2/frames/run-1.png',
          '/assets/companions/chess/form2/frames/run-2.png',
          '/assets/companions/chess/form2/frames/run-3.png',
          '/assets/companions/chess/form2/frames/run-4.png',
          '/assets/companions/chess/form2/frames/run-5.png',
          '/assets/companions/chess/form2/frames/run-6.png',
        ],
        idleFrameDurationMs: 320,
        runFrameDurationMs: 132,
      },
    },

    grown: {
      nameHe: 'פרש מלכותי — צורה 3',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/chess/form3/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/chess/form3/frames/idle-1.png',
          '/assets/companions/chess/form3/frames/idle-1.png',
          '/assets/companions/chess/form3/frames/idle-2.png',
          '/assets/companions/chess/form3/frames/idle-1.png',
          '/assets/companions/chess/form3/frames/idle-3.png',
          '/assets/companions/chess/form3/frames/idle-1.png',
          '/assets/companions/chess/form3/frames/idle-4.png',
          '/assets/companions/chess/form3/frames/idle-1.png',
        ],
        runFrames: [
          '/assets/companions/chess/form3/frames/run-1.png',
          '/assets/companions/chess/form3/frames/run-2.png',
          '/assets/companions/chess/form3/frames/run-3.png',
          '/assets/companions/chess/form3/frames/run-4.png',
          '/assets/companions/chess/form3/frames/run-5.png',
          '/assets/companions/chess/form3/frames/run-6.png',
        ],
        idleFrameDurationMs: 360,
        runFrameDurationMs: 125,
      },
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
  building: {
    theme: 'building', nameHe: 'עוזר בנייה',
    eggColor: '#f59e0b', eggPattern: 'bricks', motif: '🧱',
    descriptionHe: 'יצור חרוץ שאוהב לבנות ולתקן',
  },
  sports: {
    theme: 'sports', nameHe: 'עוזר ספורט',
    eggColor: '#ef4444', eggPattern: 'stripes', motif: '🏅',
    descriptionHe: 'יצור אנרגטי שאוהב תנועה ואתגרים',
  },
  music: {
    theme: 'music', nameHe: 'עוזר מוזיקה',
    eggColor: '#2563eb', eggPattern: 'notes', motif: '🎵',
    descriptionHe: 'יצור עליז שחי בקצב ובצלילים',
  },
  books: {
    theme: 'books', nameHe: 'עוזר ספרים',
    eggColor: '#8b5cf6', eggPattern: 'pages', motif: '📚',
    descriptionHe: 'יצור סקרן שאוהב סיפורים ודפים',
  },
  math: {
    theme: 'math', nameHe: 'עוזר מתמטיקה',
    eggColor: '#14b8a6', eggPattern: 'numbers', motif: '➗',
    descriptionHe: 'יצור חד שאוהב תבניות ומספרים',
  },
  generic: {
    theme: 'generic', nameHe: 'עוזר כללי',
    eggColor: '#fbbf24', eggPattern: 'stars', motif: '⭐',
    descriptionHe: 'יצור נאמן שאוהב לעזור בכל מקום',
  },
  ballet: {
    theme: 'ballet', nameHe: 'עוזר בלט',
    eggColor: '#f9a8d4', eggPattern: 'ribbons', motif: '🩰',
    descriptionHe: 'יצור עדין שאוהב תנועה וריקוד',
  },
};

// Max active flourishes from teacher badges
export const MAX_ACTIVE_FLOURISHES = 3;
