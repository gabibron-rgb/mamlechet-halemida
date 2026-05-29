import Modal from '../shared/Modal';
import { getItemById } from '../../data/items';
import PlacedItemVisual from './PlacedItemVisual';
import type { InventoryEntry } from '../../store/useGameStore';

type Props = {
  open: boolean;
  onClose: () => void;
  entry: InventoryEntry | null;
};

const RARITY_HE: Record<string, string> = {
  common: 'רגיל',
  uncommon: 'יוצא דופן',
  rare: 'נדיר',
  epic: 'אפי',
  legendary: 'אגדי',
};

const ZONE_HE: Record<string, string> = {
  wall: 'קיר',
  floor: 'רצפה',
  shelf: 'מדף',
  desk: 'שולחן',
  special: 'אזור מיוחד',
  petarea: 'רצפת הממלכה',
};

export default function ItemInspectModal({ open, onClose, entry }: Props) {
  const item = entry ? getItemById(entry.itemId) : null;

  return (
    <Modal open={open} onClose={onClose} title="בדיקת חפץ">
      {!entry || !item ? (
        <div className="text-center text-magic-soft">לא נמצא חפץ</div>
      ) : (
        <div className="flex flex-col gap-4 text-center">
          <div className="mx-auto w-40 h-32">
            <PlacedItemVisual entry={entry} />
          </div>

          <div>
            <div className="text-2xl font-black text-white">{item.nameHe}</div>
            <div className="text-magic-soft/80 text-sm mt-1">
              {item.descriptionHe}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-magic-bg/40 rounded-xl p-3">
              <div className="text-magic-soft/70 mb-1">נדירות</div>
              <div className="text-white font-bold">
                {RARITY_HE[item.rarity] ?? item.rarity}
              </div>
            </div>
            <div className="bg-magic-bg/40 rounded-xl p-3">
              <div className="text-magic-soft/70 mb-1">מיקום</div>
              <div className="text-white font-bold">
                {ZONE_HE[entry.placedZone ?? ''] ?? 'לא ידוע'}
              </div>
            </div>
          </div>

          <div className="text-xs text-magic-soft/60">
            כרגע ההסרה מהממלכה עדיין מתבצעת דרך לשונית "חדר".
          </div>

          <button
            onClick={onClose}
            className="bg-magic-accent text-magic-bg font-bold py-3 rounded-xl"
          >
            סגור
          </button>
        </div>
      )}
    </Modal>
  );
}