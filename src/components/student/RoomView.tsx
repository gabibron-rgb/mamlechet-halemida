import { useRef, useState, type CSSProperties, type PointerEvent, type RefObject } from 'react';
import { getItemById, type Zone } from '../../data/items';
import { COSMETIC_BY_ID } from '../../data/cosmetics';
import { useGameStore, type InventoryEntry, type StudentState } from '../../store/useGameStore';
import { RARITY_LABEL_HE, type Rarity } from '../../data/boxes';
import RarityBadge from '../shared/RarityBadge';
import ItemSprite from './ItemSprite';
import { getRoomSurface, snapItemToRoomSurface } from '../../data/roomSurfaces';
import type { DisplayKind } from '../../data/roomSurfaces';
import { ITEM_SPRITES } from '../../data/itemSprites';
import { THEMES, type ThemeId } from '../../data/themes';

type Props = {
  student: StudentState;
};

type DisplayItem = {
  inventoryIndex: number;
  entry: InventoryEntry;
  itemId: string;
  nameHe: string;
  descriptionHe: string;
  rarity: Rarity;
  zone: Zone;
  size: 1 | 2 | 3;
  theme?: string;
  modelRef?: string;
  displayKind: DisplayKind;
};

const DISPLAY_KIND_LABEL_HE: Record<DisplayKind, string> = {
  rug: 'רצפה / שטיח',
  wallDecor: 'קיר',
  tableItem: 'שולחן',
  shelfItem: 'מדף',
  floorItem: 'רצפה',
  furniture: 'רהיט',
};

const RARITY_SCALE_LIMITS: Record<Rarity, { min: number; max: number; step: number }> = {
  common: {
    min: 0.25,
    max: 1.15,
    step: 0.1,
  },
  uncommon: {
    min: 0.25,
    max: 1.3,
    step: 0.1,
  },
  rare: {
    min: 0.25,
    max: 1.5,
    step: 0.1,
  },
  epic: {
    min: 0.25,
    max: 1.8,
    step: 0.1,
  },
  legendary: {
    min: 0.25,
    max: 2.2,
    step: 0.1,
  },
};

const EXTRA_THEME_NAMES: Record<string, string> = {
  ballet: 'בלט',
};

function themeNameOf(themeId: string): string {
  return (
    THEMES.find(theme => theme.id === themeId)?.nameHe ??
    EXTRA_THEME_NAMES[themeId] ??
    themeId
  );
}

type InferDisplayKindItem = {
  id?: string;
  itemId?: string;
  modelRef?: string;
  displayKind?: DisplayKind;
};

function inferDisplayKind(item: InferDisplayKindItem, zone: Zone | null): DisplayKind {
  const itemId = item.itemId ?? item.id ?? '';

  // שטיח חייב להישאר שטיח תמיד, גם אם הוא נמצא באזור floor.
  // אחרת הוא מקבל floorItem ונראה כמו חפץ רגיל במקום שטיח שטוח.
  if (itemId.includes('rug')) {
    return 'rug';
  }

  // קישוטי קיר תמיד צריכים להישאר קישוטי קיר.
  if (
    itemId.includes('poster') ||
    itemId.includes('banner') ||
    itemId.includes('flag')
  ) {
    return 'wallDecor';
  }

  // רהיטים גדולים לא צריכים להפוך אוטומטית לחפצי מדף/שולחן.
// חשוב: לא לבדוק itemId.includes('desk'),
// כי חפצים כמו desk_inkwell או desk_chess_crown הם לא רהיטים.
if (
  itemId.includes('chair') ||
  itemId.includes('bed') ||
  itemId.includes('bookshelf') ||
  itemId.includes('cabinet') ||
  itemId.includes('wardrobe')
) {
  return 'furniture';
}

  // עכשיו בודקים איפה החפץ מונח בפועל.
  // זה חשוב כדי שאותו חפץ יוכל לקבל התאמות שונות על שולחן / מדף / רצפה.
  if (zone === 'wall') {
    return 'wallDecor';
  }

  if (zone === 'desk') {
    return 'tableItem';
  }

  if (zone === 'shelf') {
    return 'shelfItem';
  }

  if (zone === 'floor') {
    return 'floorItem';
  }

  if (zone === 'special') {
    return 'floorItem';
  }

  // רק אם אין zone ברור, משתמשים ב-displayKind שהוגדר בפריט.
  if (item.displayKind) {
    return item.displayKind;
  }

  if (
    item.modelRef === 'cone' ||
    item.modelRef === 'sphere' ||
    item.modelRef === 'cylinder' ||
    item.modelRef === 'cube' ||
    item.modelRef === 'torus'
  ) {
    return 'shelfItem';
  }

  return 'floorItem';
}

