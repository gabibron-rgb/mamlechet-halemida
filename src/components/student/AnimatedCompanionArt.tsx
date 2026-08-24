import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

import type {
  CompanionArtLayer,
  CompanionFormArt,
  CompanionStage,
} from '../../data/companionWorlds';

type Props = {
  art: CompanionFormArt | null;
  alt: string;
  stage: CompanionStage;
  fallback?: ReactNode;
  className?: string;
  motion?: boolean;
  activity?: 'static' | 'idle' | 'run';
};

type LayerStyle = CSSProperties & {
  '--companion-layer-x'?: string;
  '--companion-layer-y'?: string;
  '--companion-layer-width'?: string;
  '--companion-layer-rotation'?: string;
  '--companion-layer-scale-x'?: string;
};

const STAGE_MOTION: Record<CompanionStage, string> = {
  egg: 'animate-[companionPetFloat_3.6s_ease-in-out_infinite]',
  hatchling: 'animate-[companionPetFloat_3.1s_ease-in-out_infinite]',
  young: 'animate-[companionPetFloat_3.3s_ease-in-out_infinite]',
  grown: 'animate-[companionPetFloat_3.6s_ease-in-out_infinite]',
  magical: 'animate-[companionMagicFloat_3.1s_ease-in-out_infinite]',
  legendary: 'animate-[companionLegendaryFloat_2.9s_ease-in-out_infinite]',
};

function layerAnimationClass(layer: CompanionArtLayer): string {
  switch (layer.animation) {
    case 'bodyBreath':
      return 'animate-[companionLayerBodyBreath_3.2s_ease-in-out_infinite]';
    case 'headIdle':
      return 'animate-[companionLayerHeadIdle_4.1s_ease-in-out_infinite]';
    case 'blink':
      return 'animate-[companionLayerBlink_5.4s_ease-in-out_infinite]';
    case 'blinkOverlay':
      return 'animate-[companionLayerBlinkOverlay_5.2s_linear_infinite]';
    case 'headBlinkOverlay':
      return 'animate-[companionLayerHeadBlinkOverlay_5.2s_linear_infinite]';
    case 'earLeft':
      return 'animate-[companionLayerEarLeft_4.7s_ease-in-out_infinite]';
    case 'earRight':
      return 'animate-[companionLayerEarRight_5.1s_ease-in-out_infinite]';
    case 'frontLegLeft':
      return 'animate-[companionLayerFrontLegLeft_4.4s_ease-in-out_infinite]';
    case 'frontLegRight':
      return 'animate-[companionLayerFrontLegRight_4.9s_ease-in-out_infinite]';
    case 'backLegLeft':
      return 'animate-[companionLayerBackLegLeft_5.3s_ease-in-out_infinite]';
    case 'backLegRight':
      return 'animate-[companionLayerBackLegRight_5.8s_ease-in-out_infinite]';
    case 'mane':
      return 'animate-[companionLayerMane_3.0s_ease-in-out_infinite]';
    case 'wingLeft':
      return 'animate-[companionLayerWingLeft_1.35s_ease-in-out_infinite]';
    case 'wingRight':
      return 'animate-[companionLayerWingRight_1.35s_ease-in-out_infinite]';
    case 'tail':
      return 'animate-[companionLayerTail_2.2s_ease-in-out_infinite]';
    case 'pendant':
      return 'animate-[companionLayerPendant_2.6s_ease-in-out_infinite]';
    case 'pulse':
      return 'animate-[companionLayerPulse_2.0s_ease-in-out_infinite]';
    case 'sparkle':
      return 'animate-[companionLayerSparkle_2.4s_ease-in-out_infinite]';
    default:
      return '';
  }
}

