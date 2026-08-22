export type CompanionInteractionId =
  | 'pet'
  | 'feed'
  | 'play'
  | 'train'
  | 'explore'
  | 'treasure';

export type CompanionInteraction = {
  id: CompanionInteractionId;
  emoji: string;
  nameHe: string;
  descriptionHe: string;
  reactionHe: string;
  petPointCost: number;
  bondGain: number;
  requiredSkillId?: string;
};

/**
 * פעילויות החיה אינן משתמשות בנקודות החנות ואינן מעניקות XP רגיל.
 * נקודות חיה מתקבלות רק כשהמורה מעניקה נקודות בכיתה.
 */
export const COMPANION_INTERACTIONS: CompanionInteraction[] = [
  {
    id: 'pet',
    emoji: '🤍',
    nameHe: 'ליטוף קצר',
    descriptionHe: 'רגע קטן של תשומת לב וחברות',
    reactionHe: 'איזה ליטוף נעים! 🥰',
    petPointCost: 0,
    bondGain: 0,
  },
  {
    id: 'feed',
    emoji: '🍎',
    nameHe: 'חטיף קטן',
    descriptionHe: 'משהו טעים שמחזק מעט את הקשר',
    reactionHe: 'טעים מאוד! 😋',
    petPointCost: 1,
    bondGain: 1,
  },
  {
    id: 'play',
    emoji: '🧶',
    nameHe: 'משחק משותף',
    descriptionHe: 'משחק שמחזק את הקשר בשלושה צעדים',
    reactionHe: 'איזה כיף לשחק יחד! 🎉',
    petPointCost: 3,
    bondGain: 3,
  },
  {
    id: 'train',
    emoji: '✨',
    nameHe: 'תרגיל קסום',
    descriptionHe: 'אימון מיוחד שמחזק מאוד את הקשר',
    reactionHe: 'התרגיל הצליח! ✨',
    petPointCost: 5,
    bondGain: 5,
  },
  {
    id: 'explore',
    emoji: '🧭',
    nameHe: 'מסע קטן',
    descriptionHe: 'הרפתקה קצרה בעקבות שבילים וסודות בחדר',
    reactionHe: 'איזו הרפתקה נהדרת! גילינו פינה חדשה 🧭',
    petPointCost: 7,
    bondGain: 9,
    requiredSkillId: 'keen_senses',
  },
  {
    id: 'treasure',
    emoji: '🗝️',
    nameHe: 'חיפוש אוצרות',
    descriptionHe: 'עוקבים אחרי רמזים ומגלים אוצר חדש לאוסף החיה',
    reactionHe: 'מצאנו אוצר נסתר! 🗝️✨',
    petPointCost: 12,
    bondGain: 15,
    requiredSkillId: 'treasure_hunter',
  },
];
