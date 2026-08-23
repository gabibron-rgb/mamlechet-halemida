import type { Zone } from './items';

export type DisplayKind =
  | 'rug'
  | 'wallDecor'
  | 'tableItem'
  | 'shelfItem'
  | 'floorItem'
  | 'furniture';

export type RoomLayoutId = 'main' | 'treasure_gallery';

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

export type RoomZoneRegion = {
  zone: Zone;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  labelHe: string;
};

const MAIN_ROOM_ZONE_REGIONS: RoomZoneRegion[] = [
  { zone: 'shelf', xMin: 58, xMax: 86, yMin: 36, yMax: 68, labelHe: 'מדפים' },
  { zone: 'desk', xMin: 10, xMax: 48, yMin: 55, yMax: 68, labelHe: 'שולחן' },
  { zone: 'special', xMin: 38, xMax: 68, yMin: 14, yMax: 42, labelHe: 'מיוחד' },
  { zone: 'wall', xMin: 4, xMax: 96, yMin: 12, yMax: 66, labelHe: 'קיר' },
  { zone: 'petarea', xMin: 55, xMax: 90, yMin: 68, yMax: 94, labelHe: 'חיות' },
  { zone: 'floor', xMin: 12, xMax: 88, yMin: 68, yMax: 90, labelHe: 'רצפה' },
];

const TREASURE_GALLERY_ZONE_REGIONS: RoomZoneRegion[] = [];

export function getRoomZoneRegions(roomId: RoomLayoutId = 'main'): RoomZoneRegion[] {
  return roomId === 'treasure_gallery'
    ? TREASURE_GALLERY_ZONE_REGIONS
    : MAIN_ROOM_ZONE_REGIONS;
}

function pointInsideRegion(region: RoomZoneRegion, x: number, y: number): boolean {
  return x >= region.xMin && x <= region.xMax && y >= region.yMin && y <= region.yMax;
}

export function chooseRoomZone(
  allowedZones: Zone[],
  currentZone: Zone | null | undefined,
  x: number,
  y: number,
  roomId: RoomLayoutId = 'main',
): Zone {
  // בגלריית האוצרות אין אזורי הצבה בכלל. אנחנו שומרים zone רק כמטא־דאטה
  // לצורך תאימות, אך המיקום עצמו חופשי ולא משתנה לפי הקואורדינטות.
  if (roomId === 'treasure_gallery') {
    if (currentZone && allowedZones.includes(currentZone)) return currentZone;
    return allowedZones[0] ?? 'floor';
  }

  const regions = getRoomZoneRegions(roomId);

  // סדר הרשימה חשוב: אזורים פיזיים קטנים (מדף / במה / נישה) מקבלים
  // קדימות על פני קיר ורצפה כלליים שנמצאים מאחוריהם.
  for (const region of regions) {
    if (allowedZones.includes(region.zone) && pointInsideRegion(region, x, y)) {
      return region.zone;
    }
  }

  if (currentZone && allowedZones.includes(currentZone)) {
    return currentZone;
  }

  return allowedZones[0] ?? 'floor';
}

export function getDefaultRoomPoint(
  zone: Zone,
  roomId: RoomLayoutId = 'main',
): { x: number; y: number } {
  if (roomId === 'treasure_gallery') {
    return { x: 50, y: 55 };
  }

  if (zone === 'wall') return { x: 50, y: 36 };
  if (zone === 'desk') return { x: 28, y: 65 };
  if (zone === 'shelf') return { x: 72, y: 54.9 };
  if (zone === 'special') return { x: 52, y: 34 };
  if (zone === 'petarea') return { x: 72, y: 82 };
  return { x: 46, y: 82 };
}

export function getRoomSurface(
  _x: number,
  y: number,
  roomId: RoomLayoutId = 'main',
): RoomSurface {
  // y נמוך יותר במסך = רחוק יותר; y גבוה יותר = קרוב יותר לשחקן.
  // בגלריה הרצפה מעט עמוקה יותר, לכן הפריטים הרחוקים מקבלים הקטנה עדינה.
  const depthScale = roomId === 'treasure_gallery'
    ? 1
    : y < 45 ? 0.75 : y < 65 ? 0.9 : 1.1;

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
  y: number,
  roomId: RoomLayoutId = 'main',
  zone?: Zone,
): {
  x: number;
  y: number;
  scale: number;
  rotation: number;
} {
  if (roomId === 'treasure_gallery') {
    // Free Placement: אין snap, אין מדפים ואין מגבלות אזוריות.
    // רק שומרים את החפץ בתוך גבולות התמונה.
    return {
      x: Math.max(3, Math.min(97, x)),
      y: Math.max(5, Math.min(95, y)),
      scale: 1,
      rotation: 0,
    };
  }

  if (zone === 'special') {
    return {
      x: Math.max(40, Math.min(66, x)),
      y: Math.max(18, Math.min(42, y)),
      scale: 0.95,
      rotation: 0,
    };
  }

  if (zone === 'petarea') {
    return {
      x: Math.max(58, Math.min(88, x)),
      y: Math.max(70, Math.min(90, y)),
      scale: 1,
      rotation: 0,
    };
  }

  // קישוטי קיר — רוב הקיר המרכזי
  if (displayKind === 'wallDecor') {
    return {
      x: Math.max(14, Math.min(86, x)),
      y: Math.max(18, Math.min(66, y)),
      scale: 0.9,
      rotation: 0,
    };
  }

  // מדפים — הארון בצד ימין, עם הצמדה למדפים עצמם
  if (displayKind === 'shelfItem') {
    const shelfX = Math.max(60, Math.min(80, x));
    const shelves = [
      { y: 43.5, scale: 0.58 },
      { y: 54.9, scale: 0.58 },
      { y: 66.5, scale: 0.58 },
      { y: 77.5, scale: 0.56 },
    ];

    const nearestShelf = shelves.reduce((closest, shelf) =>
      Math.abs(y - shelf.y) < Math.abs(y - closest.y) ? shelf : closest,
    shelves[0]);

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
