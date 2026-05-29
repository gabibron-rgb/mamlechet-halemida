import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'student' | 'teacher' | null;

type SessionStore = {
  role: Role;
  currentStudentId: string | null;
  currentClassId: string | null;

  loginStudent: (studentId: string, classId: string) => void;
  loginTeacher: (classId: string) => void;
  logout: () => void;
};

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      role: null,
      currentStudentId: null,
      currentClassId: null,

      loginStudent: (studentId, classId) =>
        set({ role: 'student', currentStudentId: studentId, currentClassId: classId }),

      loginTeacher: (classId) =>
        set({ role: 'teacher', currentStudentId: null, currentClassId: classId }),

      logout: () =>
        set({ role: null, currentStudentId: null, currentClassId: null }),
    }),
    { name: 'mamlechet:session' }
  )
);
