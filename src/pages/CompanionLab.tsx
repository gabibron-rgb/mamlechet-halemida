import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { Link } from 'react-router-dom';

import AnimatedCompanionArt, {
  CompanionAnimationStyles,
} from '../components/student/AnimatedCompanionArt';
import {
  COMPANION_EVOLUTION_STAGES,
  COMPANION_FORM_ART,
  COMPANION_VISUALS,
  type CompanionArtLayer,
  type CompanionEvolutionStage,
  type CompanionFormArt,
  type CompanionLayerAnimation,
} from '../data/companionWorlds';
import { THEMES, type ThemeId } from '../data/themes';

const STORAGE_KEY = 'mamlechet-halemida:companion-lab:v3';
const LEGACY_STORAGE_KEY = 'mamlechet-halemida:companion-lab:v2';

type PreviewMode = 'static' | 'idle' | 'run';
type MovementProfile = 'ground' | 'flying';
type StoredDrafts = Record<string, CompanionArtLayer[]>;
type ImageRatioMap = Record<string, number>;
type OriginPoint = { x: number; y: number };

type DragState = {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
};

const ANIMATION_OPTIONS: CompanionLayerAnimation[] = [
  'none',
  'bodyBreath',
  'headIdle',
  'blink',
  'blinkOverlay',
  'headBlinkOverlay',
  'earLeft',
  'earRight',
  'frontLegLeft',
  'frontLegRight',
  'backLegLeft',
  'backLegRight',
  'mane',
  'wingLeft',
  'wingRight',
  'tail',
  'pendant',
  'pulse',
  'sparkle',
];

const LAYER_LABELS: Record<string, string> = {
  body: 'גוף',
  head: 'ראש',
  'head-closed': 'ראש — מצמוץ',
  'left-ear': 'אוזן שמאל',
  'right-ear': 'אוזן ימין',
  'front-left-leg': 'רגל קדמית שמאל',
  'front-right-leg': 'רגל קדמית ימין',
  'back-left-leg': 'רגל אחורית שמאל',
  'back-right-leg': 'רגל אחורית ימין',
  tail: 'זנב',
  mane: 'רעמה',
  pendant: 'תליון',
  'left-wing': 'כנף שמאל',
  'right-wing': 'כנף ימין',
  glow: 'הילה',
  sparkles: 'ניצוצות',
};

const COUNTERPART_IDS: Record<string, string> = {
  'front-left-leg': 'front-right-leg',
  'front-right-leg': 'front-left-leg',
  'back-left-leg': 'back-right-leg',
  'back-right-leg': 'back-left-leg',
  'left-ear': 'right-ear',
  'right-ear': 'left-ear',
  'left-wing': 'right-wing',
  'right-wing': 'left-wing',
};

const DEFAULT_ANIMATION_DURATION: Partial<Record<CompanionLayerAnimation, number>> = {
  bodyBreath: 3200,
  headIdle: 4100,
  blink: 5000,
  blinkOverlay: 5000,
  headBlinkOverlay: 4200,
  earLeft: 4700,
  earRight: 5100,
  frontLegLeft: 4400,
  frontLegRight: 4900,
  backLegLeft: 5300,
  backLegRight: 5800,
  mane: 3000,
  wingLeft: 1350,
  wingRight: 1350,
  tail: 2400,
  pendant: 2600,
  pulse: 2000,
  sparkle: 2400,
};

function formKey(theme: ThemeId, stage: CompanionEvolutionStage): string {
  return `${theme}:${stage}`;
}

