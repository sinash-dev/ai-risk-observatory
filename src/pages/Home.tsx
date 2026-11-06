import { motion } from 'framer-motion';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Num } from '../components/ui';
import { Ring } from '../components/model/Panels';
import { TODAY, parseDate } from '../components/Timeline';
import { STATIC_PAGES } from '../data/routes';
import { SceneShell, useOnScreen } from '../three/SceneShell';
import type { UniverseNode } from '../three/Universe';
import { prefersReducedMotion, useProgress } from '../lib/util';
import { FRAMEWORKS, FW_BY_ID, fwName, type FwId } from '../data/frameworks';
import { LABS, fwEntry } from '../data/labs';
import { TIERS, TIER_BY_ID } from '../data/risks';
import type { LabDef } from '../data/types';
import { useLens } from '../lib/lens';
import { go, useClock, url } from '../lib/util';

export { SHORT_NAME } from '../data/shortNames';
import { SHORT_NAME } from '../data/shortNames';

const W = 1100, H = 640, CX = 550, CY = 320;
const RX = [165, 285, 395, 500];
const SPEED = [0.07, 0.05, 0.036, 0.026];

export function colourFor(lab: LabDef, lens: FwId | 'all') {
  if (lens === 'all') return { c: TIER_BY_ID[lab.tier].color, status: TIER_BY_ID[lab.tier].label };
  const e = fwEntry(lens, lab.id);
  const cat = FW_BY_ID[lens].cats.find((x) => x.id === e.cat)!;
  return { c: cat.color, status: e.status };
}

