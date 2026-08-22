export type MissionRewardTier = 'small' | 'medium' | 'weekly';

export type MissionRewardPreset = {
  id: MissionRewardTier;
  labelHe: string;
  helperHe: string;
  points: number;
  emoji: string;
};

export const MISSION_REWARD_PRESETS: Record<MissionRewardTier, MissionRewardPreset> = {
  small: {
    id: 'small',
    labelHe: 'משימה קטנה',
    helperHe: 'מתאים למשימה קצרה או חד־פעמית.',
    points: 2,
    emoji: '🌱',
  },
  medium: {
    id: 'medium',
    labelHe: 'משימה בינונית',
    helperHe: 'מתאים למשימה שדורשת קצת יותר השקעה.',
    points: 4,
    emoji: '⭐',
  },
  weekly: {
    id: 'weekly',
    labelHe: 'משימה שבועית / מיוחדת',
    helperHe: 'למשימה משמעותית יותר. עדיין נשמר תגמול מתון.',
    points: 7,
    emoji: '🏅',
  },
};

export const MISSION_REWARD_TIERS: MissionRewardTier[] = [
  'small',
  'medium',
  'weekly',
];

export type StudentMission = {
  id: string;
  title: string;
  description: string;
  rewardTier: MissionRewardTier;
  rewardPoints: number;
  assignedAt: number;
  dueAt: number | null;
  completedAt: number | null;
  cancelledAt: number | null;
};

export function missionRewardPreset(
  tier: MissionRewardTier
): MissionRewardPreset {
  return MISSION_REWARD_PRESETS[tier];
}

export function normalizeStudentMissions(value: unknown): StudentMission[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((candidate): StudentMission[] => {
    if (!candidate || typeof candidate !== 'object') return [];

    const raw = candidate as Record<string, unknown>;
    const id = typeof raw.id === 'string' ? raw.id.trim() : '';
    const title = typeof raw.title === 'string' ? raw.title.trim() : '';
    const description =
      typeof raw.description === 'string' ? raw.description.trim() : '';
    const rewardTier = isMissionRewardTier(raw.rewardTier)
      ? raw.rewardTier
      : 'small';
    const preset = MISSION_REWARD_PRESETS[rewardTier];
    const rewardPoints =
      typeof raw.rewardPoints === 'number' && Number.isFinite(raw.rewardPoints)
        ? Math.max(0, Math.round(raw.rewardPoints))
        : preset.points;
    const assignedAt =
      typeof raw.assignedAt === 'number' && Number.isFinite(raw.assignedAt)
        ? raw.assignedAt
        : Date.now();
    const dueAt = nullableTimestamp(raw.dueAt);
    const completedAt = nullableTimestamp(raw.completedAt);
    const cancelledAt = nullableTimestamp(raw.cancelledAt);

    if (!id || !title) return [];

    return [
      {
        id,
        title,
        description,
        rewardTier,
        rewardPoints,
        assignedAt,
        dueAt,
        completedAt,
        cancelledAt,
      },
    ];
  });
}

export function isMissionActive(mission: StudentMission): boolean {
  return mission.completedAt === null && mission.cancelledAt === null;
}

export function isMissionCompleted(mission: StudentMission): boolean {
  return mission.completedAt !== null && mission.cancelledAt === null;
}

export function isMissionOverdue(
  mission: StudentMission,
  now = Date.now()
): boolean {
  return (
    isMissionActive(mission) &&
    mission.dueAt !== null &&
    mission.dueAt < now
  );
}

function isMissionRewardTier(value: unknown): value is MissionRewardTier {
  return value === 'small' || value === 'medium' || value === 'weekly';
}

function nullableTimestamp(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