function cloneLayers(layers: CompanionArtLayer[] | undefined): CompanionArtLayer[] {
  return (layers ?? []).map(layer => ({ ...layer }));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function parseOrigin(value: string | undefined): OriginPoint {
  const fallback = { x: 50, y: 50 };
  if (!value) return fallback;
  const parts = value.trim().split(/\s+/);
  if (parts.length < 2) return fallback;

  const parsePart = (part: string, fallbackValue: number) => {
    const parsed = Number.parseFloat(part.replace('%', ''));
    return Number.isFinite(parsed) ? parsed : fallbackValue;
  };

  return {
    x: parsePart(parts[0], 50),
    y: parsePart(parts[1], 50),
  };
}

function formatOrigin(point: OriginPoint): string {
  return `${Number(point.x.toFixed(1))}% ${Number(point.y.toFixed(1))}%`;
}

function themeName(themeId: ThemeId): string {
  return THEMES.find(theme => theme.id === themeId)?.nameHe ?? themeId;
}

function stageName(stage: CompanionEvolutionStage): string {
  return (
    COMPANION_EVOLUTION_STAGES.find(definition => definition.stage === stage)
      ?.labelHe ?? stage
  );
}

function layerLabel(layer: CompanionArtLayer): string {
  return LAYER_LABELS[layer.id] ?? layer.id;
}

function codeForForm(
  theme: ThemeId,
  stage: CompanionEvolutionStage,
  art: CompanionFormArt | null,
  layers: CompanionArtLayer[]
): string {
  const safeName = art?.nameHe ?? `${themeName(theme)} — ${stageName(stage)}`;
  return `${stage}: {\n  nameHe: ${JSON.stringify(safeName)},\n  layers: ${JSON.stringify(
    layers,
    null,
    2
  )},\n},`;
}

function normalizedLayerId(layer: CompanionArtLayer): string {
  return `${layer.id} ${layer.src}`.toLowerCase().replaceAll('_', '-');
}

function animationForLayer(layer: CompanionArtLayer): CompanionLayerAnimation | null {
  const value = normalizedLayerId(layer);

  if (value.includes('head-closed') || value.includes('closed-head')) return 'headBlinkOverlay';
  if (value.includes('front-left') && value.includes('leg')) return 'frontLegLeft';
  if (value.includes('front-right') && value.includes('leg')) return 'frontLegRight';
  if (value.includes('back-left') && value.includes('leg')) return 'backLegLeft';
  if (value.includes('back-right') && value.includes('leg')) return 'backLegRight';
  if (value.includes('left-ear') || value.includes('ear-left')) return 'earLeft';
  if (value.includes('right-ear') || value.includes('ear-right')) return 'earRight';
  if (value.includes('left-wing') || value.includes('wing-left')) return 'wingLeft';
  if (value.includes('right-wing') || value.includes('wing-right')) return 'wingRight';
  if (value.includes('body')) return 'bodyBreath';
  if (value.includes('head')) return 'headIdle';
  if (value.includes('tail')) return 'tail';
  if (value.includes('mane')) return 'mane';
  if (value.includes('pendant')) return 'pendant';
  if (value.includes('spark')) return 'sparkle';
  if (value.includes('glow') || value.includes('aura')) return 'pulse';
  return null;
}

function zIndexForLayer(layer: CompanionArtLayer): number | null {
  const value = normalizedLayerId(layer);
  if (value.includes('glow') || value.includes('aura')) return 1;
  if (value.includes('tail')) return 2;
  if (value.includes('back-left') && value.includes('leg')) return 4;
  if (value.includes('back-right') && value.includes('leg')) return 5;
  if (value.includes('wing')) return 7;
  if (value.includes('body')) return 8;
  if (value.includes('front-left') && value.includes('leg')) return 11;
  if (value.includes('front-right') && value.includes('leg')) return 12;
  if (value.includes('mane')) return 18;
  if (value.includes('head-closed') || value.includes('closed-head')) return 24;
  if (value.includes('head')) return 20;
  if (value.includes('pendant')) return 26;
  if (value.includes('spark')) return 30;
  return null;
}

function originForLayer(layer: CompanionArtLayer): string | null {
  const value = normalizedLayerId(layer);
  if (value.includes('leg')) return '50% 12%';
  if (value.includes('tail')) return '18% 52%';
  if (value.includes('head')) return '58% 78%';
  if (value.includes('ear')) return '50% 88%';
  if (value.includes('wing')) return '50% 70%';
  if (value.includes('pendant')) return '50% 6%';
  return null;
}

function draftMatchesCode(
  draft: CompanionArtLayer[] | undefined,
  codeLayers: CompanionArtLayer[]
): boolean {
  if (!draft) return false;
  if (draft.length !== codeLayers.length) return false;

  const signature = (layers: CompanionArtLayer[]) =>
    layers
      .map(layer => `${layer.id}|${layer.src}`)
      .sort()
      .join('||');

  return signature(draft) === signature(codeLayers);
}

function autoRigLayers(layers: CompanionArtLayer[]): CompanionArtLayer[] {
  const head = layers.find(layer => normalizedLayerId(layer).includes('head') && !normalizedLayerId(layer).includes('closed'));

  return layers.map(layer => {
    const animation = animationForLayer(layer);
    const zIndex = zIndexForLayer(layer);
    const transformOrigin = originForLayer(layer);
    const isClosedHead = normalizedLayerId(layer).includes('head-closed') || normalizedLayerId(layer).includes('closed-head');

    const next: CompanionArtLayer = {
      ...layer,
      ...(animation ? { animation } : {}),
      ...(zIndex !== null ? { zIndex } : {}),
      ...(transformOrigin ? { transformOrigin } : {}),
      ...(animation && !layer.animationDurationMs
        ? { animationDurationMs: DEFAULT_ANIMATION_DURATION[animation] ?? 3000 }
        : {}),
    };

    if (isClosedHead && head) {
      next.x = head.x;
      next.y = head.y;
      next.width = head.width;
      next.rotation = head.rotation;
      next.flipX = head.flipX;
      next.transformOrigin = head.transformOrigin ?? transformOrigin ?? '58% 78%';
    }

    return next;
  });
}

function NumericField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <label className="block rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="mb-2 flex items-center justify-between gap-2 text-xs font-bold text-slate-200">
        <span>{label}</span>
        <input
          type="number"
          value={Number(value.toFixed(2))}
          min={min}
          max={max}
          step={step}
          onChange={event => {
            const next = Number(event.target.value);
            if (Number.isFinite(next)) onChange(next);
          }}
          className="w-20 rounded-lg border border-white/10 bg-slate-950/60 px-2 py-1 text-left text-xs text-white outline-none focus:border-cyan-300/50"
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={event => onChange(Number(event.target.value))}
        className="w-full accent-cyan-300"
      />
    </label>
  );
}

