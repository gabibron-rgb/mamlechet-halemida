import { useMemo } from 'react';
import { classKingdomStars } from '../../data/classKingdom';
import type { StudentClassGoal } from '../../data/classGoals';
import type { StudentState } from '../../store/useGameStore';
import ClassKingdomScene from '../student/ClassKingdomScene';
import ClassSpecialRelicAwardPanel from './ClassSpecialRelicAwardPanel';

type Props = {
  open: boolean;
  onClose: () => void;
  classId: string;
  teacherId: string;
  students: StudentState[];
};

export default function ClassKingdomManagerModal({
  open,
  onClose,
  classId,
  teacherId,
  students,
}: Props) {
  const stars = useMemo(() => classKingdomStars(mergeClassGoals(students)), [students]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#080617]/90 p-3 backdrop-blur-sm sm:p-6" dir="rtl">
      <div className="mx-auto max-w-7xl rounded-3xl border border-yellow-300/20 bg-[#15102d] p-4 shadow-2xl sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-black text-yellow-100/60">👑 ממשק מורה</div>
            <h2 className="mt-1 text-2xl font-black text-magic-accent">ניהול הממלכה הכיתתית</h2>
            <p className="mt-1 text-sm text-magic-soft/65">
              כאן אפשר לעצב את החדר ולאשר את בחירות הכיתה. תלמידים רואים את אותה ממלכה במצב צפייה בלבד.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="self-start rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-black text-white transition hover:bg-white/10"
          >
            ✕ סגור ניהול
          </button>
        </div>

        <div className="mb-4 rounded-2xl border border-cyan-300/15 bg-cyan-500/8 px-4 py-3 text-xs leading-5 text-cyan-100/85">
          🗳️ תלמידים יכולים להצביע פעם אחת בכל בחירת מזכרת. ההצבעה אינה סוגרת את ההחלטה — רק המורה יכול לאשר את הפרס הסופי.
        </div>

        <ClassSpecialRelicAwardPanel
          classId={classId}
          teacherId={teacherId}
          sandboxMode={import.meta.env.DEV || classId === 'test2'}
        />

        <ClassKingdomScene
          stars={stars}
          classId={classId}
          viewerRole="teacher"
          teacherId={teacherId}
          allowSandbox={import.meta.env.DEV || classId === 'test2'}
        />
      </div>
    </div>
  );
}

function mergeClassGoals(students: StudentState[]): StudentClassGoal[] {
  const byId = new Map<string, StudentClassGoal>();

  for (const student of students) {
    for (const goal of student.classGoals ?? []) {
      const current = byId.get(goal.id);
      if (!current) {
        byId.set(goal.id, { ...goal, contributionIds: [...goal.contributionIds] });
        continue;
      }

      const contributionIds = Array.from(
        new Set([...current.contributionIds, ...goal.contributionIds])
      );
      byId.set(goal.id, {
        ...current,
        contributionIds,
        completedAt: current.completedAt ?? goal.completedAt,
        cancelledAt: current.cancelledAt ?? goal.cancelledAt,
      });
    }
  }

  return Array.from(byId.values());
}
