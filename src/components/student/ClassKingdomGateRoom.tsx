import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type PointerEvent,
} from 'react';
import {
  CLASS_ROOM_CHOICE_GROUPS,
  CLASS_ROOM_ITEMS,
  classRoomCollectionCapacity,
  classRoomItemById,
  isClassRoomItemUnlocked,
  nextClassRoomItem,
  unlockedClassRoomItems,
  type ClassRoomChoiceGroupId,
  type ClassRoomItemDefinition,
  type ClassRoomItemId,
} from '../../data/classRoomItems';
import {
  castClassRelicVote,
  finalizeClassRelicChoiceAsTeacher,
  loadClassKingdomState,
  loadClassRelicVoteSummary,
  loadStudentClassRelicVotes,
  saveClassKingdomRoomAsTeacher,
  type ClassRelicVoteSummary,
  type ClassRoomChoiceSelections,
  type ClassRoomPlacement,
  type StudentClassRelicVotes,
} from '../../lib/classKingdomState';
import './ClassKingdomGateRoom.css';

type Props = {
  stars: number;
  classId: string;
  sandboxMode?: boolean;
  viewerRole?: 'student' | 'teacher';
  studentId?: string | null;
  teacherId?: string | null;
  onBack: () => void;
};

type Placement = ClassRoomPlacement;

type DragState = {
  instanceId: string;
  pointerId: number;
};

type DrawerFilter = 'all' | 'decor' | 'object';

const SANDBOX_STORAGE_KEY = 'mamlechet-class-kingdom-gate-room-sandbox-v1';
const SANDBOX_CHOICES_STORAGE_KEY = 'mamlechet-class-kingdom-gate-room-choices-v1';
const STAGE_BOUNDS = { minX: 4, maxX: 96, minY: 7, maxY: 94 };

