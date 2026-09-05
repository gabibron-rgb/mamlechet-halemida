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
    young: {
      nameHe: 'אטומיקס — חוקר הביו־אור',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/science/form2/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/science/form2/frames/idle-1.png',
          '/assets/companions/science/form2/frames/idle-2.png',
          '/assets/companions/science/form2/frames/idle-3.png',
          '/assets/companions/science/form2/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/science/form2/frames/run-1.png',
          '/assets/companions/science/form2/frames/run-2.png',
          '/assets/companions/science/form2/frames/run-3.png',
          '/assets/companions/science/form2/frames/run-4.png',
          '/assets/companions/science/form2/frames/run-5.png',
          '/assets/companions/science/form2/frames/run-6.png',
        ],
        idleFrameDurationMs: 320,
        runFrameDurationMs: 132,
      },
    },
    legendary: {
      nameHe: 'אטומיקס — אדון הליבה הקוונטית',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/science/form5/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/science/form5/frames/idle-1.png',
          '/assets/companions/science/form5/frames/idle-2.png',
          '/assets/companions/science/form5/frames/idle-3.png',
          '/assets/companions/science/form5/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/science/form5/frames/run-1.png',
          '/assets/companions/science/form5/frames/run-2.png',
          '/assets/companions/science/form5/frames/run-3.png',
          '/assets/companions/science/form5/frames/run-4.png',
          '/assets/companions/science/form5/frames/run-5.png',
          '/assets/companions/science/form5/frames/run-6.png',
        ],
        idleFrameDurationMs: 310,
        runFrameDurationMs: 150,
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
    young: {
      nameHe: 'נובה — שועל הנבולה',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/space/form2/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/space/form2/frames/idle-1.png',
          '/assets/companions/space/form2/frames/idle-2.png',
          '/assets/companions/space/form2/frames/idle-3.png',
          '/assets/companions/space/form2/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/space/form2/frames/run-1.png',
          '/assets/companions/space/form2/frames/run-2.png',
          '/assets/companions/space/form2/frames/run-3.png',
          '/assets/companions/space/form2/frames/run-4.png',
          '/assets/companions/space/form2/frames/run-5.png',
          '/assets/companions/space/form2/frames/run-6.png',
        ],
        idleFrameDurationMs: 320,
        runFrameDurationMs: 132,
      },
    },
    legendary: {
      nameHe: 'נובה — קיסרית הקוסמוס',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/space/form5/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/space/form5/frames/idle-1.png',
          '/assets/companions/space/form5/frames/idle-2.png',
          '/assets/companions/space/form5/frames/idle-3.png',
          '/assets/companions/space/form5/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/space/form5/frames/run-1.png',
          '/assets/companions/space/form5/frames/run-2.png',
          '/assets/companions/space/form5/frames/run-3.png',
          '/assets/companions/space/form5/frames/run-4.png',
          '/assets/companions/space/form5/frames/run-5.png',
          '/assets/companions/space/form5/frames/run-6.png',
        ],
        idleFrameDurationMs: 300,
        runFrameDurationMs: 145,
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
    young: {
      nameHe: 'פיץ — שועל שומר פראי',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/animals/form2/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/animals/form2/frames/idle-1.png',
          '/assets/companions/animals/form2/frames/idle-2.png',
          '/assets/companions/animals/form2/frames/idle-3.png',
          '/assets/companions/animals/form2/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/animals/form2/frames/run-1.png',
          '/assets/companions/animals/form2/frames/run-2.png',
          '/assets/companions/animals/form2/frames/run-3.png',
          '/assets/companions/animals/form2/frames/run-4.png',
          '/assets/companions/animals/form2/frames/run-5.png',
          '/assets/companions/animals/form2/frames/run-6.png',
        ],
        idleFrameDurationMs: 320,
        runFrameDurationMs: 132,
      },
    },
    legendary: {
      nameHe: 'פיץ — שומר הלהבה האגדית',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/animals/form5/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/animals/form5/frames/idle-1.png',
          '/assets/companions/animals/form5/frames/idle-2.png',
          '/assets/companions/animals/form5/frames/idle-3.png',
          '/assets/companions/animals/form5/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/animals/form5/frames/run-1.png',
          '/assets/companions/animals/form5/frames/run-2.png',
          '/assets/companions/animals/form5/frames/run-3.png',
          '/assets/companions/animals/form5/frames/run-4.png',
          '/assets/companions/animals/form5/frames/run-5.png',
          '/assets/companions/animals/form5/frames/run-6.png',
        ],
        idleFrameDurationMs: 310,
        runFrameDurationMs: 150,
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
    young: {
      nameHe: 'עלה — אייל היער הצעיר',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/nature/form2/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/nature/form2/frames/idle-1.png',
          '/assets/companions/nature/form2/frames/idle-2.png',
          '/assets/companions/nature/form2/frames/idle-3.png',
          '/assets/companions/nature/form2/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/nature/form2/frames/run-1.png',
          '/assets/companions/nature/form2/frames/run-2.png',
          '/assets/companions/nature/form2/frames/run-3.png',
          '/assets/companions/nature/form2/frames/run-4.png',
          '/assets/companions/nature/form2/frames/run-5.png',
          '/assets/companions/nature/form2/frames/run-6.png',
        ],
        idleFrameDurationMs: 320,
        runFrameDurationMs: 132,
      },
    },
    legendary: {
      nameHe: 'עלה — נשמת עץ העולם',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/nature/form5/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/nature/form5/frames/idle-1.png',
          '/assets/companions/nature/form5/frames/idle-2.png',
          '/assets/companions/nature/form5/frames/idle-3.png',
          '/assets/companions/nature/form5/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/nature/form5/frames/run-1.png',
          '/assets/companions/nature/form5/frames/run-2.png',
          '/assets/companions/nature/form5/frames/run-3.png',
          '/assets/companions/nature/form5/frames/run-4.png',
          '/assets/companions/nature/form5/frames/run-5.png',
          '/assets/companions/nature/form5/frames/run-6.png',
        ],
        idleFrameDurationMs: 310,
        runFrameDurationMs: 150,
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
    young: {
      nameHe: 'ביט־X — כלב הסייבר',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/robotics/form2/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/robotics/form2/frames/idle-1.png',
          '/assets/companions/robotics/form2/frames/idle-2.png',
          '/assets/companions/robotics/form2/frames/idle-3.png',
          '/assets/companions/robotics/form2/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/robotics/form2/frames/run-1.png',
          '/assets/companions/robotics/form2/frames/run-2.png',
          '/assets/companions/robotics/form2/frames/run-3.png',
          '/assets/companions/robotics/form2/frames/run-4.png',
          '/assets/companions/robotics/form2/frames/run-5.png',
          '/assets/companions/robotics/form2/frames/run-6.png',
        ],
        idleFrameDurationMs: 320,
        runFrameDurationMs: 132,
      },
    },
    legendary: {
      nameHe: 'ביט־Ω — טיטאן הסייבר',
      movementProfile: 'flying',
      frameAnimation: {
        staticSrc: '/assets/companions/robotics/form5/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/robotics/form5/frames/idle-1.png',
          '/assets/companions/robotics/form5/frames/idle-2.png',
          '/assets/companions/robotics/form5/frames/idle-3.png',
          '/assets/companions/robotics/form5/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/robotics/form5/frames/run-1.png',
          '/assets/companions/robotics/form5/frames/run-2.png',
          '/assets/companions/robotics/form5/frames/run-3.png',
          '/assets/companions/robotics/form5/frames/run-4.png',
          '/assets/companions/robotics/form5/frames/run-5.png',
          '/assets/companions/robotics/form5/frames/run-6.png',
        ],
        idleFrameDurationMs: 300,
        runFrameDurationMs: 155,
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
    young: {
      nameHe: 'לונה — דרקון הרונות',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/fantasy/form2/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/fantasy/form2/frames/idle-1.png',
          '/assets/companions/fantasy/form2/frames/idle-2.png',
          '/assets/companions/fantasy/form2/frames/idle-3.png',
          '/assets/companions/fantasy/form2/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/fantasy/form2/frames/run-1.png',
          '/assets/companions/fantasy/form2/frames/run-2.png',
          '/assets/companions/fantasy/form2/frames/run-3.png',
          '/assets/companions/fantasy/form2/frames/run-4.png',
          '/assets/companions/fantasy/form2/frames/run-5.png',
          '/assets/companions/fantasy/form2/frames/run-6.png',
        ],
        idleFrameDurationMs: 320,
        runFrameDurationMs: 132,
      },
    },
    legendary: {
      nameHe: 'לונה — קיסרית הרונות',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/fantasy/form5/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/fantasy/form5/frames/idle-1.png',
          '/assets/companions/fantasy/form5/frames/idle-2.png',
          '/assets/companions/fantasy/form5/frames/idle-3.png',
          '/assets/companions/fantasy/form5/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/fantasy/form5/frames/run-1.png',
          '/assets/companions/fantasy/form5/frames/run-2.png',
          '/assets/companions/fantasy/form5/frames/run-3.png',
          '/assets/companions/fantasy/form5/frames/run-4.png',
          '/assets/companions/fantasy/form5/frames/run-5.png',
          '/assets/companions/fantasy/form5/frames/run-6.png',
        ],
        idleFrameDurationMs: 300,
        runFrameDurationMs: 142,
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
    young: {
      nameHe: 'פלטה — כימרת הצבע',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/art/form2/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/art/form2/frames/idle-1.png',
          '/assets/companions/art/form2/frames/idle-2.png',
          '/assets/companions/art/form2/frames/idle-3.png',
          '/assets/companions/art/form2/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/art/form2/frames/run-1.png',
          '/assets/companions/art/form2/frames/run-2.png',
          '/assets/companions/art/form2/frames/run-3.png',
          '/assets/companions/art/form2/frames/run-4.png',
          '/assets/companions/art/form2/frames/run-5.png',
          '/assets/companions/art/form2/frames/run-6.png',
        ],
        idleFrameDurationMs: 320,
        runFrameDurationMs: 132,
      },
    },
    legendary: {
      nameHe: 'פלטה — מוזת הצבע החי',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/art/form5/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/art/form5/frames/idle-1.png',
          '/assets/companions/art/form5/frames/idle-2.png',
          '/assets/companions/art/form5/frames/idle-3.png',
          '/assets/companions/art/form5/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/art/form5/frames/run-1.png',
          '/assets/companions/art/form5/frames/run-2.png',
          '/assets/companions/art/form5/frames/run-3.png',
          '/assets/companions/art/form5/frames/run-4.png',
          '/assets/companions/art/form5/frames/run-5.png',
          '/assets/companions/art/form5/frames/run-6.png',
        ],
        idleFrameDurationMs: 300,
        runFrameDurationMs: 142,
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
    young: {
      nameHe: 'בוני — בונה־מהנדס',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/building/form2/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/building/form2/frames/idle-1.png',
          '/assets/companions/building/form2/frames/idle-2.png',
          '/assets/companions/building/form2/frames/idle-3.png',
          '/assets/companions/building/form2/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/building/form2/frames/run-1.png',
          '/assets/companions/building/form2/frames/run-2.png',
          '/assets/companions/building/form2/frames/run-3.png',
          '/assets/companions/building/form2/frames/run-4.png',
          '/assets/companions/building/form2/frames/run-5.png',
          '/assets/companions/building/form2/frames/run-6.png',
        ],
        idleFrameDurationMs: 320,
        runFrameDurationMs: 132,
      },
    },
    legendary: {
      nameHe: 'בוני — טיטאן הבנייה',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/building/form5/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/building/form5/frames/idle-1.png',
          '/assets/companions/building/form5/frames/idle-2.png',
          '/assets/companions/building/form5/frames/idle-3.png',
          '/assets/companions/building/form5/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/building/form5/frames/run-1.png',
          '/assets/companions/building/form5/frames/run-2.png',
          '/assets/companions/building/form5/frames/run-3.png',
          '/assets/companions/building/form5/frames/run-4.png',
          '/assets/companions/building/form5/frames/run-5.png',
          '/assets/companions/building/form5/frames/run-6.png',
        ],
        idleFrameDurationMs: 300,
        runFrameDurationMs: 128,
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
    young: {
      nameHe: 'ספרינט — טיגריס אלוף',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/sports/form2/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/sports/form2/frames/idle-1.png',
          '/assets/companions/sports/form2/frames/idle-2.png',
          '/assets/companions/sports/form2/frames/idle-3.png',
          '/assets/companions/sports/form2/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/sports/form2/frames/run-1.png',
          '/assets/companions/sports/form2/frames/run-2.png',
          '/assets/companions/sports/form2/frames/run-3.png',
          '/assets/companions/sports/form2/frames/run-4.png',
          '/assets/companions/sports/form2/frames/run-5.png',
          '/assets/companions/sports/form2/frames/run-6.png',
        ],
        idleFrameDurationMs: 320,
        runFrameDurationMs: 132,
      },
    },
    legendary: {
      nameHe: 'ספרינט — אלוף האגדות',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/sports/form5/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/sports/form5/frames/idle-1.png',
          '/assets/companions/sports/form5/frames/idle-2.png',
          '/assets/companions/sports/form5/frames/idle-3.png',
          '/assets/companions/sports/form5/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/sports/form5/frames/run-1.png',
          '/assets/companions/sports/form5/frames/run-2.png',
          '/assets/companions/sports/form5/frames/run-3.png',
          '/assets/companions/sports/form5/frames/run-4.png',
          '/assets/companions/sports/form5/frames/run-5.png',
          '/assets/companions/sports/form5/frames/run-6.png',
        ],
        idleFrameDurationMs: 420,
        runFrameDurationMs: 112,
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
    young: {
      nameHe: 'מנגינה — ציפור מנצחת',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/music/form2/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/music/form2/frames/idle-1.png',
          '/assets/companions/music/form2/frames/idle-2.png',
          '/assets/companions/music/form2/frames/idle-3.png',
          '/assets/companions/music/form2/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/music/form2/frames/run-1.png',
          '/assets/companions/music/form2/frames/run-2.png',
          '/assets/companions/music/form2/frames/run-3.png',
          '/assets/companions/music/form2/frames/run-4.png',
          '/assets/companions/music/form2/frames/run-5.png',
          '/assets/companions/music/form2/frames/run-6.png',
        ],
        idleFrameDurationMs: 320,
        runFrameDurationMs: 132,
      },
    },
    legendary: {
      nameHe: 'מנגינה — ריבונית הסימפוניה',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/music/form5/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/music/form5/frames/idle-1.png',
          '/assets/companions/music/form5/frames/idle-2.png',
          '/assets/companions/music/form5/frames/idle-3.png',
          '/assets/companions/music/form5/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/music/form5/frames/run-1.png',
          '/assets/companions/music/form5/frames/run-2.png',
          '/assets/companions/music/form5/frames/run-3.png',
          '/assets/companions/music/form5/frames/run-4.png',
          '/assets/companions/music/form5/frames/run-5.png',
          '/assets/companions/music/form5/frames/run-6.png',
        ],
        idleFrameDurationMs: 330,
        runFrameDurationMs: 122,
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
    young: {
      nameHe: 'דפדף — ינשוף הספרייה הקסומה',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/books/form2/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/books/form2/frames/idle-1.png',
          '/assets/companions/books/form2/frames/idle-2.png',
          '/assets/companions/books/form2/frames/idle-3.png',
          '/assets/companions/books/form2/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/books/form2/frames/run-1.png',
          '/assets/companions/books/form2/frames/run-2.png',
          '/assets/companions/books/form2/frames/run-3.png',
          '/assets/companions/books/form2/frames/run-4.png',
          '/assets/companions/books/form2/frames/run-5.png',
          '/assets/companions/books/form2/frames/run-6.png',
        ],
        idleFrameDurationMs: 320,
        runFrameDurationMs: 132,
      },
    },
    legendary: {
      nameHe: 'דפדף — שומר הספרייה האינסופית',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/books/form5/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/books/form5/frames/idle-1.png',
          '/assets/companions/books/form5/frames/idle-2.png',
          '/assets/companions/books/form5/frames/idle-3.png',
          '/assets/companions/books/form5/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/books/form5/frames/run-1.png',
          '/assets/companions/books/form5/frames/run-2.png',
          '/assets/companions/books/form5/frames/run-3.png',
          '/assets/companions/books/form5/frames/run-4.png',
          '/assets/companions/books/form5/frames/run-5.png',
          '/assets/companions/books/form5/frames/run-6.png',
        ],
        idleFrameDurationMs: 390,
        runFrameDurationMs: 122,
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
    young: {
      nameHe: 'פאי — פנדה גאומטרית',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/math/form2/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/math/form2/frames/idle-1.png',
          '/assets/companions/math/form2/frames/idle-2.png',
          '/assets/companions/math/form2/frames/idle-3.png',
          '/assets/companions/math/form2/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/math/form2/frames/run-1.png',
          '/assets/companions/math/form2/frames/run-2.png',
          '/assets/companions/math/form2/frames/run-3.png',
          '/assets/companions/math/form2/frames/run-4.png',
          '/assets/companions/math/form2/frames/run-5.png',
          '/assets/companions/math/form2/frames/run-6.png',
        ],
        idleFrameDurationMs: 320,
        runFrameDurationMs: 132,
      },
    },
    legendary: {
      nameHe: 'פאי — אדון האינסוף',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/math/form5/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/math/form5/frames/idle-1.png',
          '/assets/companions/math/form5/frames/idle-2.png',
          '/assets/companions/math/form5/frames/idle-3.png',
          '/assets/companions/math/form5/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/math/form5/frames/run-1.png',
          '/assets/companions/math/form5/frames/run-2.png',
          '/assets/companions/math/form5/frames/run-3.png',
          '/assets/companions/math/form5/frames/run-4.png',
          '/assets/companions/math/form5/frames/run-5.png',
          '/assets/companions/math/form5/frames/run-6.png',
        ],
        idleFrameDurationMs: 350,
        runFrameDurationMs: 120,
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
    young: {
      nameHe: 'ניצוץ — אריה־שומר צעיר',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/generic/form2/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/generic/form2/frames/idle-1.png',
          '/assets/companions/generic/form2/frames/idle-2.png',
          '/assets/companions/generic/form2/frames/idle-3.png',
          '/assets/companions/generic/form2/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/generic/form2/frames/run-1.png',
          '/assets/companions/generic/form2/frames/run-2.png',
          '/assets/companions/generic/form2/frames/run-3.png',
          '/assets/companions/generic/form2/frames/run-4.png',
          '/assets/companions/generic/form2/frames/run-5.png',
          '/assets/companions/generic/form2/frames/run-6.png',
        ],
        idleFrameDurationMs: 320,
        runFrameDurationMs: 132,
      },
    },
    legendary: {
      nameHe: 'ניצוץ — שומר הממלכה האגדי',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/generic/form5/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/generic/form5/frames/idle-1.png',
          '/assets/companions/generic/form5/frames/idle-2.png',
          '/assets/companions/generic/form5/frames/idle-3.png',
          '/assets/companions/generic/form5/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/generic/form5/frames/run-1.png',
          '/assets/companions/generic/form5/frames/run-2.png',
          '/assets/companions/generic/form5/frames/run-3.png',
          '/assets/companions/generic/form5/frames/run-4.png',
          '/assets/companions/generic/form5/frames/run-5.png',
          '/assets/companions/generic/form5/frames/run-6.png',
        ],
        idleFrameDurationMs: 340,
        runFrameDurationMs: 124,
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
          '/assets/companions/ballet/form1/frames/run-6.png',
        ],
        idleFrameDurationMs: 360,
        runFrameDurationMs: 135,
      },
    },
    young: {
      nameHe: 'ברבורית — ברבורת הבמה',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/ballet/form2/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/ballet/form2/frames/idle-1.png',
          '/assets/companions/ballet/form2/frames/idle-2.png',
          '/assets/companions/ballet/form2/frames/idle-3.png',
          '/assets/companions/ballet/form2/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/ballet/form2/frames/run-1.png',
          '/assets/companions/ballet/form2/frames/run-2.png',
          '/assets/companions/ballet/form2/frames/run-3.png',
          '/assets/companions/ballet/form2/frames/run-4.png',
          '/assets/companions/ballet/form2/frames/run-5.png',
          '/assets/companions/ballet/form2/frames/run-6.png',
        ],
        idleFrameDurationMs: 320,
        runFrameDurationMs: 132,
      },
    },
    legendary: {
      nameHe: 'ברבורית — מלכת הברבורים השמימית',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/ballet/form5/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/ballet/form5/frames/idle-1.png',
          '/assets/companions/ballet/form5/frames/idle-1.png',
          '/assets/companions/ballet/form5/frames/idle-2.png',
          '/assets/companions/ballet/form5/frames/idle-3.png',
          '/assets/companions/ballet/form5/frames/idle-3.png',
          '/assets/companions/ballet/form5/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/ballet/form5/frames/run-1.png',
          '/assets/companions/ballet/form5/frames/run-2.png',
          '/assets/companions/ballet/form5/frames/run-3.png',
          '/assets/companions/ballet/form5/frames/run-4.png',
          '/assets/companions/ballet/form5/frames/run-5.png',
          '/assets/companions/ballet/form5/frames/run-6.png',
        ],
        idleFrameDurationMs: 285,
        runFrameDurationMs: 185,
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
    magical: {
      nameHe: 'פרש הכנפיים — צורה 4',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/chess/form4/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/chess/form4/frames/idle-1.png',
          '/assets/companions/chess/form4/frames/idle-2.png',
          '/assets/companions/chess/form4/frames/idle-3.png',
          '/assets/companions/chess/form4/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/chess/form4/frames/run-1.png',
          '/assets/companions/chess/form4/frames/run-2.png',
          '/assets/companions/chess/form4/frames/run-3.png',
          '/assets/companions/chess/form4/frames/run-4.png',
          '/assets/companions/chess/form4/frames/run-5.png',
          '/assets/companions/chess/form4/frames/run-6.png',
        ],
        idleFrameDurationMs: 320,
        runFrameDurationMs: 122,
      },
    },
    legendary: {
      nameHe: 'פגסוס השחמט — צורה 5',
      movementProfile: 'ground',
      frameAnimation: {
        staticSrc: '/assets/companions/chess/form5/frames/idle-1.png',
        idleFrames: [
          '/assets/companions/chess/form5/frames/idle-1.png',
          '/assets/companions/chess/form5/frames/idle-2.png',
          '/assets/companions/chess/form5/frames/idle-3.png',
          '/assets/companions/chess/form5/frames/idle-4.png',
        ],
        runFrames: [
          '/assets/companions/chess/form5/frames/run-1.png',
          '/assets/companions/chess/form5/frames/run-2.png',
          '/assets/companions/chess/form5/frames/run-3.png',
          '/assets/companions/chess/form5/frames/run-4.png',
          '/assets/companions/chess/form5/frames/run-5.png',
          '/assets/companions/chess/form5/frames/run-6.png',
        ],
        idleFrameDurationMs: 300,
        runFrameDurationMs: 116,
      },
    },
  },
};


