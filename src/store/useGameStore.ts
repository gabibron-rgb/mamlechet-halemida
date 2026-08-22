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
import { getCompanionFlourish } from '../data/companionFlourishes';
import {
  companionStageMeetsRequirement,
  getCompanionSkill,
} from '../data/companionSkills';
import {
  companionTraitForReason,
  normalizeCompanionBehaviorMemories,
  type CompanionBehaviorMemory,
  type CompanionTraitId,
} from '../data/companionTraits';
import {
  COMPANION_TRAIT_CHALLENGE_TITLES,
  getLatestCompanionTraitChallenge,
  normalizeCompanionTraitChallenges,
  reconcileLatestCompanionTraitChallenge,
  type CompanionTraitChallenge,
} from '../data/companionTraitChallenges';
import {
  normalizeCompanionJournalEntries,
  type CompanionJournalEntry,
} from '../data/companionJournal';

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
  name: string | null;
  stage: CompanionStage;
  bond: number;
  petPoints: number;
  lastCareDate: string | null;
  careXpToday: number;
  celebratedStages: CompanionStage[];
  activeFlourishes: string[];
  ownedFlourishes: string[];
  unlockedSkills: string[];
  treasuresFound: number;
  behaviorMemories: CompanionBehaviorMemory[];
  traitChallenges: CompanionTraitChallenge[];
  journalEntries: CompanionJournalEntry[];
};

export type CompanionSkillUnlockResult =
  | 'unlocked'
  | 'not-found'
  | 'already-owned'
  | 'stage-locked'
  | 'prerequisite-locked'
  | 'insufficient-points';

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
  seenTrophyIds: string[];
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
  awardTrophy: (studentId: StudentId, trophyTheme: string, caption: string) => void;
  updateTrophy: (
    studentId: StudentId,
    trophyId: string,
    trophyTheme: string,
    caption: string
  ) => void;
  removeTrophy: (studentId: StudentId, trophyId: string) => void;
  markTrophySeen: (studentId: StudentId, trophyId: string) => void;
  awardBehaviorPoints: (
    studentId: StudentId,
    amount: number,
    reasonId: string | null,
    sourceActivityId: string,
    journalNote?: string | null
  ) => Promise<void>;
  undoBehaviorAward: (
    studentId: StudentId,
    amount: number,
    sourceActivityId: string
  ) => Promise<void>;
  assignCompanionTraitChallenge: (
    studentId: StudentId,
    traitId: CompanionTraitId,
    targetDays: number
  ) => Promise<boolean>;
  cancelCompanionTraitChallenge: (
    studentId: StudentId
  ) => Promise<boolean>;
  updateCompanionJournalEntry: (
    studentId: StudentId,
    entryId: string,
    message: string
  ) => Promise<boolean>;
  removeCompanionJournalEntry: (
    studentId: StudentId,
    entryId: string
  ) => Promise<boolean>;
  awardCompanionFlourish: (
    studentId: StudentId,
    flourishId: string,
    pointBonus: number
  ) => Promise<boolean>;
  undoCompanionFlourishAward: (
    studentId: StudentId,
    flourishId: string,
    pointBonus: number
  ) => Promise<void>;
  unlockCompanionSkill: (
    studentId: StudentId,
    skillId: string
  ) => Promise<CompanionSkillUnlockResult>;

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
      seenTrophyIds: student.seenTrophyIds ?? [],
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

