import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClassStore } from '../store/useClassStore';
import { useGameStore, type StudentState } from '../store/useGameStore';
import { useSessionStore } from '../store/useSessionStore';
import { getStudentByLoginName } from '../lib/supabaseStudents';
import { getClassByCodeAndTeacherCode } from '../lib/supabaseClasses';
import { DEFAULT_UNLOCKED_THEMES } from '../data/themes';

type Mode = 'choose' | 'student' | 'teacher';

function buildStudentFromSupabase(row: any): StudentState {
  const meta = row.meta ?? {};

  return {
    id: row.id,
    supabaseId: row.id,
    loginName: row.login_name,

    name: row.name ?? row.login_name,
    classId: row.class_id,

    points: row.points ?? 0,
    xp: row.xp ?? 0,
    level: row.level ?? 1,

    inventory: Array.isArray(row.inventory) ? row.inventory : [],

    unlockedThemes: Array.isArray(meta.unlockedThemes)
      ? meta.unlockedThemes
      : [...DEFAULT_UNLOCKED_THEMES],

    capacities: {
      inventory: meta.capacities?.inventory ?? 1000,
      displayShelf: meta.capacities?.displayShelf ?? 1000,
      wallSlots: meta.capacities?.wallSlots ?? 1000,
      desk: meta.capacities?.desk ?? 1000,
      petArea: meta.capacities?.petArea ?? 1000,
    },

    companion: meta.companion ?? {
      unlocked: false,
      theme: null,
      stage: 'egg',
      bond: 0,
      lastCareDate: null,
      careXpToday: 0,
      activeFlourishes: [],
      ownedFlourishes: [],
    },

    pastRewards: Array.isArray(meta.pastRewards) ? meta.pastRewards : [],
    trophies: Array.isArray(meta.trophies) ? meta.trophies : [],
    pityCounters: meta.pityCounters ?? {},

    pendingLevelUps: meta.pendingLevelUps ?? 0,
    pendingThemeUnlocks: meta.pendingThemeUnlocks ?? 0,
  };
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('choose');

  const [studentLoginName, setStudentLoginName] = useState('');
  const [studentLoginCode, setStudentLoginCode] = useState('');

  const [teacherClassCode, setTeacherClassCode] = useState('');
  const [teacherLoginCode, setTeacherLoginCode] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loginStudent = useSessionStore((s) => s.loginStudent);
  const loginTeacher = useSessionStore((s) => s.loginTeacher);

  async function handleStudentLogin() {
    setError(null);
    setIsLoading(true);

    try {
      const cleanLoginName = studentLoginName.trim().toLowerCase();
      const cleanLoginCode = studentLoginCode.trim();

      if (!cleanLoginName) {
        setError('צריך להקליד שם משתמש');
        return;
      }

      if (!cleanLoginCode) {
        setError('צריך להקליד קוד אישי');
        return;
      }

      const supabaseStudent = await getStudentByLoginName(cleanLoginName);

      if (!supabaseStudent) {
        setError('המשתמש לא קיים. פנה למורה כדי שיוסיף אותך למערכת.');
        return;
      }

      if (String(supabaseStudent.login_code ?? '').trim() !== cleanLoginCode) {
        setError('הקוד האישי לא נכון');
        return;
      }

      if (!supabaseStudent.class_id) {
        setError('לתלמיד הזה לא משויכת כיתה. צריך לבדוק את Supabase.');
        return;
      }

      const student = buildStudentFromSupabase(supabaseStudent);

      useGameStore.setState((state) => ({
        students: {
          ...state.students,
          [student.id]: student,
        },
      }));

      loginStudent(student.id, supabaseStudent.class_id);
      navigate('/student');
    } catch (err) {
      console.error('Student login failed:', err);
      setError('הייתה שגיאה בכניסת תלמיד. בדוק את Supabase או את הקונסול.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTeacherLogin() {
    setError(null);
    setIsLoading(true);

    try {
      const cleanTeacherClassCode = teacherClassCode.trim();
      const cleanTeacherLoginCode = teacherLoginCode.trim();

      if (!cleanTeacherClassCode) {
        setError('צריך להקליד קוד כיתה');
        return;
      }

      if (!cleanTeacherLoginCode) {
        setError('צריך להקליד קוד מורה');
        return;
      }

      const cls = await getClassByCodeAndTeacherCode(
        cleanTeacherClassCode,
        cleanTeacherLoginCode
      );

      if (!cls) {
        setError('קוד הכיתה או קוד המורה לא נכונים');
        return;
      }

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

      loginTeacher(cls.id);
      navigate('/teacher');
    } catch (err) {
      console.error('Teacher login failed:', err);
      setError('הייתה שגיאה בכניסת מורה. בדוק את Supabase או את הקונסול.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-magic-panel/80 backdrop-blur rounded-3xl shadow-2xl p-10 max-w-xl w-full text-center border border-magic-soft/20">
        <div className="text-6xl mb-4">✨</div>

        <h1 className="text-4xl font-black text-magic-accent mb-3">
          ממלכת הלמידה
        </h1>

        <p className="text-magic-soft text-lg mb-8">
          המשחק האישי שלך לכיתה הקסומה
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-400 text-red-200 rounded-xl p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {mode === 'choose' && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setMode('student');
                setError(null);
              }}
              className="bg-magic-accent text-magic-bg font-bold py-3 px-6 rounded-2xl hover:scale-105 transition-transform"
            >
              כניסת תלמיד/ה
            </button>

            <button
              onClick={() => {
                setMode('teacher');
                setError(null);
              }}
              className="bg-magic-panel border-2 border-magic-soft/40 text-magic-soft font-bold py-3 px-6 rounded-2xl hover:bg-magic-soft/10 transition-colors"
            >
              כניסת מורה
            </button>
          </div>
        )}

        {mode === 'student' && (
          <div className="flex flex-col gap-3 text-right">
            <label className="text-magic-soft text-sm">שם משתמש</label>
            <input
              type="text"
              value={studentLoginName}
              onChange={(e) => setStudentLoginName(e.target.value)}
              placeholder="לדוגמה: yoni"
              className="bg-magic-bg/60 border border-magic-soft/30 rounded-xl p-3 text-white placeholder-magic-soft/40"
            />

            <label className="text-magic-soft text-sm">קוד אישי</label>
            <input
              type="password"
              value={studentLoginCode}
              onChange={(e) => setStudentLoginCode(e.target.value)}
              placeholder="הקוד האישי שלי"
              className="bg-magic-bg/60 border border-magic-soft/30 rounded-xl p-3 text-white placeholder-magic-soft/40"
            />

            <button
              onClick={handleStudentLogin}
              disabled={isLoading}
              className="bg-magic-accent text-magic-bg font-bold py-3 px-6 rounded-2xl hover:scale-105 transition-transform mt-2 disabled:opacity-60 disabled:hover:scale-100"
            >
              {isLoading ? 'בודק...' : 'כניסה'}
            </button>

            <button
              onClick={() => {
                setMode('choose');
                setError(null);
              }}
              className="text-magic-soft/60 text-sm mt-1 hover:text-magic-soft"
            >
              חזרה
            </button>
          </div>
        )}

        {mode === 'teacher' && (
          <div className="flex flex-col gap-3 text-right">
            <p className="text-magic-soft/70 text-sm text-center mb-1">
              הקלד/י קוד כיתה וקוד מורה
            </p>

            <label className="text-magic-soft text-sm">קוד כיתה</label>
            <input
              type="text"
              value={teacherClassCode}
              onChange={(e) => setTeacherClassCode(e.target.value)}
              placeholder="לדוגמה: gimel1"
              className="bg-magic-bg/60 border border-magic-soft/30 rounded-xl p-3 text-white placeholder-magic-soft/40"
            />

            <label className="text-magic-soft text-sm">קוד מורה</label>
            <input
              type="password"
              value={teacherLoginCode}
              onChange={(e) => setTeacherLoginCode(e.target.value)}
              placeholder="קוד המורה"
              className="bg-magic-bg/60 border border-magic-soft/30 rounded-xl p-3 text-white placeholder-magic-soft/40"
            />

            <button
              onClick={handleTeacherLogin}
              disabled={isLoading}
              className="bg-magic-accent text-magic-bg font-bold py-3 px-6 rounded-2xl hover:scale-105 transition-transform mt-2 disabled:opacity-60 disabled:hover:scale-100"
            >
              {isLoading ? 'בודק...' : 'כניסה למורה'}
            </button>

            <button
              onClick={() => {
                setMode('choose');
                setError(null);
              }}
              className="text-magic-soft/60 text-sm mt-1 hover:text-magic-soft"
            >
              חזרה
            </button>
          </div>
        )}

        <div className="mt-8 text-sm text-magic-soft/60">
          גרסת פיתוח · MVP
        </div>
      </div>
    </div>
  );
}