import { RARITY_LABEL_HE, RARITY_COLOR } from '../../data/boxes';
import type { Rarity } from '../../data/boxes';

export default function RarityBadge({ rarity }: { rarity: Rarity }) {
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{
        backgroundColor: RARITY_COLOR[rarity] + '33',
        color: RARITY_COLOR[rarity],
        border: `1px solid ${RARITY_COLOR[rarity]}`,
      }}
    >
      {RARITY_LABEL_HE[rarity]}
    </span>
  );
}
