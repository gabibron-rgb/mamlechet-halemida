import { supabase } from './supabaseClient';

export function studentOnboardingStorageKey(studentId: string): string {
  return `kingdom-student-onboarding-v1:${studentId}`;
}

export function hasSeenOnboardingLocally(studentId: string): boolean {
  try {
    return (
      window.localStorage.getItem(studentOnboardingStorageKey(studentId)) ===
      'done'
    );
  } catch {
    return false;
  }
}

export function markOnboardingSeenLocally(studentId: string): void {
  try {
    window.localStorage.setItem(
      studentOnboardingStorageKey(studentId),
      'done'
    );
  } catch {
    // Local storage is only a convenience cache. Supabase is the durable source.
  }
}

export async function markStudentOnboardingSeen(
  studentId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('students')
    .update({
      onboarding_seen: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', studentId);

  if (error) {
    console.error('Error saving student onboarding state:', error);
    return false;
  }

  markOnboardingSeenLocally(studentId);
  return true;
}
