import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { genId } from '../utils/storage';
import type { AwardSize } from '../data/reasons';

export type ClassDef = {
  id: string;
  code: string;       // short code students type to log in (e.g. "כיתה-ג1")
  nameHe: string;
  createdAt: number;
};

export type ActivityEntry = {
  id: string;
  classId: string;
  studentIds: string[];   // who received points (can be many for group awards)
  amount: number;         // can be negative for corrections
  reasonId: string | null;
  note?: string;
  createdAt: number;
  undone: boolean;
};

export type ClassWorldState = {
  classId: string;
  donatedTotal: number;
  unlockedMilestones: string[];
};

type ClassStore = {
  classes: Record<string, ClassDef>;
  activity: ActivityEntry[];
  world: Record<string, ClassWorldState>; // keyed by classId

  createClass: (nameHe: string, code: string) => string;
  findClassByCode: (code: string) => ClassDef | undefined;

  logAward: (entry: Omit<ActivityEntry, 'id' | 'createdAt' | 'undone'>) => string;
  undoAward: (entryId: string) => ActivityEntry | undefined;

  addDonation: (classId: string, amount: number) => void;

  resetAll: () => void;
};

export const useClassStore = create<ClassStore>()(
  persist(
    (set, get) => ({
      classes: {},
      activity: [],
      world: {},

      createClass: (nameHe, code) => {
        const cls: ClassDef = {
          id: genId('cls'),
          code: code.trim(),
          nameHe,
          createdAt: Date.now(),
        };
        set(state => ({
          classes: { ...state.classes, [cls.id]: cls },
          world: {
            ...state.world,
            [cls.id]: { classId: cls.id, donatedTotal: 0, unlockedMilestones: [] },
          },
        }));
        return cls.id;
      },

      findClassByCode: (code) => {
        const trimmed = code.trim();
        return Object.values(get().classes).find(c => c.code === trimmed);
      },

      logAward: (entry) => {
        const full: ActivityEntry = {
          ...entry,
          id: genId('act'),
          createdAt: Date.now(),
          undone: false,
        };
        set(state => ({ activity: [full, ...state.activity] }));
        return full.id;
      },

      undoAward: (entryId) => {
        const entry = get().activity.find(a => a.id === entryId);
        if (!entry || entry.undone) return undefined;
        set(state => ({
          activity: state.activity.map(a =>
            a.id === entryId ? { ...a, undone: true } : a
          ),
        }));
        return entry;
      },

      addDonation: (classId, amount) => set(state => {
        const cur = state.world[classId] || {
          classId, donatedTotal: 0, unlockedMilestones: [],
        };
        return {
          world: {
            ...state.world,
            [classId]: { ...cur, donatedTotal: cur.donatedTotal + amount },
          },
        };
      }),

      resetAll: () => set({ classes: {}, activity: [], world: {} }),
    }),
    { name: 'mamlechet:class' }
  )
);

// Re-export for convenience
export type { AwardSize };
