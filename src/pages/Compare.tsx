import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { COMPARE, TOPICS } from '../data/compare';
import { FRAMEWORKS, FW_BY_ID, type FwId } from '../data/frameworks';
import { useInView, useTweenArray } from '../lib/util';

const LEVEL = ['Not addressed', 'Guidance only', 'Required in some cases', 'Detailed binding rule'];
const SERIES = ['#6cc5b0', '#e0b25c', '#a99be0', '#e0896b'];
const SHORT: Record<string, string> = { transparency: 'Transparency', oversight: 'Human oversight', fairness: 'Fairness', risk: 'Risk assessment', data: 'Data & privacy', genai: 'Generative AI', incidents: 'Monitoring', enforcement: 'Enforcement' };

function Bars({ lv, delay = 0, seen = true }: { lv: number; delay?: number; seen?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', gap: 3, alignItems: 'flex-end', height: 18 }} title={LEVEL[lv]}>
      {[1, 2, 3].map((i) => (
        <motion.span key={i} initial={{ scaleY: 0 }} animate={seen ? { scaleY: 1 } : {}} transition={{ delay: delay + i * 0.05, type: 'spring', stiffness: 260, damping: 18 }}
          style={{ width: 6, height: 5 + i * 4, borderRadius: 2, transformOrigin: 'bottom', background: i <= lv ? '#6cc5b0' : 'rgba(255,255,255,.1)' }} />
      ))}
    </span>
  );
}

