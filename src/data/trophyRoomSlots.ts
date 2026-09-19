import type { ThemeId } from './themes';

export type TrophyRoomSlotCategory =
  | 'collection'
  | 'trophy'
  | 'certificate'
  | 'special';

export type TrophyRoomSlot = {
  id: string;
  category: TrophyRoomSlotCategory;
  /** Center X position, as a percentage of the 1672px reference image. */
  x: number;
  /** Center Y position, as a percentage of the 941px reference image. */
  y: number;
  /** Usable display width, as a percentage of the reference image. */
  width: number;
  /** Usable display height, as a percentage of the reference image. */
  height: number;
};

const slot = (
  id: string,
  category: TrophyRoomSlotCategory,
  x: number,
  y: number,
  width: number,
  height: number
): TrophyRoomSlot => ({ id, category, x, y, width, height });

/**
 * Coordinates are calibrated against the final Astra background:
 * 1672 × 941 px
 *
 * Numbering inside each chronological category is Hebrew-reading order:
 * right-to-left, then top-to-bottom.
 */
export const COLLECTION_DISPLAY_SLOTS: TrophyRoomSlot[] = [
  slot('collection-01', 'collection', 30.2033, 33.0499, 4.1866, 7.8640),
  slot('collection-02', 'collection', 24.8804, 33.0499, 4.1866, 7.8640),
  slot('collection-03', 'collection', 19.4976, 33.0499, 4.1866, 7.8640),
  slot('collection-04', 'collection', 14.1148, 33.0499, 4.1866, 7.8640),
  slot('collection-05', 'collection', 8.7919, 33.0499, 4.1866, 7.8640),

  slot('collection-06', 'collection', 30.2033, 43.4644, 4.1866, 7.8640),
  slot('collection-07', 'collection', 24.8804, 43.4644, 4.1866, 7.8640),
  slot('collection-08', 'collection', 19.4976, 43.4644, 4.1866, 7.8640),
  slot('collection-09', 'collection', 14.1148, 43.4644, 4.1866, 7.8640),
  slot('collection-10', 'collection', 8.7919, 43.4644, 4.1866, 7.8640),

  slot('collection-11', 'collection', 30.2033, 53.9851, 4.1866, 7.8640),
  slot('collection-12', 'collection', 24.8804, 53.9851, 4.1866, 7.8640),
  slot('collection-13', 'collection', 19.4976, 53.9851, 4.1866, 7.8640),
  slot('collection-14', 'collection', 14.1148, 53.9851, 4.1866, 7.8640),
  slot('collection-15', 'collection', 8.7919, 53.9851, 4.1866, 7.8640),

  slot('collection-16', 'collection', 30.2033, 64.5058, 4.1866, 7.8640),
  slot('collection-17', 'collection', 24.8804, 64.5058, 4.1866, 7.8640),
  slot('collection-18', 'collection', 19.4976, 64.5058, 4.1866, 7.8640),
  slot('collection-19', 'collection', 14.1148, 64.5058, 4.1866, 7.8640),
  slot('collection-20', 'collection', 8.7919, 64.5058, 4.1866, 7.8640),
];

export const TROPHY_DISPLAY_SLOTS: TrophyRoomSlot[] = [
  slot('trophy-01', 'trophy', 60.4665, 32.9437, 5.2632, 11.0521),
  slot('trophy-02', 'trophy', 53.2895, 32.9437, 5.2632, 11.0521),
  slot('trophy-03', 'trophy', 46.0526, 32.9437, 5.2632, 11.0521),
  slot('trophy-04', 'trophy', 38.8756, 32.9437, 5.2632, 11.0521),

  slot('trophy-05', 'trophy', 60.4665, 45.8023, 5.2632, 9.7768),
  slot('trophy-06', 'trophy', 53.2895, 45.8023, 5.2632, 9.7768),
  slot('trophy-07', 'trophy', 46.0526, 45.8023, 5.2632, 9.7768),
  slot('trophy-08', 'trophy', 38.8756, 45.8023, 5.2632, 9.7768),

  slot('trophy-09', 'trophy', 60.4665, 59.2986, 5.2632, 10.8395),
  slot('trophy-10', 'trophy', 53.2895, 59.2986, 5.2632, 10.8395),
  slot('trophy-11', 'trophy', 46.0526, 59.2986, 5.2632, 10.8395),
  slot('trophy-12', 'trophy', 38.8756, 59.2986, 5.2632, 10.8395),
];

export const CERTIFICATE_DISPLAY_SLOTS: TrophyRoomSlot[] = [
  slot('certificate-01', 'certificate', 88.5167, 31.6684, 4.7847, 5.8448),
  slot('certificate-02', 'certificate', 82.5359, 31.6684, 4.7847, 5.8448),
  slot('certificate-03', 'certificate', 76.5550, 31.6684, 4.7847, 5.8448),
  slot('certificate-04', 'certificate', 70.6340, 31.6684, 4.7847, 5.8448),

  slot('certificate-05', 'certificate', 88.5167, 38.8948, 4.7847, 5.8448),
  slot('certificate-06', 'certificate', 82.5359, 38.8948, 4.7847, 5.8448),
  slot('certificate-07', 'certificate', 76.5550, 38.8948, 4.7847, 5.8448),
  slot('certificate-08', 'certificate', 70.6340, 38.8948, 4.7847, 5.8448),

  slot('certificate-09', 'certificate', 88.5167, 46.4399, 4.7847, 5.8448),
  slot('certificate-10', 'certificate', 82.5359, 46.4399, 4.7847, 5.8448),
  slot('certificate-11', 'certificate', 76.5550, 46.4399, 4.7847, 5.8448),
  slot('certificate-12', 'certificate', 70.6340, 46.4399, 4.7847, 5.8448),
];

export const SPECIAL_DISPLAY_SLOTS: TrophyRoomSlot[] = [
  slot('special-01', 'special', 88.8158, 59.2986, 4.9043, 9.5643),
  slot('special-02', 'special', 82.5359, 59.2986, 4.9043, 9.5643),
  slot('special-03', 'special', 76.3158, 59.2986, 4.9043, 9.5643),
  slot('special-04', 'special', 70.0359, 59.2986, 4.9043, 9.5643),
];

export const ALL_TROPHY_ROOM_SLOTS: TrophyRoomSlot[] = [
  ...COLLECTION_DISPLAY_SLOTS,
  ...TROPHY_DISPLAY_SLOTS,
  ...CERTIFICATE_DISPLAY_SLOTS,
  ...SPECIAL_DISPLAY_SLOTS,
];

/**
 * Fixed collection placement.
 * The first 15 positions belong to today's collections.
 * Slots 16–20 are intentionally reserved for future collection themes.
 */
export const COLLECTION_THEME_SLOT_ID: Partial<Record<ThemeId, string>> = {
  generic: 'collection-01',
  chess: 'collection-02',
  space: 'collection-03',
  nature: 'collection-04',
  animals: 'collection-05',

  science: 'collection-06',
  building: 'collection-07',
  sports: 'collection-08',
  music: 'collection-09',
  books: 'collection-10',

  math: 'collection-11',
  fantasy: 'collection-12',
  robotics: 'collection-13',
  art: 'collection-14',
  ballet: 'collection-15',
};

export function getCollectionSlotId(themeId: ThemeId): string | null {
  return COLLECTION_THEME_SLOT_ID[themeId] ?? null;
}
