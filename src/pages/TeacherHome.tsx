import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../store/useSessionStore';
import { useClassStore } from '../store/useClassStore';
import { useGameStore } from '../store/useGameStore';
import AwardModal from '../components/teacher/AwardModal';
import ActivityLog from '../components/teacher/ActivityLog';

export default function TeacherHome() {
  const navigate = useNavigate();
  const currentClassId = useSessionStore(s => s.currentClassId);
  const logout = useSessionStore(s => s.logout);

  const cls = useClassStore(s =>
    currentClassId ? s.classes[currentClassId] : undefined
  );

  // IMPORTANT: select the raw map, derive the array in useMemo.
  // (Returning a fresh filtered array from a selector causes re-render loops.)
  const allStudents = useGameStore(s => s.students);
  const loadStudentsFromSupabase = useGameStore(s => s.loadStudentsFromSupabase);

  useEffect(() => {
    if (!currentClassId) return;
    void loadStudentsFromSupabase(currentClassId);
  }, [currentClassId, loadStudentsFromSupabase]);
  const students = useMemo(
    () => Object.values(allStudents).filter(st => st.classId === currentClassId),
    [allStudents, currentClassId]
  );

  const [awardOpen, setAwardOpen] = useState(false);
  const [preselected, setPreselected] = useState<string | null>(null);

  if (!cls) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-magic-panel/80 rounded-3xl p-8 text-center">
          <p className="text-magic-soft mb-4">לא מחובר/ת</p>
          <button
            onClick={() => navigate('/')}
            className="bg-magic-accent text-magic-bg font-bold py-2 px-4 rounded-xl"
          >
            חזרה למסך הכניסה
          </button>
        </div>
      </div>
    );
  }

  function openAwardFor(studentId: string | null) {
    setPreselected(studentId);
    setAwardOpen(true);
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black text-magic-accent">{cls.nameHe}</h1>
            <p className="text-magic-soft text-sm">
  ברוכים הבאים לממלכת הלמידה
</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="text-magic-soft/60 text-sm hover:text-magic-soft"
          >
            יציאה
          </button>
        </div>

        {/* Quick group award */}
        <div className="bg-magic-panel/80 rounded-3xl p-5 mb-4 flex justify-between items-center">
          <div>
            <div className="text-magic-accent font-bold">מתן נקודות מהיר</div>
            <div className="text-magic-soft/70 text-sm">
              בחר/י תלמיד/ה או את כל הכיתה
            </div>
          </div>
          <button
            onClick={() => openAwardFor(null)}
            disabled={students.length === 0}
            className="bg-magic-accent text-magic-bg font-bold py-2 px-5 rounded-xl hover:scale-105 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ✨ תן/י נקודות
          </button>
        </div>

        {/* Student list */}
        <div className="bg-magic-panel/80 rounded-3xl p-6 mb-4">
          <h2 className="text-magic-accent font-bold mb-3">
            תלמידים ({students.length})
          </h2>
          {students.length === 0 ? (
            <p className="text-magic-soft/70 text-sm">
              עדיין אין תלמידים. הם ייכנסו עם קוד הכיתה:{' '}
              <span className="font-bold text-magic-accent">{cls.code}</span>
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {students.map(st => (
                <li
                  key={st.id}
                  className="flex justify-between items-center bg-magic-bg/40 rounded-xl p-3"
                >
                  <div className="flex flex-col text-right">
                    <span className="text-white font-bold">{st.name}</span>
                    <span className="text-magic-soft text-xs">
                      {st.points} נק׳ · רמה {st.level} · {st.xp} XP
                    </span>
                  </div>
                  <button
                    onClick={() => openAwardFor(st.id)}
                    className="bg-magic-accent text-magic-bg text-sm font-bold py-2 px-3 rounded-lg hover:scale-105 transition-transform"
                  >
                    +נקודות
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Activity log */}
        <div className="bg-magic-panel/80 rounded-3xl p-6">
          <h2 className="text-magic-accent font-bold mb-3">יומן פעילות</h2>
          <ActivityLog classId={cls.id} />
        </div>
      </div>

      <AwardModal
        open={awardOpen}
        onClose={() => setAwardOpen(false)}
        classId={cls.id}
        students={students}
        preselectedStudentId={preselected}
      />
    </div>
  );
}
