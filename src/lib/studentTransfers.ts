import { normalizeStudentClassGoals, type StudentClassGoal } from '../data/classGoals';
import { supabase } from './supabaseClient';

type TransferStudentInput = {
  teacherId: string;
  studentId: string;
  sourceClassId: string;
  targetClassId: string;
};

export type TransferStudentResult =
  | { ok: true }
  | { ok: false; message: string };

type ClassRow = {
  id: string;
  teacher_id: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function mergeClassGoalsFromRows(rows: Array<{ meta: unknown }>): StudentClassGoal[] {
  const byId = new Map<string, StudentClassGoal>();

  for (const row of rows) {
    const meta = isRecord(row.meta) ? row.meta : {};
    const goals = normalizeStudentClassGoals(meta.classGoals);

    for (const goal of goals) {
      const current = byId.get(goal.id);
      if (!current) {
        byId.set(goal.id, {
          ...goal,
          contributionIds: [...goal.contributionIds],
        });
        continue;
      }

      byId.set(goal.id, {
        ...current,
        contributionIds: Array.from(
          new Set([...current.contributionIds, ...goal.contributionIds])
        ),
        completedAt: current.completedAt ?? goal.completedAt,
        cancelledAt: current.cancelledAt ?? goal.cancelledAt,
      });
    }
  }

  return Array.from(byId.values());
}

export async function transferStudentWithinTeacherClasses({
  teacherId,
  studentId,
  sourceClassId,
  targetClassId,
}: TransferStudentInput): Promise<TransferStudentResult> {
  const cleanTeacherId = teacherId.trim();
  const cleanStudentId = studentId.trim();
  const cleanSourceClassId = sourceClassId.trim();
  const cleanTargetClassId = targetClassId.trim();

  if (
    !cleanTeacherId ||
    !cleanStudentId ||
    !cleanSourceClassId ||
    !cleanTargetClassId ||
    cleanSourceClassId === cleanTargetClassId
  ) {
    return { ok: false, message: 'פרטי ההעברה אינם תקינים.' };
  }

  // Verify that both ends of the transfer really belong to the signed-in teacher.
  const { data: classRows, error: classesError } = await supabase
    .from('classes')
    .select('id, teacher_id')
    .in('id', [cleanSourceClassId, cleanTargetClassId]);

  if (classesError) {
    console.error('Error verifying transfer classes:', classesError);
    return { ok: false, message: 'לא הצלחנו לאמת את הכיתות. נסה/י שוב.' };
  }

  const verifiedClasses = (classRows ?? []) as ClassRow[];
  const sourceClass = verifiedClasses.find(row => row.id === cleanSourceClassId);
  const targetClass = verifiedClasses.find(row => row.id === cleanTargetClassId);

  if (
    !sourceClass ||
    !targetClass ||
    sourceClass.teacher_id !== cleanTeacherId ||
    targetClass.teacher_id !== cleanTeacherId
  ) {
    return {
      ok: false,
      message: 'אפשר להעביר תלמידים רק בין כיתות ששייכות לאותו חשבון מורה.',
    };
  }

  // The class kingdom and class-goal state currently lives in student meta.
  // Copy the destination class snapshot so the transferred student joins the
  // destination kingdom instead of carrying the old class state with them.
  const { data: targetStudents, error: targetStudentsError } = await supabase
    .from('students')
    .select('meta')
    .eq('class_id', cleanTargetClassId)
    .is('archived_at', null);

  if (targetStudentsError) {
    console.error('Error loading target class state:', targetStudentsError);
    return { ok: false, message: 'לא הצלחנו לטעון את מצב הכיתה החדשה.' };
  }

  const targetClassGoals = mergeClassGoalsFromRows(
    ((targetStudents ?? []) as Array<{ meta: unknown }>)
  );

  const { data: studentRow, error: studentError } = await supabase
    .from('students')
    .select('id, class_id, meta')
    .eq('id', cleanStudentId)
    .is('archived_at', null)
    .maybeSingle();

  if (studentError) {
    console.error('Error loading student before transfer:', studentError);
    return { ok: false, message: 'לא הצלחנו לטעון את התלמיד/ה לפני ההעברה.' };
  }

  if (!studentRow || studentRow.class_id !== cleanSourceClassId) {
    return {
      ok: false,
      message: 'התלמיד/ה כבר לא משויך/ת לכיתה הנוכחית. רענן/י ונסה/י שוב.',
    };
  }

  const currentMeta = isRecord(studentRow.meta) ? studentRow.meta : {};
  const nextMeta = {
    ...currentMeta,
    classGoals: targetClassGoals,
    // This marker is class-bound. Rewards already received remain in the
    // personal inventory; future class-kingdom eligibility follows the new class.
    claimedClassKingdomRewards: [],
  };

  const { data: updatedRow, error: updateError } = await supabase
    .from('students')
    .update({
      class_id: cleanTargetClassId,
      meta: nextMeta,
      updated_at: new Date().toISOString(),
    })
    .eq('id', cleanStudentId)
    .eq('class_id', cleanSourceClassId)
    .is('archived_at', null)
    .select('id, class_id')
    .maybeSingle();

  if (updateError) {
    console.error('Error transferring student:', updateError);
    return { ok: false, message: 'ההעברה נכשלה. לא בוצעו שינויים.' };
  }

  if (!updatedRow || updatedRow.class_id !== cleanTargetClassId) {
    return {
      ok: false,
      message: 'השיוך השתנה בזמן ההעברה. רענן/י את הכיתה ונסה/י שוב.',
    };
  }

  return { ok: true };
}
