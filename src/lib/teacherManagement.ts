import { supabase } from './supabaseClient';


type TeacherSeatUsageRpcRow = {
  active_count: number | string | null;
  student_limit: number | string | null;
};

type TeacherCreatedClassRpcRow = {
  id: string;
  code: string;
  name_he: string;
  teacher_code: string | null;
  login_alias: string | null;
  teacher_id: string;
  created_at: string;
};

type TeacherResetPinRpcRow = {
  login_code: string | number | null;
};

type TeacherUpdatedCredentialRpcRow = {
  login_name: string | null;
  login_code: string | number | null;
};

export type TeacherSeatUsage = {
  activeCount: number;
  studentLimit: number | null;
  remaining: number | null;
};

export type StudentCredentialRow = {
  id: string;
  name: string;
  loginName: string;
  loginCode: string;
  archivedAt: string | null;
};

export type CreatedStudentCredential = {
  id: string;
  name: string;
  loginName: string;
  loginCode: string;
};

export type InventorySaleRow = {
  id: string;
  soldAt: string;
  itemEntry: Record<string, unknown>;
  refundPoints: number;
  restoredAt: string | null;
};

export type TeacherActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

function rpcMessage(error: unknown, fallback: string): string {
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    const message = (error as { message: string }).message;

    if (message.includes('STUDENT_LIMIT_REACHED')) {
      return 'מכסת התלמידים של חשבון המורה מלאה.';
    }
    if (message.includes('CLASS_NOT_OWNED')) {
      return 'הכיתה אינה משויכת לחשבון המורה הנוכחי.';
    }
    if (message.includes('STUDENT_NOT_OWNED')) {
      return 'התלמיד/ה אינו/ה משויך/ת לאחת הכיתות של המורה.';
    }
    if (message.includes('SALE_ALREADY_RESTORED')) {
      return 'החפץ הזה כבר שוחזר.';
    }
    if (message.includes('SALE_NOT_FOUND')) {
      return 'רשומת המכירה לא נמצאה.';
    }
    if (message.includes('EMPTY_STUDENT_LIST')) {
      return 'לא נמצאו שמות תלמידים להוספה.';
    }
    if (message.includes('LOGIN_NAME_TAKEN')) {
      return 'שם המשתמש הזה כבר תפוס. נסה/י שם אחר.';
    }
    if (message.includes('INVALID_LOGIN_NAME')) {
      return 'שם המשתמש אינו תקין. השתמש/י באותיות או מספרים בלבד.';
    }
    if (message.includes('INVALID_LOGIN_CODE')) {
      return 'הקוד האישי חייב להכיל בדיוק 4 ספרות.';
    }
  }

  return fallback;
}

export async function getTeacherSeatUsage(
  teacherId: string
): Promise<TeacherSeatUsage> {
  const { data, error } = await supabase
    .rpc('teacher_seat_usage', { p_teacher_id: teacherId })
    .maybeSingle();

  if (error || !data) {
    if (error) console.error('Error loading teacher seat usage:', error);
    return { activeCount: 0, studentLimit: null, remaining: null };
  }

  const row = data as TeacherSeatUsageRpcRow;
  const activeCount = Number(row.active_count ?? 0);
  const rawLimit = row.student_limit;
  const studentLimit = rawLimit === null || rawLimit === undefined
    ? null
    : Number(rawLimit);

  return {
    activeCount,
    studentLimit,
    remaining:
      studentLimit === null ? null : Math.max(0, studentLimit - activeCount),
  };
}

export async function createTeacherClass(input: {
  teacherId: string;
  nameHe: string;
}): Promise<TeacherActionResult<{
  id: string;
  code: string;
  name_he: string;
  teacher_code: string | null;
  login_alias: string | null;
  teacher_id: string;
  created_at: string;
}>> {
  const { data, error } = await supabase
    .rpc('teacher_create_class', {
      p_teacher_id: input.teacherId,
      p_name_he: input.nameHe.trim(),
    })
    .maybeSingle();

  if (error || !data) {
    if (error) console.error('Error creating teacher class:', error);
    return {
      ok: false,
      message: rpcMessage(error, 'לא הצלחנו לפתוח את הכיתה. נסה/י שוב.'),
    };
  }

  return { ok: true, data: data as TeacherCreatedClassRpcRow };
}

export async function bulkCreateStudents(input: {
  teacherId: string;
  classId: string;
  names: string[];
}): Promise<TeacherActionResult<CreatedStudentCredential[]>> {
  const cleanNames = input.names
    .map(name => name.trim())
    .filter(Boolean)
    .slice(0, 200);

  if (cleanNames.length === 0) {
    return { ok: false, message: 'לא נמצאו שמות תלמידים להוספה.' };
  }

  const { data, error } = await supabase.rpc('teacher_bulk_create_students', {
    p_teacher_id: input.teacherId,
    p_class_id: input.classId,
    p_names: cleanNames,
  });

  if (error) {
    console.error('Error bulk creating students:', error);
    return {
      ok: false,
      message: rpcMessage(error, 'לא הצלחנו ליצור את התלמידים. נסה/י שוב.'),
    };
  }

  return {
    ok: true,
    data: (data ?? []).map((row: any) => ({
      id: row.id,
      name: row.name,
      loginName: row.login_name,
      loginCode: String(row.login_code ?? '').padStart(4, '0'),
    })),
  };
}

