export type ItemSpriteData = {
  src: string;
  alt: string;
  className?: string;

  roomOffsetX?: number;
  roomOffsetY?: number;

  roomWidthScale?: number;
  roomHeightScale?: number;

  roomRotation?: number;
  roomAnchorY?: string;

  roomShelfOffsetX?: number;
  roomShelfOffsetY?: number;
  roomShelfWidthScale?: number;
  roomShelfHeightScale?: number;

  roomFloorOffsetX?: number;
  roomFloorOffsetY?: number;
  roomFloorWidthScale?: number;
  roomFloorHeightScale?: number;
};

const chessBoardBasic: ItemSpriteData = {
  src: '/assets/items/chess-board-basic.png',
  alt: 'לוח שחמט',
  className: 'object-contain drop-shadow-[0_8px_8px_rgba(0,0,0,0.35)]',

  roomOffsetX: 16,
  roomOffsetY: 16,
  roomWidthScale: 1.25,
  roomHeightScale: 1.25,
};

const genericBookStack: ItemSpriteData = {
  src: '/assets/items/generic-book-stack.png',
  alt: 'ערימת ספרים',
  className: 'object-contain drop-shadow-[0_8px_8px_rgba(0,0,0,0.35)]',

  roomOffsetY: 26,
  roomWidthScale: 1.35,
  roomHeightScale: 1.35,
};

const chessOpeningBook: ItemSpriteData = {
  src: '/assets/items/chess-opening-book.png',
  alt: 'ספר פתיחות',
  className:
    'object-contain scale-[2] drop-shadow-[0_0_10px_rgba(80,180,255,0.65)]',
};

const spaceStarSticker: ItemSpriteData = {
  src: '/assets/items/space-star-sticker.png',
  alt: 'מדבקת כוכב',
  className:
    'object-contain scale-[1.05] drop-shadow-[0_0_10px_rgba(255,220,80,0.65)]',
};

const rugBasic: ItemSpriteData = {
  src: '/assets/items/rug-basic.png',
  alt: 'שטיח רך',
  className:
    'object-fill translate-y-[2px] drop-shadow-[0_10px_10px_rgba(0,0,0,0.25)]',
};

const genericCandle: ItemSpriteData = {
  src: '/assets/items/generic-candle.png',
  alt: 'נר למידה',
  className: 'object-contain drop-shadow-[0_8px_8px_rgba(0,0,0,0.35)]',

  roomOffsetX: 0,
  roomOffsetY: 4,
  roomWidthScale: 1.6,
  roomHeightScale: 1.6,
};

const genericMagicScroll: ItemSpriteData = {
  src: '/assets/items/generic-magic-scroll.png',
  alt: 'מגילת קסם',
  className:
    'object-contain drop-shadow-[0_0_10px_rgba(80,180,255,0.45)] drop-shadow-[0_8px_14px_rgba(0,0,0,0.30)]',

  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 1.35,
  roomHeightScale: 1.35,
};

const posterStars: ItemSpriteData = {
  src: '/assets/items/poster-stars.png',
  alt: 'פוסטר כוכבים',
  className: 'object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.28)]',

  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 1.15,
  roomHeightScale: 1.2,
};

const animalsFoxStatue: ItemSpriteData = {
  src: '/assets/items/fox-statue.png',
  alt: 'פסל שועל',
  className: 'object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.30)]',

  // ברירת מחדל / special
  roomOffsetX: 0,
  roomOffsetY: 10,
  roomWidthScale: 1.4,
  roomHeightScale: 1.4,

  // על מדף – גדול יותר
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 2.1,
  roomShelfHeightScale: 2.1,

  // על רצפה – גדול משמעותית יותר
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 22,
  roomFloorWidthScale: 3.0,
  roomFloorHeightScale: 3.0,
};

const lampBasic: ItemSpriteData = {
  src: '/assets/items/lamp-basic.png',
  alt: 'מנורת קסם',
  className:
    'object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.35)] drop-shadow-[0_0_10px_rgba(255,220,120,0.25)]',
  roomOffsetY: 20,
  roomWidthScale: 1.6,
  roomHeightScale: 1.6,
};

const chessTacticsCards: ItemSpriteData = {
  src: '/assets/items/chess-tactics-cards.png',
  alt: 'קלפי טקטיקה',
  className:
    'object-contain drop-shadow-[0_0_10px_rgba(80,180,255,0.45)] drop-shadow-[0_8px_14px_rgba(0,0,0,0.30)]',

  roomOffsetX: 0,
  roomOffsetY: 26,
  roomWidthScale: 1.75,
  roomHeightScale: 1.75,
};

const spacePlanet: ItemSpriteData = {
  src: '/assets/items/space-planet.png',
  alt: 'כדור הארץ הקטן',
  className:
    'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.30)]',

  // ברירת מחדל — שולחן
  roomOffsetX: 0,
  roomOffsetY: 10,
  roomWidthScale: 1.45,
  roomHeightScale: 1.45,

  // מדף
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 21,
  roomShelfWidthScale: 1.45,
  roomShelfHeightScale: 1.45,
};

const chessClock: ItemSpriteData = {
  src: '/assets/items/chess-clock.png',
  alt: 'שעון שחמט',
  className:
    'object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.28)]',

  // שולחן — כמו עכשיו, כי אמרת שהוא יושב טוב
  roomOffsetX: 0,
  roomOffsetY: 24,
  roomWidthScale: 1.05,
  roomHeightScale: 1.05,

  // מדף — מיקום נפרד לפי השיטה החדשה
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 32,
  roomShelfWidthScale: 0.95,
  roomShelfHeightScale: 0.95,
};

const genericSmallPlant: ItemSpriteData = {
  src: '/assets/items/generic-small-plant.png',
  alt: 'עציץ קטן',
  className:
    'object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.28)]',

  // ברירת מחדל — מתאים לשולחן
  roomOffsetX: 0,
  roomOffsetY: 10,
  roomWidthScale: 1.3,
  roomHeightScale: 1.3,

  // מדף
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 30,
  roomShelfWidthScale: 1.3,
  roomShelfHeightScale: 1.3,

  // רצפה — קצת יותר נמוך
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 36,
  roomFloorWidthScale: 1.45,
  roomFloorHeightScale: 1.45,
};

const chessKnight: ItemSpriteData = {
  src: '/assets/items/chess-knight.png',
  alt: 'פרש שחמט',
  className:
    'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.35)]',

  // ברירת מחדל — מתאים לשולחן
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 1.35,
  roomHeightScale: 1.35,

  // מדף
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 8,
  roomShelfWidthScale: 1.25,
  roomShelfHeightScale: 1.25,

  roomRotation: 0,
};

const chessQueenStatue: ItemSpriteData = {
  src: '/assets/items/chess-queen-statue.png',
  alt: 'פסל מלכה',
  className:
    'object-contain drop-shadow-[0_0_18px_rgba(255,220,120,0.65)]',

  // ברירת מחדל — מתאים לשולחן
  roomOffsetX: 0,
  roomOffsetY: 4,
  roomWidthScale: 1.75,
  roomHeightScale: 1.75,

  // מדף — גדול, אבל לא ענק מדי
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 20,
  roomShelfWidthScale: 1.85,
  roomShelfHeightScale: 1.85,

  // רצפה / special — כאן היא צריכה להיות הכי מרשימה
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 18,
  roomFloorWidthScale: 2.35,
  roomFloorHeightScale: 2.35,
};

const chessKing: ItemSpriteData = {
  src: '/assets/items/chess-king.png',
  alt: 'מלך השחמט',
  className:
    'object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.35)]',

  // ברירת מחדל
  roomOffsetX: 0,
  roomOffsetY: 8,
  roomWidthScale: 2.05,
  roomHeightScale: 2.05,

  // מדף
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 20,
  roomShelfWidthScale: 2.2,
  roomShelfHeightScale: 2.2,

  // רצפה / special
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 26,
  roomFloorWidthScale: 2.35,
  roomFloorHeightScale: 2.35,
};

const chessPawn: ItemSpriteData = {
  src: '/assets/items/chess-pawn.png',
  alt: 'פיון שחמט',
  className: 'object-contain drop-shadow-[0_6px_8px_rgba(0,0,0,0.35)]',

  roomOffsetY: 26,
  roomWidthScale: 1.7,
  roomHeightScale: 1.7,
};

const spaceMoonLamp: ItemSpriteData = {
  src: '/assets/items/space-moon-lamp.png',
  alt: 'מנורת ירח',
  className:
    'object-contain drop-shadow-[0_0_14px_rgba(180,210,255,0.55)]',

  // ברירת מחדל — שולחן
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 1.25,
  roomHeightScale: 1.25,

  // מדף
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 25,
  roomShelfWidthScale: 1.2,
  roomShelfHeightScale: 1.2,
};

const spaceRocket: ItemSpriteData = {
  src: '/assets/items/space-rocket.png',
  alt: 'דגם רקטה',
  className:
    'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)]',

  // ברירת מחדל — שולחן
  roomOffsetX: 0,
  roomOffsetY: 4,
  roomWidthScale: 1.45,
  roomHeightScale: 1.45,

  // מדף
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 20,
  roomShelfWidthScale: 1.35,
  roomShelfHeightScale: 1.35,
};

const spaceBlackHole: ItemSpriteData = {
  src: '/assets/items/space-black-hole.png',
  alt: 'חור שחור זעיר',
  className:
    'object-contain drop-shadow-[0_0_18px_rgba(120,80,255,0.75)]',

  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 1.55,
  roomHeightScale: 1.55,

  // מדף — אפי, אבל עדיין צריך לשבת יפה על המדף
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 21,
  roomShelfWidthScale: 1.55,
  roomShelfHeightScale: 1.55,

  // רצפה / special — גדול ומרשים יותר
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 6,
  roomFloorWidthScale: 1.9,
  roomFloorHeightScale: 1.9,
};

const spaceGalaxyCore: ItemSpriteData = {
  src: '/assets/items/space-galaxy-core.png',
  alt: 'ליבת גלקסיה',
  className:
    'object-contain drop-shadow-[0_0_18px_rgba(180,120,255,0.9)]',

  // ברירת מחדל / special / רצפה
  roomOffsetX: 0,
  roomOffsetY: 20,
  roomWidthScale: 2.15,
  roomHeightScale: 2.15,

  // מדף — קטן יותר, כדי שלא ישתלט על כל המדף
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 18,
  roomShelfWidthScale: 1.55,
  roomShelfHeightScale: 1.55,

  // רצפה — גדול ומרשים יותר
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 28,
  roomFloorWidthScale: 2.25,
  roomFloorHeightScale: 2.25,
};

