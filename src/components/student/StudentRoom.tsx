import { getItemById } from '../../data/items';
import type { Zone } from '../../data/items';
import type { StudentState } from '../../store/useGameStore';
import RarityBadge from '../shared/RarityBadge';

type Props = {
  student: StudentState;
};

type RoomZone = {
  id: Zone;
  title: string;
  emoji: string;
  description: string;
};

const ROOM_ZONES: RoomZone[] = [
  {
    id: 'wall',
    title: 'קיר',
    emoji: '🖼️',
    description: 'פוסטרים, תמונות וקישוטי קיר',
  },
  {
    id: 'shelf',
    title: 'מדף',
    emoji: '📚',
    description: 'פריטים קטנים לתצוגה',
  },
  {
    id: 'desk',
    title: 'שולחן',
    emoji: '🪑',
    description: 'חפצים שמונחים על השולחן',
  },
  {
    id: 'floor',
    title: 'רצפה',
    emoji: '🧺',
    description: 'שטיחים וחפצים גדולים',
  },
  {
    id: 'special',
    title: 'מיוחדים',
    emoji: '✨',
    description: 'פרסים מיוחדים, גביעים ודברים נדירים',
  },
  {
    id: 'petarea',
    title: 'אזור חיה',
    emoji: '🐾',
    description: 'בעתיד יגור כאן היצור המלווה שלך',
  },
];

export default function StudentRoom({ student }: Props) {
  const placedEntries = student.inventory
    .map((entry, idx) => ({
      entry,
      idx,
      item: getItemById(entry.itemId),
    }))
    .filter(({ entry, item }) => item && entry.placedZone);

  const placedCount = placedEntries.length;

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-magic-soft/20 bg-magic-bg/30 p-5 text-center">
        <div className="text-4xl mb-2">🏰</div>

        <h2 className="text-xl font-black text-magic-accent mb-1">
          החדר שלי
        </h2>

        <p className="text-sm text-magic-soft/75">
          כאן רואים את החפצים שכבר מיקמת בחדר. בהמשך נהפוך את זה לחדר תלת־ממדי אמיתי.
        </p>

        <div className="mt-3 text-xs text-magic-soft/60" dir="ltr">
          {placedCount} placed items
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {ROOM_ZONES.map(zone => {
          const zoneEntries = placedEntries.filter(
            ({ entry }) => entry.placedZone === zone.id
          );

          return (
            <section
              key={zone.id}
              className="rounded-3xl border border-magic-soft/15 bg-magic-panel/60 p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-magic-accent">
                    {zone.title} {zone.emoji}
                  </h3>

                  <p className="text-xs text-magic-soft/60">
                    {zone.description}
                  </p>
                </div>

                <div className="rounded-full border border-magic-soft/30 px-3 py-1 text-xs text-magic-soft/70">
                  {zoneEntries.length}
                </div>
              </div>

              {zoneEntries.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-magic-soft/20 bg-magic-bg/25 p-4 text-center text-sm text-magic-soft/50">
                  אין כאן עדיין חפצים.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {zoneEntries.map(({ entry, idx, item }) => {
                    if (!item) return null;

                    return (
                      <div
                        key={entry.id ?? `${entry.itemId}-${idx}`}
                        className="rounded-2xl bg-magic-bg/45 p-3"
                      >
                        <div className="mb-2 text-3xl">
                          {item.modelRef === 'sphere'
                            ? '🔮'
                            : item.modelRef === 'cone'
                              ? '🔺'
                              : item.modelRef === 'cylinder'
                                ? '🏛️'
                                : item.modelRef === 'torus'
                                  ? '💍'
                                  : '📦'}
                        </div>

                        <div className="font-black text-white text-sm">
                          {item.nameHe}
                        </div>

                        <div className="mt-1 text-xs text-magic-soft/65">
                          {item.descriptionHe}
                        </div>

                        <div className="mt-2">
                          <RarityBadge rarity={item.rarity} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}