export async function getClassStudentCredentials(input: {
  teacherId: string;
  classId: string;
  includeArchived?: boolean;
}): Promise<StudentCredentialRow[]> {
  const { data, error } = await supabase.rpc('teacher_class_student_credentials', {
    p_teacher_id: input.teacherId,
    p_class_id: input.classId,
    p_include_archived: input.includeArchived ?? false,
  });

  if (error) {
    console.error('Error loading student credentials:', error);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    loginName: row.login_name,
    loginCode: String(row.login_code ?? '').padStart(4, '0'),
    archivedAt: row.archived_at ?? null,
  }));
}

export async function resetStudentPin(input: {
  teacherId: string;
  studentId: string;
}): Promise<TeacherActionResult<string>> {
  const { data, error } = await supabase
    .rpc('teacher_reset_student_pin', {
      p_teacher_id: input.teacherId,
      p_student_id: input.studentId,
    })
    .maybeSingle();

  if (error || !data) {
    if (error) console.error('Error resetting student PIN:', error);
    return {
      ok: false,
      message: rpcMessage(error, 'לא הצלחנו לאפס את הקוד האישי.'),
    };
  }

  return {
    ok: true,
    data: String((data as TeacherResetPinRpcRow).login_code ?? '').padStart(4, '0'),
  };
}

export async function updateStudentCredentials(input: {
  teacherId: string;
  studentId: string;
  loginName: string;
  loginCode: string;
}): Promise<TeacherActionResult<{ loginName: string; loginCode: string }>> {
  const { data, error } = await supabase
    .rpc('teacher_update_student_credentials', {
      p_teacher_id: input.teacherId,
      p_student_id: input.studentId,
      p_login_name: input.loginName.trim(),
      p_login_code: input.loginCode.trim(),
    })
    .maybeSingle();

  if (error || !data) {
    if (error) console.error('Error updating student credentials:', error);
    return {
      ok: false,
      message: rpcMessage(error, 'לא הצלחנו לעדכן את פרטי ההתחברות.'),
    };
  }

  const row = data as TeacherUpdatedCredentialRpcRow;
  return {
    ok: true,
    data: {
      loginName: String(row.login_name ?? ''),
      loginCode: String(row.login_code ?? '').padStart(4, '0'),
    },
  };
}

export async function archiveStudent(input: {
  teacherId: string;
  studentId: string;
}): Promise<TeacherActionResult<true>> {
  const { error } = await supabase.rpc('teacher_archive_student', {
    p_teacher_id: input.teacherId,
    p_student_id: input.studentId,
  });

  if (error) {
    console.error('Error archiving student:', error);
    return {
      ok: false,
      message: rpcMessage(error, 'לא הצלחנו להעביר את התלמיד/ה לארכיון.'),
    };
  }

  return { ok: true, data: true };
}

export async function unarchiveStudent(input: {
  teacherId: string;
  studentId: string;
}): Promise<TeacherActionResult<true>> {
  const { error } = await supabase.rpc('teacher_unarchive_student', {
    p_teacher_id: input.teacherId,
    p_student_id: input.studentId,
  });

  if (error) {
    console.error('Error unarchiving student:', error);
    return {
      ok: false,
      message: rpcMessage(error, 'לא הצלחנו להחזיר את התלמיד/ה מהארכיון.'),
    };
  }

  return { ok: true, data: true };
}

export async function getRecentInventorySales(input: {
  teacherId: string;
  studentId: string;
  limit?: number;
}): Promise<InventorySaleRow[]> {
  const { data, error } = await supabase.rpc('teacher_recent_inventory_sales', {
    p_teacher_id: input.teacherId,
    p_student_id: input.studentId,
    p_limit: Math.max(1, Math.min(50, input.limit ?? 12)),
  });

  if (error) {
    console.error('Error loading inventory sale history:', error);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    soldAt: row.sold_at,
    itemEntry:
      row.item_entry && typeof row.item_entry === 'object'
        ? row.item_entry
        : {},
    refundPoints: Number(row.refund_points ?? 0),
    restoredAt: row.restored_at ?? null,
  }));
}

export async function restoreInventorySale(input: {
  teacherId: string;
  studentId: string;
  saleId: string;
}): Promise<TeacherActionResult<true>> {
  const { error } = await supabase.rpc('teacher_restore_inventory_sale', {
    p_teacher_id: input.teacherId,
    p_student_id: input.studentId,
    p_sale_id: input.saleId,
  });

  if (error) {
    console.error('Error restoring sold inventory item:', error);
    return {
      ok: false,
      message: rpcMessage(error, 'לא הצלחנו לשחזר את החפץ.'),
    };
  }

  return { ok: true, data: true };
}
