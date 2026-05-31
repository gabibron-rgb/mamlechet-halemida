import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_UNLOCKED_THEMES } from '../data/themes';
import type { ThemeId } from '../data/themes';
import type { CompanionStage } from '../data/companionWorlds';
import type { Zone } from '../data/items';
import type { CapacityKey } from '../data/levels';
import { genId } from '../utils/storage';
import type { BoxTier } from '../data/boxes';
import { supabase } from '../lib/supabaseClient';

export type StudentId = string;

export type InventoryEntry = {
  id?: string;
  itemId: string;
  kind?: 'item' | 'cosmetic' | 'box';
  acquiredAt: number;
  placedZone?: Zone | null;
  placedSlot?: number | null;

  roomX?: number | null;
  roomY?: number | null;
  roomScale?: number | null;
  roomRotation?: number | null;

  boxTier?: BoxTier;
  boxTheme?: ThemeId;
};

export type CompanionState = {
  unlocked: boolean;
  theme: ThemeId | null;
  stage: CompanionStage;
  bond: number;
  lastCareDate: string | null;
  careXpToday: number;
  activeFlourishes: string[];
  ownedFlourishes: string[];
};

export type StudentState = {
  id: StudentId;

  // id אמיתי מתוך Supabase, אם יש.
  // אם אין, המשחק עדיין יעבוד מקומית.
  supabaseId?: string;

  // שם התחברות כמו yoni.
  // אם אין, ננסה לעדכן לפי שם התלמיד בעברית.
  loginName?: string;

  name: string;
  classId: string;
  points: number;
  xp: number;
  level: number;
  inventory: InventoryEntry[];
  unlockedThemes: ThemeId[];
  capacities: {
    inventory: number;
    displayShelf: number;
    wallSlots: number;
    desk: number;
    petArea: number;
  };
  companion: CompanionState;
  pastRewards: string[];
  trophies: { id: string; trophyTheme: string; caption: string; awardedAt: number }[];
  pityCounters: Record<string, number>;
  pendingLevelUps: number;
  pendingThemeUnlocks: number;
};

type GameStore = {
  students: Record<StudentId, StudentState>;

  completeThemeUnlock: (studentId: string, themeId: ThemeId) => void;
  createStudent: (name: string, classId: string) => StudentId;
  getStudent: (id: StudentId) => StudentState | undefined;
  updateStudent: (id: StudentId, patch: Partial<StudentState>) => void;

  updateInventoryEntry: (
    studentId: StudentId,
    inventoryIndex: number,
    patch: Partial<InventoryEntry>
  ) => void;

  addPoints: (id: StudentId, delta: number) => Promise<void>;
  addXp: (id: StudentId, delta: number) => void;
  addInventory: (id: StudentId, itemId: string) => void;
  removeInventory: (id: StudentId, itemId: string) => void;
  unlockTheme: (id: StudentId, theme: ThemeId) => void;

  completeLevelUp: (
    studentId: string,
    payload: {
      cosmeticId: string;
      capacityKey: CapacityKey;
      pointBonus: number;
      newLevel: number;
    }
  ) => void;

  loadStudentFromSupabase: (studentId: string) => Promise<void>;
  loadStudentsFromSupabase: (classId: string) => Promise<void>;

  resetAll: () => void;
};

