import { TROPHY_THEMES } from '../../data/trophies';
import type { StudentState } from '../../store/useGameStore';

type TrophyEntry = StudentState['trophies'][number];

type Props = {
  studentName: string;
  trophy: TrophyEntry;
  remainingCount: number;
  onComplete: () => void;
};

const CONFETTI = [
  { left: '7%', top: '12%', color: '#fde047', delay: '0ms', rotate: '18deg' },
  { left: '17%', top: '28%', color: '#f472b6', delay: '180ms', rotate: '-24deg' },
  { left: '28%', top: '9%', color: '#60a5fa', delay: '360ms', rotate: '42deg' },
  { left: '39%', top: '22%', color: '#4ade80', delay: '100ms', rotate: '-12deg' },
  { left: '56%', top: '10%', color: '#c084fc', delay: '420ms', rotate: '28deg' },
  { left: '68%', top: '25%', color: '#fb923c', delay: '220ms', rotate: '-36deg' },
  { left: '81%', top: '8%', color: '#facc15', delay: '520ms', rotate: '12deg' },
  { left: '92%', top: '31%', color: '#22d3ee', delay: '300ms', rotate: '-18deg' },
  { left: '12%', top: '67%', color: '#a78bfa', delay: '460ms', rotate: '32deg' },
  { left: '88%', top: '70%', color: '#fb7185', delay: '140ms', rotate: '-28deg' },
];

export function TrophyAwardCeremony({
  studentName,
  trophy,
  remainingCount,
  onComplete,
}: Props) {
  const definition = TROPHY_THEMES.find(
    theme => theme.id === trophy.trophyTheme
  );
  const emoji = definition?.emoji ?? '🏆';
  const name = definition?.nameHe ?? 'גביע מיוחד';

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-hidden bg-black/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="קבלת גביע חדש"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.22),transparent_58%)]" />

      {CONFETTI.map((piece, index) => (
        <span
          key={index}
          className="absolute h-3 w-2 animate-bounce rounded-sm opacity-90"
          style={{
            left: piece.left,
            top: piece.top,
            backgroundColor: piece.color,
            animationDelay: piece.delay,
            transform: `rotate(${piece.rotate})`,
          }}
        />
      ))}

      <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-yellow-300/55 bg-gradient-to-b from-indigo-950 via-purple-950 to-amber-950/95 p-6 text-center text-white shadow-[0_0_80px_rgba(250,204,21,0.3)] sm:p-9">
        <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-yellow-400/20 blur-3xl" />

        <div className="relative">
          <div className="text-xs font-black uppercase tracking-[0.3em] text-yellow-200/75">
            פרס מיוחד מהמורה
          </div>

          <h2 className="mt-3 text-3xl font-black text-yellow-300 drop-shadow sm:text-4xl">
            הוענק לך גביע חדש!
          </h2>

          <p className="mt-2 text-sm text-purple-200/80">
            כל הכבוד, {studentName}!
          </p>

          <div className="relative mx-auto my-6 flex h-48 w-48 items-center justify-center">
            <div className="absolute inset-5 animate-ping rounded-full border border-yellow-300/25" />
            <div className="absolute inset-0 rounded-full bg-yellow-300/10 blur-xl" />
            <div className="relative animate-bounce text-8xl drop-shadow-[0_0_25px_rgba(250,204,21,0.7)]">
              {emoji}
            </div>
          </div>

          <div className="text-2xl font-black text-yellow-200">{name}</div>

          <div className="mx-auto mt-4 max-w-md rounded-2xl border border-white/15 bg-white/5 px-5 py-4">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-purple-200/55">
              ההקדשה שלך
            </div>
            <div className="text-base font-bold leading-7 text-white sm:text-lg">
              {trophy.caption?.trim() || 'פרס מיוחד על הישג נפלא'}
            </div>
          </div>

          {remainingCount > 0 && (
            <div className="mt-4 text-xs font-bold text-fuchsia-200">
              מחכים לך עוד {remainingCount} גביעים חדשים
            </div>
          )}

          <button
            type="button"
            onClick={onComplete}
            className="mt-6 w-full rounded-2xl bg-gradient-to-l from-yellow-300 to-amber-400 px-6 py-4 text-base font-black text-amber-950 shadow-lg transition-transform hover:scale-[1.02]"
          >
            {remainingCount > 0 ? 'לגביע הבא ✨' : 'לקחת לחדר הפרסים 🏆'}
          </button>
        </div>
      </div>
    </div>
  );
}
