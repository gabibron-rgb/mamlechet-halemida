import { useEffect, useRef, useState } from 'react';

import type {
  PersonalGuestConfig,
  PersonalGuestFacing,
  PersonalGuestMovement,
} from '../../data/personalFeatures';

type Props = {
  config: PersonalGuestConfig;
  index: number;
  isEditing: boolean;
};

type GuestPosition = {
  x: number;
  y: number;
  facing: PersonalGuestFacing;
};

const GROUND_POINTS = [
  { x: 12, y: 96 },
  { x: 24, y: 95.5 },
  { x: 36, y: 94.5 },
  { x: 46, y: 92 },
  { x: 56, y: 89.5 },
  { x: 64, y: 95.5 },
  { x: 73, y: 91 },
  { x: 82, y: 93.5 },
  { x: 90, y: 95.5 },
] as const;

const FLYING_POINTS = [
  { x: 20, y: 55 },
  { x: 35, y: 42 },
  { x: 51, y: 61 },
  { x: 66, y: 38 },
  { x: 82, y: 57 },
] as const;

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function destinationFor(
  movement: PersonalGuestMovement,
  current: GuestPosition,
  index: number
): { x: number; y: number } {
  const allPoints = movement === 'flying' ? FLYING_POINTS : GROUND_POINTS;
  // Multiple personal guests use alternating ground points so they are less
  // likely to stack directly on top of each other.
  const points =
    movement === 'ground'
      ? allPoints.filter((_, pointIndex) => pointIndex % 2 === index % 2)
      : allPoints;
  const nearby = points.filter(point => {
    const horizontal = Math.abs(point.x - current.x);
    const vertical = Math.abs(point.y - current.y);
    return horizontal >= 9 && horizontal <= 34 && vertical <= 5;
  });
  const distant = points.filter(point => {
    const horizontal = Math.abs(point.x - current.x);
    const vertical = Math.abs(point.y - current.y);
    return horizontal >= 9 || vertical >= 2;
  });
  const pool = nearby.length > 0 ? nearby : distant.length > 0 ? distant : points;
  const point = pool[Math.floor(Math.random() * pool.length)];

  if (movement === 'flying') {
    return {
      x: Math.max(12, Math.min(90, point.x + randomBetween(-3, 3))),
      y: Math.max(30, Math.min(67, point.y + randomBetween(-3, 3))),
    };
  }

  return {
    x: Math.max(9, Math.min(92, point.x + randomBetween(-2, 2))),
    y: Math.max(88.8, Math.min(96.5, point.y + randomBetween(-0.7, 0.7))),
  };
}

function initialPosition(
  config: PersonalGuestConfig,
  index: number
): GuestPosition {
  const movement = config.movement ?? 'ground';
  const fallbackPoint =
    movement === 'flying'
      ? FLYING_POINTS[index % FLYING_POINTS.length]
      : GROUND_POINTS[(index * 2 + 1) % GROUND_POINTS.length];

  return {
    x: config.startX ?? fallbackPoint.x,
    y: config.startY ?? fallbackPoint.y,
    facing: config.baseFacing ?? 'left',
  };
}

