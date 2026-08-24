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
  magical: 'h-[4.5rem] w-[4.5rem] sm:h-[6.5rem] sm:w-[6.5rem]',
  legendary: 'h-20 w-20 sm:h-28 sm:w-28',
};

const STAGE_LABEL_HE: Record<CompanionStage, string> = {
  egg: 'ביצה קסומה',
  hatchling: 'חיית מחמד קטנטנה',
  young: 'חיית מחמד צעירה',
  grown: 'חיית מחמד בוגרת',
  magical: 'חיית מחמד קסומה',
  legendary: 'חיית מחמד אגדית',
};

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

const GROUND_WALK_POINTS = [
  // Left side: stay near the front edge so the pet never appears on the table.
  { x: 12, y: 96 },
  { x: 24, y: 95.5 },
  { x: 36, y: 94.5 },

  // Open centre/right floor: allow visible depth changes as well as sideways travel.
  { x: 46, y: 92 },
  { x: 56, y: 89.5 },
  { x: 64, y: 95.5 },
  { x: 73, y: 91 },
  { x: 82, y: 93.5 },
  { x: 90, y: 95.5 },
] as const;

function randomGroundDestination(
  currentX: number,
  currentY: number
): { x: number; y: number } {
  const distantPoints = GROUND_WALK_POINTS.filter(point => {
    const horizontalChange = Math.abs(point.x - currentX);
    const depthChange = Math.abs(point.y - currentY);
    return horizontalChange >= 10 || depthChange >= 2.2;
  });
  const pool = distantPoints.length > 0 ? distantPoints : GROUND_WALK_POINTS;
  const point = pool[Math.floor(Math.random() * pool.length)];

  return {
    x: Math.max(9, Math.min(92, point.x + randomBetween(-2, 2))),
    y: Math.max(88.8, Math.min(96.5, point.y + randomBetween(-0.7, 0.7))),
  };
}

export default function RoomCompanion({ companion, isEditing }: Props) {
  const [isWalking, setIsWalking] = useState(false);
  const [position, setPosition] = useState<RoomPosition>({
    x: 82,
    y: 93.5,
    facing: 'left',
  });
  const positionRef = useRef(position);
  const [movementDurationMs, setMovementDurationMs] = useState(2400);

  const visuals = companion.theme
    ? COMPANION_VISUALS[companion.theme]
    : null;
  const isEgg = companion.stage === 'egg';
  const isMagical = companion.stage === 'magical';
  const isLegendary = companion.stage === 'legendary';
  const isChessPegasus = isLegendary && companion.theme === 'chess';
  const isChessHatchling =
    companion.theme === 'chess' && companion.stage === 'hatchling';
  const isChessYoung =
    companion.theme === 'chess' && companion.stage === 'young';
  const isChessGrown =
    companion.theme === 'chess' && companion.stage === 'grown';
  const isNonChessHatchling =
    companion.theme !== 'chess' && companion.stage === 'hatchling';
  const isNonChessYoung =
    companion.theme !== 'chess' && companion.stage === 'young';
  // New form-1 chess sprite faces right, same as the other frame-based companions.
  const isChessLeftFacingArt = false;
  const isChessKnightHop = isChessHatchling;
  const hasLegendaryBond = (companion.unlockedSkills ?? []).includes(
    'legendary_bond'
  );

  useEffect(() => {
    if (!companion.unlocked || !visuals) return;

    if (isEgg) {
      const eggPosition: RoomPosition = { x: 82, y: 84, facing: 'left' };
      positionRef.current = eggPosition;
      setPosition(eggPosition);
      setIsWalking(false);
      return;
    }

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
      const destination = isChessPegasus
        ? {
            x: randomBetween(17, 86),
            y: randomBetween(30, 69),
          }
        : randomGroundDestination(current.x, current.y);

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
  }, [companion.stage, companion.unlocked, isChessPegasus, isEditing, isEgg, visuals]);

  if (!companion.unlocked || !visuals) return null;

  const depthScale = isChessPegasus
    ? 0.9
    : Math.max(0.76, Math.min(1.08, 0.76 + (position.y - 70) * 0.018));
  const zIndex = isChessPegasus ? 720 : Math.round(500 + position.y);
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
      : isChessYoung || isNonChessYoung
        ? 'h-[9.375rem] w-[9.375rem] sm:h-[12.5rem] sm:w-[12.5rem]'
        : isChessGrown
          ? 'h-[8.5rem] w-[8.5rem] sm:h-44 sm:w-44'
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

      {isMagical && (
        <div className="absolute -inset-3 animate-pulse rounded-full border border-fuchsia-200/50 shadow-[0_0_26px_rgba(216,180,254,0.62)]" />
      )}

      {isLegendary && (
        <div className="absolute -inset-3 animate-pulse rounded-full border border-yellow-200/55 shadow-[0_0_28px_rgba(250,204,21,0.7)]" />
      )}

      {isChessPegasus && (
        <>
          <div className="absolute -left-9 top-1/3 origin-bottom-right animate-[companionWingLeft_1.35s_ease-in-out_infinite] text-5xl drop-shadow-[0_0_10px_rgba(255,255,255,0.75)] motion-reduce:animate-none sm:-left-12 sm:text-7xl">
            🪽
          </div>
          <div className="absolute -right-9 top-1/3 origin-bottom-left animate-[companionWingRight_1.35s_ease-in-out_infinite] text-5xl drop-shadow-[0_0_10px_rgba(255,255,255,0.75)] motion-reduce:animate-none sm:-right-12 sm:text-7xl">
            🪽
          </div>
        </>
      )}

      <div
        className={`companion-motion relative flex overflow-visible ${stageSizeClass} items-center justify-center drop-shadow-xl motion-reduce:animate-none ${
          isChessPegasus
            ? 'animate-[companionLegendaryFloat_2.9s_ease-in-out_infinite]'
            : ''
        }`}
        style={{
          '--companion-facing': facingScale,
          // Ground companions do not use the global float animation anymore,
          // so apply their facing directly instead of relying on a keyframe.
          transform: isChessPegasus ? undefined : `scaleX(${facingScale})`,
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
          isChessPegasus
            ? '-bottom-7 h-2 w-16 opacity-50 blur-[2px]'
            : isChessHatchling
              ? 'bottom-[8%] h-1.5 w-[62%] opacity-45 blur-[1.5px]'
              : '-bottom-1 h-2 w-4/5 blur-[2px]'
        }`}
      />
    </div>
    </>
  );
}
