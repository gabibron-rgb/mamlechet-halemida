import type { ReactNode } from 'react';
import type { Rarity } from '../../data/boxes';
import { ITEM_SPRITES } from '../../data/itemSprites';
import KingdomBannerSprite from './KingdomBannerSprite';

type Props = {
  itemId: string;
  rarity?: Rarity;
};

const ITEM_IMAGE_SRC: Record<string, string> = {};

function auraClass(rarity?: Rarity): string {
  if (rarity === 'legendary') return 'drop-shadow-[0_0_14px_rgba(250,204,21,0.85)]';
  if (rarity === 'epic') return 'drop-shadow-[0_0_12px_rgba(168,85,247,0.75)]';
  if (rarity === 'rare') return 'drop-shadow-[0_0_10px_rgba(59,130,246,0.65)]';
  if (rarity === 'uncommon') return 'drop-shadow-[0_0_8px_rgba(34,197,94,0.55)]';
  return '';
}

function Shell({
  rarity,
  children,
  className = '',
}: {
  rarity?: Rarity;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-visible ${auraClass(
        rarity,
      )} ${className}`}
    >
      {children}
    </div>
  );
}

function ImageItem({
  src,
  alt,
  rarity,
  className = '',
  style,
}: {
  src: string;
  alt: string;
  rarity?: Rarity;
  className?: string;
  style?: React.CSSProperties;
}) {
  const objectClass =
    className.includes('object-fill') ||
    className.includes('object-cover') ||
    className.includes('object-contain')
      ? ''
      : 'object-contain';

  const rarityClass =
    rarity === 'legendary'
      ? 'drop-shadow-[0_0_18px_rgba(250,204,21,0.9)]'
      : rarity === 'epic'
        ? 'drop-shadow-[0_0_14px_rgba(168,85,247,0.85)]'
        : rarity === 'rare'
          ? 'drop-shadow-[0_0_10px_rgba(59,130,246,0.75)]'
          : rarity === 'uncommon'
            ? 'drop-shadow-[0_0_8px_rgba(34,197,94,0.55)]'
            : '';

  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      className={`h-full w-full select-none ${objectClass} ${rarityClass} ${className}`}
      style={style}
    />
  );
}
function BasicRug({ rarity }: { rarity?: Rarity }) {
  return (
    <Shell rarity={rarity}>
      <div className="relative h-[62%] w-[90%] rounded-[45%] bg-gradient-to-br from-pink-300 via-fuchsia-400 to-purple-700 shadow-xl">
        <div className="absolute left-[12%] right-[12%] top-[25%] h-[10%] rounded-full bg-white/35" />
        <div className="absolute left-[18%] right-[18%] top-[48%] h-[8%] rounded-full bg-white/25" />
        <div className="absolute bottom-[18%] left-[42%] h-[15%] w-[15%] rounded-full bg-white/35" />
      </div>
    </Shell>
  );
}

function Lamp({ rarity }: { rarity?: Rarity }) {
  return (
    <Shell rarity={rarity}>
      <div className="relative h-[86%] w-[72%]">
        <div className="absolute left-[20%] top-[5%] h-[42%] w-[60%] rounded-t-full bg-gradient-to-br from-yellow-200 via-amber-300 to-orange-500 shadow-[0_0_22px_rgba(251,191,36,0.7)]" />
        <div className="absolute left-[43%] top-[42%] h-[35%] w-[14%] rounded-full bg-amber-800" />
        <div className="absolute bottom-[10%] left-[24%] h-[16%] w-[52%] rounded-full bg-gradient-to-br from-yellow-500 to-orange-800" />
      </div>
    </Shell>
  );
}

function PosterStars({ rarity }: { rarity?: Rarity }) {
  return (
    <Shell rarity={rarity}>
      <div className="relative h-[82%] w-[70%] rounded-xl border-4 border-amber-200 bg-gradient-to-b from-indigo-800 via-purple-800 to-black shadow-xl">
        <div className="absolute left-[18%] top-[18%] text-xl">✦</div>
        <div className="absolute right-[18%] top-[35%] text-lg">✧</div>
        <div className="absolute bottom-[18%] left-[35%] text-2xl">★</div>
      </div>
    </Shell>
  );
}

function BookStack({ rarity }: { rarity?: Rarity }) {
  return (
    <Shell rarity={rarity}>
      <div className="relative h-[76%] w-[76%]">
        <div className="absolute bottom-[12%] left-[8%] h-[22%] w-[82%] rounded-md bg-emerald-500" />
        <div className="absolute bottom-[35%] left-[18%] h-[22%] w-[72%] rounded-md bg-sky-400" />
        <div className="absolute bottom-[58%] left-[4%] h-[22%] w-[78%] rounded-md bg-yellow-400" />
        <div className="absolute bottom-[12%] left-[18%] h-[68%] w-[5%] bg-white/60" />
      </div>
    </Shell>
  );
}

function Plant({ rarity }: { rarity?: Rarity }) {
  return (
    <Shell rarity={rarity}>
      <div className="relative h-[82%] w-[74%]">
        <div className="absolute bottom-[8%] left-[24%] h-[32%] w-[52%] rounded-b-2xl rounded-t-md bg-gradient-to-b from-orange-500 to-amber-800" />
        <div className="absolute bottom-[34%] left-[20%] h-[32%] w-[28%] rotate-[-30deg] rounded-full bg-emerald-400" />
        <div className="absolute bottom-[42%] left-[40%] h-[38%] w-[26%] rounded-full bg-green-500" />
        <div className="absolute bottom-[34%] right-[18%] h-[32%] w-[28%] rotate-[30deg] rounded-full bg-lime-400" />
      </div>
    </Shell>
  );
}

function Candle({ rarity }: { rarity?: Rarity }) {
  return (
    <Shell rarity={rarity}>
      <div className="relative h-[80%] w-[56%]">
        <div className="absolute left-[35%] top-[2%] h-[28%] w-[30%] rounded-full bg-gradient-to-b from-yellow-200 to-orange-500 shadow-[0_0_18px_rgba(251,191,36,0.8)]" />
        <div className="absolute bottom-[12%] left-[24%] h-[58%] w-[52%] rounded-lg bg-gradient-to-b from-white to-yellow-100" />
        <div className="absolute bottom-[8%] left-[16%] h-[12%] w-[68%] rounded-full bg-amber-700" />
      </div>
    </Shell>
  );
}

function Scroll({ rarity }: { rarity?: Rarity }) {
  return (
    <Shell rarity={rarity}>
      <div className="relative h-[72%] w-[88%] rounded-xl bg-gradient-to-br from-yellow-100 via-amber-100 to-yellow-300 shadow-xl">
        <div className="absolute left-[10%] right-[10%] top-[28%] h-[4%] rounded-full bg-amber-700/60" />
        <div className="absolute left-[10%] right-[18%] top-[48%] h-[4%] rounded-full bg-amber-700/45" />
        <div className="absolute left-[-8%] top-[5%] h-[90%] w-[18%] rounded-full bg-amber-500" />
        <div className="absolute right-[-8%] top-[5%] h-[90%] w-[18%] rounded-full bg-amber-500" />
      </div>
    </Shell>
  );
}

function Crystal({ rarity }: { rarity?: Rarity }) {
  return (
    <Shell rarity={rarity}>
      <div className="h-[64%] w-[64%] rotate-45 rounded-xl bg-gradient-to-br from-cyan-300 via-blue-400 to-purple-500 shadow-[0_0_24px_rgba(56,189,248,0.7)]" />
    </Shell>
  );
}

function Trophy({ rarity }: { rarity?: Rarity }) {
  return (
    <Shell rarity={rarity}>
      <div className="relative h-[82%] w-[72%]">
        <div className="absolute left-[25%] top-[12%] h-[42%] w-[50%] rounded-b-2xl rounded-t-md bg-gradient-to-br from-yellow-200 via-yellow-400 to-amber-700" />
        <div className="absolute left-[8%] top-[18%] h-[24%] w-[24%] rounded-full border-4 border-yellow-400" />
        <div className="absolute right-[8%] top-[18%] h-[24%] w-[24%] rounded-full border-4 border-yellow-400" />
        <div className="absolute left-[43%] top-[54%] h-[18%] w-[14%] bg-amber-700" />
        <div className="absolute bottom-[10%] left-[24%] h-[14%] w-[52%] rounded bg-amber-800" />
      </div>
    </Shell>
  );
}

function Banner({ rarity }: { rarity?: Rarity }) {
  return (
    <Shell rarity={rarity}>
      <div className="relative h-[86%] w-[70%]">
        <div className="absolute left-[46%] top-0 h-full w-[8%] rounded bg-amber-800" />
        <div className="absolute left-[14%] top-[12%] h-[56%] w-[62%] bg-gradient-to-br from-red-500 to-fuchsia-700 [clip-path:polygon(0_0,100%_0,100%_75%,50%_55%,0_75%)]" />
        <div className="absolute left-[34%] top-[25%] text-xl">👑</div>
      </div>
    </Shell>
  );
}

function ChessBoard({ rarity }: { rarity?: Rarity }) {
  return (
    <Shell rarity={rarity}>
      <div className="grid h-[78%] w-[78%] rotate-3 grid-cols-4 grid-rows-4 overflow-hidden rounded-md border-4 border-amber-900 shadow-xl">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className={(i + Math.floor(i / 4)) % 2 === 0 ? 'bg-white' : 'bg-black'} />
        ))}
      </div>
    </Shell>
  );
}

function ChessPiece({ rarity, piece = '♟' }: { rarity?: Rarity; piece?: string }) {
  return (
    <Shell rarity={rarity}>
      <div className="text-[4.5rem] leading-none text-white drop-shadow-[0_5px_8px_rgba(0,0,0,0.6)]">
        {piece}
      </div>
    </Shell>
  );
}

function ChessClock({ rarity }: { rarity?: Rarity }) {
  return (
    <Shell rarity={rarity}>
      <div className="relative flex h-[62%] w-[86%] items-center justify-around rounded-xl bg-gradient-to-br from-stone-700 to-stone-950 p-2 shadow-xl">
        <div className="h-[70%] w-[38%] rounded-full bg-white/90 text-center text-xl leading-[2.3rem] text-black">◷</div>
        <div className="h-[70%] w-[38%] rounded-full bg-white/90 text-center text-xl leading-[2.3rem] text-black">◶</div>
      </div>
    </Shell>
  );
}

function Cards({ rarity }: { rarity?: Rarity }) {
  return (
    <Shell rarity={rarity}>
      <div className="relative h-[76%] w-[72%]">
        <div className="absolute left-[8%] top-[18%] h-[62%] w-[48%] rotate-[-10deg] rounded-lg bg-white shadow-lg" />
        <div className="absolute right-[8%] top-[12%] h-[68%] w-[50%] rotate-[10deg] rounded-lg bg-gradient-to-b from-white to-yellow-100 shadow-lg">
          <div className="mt-5 text-center text-2xl">♞</div>
        </div>
      </div>
    </Shell>
  );
}

function Rocket({ rarity }: { rarity?: Rarity }) {
  return (
    <Shell rarity={rarity}>
      <div className="relative h-[86%] w-[58%] rotate-[-18deg]">
        <div className="absolute left-[24%] top-[3%] h-[70%] w-[52%] rounded-b-lg rounded-t-full bg-gradient-to-b from-white via-sky-200 to-red-500" />
        <div className="absolute left-[38%] top-[25%] h-[18%] w-[24%] rounded-full bg-blue-500" />
        <div className="absolute bottom-[8%] left-[10%] h-[28%] w-[28%] bg-red-600 [clip-path:polygon(100%_0,0_100%,100%_100%)]" />
        <div className="absolute bottom-[8%] right-[10%] h-[28%] w-[28%] bg-red-600 [clip-path:polygon(0_0,0_100%,100%_100%)]" />
        <div className="absolute bottom-[-8%] left-[36%] text-2xl">🔥</div>
      </div>
    </Shell>
  );
}

function Planet({ rarity }: { rarity?: Rarity }) {
  return (
    <Shell rarity={rarity}>
      <div className="relative h-[72%] w-[72%] rounded-full bg-gradient-to-br from-blue-300 via-emerald-400 to-indigo-700 shadow-[0_0_22px_rgba(96,165,250,0.7)]">
        <div className="absolute left-[-18%] top-[42%] h-[14%] w-[136%] rotate-[-15deg] rounded-full border-4 border-yellow-200/70" />
      </div>
    </Shell>
  );
}

function BlackHole({ rarity }: { rarity?: Rarity }) {
  return (
    <Shell rarity={rarity}>
      <div className="relative h-[78%] w-[78%] rounded-full bg-black shadow-[0_0_30px_rgba(168,85,247,0.85)]">
        <div className="absolute inset-[18%] rounded-full border-4 border-purple-500" />
        <div className="absolute inset-[32%] rounded-full bg-purple-800" />
      </div>
    </Shell>
  );
}

function Fox({ rarity }: { rarity?: Rarity }) {
  return (
    <Shell rarity={rarity}>
      <div className="relative h-[82%] w-[82%]">
        <div className="absolute left-[18%] top-[20%] h-[50%] w-[64%] rounded-full bg-orange-500" />
        <div className="absolute left-[16%] top-[8%] h-[30%] w-[24%] rotate-[-18deg] bg-orange-500 [clip-path:polygon(50%_0,0_100%,100%_100%)]" />
        <div className="absolute right-[16%] top-[8%] h-[30%] w-[24%] rotate-[18deg] bg-orange-500 [clip-path:polygon(50%_0,0_100%,100%_100%)]" />
        <div className="absolute left-[32%] top-[42%] h-[18%] w-[36%] rounded-full bg-white" />
        <div className="absolute left-[34%] top-[34%] h-2 w-2 rounded-full bg-black" />
        <div className="absolute right-[34%] top-[34%] h-2 w-2 rounded-full bg-black" />
      </div>
    </Shell>
  );
}

function Sparkles({ rarity }: { rarity?: Rarity }) {
  return (
    <Shell rarity={rarity}>
      <div className="relative h-[82%] w-[82%]">
        <div className="absolute left-[15%] top-[18%] text-4xl">✨</div>
        <div className="absolute right-[12%] top-[40%] text-3xl">✦</div>
        <div className="absolute bottom-[12%] left-[38%] text-2xl">✧</div>
      </div>
    </Shell>
  );
}

export default function ItemSprite({ itemId, rarity }: Props) {
  const rarityEffect =
    rarity === 'common'
      ? undefined
      : rarity === 'uncommon'
        ? 'drop-shadow(0 0 6px rgba(120, 255, 180, 0.45))'
        : rarity === 'rare'
          ? 'drop-shadow(0 0 8px rgba(80, 170, 255, 0.6))'
          : rarity === 'epic'
            ? 'drop-shadow(0 0 10px rgba(190, 100, 255, 0.7))'
            : rarity === 'legendary'
              ? 'drop-shadow(0 0 12px rgba(255, 210, 80, 0.85))'
              : undefined;

  if (itemId === 'banner_kingdom') {
    return <KingdomBannerSprite rarity={rarity} />;
  }

  const imageSrc = ITEM_IMAGE_SRC[itemId];

  if (imageSrc) {
    return (
      <ImageItem
        src={imageSrc}
        alt={itemId}
        rarity={rarity}
        style={{
          filter: rarityEffect,
        }}
      />
    );
  }

  const sprite = ITEM_SPRITES[itemId];

  if (sprite) {
    return (
      <ImageItem
        src={sprite.src}
        alt={sprite.alt}
        rarity={rarity}
        className={sprite.className}
        style={{
          filter: rarityEffect,
        }}
      />
    );
  }

  if (itemId.includes('rug')) return <BasicRug rarity={rarity} />;
  if (itemId.includes('lamp')) return <Lamp rarity={rarity} />;
  if (itemId.includes('poster')) return <PosterStars rarity={rarity} />;

  if (itemId.includes('book') || itemId.includes('opening')) return <BookStack rarity={rarity} />;
  if (itemId.includes('plant')) return <Plant rarity={rarity} />;
  if (itemId.includes('candle')) return <Candle rarity={rarity} />;
  if (itemId.includes('scroll')) return <Scroll rarity={rarity} />;
  if (itemId.includes('crystal')) return <Crystal rarity={rarity} />;
  if (itemId.includes('trophy')) return <Trophy rarity={rarity} />;
  if (itemId.includes('banner') || itemId.includes('flag')) return <Banner rarity={rarity} />;

  if (itemId.includes('chess-board') || itemId.includes('chess_board')) return <ChessBoard rarity={rarity} />;
  if (itemId.includes('chess_clock')) return <ChessClock rarity={rarity} />;
  if (itemId.includes('tactics') || itemId.includes('cards')) return <Cards rarity={rarity} />;
  if (itemId.includes('queen')) return <ChessPiece rarity={rarity} piece="♛" />;
  if (itemId.includes('king')) return <ChessPiece rarity={rarity} piece="♚" />;
  if (itemId.includes('knight')) return <ChessPiece rarity={rarity} piece="♞" />;
  if (itemId.includes('pawn')) return <ChessPiece rarity={rarity} piece="♟" />;

  if (itemId.includes('rocket')) return <Rocket rarity={rarity} />;
  if (itemId.includes('planet') || itemId.includes('galaxy')) return <Planet rarity={rarity} />;
  if (itemId.includes('black_hole')) return <BlackHole rarity={rarity} />;

  if (itemId.includes('fox')) return <Fox rarity={rarity} />;

  if (itemId.includes('sparkle') || itemId.includes('glow') || itemId.includes('cosmetic')) {
    return <Sparkles rarity={rarity} />;
  }

  return <Crystal rarity={rarity} />;
}