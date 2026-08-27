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

type AmbientEventId = 'shooting-star' | 'fairy-swarm' | 'dragon-flight' | 'phoenix-rebirth';
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
const DRAGON_FLIGHT_UNLOCK_STARS = 8;
const PHOENIX_REBIRTH_UNLOCK_STARS = 12;

const EVENT_LIFETIME_MS: Record<AmbientEventId, number> = {
  'shooting-star': 5400,
  'fairy-swarm': 9400,
  'dragon-flight': 9000,
  'phoenix-rebirth': 10800,
};

const SHOOTING_STAR_PATHS = [
  { startX: -12, startY: 10, dx: 126, dy: 48, rotate: 21 },
  { startX: -16, startY: 27, dx: 132, dy: 39, rotate: 16 },
  { startX: 8, startY: -10, dx: 105, dy: 68, rotate: 31 },
  { startX: 25, startY: -13, dx: 91, dy: 57, rotate: 27 },
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

  const canShowShootingStar = stars >= 1;
  const canShowFairySwarm = stars >= FAIRY_SWARM_UNLOCK_STARS;
  const canShowDragonFlight = stars >= DRAGON_FLIGHT_UNLOCK_STARS;
  const canShowPhoenixRebirth = stars >= PHOENIX_REBIRTH_UNLOCK_STARS;

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
    if (eventId === 'dragon-flight' && !canShowDragonFlight) return;
    if (eventId === 'phoenix-rebirth' && !canShowPhoenixRebirth) return;

    clearActiveTimer();
    const pathIndex = eventId === 'shooting-star'
      ? Math.floor(Math.random() * SHOOTING_STAR_PATHS.length)
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
  }, [canShowDragonFlight, canShowFairySwarm, canShowPhoenixRebirth, canShowShootingStar, clearActiveTimer, paused, sandboxMode, storageKey]);

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

    const remainingAfterRare = 1 - dragonThreshold;
    const baseFairyChance = realm === 'legendary' ? 0.36 : stars >= 12 ? 0.32 : 0.28;
    const fairyChance = stored.lastEventId === 'fairy-swarm' ? 0.10 : baseFairyChance;
    const fairyThreshold = dragonThreshold + remainingAfterRare * fairyChance;
    return roll < fairyThreshold ? 'fairy-swarm' : 'shooting-star';
  }, [canShowDragonFlight, canShowFairySwarm, canShowPhoenixRebirth, realm, stars, storageKey]);

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
    <div className="ck-live-events">
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