function entryDisplay(entry: InventoryEntry, inventoryIndex: number): DisplayItem | null {
  const isInRoom =
    entry.roomX !== null &&
    entry.roomX !== undefined &&
    entry.roomY !== null &&
    entry.roomY !== undefined;

  const hasOldZonePlacement = entry.placedZone !== null && entry.placedZone !== undefined;

  if (!isInRoom && !hasOldZonePlacement) {
    return null;
  }

  const displayZone: Zone = entry.placedZone ?? 'floor';

  const item = getItemById(entry.itemId);

  if (item) {
    return {
      inventoryIndex,
      entry,
      itemId: entry.itemId,
      nameHe: item.nameHe,
      descriptionHe: item.descriptionHe,
      rarity: item.rarity as Rarity,
      zone: displayZone,
      size: item.size,
      theme: item.theme,
      modelRef: item.modelRef,
      displayKind: inferDisplayKind(item, displayZone),
    };
  }

  const cosmetic = COSMETIC_BY_ID[entry.itemId];

  if (cosmetic) {
    return {
      inventoryIndex,
      entry,
      itemId: entry.itemId,
      nameHe: cosmetic.nameHe,
      descriptionHe: cosmetic.descHe,
      rarity: cosmetic.rarity as Rarity,
      zone: displayZone,
      size: 1,
      theme: 'generic',
      modelRef: cosmetic.id,
      displayKind: inferDisplayKind(
        {
          itemId: entry.itemId,
          modelRef: cosmetic.id,
        },
        displayZone
      ),
    };
  }

  return null;
}

function getAllowedZones(entry: InventoryEntry): Zone[] {
  const item = getItemById(entry.itemId);
  if (item) return item.zones;

  const cosmetic = COSMETIC_BY_ID[entry.itemId];
  if (cosmetic) return ['special'];

  return [];
}

