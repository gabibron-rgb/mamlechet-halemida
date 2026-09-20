import { useEffect, useMemo, useState } from 'react';

import { getTrophyDefinition, type TrophyDef } from '../../data/trophies';
import { personalTrophyAssetUrl, trophyAssetUrl } from '../../lib/assetUrls';

type Props = {
  themeId?: string;
  definition?: TrophyDef;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  alt?: string;
};

export default function TrophyVisual({
  themeId,
  definition: providedDefinition,
  className = '',
  imageClassName = '',
  fallbackClassName = '',
  alt,
}: Props) {
  const definition = useMemo(
    () => providedDefinition ?? (themeId ? getTrophyDefinition(themeId) : undefined),
    [providedDefinition, themeId]
  );

  const src = definition?.imageFilename
    ? definition.assetKind === 'personal'
      ? personalTrophyAssetUrl(definition.imageFilename)
      : trophyAssetUrl(definition.imageFilename)
    : null;

  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  const fallback = definition?.emoji ?? '🏆';
  const accessibleName = alt ?? definition?.nameHe ?? 'גביע';

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {src && !imageFailed ? (
        <img
          src={src}
          alt={accessibleName}
          draggable={false}
          onError={() => setImageFailed(true)}
          className={`h-full w-full select-none object-contain drop-shadow-[0_5px_8px_rgba(0,0,0,0.48)] ${imageClassName}`}
        />
      ) : (
        <span
          aria-label={accessibleName}
          role="img"
          className={`leading-none ${fallbackClassName}`}
        >
          {fallback}
        </span>
      )}
    </div>
  );
}
