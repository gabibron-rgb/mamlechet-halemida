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
  };
}
