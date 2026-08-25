import type { ThemeId } from '../../data/themes';
import { THEMES } from '../../data/themes';

type Props = {
  unlockedThemes: ThemeId[];
  onComplete: (themeId: ThemeId) => void;
  onClose: () => void;
};

type UnlockThemeOption = {
  id: ThemeId;
  nameHe: string;
  emoji: string;
};

// רשימה מפורשת כדי שגם נושאים שנוספו מאוחר יותר תמיד יופיעו בבחירה.
const THEME_UNLOCK_ORDER: ThemeId[] = [
  'chess',
  'animals',
  'nature',
  'science',
  'robotics',
  'space',
  'fantasy',
  'art',
  'building',
  'sports',
  'music',
  'books',
  'math',
  'ballet',
];

const THEME_FALLBACKS: Partial<Record<ThemeId, { nameHe: string; emoji: string }>> = {
  chess: { nameHe: 'שחמט', emoji: '♟️' },
  animals: { nameHe: 'חיות', emoji: '🐾' },
  nature: { nameHe: 'טבע', emoji: '🌿' },
  science: { nameHe: 'מדע', emoji: '🧪' },
  robotics: { nameHe: 'רובוטיקה', emoji: '🤖' },
  space: { nameHe: 'חלל', emoji: '🚀' },
  fantasy: { nameHe: 'פנטזיה', emoji: '🐉' },
  art: { nameHe: 'אומנות', emoji: '🎨' },
  building: { nameHe: 'בנייה', emoji: '🧱' },
  sports: { nameHe: 'ספורט', emoji: '🏅' },
  music: { nameHe: 'מוזיקה', emoji: '🎵' },
  books: { nameHe: 'ספרים', emoji: '📚' },
  math: { nameHe: 'מתמטיקה', emoji: '➗' },
  ballet: { nameHe: 'בלט', emoji: '🩰' },
};

function unlockThemeOption(id: ThemeId): UnlockThemeOption {
  const theme = THEMES.find(item => item.id === id);
  const fallback = THEME_FALLBACKS[id];

  return {
    id,
    nameHe: theme?.nameHe ?? fallback?.nameHe ?? id,
    emoji: theme?.emoji ?? fallback?.emoji ?? '✨',
  };
}

export function ThemeUnlockCeremony({
  unlockedThemes,
  onComplete,
  onClose,
}: Props) {
  const lockedThemes = THEME_UNLOCK_ORDER
    .filter(themeId => !unlockedThemes.includes(themeId))
    .map(unlockThemeOption);

  if (lockedThemes.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div className="w-full max-w-lg rounded-3xl border border-magic-accent bg-magic-panel p-6 text-center">
          <div className="mb-4 text-5xl">🏆</div>
          <h2 className="mb-2 text-2xl font-black text-magic-accent">
            כל הנושאים כבר פתוחים!
          </h2>
          <p className="mb-4 text-magic-soft">
            אין כרגע נושא חדש שאפשר לפתוח.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-magic-accent px-6 py-2 font-bold text-magic-bg"
          >
            סגור
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-magic-accent bg-magic-panel shadow-2xl">
        <div className="shrink-0 px-5 pb-4 pt-5 text-center sm:px-6 sm:pt-6">
          <div className="mb-2 text-4xl sm:text-5xl">🔓</div>
          <h2 className="text-2xl font-black text-magic-accent">
            פתיחת נושא חדש!
          </h2>
          <p className="mt-2 text-sm text-magic-soft/80">
            בחר/י איזה עולם חדש ייפתח לקופסאות ההפתעה שלך.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-3 sm:px-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {lockedThemes.map(theme => (
              <button
                key={theme.id}
                type="button"
                onClick={() => onComplete(theme.id)}
                className="rounded-2xl border border-magic-soft/20 bg-magic-bg/50 p-4 text-center transition hover:border-magic-accent hover:bg-magic-bg/80"
              >
                <div className="mb-2 text-4xl">{theme.emoji}</div>
                <div className="font-bold text-white">{theme.nameHe}</div>
                <div className="mt-1 text-xs text-magic-soft/60">
                  קופסאות ופרסים בנושא הזה ייפתחו עבורך.
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="shrink-0 border-t border-white/10 bg-magic-panel/95 px-5 py-4 text-center sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-bold text-magic-soft/70 hover:text-magic-soft"
          >
            אבחר אחר כך
          </button>
        </div>
      </div>
    </div>
  );
}
