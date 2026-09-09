import {
  getCompanionFlourish,
  type CompanionFlourish,
  type CompanionFlourishId,
} from '../../data/companionFlourishes';

type Props = {
  activeFlourishes: string[];
  flourishLevels?: Record<string, number>;
  variant?: 'panel' | 'room';
};

const PANEL_POSITIONS = [
  ['left-[4%] top-[16%]', 'right-[5%] bottom-[20%]', 'left-[17%] bottom-[5%]', 'right-[20%] top-[2%]'],
  ['right-[7%] top-[12%]', 'left-[8%] bottom-[14%]', 'right-[20%] bottom-[4%]', 'left-[24%] top-[3%]'],
  ['left-[1%] top-[52%]', 'right-[1%] top-[48%]', 'left-[39%] -top-1', 'right-[36%] -bottom-1'],
] as const;

const ROOM_POSITIONS = [
  ['-left-4 top-[8%]', '-right-3 bottom-[15%]', 'left-[18%] -bottom-4', 'right-[18%] -top-4'],
  ['-right-4 top-[5%]', '-left-3 bottom-[10%]', 'right-[20%] -bottom-5', 'left-[20%] -top-4'],
  ['left-[34%] -top-5', 'right-[25%] -bottom-4', '-left-3 top-[45%]', '-right-3 top-[38%]'],
] as const;

const SIGNATURE_POSITIONS = {
  panel: ['right-[4%] top-[34%]', 'left-[5%] top-[40%]', 'left-1/2 -top-2 -translate-x-1/2'],
  room: ['-right-7 top-[30%]', '-left-7 top-[38%]', 'left-1/2 -top-7 -translate-x-1/2'],
} as const;

const MASTER_CREST_POSITIONS = {
  panel: ['right-[2%] -top-2', 'left-[3%] top-[6%]', 'left-1/2 -bottom-5 -translate-x-1/2'],
  room: ['-right-8 -top-5', '-left-8 top-[8%]', 'left-1/2 -bottom-8 -translate-x-1/2'],
} as const;

const MASTER_RING_INSETS = ['inset-0', 'inset-2', 'inset-4'] as const;

const SIGNATURE_VISUALS: Record<
  CompanionFlourishId,
  { glyph: string; animation: string }
> = {
  perseverance: { glyph: '🔥', animation: 'flourishSignatureRise' },
  friendship: { glyph: '💞', animation: 'flourishSignaturePulse' },
  creativity: { glyph: '🌈', animation: 'flourishSignatureSpin' },
  curiosity: { glyph: '🔎', animation: 'flourishSignatureScan' },
  helping: { glyph: '🤝', animation: 'flourishSignatureMeet' },
  breakthrough: { glyph: '✦', animation: 'flourishSignatureBurst' },
};

