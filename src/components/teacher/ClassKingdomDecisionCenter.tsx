import { useEffect, useMemo, useState } from 'react';
import {
  CLASS_ROOM_CHOICE_GROUPS,
  CLASS_ROOM_ITEMS,
  classRoomItemById,
  type ClassRoomChoiceGroupId,
  type ClassRoomItemId,
} from '../../data/classRoomItems';
import { CLASS_KINGDOM_ROOMS } from '../../data/classKingdomRooms';
import {
  finalizeClassRelicChoiceAsTeacher,
  loadClassKingdomState,
  loadClassRelicVoteSummary,
  type ClassRelicVoteSummary,
  type ClassRoomChoiceSelections,
} from '../../lib/classKingdomState';
import './ClassKingdomDecisionCenter.css';

type Props = {
  classId: string;
  teacherId: string;
  stars: number;
  sandboxMode?: boolean;
};

type NextUnlock = {
  id: string;
  stars: number;
  icon: string;
  titleHe: string;
  kindHe: string;
};

const SANDBOX_CHOICES_STORAGE_KEY = 'mamlechet-class-kingdom-gate-room-choices-v1';
const REPLAY_CEREMONY_EVENT = 'mamlechet:class-kingdom-replay-latest-ceremony';

export default function ClassKingdomDecisionCenter({
  classId,
  teacherId,
  stars,
  sandboxMode = false,
}: Props) {
  const [choices, setChoices] = useState<ClassRoomChoiceSelections>({});
  const [voteSummary, setVoteSummary] = useState<ClassRelicVoteSummary>({});
  const [loading, setLoading] = useState(true);
  const [busyGroup, setBusyGroup] = useState<ClassRoomChoiceGroupId | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setMessage(null);

      if (sandboxMode) {
        try {
          const raw = window.localStorage.getItem(SANDBOX_CHOICES_STORAGE_KEY);
          const parsed = raw ? JSON.parse(raw) : {};
          if (!cancelled) setChoices(normalizeChoices(parsed));
        } catch {
          if (!cancelled) setChoices({});
        }
        if (!cancelled) {
          setVoteSummary({});
          setLoading(false);
        }
        return;
      }

      const [stateResult, votesResult] = await Promise.all([
        loadClassKingdomState(classId, 'gate'),
        loadClassRelicVoteSummary(classId),
      ]);

      if (cancelled) return;

      if (stateResult.ok) {
        setChoices(normalizeChoices(stateResult.state.choices));
      } else {
        setMessage(`⚠️ ${stateResult.message}`);
      }

      if (votesResult.ok) {
        setVoteSummary(votesResult.summary);
      } else {
        setMessage(current => current ?? `⚠️ ${votesResult.message}`);
      }

      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [classId, sandboxMode]);

  useEffect(() => {
    if (sandboxMode) return;

    const intervalId = window.setInterval(() => {
      void loadClassRelicVoteSummary(classId).then(result => {
        if (result.ok) setVoteSummary(result.summary);
      });
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [classId, sandboxMode]);

  const pendingGroups = useMemo(
    () => CLASS_ROOM_CHOICE_GROUPS.filter(group => stars >= group.stars && !choices[group.id]),
    [stars, choices]
  );

  const completedGroups = useMemo(
    () => CLASS_ROOM_CHOICE_GROUPS.filter(group => Boolean(choices[group.id])),
    [choices]
  );

  const nextUnlocks = useMemo(() => buildNextUnlocks(stars), [stars]);

  async function refreshVotes() {
    if (sandboxMode) return;
    const result = await loadClassRelicVoteSummary(classId);
    if (result.ok) {
      setVoteSummary(result.summary);
      setMessage('✓ תוצאות ההצבעה עודכנו.');
    } else {
      setMessage(`⚠️ ${result.message}`);
    }
  }

  async function approveChoice(groupId: ClassRoomChoiceGroupId, itemId: ClassRoomItemId) {
    const group = CLASS_ROOM_CHOICE_GROUPS.find(entry => entry.id === groupId);
    const item = classRoomItemById(itemId);
    if (!group || !item || stars < group.stars || choices[groupId]) return;

    if (sandboxMode) {
      const next = { ...choices, [groupId]: itemId };
      setChoices(next);
      window.localStorage.setItem(SANDBOX_CHOICES_STORAGE_KEY, JSON.stringify(next));
      setMessage(`🧪 בניסוי נבחר: ${item.nameHe}.`);
      return;
    }

    const votes = voteSummary[groupId]?.[itemId] ?? 0;
    const approved = window.confirm(
      `לאשר את “${item.nameHe}” כפרס הסופי של ${group.titleHe}?\n\n` +
      `כרגע יש לאפשרות הזו ${votes} קולות. לאחר האישור הבחירה נשמרת לכיתה.`
    );
    if (!approved) return;

    setBusyGroup(groupId);
    setMessage(null);
    const result = await finalizeClassRelicChoiceAsTeacher(classId, teacherId, groupId, itemId);
    setBusyGroup(null);

    if (result.ok === false) {
      setMessage(`⚠️ ${result.message}`);
      return;
    }

    setChoices(normalizeChoices(result.state.choices));
    setMessage(`👑 ${item.nameHe} אושר כפרס הכיתתי.`);
  }

  function replayLatestCeremony() {
    window.dispatchEvent(new Event(REPLAY_CEREMONY_EVENT));
  }

  return (
    <section className="ck-decision-center" dir="rtl">
      <div className="ck-decision-head">
        <div>
          <div className="ck-decision-kicker">👑 מרכז החלטות הממלכה</div>
          <h3>כל ההחלטות הכיתתיות במקום אחד</h3>
          <p>
            כאן רואים הצבעות שממתינות להכרעה, מאשרים את הפרס הסופי, בודקים מה ייפתח בהמשך
            ומפעילים מחדש את טקס אבן הדרך האחרון.
          </p>
        </div>

        <div className="ck-decision-head-actions">
          <div className={`ck-decision-pending-pill ${pendingGroups.length > 0 ? 'has-pending' : ''}`}>
            <strong>{loading ? '…' : pendingGroups.length}</strong>
            <span>החלטות ממתינות</span>
          </div>
          <button type="button" onClick={replayLatestCeremony} className="ck-decision-replay">
            🎬 הצג שוב טקס אחרון
          </button>
        </div>
      </div>

      {sandboxMode && (
        <div className="ck-decision-sandbox">
          🧪 מצב ניסויים — אישור פרסים כאן נשמר רק בדפדפן ולא משנה נתוני כיתה אמיתיים.
        </div>
      )}

      {message && <div className="ck-decision-message">{message}</div>}

      <div className="ck-decision-layout">
        <div className="ck-decision-main">
          <div className="ck-decision-section-title-row">
            <div>
              <div className="ck-decision-section-kicker">🗳️ החלטות ופרסים</div>
              <h4>בחירות אבני הדרך</h4>
            </div>
            {!sandboxMode && (
              <button type="button" onClick={() => void refreshVotes()} className="ck-decision-refresh">
                ↻ רענן קולות
              </button>
            )}
          </div>

          <div className="ck-decision-groups">
            {CLASS_ROOM_CHOICE_GROUPS.map(group => {
              const reached = stars >= group.stars;
              const selectedId = choices[group.id];
              const selected = selectedId ? classRoomItemById(selectedId) : null;
              const votes = voteSummary[group.id] ?? {};
              const totalVotes = group.optionIds.reduce((sum, itemId) => sum + (votes[itemId] ?? 0), 0);
              const highestVotes = Math.max(0, ...group.optionIds.map(itemId => votes[itemId] ?? 0));

              return (
                <article
                  key={group.id}
                  className={`ck-decision-group ${selected ? 'is-complete' : reached ? 'is-pending' : 'is-locked'}`}
                >
                  <div className="ck-decision-group-head">
                    <div>
                      <span className="ck-decision-stars">{group.stars}⭐</span>
                      <h5>{group.titleHe}</h5>
                      <p>{group.subtitleHe}</p>
                    </div>
                    <span className="ck-decision-state">
                      {selected
                        ? '✓ הוכרע'
                        : reached
                          ? sandboxMode
                            ? '🧪 מוכן לבחירה'
                            : `🗳️ ${totalVotes} קולות · ממתין למורה`
                          : `🔒 חסרים ${Math.max(0, group.stars - stars)}⭐`}
                    </span>
                  </div>

                  {selected ? (
                    <div className="ck-decision-selected">
                      <img src={selected.imagePath} alt="" draggable={false} />
                      <div>
                        <span>הפרס שנבחר</span>
                        <strong>{selected.nameHe}</strong>
                        <p>{selected.descriptionHe}</p>
                      </div>
                    </div>
                  ) : reached ? (
                    <div className="ck-decision-options">
                      {group.optionIds.map(optionId => {
                        const option = classRoomItemById(optionId);
                        if (!option) return null;
                        const optionVotes = votes[optionId] ?? 0;
                        const pct = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
                        const isLeader = totalVotes > 0 && optionVotes === highestVotes;
                        const busy = busyGroup === group.id;

                        return (
                          <div key={optionId} className={`ck-decision-option ${isLeader ? 'is-leader' : ''}`}>
                            <div className="ck-decision-option-art">
                              <img src={option.imagePath} alt="" draggable={false} />
                            </div>
                            <div className="ck-decision-option-title-row">
                              <strong>{option.nameHe}</strong>
                              {isLeader && !sandboxMode && <span>מוביל</span>}
                            </div>
                            <p>{option.descriptionHe}</p>

                            {!sandboxMode && (
                              <div className="ck-decision-vote-block">
                                <div className="ck-decision-vote-row">
                                  <span>🗳️ {optionVotes} קולות</span>
                                  <strong>{pct}%</strong>
                                </div>
                                <div className="ck-decision-vote-track">
                                  <div style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            )}

                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void approveChoice(group.id, option.id)}
                            >
                              {busy ? 'שומר…' : sandboxMode ? '🧪 בחר בניסוי' : '👑 אשר כפרס הסופי'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="ck-decision-locked-copy">
                      הבחירה תיפתח אוטומטית כשהכיתה תגיע ל־{group.stars} כוכבים.
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>

        <aside className="ck-decision-side">
          <div className="ck-decision-next-card">
            <div className="ck-decision-section-kicker">✨ מה נפתח בהמשך</div>
            {nextUnlocks.length > 0 ? (
              <>
                <div className="ck-decision-next-star">
                  <strong>{nextUnlocks[0].stars}⭐</strong>
                  <span>אבן הדרך הבאה</span>
                </div>
                <div className="ck-decision-next-list">
                  {nextUnlocks.map(unlock => (
                    <div key={unlock.id}>
                      <span className="ck-decision-next-icon">{unlock.icon}</span>
                      <div>
                        <strong>{unlock.titleHe}</strong>
                        <span>{unlock.kindHe}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="ck-decision-next-gap">
                  חסרים {Math.max(0, nextUnlocks[0].stars - stars)} כוכבים
                </div>
              </>
            ) : (
              <div className="ck-decision-complete">
                👑 כל אבני הדרך במסלול הנוכחי כבר פתוחות.
              </div>
            )}
          </div>

          <div className="ck-decision-history-card">
            <div className="ck-decision-section-kicker">📜 היסטוריית החלטות</div>
            {completedGroups.length === 0 ? (
              <p>עדיין לא נסגרה בחירת פרס כיתתית.</p>
            ) : (
              <div className="ck-decision-history-list">
                {completedGroups.map(group => {
                  const itemId = choices[group.id];
                  const item = itemId ? classRoomItemById(itemId) : null;
                  if (!item) return null;
                  return (
                    <div key={group.id}>
                      <img src={item.imagePath} alt="" draggable={false} />
                      <div>
                        <span>{group.stars}⭐ · {group.titleHe}</span>
                        <strong>{item.nameHe}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

function normalizeChoices(value: unknown): ClassRoomChoiceSelections {
  if (!value || typeof value !== 'object') return {};
  const source = value as Record<string, unknown>;
  const result: ClassRoomChoiceSelections = {};

  for (const group of CLASS_ROOM_CHOICE_GROUPS) {
    const itemId = source[group.id];
    if (typeof itemId !== 'string') continue;
    const item = classRoomItemById(itemId as ClassRoomItemId);
    if (!item || item.choiceGroupId !== group.id || !group.optionIds.includes(item.id)) continue;
    result[group.id] = item.id;
  }

  return result;
}

function buildNextUnlocks(stars: number): NextUnlock[] {
  const safeStars = Math.max(0, Math.floor(stars));
  const future: NextUnlock[] = [];

  for (const room of CLASS_KINGDOM_ROOMS) {
    if (room.unlockStars <= safeStars) continue;
    future.push({
      id: `room-${room.id}`,
      stars: room.unlockStars,
      icon: room.icon,
      titleHe: room.titleHe,
      kindHe: 'חדר / מבנה חדש',
    });
  }

  for (const item of CLASS_ROOM_ITEMS) {
    if (item.unlockKind !== 'automatic' || item.unlockStars <= safeStars) continue;
    future.push({
      id: `reward-${item.id}`,
      stars: item.unlockStars,
      icon: item.rarity === 'legendary' ? '🌟' : item.rarity === 'epic' ? '💜' : '🎁',
      titleHe: item.nameHe,
      kindHe: 'פרס כיתתי אוטומטי',
    });
  }

  for (const group of CLASS_ROOM_CHOICE_GROUPS) {
    if (group.stars <= safeStars) continue;
    future.push({
      id: `choice-${group.id}`,
      stars: group.stars,
      icon: '🗳️',
      titleHe: group.titleHe,
      kindHe: 'בחירת פרס כיתתית',
    });
  }

  future.sort((a, b) => a.stars - b.stars || a.kindHe.localeCompare(b.kindHe, 'he'));
  const nextStar = future[0]?.stars;
  if (nextStar === undefined) return [];
  return future.filter(entry => entry.stars === nextStar);
}
