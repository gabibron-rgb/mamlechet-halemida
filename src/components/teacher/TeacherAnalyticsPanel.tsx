import { useEffect, useMemo, useState } from 'react';
import type { StudentState } from '../../store/useGameStore';
import {
  loadClassAnalyticsEvents,
  type AnalyticsEventRow,
} from '../../lib/analytics';
import { REASONS } from '../../data/reasons';
import { THEMES } from '../../data/themes';
import { getItemById } from '../../data/items';
import { COSMETIC_BY_ID } from '../../data/cosmetics';
import { getExclusiveAchievementItem } from '../../data/exclusiveAchievementRewards';

const TAB_LABELS: Record<string, string> = {
  progress: 'התקדמות',
  missions: 'משימות',
  classKingdom: 'ממלכת הכיתה',
  room: 'החדרים שלי',
  classRooms: 'חדרי הכיתה',
  shop: 'החנות',
  inventory: 'מלאי',
  collection: 'האוסף',
  companion: 'חיית המחמד',
  trophies: 'חדר הפרסים',
};

const ROOM_LABELS: Record<string, string> = {
  main: 'החדר הראשי',
  wonder_hall: 'היכל הפלאים',
  magic_room: 'החדר הקסום',
  hobby_room: 'חדר התחביבים',
  treasure_gallery: 'גלריית האוצרות',
};

const STAGE_LABELS: Record<string, string> = {
  egg: 'ביצה',
  hatchling: 'קטנטנה',
  young: 'צעירה',
  grown: 'בוגרת',
  magical: 'קסומה',
  legendary: 'אגדית',
};

function themeLabel(id: string): string {
  return THEMES.find(theme => theme.id === id)?.nameHe ?? id;
}

function itemLabel(id: string): string {
  return (
    getItemById(id)?.nameHe ??
    COSMETIC_BY_ID[id]?.nameHe ??
    getExclusiveAchievementItem(id)?.nameHe ??
    id
  );
}

function valueOf(event: AnalyticsEventRow, key: string): string | null {
  const value = event.metadata?.[key];
  return typeof value === 'string' ? value : null;
}

