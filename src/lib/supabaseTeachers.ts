import { supabase } from './supabaseClient';
import type { SupabaseClass } from './supabaseClasses';

export type SupabaseTeacher = {
  id: string;
  login_name: string;
  name_he: string;
  created_at: string;
};

function cleanLoginName(value: string) {
  return value.trim().toLowerCase();
}

export async function getTeacherByCredentials(
  loginName: string,
  loginCode: string
): Promise<SupabaseTeacher | null> {
  const cleanName = cleanLoginName(loginName);
  const cleanCode = loginCode.trim();

  if (!cleanName || !cleanCode) {
    return null;
  }

  const { data, error } = await supabase
    .rpc('login_teacher', {
      p_login_name: cleanName,
      p_login_code: cleanCode,
    })
    .maybeSingle();

  if (error) {
    console.error('Error authenticating teacher in Supabase:', error);
    return null;
  }

  return data as SupabaseTeacher | null;
}

export async function getClassesByTeacherId(
  teacherId: string
): Promise<SupabaseClass[]> {
  if (!teacherId) return [];

  const { data, error } = await supabase
    .from('classes')
    .select('id, code, name_he, teacher_code, login_alias, teacher_id, created_at')
    .eq('teacher_id', teacherId)
    .order('name_he', { ascending: true });

  if (error) {
    console.error('Error loading teacher classes from Supabase:', error);
    return [];
  }

  return data ?? [];
}
