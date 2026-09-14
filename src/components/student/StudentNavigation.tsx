export type StudentNavigationTab =
  | 'progress'
  | 'missions'
  | 'classKingdom'
  | 'room'
  | 'classRooms'
  | 'shop'
  | 'inventory'
  | 'collection'
  | 'companion'
  | 'trophies';

type GroupId = 'journey' | 'world' | 'treasures' | 'class';

type Group = {
  id: GroupId;
  icon: string;
  label: string;
  description: string;
  defaultTab: StudentNavigationTab;
  tabs: Array<{ id: StudentNavigationTab; label: string }>;
};

const GROUPS: Group[] = [
  {
    id: 'journey', icon: '🧭', label: 'המסע שלי', description: 'התקדמות ומשימות', defaultTab: 'progress',
    tabs: [
      { id: 'progress', label: '✨ התקדמות' },
      { id: 'missions', label: '📋 משימות' },
    ],
  },
  {
    id: 'world', icon: '🏠', label: 'העולם שלי', description: 'החדרים, החיה והפרסים', defaultTab: 'room',
    tabs: [
      { id: 'room', label: '🏠 החדרים שלי' },
      { id: 'companion', label: '🐾 חיית המחמד' },
      { id: 'trophies', label: '🏆 חדר הפרסים' },
    ],
  },
  {
    id: 'treasures', icon: '🎒', label: 'האוצרות שלי', description: 'האוסף והמלאי', defaultTab: 'collection',
    tabs: [
      { id: 'collection', label: '📖 האוסף שלי' },
      { id: 'inventory', label: '🎒 מלאי' },
    ],
  },
  {
    id: 'class', icon: '🏰', label: 'הכיתה שלי', description: 'הממלכה והחדרים המשותפים', defaultTab: 'classKingdom',
    tabs: [
      { id: 'classKingdom', label: '🏰 ממלכת הכיתה' },
      { id: 'classRooms', label: '🏘️ חדרי הכיתה' },
    ],
  },
];

function activeGroupFor(tab: StudentNavigationTab): Group | null {
  if (tab === 'shop') return null;
  return GROUPS.find(group => group.tabs.some(item => item.id === tab)) ?? GROUPS[0];
}

export default function StudentNavigation({
  activeTab,
  onSelect,
  activeMissionCount,
  inventoryCount,
  hasPendingCompanionEvolution,
}: {
  activeTab: StudentNavigationTab;
  onSelect: (tab: StudentNavigationTab) => void;
  activeMissionCount: number;
  inventoryCount: number;
  hasPendingCompanionEvolution: boolean;
}) {
  const activeGroup = activeGroupFor(activeTab);

  const decoratedLabel = (id: StudentNavigationTab, base: string) => {
    if (id === 'missions' && activeMissionCount > 0) return `${base} (${activeMissionCount})`;
    if (id === 'inventory') return `${base} (${inventoryCount})`;
    if (id === 'companion' && hasPendingCompanionEvolution) return `${base} ✨`;
    return base;
  };

  const renderGroupButton = (group: Group) => {
    const isActive = activeGroup?.id === group.id;
    return (
      <button
        key={group.id}
        type="button"
        onClick={() => onSelect(group.defaultTab)}
        className={`rounded-2xl border px-3 py-3 text-right transition-all ${
          isActive
            ? 'border-magic-accent/55 bg-magic-accent/15'
            : 'border-white/10 bg-magic-panel/55 hover:bg-magic-panel/80'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">{group.icon}</span>
          <div>
            <div className={`text-sm font-black ${isActive ? 'text-magic-accent' : 'text-white'}`}>
              {group.label}
            </div>
            <div className="mt-0.5 text-[11px] text-magic-soft/55 sm:text-xs">{group.description}</div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <nav className="mb-4" aria-label="ניווט בממלכת הלמידה">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
        {GROUPS.slice(0, 2).map(renderGroupButton)}

        <button
          type="button"
          onClick={() => onSelect('shop')}
          className={`rounded-2xl border px-3 py-3 text-right transition-all ${
            activeTab === 'shop'
              ? 'border-yellow-300/80 bg-yellow-300/20 shadow-[0_0_22px_rgba(253,224,71,0.16)]'
              : 'border-yellow-300/35 bg-yellow-300/10 hover:border-yellow-300/60 hover:bg-yellow-300/15'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛍️</span>
            <div>
              <div className="text-sm font-black text-yellow-100">החנות</div>
              <div className="mt-0.5 text-[11px] text-yellow-100/65 sm:text-xs">קופסאות וחפצים חדשים</div>
            </div>
          </div>
        </button>

        {GROUPS.slice(2).map(renderGroupButton)}
      </div>

      {activeTab !== 'shop' && activeGroup && (
        <div className="mt-2 rounded-2xl border border-white/10 bg-magic-panel/40 p-2">
          <div className="mb-2 px-2 text-xs font-black text-magic-soft/50">
            {activeGroup.icon} {activeGroup.label}
          </div>
          <div className={`grid gap-2 ${activeGroup.tabs.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
            {activeGroup.tabs.map(item => {
              const isActive = item.id === activeTab;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className={`rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                    isActive
                      ? 'bg-magic-accent text-magic-bg'
                      : 'bg-magic-bg/45 text-magic-soft hover:bg-magic-bg/75 hover:text-white'
                  }`}
                >
                  {decoratedLabel(item.id, item.label)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
