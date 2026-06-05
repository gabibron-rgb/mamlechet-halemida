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
  generic_crystal_small: genericCrystalSmall,
  generic_gold_trophy: genericGoldTrophy,
  generic_floating_crystal: genericFloatingCrystal,
  generic_royal_banner: genericRoyalBanner,
  cosmetic_glow_blue: cosmeticGlowBlue,
  cosmetic_sparkles: cosmeticSparkles,
  cosmetic_rainbow: cosmeticRainbow,
  animals_cat_sleeping: animalsCatSleeping,
  animals_owl_perch: animalsOwlPerch,
  animals_tiny_dragon: animalsTinyDragon,
  animals_phoenix_egg: animalsPhoenixEgg,
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