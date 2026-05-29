import type { Rarity } from './boxes';
export type CosmeticCategory =
  | 'frame'
  | 'banner'
  | 'desk'
  | 'wall'
  | 'pet'
  | 'lighting'
  | 'badge'
  | 'shelf';

export interface Cosmetic {
  id: string;
  nameHe: string;
  category: CosmeticCategory;
  rarity: Rarity;
  // Visual placeholder until we upgrade graphics later
  icon: string;
  descHe: string;
}

export const COSMETICS: Cosmetic[] = [
  // Frames
  { id: 'frame_glow_silver',   nameHe: 'מסגרת כסף זוהרת',  category: 'frame',    rarity: 'common',    icon: '🖼️', descHe: 'מסגרת מוארת לדמות שלך.' },
  { id: 'frame_royal_gold',    nameHe: 'מסגרת זהב מלכותית', category: 'frame',    rarity: 'rare',      icon: '👑', descHe: 'מסגרת זהב עם חריטות עתיקות.' },
  { id: 'frame_arcane',        nameHe: 'מסגרת רונות',       category: 'frame',    rarity: 'epic',      icon: '✨', descHe: 'רונות עתיקות זורמות סביב הדמות.' },

  // Banners
  { id: 'banner_kingdom',      nameHe: 'דגל הממלכה',        category: 'banner',   rarity: 'common',    icon: '🚩', descHe: 'דגל בצבעי הממלכה שלך.' },
  { id: 'banner_dragon',       nameHe: 'דגל הדרקון',        category: 'banner',   rarity: 'rare',      icon: '🐉', descHe: 'דגל ארגמן עם דרקון מוזהב.' },
  { id: 'banner_phoenix',      nameHe: 'דגל עוף החול',      category: 'banner',   rarity: 'epic',      icon: '🔥', descHe: 'דגל הנושא את סמל עוף החול.' },

  // Desk items
  { id: 'desk_crystal_lamp',   nameHe: 'מנורת קריסטל',      category: 'lighting', rarity: 'rare',      icon: '💎', descHe: 'מנורה שמאירה את שולחנך באור כחול.' },
  { id: 'desk_inkwell',        nameHe: 'קסת דיו עתיקה',     category: 'desk',     rarity: 'common',    icon: '🖋️', descHe: 'קסת ברונזה עם נוצת כתיבה.' },
  { id: 'desk_chess_crown',    nameHe: 'כתר השחמט',         category: 'desk',     rarity: 'epic',      icon: '♛', descHe: 'כתר מלכת השחמט, מוצב על שולחנך.' },

  // Wall items
  { id: 'wall_map',            nameHe: 'מפת הממלכה',        category: 'wall',     rarity: 'common',    icon: '🗺️', descHe: 'מפה מקלף של ממלכת הלמידה.' },
  { id: 'wall_scroll_badge',   nameHe: 'תעודת מגילה',        category: 'wall',     rarity: 'rare',      icon: '📜', descHe: 'מגילה רשמית מטעם הממלכה.' },
  { id: 'wall_wizard_shelf',   nameHe: 'מדף הקוסם',         category: 'shelf',    rarity: 'epic',      icon: '📚', descHe: 'מדף ספרים של אשף עם ספרים זוהרים.' },

  // Pets / companions
  { id: 'pet_tiny_dragon',     nameHe: 'דרקון קטן',         category: 'pet',      rarity: 'epic',      icon: '🐲', descHe: 'דרקון פסל זעיר ששומר על שולחנך.' },
  { id: 'pet_owl_familiar',    nameHe: 'ינשוף שליחים',      category: 'pet',      rarity: 'rare',      icon: '🦉', descHe: 'ינשוף חכם שעומד על המדף.' },
  { id: 'pet_rune_cat',        nameHe: 'חתול רונות',         category: 'pet',      rarity: 'rare',      icon: '🐈‍⬛', descHe: 'חתול שחור עם סימני רונות זוהרים.' },

  // Magical / special
  { id: 'magic_carpet',        nameHe: 'שטיח קסמים',         category: 'wall',     rarity: 'legendary', icon: '🧞', descHe: 'שטיח עתיק רקום בחוטי זהב.' },
  { id: 'badge_first_quest',   nameHe: 'אות המסע הראשון',    category: 'badge',    rarity: 'common',    icon: '🎖️', descHe: 'אות הוקרה על השלמת המסע הראשון.' },
  { id: 'badge_scholar',       nameHe: 'אות החוקר',          category: 'badge',    rarity: 'rare',      icon: '🏅', descHe: 'אות לחוקרי הממלכה.' },
  { id: 'lighting_starlight',  nameHe: 'אור הכוכבים',        category: 'lighting', rarity: 'legendary', icon: '🌟', descHe: 'תאורת כוכבים מרחפת מעל אזורך.' },
];

export const COSMETIC_BY_ID: Record<string, Cosmetic> =
  Object.fromEntries(COSMETICS.map((c) => [c.id, c]));
