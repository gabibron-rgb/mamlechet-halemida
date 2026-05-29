import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClassStore } from '../store/useClassStore';
import { useGameStore } from '../store/useGameStore';
import { useSessionStore } from '../store/useSessionStore';

type Mode = 'choose' | 'student' | 'teacher';

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('choose');

  const [classCode, setClassCode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [teacherClassName, setTeacherClassName] = useState('');
  const [teacherClassCode, setTeacherClassCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const findClassByCode = useClassStore(s => s.findClassByCode);
  const createClass = useClassStore(s => s.createClass);
  const classes = useClassStore(s => s.classes);

  const students = useGameStore(s => s.students);
  const createStudent = useGameStore(s => s.createStudent);

  const loginStudent = useSessionStore(s => s.loginStudent);
  const loginTeacher = useSessionStore(s => s.loginTeacher);

  function handleStudentLogin() {
    setError(null);
    const cls = findClassByCode(classCode);
    if (!cls) {
      setError('קוד כיתה לא נמצא');
      return;
    }
    if (!studentName.trim()) {
      setError('צריך שם');
      return;
    }
    // Find existing student in this class with same name, or create new
    const existing = Object.values(students).find(
      st => st.classId === cls.id && st.name === studentName.trim()
    );
    const studentId = existing
      ? existing.id
      : createStudent(studentName.trim(), cls.id);
    loginStudent(studentId, cls.id);
    navigate('/student');
  }

  function handleTeacherLogin() {
    setError(null);
    // If code already exists, log in to that class. Otherwise create.
    let cls = findClassByCode(teacherClassCode);
    if (!cls) {
      if (!teacherClassName.trim() || !teacherClassCode.trim()) {
        setError('צריך שם כיתה וקוד כיתה');
        return;
      }
      const id = createClass(teacherClassName.trim(), teacherClassCode.trim());
      cls = { id, code: teacherClassCode.trim(), nameHe: teacherClassName.trim(), createdAt: Date.now() };
    }
    loginTeacher(cls.id);
    navigate('/teacher');
  }

  const classCount = Object.keys(classes).length;

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
              onClick={() => setMode('student')}
              className="bg-magic-accent text-magic-bg font-bold py-3 px-6 rounded-2xl hover:scale-105 transition-transform"
            >
              כניסת תלמיד/ה
            </button>
            <button
              onClick={() => setMode('teacher')}
              className="bg-magic-panel border-2 border-magic-soft/40 text-magic-soft font-bold py-3 px-6 rounded-2xl hover:bg-magic-soft/10 transition-colors"
            >
              כניסת מורה
            </button>
          </div>
        )}

        {mode === 'student' && (
          <div className="flex flex-col gap-3 text-right">
            <label className="text-magic-soft text-sm">קוד כיתה</label>
            <input
              type="text"
              value={classCode}
              onChange={e => setClassCode(e.target.value)}
              placeholder="לדוגמה: כיתה-ג1"
              className="bg-magic-bg/60 border border-magic-soft/30 rounded-xl p-3 text-white placeholder-magic-soft/40"
            />
            <label className="text-magic-soft text-sm">שם</label>
            <input
              type="text"
              value={studentName}
              onChange={e => setStudentName(e.target.value)}
              placeholder="השם שלי"
              className="bg-magic-bg/60 border border-magic-soft/30 rounded-xl p-3 text-white placeholder-magic-soft/40"
            />
            <button
              onClick={handleStudentLogin}
              className="bg-magic-accent text-magic-bg font-bold py-3 px-6 rounded-2xl hover:scale-105 transition-transform mt-2"
            >
              כניסה
            </button>
            <button
              onClick={() => { setMode('choose'); setError(null); }}
              className="text-magic-soft/60 text-sm mt-1 hover:text-magic-soft"
            >
              חזרה
            </button>
          </div>
        )}

        {mode === 'teacher' && (
          <div className="flex flex-col gap-3 text-right">
            <p className="text-magic-soft/70 text-sm text-center mb-1">
              {classCount === 0
                ? 'אין עדיין כיתות — צור/י כיתה חדשה'
                : 'הקלד/י קוד כיתה קיימת, או צור/י חדשה'}
            </p>
            <label className="text-magic-soft text-sm">שם הכיתה</label>
            <input
              type="text"
              value={teacherClassName}
              onChange={e => setTeacherClassName(e.target.value)}
              placeholder="כיתה ג'1"
              className="bg-magic-bg/60 border border-magic-soft/30 rounded-xl p-3 text-white placeholder-magic-soft/40"
            />
            <label className="text-magic-soft text-sm">קוד כיתה</label>
            <input
              type="text"
              value={teacherClassCode}
              onChange={e => setTeacherClassCode(e.target.value)}
              placeholder="לדוגמה: כיתה-ג1"
              className="bg-magic-bg/60 border border-magic-soft/30 rounded-xl p-3 text-white placeholder-magic-soft/40"
            />
            <button
              onClick={handleTeacherLogin}
              className="bg-magic-accent text-magic-bg font-bold py-3 px-6 rounded-2xl hover:scale-105 transition-transform mt-2"
            >
              כניסה / יצירת כיתה
            </button>
            <button
              onClick={() => { setMode('choose'); setError(null); }}
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
