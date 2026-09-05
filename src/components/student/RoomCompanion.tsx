import { useEffect, useRef, useState, type CSSProperties } from 'react';

import {
  COMPANION_VISUALS,
  getCompanionFormArt,
  type CompanionStage,
} from '../../data/companionWorlds';
import type { CompanionState } from '../../store/useGameStore';
import CompanionFlourishEffects from './CompanionFlourishEffects';
import AnimatedCompanionArt, { CompanionAnimationStyles } from './AnimatedCompanionArt';

type Props = {
  companion: CompanionState;
  isEditing: boolean;
};

type RoomPosition = {
  x: number;
  y: number;
  facing: 'left' | 'right';
};

const STAGE_SIZE: Record<CompanionStage, string> = {
  egg: 'h-12 w-10 sm:h-16 sm:w-14',
  hatchling: 'h-12 w-12 sm:h-16 sm:w-16',
  young: 'h-14 w-14 sm:h-20 sm:w-20',
  grown: 'h-16 w-16 sm:h-24 sm:w-24',
  magical: 'h-56 w-56 sm:h-[18.75rem] sm:w-[18.75rem]',
  legendary: 'h-72 w-72 sm:h-[25.25rem] sm:w-[25.25rem]',
};

const STAGE_LABEL_HE: Record<CompanionStage, string> = {
  egg: 'ביצה קסומה',
  hatchling: 'חיית מחמד קטנטנה',
  young: 'חיית מחמד צעירה',
  grown: 'חיית מחמד בוגרת',
  magical: 'חיית מחמד קסומה',
  legendary: 'חיית מחמד אגדית',
};

/**
 * Visual calibration for full-frame companion sprites.
 *
 * The source PNGs are not trimmed identically: some forms have much more
 * transparent padding, and running poses are often shorter than idle poses.
 * A single CSS box size therefore makes the creature appear to shrink or
 * barely grow even when the evolution stage itself is larger.
 *
 * Keep corrections here instead of scattering theme-specific `if` blocks
 * throughout the renderer. Values are deliberately visual, not canvas-size
 * based: idle and run should read as the same-sized creature in the room.
 */
type CompanionActivityScale = {
  idle: number;
  run: number;
};

const COMPANION_VISUAL_SCALE: Partial<
  Record<string, Partial<Record<CompanionStage, CompanionActivityScale>>>
> = {
  // Space is already approved. Preserve its existing run normalization.
  space: {
    young: { idle: 1, run: 1.2 },
    grown: { idle: 1, run: 1.2 },
    magical: { idle: 1, run: 1.2 },
  },

  // Animals is calibrated against the approved Space and Chess worlds.
  // Target visual progression in the room is approximately:
  // form 1 ~140px -> form 2 ~160px -> form 3 ~190px -> form 4 ~235px.
  animals: {
    hatchling: { idle: 1, run: 1 },
    young: { idle: 1.15, run: 1.29 },
    grown: { idle: 1.075, run: 1.165 },
    magical: { idle: 1.02, run: 1.045 },
  },

  // Music Form 5 has a wider Symphony Halo and grand wings. A small stage
  // scale bump preserves the intended legendary body size in the room.
  music: {
    legendary: { idle: 1.08, run: 1.12 },
  },

  // Books Form 5 uses very large page-wings and an Infinite Library halo.
  // Give the actual owl a modest legendary scale bump so the evolution
  // reads as a bigger creature, not only as bigger effects around it.
  books: {
    legendary: { idle: 1.12, run: 1.14 },
  },

  // Math Form 5 has a wide Infinity Engine and geometric halo.
  // Keep the red panda itself visibly larger than Form 4, not only the effects.
  math: {
    legendary: { idle: 1.12, run: 1.15 },
  },

  // General Form 5 clean rebuild: same calibration for idle/run.
  // The source art is never enlarged; the legendary stage container provides the growth.
  generic: {
    legendary: { idle: 1.05, run: 1.05 },
  },
};

