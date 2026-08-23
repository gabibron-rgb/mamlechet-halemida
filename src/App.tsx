import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import StudentHome from './pages/StudentHome';
import TeacherHome from './pages/TeacherHome';
import TeacherClassesPage from './pages/TeacherClassesPage';
import ItemLab from './pages/ItemLab';
import { useSessionStore } from './store/useSessionStore';

function ProtectedStudent() {
  const role = useSessionStore((s) => s.role);
  if (role !== 'student') return <Navigate to="/" replace />;
  return <StudentHome />;
}

function ProtectedTeacherClasses() {
  const role = useSessionStore((s) => s.role);
  const teacherId = useSessionStore((s) => s.currentTeacherId);

  if (role !== 'teacher' || !teacherId) return <Navigate to="/" replace />;
  return <TeacherClassesPage />;
}

function ProtectedTeacherHome() {
  const role = useSessionStore((s) => s.role);
  const teacherId = useSessionStore((s) => s.currentTeacherId);
  const classId = useSessionStore((s) => s.currentClassId);

  if (role !== 'teacher' || !teacherId) return <Navigate to="/" replace />;
  if (!classId) return <Navigate to="/teacher/classes" replace />;
  return <TeacherHome />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/student" element={<ProtectedStudent />} />
        <Route path="/teacher/classes" element={<ProtectedTeacherClasses />} />
        <Route path="/teacher" element={<ProtectedTeacherHome />} />
        <Route
          path="/dev/items"
          element={import.meta.env.DEV ? <ItemLab /> : <Navigate to="/" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
