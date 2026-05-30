import { supabase } from './supabaseClient';

export type SupabaseClass = {
  id: string;
  code: string;
  name_he: string;
  teacher_code: string | null;
  login_alias: string | null;
  created_at: string;
};

function cleanText(value: string) {
  return value.trim();
}

export async function getClassByCodeAndTeacherCode(
  classCodeOrAlias: string,
  teacherCode: string
): Promise<SupabaseClass | null> {
  const cleanClassInput = cleanText(classCodeOrAlias);
  const cleanTeacherCode = cleanText(teacherCode);

  if (!cleanClassInput || !cleanTeacherCode) {
    return null;
  }

  const { data, error } = await supabase
    .from('classes')
    .select('id, code, name_he, teacher_code, login_alias, created_at')
    .eq('teacher_code', cleanTeacherCode)
    .or(`code.eq.${cleanClassInput},login_alias.eq.${cleanClassInput}`)
    .maybeSingle();

  if (error) {
    console.error('Error loading class from Supabase:', error);
    return null;
  }

  return data;
}