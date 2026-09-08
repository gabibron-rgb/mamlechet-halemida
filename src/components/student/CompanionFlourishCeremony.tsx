import { useEffect } from 'react';

import {
  getCompanionFlourish,
  getCompanionFlourishLevelDefinition,
  type CompanionFlourishId,
} from '../../data/companionFlourishes';
import {
  COMPANION_VISUALS,
  getCompanionFormArt,
} from '../../data/companionWorlds';
import { MAX_ACTIVE_FLOURISHES } from '../../data/companionWorlds';
import type { CompanionState } from '../../store/useGameStore';
import { playGameSound } from '../../lib/gameSounds';
import AnimatedCompanionArt, {
  CompanionAnimationStyles,
} from './AnimatedCompanionArt';

const SIGNATURE_ANIMATION: Record<CompanionFlourishId, string> = {
  perseverance: 'flourishResolve',
  friendship: 'flourishFriendship',
  creativity: 'flourishCreativity',
  curiosity: 'flourishCuriosity',
  helping: 'flourishHelping',
  breakthrough: 'flourishBreakthrough',
};

const SIGNATURE_LABEL: Record<CompanionFlourishId, string> = {
  perseverance: 'החיה מזדקפת בנחישות',
  friendship: 'החיה מתרגשת ושמחה יחד איתך',
  creativity: 'החיה מסתובבת בהתלהבות',
  curiosity: 'החיה מטה את הראש בסקרנות',
  helping: 'החיה מתקרבת אליך בשמחה',
  breakthrough: 'החיה קופצת לחגוג את פריצת הדרך',
};

const LEVEL_MESSAGES: Record<number, string> = {
  2: 'זה כבר לא רגע אחד. הכוח הזה מתחיל להפוך להרגל אמיתי.',
  3: 'ראיתי את זה שוב ושוב. הכוח הזה כבר חלק מהדרך שלך.',
  4: 'הדרך שלך בולטת. זאת כבר תכונה שאפשר לסמוך עליה.',
  5: 'הוכחת את זה לאורך זמן. האות הגיע לדרגת מאסטר!',
};

const PARTICLE_POSITIONS = [
  'left-[9%] top-[20%]',
  'right-[10%] top-[17%]',
  'left-[18%] bottom-[25%]',
  'right-[17%] bottom-[23%]',
  'left-[40%] top-[7%]',
  'right-[39%] bottom-[8%]',
] as const;

type Props = {
  companion: CompanionState;
  flourishId: string;
  isActive: boolean;
  level?: number;
  days?: number;
  preview?: boolean;
  onActivate: () => void;
  onLater: () => void;
  onOpenCompanion: () => void;
};

