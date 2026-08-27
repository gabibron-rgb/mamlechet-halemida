import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  CLASS_KINGDOM_LEVELS,
  classKingdomLevel,
  nextClassKingdomMilestone,
} from '../../data/classKingdom';
import ClassKingdomGateRoom from './ClassKingdomGateRoom';
import {
  classKingdomRoomById,
  classKingdomRoomForLandmark,
  type ClassKingdomRoomId,
} from '../../data/classKingdomRooms';
import {
  CLASS_ROOM_CHOICE_GROUPS,
  CLASS_ROOM_ITEMS,
  type ClassRoomItemDefinition,
} from '../../data/classRoomItems';
import './ClassKingdomScene.css';

type Props = {
  stars: number;
  classId: string;
  allowSandbox?: boolean;
  viewerRole?: 'student' | 'teacher';
  studentId?: string | null;
  teacherId?: string | null;
};

type RealmId = 'main' | 'legendary';

type Landmark = {
  id: string;
  realm: RealmId;
  titleHe: string;
  shortTitleHe: string;
  descriptionHe: string;
  stars: number;
  x: number;
  y: number;
  width: number;
  asset?: string;
  roomReady?: boolean;
  hitX: number;
  hitY: number;
  hitWidth: number;
  hitHeight: number;
};

type RealmDefinition = {
  id: RealmId;
  titleHe: string;
  shortTitleHe: string;
  emoji: string;
  descriptionHe: string;
  unlockStars: number;
  backgroundSrc: string;
};

type CeremonyTone = 'standard' | 'epic' | 'legendary' | 'crown';

type CeremonyUnlock = {
  id: string;
  titleHe: string;
  descriptionHe: string;
  imagePath?: string;
  icon?: string;
  badgeHe: string;
};

type CeremonySeenState = {
  seenStars: number[];
};

type SpecialAchievementCeremonyDetail = {
  title: string;
  story: string;
  itemNameHe: string;
  imagePath: string;
  achievementTitleHe: string;
  achievementIcon: string;
};

const ASSET_ROOT = '/assets/class-kingdom/buildings';
const LEGENDARY_REALM_UNLOCK_STARS = 11;

const REALMS: RealmDefinition[] = [
  {
    id: 'main',
    titleHe: 'הממלכה הראשית',
    shortTitleHe: 'הממלכה הראשית',
    emoji: '🏰',
    descriptionHe: 'אזור ההתחלה של הממלכה: הקהילה, הלמידה והמבנים הראשונים של הכיתה.',
    unlockStars: 0,
    backgroundSrc: '/assets/class-kingdom/background/kingdom-background-v3.png',
  },
  {
    id: 'legendary',
    titleHe: 'הממלכה האגדית',
    shortTitleHe: 'הממלכה האגדית',
    emoji: '🌌',
    descriptionHe: 'אזור מתקדם ומטורף של איים מרחפים, מצודות גבוהות ומבני שיא של הכיתה.',
    unlockStars: LEGENDARY_REALM_UNLOCK_STARS,
    backgroundSrc: '/assets/class-kingdom/background/legendary-kingdom-background-v1.png',
  },
];