/** Rotating, tilting orbit of all models. Hover pauses; mouse height tilts the rings. */
function Orbit() {
  const lens = useLens();
  const [hover, setHover] = useState<string | null>(null);
  const [tilt, setTilt] = useState(0.5);
  const [box, onScreen] = useOnScreen<HTMLDivElement>();
  const t = useClock(onScreen && !prefersReducedMotion());
  const frozen = useRef({ at: 0, off: 0 });
  if (hover && !frozen.current.at) frozen.current.at = t || 0.0001;
  if (!hover && frozen.current.at) { frozen.current.off += t - frozen.current.at; frozen.current.at = 0; }
  const time = (hover ? frozen.current.at : t) - frozen.current.off;
  const ry = 0.32 + tilt * 0.34;

  const pos = (lab: LabDef) => {
    const ti = TIER_BY_ID[lab.tier].ring - 1;
    const peers = LABS.filter((l) => l.tier === lab.tier);
    const k = peers.indexOf(lab);
    const a = (k / peers.length) * Math.PI * 2 + ti * 0.7 + time * SPEED[ti];
    const depth = (Math.sin(a) + 1) / 2;
    return { x: CX + Math.cos(a) * RX[ti], y: CY + Math.sin(a) * RX[ti] * ry, depth };
  };
  const nodes = LABS.map((l) => ({ l, p: pos(l) })).sort((a, b) => a.p.depth - b.p.depth);
  const hl = hover ? nodes.find((n) => n.l.id === hover) : null;

  return (
    <div ref={box} className="map-wrap" onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setTilt(Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))); }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="viz-svg" role="img" aria-label="All models orbiting from classical machine learning in the centre to AI agents at the edge">
        <defs>
          <radialGradient id="core"><stop offset="0" stopColor="#ffffff" stopOpacity=".55" /><stop offset=".35" stopColor="#6cc5b0" stopOpacity=".18" /><stop offset="1" stopColor="#6cc5b0" stopOpacity="0" /></radialGradient>
          <filter id="soft"><feGaussianBlur stdDeviation="1.2" /></filter>
        </defs>
        <ellipse cx={CX} cy={CY} rx={130} ry={130 * ry} fill="url(#core)" />
        {TIERS.map((tr, i) => (
          <ellipse key={tr.id} cx={CX} cy={CY} rx={RX[i]} ry={RX[i] * ry} fill="none" stroke={lens === 'all' ? tr.color : '#ffffff'} strokeOpacity={lens === 'all' ? 0.28 : 0.1} strokeWidth="1.2" strokeDasharray="3 6" />
        ))}
        <circle cx={CX} cy={CY} r="5" fill="#fff" opacity=".85" />
        {nodes.map(({ l, p }) => {
          const { c } = colourFor(l, lens);
          const on = hover === l.id;
          const s = 0.72 + p.depth * 0.38;
          const r = (on ? 24 : 19) * s;
          const showLabel = on || p.depth > 0.32;
          return (
            <g key={l.id} style={{ cursor: 'pointer' }} opacity={on ? 1 : 0.38 + p.depth * 0.62} onMouseEnter={() => setHover(l.id)} onMouseLeave={() => setHover(null)} onClick={() => go(`/model/${l.id}`)}>
              <ellipse cx={p.x} cy={p.y + r + 6} rx={r * 0.9} ry={r * 0.22} fill="#000" opacity={0.35 * p.depth} filter="url(#soft)" />
              <circle cx={p.x} cy={p.y} r={r} fill="#14171c" stroke={c} strokeWidth={on ? 2.6 : 1.8} />
              <circle cx={p.x} cy={p.y} r={r} fill={c} opacity={lens === 'all' ? 0.08 : 0.28} />
              <circle cx={p.x - r * 0.3} cy={p.y - r * 0.35} r={r * 0.35} fill="#fff" opacity=".06" />
              <text x={p.x} y={p.y + 4 * s} textAnchor="middle" fontSize={11.5 * s} fontWeight={700} fill={c} fontFamily="Sora Variable, Sora, sans-serif" style={{ pointerEvents: 'none' }}>{l.glyph}</text>
              {showLabel && <text x={p.x} y={p.y + r + 16} textAnchor="middle" fontSize={12 * s} fill="#c8ccd3" stroke="#0c0e11" strokeWidth="4" style={{ paintOrder: 'stroke', pointerEvents: 'none' }}>{SHORT_NAME[l.id]}</text>}
            </g>
          );
        })}
      </svg>
      {hl && (
        <div className="tooltip" style={{ left: `min(calc(${(hl.p.x / W) * 100}% + 28px), calc(100% - 280px))`, top: `${(hl.p.y / H) * 100}%`, transform: 'translateY(-50%)' }}>
          <div style={{ fontWeight: 700 }}>{hl.l.model}</div>
          <div className="muted small">Example: {hl.l.app}</div>
          <div className="small" style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'baseline' }}><span className="swatch" style={{ background: colourFor(hl.l, lens).c }} />{colourFor(hl.l, lens).status}</div>
          <div className="dim small" style={{ marginTop: 6 }}>Click to open the simulation</div>
        </div>
      )}
      <div className="dim small" style={{ textAlign: 'center', marginTop: -8 }}>Hover a model to pause. Move your mouse up or down to tilt the view.</div>
    </div>
  );
}

const PURPOSES = [
  { t: 'Learn one framework properly', d: 'Pick it under “View through”. The map, every example and every requirement switch to that framework. Then follow its learning path.', href: url('/rules'), cta: 'Choose a framework' },
  { t: 'Compare frameworks on a topic', d: 'How do the frameworks treat transparency, human oversight or bias? See it side by side in a strength grid and radar chart.', href: url('/compare'), cta: 'Open the comparison' },
  { t: 'See how a model fails', d: 'Pick any example below, switch on a problem, then add a safeguard and see whether it helps.', href: url('/model/credit'), cta: 'Start with credit scoring' },
  { t: 'Run a training session', d: 'A ready-made 60-minute workshop plan, plus a primer on how models work and where risk comes from.', href: url('/basics'), cta: 'Open the basics' },
];

function Icon({ i }: { i: number }) {
  const p = [
    <path key="a" d="M4 6h16M4 12h10M4 18h7" />,
    <path key="b" d="M5 19V9m7 10V5m7 14v-7" />,
    <path key="c" d="M12 3l9 16H3z M12 10v4 M12 17h.01" />,
    <path key="d" d="M4 5h16v11H4z M8 20h8 M12 16v4" />,
  ][i];
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{p}</svg>;
}

