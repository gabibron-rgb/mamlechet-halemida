export type ClassKingdomRoomId =
  | 'gate'
  | 'village'
  | 'square'
  | 'bridge'
  | 'library'
  | 'tower'
  | 'shield'
  | 'castle'
  | 'garden'
  | 'observatory'
  | 'citadel'
  | 'crown';

export type ClassKingdomRoomDefinition = {
  id: ClassKingdomRoomId;
  landmarkId: string;
  titleHe: string;
  kickerHe: string;
  descriptionTeacherHe: string;
  descriptionStudentHe: string;
  backgroundSrc: string;
  backgroundAltHe: string;
  icon: string;
  unlockStars: number;
};

export const CLASS_KINGDOM_ROOMS: ClassKingdomRoomDefinition[] = [
  {
    id: 'gate',
    landmarkId: 'gate',
    titleHe: 'אולם השער',
    kickerHe: '🚪 חדר כיתתי · שער ההתחלה',
    descriptionTeacherHe:
      'החדר הכיתתי הראשון בממלכה. כל האוסף הכיתתי זמין כאן להצבה חופשית, וכל עיצוב נשמר בנפרד לחדר הזה.',
    descriptionStudentHe:
      'החדר הכיתתי הראשון בממלכה. כאן רואים את העיצוב, המזכרות וההישגים שהכיתה בחרה להציג.',
    backgroundSrc: '/assets/class-kingdom/rooms/gate-hall-background-v2.png',
    backgroundAltHe: 'אולם השער הכיתתי',
    icon: '🚪',
    unlockStars: 1,
  },
  {
    id: 'village',
    landmarkId: 'village',
    titleHe: 'כפר החברים',
    kickerHe: '🏘️ חדר כיתתי · כפר החברים',
    descriptionTeacherHe:
      'הכיכר החמה של הממלכה. כל האוסף הכיתתי זמין גם כאן, וכל פריט יכול להיות מוצב בחופשיות במקום שמתאים לכיתה.',
    descriptionStudentHe:
      'הכיכר המשותפת של הכיתה. כאן אפשר לראות איך הכיתה בחרה להציג את המזכרות וההישגים שלה.',
    backgroundSrc: '/assets/class-kingdom/rooms/friends-village-background-v1.png',
    backgroundAltHe: 'כפר החברים הכיתתי',
    icon: '🏘️',
    unlockStars: 2,
  },
  {
    id: 'square',
    landmarkId: 'square',
    titleHe: 'כיכר האחדות',
    kickerHe: '⭐ חדר כיתתי · כיכר האחדות',
    descriptionTeacherHe:
      'רחבה חגיגית ופתוחה לציון הצלחות משותפות. מרכז הכיכר נשאר פנוי במיוחד כדי לאפשר לכיתה לבנות תצוגות גדולות וחופשיות.',
    descriptionStudentHe:
      'הכיכר שבה הכיתה יכולה להציג רגעים משותפים, מזכרות וחפצים מיוחדים מכל השנה.',
    backgroundSrc: '/assets/class-kingdom/rooms/unity-square-background-v1.png',
    backgroundAltHe: 'כיכר האחדות הכיתתית',
    icon: '⭐',
    unlockStars: 3,
  },
  {
    id: 'bridge',
    landmarkId: 'bridge',
    titleHe: 'גשר הכוכבים',
    kickerHe: '🌉 חדר כיתתי · גשר הכוכבים',
    descriptionTeacherHe:
      'מרחב פתוח סביב גשר הכוכבים, עם אזורי הצבה רחבים משני צדי הדרך. כל חפץ יכול להיות ממוקם בחופשיות.',
    descriptionStudentHe:
      'הגשר שמחבר בין חלקי הממלכה. כאן הכיתה יכולה ליצור מסלול תצוגה של חפצים ומזכרות לאורך הדרך.',
    backgroundSrc: '/assets/class-kingdom/rooms/star-bridge-background-v1.png',
    backgroundAltHe: 'גשר הכוכבים הכיתתי',
    icon: '🌉',
    unlockStars: 5,
  },
  {
    id: 'library',
    landmarkId: 'library',
    titleHe: 'הספרייה הקסומה',
    kickerHe: '📚 חדר כיתתי · הספרייה הקסומה',
    descriptionTeacherHe:
      'מרחב הידע הקסום של הממלכה. המדפים והאור בונים אווירה, אבל המרכז נשאר פתוח כדי שהכיתה תעצב את הספרייה בדרכה.',
    descriptionStudentHe:
      'הספרייה הכיתתית של הממלכה. כאן אפשר לראות איך הכיתה מציגה מזכרות, הישגים וחפצים בתוך חלל של ידע וקסם.',
    backgroundSrc: '/assets/class-kingdom/rooms/magic-library-background-v1.png',
    backgroundAltHe: 'הספרייה הקסומה הכיתתית',
    icon: '📚',
    unlockStars: 6,
  },
  {
    id: 'tower',
    landmarkId: 'tower',
    titleHe: 'מגדל השומרים',
    kickerHe: '🗼 חדר כיתתי · מגדל השומרים',
    descriptionTeacherHe:
      'אולם גבוה ושקט שמסמל אחריות ושמירה על הממלכה. הרצפה פתוחה להצבה חופשית של כל פריט מהאוסף הכיתתי.',
    descriptionStudentHe:
      'החדר של מגדל השומרים. מקום להציג הישגים שמסמלים התמדה, אחריות ושמירה על הקבוצה.',
    backgroundSrc: '/assets/class-kingdom/rooms/guardian-tower-background-v1.png',
    backgroundAltHe: 'מגדל השומרים הכיתתי',
    icon: '🗼',
    unlockStars: 9,
  },
  {
    id: 'shield',
    landmarkId: 'shield',
    titleHe: 'היכל מגן הממלכה',
    kickerHe: '🛡️ חדר כיתתי · מגן הממלכה',
    descriptionTeacherHe:
      'היכל שמסמל אחריות הדדית, עמידה משותפת והגנה על הקהילה. כל אזור הרצפה פתוח לעיצוב חופשי.',
    descriptionStudentHe:
      'היכל המגן של הכיתה. כאן אפשר להציג מזכרות שמספרות על שיתוף פעולה, חברות ואחריות.',
    backgroundSrc: '/assets/class-kingdom/rooms/kingdom-shield-background-v1.png',
    backgroundAltHe: 'היכל מגן הממלכה הכיתתי',
    icon: '🛡️',
    unlockStars: 10,
  },
  {
    id: 'castle',
    landmarkId: 'castle',
    titleHe: 'ארמון הכתר',
    kickerHe: '🏰 חדר כיתתי · ארמון הכתר',
    descriptionTeacherHe:
      'אולם מלכותי מתקדם שמיועד לתצוגות המרשימות ביותר של הכיתה. העיצוב פתוח וחופשי כמו בשאר חדרי הממלכה.',
    descriptionStudentHe:
      'הארמון הגדול של הממלכה. כאן אפשר להציג את הפרסים והחפצים שהכיתה הכי גאה בהם.',
    backgroundSrc: '/assets/class-kingdom/rooms/crown-palace-background-v1.png',
    backgroundAltHe: 'ארמון הכתר הכיתתי',
    icon: '🏰',
    unlockStars: 14,
  },
  {
    id: 'garden',
    landmarkId: 'garden',
    titleHe: 'גן האור',
    kickerHe: '🌿 חדר כיתתי · גן האור',
    descriptionTeacherHe:
      'גן פתוח ומואר עם מרחב גדול להצבה חופשית. מתאים במיוחד לעצים, פסלים, גביעים וחפצים שמספרים על צמיחה והתמדה.',
    descriptionStudentHe:
      'הגן הקסום של הכיתה. כל מה שהכיתה משיגה יכול להפוך אותו בהדרגה לגן מיוחד משלה.',
    backgroundSrc: '/assets/class-kingdom/rooms/light-garden-background-v1.png',
    backgroundAltHe: 'גן האור הכיתתי',
    icon: '🌿',
    unlockStars: 15,
  },
  {
    id: 'observatory',
    landmarkId: 'observatory',
    titleHe: 'מצפה הכוכבים',
    kickerHe: '🔭 חדר כיתתי · מצפה הכוכבים',
    descriptionTeacherHe:
      'מרחב מחקר לילי שמסמל סקרנות והסתכלות קדימה. המרכז נשאר פתוח כדי לאפשר הצבה חופשית של פריטים גדולים וקטנים.',
    descriptionStudentHe:
      'המצפה של הממלכה. מקום לחפצים שמספרים על חקר, שאלות, גילויים ושאיפות חדשות.',
    backgroundSrc: '/assets/class-kingdom/rooms/starlight-observatory-background-v1.png',
    backgroundAltHe: 'מצפה הכוכבים הכיתתי',
    icon: '🔭',
    unlockStars: 20,
  },
  {
    id: 'citadel',
    landmarkId: 'citadel',
    titleHe: 'מצודת האגדות',
    kickerHe: '💎 חדר כיתתי · מצודת האגדות',
    descriptionTeacherHe:
      'היכל אגדי לשלב המתקדם של הממלכה. הוא מיועד לפרסים נדירים, מזכרות גדולות ותצוגות שהכיתה בונה לאורך זמן.',
    descriptionStudentHe:
      'המצודה האגדית של הכיתה. כאן נשמר מקום לדברים הנדירים והמרשימים ביותר שהכיתה הצליחה להשיג.',
    backgroundSrc: '/assets/class-kingdom/rooms/legend-citadel-background-v1.png',
    backgroundAltHe: 'מצודת האגדות הכיתתית',
    icon: '💎',
    unlockStars: 22,
  },
  {
    id: 'crown',
    landmarkId: 'crown',
    titleHe: 'היכל כתר האחדות',
    kickerHe: '👑 חדר כיתתי · כתר האחדות',
    descriptionTeacherHe:
      'החדר המסכם של הממלכה הכיתתית. זהו חלל חגיגי במיוחד לתצוגת מזכרות השיא והסיפור שהכיתה בנתה יחד.',
    descriptionStudentHe:
      'היכל השיא של הממלכה. מקום לכל הדברים שמסמלים את הדרך שהכיתה עברה יחד עד פסגת הממלכה.',
    backgroundSrc: '/assets/class-kingdom/rooms/unity-crown-background-v1.png',
    backgroundAltHe: 'היכל כתר האחדות הכיתתי',
    icon: '👑',
    unlockStars: 24,
  },
];

export function classKingdomRoomById(id: ClassKingdomRoomId): ClassKingdomRoomDefinition {
  return CLASS_KINGDOM_ROOMS.find(room => room.id === id) ?? CLASS_KINGDOM_ROOMS[0];
}

export function classKingdomRoomForLandmark(landmarkId: string): ClassKingdomRoomDefinition | null {
  return CLASS_KINGDOM_ROOMS.find(room => room.landmarkId === landmarkId) ?? null;
}
