import {
  getCompanionFlourish,
  type CompanionFlourish,
} from '../../data/companionFlourishes';

type Props = {
  activeFlourishes: string[];
  variant?: 'panel' | 'room';
};

const PANEL_POSITIONS = [
  ['left-[4%] top-[16%]', 'right-[5%] bottom-[20%]'],
  ['right-[7%] top-[12%]', 'left-[8%] bottom-[14%]'],
  ['left-[1%] top-[52%]', 'right-[1%] top-[48%]'],
] as const;

const ROOM_POSITIONS = [
  ['-left-4 top-[8%]', '-right-3 bottom-[15%]'],
  ['-right-4 top-[5%]', '-left-3 bottom-[10%]'],
  ['left-[34%] -top-5', 'right-[25%] -bottom-4'],
] as const;

export default function CompanionFlourishEffects({
  activeFlourishes,
  variant = 'panel',
}: Props) {
  const definitions = activeFlourishes
    .map(getCompanionFlourish)
    .filter((flourish): flourish is CompanionFlourish => Boolean(flourish))
    .slice(0, 3);

  if (definitions.length === 0) return null;

  const positions = variant === 'room' ? ROOM_POSITIONS : PANEL_POSITIONS;
  const particleSize = variant === 'room' ? 'text-sm sm:text-lg' : 'text-2xl';

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-visible">
      {definitions.map((flourish, flourishIndex) =>
        flourish.effectParticles.map((particle, particleIndex) => (
          <span
            key={`${flourish.id}-${particleIndex}`}
            className={`absolute ${positions[flourishIndex][particleIndex]} ${particleSize} animate-[bounce_2.4s_ease-in-out_infinite] motion-reduce:animate-none`}
            style={{
              animationDelay: `${flourishIndex * 0.28 + particleIndex * 0.42}s`,
              filter: `drop-shadow(0 0 7px ${flourish.glowColor})`,
            }}
            aria-hidden="true"
          >
            {particle}
          </span>
        ))
      )}
    </div>
  );
}
