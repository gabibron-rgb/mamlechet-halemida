export type Reason = {
  id: string;
  labelHe: string;
  emoji: string;
};
export const REASONS: Reason[] = [
  { id: 'effort',       labelHe: 'מאמץ',         emoji: '💪' },
  { id: 'deep_question',labelHe: 'שאלה עמוקה',   emoji: '🤔' },
  { id: 'help_friend',  labelHe: 'עזרה לחבר',    emoji: '🤝' },
  { id: 'creativity',   labelHe: 'יצירתיות',     emoji: '🎨' },
  { id: 'perseverance', labelHe: 'התמדה',        emoji: '🔥' },
  { id: 'teamwork',     labelHe: 'עבודת צוות',   emoji: '👥' },
  { id: 'problem_solve',labelHe: 'פתרון בעיה',   emoji: '🧩' },
  { id: 'good_choice',  labelHe: 'בחירה טובה',   emoji: '⭐' },
];
export const AWARD_SIZES = [1, 3, 5, 10, 20] as const;
export type AwardSize = typeof AWARD_SIZES[number];