function numberOf(event: AnalyticsEventRow, key: string): number | null {
  const value = event.metadata?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function countBy(values: Array<string | null | undefined>) {
  const counts = new Map<string, number>();
  values.forEach(value => {
    if (!value) return;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function studentKey(student: StudentState): string {
  return student.supabaseId ?? student.id;
}

function localDayKey(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dayLabel(date: Date): string {
  return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' });
}

type TrendPoint = {
  key: string;
  label: string;
  sessions: number;
  students: number;
};

function buildActivityTrend(sessions: AnalyticsEventRow[], days: number): TrendPoint[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (days <= 30) {
    const buckets = Array.from({ length: days }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (days - 1 - index));
      return {
        key: localDayKey(date),
        label: dayLabel(date),
        sessions: 0,
        studentIds: new Set<string>(),
      };
    });

    const byKey = new Map(buckets.map(bucket => [bucket.key, bucket]));
    sessions.forEach(event => {
      const bucket = byKey.get(localDayKey(event.created_at));
      if (!bucket) return;
      bucket.sessions += 1;
      if (event.student_id) bucket.studentIds.add(event.student_id);
    });

    return buckets.map(bucket => ({
      key: bucket.key,
      label: bucket.label,
      sessions: bucket.sessions,
      students: bucket.studentIds.size,
    }));
  }

  const weekCount = Math.ceil(days / 7);
  const buckets = Array.from({ length: weekCount }, (_, index) => {
    const start = new Date(today);
    const daysBack = (weekCount - 1 - index) * 7 + 6;
    start.setDate(today.getDate() - daysBack);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return {
      key: `${localDayKey(start)}:${localDayKey(end)}`,
      label: `${dayLabel(start)}–${dayLabel(end)}`,
      start,
      end,
      sessions: 0,
      studentIds: new Set<string>(),
    };
  });

  sessions.forEach(event => {
    const created = new Date(event.created_at);
    created.setHours(0, 0, 0, 0);
    const bucket = buckets.find(candidate => created >= candidate.start && created <= candidate.end);
    if (!bucket) return;
    bucket.sessions += 1;
    if (event.student_id) bucket.studentIds.add(event.student_id);
  });

  return buckets.map(bucket => ({
    key: bucket.key,
    label: bucket.label,
    sessions: bucket.sessions,
    students: bucket.studentIds.size,
  }));
}

function MetricCard({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-magic-bg/35 p-4 text-right">
      <div className="text-xs font-bold text-magic-soft/55">{label}</div>
      <div className="mt-1 text-2xl font-black text-white">{value}</div>
      {note && <div className="mt-1 text-[11px] text-magic-soft/45">{note}</div>}
    </div>
  );
}

function RankedList({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ label: string; value: number; suffix?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-magic-bg/30 p-4">
      <div className="mb-3 text-sm font-black text-magic-accent">{title}</div>
      {rows.length === 0 ? (
        <div className="text-xs text-magic-soft/45">עדיין אין מספיק נתונים.</div>
      ) : (
        <div className="space-y-2">
          {rows.slice(0, 8).map((row, index) => (
            <div key={`${row.label}-${index}`} className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-magic-soft/80">{row.label}</span>
              <span className="shrink-0 font-black text-white">
                {row.value}{row.suffix ?? ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActivityTrend({ points, days }: { points: TrendPoint[]; days: number }) {
  const maxSessions = Math.max(1, ...points.map(point => point.sessions));
  const title = days <= 30 ? 'מגמת שימוש יומית' : 'מגמת שימוש שבועית';

  return (
    <div className="rounded-2xl border border-white/10 bg-magic-bg/30 p-4 md:col-span-2 xl:col-span-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-black text-magic-accent">{title}</div>
          <div className="mt-1 text-[11px] text-magic-soft/45">
            גובה העמודה = מספר סשנים. המספר מעליה = תלמידים ייחודיים.
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto pb-1">
        <div className="flex min-w-max items-end gap-2" dir="ltr">
          {points.map(point => {
            const height = point.sessions === 0 ? 4 : Math.max(12, Math.round((point.sessions / maxSessions) * 92));
            return (
              <div key={point.key} className="flex w-10 flex-col items-center gap-1">
                <div className="text-[10px] font-black text-cyan-100/75">{point.students || ''}</div>
                <div className="flex h-24 w-full items-end justify-center rounded-lg bg-white/[0.03] px-1">
                  <div
                    className="w-full rounded-t-md bg-cyan-300/55"
                    style={{ height: `${height}%` }}
                    title={`${point.sessions} סשנים, ${point.students} תלמידים`}
                  />
                </div>
                <div className="whitespace-nowrap text-[9px] text-magic-soft/45">{point.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RoomMixCard({ main, other }: { main: number; other: number }) {
  const total = main + other;
  const mainPct = total > 0 ? Math.round((main / total) * 100) : 0;
  const otherPct = total > 0 ? 100 - mainPct : 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-magic-bg/30 p-4">
      <div className="text-sm font-black text-magic-accent">חדר ראשי מול חדרים חדשים</div>
      {total === 0 ? (
        <div className="mt-3 text-xs text-magic-soft/45">עדיין אין מספיק נתונים.</div>
      ) : (
        <>
          <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-white/5" dir="ltr">
            <div className="bg-cyan-300/60" style={{ width: `${mainPct}%` }} />
            <div className="bg-violet-300/60" style={{ width: `${otherPct}%` }} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="font-black text-white">{mainPct}%</div>
              <div className="text-magic-soft/55">החדר הראשי · {main}</div>
            </div>
            <div>
              <div className="font-black text-white">{otherPct}%</div>
              <div className="text-magic-soft/55">חדרים חדשים · {other}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StageActivityCard({
  rows,
}: {
  rows: Array<{ stage: string; total: number; active: number }>;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-magic-bg/30 p-4">
      <div className="text-sm font-black text-magic-accent">פעילות לפי שלב חיה</div>
      <div className="mt-1 text-[11px] text-magic-soft/45">מצב החיות הנוכחי מול כניסות בתקופה.</div>
      {rows.length === 0 ? (
        <div className="mt-3 text-xs text-magic-soft/45">עדיין אין מספיק נתונים.</div>
      ) : (
        <div className="mt-3 space-y-2">
          {rows.map(row => {
            const pct = row.total > 0 ? Math.round((row.active / row.total) * 100) : 0;
            return (
              <div key={row.stage} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-magic-soft/80">{STAGE_LABELS[row.stage] ?? row.stage}</span>
                <span className="font-black text-white">
                  {row.active}/{row.total} <span className="text-xs text-magic-soft/45">({pct}%)</span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CohortActivityCard({
  rows,
  enoughStudents,
}: {
  rows: Array<{ label: string; total: number; active: number; averageAwards: number }>;
  enoughStudents: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-magic-bg/30 p-4 md:col-span-2 xl:col-span-2">
      <div className="text-sm font-black text-magic-accent">פעילות לפי קצב קבלת נקודות</div>
      <div className="mt-1 text-[11px] leading-5 text-magic-soft/45">
        חלוקה אנונימית לשלישים לפי סך הנקודות שניתנו בתקופה. זהו אות לבדיקת הוגנות — לא דירוג ולא מדד איכות של תלמידים.
      </div>
      {!enoughStudents ? (
        <div className="mt-4 text-xs text-magic-soft/45">הפילוח יוצג רק בכיתה עם לפחות 6 תלמידים, כדי שלא להפוך נתון מצטבר למידע אישי.</div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {rows.map(row => {
            const pct = row.total > 0 ? Math.round((row.active / row.total) * 100) : 0;
            return (
              <div key={row.label} className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
                <div className="text-xs font-bold text-magic-soft/65">{row.label}</div>
                <div className="mt-2 text-xl font-black text-white">{pct}% פעילים</div>
                <div className="mt-1 text-[10px] text-magic-soft/40">
                  {row.active}/{row.total} · ממוצע {row.averageAwards} נק׳ בתקופה
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function actionLabelAfterAward(event: AnalyticsEventRow): string | null {
  if (event.event_name === 'shop_box_purchased') return 'רכשו קופסה';
  if (event.event_name === 'box_opened') return 'פתחו קופסה';
  if (event.event_name === 'room_item_added') return 'הוסיפו חפץ לחדר';
  if (event.event_name === 'classmate_room_visited') return 'ביקרו בחדר של חבר/ה';

  if (event.event_name === 'student_tab_viewed') {
    const tab = valueOf(event, 'tab');
    if (!tab || tab === 'progress') return null;
    return `עברו אל ${TAB_LABELS[tab] ?? tab}`;
  }

  return null;
}

export default function TeacherAnalyticsPanel({
  classId,
  teacherId,
  students,
}: {
  classId: string;
  teacherId: string;
  students: StudentState[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [days, setDays] = useState(30);
  const [events, setEvents] = useState<AnalyticsEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!expanded) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    void loadClassAnalyticsEvents(classId, teacherId, days)
      .then(rows => {
        if (!cancelled) setEvents(rows);
      })
      .catch(err => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'שגיאה בטעינת הנתונים');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [classId, teacherId, days, expanded]);

  const summary = useMemo(() => {
    const sessions = events.filter(event => event.event_name === 'student_session_started');
    const currentStudentIds = new Set(students.map(studentKey));
    const sessionStudentIds = sessions
      .map(event => event.student_id)
      .filter((id): id is string => typeof id === 'string' && currentStudentIds.has(id));
    const activeCurrentIds = new Set(sessionStudentIds);
    const activePct = students.length > 0 ? Math.round((activeCurrentIds.size / students.length) * 100) : 0;

    const sessionDaysByStudent = new Map<string, Set<string>>();
    sessions.forEach(event => {
      if (!event.student_id || !currentStudentIds.has(event.student_id)) return;
      const set = sessionDaysByStudent.get(event.student_id) ?? new Set<string>();
      set.add(localDayKey(event.created_at));
      sessionDaysByStudent.set(event.student_id, set);
    });
    const returningStudents = [...sessionDaysByStudent.values()].filter(set => set.size >= 2).length;
    const returningPct = activeCurrentIds.size > 0
      ? Math.round((returningStudents / activeCurrentIds.size) * 100)
      : 0;
    const avgSessionsPerActive = activeCurrentIds.size > 0
      ? Math.round((sessions.length / activeCurrentIds.size) * 10) / 10
      : 0;
    const activityTrend = buildActivityTrend(sessions, days);

    const tabViews = events.filter(event => event.event_name === 'student_tab_viewed');
    const tabRanking = countBy(tabViews.map(event => valueOf(event, 'tab')));
    const tabReachMap = new Map<string, Set<string>>();
    tabViews.forEach(event => {
      const tab = valueOf(event, 'tab');
      if (!tab || !event.student_id || !activeCurrentIds.has(event.student_id)) return;
      const set = tabReachMap.get(tab) ?? new Set<string>();
      set.add(event.student_id);
      tabReachMap.set(tab, set);
    });
    const tabReach = [...tabReachMap.entries()]
      .map(([tab, ids]) => ({
        tab,
        students: ids.size,
        pct: activeCurrentIds.size > 0 ? Math.round((ids.size / activeCurrentIds.size) * 100) : 0,
      }))
      .sort((a, b) => b.students - a.students || b.pct - a.pct);

    const boxOpened = events.filter(event => event.event_name === 'box_opened');
    const boxPurchased = events.filter(event => event.event_name === 'shop_box_purchased');
    const boxThemes = countBy(boxOpened.map(event => valueOf(event, 'theme')));
    const boxRarities = countBy(boxOpened.map(event => valueOf(event, 'reward_rarity')));
    const purchasedItems = countBy(
      events
        .filter(event => event.event_name === 'shop_item_purchased')
        .map(event => valueOf(event, 'item_id'))
    );

    const roomViews = events.filter(event => event.event_name === 'room_viewed');
    const roomRanking = countBy(roomViews.map(event => valueOf(event, 'room_id')));
    const mainRoomViews = roomViews.filter(event => valueOf(event, 'room_id') === 'main').length;
    const otherRoomViews = roomViews.filter(event => {
      const roomId = valueOf(event, 'room_id');
      return Boolean(roomId && roomId !== 'main');
    }).length;
    const roomAddEvents = events.filter(event => event.event_name === 'room_item_added');
    const roomAdds = roomAddEvents.length;
    const placedItems = countBy(roomAddEvents.map(event => valueOf(event, 'item_id')));
    const classmateVisits = events.filter(event => event.event_name === 'classmate_room_visited').length;

    const ambient = events.filter(event => event.event_name === 'ambient_event_shown');
    const ambientRanking = countBy(ambient.map(event => valueOf(event, 'event_id')));

    const clientErrors = events.filter(event => event.event_name === 'client_error').length;

    const awards = events.filter(event => event.event_name === 'points_awarded');
    const reasonRanking = countBy(awards.map(event => valueOf(event, 'reason_id') ?? 'ללא סיבה'));
    const pointsGiven = awards.reduce((sum, event) => sum + (numberOf(event, 'amount') ?? 0), 0);

    const latestSnapshots = new Map<string, AnalyticsEventRow>();
    sessions.forEach(event => {
      if (!event.student_id || latestSnapshots.has(event.student_id)) return;
      latestSnapshots.set(event.student_id, event);
    });
    const stageRanking = countBy(
      [...latestSnapshots.values()].map(event => valueOf(event, 'companion_stage'))
    );
    const companionThemes = countBy(
      [...latestSnapshots.values()].map(event => valueOf(event, 'companion_theme'))
    );

    const stageMap = new Map<string, { total: number; active: number }>();
    students.forEach(student => {
      const stage = student.companion.stage;
      const current = stageMap.get(stage) ?? { total: 0, active: 0 };
      current.total += 1;
      if (activeCurrentIds.has(studentKey(student))) current.active += 1;
      stageMap.set(stage, current);
    });
    const stageOrder = ['egg', 'hatchling', 'young', 'grown', 'magical', 'legendary'];
    const stageActivity = stageOrder
      .filter(stage => stageMap.has(stage))
      .map(stage => ({ stage, ...(stageMap.get(stage) ?? { total: 0, active: 0 }) }));

    const pointsByStudent = new Map<string, number>();
    students.forEach(student => pointsByStudent.set(studentKey(student), 0));
    awards.forEach(event => {
      if (!event.student_id || !currentStudentIds.has(event.student_id)) return;
      pointsByStudent.set(
        event.student_id,
        (pointsByStudent.get(event.student_id) ?? 0) + (numberOf(event, 'amount') ?? 0)
      );
    });
    const awardTotals = [...pointsByStudent.values()].sort((a, b) => a - b);
    const minAward = awardTotals[0] ?? 0;
    const maxAward = awardTotals[awardTotals.length - 1] ?? 0;

    const cohortLabels = ['שליש עם פחות הענקות', 'שליש אמצעי', 'שליש עם יותר הענקות'];
    const sortedStudents = students
      .map(student => ({ id: studentKey(student), awarded: pointsByStudent.get(studentKey(student)) ?? 0 }))
      .sort((a, b) => a.awarded - b.awarded);
    const cohortSize = Math.ceil(sortedStudents.length / 3);
    const cohortActivity = cohortLabels.map((label, index) => {
      const start = index * cohortSize;
      const end = index === 2 ? sortedStudents.length : Math.min(sortedStudents.length, start + cohortSize);
      const members = sortedStudents.slice(start, end);
      const active = members.filter(member => activeCurrentIds.has(member.id)).length;
      const totalAwards = members.reduce((sum, member) => sum + member.awarded, 0);
      return {
        label,
        total: members.length,
        active,
        averageAwards: members.length > 0 ? Math.round(totalAwards / members.length) : 0,
      };
    }).filter(row => row.total > 0);

    const chronological = [...events].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const eventsByStudent = new Map<string, AnalyticsEventRow[]>();
    chronological.forEach(event => {
      if (!event.student_id) return;
      const list = eventsByStudent.get(event.student_id) ?? [];
      list.push(event);
      eventsByStudent.set(event.student_id, list);
    });
    const actionAfterAwards: string[] = [];
    const maxFollowupMs = 2 * 60 * 60 * 1000;
    awards.forEach(award => {
      if (!award.student_id) return;
      const awardTime = new Date(award.created_at).getTime();
      const candidates = eventsByStudent.get(award.student_id) ?? [];
      const next = candidates.find(candidate => {
        const candidateTime = new Date(candidate.created_at).getTime();
        if (candidateTime <= awardTime || candidateTime - awardTime > maxFollowupMs) return false;
        return actionLabelAfterAward(candidate) !== null;
      });
      const label = next ? actionLabelAfterAward(next) : null;
      if (label) actionAfterAwards.push(label);
    });
    const postAwardRanking = countBy(actionAfterAwards);

    return {
      activeStudents: activeCurrentIds.size,
      activePct,
      returningStudents,
      returningPct,
      avgSessionsPerActive,
      sessions: sessions.length,
      activityTrend,
      boxOpened: boxOpened.length,
      boxPurchased: boxPurchased.length,
      roomAdds,
      classmateVisits,
      pointsGiven,
      clientErrors,
      minAward,
      maxAward,
      tabRanking,
      tabReach,
      boxThemes,
      boxRarities,
      purchasedItems,
      placedItems,
      roomRanking,
      mainRoomViews,
      otherRoomViews,
      ambientRanking,
      reasonRanking,
      stageRanking,
      companionThemes,
      stageActivity,
      cohortActivity,
      postAwardRanking,
    };
  }, [events, students, days]);

  const reasonLabel = (id: string) => {
    if (id === 'ללא סיבה') return id;
    const reason = REASONS.find(candidate => candidate.id === id);
    return reason ? `${reason.emoji} ${reason.labelHe}` : id;
  };

  return (
    <div className="mb-4 rounded-3xl border border-cyan-300/15 bg-magic-panel/75 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-lg font-black text-cyan-100">📊 תמונת שימוש</div>
          <div className="mt-1 text-xs leading-5 text-magic-soft/55">
            נתונים מצטברים לשיפור המשחק. אין כאן דירוג תלמידים ואין הצגה של שמות.
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(value => !value)}
          className="rounded-xl border border-cyan-200/25 bg-cyan-300/10 px-4 py-2 text-xs font-black text-cyan-100"
        >
          {expanded ? 'סגור נתונים' : 'פתח נתוני שימוש'}
        </button>
      </div>

      {!expanded ? null : (
        <>
          <div className="mt-4 flex gap-2">
            {[7, 30, 90].map(option => (
              <button
                key={option}
                type="button"
                onClick={() => setDays(option)}
                className={`rounded-xl px-3 py-2 text-xs font-black ${
                  days === option
                    ? 'bg-cyan-200 text-slate-900'
                    : 'border border-white/10 bg-magic-bg/35 text-magic-soft'
                }`}
              >
                {option} ימים
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm text-magic-soft/60">טוען נתוני שימוש…</div>
          ) : error ? (
            <div className="mt-4 rounded-2xl border border-red-300/20 bg-red-500/10 p-4 text-sm text-red-100">
              לא ניתן לטעון analytics: {error}
            </div>
          ) : events.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-magic-bg/25 p-5 text-center text-sm text-magic-soft/60">
              המערכת מוכנה. הנתונים יתחילו להצטבר מהשימוש הבא של התלמידים לאחר התקנת העדכון.
            </div>
          ) : (
            <>
              <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <MetricCard
                  label="תלמידים שנכנסו למשחק"
                  value={`${summary.activeStudents}/${students.length}`}
                  note={`${summary.activePct}% מהכיתה בתקופה · נספר לפי כניסה בפועל`}
                />
                <MetricCard label="סשנים" value={summary.sessions} note="פתיחות משחק ייחודיות" />
                <MetricCard label="קופסאות שנפתחו" value={summary.boxOpened} note={`${summary.boxPurchased} נרכשו בחנות`} />
                <MetricCard label="חפצים שנוספו לחדר" value={summary.roomAdds} note={`${summary.classmateVisits} ביקורים בחדרי חברים`} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <MetricCard
                  label="תלמידים שחזרו ביום נוסף"
                  value={`${summary.returningStudents}/${summary.activeStudents}`}
                  note={`${summary.returningPct}% מהנכנסים היו פעילים בלפחות 2 ימים שונים`}
                />
                <MetricCard
                  label="סשנים לתלמיד פעיל"
                  value={summary.avgSessionsPerActive}
                  note="ממוצע בתקופה שנבחרה"
                />
                <MetricCard label="נקודות שניתנו" value={summary.pointsGiven} note="לפי אירועי הענקה מאז הפעלת analytics" />
                <MetricCard label="שגיאות לקוח" value={summary.clientErrors} note="שגיאות שנתפסו על-ידי ErrorBoundary" />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <MetricCard
                  label="טווח הענקות לתלמיד"
                  value={`${summary.minAward}–${summary.maxAward}`}
                  note="מצטבר בתקופה, ללא שמות וללא דירוג"
                />
                <MetricCard
                  label="אירועי ממלכה שנצפו"
                  value={summary.ambientRanking.reduce((sum, row) => sum + row[1], 0)}
                />
                <MetricCard
                  label="פתיחות חדר ראשי"
                  value={summary.mainRoomViews}
                  note="מתוך אירועי פתיחת חדר"
                />
                <MetricCard
                  label="פתיחות חדרים חדשים"
                  value={summary.otherRoomViews}
                  note="כל החדרים שאינם החדר הראשי"
                />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <ActivityTrend points={summary.activityTrend} days={days} />

                <RankedList
                  title="המסכים שהילדים פותחים"
                  rows={summary.tabRanking.map(([id, value]) => ({ label: TAB_LABELS[id] ?? id, value }))}
                />
                <RankedList
                  title="אימוץ מסכים — כמה תלמידים גילו אותם"
                  rows={summary.tabReach.map(row => ({
                    label: TAB_LABELS[row.tab] ?? row.tab,
                    value: row.students,
                    suffix: ` (${row.pct}%)`,
                  }))}
                />
                <RankedList
                  title="החדרים שבאמת נפתחים"
                  rows={summary.roomRanking.map(([id, value]) => ({ label: ROOM_LABELS[id] ?? id, value }))}
                />

                <RoomMixCard main={summary.mainRoomViews} other={summary.otherRoomViews} />
                <StageActivityCard rows={summary.stageActivity} />
                <RankedList
                  title="רמות חיה בסשן האחרון"
                  rows={summary.stageRanking.map(([id, value]) => ({ label: STAGE_LABELS[id] ?? id, value }))}
                />

                <CohortActivityCard
                  rows={summary.cohortActivity}
                  enoughStudents={students.length >= 6}
                />
                <RankedList
                  title="מה עושים אחרי קבלת נקודות"
                  rows={summary.postAwardRanking.map(([label, value]) => ({ label, value }))}
                />

                <RankedList
                  title="נושאי קופסאות שנפתחו"
                  rows={summary.boxThemes.map(([id, value]) => ({ label: themeLabel(id), value }))}
                />
                <RankedList
                  title="חפצים שנקנו ישירות"
                  rows={summary.purchasedItems.map(([id, value]) => ({ label: itemLabel(id), value }))}
                />
                <RankedList
                  title="חפצים שהוכנסו לחדרים"
                  rows={summary.placedItems.map(([id, value]) => ({ label: itemLabel(id), value }))}
                />
                <RankedList
                  title="נדירות שיצאה מקופסאות"
                  rows={summary.boxRarities.map(([id, value]) => ({ label: id, value }))}
                />
                <RankedList
                  title="סיבות למתן נקודות"
                  rows={summary.reasonRanking.map(([id, value]) => ({ label: reasonLabel(id), value }))}
                />
                <RankedList
                  title="עולמות חיה שנבחרו"
                  rows={summary.companionThemes.map(([id, value]) => ({ label: themeLabel(id), value }))}
                />
                <RankedList
                  title="אירועי הממלכה שנצפו"
                  rows={summary.ambientRanking.map(([id, value]) => ({ label: id, value }))}
                />
              </div>

              <div className="mt-4 rounded-2xl border border-amber-300/15 bg-amber-400/5 px-4 py-3 text-xs leading-5 text-amber-100/70">
                analytics v2 משתמש באותם אירועים שכבר נאספים מאז v1. נתוני חזרה, גילוי מסכים והוגנות הם אינדיקציות מצטברות לצורך החלטות מוצר — לא כלי להערכת תלמידים.
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
