export type CompanionFlourishId =
  | 'perseverance'
  | 'friendship'
  | 'creativity'
  | 'curiosity'
  | 'helping'
  | 'breakthrough';

export type CompanionFlourish = {
  id: CompanionFlourishId;
  nameHe: string;
  emoji: string;
  descriptionHe: string;
  effectParticles: [string, string];
  glowColor: string;
  reasonId: string;
};

export const COMPANION_FLOURISHES: CompanionFlourish[] = [
  {
    id: 'perseverance',
    nameHe: 'אות ההתמדה',
    emoji: '🔥',
    descriptionHe: 'על המשך מאמץ גם כשהאתגר קשה',
    effectParticles: ['🔥', '✨'],
    glowColor: '#fb923c',
    reasonId: 'perseverance',
  },
  {
    id: 'friendship',
    nameHe: 'אות החברות',
    emoji: '❤️',
    descriptionHe: 'על חברות, אכפתיות ויחס טוב לאחרים',
    effectParticles: ['💗', '💕'],
    glowColor: '#fb7185',
    reasonId: 'teamwork',
  },
  {
    id: 'creativity',
    nameHe: 'אות היצירתיות',
    emoji: '🎨',
    descriptionHe: 'על רעיון מקורי וחשיבה בדרך חדשה',
    effectParticles: ['🎨', '🌈'],
    glowColor: '#e879f9',
    reasonId: 'creativity',
  },
  {
    id: 'curiosity',
    nameHe: 'אות הסקרנות',
    emoji: '🔬',
    descriptionHe: 'על שאלות עמוקות ורצון אמיתי לגלות',
    effectParticles: ['💡', '❓'],
    glowColor: '#22d3ee',
    reasonId: 'deep_question',
  },
  {
    id: 'helping',
    nameHe: 'אות העזרה לאחר',
    emoji: '🤝',
    descriptionHe: 'על עזרה משמעותית לחבר או לכיתה',
    effectParticles: ['🤝', '✨'],
    glowColor: '#34d399',
    reasonId: 'help_friend',
  },
  {
    id: 'breakthrough',
    nameHe: 'אות פריצת הדרך',
    emoji: '🌟',
    descriptionHe: 'על התקדמות מיוחדת והתגברות על קושי',
    effectParticles: ['🌟', '⚡'],
    glowColor: '#fde047',
    reasonId: 'problem_solve',
  },
];

export const COMPANION_FLOURISH_BY_ID = Object.fromEntries(
  COMPANION_FLOURISHES.map(flourish => [flourish.id, flourish])
) as Record<CompanionFlourishId, CompanionFlourish>;

export function getCompanionFlourish(
  flourishId: string
): CompanionFlourish | undefined {
  return COMPANION_FLOURISHES.find(flourish => flourish.id === flourishId);
}