const LANDMARKS: Landmark[] = [
  {
    id: 'gate',
    realm: 'main',
    titleHe: 'שער ההתחלה',
    shortTitleHe: 'שער ההתחלה',
    descriptionHe: 'הכוכב הראשון פותח את שער הממלכה ומכריז שהכיתה יצאה לדרך משותפת.',
    stars: 1,
    x: 16,
    y: 73,
    width: 22,
    asset: `${ASSET_ROOT}/gate.png`,
    hitX: 16,
    hitY: 75.5,
    hitWidth: 12.5,
    hitHeight: 9,
    roomReady: true,
  },
  {
    id: 'village',
    realm: 'main',
    titleHe: 'כפר החברים',
    shortTitleHe: 'כפר החברים',
    descriptionHe: 'בשני כוכבים כבר נוצרת קהילה קטנה — מקום ששייך לכולם.',
    stars: 2,
    x: 36.8,
    y: 60.5,
    width: 21.4,
    asset: `${ASSET_ROOT}/village.png`,
    hitX: 36.8,
    hitY: 63.2,
    hitWidth: 13,
    hitHeight: 9,
    roomReady: true,
  },
  {
    id: 'square',
    realm: 'main',
    titleHe: 'כיכר האחדות',
    shortTitleHe: 'כיכר האחדות',
    descriptionHe: 'שלושה כוכבים פותחים כיכר חגיגית שבה מציינים הצלחות כיתתיות ראשונות.',
    stars: 3,
    x: 54,
    y: 83,
    width: 21,
    asset: `${ASSET_ROOT}/square.png`,
    hitX: 54,
    hitY: 83,
    hitWidth: 11,
    hitHeight: 8,
  },
  {
    id: 'bridge',
    realm: 'main',
    titleHe: 'גשר הכוכבים',
    shortTitleHe: 'גשר הכוכבים',
    descriptionHe: 'בחמישה כוכבים הכיתה מחברת בין חלקי הממלכה ומגיעה לאזור חדש.',
    stars: 5,
    x: 30.5,
    y: 88.5,
    width: 28,
    asset: `${ASSET_ROOT}/bridge.png`,
    hitX: 30.5,
    hitY: 85.5,
    hitWidth: 15,
    hitHeight: 7.5,
  },
  {
    id: 'library',
    realm: 'main',
    titleHe: 'הספרייה הקסומה',
    shortTitleHe: 'הספרייה הקסומה',
    descriptionHe: 'שישה כוכבים פותחים מרכז ידע מרהיב עם ספרים, קסם וחלונות זוהרים.',
    stars: 6,
    x: 36.8,
    y: 38.3,
    width: 22.1,
    asset: `${ASSET_ROOT}/library.png`,
    hitX: 36.8,
    hitY: 42.3,
    hitWidth: 13,
    hitHeight: 9,
    roomReady: true,
  },
  {
    id: 'tower',
    realm: 'main',
    titleHe: 'מגדל השומרים',
    shortTitleHe: 'מגדל השומרים',
    descriptionHe: 'בתשעה כוכבים מתרומם מגדל שמביט על כל הממלכה.',
    stars: 9,
    x: 64.2,
    y: 45.6,
    width: 16.5,
    asset: `${ASSET_ROOT}/tower.png`,
    hitX: 64.2,
    hitY: 48.8,
    hitWidth: 8,
    hitHeight: 8.5,
  },
  {
    id: 'shield',
    realm: 'main',
    titleHe: 'מגן הממלכה',
    shortTitleHe: 'מגן הממלכה',
    descriptionHe: 'בעשרה כוכבים נפתח מבצר המגן של הממלכה — סמל של שמירה, אחריות ועמידה משותפת.',
    stars: 10,
    x: 77.5,
    y: 71,
    width: 29,
    asset: `${ASSET_ROOT}/shield.png`,
    hitX: 77.5,
    hitY: 74,
    hitWidth: 12,
    hitHeight: 9,
  },
  {
    id: 'castle',
    realm: 'legendary',
    titleHe: 'ארמון הכתר',
    shortTitleHe: 'ארמון הכתר',
    descriptionHe: 'בארבעה־עשר כוכבים הממלכה כבר מקבלת ארמון מרכזי ומפואר.',
    stars: 14,
    x: 35.0,
    y: 40.5,
    width: 23,
    asset: `${ASSET_ROOT}/castle.png`,
    hitX: 35.0,
    hitY: 43.0,
    hitWidth: 13,
    hitHeight: 9,
  },
  {
    id: 'garden',
    realm: 'legendary',
    titleHe: 'גן האור',
    shortTitleHe: 'גן האור',
    descriptionHe: 'חמישה־עשר כוכבים מוסיפים גן קסום ומואר שמסמל התמדה וצמיחה.',
    stars: 15,
    x: 14.0,
    y: 71.5,
    width: 18.5,
    asset: `${ASSET_ROOT}/garden.png`,
    hitX: 14.0,
    hitY: 74.0,
    hitWidth: 11,
    hitHeight: 8.5,
  },
  {
    id: 'observatory',
    realm: 'legendary',
    titleHe: 'מצפה הכוכבים',
    shortTitleHe: 'מצפה הכוכבים',
    descriptionHe: 'בעשרים כוכבים נפתח מצפה שמביט אל השלב הבא של הממלכה.',
    stars: 20,
    x: 61.0,
    y: 52.0,
    width: 19,
    asset: `${ASSET_ROOT}/observatory.png`,
    hitX: 61.0,
    hitY: 54.5,
    hitWidth: 10.5,
    hitHeight: 8.5,
  },
  {
    id: 'citadel',
    realm: 'legendary',
    titleHe: 'מצודת האגדות',
    shortTitleHe: 'מצודת האגדות',
    descriptionHe: 'אזור אגדי שייפתח בשלבים המתקדמים של הממלכה.',
    stars: 22,
    x: 36.0,
    y: 60.0,
    width: 17.5,
    asset: `${ASSET_ROOT}/citadel.png`,
    hitX: 36.0,
    hitY: 62.5,
    hitWidth: 10,
    hitHeight: 8,
  },
  {
    id: 'crown',
    realm: 'legendary',
    titleHe: 'כתר האחדות',
    shortTitleHe: 'כתר האחדות',
    descriptionHe: 'פסגת הממלכה הכיתתית — הישג ששייך לכל הכיתה.',
    stars: 24,
    x: 75.8,
    y: 70.0,
    width: 16.5,
    asset: `${ASSET_ROOT}/crown.png`,
    hitX: 75.8,
    hitY: 72.5,
    hitWidth: 9.5,
    hitHeight: 8,
  },
];

function realmById(id: RealmId): RealmDefinition {
  return REALMS.find(realm => realm.id === id) ?? REALMS[0];
}