function isUuid(value: string | undefined): boolean {
  if (!value) return false;

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

async function syncStudentToSupabase(student: StudentState) {
  const supabaseId = student.supabaseId ?? (isUuid(student.id) ? student.id : null);
  const loginName = student.loginName?.trim();
  const studentName = student.name?.trim();

  const payload = {
    points: student.points,
    xp: student.xp,
    level: student.level,
    inventory: student.inventory,
    meta: {
      unlockedThemes: student.unlockedThemes,
      capacities: student.capacities,
      companion: student.companion,
      pastRewards: student.pastRewards,
      trophies: student.trophies,
      pityCounters: student.pityCounters,
      pendingLevelUps: student.pendingLevelUps,
      pendingThemeUnlocks: student.pendingThemeUnlocks,
    },
    updated_at: new Date().toISOString(),
  };

  let query = supabase.from('students').update(payload).select('*');

  if (supabaseId) {
    query = query.eq('id', supabaseId);
  } else if (loginName) {
    query = query.eq('login_name', loginName);
  } else if (studentName) {
    query = query.eq('name', studentName);
  } else {
    console.warn('Cannot sync student to Supabase: missing id/loginName/name', student);
    return;
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('Error syncing student to Supabase:', error);
    return;
  }

  if (!data) {
    console.warn('No matching student found in Supabase for:', student);
    return;
  }

  console.log('Synced student to Supabase:', data);
}

function defaultStudent(name: string, classId: string): StudentState {
  return {
    id: genId('stu'),
    name,
    classId,
    points: 0,
    xp: 0,
    level: 1,
    inventory: [],
    unlockedThemes: [...DEFAULT_UNLOCKED_THEMES],
    capacities: {
      inventory: 999,
      displayShelf: 999,
      wallSlots: 999,
      desk: 999,
      petArea: 999,
    },
    companion: {
      unlocked: false,
      theme: null,
      stage: 'egg',
      bond: 0,
      lastCareDate: null,
      careXpToday: 0,
      activeFlourishes: [],
      ownedFlourishes: [],
    },
    pastRewards: [],
    trophies: [],
    pityCounters: {},
    pendingLevelUps: 0,
    pendingThemeUnlocks: 0,
  };
}

function studentFromSupabase(row: any, classId: string): StudentState {
  const base = defaultStudent(row.name ?? 'תלמיד/ה', classId);
  const meta = row.meta ?? {};

  return {
    ...base,

    id: row.id,
    supabaseId: row.id,
    loginName: row.login_name ?? undefined,

    name: row.name ?? base.name,
    classId,

    points: row.points ?? 0,
    xp: row.xp ?? 0,
    level: row.level ?? 1,

    inventory: Array.isArray(row.inventory) ? row.inventory : [],

    unlockedThemes: Array.isArray(meta.unlockedThemes)
      ? meta.unlockedThemes
      : base.unlockedThemes,

    capacities: {
      inventory: 999,
      displayShelf: 999,
      wallSlots: 999,
      desk: 999,
      petArea: 999,
    },

    companion: meta.companion ?? base.companion,
    pastRewards: Array.isArray(meta.pastRewards) ? meta.pastRewards : [],
    trophies: Array.isArray(meta.trophies) ? meta.trophies : [],
    pityCounters: meta.pityCounters ?? {},

    pendingLevelUps: meta.pendingLevelUps ?? 0,
    pendingThemeUnlocks: meta.pendingThemeUnlocks ?? 0,
  };
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      students: {},

      createStudent: (name, classId) => {
        const stu = defaultStudent(name, classId);

        set((state) => ({
          students: {
            ...state.students,
            [stu.id]: stu,
          },
        }));

        return stu.id;
      },

      getStudent: (id) => get().students[id],

      loadStudentFromSupabase: async (studentId) => {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('id', studentId)
          .maybeSingle();

        if (error) {
          console.error('Error loading student from Supabase:', error);
          return;
        }

        if (!data) {
          console.warn('Student not found in Supabase:', studentId);
          return;
        }

        const student = studentFromSupabase(data, data.class_id);

        set((state) => ({
          students: {
            ...state.students,
            [student.id]: student,
          },
        }));
      },

      loadStudentsFromSupabase: async (classId) => {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('class_id', classId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading students from Supabase:', error);
          return;
        }

        const studentsFromDb = (data ?? []).map((row) =>
          studentFromSupabase(row, row.class_id ?? classId)
        );

        set((state) => {
          const nextStudents = { ...state.students };

          for (const student of studentsFromDb) {
            nextStudents[student.id] = student;
          }

          return {
            students: nextStudents,
          };
        });
      },

      updateStudent: (id, patch) => {
        let updatedStudent: StudentState | null = null;

        set((state) => {
          const cur = state.students[id];
          if (!cur) return state;

          updatedStudent = {
            ...cur,
            ...patch,
          };

          return {
            students: {
              ...state.students,
              [id]: updatedStudent,
            },
          };
        });

        if (updatedStudent) {
          void syncStudentToSupabase(updatedStudent);
        }
      },

      updateInventoryEntry: (studentId, inventoryIndex, patch) => {
        let updatedStudent: StudentState | null = null;

        set((state) => {
          const student = state.students[studentId];
          if (!student) return state;

          if (!student.inventory[inventoryIndex]) return state;

          const nextInventory = student.inventory.map((entry, idx) =>
            idx === inventoryIndex
              ? {
                  ...entry,
                  ...patch,
                }
              : entry
          );

          updatedStudent = {
            ...student,
            inventory: nextInventory,
          };

          return {
            students: {
              ...state.students,
              [studentId]: updatedStudent,
            },
          };
        });

        if (updatedStudent) {
          void syncStudentToSupabase(updatedStudent);
        }
      },

      addPoints: async (id, delta) => {
        let updatedStudent: StudentState | null = null;
        let nextPoints: number | null = null;

        set((state) => {
          const cur = state.students[id];
          if (!cur) return state;

          nextPoints = Math.max(0, cur.points + delta);

          updatedStudent = {
            ...cur,
            points: nextPoints,
          };

          return {
            students: {
              ...state.students,
              [id]: updatedStudent,
            },
          };
        });

        if (updatedStudent && nextPoints !== null) {
          await syncStudentToSupabase(updatedStudent);
        }
      },

      addXp: (id, delta) => {
        let updatedStudent: StudentState | null = null;

        set((state) => {
          const cur = state.students[id];
          if (!cur) return state;

          updatedStudent = {
            ...cur,
            xp: Math.max(0, cur.xp + delta),
          };

          return {
            students: {
              ...state.students,
              [id]: updatedStudent,
            },
          };
        });

        if (updatedStudent) {
          void syncStudentToSupabase(updatedStudent);
        }
      },

      addInventory: (id, itemId) => {
        let updatedStudent: StudentState | null = null;

        set((state) => {
          const cur = state.students[id];
          if (!cur) return state;

          const entry: InventoryEntry = {
            id: `${itemId}_${Date.now()}`,
            itemId,
            kind: 'item',
            acquiredAt: Date.now(),
            placedZone: null,
            placedSlot: null,
            roomX: null,
            roomY: null,
            roomScale: 1,
            roomRotation: 0,
          };

          updatedStudent = {
            ...cur,
            inventory: [...cur.inventory, entry],
          };

          return {
            students: {
              ...state.students,
              [id]: updatedStudent,
            },
          };
        });

        if (updatedStudent) {
          void syncStudentToSupabase(updatedStudent);
        }
      },

      removeInventory: (id, itemId) => {
        let updatedStudent: StudentState | null = null;

        set((state) => {
          const cur = state.students[id];
          if (!cur) return state;

          const idx = cur.inventory.findIndex((e) => e.itemId === itemId);
          if (idx === -1) return state;

          const nextInventory = [...cur.inventory];
          nextInventory.splice(idx, 1);

          updatedStudent = {
            ...cur,
            inventory: nextInventory,
          };

          return {
            students: {
              ...state.students,
              [id]: updatedStudent,
            },
          };
        });

        if (updatedStudent) {
          void syncStudentToSupabase(updatedStudent);
        }
      },

      unlockTheme: (id, theme) => {
        let updatedStudent: StudentState | null = null;

        set((state) => {
          const cur = state.students[id];
          if (!cur) return state;
          if (cur.unlockedThemes.includes(theme)) return state;

          updatedStudent = {
            ...cur,
            unlockedThemes: [...cur.unlockedThemes, theme],
          };

          return {
            students: {
              ...state.students,
              [id]: updatedStudent,
            },
          };
        });

        if (updatedStudent) {
          void syncStudentToSupabase(updatedStudent);
        }
      },

      completeLevelUp: (studentId, payload) => {
        let updatedStudent: StudentState | null = null;

        set((state) => {
          const student = state.students[studentId];
          if (!student) return state;
          if ((student.pendingLevelUps ?? 0) <= 0) return state;

          const capacities = { ...student.capacities };
          capacities[payload.capacityKey] =
            (capacities[payload.capacityKey] ?? 0) + 1;

          const cosmeticEntry: InventoryEntry = {
            id: `${payload.cosmeticId}_${Date.now()}`,
            itemId: payload.cosmeticId,
            kind: 'cosmetic',
            acquiredAt: Date.now(),
            placedZone: null,
            placedSlot: null,
            roomX: null,
            roomY: null,
            roomScale: 1,
            roomRotation: 0,
          };

          updatedStudent = {
            ...student,
            points: student.points + payload.pointBonus,
            capacities,
            inventory: [...student.inventory, cosmeticEntry],
            pendingLevelUps: Math.max(0, (student.pendingLevelUps ?? 0) - 1),
            pendingThemeUnlocks:
              (student.pendingThemeUnlocks ?? 0) +
              (payload.newLevel % 2 === 0 ? 1 : 0),
          };

          return {
            students: {
              ...state.students,
              [studentId]: updatedStudent,
            },
          };
        });

        if (updatedStudent) {
          void syncStudentToSupabase(updatedStudent);
        }
      },

      completeThemeUnlock: (studentId, themeId) => {
        let updatedStudent: StudentState | null = null;

        set((state) => {
          const student = state.students[studentId];
          if (!student) return state;
          if ((student.pendingThemeUnlocks ?? 0) <= 0) return state;
          if (student.unlockedThemes.includes(themeId)) return state;

          updatedStudent = {
            ...student,
            unlockedThemes: [...student.unlockedThemes, themeId],
            pendingThemeUnlocks: Math.max(
              0,
              (student.pendingThemeUnlocks ?? 0) - 1
            ),
          };

          return {
            students: {
              ...state.students,
              [studentId]: updatedStudent,
            },
          };
        });

        if (updatedStudent) {
          void syncStudentToSupabase(updatedStudent);
        }
      },

      resetAll: () => set({ students: {} }),
    }),
    { name: 'mamlechet:game' }
  )
);