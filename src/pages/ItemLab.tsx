import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import { ITEMS } from '../data/items';
import type { Item, Zone } from '../data/items';
import { ITEM_SPRITES } from '../data/itemSprites';
import type { ItemSpriteData } from '../data/itemSprites';
import {
  RARITY_COLOR,
  RARITY_LABEL_HE,
} from '../data/boxes';
import type { Rarity } from '../data/boxes';
import { getRoomSurface, snapItemToRoomSurface } from '../data/roomSurfaces';
import type { DisplayKind } from '../data/roomSurfaces';
import type { ThemeId } from '../data/themes';

const LAB_THEMES: Array<{ id: ThemeId; nameHe: string }> = [
  { id: 'generic', nameHe: 'כללי' },
  { id: 'chess', nameHe: 'שחמט' },
  { id: 'space', nameHe: 'חלל' },
  { id: 'animals', nameHe: 'חיות' },
  { id: 'sports', nameHe: 'ספורט' },
];

const RARITIES: Rarity[] = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
];

const TARGET_BY_RARITY: Record<Rarity, number> = {
  common: 8,
  uncommon: 5,
  rare: 4,
  epic: 2,
  legendary: 1,
};

const ITEM_LAB_STORAGE_KEY = 'mamlechet-halemida:item-lab:v1';

const ZONE_LABEL_HE: Record<Zone, string> = {
  wall: 'קיר',
  floor: 'רצפה',
  shelf: 'מדף',
  desk: 'שולחן',
  special: 'אזור מיוחד',
  petarea: 'אזור חיות',
};

const PREVIEW_POINT: Record<Zone, { x: number; y: number }> = {
  wall: { x: 50, y: 36 },
  desk: { x: 28, y: 65 },
  shelf: { x: 72, y: 54.9 },
  floor: { x: 46, y: 82 },
  special: { x: 52, y: 34 },
  petarea: { x: 72, y: 82 },
};

type PreviewPoint = { x: number; y: number };

function previewPositionKey(itemId: string, zone: Zone): string {
  return `${itemId}:${zone}`;
}

function choosePreviewZone(
  item: Item,
  currentZone: Zone,
  x: number,
  y: number,
): Zone {
  const allowedZones = item.zones;

  if (
    allowedZones.includes('shelf') &&
    x >= 58 &&
    x <= 86 &&
    y >= 36 &&
    y <= 68
  ) {
    return 'shelf';
  }

  if (
    allowedZones.includes('desk') &&
    x >= 10 &&
    x <= 48 &&
    y >= 55 &&
    y <= 68
  ) {
    return 'desk';
  }

  if (
    allowedZones.includes('special') &&
    x >= 38 &&
    x <= 68 &&
    y >= 14 &&
    y <= 42
  ) {
    return 'special';
  }

  if (allowedZones.includes('wall') && y >= 12 && y <= 66) {
    return 'wall';
  }

  if (
    allowedZones.includes('petarea') &&
    x >= 55 &&
    x <= 90 &&
    y >= 68
  ) {
    return 'petarea';
  }

  if (allowedZones.includes('floor') && y >= 68) {
    return 'floor';
  }

  if (allowedZones.includes(currentZone)) return currentZone;
  return allowedZones[0] ?? 'floor';
}

type NumericSpriteKey =
  | 'roomOffsetX'
  | 'roomOffsetY'
  | 'roomWidthScale'
  | 'roomHeightScale'
  | 'roomRotation'
  | 'roomShelfOffsetX'
  | 'roomShelfOffsetY'
  | 'roomShelfWidthScale'
  | 'roomShelfHeightScale'
  | 'roomFloorOffsetX'
  | 'roomFloorOffsetY'
  | 'roomFloorWidthScale'
  | 'roomFloorHeightScale';

type ControlDefinition = {
  key: NumericSpriteKey;
  label: string;
  min: number;
  max: number;
  step: number;
};

type SavedLabState = {
  drafts: Record<string, ItemSpriteData>;
  editedItemIds: string[];
};

const BASE_CONTROLS: ControlDefinition[] = [
  { key: 'roomOffsetX', label: 'הזזה אופקית', min: -80, max: 80, step: 1 },
  { key: 'roomOffsetY', label: 'הזזה אנכית', min: -80, max: 100, step: 1 },
  { key: 'roomWidthScale', label: 'רוחב', min: 0.3, max: 4, step: 0.05 },
  { key: 'roomHeightScale', label: 'גובה', min: 0.3, max: 4, step: 0.05 },
];