export default function ClassKingdomGateRoom({
  stars,
  classId,
  sandboxMode = false,
  viewerRole = 'student',
  studentId = null,
  teacherId = null,
  onBack,
}: Props) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [drawerFilter, setDrawerFilter] = useState<DrawerFilter>('all');
  const [savedPlacements, setSavedPlacements] = useState<Placement[]>([]);
  const [choiceSelections, setChoiceSelections] = useState<ClassRoomChoiceSelections>({});
  const [draftPlacements, setDraftPlacements] = useState<Placement[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [sharedLoading, setSharedLoading] = useState(!sandboxMode);
  const [sharedReady, setSharedReady] = useState(sandboxMode);
  const [sharedSaving, setSharedSaving] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [voteSummary, setVoteSummary] = useState<ClassRelicVoteSummary>({});
  const [studentVotes, setStudentVotes] = useState<StudentClassRelicVotes>({});
  const [voteBusyGroup, setVoteBusyGroup] = useState<ClassRoomChoiceGroupId | null>(null);

  const canManage = sandboxMode || (viewerRole === 'teacher' && Boolean(teacherId));
  const canVote = !sandboxMode && viewerRole === 'student' && Boolean(studentId);

  useEffect(() => {
    let cancelled = false;

    setEditMode(false);
    setSelectedInstanceId(null);
    setMessage(null);
    setLastSyncedAt(null);

    if (sandboxMode) {
      setSharedLoading(false);
      setSharedReady(true);

      try {
        const raw = window.localStorage.getItem(SANDBOX_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        const normalized = normalizePlacements(parsed);
        setSavedPlacements(normalized);
        setDraftPlacements(normalized);
      } catch {
        setSavedPlacements([]);
        setDraftPlacements([]);
      }

      try {
        const rawChoices = window.localStorage.getItem(SANDBOX_CHOICES_STORAGE_KEY);
        const parsedChoices = rawChoices ? JSON.parse(rawChoices) : {};
        setChoiceSelections(normalizeChoiceSelections(parsedChoices));
      } catch {
        setChoiceSelections({});
      }
      return () => { cancelled = true; };
    }

    setSharedLoading(true);
    setSharedReady(false);
    setSavedPlacements([]);
    setDraftPlacements([]);
    setChoiceSelections({});
    setVoteSummary({});
    setStudentVotes({});

    void loadClassKingdomState(classId).then(result => {
      if (cancelled) return;
      setSharedLoading(false);

      if (result.ok === false) {
        setSharedReady(false);
        setMessage(`⚠️ ${result.message}`);
        return;
      }

      const normalizedPlacements = normalizePlacements(result.state.placements);
      const normalizedChoices = normalizeChoiceSelections(result.state.choices);
      setSavedPlacements(normalizedPlacements);
      setDraftPlacements(normalizedPlacements);
      setChoiceSelections(normalizedChoices);
      setLastSyncedAt(result.state.updatedAt);
      setSharedReady(true);
    });

    void loadClassRelicVoteSummary(classId).then(result => {
      if (cancelled || result.ok === false) return;
      setVoteSummary(result.summary);
    });

    if (viewerRole === 'student' && studentId) {
      void loadStudentClassRelicVotes(classId, studentId).then(result => {
        if (cancelled || result.ok === false) return;
        setStudentVotes(result.votes);
      });
    }

    return () => {
      cancelled = true;
    };
  }, [sandboxMode, classId, viewerRole, studentId]);

  useEffect(() => {
    if (sandboxMode) return;

    const intervalId = window.setInterval(() => {
      void loadClassRelicVoteSummary(classId).then(result => {
        if (result.ok) setVoteSummary(result.summary);
      });
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [sandboxMode, classId]);

  const placements = editMode ? draftPlacements : savedPlacements;
  const selectedPlacement = placements.find(entry => entry.instanceId === selectedInstanceId) ?? null;
  const selectedItem = selectedPlacement ? classRoomItemById(selectedPlacement.itemId) : null;

  const drawerItems = useMemo(() => {
    return CLASS_ROOM_ITEMS.filter(item => drawerFilter === 'all' || item.category === drawerFilter);
  }, [drawerFilter]);

  const placedItemIds = useMemo(() => new Set(draftPlacements.map(entry => entry.itemId)), [draftPlacements]);
  const selectedChoiceItemIds = useMemo(
    () => Object.values(choiceSelections).filter((value): value is ClassRoomItemId => Boolean(value)),
    [choiceSelections]
  );
  const unlockedItems = useMemo(
    () => unlockedClassRoomItems(stars, selectedChoiceItemIds),
    [stars, selectedChoiceItemIds]
  );
  const unlockedItemIds = useMemo(() => new Set(unlockedItems.map(item => item.id)), [unlockedItems]);
  const collectionCapacity = classRoomCollectionCapacity();
  const nextRewardItem = useMemo(() => nextClassRoomItem(stars), [stars]);

  async function refreshVoteSummary() {
    if (sandboxMode) return;
    const result = await loadClassRelicVoteSummary(classId);
    if (result.ok) setVoteSummary(result.summary);
  }

  async function handleChoiceAction(groupId: ClassRoomChoiceGroupId, itemId: ClassRoomItemId) {
    if (!sandboxMode && !sharedReady) {
      setMessage('⚠️ החדר המשותף עדיין לא מחובר ל-Supabase.');
      return;
    }

    const group = CLASS_ROOM_CHOICE_GROUPS.find(entry => entry.id === groupId);
    if (!group || stars < group.stars || choiceSelections[groupId]) return;
    if (!group.optionIds.includes(itemId)) return;

    const item = classRoomItemById(itemId);
    if (!item) return;

    if (sandboxMode) {
      const nextSelections: ClassRoomChoiceSelections = { ...choiceSelections, [groupId]: itemId };
      setChoiceSelections(nextSelections);
      window.localStorage.setItem(SANDBOX_CHOICES_STORAGE_KEY, JSON.stringify(nextSelections));
      setMessage(`🧪 נבחרה מזכרת ניסוי: ${item.nameHe}.`);
      return;
    }

    if (viewerRole === 'student') {
      if (!studentId || studentVotes[groupId]) return;
      setVoteBusyGroup(groupId);
      const result = await castClassRelicVote(classId, studentId, groupId, itemId);
      setVoteBusyGroup(null);

      if (result.ok === false) {
        setMessage(`⚠️ ${result.message}`);
        return;
      }

      setStudentVotes(current => ({ ...current, [groupId]: itemId }));
      await refreshVoteSummary();
      setMessage(`🗳️ ההצבעה שלך ל“${item.nameHe}” נשמרה. המורה יאשר את הבחירה הסופית של הכיתה.`);
      return;
    }

    if (viewerRole !== 'teacher' || !teacherId) {
      setMessage('⚠️ רק המורה יכול לאשר את הפרס הסופי.');
      return;
    }

    const votes = voteSummary[groupId]?.[itemId] ?? 0;
    const approved = window.confirm(
      `לאשר את “${item.nameHe}” כמזכרת הסופית של הכיתה?

הפריט קיבל ${votes} קולות. אחרי האישור הבחירה תיסגר לכל הכיתה.`
    );
    if (!approved) return;

    setSharedSaving(true);
    const result = await finalizeClassRelicChoiceAsTeacher(classId, teacherId, groupId, itemId);
    setSharedSaving(false);

    if (result.ok === false) {
      setMessage(`⚠️ ${result.message}`);
      return;
    }

    const normalizedChoices = normalizeChoiceSelections(result.state.choices);
    setChoiceSelections(normalizedChoices);
    setLastSyncedAt(result.state.updatedAt);
    setMessage(`✅ ${item.nameHe} אושרה כמזכרת הסופית של הכיתה.`);
  }

  function resetSandboxChoices() {
    if (!sandboxMode) return;
    const choiceItemIds = new Set(
      CLASS_ROOM_ITEMS.filter(item => item.unlockKind === 'choice').map(item => item.id)
    );
    const nextSaved = savedPlacements.filter(entry => !choiceItemIds.has(entry.itemId));
    const nextDraft = draftPlacements.filter(entry => !choiceItemIds.has(entry.itemId));
    setChoiceSelections({});
    setSavedPlacements(nextSaved);
    setDraftPlacements(nextDraft);
    setSelectedInstanceId(null);
    window.localStorage.removeItem(SANDBOX_CHOICES_STORAGE_KEY);
    window.localStorage.setItem(SANDBOX_STORAGE_KEY, JSON.stringify(nextSaved));
    setMessage('🧪 בחירות הניסוי אופסו. אפשר לבחור שוב בכל אבן דרך.');
  }

  function toggleEditMode() {
    if (!canManage) {
      setMessage('🔒 עיצוב החדר זמין רק למורה. התלמידים יכולים לצפות בחדר ובהחלטות הכיתה.');
      return;
    }

    if (!sandboxMode && !sharedReady) {
      setMessage('⚠️ אי אפשר לערוך לפני שהחדר המשותף נטען מ-Supabase.');
      return;
    }

    if (editMode) {
      setDraftPlacements(savedPlacements);
      setEditMode(false);
      setSelectedInstanceId(null);
      setMessage('השינויים שלא נשמרו בוטלו.');
      return;
    }

    setDraftPlacements(savedPlacements);
    setEditMode(true);
    setSelectedInstanceId(null);
    setMessage('מצב עיצוב חופשי פעיל — כל החדר הוא קנבס. שימו כל חפץ איפה שנראה לכם מתאים.');
  }

  async function saveRoom() {
    if (!canManage) {
      setMessage('🔒 רק המורה יכול לשמור את עיצוב החדר.');
      return;
    }

    if (sandboxMode) {
      try {
        window.localStorage.setItem(SANDBOX_STORAGE_KEY, JSON.stringify(draftPlacements));
        setSavedPlacements(draftPlacements);
        setEditMode(false);
        setSelectedInstanceId(null);
        setMessage('✅ חדר הניסויים נשמר במחשב הזה. לא שונו נתוני כיתה אמיתיים.');
      } catch {
        setMessage('לא הצלחתי לשמור את חדר הניסויים בדפדפן.');
      }
      return;
    }

    if (!sharedReady || sharedSaving || !teacherId) return;
    setSharedSaving(true);
    const result = await saveClassKingdomRoomAsTeacher(classId, teacherId, draftPlacements);
    setSharedSaving(false);

    if (result.ok === false) {
      setMessage(`⚠️ ${result.message}`);
      return;
    }

    const normalizedPlacements = normalizePlacements(result.state.placements);
    setSavedPlacements(normalizedPlacements);
    setDraftPlacements(normalizedPlacements);
    setEditMode(false);
    setSelectedInstanceId(null);
    setLastSyncedAt(result.state.updatedAt);
    setMessage('✅ החדר נשמר ב-Supabase. כל תלמידי הכיתה יראו את אותו עיצוב.');
  }

  function clearDraftRoom() {
    if (!editMode) return;
    setDraftPlacements([]);
    setSelectedInstanceId(null);
    setMessage('החדר נוקה בטיוטה. לחצו “שמור שינויים” כדי לאשר.');
  }

  function addItem(item: ClassRoomItemDefinition, x = item.defaultX, y = item.defaultY) {
    if (!editMode || placedItemIds.has(item.id) || !isClassRoomItemUnlocked(item, stars, selectedChoiceItemIds)) return;

    const point = clampPoint(x, y);
    const nextLayer = draftPlacements.reduce((max, entry) => Math.max(max, entry.layer), 0) + 1;
    const placement: Placement = {
      instanceId: `${item.id}-${Date.now()}`,
      itemId: item.id,
      x: point.x,
      y: point.y,
      scale: item.defaultScale,
      layer: nextLayer,
    };

    setDraftPlacements(current => [...current, placement]);
    setSelectedInstanceId(placement.instanceId);
    setMessage(`${item.nameHe} נוסף לחדר. עכשיו אפשר לגרור אותו לכל מקום.`);
  }

  function removeSelectedItem() {
    if (!selectedInstanceId) return;
    setDraftPlacements(current => current.filter(entry => entry.instanceId !== selectedInstanceId));
    setSelectedInstanceId(null);
  }

  function changeSelectedScale(delta: number) {
    if (!selectedInstanceId) return;
    setDraftPlacements(current =>
      current.map(entry =>
        entry.instanceId === selectedInstanceId
          ? { ...entry, scale: clamp(entry.scale + delta, 0.55, 1.8) }
          : entry
      )
    );
  }

  function moveSelectedToFront() {
    if (!selectedInstanceId) return;
    setDraftPlacements(current => {
      const maxLayer = current.reduce((max, entry) => Math.max(max, entry.layer), 0);
      return current.map(entry =>
        entry.instanceId === selectedInstanceId ? { ...entry, layer: maxLayer + 1 } : entry
      );
    });
  }

  function moveSelectedToBack() {
    if (!selectedInstanceId) return;
    setDraftPlacements(current => {
      const minLayer = current.reduce((min, entry) => Math.min(min, entry.layer), 0);
      return current.map(entry =>
        entry.instanceId === selectedInstanceId ? { ...entry, layer: minLayer - 1 } : entry
      );
    });
  }

  function handleItemPointerDown(event: PointerEvent<HTMLButtonElement>, placement: Placement) {
    if (!editMode) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { instanceId: placement.instanceId, pointerId: event.pointerId };
    setSelectedInstanceId(placement.instanceId);
  }

  function handleItemPointerMove(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    const stage = stageRef.current;
    if (!editMode || !drag || !stage || drag.pointerId !== event.pointerId) return;

    const rect = stage.getBoundingClientRect();
    const point = clampPoint(
      ((event.clientX - rect.left) / rect.width) * 100,
      ((event.clientY - rect.top) / rect.height) * 100
    );

    setDraftPlacements(current =>
      current.map(entry =>
        entry.instanceId === drag.instanceId
          ? { ...entry, x: point.x, y: point.y }
          : entry
      )
    );
  }

  function handleItemPointerUp(event: PointerEvent<HTMLButtonElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already be released by the browser.
    }
  }

  function handleDrawerDragStart(event: DragEvent<HTMLDivElement>, item: ClassRoomItemDefinition) {
    if (!editMode || placedItemIds.has(item.id) || !isClassRoomItemUnlocked(item, stars, selectedChoiceItemIds)) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('application/x-class-room-item', item.id);
  }

  function handleStageDrop(event: DragEvent<HTMLDivElement>) {
    if (!editMode) return;
    event.preventDefault();

    const itemId = event.dataTransfer.getData('application/x-class-room-item') as ClassRoomItemId;
    const item = classRoomItemById(itemId);
    const stage = stageRef.current;
    if (!item || !stage || placedItemIds.has(item.id) || !isClassRoomItemUnlocked(item, stars, selectedChoiceItemIds)) return;

    const rect = stage.getBoundingClientRect();
    const point = clampPoint(
      ((event.clientX - rect.left) / rect.width) * 100,
      ((event.clientY - rect.top) / rect.height) * 100
    );
    addItem(item, point.x, point.y);
  }

  return (
    <section className="ck-gate-room-shell" dir="rtl">
      {sandboxMode && (
        <div className="ck-gate-room-sandbox">
          🧪 מצב ניסויים פעיל — העיצוב נשמר רק בדפדפן הזה. כוכבים ונתוני כיתה אמיתיים אינם משתנים.
        </div>
      )}
      {!sandboxMode && (
        <div className={`ck-gate-room-sync ${sharedReady ? 'is-ready' : sharedLoading ? 'is-loading' : 'is-error'}`}>
          {sharedLoading
            ? '☁️ טוען את החדר המשותף של הכיתה…'
            : sharedReady
              ? `☁️ חדר משותף מחובר ל-Supabase${lastSyncedAt ? ` · סנכרון ${formatSyncTime(lastSyncedAt)}` : ''}`
              : '⚠️ החדר המשותף לא מחובר עדיין. יש להריץ את קובץ ה-SQL המצורף.'}
        </div>
      )}

      <div className="ck-gate-room-toolbar">
        <div>
          <div className="ck-gate-room-kicker">🚪 חדר כיתתי · שער ההתחלה</div>
          <h3 className="ck-gate-room-title">אולם השער</h3>
          <p className="ck-gate-room-subtitle">
            {canManage
              ? 'החדר הכיתתי הראשון בממלכה. במצב העיצוב כל החדר פתוח להצבה חופשית — אין אזורי קיר או רצפה.'
              : 'החדר הכיתתי הראשון בממלכה. אפשר לצפות בעיצוב ובהישגים; שינוי החדר נשמר רק דרך ממשק המורה.'}
          </p>
        </div>

        <div className="ck-gate-room-actions">
          <div className="ck-gate-room-stars">⭐ {stars} כוכבי ממלכה</div>
          {canManage ? (
            <button
              type="button"
              onClick={toggleEditMode}
              disabled={sharedLoading || sharedSaving || (!sandboxMode && !sharedReady)}
              className={`ck-gate-room-edit ${editMode ? 'is-active' : ''}`}
            >
              {editMode ? '✕ ביטול עריכה' : '🛠️ מצב עיצוב'}
            </button>
          ) : (
            <div className="ck-gate-room-readonly">🔒 צפייה בלבד · העיצוב נשמר על ידי המורה</div>
          )}
          <button type="button" onClick={onBack} className="ck-gate-room-back">
            ← חזרה לממלכה
          </button>
        </div>
      </div>

      {message && <div className="ck-gate-room-message">{message}</div>}

      <div
        ref={stageRef}
        className={`ck-gate-room-stage ${editMode ? 'is-editing is-free-placement' : ''}`}
        onDragOver={event => editMode && event.preventDefault()}
        onDrop={handleStageDrop}
        onPointerDown={() => editMode && setSelectedInstanceId(null)}
      >
        <img
          src="/assets/class-kingdom/rooms/gate-hall-background-v2.png"
          alt="אולם השער הכיתתי"
          className="ck-gate-room-background"
          draggable={false}
        />

        <div className="ck-gate-room-vignette" aria-hidden="true" />

        {editMode && (
          <div className="ck-free-placement-hint" aria-hidden="true">
            ✨ כל החדר פתוח לעיצוב חופשי
          </div>
        )}

        {placements.map(placement => {
          const item = classRoomItemById(placement.itemId);
          if (!item) return null;
          const selected = placement.instanceId === selectedInstanceId;
          const style = {
            left: `${placement.x}%`,
            top: `${placement.y}%`,
            zIndex: 20 + placement.layer,
            '--ck-item-scale': placement.scale,
          } as CSSProperties;

          return (
            <button
              key={placement.instanceId}
              type="button"
              style={style}
              className={`ck-room-item-placement ck-room-item-${item.artKind} ${selected ? 'is-selected' : ''} ${editMode ? 'is-editable' : ''}`}
              onPointerDown={event => handleItemPointerDown(event, placement)}
              onPointerMove={handleItemPointerMove}
              onPointerUp={handleItemPointerUp}
              onPointerCancel={handleItemPointerUp}
              onClick={event => {
                if (!editMode) return;
                event.stopPropagation();
                setSelectedInstanceId(placement.instanceId);
              }}
              aria-label={item.nameHe}
            >
              <RoomItemArt item={item} />
            </button>
          );
        })}

        {editMode && selectedPlacement && selectedItem && (
          <div className="ck-room-item-controls">
            <div className="ck-room-item-controls-name">{selectedItem.nameHe}</div>
            <button type="button" onClick={() => changeSelectedScale(-0.1)} aria-label="הקטן" title="הקטן">−</button>
            <button type="button" onClick={() => changeSelectedScale(0.1)} aria-label="הגדל" title="הגדל">＋</button>
            <button type="button" onClick={moveSelectedToFront} aria-label="הבא לקדמה" title="הבא לקדמה">⬆</button>
            <button type="button" onClick={moveSelectedToBack} aria-label="שלח לאחור" title="שלח לאחור">⬇</button>
            <button type="button" className="is-danger" onClick={removeSelectedItem} aria-label="הסר" title="הסר">🗑️</button>
          </div>
        )}
      </div>

      {editMode && (sandboxMode || sharedReady) && (
        <div className="ck-class-room-editor">
          <div className="ck-class-room-editor-head">
            <div>
              <div className="ck-class-room-editor-title">📦 מגירת חפצי הכיתה · הצבה חופשית</div>
              <div className="ck-class-room-editor-subtitle">
                החפצים במגירה נפתחים מהישגים כיתתיים. גררו כל חפץ פתוח לכל נקודה בחדר — אין מגבלות קיר או רצפה.
              </div>
            </div>
            <div className="ck-class-room-editor-actions">
              <button type="button" onClick={clearDraftRoom} className="ck-editor-reset">נקה טיוטה</button>
              <button type="button" onClick={() => void saveRoom()} disabled={sharedSaving} className="ck-editor-save">{sharedSaving ? 'שומר…' : '💾 שמור שינויים'}</button>
            </div>
          </div>

          <div className="ck-class-room-filters">
            <button type="button" onClick={() => setDrawerFilter('all')} className={drawerFilter === 'all' ? 'is-active' : ''}>הכול</button>
            <button type="button" onClick={() => setDrawerFilter('decor')} className={drawerFilter === 'decor' ? 'is-active' : ''}>✨ קישוטים</button>
            <button type="button" onClick={() => setDrawerFilter('object')} className={drawerFilter === 'object' ? 'is-active' : ''}>🏆 חפצים</button>
          </div>

          <div className="ck-class-room-item-grid">
            {drawerItems.map(item => {
              const placed = placedItemIds.has(item.id);
              const unlocked = unlockedItemIds.has(item.id);
              const choiceSelection = item.choiceGroupId ? choiceSelections[item.choiceGroupId] : undefined;
              const choicePending = item.unlockKind === 'choice' && stars >= item.unlockStars && !choiceSelection;
              const notChosen = item.unlockKind === 'choice' && Boolean(choiceSelection) && choiceSelection !== item.id;
              return (
                <div
                  key={item.id}
                  draggable={unlocked && !placed}
                  onDragStart={event => handleDrawerDragStart(event, item)}
                  className={`ck-class-room-item-card ${placed ? 'is-placed' : ''} ${!unlocked ? 'is-locked' : ''} ${choicePending ? 'is-choice-pending' : ''} ${notChosen ? 'is-not-chosen' : ''}`}
                >
                  <div className="ck-class-room-item-reward-row">
                    <span className={`ck-class-room-rarity is-${item.rarity}`}>{rarityLabel(item.rarity)}</span>
                    <span className="ck-class-room-unlock-stars">{item.unlockStars}⭐</span>
                  </div>
                  <div className={`ck-drawer-item-art ck-room-item-${item.artKind}`}>
                    <RoomItemArt item={item} />
                    {!unlocked && <span className="ck-drawer-lock">🔒</span>}
                  </div>
                  <div className="ck-class-room-item-name">{item.nameHe}</div>
                  <div className="ck-class-room-item-zone">{item.unlockTitleHe}</div>
                  <div className="ck-class-room-item-reason">{item.unlockReasonHe}</div>
                  <button type="button" disabled={placed || !unlocked} onClick={() => addItem(item)}>
                    {placed
                      ? '✓ בחדר'
                      : unlocked
                        ? '＋ הוסף לחדר'
                        : notChosen
                          ? 'לא נבחר באבן הדרך'
                          : choicePending
                            ? '🎁 ממתין לבחירה'
                            : `🔒 נפתח ב־${item.unlockStars}⭐`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!editMode && (
        <>
          <section className="ck-class-choice-section">
            <div className="ck-class-choice-head">
              <div>
                <div className="ck-class-choice-kicker">🎁 בחירות שמעצבות את הסיפור של הכיתה</div>
                <h4 className="ck-class-choice-title">מתנות אבני הדרך</h4>
                <p className="ck-class-choice-subtitle">
                  בנקודות מסוימות לא כולם מקבלים אותו חפץ. הכיתה בוחרת מזכרת אחת מתוך שלוש — ולכן ממלכות שונות יפתחו אוספים שונים.
                </p>
              </div>
              {sandboxMode && (
                <button type="button" onClick={resetSandboxChoices} className="ck-choice-reset">
                  🧪 איפוס בחירות ניסוי
                </button>
              )}
            </div>

            <div className="ck-class-choice-groups">
              {CLASS_ROOM_CHOICE_GROUPS.map(group => {
                const reached = stars >= group.stars;
                const selectedId = choiceSelections[group.id];
                const selectedDefinition = selectedId ? classRoomItemById(selectedId) : null;
                const ownVoteId = studentVotes[group.id];
                const groupVotes = voteSummary[group.id] ?? {};
                const totalVotes = group.optionIds.reduce(
                  (sum, optionId) => sum + (groupVotes[optionId] ?? 0),
                  0
                );

                return (
                  <article key={group.id} className={`ck-choice-group ${reached ? 'is-reached' : 'is-locked'} ${selectedId ? 'is-complete' : ''}`}>
                    <div className="ck-choice-group-head">
                      <div>
                        <div className="ck-choice-stars">{group.stars}⭐</div>
                        <div className="ck-choice-group-title">{group.titleHe}</div>
                        <div className="ck-choice-group-subtitle">{group.subtitleHe}</div>
                      </div>
                      <div className={`ck-choice-state ${selectedId ? 'is-selected' : reached ? 'is-ready' : ''}`}>
                        {selectedId
                          ? '✓ הבחירה אושרה'
                          : reached
                            ? sandboxMode
                              ? 'בחירת ניסוי זמינה'
                              : viewerRole === 'teacher'
                                ? `ממתין לאישור · ${totalVotes} קולות`
                                : ownVoteId
                                  ? '✓ הצבעת · ממתין למורה'
                                  : '🗳️ ההצבעה פתוחה'
                            : `חסרים ${Math.max(0, group.stars - stars)}⭐`}
                      </div>
                    </div>

                    {selectedDefinition ? (
                      <div className="ck-choice-selected-relic">
                        <div className={`ck-choice-selected-art ck-room-item-${selectedDefinition.artKind}`}>
                          <RoomItemArt item={selectedDefinition} />
                        </div>
                        <div>
                          <div className="ck-choice-selected-label">המזכרת של הכיתה</div>
                          <div className="ck-choice-selected-name">{selectedDefinition.nameHe}</div>
                          <div className="ck-choice-selected-description">{selectedDefinition.descriptionHe}</div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="ck-choice-description">
                          {sandboxMode
                            ? group.descriptionHe
                            : viewerRole === 'teacher'
                              ? 'התלמידים מצביעים, ואת/ה קובע/ת את הבחירה הסופית. אפשר לאשר את הזוכה או לבחור אפשרות אחרת לאחר דיון כיתתי.'
                              : ownVoteId
                                ? 'הקול שלך נשמר. עכשיו מחכים לדיון הכיתתי ולאישור הסופי של המורה.'
                                : 'אפשר להצביע פעם אחת. ההצבעה אינה קובעת לבד את הפרס — המורה יאשר את ההחלטה הסופית של הכיתה.'}
                        </p>
                        <div className="ck-choice-options">
                          {group.optionIds.map(optionId => {
                            const option = classRoomItemById(optionId);
                            if (!option) return null;
                            const optionVotes = groupVotes[option.id] ?? 0;
                            const isOwnVote = ownVoteId === option.id;
                            const hasVoted = Boolean(ownVoteId);
                            const optionBusy = voteBusyGroup === group.id || sharedSaving;
                            return (
                              <div key={option.id} className={`ck-choice-option ${!reached ? 'is-disabled' : ''} ${isOwnVote ? 'is-my-vote' : ''}`}>
                                <div className={`ck-choice-option-art ck-room-item-${option.artKind}`}>
                                  <RoomItemArt item={option} />
                                </div>
                                <div className="ck-choice-option-copy">
                                  <div className="ck-choice-option-meta">
                                    <span className={`ck-class-room-rarity is-${option.rarity}`}>{rarityLabel(option.rarity)}</span>
                                    {!sandboxMode && reached && (
                                      <span className="ck-choice-vote-count">🗳️ {optionVotes}</span>
                                    )}
                                  </div>
                                  <div className="ck-choice-option-name">{option.nameHe}</div>
                                  <div className="ck-choice-option-description">{option.descriptionHe}</div>
                                </div>

                                {sandboxMode ? (
                                  <button
                                    type="button"
                                    disabled={!reached}
                                    onClick={() => void handleChoiceAction(group.id, option.id)}
                                  >
                                    {!reached ? `🔒 ${group.stars}⭐` : '🧪 בחר בניסוי'}
                                  </button>
                                ) : viewerRole === 'teacher' ? (
                                  <button
                                    type="button"
                                    disabled={!reached || optionBusy || !sharedReady}
                                    onClick={() => void handleChoiceAction(group.id, option.id)}
                                  >
                                    {!reached ? `🔒 ${group.stars}⭐` : `👑 אשר כפרס הסופי (${optionVotes})`}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={!reached || !canVote || hasVoted || optionBusy || !sharedReady}
                                    onClick={() => void handleChoiceAction(group.id, option.id)}
                                  >
                                    {!reached
                                      ? `🔒 ${group.stars}⭐`
                                      : isOwnVote
                                        ? '✓ ההצבעה שלך'
                                        : hasVoted
                                          ? 'הצבעת כבר'
                                          : '🗳️ הצבע/י לפרס הזה'}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          <section className="ck-class-relics-section">
            <div className="ck-class-relics-head">
              <div>
                <div className="ck-class-relics-kicker">🏺 מזכרות ההישגים של הכיתה</div>
                <h4 className="ck-class-relics-title">האוסף הכיתתי</h4>
                <p className="ck-class-relics-subtitle">
                  אין כאן חנות. כל חפץ נפתח בגלל משהו שהכיתה השיגה יחד, ונשאר כמזכרת שאפשר להציג בחדר.
                </p>
              </div>
              <div className="ck-class-relics-count">
                <strong>{unlockedItems.length}/{collectionCapacity}</strong>
                <span>מזכרות נפתחו</span>
              </div>
            </div>

            <div className="ck-class-relics-grid">
              {CLASS_ROOM_ITEMS.map(item => {
                const unlocked = unlockedItemIds.has(item.id);
                const choiceSelection = item.choiceGroupId ? choiceSelections[item.choiceGroupId] : undefined;
                const notChosen = item.unlockKind === 'choice' && Boolean(choiceSelection) && choiceSelection !== item.id;
                const choicePending = item.unlockKind === 'choice' && stars >= item.unlockStars && !choiceSelection;
                return (
                  <article key={item.id} className={`ck-class-relic-card ${unlocked ? 'is-unlocked' : 'is-locked'} ${notChosen ? 'is-not-chosen' : ''} ${choicePending ? 'is-choice-pending' : ''}`}>
                    <div className={`ck-class-relic-art ck-room-item-${item.artKind}`}>
                      <RoomItemArt item={item} />
                      {!unlocked && <span className="ck-class-relic-lock">🔒</span>}
                    </div>
                    <div className="ck-class-relic-copy">
                      <div className="ck-class-relic-meta">
                        <span className={`ck-class-room-rarity is-${item.rarity}`}>{rarityLabel(item.rarity)}</span>
                        <span>{item.unlockStars}⭐</span>
                      </div>
                      <div className="ck-class-relic-name">{item.nameHe}</div>
                      <div className="ck-class-relic-origin">{item.unlockTitleHe}</div>
                      <div className="ck-class-relic-description">
                        {unlocked
                          ? item.descriptionHe
                          : notChosen
                            ? 'הכיתה בחרה מזכרת אחרת באבן הדרך הזו.'
                            : choicePending
                              ? 'אבן הדרך הושגה — המזכרת מחכה לבחירת הכיתה.'
                              : item.unlockReasonHe}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {nextRewardItem ? (
              <div className="ck-next-relic">
                <span>🎯 המזכרת הבאה</span>
                <strong>{nextRewardItem.nameHe}</strong>
                <span>נפתחת ב־{nextRewardItem.unlockStars}⭐ · חסרים {Math.max(0, nextRewardItem.unlockStars - stars)} כוכבים</span>
              </div>
            ) : (
              <div className="ck-next-relic is-complete">👑 כל מזכרות ההישגים של הסט הראשון כבר פתוחות.</div>
            )}
          </section>

          <div className="ck-gate-room-footer-grid">
          <div className="ck-gate-room-card">
            <div className="ck-gate-room-card-icon">🎨</div>
            <div>
              <div className="ck-gate-room-card-title">עיצוב חופשי באמת</div>
              <div className="ck-gate-room-card-text">
                אין אזורים מוכתבים. הכיתה מחליטה איפה כל חפץ ייראה הכי טוב, כולל חפיפה וסדר שכבות.
              </div>
            </div>
          </div>

          <div className="ck-gate-room-card is-next">
            <div className="ck-gate-room-card-icon">💾</div>
            <div>
              <div className="ck-gate-room-card-title">שמירה משותפת לכיתה</div>
              <div className="ck-gate-room-card-text">
                במפה האמיתית התלמידים מצביעים, והמורה מאשר את הבחירה הסופית ושומר את עיצוב החדר. במפת הניסויים הכול נשאר רק בדפדפן.
              </div>
            </div>
          </div>
          </div>
        </>
      )}
    </section>
  );
}

function RoomItemArt({ item }: { item: ClassRoomItemDefinition }) {
  switch (item.artKind) {
    case 'banner':
      return <span className="ck-item-art ck-art-banner"><i /><b>✦</b><i /></span>;
    case 'shield':
      return <span className="ck-item-art ck-art-shield"><b>✦</b></span>;
    case 'portrait':
      return <span className="ck-item-art ck-art-portrait"><b>☾</b><i>✦</i></span>;
    case 'trophy':
      return <span className="ck-item-art ck-art-trophy"><i className="cup">★</i><i className="stem" /><i className="base" /></span>;
    case 'globe':
      return <span className="ck-item-art ck-art-globe"><i className="orb">✦</i><i className="ring" /><i className="stand" /></span>;
    case 'plant':
      return <span className="ck-item-art ck-art-plant"><i className="leaf l1" /><i className="leaf l2" /><i className="leaf l3" /><i className="pot" /></span>;
    case 'chest':
      return <span className="ck-item-art ck-art-chest"><i className="lid" /><i className="body" /><b>✦</b></span>;
    case 'lantern':
      return <span className="ck-item-art ck-art-lantern"><i className="top" /><i className="glass">✦</i><i className="base" /></span>;
    case 'clock':
      return <span className="ck-item-art ck-art-clock"><i className="face"><b>✦</b></i><i className="pendulum" /></span>;
    case 'books':
      return <span className="ck-item-art ck-art-books"><i className="book b1" /><i className="book b2" /><i className="book b3" /><b>?</b></span>;
    case 'crystal':
      return <span className="ck-item-art ck-art-crystal"><i className="shard s1" /><i className="shard s2" /><i className="shard s3" /><i className="base" /></span>;
    case 'statue':
      return <span className="ck-item-art ck-art-statue"><i className="figure f1" /><i className="figure f2" /><i className="star">✦</i><i className="base" /></span>;
    case 'crown':
      return <span className="ck-item-art ck-art-crown"><i className="body" /><i className="jewel">✦</i></span>;
    case 'compass':
      return <span className="ck-item-art ck-art-compass"><i className="ring"><b>✦</b></i><i className="needle" /></span>;
    case 'tree':
      return <span className="ck-item-art ck-art-tree"><i className="trunk" /><i className="crown"><b>✦</b><b>✦</b><b>✦</b></i></span>;
    case 'fountain':
      return <span className="ck-item-art ck-art-fountain"><i className="water w1" /><i className="water w2" /><i className="bowl">✦</i><i className="base" /></span>;
    default:
      return null;
  }
}

function formatSyncTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'עכשיו';
  return new Intl.DateTimeFormat('he-IL', { hour: '2-digit', minute: '2-digit' }).format(date);
}

function rarityLabel(rarity: ClassRoomItemDefinition['rarity']): string {
  switch (rarity) {
    case 'common': return 'רגיל';
    case 'rare': return 'נדיר';
    case 'epic': return 'אפי';
    case 'legendary': return 'אגדי';
    default: return '';
  }
}

function normalizeChoiceSelections(
  value: unknown
): ClassRoomChoiceSelections {
  if (!value || typeof value !== 'object') return {};

  const source = value as Record<string, unknown>;
  const result: ClassRoomChoiceSelections = {};

  for (const group of CLASS_ROOM_CHOICE_GROUPS) {
    const rawItemId = source[group.id];
    if (typeof rawItemId !== 'string') continue;
    const item = classRoomItemById(rawItemId as ClassRoomItemId);
    if (!item || item.choiceGroupId !== group.id || !group.optionIds.includes(item.id)) continue;
    result[group.id] = item.id;
  }

  return result;
}

function normalizePlacements(value: unknown): Placement[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<ClassRoomItemId>();
  const result: Placement[] = [];

  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue;
    const raw = entry as Partial<Placement> & { zone?: unknown };
    const item = typeof raw.itemId === 'string' ? classRoomItemById(raw.itemId as ClassRoomItemId) : null;
    if (!item || seen.has(item.id)) continue;

    const point = clampPoint(
      typeof raw.x === 'number' ? raw.x : item.defaultX,
      typeof raw.y === 'number' ? raw.y : item.defaultY
    );

    result.push({
      instanceId: typeof raw.instanceId === 'string' ? raw.instanceId : `${item.id}-${result.length}`,
      itemId: item.id,
      x: point.x,
      y: point.y,
      scale: clamp(typeof raw.scale === 'number' ? raw.scale : item.defaultScale, 0.55, 1.8),
      layer: typeof raw.layer === 'number' && Number.isFinite(raw.layer) ? raw.layer : result.length + 1,
    });
    seen.add(item.id);
  }

  return result;
}

function clampPoint(x: number, y: number): { x: number; y: number } {
  return {
    x: clamp(x, STAGE_BOUNDS.minX, STAGE_BOUNDS.maxX),
    y: clamp(y, STAGE_BOUNDS.minY, STAGE_BOUNDS.maxY),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Number(value.toFixed(2))));
}
