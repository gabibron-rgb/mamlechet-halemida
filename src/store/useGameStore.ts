import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_UNLOCKED_THEMES } from '../data/themes';
import type { ThemeId } from '../data/themes';
import type { CompanionStage } from '../data/companionWorlds';
import type { Zone } from '../data/items';
import type { CapacityKey } from '../data/levels';
import { genId } from '../utils/storage';
import type { BoxTier } from '../data/boxes';

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

  addPoints: (id: StudentId, delta: number) => void;
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

  resetAll: () => void;
};

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

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      students: {},

      createStudent: (name, classId) => {
        const stu = defaultStudent(name, classId);
        set(state => ({
          students: {
            ...state.students,
            [stu.id]: stu,
          },
        }));
        return stu.id;
      },

      getStudent: (id) => get().students[id],

      updateStudent: (id, patch) =>
        set(state => {
          const cur = state.students[id];
          if (!cur) return state;

          return {
            students: {
              ...state.students,
              [id]: {
                ...cur,
                ...patch,
              },
            },
          };
        }),

        updateInventoryEntry: (studentId, inventoryIndex, patch) =>
  set(state => {
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

    return {
      students: {
        ...state.students,
        [studentId]: {
          ...student,
          inventory: nextInventory,
        },
      },
    };
  }),

      addPoints: (id, delta) =>
        set(state => {
          const cur = state.students[id];
          if (!cur) return state;

          return {
            students: {
              ...state.students,
              [id]: {
                ...cur,
                points: Math.max(0, cur.points + delta),
              },
            },
          };
        }),

      addXp: (id, delta) =>
        set(state => {
          const cur = state.students[id];
          if (!cur) return state;

          return {
            students: {
              ...state.students,
              [id]: {
                ...cur,
                xp: Math.max(0, cur.xp + delta),
              },
            },
          };
        }),

      addInventory: (id, itemId) =>
        set(state => {
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

          return {
            students: {
              ...state.students,
              [id]: {
                ...cur,
                inventory: [...cur.inventory, entry],
              },
            },
          };
        }),

      removeInventory: (id, itemId) =>
        set(state => {
          const cur = state.students[id];
          if (!cur) return state;

          const idx = cur.inventory.findIndex(e => e.itemId === itemId);
          if (idx === -1) return state;

          const next = [...cur.inventory];
          next.splice(idx, 1);

          return {
            students: {
              ...state.students,
              [id]: {
                ...cur,
                inventory: next,
              },
            },
          };
        }),

      unlockTheme: (id, theme) =>
        set(state => {
          const cur = state.students[id];
          if (!cur) return state;
          if (cur.unlockedThemes.includes(theme)) return state;

          return {
            students: {
              ...state.students,
              [id]: {
                ...cur,
                unlockedThemes: [...cur.unlockedThemes, theme],
              },
            },
          };
        }),

      completeLevelUp: (studentId, payload) =>
        set(state => {
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

          return {
            students: {
              ...state.students,
              [studentId]: {
                ...student,
                points: student.points + payload.pointBonus,
                capacities,
                inventory: [...student.inventory, cosmeticEntry],
                pendingLevelUps: Math.max(0, (student.pendingLevelUps ?? 0) - 1),
                pendingThemeUnlocks:
               (student.pendingThemeUnlocks ?? 0) +
               (payload.newLevel % 2 === 0 ? 1 : 0),
              },
            },
          };
        }),
         completeThemeUnlock: (studentId, themeId) => {
  set((state) => {
    const student = state.students[studentId];
    if (!student) return state;
    if ((student.pendingThemeUnlocks ?? 0) <= 0) return state;
    if (student.unlockedThemes.includes(themeId)) return state;

    return {
      ...state,
      students: {
        ...state.students,
        [studentId]: {
          ...student,
          unlockedThemes: [...student.unlockedThemes, themeId],
          pendingThemeUnlocks: (student.pendingThemeUnlocks ?? 0) - 1,
        },
      },
    };
  });
},

      resetAll: () => set({ students: {} }),
    }),
    { name: 'mamlechet:game' }
  )
 
);