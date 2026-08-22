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

type TrophyEntry = StudentState['trophies'][number];

function trophyDefinition(themeId: string) {
  return TROPHY_THEMES.find(theme => theme.id === themeId);
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export default function TrophyManagementModal({ open, onClose, student }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [editThemeId, setEditThemeId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');

  const updateTrophy = useGameStore(state => state.updateTrophy);
  const removeTrophy = useGameStore(state => state.removeTrophy);

  useEffect(() => {
    if (!open) return;

    setEditingId(null);
    setRemovingId(null);
    setEditThemeId(null);
    setEditCaption('');
  }, [open, student?.id]);

  const trophies = student
    ? [...student.trophies].sort(
        (first, second) => second.awardedAt - first.awardedAt
      )
    : [];

  function close() {
    setEditingId(null);
    setRemovingId(null);
    setEditThemeId(null);
    setEditCaption('');
    onClose();
  }

  function startEditing(trophy: TrophyEntry) {
    setRemovingId(null);
    setEditingId(trophy.id);
    setEditThemeId(trophy.trophyTheme);
    setEditCaption(trophy.caption);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditThemeId(null);
    setEditCaption('');
  }

  function saveEdit(trophyId: string) {
    const cleanCaption = editCaption.trim();
    const validTheme = TROPHY_THEMES.some(theme => theme.id === editThemeId);

    if (!student || !editThemeId || !validTheme || cleanCaption.length < 3) {
      return;
    }

    updateTrophy(student.id, trophyId, editThemeId, cleanCaption);
    cancelEditing();
  }

  function confirmRemoval(trophyId: string) {
    if (!student) return;

    removeTrophy(student.id, trophyId);
    setRemovingId(null);
    if (editingId === trophyId) cancelEditing();
  }

  return (
    <Modal open={open} onClose={close} title="ניהול גביעים">
      {!student ? (
        <div className="py-6 text-center text-sm text-magic-soft/70">
          התלמיד/ה לא נמצא/ה. יש לסגור ולנסות שוב.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-magic-bg/45 px-4 py-3 text-center text-sm">
            <span className="font-black text-white">{student.name}</span>
            <span className="text-magic-soft/60"> · {trophies.length} גביעים</span>
          </div>

          {trophies.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 py-10 text-center">
              <div className="text-5xl grayscale opacity-45">🏆</div>
              <div className="mt-3 text-sm font-bold text-magic-soft/65">
                עדיין לא הוענקו גביעים
              </div>
            </div>
          ) : (
            <div className="flex max-h-[62vh] flex-col gap-3 overflow-y-auto pl-1">
              {trophies.map(trophy => {
                const definition = trophyDefinition(trophy.trophyTheme);
                const isEditing = editingId === trophy.id;
                const isRemoving = removingId === trophy.id;
                const cleanEditCaption = editCaption.trim();
                const canSave =
                  Boolean(editThemeId) &&
                  TROPHY_THEMES.some(theme => theme.id === editThemeId) &&
                  cleanEditCaption.length >= 3;

                return (
                  <article
                    key={trophy.id}
                    className="rounded-2xl border border-white/10 bg-magic-bg/40 p-4"
                  >
                    {isEditing ? (
                      <div className="flex flex-col gap-4">
                        <div className="text-sm font-black text-yellow-200">
                          תיקון הגביע
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {TROPHY_THEMES.map(theme => {
                            const selected = editThemeId === theme.id;

                            return (
                              <button
                                type="button"
                                key={theme.id}
                                onClick={() => setEditThemeId(theme.id)}
                                className={`rounded-xl border p-2 text-center ${
                                  selected
                                    ? 'border-yellow-300 bg-yellow-400/15'
                                    : 'border-white/10 bg-black/10'
                                }`}
                              >
                                <div className="text-2xl">{theme.emoji}</div>
                                <div className="mt-1 text-[10px] font-bold text-white">
                                  {theme.nameHe}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <textarea
                          value={editCaption}
                          onChange={event => setEditCaption(event.target.value)}
                          maxLength={180}
                          rows={3}
                          className="w-full resize-none rounded-xl border border-white/15 bg-black/15 p-3 text-sm leading-6 text-white outline-none focus:border-yellow-300/60"
                        />

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="flex-1 rounded-xl bg-magic-panel/70 py-2 text-sm font-bold text-magic-soft"
                          >
                            ביטול
                          </button>
                          <button
                            type="button"
                            onClick={() => saveEdit(trophy.id)}
                            disabled={!canSave}
                            className="flex-1 rounded-xl bg-magic-accent py-2 text-sm font-black text-magic-bg disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            שמירת תיקון
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start gap-3">
                          <div className="text-4xl">{definition?.emoji ?? '🏆'}</div>
                          <div className="min-w-0 flex-1">
                            <div className="font-black text-yellow-200">
                              {definition?.nameHe ?? 'גביע מיוחד'}
                            </div>
                            <div className="mt-1 text-xs leading-5 text-magic-soft/75">
                              {trophy.caption?.trim() || 'ללא הקדשה'}
                            </div>
                            <div className="mt-2 text-[10px] text-magic-soft/40">
                              {formatDate(trophy.awardedAt)}
                            </div>
                          </div>
                        </div>

                        {isRemoving ? (
                          <div className="mt-4 rounded-xl border border-red-300/25 bg-red-500/10 p-3">
                            <div className="mb-3 text-center text-xs font-bold text-red-100">
                              להסיר את הגביע מהחשבון של {student.name}?
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setRemovingId(null)}
                                className="flex-1 rounded-lg bg-magic-panel/70 py-2 text-xs font-bold text-magic-soft"
                              >
                                ביטול
                              </button>
                              <button
                                type="button"
                                onClick={() => confirmRemoval(trophy.id)}
                                className="flex-1 rounded-lg bg-red-500 py-2 text-xs font-black text-white hover:bg-red-400"
                              >
                                כן, להסיר
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 flex gap-2">
                            <button
                              type="button"
                              onClick={() => startEditing(trophy)}
                              className="flex-1 rounded-lg bg-magic-panel/70 py-2 text-xs font-bold text-magic-soft hover:bg-magic-panel"
                            >
                              ✏️ תיקון
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null);
                                setRemovingId(trophy.id);
                              }}
                              className="flex-1 rounded-lg border border-red-300/20 bg-red-500/5 py-2 text-xs font-bold text-red-200 hover:bg-red-500/15"
                            >
                              🗑️ הסרה
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          <button
            type="button"
            onClick={close}
            className="rounded-xl bg-magic-bg/60 py-3 font-bold text-magic-soft"
          >
            סגירה
          </button>
        </div>
      )}
    </Modal>
  );
}
