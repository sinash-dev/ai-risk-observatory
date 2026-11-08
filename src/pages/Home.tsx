import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { UPDATES } from '../data/updates';
import { fmtDate } from '../data/site';
import { Ring } from '../components/model/Panels';
import { TODAY, parseDate } from '../components/Timeline';
import { SceneShell, useOnScreen } from '../three/SceneShell';
import type { UniverseNode } from '../three/Universe';
import { prefersReducedMotion, useProgress } from '../lib/util';
import { FRAMEWORKS, FW_BY_ID, fwName, type FwId } from '../data/frameworks';
import { LABS, fwEntry } from '../data/labs';
import { TIERS, TIER_BY_ID } from '../data/risks';
import { solid } from '../data/palette';
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
  // animate only on wider screens without reduced motion; on phones the map stays still (it re-renders every frame)
  const [wide] = useState(() => typeof matchMedia === 'undefined' || matchMedia('(min-width: 640px)').matches);
  const t = useClock(onScreen && wide && !prefersReducedMotion());
  const frozen = useRef({ at: 0, off: 0 });
  if (hover && !frozen.current.at) frozen.current.at = t || 0.0001;
  if (!hover && frozen.current.at) { frozen.current.off += t - frozen.current.at; frozen.current.at = 0; }
  const time = (hover ? frozen.current.at : t) - frozen.current.off;
  const ry = 0.32 + tilt * 0.34;
  // The drawing is W units wide but often shown at half that or less; scale the labels so they stay about 11 px on screen.
  const svgRef = useRef<SVGSVGElement>(null);
  const [lk, setLk] = useState(1);
  useEffect(() => {
    const el = svgRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => { const w = el.clientWidth; if (w) setLk(Math.min(3, Math.max(1, (11 * W) / (12 * w)))); });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
  // Label placement: nearest nodes first; a label is drawn only if its box clears the labels already placed
  // and stays inside the frame. The hovered node always gets its label.
  const labelled = new Set<string>();
  const boxes: { x0: number; x1: number; y0: number; y1: number }[] = [];
  // the centre of every dot (where its letters sit) is an obstacle too, so a name never hides another example
  const dots = nodes.map(({ l, p }) => { const r = (hover === l.id ? 24 : 19) * (0.72 + p.depth * 0.38) * 0.55; return { id: l.id, x0: p.x - r, x1: p.x + r, y0: p.y - r, y1: p.y + r }; });
  const front = [...nodes].sort((a, b) => b.p.depth - a.p.depth);
  if (hl) front.unshift(hl);
  for (const { l, p } of front) {
    if (labelled.has(l.id)) continue;
    const sc = 0.72 + p.depth * 0.38;
    const r = (hover === l.id ? 24 : 19) * sc;
    const w = SHORT_NAME[l.id].length * 7 * sc * lk + 6;
    const b = { x0: p.x - w / 2, x1: p.x + w / 2, y0: p.y + r + 2, y1: p.y + r + 6 + 16 * sc * lk };
    const inside = b.x0 >= 8 && b.x1 <= W - 8 && b.y1 <= H - 4;
    const apart = (o: typeof b) => b.x1 < o.x0 || b.x0 > o.x1 || b.y1 < o.y0 || b.y0 > o.y1;
    const clear = boxes.every(apart) && dots.every((d) => d.id === l.id || apart(d));
    if (hover === l.id || (inside && clear)) { labelled.add(l.id); boxes.push(b); }
  }

  return (
    <div ref={box} className="map-wrap" onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setTilt(Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))); }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="viz-svg" role="img" aria-label="All models orbiting from classical machine learning in the centre to AI agents at the edge">
        <defs>
          <radialGradient id="core"><stop offset="0" stopColor="#ffffff" stopOpacity=".55" /><stop offset=".35" stopColor="var(--accent)" stopOpacity=".18" /><stop offset="1" stopColor="var(--accent)" stopOpacity="0" /></radialGradient>
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
          const showLabel = labelled.has(l.id);
          return (
            <g key={l.id} style={{ cursor: 'pointer' }} opacity={on ? 1 : 0.38 + p.depth * 0.62} onMouseEnter={() => setHover(l.id)} onMouseLeave={() => setHover(null)} onClick={() => go(`/model/${l.id}`)}>
              <ellipse cx={p.x} cy={p.y + r + 6} rx={r * 0.9} ry={r * 0.22} fill="#000" opacity={0.35 * p.depth} filter="url(#soft)" />
              <circle cx={p.x} cy={p.y} r={r} fill="#14171c" stroke={c} strokeWidth={on ? 2.6 : 1.8} />
              <circle cx={p.x} cy={p.y} r={r} fill={c} opacity={lens === 'all' ? 0.08 : 0.28} />
              <circle cx={p.x - r * 0.3} cy={p.y - r * 0.35} r={r * 0.35} fill="#fff" opacity=".06" />
              <text x={p.x} y={p.y + 4 * s} textAnchor="middle" fontSize={11.5 * s} fontWeight={700} fill={c} fontFamily="Sora Variable, Sora, sans-serif" style={{ pointerEvents: 'none' }}>{l.glyph}</text>
              {showLabel && <text x={p.x} y={p.y + r + 4 + 11 * s * lk} textAnchor="middle" fontSize={12 * s * lk} fill="var(--ink2)" stroke="#0c0e11" strokeWidth={4 * lk} style={{ paintOrder: 'stroke', pointerEvents: 'none' }}>{SHORT_NAME[l.id]}</text>}
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
      <div className="dim small orbit-hint" style={{ textAlign: 'center', marginTop: -8 }}>Hover a model to pause. Move your mouse up or down to tilt the view.</div>
    </div>
  );
}