const SHELF_CONTROLS: ControlDefinition[] = [
  { key: 'roomShelfOffsetX', label: 'הזזה אופקית במדף', min: -80, max: 80, step: 1 },
  { key: 'roomShelfOffsetY', label: 'הזזה אנכית במדף', min: -80, max: 100, step: 1 },
  { key: 'roomShelfWidthScale', label: 'רוחב במדף', min: 0.3, max: 4, step: 0.05 },
  { key: 'roomShelfHeightScale', label: 'גובה במדף', min: 0.3, max: 4, step: 0.05 },
];

const FLOOR_CONTROLS: ControlDefinition[] = [
  { key: 'roomFloorOffsetX', label: 'הזזה אופקית ברצפה', min: -80, max: 80, step: 1 },
  { key: 'roomFloorOffsetY', label: 'הזזה אנכית ברצפה', min: -80, max: 120, step: 1 },
  { key: 'roomFloorWidthScale', label: 'רוחב ברצפה', min: 0.3, max: 4, step: 0.05 },
  { key: 'roomFloorHeightScale', label: 'גובה ברצפה', min: 0.3, max: 4, step: 0.05 },
];

const ROTATION_CONTROL: ControlDefinition = {
  key: 'roomRotation',
  label: 'סיבוב',
  min: -180,
  max: 180,
  step: 1,
};

const NUMERIC_KEYS: NumericSpriteKey[] = [
  'roomOffsetX',
  'roomOffsetY',
  'roomWidthScale',
  'roomHeightScale',
  'roomRotation',
  'roomShelfOffsetX',
  'roomShelfOffsetY',
  'roomShelfWidthScale',
  'roomShelfHeightScale',
  'roomFloorOffsetX',
  'roomFloorOffsetY',
  'roomFloorWidthScale',
  'roomFloorHeightScale',
];

const TEXT_SPRITE_KEYS = [
  'src',
  'alt',
  'className',
  'roomAnchorY',
] as const;

function spriteDraftsMatch(
  savedDraft: ItemSpriteData,
  codeDraft: ItemSpriteData,
): boolean {
  const textValuesMatch = TEXT_SPRITE_KEYS.every(
    key => savedDraft[key] === codeDraft[key],
  );
  const numericValuesMatch = NUMERIC_KEYS.every(
    key => savedDraft[key] === codeDraft[key],
  );

  return textValuesMatch && numericValuesMatch;
}

function spriteForItem(item: Item): ItemSpriteData | undefined {
  return ITEM_SPRITES[item.id] ?? ITEM_SPRITES[item.modelRef];
}

function createSpriteDraft(item: Item): ItemSpriteData {
  const existing = spriteForItem(item);

  if (existing) {
    return { ...existing };
  }

  return {
    src: `/assets/items/${item.id.replace(/_/g, '-')}.png`,
    alt: item.nameHe,
    className:
      'object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.30)]',
  };
}

function createDefaultDrafts(items: Item[]): Record<string, ItemSpriteData> {
  return Object.fromEntries(
    items.map(item => [item.id, createSpriteDraft(item)]),
  );
}

function loadSavedLabState(items: Item[]): SavedLabState {
  const defaultDrafts = createDefaultDrafts(items);

  try {
    const savedText = window.localStorage.getItem(ITEM_LAB_STORAGE_KEY);
    if (!savedText) {
      return { drafts: defaultDrafts, editedItemIds: [] };
    }

    const saved = JSON.parse(savedText) as Partial<SavedLabState>;
    const savedDrafts: Record<string, ItemSpriteData> =
      saved.drafts && typeof saved.drafts === 'object' ? saved.drafts : {};
    const validItemIds = new Set(items.map(item => item.id));
    const savedEditedItemIds = Array.isArray(saved.editedItemIds)
      ? saved.editedItemIds.filter(
          (id): id is string => typeof id === 'string' && validItemIds.has(id),
        )
      : [];

    const editedItemIds = savedEditedItemIds.filter(id => {
      const savedDraft = savedDrafts[id];
      const codeDraft = defaultDrafts[id];

      if (!savedDraft || !codeDraft) return false;
      return !spriteDraftsMatch(savedDraft, codeDraft);
    });

    const pendingDrafts = Object.fromEntries(
      editedItemIds.map(id => [
        id,
        { ...defaultDrafts[id], ...savedDrafts[id] },
      ]),
    );

    return {
      // רק שינויים שעדיין שונים מהקוד מקבלים עדיפות על ITEM_SPRITES.
      // כך שמירה ישנה בדפדפן לא מסתירה עדכון שכבר הוטמע בקובץ.
      drafts: { ...defaultDrafts, ...pendingDrafts },
      editedItemIds,
    };
  } catch {
    return { drafts: defaultDrafts, editedItemIds: [] };
  }
}

