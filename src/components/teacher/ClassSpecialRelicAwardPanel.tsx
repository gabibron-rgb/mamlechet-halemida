import { useEffect, useMemo, useState } from 'react';
import {
  CLASS_SPECIAL_RELIC_TEMPLATES,
  classRoomItemById,
} from '../../data/classRoomItems';
import {
  grantClassSpecialRelicAsTeacher,
  loadClassSpecialRelics,
  type ClassSpecialRelicGrant,
} from '../../lib/classKingdomState';
import './ClassSpecialRelicAwardPanel.css';

type Props = {
  classId: string;
  teacherId: string;
  sandboxMode?: boolean;
};

type AchievementPreset = {
  id: string;
  templateId: string;
  icon: string;
  titleHe: string;
  subtitleHe: string;
  defaultAwardTitleHe: string;
  storyPromptHe: string;
};

type AchievementCeremonyDetail = {
  title: string;
  story: string;
  itemNameHe: string;
  imagePath: string;
  achievementTitleHe: string;
  achievementIcon: string;
};

const SANDBOX_SPECIAL_RELICS_STORAGE_KEY = 'mamlechet-class-kingdom-special-relics-sandbox-v1';
const SPECIAL_ACHIEVEMENT_AWARDED_EVENT = 'mamlechet:class-kingdom-special-achievement-awarded';

const ACHIEVEMENT_PRESETS: AchievementPreset[] = [
  {
    id: 'together',
    templateId: 'teamwork',
    icon: '🤝',
    titleHe: 'כולנו ביחד',
    subtitleHe: 'שיתוף פעולה, עזרה הדדית והצלחה של כולם יחד.',
    defaultAwardTitleHe: 'כולנו ביחד',
    storyPromptHe: 'מה הכיתה עשתה יחד? מי עזר למי, ומה הפך את ההצלחה הזאת למשותפת?',
  },
  {
    id: 'streak',
    templateId: 'journey',
    icon: '🔥',
    titleHe: 'רצף מלכותי',
    subtitleHe: 'התמדה לאורך זמן ורצף מרשים של הצלחות.',
    defaultAwardTitleHe: 'רצף מלכותי',
    storyPromptHe: 'איזה רצף הכיתה השלימה, כמה זמן הוא נמשך, ומה עזר לה לא לוותר בדרך?',
  },
  {
    id: 'minds',
    templateId: 'learning',
    icon: '🧠',
    titleHe: 'מוחות הממלכה',
    subtitleHe: 'למידה, חקר, פתרון בעיה או הישג אינטלקטואלי יוצא דופן.',
    defaultAwardTitleHe: 'מוחות הממלכה',
    storyPromptHe: 'מה הכיתה גילתה, חקרה, פתרה או למדה בצורה יוצאת דופן?',
  },
  {
    id: 'champions',
    templateId: 'competition',
    icon: '🏆',
    titleHe: 'אלופי הממלכה',
    subtitleHe: 'תחרות, שחמט, רובוטיקה, ספורט או הישג חיצוני משמעותי.',
    defaultAwardTitleHe: 'אלופי הממלכה',
    storyPromptHe: 'מה היה האתגר, מה הכיתה השיגה, ולמה הרגע הזה ראוי להיכנס להיסטוריה?',
  },
  {
    id: 'beyond',
    templateId: 'creativity',
    icon: '💎',
    titleHe: 'מעל ומעבר',
    subtitleHe: 'יוזמה, יצירתיות או משהו שהכיתה עשתה הרבה מעבר למצופה.',
    defaultAwardTitleHe: 'מעל ומעבר',
    storyPromptHe: 'מה הכיתה עשתה שלא היה מובן מאליו, ומה היה מיוחד בדרך שבה היא עשתה זאת?',
  },
  {
    id: 'legendary-moment',
    templateId: 'event',
    icon: '🌟',
    titleHe: 'רגע של אגדה',
    subtitleHe: 'אירוע חד־פעמי או זיכרון כיתתי שפשוט חייב להישאר בממלכה.',
    defaultAwardTitleHe: 'רגע של אגדה',
    storyPromptHe: 'מה קרה ברגע הזה, למה הילדים יזכרו אותו, ומה נרצה שהממלכה תספר עליו בעתיד?',
  },
];

const DEFAULT_ACHIEVEMENT_PRESET = ACHIEVEMENT_PRESETS.find(preset => preset.id === 'together')!;