function layerStyle(layer: CompanionArtLayer): LayerStyle {
  return {
    '--companion-layer-x': `${layer.x ?? 50}%`,
    '--companion-layer-y': `${layer.y ?? 50}%`,
    '--companion-layer-width': `${layer.width ?? 100}%`,
    '--companion-layer-rotation': `${layer.rotation ?? 0}deg`,
    '--companion-layer-scale-x': layer.flipX ? '-1' : '1',
    left: `${layer.x ?? 50}%`,
    top: `${layer.y ?? 50}%`,
    width: `${layer.width ?? 100}%`,
    zIndex: layer.zIndex ?? 10,
    transformOrigin: layer.transformOrigin ?? '50% 50%',
    transform: `translate(-50%, -50%) rotate(${layer.rotation ?? 0}deg) scaleX(${layer.flipX ? -1 : 1})`,
    animationDuration: layer.animationDurationMs ? `${layer.animationDurationMs}ms` : undefined,
    animationDelay:
      layer.animationDelayMs !== undefined ? `${layer.animationDelayMs}ms` : undefined,
  };
}

export function CompanionAnimationStyles() {
  return (
    <style>{`
      @keyframes companionPetFloat {
        0%, 100% { transform: translateY(0) scale(1) scaleX(var(--companion-facing, 1)); }
        45% { transform: translateY(-4px) scale(1.015) scaleX(var(--companion-facing, 1)); }
        55% { transform: translateY(-5px) scale(1.02) scaleX(var(--companion-facing, 1)); }
      }
      @keyframes companionMagicFloat {
        0%, 100% { transform: translateY(0) rotate(-0.4deg) scale(1) scaleX(var(--companion-facing, 1)); }
        50% { transform: translateY(-7px) rotate(0.5deg) scale(1.025) scaleX(var(--companion-facing, 1)); }
      }
      @keyframes companionLegendaryFloat {
        0%, 100% { transform: translateY(0) rotate(-0.7deg) scale(1) scaleX(var(--companion-facing, 1)); }
        50% { transform: translateY(-9px) rotate(0.7deg) scale(1.035) scaleX(var(--companion-facing, 1)); }
      }
      @keyframes companionWingLeft {
        0%, 100% { transform: rotate(-10deg); }
        50% { transform: rotate(-31deg) translateY(-2px); }
      }
      @keyframes companionWingRight {
        0%, 100% { transform: scaleX(-1) rotate(-10deg); }
        50% { transform: scaleX(-1) rotate(-31deg) translateY(-2px); }
      }
      @keyframes companionLayerBodyBreath {
        0%, 100% { transform: translate(-50%, -50%) rotate(var(--companion-layer-rotation)) scaleX(var(--companion-layer-scale-x)) scaleY(1); }
        50% { transform: translate(-50%, -50%) rotate(var(--companion-layer-rotation)) scaleX(var(--companion-layer-scale-x)) scaleY(1.018); }
      }
      @keyframes companionLayerHeadIdle {
        0%, 100% { transform: translate(-50%, -50%) translateY(0) rotate(var(--companion-layer-rotation)) scaleX(var(--companion-layer-scale-x)); }
        35% { transform: translate(-50%, -50%) translateY(-1.5px) rotate(calc(var(--companion-layer-rotation) - 1.8deg)) scaleX(var(--companion-layer-scale-x)); }
        70% { transform: translate(-50%, -50%) translateY(1px) rotate(calc(var(--companion-layer-rotation) + 1.2deg)) scaleX(var(--companion-layer-scale-x)); }
      }
      @keyframes companionLayerBlink {
        0%, 82%, 86%, 91%, 95%, 100% { transform: translate(-50%, -50%) rotate(var(--companion-layer-rotation)) scaleX(var(--companion-layer-scale-x)) scaleY(1); }
        84%, 93% { transform: translate(-50%, -50%) rotate(var(--companion-layer-rotation)) scaleX(var(--companion-layer-scale-x)) scaleY(0.08); }
      }
      @keyframes companionLayerBlinkOverlay {
        0%, 81%, 86%, 91%, 96%, 100% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--companion-layer-rotation)) scaleX(var(--companion-layer-scale-x)); }
        83%, 84%, 93%, 94% { opacity: 1; transform: translate(-50%, -50%) rotate(var(--companion-layer-rotation)) scaleX(var(--companion-layer-scale-x)); }
      }
      @keyframes companionLayerHeadBlinkOverlay {
        0%, 78%, 88%, 100% {
          opacity: 0;
          transform: translate(-50%, -50%) translateY(0) rotate(var(--companion-layer-rotation)) scaleX(var(--companion-layer-scale-x));
        }
        80%, 86% {
          opacity: 1;
          transform: translate(-50%, -50%) translateY(-1.5px) rotate(calc(var(--companion-layer-rotation) - 1.8deg)) scaleX(var(--companion-layer-scale-x));
        }
        92%, 96% {
          opacity: 1;
          transform: translate(-50%, -50%) translateY(1px) rotate(calc(var(--companion-layer-rotation) + 1.2deg)) scaleX(var(--companion-layer-scale-x));
        }
      }
      @keyframes companionLayerEarLeft {
        0%, 72%, 100% { transform: translate(-50%, -50%) rotate(var(--companion-layer-rotation)) scaleX(var(--companion-layer-scale-x)); }
        78% { transform: translate(-50%, -50%) rotate(calc(var(--companion-layer-rotation) - 9deg)) scaleX(var(--companion-layer-scale-x)); }
        84% { transform: translate(-50%, -50%) rotate(calc(var(--companion-layer-rotation) + 4deg)) scaleX(var(--companion-layer-scale-x)); }
      }
      @keyframes companionLayerEarRight {
        0%, 66%, 100% { transform: translate(-50%, -50%) rotate(var(--companion-layer-rotation)) scaleX(var(--companion-layer-scale-x)); }
        73% { transform: translate(-50%, -50%) rotate(calc(var(--companion-layer-rotation) + 8deg)) scaleX(var(--companion-layer-scale-x)); }
        80% { transform: translate(-50%, -50%) rotate(calc(var(--companion-layer-rotation) - 3deg)) scaleX(var(--companion-layer-scale-x)); }
      }
      @keyframes companionLayerFrontLegLeft {
        0%, 68%, 100% { transform: translate(-50%, -50%) translateY(0) rotate(var(--companion-layer-rotation)) scaleX(var(--companion-layer-scale-x)); }
        76% { transform: translate(-50%, -50%) translateY(-2px) rotate(calc(var(--companion-layer-rotation) - 5deg)) scaleX(var(--companion-layer-scale-x)); }
        84% { transform: translate(-50%, -50%) translateY(0) rotate(var(--companion-layer-rotation)) scaleX(var(--companion-layer-scale-x)); }
      }
      @keyframes companionLayerFrontLegRight {
        0%, 74%, 100% { transform: translate(-50%, -50%) translateY(0) rotate(var(--companion-layer-rotation)) scaleX(var(--companion-layer-scale-x)); }
        81% { transform: translate(-50%, -50%) translateY(-1.5px) rotate(calc(var(--companion-layer-rotation) + 4deg)) scaleX(var(--companion-layer-scale-x)); }
        88% { transform: translate(-50%, -50%) translateY(0) rotate(var(--companion-layer-rotation)) scaleX(var(--companion-layer-scale-x)); }
      }
      @keyframes companionLayerBackLegLeft {
        0%, 78%, 100% { transform: translate(-50%, -50%) translateX(0) rotate(var(--companion-layer-rotation)) scaleX(var(--companion-layer-scale-x)); }
        85% { transform: translate(-50%, -50%) translateX(-1.5px) rotate(calc(var(--companion-layer-rotation) - 3deg)) scaleX(var(--companion-layer-scale-x)); }
      }
      @keyframes companionLayerBackLegRight {
        0%, 80%, 100% { transform: translate(-50%, -50%) translateX(0) rotate(var(--companion-layer-rotation)) scaleX(var(--companion-layer-scale-x)); }
        87% { transform: translate(-50%, -50%) translateX(1.5px) rotate(calc(var(--companion-layer-rotation) + 3deg)) scaleX(var(--companion-layer-scale-x)); }
      }
      @keyframes companionLayerMane {
        0%, 100% { transform: translate(-50%, -50%) rotate(calc(var(--companion-layer-rotation) - 1deg)) scaleX(var(--companion-layer-scale-x)); }
        50% { transform: translate(-50%, -50%) translateX(1px) rotate(calc(var(--companion-layer-rotation) + 2.5deg)) scaleX(var(--companion-layer-scale-x)); }
      }
      @keyframes companionLayerWingLeft {
        0%, 100% { transform: translate(-50%, -50%) rotate(var(--companion-layer-rotation)) scaleX(var(--companion-layer-scale-x)); }
        50% { transform: translate(-50%, -50%) rotate(calc(var(--companion-layer-rotation) - 22deg)) scaleX(var(--companion-layer-scale-x)); }
      }
      @keyframes companionLayerWingRight {
        0%, 100% { transform: translate(-50%, -50%) rotate(var(--companion-layer-rotation)) scaleX(var(--companion-layer-scale-x)); }
        50% { transform: translate(-50%, -50%) rotate(calc(var(--companion-layer-rotation) + 22deg)) scaleX(var(--companion-layer-scale-x)); }
      }
      @keyframes companionLayerTail {
        0%, 100% { transform: translate(-50%, -50%) rotate(calc(var(--companion-layer-rotation) - 5deg)) scaleX(var(--companion-layer-scale-x)); }
        50% { transform: translate(-50%, -50%) rotate(calc(var(--companion-layer-rotation) + 9deg)) scaleX(var(--companion-layer-scale-x)); }
      }
      @keyframes companionLayerPendant {
        0%, 100% { transform: translate(-50%, -50%) rotate(calc(var(--companion-layer-rotation) - 4deg)) scaleX(var(--companion-layer-scale-x)); }
        50% { transform: translate(-50%, -50%) rotate(calc(var(--companion-layer-rotation) + 5deg)) scaleX(var(--companion-layer-scale-x)); }
      }

      /* Running cycle used only while the companion crosses the room. */
      @keyframes companionRunFrontA {
        0%, 100% { transform: translate(-50%, -50%) rotate(calc(var(--companion-layer-rotation) - 13deg)) scaleX(var(--companion-layer-scale-x)); }
        50% { transform: translate(-50%, -50%) rotate(calc(var(--companion-layer-rotation) + 14deg)) translateY(-1px) scaleX(var(--companion-layer-scale-x)); }
      }
      @keyframes companionRunFrontB {
        0%, 100% { transform: translate(-50%, -50%) rotate(calc(var(--companion-layer-rotation) + 14deg)) scaleX(var(--companion-layer-scale-x)); }
        50% { transform: translate(-50%, -50%) rotate(calc(var(--companion-layer-rotation) - 13deg)) translateY(-1px) scaleX(var(--companion-layer-scale-x)); }
      }
      @keyframes companionRunBackA {
        0%, 100% { transform: translate(-50%, -50%) rotate(calc(var(--companion-layer-rotation) + 11deg)) scaleX(var(--companion-layer-scale-x)); }
        50% { transform: translate(-50%, -50%) rotate(calc(var(--companion-layer-rotation) - 11deg)) translateY(-1px) scaleX(var(--companion-layer-scale-x)); }
      }
      @keyframes companionRunBackB {
        0%, 100% { transform: translate(-50%, -50%) rotate(calc(var(--companion-layer-rotation) - 11deg)) scaleX(var(--companion-layer-scale-x)); }
        50% { transform: translate(-50%, -50%) rotate(calc(var(--companion-layer-rotation) + 11deg)) translateY(-1px) scaleX(var(--companion-layer-scale-x)); }
      }
      @keyframes companionRunHead {
        0%, 100% { transform: translate(-50%, -50%) translateY(0) rotate(calc(var(--companion-layer-rotation) - 1deg)) scaleX(var(--companion-layer-scale-x)); }
        50% { transform: translate(-50%, -50%) translateY(-2px) rotate(calc(var(--companion-layer-rotation) + 1.2deg)) scaleX(var(--companion-layer-scale-x)); }
      }
      @keyframes companionRunTail {
        0%, 100% { transform: translate(-50%, -50%) rotate(calc(var(--companion-layer-rotation) - 11deg)) scaleX(var(--companion-layer-scale-x)); }
        50% { transform: translate(-50%, -50%) rotate(calc(var(--companion-layer-rotation) + 14deg)) scaleX(var(--companion-layer-scale-x)); }
      }
      @keyframes companionRunIntegratedBody {
        0%, 100% {
          transform: translate(-50%, -50%) translateY(0) rotate(calc(var(--companion-layer-rotation) - 0.8deg)) scaleX(var(--companion-layer-scale-x)) scaleY(1);
        }
        25% {
          transform: translate(-50%, -50%) translateY(-2.4px) rotate(calc(var(--companion-layer-rotation) + 0.8deg)) scaleX(var(--companion-layer-scale-x)) scaleY(0.985);
        }
        50% {
          transform: translate(-50%, -50%) translateY(0.8px) rotate(calc(var(--companion-layer-rotation) - 0.4deg)) scaleX(var(--companion-layer-scale-x)) scaleY(1.015);
        }
        75% {
          transform: translate(-50%, -50%) translateY(-1.8px) rotate(calc(var(--companion-layer-rotation) + 0.6deg)) scaleX(var(--companion-layer-scale-x)) scaleY(0.99);
        }
      }
      .companion-running [data-companion-integrated-body="true"] [data-companion-layer-animation="bodyBreath"] {
        animation: companionRunIntegratedBody 0.48s ease-in-out infinite !important;
      }
      .companion-running [data-companion-layer-animation="frontLegLeft"] {
        animation: companionRunFrontA 0.46s ease-in-out infinite !important;
      }
      .companion-running [data-companion-layer-animation="frontLegRight"] {
        animation: companionRunFrontB 0.46s ease-in-out infinite !important;
      }
      .companion-running [data-companion-layer-animation="backLegLeft"] {
        animation: companionRunBackB 0.46s ease-in-out infinite !important;
      }
      .companion-running [data-companion-layer-animation="backLegRight"] {
        animation: companionRunBackA 0.46s ease-in-out infinite !important;
      }
      .companion-running [data-companion-layer-animation="headIdle"],
      .companion-running [data-companion-layer-animation="headBlinkOverlay"] {
        animation: companionRunHead 0.46s ease-in-out infinite !important;
      }
      .companion-running [data-companion-layer-animation="headBlinkOverlay"] {
        opacity: 0 !important;
      }
      .companion-running [data-companion-layer-animation="tail"] {
        animation: companionRunTail 0.58s ease-in-out infinite !important;
      }
      @keyframes companionKnightHop {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        18% { transform: translateY(-1px) rotate(-0.6deg); }
        42% { transform: translateY(-6px) rotate(1deg); }
        58% { transform: translateY(-7px) rotate(0.4deg); }
        78% { transform: translateY(-2px) rotate(-0.8deg); }
      }
      .companion-knight-hop {
        animation: companionKnightHop 0.62s cubic-bezier(0.36, 0, 0.2, 1) infinite;
        transform-origin: center bottom;
        will-change: transform;
      }
      @keyframes companionLayerPulse {
        0%, 100% { transform: translate(-50%, -50%) rotate(var(--companion-layer-rotation)) scaleX(var(--companion-layer-scale-x)) scale(0.96); opacity: 0.55; }
        50% { transform: translate(-50%, -50%) rotate(var(--companion-layer-rotation)) scaleX(var(--companion-layer-scale-x)) scale(1.06); opacity: 0.95; }
      }
      @keyframes companionLayerSparkle {
        0%, 100% { transform: translate(-50%, -50%) rotate(var(--companion-layer-rotation)) scaleX(var(--companion-layer-scale-x)) scale(0.9); opacity: 0.35; }
        50% { transform: translate(-50%, -50%) rotate(var(--companion-layer-rotation)) scaleX(var(--companion-layer-scale-x)) scale(1.08); opacity: 1; }
      }
      .companion-layer-static {
        transform: translate(-50%, -50%) rotate(var(--companion-layer-rotation)) scaleX(var(--companion-layer-scale-x));
      }
      @media (prefers-reduced-motion: reduce) {
        .companion-motion, .companion-layer-motion { animation: none !important; }
      }
    `}</style>
  );
}

