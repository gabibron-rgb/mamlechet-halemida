import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'student' | 'teacher' | null;

type SessionStore = {
  role: Role;
  currentStudentId: string | null;
  currentClassId: string | null;
  currentTeacherId: string | null;
  currentTeacherName: string | null;

  loginStudent: (studentId: string, classId: string) => void;
  loginTeacher: (teacherId: string, teacherName: string) => void;
  selectTeacherClass: (classId: string | null) => void;
  logout: () => void;
};

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      role: null,
      currentStudentId: null,
      currentClassId: null,
      currentTeacherId: null,
      currentTeacherName: null,

      loginStudent: (studentId, classId) =>
        set({
          role: 'student',
          currentStudentId: studentId,
          currentClassId: classId,
          currentTeacherId: null,
          currentTeacherName: null,
        }),

      loginTeacher: (teacherId, teacherName) =>
        set({
          role: 'teacher',
          currentStudentId: null,
          currentClassId: null,
          currentTeacherId: teacherId,
          currentTeacherName: teacherName,
        }),

      selectTeacherClass: (classId) =>
        set((state) =>
          state.role === 'teacher'
            ? { currentClassId: classId }
            : { currentClassId: state.currentClassId }
        ),

      logout: () =>
        set({
          role: null,
          currentStudentId: null,
          currentClassId: null,
          currentTeacherId: null,
          currentTeacherName: null,
        }),
    }),
    { name: 'mamlechet:session' }
  )
);
