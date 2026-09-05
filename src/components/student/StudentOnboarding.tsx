import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

type Destination =
  | 'progress'
  | 'missions'
  | 'classKingdom'
  | 'room'
  | 'shop'
  | 'companion';

type Step = {
  icon: string;
  titleHe: string;
  bodyHe: string;
  tipHe: string;
  destination: Destination;
  destinationLabelHe: string;
};

const STEPS: Step[] = [
  {
    icon: '🏰',
    titleHe: 'ברוכים הבאים לממלכה שלך',
    bodyHe:
      'זה מסך הבית שלך. כאן אפשר לראות נקודות, רמה, XP, הישגים וכל מה שנפתח בדרך.',
    tipHe: 'אין צורך לזכור הכול עכשיו — תמיד אפשר לפתוח שוב את ההדרכה מכפתור ❔ למעלה.',
    destination: 'progress',
    destinationLabelHe: 'התקדמות',
  },
  {
    icon: '⭐',
    titleHe: 'נקודות הופכות לדברים',
    bodyHe:
      'נקודות שמקבלים מהמורה אפשר להשקיע בחפצים ובקופסאות. קנייה והשקעה מקדמות גם את ה-XP והרמות.',
    tipHe: 'המלאי שומר את מה שאספת, והאוסף מראה גם דברים שעוד לא גילית.',
    destination: 'shop',
    destinationLabelHe: 'חנות',
  },
  {
    icon: '🏠',
    titleHe: 'החדר הוא המקום שלך',
    bodyHe:
      'בחדר האישי אפשר להציג ולסדר את החפצים שאספת. ככל שמתקדמים במשחק נפתחים עוד דברים ואפשרויות.',
    tipHe: 'אפשר לחזור ולשנות את העיצוב מתי שרוצים.',
    destination: 'room',
    destinationLabelHe: 'החדר שלי',
  },
  {
    icon: '🐾',
    titleHe: 'החיה גדלה יחד איתך',
    bodyHe:
      'מערכת החיה נפתחת בהמשך. ההתפתחות שלה קשורה להתקדמות ולהתנהגויות אמיתיות בכיתה — לא רק לכמות נקודות.',
    tipHe: 'כשמערכת החיה תיפתח, תהיה בה הדרכה נפרדת ומפורטת יותר.',
    destination: 'companion',
    destinationLabelHe: 'חיית המחמד',
  },
  {
    icon: '🌟',
    titleHe: 'יש גם מטרות שעושים ביחד',
    bodyHe:
      'בממלכת הכיתה יש יעדים, פרסים, בחירות וחדרים משותפים. ההתקדמות האישית שלך נשארת פרטית, אבל הכיתה יכולה לבנות דברים יחד.',
    tipHe: 'יש גם משימות אישיות והישגים שאפשר לפתוח לאורך הדרך.',
    destination: 'classKingdom',
    destinationLabelHe: 'ממלכת הכיתה',
  },
];

export default function StudentOnboarding({
  onNavigate,
  onComplete,
  onSkip,
}: {
  onNavigate: (destination: Destination) => void;
  onComplete: () => void;
  onSkip: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  const progressPct = useMemo(
    () => ((stepIndex + 1) / STEPS.length) * 100,
    [stepIndex]
  );

  useEffect(() => {
    onNavigate(step.destination);
  }, [onNavigate, step.destination]);

  function goNext() {
    if (isLast) {
      onComplete();
      return;
    }

    setStepIndex(index => Math.min(index + 1, STEPS.length - 1));
  }

  function goBack() {
    setStepIndex(index => Math.max(index - 1, 0));
  }

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-slate-950/78 p-4 backdrop-blur-sm"
      style={{ zIndex: 2147483000 }}
      role="dialog"
      aria-modal="true"
      aria-label="הדרכה לממלכת הלמידה"
      dir="rtl"
    >
      <div className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-950 shadow-2xl shadow-black/60">
        <div className="h-1.5 bg-white/10">
          <div
            className="h-full bg-gradient-to-l from-cyan-300 via-violet-300 to-amber-300 transition-[width] duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 text-xs font-black tracking-wide text-magic-soft/55">
                צעד {stepIndex + 1} מתוך {STEPS.length}
              </div>
              <h2 className="text-2xl font-black text-white sm:text-3xl">
                {step.titleHe}
              </h2>
            </div>

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-4xl shadow-inner">
              {step.icon}
            </div>
          </div>

          <p className="text-base leading-7 text-magic-soft/90 sm:text-lg">
            {step.bodyHe}
          </p>

          <div className="mt-5 rounded-2xl border border-cyan-300/15 bg-cyan-300/5 p-4 text-sm leading-6 text-cyan-50/80">
            💡 {step.tipHe}
          </div>

          <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
            <span className="text-magic-soft/60">המסך שמוצג עכשיו:</span>
            <span className="font-black text-magic-accent">
              {step.destinationLabelHe}
            </span>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={goNext}
              className="min-w-32 rounded-2xl bg-magic-accent px-5 py-3 font-black text-magic-bg transition-transform hover:scale-[1.02]"
            >
              {isLast ? 'יאללה לממלכה ✨' : 'הבא'}
            </button>

            {stepIndex > 0 && (
              <button
                type="button"
                onClick={goBack}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-magic-soft hover:bg-white/10"
              >
                הקודם
              </button>
            )}

            <button
              type="button"
              onClick={onSkip}
              className="mr-auto px-3 py-2 text-sm font-bold text-magic-soft/55 hover:text-white"
            >
              דלג/י על ההדרכה
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
