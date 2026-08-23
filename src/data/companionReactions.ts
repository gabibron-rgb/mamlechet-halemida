import type { CompanionJournalEntry } from './companionJournal';
import type { CompanionStage } from './companionWorlds';
import { REASONS } from './reasons';
import {
  getCompanionTrait,
  getDominantCompanionTrait,
  type CompanionBehaviorMemory,
  type CompanionTraitId,
} from './companionTraits';

export type CompanionReactionKind =
  | 'waiting'
  | 'behavior'
  | 'teacher_note'
  | 'flourish'
  | 'challenge';

export type CompanionReaction = {
  kind: CompanionReactionKind;
  emoji: string;
  titleHe: string;
  messageHe: string;
  sourceHe: string;
  quoteHe: string | null;
  personalityHe: string | null;
  accentColor: string;
  occurredAt: number | null;
};

type ReactionCandidate =
  | {
      kind: 'behavior';
      timestamp: number;
      priority: 1;
      memory: CompanionBehaviorMemory;
    }
  | {
      kind: 'journal';
      timestamp: number;
      priority: 2 | 3 | 4;
      entry: CompanionJournalEntry;
    };

const TRAIT_REACTIONS: Record<CompanionTraitId, readonly string[]> = {
  determination: [
    'ראיתי את המאמץ שלך. גם כשנעשה קשה, המשכנו קדימה יחד.',
    'ההתמדה שלך הדליקה בי עוד קצת אומץ. לא מוותרים על אתגר חשוב.',
    'כל ניסיון נוסף שלך מלמד אותי שכוח אמיתי נבנה כשממשיכים.',
  ],
  friendship: [
    'כשהושטת יד למישהו אחר, גם הלב שלי הרגיש גדול וחזק יותר.',
    'הדרך שבה היית שם בשביל אחרים הזכירה לי שאנחנו אף פעם לא גדלים לבד.',
    'ראיתי חברות אמיתית בכיתה. זה סוג הכוח שאני הכי אוהב לשמור.',
  ],
  creativity: [
    'הרעיון שלך פתח חלון למקום שאף אחד עוד לא ראה. איזה ניצוץ נהדר!',
    'כשחשבת בדרך משלך, גם העולם שלי קיבל פתאום צבע חדש.',
    'יצרת אפשרות חדשה במקום שבו אחרים ראו רק דרך אחת. זה קסם אמיתי.',
  ],
  curiosity: [
    'השאלה שלך פתחה דלת חדשה. עכשיו גם אני רוצה לדעת מה מסתתר מאחוריה.',
    'סקרנות כמו שלך הופכת כל שיעור למסע גילוי קטן.',
    'לא הסתפקת בתשובה הראשונה, ובזכותך העולם שלנו נעשה מעניין יותר.',
  ],
  responsibility: [
    'הבחירה הטובה שלך הראתה שאפשר לסמוך עליך. זה נותן לי תחושת ביטחון.',
    'עצרת, חשבת ובחרת נכון. ככה בונים כוח שנשאר לאורך זמן.',
    'האחריות שלך בכיתה היא מגן שקט ששומר גם על אחרים.',
  ],
  resourcefulness: [
    'מצאת דרך גם כשהפתרון לא היה ברור. אני שומר את הרגע החכם הזה איתי.',
    'לא נתקעת מול הבעיה — בדקת, שינית וניסית דרך חדשה.',
    'התושייה שלך הפכה מכשול למפתח. בדיוק כך נולדות הרפתקאות טובות.',
  ],
};

const PERSONALITY_LINES: Record<CompanionTraitId, string> = {
  determination: 'האופי שנבנה בי אומר: ממשיכים גם כשהדרך נעשית קשה.',
  friendship: 'האופי שנבנה בי מזכיר: אף אחד לא צריך להישאר לבד.',
  creativity: 'האופי שנבנה בי מחפש תמיד צבע, רעיון ודרך שלא ניסינו.',
  curiosity: 'האופי שנבנה בי רוצה לשאול עוד שאלה ולגלות עוד סוד.',
  responsibility: 'האופי שנבנה בי עוצר לחשוב ובוחר במה שנכון.',
  resourcefulness: 'האופי שנבנה בי יודע שלכל מכשול מסתתר גם פתרון.',
};

const WAITING_REACTIONS: Record<CompanionStage, string> = {
  egg: 'אני מקשיב מתוך הביצה ומחכה לרגע הראשון שייבחר לתיעוד בכיתה.',
  hatchling: 'אני רק בתחילת הדרך. ההתנהגויות שלך בכיתה יעזרו לי לגלות מי אהיה.',
  young: 'אנחנו כבר גדלים יחד, והסיפור הבא שלנו יתחיל מבחירה טובה בכיתה.',
  grown: 'כבר עברנו דרך ארוכה. אני מחכה לרגע המשמעותי הבא שנשמור יחד.',
  magical: 'הקסם שלי כבר התעורר, אבל הוא מתחזק מכל בחירה משמעותית שלך בכיתה.',
  legendary: 'גם חיה אגדית ממשיכה ללמוד מהבחירות ומהמעשים שלך בכיתה.',
};

