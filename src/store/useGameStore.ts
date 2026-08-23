import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_UNLOCKED_THEMES, THEMES } from '../data/themes';
import type { ThemeId } from '../data/themes';
import type { CompanionStage } from '../data/companionWorlds';
import type { Zone } from '../data/items';
import type { CapacityKey } from '../data/levels';
import { genId } from '../utils/storage';
import type { BoxTier } from '../data/boxes';
import { supabase } from '../lib/supabaseClient';
import { getCompanionFlourish } from '../data/companionFlourishes';
import { companionStageForProgress } from '../data/companionEvolution';
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
import {
  MISSION_REWARD_PRESETS,
  normalizeStudentMissions,
  type MissionRewardTier,
  type StudentMission,
} from '../data/missions';
import {
  normalizeStudentClassGoals,
  withClassGoalContribution,
  withoutClassGoalContribution,
  isClassGoalActive,
  type ClassGoalMetric,
  type StudentClassGoal,
} from '../data/classGoals';
import {
  classKingdomRewardForLevel,
  classKingdomStars,
  normalizeClassKingdomClaimedRewards,
} from '../data/classKingdom';
import {
  achievementById,
  achievementHasMissingDurableReward,
  achievementHasReward,
  normalizeAchievementRecords,
  normalizeSpecialUnlocks,
  reconcileAchievementRecords,
  type AchievementRecord,
  type SpecialUnlockEntry,
} from '../data/achievements';
import {
  journeyById,
  journeyNeedsThemeChoice,
  normalizeJourneyRecords,
  reconcileJourneyRecords,
  type JourneyRecord,
} from '../data/specialJourneys';
import { reconcileBasicStudentTitles, type StudentGender } from '../data/studentTitles';

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
  roomId?: 'main' | 'treasure_gallery' | null;

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
  gender: StudentGender | null;
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
  missions: StudentMission[];
  classGoals: StudentClassGoal[];
  claimedClassKingdomRewards: number[];
  achievementRecords: AchievementRecord[];
  journeyRecords: JourneyRecord[];
  specialUnlocks: SpecialUnlockEntry[];
  activeTitleUnlockId: string | null;
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
  setStudentGender: (id: StudentId, gender: StudentGender) => Promise<boolean>;
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

  assignMissionToStudents: (
    studentIds: StudentId[],
    input: {
      title: string;
      description: string;
      rewardTier: MissionRewardTier;
      dueAt: number | null;
    }
  ) => Promise<boolean>;
  completeMission: (
    studentId: StudentId,
    missionId: string
  ) => Promise<boolean>;
  cancelMission: (
    studentId: StudentId,
    missionId: string
  ) => Promise<boolean>;
  createClassGoal: (
    classId: string,
    input: {
      title: string;
      description: string;
      metric: ClassGoalMetric;
      target: number;
      dueAt: number | null;
    }
  ) => Promise<boolean>;
  cancelClassGoal: (
    classId: string,
    goalId: string
  ) => Promise<boolean>;
  recordClassGoalContribution: (
    classId: string,
    metric: ClassGoalMetric,
    contributionId: string
  ) => Promise<void>;
  removeClassGoalContribution: (
    classId: string,
    metric: ClassGoalMetric,
    contributionId: string
  ) => Promise<void>;
  awardClassGoalExcellence: (
    classId: string,
    goalId: string
  ) => Promise<boolean>;
  undoClassGoalExcellence: (
    classId: string,
    goalId: string,
    batchId: string
  ) => Promise<boolean>;
  claimClassKingdomReward: (
    studentId: StudentId,
    rewardLevel: number,
    themeId?: ThemeId
  ) => Promise<boolean>;
  reconcileAchievements: (studentId: StudentId) => Promise<string[]>;
  claimAchievementReward: (
    studentId: StudentId,
    achievementId: string,
    themeId?: ThemeId
  ) => Promise<boolean>;
  reconcileSpecialJourneys: (studentId: StudentId) => Promise<{
    newlyDiscoveredIds: string[];
    newlyCompletedStageIds: Array<{ journeyId: string; stageId: string }>;
    newlyCompletedIds: string[];
  }>;
  claimSpecialJourneyReward: (
    studentId: StudentId,
    journeyId: string,
    themeId?: ThemeId
  ) => Promise<boolean>;
  setActiveTitle: (
    studentId: StudentId,
    unlockId: string | null
  ) => Promise<boolean>;

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
    gender: student.gender,
    points: student.points,
    xp: student.xp,
    level: student.level,
    inventory: student.inventory,
    meta: {
      unlockedThemes: student.unlockedThemes,
      capacities: student.capacities,
      companion: student.companion,
      missions: student.missions ?? [],
      classGoals: student.classGoals ?? [],
      claimedClassKingdomRewards: student.claimedClassKingdomRewards ?? [],
      achievementRecords: student.achievementRecords ?? [],
      journeyRecords: student.journeyRecords ?? [],
      specialUnlocks: student.specialUnlocks ?? [],
      activeTitleUnlockId: student.activeTitleUnlockId ?? null,
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
    gender: null,
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
    missions: [],
    classGoals: [],
    claimedClassKingdomRewards: [],
    achievementRecords: [],
    journeyRecords: [],
    specialUnlocks: [],
    activeTitleUnlockId: null,
    pastRewards: [],
    trophies: [],
    seenTrophyIds: [],
    pityCounters: {},
    pendingLevelUps: 0,
    pendingThemeUnlocks: 0,
  };
}

