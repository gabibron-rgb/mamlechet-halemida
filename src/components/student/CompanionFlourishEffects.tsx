import {
  getCompanionFlourish,
  type CompanionFlourish,
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

const MASTER_RING_INSETS = ['inset-0', 'inset-2', 'inset-4'] as const;

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
      {definitions.map((flourish, flourishIndex) => {
        const level = Math.max(1, Math.min(5, Math.floor(flourishLevels[flourish.id] ?? 1)));
        const particles = [
          ...flourish.effectParticles,
          ...(level >= 3 ? ['✦'] : []),
          ...(level >= 5 ? [flourish.emoji] : []),
        ].slice(0, 4);
        const particleSize =
          level >= 4
            ? variant === 'room'
              ? 'text-base sm:text-xl'
              : 'text-3xl'
            : baseParticleSize;

        return (
          <div key={flourish.id} className="contents">
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
          </div>
        );
      })}
    </div>
  );
}