// FORM3_FULL_REBUILD_2026_08_25_START
const FORM3_GROWN_ART: Partial<Record<ThemeId, CompanionFormArt>> = {
  chess: {
    nameHe: 'פרש מלכותי — צורה 3',
    movementProfile: 'ground',
    frameAnimation: {
      staticSrc: '/assets/companions/chess/form3/frames/idle-1.png',
      idleFrames: [
        '/assets/companions/chess/form3/frames/idle-1.png',
        '/assets/companions/chess/form3/frames/idle-2.png',
        '/assets/companions/chess/form3/frames/idle-3.png',
        '/assets/companions/chess/form3/frames/idle-4.png',
      ],
      runFrames: [
        '/assets/companions/chess/form3/frames/run-1.png',
        '/assets/companions/chess/form3/frames/run-2.png',
        '/assets/companions/chess/form3/frames/run-3.png',
        '/assets/companions/chess/form3/frames/run-4.png',
        '/assets/companions/chess/form3/frames/run-5.png',
        '/assets/companions/chess/form3/frames/run-6.png',
      ],
      idleFrameDurationMs: 330,
      runFrameDurationMs: 128,
    },
  },
  science: {
    nameHe: 'אטומיקס — חוקר ביו־אור מתקדם',
    movementProfile: 'ground',
    frameAnimation: {
      staticSrc: '/assets/companions/science/form3/frames/idle-1.png',
      idleFrames: [
        '/assets/companions/science/form3/frames/idle-1.png',
        '/assets/companions/science/form3/frames/idle-2.png',
        '/assets/companions/science/form3/frames/idle-3.png',
        '/assets/companions/science/form3/frames/idle-4.png',
      ],
      runFrames: [
        '/assets/companions/science/form3/frames/run-1.png',
        '/assets/companions/science/form3/frames/run-2.png',
        '/assets/companions/science/form3/frames/run-3.png',
        '/assets/companions/science/form3/frames/run-4.png',
        '/assets/companions/science/form3/frames/run-5.png',
        '/assets/companions/science/form3/frames/run-6.png',
      ],
      idleFrameDurationMs: 330,
      runFrameDurationMs: 128,
    },
  },
  space: {
    nameHe: 'נובה — שועל קוסמי צעיר',
    movementProfile: 'ground',
    frameAnimation: {
      staticSrc: '/assets/companions/space/form3/frames/idle-1.png',
      idleFrames: [
        '/assets/companions/space/form3/frames/idle-1.png',
        '/assets/companions/space/form3/frames/idle-2.png',
        '/assets/companions/space/form3/frames/idle-3.png',
        '/assets/companions/space/form3/frames/idle-4.png',
      ],
      runFrames: [
        '/assets/companions/space/form3/frames/run-1.png',
        '/assets/companions/space/form3/frames/run-2.png',
        '/assets/companions/space/form3/frames/run-3.png',
        '/assets/companions/space/form3/frames/run-4.png',
        '/assets/companions/space/form3/frames/run-5.png',
        '/assets/companions/space/form3/frames/run-6.png',
      ],
      idleFrameDurationMs: 330,
      runFrameDurationMs: 128,
    },
  },
  animals: {
    nameHe: 'פיץ — שועל שומר היער',
    movementProfile: 'ground',
    frameAnimation: {
      staticSrc: '/assets/companions/animals/form3/frames/idle-1.png',
      idleFrames: [
        '/assets/companions/animals/form3/frames/idle-1.png',
        '/assets/companions/animals/form3/frames/idle-2.png',
        '/assets/companions/animals/form3/frames/idle-3.png',
        '/assets/companions/animals/form3/frames/idle-4.png',
      ],
      runFrames: [
        '/assets/companions/animals/form3/frames/run-1.png',
        '/assets/companions/animals/form3/frames/run-2.png',
        '/assets/companions/animals/form3/frames/run-3.png',
        '/assets/companions/animals/form3/frames/run-4.png',
        '/assets/companions/animals/form3/frames/run-5.png',
        '/assets/companions/animals/form3/frames/run-6.png',
      ],
      idleFrameDurationMs: 330,
      runFrameDurationMs: 128,
    },
  },
  nature: {
    nameHe: 'עלה — רוח החורש הצעירה',
    movementProfile: 'ground',
    frameAnimation: {
      staticSrc: '/assets/companions/nature/form3/frames/idle-1.png',
      idleFrames: [
        '/assets/companions/nature/form3/frames/idle-1.png',
        '/assets/companions/nature/form3/frames/idle-2.png',
        '/assets/companions/nature/form3/frames/idle-3.png',
        '/assets/companions/nature/form3/frames/idle-4.png',
      ],
      runFrames: [
        '/assets/companions/nature/form3/frames/run-1.png',
        '/assets/companions/nature/form3/frames/run-2.png',
        '/assets/companions/nature/form3/frames/run-3.png',
        '/assets/companions/nature/form3/frames/run-4.png',
        '/assets/companions/nature/form3/frames/run-5.png',
        '/assets/companions/nature/form3/frames/run-6.png',
      ],
      idleFrameDurationMs: 330,
      runFrameDurationMs: 128,
    },
  },
  robotics: {
    nameHe: 'ביט־X — כלב רובוטי מתקדם',
    movementProfile: 'ground',
    frameAnimation: {
      staticSrc: '/assets/companions/robotics/form3/frames/idle-1.png',
      idleFrames: [
        '/assets/companions/robotics/form3/frames/idle-1.png',
        '/assets/companions/robotics/form3/frames/idle-2.png',
        '/assets/companions/robotics/form3/frames/idle-3.png',
        '/assets/companions/robotics/form3/frames/idle-4.png',
      ],
      runFrames: [
        '/assets/companions/robotics/form3/frames/run-1.png',
        '/assets/companions/robotics/form3/frames/run-2.png',
        '/assets/companions/robotics/form3/frames/run-3.png',
        '/assets/companions/robotics/form3/frames/run-4.png',
        '/assets/companions/robotics/form3/frames/run-5.png',
        '/assets/companions/robotics/form3/frames/run-6.png',
      ],
      idleFrameDurationMs: 330,
      runFrameDurationMs: 128,
    },
  },
  fantasy: {
    nameHe: 'לונה — דרקון רונות צעיר',
    movementProfile: 'ground',
    frameAnimation: {
      staticSrc: '/assets/companions/fantasy/form3/frames/idle-1.png',
      idleFrames: [
        '/assets/companions/fantasy/form3/frames/idle-1.png',
        '/assets/companions/fantasy/form3/frames/idle-2.png',
        '/assets/companions/fantasy/form3/frames/idle-3.png',
        '/assets/companions/fantasy/form3/frames/idle-4.png',
      ],
      runFrames: [
        '/assets/companions/fantasy/form3/frames/run-1.png',
        '/assets/companions/fantasy/form3/frames/run-2.png',
        '/assets/companions/fantasy/form3/frames/run-3.png',
        '/assets/companions/fantasy/form3/frames/run-4.png',
        '/assets/companions/fantasy/form3/frames/run-5.png',
        '/assets/companions/fantasy/form3/frames/run-6.png',
      ],
      idleFrameDurationMs: 330,
      runFrameDurationMs: 128,
    },
  },
  art: {
    nameHe: 'פלטה — מאסטר הצבע',
    movementProfile: 'ground',
    frameAnimation: {
      staticSrc: '/assets/companions/art/form3/frames/idle-1.png',
      idleFrames: [
        '/assets/companions/art/form3/frames/idle-1.png',
        '/assets/companions/art/form3/frames/idle-2.png',
        '/assets/companions/art/form3/frames/idle-3.png',
        '/assets/companions/art/form3/frames/idle-4.png',
      ],
      runFrames: [
        '/assets/companions/art/form3/frames/run-1.png',
        '/assets/companions/art/form3/frames/run-2.png',
        '/assets/companions/art/form3/frames/run-3.png',
        '/assets/companions/art/form3/frames/run-4.png',
        '/assets/companions/art/form3/frames/run-5.png',
        '/assets/companions/art/form3/frames/run-6.png',
      ],
      idleFrameDurationMs: 330,
      runFrameDurationMs: 128,
    },
  },
  building: {
    nameHe: 'בוני — בונה־מהנדס בכיר',
    movementProfile: 'ground',
    frameAnimation: {
      staticSrc: '/assets/companions/building/form3/frames/idle-1.png',
      idleFrames: [
        '/assets/companions/building/form3/frames/idle-1.png',
        '/assets/companions/building/form3/frames/idle-2.png',
        '/assets/companions/building/form3/frames/idle-3.png',
        '/assets/companions/building/form3/frames/idle-4.png',
      ],
      runFrames: [
        '/assets/companions/building/form3/frames/run-1.png',
        '/assets/companions/building/form3/frames/run-2.png',
        '/assets/companions/building/form3/frames/run-3.png',
        '/assets/companions/building/form3/frames/run-4.png',
        '/assets/companions/building/form3/frames/run-5.png',
        '/assets/companions/building/form3/frames/run-6.png',
      ],
      idleFrameDurationMs: 330,
      runFrameDurationMs: 128,
    },
  },
  sports: {
    nameHe: 'ספרינט — אלוף צעיר',
    movementProfile: 'ground',
    frameAnimation: {
      staticSrc: '/assets/companions/sports/form3/frames/idle-1.png',
      idleFrames: [
        '/assets/companions/sports/form3/frames/idle-1.png',
        '/assets/companions/sports/form3/frames/idle-2.png',
        '/assets/companions/sports/form3/frames/idle-3.png',
        '/assets/companions/sports/form3/frames/idle-4.png',
      ],
      runFrames: [
        '/assets/companions/sports/form3/frames/run-1.png',
        '/assets/companions/sports/form3/frames/run-2.png',
        '/assets/companions/sports/form3/frames/run-3.png',
        '/assets/companions/sports/form3/frames/run-4.png',
        '/assets/companions/sports/form3/frames/run-5.png',
        '/assets/companions/sports/form3/frames/run-6.png',
      ],
      idleFrameDurationMs: 330,
      runFrameDurationMs: 128,
    },
  },
  music: {
    nameHe: 'מנגינה — ציפור המאסטרו',
    movementProfile: 'ground',
    frameAnimation: {
      staticSrc: '/assets/companions/music/form3/frames/idle-1.png',
      idleFrames: [
        '/assets/companions/music/form3/frames/idle-1.png',
        '/assets/companions/music/form3/frames/idle-2.png',
        '/assets/companions/music/form3/frames/idle-3.png',
        '/assets/companions/music/form3/frames/idle-4.png',
      ],
      runFrames: [
        '/assets/companions/music/form3/frames/run-1.png',
        '/assets/companions/music/form3/frames/run-2.png',
        '/assets/companions/music/form3/frames/run-3.png',
        '/assets/companions/music/form3/frames/run-4.png',
        '/assets/companions/music/form3/frames/run-5.png',
        '/assets/companions/music/form3/frames/run-6.png',
      ],
      idleFrameDurationMs: 330,
      runFrameDurationMs: 128,
    },
  },
  books: {
    nameHe: 'דפדף — ינשוף הארכיבר',
    movementProfile: 'ground',
    frameAnimation: {
      staticSrc: '/assets/companions/books/form3/frames/idle-1.png',
      idleFrames: [
        '/assets/companions/books/form3/frames/idle-1.png',
        '/assets/companions/books/form3/frames/idle-2.png',
        '/assets/companions/books/form3/frames/idle-3.png',
        '/assets/companions/books/form3/frames/idle-4.png',
      ],
      runFrames: [
        '/assets/companions/books/form3/frames/run-1.png',
        '/assets/companions/books/form3/frames/run-2.png',
        '/assets/companions/books/form3/frames/run-3.png',
        '/assets/companions/books/form3/frames/run-4.png',
        '/assets/companions/books/form3/frames/run-5.png',
        '/assets/companions/books/form3/frames/run-6.png',
      ],
      idleFrameDurationMs: 330,
      runFrameDurationMs: 128,
    },
  },
  math: {
    nameHe: 'פאי — פנדה אדומה גאומטרית',
    movementProfile: 'ground',
    frameAnimation: {
      staticSrc: '/assets/companions/math/form3/frames/idle-1.png',
      idleFrames: [
        '/assets/companions/math/form3/frames/idle-1.png',
        '/assets/companions/math/form3/frames/idle-2.png',
        '/assets/companions/math/form3/frames/idle-3.png',
        '/assets/companions/math/form3/frames/idle-4.png',
      ],
      runFrames: [
        '/assets/companions/math/form3/frames/run-1.png',
        '/assets/companions/math/form3/frames/run-2.png',
        '/assets/companions/math/form3/frames/run-3.png',
        '/assets/companions/math/form3/frames/run-4.png',
        '/assets/companions/math/form3/frames/run-5.png',
        '/assets/companions/math/form3/frames/run-6.png',
      ],
      idleFrameDurationMs: 330,
      runFrameDurationMs: 128,
    },
  },
  generic: {
    nameHe: 'ניצוץ — אריה מלכותי צעיר',
    movementProfile: 'ground',
    frameAnimation: {
      staticSrc: '/assets/companions/generic/form3/frames/idle-1.png',
      idleFrames: [
        '/assets/companions/generic/form3/frames/idle-1.png',
        '/assets/companions/generic/form3/frames/idle-2.png',
        '/assets/companions/generic/form3/frames/idle-3.png',
        '/assets/companions/generic/form3/frames/idle-4.png',
      ],
      runFrames: [
        '/assets/companions/generic/form3/frames/run-1.png',
        '/assets/companions/generic/form3/frames/run-2.png',
        '/assets/companions/generic/form3/frames/run-3.png',
        '/assets/companions/generic/form3/frames/run-4.png',
        '/assets/companions/generic/form3/frames/run-5.png',
        '/assets/companions/generic/form3/frames/run-6.png',
      ],
      idleFrameDurationMs: 330,
      runFrameDurationMs: 128,
    },
  },
  ballet: {
    nameHe: 'ברבורית — ברבורת פרימה צעירה',
    movementProfile: 'ground',
    frameAnimation: {
      staticSrc: '/assets/companions/ballet/form3/frames/idle-1.png',
      idleFrames: [
        '/assets/companions/ballet/form3/frames/idle-1.png',
        '/assets/companions/ballet/form3/frames/idle-2.png',
        '/assets/companions/ballet/form3/frames/idle-3.png',
        '/assets/companions/ballet/form3/frames/idle-4.png',
      ],
      runFrames: [
        '/assets/companions/ballet/form3/frames/run-1.png',
        '/assets/companions/ballet/form3/frames/run-2.png',
        '/assets/companions/ballet/form3/frames/run-3.png',
        '/assets/companions/ballet/form3/frames/run-4.png',
        '/assets/companions/ballet/form3/frames/run-5.png',
        '/assets/companions/ballet/form3/frames/run-6.png',
      ],
      idleFrameDurationMs: 330,
      runFrameDurationMs: 128,
    },
  }
};
// FORM3_FULL_REBUILD_2026_08_25_END