function InfoModal({
  item,
  onClose,
  onRemove,
}: {
  item: DisplayItem;
  onClose: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl border border-yellow-300/30 bg-magic-panel p-5 text-center shadow-2xl"
        onClick={event => event.stopPropagation()}
      >
        <div className="mx-auto mb-3 flex h-28 w-28 items-center justify-center">
          <ItemSprite
            itemId={item.itemId}
            rarity={item.rarity}
            fitWithinFrame
          />
        </div>

        <h3 className="text-xl font-bold text-white">{item.nameHe}</h3>

        <div className="mt-2 flex justify-center">
          <RarityBadge rarity={item.rarity} />
        </div>

        <p className="mt-4 text-sm text-magic-soft/80">{item.descriptionHe}</p>

        <div className="mt-2 text-xs text-magic-soft/50">
          מתאים ל: {DISPLAY_KIND_LABEL_HE[item.displayKind]}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onRemove}
            className="flex-1 rounded-xl bg-red-500/80 px-4 py-2 font-semibold text-white hover:bg-red-500"
          >
            הסר מהחדר
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/15"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}

function itemRoomStyle(item: DisplayItem): CSSProperties {
  const x = item.entry.roomX ?? 50;
  const y = item.entry.roomY ?? 50;

  const surface = getRoomSurface(x, y);

  const baseScale = item.entry.roomScale ?? 1;
  const rotation = item.entry.roomRotation ?? 0;

  const spriteData =
    ITEM_SPRITES[item.itemId] ??
    (item.modelRef ? ITEM_SPRITES[item.modelRef] : undefined);

  let spriteOffsetX = spriteData?.roomOffsetX ?? 0;
let spriteOffsetY = spriteData?.roomOffsetY ?? 0;

let spriteWidthScale = spriteData?.roomWidthScale ?? 1;
let spriteHeightScale = spriteData?.roomHeightScale ?? 1;

// התאמות מיוחדות לפי סוג מיקום.
// זה לא משנה חפצים ישנים, אלא רק חפצים שיש להם בפועל
// roomShelfOffsetY / roomFloorOffsetY / וכו' בתוך ה-sprite שלהם.
if (spriteData) {
  if (item.displayKind === 'shelfItem') {
    spriteOffsetX = spriteData.roomShelfOffsetX ?? spriteOffsetX;
    spriteOffsetY = spriteData.roomShelfOffsetY ?? spriteOffsetY;
    spriteWidthScale = spriteData.roomShelfWidthScale ?? spriteWidthScale;
    spriteHeightScale = spriteData.roomShelfHeightScale ?? spriteHeightScale;
  }

  if (item.displayKind === 'floorItem') {
    spriteOffsetX = spriteData.roomFloorOffsetX ?? spriteOffsetX;
    spriteOffsetY = spriteData.roomFloorOffsetY ?? spriteOffsetY;
    spriteWidthScale = spriteData.roomFloorWidthScale ?? spriteWidthScale;
    spriteHeightScale = spriteData.roomFloorHeightScale ?? spriteHeightScale;
  }
}

  const spriteRotation = spriteData?.roomRotation ?? 0;

  let width = 90;
  let height = 90;
  let zIndex = surface.zIndex;
  let anchorY = '-50%';
  let extraTransform = '';

  if (item.displayKind === 'rug') {
    width = surface.rugWidth;
    height = surface.rugHeight;
    zIndex = surface.floorZIndex;
    anchorY = '-25%';
    extraTransform = '';
  }

  if (item.displayKind === 'wallDecor') {
    width = surface.wallWidth;
    height = surface.wallHeight;
    zIndex = surface.wallZIndex;
    anchorY = '-50%';
    extraTransform = '';
  }

  if (item.displayKind === 'tableItem') {
  width = surface.tableItemWidth;
  height = surface.tableItemHeight;
  zIndex = surface.tableZIndex;
  anchorY = '-85%';

  // רק לוח שחמט צריך להיראות שטוח על השולחן.
  // שאר החפצים — עציץ, נר, שעון וכו' — נשארים עומדים רגיל.
  const shouldFlattenOnTable = item.itemId === 'chess-board-basic';

  extraTransform = shouldFlattenOnTable
    ? ' perspective(700px) rotateX(55deg)'
    : '';
}

  if (item.displayKind === 'shelfItem') {
    width = surface.shelfItemWidth;
    height = surface.shelfItemHeight;
    zIndex = surface.shelfZIndex;
    anchorY = '-100%';
    extraTransform = '';
  }

  if (item.displayKind === 'floorItem') {
    width = surface.floorItemWidth;
    height = surface.floorItemHeight;
    zIndex = surface.floorZIndex;
    anchorY = '-100%';
    extraTransform = '';
  }

  if (item.displayKind === 'furniture') {
    width = surface.furnitureWidth;
    height = surface.furnitureHeight;
    zIndex = surface.furnitureZIndex;
    anchorY = '-100%';
    extraTransform = '';
  }

  let kindWidthMultiplier = 1;
  let kindHeightMultiplier = 1;
  let kindOffsetY = 0;

  if (item.itemId === 'animals_fox_statue') {
    if (item.displayKind === 'shelfItem') {
      kindWidthMultiplier = 1.8;
      kindHeightMultiplier = 1.8;
      kindOffsetY = 12;
    }

    if (item.displayKind === 'floorItem') {
      kindWidthMultiplier = 2.6;
      kindHeightMultiplier = 2.6;
      kindOffsetY = 18;
    }
  }

  const finalWidth = width * spriteWidthScale * kindWidthMultiplier;
  const finalHeight = height * spriteHeightScale * kindHeightMultiplier;
  const finalRotation = rotation + spriteRotation;
  const finalAnchorY = spriteData?.roomAnchorY ?? anchorY;

  return {
    left: `calc(${x}% + ${spriteOffsetX}px)`,
    top: `calc(${y}% + ${spriteOffsetY + kindOffsetY}px)`,
    width: finalWidth,
    height: finalHeight,
    zIndex,
    transform: `translate(-50%, ${finalAnchorY}) rotate(${finalRotation}deg) scale(${baseScale})${extraTransform}`,
    transformOrigin: 'bottom center',
  };
}

function getRarityRoomEffect(rarity?: string) {
  if (rarity === 'common') {
    return '';
  }

  if (rarity === 'uncommon') {
    return 'drop-shadow(0 0 6px rgba(120, 220, 255, 0.45))';
  }

  if (rarity === 'rare') {
    return 'drop-shadow(0 0 8px rgba(255, 210, 80, 0.65)) drop-shadow(0 0 14px rgba(255, 170, 40, 0.35))';
  }

  if (rarity === 'epic') {
    return 'drop-shadow(0 0 10px rgba(180, 90, 255, 0.75)) drop-shadow(0 0 18px rgba(120, 70, 255, 0.45))';
  }

  if (rarity === 'legendary') {
    return 'drop-shadow(0 0 12px rgba(255, 230, 90, 0.9)) drop-shadow(0 0 24px rgba(255, 150, 40, 0.6))';
  }

  return '';
}

function RoomScene({
  placedItems,
  onItemClick,
  roomRef,
  onMoveItem,
  isEditing,
  selectedInventoryIndex,
}: {
  placedItems: DisplayItem[];
  onItemClick: (item: DisplayItem) => void;
  roomRef: RefObject<HTMLDivElement | null>;
  onMoveItem: (
    inventoryIndex: number,
    x: number,
    y: number,
    scale?: number,
    rotation?: number,
    zone?: Zone
  ) => void;
  isEditing: boolean;
  selectedInventoryIndex: number | null;
}) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  function displayKindForZone(zone: Zone, item?: DisplayItem): DisplayKind {
  const itemId =
    item?.entry?.itemId ??
    item?.entry?.id ??
    '';

  // חשוב: שטיח תמיד נשאר שטיח.
  // אחרת הוא מקבל floorItem כשהוא על הרצפה, ואז הוא נהרס / נעמד / משתנה כמו חפץ רגיל.
  if (itemId.includes('rug')) {
    return 'rug';
  }

  if (zone === 'wall') {
    return 'wallDecor';
  }

  if (zone === 'shelf') {
    return 'shelfItem';
  }

  if (zone === 'desk') {
    return 'tableItem';
  }

  if (zone === 'floor') {
    return 'floorItem';
  }

  if (zone === 'special') {
    return 'floorItem';
  }

  if (zone === 'petarea') {
    return 'floorItem';
  }

  return 'floorItem';
}

function chooseZoneFromPoint(item: DisplayItem, x: number, y: number): Zone {
  const allowedZones = getAllowedZones(item.entry);

  const canUseShelf = allowedZones.includes('shelf');
  const canUseDesk = allowedZones.includes('desk');
  const canUseWall = allowedZones.includes('wall');
  const canUseFloor = allowedZones.includes('floor');
  const canUsePetArea = allowedZones.includes('petarea');
  const canUseSpecial = allowedZones.includes('special');

  // מדף — רק תחום המדף עצמו, לא כל הארון
  if (canUseShelf && x >= 58 && x <= 86 && y >= 36 && y <= 68) {
    return 'shelf';
  }

  // שולחן — רק משטח השולחן, לא האוויר מעליו
  if (canUseDesk && x >= 10 && x <= 48 && y >= 55 && y <= 68) {
    return 'desk';
  }

  // אזור מיוחד — כרגע אזור עליון/מרכזי
  if (canUseSpecial && x >= 38 && x <= 68 && y >= 14 && y <= 42) {
    return 'special';
  }

  if (canUseWall && y >= 12 && y <= 66) {
    return 'wall';
  }

  if (canUsePetArea && x >= 55 && x <= 90 && y >= 68) {
    return 'petarea';
  }

  // רצפה — רק אם באמת נמצאים באזור רצפה
  if (canUseFloor && y >= 68) {
    return 'floor';
  }

  // fallback בטוח:
  // לא זורקים אוטומטית למדף/שולחן, כי זה מה שגורם לקפיצות.
  // מחזירים את האזור הנוכחי של החפץ אם הוא עדיין מותר.
  const currentZone = item.entry.placedZone;

  if (currentZone && allowedZones.includes(currentZone)) {
    return currentZone;
  }

  return allowedZones[0] ?? 'floor';
}

  function getRoomPercent(event: PointerEvent<HTMLButtonElement>) {
    const room = roomRef.current;
    if (!room) return null;

    const rect = room.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    return {
      x: Math.max(3, Math.min(97, x)),
      y: Math.max(5, Math.min(95, y)),
    };
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    if (!isEditing) return;
    event.preventDefault();
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    if (!isEditing) return;
    event.preventDefault();

    const inventoryIndexText = event.dataTransfer.getData('inventoryIndex');
    const inventoryIndex = Number(inventoryIndexText);

    if (Number.isNaN(inventoryIndex)) return;

    const item = placedItems.find(
      placedItem => placedItem.inventoryIndex === inventoryIndex
    );

    if (!item) return;

    const rect = event.currentTarget.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const zone = chooseZoneFromPoint(item, x, y);
    const displayKind = item.displayKind === 'rug' ? 'rug' : displayKindForZone(zone);

    const snapped = snapItemToRoomSurface(displayKind, x, y);

    onMoveItem(
      inventoryIndex,
      snapped.x,
      snapped.y,
      item.entry.roomScale ?? 1,
      item.entry.roomRotation ?? 0,
      zone
    );
  }

  return (
    <div
      ref={roomRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative mx-auto aspect-[16/10] w-full max-w-6xl overflow-hidden rounded-2xl border border-yellow-300/20 bg-black shadow-2xl"
    >
      <img
        src="/rooms/kingdom-room.png"
        alt="החדר בממלכה"
        className="absolute inset-0 h-full w-full object-cover object-top"
        draggable={false}
      />

      <div className="absolute inset-0 bg-black/5" />

      {placedItems.map(item => {
        const rarityEffect = getRarityRoomEffect(item.rarity);
        const isSelected =
          isEditing && selectedInventoryIndex === item.inventoryIndex;

        return (
          <button
            key={`${item.inventoryIndex}-${item.itemId}`}
            type="button"
            title={item.nameHe}
            onClick={() => {
              if (draggingIndex === null) {
                onItemClick(item);
              }
            }}
            onPointerDown={event => {
              if (!isEditing) return;

              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);
              setDraggingIndex(item.inventoryIndex);
            }}
            onPointerMove={event => {
  if (!isEditing) return;
  if (draggingIndex !== item.inventoryIndex) return;

  const point = getRoomPercent(event);
  if (!point) return;

  const zone = chooseZoneFromPoint(item, point.x, point.y);

  const displayKind =
    item.displayKind === 'rug' ? 'rug' : displayKindForZone(zone, item);

  const snapped = snapItemToRoomSurface(displayKind, point.x, point.y);

  onMoveItem(
    item.inventoryIndex,
    snapped.x,
    snapped.y,
    item.entry.roomScale ?? 1,
    item.entry.roomRotation ?? 0,
    zone
  );
}}
            onPointerUp={event => {
              if (!isEditing) return;

              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }

              const point = getRoomPercent(event);

              if (point) {
                const zone = chooseZoneFromPoint(item, point.x, point.y);
                const displayKind =
                  item.displayKind === 'rug' ? 'rug' : displayKindForZone(zone);

                const snapped = snapItemToRoomSurface(
                  displayKind,
                  point.x,
                  point.y
                );

                onMoveItem(
                  item.inventoryIndex,
                  snapped.x,
                  snapped.y,
                  item.entry.roomScale ?? 1,
                  item.entry.roomRotation ?? 0,
                  zone
                );
              }

              setDraggingIndex(null);
            }}
            className={`absolute select-none touch-none border-0 bg-transparent p-0 shadow-none outline-none ${
              isSelected
                ? 'rounded-xl ring-2 ring-yellow-300 ring-offset-2 ring-offset-transparent drop-shadow-[0_0_14px_rgba(250,204,21,0.9)]'
                : 'ring-0'
            } ${
              isEditing ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
            }`}
            style={itemRoomStyle(item)}
          >
            <div
              className="h-full w-full border-0 bg-transparent shadow-none ring-0 [&>*]:!h-full [&>*]:!w-full"
              style={{
                filter: rarityEffect || undefined,
              }}
            >
              <ItemSprite itemId={item.itemId} rarity={item.rarity} />
            </div>
          </button>
        );
      })}
    </div>
  );
}