export default function ClassSpecialRelicAwardPanel({
  classId,
  teacherId,
  sandboxMode = false,
}: Props) {
  const [relics, setRelics] = useState<ClassSpecialRelicGrant[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState(DEFAULT_ACHIEVEMENT_PRESET.id);
  const [title, setTitle] = useState(DEFAULT_ACHIEVEMENT_PRESET.defaultAwardTitleHe);
  const [story, setStory] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setMessage(null);

    if (sandboxMode) {
      setLoading(false);
      try {
        const raw = window.localStorage.getItem(SANDBOX_SPECIAL_RELICS_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        setRelics(normalizeSandboxRelics(parsed, classId));
      } catch {
        setRelics([]);
      }
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    void loadClassSpecialRelics(classId).then(result => {
      if (cancelled) return;
      setLoading(false);
      if (result.ok === false) {
        setMessage(`⚠️ ${result.message}`);
        setRelics([]);
        return;
      }
      setRelics(result.relics);
    });

    return () => {
      cancelled = true;
    };
  }, [classId, sandboxMode]);

  const selectedPreset = useMemo(
    () => ACHIEVEMENT_PRESETS.find(preset => preset.id === selectedPresetId) ?? DEFAULT_ACHIEVEMENT_PRESET,
    [selectedPresetId]
  );

  const selectedTemplate = useMemo(
    () => CLASS_SPECIAL_RELIC_TEMPLATES.find(template => template.id === selectedPreset.templateId) ?? null,
    [selectedPreset]
  );

  const selectedItem = useMemo(
    () => selectedTemplate ? classRoomItemById(selectedTemplate.itemId) : null,
    [selectedTemplate]
  );

  async function refreshRelics() {
    if (sandboxMode) return;
    const result = await loadClassSpecialRelics(classId);
    if (result.ok) setRelics(result.relics);
  }

  function choosePreset(preset: AchievementPreset) {
    setSelectedPresetId(preset.id);
    setTitle(preset.defaultAwardTitleHe);
    setStory('');
    setMessage(null);
  }

  function launchAchievementCeremony(cleanTitle: string, cleanStory: string) {
    if (!selectedItem) return;

    const detail: AchievementCeremonyDetail = {
      title: cleanTitle,
      story: cleanStory,
      itemNameHe: selectedItem.nameHe,
      imagePath: selectedItem.imagePath,
      achievementTitleHe: selectedPreset.titleHe,
      achievementIcon: selectedPreset.icon,
    };

    window.dispatchEvent(
      new CustomEvent<AchievementCeremonyDetail>(SPECIAL_ACHIEVEMENT_AWARDED_EVENT, { detail })
    );
  }

  async function handleGrant() {
    if (busy || !selectedTemplate || !selectedItem) return;

    const cleanTitle = title.trim();
    const cleanStory = story.trim();

    if (!cleanTitle) {
      setMessage('⚠️ צריך לתת שם להישג הכיתתי.');
      return;
    }

    if (sandboxMode) {
      const grant: ClassSpecialRelicGrant = {
        id: `sandbox-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        classId,
        templateId: selectedTemplate.id,
        itemId: selectedTemplate.itemId,
        title: cleanTitle,
        story: cleanStory,
        grantedAt: new Date().toISOString(),
      };
      const next = [grant, ...relics];
      setRelics(next);
      window.localStorage.setItem(SANDBOX_SPECIAL_RELICS_STORAGE_KEY, JSON.stringify(next));
      setMessage(`🧪 ההישג “${cleanTitle}” נפתח במפת הניסויים.`);
      launchAchievementCeremony(cleanTitle, cleanStory);
      return;
    }

    const approved = window.confirm(
      `לפתוח לכיתה את ההישג “${cleanTitle}”?\n\n` +
      `הכיתה תקבל את ${selectedItem.nameHe}, וההישג יישמר בהיסטוריה הכיתתית.`
    );
    if (!approved) return;

    setBusy(true);
    setMessage(null);
    const result = await grantClassSpecialRelicAsTeacher(
      classId,
      teacherId,
      selectedTemplate.id,
      cleanTitle,
      cleanStory
    );
    setBusy(false);

    if (result.ok === false) {
      setMessage(`⚠️ ${result.message}`);
      return;
    }

    await refreshRelics();
    setMessage(`🏅 ההישג “${cleanTitle}” נכנס להיסטוריה של הכיתה.`);
    launchAchievementCeremony(cleanTitle, cleanStory);
  }

  return (
    <section className="ck-achievement-manager" dir="rtl">
      <div className="ck-achievement-head">
        <div>
          <div className="ck-achievement-kicker">🏅 הישגים שלא קונים בכוכבים</div>
          <h3>הישגים כיתתיים מיוחדים</h3>
          <p>
            כאן מעניקים הישג על משהו שקרה באמת בכיתה: שיתוף פעולה, רצף, פרויקט, תחרות,
            יצירתיות או רגע יוצא דופן. כל הישג פותח מזכרת אמיתית לאוסף הכיתתי.
          </p>
        </div>
        <div className="ck-achievement-count">
          <strong>{loading ? '…' : relics.length}</strong>
          <span>הישגים מיוחדים</span>
        </div>
      </div>

      {sandboxMode && (
        <div className="ck-achievement-sandbox">
          🧪 מצב ניסויים — ההישגים כאן נשמרים רק בדפדפן ולא משנים נתוני כיתה אמיתיים.
        </div>
      )}

      <div className="ck-achievement-preset-grid">
        {ACHIEVEMENT_PRESETS.map(preset => {
          const template = CLASS_SPECIAL_RELIC_TEMPLATES.find(entry => entry.id === preset.templateId);
          const item = template ? classRoomItemById(template.itemId) : null;
          const selected = preset.id === selectedPresetId;

          return (
            <button
              type="button"
              key={preset.id}
              onClick={() => choosePreset(preset)}
              className={`ck-achievement-preset ${selected ? 'is-selected' : ''}`}
            >
              <span className="ck-achievement-preset-icon">{preset.icon}</span>
              {item && (
                <span className="ck-achievement-preset-art">
                  <img src={item.imagePath} alt="" draggable={false} />
                </span>
              )}
              <strong>{preset.titleHe}</strong>
              <span>{preset.subtitleHe}</span>
            </button>
          );
        })}
      </div>

      {selectedTemplate && selectedItem && (
        <div className="ck-achievement-editor">
          <div className="ck-achievement-selected-reward">
            <div className="ck-achievement-selected-glow" aria-hidden="true" />
            <img src={selectedItem.imagePath} alt="" draggable={false} />
            <div>
              <span>הפרס שייכנס לאוסף</span>
              <strong>{selectedItem.nameHe}</strong>
              <p>{selectedTemplate.descriptionHe}</p>
            </div>
          </div>

          <div className="ck-achievement-fields">
            <label>
              <span>שם ההישג</span>
              <input
                value={title}
                maxLength={100}
                onChange={event => setTitle(event.target.value)}
                placeholder={selectedPreset.defaultAwardTitleHe}
              />
            </label>

            <label>
              <span>הסיפור של ההישג</span>
              <textarea
                value={story}
                maxLength={500}
                onChange={event => setStory(event.target.value)}
                placeholder={selectedPreset.storyPromptHe}
              />
              <small>{story.length}/500</small>
            </label>
          </div>

          <div className="ck-achievement-submit-row">
            <div>
              <strong>{selectedPreset.icon} {selectedPreset.titleHe}</strong>
              <span>המערכת לא מחליטה אם הכיתה ראויה — המורה מאשר את הרגע האמיתי.</span>
            </div>
            <button
              type="button"
              onClick={() => void handleGrant()}
              disabled={busy || loading}
              className="ck-achievement-submit"
            >
              {busy ? 'שומר…' : sandboxMode ? '🧪 פתח הישג בניסוי' : '✨ פתח את ההישג לכיתה'}
            </button>
          </div>
        </div>
      )}

      {message && <div className="ck-achievement-message">{message}</div>}

      <div className="ck-achievement-history">
        <div className="ck-achievement-history-head">
          <div>
            <div className="ck-achievement-history-kicker">📖 ספר האגדות הכיתתי</div>
            <h4>היסטוריית הישגים מיוחדים</h4>
          </div>
          <span>{relics.length > 0 ? `${relics.length} רגעים שנשמרו` : 'עוד אין הישגים מיוחדים'}</span>
        </div>

        {relics.length > 0 ? (
          <div className="ck-achievement-history-grid">
            {relics.slice(0, 8).map(relic => {
              const item = classRoomItemById(relic.itemId);
              if (!item) return null;
              const preset = achievementPresetForTemplate(relic.templateId);

              return (
                <article key={relic.id}>
                  <div className="ck-achievement-history-art">
                    <img src={item.imagePath} alt="" draggable={false} />
                  </div>
                  <div className="ck-achievement-history-copy">
                    <div className="ck-achievement-history-meta">
                      <span>{preset?.icon ?? '🏅'} {preset?.titleHe ?? 'הישג מיוחד'}</span>
                      <time>{formatDate(relic.grantedAt)}</time>
                    </div>
                    <strong>{relic.title}</strong>
                    {relic.story ? <p>{relic.story}</p> : <p className="is-empty">הישג שנשמר ללא סיפור נוסף.</p>}
                    <div className="ck-achievement-history-reward">🎁 {item.nameHe}</div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="ck-achievement-empty">
            <span>✨</span>
            <strong>העמוד הראשון עדיין מחכה</strong>
            <p>כשהכיתה תעשה משהו שבאמת ראוי לזיכרון — זה המקום להפוך אותו לחלק מהממלכה.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function achievementPresetForTemplate(templateId: string): AchievementPreset | null {
  return ACHIEVEMENT_PRESETS.find(preset => preset.templateId === templateId) ?? null;
}

function normalizeSandboxRelics(value: unknown, classId: string): ClassSpecialRelicGrant[] {
  if (!Array.isArray(value)) return [];

  const result: ClassSpecialRelicGrant[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') continue;
    const entry = raw as Record<string, unknown>;
    if (typeof entry.id !== 'string' || typeof entry.itemId !== 'string') continue;

    result.push({
      id: entry.id,
      classId: typeof entry.classId === 'string' ? entry.classId : classId,
      templateId: typeof entry.templateId === 'string' ? entry.templateId : '',
      itemId: entry.itemId as ClassSpecialRelicGrant['itemId'],
      title: typeof entry.title === 'string' ? entry.title : '',
      story: typeof entry.story === 'string' ? entry.story : '',
      grantedAt: typeof entry.grantedAt === 'string' ? entry.grantedAt : new Date().toISOString(),
    });
  }
  return result.sort((a, b) => b.grantedAt.localeCompare(a.grantedAt));
}

function formatDate(timestamp: string): string {
  return new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(new Date(timestamp));
}
