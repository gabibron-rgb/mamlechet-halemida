import { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../store/useSessionStore';
import { useGameStore } from '../store/useGameStore';
import { xpToNextLevel } from '../logic/leveling';
import Shop from '../components/student/Shop';
import Inventory from '../components/student/Inventory';
import { LevelUpCeremony } from '../components/student/LevelUpCeremony';
import { ThemeUnlockCeremony } from '../components/student/ThemeUnlockCeremony';
import RoomView from '../components/student/RoomView';
import KingdomScene from '../components/student/KingdomScene';

type Tab = 'home' | 'shop' | 'inventory' | 'room';

export default function StudentHome() {
  const navigate = useNavigate();

  const currentStudentId = useSessionStore(s => s.currentStudentId);
  const logout = useSessionStore(s => s.logout);

  const student = useGameStore(s =>
    currentStudentId ? s.students[currentStudentId] : undefined
  );

  const completeLevelUp = useGameStore(s => s.completeLevelUp);
  const completeThemeUnlock = useGameStore(s => s.completeThemeUnlock);

  const [tab, setTab] = useState<Tab>('home');
  const [ceremonyOpen, setCeremonyOpen] = useState(false);
  const [themeUnlockOpen, setThemeUnlockOpen] = useState(false);

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-magic-panel/80 rounded-3xl p-8 text-center">
          <p className="text-magic-soft mb-4">לא מחובר/ת</p>
          <button
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
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-magic-accent">
            שלום {student.name} 👋
          </h1>

          <button
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
            <div>
              <div className="text-3xl font-black text-magic-accent">
                {student.points}
              </div>
              <div className="text-magic-soft text-sm">נקודות</div>
            </div>

            <div>
              <div className="text-3xl font-black text-magic-accent">
                {student.level}
              </div>
              <div className="text-magic-soft text-sm">רמה</div>
            </div>

            <div>
              <div className="text-3xl font-black text-magic-accent">
                {student.xp}
              </div>
              <div className="text-magic-soft text-sm">XP</div>
            </div>
          </div>

          {/* XP bar */}
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

          {/* Level-up banner */}
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

          {/* Theme unlock banner */}
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
          <TabButton active={tab === 'home'} onClick={() => setTab('home')}>
            ממלכה
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
          <TabButton active={tab === 'room'} onClick={() => setTab('room')}>
  🏠 חדר
</TabButton>
        </div>

        {/* Tab content */}
        <div className="bg-magic-panel/80 rounded-3xl p-6">
          {tab === 'home' && <KingdomScene student={student} />}
          

          {tab === 'shop' && <Shop student={student} />}

          {tab === 'inventory' && <Inventory student={student} />}
          {tab === 'room' && <RoomView student={student} />}
        </div>
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