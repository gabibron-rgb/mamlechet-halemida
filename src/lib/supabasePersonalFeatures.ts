import type { PersonalFeature, PersonalFeatureType } from '../data/personalFeatures';
import { supabase } from './supabaseClient';

type PersonalFeatureRow = {
  id: string;
  student_id: string;
  feature_type: string;
  feature_key: string;
  enabled: boolean;
  config: unknown;
};

const FEATURE_TYPES: PersonalFeatureType[] = [
  'personal_guest',
  'avatar',
  'effect',
  'special_item',
];


function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function isPersonalFeatureType(value: string): value is PersonalFeatureType {
  return FEATURE_TYPES.includes(value as PersonalFeatureType);
}

function normalizeFeature(row: PersonalFeatureRow): PersonalFeature | null {
  if (!isPersonalFeatureType(row.feature_type)) return null;

  return {
    id: row.id,
    studentId: row.student_id,
    featureType: row.feature_type,
    featureKey: row.feature_key,
    enabled: row.enabled,
    config:
      typeof row.config === 'object' && row.config !== null && !Array.isArray(row.config)
        ? (row.config as Record<string, unknown>)
        : {},
  };
}

export async function getStudentPersonalFeatures(
  studentId: string
): Promise<PersonalFeature[]> {
  if (!isUuid(studentId)) return [];

  const { data, error } = await supabase
    .from('student_personal_features')
    .select('id, student_id, feature_type, feature_key, enabled, config')
    .eq('student_id', studentId)
    .eq('enabled', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error loading personal features:', error);
    return [];
  }

  return (data ?? [])
    .map(row => normalizeFeature(row as PersonalFeatureRow))
    .filter((feature): feature is PersonalFeature => feature !== null);
}
