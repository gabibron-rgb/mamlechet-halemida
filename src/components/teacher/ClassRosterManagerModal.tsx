import { useEffect, useMemo, useState } from 'react';
import {
  bulkCreateStudents,
  getClassStudentCredentials,
  getTeacherSeatUsage,
  resetStudentPin,
  unarchiveStudent,
  type CreatedStudentCredential,
  type StudentCredentialRow,
  type TeacherSeatUsage,
} from '../../lib/teacherManagement';
import type { ClassDef } from '../../store/useClassStore';
import Modal from '../shared/Modal';

type Props = {
  open: boolean;
  onClose: () => void;
  teacherId: string;
  currentClass: ClassDef;
  onStudentsChanged: () => Promise<void> | void;
};

const EMPTY_USAGE: TeacherSeatUsage = {
  activeCount: 0,
  studentLimit: null,
  remaining: null,
};

function parseNames(raw: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const rawLine of raw.split(/\r?\n/)) {
    const firstCell = rawLine.split('\t').find(cell => cell.trim()) ?? '';
    const cleaned = firstCell
      .replace(/^\s*(?:[-*•]+|\d+[.)])\s*/, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleaned) continue;
    const key = cleaned.toLocaleLowerCase('he');
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(cleaned);
  }

  return result.slice(0, 200);
}

function credentialsText(
  className: string,
  rows: Array<{ name: string; loginName: string; loginCode: string }>
): string {
  return [
    `ממלכת הלמידה — ${className}`,
    '',
    ...rows.map(
      row => `${row.name} | שם משתמש: ${row.loginName} | קוד: ${row.loginCode}`
    ),
  ].join('\n');
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Clipboard write failed:', error);
    return false;
  }
}

