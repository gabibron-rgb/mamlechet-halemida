export const ITEM_ASSET_BASE_URL =
  'https://assets.learningkingdom.co.il/assets/items';

/**
 * Resolves item image paths to the Cloudflare R2 custom domain.
 * Existing absolute/data/blob URLs are left unchanged.
 */
export function itemAssetUrl(pathOrFilename: string): string {
  const value = pathOrFilename.trim();

  if (/^(?:https?:|data:|blob:)/i.test(value)) {
    return value;
  }

  const filename = value
    .replace(/^\/?assets\/items\//, '')
    .replace(/^\/+/, '');

  return `${ITEM_ASSET_BASE_URL}/${filename}`;
}

export const COMPANION_ASSET_BASE_URL =
  'https://assets.learningkingdom.co.il/assets/companions';

/**
 * Resolves companion art/frame paths to the Cloudflare R2 custom domain.
 * Existing absolute/data/blob URLs are left unchanged.
 */
export function companionAssetUrl(pathOrFilename: string): string {
  const value = pathOrFilename.trim();

  if (/^(?:https?:|data:|blob:)/i.test(value)) {
    return value;
  }

  const filename = value
    .replace(/^\/?assets\/companions\//, '')
    .replace(/^\/+/, '');

  return `${COMPANION_ASSET_BASE_URL}/${filename}`;
}

export const CLASS_KINGDOM_ASSET_BASE_URL =
  'https://assets.learningkingdom.co.il/assets/class-kingdom';

/**
 * Resolves class-kingdom image/SVG paths to the Cloudflare R2 custom domain.
 * Existing absolute/data/blob URLs are left unchanged.
 */
export function classKingdomAssetUrl(pathOrFilename: string): string {
  const value = pathOrFilename.trim();

  if (/^(?:https?:|data:|blob:)/i.test(value)) {
    return value;
  }

  const filename = value
    .replace(/^\/?assets\/class-kingdom\//, '')
    .replace(/^\/+/, '');

  return `${CLASS_KINGDOM_ASSET_BASE_URL}/${filename}`;
}

export const ROOM_ASSET_BASE_URL =
  'https://assets.learningkingdom.co.il/rooms';

/**
 * Resolves personal-room background paths to the Cloudflare R2 custom domain.
 * Existing absolute/data/blob URLs are left unchanged.
 */
export function roomAssetUrl(pathOrFilename: string): string {
  const value = pathOrFilename.trim();

  if (/^(?:https?:|data:|blob:)/i.test(value)) {
    return value;
  }

  const filename = value
    .replace(/^\/?rooms\//, '')
    .replace(/^\/+/, '');

  return `${ROOM_ASSET_BASE_URL}/${filename}`;
}