function reconcileJournalWithLatestChallenge(
  entries: CompanionJournalEntry[],
  challenges: CompanionTraitChallenge[],
  createdAt: number
): CompanionJournalEntry[] {
  const latest = getLatestCompanionTraitChallenge(challenges);
  if (!latest) return entries;

  const journalId = `journal:challenge:${latest.id}`;

  if (latest.completedAt === null) {
    return entries.filter(entry => entry.id !== journalId);
  }

  if (entries.some(entry => entry.id === journalId)) return entries;
  if (latest.completedAt !== createdAt) return entries;

  return [
    ...entries,
    {
      id: journalId,
      traitId: latest.traitId,
      reasonId: null,
      message: `הושלם אתגר האופי ונפתח התואר “${COMPANION_TRAIT_CHALLENGE_TITLES[latest.traitId]}”.`,
      createdAt: latest.completedAt ?? createdAt,
      source: 'challenge',
    },
  ];
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
      name: null,
      stage: 'egg',
      bond: 0,
      petPoints: 0,
      lastCareDate: null,
      careXpToday: 0,
      celebratedStages: ['egg'],
      activeFlourishes: [],
      ownedFlourishes: [],
      unlockedSkills: [],
      treasuresFound: 0,
      behaviorMemories: [],
      traitChallenges: [],
      journalEntries: [],
    },
    pastRewards: [],
    trophies: [],
    seenTrophyIds: [],
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

    companion: {
      ...base.companion,
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
    pastRewards: Array.isArray(meta.pastRewards) ? meta.pastRewards : [],
    trophies: Array.isArray(meta.trophies) ? meta.trophies : [],
    seenTrophyIds: Array.isArray(meta.seenTrophyIds) ? meta.seenTrophyIds : [],
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

      awardTrophy: (studentId, trophyTheme, caption) => {
        let updatedStudent: StudentState | null = null;
        const cleanTheme = trophyTheme.trim();
        const cleanCaption = caption.trim();

        if (!cleanTheme || !cleanCaption) return;

        set((state) => {
          const student = state.students[studentId];
          if (!student) return state;

          updatedStudent = {
            ...student,
            trophies: [
              ...student.trophies,
              {
                id: genId('trophy'),
                trophyTheme: cleanTheme,
                caption: cleanCaption,
                awardedAt: Date.now(),
              },
            ],
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

      updateTrophy: (studentId, trophyId, trophyTheme, caption) => {
        let updatedStudent: StudentState | null = null;
        const cleanTheme = trophyTheme.trim();
        const cleanCaption = caption.trim();

        if (!trophyId || !cleanTheme || !cleanCaption) return;

        set((state) => {
          const student = state.students[studentId];
          if (!student) return state;

          const trophyExists = student.trophies.some(
            trophy => trophy.id === trophyId
          );
          if (!trophyExists) return state;

          updatedStudent = {
            ...student,
            trophies: student.trophies.map(trophy =>
              trophy.id === trophyId
                ? {
                    ...trophy,
                    trophyTheme: cleanTheme,
                    caption: cleanCaption,
                  }
                : trophy
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

      removeTrophy: (studentId, trophyId) => {
        let updatedStudent: StudentState | null = null;

        if (!trophyId) return;

        set((state) => {
          const student = state.students[studentId];
          if (!student) return state;

          const nextTrophies = student.trophies.filter(
            trophy => trophy.id !== trophyId
          );
          if (nextTrophies.length === student.trophies.length) return state;

          updatedStudent = {
            ...student,
            trophies: nextTrophies,
            seenTrophyIds: (student.seenTrophyIds ?? []).filter(
              id => id !== trophyId
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

      markTrophySeen: (studentId, trophyId) => {
        let updatedStudent: StudentState | null = null;

        if (!trophyId) return;

        set((state) => {
          const student = state.students[studentId];
          if (!student) return state;

          const trophyExists = student.trophies.some(
            trophy => trophy.id === trophyId
          );
          const seenTrophyIds = student.seenTrophyIds ?? [];
          if (!trophyExists || seenTrophyIds.includes(trophyId)) {
            return state;
          }

          updatedStudent = {
            ...student,
            seenTrophyIds: [...seenTrophyIds, trophyId],
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

      awardBehaviorPoints: async (
        studentId,
        amount,
        reasonId,
        sourceActivityId,
        journalNote
      ) => {
        const safeAmount = Math.max(0, Math.round(amount));
        const cleanActivityId = sourceActivityId.trim();
        const cleanJournalNote = (journalNote?.trim() ?? '').slice(0, 240);
        const traitId = companionTraitForReason(reasonId);
        const awardedAt = Date.now();
        let updatedStudent: StudentState | null = null;

        set(state => {
          const student = state.students[studentId];
          if (!student) return state;

          const behaviorMemories =
            student.companion.behaviorMemories ?? [];
          const memoryAlreadyExists =
            traitId &&
            cleanActivityId &&
            behaviorMemories.some(memory => memory.id === cleanActivityId);

          if (memoryAlreadyExists) return state;

          const nextMemories =
            traitId && cleanActivityId
              ? [
                  ...behaviorMemories,
                  {
                    id: cleanActivityId,
                    traitId,
                    reasonId: reasonId as string,
                    pointAmount: safeAmount,
                    awardedAt,
                    source: 'points' as const,
                  },
                ]
              : behaviorMemories;
          const nextChallenges = reconcileLatestCompanionTraitChallenge(
            student.companion.traitChallenges ?? [],
            nextMemories,
            awardedAt
          );
          const journalEntries = student.companion.journalEntries ?? [];
          const journalId = `journal:award:${cleanActivityId}`;
          const entriesWithTeacherNote =
            traitId && cleanJournalNote && cleanActivityId &&
            !journalEntries.some(entry => entry.id === journalId)
              ? [
                  ...journalEntries,
                  {
                    id: journalId,
                    traitId,
                    reasonId: reasonId as string,
                    message: cleanJournalNote,
                    createdAt: awardedAt,
                    source: 'teacher_note' as const,
                  },
                ]
              : journalEntries;
          const nextJournalEntries = reconcileJournalWithLatestChallenge(
            entriesWithTeacherNote,
            nextChallenges,
            awardedAt
          );

          updatedStudent = {
            ...student,
            points: student.points + safeAmount,
            companion: {
              ...student.companion,
              petPoints:
                (student.companion.petPoints ?? 0) + safeAmount,
              behaviorMemories: nextMemories,
              traitChallenges: nextChallenges,
              journalEntries: nextJournalEntries,
            },
          };

          return {
            students: {
              ...state.students,
              [studentId]: updatedStudent,
            },
          };
        });

        if (updatedStudent) {
          await syncStudentToSupabase(updatedStudent);
        }
      },

      undoBehaviorAward: async (
        studentId,
        amount,
        sourceActivityId
      ) => {
        const safeAmount = Math.max(0, Math.round(amount));
        const cleanActivityId = sourceActivityId.trim();
        let updatedStudent: StudentState | null = null;

        set(state => {
          const student = state.students[studentId];
          if (!student) return state;

          const nextMemories = (
            student.companion.behaviorMemories ?? []
          ).filter(memory => memory.id !== cleanActivityId);
          const nextChallenges = reconcileLatestCompanionTraitChallenge(
            student.companion.traitChallenges ?? [],
            nextMemories,
            Date.now()
          );
          const journalEntries = (
            student.companion.journalEntries ?? []
          ).filter(entry => entry.id !== `journal:award:${cleanActivityId}`);
          const nextJournalEntries = reconcileJournalWithLatestChallenge(
            journalEntries,
            nextChallenges,
            Date.now()
          );

          updatedStudent = {
            ...student,
            points: Math.max(0, student.points - safeAmount),
            companion: {
              ...student.companion,
              petPoints: Math.max(
                0,
                (student.companion.petPoints ?? 0) - safeAmount
              ),
              behaviorMemories: nextMemories,
              traitChallenges: nextChallenges,
              journalEntries: nextJournalEntries,
            },
          };

          return {
            students: {
              ...state.students,
              [studentId]: updatedStudent,
            },
          };
        });

        if (updatedStudent) {
          await syncStudentToSupabase(updatedStudent);
        }
      },

      assignCompanionTraitChallenge: async (
        studentId,
        traitId,
        targetDays
      ) => {
        const safeTargetDays = Math.max(1, Math.min(30, Math.round(targetDays)));
        let updatedStudent: StudentState | null = null;

        set(state => {
          const student = state.students[studentId];
          if (!student) return state;

          const challenges = student.companion.traitChallenges ?? [];
          const latest = getLatestCompanionTraitChallenge(challenges);
          if (latest && latest.completedAt === null) return state;

          updatedStudent = {
            ...student,
            companion: {
              ...student.companion,
              traitChallenges: [
                ...challenges,
                {
                  id: genId('trait-challenge'),
                  traitId,
                  targetDays: safeTargetDays,
                  assignedAt: Date.now(),
                  completedAt: null,
                },
              ],
            },
          };

          return {
            students: {
              ...state.students,
              [studentId]: updatedStudent,
            },
          };
        });

        if (!updatedStudent) return false;
        await syncStudentToSupabase(updatedStudent);
        return true;
      },

      cancelCompanionTraitChallenge: async studentId => {
        let updatedStudent: StudentState | null = null;

        set(state => {
          const student = state.students[studentId];
          if (!student) return state;

          const challenges = student.companion.traitChallenges ?? [];
          const latest = getLatestCompanionTraitChallenge(challenges);
          if (!latest || latest.completedAt !== null) return state;

          updatedStudent = {
            ...student,
            companion: {
              ...student.companion,
              traitChallenges: challenges.slice(0, -1),
            },
          };

          return {
            students: {
              ...state.students,
              [studentId]: updatedStudent,
            },
          };
        });

        if (!updatedStudent) return false;
        await syncStudentToSupabase(updatedStudent);
        return true;
      },

      updateCompanionJournalEntry: async (
        studentId,
        entryId,
        message
      ) => {
        const cleanEntryId = entryId.trim();
        const cleanMessage = message.trim().slice(0, 240);
        let updatedStudent: StudentState | null = null;

        if (!cleanEntryId || !cleanMessage) return false;

        set(state => {
          const student = state.students[studentId];
          if (!student) return state;

          const journalEntries = student.companion.journalEntries ?? [];
          const target = journalEntries.find(entry => entry.id === cleanEntryId);
          if (!target || target.source !== 'teacher_note') return state;

          updatedStudent = {
            ...student,
            companion: {
              ...student.companion,
              journalEntries: journalEntries.map(entry =>
                entry.id === cleanEntryId
                  ? { ...entry, message: cleanMessage }
                  : entry
              ),
            },
          };

          return {
            students: {
              ...state.students,
              [studentId]: updatedStudent,
            },
          };
        });

        if (!updatedStudent) return false;
        await syncStudentToSupabase(updatedStudent);
        return true;
      },

      removeCompanionJournalEntry: async (studentId, entryId) => {
        const cleanEntryId = entryId.trim();
        let updatedStudent: StudentState | null = null;

        if (!cleanEntryId) return false;

        set(state => {
          const student = state.students[studentId];
          if (!student) return state;

          const journalEntries = student.companion.journalEntries ?? [];
          const target = journalEntries.find(entry => entry.id === cleanEntryId);
          if (!target || target.source !== 'teacher_note') return state;

          updatedStudent = {
            ...student,
            companion: {
              ...student.companion,
              journalEntries: journalEntries.filter(
                entry => entry.id !== cleanEntryId
              ),
            },
          };

          return {
            students: {
              ...state.students,
              [studentId]: updatedStudent,
            },
          };
        });

        if (!updatedStudent) return false;
        await syncStudentToSupabase(updatedStudent);
        return true;
      },

      awardCompanionFlourish: async (
        studentId,
        flourishId,
        pointBonus
      ) => {
        let updatedStudent: StudentState | null = null;
        const cleanFlourishId = flourishId.trim();
        const safePointBonus = Math.max(0, Math.round(pointBonus));
        const flourish = getCompanionFlourish(cleanFlourishId);
        const awardedAt = Date.now();

        if (!flourish) return false;

        set(state => {
          const student = state.students[studentId];
          if (!student) return state;

          const ownedFlourishes = student.companion.ownedFlourishes ?? [];
          if (ownedFlourishes.includes(cleanFlourishId)) return state;
          const behaviorMemories =
            student.companion.behaviorMemories ?? [];
          const traitId = companionTraitForReason(flourish.reasonId);
          const memoryId = `flourish:${cleanFlourishId}`;
          const nextMemories =
            traitId && !behaviorMemories.some(memory => memory.id === memoryId)
              ? [
                  ...behaviorMemories,
                  {
                    id: memoryId,
                    traitId,
                    reasonId: flourish.reasonId,
                    pointAmount: safePointBonus,
                    awardedAt,
                    source: 'flourish' as const,
                  },
                ]
              : behaviorMemories;
          const nextChallenges = reconcileLatestCompanionTraitChallenge(
            student.companion.traitChallenges ?? [],
            nextMemories,
            awardedAt
          );
          const journalEntries = student.companion.journalEntries ?? [];
          const flourishJournalId = `journal:flourish:${cleanFlourishId}`;
          const entriesWithFlourish =
            traitId &&
            !journalEntries.some(entry => entry.id === flourishJournalId)
              ? [
                  ...journalEntries,
                  {
                    id: flourishJournalId,
                    traitId,
                    reasonId: flourish.reasonId,
                    message: `${flourish.nameHe}: ${flourish.descriptionHe}`,
                    createdAt: awardedAt,
                    source: 'flourish' as const,
                  },
                ]
              : journalEntries;
          const nextJournalEntries = reconcileJournalWithLatestChallenge(
            entriesWithFlourish,
            nextChallenges,
            awardedAt
          );

          updatedStudent = {
            ...student,
            points: student.points + safePointBonus,
            companion: {
              ...student.companion,
              petPoints:
                (student.companion.petPoints ?? 0) + safePointBonus,
              ownedFlourishes: [...ownedFlourishes, cleanFlourishId],
              activeFlourishes: student.companion.activeFlourishes ?? [],
              celebratedStages:
                student.companion.celebratedStages ?? ['egg'],
              behaviorMemories: nextMemories,
              traitChallenges: nextChallenges,
              journalEntries: nextJournalEntries,
            },
          };

          return {
            students: {
              ...state.students,
              [studentId]: updatedStudent,
            },
          };
        });

        if (!updatedStudent) return false;

        await syncStudentToSupabase(updatedStudent);
        return true;
      },

      undoCompanionFlourishAward: async (
        studentId,
        flourishId,
        pointBonus
      ) => {
        let updatedStudent: StudentState | null = null;
        const cleanFlourishId = flourishId.trim();
        const safePointBonus = Math.max(0, Math.round(pointBonus));

        set(state => {
          const student = state.students[studentId];
          if (!student) return state;

          const ownedFlourishes = student.companion.ownedFlourishes ?? [];
          if (!ownedFlourishes.includes(cleanFlourishId)) return state;

          const nextMemories = (
            student.companion.behaviorMemories ?? []
          ).filter(memory => memory.id !== `flourish:${cleanFlourishId}`);
          const nextChallenges = reconcileLatestCompanionTraitChallenge(
            student.companion.traitChallenges ?? [],
            nextMemories,
            Date.now()
          );
          const journalEntries = (
            student.companion.journalEntries ?? []
          ).filter(
            entry => entry.id !== `journal:flourish:${cleanFlourishId}`
          );
          const nextJournalEntries = reconcileJournalWithLatestChallenge(
            journalEntries,
            nextChallenges,
            Date.now()
          );

          updatedStudent = {
            ...student,
            points: Math.max(0, student.points - safePointBonus),
            companion: {
              ...student.companion,
              petPoints: Math.max(
                0,
                (student.companion.petPoints ?? 0) - safePointBonus
              ),
              ownedFlourishes: ownedFlourishes.filter(
                id => id !== cleanFlourishId
              ),
              activeFlourishes: (
                student.companion.activeFlourishes ?? []
              ).filter(id => id !== cleanFlourishId),
              behaviorMemories: nextMemories,
              traitChallenges: nextChallenges,
              journalEntries: nextJournalEntries,
            },
          };

          return {
            students: {
              ...state.students,
              [studentId]: updatedStudent,
            },
          };
        });

        if (updatedStudent) {
          await syncStudentToSupabase(updatedStudent);
        }
      },

      unlockCompanionSkill: async (studentId, skillId) => {
        const cleanSkillId = skillId.trim();
        const skill = getCompanionSkill(cleanSkillId);
        let updatedStudent: StudentState | null = null;
        let result: CompanionSkillUnlockResult = 'not-found';

        if (!skill) return result;

        set(state => {
          const student = state.students[studentId];
          if (!student) return state;

          const unlockedSkills = student.companion.unlockedSkills ?? [];

          if (unlockedSkills.includes(skill.id)) {
            result = 'already-owned';
            return state;
          }

          if (
            !companionStageMeetsRequirement(
              student.companion.stage,
              skill.requiredStage
            )
          ) {
            result = 'stage-locked';
            return state;
          }

          if (
            !skill.prerequisites.every(prerequisite =>
              unlockedSkills.includes(prerequisite)
            )
          ) {
            result = 'prerequisite-locked';
            return state;
          }

          const availablePetPoints = student.companion.petPoints ?? 0;
          if (availablePetPoints < skill.cost) {
            result = 'insufficient-points';
            return state;
          }

          updatedStudent = {
            ...student,
            companion: {
              ...student.companion,
              petPoints: availablePetPoints - skill.cost,
              unlockedSkills: [...unlockedSkills, skill.id],
              treasuresFound: student.companion.treasuresFound ?? 0,
            },
          };
          result = 'unlocked';

          return {
            students: {
              ...state.students,
              [studentId]: updatedStudent,
            },
          };
        });

        if (updatedStudent) {
          await syncStudentToSupabase(updatedStudent);
        }

        return result;
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
          const nextPetPoints = Math.max(
            0,
            (cur.companion.petPoints ?? 0) + delta
          );

          updatedStudent = {
            ...cur,
            points: nextPoints,
            companion: {
              ...cur.companion,
              petPoints: nextPetPoints,
              celebratedStages: cur.companion.celebratedStages ?? ['egg'],
            },
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
