import { useEffect, useState } from 'react';

import {
  COMPANION_VISUALS,
  type CompanionStage,
} from '../../data/companionWorlds';
import type { CompanionState } from '../../store/useGameStore';
import CompanionFlourishEffects from './CompanionFlourishEffects';

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
  legendary: 'h-20 w-20 sm:h-28 sm:w-28',
};

const STAGE_LABEL_HE: Record<CompanionStage, string> = {
  egg: 'ביצה קסומה',
  hatchling: 'חיית מחמד קטנטנה',
  young: 'חיית מחמד צעירה',
  grown: 'חיית מחמד בוגרת',
  legendary: 'חיית מחמד אגדית',
};

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export default function RoomCompanion({ companion, isEditing }: Props) {
  const [position, setPosition] = useState<RoomPosition>({
    x: 82,
    y: 84,
    facing: 'left',
  });

  const visuals = companion.theme
    ? COMPANION_VISUALS[companion.theme]
    : null;
  const isEgg = companion.stage === 'egg';
  const isLegendary = companion.stage === 'legendary';
  const isChessPegasus = isLegendary && companion.theme === 'chess';
  const hasLegendaryBond = (companion.unlockedSkills ?? []).includes(
    'legendary_bond'
  );

  useEffect(() => {
    if (!companion.unlocked || !visuals) return;

    if (isEgg) {
      setPosition({ x: 82, y: 84, facing: 'left' });
      return;
    }

    if (isEditing) return;

    let movementTimer: number | undefined;

    function scheduleMove() {
      movementTimer = window.setTimeout(
        () => {
          setPosition(current => {
            const nextX = randomBetween(17, 86);
            const nextY = isChessPegasus
              ? randomBetween(30, 69)
              : randomBetween(74, 89);

            return {
              x: Number(nextX.toFixed(1)),
              y: Number(nextY.toFixed(1)),
              facing: nextX < current.x ? 'left' : 'right',
            };
          });

          scheduleMove();
        },
        randomBetween(4200, 7200)
      );
    }

    scheduleMove();

    return () => {
      if (movementTimer !== undefined) {
        window.clearTimeout(movementTimer);
      }
    };
  }, [companion.unlocked, isChessPegasus, isEditing, isEgg, visuals]);

  if (!companion.unlocked || !visuals) return null;

  const depthScale = isChessPegasus
    ? 0.9
    : Math.max(0.76, Math.min(1.08, 0.76 + (position.y - 70) * 0.018));
  const zIndex = isChessPegasus ? 720 : Math.round(500 + position.y);
  const displayName = companion.name?.trim() || visuals.nameHe;

  return (
    <div
      role="img"
      aria-label={`${STAGE_LABEL_HE[companion.stage]} בשם ${displayName}`}
      className={`pointer-events-none absolute select-none ${
        isEditing ? 'opacity-60' : 'opacity-100'
      }`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        zIndex,
        transform: `translate(-50%, -100%) scale(${depthScale})`,
        transformOrigin: 'bottom center',
        transitionProperty: 'left, top, opacity',
        transitionDuration: isEditing ? '180ms' : '2800ms',
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

      {isLegendary && (
        <div className="absolute -inset-3 animate-pulse rounded-full border border-yellow-200/55 shadow-[0_0_28px_rgba(250,204,21,0.7)]" />
      )}

      {isChessPegasus && (
        <>
          <div className="absolute -left-9 top-1/3 -rotate-12 text-5xl drop-shadow-[0_0_10px_rgba(255,255,255,0.75)] sm:-left-12 sm:text-7xl">
            🪽
          </div>
          <div className="absolute -right-9 top-1/3 rotate-12 scale-x-[-1] text-5xl drop-shadow-[0_0_10px_rgba(255,255,255,0.75)] sm:-right-12 sm:text-7xl">
            🪽
          </div>
        </>
      )}

      <div
        className={`relative flex ${STAGE_SIZE[companion.stage]} animate-[bounce_2.8s_ease-in-out_infinite] items-center justify-center drop-shadow-xl motion-reduce:animate-none`}
        style={{
          transform: `scaleX(${position.facing === 'left' ? -1 : 1})`,
        }}
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
            className={`relative flex h-full w-full flex-col items-center rounded-[48%_48%_43%_43%] border-2 ${
              isLegendary ? 'border-yellow-200/75' : 'border-white/40'
            }`}
            style={{
              background: `radial-gradient(circle at 35% 20%, rgba(255,255,255,0.82), transparent 20%), linear-gradient(145deg, ${visuals.eggColor}, ${visuals.eggColor}a8 58%, rgba(25,12,48,0.94))`,
              boxShadow: `0 0 ${isLegendary ? 28 : 16}px ${visuals.eggColor}85`,
            }}
          >
            <div
              className="absolute -left-1 top-1 h-2/5 w-1/4 -rotate-[25deg] rounded-full border border-white/25"
              style={{ backgroundColor: visuals.eggColor }}
            />
            <div
              className="absolute -right-1 top-1 h-2/5 w-1/4 rotate-[25deg] rounded-full border border-white/25"
              style={{ backgroundColor: visuals.eggColor }}
            />

            {(companion.stage === 'grown' || isLegendary) && (
              <div className="absolute -top-4 z-20 text-lg sm:-top-6 sm:text-2xl">
                👑
              </div>
            )}

            <div className="relative z-10 mt-[28%] flex gap-2 sm:gap-3">
              <div className="flex h-3 w-3 items-center justify-center rounded-full bg-white sm:h-4 sm:w-4">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-950" />
              </div>
              <div className="flex h-3 w-3 items-center justify-center rounded-full bg-white sm:h-4 sm:w-4">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-950" />
              </div>
            </div>

            <div className="relative z-10 mt-1 h-1.5 w-4 rounded-b-full border-b-2 border-indigo-950/80" />
            <div className="relative z-10 mt-auto mb-1 text-sm drop-shadow-md sm:mb-2 sm:text-xl">
              {visuals.motif}
            </div>
          </div>
        )}
      </div>

      <div
        className={`absolute left-1/2 h-2 -translate-x-1/2 rounded-[50%] bg-black/35 blur-[2px] ${
          isChessPegasus ? '-bottom-7 w-16 opacity-50' : '-bottom-1 w-4/5'
        }`}
      />
    </div>
  );
}
