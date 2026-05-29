import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function RoomStage({ children }: Props) {
  return (
    <div className="relative mx-auto h-[660px] max-w-6xl overflow-hidden rounded-[2rem] border border-amber-200/20 bg-[#160b24] shadow-2xl">
      {/* sky / upper glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#33205f] via-[#23123d] to-[#12071f]" />

      {/* back wall */}
      <div className="absolute left-[4%] right-[4%] top-[4%] h-[48%] rounded-t-[2rem] border border-white/10 bg-gradient-to-b from-[#4a2d7a] via-[#342057] to-[#241538] shadow-inner">
        {/* wall pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-[10%] top-0 h-full w-px bg-white" />
          <div className="absolute left-[30%] top-0 h-full w-px bg-white" />
          <div className="absolute left-[50%] top-0 h-full w-px bg-white" />
          <div className="absolute left-[70%] top-0 h-full w-px bg-white" />
          <div className="absolute left-[90%] top-0 h-full w-px bg-white" />
          <div className="absolute left-0 top-[33%] h-px w-full bg-white" />
          <div className="absolute left-0 top-[66%] h-px w-full bg-white" />
        </div>

        {/* window */}
        <div className="absolute right-[10%] top-[10%] h-36 w-44 overflow-hidden rounded-t-full border-4 border-amber-300/50 bg-gradient-to-b from-sky-300 to-indigo-500 shadow-[0_0_35px_rgba(125,211,252,0.35)]">
          <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-amber-200/70" />
          <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-amber-200/70" />
          <div className="absolute bottom-3 left-5 h-8 w-8 rounded-full bg-yellow-200/70 blur-sm" />
          <div className="absolute left-4 top-6 text-white/80">✦</div>
          <div className="absolute right-7 top-9 text-white/70">✧</div>
          <div className="absolute right-16 bottom-8 text-white/70">★</div>
        </div>

        {/* picture / map frame */}
        <div className="absolute left-[10%] top-[12%] h-32 w-52 rounded-2xl border-[6px] border-amber-800/80 bg-amber-100 shadow-xl">
          <div className="absolute inset-2 rounded-xl bg-gradient-to-br from-emerald-200 via-yellow-100 to-sky-200">
            <div className="absolute left-6 top-8 h-10 w-20 rounded-full bg-emerald-600/45" />
            <div className="absolute right-5 top-5 h-16 w-12 rounded-full bg-sky-600/35" />
            <div className="absolute bottom-5 left-12 h-1 w-24 rotate-[-18deg] rounded bg-red-800/60" />
          </div>
        </div>

        {/* shelves */}
        <div className="absolute left-[8%] top-[58%] h-5 w-[40%] rounded-full bg-gradient-to-b from-amber-500 to-amber-900 shadow-xl" />
        <div className="absolute left-[12%] top-[63%] h-12 w-5 rounded-b-lg bg-amber-950/80" />
        <div className="absolute left-[42%] top-[63%] h-12 w-5 rounded-b-lg bg-amber-950/80" />

        <div className="absolute left-[16%] top-[75%] h-5 w-[34%] rounded-full bg-gradient-to-b from-amber-500 to-amber-900 shadow-xl" />
        <div className="absolute left-[20%] top-[80%] h-10 w-5 rounded-b-lg bg-amber-950/80" />
        <div className="absolute left-[46%] top-[80%] h-10 w-5 rounded-b-lg bg-amber-950/80" />
      </div>

      {/* baseboard between wall and floor */}
      <div className="absolute left-[4%] right-[4%] top-[51%] h-5 rounded-full bg-gradient-to-b from-amber-500 to-amber-900 shadow-lg" />

      {/* perspective floor */}
      <div
        className="absolute bottom-0 left-[2%] right-[2%] h-[48%] bg-gradient-to-b from-[#5b2e36] via-[#3a1f2d] to-[#1b0c18] shadow-inner"
        style={{
          clipPath: 'polygon(7% 0, 93% 0, 100% 100%, 0 100%)',
        }}
      >
        {/* floor boards */}
        <div className="absolute left-[10%] top-0 h-full w-px rotate-[8deg] bg-white/10" />
        <div className="absolute left-[25%] top-0 h-full w-px rotate-[5deg] bg-white/10" />
        <div className="absolute left-[40%] top-0 h-full w-px rotate-[2deg] bg-white/10" />
        <div className="absolute left-[55%] top-0 h-full w-px rotate-[-2deg] bg-white/10" />
        <div className="absolute left-[70%] top-0 h-full w-px rotate-[-5deg] bg-white/10" />
        <div className="absolute left-[85%] top-0 h-full w-px rotate-[-8deg] bg-white/10" />

        <div className="absolute left-[8%] right-[8%] top-[22%] h-px bg-black/25" />
        <div className="absolute left-[5%] right-[5%] top-[48%] h-px bg-black/25" />
        <div className="absolute left-[2%] right-[2%] top-[74%] h-px bg-black/25" />
      </div>

      {/* large center rug */}
      <div className="absolute left-[28%] bottom-[7%] h-40 w-[44%] rounded-[50%] border-4 border-yellow-200/25 bg-gradient-to-br from-red-700 via-fuchsia-700 to-indigo-900 shadow-2xl">
        <div className="absolute inset-[14%] rounded-[50%] border border-yellow-200/30" />
        <div className="absolute left-[36%] top-[26%] text-4xl opacity-60">✦</div>
      </div>

      {/* desk as real furniture */}
      <div className="absolute right-[8%] bottom-[24%] h-32 w-[34%]">
        <div className="absolute left-[4%] right-[4%] top-0 h-16 rounded-t-3xl border border-amber-200/20 bg-gradient-to-b from-amber-700 to-amber-950 shadow-2xl" />
        <div className="absolute left-0 right-0 top-12 h-8 rounded-full bg-gradient-to-b from-amber-500 to-amber-900 shadow-xl" />
        <div className="absolute bottom-0 left-[15%] h-20 w-7 rounded-b-lg bg-amber-950 shadow-lg" />
        <div className="absolute bottom-0 right-[15%] h-20 w-7 rounded-b-lg bg-amber-950 shadow-lg" />
      </div>

      {/* pet area */}
      <div className="absolute left-[8%] bottom-[18%] h-28 w-[24%] rounded-[50%] border border-emerald-200/25 bg-gradient-to-br from-emerald-700/45 to-lime-300/20 shadow-xl">
        <div className="absolute left-[38%] top-[28%] text-4xl opacity-50">🐾</div>
      </div>

      {/* magic platform */}
      <div className="absolute left-[38%] bottom-[23%] h-28 w-[24%] rounded-[50%] border border-fuchsia-200/35 bg-fuchsia-500/15 shadow-[0_0_55px_rgba(217,70,239,0.45)]">
        <div className="absolute inset-[18%] rounded-[50%] border border-fuchsia-200/25" />
        <div className="absolute left-[42%] top-[30%] text-3xl opacity-70">✨</div>
      </div>

      {/* foreground shadow */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent" />

      {/* placed objects layer */}
      <div className="absolute inset-0 z-30">
        {children}
      </div>
    </div>
  );
}