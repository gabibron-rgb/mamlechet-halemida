import { useMemo, useState } from 'react';
import {
  isMissionActive,
  isMissionCompleted,
  isMissionOverdue,
  missionRewardPreset,
} from '../../data/missions';
import type { StudentMission } from '../../data/missions';
import { useGameStore } from '../../store/useGameStore';
import type { StudentState } from '../../store/useGameStore';

type Props = {
  students: StudentState[];
  onCreateMission: () => void;
};

type MissionRecipient = {
  student: StudentState;
  mission: StudentMission;
};

type MissionGroup = {
  id: string;
  sample: StudentMission;
  recipients: MissionRecipient[];
};

export default function MissionBoard({ students, onCreateMission }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const completeMission = useGameStore(s => s.completeMission);
  const cancelMission = useGameStore(s => s.cancelMission);

  const groups = useMemo(() => groupMissions(students), [students]);
  const activeGroups = groups
    .filter(group => group.recipients.some(item => isMissionActive(item.mission)))
    .sort((first, second) => second.sample.assignedAt - first.sample.assignedAt);
  const recentlyCompleted = groups
    .filter(
      group =>
        group.recipients.length > 0 &&
        group.recipients.every(item => !isMissionActive(item.mission)) &&
        group.recipients.some(item => isMissionCompleted(item.mission))
    )
    .sort((first, second) => latestCompletion(second) - latestCompletion(first))
    .slice(0, 3);

  async function handleComplete(studentId: string, missionId: string) {
    const key = `${studentId}:${missionId}:complete`;
    setBusyKey(key);
    await completeMission(studentId, missionId);
    setBusyKey(null);
  }

  async function handleCancel(studentId: string, missionId: string) {
    const key = `${studentId}:${missionId}:cancel`;
    setBusyKey(key);
    await cancelMission(studentId, missionId);
    setBusyKey(null);
  }

  return (
    <div className="mb-4 rounded-3xl bg-magic-panel/80 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setExpanded(value => !value)}
          className="text-right"
        >
          <div className="font-black text-magic-accent">📋 משימות תלמידים</div>
          <div className="mt-0.5 text-sm text-magic-soft/65">
            {activeGroups.length === 0
              ? 'אין כרגע משימות פעילות'
              : `${activeGroups.length} משימות פעילות · לחצו לניהול`}
          </div>
        </button>

        <button
          type="button"
          onClick={onCreateMission}
          disabled={students.length === 0}
          className="rounded-xl bg-magic-accent px-5 py-2 font-black text-magic-bg transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
        >
          + משימה חדשה
        </button>
      </div>

      {expanded && (
        <div className="mt-5">
          {activeGroups.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-magic-bg/30 p-5 text-center text-sm text-magic-soft/65">
              צרו משימה קצרה, בחרו למי היא מיועדת, וסמנו השלמה כשהתלמיד/ה
              מסיים/ת. הפרסים קטנים וקבועים מראש.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {activeGroups.map(group => (
                <MissionGroupCard
                  key={group.id}
                  group={group}
                  busyKey={busyKey}
                  onComplete={handleComplete}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          )}

          {recentlyCompleted.length > 0 && (
            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="mb-2 text-xs font-black uppercase tracking-wide text-magic-soft/45">
                הושלמו לאחרונה
              </div>
              <div className="flex flex-col gap-2">
                {recentlyCompleted.map(group => (
                  <div
                    key={group.id}
                    className="flex flex-col gap-1 rounded-2xl bg-magic-bg/25 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="font-bold text-white">✓ {group.sample.title}</span>
                    <span className="text-xs text-magic-soft/50">
                      {group.recipients.filter(item => isMissionCompleted(item.mission)).length}
                      {' '}תלמידים השלימו
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MissionGroupCard({
  group,
  busyKey,
  onComplete,
  onCancel,
}: {
  group: MissionGroup;
  busyKey: string | null;
  onComplete: (studentId: string, missionId: string) => Promise<void>;
  onCancel: (studentId: string, missionId: string) => Promise<void>;
}) {
  const preset = missionRewardPreset(group.sample.rewardTier);
  const activeRecipients = group.recipients.filter(item =>
    isMissionActive(item.mission)
  );
  const completedCount = group.recipients.filter(item =>
    isMissionCompleted(item.mission)
  ).length;
  const overdue = activeRecipients.some(item => isMissionOverdue(item.mission));

  return (
    <div
      className={`rounded-2xl border p-4 ${
        overdue
          ? 'border-rose-300/25 bg-rose-500/8'
          : 'border-white/10 bg-magic-bg/35'
      }`}
    >
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="font-black text-white">{group.sample.title}</div>
          {group.sample.description && (
            <p className="mt-1 max-w-xl whitespace-pre-wrap text-xs leading-5 text-magic-soft/65">
              {group.sample.description}
            </p>
          )}
        </div>
        <div className="shrink-0 text-xs font-black text-magic-accent">
          {preset.emoji} +{group.sample.rewardPoints} נק׳
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2 text-[11px] text-magic-soft/55">
        <span>{group.recipients.length} שובצו</span>
        <span>·</span>
        <span>{completedCount} הושלמו</span>
        {group.sample.dueAt !== null && (
          <>
            <span>·</span>
            <span className={overdue ? 'font-bold text-rose-200' : ''}>
              {overdue ? '⚠️ ' : '🗓️ '}עד {formatDate(group.sample.dueAt)}
            </span>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {group.recipients.map(({ student, mission }) => {
          const completeKey = `${student.id}:${mission.id}:complete`;
          const cancelKey = `${student.id}:${mission.id}:cancel`;
          const active = isMissionActive(mission);
          const completed = isMissionCompleted(mission);

          return (
            <div
              key={`${student.id}:${mission.id}`}
              className="flex flex-col gap-2 rounded-xl border border-white/7 bg-black/10 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="font-bold text-white">{student.name}</div>

              {active && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void onComplete(student.id, mission.id)}
                    disabled={busyKey !== null}
                    className="rounded-lg bg-emerald-400 px-3 py-1.5 text-xs font-black text-emerald-950 disabled:opacity-40"
                  >
                    {busyKey === completeKey ? 'שומר...' : '✓ הושלם'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void onCancel(student.id, mission.id)}
                    disabled={busyKey !== null}
                    className="rounded-lg border border-white/10 bg-magic-bg/50 px-3 py-1.5 text-xs font-bold text-magic-soft/65 disabled:opacity-40"
                  >
                    {busyKey === cancelKey ? '...' : 'בטל'}
                  </button>
                </div>
              )}

              {completed && (
                <span className="text-xs font-black text-emerald-200">
                  ✓ הושלם · הפרס ניתן
                </span>
              )}

              {mission.cancelledAt !== null && (
                <span className="text-xs text-magic-soft/35">בוטל</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function groupMissions(students: StudentState[]): MissionGroup[] {
  const groups = new Map<string, MissionGroup>();

  for (const student of students) {
    for (const mission of student.missions ?? []) {
      const current = groups.get(mission.id);
      if (current) {
        current.recipients.push({ student, mission });
      } else {
        groups.set(mission.id, {
          id: mission.id,
          sample: mission,
          recipients: [{ student, mission }],
        });
      }
    }
  }

  return Array.from(groups.values());
}

function latestCompletion(group: MissionGroup): number {
  return Math.max(
    0,
    ...group.recipients.map(item => item.mission.completedAt ?? 0)
  );
}

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'numeric',
  }).format(new Date(timestamp));
}
