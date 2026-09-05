export const STUDENT_AVATARS = [
  { id: 'spark', emoji: '✨', nameHe: 'ניצוץ', descriptionHe: 'קסם קטן שמלווה אותך בכל הממלכה.' },
  { id: 'lion', emoji: '🦁', nameHe: 'שומר הממלכה', descriptionHe: 'אמיץ, יציב ומוכן להרפתקה.' },
  { id: 'owl', emoji: '🦉', nameHe: 'חכמת הלילה', descriptionHe: 'למי שאוהב לחשוב, לקרוא ולגלות.' },
  { id: 'dragon', emoji: '🐉', nameHe: 'דרקון קסום', descriptionHe: 'קצת מסתורי, קצת אגדי, והרבה נוכחות.' },
  { id: 'unicorn', emoji: '🦄', nameHe: 'חד־קרן', descriptionHe: 'צבעוני, נדיר ומלא דמיון.' },
  { id: 'tiger', emoji: '🐯', nameHe: 'רוח האלוף', descriptionHe: 'אנרגיה, תחרותיות והתמדה.' },
  { id: 'space', emoji: '🚀', nameHe: 'חלוץ החלל', descriptionHe: 'למי שתמיד רוצה להגיע עוד צעד רחוק.' },
  { id: 'science', emoji: '🔬', nameHe: 'חוקר', descriptionHe: 'סקרנות, ניסויים ושאלות טובות.' },
  { id: 'art', emoji: '🎨', nameHe: 'יוצר', descriptionHe: 'צבע, רעיונות ודמיון בלי גבולות.' },
  { id: 'music', emoji: '🎵', nameHe: 'צליל קסום', descriptionHe: 'קצב, מנגינה ואופי.' },
  { id: 'books', emoji: '📚', nameHe: 'שומר הספרים', descriptionHe: 'סיפורים, ידע ועולמות חדשים.' },
  { id: 'chess', emoji: '♟️', nameHe: 'אסטרטג', descriptionHe: 'חשיבה קדימה, סבלנות ותכנון.' },
] as const;

export type StudentAvatarId = (typeof STUDENT_AVATARS)[number]['id'];
export type StudentAvatar = (typeof STUDENT_AVATARS)[number];

export const DEFAULT_STUDENT_AVATAR_ID: StudentAvatarId = 'spark';

export function normalizeStudentAvatarId(value: unknown): StudentAvatarId {
  return STUDENT_AVATARS.some(avatar => avatar.id === value)
    ? (value as StudentAvatarId)
    : DEFAULT_STUDENT_AVATAR_ID;
}

export function getStudentAvatar(value: unknown): StudentAvatar {
  const id = normalizeStudentAvatarId(value);
  return STUDENT_AVATARS.find(avatar => avatar.id === id) ?? STUDENT_AVATARS[0];
}
