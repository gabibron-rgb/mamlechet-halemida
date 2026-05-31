import type { ThemeId } from './themes';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type BoxTier = 'wooden' | 'silver' | 'golden' | 'mystic';

export type BoxDef = {
  tier: BoxTier;
  nameHe: string;
  price: number;
  emoji: string;
  minLevel: number;

  // probability table (must sum to 1)
  odds: Record<Rarity, number>;

  // pity: guarantee at least this rarity within N opens
  pity?: {
    rarity: Rarity;
    within: number;
  };
};

export const BOX_TIERS: Record<BoxTier, BoxDef> = {
  wooden: {
    tier: 'wooden',
    nameHe: 'קופסת עץ',
    price: 15,
    emoji: '📦',
    minLevel: 1,
    odds: {
      common: 0.7,
      uncommon: 0.25,
      rare: 0.05,
      epic: 0,
      legendary: 0,
    },
  },

  silver: {
    tier: 'silver',
    nameHe: 'קופסת כסף',
    price: 35,
    emoji: '🎁',
    minLevel: 8,
    odds: {
      common: 0.55,
      uncommon: 0.3,
      rare: 0.13,
      epic: 0.019,
      legendary: 0.001,
    },
    pity: {
      rarity: 'rare',
      within: 8,
    },
  },

  golden: {
    tier: 'golden',
    nameHe: 'קופסת זהב',
    price: 75,
    emoji: '🏆',
    minLevel: 11,
    odds: {
      common: 0.45,
      uncommon: 0.3,
      rare: 0.18,
      epic: 0.06,
      legendary: 0.01,
    },
    pity: {
      rarity: 'epic',
      within: 10,
    },
  },

  mystic: {
    tier: 'mystic',
    nameHe: 'קופסה מסתורית',
    price: 150,
    emoji: '🔮',
    minLevel: 15,
    odds: {
      common: 0.25,
      uncommon: 0.3,
      rare: 0.25,
      epic: 0.15,
      legendary: 0.05,
    },
    pity: {
      rarity: 'epic',
      within: 5,
    },
  },
};

export const RARITY_LABEL_HE: Record<Rarity, string> = {
  common: 'רגיל',
  uncommon: 'יוצא דופן',
  rare: 'נדיר',
  epic: 'אפי',
  legendary: 'אגדי',
};

export const RARITY_COLOR: Record<Rarity, string> = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#fbbf24',
};

// Helper: what themes can a box draw from?
// A box of theme X draws X-themed items.
export type BoxInstance = {
  tier: BoxTier;
  theme: ThemeId;
};