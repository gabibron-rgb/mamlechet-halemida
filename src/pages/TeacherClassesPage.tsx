import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/shared/Modal';
import {
  createTeacherClass,
  getTeacherSeatUsage,
  type TeacherSeatUsage,
} from '../lib/teacherManagement';
import { getClassesByTeacherId } from '../lib/supabaseTeachers';
import { useClassStore } from '../store/useClassStore';
import { useSessionStore } from '../store/useSessionStore';

const EMPTY_USAGE: TeacherSeatUsage = {
  activeCount: 0,
  studentLimit: null,
  remaining: null,
};

export default function TeacherClassesPage() {
  const navigate = useNavigate();
  const teacherId = useSessionStore((s) => s.currentTeacherId);
  const teacherName = useSessionStore((s) => s.currentTeacherName);
  const selectTeacherClass = useSessionStore((s) => s.selectTeacherClass);
  const logout = useSessionStore((s) => s.logout);
  const classesMap = useClassStore((s) => s.classes);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<TeacherSeatUsage>(EMPTY_USAGE);
  const [createOpen, setCreateOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const classes = useMemo(
    () =>
      Object.values(classesMap).sort((a, b) =>
        a.nameHe.localeCompare(b.nameHe, 'he')
      ),
    [classesMap]
  );

  useEffect(() => {
    if (!teacherId) return;

    let cancelled = false;

    async function refreshClasses() {
      setIsRefreshing(true);
      setError(null);

      try {
        const [rows, nextUsage] = await Promise.all([
          getClassesByTeacherId(teacherId!),
          getTeacherSeatUsage(teacherId!),
        ]);
        if (cancelled) return;

        const teacherClasses = Object.fromEntries(
          rows.map((cls) => [
            cls.id,
            {
              id: cls.id,
              code: cls.code,
              nameHe: cls.name_he,
              createdAt: cls.created_at
                ? new Date(cls.created_at).getTime()
                : Date.now(),
            },
          ])
        );

        useClassStore.setState((state) => ({
          classes: teacherClasses,
          world: Object.fromEntries(
            Object.keys(teacherClasses).map((classId) => [
              classId,
              state.world[classId] ?? {
                classId,
                donatedTotal: 0,
                unlockedMilestones: [],
              },
            ])
          ),
        }));
        setUsage(nextUsage);
      } catch (err) {
        console.error('Failed refreshing teacher classes:', err);
        if (!cancelled) {
          setError('לא הצלחנו לרענן את רשימת הכיתות. נסה/י שוב.');
        }
      } finally {
        if (!cancelled) setIsRefreshing(false);
      }
    }

    void refreshClasses();

    return () => {
      cancelled = true;
    };
  }, [teacherId]);

  function openClass(classId: string) {
    selectTeacherClass(classId);
    navigate('/teacher');
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  async function handleCreateClass() {
    if (!teacherId || creating) return;

    const cleanName = newClassName.trim();
    if (!cleanName) {
      setCreateError('צריך לתת לכיתה שם.');
      return;
    }

    setCreating(true);
    setCreateError(null);

    const result = await createTeacherClass({
      teacherId,
      nameHe: cleanName,
    });

    if (!result.ok) {
      setCreateError(result.message);
      setCreating(false);
      return;
    }

    const cls = result.data;
    useClassStore.setState((state) => ({
      classes: {
        ...state.classes,
        [cls.id]: {
          id: cls.id,
          code: cls.code,
          nameHe: cls.name_he,
          createdAt: cls.created_at
            ? new Date(cls.created_at).getTime()
            : Date.now(),
        },
      },
      world: {
        ...state.world,
        [cls.id]: state.world[cls.id] ?? {
          classId: cls.id,
          donatedTotal: 0,
          unlockedMilestones: [],
        },
      },
    }));

    setCreating(false);
    setCreateOpen(false);
    setNewClassName('');
    selectTeacherClass(cls.id);
    navigate('/teacher');
  }

  const usageLabel = usage.studentLimit === null
    ? `${usage.activeCount} תלמידים פעילים · ללא מכסה כרגע`
    : `${usage.activeCount} מתוך ${usage.studentLimit} תלמידים פעילים`;

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-sm text-magic-soft/70">חשבון מורה</p>
            <h1 className="text-3xl font-black text-magic-accent">
              {teacherName ? `שלום ${teacherName}` : 'הכיתות שלי'}
            </h1>
            <p className="mt-2 text-magic-soft">בחר/י כיתה כדי להיכנס ללוח המורה שלה.</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-magic-soft/60 transition-colors hover:text-magic-soft"
          >
            יציאה
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-400/40 bg-red-500/15 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="rounded-3xl border border-magic-soft/15 bg-magic-panel/80 p-6 shadow-xl">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-white">🏫 הכיתות שלי</h2>
              <p className="mt-1 text-sm text-magic-soft/70">
                {classes.length} {classes.length === 1 ? 'כיתה' : 'כיתות'} · {usageLabel}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isRefreshing && (
                <span className="text-xs text-magic-soft/60">מרענן...</span>
              )}
              <button
                type="button"
                onClick={() => {
                  setCreateError(null);
                  setCreateOpen(true);
                }}
                className="rounded-xl bg-magic-accent px-4 py-2.5 text-sm font-black text-magic-bg transition-transform hover:scale-105"
              >
                + כיתה חדשה
              </button>
            </div>
          </div>

          {usage.studentLimit !== null && (
            <div className="mb-5 rounded-2xl border border-white/10 bg-magic-bg/35 p-3">
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-magic-soft/70">
                <span>מכסת תלמידים</span>
                <span>{usage.remaining ?? 0} מקומות פנויים</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/25">
                <div
                  className="h-full rounded-full bg-magic-accent transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      usage.studentLimit > 0
                        ? (usage.activeCount / usage.studentLimit) * 100
                        : 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          {classes.length === 0 && !isRefreshing ? (
            <div className="rounded-2xl border border-dashed border-magic-soft/20 bg-magic-bg/40 p-8 text-center">
              <div className="mb-3 text-4xl">🏰</div>
              <div className="font-black text-white">עדיין אין כיתות בחשבון</div>
              <p className="mt-2 text-sm text-magic-soft/65">
                אפשר לפתוח כיתה ראשונה בכמה שניות ולהוסיף אליה רשימת תלמידים בהדבקה אחת.
              </p>
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="mt-5 rounded-xl bg-magic-accent px-5 py-2.5 font-black text-magic-bg"
              >
                + פתיחת כיתה
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => openClass(cls.id)}
                  className="group rounded-2xl border border-magic-soft/15 bg-magic-bg/45 p-5 text-right transition hover:-translate-y-0.5 hover:border-magic-accent/45 hover:bg-magic-bg/65"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-2xl">🏰</span>
                    <span className="text-xs font-bold text-magic-accent opacity-0 transition-opacity group-hover:opacity-100">
                      כניסה ←
                    </span>
                  </div>
                  <div className="text-lg font-black text-white">{cls.nameHe}</div>
                  <div className="mt-1 text-sm text-magic-soft/65">
                    קוד כיתה: {cls.code}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={createOpen}
        onClose={() => {
          if (creating) return;
          setCreateOpen(false);
          setCreateError(null);
        }}
        title="פתיחת כיתה חדשה"
      >
        <div className="text-right">
          <p className="mb-4 text-sm leading-6 text-magic-soft/65">
            צריך רק שם. קוד הכיתה ייווצר אוטומטית והכיתה תשויך מיד לחשבון המורה שלך.
          </p>

          <label className="mb-1 block text-xs font-bold text-magic-soft">
            שם הכיתה
          </label>
          <input
            value={newClassName}
            onChange={(event) => {
              setNewClassName(event.target.value);
              setCreateError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void handleCreateClass();
            }}
            autoFocus
            placeholder="לדוגמה: כיתה ז׳ מחוננים"
            className="w-full rounded-xl border border-white/15 bg-magic-bg/70 px-3 py-3 text-white outline-none placeholder:text-magic-soft/35 focus:border-magic-accent/60"
          />

          {createError && (
            <div className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-200">
              {createError}
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={creating}
              onClick={() => setCreateOpen(false)}
              className="rounded-xl bg-magic-bg/60 py-3 font-bold text-magic-soft disabled:opacity-40"
            >
              ביטול
            </button>
            <button
              type="button"
              disabled={creating || !newClassName.trim()}
              onClick={() => void handleCreateClass()}
              className="rounded-xl bg-magic-accent py-3 font-black text-magic-bg disabled:cursor-not-allowed disabled:opacity-40"
            >
              {creating ? 'פותח...' : 'פתח/י כיתה'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
