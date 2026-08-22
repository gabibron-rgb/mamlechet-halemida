import { useEffect, useState } from 'react';

import { TROPHY_THEMES } from '../../data/trophies';
import { useGameStore } from '../../store/useGameStore';
import type { StudentState } from '../../store/useGameStore';
import Modal from '../shared/Modal';

type Props = {
  open: boolean;
  onClose: () => void;
  student: StudentState | null;
};

export default function TrophyAwardModal({ open, onClose, student }: Props) {
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const awardTrophy = useGameStore(state => state.awardTrophy);

  useEffect(() => {
    if (!open) return;

    setSelectedThemeId(null);
    setCaption('');
    setReviewing(false);
  }, [open, student?.id]);

  const selectedTheme = TROPHY_THEMES.find(
    theme => theme.id === selectedThemeId
  );
  const cleanCaption = caption.trim();
  const canReview = Boolean(student && selectedTheme && cleanCaption.length >= 3);

  function close() {
    setSelectedThemeId(null);
    setCaption('');
    setReviewing(false);
    onClose();
  }

  function confirmAward() {
    if (!student || !selectedTheme || cleanCaption.length < 3) return;

    awardTrophy(student.id, selectedTheme.id, cleanCaption);
    close();
  }

  return (
    <Modal open={open} onClose={close} title="הענקת גביע">
      {!student ? (
        <div className="py-6 text-center text-sm text-magic-soft/70">
          התלמיד/ה לא נמצא/ה. יש לסגור ולנסות שוב.
        </div>
      ) : reviewing && selectedTheme ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-yellow-300/30 bg-yellow-400/10 p-4 text-center">
            <div className="text-xs font-bold text-yellow-200/70">
              בדיקה לפני שמירה
            </div>
            <div className="mt-3 text-6xl">{selectedTheme.emoji}</div>
            <div className="mt-2 text-xl font-black text-yellow-200">
              {selectedTheme.nameHe}
            </div>
          </div>

          <div className="rounded-2xl bg-magic-bg/45 p-4 text-sm">
            <div className="mb-3">
              <span className="text-magic-soft/60">לתלמיד/ה: </span>
              <span className="font-black text-white">{student.name}</span>
            </div>
            <div>
              <div className="mb-1 text-magic-soft/60">הקדשה:</div>
              <div className="leading-6 text-white">{cleanCaption}</div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-300/25 bg-amber-500/10 px-4 py-3 text-center text-xs font-bold text-amber-100">
            לחיצה על האישור הסופי תשמור את הגביע מיד בחשבון של {student.name}.
          </div>

          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={() => setReviewing(false)}
              className="flex-1 rounded-xl bg-magic-bg/60 py-3 font-bold text-magic-soft"
            >
              חזרה לעריכה
            </button>
            <button
              type="button"
              onClick={confirmAward}
              className="flex-1 rounded-xl bg-yellow-300 py-3 font-black text-amber-950 hover:bg-yellow-200"
            >
              אישור סופי והענקה
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="rounded-xl bg-magic-bg/45 px-4 py-3 text-center text-sm text-magic-soft/75">
            הענקת גביע ל־<span className="font-black text-white">{student.name}</span>
          </div>

          <div>
            <div className="mb-2 text-sm font-bold text-magic-soft">
              1. בחירת סוג הגביע
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TROPHY_THEMES.map(theme => {
                const selected = selectedThemeId === theme.id;

                return (
                  <button
                    type="button"
                    key={theme.id}
                    onClick={() => setSelectedThemeId(theme.id)}
                    className={`rounded-2xl border p-3 text-center transition-colors ${
                      selected
                        ? 'border-yellow-300 bg-yellow-400/15 text-yellow-100'
                        : 'border-white/10 bg-magic-bg/35 text-white hover:bg-magic-bg/60'
                    }`}
                  >
                    <div className="text-3xl">{theme.emoji}</div>
                    <div className="mt-2 text-xs font-black">{theme.nameHe}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="trophy-caption"
              className="mb-2 block text-sm font-bold text-magic-soft"
            >
              2. כתיבת הקדשה
            </label>
            <textarea
              id="trophy-caption"
              value={caption}
              onChange={event => setCaption(event.target.value)}
              maxLength={180}
              rows={4}
              placeholder="לדוגמה: על התמדה יוצאת דופן גם כשהאתגר היה קשה"
              className="w-full resize-none rounded-2xl border border-white/15 bg-magic-bg/55 p-3 text-sm leading-6 text-white outline-none placeholder:text-magic-soft/35 focus:border-yellow-300/60"
            />
            <div className="mt-1 text-left text-[10px] text-magic-soft/40" dir="ltr">
              {caption.length}/180
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={close}
              className="flex-1 rounded-xl bg-magic-bg/60 py-3 font-bold text-magic-soft"
            >
              ביטול
            </button>
            <button
              type="button"
              onClick={() => setReviewing(true)}
              disabled={!canReview}
              className="flex-1 rounded-xl bg-magic-accent py-3 font-black text-magic-bg disabled:cursor-not-allowed disabled:opacity-35"
            >
              המשך לבדיקה
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