export default function PersonalRoomGuest({ config, index, isEditing }: Props) {
  const movement = config.movement ?? 'ground';
  const [position, setPosition] = useState<GuestPosition>(() =>
    initialPosition(config, index)
  );
  const positionRef = useRef(position);
  const [isWalking, setIsWalking] = useState(false);
  const [movementDurationMs, setMovementDurationMs] = useState(2200);
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const next = initialPosition(config, index);
    positionRef.current = next;
    setPosition(next);
  }, [config.baseFacing, config.startX, config.startY, config.movement, index]);

  useEffect(() => {
    if (isEditing || movement === 'static') {
      setIsWalking(false);
      return;
    }

    let idleTimer: number | undefined;
    let turnTimer: number | undefined;
    let walkingTimer: number | undefined;
    let cancelled = false;

    function scheduleNextMove(delayMs = randomBetween(2600, 6000)) {
      idleTimer = window.setTimeout(beginMove, delayMs);
    }

    function startWalk(
      destination: { x: number; y: number },
      facing: PersonalGuestFacing,
      durationMs: number
    ) {
      if (cancelled) return;

      const next: GuestPosition = {
        x: Number(destination.x.toFixed(1)),
        y: Number(destination.y.toFixed(1)),
        facing,
      };

      setMovementDurationMs(durationMs);
      setIsWalking(true);
      positionRef.current = next;
      setPosition(next);

      walkingTimer = window.setTimeout(() => {
        if (cancelled) return;
        setIsWalking(false);
        scheduleNextMove();
      }, durationMs + 80);
    }

    function beginMove() {
      if (cancelled) return;

      const current = positionRef.current;
      const destination = destinationFor(movement, current, index);
      const facing: PersonalGuestFacing =
        destination.x < current.x ? 'left' : 'right';
      const distance = Math.hypot(
        destination.x - current.x,
        (destination.y - current.y) * 1.8
      );
      const durationMs = Math.round(
        movement === 'ground'
          ? Math.max(2400, Math.min(4200, 1900 + distance * 45))
          : Math.max(1500, Math.min(3000, 1250 + distance * 25))
      );

      if (facing !== current.facing) {
        const turned = { ...current, facing };
        positionRef.current = turned;
        setPosition(turned);
        turnTimer = window.setTimeout(
          () => startWalk(destination, facing, durationMs),
          220
        );
      } else {
        startWalk(destination, facing, durationMs);
      }
    }

    scheduleNextMove(randomBetween(1300, 2400));

    return () => {
      cancelled = true;
      if (idleTimer !== undefined) window.clearTimeout(idleTimer);
      if (turnTimer !== undefined) window.clearTimeout(turnTimer);
      if (walkingTimer !== undefined) window.clearTimeout(walkingTimer);
    };
  }, [isEditing, movement]);

  const frameSources =
    isWalking && (config.runFrames?.length ?? 0) > 0
      ? config.runFrames ?? []
      : (config.idleFrames?.length ?? 0) > 0
        ? config.idleFrames ?? []
        : [config.imageSrc];

  useEffect(() => {
    setFrameIndex(0);
    if (frameSources.length <= 1) return;

    const durationMs = isWalking
      ? config.runFrameDurationMs ?? 125
      : config.idleFrameDurationMs ?? 520;
    const timer = window.setInterval(() => {
      setFrameIndex(current => (current + 1) % frameSources.length);
    }, durationMs);

    return () => window.clearInterval(timer);
  }, [
    config.idleFrameDurationMs,
    config.runFrameDurationMs,
    frameSources.join('|'),
    isWalking,
  ]);

  const currentImageSrc = frameSources[frameIndex] ?? frameSources[0] ?? config.imageSrc;
  const baseFacing = config.baseFacing ?? 'left';
  const facingScale = position.facing === baseFacing ? 1 : -1;
  const scale = config.scale ?? 1;
  const depthScale =
    movement === 'flying'
      ? 0.9
      : Math.max(0.78, Math.min(1.08, 0.78 + (position.y - 70) * 0.017));
  const zIndex = movement === 'flying' ? 705 + index : Math.round(510 + position.y + index);
  const yOffsetPx = config.yOffsetPx ?? 0;
  const shadowScale = config.shadowScale ?? 1;

  return (
    <div
      className={`pointer-events-none absolute select-none ${
        isEditing ? 'opacity-55' : 'opacity-100'
      }`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        zIndex,
        transform: `translate(-50%, -100%) translateY(${yOffsetPx}px) scale(${depthScale})`,
        transformOrigin: 'bottom center',
        transitionProperty: 'left, top, opacity',
        transitionDuration: isEditing ? '180ms' : `${movementDurationMs}ms`,
        transitionTimingFunction: 'ease-in-out',
      }}
      role="img"
      aria-label={config.name ? `אורח אישי בשם ${config.name}` : 'אורח אישי'}
    >
      {config.showName !== false && config.name && (
        <div className="absolute -top-6 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-indigo-950/80 px-2 py-0.5 text-[8px] font-black text-white shadow-md sm:text-[10px]">
          {config.name}
        </div>
      )}

      <div
        className={`${isWalking ? 'personal-guest-walking' : 'personal-guest-idle'}`}
        style={{
          width: `clamp(${Math.round(54 * scale)}px, ${Math.max(4.6, 7.2 * scale)}vw, ${Math.round(104 * scale)}px)`,
          transform: `scaleX(${facingScale})`,
          transformOrigin: 'bottom center',
          transition: 'transform 160ms ease-out',
        }}
      >
        <img
          src={currentImageSrc}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="block h-auto w-full max-w-none object-contain drop-shadow-[0_5px_5px_rgba(0,0,0,0.22)]"
        />
      </div>

      <div
        className={`absolute left-1/2 -translate-x-1/2 rounded-[50%] bg-black/35 ${
          movement === 'flying'
            ? '-bottom-5 h-2 opacity-25 blur-[3px]'
            : 'bottom-0 h-1.5 opacity-40 blur-[1.5px]'
        }`}
        style={{ width: `${62 * shadowScale}%` }}
      />
    </div>
  );
}