export default function AnimatedCompanionArt({
  art,
  alt,
  stage,
  fallback,
  className = '',
  motion = true,
  activity = 'idle',
}: Props) {
  const frameAnimation = art?.frameAnimation;
  const requestedFrames =
    activity === 'run'
      ? frameAnimation?.runFrames
      : activity === 'idle'
        ? frameAnimation?.idleFrames
        : undefined;
  const frameSources =
    requestedFrames && requestedFrames.length > 0
      ? requestedFrames
      : frameAnimation?.staticSrc
        ? [frameAnimation.staticSrc]
        : [];
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    setFrameIndex(0);
    if (frameSources.length <= 1 || activity === 'static') return;

    const duration =
      activity === 'run'
        ? frameAnimation?.runFrameDurationMs ?? 110
        : frameAnimation?.idleFrameDurationMs ?? 420;
    const timer = window.setInterval(() => {
      setFrameIndex(current => (current + 1) % frameSources.length);
    }, duration);

    return () => window.clearInterval(timer);
  }, [activity, frameAnimation?.idleFrameDurationMs, frameAnimation?.runFrameDurationMs, frameSources.join('|')]);

  const layers = art?.layers ?? [];
  const hasLayeredArt = layers.length > 0;
  const hasSeparateLegs = layers.some(layer =>
    ['frontLegLeft', 'frontLegRight', 'backLegLeft', 'backLegRight'].includes(
      layer.animation ?? ''
    )
  );

  if (frameSources.length > 0) {
    return (
      <div
        className={`relative h-full w-full ${className}`}
        role="img"
        aria-label={alt}
      >
        <img
          src={frameSources[frameIndex] ?? frameSources[0]}
          alt={alt}
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-contain drop-shadow-[0_12px_18px_rgba(0,0,0,0.35)]"
        />
      </div>
    );
  }

  if (!hasLayeredArt && !art?.imageSrc) {
    return (
      <div className={`${motion ? `companion-motion ${STAGE_MOTION[stage]}` : ''} ${className}`}>
        {fallback}
      </div>
    );
  }

  return (
    <div
      className={`relative h-full w-full ${motion ? `companion-motion ${STAGE_MOTION[stage]}` : ''} ${className}`}
      data-companion-integrated-body={hasLayeredArt && !hasSeparateLegs ? 'true' : 'false'}
      role="img"
      aria-label={alt}
    >
      {hasLayeredArt ? (
        layers.map(layer => (
          <img
            key={layer.id}
            src={layer.src}
            alt=""
            aria-hidden="true"
            draggable={false}
            data-companion-layer-animation={layer.animation ?? 'none'}
            className={`companion-layer-motion absolute h-auto max-w-none select-none object-contain ${
              layer.animation && layer.animation !== 'none'
                ? layerAnimationClass(layer)
                : 'companion-layer-static'
            } ${layer.className ?? ''}`}
            style={layerStyle(layer)}
          />
        ))
      ) : (
        <img
          src={art?.imageSrc}
          alt={alt}
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_12px_18px_rgba(0,0,0,0.35)]"
        />
      )}
    </div>
  );
}