function PlacementPanel({
  student,
  onAddToRoom,
}: {
  student: StudentState;
  onAddToRoom: (inventoryIndex: number) => void;
}) {
  const [themeFilter, setThemeFilter] = useState('all');
  const [rarityFilter, setRarityFilter] = useState<'all' | Rarity>('all');

  const unplaced = student.inventory
    .map((entry, inventoryIndex) => ({ entry, inventoryIndex }))
    .filter(({ entry }) => {
      if (entry.kind === 'box') return false;

      const alreadyInRoom =
        entry.roomX !== null &&
        entry.roomX !== undefined &&
        entry.roomY !== null &&
        entry.roomY !== undefined;

      if (alreadyInRoom) return false;

      return getItemById(entry.itemId) || COSMETIC_BY_ID[entry.itemId];
    })
    .map(({ entry, inventoryIndex }) => {
      const item = getItemById(entry.itemId);
      const cosmetic = COSMETIC_BY_ID[entry.itemId];

      return {
        entry,
        inventoryIndex,
        name: item?.nameHe ?? cosmetic?.nameHe ?? entry.itemId,
        description: item?.descriptionHe ?? cosmetic?.descHe ?? '',
        rarity: (item?.rarity ?? cosmetic?.rarity ?? 'common') as Rarity,
        themeId: item?.theme ?? null,
      };
    });

  if (unplaced.length === 0) {
    return null;
  }

  const themeOptions = [
    ...new Set(
      unplaced
        .map(item => item.themeId)
        .filter((themeId): themeId is ThemeId => themeId !== null)
    ),
  ].sort((a, b) => themeNameOf(a).localeCompare(themeNameOf(b), 'he'));

  const visibleItems = unplaced.filter(item => {
    if (themeFilter !== 'all' && item.themeId !== themeFilter) return false;
    if (rarityFilter !== 'all' && item.rarity !== rarityFilter) return false;
    return true;
  });

  const hasActiveFilters = themeFilter !== 'all' || rarityFilter !== 'all';

  function resetFilters() {
    setThemeFilter('all');
    setRarityFilter('all');
  }

  return (
    <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white">
            חפצים שאפשר להוסיף לחדר
          </h3>
          <div className="text-xs text-magic-soft/55">
            מוצגים {visibleItems.length} מתוך {unplaced.length}
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-lg border border-magic-accent/30 px-3 py-1.5 text-xs font-bold text-magic-accent hover:bg-magic-accent/10"
          >
            איפוס
          </button>
        )}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="text-xs font-bold text-magic-soft/65">
          נושא
          <select
            value={themeFilter}
            onChange={event => setThemeFilter(event.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-magic-bg px-3 py-2 text-sm text-white outline-none focus:border-magic-accent/60"
          >
            <option value="all">כל הנושאים</option>
            {themeOptions.map(themeId => (
              <option key={themeId} value={themeId}>
                {themeNameOf(themeId)}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs font-bold text-magic-soft/65">
          נדירות
          <select
            value={rarityFilter}
            onChange={event =>
              setRarityFilter(event.target.value as 'all' | Rarity)
            }
            className="mt-1 w-full rounded-xl border border-white/10 bg-magic-bg px-3 py-2 text-sm text-white outline-none focus:border-magic-accent/60"
          >
            <option value="all">כל הנדירויות</option>
            {(Object.keys(RARITY_LABEL_HE) as Rarity[]).map(rarity => (
              <option key={rarity} value={rarity}>
                {RARITY_LABEL_HE[rarity]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visibleItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-black/10 px-4 py-8 text-center">
          <div className="mb-2 text-3xl">🔎</div>
          <div className="font-bold text-white">אין חפצים שמתאימים לסינון</div>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-3 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/15"
          >
            הצג את כל החפצים
          </button>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map(
            ({ entry, inventoryIndex, name, description, rarity }) => (
            <div
              key={`${inventoryIndex}-${entry.itemId}`}
              className="rounded-2xl border border-white/10 bg-black/20 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-white">{name}</div>
                  <div className="mt-1 text-xs text-magic-soft/70">{description}</div>
                </div>

                <RarityBadge rarity={rarity} />
              </div>

              <button
                type="button"
                onClick={() => onAddToRoom(inventoryIndex)}
                className="mt-3 rounded-lg bg-indigo-500/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                הוסף לחדר
              </button>
            </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default function RoomView({ student }: Props) {
  const updateStudent = useGameStore(s => s.updateStudent);
  const [selectedItem, setSelectedItem] = useState<DisplayItem | null>(null);
  const fullscreenRef = useRef<HTMLDivElement | null>(null);
  const roomRef = useRef<HTMLDivElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  function toggleFullscreen() {
    const el = fullscreenRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  const placedItems = student.inventory
    .map((entry, inventoryIndex) => entryDisplay(entry, inventoryIndex))
    .filter((item): item is DisplayItem => item !== null);

  const activeSelectedItem =
    selectedItem === null
      ? null
      : placedItems.find(
          item => item.inventoryIndex === selectedItem.inventoryIndex
        ) ?? null;

  function resizeItemInRoom(inventoryIndex: number, direction: 'up' | 'down') {
    const item = placedItems.find(
      placedItem => placedItem.inventoryIndex === inventoryIndex
    );

    if (!item) return;

    const limits = RARITY_SCALE_LIMITS[item.rarity];
    const currentScale = item.entry.roomScale ?? 1;

    const nextScale =
      direction === 'up'
        ? currentScale + limits.step
        : currentScale - limits.step;

    const clampedScale = Math.max(
      limits.min,
      Math.min(limits.max, nextScale)
    );

    if (clampedScale === currentScale) return;

    const nextInventory = student.inventory.map((entry, idx) => {
      if (idx !== inventoryIndex) return entry;

      return {
        ...entry,
        roomScale: Number(clampedScale.toFixed(2)),
      };
    });

    updateStudent(student.id, {
      inventory: nextInventory,
    });
  }

  function rotateItemInRoom(inventoryIndex: number, direction: 'left' | 'right') {
    const item = placedItems.find(
      placedItem => placedItem.inventoryIndex === inventoryIndex
    );

    if (!item) return;

    const currentRotation = item.entry.roomRotation ?? 0;

    const nextRotation =
      direction === 'right'
        ? currentRotation + 15
        : currentRotation - 15;

    const normalizedRotation =
      ((nextRotation + 180) % 360) - 180;

    const nextInventory = student.inventory.map((entry, idx) => {
      if (idx !== inventoryIndex) return entry;

      return {
        ...entry,
        roomRotation: normalizedRotation,
      };
    });

    updateStudent(student.id, {
      inventory: nextInventory,
    });
  }

  function resetItemTransform(inventoryIndex: number) {
    const item = placedItems.find(
      placedItem => placedItem.inventoryIndex === inventoryIndex
    );

    if (!item) return;

    const x = item.entry.roomX ?? 50;
    const y = item.entry.roomY ?? 70;

    const snapped = snapItemToRoomSurface(
      item.displayKind,
      x,
      y
    );

    const nextInventory = student.inventory.map((entry, idx) => {
      if (idx !== inventoryIndex) return entry;

      return {
        ...entry,
        roomScale: snapped.scale ?? 1,
        roomRotation: snapped.rotation ?? 0,
      };
    });

    updateStudent(student.id, {
      inventory: nextInventory,
    });
  }

  function moveItemInRoom(
    inventoryIndex: number,
    x: number,
    y: number,
    scale?: number,
    rotation?: number,
    zone?: Zone
  ) {
    const nextInventory = student.inventory.map((entry, idx) => {
      if (idx !== inventoryIndex) return entry;

      return {
        ...entry,
        placedZone: zone ?? entry.placedZone,
        roomX: x,
        roomY: y,
        roomScale: scale ?? entry.roomScale ?? 1,
        roomRotation: rotation ?? entry.roomRotation ?? 0,
      };
    });

    updateStudent(student.id, {
      inventory: nextInventory,
    });
  }

  function addItemToRoom(inventoryIndex: number) {
    const nextInventory = student.inventory.map((entry, idx) => {
      if (idx !== inventoryIndex) return entry;

      const allowedZones = getAllowedZones(entry);

      const defaultZone: Zone =
        allowedZones.includes('shelf') ? 'shelf' :
        allowedZones.includes('desk') ? 'desk' :
        allowedZones.includes('wall') ? 'wall' :
        allowedZones.includes('floor') ? 'floor' :
        allowedZones.includes('petarea') ? 'petarea' :
        allowedZones.includes('special') ? 'special' :
        allowedZones[0] ?? 'floor';

      const item = getItemById(entry.itemId);
      const cosmetic = COSMETIC_BY_ID[entry.itemId];

      const displayKind = inferDisplayKind(
        {
          itemId: entry.itemId,
          modelRef: item?.modelRef ?? cosmetic?.id,
          displayKind: item?.displayKind,
        },
        defaultZone
      );

      const startPoint =
        displayKind === 'rug'
          ? { x: 50, y: 88 }
          : displayKind === 'wallDecor'
            ? { x: 50, y: 30 }
            : displayKind === 'shelfItem'
              ? { x: 72, y: 48 }
              : displayKind === 'tableItem'
                ? { x: 30, y: 63 }
                : displayKind === 'furniture'
                  ? { x: 50, y: 78 }
                  : { x: 50, y: 76 };

      const snapped = snapItemToRoomSurface(
        displayKind,
        startPoint.x,
        startPoint.y
      );

      return {
        ...entry,
        placedZone: entry.placedZone ?? defaultZone,
        placedSlot: entry.placedSlot ?? 0,
        roomX: entry.roomX ?? snapped.x,
        roomY: entry.roomY ?? snapped.y,
        roomScale: entry.roomScale ?? snapped.scale ?? 1,
        roomRotation: entry.roomRotation ?? snapped.rotation ?? 0,
      };
    });

    updateStudent(student.id, {
      inventory: nextInventory,
    });
  }

  function removeFromRoom(inventoryIndex: number) {
    const nextInventory = student.inventory.map((entry, idx) => {
      if (idx !== inventoryIndex) return entry;

      return {
        ...entry,
        placedZone: null,
        placedSlot: null,
        roomX: null,
        roomY: null,
        roomScale: undefined,
        roomRotation: undefined,
      };
    });

    updateStudent(student.id, {
      inventory: nextInventory,
    });

    setSelectedItem(null);
  }

  return (
    <div
      ref={fullscreenRef}
      dir="rtl"
      className="space-y-5 overflow-y-auto p-2 [scrollbar-gutter:stable] [&:fullscreen]:h-screen [&:fullscreen]:max-h-screen [&:fullscreen]:overflow-y-auto [&:fullscreen]:bg-magic-bg [&:fullscreen]:p-4"
    >
      <div className="rounded-3xl border border-white/10 bg-magic-panel/70 p-4 shadow-xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-white">
              הממלכה של {student.name}
            </h2>

            <p className="text-sm text-magic-soft/70">
              לחץ על חפץ כדי לראות מידע או להסיר אותו מהחדר.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={toggleFullscreen}
                className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-indigo-950 hover:bg-yellow-300"
              >
                מסך מלא
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedItem(null);
                  setIsEditing(prev => !prev);
                }}
                className={`rounded-xl px-4 py-2 text-sm font-bold ${
                  isEditing
                    ? 'bg-green-400 text-indigo-950 hover:bg-green-300'
                    : 'bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                {isEditing ? 'סיים עריכה' : 'ערוך חדר'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-magic-soft">
            חפצים מוצבים:{' '}
            <span dir="ltr" className="font-bold text-white">
              {placedItems.length}
            </span>
          </div>
        </div>

        <RoomScene
          placedItems={placedItems}
          onItemClick={setSelectedItem}
          roomRef={roomRef}
          onMoveItem={moveItemInRoom}
          isEditing={isEditing}
          selectedInventoryIndex={activeSelectedItem?.inventoryIndex ?? null}
        />

        <div className="mt-3 text-center text-sm text-magic-soft/70">
          {isEditing
            ? 'מצב עריכה פעיל: גרור חפצים למקום הרצוי בחדר.'
            : 'לחץ על חפץ כדי לראות מידע עליו. כדי להזיז חפצים, עבור למצב עריכה.'}
        </div>

        {isEditing && activeSelectedItem && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="text-sm font-semibold text-white">
              עריכת חפץ: {activeSelectedItem.nameHe}
            </div>

            <button
              type="button"
              onClick={() => removeFromRoom(activeSelectedItem.inventoryIndex)}
              className="rounded-xl bg-red-700/70 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
            >
              הסר מהחדר
            </button>

            <button
              type="button"
              onClick={() =>
                resizeItemInRoom(activeSelectedItem.inventoryIndex, 'down')
              }
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/15"
            >
              הקטן
            </button>

            <button
              type="button"
              onClick={() =>
                resizeItemInRoom(activeSelectedItem.inventoryIndex, 'up')
              }
              className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-indigo-950 hover:bg-yellow-300"
            >
              הגדל
            </button>

            <button
              type="button"
              onClick={() =>
                rotateItemInRoom(activeSelectedItem.inventoryIndex, 'left')
              }
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/15"
            >
              סובב שמאלה
            </button>

            <button
              type="button"
              onClick={() =>
                rotateItemInRoom(activeSelectedItem.inventoryIndex, 'right')
              }
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/15"
            >
              סובב ימינה
            </button>

            <button
              type="button"
              onClick={() =>
                resetItemTransform(activeSelectedItem.inventoryIndex)
              }
              className="rounded-xl bg-red-500/70 px-4 py-2 text-sm font-bold text-white hover:bg-red-500"
            >
              אפס גודל/סיבוב
            </button>

            <div className="text-xs text-magic-soft/70" dir="ltr">
              size: {(activeSelectedItem.entry.roomScale ?? 1).toFixed(2)} / max:{' '}
              {RARITY_SCALE_LIMITS[activeSelectedItem.rarity].max} | rotation:{' '}
              {activeSelectedItem.entry.roomRotation ?? 0}°
            </div>
          </div>
        )}
      </div>

      {isEditing && (
        <PlacementPanel
          student={student}
          onAddToRoom={addItemToRoom}
        />
      )}

      {!isEditing && selectedItem && (
        <InfoModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onRemove={() => removeFromRoom(selectedItem.inventoryIndex)}
        />
      )}
    </div>
  );
}
