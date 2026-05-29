import { useMemo, useState } from 'react';
import type { Cosmetic } from '../../data/cosmetics';
import type { CapacityKey } from '../../data/levels';
import { rollCosmeticChoices, capacityBumpForLevel, pointBonus } from '../../logic/levelUp';

type CeremonyStep = 'chest' | 'picker' | 'summary';

interface LevelUpCeremonyProps {
  studentName: string;
  newLevel: number;
  ownedCosmeticIds: string[];
  onComplete: (payload: {
    cosmeticId: string;
    capacityKey: CapacityKey;
    pointBonus: number;
    newLevel: number;
  }) => void;
  onClose: () => void;
}

const CAPACITY_LABEL_HE: Record<CapacityKey, string> = {
  inventory: 'מלאי',
  displayShelf: 'מדף תצוגה',
  wallSlots: 'משבצות קיר',
  desk: 'שולחן',
  petArea: 'אזור חיות מחמד',
};

export function LevelUpCeremony({
  studentName,
  newLevel,
  ownedCosmeticIds,
  onComplete,
  onClose,
}: LevelUpCeremonyProps) {
  const [step, setStep] = useState<CeremonyStep>('chest');
  const [selected, setSelected] = useState<Cosmetic | null>(null);

  const choices = useMemo(
    () => rollCosmeticChoices(ownedCosmeticIds, 3),
    [ownedCosmeticIds],
  );
  const capacityKey = useMemo(() => capacityBumpForLevel(newLevel), [newLevel]);
  const bonus = useMemo(() => pointBonus(newLevel), [newLevel]);

  function handleConfirm() {
    if (!selected) return;
    onComplete({
      cosmeticId: selected.id,
      capacityKey,
      pointBonus: bonus,
      newLevel,
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="ceremony-card relative w-full max-w-2xl rounded-2xl bg-gradient-to-b from-indigo-950 to-purple-950 p-8 text-white shadow-2xl ring-1 ring-purple-400/30">
        <CeremonyHeader studentName={studentName} newLevel={newLevel} />

        <div className="mt-6 min-h-[260px]">
          {step === 'chest' && (
            <ChestRevealStep onOpen={() => setStep('picker')} />
          )}
          {step === 'picker' && (
            <CosmeticPickerStep
              choices={choices}
              selected={selected}
              onSelect={setSelected}
              onContinue={() => selected && setStep('summary')}
            />
          )}
          {step === 'summary' && selected && (
            <SummaryStep
              cosmetic={selected}
              capacityKey={capacityKey}
              capacityLabel={CAPACITY_LABEL_HE[capacityKey]}
              pointBonus={bonus}
              onConfirm={handleConfirm}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Sub-components (visual swap points) ---------- */

function CeremonyHeader({ studentName, newLevel }: { studentName: string; newLevel: number }) {
  return (
    <div className="text-center">
      <div className="text-sm uppercase tracking-widest text-purple-300">עלייה ברמה</div>
      <h2 className="mt-1 text-3xl font-bold text-yellow-300 drop-shadow">
        {studentName} הגיע/ה לרמה {newLevel}!
      </h2>
    </div>
  );
}

function ChestRevealStep({ onOpen }: { onOpen: () => void }) {
  const [opening, setOpening] = useState(false);

  function handleClick() {
    setOpening(true);
    setTimeout(onOpen, 700); // leave room for the CSS transition
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className={[
          'chest text-8xl transition-all duration-700 ease-out',
          opening ? 'scale-125 rotate-3 opacity-0' : 'scale-100 hover:scale-110',
        ].join(' ')}
        aria-label="תיבת אוצר"
      >
        🎁
      </div>
      <button
        type="button"
        onClick={handleClick}
        disabled={opening}
        className="rounded-xl bg-yellow-400 px-6 py-3 font-bold text-indigo-950 shadow-lg transition hover:bg-yellow-300 disabled:opacity-50"
      >
        פתח/י את התיבה
      </button>
    </div>
  );
}

function CosmeticPickerStep({
  choices,
  selected,
  onSelect,
  onContinue,
}: {
  choices: Cosmetic[];
  selected: Cosmetic | null;
  onSelect: (c: Cosmetic) => void;
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-center text-purple-200">בחר/י פריט אחד להוסיף לאוסף שלך:</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {choices.map((c) => (
          <CosmeticCard
            key={c.id}
            cosmetic={c}
            selected={selected?.id === c.id}
            onClick={() => onSelect(c)}
          />
        ))}
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onContinue}
          disabled={!selected}
          className="rounded-xl bg-yellow-400 px-6 py-3 font-bold text-indigo-950 shadow-lg transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          המשך
        </button>
      </div>
    </div>
  );
}

const RARITY_RING: Record<string, string> = {
  common: 'ring-slate-400/60',
  rare: 'ring-blue-400/70',
  epic: 'ring-purple-400/80',
  legendary: 'ring-yellow-400/90',
};

function CosmeticCard({
  cosmetic,
  selected,
  onClick,
}: {
  cosmetic: Cosmetic;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'cosmetic-card flex flex-col items-center gap-2 rounded-xl bg-indigo-900/60 p-4 text-center ring-2 transition',
        selected ? 'scale-105 bg-indigo-800/80' : 'hover:scale-105 hover:bg-indigo-900/80',
        RARITY_RING[cosmetic.rarity] ?? 'ring-slate-500/40',
      ].join(' ')}
    >
      <div className="text-5xl">{cosmetic.icon}</div>
      <div className="font-semibold">{cosmetic.nameHe}</div>
      <div className="text-xs text-purple-200">{cosmetic.descHe}</div>
    </button>
  );
}

function SummaryStep({
  cosmetic,
  capacityKey: _capacityKey,
  capacityLabel,
  pointBonus,
  onConfirm,
}: {
  cosmetic: Cosmetic;
  capacityKey: CapacityKey;
  capacityLabel: string;
  pointBonus: number;
  onConfirm: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-lg text-purple-200">הפרסים שלך:</div>

      <ul className="w-full max-w-md space-y-2">
        <li className="flex items-center justify-between rounded-lg bg-indigo-900/60 px-4 py-3">
          <span>פריט קוסמטי</span>
          <span className="font-semibold">
            {cosmetic.icon} {cosmetic.nameHe}
          </span>
        </li>
        <li className="flex items-center justify-between rounded-lg bg-indigo-900/60 px-4 py-3">
          <span>שדרוג קיבולת</span>
          <span className="font-semibold">+1 {capacityLabel}</span>
        </li>
        <li className="flex items-center justify-between rounded-lg bg-indigo-900/60 px-4 py-3">
          <span>בונוס נקודות</span>
          <span className="font-semibold text-yellow-300">+{pointBonus}</span>
        </li>
      </ul>

      <button
        type="button"
        onClick={onConfirm}
        className="mt-2 rounded-xl bg-yellow-400 px-8 py-3 font-bold text-indigo-950 shadow-lg transition hover:bg-yellow-300"
      >
        קבל/י את הפרסים
      </button>
    </div>
  );
}