const spaceAstronautHelmet: ItemSpriteData = {
  src: '/assets/items/space-astronaut-helmet.png',
  alt: 'קסדת אסטרונאוט',
  className: 'object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.30)] drop-shadow-[0_0_10px_rgba(70,210,255,0.24)]',
  roomOffsetX: 0,
  roomOffsetY: 10,
  roomWidthScale: 1.3,
  roomHeightScale: 1.3,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const spaceSatelliteModel: ItemSpriteData = {
  src: '/assets/items/space-satellite-model.png',
  alt: 'דגם לוויין',
  className: 'object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.30)]',
  roomOffsetX: 0,
  roomOffsetY: 8,
  roomWidthScale: 1.35,
  roomHeightScale: 1.35,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const spaceMeteoriteSample: ItemSpriteData = {
  src: '/assets/items/space-meteorite-sample.png',
  alt: 'דגימת מטאוריט',
  className: 'object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.32)] drop-shadow-[0_0_10px_rgba(130,90,255,0.30)]',
  roomOffsetX: 0,
  roomOffsetY: 12,
  roomWidthScale: 1.3,
  roomHeightScale: 1.3,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 18,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const spaceAlienPlant: ItemSpriteData = {
  src: '/assets/items/space-alien-plant.png',
  alt: 'צמח חייזרי קטן',
  className: 'object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.30)] drop-shadow-[0_0_12px_rgba(100,230,220,0.28)]',
  roomOffsetX: 0,
  roomOffsetY: 8,
  roomWidthScale: 1.3,
  roomHeightScale: 1.3,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const spaceConstellationFrame: ItemSpriteData = {
  src: '/assets/items/space-constellation-frame.png',
  alt: 'תמונת קבוצות כוכבים',
  className: 'object-contain drop-shadow-[0_9px_18px_rgba(0,0,0,0.34)]',
  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 2.6,
  roomHeightScale: 1.65,
};

const spaceLaunchPadRug: ItemSpriteData = {
  src: '/assets/items/space-launch-pad-rug.png',
  alt: 'שטיח משטח שיגור',
  className: 'object-fill translate-y-[2px] drop-shadow-[0_10px_10px_rgba(0,0,0,0.25)]',
};

const spaceLunarRover: ItemSpriteData = {
  src: '/assets/items/space-lunar-rover.png',
  alt: 'רכב ירח קטן',
  className: 'object-contain drop-shadow-[0_9px_14px_rgba(0,0,0,0.32)]',
  roomOffsetX: 0,
  roomOffsetY: 18,
  roomWidthScale: 1.45,
  roomHeightScale: 1.45,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 17,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 42,
  roomFloorWidthScale: 1.95,
  roomFloorHeightScale: 1.95,
};

const spaceSolarSystemMobile: ItemSpriteData = {
  src: '/assets/items/space-solar-system-mobile.png',
  alt: 'מובייל מערכת השמש',
  className: 'object-contain drop-shadow-[0_9px_18px_rgba(0,0,0,0.32)] drop-shadow-[0_0_12px_rgba(255,190,70,0.24)]',
  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 1.8,
  roomHeightScale: 2.3,
};

const spaceFriendlyAlien: ItemSpriteData = {
  src: '/assets/items/space-friendly-alien.png',
  alt: 'אורח חייזרי ידידותי',
  className: 'object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.34)] drop-shadow-[0_0_14px_rgba(80,230,190,0.32)]',
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 1.6,
  roomHeightScale: 1.6,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 18,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 50,
  roomFloorWidthScale: 2.1,
  roomFloorHeightScale: 2.1,
};

const spaceObservatoryTelescope: ItemSpriteData = {
  src: '/assets/items/space-observatory-telescope.png',
  alt: 'טלסקופ לצפייה בכוכבים',
  className: 'object-contain drop-shadow-[0_12px_18px_rgba(0,0,0,0.34)]',
  roomOffsetX: 0,
  roomOffsetY: 50,
  roomWidthScale: 2,
  roomHeightScale: 2,
};

const spaceMarsColony: ItemSpriteData = {
  src: '/assets/items/space-mars-colony.png',
  alt: 'מושבת מאדים מיניאטורית',
  className: 'object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.34)] drop-shadow-[0_0_14px_rgba(70,210,255,0.28)]',
  roomOffsetX: 0,
  roomOffsetY: 12,
  roomWidthScale: 1.75,
  roomHeightScale: 1.75,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 18,
  roomShelfWidthScale: 1.15,
  roomShelfHeightScale: 1.15,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 52,
  roomFloorWidthScale: 2.3,
  roomFloorHeightScale: 2.3,
};

const spaceCrystalComet: ItemSpriteData = {
  src: '/assets/items/space-crystal-comet.png',
  alt: 'שביט קריסטל',
  className: 'object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.34)] drop-shadow-[0_0_18px_rgba(90,190,255,0.44)]',
  roomOffsetX: 0,
  roomOffsetY: 4,
  roomWidthScale: 1.8,
  roomHeightScale: 1.8,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 18,
  roomShelfWidthScale: 1.15,
  roomShelfHeightScale: 1.15,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 52,
  roomFloorWidthScale: 2.35,
  roomFloorHeightScale: 2.35,
};

const spaceAstronautExplorerStatue: ItemSpriteData = {
  src: '/assets/items/space-astronaut-explorer-statue.png',
  alt: 'פסל חוקרת החלל',
  className: 'object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.34)] drop-shadow-[0_0_16px_rgba(100,170,255,0.36)]',
  roomOffsetX: 0,
  roomOffsetY: 4,
  roomWidthScale: 1.9,
  roomHeightScale: 1.9,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 14,
  roomShelfWidthScale: 1.15,
  roomShelfHeightScale: 1.05,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 58,
  roomFloorWidthScale: 2.5,
  roomFloorHeightScale: 2.5,
};

const spaceNebulaPortal: ItemSpriteData = {
  src: '/assets/items/space-nebula-portal.png',
  alt: 'שער הערפילית',
  className: 'object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.38)] drop-shadow-[0_0_24px_rgba(150,90,255,0.55)]',
  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 2.5,
  roomHeightScale: 2.5,
};

const genericCrystalSmall: ItemSpriteData = {
  src: '/assets/items/generic-crystal-small.png',
  alt: 'קריסטל קטן',
  className:
    'object-contain drop-shadow-[0_0_12px_rgba(180,120,255,0.55)]',

  // שולחן
  roomOffsetX: 0,
  roomOffsetY: 8,
  roomWidthScale: 1.15,
  roomHeightScale: 1.15,

  // מדף
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 26,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const genericGoldTrophy: ItemSpriteData = {
  src: '/assets/items/generic-gold-trophy.png',
  alt: 'גביע זהב קטן',
  className:
    'object-contain drop-shadow-[0_0_12px_rgba(255,210,80,0.55)] drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)]',

  // שולחן
  roomOffsetX: 0,
  roomOffsetY: 10,
  roomWidthScale: 1.25,
  roomHeightScale: 1.25,

  // מדף
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 26,
  roomShelfWidthScale: 1.1,
  roomShelfHeightScale: 1.1,
};

const genericFloatingCrystal: ItemSpriteData = {
  src: '/assets/items/generic-floating-crystal.png',
  alt: 'קריסטל מרחף',
  className:
    'object-contain drop-shadow-[0_0_18px_rgba(255,120,255,0.75)] drop-shadow-[0_0_32px_rgba(180,80,255,0.45)]',

  // ברירת מחדל — שולחן / special
  roomOffsetX: 0,
  roomOffsetY: 2,
  roomWidthScale: 1.65,
  roomHeightScale: 1.65,

  // מדף — קטן יותר, כדי שלא ישתלט על המדף
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 18,
  roomShelfWidthScale: 1.35,
  roomShelfHeightScale: 1.35,

  // רצפה — גדול ומרשים יותר, כמו חפץ אפי
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 50,
  roomFloorWidthScale: 2.05,
  roomFloorHeightScale: 2.05,
};

const genericRoyalBanner: ItemSpriteData = {
  src: '/assets/items/generic-royal-banner.png',
  alt: 'דגל מלכותי',
  className:
    'object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.32)] drop-shadow-[0_0_18px_rgba(180,120,255,0.38)]',

  // ברירת מחדל — קיר / special
  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 2.15,
  roomHeightScale: 2.15,
};

const genericRoundRug: ItemSpriteData = {
  src: '/assets/items/generic-round-rug.png',
  alt: 'שטיח עגול צבעוני',
  className:
    'object-fill translate-y-[2px] drop-shadow-[0_10px_10px_rgba(0,0,0,0.25)]',

  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 1,
  roomHeightScale: 1,
};

const genericPencilCup: ItemSpriteData = {
  src: '/assets/items/generic-pencil-cup.png',
  alt: 'כוס כלי כתיבה',
  className: 'object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,0.35)]',

  roomOffsetX: 0,
  roomOffsetY: 8,
  roomWidthScale: 1.25,
  roomHeightScale: 1.25,

  roomShelfOffsetX: 0,
  roomShelfOffsetY: 15,
  roomShelfWidthScale: 1.15,
  roomShelfHeightScale: 1.15,
};

const genericSmallHourglass: ItemSpriteData = {
  src: '/assets/items/generic-small-hourglass.png',
  alt: 'שעון חול קטן',
  className:
    'object-contain drop-shadow-[0_0_8px_rgba(100,210,255,0.28)] drop-shadow-[0_8px_10px_rgba(0,0,0,0.35)]',

  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 1.2,
  roomHeightScale: 1.2,

  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const genericStorageBasket: ItemSpriteData = {
  src: '/assets/items/generic-storage-basket.png',
  alt: 'סל אחסון קלוע',
  className: 'object-contain drop-shadow-[0_10px_12px_rgba(0,0,0,0.35)]',

  roomOffsetX: 0,
  roomOffsetY: 18,
  roomWidthScale: 1.25,
  roomHeightScale: 1.25,

  roomShelfOffsetX: 0,
  roomShelfOffsetY: 23,
  roomShelfWidthScale: 1,
  roomShelfHeightScale: 1,

  roomFloorOffsetX: 0,
  roomFloorOffsetY: 34,
  roomFloorWidthScale: 1.55,
  roomFloorHeightScale: 1.55,
};

const genericFramedLandscape: ItemSpriteData = {
  src: '/assets/items/generic-framed-landscape.png',
  alt: 'תמונת נוף ממוסגרת',
  className:
    'object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]',

  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 2.45,
  roomHeightScale: 2.45,
};

const genericExplorerGlobe: ItemSpriteData = {
  src: '/assets/items/generic-explorer-globe.png',
  alt: 'גלובוס החוקר',
  className:
    'object-contain drop-shadow-[0_0_10px_rgba(70,180,255,0.22)] drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]',

  roomOffsetX: 0,
  roomOffsetY: 8,
  roomWidthScale: 1.3,
  roomHeightScale: 1.3,

  roomShelfOffsetX: 0,
  roomShelfOffsetY: 17,
  roomShelfWidthScale: 1.2,
  roomShelfHeightScale: 1.2,
};

const genericMagicMusicBox: ItemSpriteData = {
  src: '/assets/items/generic-magic-music-box.png',
  alt: 'תיבת נגינה קסומה',
  className:
    'object-contain drop-shadow-[0_0_12px_rgba(150,100,255,0.38)] drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]',

  roomOffsetX: 0,
  roomOffsetY: 10,
  roomWidthScale: 1.25,
  roomHeightScale: 1.25,

  roomShelfOffsetX: 0,
  roomShelfOffsetY: 17,
  roomShelfWidthScale: 1.15,
  roomShelfHeightScale: 1.15,
};

const genericScholarsClock: ItemSpriteData = {
  src: '/assets/items/generic-scholars-clock.png',
  alt: 'שעון המלומדים',
  className:
    'object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]',

  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 2.2,
  roomHeightScale: 2.2,
};

const genericTreasureChest: ItemSpriteData = {
  src: '/assets/items/generic-treasure-chest.png',
  alt: 'תיבת אוצר עתיקה',
  className:
    'object-contain drop-shadow-[0_0_12px_rgba(255,190,70,0.32)] drop-shadow-[0_10px_14px_rgba(0,0,0,0.38)]',

  roomOffsetX: 0,
  roomOffsetY: 16,
  roomWidthScale: 1.6,
  roomHeightScale: 1.6,

  roomFloorOffsetX: 0,
  roomFloorOffsetY: 26,
  roomFloorWidthScale: 2.1,
  roomFloorHeightScale: 2.1,
};

const genericWisdomLantern: ItemSpriteData = {
  src: '/assets/items/generic-wisdom-lantern.png',
  alt: 'פנס החוכמה',
  className:
    'object-contain drop-shadow-[0_0_18px_rgba(255,190,70,0.58)] drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]',

  roomOffsetX: 0,
  roomOffsetY: 4,
  roomWidthScale: 1.25,
  roomHeightScale: 1.25,

  roomShelfOffsetX: 0,
  roomShelfOffsetY: 22,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,

  roomFloorOffsetX: 0,
  roomFloorOffsetY: 30,
  roomFloorWidthScale: 1.75,
  roomFloorHeightScale: 1.75,
};

const genericStainedGlassWindow: ItemSpriteData = {
  src: '/assets/items/generic-stained-glass-window.png',
  alt: 'חלון ויטראז׳ קסום',
  className:
    'object-contain drop-shadow-[0_0_14px_rgba(110,150,255,0.45)] drop-shadow-[0_8px_16px_rgba(0,0,0,0.34)]',

  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 2.4,
  roomHeightScale: 2.4,
};

const genericFloatingBook: ItemSpriteData = {
  src: '/assets/items/generic-floating-book.png',
  alt: 'ספר הידע המרחף',
  className:
    'object-contain drop-shadow-[0_0_18px_rgba(160,100,255,0.75)] drop-shadow-[0_0_28px_rgba(80,160,255,0.42)]',

  roomOffsetX: 0,
  roomOffsetY: 2,
  roomWidthScale: 1.7,
  roomHeightScale: 1.7,

  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.35,
  roomShelfHeightScale: 1.35,

  roomFloorOffsetX: 0,
  roomFloorOffsetY: 24,
  roomFloorWidthScale: 2.1,
  roomFloorHeightScale: 2.1,
};

const cosmeticGlowBlue: ItemSpriteData = {
  src: '/assets/items/cosmetic-glow-blue.png',
  alt: 'הילה כחולה',
  className:
    'object-contain drop-shadow-[0_0_10px_rgba(80,180,255,0.55)] drop-shadow-[0_0_18px_rgba(60,140,255,0.30)]',

  // ברירת מחדל — שולחן / special
  roomOffsetX: 0,
  roomOffsetY: 20,
  roomWidthScale: 0.95,
  roomHeightScale: 0.95,

  // רצפה — קצת יותר גדול, אבל עדיין נדיר ולא אפי
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 28,
  roomFloorWidthScale: 1.35,
  roomFloorHeightScale: 1.35,
};

const cosmeticSparkles: ItemSpriteData = {
  src: '/assets/items/cosmetic-sparkles.png',
  alt: 'ניצוצות קסם',
  className:
    'object-contain drop-shadow-[0_0_10px_rgba(120,200,255,0.55)] drop-shadow-[0_0_18px_rgba(255,230,150,0.28)]',

  // ברירת מחדל — wall / desk / special
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 1.15,
  roomHeightScale: 1.15,

  // רצפה — קצת יותר גדול, אבל עדיין נדיר ולא אפי
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 18,
  roomFloorWidthScale: 1.35,
  roomFloorHeightScale: 1.35,
};

const cosmeticRainbow: ItemSpriteData = {
  src: '/assets/items/cosmetic-rainbow.png',
  alt: 'קשת בענן',
  className:
    'object-contain drop-shadow-[0_0_18px_rgba(255,220,120,0.55)] drop-shadow-[0_0_32px_rgba(120,180,255,0.42)]',

  // ברירת מחדל — wall / special
  // חפץ epic: גדול, בולט, אבל לא ענק כמו legendary
  roomOffsetX: 0,
  roomOffsetY: -16,
  roomWidthScale: 2.35,
  roomHeightScale: 2.35,
};

const animalsCatSleeping: ItemSpriteData = {
  src: '/assets/items/animals-cat-sleeping.png',
  alt: 'חתול ישנוני',
  className:
    'object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.28)]',

  // ברירת מחדל — רצפה
  roomOffsetX: 0,
  roomOffsetY: 30,
  roomWidthScale: 1.45,
  roomHeightScale: 1.45,

  // מדף — קטן יותר, כדי שיישב יפה ולא ייראה ענק
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 28,
  roomShelfWidthScale: 1.1,
  roomShelfHeightScale: 1.1,
};

const animalsOwlPerch: ItemSpriteData = {
  src: '/assets/items/animals-owl-perch.png',
  alt: 'ינשוף על ענף',
  className:
    'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.30)]',

  // ברירת מחדל — שולחן
  roomOffsetX: 0,
  roomOffsetY: 12,
  roomWidthScale: 1.35,
  roomHeightScale: 1.35,

  // מדף — קצת קטן יותר, כדי לשבת יפה על המדף
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 18,
  roomShelfWidthScale: 1.18,
  roomShelfHeightScale: 1.18,
};

const animalsTinyDragon: ItemSpriteData = {
  src: '/assets/items/animals-tiny-dragon.png',
  alt: 'דרקון מחמד קטן',
  className:
    'object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.32)] drop-shadow-[0_0_18px_rgba(180,120,255,0.38)]',

  // שולחן
  roomOffsetX: 0,
  roomOffsetY: 10,
  roomWidthScale: 2.05,
  roomHeightScale: 2.05,

  // רצפה — זה המקום שבו הוא באמת אמור לבלוט
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 70,
  roomFloorWidthScale: 2.55,
  roomFloorHeightScale: 2.55,
};

const animalsPhoenixEgg: ItemSpriteData = {
  src: '/assets/items/animals-phoenix-egg.png',
  alt: 'ביצת עוף חול',
  className:
    'object-contain drop-shadow-[0_0_22px_rgba(255,150,40,0.75)] drop-shadow-[0_12px_22px_rgba(0,0,0,0.35)]',

  // ברירת מחדל — special
  // חפץ legendary: גדול, זוהר ומרשים
  roomOffsetX: 0,
  roomOffsetY: 4,
  roomWidthScale: 2.65,
  roomHeightScale: 2.65,

  // מדף — עדיין גדול ומיוחד, אבל לא משתלט לגמרי
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 18,
  roomShelfWidthScale: 1.75,
  roomShelfHeightScale: 1.75,

  // רצפה — המקום שבו הוא הכי אגדי ומרשים
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 70,
  roomFloorWidthScale: 3.05,
  roomFloorHeightScale: 3.05,
};

const animalsBunnyCushion: ItemSpriteData = {
  src: '/assets/items/animals-bunny-cushion.png',
  alt: 'ארנבון על כרית',
  className: 'object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.30)]',
  roomOffsetX: 0,
  roomOffsetY: 22,
  roomWidthScale: 1.45,
  roomHeightScale: 1.45,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.15,
  roomShelfHeightScale: 1.15,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 34,
  roomFloorWidthScale: 1.8,
  roomFloorHeightScale: 1.8,
};

const animalsHamsterWheel: ItemSpriteData = {
  src: '/assets/items/animals-hamster-wheel.png',
  alt: 'אוגר בגלגל',
  className: 'object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.30)]',
  roomOffsetX: 0,
  roomOffsetY: 8,
  roomWidthScale: 1.3,
  roomHeightScale: 1.3,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.15,
  roomShelfHeightScale: 1.15,
};

const animalsTurtleFriend: ItemSpriteData = {
  src: '/assets/items/animals-turtle-friend.png',
  alt: 'צב קטן וסקרן',
  className: 'object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.30)]',
  roomOffsetX: 0,
  roomOffsetY: 10,
  roomWidthScale: 1.25,
  roomHeightScale: 1.25,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.1,
  roomShelfHeightScale: 1.1,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 34,
  roomFloorWidthScale: 1.6,
  roomFloorHeightScale: 1.6,
};

const animalsPuppyBasket: ItemSpriteData = {
  src: '/assets/items/animals-puppy-basket.png',
  alt: 'גור כלבים בסל',
  className: 'object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.30)]',
  roomOffsetX: 0,
  roomOffsetY: 20,
  roomWidthScale: 1.4,
  roomHeightScale: 1.4,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 36,
  roomFloorWidthScale: 1.8,
  roomFloorHeightScale: 1.8,
};

const animalsCapybaraFriend: ItemSpriteData = {
  src: '/assets/items/animals-capybara-friend.png',
  alt: 'קפיברה רגועה',
  className: 'object-contain drop-shadow-[0_9px_13px_rgba(0,0,0,0.30)]',
  roomOffsetX: 0,
  roomOffsetY: 18,
  roomWidthScale: 1.5,
  roomHeightScale: 1.5,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 42,
  roomFloorWidthScale: 2.05,
  roomFloorHeightScale: 2.05,
};

const animalsButterflyFrame: ItemSpriteData = {
  src: '/assets/items/animals-butterfly-frame.png',
  alt: 'תמונת פרפרים',
  className: 'object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.30)]',
  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 2.4,
  roomHeightScale: 2.4,
};

const animalsPawRug: ItemSpriteData = {
  src: '/assets/items/animals-paw-rug.png',
  alt: 'שטיח עקבות צבעוני',
  className: 'object-fill translate-y-[2px] drop-shadow-[0_10px_10px_rgba(0,0,0,0.25)]',
};

const animalsRedPanda: ItemSpriteData = {
  src: '/assets/items/animals-red-panda.png',
  alt: 'פנדה אדומה קטנה',
  className: 'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)] drop-shadow-[0_0_10px_rgba(40,210,190,0.20)]',
  roomOffsetX: 0,
  roomOffsetY: 18,
  roomWidthScale: 1.45,
  roomHeightScale: 1.45,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.18,
  roomShelfHeightScale: 1.18,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 40,
  roomFloorWidthScale: 1.95,
  roomFloorHeightScale: 1.95,
};

const animalsOtterShell: ItemSpriteData = {
  src: '/assets/items/animals-otter-shell.png',
  alt: 'לוטרה עם צדף',
  className: 'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)] drop-shadow-[0_0_10px_rgba(80,190,255,0.22)]',
  roomOffsetX: 0,
  roomOffsetY: 8,
  roomWidthScale: 1.3,
  roomHeightScale: 1.3,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.15,
  roomShelfHeightScale: 1.15,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 36,
  roomFloorWidthScale: 1.75,
  roomFloorHeightScale: 1.75,
};

const animalsAxolotlAquarium: ItemSpriteData = {
  src: '/assets/items/animals-axolotl-aquarium.png',
  alt: 'אקווריום אקסולוטל',
  className: 'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)] drop-shadow-[0_0_12px_rgba(80,220,255,0.28)]',
  roomOffsetX: 0,
  roomOffsetY: 10,
  roomWidthScale: 1.35,
  roomHeightScale: 1.35,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.1,
  roomShelfHeightScale: 1.1,
};

const animalsFrogLantern: ItemSpriteData = {
  src: '/assets/items/animals-frog-lantern.png',
  alt: 'מנורת צפרדע',
  className: 'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)] drop-shadow-[0_0_12px_rgba(80,255,150,0.28)]',
  roomOffsetX: 0,
  roomOffsetY: 8,
  roomWidthScale: 1.25,
  roomHeightScale: 1.25,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.1,
  roomShelfHeightScale: 1.1,
};

const animalsSnowLeopardCub: ItemSpriteData = {
  src: '/assets/items/animals-snow-leopard-cub.png',
  alt: 'גור נמר שלג',
  className: 'object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.34)] drop-shadow-[0_0_16px_rgba(100,210,255,0.38)]',
  roomOffsetX: 0,
  roomOffsetY: 16,
  roomWidthScale: 1.75,
  roomHeightScale: 1.75,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 48,
  roomFloorWidthScale: 2.35,
  roomFloorHeightScale: 2.35,
};

const animalsCrystalDeer: ItemSpriteData = {
  src: '/assets/items/animals-crystal-deer.png',
  alt: 'אייל הקריסטל',
  className: 'object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.34)] drop-shadow-[0_0_18px_rgba(100,220,255,0.42)]',
  roomOffsetX: 0,
  roomOffsetY: 12,
  roomWidthScale: 1.85,
  roomHeightScale: 1.85,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 52,
  roomFloorWidthScale: 2.45,
  roomFloorHeightScale: 2.45,
};

const animalsMoonWolfPortrait: ItemSpriteData = {
  src: '/assets/items/animals-moon-wolf-portrait.png',
  alt: 'תמונת זאב הירח',
  className: 'object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.38)] drop-shadow-[0_0_16px_rgba(80,150,255,0.26)]',
  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 2.4,
  roomHeightScale: 2.4,
};

const animalsCloudPegasus: ItemSpriteData = {
  src: '/assets/items/animals-cloud-pegasus.png',
  alt: 'פגסוס העננים',
  className: 'object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.36)] drop-shadow-[0_0_22px_rgba(180,130,255,0.48)]',
  roomOffsetX: 0,
  roomOffsetY: 8,
  roomWidthScale: 2,
  roomHeightScale: 2,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 58,
  roomFloorWidthScale: 2.7,
  roomFloorHeightScale: 2.7,
};

const sportsSoccerBall: ItemSpriteData = {
  src: '/assets/items/sports-soccer-ball.png',
  alt: 'כדורגל על מעמד',
  className: 'object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.30)]',
  roomOffsetX: 0,
  roomOffsetY: 10,
  roomWidthScale: 1.25,
  roomHeightScale: 1.25,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 18,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 38,
  roomFloorWidthScale: 1.65,
  roomFloorHeightScale: 1.65,
};

const sportsBasketballStand: ItemSpriteData = {
  src: '/assets/items/sports-basketball-stand.png',
  alt: 'כדורסל על מעמד',
  className: 'object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.30)]',
  roomOffsetX: 0,
  roomOffsetY: 10,
  roomWidthScale: 1.25,
  roomHeightScale: 1.25,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 18,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 38,
  roomFloorWidthScale: 1.65,
  roomFloorHeightScale: 1.65,
};

const sportsTennisRacket: ItemSpriteData = {
  src: '/assets/items/sports-tennis-racket.png',
  alt: 'מחבט וכדור טניס',
  className: 'object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.30)]',
  roomOffsetX: 0,
  roomOffsetY: 8,
  roomWidthScale: 1.25,
  roomHeightScale: 1.25,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1,
  roomShelfHeightScale: 1,
};

const sportsRhythmicRibbon: ItemSpriteData = {
  src: '/assets/items/sports-rhythmic-ribbon.png',
  alt: 'סרט התעמלות צבעוני',
  className: 'object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.28)]',
  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 1.4,
  roomHeightScale: 1.4,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 14,
  roomShelfWidthScale: 1.1,
  roomShelfHeightScale: 1.1,
};

const sportsSwimGear: ItemSpriteData = {
  src: '/assets/items/sports-swim-gear.png',
  alt: 'סל ציוד שחייה',
  className: 'object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.30)]',
  roomOffsetX: 0,
  roomOffsetY: 16,
  roomWidthScale: 1.35,
  roomHeightScale: 1.35,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 17,
  roomShelfWidthScale: 1.1,
  roomShelfHeightScale: 1.1,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 38,
  roomFloorWidthScale: 1.75,
  roomFloorHeightScale: 1.75,
};

const sportsTableTennisSet: ItemSpriteData = {
  src: '/assets/items/sports-table-tennis-set.png',
  alt: 'ערכת טניס שולחן',
  className: 'object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.30)]',
  roomOffsetX: 0,
  roomOffsetY: 12,
  roomWidthScale: 1.35,
  roomHeightScale: 1.35,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const sportsRunningShoes: ItemSpriteData = {
  src: '/assets/items/sports-running-shoes.png',
  alt: 'נעלי ריצה מהירות',
  className: 'object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.30)]',
  roomOffsetX: 0,
  roomOffsetY: 16,
  roomWidthScale: 1.35,
  roomHeightScale: 1.35,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 17,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 38,
  roomFloorWidthScale: 1.75,
  roomFloorHeightScale: 1.75,
};

const sportsCourtRug: ItemSpriteData = {
  src: '/assets/items/sports-court-rug.png',
  alt: 'שטיח מגרש ספורט',
  className: 'object-fill translate-y-[2px] drop-shadow-[0_10px_10px_rgba(0,0,0,0.25)]',
};

const sportsMiniBasketballHoop: ItemSpriteData = {
  src: '/assets/items/sports-mini-basketball-hoop.png',
  alt: 'סל קליעה לחדר',
  className: 'object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.30)]',
  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 2.1,
  roomHeightScale: 2.1,
};

const sportsJudoBeltDisplay: ItemSpriteData = {
  src: '/assets/items/sports-judo-belt-display.png',
  alt: 'תצוגת חגורות ג׳ודו',
  className: 'object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.32)]',
  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 2.65,
  roomHeightScale: 1.65,
};

const sportsBalanceBeam: ItemSpriteData = {
  src: '/assets/items/sports-balance-beam.png',
  alt: 'קורת התעמלות',
  className: 'object-contain drop-shadow-[0_12px_16px_rgba(0,0,0,0.32)]',
  roomOffsetX: 0,
  roomOffsetY: 50,
  roomWidthScale: 2.3,
  roomHeightScale: 1.4,
};

const sportsFencingDisplay: ItemSpriteData = {
  src: '/assets/items/sports-fencing-display.png',
  alt: 'תצוגת סיף מלכותית',
  className: 'object-contain drop-shadow-[0_9px_18px_rgba(0,0,0,0.34)]',
  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 2.25,
  roomHeightScale: 2.25,
};

const sportsVolleyballStand: ItemSpriteData = {
  src: '/assets/items/sports-volleyball-stand.png',
  alt: 'כדורעף על מעמד',
  className: 'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)]',
  roomOffsetX: 0,
  roomOffsetY: 12,
  roomWidthScale: 1.35,
  roomHeightScale: 1.35,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 18,
  roomShelfWidthScale: 1.08,
  roomShelfHeightScale: 1.08,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 40,
  roomFloorWidthScale: 1.8,
  roomFloorHeightScale: 1.8,
};

const sportsTennisChampionStatue: ItemSpriteData = {
  src: '/assets/items/sports-tennis-champion-statue.png',
  alt: 'פסל אלופת הטניס',
  className: 'object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.34)] drop-shadow-[0_0_14px_rgba(80,210,190,0.28)]',
  roomOffsetX: 0,
  roomOffsetY: 4,
  roomWidthScale: 1.9,
  roomHeightScale: 1.9,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 14,
  roomShelfWidthScale: 1.2,
  roomShelfHeightScale: 1.2,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 58,
  roomFloorWidthScale: 2.5,
  roomFloorHeightScale: 2.5,
};

const sportsRhythmicGymnastMusicBox: ItemSpriteData = {
  src: '/assets/items/sports-rhythmic-gymnast-music-box.png',
  alt: 'תיבת הנגינה של המתעמלת',
  className: 'object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.34)] drop-shadow-[0_0_16px_rgba(190,120,255,0.34)]',
  roomOffsetX: 0,
  roomOffsetY: 4,
  roomWidthScale: 1.7,
  roomHeightScale: 1.7,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 18,
  roomShelfWidthScale: 1.15,
  roomShelfHeightScale: 1.15,
};

const sportsJudoChampionStatue: ItemSpriteData = {
  src: '/assets/items/sports-judo-champion-statue.png',
  alt: 'פסל אלוף הג׳ודו',
  className: 'object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.34)] drop-shadow-[0_0_14px_rgba(50,160,220,0.28)]',
  roomOffsetX: 0,
  roomOffsetY: 4,
  roomWidthScale: 1.9,
  roomHeightScale: 1.9,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 14,
  roomShelfWidthScale: 1.2,
  roomShelfHeightScale: 1.2,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 58,
  roomFloorWidthScale: 2.5,
  roomFloorHeightScale: 2.5,
};

const sportsSwimmerWaveStatue: ItemSpriteData = {
  src: '/assets/items/sports-swimmer-wave-statue.png',
  alt: 'פסל שחיינית הגל',
  className: 'object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.34)] drop-shadow-[0_0_18px_rgba(50,190,255,0.40)]',
  roomOffsetX: 0,
  roomOffsetY: 4,
  roomWidthScale: 1.9,
  roomHeightScale: 1.9,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.2,
  roomShelfHeightScale: 1.2,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 58,
  roomFloorWidthScale: 2.5,
  roomFloorHeightScale: 2.5,
};

const sportsHologramStadium: ItemSpriteData = {
  src: '/assets/items/sports-hologram-stadium.png',
  alt: 'אצטדיון הולוגרפי',
  className: 'object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.34)] drop-shadow-[0_0_22px_rgba(70,190,255,0.55)]',
  roomOffsetX: 0,
  roomOffsetY: 2,
  roomWidthScale: 2,
  roomHeightScale: 2,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 60,
  roomFloorWidthScale: 2.65,
  roomFloorHeightScale: 2.65,
};

const sportsVictoryTorch: ItemSpriteData = {
  src: '/assets/items/sports-victory-torch.png',
  alt: 'לפיד הניצחון הקסום',
  className: 'object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.36)] drop-shadow-[0_0_22px_rgba(255,150,60,0.55)]',
  roomOffsetX: 0,
  roomOffsetY: 4,
  roomWidthScale: 2.2,
  roomHeightScale: 2.2,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 17,
  roomShelfWidthScale: 1.25,
  roomShelfHeightScale: 1.25,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 65,
  roomFloorWidthScale: 2.8,
  roomFloorHeightScale: 2.8,
};

const sportsKingdomChampionsCup: ItemSpriteData = {
  src: '/assets/items/sports-kingdom-champions-cup.png',
  alt: 'גביע אלופי הממלכה',
  className: 'object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.38)] drop-shadow-[0_0_28px_rgba(255,190,60,0.72)]',
  roomOffsetX: 0,
  roomOffsetY: 4,
  roomWidthScale: 2.6,
  roomHeightScale: 2.6,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 17,
  roomShelfWidthScale: 1.4,
  roomShelfHeightScale: 1.4,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 72,
  roomFloorWidthScale: 3.1,
  roomFloorHeightScale: 3.1,
};

const fantasyPotionSet: ItemSpriteData = {
  src: '/assets/items/fantasy-potion-set.png',
  alt: 'סט שיקויים קסומים',
  className: 'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)] drop-shadow-[0_0_12px_rgba(180,100,255,0.36)]',
  roomOffsetX: 0,
  roomOffsetY: 12,
  roomWidthScale: 1.35,
  roomHeightScale: 1.35,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 22,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const fantasyWizardHat: ItemSpriteData = {
  src: '/assets/items/fantasy-wizard-hat.png',
  alt: 'כובע קוסם',
  className: 'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)]',
  roomOffsetX: 0,
  roomOffsetY: 8,
  roomWidthScale: 1.35,
  roomHeightScale: 1.35,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const fantasySparkWand: ItemSpriteData = {
  src: '/assets/items/fantasy-spark-wand.png',
  alt: 'שרביט ניצוצות',
  className: 'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)] drop-shadow-[0_0_12px_rgba(70,210,255,0.40)]',
  roomOffsetX: 0,
  roomOffsetY: 8,
  roomWidthScale: 1.3,
  roomHeightScale: 1.3,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const fantasyFairyBottle: ItemSpriteData = {
  src: '/assets/items/fantasy-fairy-bottle.png',
  alt: 'בקבוק אור פיות',
  className: 'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)] drop-shadow-[0_0_14px_rgba(255,120,245,0.42)]',
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 1.3,
  roomHeightScale: 1.3,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const fantasyMushroomStool: ItemSpriteData = {
  src: '/assets/items/fantasy-mushroom-stool.png',
  alt: 'שרפרף פטרייה',
  className: 'object-contain drop-shadow-[0_12px_18px_rgba(0,0,0,0.36)]',
  roomOffsetX: 0,
  roomOffsetY: 50,
  roomWidthScale: 1.8,
  roomHeightScale: 1.8,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 50,
  roomFloorWidthScale: 1.8,
  roomFloorHeightScale: 1.8,
};

const fantasyEnchantedKey: ItemSpriteData = {
  src: '/assets/items/fantasy-enchanted-key.png',
  alt: 'מפתח מכושף',
  className: 'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)] drop-shadow-[0_0_12px_rgba(60,210,230,0.34)]',
  roomOffsetX: 0,
  roomOffsetY: 8,
  roomWidthScale: 1.35,
  roomHeightScale: 1.35,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const fantasyCastleRug: ItemSpriteData = {
  src: '/assets/items/fantasy-castle-rug.png',
  alt: 'שטיח טירת העננים',
  className: 'object-fill translate-y-[2px] drop-shadow-[0_10px_10px_rgba(0,0,0,0.25)]',
};

const fantasySecretDoor: ItemSpriteData = {
  src: '/assets/items/fantasy-secret-door.png',
  alt: 'דלת סודית',
  className: 'object-contain scale-[2.4] drop-shadow-[0_10px_18px_rgba(0,0,0,0.34)] drop-shadow-[0_0_14px_rgba(170,90,255,0.38)]',
  roomOffsetY: 12,
};

const fantasySpellbookLectern: ItemSpriteData = {
  src: '/assets/items/fantasy-spellbook-lectern.png',
  alt: 'ספר לחשים על מעמד',
  className: 'object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.36)] drop-shadow-[0_0_16px_rgba(100,200,255,0.38)]',
  roomOffsetX: 0,
  roomOffsetY: 50,
  roomWidthScale: 2.1,
  roomHeightScale: 2.1,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 50,
  roomFloorWidthScale: 2.1,
  roomFloorHeightScale: 2.1,
};

const fantasyFairyTree: ItemSpriteData = {
  src: '/assets/items/fantasy-fairy-tree.png',
  alt: 'עץ פיות מיניאטורי',
  className: 'object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.34)] drop-shadow-[0_0_16px_rgba(230,100,255,0.40)]',
  roomOffsetX: 0,
  roomOffsetY: 8,
  roomWidthScale: 1.55,
  roomHeightScale: 1.55,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 48,
  roomFloorWidthScale: 2.1,
  roomFloorHeightScale: 2.1,
};

const fantasyUnicornMusicBox: ItemSpriteData = {
  src: '/assets/items/fantasy-unicorn-music-box.png',
  alt: 'תיבת נגינה חד־קרן',
  className: 'object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.34)] drop-shadow-[0_0_14px_rgba(255,150,225,0.38)]',
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 1.5,
  roomHeightScale: 1.5,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const fantasyCrystalCauldron: ItemSpriteData = {
  src: '/assets/items/fantasy-crystal-cauldron.png',
  alt: 'קלחת קריסטל',
  className: 'object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.34)] drop-shadow-[0_0_18px_rgba(80,210,255,0.45)]',
  roomOffsetX: 0,
  roomOffsetY: 10,
  roomWidthScale: 1.7,
  roomHeightScale: 1.7,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 18,
  roomShelfWidthScale: 1.1,
  roomShelfHeightScale: 1.1,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 52,
  roomFloorWidthScale: 2.25,
  roomFloorHeightScale: 2.25,
};

const fantasyKnightShield: ItemSpriteData = {
  src: '/assets/items/fantasy-knight-shield.png',
  alt: 'מגן אביר מכושף',
  className: 'object-contain scale-[2.3] drop-shadow-[0_10px_18px_rgba(0,0,0,0.36)] drop-shadow-[0_0_14px_rgba(80,180,255,0.32)]',
};

const fantasyFairyQueenStatue: ItemSpriteData = {
  src: '/assets/items/fantasy-fairy-queen-statue.png',
  alt: 'פסל מלכת הפיות',
  className: 'object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.36)] drop-shadow-[0_0_20px_rgba(235,120,255,0.45)]',
  roomOffsetX: 0,
  roomOffsetY: 4,
  roomWidthScale: 1.9,
  roomHeightScale: 1.9,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.15,
  roomShelfHeightScale: 1.15,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 58,
  roomFloorWidthScale: 2.5,
  roomFloorHeightScale: 2.5,
};

const fantasyMermaidFountain: ItemSpriteData = {
  src: '/assets/items/fantasy-mermaid-fountain.png',
  alt: 'מזרקת בת הים',
  className: 'object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.36)] drop-shadow-[0_0_20px_rgba(70,210,255,0.44)]',
  roomOffsetX: 0,
  roomOffsetY: 58,
  roomWidthScale: 2.4,
  roomHeightScale: 2.4,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 58,
  roomFloorWidthScale: 2.4,
  roomFloorHeightScale: 2.4,
};

const fantasyGriffinGuardian: ItemSpriteData = {
  src: '/assets/items/fantasy-griffin-guardian.png',
  alt: 'גריפון שומר',
  className: 'object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.36)] drop-shadow-[0_0_16px_rgba(255,195,80,0.34)]',
  roomOffsetX: 0,
  roomOffsetY: 8,
  roomWidthScale: 1.9,
  roomHeightScale: 1.9,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.15,
  roomShelfHeightScale: 1.15,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 58,
  roomFloorWidthScale: 2.5,
  roomFloorHeightScale: 2.5,
};

const fantasyMoonFairyGarden: ItemSpriteData = {
  src: '/assets/items/fantasy-moon-fairy-garden.png',
  alt: 'גן פיות ירחי',
  className: 'object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.36)] drop-shadow-[0_0_20px_rgba(185,110,255,0.46)]',
  roomOffsetX: 0,
  roomOffsetY: 10,
  roomWidthScale: 1.75,
  roomHeightScale: 1.75,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 18,
  roomShelfWidthScale: 1.1,
  roomShelfHeightScale: 1.1,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 52,
  roomFloorWidthScale: 2.3,
  roomFloorHeightScale: 2.3,
};

const fantasyDragonThrone: ItemSpriteData = {
  src: '/assets/items/fantasy-dragon-throne.png',
  alt: 'כס הדרקון',
  className: 'object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.38)] drop-shadow-[0_0_22px_rgba(160,90,255,0.50)]',
  roomOffsetX: 0,
  roomOffsetY: 60,
  roomWidthScale: 2.8,
  roomHeightScale: 2.8,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 60,
  roomFloorWidthScale: 2.8,
  roomFloorHeightScale: 2.8,
};

const fantasyPortalMirror: ItemSpriteData = {
  src: '/assets/items/fantasy-portal-mirror.png',
  alt: 'מראת מעבר קסומה',
  className: 'object-contain scale-[2.6] drop-shadow-[0_14px_24px_rgba(0,0,0,0.38)] drop-shadow-[0_0_22px_rgba(110,120,255,0.48)]',
};

const fantasyDreamCastle: ItemSpriteData = {
  src: '/assets/items/fantasy-dream-castle.png',
  alt: 'טירת החלומות המרחפת',
  className: 'object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.40)] drop-shadow-[0_0_30px_rgba(255,145,235,0.62)]',
  roomOffsetX: 0,
  roomOffsetY: 8,
  roomWidthScale: 2.65,
  roomHeightScale: 2.65,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 17,
  roomFloorWidthScale: 3.1,
  roomFloorHeightScale: 3.1,
};

const musicColorfulMaracas: ItemSpriteData = {
  src: '/assets/items/music-colorful-maracas.png',
  alt: 'זוג מאראקס צבעוניים',
  className: 'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)]',
  roomOffsetX: 0,
  roomOffsetY: 10,
  roomWidthScale: 1.35,
  roomHeightScale: 1.35,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const musicRoyalTambourine: ItemSpriteData = {
  src: '/assets/items/music-royal-tambourine.png',
  alt: 'תוף מרים מלכותי',
  className: 'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)]',
  roomOffsetX: 0,
  roomOffsetY: 8,
  roomWidthScale: 1.35,
  roomHeightScale: 1.35,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const musicRainbowXylophone: ItemSpriteData = {
  src: '/assets/items/music-rainbow-xylophone.png',
  alt: 'קסילופון קשת',
  className: 'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)]',
  roomOffsetX: 0,
  roomOffsetY: 18,
  roomWidthScale: 1.4,
  roomHeightScale: 1.4,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 22,
  roomShelfWidthScale: 1.1,
  roomShelfHeightScale: 1.1,
};

const musicMagicMetronome: ItemSpriteData = {
  src: '/assets/items/music-magic-metronome.png',
  alt: 'מטרונום קסום',
  className: 'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)] drop-shadow-[0_0_12px_rgba(100,200,255,0.34)]',
  roomOffsetX: 0,
  roomOffsetY: 8,
  roomWidthScale: 1.35,
  roomHeightScale: 1.35,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const musicViolinCase: ItemSpriteData = {
  src: '/assets/items/music-violin-case.png',
  alt: 'נרתיק כינור פתוח',
  className: 'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.34)]',
  roomOffsetX: 0,
  roomOffsetY: 18,
  roomWidthScale: 1.4,
  roomHeightScale: 1.4,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 22,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const musicNoteRug: ItemSpriteData = {
  src: '/assets/items/music-note-rug.png',
  alt: 'שטיח מנגינה',
  className: 'object-fill translate-y-[2px] drop-shadow-[0_10px_10px_rgba(0,0,0,0.25)]',
};

const musicGlowingGuitar: ItemSpriteData = {
  src: '/assets/items/music-glowing-guitar.png',
  alt: 'גיטרה זוהרת',
  className: 'object-contain scale-[2.4] drop-shadow-[0_10px_18px_rgba(0,0,0,0.34)] drop-shadow-[0_0_16px_rgba(255,70,190,0.40)]',
};

const musicSilverFlute: ItemSpriteData = {
  src: '/assets/items/music-silver-flute.png',
  alt: 'חליל צד כסוף',
  className: 'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)]',
  roomOffsetX: 0,
  roomOffsetY: 18,
  roomWidthScale: 1.4,
  roomHeightScale: 1.4,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 22,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const musicViolinStand: ItemSpriteData = {
  src: '/assets/items/music-violin-stand.png',
  alt: 'כינור מלכותי על מעמד',
  className: 'object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.34)] drop-shadow-[0_0_14px_rgba(255,170,70,0.30)]',
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 1.65,
  roomHeightScale: 1.65,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 52,
  roomFloorWidthScale: 2.25,
  roomFloorHeightScale: 2.25,
};

const musicGoldenSaxophone: ItemSpriteData = {
  src: '/assets/items/music-golden-saxophone.png',
  alt: 'סקסופון מוזהב',
  className: 'object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.34)] drop-shadow-[0_0_14px_rgba(255,190,70,0.34)]',
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 1.65,
  roomHeightScale: 1.65,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 52,
  roomFloorWidthScale: 2.25,
  roomFloorHeightScale: 2.25,
};

const musicDrumKit: ItemSpriteData = {
  src: '/assets/items/music-drum-kit.png',
  alt: 'מערכת תופים צבעונית',
  className: 'object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.36)]',
  roomOffsetX: 0,
  roomOffsetY: 58,
  roomWidthScale: 2.4,
  roomHeightScale: 2.4,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 58,
  roomFloorWidthScale: 2.4,
  roomFloorHeightScale: 2.4,
};

const musicStageMicrophone: ItemSpriteData = {
  src: '/assets/items/music-stage-microphone.png',
  alt: 'מיקרופון במה',
  className: 'object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.36)] drop-shadow-[0_0_16px_rgba(255,80,220,0.38)]',
  roomOffsetX: 0,
  roomOffsetY: 55,
  roomWidthScale: 2.1,
  roomHeightScale: 2.1,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 55,
  roomFloorWidthScale: 2.1,
  roomFloorHeightScale: 2.1,
};

const musicGlowingNotesFrame: ItemSpriteData = {
  src: '/assets/items/music-glowing-notes-frame.png',
  alt: 'תמונת תווים זוהרים',
  className: 'object-contain scale-[2.4] drop-shadow-[0_10px_18px_rgba(0,0,0,0.34)] drop-shadow-[0_0_18px_rgba(120,140,255,0.42)]',
};

const musicCrystalHarp: ItemSpriteData = {
  src: '/assets/items/music-crystal-harp.png',
  alt: 'נבל קריסטל',
  className: 'object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.36)] drop-shadow-[0_0_20px_rgba(80,210,255,0.45)]',
  roomOffsetX: 0,
  roomOffsetY: 58,
  roomWidthScale: 2.5,
  roomHeightScale: 2.5,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 58,
  roomFloorWidthScale: 2.5,
  roomFloorHeightScale: 2.5,
};

const musicGrandPiano: ItemSpriteData = {
  src: '/assets/items/music-grand-piano.png',
  alt: 'פסנתר כנף מלכותי',
  className: 'object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.38)] drop-shadow-[0_0_20px_rgba(140,90,255,0.42)]',
  roomOffsetX: 0,
  roomOffsetY: 60,
  roomWidthScale: 2.7,
  roomHeightScale: 2.7,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 60,
  roomFloorWidthScale: 2.7,
  roomFloorHeightScale: 2.7,
};

const musicYoungViolinistStatue: ItemSpriteData = {
  src: '/assets/items/music-young-violinist-statue.png',
  alt: 'פסל הכנרת הצעירה',
  className: 'object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.36)] drop-shadow-[0_0_18px_rgba(255,130,210,0.42)]',
  roomOffsetX: 0,
  roomOffsetY: 4,
  roomWidthScale: 1.9,
  roomHeightScale: 1.9,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.15,
  roomShelfHeightScale: 1.15,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 58,
  roomFloorWidthScale: 2.5,
  roomFloorHeightScale: 2.5,
};

const musicEnchantedGramophone: ItemSpriteData = {
  src: '/assets/items/music-enchanted-gramophone.png',
  alt: 'גרמופון מכושף',
  className: 'object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.36)] drop-shadow-[0_0_18px_rgba(255,170,70,0.40)]',
  roomOffsetX: 0,
  roomOffsetY: 8,
  roomWidthScale: 1.75,
  roomHeightScale: 1.75,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 18,
  roomShelfWidthScale: 1.1,
  roomShelfHeightScale: 1.1,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 52,
  roomFloorWidthScale: 2.3,
  roomFloorHeightScale: 2.3,
};

const musicMagicalOrchestra: ItemSpriteData = {
  src: '/assets/items/music-magical-orchestra.png',
  alt: 'תזמורת הכלים הקסומה',
  className: 'object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.38)] drop-shadow-[0_0_24px_rgba(255,100,220,0.52)]',
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 2.2,
  roomHeightScale: 2.2,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 62,
  roomFloorWidthScale: 2.8,
  roomFloorHeightScale: 2.8,
};

const musicRainbowPipeOrgan: ItemSpriteData = {
  src: '/assets/items/music-rainbow-pipe-organ.png',
  alt: 'עוגב הקשת המלכותי',
  className: 'object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.38)] drop-shadow-[0_0_26px_rgba(100,180,255,0.52)]',
  roomOffsetX: 0,
  roomOffsetY: 62,
  roomWidthScale: 2.9,
  roomHeightScale: 2.9,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 62,
  roomFloorWidthScale: 2.9,
  roomFloorHeightScale: 2.9,
};

const musicFloatingConcertStage: ItemSpriteData = {
  src: '/assets/items/music-floating-concert-stage.png',
  alt: 'במת הקונצרט המרחפת',
  className: 'object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.40)] drop-shadow-[0_0_30px_rgba(255,100,220,0.62)]',
  roomOffsetX: 0,
  roomOffsetY: 8,
  roomWidthScale: 2.65,
  roomHeightScale: 2.65,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 23,
  roomFloorWidthScale: 3.1,
  roomFloorHeightScale: 3.1,
};

const roboticsTinyHelperBot: ItemSpriteData = {
  src: '/assets/items/robotics-tiny-helper-bot.png',
  alt: 'רובוט עוזר קטן',
  className: 'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)] drop-shadow-[0_0_10px_rgba(50,210,255,0.26)]',
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 1.45,
  roomHeightScale: 1.45,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const roboticsColorfulGears: ItemSpriteData = {
  src: '/assets/items/robotics-colorful-gears.png',
  alt: 'גלגלי שיניים צבעוניים',
  className: 'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)]',
  roomOffsetX: 0,
  roomOffsetY: 8,
  roomWidthScale: 1.4,
  roomHeightScale: 1.4,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const roboticsRemoteController: ItemSpriteData = {
  src: '/assets/items/robotics-remote-controller.png',
  alt: 'שלט רובוטים',
  className: 'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)] drop-shadow-[0_0_10px_rgba(255,135,35,0.22)]',
  roomOffsetX: 0,
  roomOffsetY: 10,
  roomWidthScale: 1.35,
  roomHeightScale: 1.35,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 18,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const roboticsSensorKit: ItemSpriteData = {
  src: '/assets/items/robotics-sensor-kit.png',
  alt: 'ערכת חיישנים',
  className: 'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)]',
  roomOffsetX: 0,
  roomOffsetY: 16,
  roomWidthScale: 1.4,
  roomHeightScale: 1.4,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 22,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const roboticsCircuitRug: ItemSpriteData = {
  src: '/assets/items/robotics-circuit-rug.png',
  alt: 'שטיח מעגלים',
  className: 'object-fill translate-y-[2px] drop-shadow-[0_10px_10px_rgba(0,0,0,0.25)] drop-shadow-[0_0_14px_rgba(50,210,255,0.24)]',
};

const roboticsBlueprintFrame: ItemSpriteData = {
  src: '/assets/items/robotics-blueprint-frame.png',
  alt: 'תרשים רובוט זוהר',
  className: 'object-contain scale-[2.4] drop-shadow-[0_10px_18px_rgba(0,0,0,0.34)] drop-shadow-[0_0_18px_rgba(50,210,255,0.42)]',
};

const roboticsMiniDrone: ItemSpriteData = {
  src: '/assets/items/robotics-mini-drone.png',
  alt: 'רחפן מיני',
  className: 'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)] drop-shadow-[0_0_12px_rgba(100,90,255,0.30)]',
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 1.5,
  roomHeightScale: 1.5,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const roboticsToolbox: ItemSpriteData = {
  src: '/assets/items/robotics-toolbox.png',
  alt: 'ארגז כלים חכם',
  className: 'object-contain drop-shadow-[0_9px_15px_rgba(0,0,0,0.34)]',
  roomOffsetX: 0,
  roomOffsetY: 16,
  roomWidthScale: 1.5,
  roomHeightScale: 1.5,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 22,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 48,
  roomFloorWidthScale: 2.1,
  roomFloorHeightScale: 2.1,
};

const roboticsRoboticArm: ItemSpriteData = {
  src: '/assets/items/robotics-robotic-arm.png',
  alt: 'זרוע רובוטית',
  className: 'object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.36)] drop-shadow-[0_0_14px_rgba(50,210,255,0.28)]',
  roomOffsetX: 0,
  roomOffsetY: 55,
  roomWidthScale: 2.2,
  roomHeightScale: 2.2,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 55,
  roomFloorWidthScale: 2.2,
  roomFloorHeightScale: 2.2,
};

const robotics3dPrinter: ItemSpriteData = {
  src: '/assets/items/robotics-3d-printer.png',
  alt: 'מדפסת תלת־ממד',
  className: 'object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.36)] drop-shadow-[0_0_14px_rgba(255,135,35,0.26)]',
  roomOffsetX: 0,
  roomOffsetY: 58,
  roomWidthScale: 2.3,
  roomHeightScale: 2.3,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 58,
  roomFloorWidthScale: 2.3,
  roomFloorHeightScale: 2.3,
};

const roboticsWheeledRover: ItemSpriteData = {
  src: '/assets/items/robotics-wheeled-rover.png',
  alt: 'רכב רובוטי',
  className: 'object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.36)] drop-shadow-[0_0_14px_rgba(50,210,255,0.28)]',
  roomOffsetX: 0,
  roomOffsetY: 8,
  roomWidthScale: 1.9,
  roomHeightScale: 1.9,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 54,
  roomFloorWidthScale: 2.4,
  roomFloorHeightScale: 2.4,
};

const roboticsHologramWorkbench: ItemSpriteData = {
  src: '/assets/items/robotics-hologram-workbench.png',
  alt: 'שולחן תכנון הולוגרפי',
  className: 'object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.36)] drop-shadow-[0_0_18px_rgba(50,210,255,0.36)]',
  roomOffsetX: 0,
  roomOffsetY: 58,
  roomWidthScale: 2.5,
  roomHeightScale: 2.5,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 58,
  roomFloorWidthScale: 2.5,
  roomFloorHeightScale: 2.5,
};

const roboticsCodingConsole: ItemSpriteData = {
  src: '/assets/items/robotics-coding-console.png',
  alt: 'מסוף תכנות עתידני',
  className: 'object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.36)] drop-shadow-[0_0_16px_rgba(100,90,255,0.32)]',
  roomOffsetX: 0,
  roomOffsetY: 55,
  roomWidthScale: 2.2,
  roomHeightScale: 2.2,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 55,
  roomFloorWidthScale: 2.2,
  roomFloorHeightScale: 2.2,
};

const roboticsCompetitionRobot: ItemSpriteData = {
  src: '/assets/items/robotics-competition-robot.png',
  alt: 'רובוט המשימות האלוף',
  className: 'object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.36)] drop-shadow-[0_0_18px_rgba(255,135,35,0.34)]',
  roomOffsetX: 0,
  roomOffsetY: 8,
  roomWidthScale: 2.1,
  roomHeightScale: 2.1,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 58,
  roomFloorWidthScale: 2.6,
  roomFloorHeightScale: 2.6,
};

const roboticsFriendlyAndroid: ItemSpriteData = {
  src: '/assets/items/robotics-friendly-android.png',
  alt: 'אנדרואיד ידידותי',
  className: 'object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.36)] drop-shadow-[0_0_18px_rgba(50,210,255,0.34)]',
  roomOffsetX: 0,
  roomOffsetY: 4,
  roomWidthScale: 1.9,
  roomHeightScale: 1.9,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.15,
  roomShelfHeightScale: 1.15,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 58,
  roomFloorWidthScale: 2.5,
  roomFloorHeightScale: 2.5,
};

const roboticsDroneHangar: ItemSpriteData = {
  src: '/assets/items/robotics-drone-hangar.png',
  alt: 'תחנת רחפנים',
  className: 'object-contain drop-shadow-[0_14px_22px_rgba(0,0,0,0.38)] drop-shadow-[0_0_20px_rgba(50,210,255,0.38)]',
  roomOffsetX: 0,
  roomOffsetY: 60,
  roomWidthScale: 2.7,
  roomHeightScale: 2.7,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 60,
  roomFloorWidthScale: 2.7,
  roomFloorHeightScale: 2.7,
};

const roboticsAiCrystalCore: ItemSpriteData = {
  src: '/assets/items/robotics-ai-crystal-core.png',
  alt: 'ליבת הבינה הקריסטלית',
  className: 'object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.36)] drop-shadow-[0_0_22px_rgba(90,120,255,0.50)]',
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 1.85,
  roomHeightScale: 1.85,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 18,
  roomShelfWidthScale: 1.1,
  roomShelfHeightScale: 1.1,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 52,
  roomFloorWidthScale: 2.3,
  roomFloorHeightScale: 2.3,
};

const roboticsTransformingMech: ItemSpriteData = {
  src: '/assets/items/robotics-transforming-mech.png',
  alt: 'רובוט משנה צורה',
  className: 'object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.40)] drop-shadow-[0_0_24px_rgba(50,210,255,0.48)]',
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 2.4,
  roomHeightScale: 2.4,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 64,
  roomFloorWidthScale: 2.9,
  roomFloorHeightScale: 2.9,
};

const roboticsHolographicLab: ItemSpriteData = {
  src: '/assets/items/robotics-holographic-lab.png',
  alt: 'מעבדת הרובוטיקה ההולוגרפית',
  className: 'object-contain drop-shadow-[0_15px_26px_rgba(0,0,0,0.40)] drop-shadow-[0_0_26px_rgba(50,210,255,0.52)]',
  roomOffsetX: 0,
  roomOffsetY: 62,
  roomWidthScale: 2.9,
  roomHeightScale: 2.9,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 62,
  roomFloorWidthScale: 2.9,
  roomFloorHeightScale: 2.9,
};

const roboticsKingdomGuardian: ItemSpriteData = {
  src: '/assets/items/robotics-kingdom-guardian.png',
  alt: 'שומר הממלכה הרובוטי',
  className: 'object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.42)] drop-shadow-[0_0_30px_rgba(255,195,55,0.58)] drop-shadow-[0_0_40px_rgba(50,210,255,0.30)]',
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 2.65,
  roomHeightScale: 2.65,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 70,
  roomFloorWidthScale: 3.1,
  roomFloorHeightScale: 3.1,
};

const artColorfulPaintJars: ItemSpriteData = {
  src: '/assets/items/art-colorful-paint-jars.png',
  alt: 'צנצנות צבע קסומות',
  className: 'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)] drop-shadow-[0_0_10px_rgba(255,90,190,0.24)]',
  roomOffsetX: 0,
  roomOffsetY: 16,
  roomWidthScale: 1.45,
  roomHeightScale: 1.45,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 22,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const artBrushCup: ItemSpriteData = {
  src: '/assets/items/art-brush-cup.png',
  alt: 'כוס מכחולים צבעונית',
  className: 'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)] drop-shadow-[0_0_10px_rgba(255,185,55,0.24)]',
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 1.45,
  roomHeightScale: 1.45,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const artWatercolorPalette: ItemSpriteData = {
  src: '/assets/items/art-watercolor-palette.png',
  alt: 'פלטת צבעי מים',
  className: 'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)]',
  roomOffsetX: 0,
  roomOffsetY: 18,
  roomWidthScale: 1.4,
  roomHeightScale: 1.4,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 22,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const artSketchbookSet: ItemSpriteData = {
  src: '/assets/items/art-sketchbook-set.png',
  alt: 'מחברת הרעיונות',
  className: 'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)]',
  roomOffsetX: 0,
  roomOffsetY: 16,
  roomWidthScale: 1.45,
  roomHeightScale: 1.45,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 22,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const artOrigamiCranes: ItemSpriteData = {
  src: '/assets/items/art-origami-cranes.png',
  alt: 'להקת עגורי אוריגמי',
  className: 'object-contain drop-shadow-[0_9px_16px_rgba(0,0,0,0.34)] drop-shadow-[0_0_12px_rgba(255,165,70,0.28)]',
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 1.6,
  roomHeightScale: 1.6,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const artClayModelingSet: ItemSpriteData = {
  src: '/assets/items/art-clay-modeling-set.png',
  alt: 'ערכת פיסול בחימר',
  className: 'object-contain drop-shadow-[0_9px_15px_rgba(0,0,0,0.33)]',
  roomOffsetX: 0,
  roomOffsetY: 16,
  roomWidthScale: 1.5,
  roomHeightScale: 1.5,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 22,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const artArtistApron: ItemSpriteData = {
  src: '/assets/items/art-artist-apron.png',
  alt: 'סינר האומן',
  className: 'object-contain scale-[2.3] drop-shadow-[0_10px_18px_rgba(0,0,0,0.34)]',
};

const artPaintSplashRug: ItemSpriteData = {
  src: '/assets/items/art-paint-splash-rug.png',
  alt: 'שטיח כתם צבע',
  className: 'object-fill translate-y-[2px] drop-shadow-[0_10px_10px_rgba(0,0,0,0.25)]',
};

const artWoodenEasel: ItemSpriteData = {
  src: '/assets/items/art-wooden-easel.png',
  alt: 'כן ציור נופי',
  className: 'object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.36)] drop-shadow-[0_0_14px_rgba(255,185,55,0.24)]',
  roomOffsetX: 0,
  roomOffsetY: 58,
  roomWidthScale: 2.4,
  roomHeightScale: 2.4,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 58,
  roomFloorWidthScale: 2.4,
  roomFloorHeightScale: 2.4,
};

const artPotteryWheel: ItemSpriteData = {
  src: '/assets/items/art-pottery-wheel.png',
  alt: 'אובני הקדרים',
  className: 'object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.36)] drop-shadow-[0_0_15px_rgba(60,215,255,0.28)]',
  roomOffsetX: 0,
  roomOffsetY: 58,
  roomWidthScale: 2.5,
  roomHeightScale: 2.5,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 58,
  roomFloorWidthScale: 2.5,
  roomFloorHeightScale: 2.5,
};

const artStainedGlassButterfly: ItemSpriteData = {
  src: '/assets/items/art-stained-glass-butterfly.png',
  alt: 'ויטראז׳ הפרפר',
  className: 'object-contain scale-[2.5] drop-shadow-[0_10px_18px_rgba(0,0,0,0.34)] drop-shadow-[0_0_20px_rgba(80,190,255,0.42)]',
};

const artDrawingTablet: ItemSpriteData = {
  src: '/assets/items/art-drawing-tablet.png',
  alt: 'לוח ציור דיגיטלי',
  className: 'object-contain drop-shadow-[0_9px_16px_rgba(0,0,0,0.34)] drop-shadow-[0_0_12px_rgba(60,190,255,0.28)]',
  roomOffsetX: 0,
  roomOffsetY: 16,
  roomWidthScale: 1.5,
  roomHeightScale: 1.5,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 22,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const artCraftWorkbench: ItemSpriteData = {
  src: '/assets/items/art-craft-workbench.png',
  alt: 'שולחן מלאכת היד',
  className: 'object-contain drop-shadow-[0_14px_22px_rgba(0,0,0,0.38)]',
  roomOffsetX: 0,
  roomOffsetY: 62,
  roomWidthScale: 2.8,
  roomHeightScale: 2.8,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 62,
  roomFloorWidthScale: 2.8,
  roomFloorHeightScale: 2.8,
};

const artSelfPaintingCanvas: ItemSpriteData = {
  src: '/assets/items/art-self-painting-canvas.png',
  alt: 'הציור שמצייר את עצמו',
  className: 'object-contain drop-shadow-[0_14px_22px_rgba(0,0,0,0.38)] drop-shadow-[0_0_20px_rgba(255,90,210,0.42)]',
  roomOffsetX: 0,
  roomOffsetY: 60,
  roomWidthScale: 2.7,
  roomHeightScale: 2.7,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 60,
  roomFloorWidthScale: 2.7,
  roomFloorHeightScale: 2.7,
};

const artCrystalSculpture: ItemSpriteData = {
  src: '/assets/items/art-crystal-sculpture.png',
  alt: 'פסל הקריסטל המופשט',
  className: 'object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.36)] drop-shadow-[0_0_22px_rgba(100,150,255,0.48)]',
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 1.9,
  roomHeightScale: 1.9,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.1,
  roomShelfHeightScale: 1.1,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 58,
  roomFloorWidthScale: 2.4,
  roomFloorHeightScale: 2.4,
};

const artKineticColorMobile: ItemSpriteData = {
  src: '/assets/items/art-kinetic-color-mobile.png',
  alt: 'מובייל הצבעים הקינטי',
  className: 'object-contain scale-[2.5] drop-shadow-[0_12px_20px_rgba(0,0,0,0.36)] drop-shadow-[0_0_22px_rgba(255,170,70,0.40)]',
  roomOffsetX: 0,
  roomOffsetY: -4,
};

const artEnchantedCeramicFountain: ItemSpriteData = {
  src: '/assets/items/art-enchanted-ceramic-fountain.png',
  alt: 'מזרקת הקרמיקה המכושפת',
  className: 'object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.38)] drop-shadow-[0_0_22px_rgba(60,210,255,0.42)]',
  roomOffsetX: 0,
  roomOffsetY: 60,
  roomWidthScale: 2.7,
  roomHeightScale: 2.7,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 60,
  roomFloorWidthScale: 2.7,
  roomFloorHeightScale: 2.7,
};

const artOrigamiDragon: ItemSpriteData = {
  src: '/assets/items/art-origami-dragon.png',
  alt: 'דרקון האוריגמי הקסום',
  className: 'object-contain drop-shadow-[0_15px_26px_rgba(0,0,0,0.40)] drop-shadow-[0_0_26px_rgba(255,145,70,0.50)]',
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 2.3,
  roomHeightScale: 2.3,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 64,
  roomFloorWidthScale: 2.9,
  roomFloorHeightScale: 2.9,
};

const artLivingGallery: ItemSpriteData = {
  src: '/assets/items/art-living-gallery.png',
  alt: 'גלריית הציורים החיים',
  className: 'object-contain drop-shadow-[0_15px_26px_rgba(0,0,0,0.40)] drop-shadow-[0_0_26px_rgba(255,95,205,0.50)]',
  roomOffsetX: 0,
  roomOffsetY: 62,
  roomWidthScale: 2.9,
  roomHeightScale: 2.9,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 62,
  roomFloorWidthScale: 2.9,
  roomFloorHeightScale: 2.9,
};

const artInfiniteImaginationFountain: ItemSpriteData = {
  src: '/assets/items/art-infinite-imagination-fountain.png',
  alt: 'מזרקת הדמיון האינסופית',
  className: 'object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.42)] drop-shadow-[0_0_32px_rgba(255,185,60,0.58)] drop-shadow-[0_0_42px_rgba(255,80,210,0.34)]',
  roomOffsetX: 0,
  roomOffsetY: 64,
  roomWidthScale: 3,
  roomHeightScale: 3,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 64,
  roomFloorWidthScale: 3,
  roomFloorHeightScale: 3,
};

const scienceStudentMicroscope: ItemSpriteData = {
  src: '/assets/items/science-student-microscope.png',
  alt: 'מיקרוסקופ חוקרים',
  className: 'object-contain drop-shadow-[0_9px_16px_rgba(0,0,0,0.34)] drop-shadow-[0_0_12px_rgba(50,190,255,0.28)]',
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 1.5,
  roomHeightScale: 1.5,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const scienceColorfulTestTubes: ItemSpriteData = {
  src: '/assets/items/science-colorful-test-tubes.png',
  alt: 'מעמד מבחנות צבעוניות',
  className: 'object-contain drop-shadow-[0_9px_16px_rgba(0,0,0,0.34)] drop-shadow-[0_0_13px_rgba(80,220,255,0.30)]',
  roomOffsetX: 0,
  roomOffsetY: 16,
  roomWidthScale: 1.5,
  roomHeightScale: 1.5,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 22,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const scienceMagnetKit: ItemSpriteData = {
  src: '/assets/items/science-magnet-kit.png',
  alt: 'ערכת מגנטים',
  className: 'object-contain drop-shadow-[0_9px_16px_rgba(0,0,0,0.34)] drop-shadow-[0_0_12px_rgba(255,90,100,0.24)]',
  roomOffsetX: 0,
  roomOffsetY: 16,
  roomWidthScale: 1.45,
  roomHeightScale: 1.45,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 22,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const scienceCellModel: ItemSpriteData = {
  src: '/assets/items/science-cell-model.png',
  alt: 'דגם התא החי',
  className: 'object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.35)] drop-shadow-[0_0_16px_rgba(130,90,255,0.34)]',
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 1.75,
  roomHeightScale: 1.75,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.1,
  roomShelfHeightScale: 1.1,
};

const scienceAmmoniteFossil: ItemSpriteData = {
  src: '/assets/items/science-ammonite-fossil.png',
  alt: 'מאובן אמוניט',
  className: 'object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.36)] drop-shadow-[0_0_12px_rgba(255,175,70,0.22)]',
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 1.75,
  roomHeightScale: 1.75,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.1,
  roomShelfHeightScale: 1.1,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 54,
  roomFloorWidthScale: 2.3,
  roomFloorHeightScale: 2.3,
};

const scienceLabGoggles: ItemSpriteData = {
  src: '/assets/items/science-lab-goggles.png',
  alt: 'משקפי מדען',
  className: 'object-contain drop-shadow-[0_9px_16px_rgba(0,0,0,0.34)] drop-shadow-[0_0_11px_rgba(70,200,255,0.24)]',
  roomOffsetX: 0,
  roomOffsetY: 16,
  roomWidthScale: 1.4,
  roomHeightScale: 1.4,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 22,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const scienceElectricCircuit: ItemSpriteData = {
  src: '/assets/items/science-electric-circuit.png',
  alt: 'ערכת מעגל חשמלי',
  className: 'object-contain drop-shadow-[0_9px_16px_rgba(0,0,0,0.34)] drop-shadow-[0_0_13px_rgba(255,205,60,0.28)]',
  roomOffsetX: 0,
  roomOffsetY: 16,
  roomWidthScale: 1.5,
  roomHeightScale: 1.5,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 22,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const scienceAtomRug: ItemSpriteData = {
  src: '/assets/items/science-atom-rug.png',
  alt: 'שטיח האטום',
  className: 'object-fill translate-y-[2px] drop-shadow-[0_10px_12px_rgba(0,0,0,0.28)] drop-shadow-[0_0_12px_rgba(60,190,255,0.24)]',
};

const scienceGlowingDnaModel: ItemSpriteData = {
  src: '/assets/items/science-glowing-dna-model.png',
  alt: 'דגם DNA זוהר',
  className: 'object-contain drop-shadow-[0_11px_19px_rgba(0,0,0,0.36)] drop-shadow-[0_0_19px_rgba(80,220,255,0.42)]',
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 1.85,
  roomHeightScale: 1.85,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.1,
  roomShelfHeightScale: 1.1,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 54,
  roomFloorWidthScale: 2.3,
  roomFloorHeightScale: 2.3,
};

const scienceVolcanoModel: ItemSpriteData = {
  src: '/assets/items/science-volcano-model.png',
  alt: 'הר געש ניסויי',
  className: 'object-contain drop-shadow-[0_11px_19px_rgba(0,0,0,0.36)] drop-shadow-[0_0_18px_rgba(255,110,50,0.38)]',
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 1.9,
  roomHeightScale: 1.9,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 18,
  roomShelfWidthScale: 1.1,
  roomShelfHeightScale: 1.1,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 56,
  roomFloorWidthScale: 2.4,
  roomFloorHeightScale: 2.4,
};

const scienceNewtonsCradle: ItemSpriteData = {
  src: '/assets/items/science-newtons-cradle.png',
  alt: 'מטוטלת ניוטון',
  className: 'object-contain drop-shadow-[0_9px_16px_rgba(0,0,0,0.35)] drop-shadow-[0_0_12px_rgba(80,170,255,0.25)]',
  roomOffsetX: 0,
  roomOffsetY: 16,
  roomWidthScale: 1.45,
  roomHeightScale: 1.45,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 22,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const sciencePlasmaGlobe: ItemSpriteData = {
  src: '/assets/items/science-plasma-globe.png',
  alt: 'כדור פלזמה',
  className: 'object-contain drop-shadow-[0_11px_19px_rgba(0,0,0,0.36)] drop-shadow-[0_0_22px_rgba(165,80,255,0.52)]',
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 1.8,
  roomHeightScale: 1.8,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.1,
  roomShelfHeightScale: 1.1,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 54,
  roomFloorWidthScale: 2.3,
  roomFloorHeightScale: 2.3,
};

const scienceExperimentWorkbench: ItemSpriteData = {
  src: '/assets/items/science-experiment-workbench.png',
  alt: 'שולחן ניסויים',
  className: 'object-contain drop-shadow-[0_14px_22px_rgba(0,0,0,0.38)] drop-shadow-[0_0_18px_rgba(65,190,255,0.30)]',
  roomOffsetX: 0,
  roomOffsetY: 62,
  roomWidthScale: 2.8,
  roomHeightScale: 2.8,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 62,
  roomFloorWidthScale: 2.8,
  roomFloorHeightScale: 2.8,
};

const scienceWeatherStation: ItemSpriteData = {
  src: '/assets/items/science-weather-station.png',
  alt: 'תחנת מזג אוויר',
  className: 'object-contain drop-shadow-[0_13px_21px_rgba(0,0,0,0.38)] drop-shadow-[0_0_18px_rgba(80,210,255,0.34)]',
  roomOffsetX: 0,
  roomOffsetY: 58,
  roomWidthScale: 2.5,
  roomHeightScale: 2.5,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 58,
  roomFloorWidthScale: 2.5,
  roomFloorHeightScale: 2.5,
};

const scienceCrystalGrowthChamber: ItemSpriteData = {
  src: '/assets/items/science-crystal-growth-chamber.png',
  alt: 'תא גידול גבישים',
  className: 'object-contain drop-shadow-[0_14px_23px_rgba(0,0,0,0.40)] drop-shadow-[0_0_23px_rgba(100,120,255,0.48)]',
  roomOffsetX: 0,
  roomOffsetY: 60,
  roomWidthScale: 2.7,
  roomHeightScale: 2.7,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 60,
  roomFloorWidthScale: 2.7,
  roomFloorHeightScale: 2.7,
};

const scienceHolographicCell: ItemSpriteData = {
  src: '/assets/items/science-holographic-cell.png',
  alt: 'הולוגרמת התא החי',
  className: 'object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.37)] drop-shadow-[0_0_24px_rgba(60,210,255,0.50)]',
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 1.9,
  roomHeightScale: 1.9,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.1,
  roomShelfHeightScale: 1.1,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 56,
  roomFloorWidthScale: 2.4,
  roomFloorHeightScale: 2.4,
};

const scienceQuantumOrb: ItemSpriteData = {
  src: '/assets/items/science-quantum-orb.png',
  alt: 'כדור הקוונטים',
  className: 'object-contain drop-shadow-[0_12px_21px_rgba(0,0,0,0.38)] drop-shadow-[0_0_26px_rgba(100,95,255,0.54)]',
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 2,
  roomHeightScale: 2,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.1,
  roomShelfHeightScale: 1.1,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 58,
  roomFloorWidthScale: 2.5,
  roomFloorHeightScale: 2.5,
};

const scienceTimeMachine: ItemSpriteData = {
  src: '/assets/items/science-time-machine.png',
  alt: 'מכונת הזמן הניסויית',
  className: 'object-contain drop-shadow-[0_15px_26px_rgba(0,0,0,0.41)] drop-shadow-[0_0_28px_rgba(80,150,255,0.52)]',
  roomOffsetX: 0,
  roomOffsetY: 62,
  roomWidthScale: 2.9,
  roomHeightScale: 2.9,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 62,
  roomFloorWidthScale: 2.9,
  roomFloorHeightScale: 2.9,
};

const scienceGrandDiscoveryLab: ItemSpriteData = {
  src: '/assets/items/science-grand-discovery-lab.png',
  alt: 'מעבדת התגליות הגדולה',
  className: 'object-contain drop-shadow-[0_15px_27px_rgba(0,0,0,0.42)] drop-shadow-[0_0_27px_rgba(70,200,255,0.44)]',
  roomOffsetX: 0,
  roomOffsetY: 64,
  roomWidthScale: 3,
  roomHeightScale: 3,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 64,
  roomFloorWidthScale: 3,
  roomFloorHeightScale: 3,
};

const scienceWonderEngine: ItemSpriteData = {
  src: '/assets/items/science-wonder-engine.png',
  alt: 'מכונת הפלאים האגדית',
  className: 'object-contain drop-shadow-[0_16px_29px_rgba(0,0,0,0.43)] drop-shadow-[0_0_34px_rgba(255,195,65,0.58)] drop-shadow-[0_0_44px_rgba(90,120,255,0.38)]',
  roomOffsetX: 0,
  roomOffsetY: 66,
  roomWidthScale: 3.1,
  roomHeightScale: 3.1,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 66,
  roomFloorWidthScale: 3.1,
  roomFloorHeightScale: 3.1,
};

const balletSatinSlippers: ItemSpriteData = {
  src: '/assets/items/ballet-satin-slippers.png',
  alt: 'נעלי בלט מסאטן',
  className: 'object-contain drop-shadow-[0_9px_16px_rgba(0,0,0,0.34)] drop-shadow-[0_0_12px_rgba(255,150,205,0.28)]',
  roomOffsetX: 0,
  roomOffsetY: 12,
  roomWidthScale: 1.5,
  roomHeightScale: 1.5,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 15,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const balletRehearsalBag: ItemSpriteData = {
  src: '/assets/items/ballet-rehearsal-bag.png',
  alt: 'תיק החזרות',
  className: 'object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.35)] drop-shadow-[0_0_12px_rgba(200,125,255,0.24)]',
  roomOffsetX: 0,
  roomOffsetY: 8,
  roomWidthScale: 1.65,
  roomHeightScale: 1.65,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 18,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 54,
  roomFloorWidthScale: 2.2,
  roomFloorHeightScale: 2.2,
};

const balletRibbonBasket: ItemSpriteData = {
  src: '/assets/items/ballet-ribbon-basket.png',
  alt: 'סלסילת סרטים וסיכות',
  className: 'object-contain drop-shadow-[0_9px_16px_rgba(0,0,0,0.34)] drop-shadow-[0_0_12px_rgba(255,150,205,0.24)]',
  roomOffsetX: 0,
  roomOffsetY: 12,
  roomWidthScale: 1.55,
  roomHeightScale: 1.55,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 20,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const balletRosinBox: ItemSpriteData = {
  src: '/assets/items/ballet-rosin-box.png',
  alt: 'קופסת רוזין לבלט',
  className: 'object-contain drop-shadow-[0_9px_16px_rgba(0,0,0,0.34)] drop-shadow-[0_0_11px_rgba(255,190,115,0.22)]',
  roomOffsetX: 0,
  roomOffsetY: 14,
  roomWidthScale: 1.45,
  roomHeightScale: 1.45,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 22,
  roomShelfWidthScale: 1,
  roomShelfHeightScale: 1,
};

const balletWarmupSet: ItemSpriteData = {
  src: '/assets/items/ballet-warmup-set.png',
  alt: 'ערכת חימום לרקדנית',
  className: 'object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.35)] drop-shadow-[0_0_12px_rgba(190,130,255,0.24)]',
  roomOffsetX: 0,
  roomOffsetY: 10,
  roomWidthScale: 1.65,
  roomHeightScale: 1.65,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 18,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 54,
  roomFloorWidthScale: 2.2,
  roomFloorHeightScale: 2.2,
};

const balletPoseFrame: ItemSpriteData = {
  src: '/assets/items/ballet-pose-frame.png',
  alt: 'תמונת תנוחות בלט',
  className: 'object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.34)] drop-shadow-[0_0_16px_rgba(255,175,100,0.28)]',
  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 1.7,
  roomHeightScale: 1.7,
};

const balletStarRug: ItemSpriteData = {
  src: '/assets/items/ballet-star-rug.png',
  alt: 'שטיח כוכבת הבמה',
  className: 'object-fill translate-y-[2px] drop-shadow-[0_10px_12px_rgba(0,0,0,0.28)] drop-shadow-[0_0_12px_rgba(255,190,80,0.22)]',
};

const balletPracticeStool: ItemSpriteData = {
  src: '/assets/items/ballet-practice-stool.png',
  alt: 'הדום קשירת נעליים',
  className: 'object-contain drop-shadow-[0_13px_21px_rgba(0,0,0,0.38)] drop-shadow-[0_0_15px_rgba(255,150,205,0.26)]',
  roomOffsetX: 0,
  roomOffsetY: 55,
  roomWidthScale: 2.4,
  roomHeightScale: 2.4,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 55,
  roomFloorWidthScale: 2.4,
  roomFloorHeightScale: 2.4,
};

const balletPracticeBarre: ItemSpriteData = {
  src: '/assets/items/ballet-practice-barre.png',
  alt: 'מוט אימון לבלט',
  className: 'object-contain drop-shadow-[0_14px_22px_rgba(0,0,0,0.38)] drop-shadow-[0_0_15px_rgba(255,185,95,0.26)]',
  roomOffsetX: 0,
  roomOffsetY: 58,
  roomWidthScale: 2.6,
  roomHeightScale: 2.6,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 58,
  roomFloorWidthScale: 2.6,
  roomFloorHeightScale: 2.6,
};

const balletRehearsalMirror: ItemSpriteData = {
  src: '/assets/items/ballet-rehearsal-mirror.png',
  alt: 'מראת הסטודיו',
  className: 'object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.36)] drop-shadow-[0_0_18px_rgba(210,175,255,0.30)]',
  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 1.8,
  roomHeightScale: 1.8,
};

const balletTutuMannequin: ItemSpriteData = {
  src: '/assets/items/ballet-tutu-mannequin.png',
  alt: 'שמלת טוטו לתצוגה',
  className: 'object-contain drop-shadow-[0_14px_23px_rgba(0,0,0,0.39)] drop-shadow-[0_0_18px_rgba(255,150,205,0.34)]',
  roomOffsetX: 0,
  roomOffsetY: 58,
  roomWidthScale: 2.5,
  roomHeightScale: 2.5,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 58,
  roomFloorWidthScale: 2.5,
  roomFloorHeightScale: 2.5,
};

const balletSpinningMusicBox: ItemSpriteData = {
  src: '/assets/items/ballet-spinning-music-box.png',
  alt: 'תיבת נגינה מסתובבת',
  className: 'object-contain drop-shadow-[0_11px_19px_rgba(0,0,0,0.36)] drop-shadow-[0_0_18px_rgba(195,120,255,0.38)]',
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 1.75,
  roomHeightScale: 1.75,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.1,
  roomShelfHeightScale: 1.1,
};

const balletStageSpotlight: ItemSpriteData = {
  src: '/assets/items/ballet-stage-spotlight.png',
  alt: 'זרקור הבמה',
  className: 'object-contain drop-shadow-[0_13px_22px_rgba(0,0,0,0.38)] drop-shadow-[0_0_22px_rgba(255,215,115,0.44)]',
  roomOffsetX: 0,
  roomOffsetY: 58,
  roomWidthScale: 2.5,
  roomHeightScale: 2.5,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 58,
  roomFloorWidthScale: 2.5,
  roomFloorHeightScale: 2.5,
};

const balletCrystalSlippers: ItemSpriteData = {
  src: '/assets/items/ballet-crystal-slippers.png',
  alt: 'נעלי הבלט הקריסטליות',
  className: 'object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.37)] drop-shadow-[0_0_25px_rgba(190,100,255,0.52)]',
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 1.9,
  roomHeightScale: 1.9,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.1,
  roomShelfHeightScale: 1.1,
};

const balletSwanFountain: ItemSpriteData = {
  src: '/assets/items/ballet-swan-fountain.png',
  alt: 'מזרקת הברבורים',
  className: 'object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.40)] drop-shadow-[0_0_24px_rgba(90,195,255,0.46)]',
  roomOffsetX: 0,
  roomOffsetY: 60,
  roomWidthScale: 2.8,
  roomHeightScale: 2.8,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 60,
  roomFloorWidthScale: 2.8,
  roomFloorHeightScale: 2.8,
};

const balletPerfectLeapStatue: ItemSpriteData = {
  src: '/assets/items/ballet-perfect-leap-statue.png',
  alt: 'פסל הקפיצה המושלמת',
  className: 'object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.40)] drop-shadow-[0_0_26px_rgba(190,155,255,0.48)]',
  roomOffsetX: 0,
  roomOffsetY: 60,
  roomWidthScale: 2.7,
  roomHeightScale: 2.7,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 60,
  roomFloorWidthScale: 2.7,
  roomFloorHeightScale: 2.7,
};

const balletCostumeCarousel: ItemSpriteData = {
  src: '/assets/items/ballet-costume-carousel.png',
  alt: 'קרוסלת תלבושות הבלט',
  className: 'object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.40)] drop-shadow-[0_0_24px_rgba(255,145,205,0.42)]',
  roomOffsetX: 0,
  roomOffsetY: 60,
  roomWidthScale: 2.7,
  roomHeightScale: 2.7,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 60,
  roomFloorWidthScale: 2.7,
  roomFloorHeightScale: 2.7,
};

const balletDreamRehearsalStudio: ItemSpriteData = {
  src: '/assets/items/ballet-dream-rehearsal-studio.png',
  alt: 'סטודיו החלומות לבלט',
  className: 'object-contain drop-shadow-[0_15px_27px_rgba(0,0,0,0.42)] drop-shadow-[0_0_27px_rgba(255,175,110,0.40)]',
  roomOffsetX: 0,
  roomOffsetY: 64,
  roomWidthScale: 3,
  roomHeightScale: 3,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 64,
  roomFloorWidthScale: 3,
  roomFloorHeightScale: 3,
};

const balletMoonlitTheatreStage: ItemSpriteData = {
  src: '/assets/items/ballet-moonlit-theatre-stage.png',
  alt: 'במת הבלט לאור הירח',
  className: 'object-contain drop-shadow-[0_15px_27px_rgba(0,0,0,0.42)] drop-shadow-[0_0_30px_rgba(90,125,255,0.52)]',
  roomOffsetX: 0,
  roomOffsetY: 64,
  roomWidthScale: 3,
  roomHeightScale: 3,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 64,
  roomFloorWidthScale: 3,
  roomFloorHeightScale: 3,
};

const balletLegendaryPrimaStage: ItemSpriteData = {
  src: '/assets/items/ballet-legendary-prima-stage.png',
  alt: 'במת הפרימה בלרינה האגדית',
  className: 'object-contain drop-shadow-[0_16px_29px_rgba(0,0,0,0.43)] drop-shadow-[0_0_35px_rgba(255,195,70,0.60)] drop-shadow-[0_0_45px_rgba(115,110,255,0.40)]',
  roomOffsetX: 0,
  roomOffsetY: 66,
  roomWidthScale: 3.1,
  roomHeightScale: 3.1,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 66,
  roomFloorWidthScale: 3.1,
  roomFloorHeightScale: 3.1,
};

const natureWildflowerPot: ItemSpriteData = {
  src: '/assets/items/nature-wildflower-pot.png',
  alt: 'עציץ פרחי בר',
  className: 'object-contain drop-shadow-[0_9px_16px_rgba(0,0,0,0.34)]',
  roomOffsetX: 0,
  roomOffsetY: 12,
  roomWidthScale: 1.5,
  roomHeightScale: 1.5,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 20,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const natureAcornCollection: ItemSpriteData = {
  src: '/assets/items/nature-acorn-collection.png',
  alt: 'אוסף בלוטים',
  className: 'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.34)]',
  roomOffsetX: 0,
  roomOffsetY: 14,
  roomWidthScale: 1.45,
  roomHeightScale: 1.45,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 22,
  roomShelfWidthScale: 1,
  roomShelfHeightScale: 1,
};

const natureMossyStone: ItemSpriteData = {
  src: '/assets/items/nature-mossy-stone.png',
  alt: 'אבן מכוסה טחב',
  className: 'object-contain drop-shadow-[0_10px_17px_rgba(0,0,0,0.35)]',
  roomOffsetX: 0,
  roomOffsetY: 8,
  roomWidthScale: 1.7,
  roomHeightScale: 1.7,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 18,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 54,
  roomFloorWidthScale: 2.25,
  roomFloorHeightScale: 2.25,
};

const natureLeafPress: ItemSpriteData = {
  src: '/assets/items/nature-leaf-press.png',
  alt: 'מכבש עלים',
  className: 'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.34)]',
  roomOffsetX: 0,
  roomOffsetY: 14,
  roomWidthScale: 1.45,
  roomHeightScale: 1.45,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 22,
  roomShelfWidthScale: 1,
  roomShelfHeightScale: 1,
};

const natureSunflowerVase: ItemSpriteData = {
  src: '/assets/items/nature-sunflower-vase.png',
  alt: 'אגרטל חמניות',
  className: 'object-contain drop-shadow-[0_9px_16px_rgba(0,0,0,0.34)]',
  roomOffsetX: 0,
  roomOffsetY: 10,
  roomWidthScale: 1.55,
  roomHeightScale: 1.55,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 18,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
};

const natureFernBasket: ItemSpriteData = {
  src: '/assets/items/nature-fern-basket.png',
  alt: 'סלסילת שרכים',
  className: 'object-contain drop-shadow-[0_10px_17px_rgba(0,0,0,0.35)]',
  roomOffsetX: 0,
  roomOffsetY: 8,
  roomWidthScale: 1.65,
  roomHeightScale: 1.65,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 18,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 54,
  roomFloorWidthScale: 2.2,
  roomFloorHeightScale: 2.2,
};

const natureLeafRug: ItemSpriteData = {
  src: '/assets/items/nature-leaf-rug.png',
  alt: 'שטיח עלה',
  className: 'object-fill translate-y-[2px] drop-shadow-[0_10px_10px_rgba(0,0,0,0.25)]',
};

const natureLogStool: ItemSpriteData = {
  src: '/assets/items/nature-log-stool.png',
  alt: 'שרפרף בול עץ',
  className: 'object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.37)]',
  roomOffsetX: 0,
  roomOffsetY: 55,
  roomWidthScale: 2.4,
  roomHeightScale: 2.4,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 55,
  roomFloorWidthScale: 2.4,
  roomFloorHeightScale: 2.4,
};

const natureBonsaiTree: ItemSpriteData = {
  src: '/assets/items/nature-bonsai-tree.png',
  alt: 'עץ בונסאי',
  className: 'object-contain drop-shadow-[0_11px_19px_rgba(0,0,0,0.36)]',
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 1.8,
  roomHeightScale: 1.8,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.1,
  roomShelfHeightScale: 1.1,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 54,
  roomFloorWidthScale: 2.3,
  roomFloorHeightScale: 2.3,
};

const natureMushroomLantern: ItemSpriteData = {
  src: '/assets/items/nature-mushroom-lantern.png',
  alt: 'מנורת פטריות',
  className: 'object-contain drop-shadow-[0_11px_19px_rgba(0,0,0,0.36)] drop-shadow-[0_0_20px_rgba(255,195,80,0.40)]',
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 1.8,
  roomHeightScale: 1.8,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.1,
  roomShelfHeightScale: 1.1,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 54,
  roomFloorWidthScale: 2.3,
  roomFloorHeightScale: 2.3,
};

const natureIndoorHerbGarden: ItemSpriteData = {
  src: '/assets/items/nature-indoor-herb-garden.png',
  alt: 'גינת תבלינים קטנה',
  className: 'object-contain drop-shadow-[0_13px_22px_rgba(0,0,0,0.38)]',
  roomOffsetX: 0,
  roomOffsetY: 58,
  roomWidthScale: 2.6,
  roomHeightScale: 2.6,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 58,
  roomFloorWidthScale: 2.6,
  roomFloorHeightScale: 2.6,
};

const natureRainCloudMobile: ItemSpriteData = {
  src: '/assets/items/nature-rain-cloud-mobile.png',
  alt: 'מובייל ענן גשם',
  className: 'object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.34)] drop-shadow-[0_0_18px_rgba(90,190,255,0.28)]',
  roomOffsetX: 0,
  roomOffsetY: -2,
  roomWidthScale: 1.75,
  roomHeightScale: 1.75,
};

const natureFlowerArch: ItemSpriteData = {
  src: '/assets/items/nature-flower-arch.png',
  alt: 'קשת פרחים',
  className: 'object-contain drop-shadow-[0_13px_22px_rgba(0,0,0,0.38)]',
  roomOffsetX: 0,
  roomOffsetY: 60,
  roomWidthScale: 2.8,
  roomHeightScale: 2.8,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 60,
  roomFloorWidthScale: 2.8,
  roomFloorHeightScale: 2.8,
};

const natureCrystalGeode: ItemSpriteData = {
  src: '/assets/items/nature-crystal-geode.png',
  alt: 'גאודת טבע זוהרת',
  className: 'object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.37)] drop-shadow-[0_0_24px_rgba(80,210,255,0.45)]',
  roomOffsetX: 0,
  roomOffsetY: 6,
  roomWidthScale: 1.9,
  roomHeightScale: 1.9,
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 16,
  roomShelfWidthScale: 1.1,
  roomShelfHeightScale: 1.1,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 56,
  roomFloorWidthScale: 2.4,
  roomFloorHeightScale: 2.4,
};

const natureMiniWaterfall: ItemSpriteData = {
  src: '/assets/items/nature-mini-waterfall.png',
  alt: 'מפל טבע קטן',
  className: 'object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.40)] drop-shadow-[0_0_22px_rgba(80,195,255,0.34)]',
  roomOffsetX: 0,
  roomOffsetY: 60,
  roomWidthScale: 2.8,
  roomHeightScale: 2.8,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 60,
  roomFloorWidthScale: 2.8,
  roomFloorHeightScale: 2.8,
};

const natureGlowingMossGarden: ItemSpriteData = {
  src: '/assets/items/nature-glowing-moss-garden.png',
  alt: 'גינת טחב זוהרת',
  className: 'object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.40)] drop-shadow-[0_0_24px_rgba(120,255,135,0.38)]',
  roomOffsetX: 0,
  roomOffsetY: 60,
  roomWidthScale: 2.7,
  roomHeightScale: 2.7,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 60,
  roomFloorWidthScale: 2.7,
  roomFloorHeightScale: 2.7,
};

const natureFourSeasonsTree: ItemSpriteData = {
  src: '/assets/items/nature-four-seasons-tree.png',
  alt: 'עץ ארבע העונות',
  className: 'object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.40)] drop-shadow-[0_0_23px_rgba(255,195,100,0.30)]',
  roomOffsetX: 0,
  roomOffsetY: 62,
  roomWidthScale: 2.9,
  roomHeightScale: 2.9,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 62,
  roomFloorWidthScale: 2.9,
  roomFloorHeightScale: 2.9,
};

const natureEnchantedGreenhouse: ItemSpriteData = {
  src: '/assets/items/nature-enchanted-greenhouse.png',
  alt: 'החממה הקסומה',
  className: 'object-contain drop-shadow-[0_15px_27px_rgba(0,0,0,0.42)] drop-shadow-[0_0_28px_rgba(110,255,155,0.38)]',
  roomOffsetX: 0,
  roomOffsetY: 64,
  roomWidthScale: 3,
  roomHeightScale: 3,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 64,
  roomFloorWidthScale: 3,
  roomFloorHeightScale: 3,
};

const natureLivingForestCorner: ItemSpriteData = {
  src: '/assets/items/nature-living-forest-corner.png',
  alt: 'פינת היער החיה',
  className: 'object-contain drop-shadow-[0_15px_27px_rgba(0,0,0,0.42)] drop-shadow-[0_0_27px_rgba(80,205,255,0.34)]',
  roomOffsetX: 0,
  roomOffsetY: 64,
  roomWidthScale: 3,
  roomHeightScale: 3,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 64,
  roomFloorWidthScale: 3,
  roomFloorHeightScale: 3,
};

const natureHeartOfTheForest: ItemSpriteData = {
  src: '/assets/items/nature-heart-of-the-forest.png',
  alt: 'לב היער האגדי',
  className: 'object-contain drop-shadow-[0_16px_29px_rgba(0,0,0,0.43)] drop-shadow-[0_0_35px_rgba(70,255,145,0.58)] drop-shadow-[0_0_46px_rgba(255,210,80,0.36)]',
  roomOffsetX: 0,
  roomOffsetY: 66,
  roomWidthScale: 3.1,
  roomHeightScale: 3.1,
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 66,
  roomFloorWidthScale: 3.1,
  roomFloorHeightScale: 3.1,
};

const deskChessCrown: ItemSpriteData = {
  src: '/assets/items/desk-chess-crown.png',
  alt: 'כתר השחמט',
  className:
    'object-contain drop-shadow-[0_0_12px_rgba(180,120,255,0.45)] drop-shadow-[0_6px_10px_rgba(0,0,0,0.30)]',

  // שולחן — חפץ epic, אבל עדיין חפץ קטן יחסית
  roomOffsetX: 0,
  roomOffsetY: 34,
  roomWidthScale: 0.8,
  roomHeightScale: 0.8,

  // מדף — צריך להיות קטן בהרבה, כי הכתר רחב
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 55,
  roomShelfWidthScale: 0.35,
roomShelfHeightScale: 0.35,

  // special / floor — יותר מרשים, אבל לא ענק
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 40,
  roomFloorWidthScale: 1.15,
  roomFloorHeightScale: 1.15,
};
const deskInkwell: ItemSpriteData = {
  src: '/assets/items/desk-inkwell.png',
  alt: 'קסת דיו עתיקה',
  className:
    'object-contain drop-shadow-[0_5px_8px_rgba(0,0,0,0.26)]',

  // שולחן — חפץ common קטן, אבל נראה לעין
  roomOffsetX: 0,
  roomOffsetY: 24,
  roomWidthScale: 1.32,
  roomHeightScale: 1.32,

  // מדף — קטן יותר מהשולחן, אבל לא מיניאטורי
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 22,
  roomShelfWidthScale: 1.42,
  roomShelfHeightScale: 1.42,
};
const wallMap: ItemSpriteData = {
  src: '/assets/items/wall-map.png',
  alt: 'מפת הממלכה',
  className:
    'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.28)]',

  // קיר — חפץ common, אבל מפה צריכה להיות מספיק קריאה
  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 1.35,
  roomHeightScale: 1.35,
};
const bannerDragon: ItemSpriteData = {
  src: '/assets/items/banner-dragon.png',
  alt: 'דגל הדרקון',
  className:
    'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)] drop-shadow-[0_0_10px_rgba(255,180,80,0.22)]',

  // קיר — rare, אז קצת יותר בולט ממפת הממלכה
  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 1.8,
  roomHeightScale: 1.8,
};
const wallCandleSconce: ItemSpriteData = {
  src: '/assets/items/wall-candle-sconce.png',
  alt: 'פמוט קיר עתיק',
  className:
    'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.30)] drop-shadow-[0_0_12px_rgba(255,220,140,0.25)]',

  // קיר — uncommon, יפה ובולט אבל לא נדיר מדי
  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 1.25,
  roomHeightScale: 1.25,
};
const wallScrollBadge: ItemSpriteData = {
  src: '/assets/items/wall-scroll-badge.png',
  alt: 'תעודת מגילה',
  className:
    'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.30)] drop-shadow-[0_0_10px_rgba(255,210,120,0.22)]',

  // קיר — rare, יותר בולט ממפה רגילה אבל לא אפי
  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 1.8,
  roomHeightScale: 1.8,
};
const bannerRoyalLion: ItemSpriteData = {
  src: '/assets/items/banner-royal-lion.png',
  alt: 'דגל האריה המלכותי',
  className:
    'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.28)]',

  // קיר — common, יפה אבל לא מוגזם
  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 1.25,
  roomHeightScale: 1.25,
};
const deskCrystalLamp: ItemSpriteData = {
  src: '/assets/items/desk-crystal-lamp.png',
  alt: 'מנורת קריסטל',
  className:
    'object-contain drop-shadow-[0_0_14px_rgba(160,200,255,0.55)] drop-shadow-[0_7px_12px_rgba(0,0,0,0.30)]',

  // שולחן — rare, בולטת אבל לא ענקית
  roomOffsetX: 0,
  roomOffsetY: 14,
  roomWidthScale: 1.25,
  roomHeightScale: 1.25,

  // מדף — קצת קטנה יותר
  roomShelfOffsetX: 0,
  roomShelfOffsetY: 22,
  roomShelfWidthScale: 1.05,
  roomShelfHeightScale: 1.05,

  // special — קצת יותר מרשימה
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 18,
  roomFloorWidthScale: 1.45,
  roomFloorHeightScale: 1.45,
};
const wallWizardShelf: ItemSpriteData = {
  src: '/assets/items/wall-wizard-shelf.png',
  alt: 'מדף הקוסם',
  className:
    'object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.32)] drop-shadow-[0_0_14px_rgba(150,100,255,0.25)]',

  // ברירת מחדל — wall / special
  // חפץ epic רחב ומפורט, לכן לא להגזים בסקייל
  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 1.55,
  roomHeightScale: 1.55,
};
const petOwlFamiliar: ItemSpriteData = {
  src: '/assets/items/pet-owl-familiar.png',
  alt: 'ינשוף שליחים',
  className:
    'object-contain drop-shadow-[0_0_12px_rgba(140,160,255,0.45)] drop-shadow-[0_8px_14px_rgba(0,0,0,0.30)]',

  // wall / special
  // חפץ rare מרחף — בולט, אבל לא ענק
  roomOffsetX: 0,
  roomOffsetY: -6,
  roomWidthScale: 1.52,
  roomHeightScale: 1.52,
};
const petRuneCat: ItemSpriteData = {
  src: '/assets/items/pet-rune-cat.png',
  alt: 'חתול רונות',
  className:
    'object-contain drop-shadow-[0_0_12px_rgba(170,90,255,0.48)] drop-shadow-[0_8px_14px_rgba(0,0,0,0.30)]',

  // ברירת מחדל — special
  // חפץ rare: קסום ובולט, אבל לא אפי
  roomOffsetX: 0,
  roomOffsetY: 8,
  roomWidthScale: 1.45,
  roomHeightScale: 1.45,

  // רצפה — מתאים יותר לחתול, קצת גדול יותר ונמוך יותר
  roomFloorOffsetX: 0,
  roomFloorOffsetY: 56,
  roomFloorWidthScale: 1.65,
  roomFloorHeightScale: 1.65,
};
const petTinyDragon: ItemSpriteData = {
  src: '/assets/items/pet-tiny-dragon.png',
  alt: 'דרקון מחמד קטן',
  className:
    'object-contain drop-shadow-[0_0_14px_rgba(170,90,255,0.40)] drop-shadow-[0_8px_14px_rgba(0,0,0,0.30)]',

  // wall / special
  // חפץ epic מעופף — בולט יותר מ-rare, אבל לא ענק
  roomOffsetX: 0,
  roomOffsetY: -8,
  roomWidthScale: 1.55,
  roomHeightScale: 1.55,
};
const bannerPhoenix: ItemSpriteData = {
  src: '/assets/items/banner-phoenix.png',
  alt: 'דגל עוף החול',
  className:
    'object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.32)] drop-shadow-[0_0_14px_rgba(255,140,60,0.28)]',

  // wall / special
  // חפץ epic — צריך להיות יותר מרשים מהדגלים הרגילים
  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 1.85,
  roomHeightScale: 1.85,
};
const magicCarpet: ItemSpriteData = {
  src: '/assets/items/magic-carpet.png',
  alt: 'שטיח קסמים',
  className:
    'object-contain drop-shadow-[0_0_24px_rgba(180,120,255,0.55)] drop-shadow-[0_0_38px_rgba(255,220,120,0.32)] drop-shadow-[0_10px_18px_rgba(0,0,0,0.30)]',

  // wall / special
  // חפץ legendary — צריך להיות גדול, בולט ומיוחד
  roomOffsetX: 0,
 roomOffsetY: -14,
roomWidthScale: 2.85,
roomHeightScale: 2.85,
};
const lightingStarlight: ItemSpriteData = {
  src: '/assets/items/lighting-starlight.png',
  alt: 'אור הכוכבים',
  className:
    'object-contain drop-shadow-[0_0_24px_rgba(255,230,120,0.65)] drop-shadow-[0_0_42px_rgba(160,100,255,0.48)]',

  // wall / special
  // חפץ legendary: אפקט תאורה גדול, זוהר ומרכזי
  roomOffsetX: 0,
  roomOffsetY: -8,
  roomWidthScale: 2.25,
  roomHeightScale: 2.25,
};
const badgeFirstQuest: ItemSpriteData = {
  src: '/assets/items/badge-first-quest.png',
  alt: 'אות המסע הראשון',
  className:
    'object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.28)] drop-shadow-[0_0_8px_rgba(255,210,120,0.22)]',

  // wall / special
  // חפץ common — יפה וברור, אבל לא גדול מדי
  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 1.05,
  roomHeightScale: 1.05,
};
const badgeScholar: ItemSpriteData = {
  src: '/assets/items/badge-scholar.png',
  alt: 'אות החוקר',
  className:
    'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.30)] drop-shadow-[0_0_10px_rgba(80,150,255,0.26)]',

  // wall / special
  // חפץ rare — יותר מרשים מ-badge_first_quest, אבל לא אפי
  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 1.25,
  roomHeightScale: 1.25,
};
const frameGlowSilver: ItemSpriteData = {
  src: '/assets/items/frame-glow-silver.png',
  alt: 'מסגרת כסף זוהרת',
  className:
    'object-contain drop-shadow-[0_0_14px_rgba(180,220,255,0.35)] drop-shadow-[0_8px_14px_rgba(0,0,0,0.28)]',

  // wall / special
  // חפץ common, אבל מסגרת צריכה להיות גדולה יחסית
  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 2.95,
  roomHeightScale: 2.95,
};
const frameRoyalGold: ItemSpriteData = {
  src: '/assets/items/frame-royal-gold.png',
  alt: 'מסגרת זהב מלכותית',
  className:
    'object-contain drop-shadow-[0_0_16px_rgba(255,215,80,0.45)] drop-shadow-[0_8px_14px_rgba(0,0,0,0.30)]',

  // wall / special
  // rare — יותר מרשימה מהכסופה, אבל לא מטורפת כמו arcane
  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 3.05,
  roomHeightScale: 3.05,
};
const frameArcane: ItemSpriteData = {
  src: '/assets/items/frame-arcane.png',
  alt: 'מסגרת רונות',
  className:
    'object-contain drop-shadow-[0_0_18px_rgba(170,90,255,0.48)] drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)]',

  // wall / special
  // מסגרת epic — יותר מרשימה מהזהב, אבל לא ענקית מדי
  roomOffsetX: 0,
  roomOffsetY: 0,
  roomWidthScale: 3.15,
  roomHeightScale: 3.15,
};

export const ITEM_SPRITES: Record<string, ItemSpriteData> = {
  // לוח שחמט
  chess: chessBoardBasic,
  'chess-board-basic': chessBoardBasic,
  chess_board_basic: chessBoardBasic,
  chess_board: chessBoardBasic,
  'basic-chess-board': chessBoardBasic,
  'chess-board': chessBoardBasic,

  // ערימת ספרים
  generic_book_stack: genericBookStack,
  'generic-book-stack': genericBookStack,

  // ספר פתיחות
  chess_opening_book: chessOpeningBook,
  'chess-opening-book': chessOpeningBook,

  // מדבקת כוכב
  space_star_sticker: spaceStarSticker,
  'space-star-sticker': spaceStarSticker,
  star: spaceStarSticker,
  'star-sticker': spaceStarSticker,

  // שטיח בסיסי
  rug_basic: rugBasic,
  'rug-basic': rugBasic,
  rug: rugBasic,

  generic_candle: genericCandle,
  poster_stars: posterStars,
  animals_fox_statue: animalsFoxStatue,
  lamp_basic: lampBasic,
  chess_pawn: chessPawn,
  generic_magic_scroll: genericMagicScroll,
  chess_tactics_cards: chessTacticsCards,
  chess_clock: chessClock,
  generic_small_plant: genericSmallPlant,
  chess_knight: chessKnight,
  chess_queen_statue: chessQueenStatue,
  chess_king: chessKing,
  space_moon_lamp: spaceMoonLamp,
  space_rocket: spaceRocket,
  space_planet: spacePlanet,
  space_black_hole: spaceBlackHole,
  space_galaxy_core: spaceGalaxyCore,
  space_astronaut_helmet: spaceAstronautHelmet,
  space_satellite_model: spaceSatelliteModel,
  space_meteorite_sample: spaceMeteoriteSample,
  space_alien_plant: spaceAlienPlant,
  space_constellation_frame: spaceConstellationFrame,
  space_launch_pad_rug: spaceLaunchPadRug,
  space_lunar_rover: spaceLunarRover,
  space_solar_system_mobile: spaceSolarSystemMobile,
  space_friendly_alien: spaceFriendlyAlien,
  space_observatory_telescope: spaceObservatoryTelescope,
  space_mars_colony: spaceMarsColony,
  space_crystal_comet: spaceCrystalComet,
  space_astronaut_explorer_statue: spaceAstronautExplorerStatue,
  space_nebula_portal: spaceNebulaPortal,
  generic_crystal_small: genericCrystalSmall,
  generic_gold_trophy: genericGoldTrophy,
  generic_floating_crystal: genericFloatingCrystal,
  generic_royal_banner: genericRoyalBanner,
  generic_round_rug: genericRoundRug,
  generic_pencil_cup: genericPencilCup,
  generic_small_hourglass: genericSmallHourglass,
  generic_storage_basket: genericStorageBasket,
  generic_framed_landscape: genericFramedLandscape,
  generic_explorer_globe: genericExplorerGlobe,
  generic_magic_music_box: genericMagicMusicBox,
  generic_scholars_clock: genericScholarsClock,
  generic_treasure_chest: genericTreasureChest,
  generic_wisdom_lantern: genericWisdomLantern,
  generic_stained_glass_window: genericStainedGlassWindow,
  generic_floating_book: genericFloatingBook,
  cosmetic_glow_blue: cosmeticGlowBlue,
  cosmetic_sparkles: cosmeticSparkles,
  cosmetic_rainbow: cosmeticRainbow,
  animals_cat_sleeping: animalsCatSleeping,
  animals_owl_perch: animalsOwlPerch,
  animals_tiny_dragon: animalsTinyDragon,
  animals_phoenix_egg: animalsPhoenixEgg,
  animals_bunny_cushion: animalsBunnyCushion,
  animals_hamster_wheel: animalsHamsterWheel,
  animals_turtle_friend: animalsTurtleFriend,
  animals_puppy_basket: animalsPuppyBasket,
  animals_capybara_friend: animalsCapybaraFriend,
  animals_butterfly_frame: animalsButterflyFrame,
  animals_paw_rug: animalsPawRug,
  animals_red_panda: animalsRedPanda,
  animals_otter_shell: animalsOtterShell,
  animals_axolotl_aquarium: animalsAxolotlAquarium,
  animals_frog_lantern: animalsFrogLantern,
  animals_snow_leopard_cub: animalsSnowLeopardCub,
  animals_crystal_deer: animalsCrystalDeer,
  animals_moon_wolf_portrait: animalsMoonWolfPortrait,
  animals_cloud_pegasus: animalsCloudPegasus,
  sports_soccer_ball: sportsSoccerBall,
  sports_basketball_stand: sportsBasketballStand,
  sports_tennis_racket: sportsTennisRacket,
  sports_rhythmic_ribbon: sportsRhythmicRibbon,
  sports_swim_gear: sportsSwimGear,
  sports_table_tennis_set: sportsTableTennisSet,
  sports_running_shoes: sportsRunningShoes,
  sports_court_rug: sportsCourtRug,
  sports_mini_basketball_hoop: sportsMiniBasketballHoop,
  sports_judo_belt_display: sportsJudoBeltDisplay,
  sports_balance_beam: sportsBalanceBeam,
  sports_fencing_display: sportsFencingDisplay,
  sports_volleyball_stand: sportsVolleyballStand,
  sports_tennis_champion_statue: sportsTennisChampionStatue,
  sports_rhythmic_gymnast_music_box: sportsRhythmicGymnastMusicBox,
  sports_judo_champion_statue: sportsJudoChampionStatue,
  sports_swimmer_wave_statue: sportsSwimmerWaveStatue,
  sports_hologram_stadium: sportsHologramStadium,
  sports_victory_torch: sportsVictoryTorch,
  sports_kingdom_champions_cup: sportsKingdomChampionsCup,
  fantasy_potion_set: fantasyPotionSet,
  fantasy_wizard_hat: fantasyWizardHat,
  fantasy_spark_wand: fantasySparkWand,
  fantasy_fairy_bottle: fantasyFairyBottle,
  fantasy_mushroom_stool: fantasyMushroomStool,
  fantasy_enchanted_key: fantasyEnchantedKey,
  fantasy_castle_rug: fantasyCastleRug,
  fantasy_secret_door: fantasySecretDoor,
  fantasy_spellbook_lectern: fantasySpellbookLectern,
  fantasy_fairy_tree: fantasyFairyTree,
  fantasy_unicorn_music_box: fantasyUnicornMusicBox,
  fantasy_crystal_cauldron: fantasyCrystalCauldron,
  fantasy_knight_shield: fantasyKnightShield,
  fantasy_fairy_queen_statue: fantasyFairyQueenStatue,
  fantasy_mermaid_fountain: fantasyMermaidFountain,
  fantasy_griffin_guardian: fantasyGriffinGuardian,
  fantasy_moon_fairy_garden: fantasyMoonFairyGarden,
  fantasy_dragon_throne: fantasyDragonThrone,
  fantasy_portal_mirror: fantasyPortalMirror,
  fantasy_dream_castle: fantasyDreamCastle,
  music_colorful_maracas: musicColorfulMaracas,
  music_royal_tambourine: musicRoyalTambourine,
  music_rainbow_xylophone: musicRainbowXylophone,
  music_magic_metronome: musicMagicMetronome,
  music_violin_case: musicViolinCase,
  music_note_rug: musicNoteRug,
  music_glowing_guitar: musicGlowingGuitar,
  music_silver_flute: musicSilverFlute,
  music_violin_stand: musicViolinStand,
  music_golden_saxophone: musicGoldenSaxophone,
  music_drum_kit: musicDrumKit,
  music_stage_microphone: musicStageMicrophone,
  music_glowing_notes_frame: musicGlowingNotesFrame,
  music_crystal_harp: musicCrystalHarp,
  music_grand_piano: musicGrandPiano,
  music_young_violinist_statue: musicYoungViolinistStatue,
  music_enchanted_gramophone: musicEnchantedGramophone,
  music_magical_orchestra: musicMagicalOrchestra,
  music_rainbow_pipe_organ: musicRainbowPipeOrgan,
  music_floating_concert_stage: musicFloatingConcertStage,
  robotics_tiny_helper_bot: roboticsTinyHelperBot,
  robotics_colorful_gears: roboticsColorfulGears,
  robotics_remote_controller: roboticsRemoteController,
  robotics_sensor_kit: roboticsSensorKit,
  robotics_circuit_rug: roboticsCircuitRug,
  robotics_blueprint_frame: roboticsBlueprintFrame,
  robotics_mini_drone: roboticsMiniDrone,
  robotics_toolbox: roboticsToolbox,
  robotics_robotic_arm: roboticsRoboticArm,
  robotics_3d_printer: robotics3dPrinter,
  robotics_wheeled_rover: roboticsWheeledRover,
  robotics_hologram_workbench: roboticsHologramWorkbench,
  robotics_coding_console: roboticsCodingConsole,
  robotics_competition_robot: roboticsCompetitionRobot,
  robotics_friendly_android: roboticsFriendlyAndroid,
  robotics_drone_hangar: roboticsDroneHangar,
  robotics_ai_crystal_core: roboticsAiCrystalCore,
  robotics_transforming_mech: roboticsTransformingMech,
  robotics_holographic_lab: roboticsHolographicLab,
  robotics_kingdom_guardian: roboticsKingdomGuardian,
  art_colorful_paint_jars: artColorfulPaintJars,
  art_brush_cup: artBrushCup,
  art_watercolor_palette: artWatercolorPalette,
  art_sketchbook_set: artSketchbookSet,
  art_origami_cranes: artOrigamiCranes,
  art_clay_modeling_set: artClayModelingSet,
  art_artist_apron: artArtistApron,
  art_paint_splash_rug: artPaintSplashRug,
  art_wooden_easel: artWoodenEasel,
  art_pottery_wheel: artPotteryWheel,
  art_stained_glass_butterfly: artStainedGlassButterfly,
  art_drawing_tablet: artDrawingTablet,
  art_craft_workbench: artCraftWorkbench,
  art_self_painting_canvas: artSelfPaintingCanvas,
  art_crystal_sculpture: artCrystalSculpture,
  art_kinetic_color_mobile: artKineticColorMobile,
  art_enchanted_ceramic_fountain: artEnchantedCeramicFountain,
  art_origami_dragon: artOrigamiDragon,
  art_living_gallery: artLivingGallery,
  art_infinite_imagination_fountain: artInfiniteImaginationFountain,
  science_student_microscope: scienceStudentMicroscope,
  science_colorful_test_tubes: scienceColorfulTestTubes,
  science_magnet_kit: scienceMagnetKit,
  science_cell_model: scienceCellModel,
  science_ammonite_fossil: scienceAmmoniteFossil,
  science_lab_goggles: scienceLabGoggles,
  science_electric_circuit: scienceElectricCircuit,
  science_atom_rug: scienceAtomRug,
  science_glowing_dna_model: scienceGlowingDnaModel,
  science_volcano_model: scienceVolcanoModel,
  science_newtons_cradle: scienceNewtonsCradle,
  science_plasma_globe: sciencePlasmaGlobe,
  science_experiment_workbench: scienceExperimentWorkbench,
  science_weather_station: scienceWeatherStation,
  science_crystal_growth_chamber: scienceCrystalGrowthChamber,
  science_holographic_cell: scienceHolographicCell,
  science_quantum_orb: scienceQuantumOrb,
  science_time_machine: scienceTimeMachine,
  science_grand_discovery_lab: scienceGrandDiscoveryLab,
  science_wonder_engine: scienceWonderEngine,
  ballet_satin_slippers: balletSatinSlippers,
  ballet_rehearsal_bag: balletRehearsalBag,
  ballet_ribbon_basket: balletRibbonBasket,
  ballet_rosin_box: balletRosinBox,
  ballet_warmup_set: balletWarmupSet,
  ballet_pose_frame: balletPoseFrame,
  ballet_star_rug: balletStarRug,
  ballet_practice_stool: balletPracticeStool,
  ballet_practice_barre: balletPracticeBarre,
  ballet_rehearsal_mirror: balletRehearsalMirror,
  ballet_tutu_mannequin: balletTutuMannequin,
  ballet_spinning_music_box: balletSpinningMusicBox,
  ballet_stage_spotlight: balletStageSpotlight,
  ballet_crystal_slippers: balletCrystalSlippers,
  ballet_swan_fountain: balletSwanFountain,
  ballet_perfect_leap_statue: balletPerfectLeapStatue,
  ballet_costume_carousel: balletCostumeCarousel,
  ballet_dream_rehearsal_studio: balletDreamRehearsalStudio,
  ballet_moonlit_theatre_stage: balletMoonlitTheatreStage,
  ballet_legendary_prima_stage: balletLegendaryPrimaStage,
  nature_wildflower_pot: natureWildflowerPot,
  nature_acorn_collection: natureAcornCollection,
  nature_mossy_stone: natureMossyStone,
  nature_leaf_press: natureLeafPress,
  nature_sunflower_vase: natureSunflowerVase,
  nature_fern_basket: natureFernBasket,
  nature_leaf_rug: natureLeafRug,
  nature_log_stool: natureLogStool,
  nature_bonsai_tree: natureBonsaiTree,
  nature_mushroom_lantern: natureMushroomLantern,
  nature_indoor_herb_garden: natureIndoorHerbGarden,
  nature_rain_cloud_mobile: natureRainCloudMobile,
  nature_flower_arch: natureFlowerArch,
  nature_crystal_geode: natureCrystalGeode,
  nature_mini_waterfall: natureMiniWaterfall,
  nature_glowing_moss_garden: natureGlowingMossGarden,
  nature_four_seasons_tree: natureFourSeasonsTree,
  nature_enchanted_greenhouse: natureEnchantedGreenhouse,
  nature_living_forest_corner: natureLivingForestCorner,
  nature_heart_of_the_forest: natureHeartOfTheForest,
  desk_chess_crown: deskChessCrown,
  desk_inkwell: deskInkwell,
  wall_map: wallMap,
  banner_dragon: bannerDragon,
  wall_candle_sconce: wallCandleSconce,
  wall_scroll_badge: wallScrollBadge,
  banner_royal_lion: bannerRoyalLion,
  desk_crystal_lamp: deskCrystalLamp,
  wall_wizard_shelf: wallWizardShelf,
  pet_owl_familiar: petOwlFamiliar,
  pet_rune_cat: petRuneCat,
  pet_tiny_dragon: petTinyDragon,
  banner_phoenix: bannerPhoenix,
  magic_carpet: magicCarpet,
  lighting_starlight: lightingStarlight,
  badge_first_quest: badgeFirstQuest,
  badge_scholar: badgeScholar,
  frame_glow_silver: frameGlowSilver,
  frame_royal_gold: frameRoyalGold,
  frame_arcane: frameArcane,
};