function topLandmarkForRealm(realmId: RealmId, displayStars: number) {
  const realmLandmarks = LANDMARKS.filter(landmark => landmark.realm === realmId);
  return [...realmLandmarks].reverse().find(landmark => displayStars >= landmark.stars)
    ?? realmLandmarks.find(landmark => landmark.stars > displayStars)
    ?? realmLandmarks[0];
}


const CEREMONY_STORAGE_PREFIX = 'mamlechet-class-kingdom-ceremonies-v1';
const REPLAY_CEREMONY_EVENT = 'mamlechet:class-kingdom-replay-latest-ceremony';
const SPECIAL_ACHIEVEMENT_AWARDED_EVENT = 'mamlechet:class-kingdom-special-achievement-awarded';
const LEGENDARY_REALM_CEREMONY_STAR = LEGENDARY_REALM_UNLOCK_STARS;

function ceremonyUnlocksForStar(star: number): CeremonyUnlock[] {
  const unlocks: CeremonyUnlock[] = [];

  for (const landmark of LANDMARKS.filter(entry => entry.stars === star)) {
    unlocks.push({
      id: `landmark-${landmark.id}`,
      titleHe: landmark.titleHe,
      descriptionHe: landmark.descriptionHe,
      imagePath: landmark.asset,
      icon: '🏰',
      badgeHe: 'מבנה חדש',
    });
  }

  for (const item of CLASS_ROOM_ITEMS.filter(entry => entry.unlockKind === 'automatic' && entry.unlockStars === star)) {
    unlocks.push(classRoomItemCeremonyUnlock(item));
  }

  for (const choiceGroup of CLASS_ROOM_CHOICE_GROUPS.filter(entry => entry.stars === star)) {
    unlocks.push({
      id: `choice-${choiceGroup.id}`,
      titleHe: choiceGroup.titleHe,
      descriptionHe: choiceGroup.subtitleHe,
      icon: '🎁',
      badgeHe: 'בחירה כיתתית חדשה',
    });
  }

  if (star === LEGENDARY_REALM_CEREMONY_STAR) {
    unlocks.push({
      id: 'legendary-realm',
      titleHe: 'הממלכה האגדית',
      descriptionHe: 'שער חדש נפתח אל האזור המתקדם של הממלכה — מכאן מתחילים המבנים והפרסים האגדיים באמת.',
      icon: '🌌',
      badgeHe: 'עולם חדש',
    });
  }

  return unlocks;
}

function classRoomItemCeremonyUnlock(item: ClassRoomItemDefinition): CeremonyUnlock {
  return {
    id: `reward-${item.id}`,
    titleHe: item.nameHe,
    descriptionHe: item.unlockReasonHe || item.descriptionHe,
    imagePath: item.imagePath,
    icon: '🏆',
    badgeHe: item.rarity === 'legendary' ? 'פרס אגדי' : item.rarity === 'epic' ? 'פרס אפי' : 'פרס חדש',
  };
}

function ceremonyStars(): number[] {
  const values = new Set<number>([LEGENDARY_REALM_CEREMONY_STAR]);
  LANDMARKS.forEach(landmark => values.add(landmark.stars));
  CLASS_ROOM_ITEMS.filter(item => item.unlockKind === 'automatic').forEach(item => values.add(item.unlockStars));
  CLASS_ROOM_CHOICE_GROUPS.forEach(group => values.add(group.stars));
  return [...values].filter(star => ceremonyUnlocksForStar(star).length > 0).sort((a, b) => a - b);
}

const CEREMONY_STARS = ceremonyStars();

function ceremonyToneForStar(star: number): CeremonyTone {
  if (star >= 24) return 'crown';
  if (star >= 16) return 'legendary';
  if (star >= 8) return 'epic';
  return 'standard';
}

function ceremonyTitleForStar(star: number): string {
  if (star >= 24) return 'פסגת הממלכה הושגה!';
  if (star === LEGENDARY_REALM_CEREMONY_STAR) return 'שער הממלכה האגדית נפתח!';
  if (star >= 16) return 'הממלכה האגדית התעוררה!';
  if (star >= 8) return 'אבן דרך אדירה הושגה!';
  return 'הממלכה התקדמה!';
}

function loadSeenCeremonyStars(storageKey: string): number[] | null {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CeremonySeenState>;
    if (!Array.isArray(parsed.seenStars)) return [];
    return parsed.seenStars.filter(value => typeof value === 'number' && Number.isFinite(value));
  } catch {
    return [];
  }
}

function saveSeenCeremonyStars(storageKey: string, stars: number[]) {
  try {
    const unique = [...new Set(stars.map(value => Math.max(0, Math.floor(value))))].sort((a, b) => a - b);
    window.localStorage.setItem(storageKey, JSON.stringify({ seenStars: unique } satisfies CeremonySeenState));
  } catch {
    // A blocked localStorage should never block the kingdom itself.
  }
}