export default function CompanionFlourishCeremony({
  companion,
  flourishId,
  isActive,
  level = 1,
  days,
  preview = false,
  onActivate,
  onLater,
  onOpenCompanion,
}: Props) {
  const flourish = getCompanionFlourish(flourishId);
  const levelDefinition = getCompanionFlourishLevelDefinition(level);
  const visuals = companion.theme ? COMPANION_VISUALS[companion.theme] : null;
  const activeCount = (companion.activeFlourishes ?? []).length;
  const canActivate = isActive || activeCount < MAX_ACTIVE_FLOURISHES;
  const isFirstLevel = level <= 1;

  useEffect(() => {
    if (!flourish) return;
    playGameSound('achievement');
  }, [flourish?.id, level]);

  if (!flourish || !levelDefinition) return null;

  const formArt =
    companion.theme && companion.stage !== 'egg'
      ? getCompanionFormArt(companion.theme, companion.stage)
      : null;
  const petName =
    companion.name?.trim() || visuals?.nameHe || 'חיית המחמד שלך';
  const animationName =
    SIGNATURE_ANIMATION[flourish.id as CompanionFlourishId];
  const signatureLabel =
    SIGNATURE_LABEL[flourish.id as CompanionFlourishId];
  const ceremonyMessage = isFirstLevel
    ? flourish.ceremonyMessageHe
    : LEVEL_MESSAGES[level] ?? 'הדרך שלך ממשיכה להתחזק.';
  const intensityScale = 1 + Math.max(0, level - 1) * 0.07;

  return (
    <div
      className="fixed inset-0 z-[190] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={`${isFirstLevel ? 'טקס קבלת' : 'טקס שדרוג'} ${flourish.nameHe}`}
      dir="rtl"
    >
      <CompanionAnimationStyles />
      <style>{`
        @keyframes flourishResolve {
          0% { transform: translateY(12px) scale(.94); }
          28% { transform: translateY(8px) scale(.97); }
          58% { transform: translateY(-10px) scale(1.045); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes flourishFriendship {
          0%, 100% { transform: scale(1) rotate(0deg); }
          28% { transform: scale(1.07) rotate(-3deg); }
          52% { transform: scale(1.1) rotate(3deg); }
          76% { transform: scale(1.04) rotate(-1deg); }
        }
        @keyframes flourishCreativity {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          24% { transform: translateY(-8px) rotate(-7deg) scale(1.03); }
          50% { transform: translateY(-12px) rotate(8deg) scale(1.06); }
          76% { transform: translateY(-5px) rotate(-4deg) scale(1.03); }
        }
        @keyframes flourishCuriosity {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          30% { transform: rotate(-8deg) translateY(-3px); }
          62% { transform: rotate(7deg) translateY(-5px); }
          82% { transform: rotate(-3deg) translateY(-2px); }
        }
        @keyframes flourishHelping {
          0%, 100% { transform: translateY(0) scale(1); }
          35% { transform: translateY(-7px) scale(1.04); }
          60% { transform: translateY(4px) scale(1.09); }
          82% { transform: translateY(-2px) scale(1.03); }
        }
        @keyframes flourishBreakthrough {
          0%, 100% { transform: translateY(0) scale(1); }
          22% { transform: translateY(6px) scale(.96); }
          48% { transform: translateY(-24px) scale(1.11); }
          68% { transform: translateY(-4px) scale(1.06); }
          84% { transform: translateY(-10px) scale(1.04); }
        }
        @keyframes flourishBurst {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(.45); }
          38% { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.65); }
        }
      `}</style>

      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border bg-slate-950 px-5 py-6 text-center shadow-2xl sm:px-8 sm:py-8"
        style={{
          borderColor: `${flourish.glowColor}${level >= 4 ? 'cc' : '80'}`,
          boxShadow: `0 0 ${70 + level * 8}px ${flourish.glowColor}${level >= 4 ? '45' : '30'}`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background: `radial-gradient(circle at 50% 38%, ${flourish.glowColor}${level >= 4 ? '38' : '28'}, transparent 42%), linear-gradient(180deg, ${flourish.glowColor}10, transparent 55%)`,
          }}
        />

        {PARTICLE_POSITIONS.map((position, index) => (
          <span
            key={position}
            className={`pointer-events-none absolute ${position} ${level >= 4 ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'}`}
            style={{
              filter: `drop-shadow(0 0 ${8 + level * 2}px ${flourish.glowColor})`,
              animation: `flourishBurst ${Math.max(1.6, 2.3 - level * 0.08)}s ease-out ${index * 0.18}s infinite`,
            }}
            aria-hidden="true"
          >
            {index >= 4 && level >= 5
              ? flourish.emoji
              : flourish.effectParticles[index % flourish.effectParticles.length]}
          </span>
        ))}

        <div className="relative">
          {preview && (
            <div className="mx-auto mb-3 w-fit rounded-full border border-cyan-300/25 bg-cyan-500/10 px-3 py-1 text-[10px] font-black text-cyan-100">
              בדיקה מקומית בלבד
            </div>
          )}

          <div className="text-xs font-black tracking-[0.16em] text-white/45">
            {isFirstLevel
              ? 'אות חדש הצטרף לדרך שלכם'
              : 'האות שלך התחזק!'}
          </div>
          <div className="mt-2 text-6xl drop-shadow-lg">
            {flourish.emoji}
          </div>
          <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
            {flourish.nameHe}
          </h2>
          <div className="mx-auto mt-2 w-fit rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-black text-white">
            {levelDefinition.icon} דרגת {levelDefinition.nameHe}
            {typeof days === 'number' && days > 0 ? ` · ${days} ימים` : ''}
          </div>
          <p className="mx-auto mt-2 max-w-lg text-sm font-bold leading-6 text-white/65">
            {isFirstLevel
              ? flourish.descriptionHe
              : 'האות גדל רק כשאותה התנהגות חוזרת בימים שונים — לא לפי כמות לחיצות.'}
          </p>

          <div className="relative mx-auto mt-5 flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72">
            <div
              className="absolute inset-5 rounded-full blur-2xl"
              style={{ backgroundColor: `${flourish.glowColor}${level >= 4 ? '50' : '35'}` }}
            />
            <div
              className="absolute left-1/2 top-1/2 h-[78%] w-[78%] rounded-full border-2"
              style={{
                borderColor: `${flourish.glowColor}${level >= 4 ? '90' : '65'}`,
                boxShadow: `0 0 ${50 + level * 8}px ${flourish.glowColor}45, inset 0 0 40px ${flourish.glowColor}18`,
                animation: 'flourishBurst 2.8s ease-out infinite',
              }}
            />

            <div
              className="relative z-10 h-[88%] w-[88%]"
              style={{
                animation: `${animationName} 1.9s ease-in-out both`,
                transform: `scale(${intensityScale})`,
              }}
            >
              {companion.stage === 'egg' && visuals ? (
                <div
                  className="mx-auto flex h-full w-[72%] items-center justify-center rounded-[50%_50%_46%_46%] border-4 border-white/30 text-6xl shadow-2xl"
                  style={{
                    background: `radial-gradient(circle at 32% 24%, rgba(255,255,255,.82), transparent 22%), ${visuals.eggColor}`,
                    boxShadow: `0 0 45px ${flourish.glowColor}60`,
                  }}
                  aria-label={`הביצה הקסומה של ${petName}`}
                >
                  {visuals.motif}
                </div>
              ) : (
                <AnimatedCompanionArt
                  art={formArt}
                  stage={companion.stage}
                  alt={petName}
                  activity="idle"
                  motion={false}
                  fallback={
                    <div className="flex h-full w-full items-center justify-center text-8xl">
                      {visuals?.motif ?? '🐾'}
                    </div>
                  }
                />
              )}
            </div>
          </div>

          <div
            className="mx-auto -mt-2 max-w-lg rounded-3xl border px-5 py-4 text-right"
            style={{
              borderColor: `${flourish.glowColor}45`,
              backgroundColor: `${flourish.glowColor}12`,
            }}
          >
            <div className="text-[10px] font-black text-white/45">
              💬 {petName} רוצה לומר
            </div>
            <div className="mt-2 text-base font-black leading-7 text-white">
              “{ceremonyMessage}”
            </div>
            <div className="mt-2 text-[10px] font-bold text-white/45">
              ✨ {signatureLabel}
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-white/5 px-4 py-3 text-xs font-bold leading-5 text-white/55">
            {isFirstLevel ? (
              <>
                האות נשמר אצל {petName} ויהיה זמין תמיד באזור{' '}
                <span className="text-fuchsia-200">אותות ועיטורים</span>.
              </>
            ) : (
              <>
                דרגת <span className="font-black text-white">{levelDefinition.nameHe}</span>{' '}
                נשמרה. העיטור של האות נעשה מרשים יותר ככל שהמסלול מתקדם.
              </>
            )}
          </div>

          {!canActivate && !isActive && (
            <div className="mt-3 rounded-2xl border border-amber-300/20 bg-amber-500/10 px-4 py-3 text-xs font-bold leading-5 text-amber-100">
              כבר פעילים {MAX_ACTIVE_FLOURISHES} עיטורים. אפשר להחליף ביניהם במסך החיה.
            </div>
          )}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            {isActive ? (
              <button
                type="button"
                onClick={onLater}
                className="rounded-2xl px-6 py-3 font-black text-slate-950"
                style={{ backgroundColor: flourish.glowColor }}
              >
                {isFirstLevel ? 'העיטור כבר פעיל ✓' : 'להמשיך עם העיטור הפעיל ✓'}
              </button>
            ) : canActivate ? (
              <>
                <button
                  type="button"
                  onClick={onActivate}
                  className="rounded-2xl px-6 py-3 font-black text-slate-950 shadow-lg"
                  style={{ backgroundColor: flourish.glowColor }}
                >
                  להפעיל את העיטור עכשיו ✨
                </button>
                <button
                  type="button"
                  onClick={onLater}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white/70 hover:bg-white/10"
                >
                  אחר כך
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onOpenCompanion}
                  className="rounded-2xl px-6 py-3 font-black text-slate-950"
                  style={{ backgroundColor: flourish.glowColor }}
                >
                  לבחור עיטורים במסך החיה 🐾
                </button>
                <button
                  type="button"
                  onClick={onLater}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white/70 hover:bg-white/10"
                >
                  אחר כך
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
