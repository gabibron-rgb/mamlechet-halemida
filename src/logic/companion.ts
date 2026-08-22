import { DAILY_CARE_XP_CAP } from '../data/companionWorlds';
import type { StudentState } from '../store/useGameStore';
import { levelFromXp } from './leveling';
import { xpForSpend } from './purchase';

export const HATCH_BOND_REQUIRED = 30;

export type CompanionCareActionId = 'pet' | 'feed' | 'play' | 'train';

export type CompanionCareAction = {
  id: CompanionCareActionId;
  emoji: string;
  nameHe: string;
  descriptionHe: string;
  pointCost: number;
  bondGain: number;
};

export const COMPANION_CARE_ACTIONS: CompanionCareAction[] = [
  {
    id: 'pet',
    emoji: '🤍',
    nameHe: 'ליטוף קצר',
    descriptionHe: 'רגע קטן של תשומת לב וחברות',
    pointCost: 2,
    bondGain: 1,
  },
  {
    id: 'feed',
    emoji: '🍎',
    nameHe: 'ארוחה טובה',
    descriptionHe: 'משהו טעים שנותן לביצה כוח',
    pointCost: 4,
    bondGain: 3,
  },
  {
    id: 'play',
    emoji: '🧶',
    nameHe: 'משחק משותף',
    descriptionHe: 'זמן משחק שמחזק את הקשר',
    pointCost: 6,
    bondGain: 4,
  },
  {
    id: 'train',
    emoji: '✨',
    nameHe: 'אימון קסום',
    descriptionHe: 'אימון מיוחד שמעיר את הקסם שבביצה',
    pointCost: 8,
    bondGain: 5,
  },
];

export function careXpForAction(action: CompanionCareAction): number {
  return xpForSpend(action.pointCost, 'companionCare');
}

export function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function companionCareStatus(student: StudentState, date = new Date()) {
  const today = localDateKey(date);
  const careXpToday =
    student.companion.lastCareDate === today
      ? student.companion.careXpToday
      : 0;

  return {
    today,
    careXpToday,
    remainingXp: Math.max(0, DAILY_CARE_XP_CAP - careXpToday),
    dailyCap: DAILY_CARE_XP_CAP,
  };
}

type CareResult =
  | {
      ok: true;
      patch: Partial<StudentState>;
      action: CompanionCareAction;
      xpGain: number;
      bondGain: number;
      hatched: boolean;
    }
  | {
      ok: false;
      reason: string;
    };

export function applyCompanionCare(
  student: StudentState,
  actionId: CompanionCareActionId,
  date = new Date()
): CareResult {
  if (!student.companion.unlocked || !student.companion.theme) {
    return { ok: false, reason: 'צריך לבחור קודם עולם לחיית המחמד' };
  }

  const action = COMPANION_CARE_ACTIONS.find(item => item.id === actionId);
  if (!action) return { ok: false, reason: 'פעולת הטיפול לא נמצאה' };

  if (student.points < action.pointCost) {
    return { ok: false, reason: 'אין מספיק נקודות לפעולה הזאת' };
  }

  const status = companionCareStatus(student, date);
  const xpGain = careXpForAction(action);

  if (xpGain > status.remainingXp) {
    return {
      ok: false,
      reason:
        status.remainingXp === 0
          ? 'הגעת למגבלת הטיפול היומית. אפשר לחזור מחר.'
          : `נשאר מקום לעוד ${status.remainingXp} XP בלבד היום`,
    };
  }

  const nextBond = student.companion.bond + action.bondGain;
  const hatched =
    student.companion.stage === 'egg' && nextBond >= HATCH_BOND_REQUIRED;
  const nextStage = hatched ? 'hatchling' : student.companion.stage;
  const nextXp = student.xp + xpGain;
  const nextLevel = levelFromXp(nextXp);
  const levelsGained = Math.max(0, nextLevel - student.level);

  return {
    ok: true,
    patch: {
      points: student.points - action.pointCost,
      xp: nextXp,
      level: nextLevel,
      pendingLevelUps: student.pendingLevelUps + levelsGained,
      companion: {
        ...student.companion,
        stage: nextStage,
        bond: nextBond,
        lastCareDate: status.today,
        careXpToday: status.careXpToday + xpGain,
      },
    },
    action,
    xpGain,
    bondGain: action.bondGain,
    hatched,
  };
}
