export type ClassKingdomRoomId = 'gate' | 'village' | 'library';

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
      'החדר הכיתתי הראשון בממלכה. במצב העיצוב כל החדר פתוח להצבה חופשית — אין אזורי קיר או רצפה.',
    descriptionStudentHe:
      'החדר הכיתתי הראשון בממלכה. אפשר לצפות בעיצוב ובהישגים; שינוי החדר נשמר רק דרך ממשק המורה.',
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
];

export function classKingdomRoomById(id: ClassKingdomRoomId): ClassKingdomRoomDefinition {
  return CLASS_KINGDOM_ROOMS.find(room => room.id === id) ?? CLASS_KINGDOM_ROOMS[0];
}

export function classKingdomRoomForLandmark(landmarkId: string): ClassKingdomRoomDefinition | null {
  return CLASS_KINGDOM_ROOMS.find(room => room.landmarkId === landmarkId) ?? null;
}