/** Grid: topics × frameworks. Tilts in from 3D, then lies flat so nothing overlaps. */
function Grid({ topic, setTopic, fwHi }: { topic: string; setTopic: (t: string) => void; fwHi?: FwId }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  const [hover, setHover] = useState<{ t: string; f: FwId } | null>(null);
  const hv = hover ? COMPARE[hover.t][hover.f] : null;
  const cols = `200px repeat(${FRAMEWORKS.length}, minmax(64px, 1fr))`;
  return (
    <div ref={ref} style={{ perspective: 1200 }}>
      <motion.div initial={{ rotateX: 38, opacity: 0, y: 40 }} animate={seen ? { rotateX: 0, opacity: 1, y: 0 } : {}} transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }} style={{ transformOrigin: '50% 0%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 4, minWidth: 900 }}>
          <div />
          {FRAMEWORKS.map((f) => {
            const on = f.id === fwHi || hover?.f === f.id;
            return (
              <a key={f.id} href={`#/rules/${f.id}`} style={{ textAlign: 'center', fontSize: 12.5, fontWeight: 700, padding: '6px 2px 10px', color: on ? 'var(--accent)' : 'var(--ink2)', lineHeight: 1.25 }}>{f.short}</a>
            );
          })}
          {TOPICS.map((t, r) => {
            const rowOn = t.id === topic || hover?.t === t.id;
            return (
              <div key={t.id} style={{ display: 'contents' }}>
                <button onClick={() => setTopic(t.id)} style={{ textAlign: 'left', background: 'none', border: 'none', padding: '0 10px 0 0', fontWeight: 700, fontSize: 14, color: rowOn ? 'var(--accent)' : 'var(--ink2)' }}>
                  {t.label}
                </button>
                {FRAMEWORKS.map((f, c) => {
                  const [lv] = COMPARE[t.id][f.id];
                  const isH = hover?.t === t.id && hover?.f === f.id;
                  const lit = rowOn || f.id === fwHi || hover?.f === f.id;
                  return (
                    <button key={f.id} onMouseEnter={() => setHover({ t: t.id, f: f.id })} onMouseLeave={() => setHover(null)} onClick={() => setTopic(t.id)}
                      style={{ height: 50, borderRadius: 10, border: `1px solid ${isH ? 'var(--accent)' : t.id === topic ? 'rgba(108,197,176,.35)' : 'var(--line)'}`, background: `rgba(108,197,176,${0.03 + lv * 0.07})`, opacity: hover ? (lit ? 1 : 0.45) : 1, display: 'grid', placeItems: 'center', transition: 'opacity .25s, border-color .2s, transform .2s', transform: isH ? 'translateY(-2px)' : 'none' }}
                      aria-label={`${t.label}, ${f.short}: ${LEVEL[lv]}`}>
                      <Bars lv={lv} delay={0.5 + (r + c) * 0.025} seen={seen} />
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </motion.div>
      <div style={{ minHeight: 76, marginTop: 14, padding: '12px 14px', borderRadius: 12, border: '1px solid var(--line)', background: 'rgba(255,255,255,.02)' }}>
        {hover && hv ? (
          <>
            <div className="small"><b>{FW_BY_ID[hover.f].short}</b> <span className="muted">on</span> <b>{TOPICS.find((x) => x.id === hover.t)!.label}</b> · <span className="accent">{LEVEL[hv[0]]}</span></div>
            <div className="muted small" style={{ marginTop: 4 }}>{hv[1]}</div>
          </>
        ) : (
          <div className="dim small">Hover any cell to read that framework’s answer here. Click a cell or a row name to open the topic below.</div>
        )}
      </div>
    </div>
  );
}

/** Radar overlay of selected frameworks across all eight topics. */
function RadarShape({ fw, color, cx, cy, R }: { fw: FwId; color: string; cx: number; cy: number; R: number }) {
  const vals = useTweenArray(TOPICS.map((t) => COMPARE[t.id][fw][0]), 0.1);
  const pts = vals.map((v, i) => {
    const a = (i / TOPICS.length) * Math.PI * 2 - Math.PI / 2;
    const rr = (R * Math.max(0.06, v)) / 3;
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  });
  return (
    <g>
      <polygon points={pts.map((p) => p.join(',')).join(' ')} fill={color} fillOpacity=".14" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3.6" fill={color} stroke="#14171c" strokeWidth="1.5" />)}
    </g>
  );
}

function Radar({ initial }: { initial: FwId[] }) {
  const [sel, setSel] = useState<FwId[]>(initial);
  const toggle = (f: FwId) => setSel((s) => (s.includes(f) ? s.filter((x) => x !== f) : s.length >= 4 ? [...s.slice(1), f] : [...s, f]));
  const Wd = 720, Hd = 540, c = Hd / 2, cxx = Wd / 2, R = 200;
  const ang = (i: number) => (i / TOPICS.length) * Math.PI * 2 - Math.PI / 2;
  return (
    <div className="grid2 radar-grid" style={{ alignItems: 'center' }}>
      <style>{'@media (min-width: 961px){.radar-grid{grid-template-columns:minmax(0,1.2fr) minmax(0,1fr) !important}}'}</style>
      <svg viewBox={`0 0 ${Wd} ${Hd}`} className="viz-svg" style={{ maxWidth: 760, margin: '0 auto' }}>
        {[1, 2, 3].map((lv) => (
          <polygon key={lv} points={TOPICS.map((_, i) => `${cxx + Math.cos(ang(i)) * (R * lv) / 3},${c + Math.sin(ang(i)) * (R * lv) / 3}`).join(' ')} fill="none" stroke="rgba(255,255,255,.1)" strokeDasharray={lv < 3 ? '3 5' : undefined} />
        ))}
        {TOPICS.map((t, i) => (
          <g key={t.id}>
            <line x1={cxx} y1={c} x2={cxx + Math.cos(ang(i)) * R} y2={c + Math.sin(ang(i)) * R} stroke="rgba(255,255,255,.08)" />
            <text x={cxx + Math.cos(ang(i)) * (R + 24)} y={c + Math.sin(ang(i)) * (R + 24) + 4} textAnchor={Math.abs(Math.cos(ang(i))) < 0.2 ? 'middle' : Math.cos(ang(i)) > 0 ? 'start' : 'end'} fontSize="15" fill="#c8ccd3" fontWeight={600}>{SHORT[t.id]}</text>
          </g>
        ))}
        {[1, 2, 3].map((lv) => <text key={lv} x={cxx + 8} y={c - (R * lv) / 3 + 14} fontSize="10" fill="#5c626c" fontFamily="IBM Plex Mono">{['', 'guidance', 'some cases', 'binding'][lv]}</text>)}
        {sel.map((f, i) => <RadarShape key={f} fw={f} color={SERIES[i]} cx={cxx} cy={c} R={R} />)}
      </svg>
      <div>
        <div className="label" style={{ marginBottom: 10 }}>Pick up to four frameworks</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {FRAMEWORKS.map((f) => {
            const i = sel.indexOf(f.id);
            const on = i >= 0;
            return (
              <button key={f.id} onClick={() => toggle(f.id)} className="tag" style={{ cursor: 'pointer', padding: '6px 12px', borderColor: on ? SERIES[i] : 'var(--line)', color: on ? '#eceef1' : 'var(--muted)', background: on ? `${SERIES[i]}22` : 'transparent' }}>
                <span className="swatch" style={{ background: on ? SERIES[i] : 'rgba(255,255,255,.15)' }} />{f.short}
              </button>
            );
          })}
        </div>
        <p className="muted small" style={{ marginTop: 16 }}>A bigger shape means the framework sets firmer rules across more topics. Where the shapes differ is where an organisation working in several places has to do different things.</p>
        <div style={{ marginTop: 14, display: 'grid', gap: 6 }}>
          {sel.map((f, i) => {
            const total = TOPICS.reduce((a, t) => a + COMPARE[t.id][f][0], 0);
            return (
              <div key={f} style={{ display: 'grid', gridTemplateColumns: '150px minmax(0,1fr) 40px', gap: 10, alignItems: 'center', fontSize: 13.5 }}>
                <span><span className="swatch" style={{ background: SERIES[i], marginRight: 8 }} />{FW_BY_ID[f].short}</span>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,.07)' }}><motion.div animate={{ width: `${(total / 24) * 100}%` }} style={{ height: 6, borderRadius: 3, background: SERIES[i] }} /></div>
                <span className="mono dim small">{total}/24</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Compare({ fw }: { fw?: string }) {
  const [topic, setTopic] = useState('transparency');
  const fwHi = fw && FW_BY_ID[fw as FwId] ? (fw as FwId) : undefined;
  const t = TOPICS.find((x) => x.id === topic)!;
  const rows = FRAMEWORKS.map((f) => ({ f, cell: COMPARE[topic][f.id] })).sort((a, b) => b.cell[0] - a.cell[0]);
  const pick = (id: string) => { setTopic(id); document.getElementById('topic')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const initial: FwId[] = fwHi ? [fwHi, ...(['eu', 'us', 'cn'] as FwId[]).filter((x) => x !== fwHi)].slice(0, 3) : ['eu', 'us', 'cn'];
  return (
    <div className="wrap" style={{ padding: '44px 0' }}>
      <div className="narrow stack">
        <div className="label accent">Compare</div>
        <h1>{FRAMEWORKS.length} frameworks, {TOPICS.length} questions</h1>
        <p className="lead">How firmly does each framework deal with transparency, human oversight, bias and the rest? Three bars mean a detailed binding rule; no bars mean the topic is not addressed.</p>
      </div>

      <div className="card" style={{ marginTop: 26, padding: '20px 20px 18px' }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 14 }}>
          {LEVEL.map((l, i) => <span key={l} className="small muted" style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><Bars lv={i} />{l}</span>)}
        </div>
        <div className="scroll-x"><Grid topic={topic} setTopic={pick} fwHi={fwHi} /></div>
      </div>

      <section className="section">
        <h2>Overlay frameworks</h2>
        <p className="muted" style={{ marginTop: 6, marginBottom: 18 }}>Each shape is one framework across all eight topics.</p>
        <div className="card card-pad"><Radar initial={initial} /></div>
      </section>

      <section className="section" id="topic">
        <div className="tabs">
          {TOPICS.map((x) => <button key={x.id} className={x.id === topic ? 'on' : ''} onClick={() => setTopic(x.id)}>{x.label}</button>)}
        </div>
        <h2 style={{ marginTop: 22 }}>{t.label}</h2>
        <p className="muted" style={{ marginTop: 6 }}>{t.q}</p>
        <div className="grid2" style={{ marginTop: 20 }}>
          <AnimatePresence mode="popLayout">
            {rows.map(({ f, cell }, i) => (
              <motion.a layout key={topic + f.id} href={`#/rules/${f.id}`} className="card card-pad lift" style={{ color: 'inherit', borderColor: f.id === fwHi ? 'rgba(108,197,176,.5)' : undefined }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <h3>{f.short}</h3>
                  <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span className="dim small">{LEVEL[cell[0]]}</span><Bars lv={cell[0]} /></span>
                </div>
                <p className="muted small" style={{ marginTop: 8 }}>{cell[1]}</p>
              </motion.a>
            ))}
          </AnimatePresence>
        </div>
      </section>
      <p className="dim small">The strength scores are our editorial judgement to support learning, not a legal assessment.</p>
    </div>
  );
}