export default function ClassRosterManagerModal({
  open,
  onClose,
  teacherId,
  currentClass,
  onStudentsChanged,
}: Props) {
  const [rawNames, setRawNames] = useState('');
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<StudentCredentialRow[]>([]);
  const [createdRows, setCreatedRows] = useState<CreatedStudentCredential[]>([]);
  const [usage, setUsage] = useState<TeacherSeatUsage>(EMPTY_USAGE);
  const [resettingStudentId, setResettingStudentId] = useState<string | null>(null);
  const [restoringStudentId, setRestoringStudentId] = useState<string | null>(null);

  const parsedNames = useMemo(() => parseNames(rawNames), [rawNames]);
  const activeCredentials = useMemo(
    () => credentials.filter(row => !row.archivedAt),
    [credentials]
  );
  const archivedCredentials = useMemo(
    () => credentials.filter(row => Boolean(row.archivedAt)),
    [credentials]
  );

  async function refresh() {
    setLoading(true);
    const [rows, nextUsage] = await Promise.all([
      getClassStudentCredentials({
        teacherId,
        classId: currentClass.id,
        includeArchived: true,
      }),
      getTeacherSeatUsage(teacherId),
    ]);
    setCredentials(rows);
    setUsage(nextUsage);
    setLoading(false);
  }

  useEffect(() => {
    if (!open) return;
    setError(null);
    setMessage(null);
    setCreatedRows([]);
    void refresh();
  }, [open, currentClass.id, teacherId]);

  async function handleCreate() {
    if (creating || parsedNames.length === 0) return;

    setCreating(true);
    setError(null);
    setMessage(null);

    const result = await bulkCreateStudents({
      teacherId,
      classId: currentClass.id,
      names: parsedNames,
    });

    if (!result.ok) {
      setError(result.message);
      setCreating(false);
      return;
    }

    setCreatedRows(result.data);
    setRawNames('');
    setMessage(
      result.data.length === 1
        ? 'התלמיד/ה נוצר/ה בהצלחה.'
        : `${result.data.length} תלמידים נוצרו בהצלחה.`
    );

    await Promise.all([refresh(), onStudentsChanged()]);
    setCreating(false);
  }

  async function handleCopyCreated() {
    if (createdRows.length === 0) return;
    const ok = await copyText(credentialsText(currentClass.nameHe, createdRows));
    setMessage(ok ? 'פרטי ההתחברות של התלמידים החדשים הועתקו.' : 'לא הצלחנו להעתיק ללוח.');
  }

  async function handleCopyAll() {
    if (activeCredentials.length === 0) return;
    const ok = await copyText(
      credentialsText(currentClass.nameHe, activeCredentials)
    );
    setMessage(ok ? 'כל פרטי ההתחברות של הכיתה הועתקו.' : 'לא הצלחנו להעתיק ללוח.');
  }

  async function handleResetPin(row: StudentCredentialRow) {
    if (resettingStudentId) return;
    setResettingStudentId(row.id);
    setError(null);
    setMessage(null);

    const result = await resetStudentPin({
      teacherId,
      studentId: row.id,
    });

    if (!result.ok) {
      setError(result.message);
      setResettingStudentId(null);
      return;
    }

    setCredentials(current =>
      current.map(item =>
        item.id === row.id ? { ...item, loginCode: result.data } : item
      )
    );
    setMessage(`הקוד של ${row.name} אופס ל־${result.data}.`);
    setResettingStudentId(null);
  }

  async function handleUnarchive(row: StudentCredentialRow) {
    if (restoringStudentId) return;
    setRestoringStudentId(row.id);
    setError(null);
    setMessage(null);

    const result = await unarchiveStudent({
      teacherId,
      studentId: row.id,
    });

    if (!result.ok) {
      setError(result.message);
      setRestoringStudentId(null);
      return;
    }

    await Promise.all([refresh(), onStudentsChanged()]);
    setMessage(`${row.name} חזר/ה מהארכיון לכיתה.`);
    setRestoringStudentId(null);
  }

  const seatText = usage.studentLimit === null
    ? `${usage.activeCount} תלמידים פעילים · ללא מכסה כרגע`
    : `${usage.activeCount}/${usage.studentLimit} תלמידים פעילים · ${usage.remaining ?? 0} מקומות פנויים`;

  return (
    <Modal open={open} onClose={onClose} title={`ניהול תלמידים — ${currentClass.nameHe}`} size="wide">
      <div className="flex flex-col gap-5 text-right">
        <section className="rounded-2xl border border-magic-accent/20 bg-magic-accent/5 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-base font-black text-white">⚡ הוספה מהירה</div>
              <p className="mt-1 text-xs leading-5 text-magic-soft/60">
                הדבק/י רשימת שמות, תלמיד אחד בכל שורה. אפשר להעתיק ישירות מעמודה באקסל.
                שם המשתמש נוצר אוטומטית משם פרטי + האות הראשונה של שם המשפחה, והקוד הוא בן 4 ספרות.
              </p>
            </div>
            <div className="shrink-0 rounded-full border border-white/10 bg-magic-bg/50 px-3 py-1 text-[11px] font-bold text-magic-soft/70">
              {seatText}
            </div>
          </div>

          <textarea
            value={rawNames}
            onChange={event => {
              setRawNames(event.target.value);
              setError(null);
              setMessage(null);
            }}
            rows={7}
            placeholder={'נועה לוי\nיואב כהן\nמאיה ישראלי\nאיתי רון'}
            className="mt-4 w-full resize-y rounded-xl border border-white/15 bg-magic-bg/70 px-3 py-3 text-white outline-none placeholder:text-magic-soft/30 focus:border-magic-accent/60"
          />

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs font-bold text-magic-soft/55">
              {parsedNames.length > 0
                ? `${parsedNames.length} תלמידים מוכנים ליצירה`
                : 'אפשר גם להוסיף תלמיד יחיד — פשוט לכתוב שם אחד.'}
            </div>
            <button
              type="button"
              disabled={creating || parsedNames.length === 0}
              onClick={() => void handleCreate()}
              className="rounded-xl bg-magic-accent px-5 py-2.5 text-sm font-black text-magic-bg disabled:cursor-not-allowed disabled:opacity-40"
            >
              {creating ? 'יוצר...' : `צור/י ${parsedNames.length || ''} תלמידים`}
            </button>
          </div>
        </section>

        {createdRows.length > 0 && (
          <section className="rounded-2xl border border-emerald-300/25 bg-emerald-500/8 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-black text-emerald-100">✓ התלמידים החדשים מוכנים</div>
                <div className="mt-1 text-xs text-emerald-100/65">
                  אפשר להעתיק עכשיו את כל פרטי ההתחברות. הם יישארו זמינים גם אחר כך.
                </div>
              </div>
              <button
                type="button"
                onClick={() => void handleCopyCreated()}
                className="shrink-0 rounded-xl bg-emerald-300 px-3 py-2 text-xs font-black text-emerald-950"
              >
                📋 העתק הכל
              </button>
            </div>
            <div className="mt-3 overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="bg-black/15 text-magic-soft/65">
                  <tr>
                    <th className="px-3 py-2 text-right">תלמיד/ה</th>
                    <th className="px-3 py-2 text-right">שם משתמש</th>
                    <th className="px-3 py-2 text-right">קוד</th>
                  </tr>
                </thead>
                <tbody>
                  {createdRows.map(row => (
                    <tr key={row.id} className="border-t border-white/5">
                      <td className="px-3 py-2 font-bold text-white">{row.name}</td>
                      <td className="px-3 py-2 text-magic-soft">{row.loginName}</td>
                      <td className="px-3 py-2 font-mono text-base font-black text-magic-accent">{row.loginCode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {error && (
          <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-200">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-xl border border-emerald-300/20 bg-emerald-500/8 px-3 py-2 text-sm font-bold text-emerald-100/85">
            {message}
          </div>
        )}

        <section className="rounded-2xl border border-white/10 bg-magic-bg/30 p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-black text-white">🔑 פרטי התחברות לכיתה</div>
              <div className="mt-1 text-xs text-magic-soft/55">
                שמות המשתמש והקודים נשארים זמינים למורה בכל זמן.
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => void refresh()}
                className="rounded-xl border border-white/10 bg-magic-bg/55 px-3 py-2 text-xs font-bold text-magic-soft disabled:opacity-40"
              >
                ↻ רענון
              </button>
              <button
                type="button"
                disabled={activeCredentials.length === 0}
                onClick={() => void handleCopyAll()}
                className="rounded-xl border border-magic-accent/30 bg-magic-accent/10 px-3 py-2 text-xs font-black text-magic-accent disabled:opacity-35"
              >
                📋 העתק את כל הכיתה
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-7 text-center text-sm text-magic-soft/60">טוען...</div>
          ) : activeCredentials.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 p-5 text-center text-sm text-magic-soft/55">
              עדיין אין תלמידים פעילים בכיתה.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full min-w-[680px] text-sm">
                <thead className="bg-black/15 text-magic-soft/65">
                  <tr>
                    <th className="px-3 py-2 text-right">תלמיד/ה</th>
                    <th className="px-3 py-2 text-right">שם משתמש</th>
                    <th className="px-3 py-2 text-right">קוד</th>
                    <th className="px-3 py-2 text-right">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {activeCredentials.map(row => (
                    <tr key={row.id} className="border-t border-white/5">
                      <td className="px-3 py-2 font-bold text-white">{row.name}</td>
                      <td className="px-3 py-2 text-magic-soft">{row.loginName}</td>
                      <td className="px-3 py-2 font-mono text-base font-black text-magic-accent">{row.loginCode}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => void copyText(`שם משתמש: ${row.loginName}\nקוד: ${row.loginCode}`)}
                            className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-bold text-magic-soft hover:bg-white/5"
                          >
                            העתק
                          </button>
                          <button
                            type="button"
                            disabled={resettingStudentId !== null}
                            onClick={() => void handleResetPin(row)}
                            className="rounded-lg border border-amber-300/20 px-2.5 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-500/10 disabled:opacity-35"
                          >
                            {resettingStudentId === row.id ? 'מאפס...' : 'איפוס קוד'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {archivedCredentials.length > 0 && (
          <section className="rounded-2xl border border-white/8 bg-black/10 p-4">
            <div className="mb-3">
              <div className="font-black text-magic-soft">📦 ארכיון תלמידים ({archivedCredentials.length})</div>
              <div className="mt-1 text-xs text-magic-soft/45">
                ההתקדמות נשמרת. תלמיד בארכיון אינו תופס מקום במכסת התלמידים ואינו יכול להיכנס עד שמחזירים אותו.
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {archivedCredentials.map(row => (
                <div key={row.id} className="flex flex-col gap-2 rounded-xl bg-magic-bg/35 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-bold text-white">{row.name}</div>
                    <div className="text-xs text-magic-soft/55">{row.loginName} · {row.loginCode}</div>
                  </div>
                  <button
                    type="button"
                    disabled={restoringStudentId !== null}
                    onClick={() => void handleUnarchive(row)}
                    className="rounded-lg border border-emerald-300/20 bg-emerald-500/8 px-3 py-2 text-xs font-black text-emerald-100 disabled:opacity-35"
                  >
                    {restoringStudentId === row.id ? 'מחזיר...' : 'החזר/י לכיתה'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <button
          type="button"
          onClick={onClose}
          disabled={creating}
          className="rounded-xl bg-magic-bg/60 py-3 font-bold text-magic-soft disabled:opacity-40"
        >
          סגירה
        </button>
      </div>
    </Modal>
  );
}
