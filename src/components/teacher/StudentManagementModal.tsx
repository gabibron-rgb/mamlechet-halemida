import { useEffect, useMemo, useState } from 'react';
import { getItemById } from '../../data/items';
import {
  archiveStudent,
  getClassStudentCredentials,
  getRecentInventorySales,
  resetStudentPin,
  restoreInventorySale,
  updateStudentCredentials,
  type InventorySaleRow,
  type StudentCredentialRow,
} from '../../lib/teacherManagement';
import { transferStudentWithinTeacherClasses } from '../../lib/studentTransfers';
import type { ClassDef } from '../../store/useClassStore';
import { useGameStore, type StudentState } from '../../store/useGameStore';
import Modal from '../shared/Modal';

type Props = {
  open: boolean;
  onClose: () => void;
  teacherId: string | null;
  student: StudentState | null;
  currentClass: ClassDef;
  teacherClasses: ClassDef[];
  onTransferred: (studentName: string, targetClass: ClassDef) => Promise<void> | void;
  onArchived: (studentName: string) => Promise<void> | void;
  onInventoryRestored: (studentName: string) => Promise<void> | void;
};

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Clipboard write failed:', error);
    return false;
  }
}

export default function StudentManagementModal({
  open,
  onClose,
  teacherId,
  student,
  currentClass,
  teacherClasses,
  onTransferred,
  onArchived,
  onInventoryRestored,
}: Props) {
  const [targetClassId, setTargetClassId] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [genderSaving, setGenderSaving] = useState(false);
  const [genderMessage, setGenderMessage] = useState<string | null>(null);
  const [genderError, setGenderError] = useState<string | null>(null);
  const [credential, setCredential] = useState<StudentCredentialRow | null>(null);
  const [credentialLoading, setCredentialLoading] = useState(false);
  const [pinResetting, setPinResetting] = useState(false);
  const [credentialEditing, setCredentialEditing] = useState(false);
  const [credentialSaving, setCredentialSaving] = useState(false);
  const [loginNameDraft, setLoginNameDraft] = useState('');
  const [loginCodeDraft, setLoginCodeDraft] = useState('');
  const [credentialMessage, setCredentialMessage] = useState<string | null>(null);
  const [sales, setSales] = useState<InventorySaleRow[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [restoringSaleId, setRestoringSaleId] = useState<string | null>(null);
  const [archiveConfirming, setArchiveConfirming] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const setStudentGender = useGameStore(state => state.setStudentGender);

  const targetClasses = useMemo(
    () =>
      teacherClasses
        .filter(cls => cls.id !== currentClass.id)
        .sort((first, second) => first.nameHe.localeCompare(second.nameHe, 'he')),
    [currentClass.id, teacherClasses]
  );

  const targetClass =
    targetClasses.find(cls => cls.id === targetClassId) ?? null;

  async function loadTeacherData() {
    if (!teacherId || !student) return;

    setCredentialLoading(true);
    setSalesLoading(true);

    const [credentialRows, saleRows] = await Promise.all([
      getClassStudentCredentials({
        teacherId,
        classId: currentClass.id,
        includeArchived: true,
      }),
      getRecentInventorySales({
        teacherId,
        studentId: student.id,
        limit: 12,
      }),
    ]);

    const nextCredential =
      credentialRows.find(row => row.id === student.id) ?? null;
    setCredential(nextCredential);
    if (!credentialEditing && nextCredential) {
      setLoginNameDraft(nextCredential.loginName);
      setLoginCodeDraft(nextCredential.loginCode);
    }
    setSales(saleRows);
    setCredentialLoading(false);
    setSalesLoading(false);
  }

  useEffect(() => {
    if (!open) return;
    setTargetClassId('');
    setConfirming(false);
    setSaving(false);
    setError(null);
    setGenderSaving(false);
    setGenderMessage(null);
    setGenderError(null);
    setCredential(null);
    setCredentialEditing(false);
    setCredentialSaving(false);
    setLoginNameDraft('');
    setLoginCodeDraft('');
    setCredentialMessage(null);
    setSales([]);
    setPinResetting(false);
    setRestoringSaleId(null);
    setArchiveConfirming(false);
    setArchiving(false);
    void loadTeacherData();
  }, [open, student?.id, teacherId, currentClass.id]);

  function close() {
    if (saving || genderSaving || pinResetting || credentialSaving || archiving || restoringSaleId) return;
    setTargetClassId('');
    setConfirming(false);
    setArchiveConfirming(false);
    setError(null);
    onClose();
  }

  async function saveGender(gender: 'male' | 'female') {
    if (!student || genderSaving) return;

    setGenderSaving(true);
    setGenderMessage(null);
    setGenderError(null);

    const ok = await setStudentGender(student.id, gender);
    setGenderSaving(false);

    if (!ok) {
      setGenderError('לא הצלחתי לשמור את ההגדרה ב־Supabase. כדאי לנסות שוב.');
      return;
    }

    setGenderMessage(
      gender === 'male'
        ? 'נשמר: התארים יוצגו מעכשיו בניסוח לבן.'
        : 'נשמר: התארים יוצגו מעכשיו בניסוח לבת.'
    );
  }

  async function confirmTransfer() {
    if (!student || !teacherId || !targetClass || saving) return;

    setSaving(true);
    setError(null);

    const result = await transferStudentWithinTeacherClasses({
      teacherId,
      studentId: student.id,
      sourceClassId: currentClass.id,
      targetClassId: targetClass.id,
    });

    if (!result.ok) {
      setError(result.message);
      setSaving(false);
      return;
    }

    await onTransferred(student.name, targetClass);
    setSaving(false);
    onClose();
  }

  async function handleResetPin() {
    if (!teacherId || !student || pinResetting) return;

    setPinResetting(true);
    setCredentialMessage(null);
    setError(null);

    const result = await resetStudentPin({
      teacherId,
      studentId: student.id,
    });

    if (!result.ok) {
      setError(result.message);
      setPinResetting(false);
      return;
    }

    setCredential(current =>
      current ? { ...current, loginCode: result.data } : current
    );
    setLoginCodeDraft(result.data);
    setCredentialMessage(`הקוד החדש הוא ${result.data}.`);
    setPinResetting(false);
  }

  function startCredentialEdit() {
    if (!credential) return;
    setLoginNameDraft(credential.loginName);
    setLoginCodeDraft(credential.loginCode);
    setCredentialMessage(null);
    setError(null);
    setCredentialEditing(true);
  }

  function cancelCredentialEdit() {
    if (credentialSaving) return;
    if (credential) {
      setLoginNameDraft(credential.loginName);
      setLoginCodeDraft(credential.loginCode);
    }
    setCredentialEditing(false);
    setError(null);
  }

  async function saveCredentials() {
    if (!teacherId || !student || !credential || credentialSaving) return;

    const cleanLoginName = loginNameDraft.trim();
    const cleanLoginCode = loginCodeDraft.trim();

    if (!cleanLoginName) {
      setError('יש להזין שם משתמש.');
      return;
    }

    if (!/^\d{4}$/.test(cleanLoginCode)) {
      setError('הקוד האישי חייב להכיל בדיוק 4 ספרות.');
      return;
    }

    setCredentialSaving(true);
    setCredentialMessage(null);
    setError(null);

    const result = await updateStudentCredentials({
      teacherId,
      studentId: student.id,
      loginName: cleanLoginName,
      loginCode: cleanLoginCode,
    });

    if (!result.ok) {
      setError(result.message);
      setCredentialSaving(false);
      return;
    }

    setCredential(current =>
      current
        ? {
            ...current,
            loginName: result.data.loginName,
            loginCode: result.data.loginCode,
          }
        : current
    );
    setLoginNameDraft(result.data.loginName);
    setLoginCodeDraft(result.data.loginCode);
    setCredentialEditing(false);
    setCredentialMessage('פרטי ההתחברות עודכנו. ההתקדמות של התלמיד/ה נשארה ללא שינוי.');
    setCredentialSaving(false);
  }

  async function handleCopyCredentials() {
    if (!credential) return;
    const ok = await copyText(
      `${student?.name ?? credential.name}\nשם משתמש: ${credential.loginName}\nקוד: ${credential.loginCode}`
    );
    setCredentialMessage(ok ? 'פרטי ההתחברות הועתקו.' : 'לא הצלחנו להעתיק ללוח.');
  }

  async function handleRestoreSale(sale: InventorySaleRow) {
    if (!teacherId || !student || restoringSaleId || sale.restoredAt) return;

    setRestoringSaleId(sale.id);
    setError(null);

    const result = await restoreInventorySale({
      teacherId,
      studentId: student.id,
      saleId: sale.id,
    });

    if (!result.ok) {
      setError(result.message);
      setRestoringSaleId(null);
      return;
    }

    await Promise.all([loadTeacherData(), onInventoryRestored(student.name)]);
    setRestoringSaleId(null);
  }

  async function handleArchive() {
    if (!teacherId || !student || archiving) return;

    setArchiving(true);
    setError(null);

    const result = await archiveStudent({
      teacherId,
      studentId: student.id,
    });

    if (!result.ok) {
      setError(result.message);
      setArchiving(false);
      return;
    }

    await onArchived(student.name);
    setArchiving(false);
    onClose();
  }

  return (
    <Modal open={open} onClose={close} title="ניהול תלמיד/ה">
      {!student ? (
        <div className="py-6 text-center text-sm text-magic-soft/70">
          התלמיד/ה לא נמצא/ה. יש לסגור ולנסות שוב.
        </div>
      ) : (
        <div className="flex flex-col gap-5 text-right">
          <div className="rounded-xl bg-magic-bg/45 px-4 py-3">
            <div className="font-black text-white">{student.name}</div>
            <div className="mt-1 text-xs text-magic-soft/55">
              {currentClass.nameHe} · רמה {student.level} · {student.points} נק׳
            </div>
          </div>

          <section className="rounded-2xl border border-magic-accent/20 bg-magic-accent/5 p-4">
            <div className="text-sm font-black text-white">🔑 פרטי התחברות</div>
            <p className="mt-1 text-xs leading-5 text-magic-soft/55">
              פרטי ההתחברות זמינים למורה גם אחרי יצירת המשתמש. אפשר להעתיק, לערוך שם משתמש וקוד, או לייצר קוד חדש.
            </p>

            {credentialLoading ? (
              <div className="mt-4 text-center text-xs font-bold text-magic-soft/55">טוען...</div>
            ) : credential ? (
              <>
                {credentialEditing ? (
                  <div className="mt-4 rounded-xl border border-magic-accent/20 bg-magic-bg/40 p-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-[10px] font-bold text-magic-soft/55">שם משתמש</span>
                        <input
                          value={loginNameDraft}
                          onChange={event => {
                            setLoginNameDraft(event.target.value);
                            setError(null);
                          }}
                          maxLength={30}
                          autoComplete="off"
                          className="mt-1 w-full rounded-lg border border-white/15 bg-magic-bg/70 px-3 py-2 font-black text-white outline-none focus:border-magic-accent/60"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[10px] font-bold text-magic-soft/55">קוד אישי — 4 ספרות</span>
                        <input
                          value={loginCodeDraft}
                          onChange={event => {
                            setLoginCodeDraft(event.target.value.replace(/\D/g, '').slice(0, 4));
                            setError(null);
                          }}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={4}
                          autoComplete="off"
                          className="mt-1 w-full rounded-lg border border-white/15 bg-magic-bg/70 px-3 py-2 font-mono text-lg font-black tracking-widest text-magic-accent outline-none focus:border-magic-accent/60"
                        />
                      </label>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        disabled={credentialSaving}
                        onClick={cancelCredentialEdit}
                        className="flex-1 rounded-lg border border-white/10 bg-magic-bg/55 py-2 text-xs font-bold text-magic-soft disabled:opacity-40"
                      >
                        ביטול
                      </button>
                      <button
                        type="button"
                        disabled={credentialSaving || !loginNameDraft.trim() || loginCodeDraft.length !== 4}
                        onClick={() => void saveCredentials()}
                        className="flex-1 rounded-lg bg-magic-accent py-2 text-xs font-black text-magic-bg disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {credentialSaving ? 'שומר...' : '✓ שמירת פרטים'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-magic-bg/55 p-3">
                        <div className="text-[10px] font-bold text-magic-soft/45">שם משתמש</div>
                        <div className="mt-1 break-all font-black text-white">{credential.loginName}</div>
                      </div>
                      <div className="rounded-xl bg-magic-bg/55 p-3">
                        <div className="text-[10px] font-bold text-magic-soft/45">קוד אישי</div>
                        <div className="mt-1 font-mono text-xl font-black tracking-widest text-magic-accent">{credential.loginCode}</div>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => void handleCopyCredentials()}
                        className="rounded-xl border border-white/10 bg-magic-bg/45 py-2.5 text-xs font-black text-magic-soft"
                      >
                        📋 העתק
                      </button>
                      <button
                        type="button"
                        onClick={startCredentialEdit}
                        className="rounded-xl border border-magic-accent/20 bg-magic-accent/8 py-2.5 text-xs font-black text-magic-accent"
                      >
                        ✏️ עריכה
                      </button>
                      <button
                        type="button"
                        disabled={pinResetting}
                        onClick={() => void handleResetPin()}
                        className="rounded-xl border border-amber-300/20 bg-amber-500/8 py-2.5 text-xs font-black text-amber-100 disabled:opacity-40"
                      >
                        {pinResetting ? 'מאפס...' : '🔄 קוד חדש'}
                      </button>
                    </div>
                  </>
                )}
                {credentialMessage && (
                  <div className="mt-3 rounded-xl border border-emerald-300/20 bg-emerald-500/8 px-3 py-2 text-center text-xs font-bold text-emerald-100/85">
                    {credentialMessage}
                  </div>
                )}
              </>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-white/15 p-3 text-center text-xs text-magic-soft/55">
                לא נמצאו פרטי התחברות עבור התלמיד/ה.
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-sky-300/15 bg-sky-500/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-black text-white">ניסוח תארים</div>
                <p className="mt-1 text-xs leading-5 text-magic-soft/55">
                  מגדירים פעם אחת אם התלמיד בן או בת. הבחירה נשמרת ישירות ב־Supabase ומשמשת להצגת התארים בניסוח המתאים.
                </p>
              </div>
              <div className="shrink-0 rounded-full border border-white/10 bg-magic-bg/55 px-3 py-1 text-[10px] font-black text-magic-soft/70">
                {student.gender === 'male'
                  ? 'בן'
                  : student.gender === 'female'
                    ? 'בת'
                    : 'טרם הוגדר'}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={genderSaving}
                onClick={() => void saveGender('male')}
                className={`rounded-xl border px-3 py-2.5 text-sm font-black transition disabled:opacity-45 ${
                  student.gender === 'male'
                    ? 'border-sky-300/55 bg-sky-300/15 text-sky-100'
                    : 'border-white/10 bg-magic-bg/45 text-magic-soft hover:border-sky-300/30 hover:text-sky-100'
                }`}
              >
                👦 בן
              </button>
              <button
                type="button"
                disabled={genderSaving}
                onClick={() => void saveGender('female')}
                className={`rounded-xl border px-3 py-2.5 text-sm font-black transition disabled:opacity-45 ${
                  student.gender === 'female'
                    ? 'border-fuchsia-300/55 bg-fuchsia-300/15 text-fuchsia-100'
                    : 'border-white/10 bg-magic-bg/45 text-magic-soft hover:border-fuchsia-300/30 hover:text-fuchsia-100'
                }`}
              >
                👧 בת
              </button>
            </div>

            {genderSaving && (
              <div className="mt-3 text-center text-xs font-bold text-magic-soft/55">
                שומר ב־Supabase...
              </div>
            )}
            {genderMessage && !genderSaving && (
              <div className="mt-3 rounded-xl border border-emerald-300/20 bg-emerald-500/10 px-3 py-2 text-center text-xs font-bold text-emerald-100/85">
                ✓ {genderMessage}
              </div>
            )}
            {genderError && !genderSaving && (
              <div className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-center text-xs font-bold text-red-200">
                {genderError}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-violet-300/15 bg-violet-500/5 p-4">
            <div className="text-sm font-black text-white">↩️ שחזור חפצים שנמכרו</div>
            <p className="mt-1 text-xs leading-5 text-magic-soft/55">
              נשמרת היסטוריית מכירות. אם חפץ נמכר בטעות או שמישהו נכנס לחשבון של תלמיד אחר, אפשר להחזיר אותו בלחיצה.
            </p>

            {salesLoading ? (
              <div className="mt-4 text-center text-xs font-bold text-magic-soft/55">טוען היסטוריה...</div>
            ) : sales.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-white/10 p-3 text-center text-xs text-magic-soft/45">
                אין מכירות מתועדות עדיין.
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-2">
                {sales.map(sale => {
                  const itemId = typeof sale.itemEntry.itemId === 'string'
                    ? sale.itemEntry.itemId
                    : '';
                  const item = itemId ? getItemById(itemId) : undefined;
                  const soldAt = new Date(sale.soldAt).toLocaleString('he-IL', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  });

                  return (
                    <div key={sale.id} className="flex flex-col gap-2 rounded-xl bg-magic-bg/45 p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-sm font-bold text-white">
                          {item?.nameHe ?? (itemId || 'חפץ שנמכר')}
                        </div>
                        <div className="mt-0.5 text-[11px] text-magic-soft/50">
                          {soldAt} · התקבלו {sale.refundPoints} נק׳
                          {sale.restoredAt ? ' · שוחזר' : ''}
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={Boolean(sale.restoredAt) || restoringSaleId !== null}
                        onClick={() => void handleRestoreSale(sale)}
                        className="rounded-lg border border-emerald-300/20 bg-emerald-500/8 px-3 py-2 text-xs font-black text-emerald-100 disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        {sale.restoredAt
                          ? '✓ שוחזר'
                          : restoringSaleId === sale.id
                            ? 'משחזר...'
                            : 'שחזר/י חפץ'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {!confirming ? (
            <section className="rounded-2xl border border-white/10 bg-magic-bg/30 p-4">
              <div className="mb-1 text-sm font-black text-white">
                העברה לכיתה אחרת
              </div>
              <p className="mb-4 text-xs leading-5 text-magic-soft/55">
                ההתקדמות האישית נשמרת. התלמיד/ה יצטרף/תצטרף לעולם ולמצב הממלכה של הכיתה החדשה.
              </p>

              {targetClasses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/15 p-4 text-center text-sm text-magic-soft/60">
                  אין כיתה אחרת זמינה להעברה.
                </div>
              ) : (
                <>
                  <label className="mb-1 block text-xs font-bold text-magic-soft">
                    כיתת יעד
                  </label>
                  <select
                    value={targetClassId}
                    onChange={event => {
                      setTargetClassId(event.target.value);
                      setError(null);
                    }}
                    className="w-full rounded-xl border border-white/15 bg-magic-bg/70 px-3 py-2 text-white outline-none focus:border-magic-accent/60"
                  >
                    <option value="">בחר/י כיתה...</option>
                    {targetClasses.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.nameHe}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      if (!targetClass) return;
                      setConfirming(true);
                      setError(null);
                    }}
                    disabled={!targetClass}
                    className="mt-4 w-full rounded-xl border border-magic-accent/30 bg-magic-accent/10 py-2.5 text-sm font-black text-magic-accent transition-colors hover:bg-magic-accent/15 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    המשך להעברה
                  </button>
                </>
              )}
            </section>
          ) : targetClass ? (
            <section className="rounded-2xl border border-amber-300/20 bg-amber-500/8 p-4">
              <div className="text-center text-sm font-black text-amber-100">
                להעביר את {student.name}?
              </div>

              <div className="my-4 flex items-center justify-center gap-3 text-sm font-bold">
                <span className="rounded-lg bg-magic-bg/55 px-3 py-2 text-white">
                  {currentClass.nameHe}
                </span>
                <span className="text-xl text-magic-accent">←</span>
                <span className="rounded-lg bg-magic-accent/15 px-3 py-2 text-magic-accent">
                  {targetClass.nameHe}
                </span>
              </div>

              <div className="flex flex-col gap-2 text-xs leading-5">
                <div className="rounded-xl border border-emerald-300/15 bg-emerald-500/8 px-3 py-2 text-emerald-100/80">
                  ✓ נשמרים: נקודות, XP, רמה, חדר, מלאי, חיה, גביעים, הישגים, נושאים ומשימות אישיות.
                </div>
                <div className="rounded-xl border border-sky-300/15 bg-sky-500/8 px-3 py-2 text-sky-100/80">
                  ↻ מתחלפים: היעדים ומצב הממלכה הכיתתית — התלמיד/ה יצטרף/תצטרף למצב של {targetClass.nameHe}.
                </div>
              </div>

              <p className="mt-3 text-[11px] leading-5 text-magic-soft/45">
                פרסים שכבר התקבלו נשארים בחשבון האישי. זכאות עתידית לפרסי הממלכה תחושב לפי הכיתה החדשה.
              </p>

              {error && (
                <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-center text-xs font-bold text-red-200">
                  {error}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setConfirming(false);
                    setError(null);
                  }}
                  disabled={saving}
                  className="flex-1 rounded-xl bg-magic-bg/60 py-2.5 text-sm font-bold text-magic-soft disabled:opacity-40"
                >
                  חזרה
                </button>
                <button
                  type="button"
                  onClick={() => void confirmTransfer()}
                  disabled={saving}
                  className="flex-1 rounded-xl bg-amber-300 py-2.5 text-sm font-black text-magic-bg disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {saving ? 'מעביר...' : 'כן, להעביר'}
                </button>
              </div>
            </section>
          ) : null}

          <section className="rounded-2xl border border-red-300/15 bg-red-500/5 p-4">
            <div className="text-sm font-black text-white">📦 ארכיון תלמיד/ה</div>
            <p className="mt-1 text-xs leading-5 text-magic-soft/55">
              במקום למחוק משתמש, מעבירים אותו לארכיון. כל ההתקדמות נשמרת, הכניסה נחסמת והמקום במכסה משתחרר. אפשר להחזיר אותו אחר כך דרך ניהול תלמידי הכיתה.
            </p>

            {!archiveConfirming ? (
              <button
                type="button"
                onClick={() => setArchiveConfirming(true)}
                className="mt-4 w-full rounded-xl border border-red-300/20 bg-red-500/8 py-2.5 text-xs font-black text-red-100"
              >
                העבר/י לארכיון
              </button>
            ) : (
              <div className="mt-4 rounded-xl border border-red-300/20 bg-red-500/8 p-3">
                <div className="text-center text-xs font-black text-red-100">
                  להעביר את {student.name} לארכיון?
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={archiving}
                    onClick={() => setArchiveConfirming(false)}
                    className="rounded-lg bg-magic-bg/60 py-2 text-xs font-bold text-magic-soft disabled:opacity-40"
                  >
                    ביטול
                  </button>
                  <button
                    type="button"
                    disabled={archiving}
                    onClick={() => void handleArchive()}
                    className="rounded-lg bg-red-300 py-2 text-xs font-black text-red-950 disabled:opacity-40"
                  >
                    {archiving ? 'מעביר...' : 'כן, לארכיון'}
                  </button>
                </div>
              </div>
            )}
          </section>

          {error && !confirming && (
            <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-center text-xs font-bold text-red-200">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={close}
            disabled={saving || archiving || pinResetting || credentialSaving || restoringSaleId !== null}
            className="rounded-xl bg-magic-bg/60 py-3 font-bold text-magic-soft disabled:opacity-40"
          >
            סגירה
          </button>
        </div>
      )}
    </Modal>
  );
}