// FORM4_MAGICAL_BATCH_2026_08_29_START
const FORM4_MAGICAL_ART: Partial<Record<ThemeId, CompanionFormArt>> = {
  science: {
    nameHe: 'אטומיקס — אלכימאי הביו־אור',
    movementProfile: 'ground',
    frameAnimation: {
      staticSrc: '/assets/companions/science/form4/frames/idle-1.png',
      idleFrames: [
        '/assets/companions/science/form4/frames/idle-1.png',
        '/assets/companions/science/form4/frames/idle-2.png',
        '/assets/companions/science/form4/frames/idle-3.png',
        '/assets/companions/science/form4/frames/idle-4.png',
      ],
      runFrames: [
        '/assets/companions/science/form4/frames/run-1.png',
        '/assets/companions/science/form4/frames/run-2.png',
        '/assets/companions/science/form4/frames/run-3.png',
        '/assets/companions/science/form4/frames/run-4.png',
        '/assets/companions/science/form4/frames/run-5.png',
        '/assets/companions/science/form4/frames/run-6.png',
      ],
      idleFrameDurationMs: 310,
      runFrameDurationMs: 124,
    },
  },
  space: {
    nameHe: 'נובה — שומרת הערפילית',
    movementProfile: 'ground',
    frameAnimation: {
      staticSrc: '/assets/companions/space/form4/frames/idle-1.png',
      idleFrames: [
        '/assets/companions/space/form4/frames/idle-1.png',
        '/assets/companions/space/form4/frames/idle-2.png',
        '/assets/companions/space/form4/frames/idle-3.png',
        '/assets/companions/space/form4/frames/idle-4.png',
      ],
      runFrames: [
        '/assets/companions/space/form4/frames/run-1.png',
        '/assets/companions/space/form4/frames/run-2.png',
        '/assets/companions/space/form4/frames/run-3.png',
        '/assets/companions/space/form4/frames/run-4.png',
        '/assets/companions/space/form4/frames/run-5.png',
        '/assets/companions/space/form4/frames/run-6.png',
      ],
      idleFrameDurationMs: 310,
      runFrameDurationMs: 124,
    },
  },
  animals: {
    nameHe: 'פיץ — שומר הפרא הקסום',
    movementProfile: 'ground',
    frameAnimation: {
      staticSrc: '/assets/companions/animals/form4/frames/idle-1.png',
      idleFrames: [
        '/assets/companions/animals/form4/frames/idle-1.png',
        '/assets/companions/animals/form4/frames/idle-2.png',
        '/assets/companions/animals/form4/frames/idle-3.png',
        '/assets/companions/animals/form4/frames/idle-4.png',
      ],
      runFrames: [
        '/assets/companions/animals/form4/frames/run-1.png',
        '/assets/companions/animals/form4/frames/run-2.png',
        '/assets/companions/animals/form4/frames/run-3.png',
        '/assets/companions/animals/form4/frames/run-4.png',
        '/assets/companions/animals/form4/frames/run-5.png',
        '/assets/companions/animals/form4/frames/run-6.png',
      ],
      idleFrameDurationMs: 310,
      runFrameDurationMs: 124,
    },
  },
  nature: {
    nameHe: 'עלה — רוח החורש',
    movementProfile: 'ground',
    frameAnimation: {
      staticSrc: '/assets/companions/nature/form4/frames/idle-1.png',
      idleFrames: [
        '/assets/companions/nature/form4/frames/idle-1.png',
        '/assets/companions/nature/form4/frames/idle-2.png',
        '/assets/companions/nature/form4/frames/idle-3.png',
        '/assets/companions/nature/form4/frames/idle-4.png',
      ],
      runFrames: [
        '/assets/companions/nature/form4/frames/run-1.png',
        '/assets/companions/nature/form4/frames/run-2.png',
        '/assets/companions/nature/form4/frames/run-3.png',
        '/assets/companions/nature/form4/frames/run-4.png',
        '/assets/companions/nature/form4/frames/run-5.png',
        '/assets/companions/nature/form4/frames/run-6.png',
      ],
      idleFrameDurationMs: 310,
      runFrameDurationMs: 124,
    },
  },
  robotics: {
    nameHe: 'ביט־X — שומר הסייבר',
    movementProfile: 'ground',
    frameAnimation: {
      staticSrc: '/assets/companions/robotics/form4/frames/idle-1.png',
      idleFrames: [
        '/assets/companions/robotics/form4/frames/idle-1.png',
        '/assets/companions/robotics/form4/frames/idle-2.png',
        '/assets/companions/robotics/form4/frames/idle-3.png',
        '/assets/companions/robotics/form4/frames/idle-4.png',
      ],
      runFrames: [
        '/assets/companions/robotics/form4/frames/run-1.png',
        '/assets/companions/robotics/form4/frames/run-2.png',
        '/assets/companions/robotics/form4/frames/run-3.png',
        '/assets/companions/robotics/form4/frames/run-4.png',
        '/assets/companions/robotics/form4/frames/run-5.png',
        '/assets/companions/robotics/form4/frames/run-6.png',
      ],
      idleFrameDurationMs: 310,
      runFrameDurationMs: 124,
    },
  },
  fantasy: {
    nameHe: 'לונה — דרקון הרונות הקסום',
    movementProfile: 'ground',
    frameAnimation: {
      staticSrc: '/assets/companions/fantasy/form4/frames/idle-1.png',
      idleFrames: [
        '/assets/companions/fantasy/form4/frames/idle-1.png',
        '/assets/companions/fantasy/form4/frames/idle-2.png',
        '/assets/companions/fantasy/form4/frames/idle-3.png',
        '/assets/companions/fantasy/form4/frames/idle-4.png',
      ],
      runFrames: [
        '/assets/companions/fantasy/form4/frames/run-1.png',
        '/assets/companions/fantasy/form4/frames/run-2.png',
        '/assets/companions/fantasy/form4/frames/run-3.png',
        '/assets/companions/fantasy/form4/frames/run-4.png',
        '/assets/companions/fantasy/form4/frames/run-5.png',
        '/assets/companions/fantasy/form4/frames/run-6.png',
      ],
      idleFrameDurationMs: 310,
      runFrameDurationMs: 124,
    },
  },
  art: {
    nameHe: 'פלטה — מאסטרית הצבע הקסומה',
    movementProfile: 'ground',
    frameAnimation: {
      staticSrc: '/assets/companions/art/form4/frames/idle-1.png',
      idleFrames: [
        '/assets/companions/art/form4/frames/idle-1.png',
        '/assets/companions/art/form4/frames/idle-2.png',
        '/assets/companions/art/form4/frames/idle-3.png',
        '/assets/companions/art/form4/frames/idle-4.png',
      ],
      runFrames: [
        '/assets/companions/art/form4/frames/run-1.png',
        '/assets/companions/art/form4/frames/run-2.png',
        '/assets/companions/art/form4/frames/run-3.png',
        '/assets/companions/art/form4/frames/run-4.png',
        '/assets/companions/art/form4/frames/run-5.png',
        '/assets/companions/art/form4/frames/run-6.png',
      ],
      idleFrameDurationMs: 310,
      runFrameDurationMs: 124,
    },
  },
  building: {
    nameHe: 'בוני — אדריכל הממלכה',
    movementProfile: 'ground',
    frameAnimation: {
      staticSrc: '/assets/companions/building/form4/frames/idle-1.png',
      idleFrames: [
        '/assets/companions/building/form4/frames/idle-1.png',
        '/assets/companions/building/form4/frames/idle-2.png',
        '/assets/companions/building/form4/frames/idle-3.png',
        '/assets/companions/building/form4/frames/idle-4.png',
      ],
      runFrames: [
        '/assets/companions/building/form4/frames/run-1.png',
        '/assets/companions/building/form4/frames/run-2.png',
        '/assets/companions/building/form4/frames/run-3.png',
        '/assets/companions/building/form4/frames/run-4.png',
        '/assets/companions/building/form4/frames/run-5.png',
        '/assets/companions/building/form4/frames/run-6.png',
      ],
      idleFrameDurationMs: 310,
      runFrameDurationMs: 124,
    },
  },
  sports: {
    nameHe: 'ספרינט — אלוף הלהבה',
    movementProfile: 'ground',
    frameAnimation: {
      staticSrc: '/assets/companions/sports/form4/frames/idle-1.png',
      idleFrames: [
        '/assets/companions/sports/form4/frames/idle-1.png',
        '/assets/companions/sports/form4/frames/idle-2.png',
        '/assets/companions/sports/form4/frames/idle-3.png',
        '/assets/companions/sports/form4/frames/idle-4.png',
      ],
      runFrames: [
        '/assets/companions/sports/form4/frames/run-1.png',
        '/assets/companions/sports/form4/frames/run-2.png',
        '/assets/companions/sports/form4/frames/run-3.png',
        '/assets/companions/sports/form4/frames/run-4.png',
        '/assets/companions/sports/form4/frames/run-5.png',
        '/assets/companions/sports/form4/frames/run-6.png',
      ],
      idleFrameDurationMs: 310,
      runFrameDurationMs: 124,
    },
  },
  music: {
    nameHe: 'מנגינה — מאסטרו הכנפיים',
    movementProfile: 'ground',
    frameAnimation: {
      staticSrc: '/assets/companions/music/form4/frames/idle-1.png',
      idleFrames: [
        '/assets/companions/music/form4/frames/idle-1.png',
        '/assets/companions/music/form4/frames/idle-2.png',
        '/assets/companions/music/form4/frames/idle-3.png',
        '/assets/companions/music/form4/frames/idle-4.png',
      ],
      runFrames: [
        '/assets/companions/music/form4/frames/run-1.png',
        '/assets/companions/music/form4/frames/run-2.png',
        '/assets/companions/music/form4/frames/run-3.png',
        '/assets/companions/music/form4/frames/run-4.png',
        '/assets/companions/music/form4/frames/run-5.png',
        '/assets/companions/music/form4/frames/run-6.png',
      ],
      idleFrameDurationMs: 310,
      runFrameDurationMs: 124,
    },
  },
  books: {
    nameHe: 'דפדף — חכם הארכיון',
    movementProfile: 'ground',
    frameAnimation: {
      staticSrc: '/assets/companions/books/form4/frames/idle-1.png',
      idleFrames: [
        '/assets/companions/books/form4/frames/idle-1.png',
        '/assets/companions/books/form4/frames/idle-2.png',
        '/assets/companions/books/form4/frames/idle-3.png',
        '/assets/companions/books/form4/frames/idle-4.png',
      ],
      runFrames: [
        '/assets/companions/books/form4/frames/run-1.png',
        '/assets/companions/books/form4/frames/run-2.png',
        '/assets/companions/books/form4/frames/run-3.png',
        '/assets/companions/books/form4/frames/run-4.png',
        '/assets/companions/books/form4/frames/run-5.png',
        '/assets/companions/books/form4/frames/run-6.png',
      ],
      idleFrameDurationMs: 310,
      runFrameDurationMs: 124,
    },
  },
  math: {
    nameHe: 'פאי — גאומטריקאי הקסם',
    movementProfile: 'ground',
    frameAnimation: {
      staticSrc: '/assets/companions/math/form4/frames/idle-1.png',
      idleFrames: [
        '/assets/companions/math/form4/frames/idle-1.png',
        '/assets/companions/math/form4/frames/idle-2.png',
        '/assets/companions/math/form4/frames/idle-3.png',
        '/assets/companions/math/form4/frames/idle-4.png',
      ],
      runFrames: [
        '/assets/companions/math/form4/frames/run-1.png',
        '/assets/companions/math/form4/frames/run-2.png',
        '/assets/companions/math/form4/frames/run-3.png',
        '/assets/companions/math/form4/frames/run-4.png',
        '/assets/companions/math/form4/frames/run-5.png',
        '/assets/companions/math/form4/frames/run-6.png',
      ],
      idleFrameDurationMs: 310,
      runFrameDurationMs: 124,
    },
  },
  generic: {
    nameHe: 'ניצוץ — שומר הממלכה',
    movementProfile: 'ground',
    frameAnimation: {
      staticSrc: '/assets/companions/generic/form4/frames/idle-1.png',
      idleFrames: [
        '/assets/companions/generic/form4/frames/idle-1.png',
        '/assets/companions/generic/form4/frames/idle-2.png',
        '/assets/companions/generic/form4/frames/idle-3.png',
        '/assets/companions/generic/form4/frames/idle-4.png',
      ],
      runFrames: [
        '/assets/companions/generic/form4/frames/run-1.png',
        '/assets/companions/generic/form4/frames/run-2.png',
        '/assets/companions/generic/form4/frames/run-3.png',
        '/assets/companions/generic/form4/frames/run-4.png',
        '/assets/companions/generic/form4/frames/run-5.png',
        '/assets/companions/generic/form4/frames/run-6.png',
      ],
      idleFrameDurationMs: 310,
      runFrameDurationMs: 124,
    },
  },
  ballet: {
    nameHe: 'ברבורית — פרימה קסומה',
    movementProfile: 'ground',
    frameAnimation: {
      staticSrc: '/assets/companions/ballet/form4/frames/idle-1.png',
      idleFrames: [
        '/assets/companions/ballet/form4/frames/idle-1.png',
        '/assets/companions/ballet/form4/frames/idle-2.png',
        '/assets/companions/ballet/form4/frames/idle-3.png',
        '/assets/companions/ballet/form4/frames/idle-4.png',
      ],
      runFrames: [
        '/assets/companions/ballet/form4/frames/run-1.png',
        '/assets/companions/ballet/form4/frames/run-2.png',
        '/assets/companions/ballet/form4/frames/run-3.png',
        '/assets/companions/ballet/form4/frames/run-4.png',
        '/assets/companions/ballet/form4/frames/run-5.png',
        '/assets/companions/ballet/form4/frames/run-6.png',
      ],
      idleFrameDurationMs: 310,
      runFrameDurationMs: 124,
    },
  },
};
// FORM4_MAGICAL_BATCH_2026_08_29_END

export function getCompanionFormArt(
  theme: ThemeId,
  stage: CompanionStage
): CompanionFormArt | null {
  if (stage === 'egg') return null;
  if (stage === 'grown') return FORM3_GROWN_ART[theme] ?? COMPANION_FORM_ART[theme]?.[stage] ?? null;
  if (stage === 'magical') return FORM4_MAGICAL_ART[theme] ?? COMPANION_FORM_ART[theme]?.[stage] ?? null;
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
