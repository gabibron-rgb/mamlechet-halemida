import { getItemById } from '../../data/items';
import type { InventoryEntry } from '../../store/useGameStore';

type Props = {
  entry: InventoryEntry;
};

export default function PlacedItemVisual({ entry }: Props) {
  const item = getItemById(entry.itemId);

  if (!item) {
    return (
      <div className="w-full h-full rounded-2xl bg-magic-panel/80 border border-magic-soft/20 flex items-center justify-center text-white text-xs">
        ?
      </div>
    );
  }

  const name = item.nameHe.toLowerCase();

  if (name.includes('שטיח')) return <RugVisual />;
  if (name.includes('ספר')) return <BookVisual />;
  if (name.includes('מגילה')) return <ScrollVisual />;
  if (name.includes('דגל')) return <FlagVisual />;
  if (name.includes('עציץ') || name.includes('צמח')) return <PlantVisual />;
  if (
    name.includes('שחמט') ||
    name.includes('פרש') ||
    name.includes('רץ') ||
    name.includes('צריח') ||
    name.includes('מלך') ||
    name.includes('מלכה') ||
    name.includes('חייל') ||
    name.includes('לוח')
  ) {
    return <ChessVisual />;
  }
  if (name.includes('מפה')) return <MapVisual />;
  if (name.includes('פסל')) return <StatueVisual />;

  switch (item.modelRef) {
    case 'cube':
      return <GenericCubeVisual />;
    case 'cylinder':
      return <GenericCylinderVisual />;
    case 'sphere':
      return <GenericSphereVisual />;
    case 'cone':
      return <GenericConeVisual />;
    case 'torus':
      return <GenericRingVisual />;
    default:
      return <GenericCubeVisual />;
  }
}

function RugVisual() {
  return (
    <div className="w-full h-full flex items-end justify-center">
      <div className="w-[88%] h-[42%] rounded-xl bg-gradient-to-r from-fuchsia-500 via-pink-400 to-amber-300 border border-white/20 shadow-lg relative overflow-hidden">
        <div className="absolute inset-x-[10%] top-[28%] h-[2px] bg-white/35" />
        <div className="absolute inset-x-[18%] top-[50%] h-[2px] bg-white/25" />
        <div className="absolute left-[14%] top-[18%] bottom-[18%] w-[2px] bg-white/20" />
        <div className="absolute right-[14%] top-[18%] bottom-[18%] w-[2px] bg-white/20" />
      </div>
    </div>
  );
}

function BookVisual() {
  return (
    <div className="w-full h-full flex items-end justify-center gap-1">
      <div className="w-[18%] h-[55%] rounded-sm bg-emerald-400 shadow-md" />
      <div className="w-[18%] h-[66%] rounded-sm bg-sky-400 shadow-md" />
      <div className="w-[18%] h-[48%] rounded-sm bg-amber-300 shadow-md" />
    </div>
  );
}

function ScrollVisual() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-[72%] h-[42%] rounded-xl bg-amber-100 border border-amber-300 shadow-md">
        <div className="absolute -left-2 top-[20%] bottom-[20%] w-3 rounded-full bg-amber-600" />
        <div className="absolute -right-2 top-[20%] bottom-[20%] w-3 rounded-full bg-amber-600" />
        <div className="absolute inset-x-[18%] top-[28%] h-[2px] bg-amber-700/40" />
        <div className="absolute inset-x-[18%] top-[48%] h-[2px] bg-amber-700/30" />
      </div>
    </div>
  );
}

function FlagVisual() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-[70%] h-[80%]">
        <div className="absolute left-[26%] top-[6%] bottom-[6%] w-[6%] rounded-full bg-stone-300" />
        <div className="absolute left-[32%] top-[16%] w-[42%] h-[28%] bg-red-500 rounded-r-lg shadow-md" />
      </div>
    </div>
  );
}

function PlantVisual() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-end">
      <div className="relative w-[54%] h-[45%]">
        <div className="absolute left-[42%] top-0 w-[10%] h-[44%] bg-green-500 rounded-full" />
        <div className="absolute left-[18%] top-[12%] w-[26%] h-[22%] bg-green-400 rounded-full rotate-[-25deg]" />
        <div className="absolute right-[18%] top-[10%] w-[26%] h-[22%] bg-green-400 rounded-full rotate-[25deg]" />
        <div className="absolute left-[22%] top-[34%] w-[22%] h-[18%] bg-emerald-300 rounded-full rotate-[15deg]" />
        <div className="absolute right-[22%] top-[34%] w-[22%] h-[18%] bg-emerald-300 rounded-full rotate-[-15deg]" />
      </div>
      <div className="w-[40%] h-[22%] rounded-b-xl rounded-t-md bg-orange-700 shadow-lg" />
    </div>
  );
}

function ChessVisual() {
  return (
    <div className="w-full h-full flex items-end justify-center">
      <div className="relative w-[42%] h-[78%]">
        <div className="absolute bottom-0 inset-x-0 h-[16%] rounded-full bg-slate-300" />
        <div className="absolute bottom-[14%] left-[22%] w-[56%] h-[18%] rounded-md bg-slate-200" />
        <div className="absolute bottom-[28%] left-[32%] w-[36%] h-[24%] rounded-t-full bg-slate-100" />
        <div className="absolute bottom-[50%] left-[24%] w-[52%] h-[16%] rounded-full bg-slate-200" />
        <div className="absolute bottom-[64%] left-[36%] w-[28%] h-[14%] rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

function MapVisual() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-[72%] h-[54%] rounded-lg bg-emerald-200 shadow-md border border-emerald-400 overflow-hidden">
        <div className="absolute inset-y-0 left-[33%] w-[2px] bg-emerald-500/40" />
        <div className="absolute inset-y-0 left-[66%] w-[2px] bg-emerald-500/40" />
        <div className="absolute inset-x-0 top-[50%] h-[2px] bg-emerald-500/30" />
        <div className="absolute left-[18%] top-[24%] w-[16%] h-[18%] bg-emerald-500/50 rounded-full" />
        <div className="absolute right-[22%] bottom-[22%] w-[18%] h-[16%] bg-lime-500/40 rounded-full" />
      </div>
    </div>
  );
}

function StatueVisual() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-end">
      <div className="w-[28%] h-[18%] rounded-full bg-slate-200" />
      <div className="w-[22%] h-[28%] bg-slate-300 rounded-t-full" />
      <div className="w-[42%] h-[16%] rounded-md bg-slate-400" />
      <div className="w-[56%] h-[14%] rounded-md bg-slate-500" />
    </div>
  );
}

function GenericCubeVisual() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-[54%] h-[54%] rounded-xl bg-gradient-to-br from-violet-300 to-fuchsia-500 shadow-lg" />
    </div>
  );
}

function GenericCylinderVisual() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-[42%] h-[64%] rounded-full bg-gradient-to-b from-cyan-300 to-blue-500 shadow-lg" />
    </div>
  );
}

function GenericSphereVisual() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-[52%] h-[52%] rounded-full bg-gradient-to-br from-yellow-200 to-orange-400 shadow-lg" />
    </div>
  );
}

function GenericConeVisual() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className="w-0 h-0 border-l-[26px] border-r-[26px] border-b-[56px] border-l-transparent border-r-transparent border-b-pink-400"
      />
    </div>
  );
}

function GenericRingVisual() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-[54%] h-[54%] rounded-full border-[10px] border-amber-300 shadow-lg" />
    </div>
  );
}