export default function ClassKingdomScene({
  stars,
  classId,
  allowSandbox = false,
  viewerRole = 'student',
  studentId = null,
  teacherId = null,
}: Props) {
  const [sandboxMode, setSandboxMode] = useState(false);
  const displayStars = sandboxMode ? 24 : stars;
  const [currentRealm, setCurrentRealm] = useState<RealmId>('main');
  const [selectedId, setSelectedId] = useState('gate');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [view, setView] = useState<'map' | ClassKingdomRoomId>('map');
  const [ceremonyStar, setCeremonyStar] = useState<number | null>(null);
  const [ceremonyQueue, setCeremonyQueue] = useState<number[]>([]);
  const [specialAchievementCeremony, setSpecialAchievementCeremony] = useState<SpecialAchievementCeremonyDetail | null>(null);
  const ceremonyStorageKey = `${CEREMONY_STORAGE_PREFIX}:${classId}`;

  const legendaryUnlocked = displayStars >= LEGENDARY_REALM_UNLOCK_STARS;
  const realm = realmById(currentRealm);
  const realmLandmarks = LANDMARKS.filter(landmark => landmark.realm === currentRealm);

  useEffect(() => {
    if (currentRealm === 'legendary' && !legendaryUnlocked) {
      setCurrentRealm('main');
    }
  }, [currentRealm, legendaryUnlocked]);

  useEffect(() => {
    if (!realmLandmarks.some(landmark => landmark.id === selectedId)) {
      const fallback = topLandmarkForRealm(currentRealm, displayStars);
      if (fallback) setSelectedId(fallback.id);
    }
  }, [currentRealm, displayStars, realmLandmarks, selectedId]);

  const nextLockedInRealm = realmLandmarks.find(landmark => landmark.stars > displayStars) ?? null;
  const selectedLandmark = useMemo(
    () => realmLandmarks.find(landmark => landmark.id === selectedId) ?? topLandmarkForRealm(currentRealm, displayStars),
    [realmLandmarks, selectedId, currentRealm, displayStars]
  );

  const currentLevel = classKingdomLevel(displayStars);
  const nextMilestone = nextClassKingdomMilestone(displayStars);
  const nextLevel = CLASS_KINGDOM_LEVELS.find(level => level.minStars > displayStars) ?? null;
  const unlocked = LANDMARKS.filter(landmark => displayStars >= landmark.stars);
  const unlockedInRealm = realmLandmarks.filter(landmark => displayStars >= landmark.stars);
  const nextTargetsInRealm = realmLandmarks.filter(landmark => landmark.stars > displayStars).slice(0, 2);
  const activeCeremonyUnlocks = ceremonyStar === null ? [] : ceremonyUnlocksForStar(ceremonyStar);
  const activeCeremonyTone = ceremonyStar === null ? 'standard' : ceremonyToneForStar(ceremonyStar);

  useEffect(() => {
    if (sandboxMode || !classId) return;

    const eligibleStars = CEREMONY_STARS.filter(star => star <= Math.max(0, Math.floor(stars)));
    const storedSeenStars = loadSeenCeremonyStars(ceremonyStorageKey);

    // First run after installing this feature: adopt the current progress as the baseline.
    // This prevents old ceremonies from flooding existing real classes.
    if (storedSeenStars === null) {
      saveSeenCeremonyStars(ceremonyStorageKey, eligibleStars);
      return;
    }

    const seen = new Set(storedSeenStars);
    const unseen = eligibleStars.filter(star => !seen.has(star));
    if (unseen.length === 0) return;

    setCeremonyQueue(current => current.length > 0 ? current : unseen);
    setCeremonyStar(current => current ?? unseen[0]);
  }, [sandboxMode, classId, stars, ceremonyStorageKey]);

  function closeCeremony() {
    if (ceremonyStar === null) return;

    if (!sandboxMode) {
      const seen = loadSeenCeremonyStars(ceremonyStorageKey) ?? [];
      saveSeenCeremonyStars(ceremonyStorageKey, [...seen, ceremonyStar]);
    }

    const remaining = ceremonyQueue.filter(star => star !== ceremonyStar);
    setCeremonyQueue(remaining);
    setCeremonyStar(remaining[0] ?? null);
  }

  function replayLatestCeremony() {
    const latest = [...CEREMONY_STARS].reverse().find(star => star <= displayStars);
    if (!latest) return;
    setCeremonyQueue([]);
    setCeremonyStar(latest);
  }

  useEffect(() => {
    const handleReplayRequest = () => replayLatestCeremony();
    window.addEventListener(REPLAY_CEREMONY_EVENT, handleReplayRequest);
    return () => window.removeEventListener(REPLAY_CEREMONY_EVENT, handleReplayRequest);
  }, [displayStars]);

  useEffect(() => {
    const handleSpecialAchievement = (event: Event) => {
      const detail = (event as CustomEvent<SpecialAchievementCeremonyDetail>).detail;
      if (!detail?.title || !detail?.imagePath) return;
      setSpecialAchievementCeremony(detail);
    };

    window.addEventListener(SPECIAL_ACHIEVEMENT_AWARDED_EVENT, handleSpecialAchievement);
    return () => window.removeEventListener(SPECIAL_ACHIEVEMENT_AWARDED_EVENT, handleSpecialAchievement);
  }, []);

  if (view !== 'map') {
    const room = classKingdomRoomById(view);
    return (
      <>
        {specialAchievementCeremony && (
          <SpecialAchievementCeremony
            detail={specialAchievementCeremony}
            onClose={() => setSpecialAchievementCeremony(null)}
          />
        )}
        <ClassKingdomGateRoom
          room={room}
          stars={displayStars}
          classId={classId}
          sandboxMode={sandboxMode}
          viewerRole={viewerRole}
          studentId={studentId}
          teacherId={teacherId}
          onBack={() => setView('map')}
        />
      </>
    );
  }

  function handleLandmarkClick(landmark: Landmark, isUnlocked: boolean) {
    const room = classKingdomRoomForLandmark(landmark.id);
    if (isUnlocked && room) {
      setView(room.id);
      return;
    }

    setSelectedId(landmark.id);
  }

  function enterSelectedRoom() {
    if (!selectedLandmark) return;
    const isUnlocked = displayStars >= selectedLandmark.stars;
    if (!isUnlocked) return;

    const room = classKingdomRoomForLandmark(selectedLandmark.id);
    if (room) setView(room.id);
  }

  return (
    <section className="mt-5 rounded-3xl border border-cyan-300/15 bg-magic-bg/35 p-5">
      {specialAchievementCeremony && (
        <SpecialAchievementCeremony
          detail={specialAchievementCeremony}
          onClose={() => setSpecialAchievementCeremony(null)}
        />
      )}

      {ceremonyStar !== null && activeCeremonyUnlocks.length > 0 && (
        <div className={`ck-ceremony-overlay is-${activeCeremonyTone}`} role="dialog" aria-modal="true" aria-label={`טקס פתיחת אבן דרך ${ceremonyStar} כוכבים`}>
          <div className="ck-ceremony-backdrop" aria-hidden="true" />
          <div className="ck-ceremony-rays" aria-hidden="true" />
          <div className="ck-ceremony-particles" aria-hidden="true">
            {Array.from({ length: activeCeremonyTone === 'crown' ? 42 : activeCeremonyTone === 'legendary' ? 34 : 24 }).map((_, index) => (
              <i
                key={index}
                style={{
                  left: `${(index * 37 + 9) % 100}%`,
                  top: `${(index * 61 + 7) % 92}%`,
                  animationDelay: `${-((index % 9) * 0.37)}s`,
                  animationDuration: `${3.2 + (index % 6) * 0.42}s`,
                } as CSSProperties}
              />
            ))}
          </div>

          <div className="ck-ceremony-card" dir="rtl">
            <div className="ck-ceremony-star-burst" aria-hidden="true">
              <span>★</span>
            </div>
            <div className="ck-ceremony-kicker">אבן דרך חדשה · {ceremonyStar} ⭐</div>
            <h2 className="ck-ceremony-title">{ceremonyTitleForStar(ceremonyStar)}</h2>
            <p className="ck-ceremony-subtitle">
              הכיתה הרוויחה כוכב ששינה את הממלכה. {activeCeremonyUnlocks.length > 1 ? 'כמה דברים חדשים נפתחו יחד:' : 'נפתח משהו חדש:'}
            </p>

            <div className={`ck-ceremony-unlocks ${activeCeremonyUnlocks.length === 1 ? 'is-single' : ''}`}>
              {activeCeremonyUnlocks.map(unlock => (
                <article key={unlock.id} className="ck-ceremony-unlock-card">
                  <div className="ck-ceremony-unlock-badge">{unlock.badgeHe}</div>
                  <div className="ck-ceremony-unlock-art">
                    {unlock.imagePath ? <img src={unlock.imagePath} alt="" draggable={false} /> : <span>{unlock.icon ?? '✨'}</span>}
                  </div>
                  <div className="ck-ceremony-unlock-title">{unlock.titleHe}</div>
                  <div className="ck-ceremony-unlock-description">{unlock.descriptionHe}</div>
                </article>
              ))}
            </div>

            {activeCeremonyTone === 'crown' && (
              <div className="ck-ceremony-crown-message">👑 24 כוכבים — הכיתה השלימה את מסלול הממלכה הנוכחי!</div>
            )}

            <button type="button" className="ck-ceremony-continue" onClick={closeCeremony}>
              {ceremonyQueue.length > 1 ? '✨ המשך לפתיחה הבאה' : '✨ אל הממלכה'}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="font-black text-white">🗺️ הממלכה החיה של הכיתה</h3>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-magic-soft/60">
            עכשיו הממלכה מחולקת לשני אזורי התקדמות: אזור ראשי לבנייה הראשונית של הכיתה,
            ואזור אגדי למבנים המתקדמים והמרשימים ביותר.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {allowSandbox && (
            <button
              type="button"
              onClick={() => {
                setSandboxMode(value => !value);
                setView('map');
                setCurrentRealm('main');
                setSelectedId('gate');
              }}
              className={`rounded-full border px-3 py-2 text-[11px] font-black transition ${
                sandboxMode
                  ? 'border-amber-200/40 bg-amber-300/20 text-amber-50 hover:bg-amber-300/25'
                  : 'border-cyan-200/25 bg-cyan-300/10 text-cyan-50 hover:bg-cyan-300/15'
              }`}
            >
              {sandboxMode ? '↩️ חזרה למפה האמיתית' : '🧪 מפת ניסויים — פתח הכול'}
            </button>
          )}

          <div className="flex flex-wrap gap-2 text-[11px] font-black text-magic-soft/70">
            <SceneBadge>{currentLevel.emoji} {currentLevel.titleHe}</SceneBadge>
            <SceneBadge>⭐ {displayStars} כוכבים</SceneBadge>
            <SceneBadge>🏗️ {unlocked.length}/{LANDMARKS.length} אזורים פתוחים</SceneBadge>
          </div>
        </div>
      </div>

      <div className="mt-4 ck31-realm-tabs" dir="rtl">
        {REALMS.map(realmOption => {
          const isUnlocked = realmOption.id === 'main' || legendaryUnlocked;
          const isActive = currentRealm === realmOption.id;
          const realmUnlockedCount = LANDMARKS.filter(landmark => landmark.realm === realmOption.id && displayStars >= landmark.stars).length;
          const realmTotal = LANDMARKS.filter(landmark => landmark.realm === realmOption.id).length;
          return (
            <button
              key={realmOption.id}
              type="button"
              disabled={!isUnlocked}
              onClick={() => {
                setCurrentRealm(realmOption.id);
                const fallback = topLandmarkForRealm(realmOption.id, displayStars);
                if (fallback) setSelectedId(fallback.id);
              }}
              className={`ck31-realm-tab ${isActive ? 'is-active' : ''} ${!isUnlocked ? 'is-locked' : ''}`}
            >
              <span className="ck31-realm-tab-icon">{realmOption.emoji}</span>
              <span>
                <span className="ck31-realm-tab-title">{realmOption.titleHe}</span>
                <span className="ck31-realm-tab-subtitle">
                  {isUnlocked ? `${realmUnlockedCount}/${realmTotal} אזורים פתוחים` : `ייפתח ב־${realmOption.unlockStars}⭐`}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {!legendaryUnlocked && (
        <div className="mt-3 rounded-2xl border border-yellow-300/15 bg-yellow-400/8 px-4 py-3 text-xs leading-5 text-yellow-100/80">
          ✨ ב־{LEGENDARY_REALM_UNLOCK_STARS} כוכבים ייפתח שער חדש אל <strong>הממלכה האגדית</strong> — שם יחכו המבנים המתקדמים ביותר.
        </div>
      )}

      <div className="mt-5 ck31-layout">
        <div className="ck31-map-wrap">
          <div className="ck31-map" dir="rtl">
            {sandboxMode && (
              <div className="ck31-sandbox-banner">🧪 מפת ניסויים · הכול פתוח · לא משנה נתונים אמיתיים</div>
            )}
            <img
              src={realm.backgroundSrc}
              alt={realm.titleHe}
              className="ck31-map-background"
              draggable={false}
            />

            <div className="ck31-map-vignette" />
            <div className={`ck31-world-light ck31-light-level-${Math.min(6, currentLevel.level)}`} />

            {realmLandmarks.map((landmark, index) => {
              const isUnlocked = displayStars >= landmark.stars;
              const isPreview = nextLockedInRealm?.id === landmark.id;
              const isSelected = selectedLandmark?.id === landmark.id && isUnlocked;
              const isHovered = hoveredId === landmark.id;

              if (!isUnlocked && !isPreview) return null;

              return (
                <div key={landmark.id} className="ck31-landmark-system">
                  <button
                    type="button"
                    data-landmark={landmark.id}
                    className={`ck31-landmark-visual ${isUnlocked ? 'is-unlocked' : 'is-preview'} ${isSelected ? 'is-selected' : ''} ${isHovered ? 'is-hovered' : ''} ${isUnlocked && Boolean(classKingdomRoomForLandmark(landmark.id)) ? 'has-room' : ''}`}
                    style={{
                      left: `${landmark.x}%`,
                      top: `${landmark.y}%`,
                      width: `${landmark.width}%`,
                      zIndex: isHovered || isSelected ? 82 : 20 + index,
                    }}
                    onMouseEnter={() => setHoveredId(landmark.id)}
                    onMouseLeave={() => setHoveredId(current => current === landmark.id ? null : current)}
                    onFocus={() => setHoveredId(landmark.id)}
                    onBlur={() => setHoveredId(current => current === landmark.id ? null : current)}
                    onClick={() => handleLandmarkClick(landmark, isUnlocked)}
                    aria-label={`${landmark.titleHe} - ${isUnlocked ? (classKingdomRoomForLandmark(landmark.id) ? 'לחצו כדי להיכנס' : 'פתוח') : `ייפתח ב-${landmark.stars} כוכבים`}`}
                  >
                    {landmark.asset ? (
                      <img
                        src={landmark.asset}
                        alt=""
                        className="ck31-landmark-image"
                        draggable={false}
                      />
                    ) : (
                      <span className="ck31-future-landmark">
                        <span className="ck31-future-orb">✦</span>
                      </span>
                    )}
                  </button>

                  <div
                    className={`ck31-landmark-caption-floating ${isUnlocked || isPreview ? 'is-visible' : ''} ${isSelected ? 'is-selected' : ''} ${isPreview ? 'is-preview' : ''} ${classKingdomRoomForLandmark(landmark.id) ? 'has-room' : ''}`}
                    style={{
                      left: `${landmark.hitX}%`,
                      top: `${Math.max(7, landmark.hitY - landmark.hitHeight / 2 - 1.5)}%`,
                    }}
                    aria-hidden="true"
                  >
                    <span className="ck31-landmark-name">{landmark.shortTitleHe}</span>
                    <span className="ck31-landmark-status">
                      {isUnlocked
                        ? classKingdomRoomForLandmark(landmark.id)
                          ? 'לחצו כדי להיכנס'
                          : 'פתוח'
                        : `${landmark.stars}⭐ לפתיחה`}
                    </span>
                  </div>
                </div>
              );
            })}

            <div className="ck31-map-topbar">
              <div className="ck31-title-card">
                <div className="text-[10px] font-black text-yellow-100/70">{realm.emoji} אזור נוכחי</div>
                <div className="mt-1 text-base font-black text-white">{realm.titleHe}</div>
              </div>
              <div className="ck31-next-chip">
                {nextTargetsInRealm[0]
                  ? `הבא כאן: ${nextTargetsInRealm[0].shortTitleHe} · ${nextTargetsInRealm[0].stars}⭐`
                  : 'כל אזורי המפה הזאת פתוחים'}
              </div>
            </div>

            <div className="ck31-map-bottombar">
              {nextMilestone ? (
                <>
                  <span className="font-black text-yellow-100">🎯 {nextMilestone.titleHe}</span>
                  <span>חסרים {Math.max(0, nextMilestone.stars - displayStars)} כוכבים לאבן הדרך הבאה</span>
                </>
              ) : (
                <span className="font-black text-yellow-100">👑 כל אבני הדרך פתוחות</span>
              )}
            </div>
          </div>
        </div>

        <div className="ck31-info-grid">
          <article className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-black text-magic-soft/60">מבנה נבחר</div>
                <h4 className="mt-1 text-xl font-black text-white">{selectedLandmark?.titleHe}</h4>
              </div>
              <div className={`rounded-full px-3 py-1 text-[11px] font-black ${displayStars >= (selectedLandmark?.stars ?? 0) ? 'bg-emerald-400/15 text-emerald-100' : 'bg-yellow-400/10 text-yellow-100'}`}>
                {displayStars >= (selectedLandmark?.stars ?? 0) ? 'נפתח' : `${selectedLandmark?.stars}⭐`}
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-magic-soft/70">{selectedLandmark?.descriptionHe}</p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <MiniStat value={`${Math.max(0, (selectedLandmark?.stars ?? 0) - displayStars)}`} label="כוכבים חסרים" />
              <MiniStat value={displayStars >= (selectedLandmark?.stars ?? 0) ? 'כן' : 'עדיין לא'} label="פתוח לכניסה" />
            </div>

            {selectedLandmark && displayStars >= selectedLandmark.stars && Boolean(classKingdomRoomForLandmark(selectedLandmark.id)) ? (
              <button
                type="button"
                onClick={enterSelectedRoom}
                className="mt-4 w-full rounded-2xl border border-cyan-200/25 bg-cyan-300/15 px-4 py-3 text-sm font-black text-cyan-50 transition hover:-translate-y-0.5 hover:bg-cyan-300/20"
              >
                🚪 כניסה אל {selectedLandmark.titleHe}
              </button>
            ) : selectedLandmark && displayStars >= selectedLandmark.stars ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs leading-5 text-magic-soft/65">
                🏗️ המבנה פתוח בממלכה. החדר הפנימי שלו ייבנה בהמשך.
              </div>
            ) : selectedLandmark ? (
              <div className="mt-4 rounded-2xl border border-yellow-300/15 bg-yellow-400/8 px-4 py-3 text-xs leading-5 text-yellow-100/75">
                🔒 החדר ייפתח יחד עם המבנה ב־{selectedLandmark.stars} כוכבים.
              </div>
            ) : null}
          </article>

          <article className="rounded-3xl border border-yellow-300/15 bg-yellow-400/8 p-4">
            <div className="text-sm font-black text-yellow-100">🌟 מה נפתח בקרוב כאן</div>
            <div className="mt-3 space-y-2">
              {nextTargetsInRealm.length > 0 ? nextTargetsInRealm.map(target => (
                <button
                  key={target.id}
                  type="button"
                  onClick={() => setSelectedId(target.id)}
                  className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-right transition hover:border-yellow-200/30 hover:bg-white/5"
                >
                  <span>
                    <span className="block font-black text-white">{target.titleHe}</span>
                    <span className="mt-0.5 block text-[11px] text-magic-soft/55">חסרים {Math.max(0, target.stars - displayStars)} כוכבים</span>
                  </span>
                  <span className="rounded-full bg-white/8 px-2.5 py-1 text-[10px] font-black text-yellow-100/80">{target.stars}⭐</span>
                </button>
              )) : (
                <div className="rounded-xl border border-emerald-300/15 bg-emerald-500/10 px-3 py-3 text-xs font-bold text-emerald-100">כל האזורים במפה הזאת פתוחים.</div>
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-fuchsia-300/15 bg-fuchsia-500/8 p-4">
            <div className="text-sm font-black text-fuchsia-100">📈 מצב {realm.shortTitleHe}</div>
            <div className="mt-3 space-y-3">
              <ProgressRow label="אזורים פתוחים במפה" value={unlockedInRealm.length} total={realmLandmarks.length} />
              <ProgressRow label="אזורים פתוחים בכלל" value={unlocked.length} total={LANDMARKS.length} />
              <ProgressRow label="רמת ממלכה" value={currentLevel.level} total={CLASS_KINGDOM_LEVELS.length} />
              {nextLevel && (
                <div className="rounded-xl border border-white/10 bg-black/15 px-3 py-2.5 text-xs">
                  <div className="font-black text-white">{nextLevel.emoji} רמה {nextLevel.level}: {nextLevel.titleHe}</div>
                  <div className="mt-1 text-[11px] text-fuchsia-100/80">עוד {Math.max(0, nextLevel.minStars - displayStars)} כוכבים</div>
                </div>
              )}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function SpecialAchievementCeremony({
  detail,
  onClose,
}: {
  detail: SpecialAchievementCeremonyDetail;
  onClose: () => void;
}) {
  return (
    <div
      className="ck-achievement-ceremony-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`טקס הישג כיתתי: ${detail.title}`}
    >
      <div className="ck-achievement-ceremony-backdrop" aria-hidden="true" />
      <div className="ck-achievement-ceremony-rays" aria-hidden="true" />
      <div className="ck-achievement-ceremony-particles" aria-hidden="true">
        {Array.from({ length: 38 }).map((_, index) => (
          <i
            key={index}
            style={{
              left: `${(index * 41 + 11) % 100}%`,
              top: `${(index * 67 + 5) % 93}%`,
              animationDelay: `${-((index % 10) * 0.31)}s`,
              animationDuration: `${3 + (index % 7) * 0.36}s`,
            } as CSSProperties}
          />
        ))}
      </div>

      <div className="ck-achievement-ceremony-card" dir="rtl">
        <div className="ck-achievement-ceremony-badge">🏅 הישג כיתתי מיוחד</div>
        <div className="ck-achievement-ceremony-symbol" aria-hidden="true">
          <span>{detail.achievementIcon}</span>
        </div>
        <div className="ck-achievement-ceremony-type">{detail.achievementTitleHe}</div>
        <h2>{detail.title}</h2>
        {detail.story && <p>{detail.story}</p>}

        <div className="ck-achievement-ceremony-reward">
          <div className="ck-achievement-ceremony-reward-glow" aria-hidden="true" />
          <img src={detail.imagePath} alt="" draggable={false} />
          <div>
            <span>נפתחה מזכרת חדשה לאוסף הכיתתי</span>
            <strong>{detail.itemNameHe}</strong>
          </div>
        </div>

        <div className="ck-achievement-ceremony-history-note">
          📖 הרגע הזה נשמר בספר האגדות של הכיתה ויישאר חלק מהממלכה.
        </div>

        <button
          type="button"
          className="ck-achievement-ceremony-continue"
          onClick={onClose}
        >
          ✨ אל הממלכה
        </button>
      </div>
    </div>
  );
}

function SceneBadge({ children }: { children: ReactNode }) {
  return <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">{children}</div>;
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/15 px-3 py-2.5 text-center">
      <div className="text-base font-black text-white">{value}</div>
      <div className="text-[10px] font-bold text-magic-soft/60">{label}</div>
    </div>
  );
}

function ProgressRow({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total <= 0 ? 0 : Math.max(0, Math.min(100, Math.round((value / total) * 100)));

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="font-black text-white">{label}</span>
        <span className="text-magic-soft/60">{value}/{total}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-black/30">
        <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-300 via-cyan-300 to-yellow-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
