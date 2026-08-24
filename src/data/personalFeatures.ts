export type PersonalFeatureType =
  | 'personal_guest'
  | 'avatar'
  | 'effect'
  | 'special_item';

export type PersonalGuestMovement = 'ground' | 'flying' | 'static';
export type PersonalGuestFacing = 'left' | 'right';
export type PersonalGuestRoomId = 'main' | 'hobby_room' | 'treasure_gallery';

export type PersonalGuestConfig = {
  name?: string;
  imageSrc: string;
  movement?: PersonalGuestMovement;
  baseFacing?: PersonalGuestFacing;
  scale?: number;
  showName?: boolean;
  roomIds?: PersonalGuestRoomId[];
  startX?: number;
  startY?: number;
  yOffsetPx?: number;
  shadowScale?: number;
  /** Optional full-body frame animation for personal guests. */
  idleFrames?: string[];
  runFrames?: string[];
  idleFrameDurationMs?: number;
  runFrameDurationMs?: number;
};

export type PersonalFeature = {
  id: string;
  studentId: string;
  featureType: PersonalFeatureType;
  featureKey: string;
  enabled: boolean;
  config: Record<string, unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringArray(value: unknown, maxItems = 16): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map(item => item.trim())
    .slice(0, maxItems);
  return items.length > 0 ? items : undefined;
}

export function personalGuestConfigFromFeature(
  feature: PersonalFeature
): PersonalGuestConfig | null {
  if (feature.featureType !== 'personal_guest') return null;
  if (!isRecord(feature.config)) return null;

  const imageSrc = feature.config.imageSrc;
  if (typeof imageSrc !== 'string' || !imageSrc.trim()) return null;

  const movement = feature.config.movement;
  const baseFacing = feature.config.baseFacing;
  const roomIds = feature.config.roomIds;

  return {
    imageSrc: imageSrc.trim(),
    name:
      typeof feature.config.name === 'string' && feature.config.name.trim()
        ? feature.config.name.trim()
        : undefined,
    movement:
      movement === 'flying' || movement === 'static' || movement === 'ground'
        ? movement
        : 'ground',
    baseFacing:
      baseFacing === 'right' || baseFacing === 'left' ? baseFacing : 'left',
    scale:
      typeof feature.config.scale === 'number'
        ? Math.max(0.35, Math.min(2.5, feature.config.scale))
        : 1,
    showName:
      typeof feature.config.showName === 'boolean'
        ? feature.config.showName
        : true,
    roomIds: Array.isArray(roomIds)
      ? roomIds.filter(
          (roomId): roomId is PersonalGuestRoomId =>
            roomId === 'main' ||
            roomId === 'hobby_room' ||
            roomId === 'treasure_gallery'
        )
      : ['main'],
    startX:
      typeof feature.config.startX === 'number'
        ? Math.max(7, Math.min(93, feature.config.startX))
        : undefined,
    startY:
      typeof feature.config.startY === 'number'
        ? Math.max(20, Math.min(97, feature.config.startY))
        : undefined,
    yOffsetPx:
      typeof feature.config.yOffsetPx === 'number'
        ? Math.max(-30, Math.min(30, feature.config.yOffsetPx))
        : 0,
    shadowScale:
      typeof feature.config.shadowScale === 'number'
        ? Math.max(0.35, Math.min(1.8, feature.config.shadowScale))
        : 1,
    idleFrames: stringArray(feature.config.idleFrames),
    runFrames: stringArray(feature.config.runFrames),
    idleFrameDurationMs:
      typeof feature.config.idleFrameDurationMs === 'number'
        ? Math.max(80, Math.min(2000, feature.config.idleFrameDurationMs))
        : 520,
    runFrameDurationMs:
      typeof feature.config.runFrameDurationMs === 'number'
        ? Math.max(70, Math.min(600, feature.config.runFrameDurationMs))
        : 125,
  };
}
