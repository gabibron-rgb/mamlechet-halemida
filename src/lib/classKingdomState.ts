import type {
  ClassRoomChoiceGroupId,
  ClassRoomItemId,
} from '../data/classRoomItems';
import type { ClassKingdomRoomId } from '../data/classKingdomRooms';
import { supabase } from './supabaseClient';

export type ClassRoomPlacement = {
  instanceId: string;
  itemId: ClassRoomItemId;
  specialRelicGrantId?: string;
  x: number;
  y: number;
  scale: number;
  layer: number;
};

export type ClassSpecialRelicGrant = {
  id: string;
  classId: string;
  templateId: string;
  itemId: ClassRoomItemId;
  title: string;
  story: string;
  grantedAt: string;
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
    error.code === '42703' ||
    (/class_kingdom_state|class_kingdom_relic_votes|room_placements/i.test(error.message ?? '') &&
      /does not exist|schema cache|column/i.test(error.message ?? ''))
  );
}

function isMissingFunctionError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === '42883' || /function .* does not exist|schema cache/i.test(error.message ?? '');
}

function setupMessage(): string {
  return 'יש לוודא שסקריפטי הממלכה הכיתתית הותקנו ב-Supabase.';
}

function multiRoomSetupMessage(): string {
  return 'יש להריץ את supabase/class-kingdom-multi-room-v1.sql ב-Supabase SQL Editor.';
}


function specialRelicsSetupMessage(): string {
  return 'יש להריץ את supabase/class-kingdom-special-relics-v1.sql ב-Supabase SQL Editor.';
}


export async function loadClassKingdomState(
  classId: string,
  roomId: ClassKingdomRoomId = 'gate'
): Promise<ClassKingdomStateResult> {
  const cleanClassId = classId.trim();
  if (!cleanClassId) {
    return { ok: false, reason: 'load-failed', message: 'חסר מזהה כיתה.' };
  }

  const { data, error } = await supabase
    .from('class_kingdom_state')
    .select('room_placements, gate_room_placements, relic_choices, updated_at')
    .eq('class_id', cleanClassId)
    .maybeSingle();

  if (error) {
    console.error('Error loading class kingdom state:', error);
    if (isMissingTableError(error)) {
      return {
        ok: false,
        reason: 'missing-table',
        message: multiRoomSetupMessage(),
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

  const rooms = data.room_placements && typeof data.room_placements === 'object'
    ? data.room_placements as Record<string, unknown>
    : {};
  const roomPlacements = rooms[roomId];
  const legacyGatePlacements = roomId === 'gate' ? data.gate_room_placements : null;

  return {
    ok: true,
    state: {
      placements: roomPlacements ?? legacyGatePlacements ?? [],
      choices: data.relic_choices ?? {},
      updatedAt: typeof data.updated_at === 'string' ? data.updated_at : null,
    },
  };
}

export async function saveClassKingdomRoomAsTeacher(
  classId: string,
  teacherId: string,
  roomId: ClassKingdomRoomId,
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
    p_room_id: roomId,
    p_placements: placements,
  });

  if (error) {
    console.error('Error saving class kingdom room:', error);
    if (isMissingFunctionError(error) || isMissingTableError(error)) {
      return { ok: false, reason: 'missing-table', message: multiRoomSetupMessage() };
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

  return loadClassKingdomState(cleanClassId, roomId);
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


export async function loadClassSpecialRelics(
  classId: string
): Promise<{ ok: true; relics: ClassSpecialRelicGrant[] } | { ok: false; message: string }> {
  const cleanClassId = classId.trim();
  if (!cleanClassId) return { ok: false, message: 'חסר מזהה כיתה.' };

  const { data, error } = await supabase
    .from('class_kingdom_special_relics')
    .select('id, class_id, template_id, item_id, title, story, granted_at')
    .eq('class_id', cleanClassId)
    .order('granted_at', { ascending: false });

  if (error) {
    console.error('Error loading class special relics:', error);
    if (isMissingTableError(error) || /class_kingdom_special_relics/i.test(error.message ?? '')) {
      return { ok: false, message: specialRelicsSetupMessage() };
    }
    return { ok: false, message: 'לא הצלחתי לטעון את המזכרות המיוחדות של הכיתה.' };
  }

  const relics: ClassSpecialRelicGrant[] = [];
  for (const row of Array.isArray(data) ? data : []) {
    if (!row || typeof row.id !== 'string' || typeof row.item_id !== 'string') continue;
    relics.push({
      id: row.id,
      classId: String(row.class_id ?? cleanClassId),
      templateId: String(row.template_id ?? ''),
      itemId: row.item_id as ClassRoomItemId,
      title: String(row.title ?? ''),
      story: String(row.story ?? ''),
      grantedAt: typeof row.granted_at === 'string' ? row.granted_at : new Date().toISOString(),
    });
  }

  return { ok: true, relics };
}

export async function grantClassSpecialRelicAsTeacher(
  classId: string,
  teacherId: string,
  templateId: string,
  title: string,
  story: string
): Promise<{ ok: true; relicId: string } | { ok: false; message: string }> {
  const cleanClassId = classId.trim();
  const cleanTeacherId = teacherId.trim();
  const cleanTitle = title.trim();
  const cleanStory = story.trim();

  if (!cleanClassId || !cleanTeacherId) {
    return { ok: false, message: 'חסרה הרשאת מורה להענקת מזכרת.' };
  }
  if (!cleanTitle) return { ok: false, message: 'צריך לכתוב כותרת למזכרת.' };
  if (cleanTitle.length > 100) return { ok: false, message: 'כותרת המזכרת ארוכה מדי.' };
  if (cleanStory.length > 500) return { ok: false, message: 'סיפור המזכרת ארוך מדי.' };

  const { data, error } = await supabase.rpc('grant_class_special_relic_as_teacher', {
    p_class_id: cleanClassId,
    p_teacher_id: cleanTeacherId,
    p_template_id: templateId,
    p_title: cleanTitle,
    p_story: cleanStory,
  });

  if (error) {
    console.error('Error granting class special relic:', error);
    if (isMissingFunctionError(error) || isMissingTableError(error)) {
      return { ok: false, message: specialRelicsSetupMessage() };
    }
    return { ok: false, message: 'לא הצלחתי להעניק את המזכרת.' };
  }

  if (typeof data !== 'string' || !data) {
    return { ok: false, message: 'הענקת המזכרת נדחתה. בדקו שהמורה משויך לכיתה.' };
  }

  return { ok: true, relicId: data };
}