const PURPOSES = [
  { t: 'Learn one framework properly', d: 'Read a guide to one law or standard: who it applies to, what it asks for and when. Then follow its learning path through the examples.', href: url('/rules'), cta: 'Choose a framework', icon: 0 },
  { t: 'Compare frameworks on a topic', d: 'How do the frameworks treat transparency, human oversight or bias? See them side by side in a strength grid and radar chart.', href: url('/compare'), cta: 'Open the comparison', icon: 1 },
  { t: 'Run a training session', d: 'Presenter slides for a 60-minute hands-on workshop, with notes for you, and team plans that keep a record of who completed what.', href: url('/workshop'), cta: 'Open the slides', icon: 3 },
];

/** the three steps of the main journey */
const HOW = [
  { t: 'List', d: 'Add each AI tool your organisation builds or uses to your register. It stays in your browser.', to: '/register' },
  { t: 'Classify', d: 'Answer a few questions about a tool and see where it falls under the EU AI Act and the other rules where you operate.', to: '/classify' },
  { t: 'Report', d: 'Export a report for your manager, then use the templates for the documents each risk level asks for.', to: '/toolkit' },
];

const COUNT_WORD: Record<number, string> = { 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 11: 'eleven', 12: 'twelve' };

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
    return { id: l.id, ring: TIER_BY_ID[l.tier].ring - 1, glyph: l.glyph, title: l.model, app: l.app, short: SHORT_NAME[l.id], color: solid(c.c), status: c.status, tierColor: solid(TIER_BY_ID[l.tier].color), explored: !!progress.labs?.[l.id] };
  }), [lens, progress]);
  const pick = useCallback((id: string) => go(`/model/${id}`), []);
  const sceneProps = useMemo(() => ({ nodes, rings: TIERS.map((t) => (lens === 'all' ? solid(t.color) : '#8a919c')), onPick: pick }), [nodes, lens, pick]);
  const exploredN = LABS.filter((l) => progress.labs?.[l.id]).length;
  const cases = LABS.reduce((n, l) => n + l.incidents.length, 0);
  const upcoming = FRAMEWORKS.flatMap((f) => f.timeline.map((e) => ({ f, e, y: parseDate(e.date) }))).filter((x) => x.y > TODAY).sort((a, b) => a.y - b.y);
  return (
    <div>
      <section className="hero">
        <div className="wrap hero-grid">
          <motion.div className="hero-text stack" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="eyebrow">{fw ? `Viewing through: ${fw.short}` : 'AI Risk Explorer'}</div>
            <h1 className="hero-h1">{fw ? `${LABS.length} AI systems, seen through ${fwName(fw.id)}` : 'Find out which AI rules apply to you, and what to do about them.'}</h1>
            {fw ? (
              <p className="lead">{fw.intro.split('. ').slice(0, 2).join('. ')}. Each example is coloured by how {fwName(fw.id)} treats it. <a href={url(`/rules/${fw.id}`)}>Open the full guide</a>, including a learning path through these examples.</p>
            ) : (
              <p className="lead">Made for whoever has just been handed AI compliance. List your AI tools, see how the EU AI Act and {COUNT_WORD[FRAMEWORKS.length - 1] ?? FRAMEWORKS.length - 1} other frameworks treat each one, and leave with a report you can give your manager.</p>
            )}
            <div className="hero-ctas">
              <a className="btn btn-primary" href={url('/register')}>Check your first AI system</a>
              <a className="btn" href={url('/model/credit')} data-tour="model-card">See how an AI system fails (5 minutes)</a>
            </div>
            <p className="small muted hero-counts">{LABS.length} worked examples. {FRAMEWORKS.length} frameworks. {cases} real cases.</p>
            {!fw && <p className="hero-start"><a href={url('/start')}>Teaching, building or studying AI? Start here</a></p>}
          </motion.div>
          <figure className="hero-figure">
            <div className="hero-legend" aria-hidden>
              {fw
                ? fw.cats.map((c) => { const n = LABS.filter((l) => fwEntry(fw.id, l.id).cat === c.id).length; return n ? <span key={c.id}><span className="swatch" style={{ background: c.color }} />{c.label} ({n})</span> : null; })
                : TIERS.map((t, i) => <span key={t.id}><span className="swatch" style={{ background: t.color }} />{['Inner', 'Second', 'Third', 'Outer'][i]} ring: {t.label}</span>)}
            </div>
            <div className="hero-map stage" data-tour="orbit">
              <a className="sr-only skip-map" href="#all-examples">Skip the 3D map</a>
              <SceneShell
                className="universe"
                height="clamp(380px, 44vw, 560px)"
                load={() => import('../three/Universe')}
                props={sceneProps}
                fallback={<div className="orbit-fit"><Orbit /></div>}
              />
            </div>
            <figcaption className="small muted hero-caption">Each dot is a working example. Pick one to break it and repair it.</figcaption>
            <div className="explored-row">
              <Ring n={exploredN} total={LABS.length} size={42} />
              <span className="small muted">{exploredN ? `${exploredN} of ${LABS.length} explored. Switch on a problem and a safeguard in any example to count it.` : 'Your progress shows here: switch on a problem and a safeguard in any example.'}</span>
            </div>
          </figure>
        </div>
      </section>

      {!fw && (
        <section className="wrap section how" aria-labelledby="how-h">
          <h2 id="how-h">How it works</h2>
          <ol className="how-steps">
            {HOW.map((h, i) => (
              <li key={h.t}>
                <a href={url(h.to)} className="card card-pad lift how-step">
                  <span className="how-n" aria-hidden>{i + 1}</span>
                  <span><b>{h.t}</b><span className="muted small" style={{ display: 'block', marginTop: 4 }}>{h.d}</span></span>
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}

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

      {!fw && (
        <section className="wrap section">
          <h2>What do you want to do?</h2>
          <div className="grid3" style={{ marginTop: 20 }}>
            {PURPOSES.map((p, i) => (
              <motion.a key={p.t} href={p.href} className="card card-pad lift" style={{ color: 'inherit', display: 'flex', flexDirection: 'column', gap: 10 }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Icon i={p.icon} />
                <h3>{p.t}</h3>
                <p className="muted small" style={{ flex: 1 }}>{p.d}</p>
                <span className="accent small" style={{ fontWeight: 700 }}>{p.cta} →</span>
              </motion.a>
            ))}
          </div>
        </section>
      )}

      <section className="wrap news-strip" aria-label="What’s new">
        <div className="news-strip-h"><span className="eyebrow">What’s new</span><a className="small" href={url('/updates')}>All updates →</a></div>
        <div className="grid2">
          {UPDATES.slice(0, 2).map((u) => (
            <a key={u.title} className="card card-pad lift" href={url(u.links?.[0]?.to ?? '/updates')} style={{ color: 'inherit' }}>
              <span className="mono small accent">{fmtDate(u.date)}</span>
              <b style={{ display: 'block', marginTop: 4 }}>{u.title}</b>
            </a>
          ))}
        </div>
      </section>

      <section className="wrap section" id="all-examples" tabIndex={-1}>
        <details className="all-ex" open={!!fw}>
          <summary><h2>{fw ? `All ${LABS.length} examples, grouped by category under ${fwName(fw.id)}` : `Browse all ${LABS.length} examples as a list`}</h2></summary>
          <p className="muted" style={{ marginTop: 6, marginBottom: 20 }}>Every example opens a simulation and shows how the rules apply to it.</p>
          <div className="grid2" style={{ alignItems: 'start' }}>
            {groups.map((g, i) => (
              <motion.div key={g.key} className="card" style={{ overflow: 'hidden' }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 2) * 0.08 }}>
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
        </details>
      </section>
    </div>
  );
}
