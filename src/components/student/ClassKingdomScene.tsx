import { useMemo, useState, type ReactNode } from 'react';
import {
  CLASS_KINGDOM_LEVELS,
  classKingdomLevel,
  nextClassKingdomMilestone,
} from '../../data/classKingdom';
import ClassKingdomGateRoom from './ClassKingdomGateRoom';
import './ClassKingdomScene.css';

type Props = {
  stars: number;
  classId: string;
  allowSandbox?: boolean;
  viewerRole?: 'student' | 'teacher';
  studentId?: string | null;
  teacherId?: string | null;
};

type Landmark = {
  id: string;
  titleHe: string;
  shortTitleHe: string;
  descriptionHe: string;
  stars: number;
  x: number;
  y: number;
  width: number;
  asset?: string;
  roomReady?: boolean;
};

const ASSET_ROOT = '/assets/class-kingdom/buildings';

const LANDMARKS: Landmark[] = [
  {
    id: 'gate',
    titleHe: 'שער ההתחלה',
    shortTitleHe: 'שער ההתחלה',
    descriptionHe: 'הכוכב הראשון פותח את שער הממלכה ומכריז שהכיתה יצאה לדרך משותפת.',
    stars: 1,
    x: 14.5,
    y: 72.5,
    width: 19.5,
    asset: `${ASSET_ROOT}/gate.png`,
    roomReady: true,
  },
  {
    id: 'village',
    titleHe: 'כפר החברים',
    shortTitleHe: 'כפר החברים',
    descriptionHe: 'בשני כוכבים כבר נוצרת קהילה קטנה — מקום ששייך לכולם.',
    stars: 2,
    x: 38,
    y: 57,
    width: 24,
    asset: `${ASSET_ROOT}/village.png`,
  },
  {
    id: 'square',
    titleHe: 'כיכר האחדות',
    shortTitleHe: 'כיכר האחדות',
    descriptionHe: 'שלושה כוכבים פותחים כיכר חגיגית שבה מציינים הצלחות כיתתיות ראשונות.',
    stars: 3,
    x: 50,
    y: 82,
    width: 21,
    asset: `${ASSET_ROOT}/square.png`,
  },
  {
    id: 'bridge',
    titleHe: 'גשר הכוכבים',
    shortTitleHe: 'גשר הכוכבים',
    descriptionHe: 'בחמישה כוכבים הכיתה מחברת בין חלקי הממלכה ומגיעה לאזור חדש.',
    stars: 5,
    x: 30,
    y: 89,
    width: 27,
    asset: `${ASSET_ROOT}/bridge.png`,
  },
  {
    id: 'library',
    titleHe: 'הספרייה הקסומה',
    shortTitleHe: 'הספרייה הקסומה',
    descriptionHe: 'שישה כוכבים פותחים מרכז ידע מרהיב עם ספרים, קסם וחלונות זוהרים.',
    stars: 6,
    x: 38,
    y: 36,
    width: 25,
    asset: `${ASSET_ROOT}/library.png`,
  },
  {
    id: 'tower',
    titleHe: 'מגדל השומרים',
    shortTitleHe: 'מגדל השומרים',
    descriptionHe: 'בתשעה כוכבים מתרומם מגדל שמביט על כל הממלכה.',
    stars: 9,
    x: 61,
    y: 49,
    width: 18,
    asset: `${ASSET_ROOT}/tower.png`,
  },
  {
    id: 'castle',
    titleHe: 'ארמון הכתר',
    shortTitleHe: 'ארמון הכתר',
    descriptionHe: 'בארבעה־עשר כוכבים הממלכה כבר מקבלת ארמון מרכזי ומפואר.',
    stars: 14,
    x: 72,
    y: 70,
    width: 29,
    asset: `${ASSET_ROOT}/castle.png`,
  },
  {
    id: 'garden',
    titleHe: 'גן האור',
    shortTitleHe: 'גן האור',
    descriptionHe: 'חמישה־עשר כוכבים מוסיפים גן קסום ומואר שמסמל התמדה וצמיחה.',
    stars: 15,
    x: 78,
    y: 56,
    width: 24,
    asset: `${ASSET_ROOT}/garden.png`,
  },
  {
    id: 'observatory',
    titleHe: 'מצפה הכוכבים',
    shortTitleHe: 'מצפה הכוכבים',
    descriptionHe: 'בעשרים כוכבים נפתח מצפה שמביט אל השלב הבא של הממלכה.',
    stars: 20,
    x: 63,
    y: 37,
    width: 24,
    asset: `${ASSET_ROOT}/observatory.png`,
  },
  {
    id: 'citadel',
    titleHe: 'מצודת האגדות',
    shortTitleHe: 'מצודת האגדות',
    descriptionHe: 'אזור אגדי שייפתח בשלבים המתקדמים של הממלכה.',
    stars: 22,
    x: 82,
    y: 42,
    width: 16,
  },
  {
    id: 'crown',
    titleHe: 'כתר האחדות',
    shortTitleHe: 'כתר האחדות',
    descriptionHe: 'פסגת הממלכה הכיתתית — הישג ששייך לכל הכיתה.',
    stars: 24,
    x: 52,
    y: 22,
    width: 16,
  },
];

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

  const nextLocked = LANDMARKS.find(landmark => landmark.stars > displayStars) ?? null;
  const initialSelected =
    [...LANDMARKS].reverse().find(landmark => displayStars >= landmark.stars) ?? nextLocked ?? LANDMARKS[0];

  const [selectedId, setSelectedId] = useState(initialSelected.id);
  const [view, setView] = useState<'map' | 'gate-room'>('map');

  const selectedLandmark = useMemo(
    () => LANDMARKS.find(landmark => landmark.id === selectedId) ?? LANDMARKS[0],
    [selectedId]
  );

  const currentLevel = classKingdomLevel(displayStars);
  const nextMilestone = nextClassKingdomMilestone(displayStars);
  const nextLevel = CLASS_KINGDOM_LEVELS.find(level => level.minStars > displayStars) ?? null;
  const unlocked = LANDMARKS.filter(landmark => displayStars >= landmark.stars);
  const nextTargets = LANDMARKS.filter(landmark => landmark.stars > displayStars).slice(0, 2);

  if (view === 'gate-room') {
    return (
      <ClassKingdomGateRoom
        stars={displayStars}
        classId={classId}
        sandboxMode={sandboxMode}
        viewerRole={viewerRole}
        studentId={studentId}
        teacherId={teacherId}
        onBack={() => setView('map')}
      />
    );
  }

  function handleLandmarkClick(landmark: Landmark, isUnlocked: boolean) {
    if (isUnlocked && landmark.id === 'gate' && landmark.roomReady) {
      setView('gate-room');
      return;
    }

    setSelectedId(landmark.id);
  }

  function enterSelectedRoom() {
    const isUnlocked = displayStars >= selectedLandmark.stars;
    if (!isUnlocked) return;

    if (selectedLandmark.id === 'gate' && selectedLandmark.roomReady) {
      setView('gate-room');
    }
  }

  return (
    <section className="mt-5 rounded-3xl border border-cyan-300/15 bg-magic-bg/35 p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="font-black text-white">🗺️ הממלכה החיה של הכיתה</h3>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-magic-soft/60">
            כל יעד כיתתי שהושלם מרחיב את העולם. מבנים רחוקים נשארים מסתוריים, המבנה הבא מופיע כרמז,
            ומבנים שנפתחו הופכים למקומות שאפשר להיכנס אליהם.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {allowSandbox && (
            <button
              type="button"
              onClick={() => {
                setSandboxMode(value => !value);
                setView('map');
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

      <div className="mt-5 ck31-layout">
        <div className="ck31-map-wrap">
          <div className="ck31-map" dir="rtl">
            {sandboxMode && (
              <div className="ck31-sandbox-banner">🧪 מפת ניסויים · הכול פתוח · לא משנה נתונים אמיתיים</div>
            )}
            <img
              src="/assets/class-kingdom/background/kingdom-background-v3.png"
              alt="הממלכה הכיתתית"
              className="ck31-map-background"
              draggable={false}
            />

            <div className="ck31-map-vignette" />
            <div className={`ck31-world-light ck31-light-level-${Math.min(6, currentLevel.level)}`} />

            {LANDMARKS.map((landmark, index) => {
              const isUnlocked = displayStars >= landmark.stars;
              const isPreview = nextLocked?.id === landmark.id;
              const isSelected = selectedLandmark.id === landmark.id && isUnlocked;

              if (!isUnlocked && !isPreview) return null;

              return (
                <button
                  key={landmark.id}
                  type="button"
                  data-landmark={landmark.id}
                  className={`ck31-landmark ${isUnlocked ? 'is-unlocked' : 'is-preview'} ${isSelected ? 'is-selected' : ''} ${isUnlocked && landmark.roomReady ? 'has-room' : ''}`}
                  style={{
                    left: `${landmark.x}%`,
                    top: `${landmark.y}%`,
                    width: `${landmark.width}%`,
                    zIndex: 20 + index,
                  }}
                  onClick={() => handleLandmarkClick(landmark, isUnlocked)}
                  aria-label={`${landmark.titleHe} - ${isUnlocked ? 'פתוח' : 'הבא בתור'}`}
                >
                  <span className="ck31-ground-glow" />

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

                  <span className="ck31-landmark-caption">
                    <span className="ck31-landmark-name">{landmark.shortTitleHe}</span>
                    <span className="ck31-landmark-status">
                      {isUnlocked
                        ? landmark.roomReady
                          ? 'לחצו כדי להיכנס'
                          : 'פתוח'
                        : `${landmark.stars}⭐ לפתיחה`}
                    </span>
                  </span>
                </button>
              );
            })}

            <div className="ck31-map-topbar">
              <div className="ck31-title-card">
                <div className="text-[10px] font-black text-yellow-100/70">הממלכה שלכם</div>
                <div className="mt-1 text-base font-black text-white">{currentLevel.titleHe}</div>
              </div>
              <div className="ck31-next-chip">
                {nextTargets[0] ? `הבא: ${nextTargets[0].shortTitleHe} · ${nextTargets[0].stars}⭐` : 'כל האזורים פתוחים'}
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
                <h4 className="mt-1 text-xl font-black text-white">{selectedLandmark.titleHe}</h4>
              </div>
              <div className={`rounded-full px-3 py-1 text-[11px] font-black ${displayStars >= selectedLandmark.stars ? 'bg-emerald-400/15 text-emerald-100' : 'bg-yellow-400/10 text-yellow-100'}`}>
                {displayStars >= selectedLandmark.stars ? 'נפתח' : `${selectedLandmark.stars}⭐`}
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-magic-soft/70">{selectedLandmark.descriptionHe}</p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <MiniStat value={`${Math.max(0, selectedLandmark.stars - displayStars)}`} label="כוכבים חסרים" />
              <MiniStat value={displayStars >= selectedLandmark.stars ? 'כן' : 'עדיין לא'} label="פתוח לכניסה" />
            </div>

            {displayStars >= selectedLandmark.stars && selectedLandmark.roomReady ? (
              <button
                type="button"
                onClick={enterSelectedRoom}
                className="mt-4 w-full rounded-2xl border border-cyan-200/25 bg-cyan-300/15 px-4 py-3 text-sm font-black text-cyan-50 transition hover:-translate-y-0.5 hover:bg-cyan-300/20"
              >
                🚪 כניסה אל {selectedLandmark.titleHe}
              </button>
            ) : displayStars >= selectedLandmark.stars ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs leading-5 text-magic-soft/65">
                🏗️ המבנה פתוח בממלכה. החדר הפנימי שלו ייבנה בהמשך.
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-yellow-300/15 bg-yellow-400/8 px-4 py-3 text-xs leading-5 text-yellow-100/75">
                🔒 החדר ייפתח יחד עם המבנה ב־{selectedLandmark.stars} כוכבים.
              </div>
            )}
          </article>

          <article className="rounded-3xl border border-yellow-300/15 bg-yellow-400/8 p-4">
            <div className="text-sm font-black text-yellow-100">🌟 מה נפתח בקרוב</div>
            <div className="mt-3 space-y-2">
              {nextTargets.length > 0 ? nextTargets.map(target => (
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
                <div className="rounded-xl border border-emerald-300/15 bg-emerald-500/10 px-3 py-3 text-xs font-bold text-emerald-100">כל האזורים הקיימים פתוחים.</div>
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-fuchsia-300/15 bg-fuchsia-500/8 p-4">
            <div className="text-sm font-black text-fuchsia-100">📈 מצב הממלכה</div>
            <div className="mt-3 space-y-3">
              <ProgressRow label="אזורים פתוחים" value={unlocked.length} total={LANDMARKS.length} />
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
