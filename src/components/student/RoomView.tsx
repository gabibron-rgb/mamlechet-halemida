import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type RefObject } from 'react';
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
import RoomCompanion from './RoomCompanion';
import PersonalRoomGuests from './PersonalRoomGuests';
import {
  COMPANION_STAGE_ORDER,
  type CompanionStage,
} from '../../data/companionWorlds';
import {
  availableStudentRooms,
  getExclusiveAchievementItem,
  type StudentRoomId,
} from '../../data/exclusiveAchievementRewards';

export type RoomViewStudent = Pick<
  StudentState,
  'id' | 'name' | 'level' | 'inventory' | 'companion'
> & {
  specialUnlocks?: StudentState['specialUnlocks'];
};

type Props = {
  student: RoomViewStudent;
  readOnly?: boolean;
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

const ROOM_SCENE_META: Record<
  StudentRoomId,
  {
    imageSrc: string;
    altHe: string;
    imageClass: string;
    overlayClass: string;
    badgeHe: string | null;
  }
> = {
  main: {
    imageSrc: '/rooms/kingdom-room.png',
    altHe: 'החדר בממלכה',
    imageClass: '',
    overlayClass: 'bg-black/5',
    badgeHe: null,
  },
  magic_room: {
    imageSrc: '/rooms/magic-room.png',
    altHe: 'חדר הקסם',
    imageClass: '',
    overlayClass: 'bg-black/5',
    badgeHe: '🪄 חדר הקסם',
  },
  hobby_room: {
    imageSrc: '/rooms/hobby-room.png',
    altHe: 'חדר התחביבים',
    imageClass: 'brightness-[0.98] saturate-[1.05]',
    overlayClass: 'bg-gradient-to-br from-sky-300/5 via-transparent to-indigo-950/10',
    badgeHe: '🧩 חדר התחביבים',
  },
  wonder_hall: {
    imageSrc: '/rooms/wonder-hall-room.png',
    altHe: 'היכל הפלאות',
    imageClass: '',
    overlayClass: 'bg-black/5',
    badgeHe: '🌟 היכל הפלאות',
  },
  treasure_gallery: {
    imageSrc: '/rooms/treasure-gallery-room.png',
    altHe: 'גלריית האוצרות',
    imageClass: 'brightness-[0.9] saturate-[1.15]',
    overlayClass: 'bg-gradient-to-br from-yellow-300/10 via-transparent to-purple-950/15',
    badgeHe: '👑 גלריית האוצרות',
  },
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

const COMPANION_STAGE_LABEL_HE: Record<CompanionStage, string> = {
  egg: 'ביצה',
  hatchling: 'קטנטנה',
  young: 'צעירה',
  grown: 'בוגרת',
  magical: 'קסומה',
  legendary: 'אגדית',
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

function entryDisplay(
  entry: InventoryEntry,
  inventoryIndex: number,
  roomId: StudentRoomId
): DisplayItem | null {
  const entryRoomId = (entry.roomId ?? 'main') as StudentRoomId;
  if (entryRoomId !== roomId) return null;

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

  const exclusiveReward = getExclusiveAchievementItem(entry.itemId);

  if (exclusiveReward) {
    return {
      inventoryIndex,
      entry,
      itemId: entry.itemId,
      nameHe: exclusiveReward.nameHe,
      descriptionHe: exclusiveReward.descriptionHe,
      rarity: exclusiveReward.rarity,
      zone: displayZone,
      size: exclusiveReward.size,
      theme: 'achievement',
      modelRef: exclusiveReward.id,
      displayKind: exclusiveReward.displayKind,
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

  const exclusiveReward = getExclusiveAchievementItem(entry.itemId);
  if (exclusiveReward) return exclusiveReward.zones;

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
  onRemove?: () => void;
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
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="flex-1 rounded-xl bg-red-500/80 px-4 py-2 font-semibold text-white hover:bg-red-500"
            >
              הסר מהחדר
            </button>
          )}

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

function itemRoomStyle(item: DisplayItem, roomId: StudentRoomId): CSSProperties {
  const x = item.entry.roomX ?? 50;
  const y = item.entry.roomY ?? 50;

  const surface = getRoomSurface(x, y, roomId);

  const baseScale = item.entry.roomScale ?? 1;
  const rotation = item.entry.roomRotation ?? 0;
  const isFreeRoom = roomId !== 'main';
  const effectiveDisplayKind = isFreeRoom
    ? item.displayKind === 'rug'
      ? 'rug'
      : item.displayKind === 'wallDecor'
        ? 'wallDecor'
        : item.displayKind === 'furniture'
          ? 'furniture'
          : 'floorItem'
    : item.displayKind;

  const spriteData =
    ITEM_SPRITES[item.itemId] ??
    (item.modelRef ? ITEM_SPRITES[item.modelRef] : undefined);

  let spriteOffsetX = isFreeRoom ? 0 : (spriteData?.roomOffsetX ?? 0);
let spriteOffsetY = isFreeRoom ? 0 : (spriteData?.roomOffsetY ?? 0);

let spriteWidthScale = isFreeRoom ? 1 : (spriteData?.roomWidthScale ?? 1);
let spriteHeightScale = isFreeRoom ? 1 : (spriteData?.roomHeightScale ?? 1);

// התאמות מיוחדות לפי סוג מיקום.
// זה לא משנה חפצים ישנים, אלא רק חפצים שיש להם בפועל
// roomShelfOffsetY / roomFloorOffsetY / וכו' בתוך ה-sprite שלהם.
if (spriteData && !isFreeRoom) {
  if (effectiveDisplayKind === 'shelfItem') {
    spriteOffsetX = spriteData.roomShelfOffsetX ?? spriteOffsetX;
    spriteOffsetY = spriteData.roomShelfOffsetY ?? spriteOffsetY;
    spriteWidthScale = spriteData.roomShelfWidthScale ?? spriteWidthScale;
    spriteHeightScale = spriteData.roomShelfHeightScale ?? spriteHeightScale;
  }

  if (effectiveDisplayKind === 'floorItem') {
    spriteOffsetX = spriteData.roomFloorOffsetX ?? spriteOffsetX;
    spriteOffsetY = spriteData.roomFloorOffsetY ?? spriteOffsetY;
    spriteWidthScale = spriteData.roomFloorWidthScale ?? spriteWidthScale;
    spriteHeightScale = spriteData.roomFloorHeightScale ?? spriteHeightScale;
  }
}

  const spriteRotation = isFreeRoom ? 0 : (spriteData?.roomRotation ?? 0);

  let width = 90;
  let height = 90;
  let zIndex = surface.zIndex;
  let anchorY = '-50%';
  let extraTransform = '';

  if (effectiveDisplayKind === 'rug') {
    width = surface.rugWidth;
    height = surface.rugHeight;
    zIndex = surface.floorZIndex;
    anchorY = '-25%';
    extraTransform = '';
  }

  if (effectiveDisplayKind === 'wallDecor') {
    width = surface.wallWidth;
    height = surface.wallHeight;
    zIndex = surface.wallZIndex;
    anchorY = '-50%';
    extraTransform = '';
  }

  if (effectiveDisplayKind === 'tableItem') {
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

  if (effectiveDisplayKind === 'shelfItem') {
    width = surface.shelfItemWidth;
    height = surface.shelfItemHeight;
    zIndex = surface.shelfZIndex;
    anchorY = '-100%';
    extraTransform = '';
  }

  if (effectiveDisplayKind === 'floorItem') {
    width = surface.floorItemWidth;
    height = surface.floorItemHeight;
    zIndex = surface.floorZIndex;
    anchorY = '-100%';
    extraTransform = '';
  }

  if (effectiveDisplayKind === 'furniture') {
    width = surface.furnitureWidth;
    height = surface.furnitureHeight;
    zIndex = surface.furnitureZIndex;
    anchorY = '-100%';
    extraTransform = '';
  }

  let kindWidthMultiplier = 1;
  let kindHeightMultiplier = 1;
  let kindOffsetY = 0;

  if (!isFreeRoom && item.itemId === 'animals_fox_statue') {
    if (effectiveDisplayKind === 'shelfItem') {
      kindWidthMultiplier = 1.8;
      kindHeightMultiplier = 1.8;
      kindOffsetY = 12;
    }

    if (effectiveDisplayKind === 'floorItem') {
      kindWidthMultiplier = 2.6;
      kindHeightMultiplier = 2.6;
      kindOffsetY = 18;
    }
  }

  const finalWidth = width * spriteWidthScale * kindWidthMultiplier;
  const finalHeight = height * spriteHeightScale * kindHeightMultiplier;
  const finalRotation = rotation + spriteRotation;
  const finalAnchorY = isFreeRoom ? anchorY : (spriteData?.roomAnchorY ?? anchorY);

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

const WONDER_STAGE_CENTER = { x: 50, y: 79 };
const WONDER_STAGE_RADIUS = { x: 13, y: 11 };

function wonderStageDistance(item: DisplayItem): number | null {
  if (item.rarity !== 'epic' && item.rarity !== 'legendary') return null;

  const x = item.entry.roomX;
  const y = item.entry.roomY;

  if (x === null || x === undefined || y === null || y === undefined) {
    return null;
  }

  const dx = (x - WONDER_STAGE_CENTER.x) / WONDER_STAGE_RADIUS.x;
  const dy = (y - WONDER_STAGE_CENTER.y) / WONDER_STAGE_RADIUS.y;
  const distance = dx * dx + dy * dy;

  return distance <= 1 ? distance : null;
}

function findWonderStageItem(items: DisplayItem[]): DisplayItem | null {
  const candidates = items
    .map(item => ({ item, distance: wonderStageDistance(item) }))
    .filter(
      (candidate): candidate is { item: DisplayItem; distance: number } =>
        candidate.distance !== null
    )
    .sort((a, b) => {
      // אם בטעות מונחים שני פריטים על הסמל, Legendary מקבל קדימות.
      const rarityPriority =
        Number(b.item.rarity === 'legendary') - Number(a.item.rarity === 'legendary');

      if (rarityPriority !== 0) return rarityPriority;
      return a.distance - b.distance;
    });

  return candidates[0]?.item ?? null;
}

function WonderHallStageEffect({
  activeItem,
}: {
  activeItem: DisplayItem | null;
}) {
  const isLegendary = activeItem?.rarity === 'legendary';
  const isActive = activeItem !== null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[40] overflow-hidden">
      {isActive && (
        <>
          <div
            className={`absolute inset-0 animate-pulse ${
              isLegendary
                ? 'bg-[radial-gradient(circle_at_50%_78%,rgba(250,204,21,0.22),transparent_44%)]'
                : 'bg-[radial-gradient(circle_at_50%_78%,rgba(168,85,247,0.20),transparent_43%)]'
            }`}
          />

          <div
            className={`absolute left-1/2 top-[20%] h-[61%] w-[24%] -translate-x-1/2 opacity-50 blur-sm ${
              isLegendary
                ? 'bg-gradient-to-b from-yellow-100/5 via-yellow-200/20 to-yellow-300/35'
                : 'bg-gradient-to-b from-fuchsia-100/5 via-purple-300/18 to-violet-400/30'
            }`}
            style={{
              clipPath: 'polygon(45% 0%, 55% 0%, 100% 100%, 0% 100%)',
            }}
          />
        </>
      )}

      <div
        className={`absolute left-1/2 top-[79%] h-[15%] w-[28%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border transition-all duration-700 ${
          isActive
            ? isLegendary
              ? 'border-yellow-200/80 bg-yellow-300/10 shadow-[0_0_18px_rgba(253,224,71,0.75),0_0_55px_rgba(250,204,21,0.42),inset_0_0_24px_rgba(255,255,255,0.18)]'
              : 'border-fuchsia-200/75 bg-purple-400/10 shadow-[0_0_18px_rgba(216,180,254,0.70),0_0_48px_rgba(168,85,247,0.40),inset_0_0_22px_rgba(255,255,255,0.14)]'
            : 'border-sky-100/15 bg-sky-200/[0.025] shadow-[0_0_16px_rgba(125,211,252,0.10)]'
        }`}
      >
        <div
          className={`absolute inset-[9%] rounded-[50%] border ${
            isActive
              ? isLegendary
                ? 'animate-[spin_12s_linear_infinite] border-dashed border-yellow-100/70'
                : 'animate-[spin_15s_linear_infinite] border-dashed border-fuchsia-100/60'
              : 'border-white/5'
          }`}
        />
      </div>

      {isActive && (
        <div className="absolute left-1/2 top-[79%] h-[22%] w-[35%] -translate-x-1/2 -translate-y-1/2">
          {[
            ['11%', '56%', '0s'],
            ['25%', '18%', '0.45s'],
            ['48%', '4%', '0.9s'],
            ['72%', '20%', '0.2s'],
            ['88%', '55%', '0.75s'],
            ['58%', '83%', '1.1s'],
            ['34%', '78%', '0.6s'],
          ].map(([left, top, delay], index) => (
            <span
              key={`${left}-${top}`}
              className={`absolute animate-pulse text-sm ${
                isLegendary ? 'text-yellow-100' : 'text-fuchsia-100'
              }`}
              style={{ left, top, animationDelay: delay }}
            >
              {index % 2 === 0 ? '✦' : '✧'}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}


const MAGIC_ENCHANT_CENTER = { x: 70, y: 48 };
const MAGIC_ENCHANT_RADIUS = { x: 15, y: 8 };

function magicEnchantDistance(item: DisplayItem): number | null {
  // השולחן הקסום מיועד לחפץ לבחירת הילד, לא לשטיח שלם.
  if (item.displayKind === 'rug') return null;

  const x = item.entry.roomX;
  const y = item.entry.roomY;

  if (x === null || x === undefined || y === null || y === undefined) {
    return null;
  }

  const dx = (x - MAGIC_ENCHANT_CENTER.x) / MAGIC_ENCHANT_RADIUS.x;
  const dy = (y - MAGIC_ENCHANT_CENTER.y) / MAGIC_ENCHANT_RADIUS.y;
  const distance = dx * dx + dy * dy;

  return distance <= 1 ? distance : null;
}

function findMagicEnchantedItem(items: DisplayItem[]): DisplayItem | null {
  return (
    items
      .map(item => ({ item, distance: magicEnchantDistance(item) }))
      .filter(
        (candidate): candidate is { item: DisplayItem; distance: number } =>
          candidate.distance !== null
      )
      .sort((a, b) => a.distance - b.distance)[0]?.item ?? null
  );
}

function MagicRoomEnchantmentEffect({
  activeItem,
}: {
  activeItem: DisplayItem | null;
}) {
  const isActive = activeItem !== null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[40] overflow-hidden">
      <div
        className={`absolute left-[70%] top-[31%] h-[25%] w-[23%] -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-700 ${
          isActive
            ? 'animate-pulse bg-[radial-gradient(circle,rgba(196,181,253,0.22)_0%,rgba(99,102,241,0.13)_42%,transparent_72%)] shadow-[0_0_50px_rgba(139,92,246,0.22)]'
            : 'bg-[radial-gradient(circle,rgba(191,219,254,0.06)_0%,transparent_72%)]'
        }`}
      />

      <div
        className={`absolute left-[70%] top-[48%] h-[10%] w-[29%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border transition-all duration-700 ${
          isActive
            ? 'border-violet-200/65 bg-indigo-300/[0.08] shadow-[0_0_18px_rgba(196,181,253,0.55),0_0_42px_rgba(99,102,241,0.28)]'
            : 'border-violet-100/10 bg-violet-300/[0.015] shadow-[0_0_13px_rgba(167,139,250,0.06)]'
        }`}
      />

      {isActive && (
        <>
          <div className="absolute left-[70%] top-[18%] h-[31%] w-[14%] -translate-x-1/2 bg-gradient-to-b from-violet-100/0 via-indigo-200/[0.12] to-violet-300/25 blur-sm"
            style={{ clipPath: 'polygon(43% 0%, 57% 0%, 100% 100%, 0% 100%)' }}
          />

          <div className="absolute left-[70%] top-[40%] h-[26%] w-[31%] -translate-x-1/2 -translate-y-1/2">
            {[
              ['8%', '56%', '0s', '✦'],
              ['18%', '28%', '0.55s', '✧'],
              ['38%', '10%', '0.2s', '✦'],
              ['60%', '5%', '0.8s', '✧'],
              ['79%', '22%', '0.35s', '✦'],
              ['91%', '54%', '1.05s', '✧'],
              ['70%', '78%', '0.65s', '✦'],
              ['31%', '82%', '1.2s', '✧'],
            ].map(([left, top, delay, glyph]) => (
              <span
                key={`${left}-${top}`}
                className="absolute animate-pulse text-sm text-violet-100 drop-shadow-[0_0_8px_rgba(196,181,253,0.95)]"
                style={{ left, top, animationDelay: delay }}
              >
                {glyph}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
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
  companion,
  studentId,
  onItemClick,
  roomRef,
  onMoveItem,
  isEditing,
  selectedInventoryIndex,
  roomId,
}: {
  placedItems: DisplayItem[];
  companion: StudentState['companion'];
  studentId: string;
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
  roomId: StudentRoomId;
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

function freeRoomZone(item: DisplayItem): Zone {
  const allowedZones = getAllowedZones(item.entry);
  const currentZone = item.entry.placedZone;
  if (currentZone && allowedZones.includes(currentZone)) return currentZone;
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

    if (roomId !== 'main') {
      onMoveItem(
        inventoryIndex,
        Math.max(3, Math.min(97, x)),
        Math.max(5, Math.min(95, y)),
        item.entry.roomScale ?? 1,
        item.entry.roomRotation ?? 0,
        freeRoomZone(item)
      );
      return;
    }

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

  const roomMeta = ROOM_SCENE_META[roomId];
  const wonderStageItem = roomId === 'wonder_hall'
    ? findWonderStageItem(placedItems)
    : null;
  const magicEnchantedItem = roomId === 'magic_room'
    ? findMagicEnchantedItem(placedItems)
    : null;

  return (
    <div
      ref={roomRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative mx-auto aspect-[16/10] w-full max-w-6xl overflow-hidden rounded-2xl border border-yellow-300/20 bg-black shadow-2xl"
    >
      <img
        src={roomMeta.imageSrc}
        alt={roomMeta.altHe}
        className={`absolute inset-0 h-full w-full object-cover object-top ${roomMeta.imageClass}`}
        draggable={false}
      />

      <div className={`absolute inset-0 ${roomMeta.overlayClass}`} />

      {roomId === 'wonder_hall' && (
        <WonderHallStageEffect activeItem={wonderStageItem} />
      )}

      {roomId === 'magic_room' && (
        <MagicRoomEnchantmentEffect activeItem={magicEnchantedItem} />
      )}

      {roomId !== 'main' && (
        <>
          <div className="pointer-events-none absolute inset-3 rounded-xl border-2 border-yellow-300/20 shadow-[inset_0_0_30px_rgba(250,204,21,0.08)]" />
          <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full border border-yellow-200/25 bg-black/30 px-4 py-1 text-xs font-black text-yellow-100 backdrop-blur-sm">
            {roomMeta.badgeHe}
          </div>
        </>
      )}

      <RoomCompanion companion={companion} isEditing={isEditing} />
      <PersonalRoomGuests
        studentId={studentId}
        roomId={roomId}
        isEditing={isEditing}
      />

      {placedItems.map(item => {
        const isWonderStageItem =
          wonderStageItem?.inventoryIndex === item.inventoryIndex;
        const isMagicEnchantedItem =
          magicEnchantedItem?.inventoryIndex === item.inventoryIndex;
        const rarityEffect = isWonderStageItem
          ? item.rarity === 'legendary'
            ? 'drop-shadow(0 0 16px rgba(255,245,160,1)) drop-shadow(0 0 34px rgba(250,204,21,0.95)) drop-shadow(0 0 54px rgba(255,140,40,0.55))'
            : 'drop-shadow(0 0 14px rgba(233,213,255,1)) drop-shadow(0 0 30px rgba(168,85,247,0.9)) drop-shadow(0 0 46px rgba(99,102,241,0.5))'
          : isMagicEnchantedItem
            ? `${getRarityRoomEffect(item.rarity)} drop-shadow(0 0 12px rgba(224,231,255,0.95)) drop-shadow(0 0 26px rgba(139,92,246,0.82)) drop-shadow(0 0 38px rgba(59,130,246,0.42))`.trim()
            : getRarityRoomEffect(item.rarity);
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

  if (roomId !== 'main') {
    onMoveItem(
      item.inventoryIndex,
      point.x,
      point.y,
      item.entry.roomScale ?? 1,
      item.entry.roomRotation ?? 0,
      freeRoomZone(item)
    );
    return;
  }

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
                if (roomId !== 'main') {
                  onMoveItem(
                    item.inventoryIndex,
                    point.x,
                    point.y,
                    item.entry.roomScale ?? 1,
                    item.entry.roomRotation ?? 0,
                    freeRoomZone(item)
                  );
                } else {
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
            style={itemRoomStyle(item, roomId)}
          >
            <div
              className={`h-full w-full border-0 bg-transparent shadow-none ring-0 [&>*]:!h-full [&>*]:!w-full ${
                isWonderStageItem
                  ? 'animate-pulse'
                  : isMagicEnchantedItem
                    ? 'animate-[pulse_2.4s_ease-in-out_infinite]'
                    : ''
              }`}
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
  student: RoomViewStudent;
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

      return (
        getItemById(entry.itemId) ||
        COSMETIC_BY_ID[entry.itemId] ||
        getExclusiveAchievementItem(entry.itemId)
      );
    })
    .map(({ entry, inventoryIndex }) => {
      const item = getItemById(entry.itemId);
      const cosmetic = COSMETIC_BY_ID[entry.itemId];
      const exclusiveReward = getExclusiveAchievementItem(entry.itemId);

      return {
        entry,
        inventoryIndex,
        name: item?.nameHe ?? cosmetic?.nameHe ?? exclusiveReward?.nameHe ?? entry.itemId,
        description:
          item?.descriptionHe ?? cosmetic?.descHe ?? exclusiveReward?.descriptionHe ?? '',
        rarity: (item?.rarity ?? cosmetic?.rarity ?? exclusiveReward?.rarity ?? 'common') as Rarity,
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

export default function RoomView({ student, readOnly = false }: Props) {
  const updateStudent = useGameStore(s => s.updateStudent);
  const [selectedItem, setSelectedItem] = useState<DisplayItem | null>(null);
  const fullscreenRef = useRef<HTMLDivElement | null>(null);
  const roomRef = useRef<HTMLDivElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewCompanionStage, setPreviewCompanionStage] =
    useState<CompanionStage | null>(null);
  // Local development helper: expose all level-gated rooms for testing without
  // changing the student's real level or any Supabase data. Achievement-gated
  // rooms (such as the treasure gallery) still require their actual unlock.
  const roomAccessLevel = import.meta.env.DEV ? Number.MAX_SAFE_INTEGER : student.level;
  const availableRooms = availableStudentRooms(student.specialUnlocks, roomAccessLevel);
  const [requestedRoomId, setRequestedRoomId] = useState<StudentRoomId>('main');
  const activeRoom =
    availableRooms.find(room => room.id === requestedRoomId) ?? availableRooms[0];
  const activeRoomId = activeRoom?.id ?? 'main';

  useEffect(() => {
    setRequestedRoomId('main');
    setSelectedItem(null);
    setIsEditing(false);
  }, [student.id]);

  const roomCompanion =
    import.meta.env.DEV && previewCompanionStage
      ? {
          ...student.companion,
          unlocked: true,
          theme: student.companion.theme ?? ('chess' as const),
          stage: previewCompanionStage,
        }
      : student.companion;

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
    .map((entry, inventoryIndex) =>
      entryDisplay(entry, inventoryIndex, activeRoomId)
    )
    .filter((item): item is DisplayItem => item !== null);

  const activeSelectedItem =
    selectedItem === null
      ? null
      : placedItems.find(
          item => item.inventoryIndex === selectedItem.inventoryIndex
        ) ?? null;

  const wonderStageItem =
    activeRoomId === 'wonder_hall' ? findWonderStageItem(placedItems) : null;
  const magicEnchantedItem =
    activeRoomId === 'magic_room' ? findMagicEnchantedItem(placedItems) : null;

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

    const snapped = activeRoomId !== 'main'
      ? { x, y, scale: 1, rotation: 0 }
      : snapItemToRoomSurface(item.displayKind, x, y);

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
      const exclusiveReward = getExclusiveAchievementItem(entry.itemId);

      const displayKind = inferDisplayKind(
        {
          itemId: entry.itemId,
          modelRef: item?.modelRef ?? cosmetic?.id ?? exclusiveReward?.id,
          displayKind: item?.displayKind ?? exclusiveReward?.displayKind,
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

      const snapped = activeRoomId !== 'main'
        ? { x: 50, y: 55, scale: 1, rotation: 0 }
        : snapItemToRoomSurface(
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
        roomId: activeRoomId,
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
        roomId: null,
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
              {activeRoom?.emoji ?? '🏰'} {activeRoom?.nameHe ?? 'החדר הראשי'} של {student.name}
            </h2>

            <p className="text-sm text-magic-soft/70">
              {readOnly
                ? 'מצב צפייה בלבד — אפשר להסתכל על החפצים והחיה, בלי לשנות דבר בחדר.'
                : activeRoom?.descriptionHe ?? 'לחץ על חפץ כדי לראות מידע או להסיר אותו מהחדר.'}
            </p>

            {availableRooms.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {availableRooms.map(room => (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => {
                      setSelectedItem(null);
                      setIsEditing(false);
                      setRequestedRoomId(room.id);
                    }}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-black transition ${
                      activeRoomId === room.id
                        ? 'border-yellow-300/45 bg-yellow-300/15 text-yellow-100'
                        : 'border-white/10 bg-white/5 text-magic-soft/70 hover:bg-white/10'
                    }`}
                  >
                    {room.emoji} {room.shortNameHe}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={toggleFullscreen}
                className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-indigo-950 hover:bg-yellow-300"
              >
                מסך מלא
              </button>

              {!readOnly && (
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
              )}
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
          companion={roomCompanion}
          studentId={student.id}
          onItemClick={setSelectedItem}
          roomRef={roomRef}
          onMoveItem={moveItemInRoom}
          isEditing={readOnly ? false : isEditing}
          selectedInventoryIndex={
            readOnly ? null : activeSelectedItem?.inventoryIndex ?? null
          }
          roomId={activeRoomId}
        />

        {import.meta.env.DEV && !readOnly && (
          <div className="mt-3 rounded-2xl border border-dashed border-fuchsia-300/25 bg-fuchsia-500/5 p-3">
            <div className="text-center text-[11px] font-black text-fuchsia-200">
              בדיקת החיה בחדר — מקומית בלבד
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {COMPANION_STAGE_ORDER.map(stage => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => setPreviewCompanionStage(stage)}
                  className={`rounded-lg px-2 py-1.5 text-[10px] font-bold ${
                    roomCompanion.stage === stage && previewCompanionStage
                      ? 'bg-fuchsia-300 text-purple-950'
                      : 'bg-magic-bg/55 text-magic-soft'
                  }`}
                >
                  {COMPANION_STAGE_LABEL_HE[stage]}
                </button>
              ))}
            </div>
            {previewCompanionStage && (
              <button
                type="button"
                onClick={() => setPreviewCompanionStage(null)}
                className="mx-auto mt-2 block rounded-lg bg-white/5 px-3 py-1.5 text-[10px] font-bold text-magic-soft hover:bg-white/10"
              >
                חזרה לחיה האמיתית
              </button>
            )}
          </div>
        )}

        {activeRoomId === 'magic_room' && (
          <div
            className={`mt-3 rounded-2xl border px-4 py-2 text-center text-sm font-bold transition-all ${
              magicEnchantedItem
                ? 'border-violet-300/35 bg-violet-400/10 text-violet-100 shadow-[0_0_20px_rgba(139,92,246,0.12)]'
                : 'border-indigo-200/10 bg-indigo-300/5 text-indigo-100/65'
            }`}
          >
            {magicEnchantedItem
              ? `🪄 הקסם התעורר — ${magicEnchantedItem.nameHe} הוקסם.`
              : '✧ משהו בחדר הזה יודע להעיר קסם רדום בחפצים...'}
          </div>
        )}

        {activeRoomId === 'wonder_hall' && (
          <div
            className={`mt-3 rounded-2xl border px-4 py-2 text-center text-sm font-bold transition-all ${
              wonderStageItem
                ? wonderStageItem.rarity === 'legendary'
                  ? 'border-yellow-300/35 bg-yellow-300/10 text-yellow-100 shadow-[0_0_22px_rgba(250,204,21,0.12)]'
                  : 'border-fuchsia-300/30 bg-fuchsia-400/10 text-fuchsia-100 shadow-[0_0_20px_rgba(168,85,247,0.10)]'
                : 'border-sky-200/10 bg-sky-300/5 text-sky-100/65'
            }`}
          >
            {wonderStageItem
              ? `✨ ההיכל התעורר — ${wonderStageItem.nameHe} מצא מקום מיוחד.`
              : '✦ נדמה שהסמל שבמרכז ההיכל מחכה למשהו מיוחד...'}
          </div>
        )}

        <div className="mt-3 text-center text-sm text-magic-soft/70">
          {readOnly
            ? 'ביקור בחדר — זהו מצב צפייה בלבד.'
            : isEditing
              ? activeRoomId === 'wonder_hall'
                ? 'מצב עריכה פעיל: גרור חפצים למקום הרצוי. אולי שווה לנסות גם את הסמל שבמרכז ההיכל.'
                : activeRoomId === 'magic_room'
                  ? 'מצב עריכה פעיל: גרור חפצים למקום הרצוי. בחדר הקסם כדאי להתנסות קצת...'
                  : 'מצב עריכה פעיל: גרור חפצים למקום הרצוי בחדר.'
              : 'לחץ על חפץ כדי לראות מידע עליו. כדי להזיז חפצים, עבור למצב עריכה.'}
        </div>

        {!readOnly && isEditing && activeSelectedItem && (
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

      {!readOnly && isEditing && (
        <PlacementPanel
          student={student}
          onAddToRoom={addItemToRoom}
        />
      )}

      {!isEditing && selectedItem && (
        <InfoModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onRemove={
            readOnly
              ? undefined
              : () => removeFromRoom(selectedItem.inventoryIndex)
          }
        />
      )}
    </div>
  );
}
