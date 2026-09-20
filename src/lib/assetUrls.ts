/**
 * Global cache-busting version for assets served from Cloudflare R2.
 *
 * Change this value ONLY when an existing asset is replaced at the same path.
 * Adding a brand-new asset at a brand-new URL does not require a version bump.
 */
export const ASSET_VERSION = '2026-09-16-2';

export const ASSET_ORIGIN = 'https://assets.learningkingdom.co.il';

/**
 * Adds the current asset version to an R2 asset URL while preserving any
 * existing query string or hash. If a `v` parameter already exists, it is
 * replaced so this function is safe to call more than once.
 */
function withAssetVersion(url: string): string {
  const hashIndex = url.indexOf('#');
  const hash = hashIndex >= 0 ? url.slice(hashIndex) : '';
  const withoutHash = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
  const encodedVersion = encodeURIComponent(ASSET_VERSION);

  if (/(?:\?|&)v=[^&]*/.test(withoutHash)) {
    return `${withoutHash.replace(
      /([?&])v=[^&]*/,
      `$1v=${encodedVersion}`
    )}${hash}`;
  }

  const separator = withoutHash.includes('?') ? '&' : '?';
  return `${withoutHash}${separator}v=${encodedVersion}${hash}`;
}

function isAbsoluteUrl(value: string): boolean {
  return /^(?:https?:|data:|blob:)/i.test(value);
}

function isR2AssetUrl(value: string): boolean {
  return value === ASSET_ORIGIN || value.startsWith(`${ASSET_ORIGIN}/`);
}

/**
 * Resolves a project asset to R2 and appends the central cache version.
 * External absolute/data/blob URLs remain untouched. Absolute URLs that
 * already point at our R2 custom domain still receive the version parameter.
 */
function resolveR2AssetUrl(
  pathOrFilename: string,
  baseUrl: string,
  localPrefix: RegExp
): string {
  const value = pathOrFilename.trim();

  if (isAbsoluteUrl(value)) {
    return isR2AssetUrl(value) ? withAssetVersion(value) : value;
  }

  const filename = value.replace(localPrefix, '').replace(/^\/+/, '');
  return withAssetVersion(`${baseUrl}/${filename}`);
}

export const ITEM_ASSET_BASE_URL = `${ASSET_ORIGIN}/assets/items`;

/** Resolves item image paths to the Cloudflare R2 custom domain. */
export function itemAssetUrl(pathOrFilename: string): string {
  return resolveR2AssetUrl(
    pathOrFilename,
    ITEM_ASSET_BASE_URL,
    /^\/?assets\/items\//
  );
}

export const COMPANION_ASSET_BASE_URL = `${ASSET_ORIGIN}/assets/companions`;

/** Resolves companion art/frame paths to the Cloudflare R2 custom domain. */
export function companionAssetUrl(pathOrFilename: string): string {
  return resolveR2AssetUrl(
    pathOrFilename,
    COMPANION_ASSET_BASE_URL,
    /^\/?assets\/companions\//
  );
}

export const CLASS_KINGDOM_ASSET_BASE_URL = `${ASSET_ORIGIN}/assets/class-kingdom`;

/** Resolves class-kingdom image/SVG paths to the Cloudflare R2 custom domain. */
export function classKingdomAssetUrl(pathOrFilename: string): string {
  return resolveR2AssetUrl(
    pathOrFilename,
    CLASS_KINGDOM_ASSET_BASE_URL,
    /^\/?assets\/class-kingdom\//
  );
}

export const ROOM_ASSET_BASE_URL = `${ASSET_ORIGIN}/rooms`;

/** Resolves personal-room background paths to the Cloudflare R2 custom domain. */
export function roomAssetUrl(pathOrFilename: string): string {
  return resolveR2AssetUrl(pathOrFilename, ROOM_ASSET_BASE_URL, /^\/?rooms\//);
}



export const TROPHY_ASSET_BASE_URL = `${ASSET_ORIGIN}/assets/trophies/teacher`;

/** Resolves realistic teacher-trophy assets to the Cloudflare R2 custom domain. */
export function trophyAssetUrl(pathOrFilename: string): string {
  return resolveR2AssetUrl(
    pathOrFilename,
    TROPHY_ASSET_BASE_URL,
    /^\/?assets\/trophies\/teacher\//
  );
}


export const PERSONAL_TROPHY_ASSET_BASE_URL = `${ASSET_ORIGIN}/assets/trophies/personal`;

/** Resolves one-off personal/real-world trophy assets from R2. */
export function personalTrophyAssetUrl(pathOrFilename: string): string {
  return resolveR2AssetUrl(
    pathOrFilename,
    PERSONAL_TROPHY_ASSET_BASE_URL,
    /^\/?assets\/trophies\/personal\//
  );
}

export const PERSONAL_GUEST_ASSET_BASE_URL = `${ASSET_ORIGIN}/assets/personal-guests`;

/** Resolves personal-guest image/frame paths to the Cloudflare R2 custom domain. */
export function personalGuestAssetUrl(pathOrFilename: string): string {
  return resolveR2AssetUrl(
    pathOrFilename,
    PERSONAL_GUEST_ASSET_BASE_URL,
    /^\/?assets\/personal-guests\//
  );
}