export default function CompanionFlourishEffects({
  activeFlourishes,
  flourishLevels = {},
  variant = 'panel',
}: Props) {
  const definitions = activeFlourishes
    .map(getCompanionFlourish)
    .filter((flourish): flourish is CompanionFlourish => Boolean(flourish))
    .slice(0, 3);

  if (definitions.length === 0) return null;

  const positions = variant === 'room' ? ROOM_POSITIONS : PANEL_POSITIONS;
  const baseParticleSize = variant === 'room' ? 'text-sm sm:text-lg' : 'text-2xl';

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-visible">
      <style>{`
        @keyframes flourishSignatureRise {
          0%, 100% { transform: translateY(7px) scale(.86); opacity: .55; }
          50% { transform: translateY(-9px) scale(1.12); opacity: 1; }
        }
        @keyframes flourishSignaturePulse {
          0%, 100% { transform: scale(.82); opacity: .58; }
          45% { transform: scale(1.18); opacity: 1; }
          70% { transform: scale(.98); opacity: .86; }
        }
        @keyframes flourishSignatureSpin {
          0% { transform: rotate(-10deg) scale(.9); }
          50% { transform: rotate(12deg) scale(1.14); }
          100% { transform: rotate(-10deg) scale(.9); }
        }
        @keyframes flourishSignatureScan {
          0%, 100% { transform: translateX(-8px) rotate(-8deg); opacity: .55; }
          50% { transform: translateX(8px) rotate(8deg); opacity: 1; }
        }
        @keyframes flourishSignatureMeet {
          0%, 100% { transform: scale(.9) translateY(3px); opacity: .6; }
          50% { transform: scale(1.12) translateY(-5px); opacity: 1; }
        }
        @keyframes flourishSignatureBurst {
          0%, 100% { transform: scale(.72) rotate(0deg); opacity: .45; }
          42% { transform: scale(1.3) rotate(18deg); opacity: 1; }
          65% { transform: scale(1.02) rotate(-8deg); opacity: .82; }
        }
      `}</style>

      {definitions.map((flourish, flourishIndex) => {
        const level = Math.max(
          1,
          Math.min(5, Math.floor(flourishLevels[flourish.id] ?? 1))
        );
        const signature = SIGNATURE_VISUALS[flourish.id];
        const particles = [
          ...flourish.effectParticles,
          ...(level >= 2 ? ['✨'] : []),
          ...(level >= 4 ? ['✦'] : []),
        ].slice(0, 4);
        const particleSize =
          level >= 4
            ? variant === 'room'
              ? 'text-base sm:text-xl'
              : 'text-3xl'
            : baseParticleSize;

        return (
          <div key={flourish.id} className="contents">
            {variant === 'room' && level >= 4 && (
              <div
                className="absolute left-1/2 bottom-[-17%] -translate-x-1/2 rounded-[50%] blur-md"
                style={{
                  width: `${128 + flourishIndex * 18}%`,
                  height: `${28 + flourishIndex * 5}%`,
                  background: `radial-gradient(ellipse at center, ${flourish.glowColor}38 0%, ${flourish.glowColor}16 45%, transparent 72%)`,
                  opacity: 0.72,
                }}
              />
            )}

            {level >= 5 && (
              <div
                className={`absolute ${MASTER_RING_INSETS[flourishIndex]} animate-pulse rounded-full border motion-reduce:animate-none`}
                style={{
                  borderColor: `${flourish.glowColor}55`,
                  boxShadow: `0 0 22px ${flourish.glowColor}35`,
                }}
              />
            )}

            {particles.map((particle, particleIndex) => (
              <span
                key={`${flourish.id}-${particleIndex}`}
                className={`absolute ${positions[flourishIndex][particleIndex]} ${particleSize} animate-[bounce_2.4s_ease-in-out_infinite] motion-reduce:animate-none`}
                style={{
                  animationDelay: `${flourishIndex * 0.28 + particleIndex * 0.36}s`,
                  filter: `drop-shadow(0 0 ${6 + level * 2}px ${flourish.glowColor})`,
                  opacity: Math.min(1, 0.68 + level * 0.07),
                }}
                aria-hidden="true"
              >
                {particle}
              </span>
            ))}

            {level >= 3 && (
              <span
                className={`absolute ${SIGNATURE_POSITIONS[variant][flourishIndex]} ${variant === 'room' ? 'text-base sm:text-xl' : 'text-2xl sm:text-3xl'}`}
                style={{
                  animation: `${signature.animation} 2.5s ease-in-out infinite`,
                  filter: `drop-shadow(0 0 ${8 + level * 2}px ${flourish.glowColor})`,
                }}
                aria-hidden="true"
              >
                {signature.glyph}
              </span>
            )}

            {level >= 5 && (
              <div
                className={`absolute ${MASTER_CREST_POSITIONS[variant][flourishIndex]} flex items-center gap-0.5 rounded-full border border-white/35 bg-slate-950/80 px-1.5 py-1 shadow-lg`}
                style={{
                  boxShadow: `0 0 14px ${flourish.glowColor}70`,
                }}
                aria-hidden="true"
              >
                <span className={variant === 'room' ? 'text-[10px]' : 'text-xs'}>👑</span>
                <span className={variant === 'room' ? 'text-[10px]' : 'text-xs'}>{flourish.emoji}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
