import { supabase } from './supabaseClient';

export type LichessRapidTask = {
  id: string;
  missionId: string | null;
  requiredGames: number;
  rewardPoints: number;
  progressGames: number;
  status: 'active' | 'completed' | 'cancelled';
  startedAt: string;
  dueAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  lastCheckedAt: string | null;
};

export type LichessRapidStatus = {
  linked: boolean;
  username: string | null;
  minMovesEach: number;
  activeTask: LichessRapidTask | null;
  lastCompletedTask: LichessRapidTask | null;
  awardedPoints?: number;
  countedGamesAdded?: number;
  completedTask?: LichessRapidTask | null;
  skipped?: boolean;
};

type LichessFunctionResponse = LichessRapidStatus & {
  ok?: boolean;
  error?: string;
  message?: string;
};

async function invokeLichessFunction(
  body: Record<string, unknown>
): Promise<LichessFunctionResponse> {
  const { data, error } = await supabase.functions.invoke('lichess-rapid-sync', {
    body,
  });

  if (error) {
    console.error('Lichess integration error:', error);

    let serverMessage = '';
    try {
      const context = (error as { context?: Response }).context;
      if (context && typeof context.clone === 'function') {
        const payload = await context.clone().json();
        if (payload && typeof payload === 'object') {
          const message = (payload as { message?: unknown }).message;
          if (typeof message === 'string') serverMessage = message;
        }
      }
    } catch {
      // Fall back to the generic message below.
    }

    throw new Error(serverMessage || 'לא הצלחנו להתחבר כרגע לשירות ליצ׳ס.');
  }

  if (!data || typeof data !== 'object') {
    throw new Error('התקבלה תשובה לא תקינה משירות ליצ׳ס.');
  }

  const response = data as LichessFunctionResponse;

  if (response.ok === false || response.error) {
    throw new Error(response.message || response.error || 'פעולת ליצ׳ס נכשלה.');
  }

  return response;
}

export async function getLichessRapidStatus(
  studentId: string
): Promise<LichessRapidStatus> {
  return invokeLichessFunction({
    action: 'status',
    studentId,
  });
}

export async function syncLichessRapid(
  studentId: string
): Promise<LichessRapidStatus> {
  return invokeLichessFunction({
    action: 'sync',
    studentId,
  });
}

export async function linkLichessAccount(input: {
  studentId: string;
  teacherId: string;
  username: string;
}): Promise<LichessRapidStatus> {
  return invokeLichessFunction({
    action: 'link',
    studentId: input.studentId,
    teacherId: input.teacherId,
    username: input.username,
  });
}

export async function unlinkLichessAccount(input: {
  studentId: string;
  teacherId: string;
}): Promise<LichessRapidStatus> {
  return invokeLichessFunction({
    action: 'unlink',
    studentId: input.studentId,
    teacherId: input.teacherId,
  });
}

export async function createLichessRapidTask(input: {
  studentId: string;
  teacherId: string;
  missionId: string;
  title: string;
  description: string;
  requiredGames: number;
  rewardPoints: number;
  dueAt: number | null;
}): Promise<LichessRapidStatus> {
  return invokeLichessFunction({
    action: 'create_task',
    studentId: input.studentId,
    teacherId: input.teacherId,
    missionId: input.missionId,
    title: input.title,
    description: input.description,
    requiredGames: input.requiredGames,
    rewardPoints: input.rewardPoints,
    dueAt: input.dueAt,
  });
}

export async function cancelLichessRapidTask(input: {
  studentId: string;
  teacherId: string;
  missionId?: string;
}): Promise<LichessRapidStatus> {
  return invokeLichessFunction({
    action: 'cancel_task',
    studentId: input.studentId,
    teacherId: input.teacherId,
    missionId: input.missionId ?? null,
  });
}
