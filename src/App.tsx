import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import StudentHome from './pages/StudentHome';
import TeacherHome from './pages/TeacherHome';
import { useSessionStore } from './store/useSessionStore';

function ProtectedStudent() {
  const role = useSessionStore(s => s.role);
  if (role !== 'student') return <Navigate to="/" replace />;
  return <StudentHome />;
}

function ProtectedTeacher() {
  const role = useSessionStore(s => s.role);
  if (role !== 'teacher') return <Navigate to="/" replace />;
  return <TeacherHome />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/student" element={<ProtectedStudent />} />
        <Route path="/teacher" element={<ProtectedTeacher />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
