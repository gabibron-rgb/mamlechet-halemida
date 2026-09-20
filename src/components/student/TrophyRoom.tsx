import { useEffect, useMemo, useState, type CSSProperties } from 'react';

import {
  COLLECTION_COMPLETION_AWARDS,
  getCollectionCompletionAwardByAchievementId,
  type CollectionCompletionAward,
} from '../../data/collectionCompletionAwards';
import {
  ALL_TROPHY_ROOM_SLOTS,
  COLLECTION_DISPLAY_SLOTS,
  COLLECTION_THEME_SLOT_ID,
  TROPHY_DISPLAY_SLOTS,
  type TrophyRoomSlot,
  type TrophyRoomSlotCategory,
} from '../../data/trophyRoomSlots';
import { THEMES } from '../../data/themes';
import {
  CESARIA_REAL_TROPHY_GRANT,
  getTrophyDefinition,
} from '../../data/trophies';
import { roomAssetUrl } from '../../lib/assetUrls';
import { useGameStore, type StudentState } from '../../store/useGameStore';
import Modal from '../shared/Modal';
import TrophyVisual from '../shared/TrophyVisual';

type Props = {
  student: StudentState;
};

type TrophyEntry = StudentState['trophies'][number];

type CollectionPrizeEntry = {
  award: CollectionCompletionAward;
  achievedAt: number;
};

type SelectedDisplay =
  | { kind: 'trophy'; trophy: TrophyEntry }
  | { kind: 'collectionPrize'; prize: CollectionPrizeEntry };

const TROPHY_ROOM_BACKGROUND = roomAssetUrl(
  'trophy-room/trophy-room-bg.png'
);

const SAMPLE_TROPHIES: TrophyEntry[] = [
  {
    id: 'preview_effort',
    trophyTheme: 'effort',
    caption: 'על התמדה יוצאת דופן גם כשהאתגר היה קשה',
    awardedAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
  },
  {
    id: 'preview_creativity',
    trophyTheme: 'creativity',
    caption: 'על פתרון מקורי שהפתיע את כולם',
    awardedAt: Date.now() - 1000 * 60 * 60 * 24 * 50,
  },
  {
    id: 'preview_kindness',
    trophyTheme: 'kindness',
    caption: 'על עזרה לחברה ברגע שהיה חשוב במיוחד',
    awardedAt: Date.now() - 1000 * 60 * 60 * 24 * 40,
  },
  {
    id: 'preview_curiosity',
    trophyTheme: 'curiosity',
    caption: 'על סקרנות, שאלת שאלות ורצון אמיתי לגלות ולהבין',
    awardedAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
  },
  {
    id: 'preview_leadership',
    trophyTheme: 'leadership',
    caption: 'על יוזמה, אחריות והובלה חיובית של אחרים',
    awardedAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
  },
  {
    id: 'preview_growth',
    trophyTheme: 'growth',
    caption: 'על התקדמות משמעותית, למידה והתפתחות לאורך הדרך',
    awardedAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
  },
];

const SAMPLE_COLLECTION_PRIZES: CollectionPrizeEntry[] = [
  {
    award:
      COLLECTION_COMPLETION_AWARDS.find(award => award.themeId === 'chess') ??
      COLLECTION_COMPLETION_AWARDS[0],
    achievedAt: Date.now() - 1000 * 60 * 60 * 24 * 18,
  },
  {
    award:
      COLLECTION_COMPLETION_AWARDS.find(award => award.themeId === 'space') ??
      COLLECTION_COMPLETION_AWARDS[0],
    achievedAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
  },
];

function themeDefinition(themeId: string) {
  return THEMES.find(theme => theme.id === themeId);
}

function formatAwardDate(timestamp: number): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function slotStyle(slot: TrophyRoomSlot): CSSProperties {
  return {
    left: `${slot.x}%`,
    top: `${slot.y}%`,
    width: `${slot.width}%`,
    height: `${slot.height}%`,
    transform: 'translate(-50%, -50%)',
  };
}

function debugClass(category: TrophyRoomSlotCategory): string {
  if (category === 'collection') {
    return 'border-red-400 bg-red-500/15 text-red-50';
  }

  if (category === 'trophy') {
    return 'border-emerald-300 bg-emerald-400/15 text-emerald-50';
  }

  if (category === 'certificate') {
    return 'border-sky-300 bg-sky-400/15 text-sky-50';
  }

  return 'border-fuchsia-300 bg-fuchsia-400/15 text-fuchsia-50';
}