function displayKindForZone(item: Item, zone: Zone): DisplayKind {
  if (item.displayKind === 'rug' || item.id.includes('rug')) {
    return 'rug';
  }

  if (zone === 'wall') return 'wallDecor';
  if (zone === 'desk') return 'tableItem';
  if (zone === 'shelf') return 'shelfItem';
  return 'floorItem';
}

function effectiveNumber(
  draft: ItemSpriteData,
  key: NumericSpriteKey,
): number {
  const directValue = draft[key];
  if (typeof directValue === 'number') return directValue;

  if (key === 'roomShelfOffsetX' || key === 'roomFloorOffsetX') {
    return draft.roomOffsetX ?? 0;
  }

  if (key === 'roomShelfOffsetY' || key === 'roomFloorOffsetY') {
    return draft.roomOffsetY ?? 0;
  }

  if (key === 'roomShelfWidthScale' || key === 'roomFloorWidthScale') {
    return draft.roomWidthScale ?? 1;
  }

  if (key === 'roomShelfHeightScale' || key === 'roomFloorHeightScale') {
    return draft.roomHeightScale ?? 1;
  }

  if (key === 'roomWidthScale' || key === 'roomHeightScale') return 1;
  return 0;
}

function controlsForZone(zone: Zone): ControlDefinition[] {
  if (zone === 'shelf') return [...SHELF_CONTROLS, ROTATION_CONTROL];

  if (zone === 'floor' || zone === 'special' || zone === 'petarea') {
    return [...FLOOR_CONTROLS, ROTATION_CONTROL];
  }

  return [...BASE_CONTROLS, ROTATION_CONTROL];
}

function getRarityEffect(rarity: Rarity): string | undefined {
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

  return undefined;
}

function previewStyle(
  item: Item,
  zone: Zone,
  draft: ItemSpriteData,
  point: PreviewPoint,
): CSSProperties {
  const { x, y } = point;
  const surface = getRoomSurface(x, y);
  const displayKind = displayKindForZone(item, zone);

  let spriteOffsetX = draft.roomOffsetX ?? 0;
  let spriteOffsetY = draft.roomOffsetY ?? 0;
  let spriteWidthScale = draft.roomWidthScale ?? 1;
  let spriteHeightScale = draft.roomHeightScale ?? 1;

  if (displayKind === 'shelfItem') {
    spriteOffsetX = draft.roomShelfOffsetX ?? spriteOffsetX;
    spriteOffsetY = draft.roomShelfOffsetY ?? spriteOffsetY;
    spriteWidthScale = draft.roomShelfWidthScale ?? spriteWidthScale;
    spriteHeightScale = draft.roomShelfHeightScale ?? spriteHeightScale;
  }

  if (displayKind === 'floorItem') {
    spriteOffsetX = draft.roomFloorOffsetX ?? spriteOffsetX;
    spriteOffsetY = draft.roomFloorOffsetY ?? spriteOffsetY;
    spriteWidthScale = draft.roomFloorWidthScale ?? spriteWidthScale;
    spriteHeightScale = draft.roomFloorHeightScale ?? spriteHeightScale;
  }

  let width = 90;
  let height = 90;
  let zIndex = surface.zIndex;
  let anchorY = '-50%';
  let extraTransform = '';

  if (displayKind === 'rug') {
    width = surface.rugWidth;
    height = surface.rugHeight;
    zIndex = surface.floorZIndex;
    anchorY = '-25%';
  }

  if (displayKind === 'wallDecor') {
    width = surface.wallWidth;
    height = surface.wallHeight;
    zIndex = surface.wallZIndex;
    anchorY = '-50%';
  }

  if (displayKind === 'tableItem') {
    width = surface.tableItemWidth;
    height = surface.tableItemHeight;
    zIndex = surface.tableZIndex;
    anchorY = '-85%';

    if (item.id === 'chess-board-basic') {
      extraTransform = ' perspective(700px) rotateX(55deg)';
    }
  }

  if (displayKind === 'shelfItem') {
    width = surface.shelfItemWidth;
    height = surface.shelfItemHeight;
    zIndex = surface.shelfZIndex;
    anchorY = '-100%';
  }

  if (displayKind === 'floorItem') {
    width = surface.floorItemWidth;
    height = surface.floorItemHeight;
    zIndex = surface.floorZIndex;
    anchorY = '-100%';
  }

  let kindWidthMultiplier = 1;
  let kindHeightMultiplier = 1;
  let kindOffsetY = 0;

  if (item.id === 'animals_fox_statue') {
    if (displayKind === 'shelfItem') {
      kindWidthMultiplier = 1.8;
      kindHeightMultiplier = 1.8;
      kindOffsetY = 12;
    }

    if (displayKind === 'floorItem') {
      kindWidthMultiplier = 2.6;
      kindHeightMultiplier = 2.6;
      kindOffsetY = 18;
    }
  }

  return {
    left: `calc(${x}% + ${spriteOffsetX}px)`,
    top: `calc(${y}% + ${spriteOffsetY + kindOffsetY}px)`,
    width: width * spriteWidthScale * kindWidthMultiplier,
    height: height * spriteHeightScale * kindHeightMultiplier,
    zIndex,
    transform: `translate(-50%, ${draft.roomAnchorY ?? anchorY}) rotate(${draft.roomRotation ?? 0}deg)${extraTransform}`,
    transformOrigin: 'bottom center',
    filter: getRarityEffect(item.rarity),
  };
}

