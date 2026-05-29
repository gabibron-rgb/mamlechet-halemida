import { useMemo, useState } from 'react';
import { getItemById } from '../../data/items';
import PlacedItemVisual from './PlacedItemVisual';
import ItemInspectModal from './ItemInspectModal';
import type { StudentState, InventoryEntry } from '../../store/useGameStore';
import type { Zone } from '../../data/items';

type Props = {
  student: StudentState;
};

type PlacedEntry = {
  entry: InventoryEntry;
  index: number;
};

type SceneZone = {
  id: Zone;
  label: string;
};

const SCENE_ZONES: SceneZone[] = [
  { id: 'wall', label: 'קיר' },
  { id: 'shelf', label: 'מדף' },
  { id: 'desk', label: 'שולחן' },
  { id: 'floor', label: 'רצפה' },
  { id: 'petarea', label: 'אזור חיה' },
  { id: 'special', label: 'אזור מיוחד' },
];

export default function KingdomScene({ student }: Props) {
  const [selected, setSelected] = useState<PlacedEntry | null>(null);

  const grouped = useMemo(() => {
    const base: Record<string, PlacedEntry[]> = {
      wall: [],
      shelf: [],
      desk: [],
      floor: [],
      petarea: [],
      special: [],
    };

    student.inventory.forEach((entry, index) => {
      if (!entry.placedZone) return;
      if (!getItemById(entry.itemId)) return;
      base[entry.placedZone]?.push({ entry, index });
    });

    return base;
  }, [student.inventory]);

  const totalPlaced = Object.values(grouped).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  return (
    <>
      <div className="bg-magic-panel/80 rounded-3xl p-4 md:p-6">
        <div className="text-center mb-4">
          <div className="text-3xl mb-2">🏰</div>
          <h2 className="text-2xl font-black text-magic-accent">
            הממלכה שלי
          </h2>
          <p className="text-magic-soft/80 text-sm mt-2">
            כאן רואים את החפצים שכבר הונחו בממלכה. לחץ/י על חפץ כדי לראות מה הוא.
          </p>
          <p className="text-magic-soft/50 text-xs mt-2">
            {totalPlaced} placed items
          </p>
        </div>

        <div className="relative w-full aspect-[16/11] rounded-[2rem] overflow-hidden border border-magic-soft/20 bg-gradient-to-b from-[#2d1d5d] to-[#1b103f] shadow-2xl">
          {/* Wall */}
          <div className="absolute inset-x-0 top-0 h-[58%] bg-gradient-to-b from-[#3b2377] to-[#2c195e]" />

          {/* Floor */}
          <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-b from-[#3a205f] to-[#1b103f]" />

          {/* Wall glow */}
          <div className="absolute top-[8%] left-[12%] w-24 h-24 rounded-full bg-fuchsia-400/10 blur-3xl" />
          <div className="absolute top-[6%] right-[16%] w-28 h-28 rounded-full bg-cyan-400/10 blur-3xl" />

          {/* Shelf */}
          <div className="absolute left-[8%] top-[24%] w-[34%] h-[8px] rounded-full bg-amber-700 shadow-[0_6px_18px_rgba(0,0,0,0.35)]" />
          <div className="absolute left-[8%] top-[24%] w-[34%] h-[34%] rounded-[1.8rem] border border-amber-400/25 bg-amber-900/10" />

          {/* Wall hanging line / gallery */}
          <div className="absolute right-[8%] top-[16%] w-[30%] h-[28%] rounded-[1.8rem] border border-sky-300/25 bg-sky-900/10" />
          <div className="absolute right-[12%] top-[23%] left-[62%] h-[2px] bg-sky-200/25" />
          <div className="absolute right-[11%] top-[22%] w-3 h-3 rounded-full bg-sky-200/35" />
          <div className="absolute left-[62%] top-[22%] w-3 h-3 rounded-full bg-sky-200/35" />

          {/* Desk */}
          <div className="absolute right-[8%] bottom-[16%] w-[34%] h-[22%] rounded-[2rem] border border-orange-400/25 bg-orange-900/10" />
          <div className="absolute right-[10%] bottom-[18%] w-[30%] h-[12px] rounded-full bg-amber-700 shadow-[0_10px_24px_rgba(0,0,0,0.4)]" />

          {/* Floor zone */}
          <div className="absolute left-[34%] bottom-[10%] w-[32%] h-[18%] rounded-[2rem] border border-fuchsia-300/15 bg-fuchsia-600/5" />

          {/* Pet area */}
          <div className="absolute left-[8%] bottom-[10%] w-[24%] h-[18%] rounded-full border border-teal-300/20 bg-teal-400/10" />

          {/* Special zone */}
          <div className="absolute left-[38%] top-[14%] w-[18%] h-[20%] rounded-[1.5rem] border border-yellow-300/30 bg-yellow-500/10 shadow-[0_0_40px_rgba(255,215,0,0.15)]" />

          {/* Render items */}
          {SCENE_ZONES.map(zone => {
            const items = grouped[zone.id] ?? [];
            return items.map((placed, idx) => {
              const style = getItemStyle(zone.id, idx, items.length);
              return (
                <button
                  key={`${placed.entry.itemId}-${placed.index}`}
                  type="button"
                  onClick={() => setSelected(placed)}
                  className="absolute transition-transform hover:scale-105 focus:scale-105"
                  style={style}
                  title={getItemById(placed.entry.itemId)?.nameHe ?? ''}
                >
                  <div className="w-full h-full relative">
                    <div className="absolute inset-0 rounded-2xl bg-black/10 blur-[2px]" />
                    <PlacedItemVisual entry={placed.entry} />
                  </div>
                </button>
              );
            });
          })}

          {/* Empty-state hint */}
          {totalPlaced === 0 && (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="bg-magic-bg/40 rounded-3xl px-6 py-5 text-center max-w-md">
                <div className="text-4xl mb-3">✨</div>
                <div className="text-white font-bold mb-2">
                  הממלכה עדיין ריקה
                </div>
                <div className="text-magic-soft/80 text-sm">
                  קנה/י חפצים בחנות ואז הצב/י אותם בחדר כדי שהם יופיעו כאן כממלכה אמיתית.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ItemInspectModal
        open={!!selected}
        onClose={() => setSelected(null)}
        entry={selected?.entry ?? null}
      />
    </>
  );
}

function getItemStyle(zone: Zone, index: number, total: number): React.CSSProperties {
  const leftsForCount = (arr: number[], i: number) => arr[i] ?? arr[arr.length - 1];

  if (zone === 'shelf') {
    const lefts =
      total === 1 ? [22] :
      total === 2 ? [16, 30] :
      total === 3 ? [14, 24, 34] :
      [12, 20, 28, 36];
    return {
      left: `${leftsForCount(lefts, index)}%`,
      top: '14%',
      width: '12%',
      height: '18%',
    };
  }

  if (zone === 'wall') {
    const lefts =
      total === 1 ? [74] :
      total === 2 ? [68, 80] :
      total === 3 ? [65, 74, 83] :
      [63, 71, 79, 87];
    return {
      left: `${leftsForCount(lefts, index)}%`,
      top: '16%',
      width: '11%',
      height: '18%',
      transform: 'translateX(-50%)',
    };
  }

  if (zone === 'special') {
    const lefts = total === 1 ? [47] : total === 2 ? [44, 50] : [42, 47, 52];
    return {
      left: `${leftsForCount(lefts, index)}%`,
      top: '14%',
      width: '10%',
      height: '16%',
      transform: 'translateX(-50%)',
    };
  }

  if (zone === 'desk') {
    const lefts =
      total === 1 ? [76] :
      total === 2 ? [70, 82] :
      total === 3 ? [68, 76, 84] :
      [66, 73, 80, 87];
    return {
      left: `${leftsForCount(lefts, index)}%`,
      top: '56%',
      width: '11%',
      height: '18%',
      transform: 'translateX(-50%)',
    };
  }

  if (zone === 'petarea') {
    const lefts = total === 1 ? [20] : total === 2 ? [16, 24] : [14, 20, 26];
    return {
      left: `${leftsForCount(lefts, index)}%`,
      top: '70%',
      width: '11%',
      height: '16%',
      transform: 'translateX(-50%)',
    };
  }

  // floor
  const lefts =
    total === 1 ? [50] :
    total === 2 ? [45, 55] :
    total === 3 ? [42, 50, 58] :
    [38, 46, 54, 62];

  return {
    left: `${leftsForCount(lefts, index)}%`,
    top: '69%',
    width: '12%',
    height: '16%',
    transform: 'translateX(-50%)',
  };
}