export default function TrophyRoom({ student }: Props) {
  const reconcileAchievements = useGameStore(
    state => state.reconcileAchievements
  );

  const [showLocalPreview, setShowLocalPreview] = useState(false);
  const [showCesariaPreview, setShowCesariaPreview] = useState(false);
  const [showSlotDebug, setShowSlotDebug] = useState(import.meta.env.DEV);
  const [selectedDisplay, setSelectedDisplay] =
    useState<SelectedDisplay | null>(null);

  const isLocalItemTester =
    import.meta.env.DEV &&
    (student.loginName === 'itemtester' || student.name === 'בודק חפצים');

  const collectionSignature = useMemo(
    () =>
      student.inventory
        .filter(entry => entry.kind !== 'box')
        .map(entry => entry.itemId)
        .sort()
        .join('|'),
    [student.inventory]
  );

  useEffect(() => {
    void reconcileAchievements(student.id);
  }, [collectionSignature, reconcileAchievements, student.id]);

  const trophies = showLocalPreview
    ? SAMPLE_TROPHIES
    : showCesariaPreview
      ? [
          ...student.trophies.filter(
            trophy => trophy.id !== CESARIA_REAL_TROPHY_GRANT.trophy.id
          ),
          {
            ...CESARIA_REAL_TROPHY_GRANT.trophy,
            awardedAt: Date.now(),
          },
        ]
      : student.trophies;

  /**
   * Trophy placement is chronological:
   * oldest trophy gets trophy-01, then trophy-02, etc.
   * Once a trophy has an earlier awardedAt than another one it will always
   * remain earlier in the display order.
   */
  const chronologicalTrophies = useMemo(
    () =>
      [...trophies].sort(
        (first, second) => first.awardedAt - second.awardedAt
      ),
    [trophies]
  );

  const collectionPrizes = useMemo<CollectionPrizeEntry[]>(() => {
    if (showLocalPreview) return SAMPLE_COLLECTION_PRIZES;

    return (student.achievementRecords ?? [])
      .map(record => {
        const award = getCollectionCompletionAwardByAchievementId(
          record.achievementId
        );

        return award ? { award, achievedAt: record.achievedAt } : null;
      })
      .filter((entry): entry is CollectionPrizeEntry => entry !== null);
  }, [showLocalPreview, student.achievementRecords]);

  const collectionPrizeBySlot = useMemo(() => {
    const result = new Map<string, CollectionPrizeEntry>();

    for (const prize of collectionPrizes) {
      const slotId = COLLECTION_THEME_SLOT_ID[prize.award.themeId];
      if (slotId) result.set(slotId, prize);
    }

    return result;
  }, [collectionPrizes]);

  const trophyBySlot = useMemo(() => {
    const result = new Map<string, TrophyEntry>();

    TROPHY_DISPLAY_SLOTS.forEach((slot, index) => {
      const trophy = chronologicalTrophies[index];
      if (trophy) result.set(slot.id, trophy);
    });

    return result;
  }, [chronologicalTrophies]);

  const overflowTrophies = Math.max(
    0,
    chronologicalTrophies.length - TROPHY_DISPLAY_SLOTS.length
  );

  return (
    <div className="mx-auto w-full max-w-[1720px]">
      {import.meta.env.DEV && (
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setShowSlotDebug(value => !value)}
            className="rounded-xl border border-sky-300/30 bg-sky-500/10 px-4 py-2 text-xs font-black text-sky-100 hover:bg-sky-500/20"
          >
            {showSlotDebug ? 'הסתר מספור slots' : 'הצג מספור slots'}
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedDisplay(null);
              setShowCesariaPreview(false);
              setShowLocalPreview(value => !value);
            }}
            className="rounded-xl border border-fuchsia-300/30 bg-fuchsia-500/10 px-4 py-2 text-xs font-black text-fuchsia-100 hover:bg-fuchsia-500/20"
          >
            {showLocalPreview
              ? 'חזרה לפרסים האמיתיים'
              : 'הצג כמה פרסי דוגמה'}
          </button>

          {isLocalItemTester && (
            <button
              type="button"
              onClick={() => {
                setSelectedDisplay(null);
                setShowLocalPreview(false);
                setShowCesariaPreview(value => !value);
              }}
              className="rounded-xl border border-yellow-300/35 bg-yellow-400/10 px-4 py-2 text-xs font-black text-yellow-100 hover:bg-yellow-400/20"
            >
              {showCesariaPreview
                ? 'הסתר את גביע קיסריה'
                : 'הצג את גביע קיסריה'}
            </button>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-[1.75rem] border border-yellow-200/15 bg-[#120f20] shadow-2xl">
        <div
          className="relative mx-auto min-w-[900px] overflow-hidden"
          style={{ aspectRatio: '1672 / 941' }}
        >
          <img
            src={TROPHY_ROOM_BACKGROUND}
            alt="היכל הפרסים"
            draggable={false}
            className="absolute inset-0 h-full w-full select-none object-fill"
          />

          {COLLECTION_DISPLAY_SLOTS.map(slot => {
            const prize = collectionPrizeBySlot.get(slot.id);
            if (!prize) return null;

            return (
              <CollectionPrizeInSlot
                key={slot.id}
                slot={slot}
                prize={prize}
                onClick={() =>
                  setSelectedDisplay({ kind: 'collectionPrize', prize })
                }
              />
            );
          })}

          {TROPHY_DISPLAY_SLOTS.map(slot => {
            const trophy = trophyBySlot.get(slot.id);
            if (!trophy) return null;

            return (
              <TrophyInSlot
                key={slot.id}
                slot={slot}
                trophy={trophy}
                onClick={() =>
                  setSelectedDisplay({ kind: 'trophy', trophy })
                }
              />
            );
          })}

          {showSlotDebug &&
            ALL_TROPHY_ROOM_SLOTS.map(slot => (
              <SlotDebugOverlay key={slot.id} slot={slot} />
            ))}
        </div>
      </div>

      {overflowTrophies > 0 && (
        <div className="mx-auto mt-3 max-w-xl rounded-xl border border-yellow-300/15 bg-yellow-300/5 px-4 py-2 text-center text-xs font-bold text-yellow-100/70">
          יש עוד {overflowTrophies} גביעים מעבר ל־12 מקומות התצוגה הקיימים.
          הם נשמרים בחשבון ולא אובדים; לפני שנגיע למצב כזה נוסיף אגף תצוגה
          נוסף.
        </div>
      )}

      <AwardDetailsModal
        selected={selectedDisplay}
        onClose={() => setSelectedDisplay(null)}
      />
    </div>
  );
}

function SlotDebugOverlay({ slot }: { slot: TrophyRoomSlot }) {
  return (
    <div
      className={`pointer-events-none absolute z-30 border-2 ${debugClass(
        slot.category
      )}`}
      style={slotStyle(slot)}
    >
      <div className="absolute left-0 top-0 rounded-br-md bg-black/75 px-1 py-0.5 text-[9px] font-black leading-none">
        {slot.id}
      </div>
    </div>
  );
}

function TrophyInSlot({
  slot,
  trophy,
  onClick,
}: {
  slot: TrophyRoomSlot;
  trophy: TrophyEntry;
  onClick: () => void;
}) {
  const definition = getTrophyDefinition(trophy.trophyTheme);
  const name = definition?.nameHe ?? 'גביע מיוחד';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`פתיחת פרטי ${name}`}
      className="group absolute z-20 flex items-end justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200/80"
      style={slotStyle(slot)}
    >
      <div
        className="absolute left-[53%] flex h-[116%] w-[112%] -translate-x-1/2 items-end justify-center overflow-visible transition-transform duration-200 group-hover:-translate-y-[3%] group-hover:scale-105"
        style={{
          bottom:
            slot.id === 'trophy-05' ||
            slot.id === 'trophy-06' ||
            slot.id === 'trophy-07' ||
            slot.id === 'trophy-08'
              ? '-36%'
              : '-21%',
        }}
      >
        <div className="absolute bottom-[5%] h-[13%] w-[72%] rounded-[50%] bg-black/40 blur-[3px]" />
        <TrophyVisual
          definition={definition}
          className="h-full w-full"
          imageClassName="object-bottom transition-transform duration-200"
          fallbackClassName="text-[clamp(2.8rem,5vw,5.9rem)]"
        />
      </div>
    </button>
  );
}

