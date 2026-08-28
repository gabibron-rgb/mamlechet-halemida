import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import './KingdomAmbientEvents.css';

type RealmId = 'main' | 'legendary';

type Props = {
  classId: string;
  realm: RealmId;
  stars: number;
  sandboxMode?: boolean;
  paused?: boolean;
};

type AmbientEventId = 'shooting-star' | 'fairy-swarm' | 'floating-island' | 'aurora-sky' | 'meteor-shower' | 'lunar-eclipse' | 'rainbow-storm' | 'magical-fireflies' | 'magic-thunderstorm' | 'crystal-bloom' | 'magical-wind-vortex' | 'enchanted-petal-bloom' | 'interdimensional-portal' | 'magical-winter' | 'celestial-tide' | 'dragon-flight' | 'phoenix-rebirth';
type FairyDepth = 'back' | 'mid' | 'front';

type AmbientEventState = {
  id: AmbientEventId;
  instanceId: number;
  pathIndex: number;
};

type StoredAmbientEventState = {
  lastEventAt?: number;
  lastEventId?: AmbientEventId;
};

type FairyPalette = {
  main: string;
  secondary: string;
  glow: string;
  wing: string;
  hair: string;
};

type FairyFlightPlan = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  x4: number;
  y4: number;
  delay: number;
  duration: number;
  scale: number;
  depth: FairyDepth;
  reverse?: boolean;
  palette: FairyPalette;
  tilt0: number;
  tilt1: number;
  tilt2: number;
  tilt3: number;
  tilt4: number;
};

const STORAGE_PREFIX = 'mamlechet-kingdom-ambient-events-v1';
const REAL_COOLDOWN_MS = 8 * 60 * 1000;
const FAIRY_SWARM_UNLOCK_STARS = 4;
const FLOATING_ISLAND_UNLOCK_STARS = 6;
const DRAGON_FLIGHT_UNLOCK_STARS = 8;
const AURORA_SKY_UNLOCK_STARS = 10;
const PHOENIX_REBIRTH_UNLOCK_STARS = 12;
const METEOR_SHOWER_UNLOCK_STARS = 14;
const LUNAR_ECLIPSE_UNLOCK_STARS = 16;
const RAINBOW_STORM_UNLOCK_STARS = 18;
const MAGICAL_FIREFLIES_UNLOCK_STARS = 20;
const MAGIC_THUNDERSTORM_UNLOCK_STARS = 22;
const CRYSTAL_BLOOM_UNLOCK_STARS = 24;
const MAGICAL_WIND_VORTEX_UNLOCK_STARS = 26;
const ENCHANTED_PETAL_BLOOM_UNLOCK_STARS = 24; // Placeholder; final unlock balance will be set after all events are built.
const INTERDIMENSIONAL_PORTAL_UNLOCK_STARS = 24; // Placeholder; final unlock balance will be set after all events are built.
const MAGICAL_WINTER_UNLOCK_STARS = 24; // Placeholder; final unlock balance will be set after all events are built.
const CELESTIAL_TIDE_UNLOCK_STARS = 24; // Placeholder; final unlock balance will be set after all events are built.

const EVENT_LIFETIME_MS: Record<AmbientEventId, number> = {
  'shooting-star': 5400,
  'fairy-swarm': 9400,
  'floating-island': 22000,
  'aurora-sky': 17000,
  'meteor-shower': 12200,
  'lunar-eclipse': 18400,
  'rainbow-storm': 26800,
  'magical-fireflies': 23200,
  'magic-thunderstorm': 24800,
  'crystal-bloom': 25200,
  'magical-wind-vortex': 25600,
  'enchanted-petal-bloom': 25800,
  'interdimensional-portal': 27400,
  'magical-winter': 26600,
  'celestial-tide': 27200,
  'dragon-flight': 9000,
  'phoenix-rebirth': 10800,
};

const SHOOTING_STAR_PATHS = [
  { startX: -12, startY: 10, dx: 126, dy: 48, rotate: 21 },
  { startX: -16, startY: 27, dx: 132, dy: 39, rotate: 16 },
  { startX: 8, startY: -10, dx: 105, dy: 68, rotate: 31 },
  { startX: 25, startY: -13, dx: 91, dy: 57, rotate: 27 },
] as const;


const FLOATING_ISLAND_ASSET =
  '/assets/class-kingdom/living-world/floating-island/floating-island.png';

const FLOATING_ISLAND_PATHS = [
  {
    x0: -30, x1: 6, x2: 42, x3: 78, x4: 114,
    y0: 12, y1: 12, y2: 12, y3: 12, y4: 12,
    scale0: 0.44, scale1: 0.46, scale2: 0.48, scale3: 0.46, scale4: 0.44,
    tilt0: -0.5, tilt1: -0.15, tilt2: 0.05, tilt3: 0.18, tilt4: 0.05,
  },
  {
    x0: 114, x1: 78, x2: 42, x3: 6, x4: -30,
    y0: 14, y1: 14, y2: 14, y3: 14, y4: 14,
    scale0: 0.45, scale1: 0.47, scale2: 0.49, scale3: 0.47, scale4: 0.45,
    tilt0: 0.4, tilt1: 0.15, tilt2: 0, tilt3: -0.15, tilt4: -0.3,
  },
  {
    x0: -28, x1: 8, x2: 44, x3: 80, x4: 116,
    y0: 17, y1: 17, y2: 17, y3: 17, y4: 17,
    scale0: 0.42, scale1: 0.44, scale2: 0.46, scale3: 0.44, scale4: 0.42,
    tilt0: -0.35, tilt1: 0, tilt2: 0.14, tilt3: 0.06, tilt4: -0.14,
  },
] as const;


const DRAGON_FRAME_ASSETS = [
  '/assets/class-kingdom/living-world/dragon/dragon-wing-up.png',
  '/assets/class-kingdom/living-world/dragon/dragon-wing-mid.png',
  '/assets/class-kingdom/living-world/dragon/dragon-wing-down.png',
  '/assets/class-kingdom/living-world/dragon/dragon-wing-deep.png',
] as const;

const DRAGON_FLIGHT_PATHS = [
  { y0: 31, y1: 22, y2: 35, y3: 19, y4: 27, tilt0: -7, tilt1: 4, tilt2: 9, tilt3: -5, tilt4: 1 },
  { y0: 19, y1: 29, y2: 26, y3: 39, y4: 25, tilt0: 5, tilt1: -5, tilt2: 4, tilt3: 8, tilt4: -3 },
  { y0: 39, y1: 30, y2: 22, y3: 32, y4: 17, tilt0: -3, tilt1: 6, tilt2: -4, tilt3: 5, tilt4: -2 },
] as const;


const PHOENIX_FRAME_ASSETS = [
  '/assets/class-kingdom/living-world/phoenix/phoenix-wing-up.png',
  '/assets/class-kingdom/living-world/phoenix/phoenix-wing-mid.png',
  '/assets/class-kingdom/living-world/phoenix/phoenix-wing-down.png',
] as const;

const PHOENIX_REBORN_ASSET =
  '/assets/class-kingdom/living-world/phoenix/phoenix-wing-reborn.png';

const PHOENIX_FLIGHT_PATHS = [
  { y0: 66, y1: 48, rebirthY: 30, y4: 20, tilt0: -9, tilt1: -2, tilt2: 6, tilt4: -5, rebirthX: 52 },
  { y0: 48, y1: 32, rebirthY: 38, y4: 18, tilt0: -5, tilt1: 5, tilt2: -4, tilt4: 3, rebirthX: 48 },
  { y0: 70, y1: 55, rebirthY: 34, y4: 28, tilt0: -10, tilt1: -4, tilt2: 5, tilt4: -2, rebirthX: 56 },
] as const;


const FAIRY_ASSETS = [
  '/assets/class-kingdom/living-world/fairies/moonlit-fairy.png',
  '/assets/class-kingdom/living-world/fairies/amethyst-fairy.png',
  '/assets/class-kingdom/living-world/fairies/rose-fairy.png',
  '/assets/class-kingdom/living-world/fairies/starlight-fairy.png',
] as const;

const FAIRY_ASSET_SEQUENCE = [0, 1, 2, 3, 0, 2, 1] as const;

const FAIRY_PALETTES: FairyPalette[] = [
  { main: '#8de8ff', secondary: '#436cff', glow: '#9ff4ff', wing: '#dffcff', hair: '#245bd8' },
  { main: '#ff8ed8', secondary: '#a84cff', glow: '#ffd1f5', wing: '#ffe9fb', hair: '#7f2fc5' },
  { main: '#ffe56d', secondary: '#ff9d2f', glow: '#fff0a8', wing: '#fff8d8', hair: '#d2761f' },
  { main: '#89f59c', secondary: '#25b57c', glow: '#c8ffd3', wing: '#e9fff1', hair: '#327f4d' },
  { main: '#c9a7ff', secondary: '#6d55e7', glow: '#eadbff', wing: '#f6efff', hair: '#5840a7' },
  { main: '#80f2e3', secondary: '#1f9db6', glow: '#c6fff7', wing: '#efffff', hair: '#1b7287' },
  { main: '#ffb3a3', secondary: '#f35b72', glow: '#ffd7cc', wing: '#fff0ec', hair: '#a83c52' },
];

const FAIRY_FLIGHT_PLANS: FairyFlightPlan[] = [
  {
    x0: -9, y0: 67, x1: 17, y1: 54, x2: 39, y2: 59, x3: 63, y3: 40, x4: 111, y4: 25,
    delay: 0.15, duration: 7.7, scale: 1.0, depth: 'front', palette: FAIRY_PALETTES[2],
    tilt0: -8, tilt1: 5, tilt2: -4, tilt3: 7, tilt4: -3,
  },
  {
    x0: -12, y0: 35, x1: 19, y1: 31, x2: 46, y2: 44, x3: 72, y3: 31, x4: 112, y4: 36,
    delay: 0.65, duration: 7.0, scale: 0.72, depth: 'mid', palette: FAIRY_PALETTES[0],
    tilt0: -4, tilt1: 4, tilt2: 8, tilt3: -2, tilt4: 3,
  },
  {
    x0: 109, y0: 62, x1: 83, y1: 53, x2: 63, y2: 60, x3: 41, y3: 46, x4: -11, y4: 42,
    delay: 1.15, duration: 7.5, scale: 0.82, depth: 'front', reverse: true, palette: FAIRY_PALETTES[1],
    tilt0: 6, tilt1: -4, tilt2: 6, tilt3: -7, tilt4: -2,
  },
  {
    x0: -8, y0: 22, x1: 21, y1: 19, x2: 48, y2: 29, x3: 70, y3: 20, x4: 109, y4: 17,
    delay: 1.85, duration: 6.5, scale: 0.48, depth: 'back', palette: FAIRY_PALETTES[4],
    tilt0: -2, tilt1: 5, tilt2: -6, tilt3: 3, tilt4: 0,
  },
  {
    x0: 107, y0: 29, x1: 83, y1: 36, x2: 65, y2: 31, x3: 43, y3: 38, x4: -10, y4: 24,
    delay: 2.3, duration: 6.9, scale: 0.55, depth: 'back', reverse: true, palette: FAIRY_PALETTES[5],
    tilt0: 4, tilt1: -3, tilt2: 5, tilt3: -5, tilt4: 2,
  },
  {
    x0: -12, y0: 78, x1: 15, y1: 70, x2: 35, y2: 72, x3: 56, y3: 60, x4: 111, y4: 67,
    delay: 2.75, duration: 6.6, scale: 0.66, depth: 'mid', palette: FAIRY_PALETTES[3],
    tilt0: -7, tilt1: 4, tilt2: -3, tilt3: 6, tilt4: -4,
  },
  {
    x0: 108, y0: 78, x1: 83, y1: 67, x2: 61, y2: 72, x3: 44, y3: 58, x4: -9, y4: 64,
    delay: 3.15, duration: 6.2, scale: 0.58, depth: 'mid', reverse: true, palette: FAIRY_PALETTES[6],
    tilt0: 5, tilt1: -3, tilt2: 5, tilt3: -5, tilt4: 1,
  },
];

function readStoredState(storageKey: string): StoredAmbientEventState {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};
    return JSON.parse(raw) as StoredAmbientEventState;
  } catch {
    return {};
  }
}

function saveStoredState(storageKey: string, state: StoredAmbientEventState) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Ambient events are decorative; blocked storage should never affect the kingdom.
  }
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function fairyFlightStyle(plan: FairyFlightPlan): CSSProperties {
  return {
    '--ck-fairy-x0': `${plan.x0}%`,
    '--ck-fairy-y0': `${plan.y0}%`,
    '--ck-fairy-x1': `${plan.x1}%`,
    '--ck-fairy-y1': `${plan.y1}%`,
    '--ck-fairy-x2': `${plan.x2}%`,
    '--ck-fairy-y2': `${plan.y2}%`,
    '--ck-fairy-x3': `${plan.x3}%`,
    '--ck-fairy-y3': `${plan.y3}%`,
    '--ck-fairy-x4': `${plan.x4}%`,
    '--ck-fairy-y4': `${plan.y4}%`,
    '--ck-fairy-delay': `${plan.delay}s`,
    '--ck-fairy-duration': `${plan.duration}s`,
    '--ck-fairy-scale': plan.scale,
    '--ck-fairy-scale-in': plan.scale * 0.72,
    '--ck-fairy-scale-mid': plan.scale * 1.04,
    '--ck-fairy-scale-out': plan.scale * 0.88,
    '--ck-fairy-facing': plan.reverse ? -1 : 1,
    '--ck-fairy-main': plan.palette.main,
    '--ck-fairy-secondary': plan.palette.secondary,
    '--ck-fairy-glow': plan.palette.glow,
    '--ck-fairy-wing': plan.palette.wing,
    '--ck-fairy-hair': plan.palette.hair,
    '--ck-fairy-tilt0': `${plan.tilt0}deg`,
    '--ck-fairy-tilt1': `${plan.tilt1}deg`,
    '--ck-fairy-tilt2': `${plan.tilt2}deg`,
    '--ck-fairy-tilt3': `${plan.tilt3}deg`,
    '--ck-fairy-tilt4': `${plan.tilt4}deg`,
  } as CSSProperties;
}

