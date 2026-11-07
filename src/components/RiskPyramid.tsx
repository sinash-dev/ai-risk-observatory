/**
 * The EU AI Act risk pyramid: 3D on capable screens, a flat SVG everywhere else,
 * plus a text panel that carries all the information (the drawing is decoration on top).
 */
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useMemo, useState } from 'react';
import { EU_TIERS, TIER_BY_KEY, type TierKey } from '../data/euTiers';
import { SceneShell } from '../three/SceneShell';
import { url } from '../lib/util';

const N = EU_TIERS.length;
function trap(i: number, cx: number, w: number, top: number, h: number, gap: number) {
  const tw = (w * (i + 0.2)) / N, bw = (w * (i + 1)) / N;
  const y0 = top + i * (h + gap), y1 = y0 + h;
  return { pts: `${cx - tw / 2},${y0} ${cx + tw / 2},${y0} ${cx + bw / 2},${y1} ${cx - bw / 2},${y1}`, y: (y0 + y1) / 2, right: cx + bw / 2 };
}

/** Flat pyramid. With `labels`, names sit to the right; with `onSelect`, levels are clickable (the panel buttons remain the accessible control). */
export function PyramidSvg({ selected, onSelect, labels = false, className }: { selected?: TierKey | null; onSelect?: (k: TierKey) => void; labels?: boolean; className?: string }) {
  const W = labels ? 520 : 200, cx = labels ? 150 : 100, w = labels ? 270 : 180, h = labels ? 52 : 30, gap = labels ? 7 : 4, top = 8;
  const H = top * 2 + N * h + (N - 1) * gap;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden="true" focusable="false">
      {EU_TIERS.map((t, i) => {
        const g = trap(i, cx, w, top, h, gap);
        const on = selected === t.key;
        const dim = selected != null && !on;
        return (
          <g key={t.key} onClick={onSelect ? () => onSelect(t.key) : undefined} style={{ cursor: onSelect ? 'pointer' : undefined }}>
            <polygon points={g.pts} fill={t.color} opacity={dim ? 0.32 : 1} stroke={on ? '#ffffff' : 'none'} strokeWidth={on ? 2 : 0} strokeLinejoin="round" />
            {labels && (
              <>
                <line x1={g.right + 6} x2={300} y1={g.y} y2={g.y} stroke="rgba(255,255,255,.18)" strokeDasharray="2 4" />
                <text x={310} y={g.y - 4} className="pyr-svg-l" opacity={dim ? 0.6 : 1}>{t.label}</text>
                <text x={310} y={g.y + 14} className="pyr-svg-s">{t.rule}</text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Small marker: where one system sits, for result cards and the register. */
export function PyramidMini({ tier }: { tier: TierKey | null }) {
  if (!tier) return null;
  return (
    <span className="pyr-mini" role="img" aria-label={`EU AI Act risk level: ${TIER_BY_KEY[tier].label}`}>
      <PyramidSvg selected={tier} />
    </span>
  );
}

export interface PyramidExample { id: string; app: string; tier: TierKey }

export function RiskPyramid({ examples }: { examples: PyramidExample[] }) {
  const [sel, setSel] = useState<TierKey>('high');
  const counts = useMemo(() => Object.fromEntries(EU_TIERS.map((t) => [t.key, examples.filter((e) => e.tier === t.key).length])) as Record<TierKey, number>, [examples]);
  const onSelect = useCallback((k: TierKey) => setSel(k), []);
  const load = useCallback(() => import('../three/Pyramid'), []);
  const props = useMemo(() => ({ tiers: EU_TIERS, selected: sel, onSelect, counts }), [sel, onSelect, counts]);
  const t = TIER_BY_KEY[sel];
  const ex = examples.filter((e) => e.tier === sel);
  return (
    <div className="pyr">
      <div className="pyr-visual stage">
        <SceneShell className="pyr-scene" height="clamp(330px, 34vw, 420px)" load={load} props={props}
          fallback={<PyramidSvg labels selected={sel} onSelect={setSel} className="pyr-flat" />} />
        <p className="small muted pyr-hint">Higher up means more restrictions. Choose a level to see what it covers, when it applies and what it requires.</p>
      </div>
      <div className="pyr-panel">
        <div className="pyr-tabs" role="group" aria-label="Risk levels, from most to least restricted">
          {EU_TIERS.map((x) => (
            <button key={x.key} className={sel === x.key ? 'on' : ''} aria-pressed={sel === x.key} onClick={() => setSel(x.key)}>
              <span className="swatch" style={{ background: x.color }} />{x.label}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={sel} className="pyr-detail" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} aria-live="polite">
            <h3>{t.label}: {t.rule.toLowerCase()}</h3>
            <p className="pyr-when"><b>When:</b> {t.when}</p>
            <p className="muted">{t.covers}</p>
            <ul>{t.duties.map((d) => <li key={d}>{d}</li>)}</ul>
            <p className="small"><b>Fines:</b> {t.fine} <span className="muted">({t.refs})</span></p>
            {ex.length > 0 && <p className="small"><b>Examples here:</b> {ex.map((e, k) => <span key={e.id}>{k ? ' · ' : ''}<a href={url(`/model/${e.id}`)}>{e.app}</a></span>)}</p>}
          </motion.div>
        </AnimatePresence>
        <p className="small muted">General-purpose AI models, such as large language models, have their own set of duties since 2 August 2025, alongside the pyramid. For SMEs and start-ups each fine is capped at the lower of the two amounts; the same applies to small mid-cap companies, except for banned practices (Art. 99(6) and (6a)).</p>
      </div>
    </div>
  );
}