function CollectionPrizeInSlot({
  slot,
  prize,
  onClick,
}: {
  slot: TrophyRoomSlot;
  prize: CollectionPrizeEntry;
  onClick: () => void;
}) {
  const theme = themeDefinition(prize.award.themeId);
  const accent = theme?.color ?? '#b8a4ff';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`פתיחת פרטי ${prize.award.prizeNameHe}`}
      className="group absolute z-20 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80"
      style={slotStyle(slot)}
    >
      <div
        className="absolute inset-[12%] rounded-full opacity-25 blur-md transition-opacity group-hover:opacity-45"
        style={{ backgroundColor: accent }}
      />
      <div className="relative text-[clamp(2rem,3.6vw,4.5rem)] leading-none drop-shadow-[0_5px_7px_rgba(0,0,0,0.6)] transition-transform duration-200 group-hover:-translate-y-[4%] group-hover:scale-110">
        {prize.award.prizeEmoji}
      </div>
    </button>
  );
}

function AwardDetailsModal({
  selected,
  onClose,
}: {
  selected: SelectedDisplay | null;
  onClose: () => void;
}) {
  if (!selected) return null;

  if (selected.kind === 'trophy') {
    const definition = getTrophyDefinition(selected.trophy.trophyTheme);
    const name = definition?.nameHe ?? 'גביע מיוחד';

    return (
      <Modal open onClose={onClose} title={name}>
        <div className="text-center">
          <div className="relative mx-auto mb-3 mt-0 flex h-[25rem] w-[20rem] max-w-full items-end justify-center">
            <div
              className="absolute inset-x-0 top-0 bottom-7 rounded-[999px] blur-2xl"
              style={{
                background:
                  'radial-gradient(circle at 50% 48%, rgba(255,224,128,0.42) 0%, rgba(245,185,54,0.22) 28%, rgba(126,87,194,0.12) 52%, rgba(0,0,0,0) 74%)',
              }}
            />
            <div
              className="absolute left-1/2 bottom-1 h-7 w-48 -translate-x-1/2 rounded-[50%] blur-[5px]"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(0,0,0,0.50) 0%, rgba(0,0,0,0.24) 48%, rgba(0,0,0,0) 76%)',
              }}
            />
            <div
              className="absolute left-1/2 bottom-[1.15rem] h-[2px] w-36 -translate-x-1/2 rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, rgba(255,215,90,0), rgba(255,224,128,0.72), rgba(255,215,90,0))',
              }}
            />
            <TrophyVisual
              definition={definition}
              className="relative z-10 h-full w-full"
              imageClassName="drop-shadow-[0_16px_24px_rgba(0,0,0,0.52)]"
              fallbackClassName="text-[10rem]"
            />
          </div>

          <div className="mx-auto rounded-3xl border border-yellow-300/25 bg-gradient-to-b from-yellow-300/12 to-yellow-300/5 px-5 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_28px_rgba(0,0,0,0.14)]">
            <div className="text-[11px] font-black tracking-[0.22em] text-yellow-100/60">
              {definition?.realWorld ? 'הישג מהעולם האמיתי' : 'הקדשת המורה'}
            </div>
            <div className="mt-2 text-lg font-bold leading-8 text-white">
              {selected.trophy.caption?.trim() || 'פרס מיוחד מהמורה'}
            </div>
          </div>

          <div className="mt-3 text-sm font-black text-yellow-100/75">
            {definition?.detailLineHe
              ? definition.detailLineHe
              : `הוענק ב־${formatAwardDate(selected.trophy.awardedAt)}`}
          </div>
        </div>
      </Modal>
    );
  }

  const { award, achievedAt } = selected.prize;
  const theme = themeDefinition(award.themeId);

  return (
    <Modal open onClose={onClose} title={award.prizeNameHe}>
      <div className="text-center">
        <div
          className="mx-auto mb-5 flex h-36 w-36 items-center justify-center rounded-full border-4 bg-black/20 text-7xl shadow-[inset_0_0_28px_rgba(255,255,255,0.12)]"
          style={{ borderColor: theme?.color ?? '#b8a4ff' }}
        >
          {award.prizeEmoji}
        </div>

        <div className="text-sm font-black text-cyan-100">
          פרס מיוחד על השלמת אוסף {theme?.nameHe ?? award.themeId}
        </div>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-magic-soft/70">
          {award.descriptionHe}
        </p>

        <div className="mt-5 rounded-2xl border border-white/10 bg-black/15 p-4 text-right text-xs leading-6 text-magic-soft/65">
          <div>
            <span className="font-black text-white">הישג: </span>
            {award.achievementTitleHe}
          </div>
          <div>
            <span className="font-black text-white">הושג בתאריך: </span>
            {formatAwardDate(achievedAt)}
          </div>
          <div>
            <span className="font-black text-white">סוג הפרס: </span>
            פרס תצוגה לחדר הפרסים בלבד
          </div>
        </div>
      </div>
    </Modal>
  );
}
