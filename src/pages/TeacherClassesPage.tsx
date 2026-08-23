import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClassesByTeacherId } from '../lib/supabaseTeachers';
import { useClassStore } from '../store/useClassStore';
import { useSessionStore } from '../store/useSessionStore';

export default function TeacherClassesPage() {
  const navigate = useNavigate();
  const teacherId = useSessionStore((s) => s.currentTeacherId);
  const teacherName = useSessionStore((s) => s.currentTeacherName);
  const selectTeacherClass = useSessionStore((s) => s.selectTeacherClass);
  const logout = useSessionStore((s) => s.logout);
  const classesMap = useClassStore((s) => s.classes);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        const rows = await getClassesByTeacherId(teacherId!);
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
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-white">🏫 הכיתות שלי</h2>
              <p className="mt-1 text-sm text-magic-soft/70">
                {classes.length} {classes.length === 1 ? 'כיתה' : 'כיתות'}
              </p>
            </div>
            {isRefreshing && (
              <span className="text-xs text-magic-soft/60">מרענן...</span>
            )}
          </div>

          {classes.length === 0 && !isRefreshing ? (
            <div className="rounded-2xl bg-magic-bg/40 p-6 text-center text-magic-soft/70">
              עדיין לא נמצאו כיתות שמשויכות לחשבון הזה.
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
    </div>
  );
}
