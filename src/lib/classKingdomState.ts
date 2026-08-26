import type {
  ClassRoomChoiceGroupId,
  ClassRoomItemId,
} from '../data/classRoomItems';
import { supabase } from './supabaseClient';

export type ClassRoomPlacement = {
  instanceId: string;
  itemId: ClassRoomItemId;
  x: number;
  y: number;
  scale: number;
  layer: number;
};

export type ClassRoomChoiceSelections = Partial<
  Record<ClassRoomChoiceGroupId, ClassRoomItemId>
>;

export type ClassRelicVoteSummary = Partial<
  Record<ClassRoomChoiceGroupId, Partial<Record<ClassRoomItemId, number>>>
>;

export type StudentClassRelicVotes = Partial<
  Record<ClassRoomChoiceGroupId, ClassRoomItemId>
>;

export type ClassKingdomSharedState = {
  placements: unknown;
  choices: unknown;
  updatedAt: string | null;
};

export type ClassKingdomStateResult =
  | { ok: true; state: ClassKingdomSharedState }
  | { ok: false; reason: 'missing-table' | 'load-failed' | 'save-failed' | 'not-authorized'; message: string };

const EMPTY_STATE: ClassKingdomSharedState = {
  placements: [],
  choices: {},
  updatedAt: null,
};

function isMissingTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === '42P01' ||
    (/class_kingdom_state|class_kingdom_relic_votes/i.test(error.message ?? '') &&
      /does not exist|schema cache/i.test(error.message ?? ''))
  );
}

function isMissingFunctionError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === '42883' || /function .* does not exist|schema cache/i.test(error.message ?? '');
}

function setupMessage(): string {
  return 'יש להריץ את supabase/class-kingdom-permissions-v2.sql ב-Supabase SQL Editor.';
}

export async function loadClassKingdomState(
  classId: string
): Promise<ClassKingdomStateResult> {
  const cleanClassId = classId.trim();
  if (!cleanClassId) {
    return { ok: false, reason: 'load-failed', message: 'חסר מזהה כיתה.' };
  }

  const { data, error } = await supabase
    .from('class_kingdom_state')
    .select('gate_room_placements, relic_choices, updated_at')
    .eq('class_id', cleanClassId)
    .maybeSingle();

  if (error) {
    console.error('Error loading class kingdom state:', error);
    if (isMissingTableError(error)) {
      return {
        ok: false,
        reason: 'missing-table',
        message: `טבלת הממלכה הכיתתית עדיין לא הותקנה. ${setupMessage()}`,
      };
    }
    return {
      ok: false,
      reason: 'load-failed',
      message: 'לא הצלחתי לטעון את החדר המשותף מ-Supabase.',
    };
  }

  if (!data) {
    return { ok: true, state: { ...EMPTY_STATE } };
  }

  return {
    ok: true,
    state: {
      placements: data.gate_room_placements ?? [],
      choices: data.relic_choices ?? {},
      updatedAt: typeof data.updated_at === 'string' ? data.updated_at : null,
    },
  };
}

export async function saveClassKingdomRoomAsTeacher(
  classId: string,
  teacherId: string,
  placements: ClassRoomPlacement[]
): Promise<ClassKingdomStateResult> {
  const cleanClassId = classId.trim();
  const cleanTeacherId = teacherId.trim();
  if (!cleanClassId || !cleanTeacherId) {
    return { ok: false, reason: 'not-authorized', message: 'חסרה הרשאת מורה לשמירת החדר.' };
  }

  const { data, error } = await supabase.rpc('save_class_kingdom_room_as_teacher', {
    p_class_id: cleanClassId,
    p_teacher_id: cleanTeacherId,
    p_placements: placements,
  });

  if (error) {
    console.error('Error saving class kingdom room:', error);
    if (isMissingFunctionError(error) || isMissingTableError(error)) {
      return { ok: false, reason: 'missing-table', message: setupMessage() };
    }
    return { ok: false, reason: 'save-failed', message: 'לא הצלחתי לשמור את עיצוב החדר.' };
  }

  if (data !== true) {
    return {
      ok: false,
      reason: 'not-authorized',
      message: 'השמירה נדחתה: רק המורה שמשויך לכיתה יכול לשנות את החדר.',
    };
  }

  return loadClassKingdomState(cleanClassId);
}

