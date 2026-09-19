import { supabase } from './supabaseClient';

export type AnalyticsRole = 'student' | 'teacher';

export type AnalyticsEventName =
  | 'student_session_started'
  | 'student_tab_viewed'
  | 'student_onboarding_completed'
  | 'companion_stage_reached'
  | 'classmate_room_visited'
  | 'shop_item_purchased'
  | 'shop_box_purchased'
  | 'box_opened'
  | 'inventory_item_sold'
  | 'room_viewed'
  | 'room_item_added'
  | 'room_item_removed'
  | 'ambient_event_shown'
  | 'points_awarded'
  | 'client_error';

export type AnalyticsMetadata = Record<
  string,
  string | number | boolean | null | string[] | number[]
>;

export type AnalyticsEventRow = {
  created_at: string;
  event_name: AnalyticsEventName;
  student_id: string | null;
  session_id: string | null;
  metadata: AnalyticsMetadata | null;
};

const SESSION_STORAGE_KEY = 'learning-kingdom:analytics-session-v1';

function isUuid(value: string | null | undefined): value is string {
  return Boolean(
    value &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

function randomSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `lk-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function getAnalyticsSessionId(): string {
  if (typeof window === 'undefined') return randomSessionId();

  try {
    const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;

    const created = randomSessionId();
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, created);
    return created;
  } catch {
    return randomSessionId();
  }
}

function cleanMetadata(metadata: AnalyticsMetadata = {}): AnalyticsMetadata {
  const out: AnalyticsMetadata = {};

  Object.entries(metadata).forEach(([key, value]) => {
    if (!key || key.length > 64) return;

    if (
      value === null ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      out[key] = typeof value === 'string' ? value.slice(0, 180) : value;
      return;
    }

    if (Array.isArray(value)) {
      out[key] = value
        .slice(0, 30)
        .map(item =>
          typeof item === 'string' ? item.slice(0, 120) : item
        ) as string[] | number[];
    }
  });

  return out;
}

export function trackAnalyticsEvent(input: {
  eventName: AnalyticsEventName;
  actorRole: AnalyticsRole;
  classId: string;
  studentId?: string | null;
  teacherId?: string | null;
  metadata?: AnalyticsMetadata;
}) {
  if (!isUuid(input.classId)) return;

  const payload = {
    p_event_name: input.eventName,
    p_actor_role: input.actorRole,
    p_class_id: input.classId,
    p_student_id: isUuid(input.studentId) ? input.studentId : null,
    p_teacher_id: isUuid(input.teacherId) ? input.teacherId : null,
    p_session_id: getAnalyticsSessionId(),
    p_metadata: cleanMetadata(input.metadata),
  };

  void supabase.rpc('track_analytics_event', payload).then(({ error }) => {
    if (error && import.meta.env.DEV) {
      console.warn('[analytics] event was not saved:', input.eventName, error.message);
    }
  });
}

export function trackStudentAnalytics(
  student: { id: string; classId: string; supabaseId?: string },
  eventName: AnalyticsEventName,
  metadata?: AnalyticsMetadata
) {
  trackAnalyticsEvent({
    eventName,
    actorRole: 'student',
    classId: student.classId,
    studentId: student.supabaseId ?? student.id,
    metadata,
  });
}

export function trackTeacherAnalytics(input: {
  teacherId: string;
  classId: string;
  eventName: AnalyticsEventName;
  studentId?: string | null;
  metadata?: AnalyticsMetadata;
}) {
  trackAnalyticsEvent({
    eventName: input.eventName,
    actorRole: 'teacher',
    classId: input.classId,
    teacherId: input.teacherId,
    studentId: input.studentId ?? null,
    metadata: input.metadata,
  });
}

export async function loadClassAnalyticsEvents(
  classId: string,
  teacherId: string,
  days: number
): Promise<AnalyticsEventRow[]> {
  const { data, error } = await supabase.rpc('get_class_analytics_events', {
    p_class_id: classId,
    p_teacher_id: teacherId,
    p_days: Math.max(1, Math.min(90, Math.floor(days))),
  });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AnalyticsEventRow[];
}
