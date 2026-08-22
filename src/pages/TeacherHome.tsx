import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../store/useSessionStore';
import { useClassStore } from '../store/useClassStore';
import { useGameStore } from '../store/useGameStore';
import AwardModal from '../components/teacher/AwardModal';
import ActivityLog from '../components/teacher/ActivityLog';
import TrophyAwardModal from '../components/teacher/TrophyAwardModal';
import TrophyManagementModal from '../components/teacher/TrophyManagementModal';
import CompanionProgressBoard from '../components/teacher/CompanionProgressBoard';
import FlourishAwardModal from '../components/teacher/FlourishAwardModal';
import MissionBoard from '../components/teacher/MissionBoard';
import MissionCreateModal from '../components/teacher/MissionCreateModal';
import ClassGoalBoard from '../components/teacher/ClassGoalBoard';
import ClassGoalCreateModal from '../components/teacher/ClassGoalCreateModal';

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

    const intervalId = window.setInterval(() => {
      void loadStudentsFromSupabase(currentClassId);
    }, 10000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [currentClassId, loadStudentsFromSupabase]);
  const students = useMemo(
    () => Object.values(allStudents).filter(st => st.classId === currentClassId),
    [allStudents, currentClassId]
  );

  const [awardOpen, setAwardOpen] = useState(false);
  const [preselected, setPreselected] = useState<string | null>(null);
  const [trophyStudentId, setTrophyStudentId] = useState<string | null>(null);
  const [managedTrophyStudentId, setManagedTrophyStudentId] = useState<string | null>(null);
  const [flourishStudentId, setFlourishStudentId] = useState<string | null>(null);
  const [missionCreateOpen, setMissionCreateOpen] = useState(false);
  const [classGoalCreateOpen, setClassGoalCreateOpen] = useState(false);

  const trophyStudent = trophyStudentId
    ? students.find(student => student.id === trophyStudentId) ?? null
    : null;

  const managedTrophyStudent = managedTrophyStudentId
    ? students.find(student => student.id === managedTrophyStudentId) ?? null
    : null;

  const flourishStudent = flourishStudentId
    ? students.find(student => student.id === flourishStudentId) ?? null
    : null;

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

        <ClassGoalBoard
          classId={cls.id}
          students={students}
          onCreateGoal={() => setClassGoalCreateOpen(true)}
        />

        <MissionBoard
          students={students}
          onCreateMission={() => setMissionCreateOpen(true)}
        />

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
                  className="flex flex-col gap-3 bg-magic-bg/40 rounded-xl p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col text-right">
                    <span className="text-white font-bold">{st.name}</span>
                    <span className="text-magic-soft text-xs">
                      {st.points} נק׳ · רמה {st.level} · {st.xp} XP · {st.trophies.length} גביעים · {(st.missions ?? []).filter(mission => mission.completedAt === null && mission.cancelledAt === null).length} משימות
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:flex">
                    <button
                      type="button"
                      onClick={() => setFlourishStudentId(st.id)}
                      className="rounded-lg border border-fuchsia-300/35 bg-fuchsia-500/10 px-3 py-2 text-xs font-bold text-fuchsia-200 transition-colors hover:bg-fuchsia-500/20 sm:text-sm"
                    >
                      🐾 אות חיה
                    </button>
                    <button
                      type="button"
                      onClick={() => setTrophyStudentId(st.id)}
                      className="rounded-lg border border-yellow-300/35 bg-yellow-400/10 px-3 py-2 text-xs font-bold text-yellow-200 transition-colors hover:bg-yellow-400/20 sm:text-sm"
                    >
                      🏆 גביע חדש
                    </button>
                    <button
                      type="button"
                      onClick={() => setManagedTrophyStudentId(st.id)}
                      disabled={st.trophies.length === 0}
                      className="rounded-lg border border-white/15 bg-magic-bg/45 px-3 py-2 text-xs font-bold text-magic-soft transition-colors hover:bg-magic-bg/70 disabled:cursor-not-allowed disabled:opacity-35 sm:text-sm"
                    >
                      📜 גביעים ({st.trophies.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => openAwardFor(st.id)}
                      className="bg-magic-accent text-magic-bg text-xs sm:text-sm font-bold py-2 px-3 rounded-lg hover:scale-105 transition-transform"
                    >
                      +נקודות
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <CompanionProgressBoard students={students} />

        {/* Activity log */}
        <div className="bg-magic-panel/80 rounded-3xl p-6">
          <h2 className="text-magic-accent font-bold mb-3">יומן פעילות</h2>
          <ActivityLog classId={cls.id} />
        </div>
      </div>

      <ClassGoalCreateModal
        open={classGoalCreateOpen}
        onClose={() => setClassGoalCreateOpen(false)}
        classId={cls.id}
        studentCount={students.length}
      />

      <MissionCreateModal
        open={missionCreateOpen}
        onClose={() => setMissionCreateOpen(false)}
        students={students}
      />

      <AwardModal
        open={awardOpen}
        onClose={() => setAwardOpen(false)}
        classId={cls.id}
        students={students}
        preselectedStudentId={preselected}
      />

      <TrophyAwardModal
        open={trophyStudentId !== null}
        onClose={() => setTrophyStudentId(null)}
        student={trophyStudent}
      />

      <TrophyManagementModal
        open={managedTrophyStudentId !== null}
        onClose={() => setManagedTrophyStudentId(null)}
        student={managedTrophyStudent}
      />

      <FlourishAwardModal
        open={flourishStudentId !== null}
        onClose={() => setFlourishStudentId(null)}
        classId={cls.id}
        student={flourishStudent}
      />
    </div>
  );
}
