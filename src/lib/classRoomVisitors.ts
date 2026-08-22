import { supabase } from './supabaseClient';
import { COMPANION_STAGE_ORDER, type CompanionStage } from '../data/companionWorlds';
import { THEMES, type ThemeId } from '../data/themes';
import type {
  CompanionState,
  InventoryEntry,
  StudentState,
} from '../store/useGameStore';

export type ClassRoomVisitor = {
  id: string;
  name: string;
  classId: string;
  inventory: InventoryEntry[];
  companion: CompanionState;
  trophies: StudentState['trophies'];
};

function numberOrZero(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function normalizeTheme(value: unknown): ThemeId | null {
  if (typeof value !== 'string') return null;
  return THEMES.some(theme => theme.id === value) ? (value as ThemeId) : null;
}

function normalizeStage(value: unknown): CompanionStage {
  if (
    typeof value === 'string' &&
    COMPANION_STAGE_ORDER.includes(value as CompanionStage)
  ) {
    return value as CompanionStage;
  }

  return 'egg';
}

function visitorCompanion(meta: any): CompanionState {
  const raw = meta?.companion ?? {};

  return {
    unlocked: raw.unlocked === true,
    theme: normalizeTheme(raw.theme),
    name:
      typeof raw.name === 'string' && raw.name.trim()
        ? raw.name.trim()
        : null,
    stage: normalizeStage(raw.stage),
    bond: Math.max(0, numberOrZero(raw.bond)),
    petPoints: Math.max(0, numberOrZero(raw.petPoints)),
    lastCareDate:
      typeof raw.lastCareDate === 'string' ? raw.lastCareDate : null,
    careXpToday: Math.max(0, numberOrZero(raw.careXpToday)),
    celebratedStages: Array.isArray(raw.celebratedStages)
      ? raw.celebratedStages.filter((stage: unknown): stage is CompanionStage =>
          typeof stage === 'string' &&
          COMPANION_STAGE_ORDER.includes(stage as CompanionStage)
        )
      : ['egg'],
    activeFlourishes: stringArray(raw.activeFlourishes),
    ownedFlourishes: [],
    unlockedSkills: stringArray(raw.unlockedSkills),
    treasuresFound: Math.max(0, Math.floor(numberOrZero(raw.treasuresFound))),

    // These fields are intentionally not exposed in room visits.
    // A classmate needs the visual companion state, not private behavior history.
    behaviorMemories: [],
    traitChallenges: [],
    journalEntries: [],
  };
}

function visitorTrophies(meta: any): StudentState['trophies'] {
  if (!Array.isArray(meta?.trophies)) return [];

  return meta.trophies
    .filter((entry: any) => entry && typeof entry === 'object')
    .map((entry: any) => ({
      id: typeof entry.id === 'string' ? entry.id : '',
      trophyTheme:
        typeof entry.trophyTheme === 'string' ? entry.trophyTheme : '',
      caption: typeof entry.caption === 'string' ? entry.caption : '',
      awardedAt: numberOrZero(entry.awardedAt),
    }))
    .filter((entry: StudentState['trophies'][number]) => entry.id);
}

export async function fetchClassRoomVisitors(
  classId: string
): Promise<ClassRoomVisitor[]> {
  const cleanClassId = classId.trim();
  if (!cleanClassId) return [];

  const { data, error } = await supabase
    .from('students')
    .select('id, name, class_id, inventory, meta')
    .eq('class_id', cleanClassId)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message || 'לא ניתן לטעון את חדרי הכיתה');
  }

  return (data ?? []).map((row: any) => ({
    id: String(row.id),
    name:
      typeof row.name === 'string' && row.name.trim()
        ? row.name.trim()
        : 'תלמיד/ה',
    classId:
      typeof row.class_id === 'string' ? row.class_id : cleanClassId,
    inventory: Array.isArray(row.inventory) ? row.inventory : [],
    companion: visitorCompanion(row.meta),
    trophies: visitorTrophies(row.meta),
  }));
}