function Row({ lab, lens, explored }: { lab: LabDef; lens: FwId | 'all'; explored?: boolean }) {
  const e = lens === 'all' ? null : fwEntry(lens, lab.id);
  const cat = e ? FW_BY_ID[lens as FwId].cats.find((c) => c.id === e.cat) : null;
  return (
    <a href={url(`/model/${lab.id}`)} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 16, padding: '12px 18px', borderTop: '1px solid var(--line)', color: 'inherit' }} className="row-link">
      <span><span style={{ fontWeight: 700 }}>{lab.model}</span><span className="muted"> · {lab.app}</span>{explored && <span className="done-badge" title="Explored" aria-label="Explored">✓</span>}</span>
      {cat ? <span className="tag"><span className="swatch" style={{ background: cat.color }} />{cat.label}</span> : <span className="dim small">→</span>}
    </a>
  );
}

export function Home() {
  const lens = useLens();
  const fw = lens === 'all' ? null : FW_BY_ID[lens];
  const groups = fw
    ? fw.cats.map((c) => ({ key: c.id, title: c.label, color: c.color, desc: c.desc, labs: LABS.filter((l) => fwEntry(fw.id, l.id).cat === c.id) })).filter((g) => g.labs.length)
    : TIERS.map((t) => ({ key: t.id, title: t.label, color: t.color, desc: t.tagline, labs: LABS.filter((l) => l.tier === t.id) }));
  const progress = useProgress();
  const nodes: UniverseNode[] = useMemo(() => LABS.map((l) => {
    const c = colourFor(l, lens);
    return { id: l.id, ring: TIER_BY_ID[l.tier].ring - 1, glyph: l.glyph, title: l.model, app: l.app, short: SHORT_NAME[l.id], color: c.c, status: c.status, tierColor: TIER_BY_ID[l.tier].color, explored: !!progress.labs?.[l.id] };
  }), [lens, progress]);
  const pick = useCallback((id: string) => go(`/model/${id}`), []);
  const sceneProps = useMemo(() => ({ nodes, rings: TIERS.map((t) => (lens === 'all' ? t.color : '#8a919c')), onPick: pick }), [nodes, lens, pick]);
  const exploredN = LABS.filter((l) => progress.labs?.[l.id]).length;
  const cases = LABS.reduce((n, l) => n + l.incidents.length, 0);
  const upcoming = FRAMEWORKS.flatMap((f) => f.timeline.map((e) => ({ f, e, y: parseDate(e.date) }))).filter((x) => x.y > TODAY).sort((a, b) => a.y - b.y);
  const hasClassify = STATIC_PAGES.some((p) => p.path === '/classify');
  return (
    <div>
      <section className="hero">
        <div className="wrap hero-grid">
          <motion.div className="hero-text stack" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="eyebrow">{fw ? `Viewing through: ${fw.short}` : 'AI Risk Explorer'}</div>
            <h1>{fw ? `${LABS.length} AI systems, seen through ${fwName(fw.id)}` : 'Every AI system fails in its own way. Here is how, and what the rules expect you to do about it.'}</h1>
            {fw ? (
              <p className="lead">{fw.intro.split('. ').slice(0, 2).join('. ')}. Each model is coloured by how {fwName(fw.id)} treats it. <a href={url(`/rules/${fw.id}`)}>Open the full guide</a>, including a learning path through these examples.</p>
            ) : (
              <p className="lead">{LABS.length} real uses of AI, from a spam filter to a team of buying agents. Each one runs as a small simulation you can break and repair. {FRAMEWORKS.length} governance frameworks, from the EU AI Act to China’s and Korea’s rules, are mapped onto every one of them.</p>
            )}
            <div className="hero-ctas">
              <a className="btn btn-primary" href={url('/model/credit')}>Start with credit scoring</a>
              {hasClassify ? <a className="btn" href={url('/classify')}>Classify your system</a> : <a className="btn" href={url('/compare')}>Compare frameworks</a>}
            </div>
            <dl className="hero-stats">
              <div><dt>examples</dt><dd><Num v={LABS.length} /></dd></div>
              <div><dt>frameworks</dt><dd><Num v={FRAMEWORKS.length} /></dd></div>
              <div><dt>real cases</dt><dd><Num v={cases} /></dd></div>
              <div><dt>upcoming deadlines</dt><dd><Num v={upcoming.length} /></dd></div>
            </dl>
            <div className="explored-row">
              <Ring n={exploredN} total={LABS.length} size={42} />
              <span className="small muted">{exploredN ? `${exploredN} of ${LABS.length} explored. Switch on a problem and a safeguard in any example to count it.` : 'Your progress shows here: switch on a problem and a safeguard in any example.'}</span>
            </div>
          </motion.div>
          <div className="hero-map" data-tour="orbit">
            <a className="sr-only skip-map" href="#all-examples">Skip the 3D map</a>
            <div className="hero-legend" aria-hidden>
              {fw
                ? fw.cats.map((c) => { const n = LABS.filter((l) => fwEntry(fw.id, l.id).cat === c.id).length; return n ? <span key={c.id}><span className="swatch" style={{ background: c.color }} />{c.label} ({n})</span> : null; })
                : TIERS.map((t, i) => <span key={t.id}><span className="swatch" style={{ background: t.color }} />{['Inner', 'Second', 'Third', 'Outer'][i]} ring: {t.label}</span>)}
            </div>
            <SceneShell
              className="universe"
              height="clamp(380px, 44vw, 560px)"
              load={() => import('../three/Universe')}
              props={sceneProps}
              fallback={<div className="scroll-x" tabIndex={0} role="region" aria-label="Model map, scrolls sideways"><div style={{ minWidth: 760 }}><Orbit /></div></div>}
            />
          </div>
        </div>
        {upcoming.length > 0 && (
          <div className="wrap">
            <div className="ticker" role="region" aria-label="Upcoming deadlines">
              <span className="ticker-l">Coming up</span>
              <ul>
                {upcoming.slice(0, 4).map(({ f, e }) => (
                  <li key={f.id + e.date + e.text}>
                    <a href={url(`/rules/${f.id}`)}><span className="mono ticker-d">{e.date}</span> <b>{f.short}</b> <span className="muted">{e.text}</span></a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      {!fw && (
        <section className="wrap section">
          <h2>What do you want to do?</h2>
          <div className="grid4" style={{ marginTop: 20 }}>
            {PURPOSES.map((p, i) => (
              <motion.a key={p.t} href={p.href} className="card card-pad lift" style={{ color: 'inherit', display: 'flex', flexDirection: 'column', gap: 10 }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Icon i={i} />
                <h3>{p.t}</h3>
                <p className="muted small" style={{ flex: 1 }}>{p.d}</p>
                <span className="accent small" style={{ fontWeight: 700 }}>{p.cta} →</span>
              </motion.a>
            ))}
          </div>
        </section>
      )}

      <section className="wrap section" id="all-examples" tabIndex={-1}>
        <h2>{fw ? `Grouped by category under ${fwName(fw.id)}` : `All ${LABS.length} examples, by type of model`}</h2>
        <p className="muted" style={{ marginTop: 6, marginBottom: 20 }}>Every example opens a simulation and shows how the rules apply to it.</p>
        <div className="grid2" style={{ alignItems: 'start' }}>
          {groups.map((g, i) => (
            <motion.div key={g.key} data-tour={i === 0 ? 'model-card' : undefined} className="card" style={{ overflow: 'hidden' }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 2) * 0.08 }}>
              <div style={{ padding: '18px 18px 14px', display: 'flex', gap: 12 }}>
                <span className="swatch" style={{ background: g.color, width: 10, height: 10, marginTop: 7 }} />
                <div>
                  <h3>{g.title}</h3>
                  <p className="muted small" style={{ marginTop: 4 }}>{g.desc}</p>
                </div>
              </div>
              {g.labs.map((l) => <Row key={l.id} lab={l} lens={lens} explored={!!progress.labs?.[l.id]} />)}
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