function FairySprite({ src, reverse = false }: { src: string; reverse?: boolean }) {
  return (
    <span className={`ck-fairy-visual ${reverse ? 'is-reverse' : ''}`} aria-hidden="true">
      <span className="ck-fairy-ribbon" />
      <span className="ck-fairy-halo" />
      <span className="ck-fairy-wing-glimmer ck-fairy-wing-glimmer-left" />
      <span className="ck-fairy-wing-glimmer ck-fairy-wing-glimmer-right" />
      <img className="ck-fairy-image" src={src} alt="" draggable={false} />
      <span className="ck-fairy-pixie-dust">
        {Array.from({ length: 7 }).map((_, index) => (
          <i
            key={index}
            style={{
              '--ck-dust-i': index,
              '--ck-dust-delay': `${index * 0.055}s`,
              '--ck-dust-y': `${((index * 17) % 25) - 12}px`,
              '--ck-dust-dy': `${(((index * 17) % 25) - 12) * 0.55}px`,
              '--ck-dust-size': `${2 + (index % 3)}px`,
            } as CSSProperties}
          />
        ))}
      </span>
    </span>
  );
}

function FairySwarmEvent({ realm, instanceId }: { realm: RealmId; instanceId: number }) {
  return (
    <div key={instanceId} className={`ck-live-event ck-live-event-fairy-swarm is-${realm}`} aria-hidden="true">
      <div className="ck-fairy-swarm-veil" />
      <div className="ck-fairy-entry-glow ck-fairy-entry-glow-left" />
      <div className="ck-fairy-entry-glow ck-fairy-entry-glow-right" />

      {FAIRY_FLIGHT_PLANS.map((plan, index) => (
        <div
          key={index}
          className={`ck-fairy-flight is-${plan.depth} ${plan.reverse ? 'is-reverse' : ''}`}
          style={fairyFlightStyle(plan)}
        >
          <FairySprite
            reverse={plan.reverse}
            src={FAIRY_ASSETS[FAIRY_ASSET_SEQUENCE[index] ?? 0]}
          />
        </div>
      ))}

      <div className="ck-fairy-swarm-spark-field">
        {Array.from({ length: 28 }).map((_, index) => (
          <i
            key={index}
            style={{
              '--ck-field-x': `${7 + ((index * 37) % 87)}%`,
              '--ck-field-y': `${13 + ((index * 53) % 73)}%`,
              '--ck-field-delay': `${0.9 + (index % 9) * 0.36}s`,
              '--ck-field-size': `${1 + (index % 4)}px`,
            } as CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}

function DragonSprite() {
  return (
    <span className="ck-dragon-visual" aria-hidden="true">
      <span className="ck-dragon-aura" />
      <span className="ck-dragon-wing-energy ck-dragon-wing-energy-left" />
      <span className="ck-dragon-wing-energy ck-dragon-wing-energy-right" />
      <span className="ck-dragon-frame-stack">
        {DRAGON_FRAME_ASSETS.map((src, index) => (
          <img
            key={src}
            className={`ck-dragon-image ck-dragon-frame ck-dragon-frame-${index + 1}`}
            src={src}
            alt=""
            draggable={false}
          />
        ))}
      </span>
      <span className="ck-dragon-breath">
        <span className="ck-dragon-breath-core" />
        <span className="ck-dragon-breath-glow" />
        <span className="ck-dragon-breath-sparks">
          {Array.from({ length: 24 }).map((_, index) => (
            <i
              key={index}
              style={{
                '--ck-dragon-spark-i': index,
                '--ck-dragon-spark-y': `${((index * 19) % 39) - 19}px`,
                '--ck-dragon-spark-size': `${2 + (index % 5)}px`,
              } as CSSProperties}
            />
          ))}
        </span>
      </span>
    </span>
  );
}

function DragonFlightEvent({ realm, instanceId, pathIndex }: { realm: RealmId; instanceId: number; pathIndex: number }) {
  const path = DRAGON_FLIGHT_PATHS[pathIndex] ?? DRAGON_FLIGHT_PATHS[0];
  const style = {
    '--ck-dragon-y0': `${path.y0}%`,
    '--ck-dragon-y1': `${path.y1}%`,
    '--ck-dragon-y2': `${path.y2}%`,
    '--ck-dragon-y3': `${path.y3}%`,
    '--ck-dragon-y4': `${path.y4}%`,
    '--ck-dragon-tilt0': `${path.tilt0}deg`,
    '--ck-dragon-tilt1': `${path.tilt1}deg`,
    '--ck-dragon-tilt2': `${path.tilt2}deg`,
    '--ck-dragon-tilt3': `${path.tilt3}deg`,
    '--ck-dragon-tilt4': `${path.tilt4}deg`,
  } as CSSProperties;

  return (
    <div key={instanceId} className={`ck-live-event ck-live-event-dragon-flight is-${realm}`} style={style} aria-hidden="true">
      <div className="ck-dragon-world-dim" />
      <div className="ck-dragon-world-flash" />
      <div className="ck-dragon-ground-shadow" />
      <div className="ck-dragon-flight">
        <span className="ck-dragon-magic-trail">
          {Array.from({ length: 28 }).map((_, index) => (
            <i
              key={index}
              style={{
                '--ck-dragon-trail-i': index,
                '--ck-dragon-trail-y': `${((index * 23) % 33) - 16}px`,
                '--ck-dragon-trail-size': `${2 + (index % 5)}px`,
              } as CSSProperties}
            />
          ))}
        </span>
        <DragonSprite />
      </div>
    </div>
  );
}


function FloatingIslandEvent({
  realm,
  instanceId,
  pathIndex,
}: {
  realm: RealmId;
  instanceId: number;
  pathIndex: number;
}) {
  const path = FLOATING_ISLAND_PATHS[pathIndex] ?? FLOATING_ISLAND_PATHS[0];
  const style = {
    '--ck-island-x0': `${path.x0}%`,
    '--ck-island-x1': `${path.x1}%`,
    '--ck-island-x2': `${path.x2}%`,
    '--ck-island-x3': `${path.x3}%`,
    '--ck-island-x4': `${path.x4}%`,
    '--ck-island-y0': `${path.y0}%`,
    '--ck-island-y1': `${path.y1}%`,
    '--ck-island-y2': `${path.y2}%`,
    '--ck-island-y3': `${path.y3}%`,
    '--ck-island-y4': `${path.y4}%`,
    '--ck-island-scale0': path.scale0,
    '--ck-island-scale1': path.scale1,
    '--ck-island-scale2': path.scale2,
    '--ck-island-scale3': path.scale3,
    '--ck-island-scale4': path.scale4,
    '--ck-island-tilt0': `${path.tilt0}deg`,
    '--ck-island-tilt1': `${path.tilt1}deg`,
    '--ck-island-tilt2': `${path.tilt2}deg`,
    '--ck-island-tilt3': `${path.tilt3}deg`,
    '--ck-island-tilt4': `${path.tilt4}deg`,
  } as CSSProperties;

  return (
    <div
      key={instanceId}
      className={`ck-live-event ck-live-event-floating-island is-${realm}`}
      style={style}
      aria-hidden="true"
    >
      <div className="ck-floating-island-sky-haze" />
      <div className="ck-floating-island-flight">
        <span className="ck-floating-island-shadow" />
        <span className="ck-floating-island-cloud ck-floating-island-cloud-1" />
        <span className="ck-floating-island-cloud ck-floating-island-cloud-2" />
        <span className="ck-floating-island-cloud ck-floating-island-cloud-3" />
        <span className="ck-floating-island-visual">
          <span className="ck-floating-island-magic-ring" />
          <span className="ck-floating-island-crystal-glow" />
          <img
            className="ck-floating-island-image"
            src={FLOATING_ISLAND_ASSET}
            alt=""
            draggable={false}
          />
          <span className="ck-floating-island-waterfall ck-floating-island-waterfall-wide" />
          <span className="ck-floating-island-waterfall ck-floating-island-waterfall-core" />
          <span className="ck-floating-island-waterfall-mist" />
          <span className="ck-floating-island-motes">
            {Array.from({ length: 22 }).map((_, index) => (
              <i
                key={index}
                style={{
                  '--ck-island-mote-i': index,
                  '--ck-island-mote-x': `${14 + ((index * 37) % 72)}%`,
                  '--ck-island-mote-y': `${22 + ((index * 43) % 60)}%`,
                  '--ck-island-mote-size': `${1 + (index % 4)}px`,
                  '--ck-island-mote-delay': `${(index % 9) * 0.17}s`,
                } as CSSProperties}
              />
            ))}
          </span>
        </span>
      </div>
      <div className="ck-floating-island-midpoint-glow" />
    </div>
  );
}


function AuroraSkyEvent({
  realm,
  instanceId,
}: {
  realm: RealmId;
  instanceId: number;
}) {
  const stars = Array.from({ length: 68 });

  return (
    <div
      key={instanceId}
      className={`ck-live-event ck-live-event-aurora-sky is-${realm}`}
      aria-hidden="true"
    >
      <div className="ck-aurora-night-tint" />
      <div className="ck-aurora-starfield">
        {stars.map((_, index) => (
          <i
            key={index}
            style={{
              '--ck-aurora-star-x': `${4 + ((index * 37) % 92)}%`,
              '--ck-aurora-star-y': `${3 + ((index * 53) % 52)}%`,
              '--ck-aurora-star-size': `${1.1 + (index % 5) * 0.58}px`,
              '--ck-aurora-star-delay': `${(index % 17) * 0.16}s`,
              '--ck-aurora-star-drift': `${((index * 13) % 13) - 6}px`,
            } as CSSProperties}
          />
        ))}
      </div>
      <div className="ck-aurora-real-lights">
        <img
          className="ck-aurora-real-image ck-aurora-real-image-main"
          src="/assets/class-kingdom/living-world/aurora/aurora-borealis.png"
          alt=""
          draggable={false}
        />
        <img
          className="ck-aurora-real-image ck-aurora-real-image-secondary"
          src="/assets/class-kingdom/living-world/aurora/aurora-borealis.png"
          alt=""
          draggable={false}
        />
        <img
          className="ck-aurora-real-image ck-aurora-real-image-tertiary"
          src="/assets/class-kingdom/living-world/aurora/aurora-borealis.png"
          alt=""
          draggable={false}
        />
      </div>
      <div className="ck-aurora-horizon-glow" />
      <div className="ck-aurora-kingdom-shimmer" />
      <div className="ck-aurora-celestial-pulse" />
    </div>
  );
}


function LunarEclipseEvent({
  realm,
  instanceId,
}: {
  realm: RealmId;
  instanceId: number;
}) {
  return (
    <div
      key={instanceId}
      className={`ck-live-event ck-live-event-lunar-eclipse is-${realm}`}
      aria-hidden="true"
    >
      <div className="ck-eclipse-world-dim" />
      <div className="ck-eclipse-sky-stage">
        <img className="ck-eclipse-sky-frame ck-eclipse-sky-dark" src="/assets/class-kingdom/living-world/eclipse/eclipse-sky-dark.png" alt="" draggable={false} />
        <img className="ck-eclipse-sky-frame ck-eclipse-sky-full" src="/assets/class-kingdom/living-world/eclipse/eclipse-full-moon.png" alt="" draggable={false} />
        <img className="ck-eclipse-sky-frame ck-eclipse-sky-partial" src="/assets/class-kingdom/living-world/eclipse/eclipse-partial.png" alt="" draggable={false} />
        <img className="ck-eclipse-sky-frame ck-eclipse-sky-near-total" src="/assets/class-kingdom/living-world/eclipse/eclipse-near-total.png" alt="" draggable={false} />
        <img className="ck-eclipse-sky-frame ck-eclipse-sky-blood" src="/assets/class-kingdom/living-world/eclipse/eclipse-blood-moon.png" alt="" draggable={false} />
      </div>
      <div className="ck-eclipse-totality-ambient" />
    </div>
  );
}


function RainbowStormEvent({
  realm,
  instanceId,
}: {
  realm: RealmId;
  instanceId: number;
}) {
  const raindrops = Array.from({ length: 34 });
  const sparkles = Array.from({ length: 24 });

  return (
    <div
      key={instanceId}
      className={`ck-live-event ck-live-event-rainbow-storm is-${realm}`}
      aria-hidden="true"
    >
      <div className="ck-rainbow-storm-sky-dim" />
      <div className="ck-rainbow-storm-clouds ck-rainbow-storm-clouds-back" />
      <div className="ck-rainbow-storm-clouds ck-rainbow-storm-clouds-front" />
      <div className="ck-rainbow-storm-flash" />

      <div className="ck-rainbow-storm-rain">
        {raindrops.map((_, index) => (
          <i
            key={index}
            style={{
              '--ck-rain-x': `${2 + ((index * 37) % 96)}%`,
              '--ck-rain-y': `${-8 - ((index * 19) % 32)}%`,
              '--ck-rain-delay': `${(index % 11) * 0.13}s`,
              '--ck-rain-duration': `${0.72 + (index % 5) * 0.09}s`,
              '--ck-rain-length': `${10 + (index % 4) * 5}px`,
            } as CSSProperties}
          />
        ))}
      </div>

      <div className="ck-rainbow-stage">
        <div className="ck-rainbow-sunbreak" />
        <img
          className="ck-rainbow-double-arc ck-rainbow-double-arc-glow"
          src="/assets/class-kingdom/living-world/rainbow/magical-double-rainbow.svg"
          alt=""
          draggable={false}
        />
        <img
          className="ck-rainbow-double-arc ck-rainbow-double-arc-main"
          src="/assets/class-kingdom/living-world/rainbow/magical-double-rainbow.svg"
          alt=""
          draggable={false}
        />
        <span className="ck-rainbow-sparkles">
          {sparkles.map((_, index) => {
            const x = 6 + ((index * 41) % 88);
            const centered = (x - 50) / 50;
            const y = 43 - (1 - centered * centered) * 31 + ((index % 3) - 1) * 2;
            return (
              <i
                key={index}
                style={{
                  '--ck-rainbow-sparkle-x': `${x}%`,
                  '--ck-rainbow-sparkle-y': `${y}%`,
                  '--ck-rainbow-sparkle-delay': `${10.2 + (index % 8) * 0.48}s`,
                  '--ck-rainbow-sparkle-size': `${2 + (index % 4)}px`,
                } as CSSProperties}
              />
            );
          })}
        </span>
      </div>

      <div className="ck-rainbow-world-warmth" />
    </div>
  );
}


function MagicalFirefliesEvent({
  realm,
  instanceId,
}: {
  realm: RealmId;
  instanceId: number;
}) {
  const fireflies = Array.from({ length: 64 });
  const swirlFireflies = Array.from({ length: 12 });
  const peakRiseFireflies = Array.from({ length: 20 });

  return (
    <div
      key={instanceId}
      className={`ck-live-event ck-live-event-magical-fireflies is-${realm}`}
      aria-hidden="true"
    >
      <div className="ck-firefly-world-tint" />
      <div className="ck-firefly-ground-glow" />

      <div className="ck-firefly-field">
        {fireflies.map((_, index) => {
          const hue = index % 11 === 0 ? 171 : index % 13 === 0 ? 199 : 47 + (index % 5) * 2;
          return (
            <i
              key={index}
              style={{
                '--ck-firefly-x': `${3 + ((index * 37) % 94)}%`,
                '--ck-firefly-y': `${34 + ((index * 43) % 59)}%`,
                '--ck-firefly-size': `${2.45 + (index % 4) * 0.82}px`,
                '--ck-firefly-delay': `${0.8 + (index % 12) * 0.21}s`,
                '--ck-firefly-duration': `${5.4 + (index % 7) * 0.62}s`,
                '--ck-firefly-pulse-delay': `${(index % 8) * 0.17}s`,
                '--ck-firefly-halo-delay': `${(index % 6) * 0.21}s`,
                '--ck-firefly-dx1': `${((index * 17) % 47) - 23}px`,
                '--ck-firefly-dy1': `${-16 - (index % 5) * 6}px`,
                '--ck-firefly-dx2': `${((index * 29) % 65) - 32}px`,
                '--ck-firefly-dy2': `${-38 - (index % 4) * 9}px`,
                '--ck-firefly-dx3': `${((index * 11) % 53) - 26}px`,
                '--ck-firefly-dy3': `${-21 - (index % 6) * 6}px`,
                '--ck-firefly-color': `hsl(${hue} 100% 78%)`,
                '--ck-firefly-glow': `hsl(${hue} 100% 63%)`,
              } as CSSProperties}
            />
          );
        })}
      </div>

      <div className="ck-firefly-peak-rise">
        {peakRiseFireflies.map((_, index) => (
          <i
            key={index}
            style={{
              '--ck-firefly-rise-x': `${7 + ((index * 41) % 87)}%`,
              '--ck-firefly-rise-y': `${76 + ((index * 19) % 19)}%`,
              '--ck-firefly-rise-size': `${3.2 + (index % 4) * 0.78}px`,
              '--ck-firefly-rise-delay': `${(index % 10) * 0.16}s`,
              '--ck-firefly-rise-dx': `${((index * 23) % 63) - 31}px`,
              '--ck-firefly-rise-dy': `${-86 - (index % 6) * 17}px`,
            } as CSSProperties}
          />
        ))}
      </div>

      <div className="ck-firefly-magic-pockets">
        {['a', 'b'].map((pocket, pocketIndex) => (
          <span key={pocket} className={`ck-firefly-swirl is-${pocket}`}>
            {swirlFireflies.map((_, index) => (
              <i
                key={index}
                style={{
                  '--ck-firefly-swirl-angle': `${index * 30 + pocketIndex * 15}deg`,
                  '--ck-firefly-swirl-radius': `${34 + (index % 4) * 10}px`,
                  '--ck-firefly-swirl-delay': `${index * 0.11}s`,
                } as CSSProperties}
              />
            ))}
          </span>
        ))}
      </div>

      <div className="ck-firefly-peak-bloom" />
    </div>
  );
}


function EnchantedPetalBloomEvent({
  realm,
  instanceId,
}: {
  realm: RealmId;
  instanceId: number;
}) {
  const driftingPetals = Array.from({ length: 72 });
  const foregroundPetals = Array.from({ length: 22 });
  const peakPetals = Array.from({ length: 156 });

  // V16.2 — the peak is no longer one central cluster. Ten bloom points fire
  // across the kingdom in a short wave, creating a true whole-world bloom.
  const bloomSites = [
    { x: 13, y: 33, scale: 0.78, delay: 11.90, petalCount: 28, foreground: false },
    { x: 31, y: 42, scale: 0.90, delay: 12.18, petalCount: 24, foreground: true },
    { x: 50, y: 31, scale: 0.84, delay: 12.42, petalCount: 30, foreground: false },
    { x: 70, y: 39, scale: 0.88, delay: 12.08, petalCount: 26, foreground: true },
    { x: 88, y: 31, scale: 0.80, delay: 12.56, petalCount: 28, foreground: false },
    { x: 16, y: 68, scale: 0.92, delay: 12.46, petalCount: 26, foreground: true },
    { x: 37, y: 70, scale: 1.00, delay: 12.72, petalCount: 34, foreground: false },
    { x: 53, y: 61, scale: 1.28, delay: 12.92, petalCount: 28, foreground: true },
    { x: 69, y: 70, scale: 0.94, delay: 12.60, petalCount: 24, foreground: false },
    { x: 85, y: 66, scale: 0.92, delay: 12.26, petalCount: 30, foreground: true },
  ] as const;

  return (
    <div
      key={instanceId}
      className={`ck-live-event ck-live-event-enchanted-petal-bloom is-${realm}`}
      aria-hidden="true"
    >
      <div className="ck-petal-world-warmth" />
      <div className="ck-petal-sun-glow" />

      <div className="ck-petal-breeze-lines">
        {Array.from({ length: 7 }).map((_, index) => (
          <i
            key={index}
            style={{
              '--ck-petal-breeze-y': `${18 + ((index * 11) % 62)}%`,
              '--ck-petal-breeze-delay': `${1.7 + index * 1.48}s`,
              '--ck-petal-breeze-duration': `${4.0 + (index % 3) * 0.55}s`,
              '--ck-petal-breeze-tilt': `${-7 + (index % 5) * 3.1}deg`,
              '--ck-petal-breeze-width': `${31 + (index % 4) * 8}vw`,
            } as CSSProperties}
          />
        ))}
      </div>

      <div className="ck-petal-drift-field">
        {driftingPetals.map((_, index) => {
          const hue = index % 9 === 0 ? 43 : index % 7 === 0 ? 333 : 344 + (index % 4) * 5;
          return (
            <i
              key={index}
              style={{
                '--ck-petal-x': `${2 + ((index * 37) % 96)}%`,
                '--ck-petal-y': `${-8 - ((index * 19) % 24)}%`,
                '--ck-petal-size': `${6 + (index % 6) * 2.1}px`,
                '--ck-petal-delay': `${0.55 + (index % 18) * 0.54}s`,
                '--ck-petal-duration': `${7.4 + (index % 7) * 0.72}s`,
                '--ck-petal-drift-x': `${-62 + ((index * 31) % 125)}px`,
                '--ck-petal-drift-mid': `${-36 + ((index * 23) % 73)}px`,
                '--ck-petal-spin': `${280 + (index % 8) * 92}deg`,
                '--ck-petal-hue': `${hue}`,
              } as CSSProperties}
            />
          );
        })}
      </div>

      <div className="ck-petal-bloom-sites">
        {bloomSites.map((site, siteIndex) => (
          <span
            key={siteIndex}
            className={`ck-petal-bloom-site is-${siteIndex + 1} ${site.foreground ? 'is-foreground' : 'is-background'}`}
            style={{
              '--ck-petal-bloom-x': `${site.x}%`,
              '--ck-petal-bloom-y': `${site.y}%`,
              '--ck-petal-bloom-scale': site.scale,
              '--ck-petal-bloom-delay': `${site.delay}s`,
            } as CSSProperties}
          >
            <em />
            <b />
            {Array.from({ length: site.petalCount }).map((_, petalIndex) => {
              const angle = ((petalIndex * 137.5 + siteIndex * 31) % 360) * Math.PI / 180;
              const baseDistance = site.foreground ? 94 : 76;
              const distance = baseDistance + (petalIndex % 7) * (site.foreground ? 18 : 15);
              return (
                <i
                  key={petalIndex}
                  style={{
                    '--ck-bloom-petal-x': `${Math.cos(angle) * distance}px`,
                    '--ck-bloom-petal-y': `${Math.sin(angle) * distance * 0.70}px`,
                    '--ck-bloom-petal-x-mid': `${Math.cos(angle) * distance * 0.44}px`,
                    '--ck-bloom-petal-y-mid': `${Math.sin(angle) * distance * 0.70 * 0.44}px`,
                    '--ck-bloom-petal-size': `${6.2 + (petalIndex % 6) * 1.8}px`,
                    '--ck-bloom-petal-rotate': `${(petalIndex * 83 + siteIndex * 23) % 360}deg`,
                    '--ck-bloom-petal-delay': `${petalIndex * 0.018}s`,
                  } as CSSProperties}
                />
              );
            })}
          </span>
        ))}
      </div>

      <div className="ck-petal-peak-shower">
        {peakPetals.map((_, index) => {
          const site = bloomSites[index % bloomSites.length];
          const localIndex = Math.floor(index / bloomSites.length);
          const angle = ((index * 149 + localIndex * 37) % 360) * Math.PI / 180;
          const distance = 92 + (index % 9) * 22;
          return (
            <i
              key={index}
              style={{
                '--ck-peak-petal-start-x': `${site.x}%`,
                '--ck-peak-petal-start-y': `${site.y}%`,
                '--ck-peak-petal-x': `${Math.cos(angle) * distance}px`,
                '--ck-peak-petal-y': `${Math.sin(angle) * distance * 0.72}px`,
                '--ck-peak-petal-x-mid': `${Math.cos(angle) * distance * 0.50}px`,
                '--ck-peak-petal-y-mid': `${Math.sin(angle) * distance * 0.72 * 0.50}px`,
                '--ck-peak-petal-size': `${5.8 + (index % 7) * 1.65}px`,
                '--ck-peak-petal-delay': `${13.05 + (index % 23) * 0.031}s`,
                '--ck-peak-petal-rotate': `${(index * 71) % 360}deg`,
              } as CSSProperties}
            />
          );
        })}
      </div>

      <div className="ck-petal-foreground">
        {foregroundPetals.map((_, index) => (
          <i
            key={index}
            style={{
              '--ck-petal-fg-x': `${-12 + ((index * 29) % 116)}%`,
              '--ck-petal-fg-y': `${8 + ((index * 17) % 70)}%`,
              '--ck-petal-fg-size': `${17 + (index % 5) * 5}px`,
              '--ck-petal-fg-delay': `${8.2 + (index % 11) * 0.56}s`,
              '--ck-petal-fg-duration': `${4.5 + (index % 4) * 0.55}s`,
              '--ck-petal-fg-rise': `${-54 + (index % 6) * 22}px`,
              '--ck-petal-fg-spin': `${430 + (index % 7) * 110}deg`,
            } as CSSProperties}
          />
        ))}
      </div>

      <div className="ck-petal-peak-bloom" />
      <div className="ck-petal-final-sparkle" />
    </div>
  );
}


function InterdimensionalPortalEvent({
  realm,
  instanceId,
}: {
  realm: RealmId;
  instanceId: number;
}) {
  const suctionMotes = Array.from({ length: 96 });
  const orbitSparks = Array.from({ length: 48 });
  const runes = Array.from({ length: 28 });
  const collapseFragments = Array.from({ length: 124 });

  return (
    <div
      key={instanceId}
      className={`ck-live-event ck-live-event-interdimensional-portal is-${realm}`}
      aria-hidden="true"
    >
      <div className="ck-portal-world-veil" />
      <div className="ck-portal-space-bend is-a" />
      <div className="ck-portal-space-bend is-b" />
      <div className="ck-portal-space-bend is-c" />
      <div className="ck-portal-peak-flash" />

      <div className="ck-portal-suction-field">
        {suctionMotes.map((_, index) => {
          const startX = 3 + ((index * 37) % 94);
          const startY = 12 + ((index * 53) % 76);
          const hue = index % 5 === 0 ? 45 : index % 3 === 0 ? 192 : 268 + (index % 4) * 13;
          return (
            <i
              key={index}
              style={{
                '--ck-portal-mote-x': `${startX}%`,
                '--ck-portal-mote-y': `${startY}%`,
                '--ck-portal-mote-size': `${2.2 + (index % 6) * 0.85}px`,
                '--ck-portal-mote-delay': `${2.1 + (index % 24) * 0.46}s`,
                '--ck-portal-mote-duration': `${5.1 + (index % 7) * 0.48}s`,
                '--ck-portal-mote-spin': `${320 + (index % 9) * 94}deg`,
                '--ck-portal-mote-hue': `${hue}`,
              } as CSSProperties}
            />
          );
        })}
      </div>

      <div className="ck-portal-stage">
        <div className="ck-portal-outer-glow" />
        <div className="ck-portal-ring is-outer" />
        <div className="ck-portal-ring is-middle" />
        <div className="ck-portal-ring is-inner" />

        <div className="ck-portal-runes">
          {runes.map((_, index) => (
            <i
              key={index}
              style={{
                '--ck-portal-rune-angle': `${index * (360 / runes.length)}deg`,
                '--ck-portal-rune-delay': `${(index % 7) * 0.12}s`,
                '--ck-portal-rune-scale': `${0.72 + (index % 4) * 0.14}`,
              } as CSSProperties}
            />
          ))}
        </div>

        <div className="ck-portal-aperture">
          <div className="ck-portal-other-world">
            <span className="ck-portal-other-moon" />
            <span className="ck-portal-other-nebula" />
            <span className="ck-portal-other-horizon" />
            <span className="ck-portal-other-island is-one" />
            <span className="ck-portal-other-island is-two" />
            <span className="ck-portal-other-island is-three" />
            <span className="ck-portal-other-stars">
              {Array.from({ length: 42 }).map((_, index) => (
                <i
                  key={index}
                  style={{
                    '--ck-portal-star-x': `${4 + ((index * 47) % 92)}%`,
                    '--ck-portal-star-y': `${5 + ((index * 31) % 66)}%`,
                    '--ck-portal-star-size': `${1 + (index % 4) * 0.8}px`,
                    '--ck-portal-star-delay': `${(index % 11) * 0.17}s`,
                  } as CSSProperties}
                />
              ))}
            </span>
          </div>
        </div>

        <div className="ck-portal-orbit-sparks">
          {orbitSparks.map((_, index) => (
            <i
              key={index}
              style={{
                '--ck-portal-orbit-angle': `${index * (360 / orbitSparks.length)}deg`,
                '--ck-portal-orbit-radius': `clamp(${108 + (index % 6) * 7}px, ${13.8 + (index % 6) * 0.8}vw, ${190 + (index % 6) * 13}px)`,
                '--ck-portal-orbit-delay': `${(index % 12) * 0.11}s`,
                '--ck-portal-orbit-size': `${2 + (index % 5) * 0.9}px`,
              } as CSSProperties}
            />
          ))}
        </div>

        <div className="ck-portal-energy-arcs">
          {Array.from({ length: 8 }).map((_, index) => (
            <i
              key={index}
              style={{
                '--ck-portal-arc-rotate': `${index * 45 + (index % 3) * 11}deg`,
                '--ck-portal-arc-delay': `${8.6 + (index % 5) * 0.41}s`,
                '--ck-portal-arc-scale': `${0.82 + (index % 4) * 0.10}`,
              } as CSSProperties}
            />
          ))}
        </div>
      </div>

      <div className="ck-portal-collapse-burst">
        <span className="ck-portal-collapse-core" />
        {collapseFragments.map((_, index) => {
          const angle = ((index * 137.5) % 360) * Math.PI / 180;
          const distance = 96 + (index % 13) * 24;
          return (
            <i
              key={index}
              style={{
                '--ck-portal-burst-x': `${Math.cos(angle) * distance}px`,
                '--ck-portal-burst-y': `${Math.sin(angle) * distance * 0.68}px`,
                '--ck-portal-burst-size': `${2.6 + (index % 7) * 1.05}px`,
                '--ck-portal-burst-delay': `${(index % 17) * 0.012}s`,
                '--ck-portal-burst-rotate': `${(index * 79) % 360}deg`,
              } as CSSProperties}
            />
          );
        })}
      </div>
    </div>
  );
}


function MagicalWinterEvent({
  realm,
  instanceId,
}: {
  realm: RealmId;
  instanceId: number;
}) {
  const backSnow = Array.from({ length: 82 });
  const midSnow = Array.from({ length: 104 });
  const frontSnow = Array.from({ length: 46 });
  const frostCrowns = Array.from({ length: 15 });
  const peakBurst = Array.from({ length: 188 });
  const thawSparkles = Array.from({ length: 56 });

  const renderSnow = (flakes: unknown[], layer: 'back' | 'mid' | 'front') => (
    <div className={`ck-winter-snow is-${layer}`}>
      {flakes.map((_, index) => {
        const seed = layer === 'back' ? 17 : layer === 'mid' ? 31 : 47;
        const x = -4 + ((index * seed * 13) % 108);
        const drift = -72 + ((index * (seed + 8)) % 145);
        const sizeBase = layer === 'back' ? 2.1 : layer === 'mid' ? 3.3 : 7.5;
        const sizeStep = layer === 'front' ? 2.25 : 1.15;
        const durationBase = layer === 'back' ? 8.4 : layer === 'mid' ? 6.8 : 5.5;
        return (
          <i
            key={index}
            style={{
              '--ck-winter-snow-x': `${x}%`,
              '--ck-winter-snow-drift': `${drift}px`,
              '--ck-winter-snow-drift-mid': `${drift * 0.55}px`,
              '--ck-winter-snow-size': `${sizeBase + (index % 6) * sizeStep}px`,
              '--ck-winter-snow-duration': `${durationBase + (index % 7) * 0.48}s`,
              '--ck-winter-snow-delay': `${-((index * 0.43) % 8.5)}s`,
              '--ck-winter-snow-spin': `${220 + (index % 9) * 54}deg`,
              '--ck-winter-snow-spin-mid': `${(220 + (index % 9) * 54) * 0.55}deg`,
              '--ck-winter-snow-opacity': `${0.46 + (index % 5) * 0.12}`,
            } as CSSProperties}
          />
        );
      })}
    </div>
  );

  return (
    <div
      key={instanceId}
      className={`ck-live-event ck-live-event-magical-winter is-${realm}`}
      aria-hidden="true"
    >
      <div className="ck-winter-world-chill" />
      <div className="ck-winter-sky-haze" />
      <div className="ck-winter-frost-lace" />

      {renderSnow(backSnow, 'back')}
      {renderSnow(midSnow, 'mid')}

      <div className="ck-winter-frost-crowns">
        {frostCrowns.map((_, index) => (
          <span
            key={index}
            style={{
              '--ck-winter-crown-x': `${2 + ((index * 41) % 95)}%`,
              '--ck-winter-crown-y': `${7 + ((index * 17) % 22)}%`,
              '--ck-winter-crown-scale': `${0.65 + (index % 5) * 0.16}`,
              '--ck-winter-crown-delay': `${7.4 + (index % 8) * 0.34}s`,
              '--ck-winter-crown-tilt': `${-18 + ((index * 13) % 36)}deg`,
            } as CSSProperties}
          />
        ))}
      </div>

      <div className="ck-winter-ice-wave is-one" />
      <div className="ck-winter-ice-wave is-two" />
      <div className="ck-winter-ice-wave is-three" />
      <div className="ck-winter-peak-freeze" />
      <div className="ck-winter-peak-flash" />

      <div className="ck-winter-peak-burst">
        {peakBurst.map((_, index) => {
          const site = [
            { x: 14, y: 70 }, { x: 31, y: 38 }, { x: 49, y: 65 },
            { x: 67, y: 35 }, { x: 84, y: 66 }, { x: 54, y: 24 },
          ][index % 6];
          const localIndex = Math.floor(index / 6);
          const angle = ((localIndex * 137.5 + (index % 6) * 29) % 360) * Math.PI / 180;
          const distance = 54 + (localIndex % 12) * 17;
          return (
            <i
              key={index}
              style={{
                '--ck-winter-burst-x0': `${site.x}%`,
                '--ck-winter-burst-y0': `${site.y}%`,
                '--ck-winter-burst-x': `${Math.cos(angle) * distance}px`,
                '--ck-winter-burst-y': `${Math.sin(angle) * distance * 0.72}px`,
                '--ck-winter-burst-size': `${3.2 + (index % 7) * 1.15}px`,
                '--ck-winter-burst-delay': `${14.85 + (index % 29) * 0.035}s`,
                '--ck-winter-burst-spin': `${(index * 83) % 360}deg`,
              } as CSSProperties}
            />
          );
        })}
      </div>

      {renderSnow(frontSnow, 'front')}

      <div className="ck-winter-thaw-sparkles">
        {thawSparkles.map((_, index) => (
          <i
            key={index}
            style={{
              '--ck-winter-thaw-x': `${4 + ((index * 43) % 92)}%`,
              '--ck-winter-thaw-y': `${12 + ((index * 29) % 75)}%`,
              '--ck-winter-thaw-size': `${2 + (index % 5) * 1.3}px`,
              '--ck-winter-thaw-delay': `${20.4 + (index % 13) * 0.11}s`,
            } as CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}


function CelestialTideEvent({
  realm,
  instanceId,
}: {
  realm: RealmId;
  instanceId: number;
}) {
  const waveClasses = ['is-one', 'is-two', 'is-three', 'is-hero'] as const;
  const bubbles = Array.from({ length: 86 });
  const lightFish = Array.from({ length: 34 });
  const foamSpray = Array.from({ length: 108 });
  const peakBurst = Array.from({ length: 96 });
  const afterglow = Array.from({ length: 52 });

  return (
    <div
      key={instanceId}
      className={`ck-live-event ck-live-event-celestial-tide is-${realm}`}
      aria-hidden="true"
    >
      <div className="ck-tide-world-tint" />
      <div className="ck-tide-horizon-glow" />
      <div className="ck-tide-caustics" />

      <div className="ck-tide-ripples">
        {Array.from({ length: 7 }).map((_, index) => (
          <i
            key={index}
            style={{
              '--ck-tide-ripple-x': `${8 + ((index * 31) % 84)}%`,
              '--ck-tide-ripple-y': `${50 + ((index * 17) % 34)}%`,
              '--ck-tide-ripple-delay': `${2.2 + index * 0.62}s`,
              '--ck-tide-ripple-scale': `${0.66 + (index % 4) * 0.22}`,
            } as CSSProperties}
          />
        ))}
      </div>

      <div className="ck-tide-bubbles">
        {bubbles.map((_, index) => (
          <i
            key={index}
            style={{
              '--ck-tide-bubble-x': `${2 + ((index * 37) % 96)}%`,
              '--ck-tide-bubble-y': `${48 + ((index * 19) % 48)}%`,
              '--ck-tide-bubble-size': `${2.4 + (index % 7) * 1.25}px`,
              '--ck-tide-bubble-delay': `${5.2 + (index % 23) * 0.23}s`,
              '--ck-tide-bubble-drift': `${-34 + ((index * 29) % 69)}px`,
            } as CSSProperties}
          />
        ))}
      </div>

      <div className="ck-tide-light-fish-field">
        {lightFish.map((_, index) => (
          <span
            key={index}
            className={index % 3 === 0 ? 'is-reverse' : ''}
            style={{
              '--ck-tide-fish-y': `${39 + ((index * 23) % 45)}%`,
              '--ck-tide-fish-size': `${8 + (index % 6) * 2.2}px`,
              '--ck-tide-fish-delay': `${8.1 + (index % 14) * 0.33}s`,
              '--ck-tide-fish-duration': `${5.6 + (index % 5) * 0.65}s`,
            } as CSSProperties}
          />
        ))}
      </div>

      {waveClasses.map((waveClass, index) => {
        const gradientId = `ck-tide-gradient-${instanceId}-${index}`;
        const foamId = `ck-tide-foam-${instanceId}-${index}`;
        const isHeroWave = waveClass === 'is-hero';
        const bodyPath = isHeroWave
          ? 'M-190 510 C-35 454 95 492 225 450 C350 410 470 450 570 414 C650 386 702 356 738 314 C780 265 808 200 870 176 C928 153 984 178 1028 226 C1065 267 1095 315 1148 342 C1215 376 1308 384 1410 365 L1410 700 L-190 700 Z'
          : 'M-160 430 C45 305 175 454 330 350 C505 230 650 505 835 338 C998 192 1110 368 1370 272 L1370 700 L-160 700 Z';
        const innerPath = isHeroWave
          ? 'M-120 533 C25 484 135 510 252 476 C367 441 474 470 581 438 C657 415 713 383 756 340 C797 299 829 236 881 215 C928 196 974 213 1011 252 C1043 286 1068 317 1111 339'
          : 'M-110 455 C70 355 205 474 360 383 C525 286 666 518 846 372 C1008 241 1140 402 1320 328';
        const foamPath = isHeroWave
          ? 'M-190 510 C-35 454 95 492 225 450 C350 410 470 450 570 414 C650 386 702 356 738 314 C780 265 808 200 870 176 C928 153 984 178 1028 226 C1065 267 1095 315 1148 342 C1215 376 1308 384 1410 365'
          : 'M-160 430 C45 305 175 454 330 350 C505 230 650 505 835 338 C998 192 1110 368 1370 272';
        return (
          <svg
            key={waveClass}
            className={`ck-tide-wave ${waveClass}`}
            viewBox="0 0 1200 620"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={realm === 'legendary' ? '#8eeaff' : '#8be8ff'} stopOpacity="0.12" />
                <stop offset="0.32" stopColor={realm === 'legendary' ? '#6f8fff' : '#38bdf8'} stopOpacity="0.54" />
                <stop offset="0.70" stopColor={realm === 'legendary' ? '#6948d8' : '#187ac1'} stopOpacity="0.42" />
                <stop offset="1" stopColor="#0a3a79" stopOpacity="0.08" />
              </linearGradient>
              <linearGradient id={foamId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="0.18" stopColor="#f5fdff" stopOpacity="0.90" />
                <stop offset="0.52" stopColor={realm === 'legendary' ? '#e7ddff' : '#dff9ff'} stopOpacity="0.98" />
                <stop offset="0.84" stopColor="#ffffff" stopOpacity="0.84" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              className="ck-tide-wave-body"
              d={bodyPath}
              fill={`url(#${gradientId})`}
            />
            <path
              className="ck-tide-wave-inner"
              d={innerPath}
              fill="none"
            />
            <path
              className="ck-tide-wave-foam"
              d={foamPath}
              fill="none"
              stroke={`url(#${foamId})`}
            />
            {isHeroWave && (
              <>
                <path
                  className="ck-tide-wave-breaker"
                  d="M748 307 C788 254 819 201 872 180 C921 161 970 181 1009 222 C1044 259 1070 296 1107 323"
                  fill="none"
                />
                <path
                  className="ck-tide-wave-breaker is-secondary"
                  d="M834 211 C873 188 914 184 951 197 C985 209 1015 235 1042 269"
                  fill="none"
                />
              </>
            )}
          </svg>
        );
      })}

      <div className="ck-tide-water-sheet" />

      <div className="ck-tide-foam-spray">
        {foamSpray.map((_, index) => (
          <i
            key={index}
            style={{
              '--ck-tide-foam-x': `${index < 76 ? 55 + ((index * 17) % 28) : 3 + ((index * 47) % 94)}%`,
              '--ck-tide-foam-y': `${index < 76 ? 31 + ((index * 13) % 27) : 48 + ((index * 29) % 25)}%`,
              '--ck-tide-foam-size': `${index < 76 ? 4.2 + (index % 9) * 1.55 : 3 + (index % 6) * 1.15}px`,
              '--ck-tide-foam-delay': `${13.9 + (index % 31) * 0.05}s`,
              '--ck-tide-foam-dx': `${index < 76 ? 24 + ((index * 41) % 142) : -52 + ((index * 53) % 105)}px`,
              '--ck-tide-foam-dy': `${index < 76 ? -58 - (index % 10) * 9 : -28 - (index % 7) * 7}px`,
            } as CSSProperties}
          />
        ))}
      </div>

      <div className="ck-tide-peak-flash" />
      <div className="ck-tide-peak-burst">
        {peakBurst.map((_, index) => {
          const site = [
            { x: 10, y: 62 }, { x: 28, y: 47 }, { x: 47, y: 67 },
            { x: 66, y: 45 }, { x: 84, y: 64 }, { x: 56, y: 29 },
          ][index % 6];
          const localIndex = Math.floor(index / 6);
          const angle = ((localIndex * 137.5 + (index % 6) * 21) % 360) * Math.PI / 180;
          const distance = 34 + (localIndex % 10) * 12;
          return (
            <i
              key={index}
              style={{
                '--ck-tide-burst-x0': `${site.x}%`,
                '--ck-tide-burst-y0': `${site.y}%`,
                '--ck-tide-burst-x': `${Math.cos(angle) * distance}px`,
                '--ck-tide-burst-y': `${Math.sin(angle) * distance * 0.65}px`,
                '--ck-tide-burst-size': `${2.6 + (index % 6) * 1.05}px`,
                '--ck-tide-burst-delay': `${16.35 + (index % 25) * 0.045}s`,
              } as CSSProperties}
            />
          );
        })}
      </div>

      <div className="ck-tide-afterglow">
        {afterglow.map((_, index) => (
          <i
            key={index}
            style={{
              '--ck-tide-after-x': `${3 + ((index * 41) % 94)}%`,
              '--ck-tide-after-y': `${32 + ((index * 29) % 59)}%`,
              '--ck-tide-after-size': `${2 + (index % 5) * 1.2}px`,
              '--ck-tide-after-delay': `${19.0 + (index % 17) * 0.17}s`,
            } as CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}

function MagicalWindVortexEvent({
  realm,
  instanceId,
}: {
  realm: RealmId;
  instanceId: number;
}) {
  const windMotes = Array.from({ length: 68 });
  const windLeaves = Array.from({ length: 52 });
  const foregroundLeaves = Array.from({ length: 12 });
  const vortexArms = Array.from({ length: 3 });
  const vortexSparks = Array.from({ length: 38 });

  return (
    <div
      key={instanceId}
      className={`ck-live-event ck-live-event-magical-wind-vortex is-${realm}`}
      aria-hidden="true"
    >
      <div className="ck-wind-world-tint" />
      <div className="ck-wind-sky-haze" />
      <div className="ck-wind-peak-flash" />

      <div className="ck-wind-gust-bands">
        {Array.from({ length: 11 }).map((_, index) => (
          <i
            key={index}
            style={{
              '--ck-wind-gust-y': `${15 + ((index * 9) % 68)}%`,
              '--ck-wind-gust-delay': `${1.1 + (index % 6) * 1.15 + Math.floor(index / 6) * 0.72}s`,
              '--ck-wind-gust-duration': `${3.25 + (index % 5) * 0.42}s`,
              '--ck-wind-gust-width': `${28 + (index % 5) * 7}vw`,
              '--ck-wind-gust-tilt': `${-8 + (index % 6) * 2.7}deg`,
              '--ck-wind-gust-curve': `${34 + (index % 4) * 9}px`,
            } as CSSProperties}
          />
        ))}
      </div>

      <div className="ck-wind-mote-field">
        {windMotes.map((_, index) => {
          const hue = index % 9 === 0 ? 186 : index % 7 === 0 ? 50 : 112 + (index % 5) * 9;
          return (
            <i
              key={index}
              style={{
                '--ck-wind-mote-x': `${3 + ((index * 37) % 94)}%`,
                '--ck-wind-mote-y': `${17 + ((index * 29) % 72)}%`,
                '--ck-wind-mote-size': `${2.2 + (index % 5) * 1.0}px`,
                '--ck-wind-mote-delay': `${0.9 + (index % 17) * 0.29}s`,
                '--ck-wind-mote-duration': `${4.0 + (index % 7) * 0.42}s`,
                '--ck-wind-mote-dx': `${102 + (index % 8) * 21}px`,
                '--ck-wind-mote-dy': `${-34 + ((index * 13) % 69)}px`,
                '--ck-wind-mote-dx-mid': `${(102 + (index % 8) * 21) * 0.45}px`,
                '--ck-wind-mote-dy-mid': `${(-34 + ((index * 13) % 69)) * 0.55}px`,
                '--ck-wind-mote-hue': `${hue}`,
              } as CSSProperties}
            />
          );
        })}
      </div>

      <div className="ck-wind-leaf-field">
        {windLeaves.map((_, index) => (
          <i
            key={index}
            style={{
              '--ck-wind-leaf-y': `${21 + ((index * 31) % 67)}%`,
              '--ck-wind-leaf-delay': `${1.7 + (index % 15) * 0.39}s`,
              '--ck-wind-leaf-duration': `${4.8 + (index % 7) * 0.52}s`,
              '--ck-wind-leaf-size': `${6 + (index % 5) * 2.2}px`,
              '--ck-wind-leaf-rise': `${-38 - (index % 5) * 12}px`,
              '--ck-wind-leaf-rise-mid': `${(-38 - (index % 5) * 12) * -0.42}px`,
              '--ck-wind-leaf-rise-end': `${(-38 - (index % 5) * 12) * 0.55}px`,
              '--ck-wind-leaf-spin': `${330 + (index % 7) * 95}deg`,
              '--ck-wind-leaf-spin-mid-a': `${(330 + (index % 7) * 95) * 0.38}deg`,
              '--ck-wind-leaf-spin-mid-b': `${(330 + (index % 7) * 95) * 0.72}deg`,
            } as CSSProperties}
          />
        ))}
      </div>

      <div className="ck-wind-foreground-leaves">
        {foregroundLeaves.map((_, index) => (
          <i
            key={index}
            style={{
              '--ck-wind-fg-y': `${24 + ((index * 17) % 60)}%`,
              '--ck-wind-fg-delay': `${7.1 + (index % 6) * 1.05}s`,
              '--ck-wind-fg-duration': `${3.7 + (index % 4) * 0.48}s`,
              '--ck-wind-fg-size': `${12 + (index % 4) * 4}px`,
              '--ck-wind-fg-rise': `${-58 + (index % 5) * 27}px`,
              '--ck-wind-fg-rise-mid': `${(-58 + (index % 5) * 27) * -0.52}px`,
              '--ck-wind-fg-rise-end': `${(-58 + (index % 5) * 27) * 0.42}px`,
              '--ck-wind-fg-spin': `${520 + (index % 6) * 130}deg`,
              '--ck-wind-fg-spin-mid-a': `${(520 + (index % 6) * 130) * 0.34}deg`,
              '--ck-wind-fg-spin-mid-b': `${(520 + (index % 6) * 130) * 0.68}deg`,
            } as CSSProperties}
          />
        ))}
      </div>

      <div className="ck-wind-vortex-stage">
        <div className="ck-wind-vortex-aura" />
        <div className="ck-wind-vortex-arms">
          {vortexArms.map((_, index) => (
            <i
              key={index}
              style={{
                '--ck-wind-arm-delay': `${12.05 + index * 0.19}s`,
                '--ck-wind-arm-angle': `${-122 + index * 118}deg`,
                '--ck-wind-arm-length': `${34 + index * 5}vw`,
                '--ck-wind-arm-height': `${11 + index * 2.4}vw`,
                '--ck-wind-arm-scale-start': 0.34 + index * 0.04,
                '--ck-wind-arm-scale-peak': 0.95 + index * 0.08,
              } as CSSProperties}
            >
              <span />
            </i>
          ))}
        </div>
        <div className="ck-wind-vortex-core">
          <span className="is-a" />
          <span className="is-b" />
          <span className="is-c" />
        </div>
        <div className="ck-wind-vortex-sparks">
          {vortexSparks.map((_, index) => {
            const angle = ((index * 137.5) % 360) * Math.PI / 180;
            const distance = 78 + (index % 9) * 18;
            return (
              <i
                key={index}
                style={{
                  '--ck-wind-spark-angle': `${(index * 137.5) % 360}deg`,
                  '--ck-wind-spark-x': `${Math.cos(angle) * distance}px`,
                  '--ck-wind-spark-y': `${Math.sin(angle) * distance * 0.56}px`,
                  '--ck-wind-spark-x-mid': `${Math.cos(angle) * distance * 0.58}px`,
                  '--ck-wind-spark-y-mid': `${Math.sin(angle) * distance * 0.56 * 0.58}px`,
                  '--ck-wind-spark-delay': `${13.0 + (index % 12) * 0.1}s`,
                  '--ck-wind-spark-size': `${3 + (index % 5) * 1.2}px`,
                } as CSSProperties}
              />
            );
          })}
        </div>
      </div>

      <div className="ck-wind-final-sweep">
        <i className="is-one" />
        <i className="is-two" />
        <i className="is-three" />
        <i className="is-four" />
      </div>
    </div>
  );
}


function CrystalBloomEvent({
  realm,
  instanceId,
}: {
  realm: RealmId;
  instanceId: number;
}) {
  const crystals = Array.from({ length: 28 });
  const fragments = Array.from({ length: 46 });
  const heroClusters = [
    { x: 17, y: 69, scale: 1.06, delay: 12.8 },
    { x: 50, y: 65, scale: 1.22, delay: 13.35 },
    { x: 82, y: 70, scale: 1.08, delay: 13.0 },
  ] as const;

  return (
    <div
      key={instanceId}
      className={`ck-live-event ck-live-event-crystal-bloom is-${realm}`}
      aria-hidden="true"
    >
      <div className="ck-crystal-world-tint" />
      <div className="ck-crystal-ground-aura" />
      <div className="ck-crystal-prismatic-flash" />
      <div className="ck-crystal-prismatic-rays" />

      <div className="ck-crystal-field">
        {crystals.map((_, index) => {
          const leftSide = index % 2 === 0;
          const lane = Math.floor(index / 2);
          const x = leftSide
            ? 3 + ((lane * 17) % 43)
            : 54 + ((lane * 19) % 43);
          const y = 61 + ((index * 11) % 27);
          const size = 0.58 + (index % 6) * 0.11;
          const delay = 2.4 + (index % 9) * 0.48 + Math.floor(index / 9) * 0.36;
          const tilt = -8 + ((index * 13) % 17);
          return (
            <span
              key={index}
              className={`ck-crystal-sprout ${index % 5 === 0 ? 'is-bright' : ''}`}
              style={{
                '--ck-crystal-x': `${x}%`,
                '--ck-crystal-y': `${y}%`,
                '--ck-crystal-scale': size,
                '--ck-crystal-delay': `${delay}s`,
                '--ck-crystal-tilt': `${tilt}deg`,
              } as CSSProperties}
            >
              <i className="ck-crystal-shard is-left" />
              <i className="ck-crystal-shard is-main" />
              <i className="ck-crystal-shard is-right" />
              <b className="ck-crystal-glint" />
            </span>
          );
        })}
      </div>

      <div className="ck-crystal-hero-field">
        {heroClusters.map((cluster, index) => (
          <span
            key={index}
            className={`ck-crystal-hero-cluster is-${index + 1}`}
            style={{
              '--ck-crystal-hero-x': `${cluster.x}%`,
              '--ck-crystal-hero-y': `${cluster.y}%`,
              '--ck-crystal-hero-scale': cluster.scale,
              '--ck-crystal-hero-delay': `${cluster.delay}s`,
            } as CSSProperties}
          >
            <i className="ck-crystal-hero-shard is-far-left" />
            <i className="ck-crystal-hero-shard is-left" />
            <i className="ck-crystal-hero-shard is-main" />
            <i className="ck-crystal-hero-shard is-right" />
            <i className="ck-crystal-hero-shard is-far-right" />
            <b className="ck-crystal-hero-core" />
          </span>
        ))}
      </div>

      <div className="ck-crystal-fragments">
        {fragments.map((_, index) => {
          const angle = ((index * 137.5) % 360) * Math.PI / 180;
          const distance = 54 + (index % 9) * 18;
          const originX = [17, 50, 82][index % 3];
          const originY = [69, 65, 70][index % 3];
          return (
            <i
              key={index}
              style={{
                '--ck-crystal-fragment-x': `${originX}%`,
                '--ck-crystal-fragment-y': `${originY}%`,
                '--ck-crystal-fragment-dx': `${Math.cos(angle) * distance}px`,
                '--ck-crystal-fragment-dy': `${Math.sin(angle) * distance - 34}px`,
                '--ck-crystal-fragment-delay': `${15.55 + (index % 8) * 0.075}s`,
                '--ck-crystal-fragment-size': `${3 + (index % 5)}px`,
                '--ck-crystal-fragment-rot': `${(index * 47) % 180}deg`,
              } as CSSProperties}
            />
          );
        })}
      </div>

      <div className="ck-crystal-after-sparkles">
        {Array.from({ length: 36 }).map((_, index) => (
          <i
            key={index}
            style={{
              '--ck-crystal-spark-x': `${4 + ((index * 31) % 92)}%`,
              '--ck-crystal-spark-y': `${48 + ((index * 23) % 42)}%`,
              '--ck-crystal-spark-delay': `${10.8 + (index % 12) * 0.38}s`,
              '--ck-crystal-spark-size': `${2 + (index % 4)}px`,
            } as CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}


function MagicThunderstormEvent({
  realm,
  instanceId,
}: {
  realm: RealmId;
  instanceId: number;
}) {
  const electricMotes = Array.from({ length: 64 });
  const peakSparks = Array.from({ length: 38 });

  const thunderBolts = [
    {
      className: 'is-strike-one',
      main: 'M13 -5 L15 3 L11 7 L17 11 L13 16 L20 19 L16 25 L23 29 L18 34 L25 39 L22 45 L31 50 L27 56 L36 63 L33 69 L41 77',
      branches: 'M17 11 L25 8 L31 10 L36 6 M20 19 L29 22 L35 20 L42 24 M23 29 L13 33 L8 39 M25 39 L36 43 L42 49 M31 50 L20 55 L14 62 M36 63 L46 66 L51 72',
      fine: 'M25 8 L22 3 M31 10 L34 15 M29 22 L26 28 M13 33 L7 31 M36 43 L48 41 M20 55 L18 48 M46 66 L55 64',
    },
    {
      className: 'is-strike-two',
      main: 'M83 -5 L80 2 L85 6 L79 11 L84 15 L77 20 L81 24 L74 29 L79 34 L72 38 L76 44 L68 49 L72 54 L64 59 L69 64 L61 70 L65 77',
      branches: 'M79 11 L69 9 L64 13 M77 20 L88 23 L94 29 M74 29 L64 32 L58 38 M72 38 L82 42 L88 48 M68 49 L58 53 L53 60 M64 59 L74 63 L80 69',
      fine: 'M69 9 L66 4 M88 23 L91 17 M64 32 L59 29 M82 42 L91 40 M58 53 L50 50 M74 63 L79 58',
    },
    {
      className: 'is-strike-three',
      main: 'M47 -6 L43 1 L48 5 L42 9 L46 14 L40 18 L45 22 L38 28 L43 32 L37 37 L42 42 L35 47 L40 53 L33 58 L38 64 L31 70 L36 78',
      branches: 'M42 9 L33 6 L27 10 M40 18 L50 20 L57 26 M38 28 L28 31 L22 37 M37 37 L48 40 L55 46 M35 47 L25 51 L19 58 M33 58 L44 61 L50 68',
      fine: 'M33 6 L31 1 M50 20 L53 15 M28 31 L23 28 M48 40 L58 38 M25 51 L20 47 M44 61 L51 57 M31 70 L25 75',
    },
    {
      className: 'is-strike-four',
      main: 'M67 -5 L70 2 L65 7 L71 12 L66 17 L73 21 L68 27 L75 31 L70 36 L78 41 L72 46 L80 51 L74 57 L82 62 L77 68 L85 77',
      branches: 'M71 12 L81 9 L88 13 M73 21 L62 24 L56 30 M75 31 L86 35 L92 42 M78 41 L67 45 L61 52 M80 51 L90 55 L96 62 M82 62 L72 66 L68 72',
      fine: 'M81 9 L84 4 M62 24 L59 19 M86 35 L94 33 M67 45 L61 42 M90 55 L95 51 M72 66 L66 63',
    },
    {
      className: 'is-prepeak-left',
      main: 'M7 -4 L10 4 L6 9 L13 13 L9 18 L16 22 L12 28 L20 32 L15 38 L24 42 L19 49 L29 54 L24 61 L34 68 L31 77',
      branches: 'M13 13 L24 15 L30 21 M16 22 L6 26 L2 32 M20 32 L31 35 L38 42 M24 42 L13 47 L8 55 M29 54 L41 58 L48 65',
      fine: 'M24 15 L28 10 M6 26 L2 23 M31 35 L37 31 M13 47 L8 44 M41 58 L48 54',
    },
    {
      className: 'is-prepeak-right',
      main: 'M94 -4 L90 4 L95 9 L88 14 L92 19 L85 24 L90 29 L82 34 L87 39 L78 44 L83 50 L73 55 L78 61 L68 68 L71 77',
      branches: 'M88 14 L78 16 L72 22 M85 24 L95 28 L99 34 M82 34 L71 38 L65 45 M78 44 L89 48 L94 55 M73 55 L61 59 L54 66',
      fine: 'M78 16 L74 11 M95 28 L99 25 M71 38 L65 34 M89 48 L94 44 M61 59 L54 55',
    },
    {
      className: 'is-sky-vein-left',
      main: 'M-5 11 L5 8 L12 12 L20 7 L27 11 L35 6 L42 10 L49 5 L56 9',
      branches: 'M12 12 L15 20 L21 25 M27 11 L30 18 L37 22 M42 10 L39 18 L34 24',
      fine: 'M5 8 L7 2 M20 7 L18 1 M35 6 L37 0 M49 5 L52 0',
    },
    {
      className: 'is-sky-vein-right',
      main: 'M105 13 L96 9 L88 13 L80 8 L72 12 L64 7 L56 11 L49 6 L43 10',
      branches: 'M88 13 L85 20 L79 25 M72 12 L69 19 L62 23 M56 11 L60 18 L65 24',
      fine: 'M96 9 L94 3 M80 8 L82 2 M64 7 L62 1 M49 6 L46 0',
    },
    {
      className: 'is-finale-left',
      main: 'M20 -6 L18 1 L22 5 L17 9 L23 13 L18 18 L25 22 L20 27 L28 31 L22 36 L30 41 L24 46 L33 51 L27 57 L36 62 L31 68 L40 78',
      branches: 'M17 9 L8 12 L3 18 M18 18 L30 16 L38 20 M20 27 L10 31 L4 38 M22 36 L34 39 L42 46 M24 46 L13 51 L7 59 M27 57 L40 60 L49 68',
      fine: 'M8 12 L6 7 M30 16 L34 10 M10 31 L4 29 M34 39 L43 36 M13 51 L7 48 M40 60 L48 56 M31 68 L24 74',
    },
    {
      className: 'is-finale-mid-left',
      main: 'M39 -7 L42 0 L37 5 L43 9 L38 14 L45 18 L39 24 L47 28 L40 34 L49 38 L42 44 L51 49 L44 55 L53 61 L47 68 L55 78',
      branches: 'M43 9 L53 7 L60 12 M45 18 L34 21 L28 28 M47 28 L58 31 L65 37 M49 38 L37 43 L31 50 M51 49 L63 53 L70 60 M53 61 L42 66 L36 73',
      fine: 'M53 7 L57 2 M34 21 L30 17 M58 31 L66 27 M37 43 L30 40 M63 53 L72 50 M42 66 L35 63',
    },
    {
      className: 'is-finale-mid-right',
      main: 'M62 -7 L58 0 L63 5 L57 10 L62 15 L55 20 L61 25 L53 31 L59 36 L51 41 L57 46 L48 52 L54 57 L45 63 L51 69 L43 78',
      branches: 'M57 10 L47 8 L40 13 M55 20 L66 23 L73 30 M53 31 L42 35 L35 42 M51 41 L63 45 L70 52 M48 52 L36 56 L29 63 M45 63 L56 67 L63 74',
      fine: 'M47 8 L43 3 M66 23 L70 18 M42 35 L34 32 M63 45 L71 42 M36 56 L28 53 M56 67 L63 63',
    },
    {
      className: 'is-finale-right',
      main: 'M82 -6 L85 1 L80 6 L86 10 L81 15 L88 19 L83 25 L91 29 L85 35 L93 39 L87 45 L95 50 L89 56 L97 61 L91 68 L99 77',
      branches: 'M86 10 L76 12 L70 18 M88 19 L98 23 L103 30 M91 29 L80 33 L74 40 M93 39 L103 44 L108 51 M95 50 L84 54 L78 62 M97 61 L87 65 L82 72',
      fine: 'M76 12 L73 7 M98 23 L101 18 M80 33 L73 30 M103 44 L108 41 M84 54 L77 51 M87 65 L80 62',
    },
    {
      className: 'is-hero',
      main: 'M51 -9 L48 -2 L53 2 L47 7 L54 11 L48 16 L55 20 L47 25 L56 29 L49 34 L58 38 L50 43 L60 48 L51 53 L62 58 L54 63 L65 69 L58 74 L69 80',
      branches: 'M47 7 L35 5 L27 10 L20 9 M54 11 L66 8 L74 12 L82 9 M48 16 L36 20 L29 26 L20 28 M55 20 L68 23 L76 29 L86 31 M47 25 L34 30 L27 37 L17 40 M56 29 L70 34 L79 41 L91 44 M49 34 L36 39 L28 47 L18 51 M58 38 L72 43 L81 51 L93 55 M50 43 L38 49 L30 57 L20 62 M60 48 L74 53 L83 61 L94 66 M51 53 L41 60 L35 68 L27 74 M62 58 L73 63 L80 70 L88 76',
      fine: 'M35 5 L33 -1 M27 10 L24 16 M66 8 L69 1 M74 12 L80 17 M36 20 L32 15 M29 26 L23 23 M68 23 L72 18 M76 29 L83 26 M34 30 L29 27 M27 37 L20 34 M70 34 L77 31 M79 41 L88 38 M36 39 L31 35 M28 47 L21 45 M72 43 L78 39 M81 51 L90 48 M38 49 L34 45 M30 57 L23 54 M74 53 L81 49 M83 61 L92 58 M41 60 L36 56 M35 68 L28 65 M73 63 L79 59 M80 70 L88 68 M58 74 L51 79',
    },
  ] as const;

  return (
    <div
      key={instanceId}
      className={`ck-live-event ck-live-event-magic-thunderstorm is-${realm}`}
      aria-hidden="true"
    >
      <div className="ck-thunder-world-dim" />
      <div className="ck-thunder-cloud-bank ck-thunder-cloud-back" />
      <div className="ck-thunder-cloud-bank ck-thunder-cloud-front" />
      <div className="ck-thunder-world-flashes" />
      <div className="ck-thunder-peak-whiteout" />

      <div className="ck-thunder-lightning-stage">
        {thunderBolts.map((bolt) => (
          <svg
            key={bolt.className}
            className={`ck-thunder-bolt ${bolt.className}`}
            viewBox="0 0 100 78"
            preserveAspectRatio="none"
          >
            <path className="ck-thunder-bolt-glow" d={bolt.main} vectorEffect="non-scaling-stroke" />
            <path className="ck-thunder-bolt-core" d={bolt.main} vectorEffect="non-scaling-stroke" />
            <path className="ck-thunder-bolt-branch" d={bolt.branches} vectorEffect="non-scaling-stroke" />
            <path className="ck-thunder-bolt-branch is-fine" d={bolt.fine} vectorEffect="non-scaling-stroke" />
          </svg>
        ))}
      </div>

      <div className="ck-thunder-electric-motes">
        {electricMotes.map((_, index) => {
          const hue = index % 7 === 0 ? 47 : index % 4 === 0 ? 188 : 244 + (index % 4) * 10;
          return (
            <i
              key={index}
              style={{
                '--ck-thunder-mote-x': `${3 + ((index * 37) % 94)}%`,
                '--ck-thunder-mote-y': `${7 + ((index * 29) % 58)}%`,
                '--ck-thunder-mote-size': `${1.8 + (index % 5) * 0.75}px`,
                '--ck-thunder-mote-delay': `${(index % 15) * 0.12}s`,
                '--ck-thunder-mote-dx': `${((index * 19) % 49) - 24}px`,
                '--ck-thunder-mote-dy': `${-12 - (index % 7) * 6}px`,
                '--ck-thunder-mote-color': `hsl(${hue} 100% 84%)`,
                '--ck-thunder-mote-glow': `hsl(${hue} 100% 66%)`,
              } as CSSProperties}
            />
          );
        })}
      </div>

      <div className="ck-thunder-peak-sparks">
        {peakSparks.map((_, index) => (
          <i
            key={index}
            style={{
              '--ck-thunder-spark-angle': `${(360 / peakSparks.length) * index + (index % 3) * 4}deg`,
              '--ck-thunder-spark-distance': `${-(72 + (index % 7) * 18)}px`,
              '--ck-thunder-spark-delay': `${(index % 6) * 0.03}s`,
              '--ck-thunder-spark-size': `${1.8 + (index % 4) * 0.7}px`,
            } as CSSProperties}
          />
        ))}
      </div>

      <div className="ck-thunder-peak-energy" />
      <div className="ck-thunder-impact-bloom" />
    </div>
  );
}

function MeteorShowerEvent({
  realm,
  instanceId,
}: {
  realm: RealmId;
  instanceId: number;
}) {
  const meteors = Array.from({ length: 20 });
  const meteorDelays = [
    0.70, 1.35, 2.05, 2.82, 3.55,
    4.56, 4.66, 4.78, 4.91, 5.06, 5.24,
    6.48, 6.95, 7.45, 7.98, 8.55, 9.12, 9.62, 10.05, 10.42,
  ] as const;

  return (
    <div
      key={instanceId}
      className={`ck-live-event ck-live-event-meteor-shower is-${realm}`}
      aria-hidden="true"
    >
      <div className="ck-meteor-sky-tint" />
      <div className="ck-meteor-horizon-glow" />
      <div className="ck-meteor-field">
        {meteors.map((_, index) => {
          const isPeak = index >= 5 && index <= 10;
          const isHero = index === 7 || index === 9;
          const isDistant = index === 1 || index === 5 || index === 8 || index === 12 || index === 16 || index === 18;
          const isWarm = index === 3 || index === 9 || index === 14 || index === 19;
          const delay = meteorDelays[index] ?? 0.7 + index * 0.5;
          const startX = -14 + ((index * 29) % 104);
          const startY = 1 + ((index * 17) % 35);
          const distance = isDistant ? 38 + (index % 3) * 5 : 46 + (index % 5) * 7;
          const drop = isDistant ? 16 + (index % 3) * 4 : 21 + (index % 4) * 6;
          const size = isHero ? 1.18 + (index % 2) * 0.12 : isDistant ? 0.46 + (index % 3) * 0.07 : 0.68 + (index % 5) * 0.11;
          const duration = isDistant ? 1.42 + (index % 2) * 0.16 : isHero ? 1.16 : 1.04 + (index % 4) * 0.16;
          const angle = 16 + (index % 7) * 1.7;
          const depthClass = isDistant ? 'is-distant' : isPeak ? 'is-peak' : '';
          const toneClass = isWarm ? 'is-warm' : '';

          return (
            <span
              key={index}
              className={`ck-meteor-streak ${isHero ? 'is-hero' : ''} ${depthClass} ${toneClass}`.trim()}
              style={{
                '--ck-meteor-x': `${startX}%`,
                '--ck-meteor-y': `${startY}%`,
                '--ck-meteor-dx': `${distance}vw`,
                '--ck-meteor-dy': `${drop}vh`,
                '--ck-meteor-delay': `${delay}s`,
                '--ck-meteor-duration': `${duration}s`,
                '--ck-meteor-scale': size,
                '--ck-meteor-angle': `${angle}deg`,
              } as CSSProperties}
            >
              <i className="ck-meteor-tail ck-meteor-tail-wide" />
              <i className="ck-meteor-tail ck-meteor-tail-core" />
              <i className="ck-meteor-head" />
              <span className="ck-meteor-fragments">
                {Array.from({ length: 5 }).map((__, fragmentIndex) => (
                  <b
                    key={fragmentIndex}
                    style={{
                      '--ck-meteor-fragment-i': fragmentIndex,
                      '--ck-meteor-fragment-y': `${-10 + fragmentIndex * 5}px`,
                    } as CSSProperties}
                  />
                ))}
              </span>
            </span>
          );
        })}
      </div>
      <div className="ck-meteor-peak-flash" />
      <div className="ck-meteor-stardust">
        {Array.from({ length: 42 }).map((_, index) => (
          <i
            key={index}
            style={{
              '--ck-dust-x': `${4 + ((index * 37) % 92)}%`,
              '--ck-dust-y': `${3 + ((index * 29) % 46)}%`,
              '--ck-dust-delay': `${1.6 + (index % 12) * 0.55}s`,
              '--ck-dust-size': `${1 + (index % 3)}px`,
            } as CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}


function PhoenixSprite({ reborn = false }: { reborn?: boolean }) {
  return (
    <span className={`ck-phoenix-visual ${reborn ? 'is-reborn' : ''}`} aria-hidden="true">
      <span className="ck-phoenix-aura" />
      <span className="ck-phoenix-frame-stack">
        {PHOENIX_FRAME_ASSETS.map((src, index) => (
          <img
            key={src}
            className={`ck-phoenix-image ck-phoenix-frame ck-phoenix-frame-${index + 1}`}
            src={src}
            alt=""
            draggable={false}
          />
        ))}
        {reborn && (
          <img
            className="ck-phoenix-image ck-phoenix-reborn-image"
            src={PHOENIX_REBORN_ASSET}
            alt=""
            draggable={false}
          />
        )}
      </span>
      <span className="ck-phoenix-tail-ribbon ck-phoenix-tail-ribbon-wide" />
      <span className="ck-phoenix-tail-ribbon ck-phoenix-tail-ribbon-core" />
      <span className="ck-phoenix-trail-particles">
        {Array.from({ length: 30 }).map((_, index) => (
          <i
            key={index}
            style={{
              '--ck-phoenix-trail-i': index,
              '--ck-phoenix-trail-y': `${((index * 29) % 43) - 21}px`,
              '--ck-phoenix-trail-size': `${2 + (index % 5)}px`,
            } as CSSProperties}
          />
        ))}
      </span>
    </span>
  );
}

function PhoenixRebirthEvent({
  realm,
  instanceId,
  pathIndex,
}: {
  realm: RealmId;
  instanceId: number;
  pathIndex: number;
}) {
  const path = PHOENIX_FLIGHT_PATHS[pathIndex] ?? PHOENIX_FLIGHT_PATHS[0];
  const style = {
    '--ck-phoenix-y0': `${path.y0}%`,
    '--ck-phoenix-y1': `${path.y1}%`,
    '--ck-phoenix-rebirth-y': `${path.rebirthY}%`,
    '--ck-phoenix-y4': `${path.y4}%`,
    '--ck-phoenix-tilt0': `${path.tilt0}deg`,
    '--ck-phoenix-tilt1': `${path.tilt1}deg`,
    '--ck-phoenix-tilt2': `${path.tilt2}deg`,
    '--ck-phoenix-tilt4': `${path.tilt4}deg`,
    '--ck-phoenix-rebirth-x': `${path.rebirthX}%`,
  } as CSSProperties;

  return (
    <div
      key={instanceId}
      className={`ck-live-event ck-live-event-phoenix-rebirth is-${realm}`}
      style={style}
      aria-hidden="true"
    >
      <div className="ck-phoenix-world-warmth" />
      <div className="ck-phoenix-world-flash" />

      <div className="ck-phoenix-flight ck-phoenix-flight-pre">
        <PhoenixSprite />
      </div>

      <div className="ck-phoenix-rebirth">
        <span className="ck-phoenix-rebirth-halo" />
        <span className="ck-phoenix-rebirth-ring ck-phoenix-rebirth-ring-1" />
        <span className="ck-phoenix-rebirth-ring ck-phoenix-rebirth-ring-2" />
        <span className="ck-phoenix-rebirth-core" />
        <span className="ck-phoenix-rebirth-wings" />
        <span className="ck-phoenix-rebirth-feathers">
          {Array.from({ length: 18 }).map((_, index) => {
            const angle = (index * Math.PI * 2) / 18;
            const distance = 62 + (index % 5) * 16;
            return (
              <i
                key={index}
                style={{
                  '--ck-phoenix-feather-i': index,
                  '--ck-phoenix-feather-x': `${Math.cos(angle) * distance}px`,
                  '--ck-phoenix-feather-y': `${Math.sin(angle) * distance}px`,
                  '--ck-phoenix-feather-rot': `${(angle * 180) / Math.PI + 35}deg`,
                  '--ck-phoenix-feather-scale': 0.7 + (index % 4) * 0.14,
                } as CSSProperties}
              />
            );
          })}
        </span>
        <span className="ck-phoenix-rebirth-embers">
          {Array.from({ length: 34 }).map((_, index) => {
            const angle = (index * 137.5 * Math.PI) / 180;
            const distance = 28 + (index % 9) * 11;
            return (
              <i
                key={index}
                style={{
                  '--ck-phoenix-ember-i': index,
                  '--ck-phoenix-ember-x': `${Math.cos(angle) * distance}px`,
                  '--ck-phoenix-ember-y': `${Math.sin(angle) * distance}px`,
                  '--ck-phoenix-ember-size': `${2 + (index % 5)}px`,
                } as CSSProperties}
              />
            );
          })}
        </span>
      </div>

      <div className="ck-phoenix-flight ck-phoenix-flight-post">
        <PhoenixSprite reborn />
      </div>

      <div className="ck-phoenix-afterglow">
        {Array.from({ length: 16 }).map((_, index) => (
          <i
            key={index}
            style={{
              '--ck-phoenix-after-i': index,
              '--ck-phoenix-after-x': `${10 + ((index * 31) % 82)}%`,
              '--ck-phoenix-after-y': `${12 + ((index * 47) % 70)}%`,
              '--ck-phoenix-after-size': `${1 + (index % 4)}px`,
            } as CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}

export default function KingdomAmbientEvents({
  classId,
  realm,
  stars,
  sandboxMode = false,
  paused = false,
}: Props) {
  const [activeEvent, setActiveEvent] = useState<AmbientEventState | null>(null);
  const clearTimerRef = useRef<number | null>(null);
  const scheduleTimerRef = useRef<number | null>(null);
  const storageKey = `${STORAGE_PREFIX}:${classId || 'anonymous'}`;

  const canShowShootingStar = sandboxMode || stars >= 1;
  const canShowFairySwarm = sandboxMode || stars >= FAIRY_SWARM_UNLOCK_STARS;
  const canShowFloatingIsland = sandboxMode || stars >= FLOATING_ISLAND_UNLOCK_STARS;
  const canShowDragonFlight = sandboxMode || stars >= DRAGON_FLIGHT_UNLOCK_STARS;
  const canShowAuroraSky = sandboxMode || stars >= AURORA_SKY_UNLOCK_STARS;
  const canShowPhoenixRebirth = sandboxMode || stars >= PHOENIX_REBIRTH_UNLOCK_STARS;
  const canShowMeteorShower = sandboxMode || stars >= METEOR_SHOWER_UNLOCK_STARS;
  const canShowLunarEclipse = sandboxMode || stars >= LUNAR_ECLIPSE_UNLOCK_STARS;
  const canShowRainbowStorm = sandboxMode || stars >= RAINBOW_STORM_UNLOCK_STARS;
  const canShowMagicalFireflies = sandboxMode || stars >= MAGICAL_FIREFLIES_UNLOCK_STARS;
  const canShowMagicThunderstorm = sandboxMode || stars >= MAGIC_THUNDERSTORM_UNLOCK_STARS;
  const canShowCrystalBloom = sandboxMode || stars >= CRYSTAL_BLOOM_UNLOCK_STARS;
  const canShowMagicalWindVortex = sandboxMode || stars >= MAGICAL_WIND_VORTEX_UNLOCK_STARS;
  const canShowEnchantedPetalBloom = sandboxMode || stars >= ENCHANTED_PETAL_BLOOM_UNLOCK_STARS;
  const canShowInterdimensionalPortal = sandboxMode || stars >= INTERDIMENSIONAL_PORTAL_UNLOCK_STARS;
  const canShowMagicalWinter = sandboxMode || stars >= MAGICAL_WINTER_UNLOCK_STARS;
  const canShowCelestialTide = sandboxMode || stars >= CELESTIAL_TIDE_UNLOCK_STARS;

  const clearScheduledTimer = useCallback(() => {
    if (scheduleTimerRef.current !== null) {
      window.clearTimeout(scheduleTimerRef.current);
      scheduleTimerRef.current = null;
    }
  }, []);

  const clearActiveTimer = useCallback(() => {
    if (clearTimerRef.current !== null) {
      window.clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
  }, []);

  const triggerEvent = useCallback((eventId: AmbientEventId, persist = true) => {
    if (paused) return;
    if (eventId === 'shooting-star' && !canShowShootingStar) return;
    if (eventId === 'fairy-swarm' && !canShowFairySwarm) return;
    if (eventId === 'floating-island' && !canShowFloatingIsland) return;
    if (eventId === 'aurora-sky' && !canShowAuroraSky) return;
    if (eventId === 'dragon-flight' && !canShowDragonFlight) return;
    if (eventId === 'phoenix-rebirth' && !canShowPhoenixRebirth) return;
    if (eventId === 'meteor-shower' && !canShowMeteorShower) return;
    if (eventId === 'lunar-eclipse' && !canShowLunarEclipse) return;
    if (eventId === 'rainbow-storm' && !canShowRainbowStorm) return;
    if (eventId === 'magical-fireflies' && !canShowMagicalFireflies) return;
    if (eventId === 'magic-thunderstorm' && !canShowMagicThunderstorm) return;
    if (eventId === 'crystal-bloom' && !canShowCrystalBloom) return;
    if (eventId === 'magical-wind-vortex' && !canShowMagicalWindVortex) return;
    if (eventId === 'enchanted-petal-bloom' && !canShowEnchantedPetalBloom) return;
    if (eventId === 'interdimensional-portal' && !canShowInterdimensionalPortal) return;
    if (eventId === 'magical-winter' && !canShowMagicalWinter) return;
    if (eventId === 'celestial-tide' && !canShowCelestialTide) return;

    clearActiveTimer();
    const pathIndex = eventId === 'shooting-star'
      ? Math.floor(Math.random() * SHOOTING_STAR_PATHS.length)
      : eventId === 'floating-island'
        ? Math.floor(Math.random() * FLOATING_ISLAND_PATHS.length)
        : eventId === 'dragon-flight'
          ? Math.floor(Math.random() * DRAGON_FLIGHT_PATHS.length)
          : eventId === 'phoenix-rebirth'
            ? Math.floor(Math.random() * PHOENIX_FLIGHT_PATHS.length)
            : 0;

    setActiveEvent({
      id: eventId,
      instanceId: Date.now() + Math.floor(Math.random() * 1000),
      pathIndex,
    });

    if (persist && !sandboxMode) {
      saveStoredState(storageKey, {
        lastEventAt: Date.now(),
        lastEventId: eventId,
      });
    }

    clearTimerRef.current = window.setTimeout(() => {
      setActiveEvent(null);
      clearTimerRef.current = null;
    }, EVENT_LIFETIME_MS[eventId]);
  }, [canShowAuroraSky, canShowDragonFlight, canShowFairySwarm, canShowFloatingIsland, canShowLunarEclipse, canShowMagicalFireflies, canShowMagicThunderstorm, canShowCrystalBloom, canShowMagicalWindVortex, canShowEnchantedPetalBloom, canShowInterdimensionalPortal, canShowMagicalWinter, canShowCelestialTide, canShowMeteorShower, canShowPhoenixRebirth, canShowRainbowStorm, canShowShootingStar, clearActiveTimer, paused, sandboxMode, storageKey]);

  const chooseNaturalEvent = useCallback((): AmbientEventId => {
    if (!canShowFairySwarm) return 'shooting-star';

    const stored = readStoredState(storageKey);
    const roll = Math.random();

    const basePhoenixChance = canShowPhoenixRebirth
      ? (realm === 'legendary' ? 0.10 : stars >= 20 ? 0.075 : 0.055)
      : 0;
    const phoenixChance = stored.lastEventId === 'phoenix-rebirth' ? 0.012 : basePhoenixChance;
    if (roll < phoenixChance) return 'phoenix-rebirth';

    const remainingAfterPhoenix = 1 - phoenixChance;
    const baseDragonChance = canShowDragonFlight
      ? (realm === 'legendary' ? 0.18 : stars >= 16 ? 0.14 : 0.10)
      : 0;
    const dragonChance = stored.lastEventId === 'dragon-flight' ? 0.035 : baseDragonChance;
    const dragonThreshold = phoenixChance + remainingAfterPhoenix * dragonChance;
    if (roll < dragonThreshold) return 'dragon-flight';

    const remainingAfterDragon = 1 - dragonThreshold;
    const baseMeteorChance = canShowMeteorShower
      ? (realm === 'legendary' ? 0.16 : stars >= 20 ? 0.13 : 0.10)
      : 0;
    const meteorChance = stored.lastEventId === 'meteor-shower' ? 0.025 : baseMeteorChance;
    const meteorThreshold = dragonThreshold + remainingAfterDragon * meteorChance;
    if (roll < meteorThreshold) return 'meteor-shower';

    const remainingAfterMeteor = 1 - meteorThreshold;
    const baseEclipseChance = canShowLunarEclipse
      ? (realm === 'legendary' ? 0.12 : stars >= 22 ? 0.09 : 0.07)
      : 0;
    const eclipseChance = stored.lastEventId === 'lunar-eclipse' ? 0.018 : baseEclipseChance;
    const eclipseThreshold = meteorThreshold + remainingAfterMeteor * eclipseChance;
    if (roll < eclipseThreshold) return 'lunar-eclipse';

    const remainingAfterEclipse = 1 - eclipseThreshold;
    const baseRainbowChance = canShowRainbowStorm
      ? (realm === 'legendary' ? 0.16 : stars >= 22 ? 0.13 : 0.10)
      : 0;
    const rainbowChance = stored.lastEventId === 'rainbow-storm' ? 0.025 : baseRainbowChance;
    const rainbowThreshold = eclipseThreshold + remainingAfterEclipse * rainbowChance;
    if (roll < rainbowThreshold) return 'rainbow-storm';

    const remainingAfterRainbow = 1 - rainbowThreshold;
    const baseThunderstormChance = canShowMagicThunderstorm
      ? (realm === 'legendary' ? 0.16 : stars >= 28 ? 0.14 : 0.11)
      : 0;
    const thunderstormChance = stored.lastEventId === 'magic-thunderstorm' ? 0.02 : baseThunderstormChance;
    const thunderstormThreshold = rainbowThreshold + remainingAfterRainbow * thunderstormChance;
    if (roll < thunderstormThreshold) return 'magic-thunderstorm';

    const remainingAfterThunderstorm = 1 - thunderstormThreshold;
    const baseCrystalChance = canShowCrystalBloom
      ? (realm === 'legendary' ? 0.17 : stars >= 30 ? 0.14 : 0.11)
      : 0;
    const crystalChance = stored.lastEventId === 'crystal-bloom' ? 0.018 : baseCrystalChance;
    const crystalThreshold = thunderstormThreshold + remainingAfterThunderstorm * crystalChance;
    if (roll < crystalThreshold) return 'crystal-bloom';

    const remainingAfterCrystal = 1 - crystalThreshold;
    const baseWindChance = canShowMagicalWindVortex
      ? (realm === 'legendary' ? 0.16 : stars >= 32 ? 0.13 : 0.10)
      : 0;
    const windChance = stored.lastEventId === 'magical-wind-vortex' ? 0.015 : baseWindChance;
    const windThreshold = crystalThreshold + remainingAfterCrystal * windChance;
    if (roll < windThreshold) return 'magical-wind-vortex';

    const remainingAfterWind = 1 - windThreshold;
    const basePetalChance = canShowEnchantedPetalBloom
      ? (realm === 'legendary' ? 0.16 : 0.10)
      : 0;
    const petalChance = stored.lastEventId === 'enchanted-petal-bloom' ? 0.015 : basePetalChance;
    const petalThreshold = windThreshold + remainingAfterWind * petalChance;
    if (roll < petalThreshold) return 'enchanted-petal-bloom';

    const remainingAfterPetal = 1 - petalThreshold;
    const basePortalChance = canShowInterdimensionalPortal
      ? (realm === 'legendary' ? 0.13 : 0.075)
      : 0;
    const portalChance = stored.lastEventId === 'interdimensional-portal' ? 0.01 : basePortalChance;
    const portalThreshold = petalThreshold + remainingAfterPetal * portalChance;
    if (roll < portalThreshold) return 'interdimensional-portal';

    const remainingAfterPortal = 1 - portalThreshold;
    const baseWinterChance = canShowMagicalWinter
      ? (realm === 'legendary' ? 0.14 : 0.085)
      : 0;
    const winterChance = stored.lastEventId === 'magical-winter' ? 0.012 : baseWinterChance;
    const winterThreshold = portalThreshold + remainingAfterPortal * winterChance;
    if (roll < winterThreshold) return 'magical-winter';

    const remainingAfterWinter = 1 - winterThreshold;
    const baseTideChance = canShowCelestialTide
      ? (realm === 'legendary' ? 0.14 : 0.085)
      : 0;
    const tideChance = stored.lastEventId === 'celestial-tide' ? 0.012 : baseTideChance;
    const tideThreshold = winterThreshold + remainingAfterWinter * tideChance;
    if (roll < tideThreshold) return 'celestial-tide';

    const remainingAfterTide = 1 - tideThreshold;
    const baseFireflyChance = canShowMagicalFireflies
      ? (realm === 'legendary' ? 0.22 : stars >= 24 ? 0.18 : 0.14)
      : 0;
    const fireflyChance = stored.lastEventId === 'magical-fireflies' ? 0.035 : baseFireflyChance;
    const fireflyThreshold = tideThreshold + remainingAfterTide * fireflyChance;
    if (roll < fireflyThreshold) return 'magical-fireflies';

    const remainingAfterFireflies = 1 - fireflyThreshold;
    const baseIslandChance = canShowFloatingIsland
      ? (realm === 'legendary' ? 0.20 : stars >= 16 ? 0.18 : 0.15)
      : 0;
    const islandChance = stored.lastEventId === 'floating-island' ? 0.04 : baseIslandChance;
    const islandThreshold = fireflyThreshold + remainingAfterFireflies * islandChance;
    if (roll < islandThreshold) return 'floating-island';

    const remainingAfterIsland = 1 - islandThreshold;
    const baseAuroraChance = canShowAuroraSky
      ? (realm === 'legendary' ? 0.28 : stars >= 18 ? 0.22 : 0.18)
      : 0;
    const auroraChance = stored.lastEventId === 'aurora-sky' ? 0.05 : baseAuroraChance;
    const auroraThreshold = islandThreshold + remainingAfterIsland * auroraChance;
    if (roll < auroraThreshold) return 'aurora-sky';

    const remainingAfterAtmosphere = 1 - auroraThreshold;
    const baseFairyChance = realm === 'legendary' ? 0.36 : stars >= 12 ? 0.32 : 0.28;
    const fairyChance = stored.lastEventId === 'fairy-swarm' ? 0.10 : baseFairyChance;
    const fairyThreshold = auroraThreshold + remainingAfterAtmosphere * fairyChance;
    return roll < fairyThreshold ? 'fairy-swarm' : 'shooting-star';
  }, [canShowAuroraSky, canShowDragonFlight, canShowFairySwarm, canShowFloatingIsland, canShowLunarEclipse, canShowMagicalFireflies, canShowMagicThunderstorm, canShowCrystalBloom, canShowMagicalWindVortex, canShowEnchantedPetalBloom, canShowInterdimensionalPortal, canShowMagicalWinter, canShowCelestialTide, canShowMeteorShower, canShowPhoenixRebirth, canShowRainbowStorm, realm, stars, storageKey]);

  useEffect(() => {
    clearScheduledTimer();
    if (paused || !canShowShootingStar || sandboxMode || activeEvent) return;

    const stored = readStoredState(storageKey);
    const elapsed = stored.lastEventAt ? Date.now() - stored.lastEventAt : Number.POSITIVE_INFINITY;
    const cooldownRemaining = Math.max(0, REAL_COOLDOWN_MS - elapsed);

    const naturalDelay = randomBetween(24_000, 58_000);
    const delay = cooldownRemaining + naturalDelay;

    scheduleTimerRef.current = window.setTimeout(() => {
      scheduleTimerRef.current = null;
      triggerEvent(chooseNaturalEvent(), true);
    }, delay);

    return clearScheduledTimer;
  }, [activeEvent, canShowShootingStar, chooseNaturalEvent, clearScheduledTimer, paused, sandboxMode, storageKey, realm, triggerEvent]);

  useEffect(() => {
    return () => {
      clearScheduledTimer();
      clearActiveTimer();
    };
  }, [clearActiveTimer, clearScheduledTimer]);

  const shootingStarStyle = useMemo(() => {
    if (!activeEvent || activeEvent.id !== 'shooting-star') return undefined;
    const path = SHOOTING_STAR_PATHS[activeEvent.pathIndex] ?? SHOOTING_STAR_PATHS[0];
    return {
      '--ck-event-start-x': `${path.startX}%`,
      '--ck-event-start-y': `${path.startY}%`,
      '--ck-event-dx': `${path.dx}vw`,
      '--ck-event-dy': `${path.dy}vh`,
      '--ck-event-dx-88': `${path.dx * 0.88}vw`,
      '--ck-event-dy-88': `${path.dy * 0.88}vh`,
      '--ck-event-dx-96': `${path.dx * 0.96}vw`,
      '--ck-event-dy-96': `${path.dy * 0.96}vh`,
      '--ck-event-rotate': `${path.rotate}deg`,
    } as CSSProperties;
  }, [activeEvent]);

  return (
    <div
      className={`ck-live-events ${activeEvent?.id === 'crystal-bloom' ? 'is-crystal-depth-split' : ''} ${activeEvent?.id === 'enchanted-petal-bloom' ? 'is-petal-depth-split' : ''} ${activeEvent?.id === 'interdimensional-portal' ? 'is-portal-depth-split' : ''} ${activeEvent?.id === 'magical-winter' ? 'is-winter-depth-split' : ''} ${activeEvent?.id === 'celestial-tide' ? 'is-tide-depth-split' : ''}`}
    >
      {activeEvent?.id === 'shooting-star' && (
        <div
          key={activeEvent.instanceId}
          className={`ck-live-event ck-live-event-shooting-star is-${realm}`}
          style={shootingStarStyle}
          aria-hidden="true"
        >
          <div className="ck-live-event-sky-flash" />
          <div className="ck-shooting-star-track">
            <div className="ck-shooting-star-aura" />
            <div className="ck-shooting-star-tail ck-shooting-star-tail-wide" />
            <div className="ck-shooting-star-tail ck-shooting-star-tail-mid" />
            <div className="ck-shooting-star-tail ck-shooting-star-tail-core" />
            <div className="ck-shooting-star-head">
              <span className="ck-shooting-star-core" />
              <span className="ck-shooting-star-cross" />
              <span className="ck-shooting-star-glint" />
            </div>
            <div className="ck-shooting-star-sparks">
              {Array.from({ length: 18 }).map((_, index) => (
                <i
                  key={index}
                  style={{
                    '--ck-spark-i': index,
                    '--ck-spark-delay': `${0.10 + index * 0.045}s`,
                    '--ck-spark-y': `${((index * 23) % 27) - 13}px`,
                    '--ck-spark-dy': `${(((index * 23) % 27) - 13) * 0.72}px`,
                    '--ck-spark-size': `${2 + (index % 5)}px`,
                  } as CSSProperties}
                />
              ))}
            </div>

            <div className="ck-shooting-star-finale">
              <span className="ck-shooting-star-finale-glow" />
              <span className="ck-shooting-star-finale-ring" />
              <span className="ck-shooting-star-finale-ring ck-shooting-star-finale-ring-2" />
              <span className="ck-shooting-star-afterglow" />
              <span className="ck-shooting-star-finale-particles">
                {Array.from({ length: 14 }).map((_, index) => {
                  const angle = (index * Math.PI * 2) / 14;
                  const distance = 28 + (index % 4) * 12;
                  return (
                    <i
                      key={index}
                      style={{
                        '--ck-finale-i': index,
                        '--ck-finale-x': `${Math.cos(angle) * distance}px`,
                        '--ck-finale-y': `${Math.sin(angle) * distance}px`,
                        '--ck-finale-size': `${2 + (index % 4)}px`,
                      } as CSSProperties}
                    />
                  );
                })}
              </span>
            </div>
          </div>
        </div>
      )}

      {activeEvent?.id === 'fairy-swarm' && (
        <FairySwarmEvent realm={realm} instanceId={activeEvent.instanceId} />
      )}

      {activeEvent?.id === 'floating-island' && (
        <FloatingIslandEvent realm={realm} instanceId={activeEvent.instanceId} pathIndex={activeEvent.pathIndex} />
      )}

      {activeEvent?.id === 'aurora-sky' && (
        <AuroraSkyEvent realm={realm} instanceId={activeEvent.instanceId} />
      )}

      {activeEvent?.id === 'meteor-shower' && (
        <MeteorShowerEvent realm={realm} instanceId={activeEvent.instanceId} />
      )}

      {activeEvent?.id === 'lunar-eclipse' && (
        <LunarEclipseEvent realm={realm} instanceId={activeEvent.instanceId} />
      )}

      {activeEvent?.id === 'rainbow-storm' && (
        <RainbowStormEvent realm={realm} instanceId={activeEvent.instanceId} />
      )}

      {activeEvent?.id === 'magical-fireflies' && (
        <MagicalFirefliesEvent realm={realm} instanceId={activeEvent.instanceId} />
      )}

      {activeEvent?.id === 'magic-thunderstorm' && (
        <MagicThunderstormEvent realm={realm} instanceId={activeEvent.instanceId} />
      )}

      {activeEvent?.id === 'crystal-bloom' && (
        <CrystalBloomEvent realm={realm} instanceId={activeEvent.instanceId} />
      )}

      {activeEvent?.id === 'magical-wind-vortex' && (
        <MagicalWindVortexEvent realm={realm} instanceId={activeEvent.instanceId} />
      )}

      {activeEvent?.id === 'enchanted-petal-bloom' && (
        <EnchantedPetalBloomEvent realm={realm} instanceId={activeEvent.instanceId} />
      )}

      {activeEvent?.id === 'interdimensional-portal' && (
        <InterdimensionalPortalEvent realm={realm} instanceId={activeEvent.instanceId} />
      )}

      {activeEvent?.id === 'magical-winter' && (
        <MagicalWinterEvent realm={realm} instanceId={activeEvent.instanceId} />
      )}

      {activeEvent?.id === 'celestial-tide' && (
        <CelestialTideEvent realm={realm} instanceId={activeEvent.instanceId} />
      )}

      {activeEvent?.id === 'dragon-flight' && (
        <DragonFlightEvent realm={realm} instanceId={activeEvent.instanceId} pathIndex={activeEvent.pathIndex} />
      )}

      {activeEvent?.id === 'phoenix-rebirth' && (
        <PhoenixRebirthEvent realm={realm} instanceId={activeEvent.instanceId} pathIndex={activeEvent.pathIndex} />
      )}

      {sandboxMode && !paused && (
        <div className="ck-live-event-test-controls" dir="rtl">
          <button
            type="button"
            className="ck-live-event-test-button"
            onClick={event => {
              event.stopPropagation();
              triggerEvent('shooting-star', false);
            }}
          >
            🌠 כוכב
          </button>
          {canShowFairySwarm && (
            <button
              type="button"
              className="ck-live-event-test-button is-fairy"
              onClick={event => {
                event.stopPropagation();
                triggerEvent('fairy-swarm', false);
              }}
            >
              ✨ פיות
            </button>
          )}
          {canShowFloatingIsland && (
            <button
              type="button"
              className="ck-live-event-test-button is-island"
              onClick={event => {
                event.stopPropagation();
                triggerEvent('floating-island', false);
              }}
            >
              🏝️ אי מרחף
            </button>
          )}
          {canShowAuroraSky && (
            <button
              type="button"
              className="ck-live-event-test-button is-aurora"
              onClick={event => {
                event.stopPropagation();
                triggerEvent('aurora-sky', false);
              }}
            >
              🌌 אורורה
            </button>
          )}
          {canShowMeteorShower && (
            <button
              type="button"
              className="ck-live-event-test-button is-meteor"
              onClick={event => {
                event.stopPropagation();
                triggerEvent('meteor-shower', false);
              }}
            >
              ☄️ מטאורים
            </button>
          )}
          {canShowLunarEclipse && (
            <button
              type="button"
              className="ck-live-event-test-button is-eclipse"
              onClick={event => {
                event.stopPropagation();
                triggerEvent('lunar-eclipse', false);
              }}
            >
              🌙 ליקוי ירח
            </button>
          )}
          {canShowRainbowStorm && (
            <button
              type="button"
              className="ck-live-event-test-button is-rainbow"
              onClick={event => {
                event.stopPropagation();
                triggerEvent('rainbow-storm', false);
              }}
            >
              🌈 קשת קסומה
            </button>
          )}
          {canShowMagicalFireflies && (
            <button
              type="button"
              className="ck-live-event-test-button is-fireflies"
              onClick={event => {
                event.stopPropagation();
                triggerEvent('magical-fireflies', false);
              }}
            >
              ✨ גחליליות
            </button>
          )}
          {canShowMagicThunderstorm && (
            <button
              type="button"
              className="ck-live-event-test-button is-thunderstorm"
              onClick={event => {
                event.stopPropagation();
                triggerEvent('magic-thunderstorm', false);
              }}
            >
              ⚡ סערה
            </button>
          )}
          {canShowCrystalBloom && (
            <button
              type="button"
              className="ck-live-event-test-button is-crystal"
              onClick={event => {
                event.stopPropagation();
                triggerEvent('crystal-bloom', false);
              }}
            >
              💎 גבישים
            </button>
          )}
          {canShowMagicalWindVortex && (
            <button
              type="button"
              className="ck-live-event-test-button is-wind"
              onClick={event => {
                event.stopPropagation();
                triggerEvent('magical-wind-vortex', false);
              }}
            >
              🌪️ רוחות קסם
            </button>
          )}
          {canShowEnchantedPetalBloom && (
            <button
              type="button"
              className="ck-live-event-test-button is-petal"
              onClick={event => {
                event.stopPropagation();
                triggerEvent('enchanted-petal-bloom', false);
              }}
            >
              🌸 פריחה
            </button>
          )}
          {canShowInterdimensionalPortal && (
            <button
              type="button"
              className="ck-live-event-test-button is-portal"
              onClick={event => {
                event.stopPropagation();
                triggerEvent('interdimensional-portal', false);
              }}
            >
              🌀 שער
            </button>
          )}
          {canShowMagicalWinter && (
            <button
              type="button"
              className="ck-live-event-test-button is-winter"
              onClick={event => {
                event.stopPropagation();
                triggerEvent('magical-winter', false);
              }}
            >
              ❄️ חורף
            </button>
          )}
          {canShowCelestialTide && (
            <button
              type="button"
              className="ck-live-event-test-button is-tide"
              onClick={event => {
                event.stopPropagation();
                triggerEvent('celestial-tide', false);
              }}
            >
              🌊 גל קסם
            </button>
          )}
          {canShowDragonFlight && (
            <button
              type="button"
              className="ck-live-event-test-button is-dragon"
              onClick={event => {
                event.stopPropagation();
                triggerEvent('dragon-flight', false);
              }}
            >
              🐉 דרקון
            </button>
          )}
          {canShowPhoenixRebirth && (
            <button
              type="button"
              className="ck-live-event-test-button is-phoenix"
              onClick={event => {
                event.stopPropagation();
                triggerEvent('phoenix-rebirth', false);
              }}
            >
              🔥 עוף חול
            </button>
          )}
        </div>
      )}
    </div>
  );
}
