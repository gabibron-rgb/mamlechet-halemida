
export type DisplayKind =
  | 'rug'
  | 'wallDecor'
  | 'tableItem'
  | 'shelfItem'
  | 'floorItem'
  | 'furniture';

export type RoomSurface = {
  zIndex: number;

  rugWidth: number;
  rugHeight: number;

  wallWidth: number;
  wallHeight: number;

  tableItemWidth: number;
  tableItemHeight: number;

  shelfItemWidth: number;
  shelfItemHeight: number;

  floorItemWidth: number;
  floorItemHeight: number;

  furnitureWidth: number;
  furnitureHeight: number;

  wallZIndex: number;
  shelfZIndex: number;
  tableZIndex: number;
  floorZIndex: number;
  furnitureZIndex: number;
};

export function getRoomSurface(x: number, y: number): RoomSurface {
  // y נמוך יותר במסך = רחוק יותר; y גבוה יותר = קרוב יותר לשחקן
  const depthScale = y < 45 ? 0.75 : y < 65 ? 0.9 : 1.1;

  return {
    zIndex: Math.round(y * 10),

    rugWidth: 430 * depthScale,
    rugHeight: 105 * depthScale,

    wallWidth: 90 * depthScale,
    wallHeight: 90 * depthScale,

    tableItemWidth: 105 * depthScale,
    tableItemHeight: 80 * depthScale,

    shelfItemWidth: 78 * depthScale,
    shelfItemHeight: 58 * depthScale,

    floorItemWidth: 85 * depthScale,
    floorItemHeight: 85 * depthScale,

    furnitureWidth: 150 * depthScale,
    furnitureHeight: 170 * depthScale,

    wallZIndex: 100,
    shelfZIndex: 200,
    tableZIndex: 350,
    floorZIndex: Math.round(500 + y),
    furnitureZIndex: Math.round(450 + y),
  };
}

export function snapItemToRoomSurface(
  displayKind: DisplayKind,
  x: number,
  y: number
): {
  x: number;
  y: number;
  scale: number;
  rotation: number;
} {
  // קישוטי קיר — רוב הקיר המרכזי
  if (displayKind === 'wallDecor') {
  return {
    x: Math.max(14, Math.min(86, x)),
    y: Math.max(18, Math.min(66, y)),
    scale: 0.9,
    rotation: 0,
  };
  }

  // מדפים — הארון בצד ימין
  // מדפים — הארון בצד ימין, עם הצמדה למדפים עצמם
// מדפים — הארון בצד ימין, עם הצמדה למדפים עצמם
// מדפים — הארון בצד ימין, הצמדה למדפים עצמם
if (displayKind === 'shelfItem') {
  const shelfX = Math.max(60, Math.min(80, x));

  const shelves = [
    { y: 43.5, scale: 0.58 }, // מדף עליון
    { y: 54.9, scale: 0.58 }, // מדף שני
    { y: 66.5, scale: 0.58 }, // מדף שלישי
    { y: 77.5, scale: 0.56 }, // מדף תחתון
  ];

  const nearestShelf = shelves.reduce((closest, shelf) => {
    return Math.abs(y - shelf.y) < Math.abs(y - closest.y) ? shelf : closest;
  }, shelves[0]);

  return {
    x: shelfX,
    y: nearestShelf.y,
    scale: nearestShelf.scale,
    rotation: 0,
  };
}

  // שולחן — השולחן בצד שמאל
  if (displayKind === 'tableItem') {
    return {
      x: Math.max(14, Math.min(42, x)),
      y: Math.max(60, Math.min(70, y)),
      scale: 0.8,
      rotation: 0,
    };
  }

  // שטיחים — רצפה בלבד
  if (displayKind === 'rug') {
  return {
    x: Math.max(34, Math.min(70, x)),
    y: Math.max(81, Math.min(90, y)),
    scale: 1.15,
    rotation: 0,
  };
}

  // רהיטים — רצפה, אבל לא על השולחן/מדף
  if (displayKind === 'furniture') {
    return {
      x: Math.max(12, Math.min(88, x)),
      y: Math.max(62, Math.min(88, y)),
      scale: 1.05,
      rotation: 0,
    };
  }

  // חפצי רצפה רגילים
  return {
    x: Math.max(12, Math.min(88, x)),
    y: Math.max(68, Math.min(90, y)),
    scale: 1,
    rotation: 0,
  };
}