export default function CompanionLab() {
  const availableThemes = useMemo(
    () => Object.keys(COMPANION_VISUALS) as ThemeId[],
    []
  );

  const [theme, setTheme] = useState<ThemeId>('chess');
  const [stage, setStage] = useState<CompanionEvolutionStage>('hatchling');
  const [copySourceStage, setCopySourceStage] = useState<CompanionEvolutionStage>('young');
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<StoredDrafts>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as StoredDrafts) : {};
    } catch {
      return {};
    }
  });
  const [hiddenLayerIds, setHiddenLayerIds] = useState<string[]>([]);
  const [imageRatios, setImageRatios] = useState<ImageRatioMap>({});
  const [historyPast, setHistoryPast] = useState<CompanionArtLayer[][]>([]);
  const [historyFuture, setHistoryFuture] = useState<CompanionArtLayer[][]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [showBounds, setShowBounds] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);

  const currentKey = formKey(theme, stage);
  const codeArt = COMPANION_FORM_ART[theme]?.[stage] ?? null;
  const codeLayers = codeArt?.layers ?? [];
  const storedDraft = drafts[currentKey];
  const hasDraft = draftMatchesCode(storedDraft, codeLayers);
  const currentLayers = hasDraft ? storedDraft! : codeLayers;

  const visibleLayers = useMemo(
    () => currentLayers.filter(layer => !hiddenLayerIds.includes(layer.id)),
    [currentLayers, hiddenLayerIds]
  );

  const selectedLayer = currentLayers.find(layer => layer.id === selectedLayerId) ?? null;
  const counterpartId = selectedLayer ? COUNTERPART_IDS[selectedLayer.id] : undefined;
  const counterpartLayer = counterpartId
    ? currentLayers.find(layer => layer.id === counterpartId) ?? null
    : null;

  const selectedRatio = selectedLayer ? imageRatios[selectedLayer.src] ?? 1 : 1;
  const selectedWidth = selectedLayer?.width ?? 100;
  const selectedHeight = selectedWidth / Math.max(0.01, selectedRatio);
  const selectedOrigin = parseOrigin(selectedLayer?.transformOrigin);

  const previewArt: CompanionFormArt = {
    ...(codeArt ?? {}),
    layers: visibleLayers,
  };

  const inferredProfile: MovementProfile = currentLayers.some(layer => {
    const animation = animationForLayer(layer);
    return animation === 'wingLeft' || animation === 'wingRight';
  })
    ? 'flying'
    : 'ground';
  const movementProfile = codeArt?.movementProfile ?? inferredProfile;

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    } catch {
      // DEV tool only.
    }
  }, [drafts]);


  useEffect(() => {
    const staleDraft = drafts[currentKey];
    if (!staleDraft || draftMatchesCode(staleDraft, codeLayers)) return;

    setDrafts(current => {
      const next = { ...current };
      delete next[currentKey];
      return next;
    });
    setMessage('טיוטה ישנה לא התאימה לקבצים החדשים ונוקתה אוטומטית');
  }, [codeLayers, currentKey, drafts]);

  useEffect(() => {
    const candidateDraft = drafts[currentKey];
    const nextLayers = draftMatchesCode(candidateDraft, codeLayers)
      ? candidateDraft!
      : codeLayers;
    setSelectedLayerId(nextLayers[0]?.id ?? null);
    setHiddenLayerIds([]);
    setHistoryPast([]);
    setHistoryFuture([]);

    const alternative = COMPANION_EVOLUTION_STAGES.find(definition => definition.stage !== stage)?.stage;
    if (alternative) setCopySourceStage(alternative);
    // Switching form intentionally starts a fresh editor context.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey]);

  useEffect(() => {
    for (const layer of currentLayers) {
      if (!layer.src || imageRatios[layer.src]) continue;
      const image = new Image();
      image.onload = () => {
        if (!image.naturalWidth || !image.naturalHeight) return;
        setImageRatios(current => ({
          ...current,
          [layer.src]: image.naturalWidth / image.naturalHeight,
        }));
      };
      image.src = layer.src;
    }
  }, [currentLayers, imageRatios]);

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 1800);
  }

  function pushHistory() {
    setHistoryPast(current => [...current.slice(-59), cloneLayers(currentLayers)]);
    setHistoryFuture([]);
  }

  function setCurrentLayers(nextLayers: CompanionArtLayer[]) {
    setDrafts(current => ({
      ...current,
      [currentKey]: nextLayers,
    }));
  }

  function updateLayer(
    layerId: string,
    patch: Partial<CompanionArtLayer>,
    addHistory = true
  ) {
    if (addHistory) pushHistory();
    setCurrentLayers(
      currentLayers.map(layer => (layer.id === layerId ? { ...layer, ...patch } : layer))
    );
  }

  function resetForm() {
    pushHistory();
    setDrafts(current => {
      const next = { ...current };
      delete next[currentKey];
      return next;
    });
    setSelectedLayerId(codeLayers[0]?.id ?? null);
    flash('הצורה חזרה לערכים שבקוד');
  }

  function resetSelectedLayer() {
    if (!selectedLayer) return;
    const original = codeLayers.find(layer => layer.id === selectedLayer.id);
    if (!original) return;
    pushHistory();
    setCurrentLayers(
      currentLayers.map(layer =>
        layer.id === selectedLayer.id ? { ...original } : layer
      )
    );
    flash('השכבה חזרה לערכי הקוד');
  }

  function undo() {
    const previous = historyPast[historyPast.length - 1];
    if (!previous) return;
    setHistoryFuture(current => [cloneLayers(currentLayers), ...current.slice(0, 59)]);
    setCurrentLayers(cloneLayers(previous));
    setHistoryPast(current => current.slice(0, -1));
  }

  function redo() {
    const next = historyFuture[0];
    if (!next) return;
    setHistoryPast(current => [...current.slice(-59), cloneLayers(currentLayers)]);
    setCurrentLayers(cloneLayers(next));
    setHistoryFuture(current => current.slice(1));
  }

  function toggleLayerHidden(layerId: string) {
    setHiddenLayerIds(current =>
      current.includes(layerId)
        ? current.filter(id => id !== layerId)
        : [...current, layerId]
    );
  }

  function applyAutoRig() {
    if (currentLayers.length === 0) return;
    pushHistory();
    setCurrentLayers(autoRigLayers(currentLayers));
    flash('Auto Rig הוחל — מיקומים וגדלים נשמרו');
  }

  function copyRigFromStage() {
    if (currentLayers.length === 0) return;
    const sourceKey = formKey(theme, copySourceStage);
    const sourceLayers = drafts[sourceKey] ?? COMPANION_FORM_ART[theme]?.[copySourceStage]?.layers ?? [];
    if (sourceLayers.length === 0) {
      flash('אין ריג בשלב שממנו ביקשת להעתיק');
      return;
    }

    const fields: (keyof CompanionArtLayer)[] = [
      'x',
      'y',
      'width',
      'rotation',
      'flipX',
      'zIndex',
      'transformOrigin',
      'animation',
      'animationDurationMs',
      'animationDelayMs',
    ];

    let matched = 0;
    const nextLayers = currentLayers.map(layer => {
      const source = sourceLayers.find(candidate => candidate.id === layer.id);
      if (!source) return layer;
      matched += 1;
      const next = { ...layer } as CompanionArtLayer;
      for (const field of fields) {
        const value = source[field];
        if (value !== undefined) {
          (next as unknown as Record<string, unknown>)[field] = value;
        }
      }
      return next;
    });

    if (matched === 0) {
      flash('לא נמצאו שכבות עם ID תואם');
      return;
    }

    pushHistory();
    setCurrentLayers(nextLayers);
    flash(`הועתק ריג ל־${matched} שכבות`);
  }

  function handleLayerPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!selectedLayer || !canvasRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    pushHistory();
    dragRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: selectedLayer.x ?? 50,
      startY: selectedLayer.y ?? 50,
    };
  }

  function handleLayerPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const canvas = canvasRef.current;
    if (!drag || !canvas || !selectedLayer) return;
    if (drag.pointerId !== event.pointerId) return;

    const rect = canvas.getBoundingClientRect();
    const dx = (((event.clientX - drag.startClientX) / rect.width) * 100) / canvasZoom;
    const dy = (((event.clientY - drag.startClientY) / rect.height) * 100) / canvasZoom;

    updateLayer(
      selectedLayer.id,
      {
        x: Number(clamp(drag.startX + dx, -40, 140).toFixed(1)),
        y: Number(clamp(drag.startY + dy, -40, 140).toFixed(1)),
      },
      false
    );
  }

  function handleLayerPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!selectedLayer) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable) return;

      const moveStep = event.shiftKey ? 1 : 0.2;
      const rotateStep = event.shiftKey ? 2 : 0.5;
      const sizeStep = event.shiftKey ? 1 : 0.25;
      let patch: Partial<CompanionArtLayer> | null = null;

      if (event.key === 'ArrowLeft') patch = { x: clamp((selectedLayer.x ?? 50) - moveStep, -40, 140) };
      if (event.key === 'ArrowRight') patch = { x: clamp((selectedLayer.x ?? 50) + moveStep, -40, 140) };
      if (event.key === 'ArrowUp') patch = { y: clamp((selectedLayer.y ?? 50) - moveStep, -40, 140) };
      if (event.key === 'ArrowDown') patch = { y: clamp((selectedLayer.y ?? 50) + moveStep, -40, 140) };
      if (event.key === '[') patch = { rotation: clamp((selectedLayer.rotation ?? 0) - rotateStep, -180, 180) };
      if (event.key === ']') patch = { rotation: clamp((selectedLayer.rotation ?? 0) + rotateStep, -180, 180) };
      if (event.key === '-' || event.key === '_') patch = { width: clamp((selectedLayer.width ?? 100) - sizeStep, 2, 160) };
      if (event.key === '=' || event.key === '+') patch = { width: clamp((selectedLayer.width ?? 100) + sizeStep, 2, 160) };

      if (!patch) return;
      event.preventDefault();
      updateLayer(selectedLayer.id, patch);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLayer, currentLayers]);

  async function copyCode() {
    const text = codeForForm(theme, stage, codeArt, currentLayers);
    try {
      await navigator.clipboard.writeText(text);
      flash('הקוד הועתק ללוח');
    } catch {
      flash('לא הצלחתי להעתיק אוטומטית — אפשר להעתיק מהתיבה');
    }
  }

  function downloadRig() {
    const payload = {
      version: 2,
      theme,
      stage,
      movementProfile,
      nameHe: codeArt?.nameHe ?? `${themeName(theme)} — ${stageName(stage)}`,
      layers: currentLayers,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${theme}-${stage}-companion-rig.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    flash('קובץ הריג הורד');
  }

  const codeText = codeForForm(theme, stage, codeArt, currentLayers);

  function canvasClass(mode: PreviewMode): string {
    if (mode === 'static') return 'companion-lab-static';
    if (mode === 'run') return 'companion-running';
    return '';
  }

  function MiniPreview({ mode }: { mode: Exclude<PreviewMode, 'static'> }) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="mb-2 flex items-center justify-between text-xs font-black">
          <span>{mode === 'idle' ? '🫧 Idle' : '🏃 Run'}</span>
          <span className="text-[10px] font-normal text-slate-400">Live</span>
        </div>
        <div
          className={`relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-[#21184e] via-[#16113b] to-[#0b0a21] ${canvasClass(mode)}`}
        >
          <AnimatedCompanionArt
            art={previewArt}
            alt={`${mode} preview`}
            stage={stage}
            motion={false}
            activity={mode}
            className="absolute inset-0"
          />
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#120b2f] text-white">
      <CompanionAnimationStyles />
      <style>{`
        .companion-lab-static .companion-layer-motion,
        .companion-lab-static.companion-motion {
          animation: none !important;
        }
        .companion-lab-grid {
          background-image:
            linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px),
            linear-gradient(rgba(34,211,238,.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,.12) 1px, transparent 1px);
          background-size: 10% 10%, 10% 10%, 50% 50%, 50% 50%;
          background-position: center center;
        }
      `}</style>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#120b2f]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[1780px] flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xl font-black">
              🐾 מעבדת חיות המחמד
              <span className="rounded-full bg-cyan-300/15 px-2 py-1 text-[10px] text-cyan-100 ring-1 ring-cyan-300/25">V3</span>
            </div>
            <div className="text-xs text-violet-200/75">
              מעבדת אנימציה — Static + Idle + Run, עם ניקוי טיוטות אוטומטי
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className={`rounded-full px-3 py-1.5 text-[11px] font-black ${hasDraft ? 'bg-amber-300/15 text-amber-100 ring-1 ring-amber-300/25' : 'bg-emerald-300/15 text-emerald-100 ring-1 ring-emerald-300/25'}`}>
              {hasDraft ? '● טיוטה מקומית' : '✓ ערכי הקוד'}
            </span>
            <Link
              to="/dev/items"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-bold hover:bg-white/10"
            >
              🧰 מעבדת החפצים
            </Link>
            <Link
              to="/"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-bold hover:bg-white/10"
            >
              🏰 חזרה למשחק
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1780px] gap-4 p-4 2xl:grid-cols-[285px_minmax(720px,1fr)_340px]">
        <aside className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <section className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
            <label>
              <div className="mb-2 text-sm font-black text-cyan-100">עולם</div>
              <select
                value={theme}
                onChange={event => setTheme(event.target.value as ThemeId)}
                className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white"
              >
                {availableThemes.map(themeId => (
                  <option key={themeId} value={themeId}>
                    {COMPANION_VISUALS[themeId]?.motif ?? '🐾'} {themeName(themeId)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <div className="mb-2 text-sm font-black text-cyan-100">צורת אבולוציה</div>
              <select
                value={stage}
                onChange={event => setStage(event.target.value as CompanionEvolutionStage)}
                className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white"
              >
                {COMPANION_EVOLUTION_STAGES.map(definition => (
                  <option key={definition.stage} value={definition.stage}>
                    {definition.labelHe}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="rounded-xl border border-cyan-300/15 bg-cyan-300/5 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="text-sm font-black text-cyan-100">⚡ קיצור דרך לריג</div>
            </div>
            <button
              type="button"
              onClick={applyAutoRig}
              disabled={currentLayers.length === 0}
              className="w-full rounded-xl bg-cyan-400/15 px-3 py-2 text-xs font-black text-cyan-50 ring-1 ring-cyan-300/25 hover:bg-cyan-400/25 disabled:opacity-40"
            >
              🪄 Auto Rig לשכבות
            </button>
            <div className="mt-2 text-[10px] leading-5 text-slate-400">
              מזהה גוף, ראש, רגליים, זנב, כנפיים ומצמוץ. לא משנה X/Y/גודל שכבר סידרת.
            </div>
          </section>

          <section className="rounded-xl border border-violet-300/15 bg-violet-300/5 p-3">
            <div className="mb-2 text-sm font-black text-violet-100">🧬 Copy Rig מצורה אחרת</div>
            <div className="flex gap-2">
              <select
                value={copySourceStage}
                onChange={event => setCopySourceStage(event.target.value as CompanionEvolutionStage)}
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950/80 px-2 py-2 text-xs"
              >
                {COMPANION_EVOLUTION_STAGES.filter(definition => definition.stage !== stage).map(definition => (
                  <option key={definition.stage} value={definition.stage}>
                    {definition.shortLabelHe}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={copyRigFromStage}
                disabled={currentLayers.length === 0}
                className="rounded-lg border border-violet-200/20 bg-violet-300/10 px-3 py-2 text-xs font-black hover:bg-violet-300/20 disabled:opacity-40"
              >
                העתק
              </button>
            </div>
            <div className="mt-2 text-[10px] leading-5 text-slate-400">
              מעתיק מיקום, גודל, ציר ואנימציה רק לשכבות עם אותו ID — ושומר את תמונות הצורה הנוכחית.
            </div>
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-black text-cyan-100">שכבות</div>
              <span className="rounded-full bg-cyan-300/10 px-2 py-1 text-[10px] font-bold text-cyan-100">
                {currentLayers.length}
              </span>
            </div>

            {currentLayers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/15 bg-black/15 p-4 text-center text-xs text-slate-300">
                עדיין אין שכבות לצורה הזאת בקוד.
              </div>
            ) : (
              <div className="max-h-[530px] space-y-2 overflow-y-auto pr-1">
                {[...currentLayers]
                  .sort((a, b) => (b.zIndex ?? 10) - (a.zIndex ?? 10))
                  .map(layer => {
                    const selected = layer.id === selectedLayerId;
                    const hidden = hiddenLayerIds.includes(layer.id);
                    return (
                      <div
                        key={layer.id}
                        className={`flex items-center gap-2 rounded-xl border p-2 transition ${
                          selected
                            ? 'border-cyan-300/50 bg-cyan-300/10'
                            : 'border-white/10 bg-black/15 hover:bg-white/5'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedLayerId(layer.id)}
                          className="flex min-w-0 flex-1 items-center gap-2 text-right"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-950/60">
                            <img src={layer.src} alt="" className="max-h-full max-w-full object-contain" />
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-xs font-black">{layerLabel(layer)}</div>
                            <div className="truncate text-[10px] text-slate-400">
                              {layer.animation ?? 'none'} · z {layer.zIndex ?? 10}
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          title={hidden ? 'הצג שכבה' : 'הסתר שכבה'}
                          onClick={() => toggleLayerHidden(layer.id)}
                          className="rounded-lg border border-white/10 px-2 py-1 text-xs hover:bg-white/10"
                        >
                          {hidden ? '🙈' : '👁️'}
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}
          </section>
        </aside>

        <section className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-lg font-black">
                  {COMPANION_VISUALS[theme]?.motif ?? '🐾'} {themeName(theme)} — {stageName(stage)}
                </div>
                <div className="text-xs text-slate-400">
                  Static / Idle / Run מוצגים יחד. בריג שכבות ניתן לערוך ב־Static; באנימציית פריימים התצוגה מנוגנת אוטומטית.
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-300">
                <span className="rounded-lg bg-white/5 px-2 py-1">← ↑ ↓ → = 0.2</span>
                <span className="rounded-lg bg-white/5 px-2 py-1">Shift = 1.0</span>
                <span className="rounded-lg bg-white/5 px-2 py-1">[ ] סיבוב</span>
                <span className="rounded-lg bg-white/5 px-2 py-1">− + גודל</span>
              </div>
            </div>

            {currentLayers.length === 0 && !codeArt?.frameAnimation ? (
              <div className="flex aspect-[16/8] items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/20 text-center text-sm text-slate-300">
                אין עדיין גרפיקה לצורה הזאת.
              </div>
            ) : (
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_250px] xl:grid-cols-[minmax(0,1fr)_280px]">
                <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.03] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-xs font-black text-cyan-100">⏸️ Static — עריכה</div>
                    <div className="text-[10px] text-slate-400">גרירה + מקלדת</div>
                  </div>
                  <div
                    ref={canvasRef}
                    className={`relative mx-auto aspect-square w-full max-w-[720px] overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-[#21184e] via-[#16113b] to-[#0b0a21] shadow-2xl ${showGrid ? 'companion-lab-grid' : ''}`}
                  >
                    <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px bg-cyan-200/15" />
                    <div className="pointer-events-none absolute left-0 top-1/2 h-px w-full bg-cyan-200/15" />
                    <div
                      className="companion-lab-static absolute inset-0"
                      style={{ transform: `scale(${canvasZoom})`, transformOrigin: '50% 50%' }}
                    >
                      <AnimatedCompanionArt
                        art={previewArt}
                        alt={codeArt?.nameHe ?? 'תצוגת חיית מחמד'}
                        stage={stage}
                        motion={false}
                        activity="static"
                        className="absolute inset-0"
                      />

                      {selectedLayer && showBounds && (
                        <div
                          role="presentation"
                          onPointerDown={handleLayerPointerDown}
                          onPointerMove={handleLayerPointerMove}
                          onPointerUp={handleLayerPointerUp}
                          onPointerCancel={handleLayerPointerUp}
                          className="absolute z-[1000] cursor-grab border-2 border-cyan-300/90 bg-cyan-300/5 shadow-[0_0_0_1px_rgba(8,47,73,.8),0_0_18px_rgba(34,211,238,.28)] active:cursor-grabbing"
                          style={{
                            left: `${selectedLayer.x ?? 50}%`,
                            top: `${selectedLayer.y ?? 50}%`,
                            width: `${selectedWidth}%`,
                            height: `${selectedHeight}%`,
                            transform: `translate(-50%, -50%) rotate(${selectedLayer.rotation ?? 0}deg)`,
                            transformOrigin: selectedLayer.transformOrigin ?? '50% 50%',
                          }}
                        >
                          <div className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-100 shadow-[0_0_8px_#67e8f9]" />
                          <div
                            className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-fuchsia-100 bg-fuchsia-500 shadow-[0_0_10px_rgba(232,121,249,.9)]"
                            style={{ left: `${selectedOrigin.x}%`, top: `${selectedOrigin.y}%` }}
                          />
                          <div className="pointer-events-none absolute -top-7 right-0 whitespace-nowrap rounded-lg bg-cyan-950/90 px-2 py-1 text-[10px] font-black text-cyan-50">
                            {layerLabel(selectedLayer)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <MiniPreview mode="idle" />
                  <MiniPreview mode="run" />
                </div>
              </div>
            )}

            <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
              <label className="rounded-xl border border-white/10 bg-black/15 p-2 text-xs">
                <div className="mb-1 flex justify-between"><span>זום</span><span>{canvasZoom.toFixed(2)}×</span></div>
                <input
                  type="range"
                  min={0.6}
                  max={1.8}
                  step={0.05}
                  value={canvasZoom}
                  onChange={event => setCanvasZoom(Number(event.target.value))}
                  className="w-full accent-cyan-300"
                />
              </label>
              <button type="button" onClick={() => setShowGrid(value => !value)} className="rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-xs font-bold hover:bg-white/10">
                {showGrid ? '🟦 הסתר רשת' : '⬜ הצג רשת'}
              </button>
              <button type="button" onClick={() => setShowBounds(value => !value)} className="rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-xs font-bold hover:bg-white/10">
                {showBounds ? '📐 הסתר מסגרת' : '📐 הצג מסגרת'}
              </button>
              <button type="button" onClick={undo} disabled={historyPast.length === 0} className="rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-xs font-bold hover:bg-white/10 disabled:opacity-40">
                ↶ Undo
              </button>
              <button type="button" onClick={redo} disabled={historyFuture.length === 0} className="rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-xs font-bold hover:bg-white/10 disabled:opacity-40">
                ↷ Redo
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-black">🏠 תצוגה בחדר האמיתי</div>
                <div className="text-xs text-slate-400">בדיקת תחושת גודל, קרקע/תעופה וקריאות על הרקע האמיתי.</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs font-black text-cyan-50">
                {movementProfile === 'ground' ? '🐾 Ground — אוטומטי' : '🪽 Flying — אוטומטי'}
              </div>
            </div>

            <div
              className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-cover bg-center shadow-2xl"
              style={{ backgroundImage: "url('/rooms/kingdom-room.png')" }}
            >
              <div
                className={`absolute h-28 w-28 sm:h-32 sm:w-32 ${movementProfile === 'flying' ? 'left-[62%] top-[31%]' : 'left-[56%] top-[77%]'}`}
                style={{ transform: 'translate(-50%, -100%)' }}
              >
                <AnimatedCompanionArt
                  art={previewArt}
                  alt="תצוגת חדר"
                  stage={stage}
                  motion={false}
                  activity="idle"
                />
                <div
                  className={`absolute left-1/2 -translate-x-1/2 rounded-[50%] bg-black/35 ${movementProfile === 'flying' ? '-bottom-6 h-2 w-16 opacity-35 blur-[3px]' : 'bottom-[7%] h-1.5 w-[62%] opacity-45 blur-[1.5px]'}`}
                />
              </div>
              <div className="absolute bottom-2 right-2 rounded-lg bg-slate-950/75 px-2 py-1 text-[10px] font-bold text-white/80 backdrop-blur">
                {movementProfile === 'ground' ? 'רצפה בלבד' : 'מרחב תעופה'}
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <div className="font-black text-cyan-100">כיוון שכבה</div>
                <div className="text-xs text-slate-400">{selectedLayer ? layerLabel(selectedLayer) : 'בחר שכבה'}</div>
              </div>
              {selectedLayer && (
                <button type="button" onClick={resetSelectedLayer} className="rounded-lg border border-white/10 px-2 py-1 text-[10px] font-bold hover:bg-white/10">
                  איפוס שכבה
                </button>
              )}
            </div>

            {!selectedLayer ? (
              <div className="rounded-xl border border-dashed border-white/15 p-4 text-center text-xs text-slate-400">בחר שכבה משמאל כדי להתחיל.</div>
            ) : (
              <div className="space-y-3">
                {counterpartLayer && (
                  <button
                    type="button"
                    onClick={() => setSelectedLayerId(counterpartLayer.id)}
                    className="w-full rounded-xl border border-violet-300/20 bg-violet-300/10 px-3 py-2 text-xs font-black text-violet-50 hover:bg-violet-300/20"
                  >
                    ⇄ עבור לבן הזוג: {layerLabel(counterpartLayer)}
                  </button>
                )}

                <NumericField label="X — מיקום אופקי" value={selectedLayer.x ?? 50} min={-30} max={130} step={0.1} onChange={value => updateLayer(selectedLayer.id, { x: value })} />
                <NumericField label="Y — מיקום אנכי" value={selectedLayer.y ?? 50} min={-30} max={130} step={0.1} onChange={value => updateLayer(selectedLayer.id, { y: value })} />
                <NumericField label="רוחב" value={selectedLayer.width ?? 100} min={2} max={160} step={0.1} onChange={value => updateLayer(selectedLayer.id, { width: value })} />
                <NumericField label="סיבוב" value={selectedLayer.rotation ?? 0} min={-180} max={180} step={0.5} onChange={value => updateLayer(selectedLayer.id, { rotation: value })} />
                <NumericField label="Z — קדימה / אחורה" value={selectedLayer.zIndex ?? 10} min={0} max={100} step={1} onChange={value => updateLayer(selectedLayer.id, { zIndex: Math.round(value) })} />

                <div className="rounded-xl border border-fuchsia-300/15 bg-fuchsia-300/5 p-3">
                  <div className="mb-2 text-xs font-black text-fuchsia-100">🎯 נקודת ציר</div>
                  <div className="space-y-3">
                    <NumericField label="ציר X" value={selectedOrigin.x} min={0} max={100} step={1} onChange={value => updateLayer(selectedLayer.id, { transformOrigin: formatOrigin({ ...selectedOrigin, x: value }) })} />
                    <NumericField label="ציר Y" value={selectedOrigin.y} min={0} max={100} step={1} onChange={value => updateLayer(selectedLayer.id, { transformOrigin: formatOrigin({ ...selectedOrigin, y: value }) })} />
                  </div>
                </div>

                <label className="block rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="mb-2 text-xs font-black">אנימציה</div>
                  <select
                    value={selectedLayer.animation ?? 'none'}
                    onChange={event => updateLayer(selectedLayer.id, { animation: event.target.value as CompanionLayerAnimation })}
                    className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-2 py-2 text-xs"
                  >
                    {ANIMATION_OPTIONS.map(animation => <option key={animation} value={animation}>{animation}</option>)}
                  </select>
                </label>

                <NumericField label="משך אנימציה (ms)" value={selectedLayer.animationDurationMs ?? 3000} min={200} max={10000} step={50} onChange={value => updateLayer(selectedLayer.id, { animationDurationMs: Math.round(value) })} />
                <NumericField label="השהיה (ms)" value={selectedLayer.animationDelayMs ?? 0} min={-10000} max={5000} step={50} onChange={value => updateLayer(selectedLayer.id, { animationDelayMs: Math.round(value) })} />

                <label className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-xs font-bold">
                  <span>Mirror אופקי</span>
                  <input type="checkbox" checked={selectedLayer.flipX ?? false} onChange={event => updateLayer(selectedLayer.id, { flipX: event.target.checked })} className="h-4 w-4 accent-cyan-300" />
                </label>

                <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-[10px] leading-5 text-slate-400">
                  <div className="font-black text-slate-200">מקור</div>
                  <div className="break-all">{selectedLayer.src}</div>
                  <div className="mt-1">יחס תמונה: {selectedRatio.toFixed(2)}</div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-3">
              <div className="font-black text-amber-100">💾 שמירה וייצוא</div>
              <div className="text-xs text-slate-400">הטיוטה נשמרת מקומית אוטומטית.</div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-1">
              <button type="button" onClick={copyCode} disabled={currentLayers.length === 0} className="rounded-xl bg-cyan-500/20 px-3 py-2 text-xs font-black text-cyan-50 ring-1 ring-cyan-300/30 hover:bg-cyan-500/30 disabled:opacity-40">
                📋 העתק קוד
              </button>
              <button type="button" onClick={downloadRig} disabled={currentLayers.length === 0} className="rounded-xl bg-violet-500/20 px-3 py-2 text-xs font-black text-violet-50 ring-1 ring-violet-300/30 hover:bg-violet-500/30 disabled:opacity-40">
                📦 הורד ריג JSON
              </button>
              <button type="button" onClick={resetForm} disabled={currentLayers.length === 0} className="rounded-xl border border-red-300/20 bg-red-400/10 px-3 py-2 text-xs font-black text-red-100 hover:bg-red-400/20 disabled:opacity-40">
                ♻️ איפוס צורה
              </button>
            </div>

            <textarea readOnly value={codeText} className="mt-3 h-48 w-full resize-y rounded-xl border border-white/10 bg-slate-950/70 p-3 text-left font-mono text-[10px] leading-5 text-slate-200 outline-none" dir="ltr" />

            <div className="mt-3 rounded-xl border border-amber-200/10 bg-amber-100/5 p-3 text-[10px] leading-5 text-amber-50/75">
              אין כתיבה ל־Supabase. כפתור JSON שומר גם Ground/Flying כדי שאפשר יהיה להעביר לי ריג שלם בלי לאבד מידע.
            </div>
          </div>
        </aside>
      </main>

      {message && (
        <div className="fixed bottom-5 left-1/2 z-[2000] -translate-x-1/2 rounded-full border border-cyan-200/30 bg-slate-950/95 px-5 py-3 text-sm font-black text-cyan-50 shadow-2xl">
          {message}
        </div>
      )}
    </div>
  );
}
