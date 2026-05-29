import type { Rarity } from '../../data/boxes';

type Props = {
  rarity?: Rarity;
};

const rarityGlow: Record<string, string> = {
  common: 'drop-shadow(0 0 3px rgba(255,255,255,0.35))',
  uncommon: 'drop-shadow(0 0 5px rgba(80,255,170,0.45))',
  rare: 'drop-shadow(0 0 7px rgba(80,160,255,0.55))',
  epic: 'drop-shadow(0 0 9px rgba(190,90,255,0.65))',
  legendary: 'drop-shadow(0 0 12px rgba(255,210,80,0.8))',
};

export default function KingdomBannerSprite({ rarity = 'common' }: Props) {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <svg
        viewBox="0 0 120 120"
        className="h-full w-full"
        style={{
          filter: rarityGlow[rarity] ?? rarityGlow.common,
        }}
      >
        {/* צל קטן מאחורי הדגל */}
        <ellipse
          cx="61"
          cy="105"
          rx="18"
          ry="5"
          fill="rgba(0,0,0,0.25)"
        />

        {/* המוט */}
        <rect
          x="56"
          y="16"
          width="8"
          height="88"
          rx="4"
          fill="#8b4513"
        />

        <rect
          x="58"
          y="16"
          width="3"
          height="88"
          rx="2"
          fill="rgba(255,210,120,0.25)"
        />

        {/* ראש המוט */}
        <circle
          cx="60"
          cy="14"
          r="5"
          fill="#a35a1d"
        />

        {/* בד הדגל */}
        <path
          d="
            M 25 24
            H 91
            V 68
            H 25
            L 39 46
            L 25 24
            Z
          "
          fill="#ec4899"
          stroke="#ffd166"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* הצללה פנימית לדגל */}
        <path
          d="
            M 28 28
            H 88
            V 38
            H 28
            Z
          "
          fill="rgba(255,255,255,0.18)"
        />

        <path
          d="
            M 28 58
            H 88
            V 66
            H 28
            Z
          "
          fill="rgba(0,0,0,0.12)"
        />

        {/* סמל פנימי - מגן */}
        <path
          d="
            M 58 34
            L 76 41
            V 53
            C 76 64, 66 70, 58 74
            C 50 70, 40 64, 40 53
            V 41
            Z
          "
          fill="#1f1b4d"
          stroke="#ffd166"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* כתר */}
        <path
          d="
            M 46 54
            L 49 44
            L 55 51
            L 60 41
            L 65 51
            L 71 44
            L 74 54
            Z
          "
          fill="#facc15"
          stroke="#7c2d12"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        <rect
          x="47"
          y="54"
          width="26"
          height="7"
          rx="2"
          fill="#facc15"
          stroke="#7c2d12"
          strokeWidth="1.5"
        />

        {/* אבני חן בכתר */}
        <circle cx="52" cy="56.5" r="1.5" fill="#ef4444" />
        <circle cx="60" cy="56.5" r="1.5" fill="#3b82f6" />
        <circle cx="68" cy="56.5" r="1.5" fill="#22c55e" />
      </svg>
    </div>
  );
}