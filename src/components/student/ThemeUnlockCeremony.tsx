import type { ThemeId } from '../../data/themes';
import { THEMES } from '../../data/themes';

type Props = {
  unlockedThemes: ThemeId[];
  onComplete: (themeId: ThemeId) => void;
  onClose: () => void;
};

export function ThemeUnlockCeremony({
  unlockedThemes,
  onComplete,
  onClose,
}: Props) {
  const lockedThemes = THEMES.filter(
    theme => theme.id !== 'generic' && !unlockedThemes.includes(theme.id)
  );

  if (lockedThemes.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-lg rounded-3xl bg-magic-panel p-6 text-center border border-magic-accent">
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="text-2xl font-black text-magic-accent mb-2">
            כל הנושאים כבר פתוחים!
          </h2>
          <p className="text-magic-soft mb-4">
            אין כרגע נושא חדש שאפשר לפתוח.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="bg-magic-accent text-magic-bg font-bold py-2 px-6 rounded-xl"
          >
            סגור
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl rounded-3xl bg-magic-panel p-6 border border-magic-accent shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🔓</div>
          <h2 className="text-2xl font-black text-magic-accent">
            פתיחת נושא חדש!
          </h2>
          <p className="text-magic-soft/80 text-sm mt-2">
            בחר/י איזה עולם חדש ייפתח לקופסאות ההפתעה שלך.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {lockedThemes.map(theme => (
            <button
              key={theme.id}
              type="button"
              onClick={() => onComplete(theme.id)}
              className="bg-magic-bg/50 rounded-2xl p-4 text-center hover:bg-magic-bg/80 transition border border-magic-soft/20 hover:border-magic-accent"
            >
              <div className="text-4xl mb-2">{theme.emoji}</div>
              <div className="text-white font-bold">{theme.nameHe}</div>
              <div className="text-magic-soft/60 text-xs mt-1">
                קופסאות ופרסים בנושא הזה ייפתחו עבורך.
              </div>
            </button>
          ))}
        </div>

        <div className="text-center mt-5">
          <button
            type="button"
            onClick={onClose}
            className="text-magic-soft/60 hover:text-magic-soft text-sm"
          >
            אבחר אחר כך
          </button>
        </div>
      </div>
    </div>
  );
}