import { supabase } from './supabaseClient';

export async function getStudentByLoginName(loginName: string) {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('login_name', loginName)
    .single();

  if (error) {
    console.error('Error loading student:', error);
    return null;
  }

  return data;
}

export async function updateStudentPointsByLoginName(
  loginName: string,
  newPoints: number
) {
  const { data, error } = await supabase
    .from('students')
    .update({ points: newPoints })
    .eq('login_name', loginName)
    .select()
    .single();

  if (error) {
    console.error('Error updating student points:', error);
    return null;
  }

  return data;
}