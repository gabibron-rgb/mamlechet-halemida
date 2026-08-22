import { useEffect, useMemo, useState } from 'react';

import { getCompanionTrait } from '../../data/companionTraits';
import { REASONS } from '../../data/reasons';
import { useGameStore, type StudentState } from '../../store/useGameStore';
import Modal from '../shared/Modal';

type Props = {
  open: boolean;
  onClose: () => void;
  student: StudentState | null;
};

const SOURCE_LABELS = {
  teacher_note: 'רגע מיוחד שנכתב על ידי המורה',
  flourish: 'אות מיוחד — מתעדכן דרך הענקת האות',
  challenge: 'השלמת אתגר — מתעדכנת אוטומטית',
} as const;

export default function CompanionJournalModal({
  open,
  onClose,
  student,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateJournalEntry = useGameStore(
    state => state.updateCompanionJournalEntry
  );
  const removeJournalEntry = useGameStore(
    state => state.removeCompanionJournalEntry
  );

  useEffect(() => {
    if (!open) return;
    setEditingId(null);
    setDraft('');
    setConfirmingDeleteId(null);
    setIsSaving(false);
    setError(null);
  }, [open, student?.id]);

  const entries = useMemo(
    () =>
      [...(student?.companion.journalEntries ?? [])].sort(
        (first, second) => second.createdAt - first.createdAt
      ),
    [student?.companion.journalEntries]
  );

  async function saveEdit(entryId: string) {
    if (!student || !draft.trim() || isSaving) return;

    setIsSaving(true);
    setError(null);
    const success = await updateJournalEntry(student.id, entryId, draft);
    setIsSaving(false);

    if (!success) {
      setError('לא ניתן היה לשמור את השינוי. כדאי לסגור ולנסות שוב.');
      return;
    }

    setEditingId(null);
    setDraft('');
  }

  async function deleteEntry(entryId: string) {
    if (!student || isSaving) return;

    if (confirmingDeleteId !== entryId) {
      setConfirmingDeleteId(entryId);
      return;
    }

    setIsSaving(true);
    setError(null);
    const success = await removeJournalEntry(student.id, entryId);
    setIsSaving(false);

    if (!success) {
      setError('לא ניתן היה למחוק את הרשומה. כדאי לסגור ולנסות שוב.');
      return;
    }

    setConfirmingDeleteId(null);
    if (editingId === entryId) {
      setEditingId(null);
      setDraft('');
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="ניהול יומן החיה">
      {!student ? (
        <div className="py-6 text-center text-sm text-magic-soft/65">
          התלמיד/ה לא נמצא/ה.
        </div>
      ) : (
        <div className="space-y-4 text-right">
          <div className="rounded-2xl border border-amber-300/15 bg-amber-500/10 p-4">
            <div className="font-black text-amber-100">
              📖 היומן של {student.name}
            </div>
            <div className="mt-1 text-xs leading-5 text-magic-soft/60">
              אפשר לערוך ולמחוק רק רגעים שהמורה כתבה בזמן הענקת נקודות.
              אותות והשלמת אתגרים קשורים לאירוע המקורי ולכן אינם נערכים כאן.
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 p-3 text-xs font-bold text-red-200">
              {error}
            </div>
          )}

          {entries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-magic-bg/25 p-6 text-center text-sm text-magic-soft/55">
              עדיין אין רשומות ביומן.
            </div>
          ) : (
            <div className="max-h-[32rem] space-y-3 overflow-y-auto pl-1">
              {entries.map(entry => {
                const trait = getCompanionTrait(entry.traitId);
                const reason = entry.reasonId
                  ? REASONS.find(item => item.id === entry.reasonId)
                  : null;
                const canEdit = entry.source === 'teacher_note';
                const isEditing = editingId === entry.id;

                return (
                  <article
                    key={entry.id}
                    className="rounded-2xl border border-white/10 bg-magic-bg/35 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="text-2xl">{trait.emoji}</span>
                        <div className="min-w-0">
                          <div className="text-sm font-black text-white">
                            {reason?.labelHe ?? trait.nameHe}
                          </div>
                          <div className="mt-0.5 text-[9px] text-magic-soft/45">
                            {SOURCE_LABELS[entry.source]} ·{' '}
                            {new Date(entry.createdAt).toLocaleDateString(
                              'he-IL'
                            )}
                          </div>
                        </div>
                      </div>

                      {!canEdit && (
                        <span className="shrink-0 rounded-full bg-white/5 px-2 py-1 text-[9px] font-bold text-magic-soft/45">
                          אוטומטי 🔒
                        </span>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="mt-3">
                        <textarea
                          value={draft}
                          onChange={event => setDraft(event.target.value)}
                          maxLength={240}
                          rows={3}
                          className="w-full resize-none rounded-xl border border-amber-300/25 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-amber-300/60"
                        />
                        <div className="mt-1 text-left text-[9px] text-magic-soft/40">
                          {draft.length}/240
                        </div>
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => void saveEdit(entry.id)}
                            disabled={!draft.trim() || isSaving}
                            className="flex-1 rounded-xl bg-amber-300 px-3 py-2 text-xs font-black text-amber-950 disabled:opacity-40"
                          >
                            {isSaving ? 'שומר...' : 'שמירת השינוי'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null);
                              setDraft('');
                            }}
                            disabled={isSaving}
                            className="rounded-xl bg-white/5 px-3 py-2 text-xs font-bold text-magic-soft"
                          >
                            ביטול
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-amber-50/75">
                        {entry.message}
                      </p>
                    )}

                    {canEdit && !isEditing && (
                      <div className="mt-3 flex gap-2 border-t border-white/5 pt-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(entry.id);
                            setDraft(entry.message);
                            setConfirmingDeleteId(null);
                          }}
                          className="rounded-lg bg-white/5 px-3 py-1.5 text-[10px] font-bold text-magic-soft hover:bg-white/10"
                        >
                          עריכה ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteEntry(entry.id)}
                          disabled={isSaving}
                          className={`rounded-lg px-3 py-1.5 text-[10px] font-bold ${
                            confirmingDeleteId === entry.id
                              ? 'bg-red-400 text-red-950'
                              : 'bg-red-500/10 text-red-200'
                          }`}
                        >
                          {confirmingDeleteId === entry.id
                            ? 'אישור מחיקה'
                            : 'מחיקה'}
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="w-full rounded-xl bg-magic-bg/55 px-4 py-3 text-sm font-bold text-magic-soft"
          >
            סגירה
          </button>
        </div>
      )}
    </Modal>
  );
}
