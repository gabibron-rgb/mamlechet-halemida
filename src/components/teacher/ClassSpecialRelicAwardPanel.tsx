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

const SANDBOX_SPECIAL_RELICS_STORAGE_KEY = 'mamlechet-class-kingdom-special-relics-sandbox-v1';

export default function ClassSpecialRelicAwardPanel({
  classId,
  teacherId,
  sandboxMode = false,
}: Props) {
  const [relics, setRelics] = useState<ClassSpecialRelicGrant[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    CLASS_SPECIAL_RELIC_TEMPLATES[0]?.id ?? 'competition'
  );
  const [title, setTitle] = useState('');
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

  const selectedTemplate = useMemo(
    () => CLASS_SPECIAL_RELIC_TEMPLATES.find(template => template.id === selectedTemplateId) ?? null,
    [selectedTemplateId]
  );

  async function refreshRelics() {
    if (sandboxMode) return;
    const result = await loadClassSpecialRelics(classId);
    if (result.ok) setRelics(result.relics);
  }

  async function handleGrant() {
    if (busy || !selectedTemplate) return;

    const cleanTitle = title.trim();
    const cleanStory = story.trim();

    if (!cleanTitle) {
      setMessage('⚠️ צריך לכתוב כותרת למזכרת המיוחדת.');
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
      setTitle('');
      setStory('');
      setMessage(`🧪 המזכרת “${cleanTitle}” נוספה למפת הניסויים.`);
      return;
    }

    const approved = window.confirm(
      `להעניק לכיתה את המזכרת “${cleanTitle}”?\n\nהיא תישמר בהיסטוריה הכיתתית ותהיה זמינה לעיצוב החדרים.`
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
    setTitle('');
    setStory('');
    setMessage(`🏅 “${cleanTitle}” נוספה להיסטוריה של הכיתה.`);
  }

  return (
    <section className="ck-manager-special-relics">
      <div className="ck-manager-special-head">
        <div>
          <div className="ck-manager-special-kicker">🏅 רגע ששווה לשמור</div>
          <h3>הענקת מזכרת מיוחדת לכיתה</h3>
          <p>
            זו פעולה של הממלכה כולה — לא של חדר מסוים. המזכרת נשמרת בהיסטוריה הכיתתית,
            ובהמשך אפשר להציב אותה בכל חדר שבו תרצו להציג אותה.
          </p>
        </div>
        <div className="ck-manager-special-count">
          <strong>{loading ? '…' : relics.length}</strong>
          <span>מזכרות מיוחדות</span>
        </div>
      </div>

      {sandboxMode && (
        <div className="ck-manager-special-sandbox">
          🧪 מצב ניסויים — ההענקה כאן נשמרת רק בדפדפן ולא משנה נתוני כיתה אמיתיים.
        </div>
      )}

      <div className="ck-manager-template-grid">
        {CLASS_SPECIAL_RELIC_TEMPLATES.map(template => {
          const item = classRoomItemById(template.itemId);
          if (!item) return null;
          const selected = selectedTemplateId === template.id;

          return (
            <button
              type="button"
              key={template.id}
              onClick={() => setSelectedTemplateId(template.id)}
              className={`ck-manager-template-card ${selected ? 'is-selected' : ''}`}
            >
              <span className="ck-manager-template-art">
                <img src={item.imagePath} alt="" draggable={false} />
              </span>
              <span className="ck-manager-template-name">{template.nameHe}</span>
              <span className="ck-manager-template-category">{template.categoryHe}</span>
            </button>
          );
        })}
      </div>

      {selectedTemplate && (
        <div className="ck-manager-selected-help">
          <strong>{selectedTemplate.nameHe}</strong>
          <span>{selectedTemplate.descriptionHe}</span>
        </div>
      )}

      <div className="ck-manager-special-fields">
        <label>
          <span>כותרת המזכרת</span>
          <input
            value={title}
            maxLength={100}
            onChange={event => setTitle(event.target.value)}
            placeholder="לדוגמה: מקום ראשון בתחרות השחמט העירונית"
          />
        </label>

        <label>
          <span>הסיפור שלה</span>
          <textarea
            value={story}
            maxLength={500}
            onChange={event => setStory(event.target.value)}
            placeholder="מה קרה, למה זה היה מיוחד, ומה נרצה לזכור מהרגע הזה?"
          />
        </label>

        <button
          type="button"
          onClick={() => void handleGrant()}
          disabled={busy || loading}
          className="ck-manager-special-submit"
        >
          {busy ? 'שומר…' : sandboxMode ? '🧪 הענק מזכרת בניסוי' : '🏅 הענק מזכרת לכיתה'}
        </button>
      </div>

      {message && <div className="ck-manager-special-message">{message}</div>}

      {relics.length > 0 && (
        <div className="ck-manager-special-recent">
          <div className="ck-manager-special-recent-title">📖 מזכרות אחרונות</div>
          <div className="ck-manager-special-recent-grid">
            {relics.slice(0, 3).map(relic => {
              const item = classRoomItemById(relic.itemId);
              if (!item) return null;
              return (
                <article key={relic.id}>
                  <img src={item.imagePath} alt="" draggable={false} />
                  <div>
                    <strong>{relic.title}</strong>
                    <span>{formatDate(relic.grantedAt)}</span>
                    {relic.story && <p>{relic.story}</p>}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
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