function stableIndex(value: string, length: number): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return length === 0 ? 0 : hash % length;
}

function reactionForTrait(traitId: CompanionTraitId, eventId: string): string {
  const options = TRAIT_REACTIONS[traitId];
  return options[stableIndex(eventId, options.length)] ?? options[0] ?? '';
}

function latestCandidate(
  memories: CompanionBehaviorMemory[],
  journalEntries: CompanionJournalEntry[]
): ReactionCandidate | null {
  const candidates: ReactionCandidate[] = [
    ...memories.map(memory => ({
      kind: 'behavior' as const,
      timestamp: memory.awardedAt,
      priority: 1 as const,
      memory,
    })),
    ...journalEntries.map(entry => ({
      kind: 'journal' as const,
      timestamp: entry.createdAt,
      priority: (entry.source === 'challenge'
        ? 4
        : entry.source === 'flourish'
          ? 3
          : 2) as 2 | 3 | 4,
      entry,
    })),
  ];

  candidates.sort(
    (first, second) =>
      second.timestamp - first.timestamp || second.priority - first.priority
  );

  return candidates[0] ?? null;
}

export function getCompanionReaction({
  stage,
  memories,
  journalEntries,
}: {
  stage: CompanionStage;
  memories: CompanionBehaviorMemory[];
  journalEntries: CompanionJournalEntry[];
}): CompanionReaction {
  const dominantTrait = getDominantCompanionTrait(memories);
  const personalityHe = dominantTrait
    ? PERSONALITY_LINES[dominantTrait.id]
    : null;
  const latest = latestCandidate(memories, journalEntries);

  if (!latest) {
    return {
      kind: 'waiting',
      emoji: '🌱',
      titleHe: 'הסיפור שלנו עוד מתחיל',
      messageHe: WAITING_REACTIONS[stage],
      sourceHe: 'מחכה לזיכרון הראשון מהכיתה',
      quoteHe: null,
      personalityHe,
      accentColor: '#a78bfa',
      occurredAt: null,
    };
  }

  if (latest.kind === 'behavior') {
    const trait = getCompanionTrait(latest.memory.traitId);
    const reason = REASONS.find(item => item.id === latest.memory.reasonId);

    return {
      kind: 'behavior',
      emoji: trait.emoji,
      titleHe: reason?.labelHe ?? trait.nameHe,
      messageHe: reactionForTrait(trait.id, latest.memory.id),
      sourceHe:
        latest.memory.source === 'flourish'
          ? 'בעקבות אות מיוחד שהוענק בכיתה'
          : 'בעקבות התנהגות שתועדה בכיתה',
      quoteHe: null,
      personalityHe,
      accentColor: trait.color,
      occurredAt: latest.timestamp,
    };
  }

  const trait = getCompanionTrait(latest.entry.traitId);

  if (latest.entry.source === 'teacher_note') {
    return {
      kind: 'teacher_note',
      emoji: '📖',
      titleHe: 'רגע שחשוב לשמור',
      messageHe:
        'הרגע הזה נשמר ביומן שלנו. מבחינתי, זה אומר שקרה כאן משהו מיוחד באמת.',
      sourceHe: 'רגע מיוחד מיומן המסע',
      quoteHe: latest.entry.message,
      personalityHe,
      accentColor: trait.color,
      occurredAt: latest.timestamp,
    };
  }

  if (latest.entry.source === 'flourish') {
    return {
      kind: 'flourish',
      emoji: '✨',
      titleHe: 'משהו מיוחד קרה בכיתה',
      messageHe:
        'האות שקיבלנו הוא לא רק קישוט. הוא מזכיר לי התנהגות אמיתית שנראתה בכיתה וקיבלה הוקרה.',
      sourceHe: 'בעקבות אות מיוחד שהוענק בכיתה',
      quoteHe: latest.entry.message,
      personalityHe,
      accentColor: trait.color,
      occurredAt: latest.timestamp,
    };
  }

  return {
    kind: 'challenge',
    emoji: '🏅',
    titleHe: 'הוכחנו שזה חלק מהאופי שלנו',
    messageHe: `לא היה כאן רגע אחד מקרי. הראית ${trait.nameHe} בכמה ימי לימוד שונים, עד שהאתגר הושלם.`,
    sourceHe: 'בעקבות השלמת אתגר אופי',
    quoteHe: latest.entry.message,
    personalityHe,
    accentColor: trait.color,
    occurredAt: latest.timestamp,
  };
}
