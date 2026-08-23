import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClassStore } from '../store/useClassStore';
import { useGameStore, type StudentState } from '../store/useGameStore';
import { useSessionStore } from '../store/useSessionStore';
import { getStudentByLoginName } from '../lib/supabaseStudents';
import { getTeacherByCredentials, getClassesByTeacherId } from '../lib/supabaseTeachers';
import { DEFAULT_UNLOCKED_THEMES } from '../data/themes';
import { normalizeCompanionBehaviorMemories } from '../data/companionTraits';
import { normalizeCompanionTraitChallenges } from '../data/companionTraitChallenges';
import { normalizeCompanionJournalEntries } from '../data/companionJournal';
import { normalizeStudentMissions } from '../data/missions';
import { normalizeStudentClassGoals } from '../data/classGoals';
import { normalizeClassKingdomClaimedRewards } from '../data/classKingdom';
import { normalizeAchievementRecords, normalizeSpecialUnlocks } from '../data/achievements';
import { normalizeJourneyRecords } from '../data/specialJourneys';

type Mode = 'choose' | 'student' | 'teacher';

function buildStudentFromSupabase(row: any): StudentState {
  const meta = row.meta ?? {};
  const specialUnlocks = normalizeSpecialUnlocks(meta.specialUnlocks);
  const requestedActiveTitleId =
    typeof meta.activeTitleUnlockId === 'string' && meta.activeTitleUnlockId.trim()
      ? meta.activeTitleUnlockId.trim()
      : null;
  const activeTitleUnlockId =
    requestedActiveTitleId &&
    specialUnlocks.some(
      unlock => unlock.kind === 'title' && unlock.unlockId === requestedActiveTitleId
    )
      ? requestedActiveTitleId
      : null;

  return {
    id: row.id,
    supabaseId: row.id,
    loginName: row.login_name,

    name: row.name ?? row.login_name,
    classId: row.class_id,
    gender: row.gender === 'male' || row.gender === 'female' ? row.gender : null,

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

    companion: {
      unlocked: false,
      theme: null,
      stage: 'egg',
      bond: 0,
      lastCareDate: null,
      careXpToday: 0,
      ...(meta.companion ?? {}),
      name:
        typeof meta.companion?.name === 'string' && meta.companion.name.trim()
          ? meta.companion.name.trim()
          : null,
      petPoints:
        typeof meta.companion?.petPoints === 'number'
          ? Math.max(0, meta.companion.petPoints)
          : 0,
      celebratedStages: Array.isArray(meta.companion?.celebratedStages)
        ? meta.companion.celebratedStages
        : ['egg'],
      activeFlourishes: Array.isArray(meta.companion?.activeFlourishes)
        ? meta.companion.activeFlourishes
        : [],
      ownedFlourishes: Array.isArray(meta.companion?.ownedFlourishes)
        ? meta.companion.ownedFlourishes
        : [],
      unlockedSkills: Array.isArray(meta.companion?.unlockedSkills)
        ? meta.companion.unlockedSkills
        : [],
      treasuresFound:
        typeof meta.companion?.treasuresFound === 'number'
          ? Math.max(0, Math.floor(meta.companion.treasuresFound))
          : 0,
      behaviorMemories: normalizeCompanionBehaviorMemories(
        meta.companion?.behaviorMemories
      ),
      traitChallenges: normalizeCompanionTraitChallenges(
        meta.companion?.traitChallenges
      ),
      journalEntries: normalizeCompanionJournalEntries(
        meta.companion?.journalEntries
      ),
    },

    missions: normalizeStudentMissions(meta.missions),
    classGoals: normalizeStudentClassGoals(meta.classGoals),
    claimedClassKingdomRewards: normalizeClassKingdomClaimedRewards(
      meta.claimedClassKingdomRewards
    ),
    achievementRecords: normalizeAchievementRecords(meta.achievementRecords),
    journeyRecords: normalizeJourneyRecords(meta.journeyRecords),
    specialUnlocks,
    activeTitleUnlockId,

    pastRewards: Array.isArray(meta.pastRewards) ? meta.pastRewards : [],
    trophies: Array.isArray(meta.trophies) ? meta.trophies : [],
    seenTrophyIds: Array.isArray(meta.seenTrophyIds) ? meta.seenTrophyIds : [],
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

  const [teacherLoginName, setTeacherLoginName] = useState('');
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
      const cleanTeacherLoginName = teacherLoginName.trim().toLowerCase();
      const cleanTeacherLoginCode = teacherLoginCode.trim();

      if (!cleanTeacherLoginName) {
        setError('צריך להקליד שם משתמש למורה');
        return;
      }

      if (!cleanTeacherLoginCode) {
        setError('צריך להקליד קוד מורה');
        return;
      }

      const teacher = await getTeacherByCredentials(
        cleanTeacherLoginName,
        cleanTeacherLoginCode
      );

      if (!teacher) {
        setError('שם המשתמש או קוד המורה לא נכונים');
        return;
      }

      const classes = await getClassesByTeacherId(teacher.id);

      const teacherClasses = Object.fromEntries(
        classes.map((cls) => [
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

      loginTeacher(teacher.id, teacher.name_he || teacher.login_name);
      navigate('/teacher/classes');
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
              כניסה אחת לכל הכיתות שלך
            </p>

            <label className="text-magic-soft text-sm">שם משתמש למורה</label>
            <input
              type="text"
              value={teacherLoginName}
              onChange={(e) => setTeacherLoginName(e.target.value)}
              placeholder="שם המשתמש שלך"
              autoComplete="username"
              className="bg-magic-bg/60 border border-magic-soft/30 rounded-xl p-3 text-white placeholder-magic-soft/40"
            />

            <label className="text-magic-soft text-sm">קוד מורה</label>
            <input
              type="password"
              value={teacherLoginCode}
              onChange={(e) => setTeacherLoginCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) void handleTeacherLogin();
              }}
              placeholder="קוד המורה"
              autoComplete="current-password"
              className="bg-magic-bg/60 border border-magic-soft/30 rounded-xl p-3 text-white placeholder-magic-soft/40"
            />

            <button
              onClick={handleTeacherLogin}
              disabled={isLoading}
              className="bg-magic-accent text-magic-bg font-bold py-3 px-6 rounded-2xl hover:scale-105 transition-transform mt-2 disabled:opacity-60 disabled:hover:scale-100"
            >
              {isLoading ? 'בודק...' : 'כניסה לחשבון המורה'}
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
