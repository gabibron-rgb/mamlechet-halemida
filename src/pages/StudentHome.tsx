import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { useSessionStore } from '../store/useSessionStore';
import { useGameStore } from '../store/useGameStore';
import { xpToNextLevel } from '../logic/leveling';

import Shop from '../components/student/Shop';
import Inventory from '../components/student/Inventory';
import RoomView from '../components/student/RoomView';
import { LevelUpCeremony } from '../components/student/LevelUpCeremony';
import { ThemeUnlockCeremony } from '../components/student/ThemeUnlockCeremony';

type Tab = 'progress' | 'room' | 'shop' | 'inventory';

export default function StudentHome() {
  const navigate = useNavigate();

    const currentStudentId = useSessionStore(s => s.currentStudentId);
  const currentClassId = useSessionStore(s => s.currentClassId);
  const logout = useSessionStore(s => s.logout);

  const loadStudentFromSupabase = useGameStore(s => s.loadStudentFromSupabase);

    useEffect(() => {
    if (!currentStudentId || !currentClassId) return;

    void loadStudentFromSupabase(currentStudentId);

    const intervalId = window.setInterval(() => {
      void loadStudentFromSupabase(currentStudentId);
    }, 10000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [currentStudentId, currentClassId, loadStudentFromSupabase]);

  const student = useGameStore(s =>
    currentStudentId ? s.students[currentStudentId] : undefined
  );

  const completeLevelUp = useGameStore(s => s.completeLevelUp);
  const completeThemeUnlock = useGameStore(s => s.completeThemeUnlock);

  // ברירת המחדל עכשיו היא "התקדמות", כי זה מסך כניסה הרבה יותר ברור לילדים.
  const [tab, setTab] = useState<Tab>('progress');
  const [ceremonyOpen, setCeremonyOpen] = useState(false);
  const [themeUnlockOpen, setThemeUnlockOpen] = useState(false);

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-magic-panel/80 rounded-3xl p-8 text-center">
          <p className="text-magic-soft mb-4">לא מחובר/ת</p>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="bg-magic-accent text-magic-bg font-bold py-2 px-4 rounded-xl"
          >
            חזרה למסך הכניסה
          </button>
        </div>
      </div>
    );
  }

  const xpInfo = xpToNextLevel(student.xp);

  const xpPct = xpInfo.isMax
    ? 100
    : Math.floor((xpInfo.current / xpInfo.needed) * 100);

  const pending = student.pendingLevelUps ?? 0;
  const pendingThemeUnlocks = student.pendingThemeUnlocks ?? 0;

  const nextCelebrationLevel =
    pending > 0 ? student.level - pending + 1 : student.level;

  const ownedCosmeticIds = student.inventory
    .filter(it => it.kind === 'cosmetic')
    .map(it => it.itemId);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-magic-accent">
            שלום {student.name} 👋
          </h1>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="text-magic-soft/60 text-sm hover:text-magic-soft"
          >
            יציאה
          </button>
        </div>

        {/* Stats card */}
        <div className="bg-magic-panel/80 rounded-3xl p-6 mb-4">
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <StatBox label="נקודות" value={student.points} />
            <StatBox label="רמה" value={student.level} />
            <StatBox label="XP" value={student.xp} />
          </div>

          <div>
            <div className="flex justify-between text-xs text-magic-soft/70 mb-1">
              <span>רמה {student.level}</span>

              <span dir="ltr">
                {xpInfo.isMax
                  ? 'Max level'
                  : `${xpInfo.current} / ${xpInfo.needed} XP`}
              </span>
            </div>

            <div className="w-full bg-magic-bg/60 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 bg-gradient-to-l from-magic-accent to-magic-soft transition-all duration-500"
                style={{ width: `${xpPct}%` }}
              />
            </div>
          </div>

          {pending > 0 && (
            <div className="mt-3 rounded-xl border border-yellow-400/40 bg-indigo-900/40 px-5 py-3 text-center text-magic-accent text-sm">
              <span className="mr-2">
                🎉 יש לך {pending} עליות רמה לחגוג!
              </span>

              <button
                type="button"
                onClick={() => setCeremonyOpen(true)}
                className="rounded-lg bg-yellow-400 px-4 py-1.5 font-semibold text-indigo-950 hover:bg-yellow-300 mr-2"
              >
                חגוג עכשיו
              </button>
            </div>
          )}

          {pendingThemeUnlocks > 0 && (
            <div className="mt-3 rounded-xl border border-purple-400/40 bg-purple-900/40 px-5 py-3 text-center text-magic-accent text-sm">
              <span className="mr-2">
                🔓 יש לך נושא חדש לפתוח לקופסאות!
              </span>

              <button
                type="button"
                onClick={() => setThemeUnlockOpen(true)}
                className="rounded-lg bg-magic-accent px-4 py-1.5 font-semibold text-magic-bg hover:opacity-90 mr-2"
              >
                בחר/י נושא
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <TabButton active={tab === 'progress'} onClick={() => setTab('progress')}>
            התקדמות
          </TabButton>

          <TabButton active={tab === 'room'} onClick={() => setTab('room')}>
            🏠 חדר
          </TabButton>

          <TabButton active={tab === 'shop'} onClick={() => setTab('shop')}>
            חנות
          </TabButton>

          <TabButton
            active={tab === 'inventory'}
            onClick={() => setTab('inventory')}
          >
            מלאי ({student.inventory.length})
          </TabButton>
        </div>

        {/* Tab content */}
        <div className="bg-magic-panel/80 rounded-3xl p-6">
          {tab === 'progress' && (
            <ProgressPanel
              points={student.points}
              level={student.level}
              xp={student.xp}
              xpInfo={xpInfo}
              xpPct={xpPct}
              inventoryCount={student.inventory.length}
              onGoRoom={() => setTab('room')}
              onGoShop={() => setTab('shop')}
              onGoInventory={() => setTab('inventory')}
            />
          )}

          {tab === 'room' && <RoomView student={student} />}

          {tab === 'shop' && <Shop student={student} />}

          {tab === 'inventory' && <Inventory student={student} />}
        </div>

        {ceremonyOpen && pending > 0 && (
          <LevelUpCeremony
            studentName={student.name}
            newLevel={nextCelebrationLevel}
            ownedCosmeticIds={ownedCosmeticIds}
            onComplete={(payload) => {
              completeLevelUp(student.id, payload);
            }}
            onClose={() => setCeremonyOpen(false)}
          />
        )}

        {themeUnlockOpen && pendingThemeUnlocks > 0 && (
          <ThemeUnlockCeremony
            unlockedThemes={student.unlockedThemes}
            onComplete={(themeId) => {
              completeThemeUnlock(student.id, themeId);
              setThemeUnlockOpen(false);
            }}
            onClose={() => setThemeUnlockOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

function ProgressPanel({
  points,
  level,
  xp,
  xpInfo,
  xpPct,
  inventoryCount,
  onGoRoom,
  onGoShop,
  onGoInventory,
}: {
  points: number;
  level: number;
  xp: number;
  xpInfo: ReturnType<typeof xpToNextLevel>;
  xpPct: number;
  inventoryCount: number;
  onGoRoom: () => void;
  onGoShop: () => void;
  onGoInventory: () => void;
}) {
  return (
    <div className="text-center">
      <div className="text-5xl mb-3">🏰</div>

      <h2 className="text-3xl font-black text-magic-accent mb-2">
        הממלכה שלי
      </h2>

      <p className="text-magic-soft/80 text-sm mb-6">
        כאן רואים את ההתקדמות שלך במשחק. אפשר לקנות חפצים, לסדר את החדר,
        ולבדוק כמה XP חסר לרמה הבאה.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <BigInfoCard icon="⭐" label="נקודות לקנייה" value={points} />
        <BigInfoCard icon="⬆️" label="הרמה שלי" value={level} />
        <BigInfoCard icon="🎒" label="חפצים במלאי" value={inventoryCount} />
      </div>

      <div className="rounded-3xl bg-magic-bg/40 p-5 text-right mb-6">
        <div className="flex justify-between text-xs text-magic-soft/70 mb-2">
          <span>רמה {level}</span>

          <span dir="ltr">
            {xpInfo.isMax
              ? 'Max level'
              : `${xpInfo.current} / ${xpInfo.needed} XP`}
          </span>
        </div>

        <div className="w-full bg-magic-bg/70 rounded-full h-4 overflow-hidden mb-2">
          <div
            className="h-4 bg-gradient-to-l from-magic-accent to-magic-soft transition-all duration-500"
            style={{ width: `${xpPct}%` }}
          />
        </div>

        <p className="text-xs text-magic-soft/60 text-center">
          יש לך בסך הכול {xp} XP
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ActionButton onClick={onGoRoom} primary>
          להיכנס לחדר שלי 🏠
        </ActionButton>

        <ActionButton onClick={onGoShop}>
          לקנות חפצים בחנות
        </ActionButton>

        <ActionButton onClick={onGoInventory}>
          לראות את המלאי שלי
        </ActionButton>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-3xl font-black text-magic-accent">
        {value}
      </div>

      <div className="text-magic-soft text-sm">
        {label}
      </div>
    </div>
  );
}

function BigInfoCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl bg-magic-bg/40 p-5">
      <div className="text-3xl mb-2">{icon}</div>

      <div className="text-3xl font-black text-magic-accent">
        {value}
      </div>

      <div className="text-xs text-magic-soft/70 mt-1">
        {label}
      </div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  primary = false,
}: {
  children: ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-4 py-3 font-black transition-colors ${
        primary
          ? 'bg-magic-accent text-magic-bg hover:opacity-90'
          : 'bg-magic-bg/50 text-magic-soft hover:bg-magic-bg/80'
      }`}
    >
      {children}
    </button>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2 rounded-xl font-bold text-sm transition-colors ${
        active
          ? 'bg-magic-accent text-magic-bg'
          : 'bg-magic-panel/60 text-magic-soft hover:bg-magic-panel'
      }`}
    >
      {children}
    </button>
  );
}