function companionVisualScale(
  theme: string | null | undefined,
  stage: CompanionStage,
  isWalking: boolean
): number {
  if (!theme) return 1;
  const calibration = COMPANION_VISUAL_SCALE[theme]?.[stage];
  if (!calibration) return 1;
  return isWalking ? calibration.run : calibration.idle;
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

type GroundWalkPoint = {
  x: number;
  y: number;
};

const GROUND_WALK_POINTS: readonly GroundWalkPoint[] = [
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

// Large companions visually extend far above their feet. Keeping their anchor
// on the far-left floor makes them look as if they pass through the table.
// Use only the genuinely open centre/right floor for grown+ companions.
const LARGE_COMPANION_WALK_POINTS: readonly GroundWalkPoint[] = [
  { x: 48, y: 95.5 },
  { x: 56, y: 92.5 },
  { x: 64, y: 95.5 },
  { x: 72, y: 91.5 },
  { x: 80, y: 94 },
  { x: 88, y: 95.5 },
] as const;

// Boni's rebuilt legendary form is wider than the earlier worlds and looked as
// if it lived only on the right side of the room. Give it a dedicated route
// that spans the whole open floor while still avoiding obvious table overlap.
const BUILDING_LEGENDARY_WALK_POINTS: readonly GroundWalkPoint[] = [
  { x: 26, y: 95.9 },
  { x: 36, y: 95.1 },
  { x: 46, y: 93.8 },
  { x: 56, y: 91.2 },
  { x: 66, y: 92.5 },
  { x: 76, y: 94.4 },
  { x: 84, y: 95.6 },
] as const;

// Books Form 5 is unusually wide because the Infinite Library halo and page
// wings extend far beyond the owl's body. Keep its anchor inside a dedicated
// safe corridor so the full silhouette stays on-screen and does not enter the
// capybara area on the right.
const BOOKS_LEGENDARY_WALK_POINTS: readonly GroundWalkPoint[] = [
  { x: 38, y: 95.7 },
  { x: 44, y: 94.8 },
  { x: 50, y: 93.4 },
  { x: 56, y: 91.8 },
  { x: 62, y: 92.6 },
  { x: 68, y: 94.2 },
  { x: 72, y: 95.3 },
] as const;

// Math Form 5 is also very wide because the Infinity Engine, Möbius ring and
// polyhedra extend beyond the panda. Give it a safe but useful room corridor.
const MATH_LEGENDARY_WALK_POINTS: readonly GroundWalkPoint[] = [
  // Much wider route: the panda now explores most of the usable floor.
  // The extra range is added mainly on the left, while the right edge is
  // slightly safer so the wide Infinity Engine stays away from the capybara.
  { x: 26, y: 95.9 },
  { x: 34, y: 95.2 },
  { x: 42, y: 94.2 },
  { x: 50, y: 92.8 },
  { x: 58, y: 91.4 },
  { x: 66, y: 92.8 },
  { x: 72, y: 94.4 },
  { x: 75, y: 95.4 },
] as const;

// General Form 5: wide crystal wings, but no giant external effects.
// Use most of the open floor while keeping the right side clear of the capybara.
const GENERIC_LEGENDARY_WALK_POINTS: readonly GroundWalkPoint[] = [
  { x: 29, y: 95.9 },
  { x: 36, y: 95.1 },
  { x: 43, y: 94.2 },
  { x: 50, y: 92.8 },
  { x: 57, y: 91.5 },
  { x: 63, y: 92.8 },
  { x: 68, y: 94.3 },
  { x: 72, y: 95.4 },
] as const;

function getGroundWalkPoints(
  theme: string | null | undefined,
  stage: CompanionStage
): readonly GroundWalkPoint[] {
  if (theme === 'building' && stage === 'legendary') {
    return BUILDING_LEGENDARY_WALK_POINTS;
  }

  if (theme === 'books' && stage === 'legendary') {
    return BOOKS_LEGENDARY_WALK_POINTS;
  }

  if (theme === 'math' && stage === 'legendary') {
    return MATH_LEGENDARY_WALK_POINTS;
  }

  if (theme === 'generic' && stage === 'legendary') {
    return GENERIC_LEGENDARY_WALK_POINTS;
  }

  return ['grown', 'magical', 'legendary'].includes(stage)
    ? LARGE_COMPANION_WALK_POINTS
    : GROUND_WALK_POINTS;
}

function getInitialGroundPosition(
  theme: string | null | undefined,
  stage: CompanionStage
): RoomPosition {
  const points = getGroundWalkPoints(theme, stage);
  const point = points[Math.floor(points.length / 2)] ?? { x: 64, y: 95.5 };

  return {
    x: point.x,
    y: point.y,
    facing: 'left',
  };
}

function randomGroundDestination(
  currentX: number,
  currentY: number,
  availablePoints: readonly GroundWalkPoint[]
): { x: number; y: number } {
  const distantPoints = availablePoints.filter(point => {
    const horizontalChange = Math.abs(point.x - currentX);
    const depthChange = Math.abs(point.y - currentY);
    return horizontalChange >= 10 || depthChange >= 2.2;
  });
  const pool = distantPoints.length > 0 ? distantPoints : availablePoints;
  const point = pool[Math.floor(Math.random() * pool.length)];
  const minX = Math.min(...availablePoints.map(candidate => candidate.x)) - 2.5;
  const maxX = Math.max(...availablePoints.map(candidate => candidate.x)) + 2.5;

  return {
    x: Math.max(minX, Math.min(maxX, point.x + randomBetween(-1.3, 1.3))),
    y: Math.max(90.2, Math.min(96.5, point.y + randomBetween(-0.45, 0.45))),
  };
}

export default function RoomCompanion({ companion, isEditing }: Props) {
  const [isWalking, setIsWalking] = useState(false);
  const [position, setPosition] = useState<RoomPosition>(() =>
    getInitialGroundPosition(companion.theme, companion.stage)
  );
  const positionRef = useRef(position);
  const [movementDurationMs, setMovementDurationMs] = useState(2400);

  const visuals = companion.theme
    ? COMPANION_VISUALS[companion.theme]
    : null;
  const isEgg = companion.stage === 'egg';
  const isMagical = companion.stage === 'magical';
  const isScienceMagical = companion.theme === 'science' && companion.stage === 'magical';
  const isLegendary = companion.stage === 'legendary';
  const isChessHatchling =
    companion.theme === 'chess' && companion.stage === 'hatchling';
  const isChessYoung =
    companion.theme === 'chess' && companion.stage === 'young';
  const isNonChessHatchling =
    companion.theme !== 'chess' && companion.stage === 'hatchling';
  const isNonChessYoung =
    companion.theme !== 'chess' && companion.stage === 'young';
  const isSpaceYoung = companion.theme === 'space' && companion.stage === 'young';
  const visualScale = companionVisualScale(
    companion.theme,
    companion.stage,
    isWalking
  );
  // New form-1 chess sprite faces right, same as the other frame-based companions.
  const isChessLeftFacingArt = false;
  const isChessKnightHop = isChessHatchling;
  const hasLegendaryBond = (companion.unlockedSkills ?? []).includes(
    'legendary_bond'
  );
  const walkPoints = getGroundWalkPoints(companion.theme, companion.stage);
  const walkPointKey = walkPoints.map(point => `${point.x}:${point.y}`).join('|');

  useEffect(() => {
    if (!companion.unlocked || !visuals) return;

    if (isEgg) {
      const eggPosition: RoomPosition = { x: 82, y: 84, facing: 'left' };
      positionRef.current = eggPosition;
      setPosition(eggPosition);
      setIsWalking(false);
      return;
    }

    const groundedPosition = getInitialGroundPosition(
      companion.theme,
      companion.stage
    );
    positionRef.current = groundedPosition;
    setPosition(groundedPosition);

    if (isEditing) {
      setIsWalking(false);
      return;
    }

    let idleTimer: number | undefined;
    let turnTimer: number | undefined;
    let walkingTimer: number | undefined;
    let cancelled = false;

    function scheduleNextMove(delayMs = randomBetween(1300, 3200)) {
      idleTimer = window.setTimeout(beginMove, delayMs);
    }

    function finishWalk(durationMs: number) {
      walkingTimer = window.setTimeout(() => {
        if (cancelled) return;
        setIsWalking(false);
        scheduleNextMove();
      }, durationMs + 80);
    }

    function startWalk(
      destination: { x: number; y: number },
      facing: RoomPosition['facing'],
      durationMs: number
    ) {
      if (cancelled) return;

      const nextPosition: RoomPosition = {
        x: Number(destination.x.toFixed(1)),
        y: Number(destination.y.toFixed(1)),
        facing,
      };

      setMovementDurationMs(durationMs);
      setIsWalking(true);
      positionRef.current = nextPosition;
      setPosition(nextPosition);
      finishWalk(durationMs);
    }

    function beginMove() {
      if (cancelled) return;

      const current = positionRef.current;
      const destination = randomGroundDestination(current.x, current.y, walkPoints);

      const nextFacing: RoomPosition['facing'] =
        destination.x < current.x ? 'left' : 'right';
      const distance = Math.hypot(
        destination.x - current.x,
        (destination.y - current.y) * 1.8
      );
      const durationMs = Math.round(
        Math.max(1500, Math.min(2900, 1250 + distance * 24))
      );

      // Turn first, then start walking. This prevents the 2D sprite from
      // visibly moonwalking when the next destination is behind it.
      if (nextFacing !== current.facing) {
        const turnedPosition: RoomPosition = {
          ...current,
          facing: nextFacing,
        };
        positionRef.current = turnedPosition;
        setPosition(turnedPosition);
        turnTimer = window.setTimeout(() => {
          startWalk(destination, nextFacing, durationMs);
        }, 220);
      } else {
        startWalk(destination, nextFacing, durationMs);
      }
    }

    scheduleNextMove(randomBetween(700, 1500));

    return () => {
      cancelled = true;
      if (idleTimer !== undefined) window.clearTimeout(idleTimer);
      if (turnTimer !== undefined) window.clearTimeout(turnTimer);
      if (walkingTimer !== undefined) window.clearTimeout(walkingTimer);
    };
  }, [companion.stage, companion.theme, companion.unlocked, isEditing, isEgg, visuals, walkPointKey]);

  if (!companion.unlocked || !visuals) return null;

  const depthScale = Math.max(0.76, Math.min(1.08, 0.76 + (position.y - 70) * 0.018));
  const zIndex = Math.round(500 + position.y);
  const displayName = companion.name?.trim() || visuals.nameHe;
  const formArt = companion.theme
    ? getCompanionFormArt(companion.theme, companion.stage)
    : null;
  const hasCustomFormArt = Boolean(
    formArt?.frameAnimation?.staticSrc ||
      formArt?.imageSrc ||
      (formArt?.layers?.length ?? 0) > 0
  );
  const stageSizeClass = isChessHatchling
    ? 'h-20 w-20 sm:h-28 sm:w-28'
    : isNonChessHatchling
      ? 'h-24 w-24 sm:h-36 sm:w-36'
      : isSpaceYoung
        ? 'h-[8.25rem] w-[8.25rem] sm:h-[11rem] sm:w-[11rem]'
      : isChessYoung || isNonChessYoung
        ? 'h-[9.375rem] w-[9.375rem] sm:h-[12.5rem] sm:w-[12.5rem]'
        : companion.stage === 'grown'
          ? 'h-[11.25rem] w-[11.25rem] sm:h-60 sm:w-60'
          : isScienceMagical
            ? 'h-[13.25rem] w-[13.25rem] sm:h-[17.75rem] sm:w-[17.75rem]'
            : STAGE_SIZE[companion.stage];
  const facingScale = isChessLeftFacingArt
    ? position.facing === 'left' ? 1 : -1
    : position.facing === 'left' ? -1 : 1;

  return (
    <>
      <CompanionAnimationStyles />
    <div
      role="img"
      aria-label={`${STAGE_LABEL_HE[companion.stage]} בשם ${displayName}`}
      className={`pointer-events-none absolute overflow-visible select-none ${
        isEditing ? 'opacity-60' : 'opacity-100'
      }`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        zIndex,
        transform: `translate(-50%, -100%) scale(${depthScale})`,
        transformOrigin: 'bottom center',
        transitionProperty: 'left, top, opacity',
        transitionDuration: isEditing ? '180ms' : `${movementDurationMs}ms`,
        transitionTimingFunction: 'ease-in-out',
      }}
    >
      {companion.name?.trim() && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-indigo-950/80 px-2 py-0.5 text-[8px] font-black text-white shadow-md sm:text-[10px]">
          {companion.name}
        </div>
      )}

      <CompanionFlourishEffects
        activeFlourishes={companion.activeFlourishes ?? []}
        variant="room"
      />

      {hasLegendaryBond && (
        <>
          <div className="absolute -inset-5 animate-pulse rounded-full border border-cyan-200/60 shadow-[0_0_32px_rgba(103,232,249,0.68)]" />
          <div className="absolute -left-5 -top-4 animate-bounce text-sm drop-shadow-[0_0_8px_rgba(250,204,21,0.9)]">
            ✨
          </div>
          <div className="absolute -right-4 top-1/3 animate-pulse text-sm drop-shadow-[0_0_8px_rgba(103,232,249,0.9)]">
            ✦
          </div>
        </>
      )}

      {isMagical && !hasCustomFormArt && (
        <div className="absolute -inset-3 animate-pulse rounded-full border border-fuchsia-200/50 shadow-[0_0_26px_rgba(216,180,254,0.62)]" />
      )}

      {isLegendary && companion.theme !== 'generic' && (
        <div className="absolute -inset-3 animate-pulse rounded-full border border-yellow-200/55 shadow-[0_0_28px_rgba(250,204,21,0.7)]" />
      )}

      <div
        className={`companion-motion relative flex overflow-visible ${stageSizeClass} items-center justify-center drop-shadow-xl motion-reduce:animate-none ${
          ''
        }`}
        style={{
          '--companion-facing': facingScale,
          // Ground companions do not use the global float animation anymore,
          // so apply their facing directly instead of relying on a keyframe.
          transform: `scaleX(${facingScale})`,
          transformOrigin: 'center bottom',
        } as CSSProperties}
      >
        {isEgg ? (
          <div
            className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[50%_50%_46%_46%] border-2 border-white/45"
            style={{
              background: `radial-gradient(circle at 32% 24%, rgba(255,255,255,0.85), transparent 24%), linear-gradient(145deg, ${visuals.eggColor}, ${visuals.eggColor}aa 62%, rgba(30,15,55,0.92))`,
              boxShadow: `0 0 18px ${visuals.eggColor}80`,
            }}
          >
            <span className="text-lg drop-shadow-md sm:text-2xl">
              {visuals.motif}
            </span>
          </div>
        ) : (
          <div
            className={`relative flex h-full w-full flex-col items-center overflow-visible rounded-[48%_48%_43%_43%] border-2 ${
              hasCustomFormArt ? 'border-transparent' : isLegendary ? 'border-yellow-200/75' : isMagical ? 'border-fuchsia-200/65' : 'border-white/40'
            }`}
            style={{
              background: hasCustomFormArt
                ? 'transparent'
                : `radial-gradient(circle at 35% 20%, rgba(255,255,255,0.82), transparent 20%), linear-gradient(145deg, ${visuals.eggColor}, ${visuals.eggColor}a8 58%, rgba(25,12,48,0.94))`,
              boxShadow: hasCustomFormArt
                ? 'none'
                : `0 0 ${isLegendary ? 28 : isMagical ? 24 : 16}px ${visuals.eggColor}85`,
            }}
          >
            {hasCustomFormArt ? (
              <div
                className={`absolute z-30 overflow-visible ${
                  isChessHatchling ? '-inset-5 p-5' : 'inset-0'
                } ${isWalking ? 'companion-running' : ''} ${
                  isWalking && isChessKnightHop ? 'companion-knight-hop' : ''
                }`}
                style={
                  visualScale !== 1
                    ? {
                        transform: `scale(${visualScale})`,
                        transformOrigin: 'center bottom',
                      }
                    : undefined
                }
              >
                <AnimatedCompanionArt
                  art={formArt}
                  alt={formArt?.nameHe ?? displayName}
                  stage={companion.stage}
                  motion={false}
                  activity={isWalking ? 'run' : 'idle'}
                />
              </div>
            ) : null}
            <div
              className={`absolute -left-1 top-1 h-2/5 w-1/4 -rotate-[25deg] rounded-full border border-white/25 ${hasCustomFormArt ? 'opacity-0' : ''}`}
              style={{ backgroundColor: visuals.eggColor }}
            />
            <div
              className={`absolute -right-1 top-1 h-2/5 w-1/4 rotate-[25deg] rounded-full border border-white/25 ${hasCustomFormArt ? 'opacity-0' : ''}`}
              style={{ backgroundColor: visuals.eggColor }}
            />

            {!hasCustomFormArt && (companion.stage === 'grown' || isMagical || isLegendary) && (
              <div className="absolute -top-4 z-20 text-lg sm:-top-6 sm:text-2xl">
                👑
              </div>
            )}

            <div className={`relative z-10 mt-[28%] flex gap-2 sm:gap-3 ${hasCustomFormArt ? 'opacity-0' : ''}`}>
              <div className="flex h-3 w-3 items-center justify-center rounded-full bg-white sm:h-4 sm:w-4">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-950" />
              </div>
              <div className="flex h-3 w-3 items-center justify-center rounded-full bg-white sm:h-4 sm:w-4">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-950" />
              </div>
            </div>

            <div className={`relative z-10 mt-1 h-1.5 w-4 rounded-b-full border-b-2 border-indigo-950/80 ${hasCustomFormArt ? 'opacity-0' : ''}`} />
            <div className={`relative z-10 mt-auto mb-1 text-sm drop-shadow-md sm:mb-2 sm:text-xl ${hasCustomFormArt ? 'opacity-0' : ''}`}>
              {visuals.motif}
            </div>
          </div>
        )}
      </div>

      <div
        className={`absolute left-1/2 -translate-x-1/2 rounded-[50%] bg-black/35 ${
          isChessHatchling
            ? 'bottom-[8%] h-1.5 w-[62%] opacity-45 blur-[1.5px]'
            : '-bottom-1 h-2 w-4/5 blur-[2px]'
        }`}
      />
    </div>
    </>
  );
}