export async function finalizeClassRelicChoiceAsTeacher(
  classId: string,
  teacherId: string,
  groupId: ClassRoomChoiceGroupId,
  itemId: ClassRoomItemId
): Promise<ClassKingdomStateResult> {
  const cleanClassId = classId.trim();
  const cleanTeacherId = teacherId.trim();
  if (!cleanClassId || !cleanTeacherId) {
    return { ok: false, reason: 'not-authorized', message: 'חסרה הרשאת מורה לאישור הפרס.' };
  }

  const { data, error } = await supabase.rpc('finalize_class_relic_choice_as_teacher', {
    p_class_id: cleanClassId,
    p_teacher_id: cleanTeacherId,
    p_group_id: groupId,
    p_item_id: itemId,
  });

  if (error) {
    console.error('Error finalizing class relic choice:', error);
    if (isMissingFunctionError(error) || isMissingTableError(error)) {
      return { ok: false, reason: 'missing-table', message: setupMessage() };
    }
    return { ok: false, reason: 'save-failed', message: 'לא הצלחתי לאשר את בחירת המזכרת.' };
  }

  if (data !== true) {
    return {
      ok: false,
      reason: 'not-authorized',
      message: 'האישור נדחה. ייתכן שהבחירה כבר נסגרה או שאין הרשאת מורה לכיתה הזו.',
    };
  }

  return loadClassKingdomState(cleanClassId);
}

export async function loadClassRelicVoteSummary(
  classId: string
): Promise<{ ok: true; summary: ClassRelicVoteSummary } | { ok: false; message: string }> {
  const cleanClassId = classId.trim();
  if (!cleanClassId) return { ok: false, message: 'חסר מזהה כיתה.' };

  const { data, error } = await supabase.rpc('get_class_relic_vote_summary', {
    p_class_id: cleanClassId,
  });

  if (error) {
    console.error('Error loading class relic vote summary:', error);
    if (isMissingFunctionError(error) || isMissingTableError(error)) {
      return { ok: false, message: setupMessage() };
    }
    return { ok: false, message: 'לא הצלחתי לטעון את תוצאות ההצבעה.' };
  }

  const summary: ClassRelicVoteSummary = {};
  for (const row of Array.isArray(data) ? data : []) {
    const groupId = row?.group_id as ClassRoomChoiceGroupId | undefined;
    const itemId = row?.item_id as ClassRoomItemId | undefined;
    const count = Number(row?.vote_count ?? 0);
    if (!groupId || !itemId || !Number.isFinite(count)) continue;
    summary[groupId] = {
      ...(summary[groupId] ?? {}),
      [itemId]: Math.max(0, Math.floor(count)),
    };
  }

  return { ok: true, summary };
}

export async function loadStudentClassRelicVotes(
  classId: string,
  studentId: string
): Promise<{ ok: true; votes: StudentClassRelicVotes } | { ok: false; message: string }> {
  const cleanClassId = classId.trim();
  const cleanStudentId = studentId.trim();
  if (!cleanClassId || !cleanStudentId) return { ok: false, message: 'חסרים פרטי תלמיד להצבעה.' };

  const { data, error } = await supabase.rpc('get_student_class_relic_votes', {
    p_class_id: cleanClassId,
    p_student_id: cleanStudentId,
  });

  if (error) {
    console.error('Error loading student relic votes:', error);
    if (isMissingFunctionError(error) || isMissingTableError(error)) {
      return { ok: false, message: setupMessage() };
    }
    return { ok: false, message: 'לא הצלחתי לטעון את ההצבעה שלך.' };
  }

  const votes: StudentClassRelicVotes = {};
  for (const row of Array.isArray(data) ? data : []) {
    const groupId = row?.group_id as ClassRoomChoiceGroupId | undefined;
    const itemId = row?.item_id as ClassRoomItemId | undefined;
    if (groupId && itemId) votes[groupId] = itemId;
  }

  return { ok: true, votes };
}

export async function castClassRelicVote(
  classId: string,
  studentId: string,
  groupId: ClassRoomChoiceGroupId,
  itemId: ClassRoomItemId
): Promise<{ ok: true } | { ok: false; message: string }> {
  const cleanClassId = classId.trim();
  const cleanStudentId = studentId.trim();
  if (!cleanClassId || !cleanStudentId) return { ok: false, message: 'חסרים פרטי תלמיד להצבעה.' };

  const { data, error } = await supabase.rpc('cast_class_relic_vote', {
    p_class_id: cleanClassId,
    p_student_id: cleanStudentId,
    p_group_id: groupId,
    p_item_id: itemId,
  });

  if (error) {
    console.error('Error casting class relic vote:', error);
    if (isMissingFunctionError(error) || isMissingTableError(error)) {
      return { ok: false, message: setupMessage() };
    }
    return { ok: false, message: 'לא הצלחתי לשמור את ההצבעה.' };
  }

  if (data !== true) {
    return {
      ok: false,
      message: 'ההצבעה לא נשמרה. אפשר להצביע פעם אחת בלבד בכל אבן דרך, ורק לפני שהמורה סוגר את הבחירה.',
    };
  }

  return { ok: true };
}
