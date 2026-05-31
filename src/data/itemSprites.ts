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
  roomOffsetY: 2,
  roomWidthScale: 1.75,
  roomHeightScale: 1.75,
};

const chessClock: ItemSpriteData = {
  src: '/assets/items/chess-clock.png',
  alt: 'שעון שחמט',
  className:
    'object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.28)]',

  roomOffsetX: 0,
  roomOffsetY: 12,
  roomWidthScale: 1.05,
  roomHeightScale: 1.05,
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

const chessPawn: ItemSpriteData = {
  src: '/assets/items/chess-pawn.png',
  alt: 'פיון שחמט',
  className: 'object-contain drop-shadow-[0_6px_8px_rgba(0,0,0,0.35)]',

  roomOffsetY: 26,
  roomWidthScale: 1.7,
  roomHeightScale: 1.7,
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
};