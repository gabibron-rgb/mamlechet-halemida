import { useEffect, useMemo, useState } from 'react';

import { TROPHY_THEMES } from '../../data/trophies';
import {
  fetchClassRoomVisitors,
  type ClassRoomVisitor,
} from '../../lib/classRoomVisitors';
import RoomView from './RoomView';

const REFRESH_MS = 15_000;

function placedItemCount(visitor: ClassRoomVisitor): number {
  return visitor.inventory.filter(entry =>
    entry.kind !== 'box' &&
    entry.roomX !== null &&
    entry.roomX !== undefined &&
    entry.roomY !== null &&
    entry.roomY !== undefined
  ).length;
}

function trophyDefinition(themeId: string) {
  return TROPHY_THEMES.find(theme => theme.id === themeId);
}

function trophyDate(timestamp: number): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

export default function ClassRoomsPanel({
  currentStudentId,
  classId,
}: {
  currentStudentId: string;
  classId: string;
}) {
  const [visitors, setVisitors] = useState<ClassRoomVisitor[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function refresh(showLoading: boolean) {
      if (showLoading) setLoading(true);

      try {
        const nextVisitors = await fetchClassRoomVisitors(classId);
        if (cancelled) return;

        setVisitors(nextVisitors);
        setError(null);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : 'לא הצלחנו לטעון כרגע את חדרי הכיתה.'
        );
      } finally {
        if (!cancelled && showLoading) setLoading(false);
      }
    }

    void refresh(true);

    const intervalId = window.setInterval(() => {
      void refresh(false);
    }, REFRESH_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [classId]);

  const classmates = useMemo(
    () =>
      visitors
        .filter(visitor =>
          visitor.id !== currentStudentId && visitor.classId === classId
        )
        .sort((first, second) => first.name.localeCompare(second.name, 'he')),
    [visitors, currentStudentId, classId]
  );

  const selectedIndex = classmates.findIndex(
    visitor => visitor.id === selectedStudentId
  );
  const selectedVisitor =
    selectedIndex >= 0 ? classmates[selectedIndex] : null;

  useEffect(() => {
    if (selectedStudentId && !selectedVisitor) {
      setSelectedStudentId(null);
    }
  }, [selectedStudentId, selectedVisitor]);

  function selectRelativeRoom(direction: -1 | 1) {
    if (classmates.length === 0) return;

    const baseIndex = selectedIndex >= 0 ? selectedIndex : 0;
    const nextIndex =
      (baseIndex + direction + classmates.length) % classmates.length;

    setSelectedStudentId(classmates[nextIndex].id);
  }

  if (selectedVisitor) {
    const trophies = [...selectedVisitor.trophies]
      .sort((a, b) => b.awardedAt - a.awardedAt)
      .slice(0, 6);

    return (
      <div className="space-y-5">
        <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-magic-bg/30 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-black text-magic-soft/50">🏘️ ביקור בחדר</div>
            <h2 className="mt-1 text-2xl font-black text-magic-accent">
              החדר של {selectedVisitor.name}
            </h2>
            <p className="mt-1 text-xs text-magic-soft/60">
              צפייה בלבד — שום דבר שתעשה כאן לא משנה את החדר של {selectedVisitor.name}.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {classmates.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => selectRelativeRoom(-1)}
                  className="rounded-xl bg-white/10 px-3 py-2 text-xs font-black text-white hover:bg-white/15"
                >
                  הקודם
                </button>
                <button
                  type="button"
                  onClick={() => selectRelativeRoom(1)}
                  className="rounded-xl bg-white/10 px-3 py-2 text-xs font-black text-white hover:bg-white/15"
                >
                  הבא
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setSelectedStudentId(null)}
              className="rounded-xl bg-magic-accent px-4 py-2 text-xs font-black text-magic-bg"
            >
              לכל חדרי הכיתה
            </button>
          </div>
        </div>

        <RoomView student={selectedVisitor} readOnly />

        <div className="rounded-3xl border border-yellow-300/15 bg-magic-bg/30 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-white">🏆 גביעים שמוצגים בפרופיל</h3>
              <p className="mt-1 text-xs text-magic-soft/55">
                {selectedVisitor.trophies.length} גביעים בסך הכול
              </p>
            </div>
          </div>

          {trophies.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 px-4 py-6 text-center text-sm text-magic-soft/55">
              עדיין אין גביעים להצגה.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {trophies.map(trophy => {
                const definition = trophyDefinition(trophy.trophyTheme);

                return (
                  <div
                    key={trophy.id}
                    className="rounded-2xl border border-white/10 bg-black/15 p-3 text-center"
                  >
                    <div className="text-3xl">{definition?.emoji ?? '🏆'}</div>
                    <div className="mt-1 text-xs font-black text-yellow-100">
                      {definition?.nameHe ?? 'גביע מיוחד'}
                    </div>
                    <div className="mt-2 line-clamp-2 text-[11px] leading-5 text-magic-soft/65">
                      {trophy.caption?.trim() || 'פרס מיוחד מהמורה'}
                    </div>
                    <div className="mt-2 text-[9px] font-bold text-magic-soft/35">
                      {trophyDate(trophy.awardedAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 text-center">
        <div className="mb-2 text-5xl">🏘️</div>
        <h2 className="text-3xl font-black text-magic-accent">חדרי הכיתה</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-magic-soft/70">
          אפשר לבקר בחדרים של תלמידים שנמצאים איתך בכיתה כרגע. הביקור הוא לצפייה בלבד — אי אפשר להזיז או להסיר חפצים של מישהו אחר.
        </p>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-magic-bg/30 px-5 py-12 text-center text-magic-soft/65">
          טוען את חדרי הכיתה…
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-300/20 bg-red-950/20 px-5 py-8 text-center">
          <div className="font-black text-red-100">לא הצלחנו לטעון את החדרים כרגע</div>
          <div className="mt-2 text-xs text-red-100/60">{error}</div>
        </div>
      ) : classmates.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/15 bg-magic-bg/30 px-5 py-12 text-center">
          <div className="mb-3 text-5xl">🏠</div>
          <div className="font-black text-white">אין כרגע חדרים אחרים בכיתה</div>
          <p className="mt-2 text-sm text-magic-soft/55">
            כשיהיו תלמידים נוספים באותה כיתה, החדרים שלהם יופיעו כאן אוטומטית.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classmates.map(visitor => {
            const placedCount = placedItemCount(visitor);
            const companionLabel = visitor.companion.unlocked
              ? visitor.companion.name?.trim() || 'חיית מחמד'
              : 'החיה עדיין נעולה';

            return (
              <button
                key={visitor.id}
                type="button"
                onClick={() => setSelectedStudentId(visitor.id)}
                className="group rounded-3xl border border-white/10 bg-gradient-to-b from-magic-bg/35 to-black/20 p-5 text-right transition hover:-translate-y-0.5 hover:border-magic-accent/35 hover:bg-magic-bg/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xl font-black text-white">
                      {visitor.name}
                    </div>
                    <div className="mt-1 text-xs text-magic-soft/50">
                      🏠 {placedCount} חפצים מוצבים
                    </div>
                  </div>
                  <div className="text-4xl transition group-hover:scale-110">🏰</div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-center text-[10px]">
                  <div className="rounded-xl bg-white/5 px-2 py-2 text-magic-soft/65">
                    🐾 {companionLabel}
                  </div>
                  <div className="rounded-xl bg-white/5 px-2 py-2 text-magic-soft/65">
                    🏆 {visitor.trophies.length} גביעים
                  </div>
                </div>

                <div className="mt-4 text-center text-xs font-black text-magic-accent">
                  כניסה לחדר ←
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-5 rounded-2xl border border-cyan-300/10 bg-cyan-500/5 px-4 py-3 text-center text-[11px] leading-5 text-cyan-100/60">
        רשימת החדרים נקבעת לפי הכיתה הנוכחית ב־Supabase. אם תלמיד עובר כיתה, הוא יעבור אוטומטית גם לרשימת החדרים של הכיתה החדשה — בלי לשנות את החדר האישי שלו.
      </div>
    </div>
  );
}