function camelCaseId(id: string): string {
  return id.replace(/[-_](\w)/g, (_, letter: string) => letter.toUpperCase());
}

function escapeSingleQuotes(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function spriteDefinitionCode(item: Item, draft: ItemSpriteData): string {
  const lines = [
    `const ${camelCaseId(item.id)}: ItemSpriteData = {`,
    `  src: '${escapeSingleQuotes(draft.src)}',`,
    `  alt: '${escapeSingleQuotes(draft.alt)}',`,
  ];

  if (draft.className) {
    lines.push(`  className: '${escapeSingleQuotes(draft.className)}',`);
  }

  for (const key of NUMERIC_KEYS) {
    const value = draft[key];
    if (typeof value === 'number') {
      lines.push(`  ${key}: ${Number(value.toFixed(2))},`);
    }
  }

  if (draft.roomAnchorY) {
    lines.push(`  roomAnchorY: '${escapeSingleQuotes(draft.roomAnchorY)}',`);
  }

  lines.push('};');
  return lines.join('\n');
}

function spriteMappingLine(item: Item): string {
  const mappingKey = /^[A-Za-z_$][\w$]*$/.test(item.id)
    ? item.id
    : `'${escapeSingleQuotes(item.id)}'`;

  return `  ${mappingKey}: ${camelCaseId(item.id)},`;
}

function spriteCode(item: Item, draft: ItemSpriteData): string {
  return [
    spriteDefinitionCode(item, draft),
    '',
    '// בתוך ITEM_SPRITES:',
    spriteMappingLine(item),
  ].join('\n');
}

function allEditedSpriteCode(
  items: Item[],
  drafts: Record<string, ItemSpriteData>,
): string {
  const definitions = items.map(item =>
    spriteDefinitionCode(item, drafts[item.id] ?? createSpriteDraft(item)),
  );
  const mappings = items.map(spriteMappingLine);

  return [
    '// הגדרות ItemSpriteData לכל החפצים שנערכו',
    '',
    definitions.join('\n\n'),
    '',
    '// את השורות הבאות יש להוסיף בתוך ITEM_SPRITES',
    ...mappings,
  ].join('\n');
}

function itemImageClass(draft: ItemSpriteData): string {
  const className = draft.className ?? '';
  const hasObjectClass =
    className.includes('object-fill') ||
    className.includes('object-cover') ||
    className.includes('object-contain');

  return `h-full w-full select-none ${hasObjectClass ? '' : 'object-contain'} ${className}`;
}

export default function ItemLab() {
  const boxItems = useMemo(
    () => ITEMS.filter(item => item.source === 'box'),
    [],
  );

  const [theme, setTheme] = useState<ThemeId>('generic');
  const visibleItems = useMemo(
    () => boxItems.filter(item => item.theme === theme),
    [boxItems, theme],
  );

  const [selectedItemId, setSelectedItemId] = useState(
    () => boxItems.find(item => item.theme === 'generic')?.id ?? '',
  );
  const [selectedZone, setSelectedZone] = useState<Zone>('desk');
  const initialLabState = useMemo(() => loadSavedLabState(boxItems), [boxItems]);
  const [drafts, setDrafts] = useState<Record<string, ItemSpriteData>>(
    () => initialLabState.drafts,
  );
  const [editedItemIds, setEditedItemIds] = useState<string[]>(
    () => initialLabState.editedItemIds,
  );
  const [assetErrors, setAssetErrors] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const previewRoomRef = useRef<HTMLDivElement | null>(null);
  const [previewPositions, setPreviewPositions] = useState<
    Record<string, PreviewPoint>
  >({});
  const [isPreviewDragging, setIsPreviewDragging] = useState(false);

  const selectedItem =
    visibleItems.find(item => item.id === selectedItemId) ?? visibleItems[0];

  const selectedDraft = selectedItem
    ? drafts[selectedItem.id] ?? createSpriteDraft(selectedItem)
    : null;

  const selectedPreviewPosition = selectedItem
    ? previewPositions[previewPositionKey(selectedItem.id, selectedZone)] ??
      PREVIEW_POINT[selectedZone]
    : PREVIEW_POINT.floor;

  useEffect(() => {
    if (!visibleItems.some(item => item.id === selectedItemId)) {
      setSelectedItemId(visibleItems[0]?.id ?? '');
    }
  }, [selectedItemId, visibleItems]);

  useEffect(() => {
    if (!selectedItem) return;

    if (!selectedItem.zones.includes(selectedZone)) {
      setSelectedZone(selectedItem.zones[0] ?? 'floor');
    }
  }, [selectedItem, selectedZone]);

  useEffect(() => {
    if (!selectedItem || drafts[selectedItem.id]) return;

    setDrafts(current => ({
      ...current,
      [selectedItem.id]: createSpriteDraft(selectedItem),
    }));
  }, [drafts, selectedItem]);

  useEffect(() => {
    const state: SavedLabState = { drafts, editedItemIds };
    window.localStorage.setItem(ITEM_LAB_STORAGE_KEY, JSON.stringify(state));
  }, [drafts, editedItemIds]);

  const duplicateIds = useMemo(() => {
    const counts = new Map<string, number>();
    ITEMS.forEach(item => counts.set(item.id, (counts.get(item.id) ?? 0) + 1));
    return [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([id]) => id);
  }, []);

  const missingSprites = visibleItems.filter(item => !spriteForItem(item));
  const visibleAssetErrors = assetErrors.filter(id =>
    visibleItems.some(item => item.id === id),
  );
  const editedItems = boxItems.filter(item => editedItemIds.includes(item.id));

  const totalTarget = RARITIES.reduce(
    (sum, rarity) => sum + TARGET_BY_RARITY[rarity],
    0,
  );

  function reportAsset(itemId: string, failed: boolean) {
    setAssetErrors(current => {
      if (failed) {
        return current.includes(itemId) ? current : [...current, itemId];
      }

      if (!current.includes(itemId)) return current;
      return current.filter(id => id !== itemId);
    });
  }

  function movePreviewItem(event: PointerEvent<HTMLButtonElement>) {
    if (!selectedItem) return;

    const room = previewRoomRef.current;
    if (!room) return;

    const rect = room.getBoundingClientRect();
    const rawX = ((event.clientX - rect.left) / rect.width) * 100;
    const rawY = ((event.clientY - rect.top) / rect.height) * 100;
    const x = Math.max(3, Math.min(97, rawX));
    const y = Math.max(5, Math.min(95, rawY));

    const zone = choosePreviewZone(selectedItem, selectedZone, x, y);
    const displayKind = displayKindForZone(selectedItem, zone);
    const snapped = snapItemToRoomSurface(displayKind, x, y);

    setSelectedZone(zone);
    setPreviewPositions(current => ({
      ...current,
      [previewPositionKey(selectedItem.id, zone)]: {
        x: snapped.x,
        y: snapped.y,
      },
    }));
  }

  function resetPreviewPosition() {
    if (!selectedItem) return;

    const key = previewPositionKey(selectedItem.id, selectedZone);
    setPreviewPositions(current => {
      if (!(key in current)) return current;

      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function updateDraftNumber(key: NumericSpriteKey, value: number) {
    if (!selectedItem) return;

    setDrafts(current => ({
      ...current,
      [selectedItem.id]: {
        ...(current[selectedItem.id] ?? createSpriteDraft(selectedItem)),
        [key]: value,
      },
    }));
    setEditedItemIds(current =>
      current.includes(selectedItem.id)
        ? current
        : [...current, selectedItem.id],
    );
    setCopied(false);
    setCopiedAll(false);
  }

  function resetZoneOverrides() {
    if (!selectedItem) return;

    const keysToReset =
      selectedZone === 'shelf'
        ? SHELF_CONTROLS.map(control => control.key)
        : selectedZone === 'floor' ||
            selectedZone === 'special' ||
            selectedZone === 'petarea'
          ? FLOOR_CONTROLS.map(control => control.key)
          : BASE_CONTROLS.map(control => control.key);

    setDrafts(current => {
      const nextDraft = {
        ...(current[selectedItem.id] ?? createSpriteDraft(selectedItem)),
      };

      keysToReset.forEach(key => {
        delete nextDraft[key];
      });

      return { ...current, [selectedItem.id]: nextDraft };
    });
    setEditedItemIds(current =>
      current.includes(selectedItem.id)
        ? current
        : [...current, selectedItem.id],
    );
    setCopied(false);
    setCopiedAll(false);
  }

  async function copyCurrentCode() {
    if (!selectedItem || !selectedDraft) return;

    await navigator.clipboard.writeText(spriteCode(selectedItem, selectedDraft));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function copyAllEditedCode() {
    if (editedItems.length === 0) return;

    await navigator.clipboard.writeText(allEditedSpriteCode(editedItems, drafts));
    setCopiedAll(true);
    window.setTimeout(() => setCopiedAll(false), 1600);
  }

  function downloadAllEditedCode() {
    if (editedItems.length === 0) return;

    const code = allEditedSpriteCode(editedItems, drafts);
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'item-sprite-changes.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function clearSavedChanges() {
    if (editedItems.length > 0) {
      const shouldClear = window.confirm(
        'למחוק את כל הכיוונים שנשמרו במעבדת החפצים?',
      );
      if (!shouldClear) return;
    }

    setDrafts(createDefaultDrafts(boxItems));
    setEditedItemIds([]);
    setCopied(false);
    setCopiedAll(false);
    window.localStorage.removeItem(ITEM_LAB_STORAGE_KEY);
  }

  return (
    <main className="min-h-screen bg-[#120d25] px-4 py-6 text-white md:px-8" dir="rtl">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-3xl border border-violet-300/20 bg-violet-950/40 p-5 shadow-2xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="text-xs font-bold tracking-[0.24em] text-violet-300">
                LOCAL DEVELOPMENT ONLY
              </div>
              <h1 className="mt-1 text-3xl font-black">מעבדת החפצים</h1>
              <p className="mt-2 text-sm text-violet-100/70">
                בדיקת מאגר הקופסאות וכיוון Sprites ללא כניסה לתלמיד וללא Supabase.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {LAB_THEMES.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTheme(option.id)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                    theme === option.id
                      ? 'bg-violet-500 text-white'
                      : 'bg-white/5 text-violet-100/70 hover:bg-white/10'
                  }`}
                >
                  {option.nameHe}
                </button>
              ))}
            </div>
          </div>
        </header>

        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          {RARITIES.map(rarity => {
            const current = visibleItems.filter(item => item.rarity === rarity).length;
            const target = TARGET_BY_RARITY[rarity];
            const complete = current === target;

            return (
              <div
                key={rarity}
                className={`rounded-2xl border p-4 ${
                  complete
                    ? 'border-emerald-400/35 bg-emerald-500/10'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <div
                  className="text-xs font-bold"
                  style={{ color: RARITY_COLOR[rarity] }}
                >
                  {RARITY_LABEL_HE[rarity]}
                </div>
                <div className="mt-1 text-2xl font-black">
                  {current}/{target}
                </div>
                <div className="mt-1 text-xs text-white/50">
                  {complete ? 'היעד הושלם' : `חסרים ${Math.max(0, target - current)}`}
                </div>
              </div>
            );
          })}
        </section>

        <section className="mb-6 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm text-white/60">חפצי קופסה בנושא</div>
            <div className="mt-1 text-2xl font-black">
              {visibleItems.length}/{totalTarget}
            </div>
          </div>
          <div
            className={`rounded-2xl border p-4 ${
              missingSprites.length === 0
                ? 'border-emerald-400/30 bg-emerald-500/10'
                : 'border-amber-400/40 bg-amber-500/10'
            }`}
          >
            <div className="text-sm text-white/60">חסרים ב־ITEM_SPRITES</div>
            <div className="mt-1 text-2xl font-black">{missingSprites.length}</div>
            {missingSprites.length > 0 && (
              <div className="mt-2 break-words text-xs text-amber-200">
                {missingSprites.map(item => item.id).join(', ')}
              </div>
            )}
          </div>
          <div
            className={`rounded-2xl border p-4 ${
              duplicateIds.length === 0 && visibleAssetErrors.length === 0
                ? 'border-emerald-400/30 bg-emerald-500/10'
                : 'border-red-400/40 bg-red-500/10'
            }`}
          >
            <div className="text-sm text-white/60">שגיאות מזהה/קובץ</div>
            <div className="mt-1 text-2xl font-black">
              {duplicateIds.length + visibleAssetErrors.length}
            </div>
            {duplicateIds.length > 0 && (
              <div className="mt-2 break-words text-xs text-red-200">
                מזהים כפולים: {duplicateIds.join(', ')}
              </div>
            )}
            {visibleAssetErrors.length > 0 && (
              <div className="mt-2 break-words text-xs text-red-200">
                קבצים חסרים: {visibleAssetErrors.join(', ')}
              </div>
            )}
          </div>
          <div
            className={`rounded-2xl border p-4 ${
              editedItems.length > 0
                ? 'border-fuchsia-400/40 bg-fuchsia-500/10'
                : 'border-white/10 bg-white/5'
            }`}
          >
            <div className="text-sm text-white/60">חפצים שנערכו ונשמרו</div>
            <div className="mt-1 text-2xl font-black">{editedItems.length}</div>
            <div className="mt-1 text-xs text-white/45">נשמרים גם אחרי רענון</div>
          </div>
        </section>

        <section className="mb-6 flex flex-col justify-between gap-4 rounded-3xl border border-fuchsia-300/20 bg-fuchsia-950/20 p-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-black">ייצוא מרוכז של השינויים</h2>
            <p className="mt-1 text-sm text-white/55">
              הכיוון נשמר בדפדפן, אך קובץ itemSprites.ts אינו משתנה עד להעתקת הקוד.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyAllEditedCode}
              disabled={editedItems.length === 0}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-black text-emerald-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-35"
            >
              {copiedAll
                ? 'כל הקוד הועתק ✓'
                : `העתק הכול (${editedItems.length})`}
            </button>
            <button
              type="button"
              onClick={downloadAllEditedCode}
              disabled={editedItems.length === 0}
              className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-black text-white hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-35"
            >
              הורד קובץ שינויים
            </button>
            <button
              type="button"
              onClick={clearSavedChanges}
              className="rounded-xl bg-white/5 px-4 py-2 text-sm font-bold text-white/60 hover:bg-white/10"
            >
              נקה שמירה מקומית
            </button>
          </div>
        </section>

        <section className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">חפצי הקופסה</h2>
            <div className="text-sm text-white/50">לחיצה על חפץ פותחת אותו לכיוון</div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {visibleItems.map(item => {
              const draft = drafts[item.id] ?? createSpriteDraft(item);
              const isSelected = selectedItem?.id === item.id;
              const hasSprite = !!spriteForItem(item);
              const isEdited = editedItemIds.includes(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItemId(item.id)}
                  className={`rounded-2xl border p-3 text-right transition ${
                    isSelected
                      ? 'border-violet-300 bg-violet-500/20 ring-2 ring-violet-400/30'
                      : 'border-white/10 bg-black/20 hover:border-white/25 hover:bg-white/5'
                  }`}
                >
                  <div className="mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-black/25 p-3">
                    <img
                      src={draft.src}
                      alt={draft.alt}
                      className={itemImageClass(draft)}
                      draggable={false}
                      onError={() => reportAsset(item.id, true)}
                      onLoad={() => reportAsset(item.id, false)}
                    />
                  </div>
                  <div className="truncate font-bold">{item.nameHe}</div>
                  <div className="mt-1 truncate text-[11px] text-white/45">{item.id}</div>
                  {isEdited && (
                    <div className="mt-2 inline-flex rounded-full bg-fuchsia-500/20 px-2 py-0.5 text-[10px] font-bold text-fuchsia-200">
                      נערך ונשמר
                    </div>
                  )}
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span
                      className="text-xs font-bold"
                      style={{ color: RARITY_COLOR[item.rarity] }}
                    >
                      {RARITY_LABEL_HE[item.rarity]}
                    </span>
                    <span className={hasSprite ? 'text-emerald-300' : 'text-amber-300'}>
                      {hasSprite ? '✓' : '!'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {selectedItem && selectedDraft && (
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(330px,0.8fr)]">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <h2 className="text-2xl font-black">{selectedItem.nameHe}</h2>
                  <div className="mt-1 text-sm text-white/50">{selectedItem.id}</div>
                  <div className="mt-2 text-xs text-emerald-200/80">
                    גררי את החפץ בחדר. הוא ייצמד ויעבור בין האזורים המותרים כמו בחדר התלמידים.
                  </div>
                </div>

                <div className="flex flex-col items-start gap-2 md:items-end">
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.zones.map(zone => (
                      <button
                        key={zone}
                        type="button"
                        onClick={() => setSelectedZone(zone)}
                        className={`rounded-xl px-3 py-2 text-sm font-bold ${
                          selectedZone === zone
                            ? 'bg-fuchsia-500 text-white'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {ZONE_LABEL_HE[zone]}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={resetPreviewPosition}
                    className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold text-white/60 hover:bg-white/10"
                  >
                    איפוס מיקום הבדיקה
                  </button>
                </div>
              </div>

              <div
                ref={previewRoomRef}
                className="relative mx-auto aspect-[16/10] w-full max-w-5xl overflow-hidden rounded-2xl border border-yellow-300/20 bg-black shadow-2xl"
              >
                <img
                  src="/rooms/kingdom-room.png"
                  alt="חדר בדיקה"
                  className="absolute inset-0 h-full w-full object-cover object-top"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-black/5" />
                <button
                  type="button"
                  aria-label={`גרירת ${selectedItem.nameHe} בחדר הבדיקה`}
                  onPointerDown={event => {
                    event.preventDefault();
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setIsPreviewDragging(true);
                    movePreviewItem(event);
                  }}
                  onPointerMove={event => {
                    if (isPreviewDragging) movePreviewItem(event);
                  }}
                  onPointerUp={event => {
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                      event.currentTarget.releasePointerCapture(event.pointerId);
                    }
                    movePreviewItem(event);
                    setIsPreviewDragging(false);
                  }}
                  onPointerCancel={() => setIsPreviewDragging(false)}
                  onLostPointerCapture={() => setIsPreviewDragging(false)}
                  className={`absolute touch-none select-none border-0 bg-transparent p-0 shadow-none outline-none ring-2 ring-yellow-300/80 ring-offset-2 ring-offset-transparent ${
                    isPreviewDragging
                      ? 'cursor-grabbing drop-shadow-[0_0_14px_rgba(250,204,21,0.9)]'
                      : 'cursor-grab'
                  }`}
                  style={previewStyle(
                    selectedItem,
                    selectedZone,
                    selectedDraft,
                    selectedPreviewPosition,
                  )}
                >
                  <img
                    src={selectedDraft.src}
                    alt={selectedDraft.alt}
                    className={itemImageClass(selectedDraft)}
                    draggable={false}
                    onError={() => reportAsset(selectedItem.id, true)}
                    onLoad={() => reportAsset(selectedItem.id, false)}
                  />
                </button>

                <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg border border-white/10 bg-black/65 px-3 py-2 text-left text-xs text-white/75" dir="ltr">
                  x: {selectedPreviewPosition.x.toFixed(1)} · y: {selectedPreviewPosition.y.toFixed(1)}
                  <span className="ml-2 text-fuchsia-200" dir="rtl">
                    {ZONE_LABEL_HE[selectedZone]}
                  </span>
                </div>
              </div>
            </div>

            <aside className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black">כיוון: {ZONE_LABEL_HE[selectedZone]}</h2>
                  <p className="mt-1 text-xs text-white/50">
                    השינויים נשמרים מקומית גם אחרי רענון, אך אינם משנים את קובצי הקוד.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetZoneOverrides}
                  className="rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-white/60 hover:bg-white/10"
                >
                  איפוס אזור
                </button>
              </div>

              <div className="mt-5 space-y-5">
                {controlsForZone(selectedZone).map(control => {
                  const value = effectiveNumber(selectedDraft, control.key);

                  return (
                    <label key={control.key} className="block">
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <span className="font-bold text-white/80">{control.label}</span>
                        <input
                          type="number"
                          min={control.min}
                          max={control.max}
                          step={control.step}
                          value={value}
                          onChange={event => {
                            const nextValue = Number(event.target.value);
                            if (Number.isFinite(nextValue)) {
                              updateDraftNumber(control.key, nextValue);
                            }
                          }}
                          className="w-20 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-left text-sm text-white outline-none focus:border-violet-400"
                          dir="ltr"
                        />
                      </div>
                      <input
                        type="range"
                        min={control.min}
                        max={control.max}
                        step={control.step}
                        value={value}
                        onChange={event => {
                          const nextValue = Number(event.target.value);
                          if (Number.isFinite(nextValue)) {
                            updateDraftNumber(control.key, nextValue);
                          }
                        }}
                        className="w-full accent-violet-500"
                        dir="ltr"
                      />
                    </label>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={copyCurrentCode}
                className="mt-6 w-full rounded-xl bg-emerald-500 px-4 py-3 font-black text-emerald-950 hover:bg-emerald-400"
              >
                {copied ? 'הקוד הועתק ✓' : 'העתק ItemSpriteData'}
              </button>

              <pre className="mt-4 max-h-72 overflow-auto rounded-xl bg-black/40 p-3 text-left text-[11px] leading-5 text-emerald-100" dir="ltr">
                {spriteCode(selectedItem, selectedDraft)}
              </pre>
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}
