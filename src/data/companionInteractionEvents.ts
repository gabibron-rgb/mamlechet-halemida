import type { CompanionInteractionId } from '../logic/companion';

export type CompanionInteractionEvent = {
  titleHe: string;
  storyHe: string;
  reactionHe: string;
  sparkle?: boolean;
};

const EVENTS: Record<CompanionInteractionId, CompanionInteractionEvent[]> = {
  pet: [
    {
      titleHe: 'רגע קטן של חברות',
      storyHe: 'החיה מתקרבת בשקט, עוצמת לרגע את העיניים ונשענת אל היד שלך.',
      reactionHe: 'זה בדיוק מה שהייתי צריכה עכשיו 🥰',
    },
    {
      titleHe: 'ליטוף במקום הנכון',
      storyHe: 'בהתחלה היא מנסה להיראות רצינית… ואז הזנב מסגיר כמה היא שמחה.',
      reactionHe: 'טוב, עוד אחד קטן מותר 🤍',
    },
    {
      titleHe: 'שלום קטן',
      storyHe: 'החיה קופצת לקראתך כאילו לא נפגשתם המון זמן, גם אם עברו רק כמה דקות.',
      reactionHe: 'ידעתי שתחזור אליי! 🐾',
      sparkle: true,
    },
  ],
  feed: [
    {
      titleHe: 'החטיף נעלם בשנייה',
      storyHe: 'עוד לפני שהספקת לומר “בתיאבון”, החטיף כבר איננו והחיה מביטה בך בתקווה לעוד אחד.',
      reactionHe: 'טעים! ממש ממש טעים! 😋',
    },
    {
      titleHe: 'טעימה חשדנית',
      storyHe: 'החיה מרחרחת, בודקת מכל כיוון, לוקחת ביס קטן… ואז מחסלת את כל השאר.',
      reactionHe: 'אוקיי, השתכנעתי. זה מעולה! 🍎',
    },
    {
      titleHe: 'חטיף עם הפתעה',
      storyHe: 'לרגע קטן מופיעים סביב החטיף ניצוצות, והחיה מסתכלת עליך כאילו גילית סוד עתיק.',
      reactionHe: 'זה היה חטיף קסום?! ✨',
      sparkle: true,
    },
  ],
  play: [
    {
      titleHe: 'מרדף ברחבי החדר',
      storyHe: 'המשחק מתחיל רגוע, אבל תוך שניות החיה כבר דוהרת מצד לצד ולא מוכנה שתנצח בקלות.',
      reactionHe: 'עוד סיבוב! אני כמעט מנצחת! 🎉',
    },
    {
      titleHe: 'המהלך המפתיע',
      storyHe: 'החיה עושה תנועה שאף אחד לא ציפה לה, נעצרת בגאווה ומחכה לראות אם שמת לב.',
      reactionHe: 'ראית את זה?! המצאתי את המהלך הזה עכשיו! 🧶',
      sparkle: true,
    },
    {
      titleHe: 'משחק בלי חוקים',
      storyHe: 'איכשהו החוקים משתנים באמצע, החיה מכריזה על עצמה כמנצחת — ואז מתחילה לצחוק.',
      reactionHe: 'בחוקים שלי ניצחתי! 😄',
    },
  ],
  train: [
    {
      titleHe: 'האימון מתחיל',
      storyHe: 'החיה מתרכזת, מנסה שוב ושוב, ובפעם האחרונה הכול מתחבר בדיוק כמו שצריך.',
      reactionHe: 'הצלחתי! ראית כמה השתפרתי? ✨',
    },
    {
      titleHe: 'כמעט… ואז הצלחה',
      storyHe: 'הניסיון הראשון מתפקשש, השני כמעט מצליח, ובשלישי מופיע הבזק קטן שמסמן שהתרגיל הושלם.',
      reactionHe: 'לא ויתרתי — וזה עבד! 💪',
    },
    {
      titleHe: 'רגע של קסם',
      storyHe: 'לשנייה אחת כל החדר מנצנץ סביב החיה, והיא מצליחה לבצע את התרגיל בצורה מושלמת.',
      reactionHe: 'וואו… את זה אני רוצה לזכור! 🌟',
      sparkle: true,
    },
  ],
  explore: [
    {
      titleHe: 'שביל שלא היה שם קודם',
      storyHe: 'מאחורי פינה מוכרת מתגלה שביל קטן. אתם עוקבים אחריו ומוצאים מקום שהחיה בטוחה שאף אחד עוד לא ראה.',
      reactionHe: 'ידעתי שהחושים שלי יובילו אותנו למשהו! 🧭',
    },
    {
      titleHe: 'רמז מסתורי',
      storyHe: 'סימן קטן על הקיר מוביל לעוד סימן, ועוד אחד, עד שאתם מגיעים לפינה נסתרת ומסקרנת.',
      reactionHe: 'יש פה עוד סודות. אני מרגישה את זה! 🔎',
      sparkle: true,
    },
    {
      titleHe: 'יצאנו קצת מהמסלול',
      storyHe: 'לרגע נדמה שהלכתם לאיבוד, אבל החיה נעצרת, מקשיבה היטב ומוצאת את הדרך בחזרה.',
      reactionHe: 'זה לא היה ללכת לאיבוד. זה היה… מסלול חלופי! 😅',
    },
  ],
  treasure: [
    {
      titleHe: 'הרמז האחרון!',
      storyHe: 'אחרי חיפוש ארוך מתגלה סימן קטן מתחת למקום שלא הייתם חושבים לבדוק. מאחוריו מחכה אוצר נסתר.',
      reactionHe: 'מצאנו אותו! האוצר שלנו! 🗝️✨',
      sparkle: true,
    },
    {
      titleHe: 'תיבה סודית',
      storyHe: 'המפתח מסתובב, נשמע קליק קטן, והמכסה נפתח לאט. בפנים מחכה אוצר חדש לאוסף של החיה.',
      reactionHe: 'איזה מזל שלא ויתרנו על החיפוש! 💎',
      sparkle: true,
    },
    {
      titleHe: 'אוצר במקום בלתי אפשרי',
      storyHe: 'דווקא כשכמעט מפסיקים לחפש, החיה מבחינה בנצנוץ זעיר ומובילה אותך ישר אל המחבוא.',
      reactionHe: 'העיניים שלי לא מפספסות כלום! 👀✨',
      sparkle: true,
    },
  ],
};

export function pickCompanionInteractionEvent(
  interactionId: CompanionInteractionId
): CompanionInteractionEvent {
  const options = EVENTS[interactionId];
  return options[Math.floor(Math.random() * options.length)];
}