function withReconciledAchievements(student: StudentState): StudentState {
  const reconciled = reconcileAchievementRecords(
    student,
    student.achievementRecords ?? []
  );

  if (reconciled.newlyAchievedIds.length === 0) return student;
  return {
    ...student,
    achievementRecords: reconciled.records,
  };
}

function studentFromSupabase(row: any, classId: string): StudentState {
  const base = defaultStudent(row.name ?? 'תלמיד/ה', classId);
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
    ...base,

    id: row.id,
    supabaseId: row.id,
    loginName: row.login_name ?? undefined,

    name: row.name ?? base.name,
    classId,
    gender: row.gender === 'male' || row.gender === 'female' ? row.gender : null,

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


function classGoalDayKey(timestamp: number): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jerusalem',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(timestamp));

  const values = Object.fromEntries(
    parts.map(part => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function dailyBehaviorContributionId(
  goalId: string,
  studentId: string,
  timestamp: number
): string {
  return `behavior-day:${goalId}:${studentId}:${classGoalDayKey(timestamp)}`;
}

function isMemoryEligibleForGoalDay(
  memory: CompanionBehaviorMemory,
  goal: StudentClassGoal,
  dayKey: string
): boolean {
  if (classGoalDayKey(memory.awardedAt) !== dayKey) return false;
  if (memory.awardedAt < goal.createdAt) return false;
  if (goal.completedAt !== null && memory.awardedAt > goal.completedAt) return false;
  if (goal.cancelledAt !== null && memory.awardedAt > goal.cancelledAt) return false;
  return true;
}

function classExcellenceContributionPrefix(
  goalId: string,
  batchId: string
): string {
  return `class-excellence:${goalId}:${batchId}:`;
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

        const studentsFromDb = (data ?? []).map((row: any) =>
          studentFromSupabase(row, row.class_id ?? classId)
        );

        set((state) => {
          const nextStudents = { ...state.students };
          const loadedIds = new Set(studentsFromDb.map(student => student.id));

          // Remove persisted Supabase students that are no longer members of
          // this class (for example after a teacher transfers them). Keep
          // local-only test students untouched.
          for (const [studentId, student] of Object.entries(nextStudents)) {
            if (
              student.classId === classId &&
              student.supabaseId &&
              !loadedIds.has(studentId)
            ) {
              delete nextStudents[studentId];
            }
          }

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

          updatedStudent = withReconciledAchievements({
            ...cur,
            ...patch,
          });

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

      setStudentGender: async (id, gender) => {
        const student = get().students[id];
        if (!student) return false;

        const supabaseId = student.supabaseId ?? (isUuid(student.id) ? student.id : null);
        const loginName = student.loginName?.trim();
        const studentName = student.name?.trim();

        let query = supabase
          .from('students')
          .update({
            gender,
            updated_at: new Date().toISOString(),
          })
          .select('id, gender');

        if (supabaseId) {
          query = query.eq('id', supabaseId);
        } else if (loginName) {
          query = query.eq('login_name', loginName);
        } else if (studentName) {
          query = query.eq('name', studentName);
        } else {
          console.warn('Cannot save student gender: missing id/loginName/name', student);
          return false;
        }

        const { data, error } = await query.maybeSingle();

        if (error) {
          console.error('Error saving student gender to Supabase:', error);
          return false;
        }

        if (!data) {
          console.warn('No matching student found while saving gender:', student);
          return false;
        }

        set(state => {
          const current = state.students[id];
          if (!current) return state;

          return {
            students: {
              ...state.students,
              [id]: {
                ...current,
                gender,
              },
            },
          };
        });

        return true;
      },

      awardTrophy: (studentId, trophyTheme, caption) => {
        let updatedStudent: StudentState | null = null;
        const cleanTheme = trophyTheme.trim();
        const cleanCaption = caption.trim();

        if (!cleanTheme || !cleanCaption) return;

        set((state) => {
          const student = state.students[studentId];
          if (!student) return state;

          updatedStudent = withReconciledAchievements({
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
          });

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

          updatedStudent = withReconciledAchievements({
            ...student,
            points: student.points + safeAmount,
            companion: {
              ...student.companion,
              stage: companionStageForProgress({
                bond: student.companion.bond ?? 0,
                currentStage: student.companion.stage,
                behaviorMemories: nextMemories,
                traitChallenges: nextChallenges,
              }),
              petPoints:
                (student.companion.petPoints ?? 0) + safeAmount,
              behaviorMemories: nextMemories,
              traitChallenges: nextChallenges,
              journalEntries: nextJournalEntries,
            },
          });

          return {
            students: {
              ...state.students,
              [studentId]: updatedStudent,
            },
          };
        });

        if (updatedStudent) {
          await syncStudentToSupabase(updatedStudent);

          const latestStudent = get().students[studentId];
          const classId = latestStudent?.classId;
          const activeBehaviorGoal = latestStudent?.classGoals
            .filter(goal => goal.metric === 'behavior' && isClassGoalActive(goal))
            .sort((first, second) => second.createdAt - first.createdAt)[0] ?? null;

          if (
            classId &&
            activeBehaviorGoal &&
            traitId &&
            cleanActivityId &&
            safeAmount > 0
          ) {
            const awardedDayKey = classGoalDayKey(awardedAt);
            const legacyPrefix = `behavior:${studentId}:`;
            const behaviorMemories = latestStudent?.companion.behaviorMemories ?? [];
            const alreadyCountedToday = activeBehaviorGoal.contributionIds.some(
              contributionId => {
                if (
                  contributionId === dailyBehaviorContributionId(
                    activeBehaviorGoal.id,
                    studentId,
                    awardedAt
                  )
                ) {
                  return true;
                }

                if (!contributionId.startsWith(legacyPrefix)) return false;
                const legacyActivityId = contributionId.slice(legacyPrefix.length);
                const matchingMemory = behaviorMemories.find(
                  memory => memory.id === legacyActivityId
                );
                return matchingMemory
                  ? isMemoryEligibleForGoalDay(
                      matchingMemory,
                      activeBehaviorGoal,
                      awardedDayKey
                    )
                  : false;
              }
            );

            if (!alreadyCountedToday) {
              await get().recordClassGoalContribution(
                classId,
                'behavior',
                dailyBehaviorContributionId(
                  activeBehaviorGoal.id,
                  studentId,
                  awardedAt
                )
              );
            }
          }
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
        let removedMemory: CompanionBehaviorMemory | null = null;
        let remainingMemories: CompanionBehaviorMemory[] = [];

        set(state => {
          const student = state.students[studentId];
          if (!student) return state;

          removedMemory = (
            student.companion.behaviorMemories ?? []
          ).find(memory => memory.id === cleanActivityId) ?? null;
          remainingMemories = (
            student.companion.behaviorMemories ?? []
          ).filter(memory => memory.id !== cleanActivityId);
          const nextChallenges = reconcileLatestCompanionTraitChallenge(
            student.companion.traitChallenges ?? [],
            remainingMemories,
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
              behaviorMemories: remainingMemories,
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

          const studentAfterUndo = get().students[studentId];
          const classId = studentAfterUndo?.classId;
          const memoryToRemove = removedMemory as CompanionBehaviorMemory | null;
          if (classId && memoryToRemove) {
            const removedDayKey = classGoalDayKey(memoryToRemove.awardedAt);
            const behaviorGoals = (studentAfterUndo?.classGoals ?? []).filter(
              goal => goal.metric === 'behavior'
            );
            let removedDailyContribution = false;

            for (const goal of behaviorGoals) {
              const contributionId = dailyBehaviorContributionId(
                goal.id,
                studentId,
                memoryToRemove.awardedAt
              );
              if (!goal.contributionIds.includes(contributionId)) continue;

              const anotherEligibleMemoryExists = remainingMemories.some(memory =>
                isMemoryEligibleForGoalDay(memory, goal, removedDayKey)
              );

              if (anotherEligibleMemoryExists) continue;

              await get().removeClassGoalContribution(
                classId,
                'behavior',
                contributionId
              );
              removedDailyContribution = true;
            }

            if (!removedDailyContribution) {
              await get().removeClassGoalContribution(
                classId,
                'behavior',
                `behavior:${studentId}:${cleanActivityId}`
              );
            }
          }
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
              stage: companionStageForProgress({
                bond: student.companion.bond ?? 0,
                currentStage: student.companion.stage,
                behaviorMemories: nextMemories,
                traitChallenges: nextChallenges,
              }),
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

      assignMissionToStudents: async (studentIds, input) => {
        const cleanTitle = input.title.trim().slice(0, 80);
        const cleanDescription = input.description.trim().slice(0, 240);
        const uniqueIds = Array.from(new Set(studentIds)).filter(Boolean);
        const preset = MISSION_REWARD_PRESETS[input.rewardTier];
        const dueAt =
          typeof input.dueAt === 'number' && Number.isFinite(input.dueAt)
            ? input.dueAt
            : null;

        if (!cleanTitle || uniqueIds.length === 0 || !preset) return false;

        const missionId = genId('mission');
        const assignedAt = Date.now();
        const updatedStudents: StudentState[] = [];

        set(state => {
          const nextStudents = { ...state.students };

          for (const studentId of uniqueIds) {
            const student = nextStudents[studentId];
            if (!student) continue;

            const mission: StudentMission = {
              id: missionId,
              title: cleanTitle,
              description: cleanDescription,
              rewardTier: input.rewardTier,
              rewardPoints: preset.points,
              assignedAt,
              dueAt,
              completedAt: null,
              cancelledAt: null,
            };

            const updatedStudent: StudentState = {
              ...student,
              missions: [...(student.missions ?? []), mission],
            };

            nextStudents[studentId] = updatedStudent;
            updatedStudents.push(updatedStudent);
          }

          return updatedStudents.length > 0
            ? { students: nextStudents }
            : state;
        });

        if (updatedStudents.length === 0) return false;
        await Promise.all(updatedStudents.map(syncStudentToSupabase));
        return true;
      },

      completeMission: async (studentId, missionId) => {
        const cleanMissionId = missionId.trim();
        let updatedStudent: StudentState | null = null;

        if (!cleanMissionId) return false;

        set(state => {
          const student = state.students[studentId];
          if (!student) return state;

          const missions = student.missions ?? [];
          const mission = missions.find(item => item.id === cleanMissionId);
          if (
            !mission ||
            mission.completedAt !== null ||
            mission.cancelledAt !== null
          ) {
            return state;
          }

          const completedAt = Date.now();
          const rewardPoints = Math.max(0, Math.round(mission.rewardPoints));

          updatedStudent = withReconciledAchievements({
            ...student,
            points: student.points + rewardPoints,
            missions: missions.map(item =>
              item.id === cleanMissionId
                ? { ...item, completedAt }
                : item
            ),
            companion: {
              ...student.companion,
              petPoints: (student.companion.petPoints ?? 0) + rewardPoints,
            },
          });

          return {
            students: {
              ...state.students,
              [studentId]: updatedStudent,
            },
          };
        });

        if (!updatedStudent) return false;
        await syncStudentToSupabase(updatedStudent);
        const classId = get().students[studentId]?.classId;
        if (classId) {
          await get().recordClassGoalContribution(
            classId,
            'missions',
            `mission:${studentId}:${cleanMissionId}`
          );
        }
        return true;
      },

      cancelMission: async (studentId, missionId) => {
        const cleanMissionId = missionId.trim();
        let updatedStudent: StudentState | null = null;

        if (!cleanMissionId) return false;

        set(state => {
          const student = state.students[studentId];
          if (!student) return state;

          const missions = student.missions ?? [];
          const mission = missions.find(item => item.id === cleanMissionId);
          if (
            !mission ||
            mission.completedAt !== null ||
            mission.cancelledAt !== null
          ) {
            return state;
          }

          const cancelledAt = Date.now();
          updatedStudent = {
            ...student,
            missions: missions.map(item =>
              item.id === cleanMissionId
                ? { ...item, cancelledAt }
                : item
            ),
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

      createClassGoal: async (classId, input) => {
        const cleanClassId = classId.trim();
        const cleanTitle = input.title.trim().slice(0, 80);
        const cleanDescription = input.description.trim().slice(0, 240);
        const target = Math.min(200, Math.max(5, Math.round(input.target)));
        const dueAt =
          typeof input.dueAt === 'number' && Number.isFinite(input.dueAt)
            ? input.dueAt
            : null;

        if (!cleanClassId || !cleanTitle) return false;

        const classStudents = Object.values(get().students).filter(
          student => student.classId === cleanClassId
        );
        if (classStudents.length === 0) return false;
        if (
          classStudents.some(student =>
            (student.classGoals ?? []).some(isClassGoalActive)
          )
        ) {
          return false;
        }

        const createdAt = Date.now();
        const goal: StudentClassGoal = {
          id: genId('class-goal'),
          title: cleanTitle,
          description: cleanDescription,
          metric: input.metric,
          target,
          contributionIds: [],
          createdAt,
          dueAt,
          completedAt: null,
          cancelledAt: null,
        };
        const updatedStudents: StudentState[] = [];

        set(state => {
          const nextStudents = { ...state.students };

          for (const student of Object.values(nextStudents)) {
            if (student.classId !== cleanClassId) continue;

            const updatedStudent: StudentState = {
              ...student,
              classGoals: [...(student.classGoals ?? []), { ...goal }],
            };
            nextStudents[student.id] = updatedStudent;
            updatedStudents.push(updatedStudent);
          }

          return updatedStudents.length > 0 ? { students: nextStudents } : state;
        });

        if (updatedStudents.length === 0) return false;
        await Promise.all(updatedStudents.map(syncStudentToSupabase));
        return true;
      },

      cancelClassGoal: async (classId, goalId) => {
        const cleanClassId = classId.trim();
        const cleanGoalId = goalId.trim();
        if (!cleanClassId || !cleanGoalId) return false;

        const cancelledAt = Date.now();
        const updatedStudents: StudentState[] = [];

        set(state => {
          const nextStudents = { ...state.students };

          for (const student of Object.values(nextStudents)) {
            if (student.classId !== cleanClassId) continue;

            let changed = false;
            const classGoals = (student.classGoals ?? []).map(goal => {
              if (goal.id !== cleanGoalId || !isClassGoalActive(goal)) return goal;
              changed = true;
              return { ...goal, cancelledAt };
            });
            if (!changed) continue;

            const updatedStudent: StudentState = { ...student, classGoals };
            nextStudents[student.id] = updatedStudent;
            updatedStudents.push(updatedStudent);
          }

          return updatedStudents.length > 0 ? { students: nextStudents } : state;
        });

        if (updatedStudents.length === 0) return false;
        await Promise.all(updatedStudents.map(syncStudentToSupabase));
        return true;
      },

      recordClassGoalContribution: async (classId, metric, contributionId) => {
        const cleanClassId = classId.trim();
        const cleanContributionId = contributionId.trim();
        if (!cleanClassId || !cleanContributionId) return;

        const updatedStudents: StudentState[] = [];
        const at = Date.now();

        set(state => {
          const nextStudents = { ...state.students };

          for (const student of Object.values(nextStudents)) {
            if (student.classId !== cleanClassId) continue;

            let changed = false;
            const classGoals = (student.classGoals ?? []).map(goal => {
              if (goal.metric !== metric || !isClassGoalActive(goal)) return goal;
              const nextGoal = withClassGoalContribution(goal, cleanContributionId, at);
              if (nextGoal !== goal) changed = true;
              return nextGoal;
            });
            if (!changed) continue;

            const updatedStudent: StudentState = { ...student, classGoals };
            nextStudents[student.id] = updatedStudent;
            updatedStudents.push(updatedStudent);
          }

          return updatedStudents.length > 0 ? { students: nextStudents } : state;
        });

        if (updatedStudents.length > 0) {
          await Promise.all(updatedStudents.map(syncStudentToSupabase));
        }
      },

      removeClassGoalContribution: async (classId, metric, contributionId) => {
        const cleanClassId = classId.trim();
        const cleanContributionId = contributionId.trim();
        if (!cleanClassId || !cleanContributionId) return;

        const updatedStudents: StudentState[] = [];

        set(state => {
          const nextStudents = { ...state.students };

          for (const student of Object.values(nextStudents)) {
            if (student.classId !== cleanClassId) continue;

            let changed = false;
            const classGoals = (student.classGoals ?? []).map(goal => {
              if (goal.metric !== metric) return goal;
              const nextGoal = withoutClassGoalContribution(goal, cleanContributionId);
              if (nextGoal !== goal) changed = true;
              return nextGoal;
            });
            if (!changed) continue;

            const updatedStudent: StudentState = { ...student, classGoals };
            nextStudents[student.id] = updatedStudent;
            updatedStudents.push(updatedStudent);
          }

          return updatedStudents.length > 0 ? { students: nextStudents } : state;
        });

        if (updatedStudents.length > 0) {
          await Promise.all(updatedStudents.map(syncStudentToSupabase));
        }
      },

      awardClassGoalExcellence: async (classId, goalId) => {
        const cleanClassId = classId.trim();
        const cleanGoalId = goalId.trim();
        if (!cleanClassId || !cleanGoalId) return false;

        const referenceStudent = Object.values(get().students).find(
          student => student.classId === cleanClassId
        );
        const referenceGoal = referenceStudent?.classGoals.find(
          goal => goal.id === cleanGoalId
        );

        if (
          !referenceGoal ||
          referenceGoal.metric !== 'behavior' ||
          !isClassGoalActive(referenceGoal)
        ) {
          return false;
        }

        const batchId = genId('excellent');
        const prefix = classExcellenceContributionPrefix(cleanGoalId, batchId);
        const contributionIds = Array.from(
          { length: 5 },
          (_, index) => `${prefix}${index + 1}`
        );
        const at = Date.now();
        const updatedStudents: StudentState[] = [];

        set(state => {
          const nextStudents = { ...state.students };

          for (const student of Object.values(nextStudents)) {
            if (student.classId !== cleanClassId) continue;

            let changed = false;
            const classGoals = (student.classGoals ?? []).map(goal => {
              if (
                goal.id !== cleanGoalId ||
                goal.metric !== 'behavior' ||
                !isClassGoalActive(goal)
              ) {
                return goal;
              }

              let nextGoal = goal;
              for (const contributionId of contributionIds) {
                const candidate = withClassGoalContribution(
                  nextGoal,
                  contributionId,
                  at
                );
                if (candidate !== nextGoal) changed = true;
                nextGoal = candidate;
              }
              return nextGoal;
            });

            if (!changed) continue;

            const updatedStudent: StudentState = { ...student, classGoals };
            nextStudents[student.id] = updatedStudent;
            updatedStudents.push(updatedStudent);
          }

          return updatedStudents.length > 0
            ? { students: nextStudents }
            : state;
        });

        if (updatedStudents.length === 0) return false;
        await Promise.all(updatedStudents.map(syncStudentToSupabase));
        return true;
      },

      undoClassGoalExcellence: async (classId, goalId, batchId) => {
        const cleanClassId = classId.trim();
        const cleanGoalId = goalId.trim();
        const cleanBatchId = batchId.trim();
        if (!cleanClassId || !cleanGoalId || !cleanBatchId) return false;

        const referenceStudent = Object.values(get().students).find(
          student => student.classId === cleanClassId
        );
        const hasAnotherActiveGoal = (referenceStudent?.classGoals ?? []).some(
          goal => goal.id !== cleanGoalId && isClassGoalActive(goal)
        );
        if (hasAnotherActiveGoal) return false;

        const prefix = classExcellenceContributionPrefix(
          cleanGoalId,
          cleanBatchId
        );
        const updatedStudents: StudentState[] = [];

        set(state => {
          const nextStudents = { ...state.students };

          for (const student of Object.values(nextStudents)) {
            if (student.classId !== cleanClassId) continue;

            let changed = false;
            const classGoals = (student.classGoals ?? []).map(goal => {
              if (goal.id !== cleanGoalId || goal.cancelledAt !== null) {
                return goal;
              }

              const contributionIds = goal.contributionIds.filter(id => {
                if (!id.startsWith(prefix)) return true;
                changed = true;
                return false;
              });

              if (contributionIds.length === goal.contributionIds.length) {
                return goal;
              }

              return {
                ...goal,
                contributionIds,
                completedAt:
                  contributionIds.length >= goal.target
                    ? goal.completedAt
                    : null,
              };
            });

            if (!changed) continue;

            const updatedStudent: StudentState = { ...student, classGoals };
            nextStudents[student.id] = updatedStudent;
            updatedStudents.push(updatedStudent);
          }

          return updatedStudents.length > 0
            ? { students: nextStudents }
            : state;
        });

        if (updatedStudents.length === 0) return false;
        await Promise.all(updatedStudents.map(syncStudentToSupabase));
        return true;
      },

      claimClassKingdomReward: async (studentId, rewardLevel, themeId) => {
        const reward = classKingdomRewardForLevel(rewardLevel);
        if (!reward) return false;

        const updatedStudents: StudentState[] = [];

        set(state => {
          const student = state.students[studentId];
          if (!student) return state;

          const stars = classKingdomStars(student.classGoals ?? []);
          if (stars < reward.minStars) return state;

          const claimed = student.claimedClassKingdomRewards ?? [];
          if (claimed.includes(reward.level)) return state;

          const now = Date.now();
          let nextInventory = student.inventory;
          let nextPendingThemeUnlocks = student.pendingThemeUnlocks ?? 0;

          if (reward.kind === 'box') {
            if (!reward.boxTier || !themeId) return state;
            if (themeId !== 'generic' && !student.unlockedThemes.includes(themeId)) return state;

            const boxEntry: InventoryEntry = {
              id: `kingdom_box_${reward.level}_${themeId}_${now}`,
              itemId: `box_${reward.boxTier}_${themeId}`,
              kind: 'box',
              boxTier: reward.boxTier,
              boxTheme: themeId,
              acquiredAt: now,
              placedZone: null,
              placedSlot: null,
            };

            nextInventory = [...student.inventory, boxEntry];
          } else {
            const hasLockedTheme = THEMES.some(
              theme =>
                theme.id !== 'generic' &&
                !student.unlockedThemes.includes(theme.id)
            );

            if (hasLockedTheme) {
              nextPendingThemeUnlocks += 1;
            } else {
              const fallbackBox: InventoryEntry = {
                id: `kingdom_box_${reward.level}_fallback_${now}`,
                itemId: 'box_silver_generic',
                kind: 'box',
                boxTier: 'silver',
                boxTheme: 'generic',
                acquiredAt: now,
                placedZone: null,
                placedSlot: null,
              };
              nextInventory = [...student.inventory, fallbackBox];
            }
          }

          const updatedStudent: StudentState = {
            ...student,
            inventory: nextInventory,
            pendingThemeUnlocks: nextPendingThemeUnlocks,
            claimedClassKingdomRewards: [...claimed, reward.level],
          };
          updatedStudents.push(updatedStudent);

          return {
            students: {
              ...state.students,
              [studentId]: updatedStudent,
            },
          };
        });

        if (updatedStudents.length === 0) return false;
        await syncStudentToSupabase(updatedStudents[0]);
        return true;
      },

      reconcileAchievements: async (studentId) => {
        let updatedStudent: StudentState | null = null;
        let newlyAchievedIds: string[] = [];

        set(state => {
          const student = state.students[studentId];
          if (!student) return state;

          const reconciled = reconcileAchievementRecords(
            student,
            student.achievementRecords ?? []
          );
          newlyAchievedIds = reconciled.newlyAchievedIds;

          const studentWithAchievements = {
            ...student,
            achievementRecords: reconciled.records,
          };
          const titleReconciliation = reconcileBasicStudentTitles(
            studentWithAchievements,
            student.specialUnlocks ?? []
          );

          const titlesChanged = titleReconciliation.newlyUnlockedIds.length > 0;
          if (newlyAchievedIds.length === 0 && !titlesChanged) return state;

          const nextActiveTitleUnlockId =
            student.activeTitleUnlockId ??
            titleReconciliation.newlyUnlockedIds[0] ??
            null;

          updatedStudent = {
            ...studentWithAchievements,
            specialUnlocks: titleReconciliation.unlocks,
            activeTitleUnlockId: nextActiveTitleUnlockId,
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

        return newlyAchievedIds;
      },

      claimAchievementReward: async (studentId, achievementId, themeId) => {
        const definition = achievementById(achievementId);
        if (!definition || !achievementHasReward(definition)) return false;

        let updatedStudent: StudentState | null = null;

        set(state => {
          const student = state.students[studentId];
          if (!student) return state;

          const reconciled = reconcileAchievementRecords(
            student,
            student.achievementRecords ?? []
          );
          const record = reconciled.records.find(
            entry => entry.achievementId === achievementId
          );
          if (!record) return state;

          const hasRetroactiveDurableReward =
            record.rewardClaimedAt !== null &&
            achievementHasMissingDurableReward(definition, student);
          if (record.rewardClaimedAt !== null && !hasRetroactiveDurableReward) {
            return state;
          }

          const rewards = definition.rewards ?? [];
          const boxRewards = rewards.filter(reward => reward.kind === 'box');
          if (boxRewards.length > 0 && record.rewardClaimedAt === null) {
            if (!themeId) return state;
            if (
              themeId !== 'generic' &&
              !student.unlockedThemes.includes(themeId)
            ) {
              return state;
            }
          }

          const now = Date.now();
          let nextInventory = [...student.inventory];
          let nextUnlockedThemes = [...student.unlockedThemes];
          let nextSpecialUnlocks = [...(student.specialUnlocks ?? [])];
          let nextActiveTitleUnlockId = student.activeTitleUnlockId ?? null;

          for (const reward of rewards) {
            if (reward.kind === 'box') {
              if (record.rewardClaimedAt !== null) continue;
              const selectedTheme = themeId as ThemeId;
              nextInventory.push({
                id: `achievement_box_${achievementId}_${reward.tier}_${selectedTheme}_${now}_${nextInventory.length}`,
                itemId: `box_${reward.tier}_${selectedTheme}`,
                kind: 'box',
                boxTier: reward.tier,
                boxTheme: selectedTheme,
                acquiredAt: now,
                placedZone: null,
                placedSlot: null,
              });
              continue;
            }

            if (reward.kind === 'inventoryItem') {
              if (nextInventory.some(entry => entry.itemId === reward.itemId)) {
                continue;
              }
              nextInventory.push({
                id: `achievement_item_${achievementId}_${reward.itemId}_${now}_${nextInventory.length}`,
                itemId: reward.itemId,
                kind: reward.inventoryKind,
                acquiredAt: now,
                placedZone: null,
                placedSlot: null,
                roomX: null,
                roomY: null,
                roomScale: 1,
                roomRotation: 0,
              });
              continue;
            }

            if (reward.kind === 'themeUnlock') {
              if (!nextUnlockedThemes.includes(reward.themeId)) {
                nextUnlockedThemes.push(reward.themeId);
              }
              continue;
            }

            if (reward.kind === 'specialUnlock') {
              const alreadyUnlocked = nextSpecialUnlocks.some(
                entry =>
                  entry.kind === reward.unlockKind &&
                  entry.unlockId === reward.unlockId
              );
              if (!alreadyUnlocked) {
                nextSpecialUnlocks.push({
                  unlockId: reward.unlockId,
                  kind: reward.unlockKind,
                  labelHe: reward.labelHe,
                  sourceAchievementId: achievementId,
                  unlockedAt: now,
                });
              }
              if (reward.unlockKind === 'title' && !nextActiveTitleUnlockId) {
                nextActiveTitleUnlockId = reward.unlockId;
              }
            }
          }

          const nextRecords = reconciled.records.map(entry =>
            entry.achievementId === achievementId
              ? { ...entry, rewardClaimedAt: entry.rewardClaimedAt ?? now }
              : entry
          );

          updatedStudent = {
            ...student,
            inventory: nextInventory,
            unlockedThemes: nextUnlockedThemes,
            specialUnlocks: nextSpecialUnlocks,
            activeTitleUnlockId: nextActiveTitleUnlockId,
            achievementRecords: nextRecords,
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

      reconcileSpecialJourneys: async (studentId) => {
        let updatedStudent: StudentState | null = null;
        let newlyDiscoveredIds: string[] = [];
        let newlyCompletedStageIds: Array<{ journeyId: string; stageId: string }> = [];
        let newlyCompletedIds: string[] = [];

        set(state => {
          const student = state.students[studentId];
          if (!student) return state;

          const reconciled = reconcileJourneyRecords(
            student,
            student.journeyRecords ?? []
          );
          newlyDiscoveredIds = reconciled.newlyDiscoveredIds;
          newlyCompletedStageIds = reconciled.newlyCompletedStageIds;
          newlyCompletedIds = reconciled.newlyCompletedIds;

          if (
            newlyDiscoveredIds.length === 0 &&
            newlyCompletedStageIds.length === 0 &&
            newlyCompletedIds.length === 0
          ) {
            return state;
          }

          updatedStudent = {
            ...student,
            journeyRecords: reconciled.records,
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

        return {
          newlyDiscoveredIds,
          newlyCompletedStageIds,
          newlyCompletedIds,
        };
      },

      claimSpecialJourneyReward: async (studentId, journeyId, themeId) => {
        const journey = journeyById(journeyId);
        if (!journey || journey.rewards.length === 0) return false;

        let updatedStudent: StudentState | null = null;

        set(state => {
          const student = state.students[studentId];
          if (!student) return state;

          const reconciled = reconcileJourneyRecords(
            student,
            student.journeyRecords ?? []
          );
          const record = reconciled.records.find(
            entry => entry.journeyId === journeyId
          );

          if (
            !record ||
            record.completedAt === null ||
            record.rewardClaimedAt !== null
          ) {
            return state;
          }

          if (journeyNeedsThemeChoice(journey)) {
            if (!themeId) return state;
            if (
              themeId !== 'generic' &&
              !student.unlockedThemes.includes(themeId)
            ) {
              return state;
            }
          }

          const now = Date.now();
          let nextInventory = [...student.inventory];
          let nextUnlockedThemes = [...student.unlockedThemes];
          let nextSpecialUnlocks = [...(student.specialUnlocks ?? [])];
          let nextActiveTitleUnlockId = student.activeTitleUnlockId ?? null;

          for (const reward of journey.rewards) {
            if (reward.kind === 'box') {
              const selectedTheme = themeId as ThemeId;
              nextInventory.push({
                id: `journey_box_${journeyId}_${reward.tier}_${selectedTheme}_${now}_${nextInventory.length}`,
                itemId: `box_${reward.tier}_${selectedTheme}`,
                kind: 'box',
                boxTier: reward.tier,
                boxTheme: selectedTheme,
                acquiredAt: now,
                placedZone: null,
                placedSlot: null,
              });
              continue;
            }

            if (reward.kind === 'inventoryItem') {
              nextInventory.push({
                id: `journey_item_${journeyId}_${reward.itemId}_${now}_${nextInventory.length}`,
                itemId: reward.itemId,
                kind: reward.inventoryKind,
                acquiredAt: now,
                placedZone: null,
                placedSlot: null,
                roomX: null,
                roomY: null,
                roomScale: 1,
                roomRotation: 0,
              });
              continue;
            }

            if (reward.kind === 'themeUnlock') {
              if (!nextUnlockedThemes.includes(reward.themeId)) {
                nextUnlockedThemes.push(reward.themeId);
              }
              continue;
            }

            if (reward.kind === 'specialUnlock') {
              const alreadyUnlocked = nextSpecialUnlocks.some(
                entry =>
                  entry.kind === reward.unlockKind &&
                  entry.unlockId === reward.unlockId
              );

              if (!alreadyUnlocked) {
                nextSpecialUnlocks.push({
                  unlockId: reward.unlockId,
                  kind: reward.unlockKind,
                  labelHe: reward.labelHe,
                  sourceAchievementId: `journey:${journeyId}`,
                  unlockedAt: now,
                });
              }
              if (reward.unlockKind === 'title' && !nextActiveTitleUnlockId) {
                nextActiveTitleUnlockId = reward.unlockId;
              }
            }
          }

          const nextRecords = reconciled.records.map(entry =>
            entry.journeyId === journeyId
              ? { ...entry, rewardClaimedAt: now }
              : entry
          );

          updatedStudent = {
            ...student,
            inventory: nextInventory,
            unlockedThemes: nextUnlockedThemes,
            specialUnlocks: nextSpecialUnlocks,
            activeTitleUnlockId: nextActiveTitleUnlockId,
            journeyRecords: nextRecords,
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

      setActiveTitle: async (studentId, unlockId) => {
        let updatedStudent: StudentState | null = null;
        let accepted = false;

        set(state => {
          const student = state.students[studentId];
          if (!student) return state;

          if (unlockId !== null) {
            const ownsTitle = (student.specialUnlocks ?? []).some(
              unlock => unlock.kind === 'title' && unlock.unlockId === unlockId
            );
            if (!ownsTitle) return state;
          }

          accepted = true;
          if ((student.activeTitleUnlockId ?? null) === unlockId) return state;

          updatedStudent = {
            ...student,
            activeTitleUnlockId: unlockId,
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

        return accepted;
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

          updatedStudent = withReconciledAchievements({
            ...cur,
            inventory: [...cur.inventory, entry],
          });

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

          updatedStudent = withReconciledAchievements({
            ...cur,
            unlockedThemes: [...cur.unlockedThemes, theme],
          });

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

          updatedStudent = withReconciledAchievements({
            ...student,
            points: student.points + payload.pointBonus,
            capacities,
            inventory: [...student.inventory, cosmeticEntry],
            pendingLevelUps: Math.max(0, (student.pendingLevelUps ?? 0) - 1),
            pendingThemeUnlocks:
              (student.pendingThemeUnlocks ?? 0) +
              (payload.newLevel % 2 === 0 ? 1 : 0),
          });

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

          updatedStudent = withReconciledAchievements({
            ...student,
            unlockedThemes: [...student.unlockedThemes, themeId],
            pendingThemeUnlocks: Math.max(
              0,
              (student.pendingThemeUnlocks ?? 0) - 1
            ),
          });

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
