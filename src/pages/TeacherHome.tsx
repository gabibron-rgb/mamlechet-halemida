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
import ClassKingdomSummary from '../components/teacher/ClassKingdomSummary';
import ClassKingdomManagerModal from '../components/teacher/ClassKingdomManagerModal';
import StudentManagementModal from '../components/teacher/StudentManagementModal';
import ClassRosterManagerModal from '../components/teacher/ClassRosterManagerModal';

type TeacherView = 'lesson' | 'management';

export default function TeacherHome() {
  const navigate = useNavigate();
  const currentClassId = useSessionStore(s => s.currentClassId);
  const currentTeacherId = useSessionStore(s => s.currentTeacherId);
  const selectTeacherClass = useSessionStore(s => s.selectTeacherClass);
  const logout = useSessionStore(s => s.logout);

  const cls = useClassStore(s =>
    currentClassId ? s.classes[currentClassId] : undefined
  );
  const classesMap = useClassStore(s => s.classes);
  const teacherClasses = useMemo(
    () => Object.values(classesMap),
    [classesMap]
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

  const [teacherView, setTeacherView] = useState<TeacherView>('lesson');
  const [awardOpen, setAwardOpen] = useState(false);
  const [preselected, setPreselected] = useState<string | null>(null);
  const [trophyStudentId, setTrophyStudentId] = useState<string | null>(null);
  const [managedTrophyStudentId, setManagedTrophyStudentId] = useState<string | null>(null);
  const [flourishStudentId, setFlourishStudentId] = useState<string | null>(null);
  const [managedStudentId, setManagedStudentId] = useState<string | null>(null);
  const [transferFeedback, setTransferFeedback] = useState<string | null>(null);
  const [missionCreateOpen, setMissionCreateOpen] = useState(false);
  const [classGoalCreateOpen, setClassGoalCreateOpen] = useState(false);
  const [classKingdomManagerOpen, setClassKingdomManagerOpen] = useState(false);
  const [rosterManagerOpen, setRosterManagerOpen] = useState(false);

  const trophyStudent = trophyStudentId
    ? students.find(student => student.id === trophyStudentId) ?? null
    : null;

  const managedTrophyStudent = managedTrophyStudentId
    ? students.find(student => student.id === managedTrophyStudentId) ?? null
    : null;

  const flourishStudent = flourishStudentId
    ? students.find(student => student.id === flourishStudentId) ?? null
    : null;

  const managedStudent = managedStudentId
    ? students.find(student => student.id === managedStudentId) ?? null
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

  async function handleStudentTransferred(
    studentName: string,
    targetClass: { id: string; nameHe: string }
  ) {
    setManagedStudentId(null);
    setTransferFeedback(`${studentName} הועבר/ה בהצלחה ל${targetClass.nameHe}.`);

    if (currentClassId) {
      await loadStudentsFromSupabase(currentClassId);
    }
  }

  async function refreshCurrentStudents() {
    if (!currentClassId) return;
    await loadStudentsFromSupabase(currentClassId);
  }

  async function handleStudentArchived(studentName: string) {
    setManagedStudentId(null);
    setTransferFeedback(`${studentName} הועבר/ה לארכיון. ההתקדמות נשמרה.`);
    await refreshCurrentStudents();
  }

  async function handleInventoryRestored(studentName: string) {
    setTransferFeedback(`החפץ של ${studentName} שוחזר בהצלחה.`);
    await refreshCurrentStudents();
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-magic-accent">{cls.nameHe}</h1>
            <p className="text-magic-soft text-sm">ממלכת הלמידה — מסך מורה</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                selectTeacherClass(null);
                navigate('/teacher/classes');
              }}
              className="rounded-xl border border-magic-soft/20 px-3 py-2 text-sm font-bold text-magic-soft transition-colors hover:bg-magic-soft/10"
            >
              🏫 הכיתות שלי
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="text-magic-soft/60 text-sm hover:text-magic-soft"
            >
              יציאה
            </button>
          </div>
        </div>

        {/* Teacher mode switch */}
        <div className="mb-5 grid grid-cols-2 gap-2 rounded-3xl border border-white/10 bg-magic-panel/55 p-2">
          <button
            type="button"
            onClick={() => setTeacherView('lesson')}
            className={`rounded-2xl px-4 py-3 text-right transition-colors ${
              teacherView === 'lesson'
                ? 'bg-magic-accent text-magic-bg'
                : 'text-magic-soft hover:bg-white/5'
            }`}
          >
            <div className="font-black">⚡ בזמן שיעור</div>
            <div
              className={`mt-1 text-xs ${
                teacherView === 'lesson'
                  ? 'text-magic-bg/70'
                  : 'text-magic-soft/55'
              }`}
            >
              הכרה מהירה בלי להעמיס על השיעור
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTeacherView('management')}
            className={`rounded-2xl px-4 py-3 text-right transition-colors ${
              teacherView === 'management'
                ? 'bg-magic-accent text-magic-bg'
                : 'text-magic-soft hover:bg-white/5'
            }`}
          >
            <div className="font-black">⚙️ ניהול ותכנון</div>
            <div
              className={`mt-1 text-xs ${
                teacherView === 'management'
                  ? 'text-magic-bg/70'
                  : 'text-magic-soft/55'
              }`}
            >
              משימות, יעדים, ממלכה וניהול תלמידים
            </div>
          </button>
        </div>

        {transferFeedback && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-100">
            <span>✓ {transferFeedback}</span>
            <button
              type="button"
              onClick={() => setTransferFeedback(null)}
              className="text-emerald-100/60 hover:text-emerald-100"
              aria-label="סגירת הודעת ההעברה"
            >
              ×
            </button>
          </div>
        )}

        {teacherView === 'lesson' ? (
          <>
            {/* Quick group award */}
            <div className="mb-4 flex flex-col gap-4 rounded-3xl border border-magic-accent/25 bg-magic-panel/80 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-lg font-black text-magic-accent">
                  ✨ מתן נקודות מהיר
                </div>
                <div className="mt-1 text-sm text-magic-soft/70">
                  לתלמיד/ה, לקבוצה או לכל הכיתה
                </div>
              </div>
              <button
                onClick={() => openAwardFor(null)}
                disabled={students.length === 0}
                className="rounded-xl bg-magic-accent px-6 py-3 font-black text-magic-bg transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
              >
                תן/י נקודות
              </button>
            </div>

            {/* Student quick recognition list */}
            <div className="mb-4 rounded-3xl bg-magic-panel/80 p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-black text-magic-accent">
                    הכרה מהירה בכיתה
                  </h2>
                  <p className="mt-1 text-xs text-magic-soft/55">
                    שלוש הפעולות המרכזיות זמינות ישירות ליד כל תלמיד/ה
                  </p>
                </div>
                <div className="rounded-full bg-magic-bg/50 px-3 py-1 text-xs font-bold text-magic-soft/70">
                  {students.length} תלמידים
                </div>
              </div>

              {students.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-magic-bg/30 p-5 text-center">
                  <p className="text-sm text-magic-soft/70">
                    עדיין אין תלמידים בכיתה.
                  </p>
                  <button
                    type="button"
                    onClick={() => setTeacherView('management')}
                    className="mt-3 rounded-xl bg-magic-accent px-4 py-2 text-sm font-black text-magic-bg"
                  >
                    לעבור לניהול כיתה
                  </button>
                </div>
              ) : (
                <ul className="flex flex-col gap-2">
                  {students.map(st => (
                    <li
                      key={st.id}
                      className="flex flex-col gap-3 rounded-2xl bg-magic-bg/40 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 text-right">
                        <div className="font-bold text-white">{st.name}</div>
                        <div className="mt-0.5 text-xs text-magic-soft/60">
                          {st.points} נק׳ · רמה {st.level}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => openAwardFor(st.id)}
                          className="rounded-lg bg-magic-accent px-3 py-2 text-xs font-black text-magic-bg transition-transform hover:scale-[1.02] sm:text-sm"
                        >
                          + נקודות
                        </button>
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
                          🏆 גביע
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-magic-panel/45 px-4 py-3 text-center text-xs text-magic-soft/55">
              צריך משימה, יעד כיתתי, ניהול גביעים או שינוי בפרטי תלמיד?
              {' '}
              <button
                type="button"
                onClick={() => setTeacherView('management')}
                className="font-black text-magic-accent hover:underline"
              >
                מעבר לניהול ותכנון
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Management intro */}
            <div className="mb-4 rounded-3xl border border-white/10 bg-magic-panel/70 p-5">
              <div className="font-black text-white">⚙️ ניהול ותכנון</div>
              <div className="mt-1 text-sm text-magic-soft/65">
                כל הכלים שפחות צריכים להיות מול העיניים בזמן הוראה מרוכזים כאן.
              </div>

              {currentTeacherId && (
                <button
                  type="button"
                  onClick={() => setRosterManagerOpen(true)}
                  className="mt-4 rounded-xl border border-magic-accent/30 bg-magic-accent/10 px-4 py-2 text-sm font-black text-magic-accent transition-colors hover:bg-magic-accent/15"
                >
                  👥 הוספה ופרטי התחברות
                </button>
              )}
            </div>

            <ClassGoalBoard
              classId={cls.id}
              students={students}
              onCreateGoal={() => setClassGoalCreateOpen(true)}
            />

            <ClassKingdomSummary
              students={students}
              onManage={() => setClassKingdomManagerOpen(true)}
            />

            <MissionBoard
              students={students}
              onCreateMission={() => setMissionCreateOpen(true)}
            />

            {/* Student management */}
            <div className="mb-4 rounded-3xl bg-magic-panel/80 p-6">
              <h2 className="mb-1 font-black text-magic-accent">
                ניהול תלמידים
              </h2>
              <p className="mb-4 text-xs text-magic-soft/55">
                פעולות שלא חייבות להיות פתוחות בזמן שיעור
              </p>

              {students.length === 0 ? (
                <p className="text-sm text-magic-soft/70">
                  עדיין אין תלמידים בכיתה.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {students.map(st => (
                    <li
                      key={st.id}
                      className="flex flex-col gap-3 rounded-2xl bg-magic-bg/40 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 text-right">
                        <div className="font-bold text-white">{st.name}</div>
                        <div className="mt-0.5 text-xs text-magic-soft/60">
                          {st.points} נק׳ · רמה {st.level} · {st.xp} XP · {st.trophies.length} גביעים ·{' '}
                          {(st.missions ?? []).filter(
                            mission =>
                              mission.completedAt === null &&
                              mission.cancelledAt === null
                          ).length}{' '}
                          משימות
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:flex">
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
                          onClick={() => setManagedStudentId(st.id)}
                          className="rounded-lg border border-white/10 bg-magic-bg/35 px-3 py-2 text-xs font-black text-magic-soft transition-colors hover:bg-magic-bg/65 sm:text-sm"
                        >
                          ⚙️ פרטים ופעולות
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <CompanionProgressBoard students={students} />

            {/* Activity log */}
            <div className="rounded-3xl bg-magic-panel/80 p-6">
              <h2 className="mb-3 font-bold text-magic-accent">יומן פעילות</h2>
              <ActivityLog classId={cls.id} />
            </div>
          </>
        )}
      </div>

      {currentTeacherId && (
        <ClassKingdomManagerModal
          open={classKingdomManagerOpen}
          onClose={() => setClassKingdomManagerOpen(false)}
          classId={cls.id}
          teacherId={currentTeacherId}
          students={students}
        />
      )}

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

      <StudentManagementModal
        open={managedStudentId !== null}
        onClose={() => setManagedStudentId(null)}
        teacherId={currentTeacherId}
        student={managedStudent}
        currentClass={cls}
        teacherClasses={teacherClasses}
        onTransferred={handleStudentTransferred}
        onArchived={handleStudentArchived}
        onInventoryRestored={handleInventoryRestored}
      />

      {currentTeacherId && (
        <ClassRosterManagerModal
          open={rosterManagerOpen}
          onClose={() => setRosterManagerOpen(false)}
          teacherId={currentTeacherId}
          currentClass={cls}
          onStudentsChanged={refreshCurrentStudents}
        />
      )}

      <FlourishAwardModal
        open={flourishStudentId !== null}
        onClose={() => setFlourishStudentId(null)}
        classId={cls.id}
        student={flourishStudent}
      />
    </div>
  );
}
