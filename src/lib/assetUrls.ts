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
