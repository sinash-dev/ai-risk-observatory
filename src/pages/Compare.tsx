import { alpha, themed } from '../data/palette';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Breadcrumbs } from '../components/Nav';
import { copyText, toast } from '../components/Toast';
import { COMPARE, TOPICS } from '../data/compare';
import { compareCsv, gaps } from '../lib/compareTools';
import { FRAMEWORKS, FW_BY_ID, type FwId } from '../data/frameworks';
import { LAB_BY_ID } from '../data/labs';
import { setLens } from '../lib/lens';
import { useInView, useTweenArray, url } from '../lib/util';

const LEVEL = ['Not addressed', 'Guidance only', 'Required in some cases', 'Detailed binding rule'];
const SERIES = [themed('s1', '#6cc5b0'), themed('s2', '#e0b25c'), themed('s3', '#a99be0'), themed('s4', '#e0896b')];
const SHORT: Record<string, string> = { transparency: 'Transparency', oversight: 'Oversight', fairness: 'Fairness', risk: 'Risk', data: 'Data', genai: 'GenAI', incidents: 'Monitoring', enforcement: 'Enforcement', literacy: 'Literacy', prohibited: 'Bans', redress: 'Redress' };
/** an example where each topic matters most */
const TOPIC_LAB: Record<string, string> = { transparency: 'chatbot', oversight: 'benefits', fairness: 'credit', risk: 'cv', data: 'foundation', genai: 'imagegen', incidents: 'devops-agent', enforcement: 'face', literacy: 'code', prohibited: 'emotion', redress: 'credit' };
const MAX = 3 * TOPICS.length;

function Bars({ lv, delay = 0, seen = true }: { lv: number; delay?: number; seen?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', gap: 3, alignItems: 'flex-end', height: 18 }} aria-hidden>
      {[1, 2, 3].map((i) => (
        <motion.span key={i} initial={{ scaleY: 0 }} animate={seen ? { scaleY: 1 } : {}} transition={{ delay: delay + i * 0.05, type: 'spring', stiffness: 260, damping: 18 }}
          style={{ width: 6, height: 5 + i * 4, borderRadius: 2, transformOrigin: 'bottom', background: i <= lv ? 'var(--accent)' : 'var(--wash-3)' }} />
      ))}
    </span>
  );
}

/** Grid: topics × frameworks. Cells fade in with a stagger when the grid enters view. */
function Grid({ topic, setTopic, fwHi }: { topic: string; setTopic: (t: string) => void; fwHi?: FwId }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  const [hover, setHover] = useState<{ t: string; f: FwId } | null>(null);
  const hv = hover ? COMPARE[hover.t][hover.f] : null;
  const cols = `190px repeat(${FRAMEWORKS.length}, minmax(64px, 1fr))`;
  return (
    <div ref={ref}>
      <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 4, minWidth: 900 }}>
        <div />
        {FRAMEWORKS.map((f) => {
          const on = f.id === fwHi || hover?.f === f.id;
          return <a key={f.id} href={url(`/rules/${f.id}`)} className="grid-head" style={{ color: on ? 'var(--accent)' : 'var(--ink2)' }}>{f.short}</a>;
        })}
        {TOPICS.map((t, r) => {
          const rowOn = t.id === topic;
          return (
            <div key={t.id} style={{ display: 'contents' }}>
              <button className="row-label" onClick={() => setTopic(t.id)} aria-current={rowOn ? 'true' : undefined} style={{ color: rowOn || hover?.t === t.id ? 'var(--accent)' : 'var(--ink2)' }}>
                {rowOn && <motion.span layoutId="topic-row" className="row-bg" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
                <span style={{ position: 'relative' }}>{t.label}</span>
              </button>
              {FRAMEWORKS.map((f, c) => {
                const [lv] = COMPARE[t.id][f.id];
                const isH = hover?.t === t.id && hover?.f === f.id;
                const lit = rowOn || f.id === fwHi || hover?.f === f.id || hover?.t === t.id;
                return (
                  <motion.button key={f.id} className="cell" onMouseEnter={() => setHover({ t: t.id, f: f.id })} onMouseLeave={() => setHover(null)} onFocus={() => setHover({ t: t.id, f: f.id })} onBlur={() => setHover(null)} onClick={() => setTopic(t.id)}
                    initial={{ opacity: 0, y: 6 }} animate={seen ? { opacity: hover ? (lit ? 1 : 0.45) : 1, y: 0 } : {}} transition={{ delay: seen && !hover ? 0.15 + (r + c) * 0.018 : 0, duration: 0.3 }}
                    style={{ borderColor: isH ? 'var(--accent)' : rowOn ? 'rgba(108,197,176,.35)' : 'var(--line)', background: `rgba(108,197,176,${0.03 + lv * 0.07})` }}
                    aria-label={`${t.label}, ${f.short}: ${LEVEL[lv]}`}>
                    <Bars lv={lv} delay={0.3 + (r + c) * 0.02} seen={seen} />
                  </motion.button>
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="grid-readout" aria-live="polite">
        {hover && hv ? (
          <>
            <div className="small"><b>{FW_BY_ID[hover.f].short}</b> <span className="muted">on</span> <b>{TOPICS.find((x) => x.id === hover.t)!.label}</b> · <span className="accent">{LEVEL[hv[0]]}</span></div>
            <div className="muted small" style={{ marginTop: 4 }}>{hv[1]}</div>
          </>
        ) : (
          <div className="dim small">Hover or tab to any cell to read that framework’s answer here. Select a cell or a row name to open the topic below.</div>
        )}
      </div>
    </div>
  );
}

function RadarShape({ fw, color, cx, cy, R }: { fw: FwId; color: string; cx: number; cy: number; R: number }) {
  const vals = useTweenArray(TOPICS.map((t) => COMPARE[t.id][fw][0]), 0.1);
  const pts = vals.map((v, i) => {
    const a = (i / TOPICS.length) * Math.PI * 2 - Math.PI / 2;
    const rr = (R * Math.max(0.06, v)) / 3;
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  });
  return (
    <motion.g initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} style={{ transformOrigin: `${cx}px ${cy}px` }}>
      <polygon points={pts.map((p) => p.join(',')).join(' ')} fill={color} fillOpacity=".14" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3.6" fill={color} stroke="var(--paper)" strokeWidth="1.5" />)}
    </motion.g>
  );
}

function Radar({ initial }: { initial: FwId[] }) {
  const [sel, setSel] = useState<FwId[]>(initial);
  const toggle = (f: FwId) => setSel((s) => (s.includes(f) ? s.filter((x) => x !== f) : s.length >= 4 ? [...s.slice(1), f] : [...s, f]));
  const Wd = 760, Hd = 560, c = Hd / 2, cxx = Wd / 2, R = 200;
  const ang = (i: number) => (i / TOPICS.length) * Math.PI * 2 - Math.PI / 2;
  const summary = sel.map((f) => `${FW_BY_ID[f].short}: ${TOPICS.reduce((a, t) => a + COMPARE[t.id][f][0], 0)} of ${MAX}`).join('; ');
  return (
    <div className="grid2 radar-grid" style={{ alignItems: 'center' }}>
      <svg viewBox={`0 0 ${Wd} ${Hd}`} className="viz-svg" style={{ maxWidth: 780, margin: '0 auto' }} role="img" aria-label={`Radar of ${TOPICS.length} topics. ${summary}.`}>
        {[1, 2, 3].map((lv) => (
          <polygon key={lv} points={TOPICS.map((_, i) => `${cxx + Math.cos(ang(i)) * (R * lv) / 3},${c + Math.sin(ang(i)) * (R * lv) / 3}`).join(' ')} fill="none" stroke="var(--wash-3)" strokeDasharray={lv < 3 ? '3 5' : undefined} />
        ))}
        {TOPICS.map((t, i) => (
          <g key={t.id}>
            <line x1={cxx} y1={c} x2={cxx + Math.cos(ang(i)) * R} y2={c + Math.sin(ang(i)) * R} stroke="var(--wash-3)" />
            <text x={cxx + Math.cos(ang(i)) * (R + 22)} y={c + Math.sin(ang(i)) * (R + 22) + 5} textAnchor={Math.abs(Math.cos(ang(i))) < 0.2 ? 'middle' : Math.cos(ang(i)) > 0 ? 'start' : 'end'} fontSize="15" fill="var(--ink2)" fontWeight={600}>{SHORT[t.id] ?? t.label}</text>
          </g>
        ))}
        {[1, 2, 3].map((lv) => <text key={lv} x={cxx + 8} y={c - (R * lv) / 3 + 14} fontSize="10" fill="#8a909b" fontFamily="IBM Plex Mono">{['', 'guidance', 'some cases', 'binding'][lv]}</text>)}
        <AnimatePresence>{sel.map((f, i) => <RadarShape key={f} fw={f} color={SERIES[i]} cx={cxx} cy={c} R={R} />)}</AnimatePresence>
      </svg>
      <div>
        <div className="label" style={{ marginBottom: 10 }}>Pick up to four frameworks</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {FRAMEWORKS.map((f) => {
            const i = sel.indexOf(f.id);
            const on = i >= 0;
            return (
              <button key={f.id} onClick={() => toggle(f.id)} aria-pressed={on} className="tag" style={{ cursor: 'pointer', padding: '6px 12px', minHeight: 36, borderColor: on ? SERIES[i] : 'var(--line)', color: on ? 'var(--ink)' : 'var(--muted)', background: on ? alpha(SERIES[i], 0.13) : 'transparent' }}>
                <span className="swatch" style={{ background: on ? SERIES[i] : 'var(--line2)' }} />{f.short}
              </button>
            );
          })}
        </div>
        <p className="muted small" style={{ marginTop: 16 }}>A bigger shape means the framework sets firmer rules across more topics. Where the shapes differ is where an organisation working in several places has to do different things.</p>
        <div style={{ marginTop: 14, display: 'grid', gap: 6 }}>
          {sel.map((f, i) => {
            const total = TOPICS.reduce((a, t) => a + COMPARE[t.id][f][0], 0);
            return (
              <div key={f} style={{ display: 'grid', gridTemplateColumns: '150px minmax(0,1fr) 44px', gap: 10, alignItems: 'center', fontSize: 13.5 }}>
                <span><span className="swatch" style={{ background: SERIES[i], marginInlineEnd: 8 }} />{FW_BY_ID[f].short}</span>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--wash-2)' }}><motion.div animate={{ width: `${(total / MAX) * 100}%` }} style={{ height: 6, borderRadius: 3, background: SERIES[i] }} /></div>
                <span className="mono dim small">{total}/{MAX}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function GapFinder({ initial }: { initial: FwId }) {
  const [a, setA] = useState<FwId>(initial);
  const [b, setB] = useState<FwId>(initial === 'nist' ? 'eu' : 'nist');
  const list = useMemo(() => gaps(a, b), [a, b]);
  const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
  const text = list.length
    ? list.map((g) => `${g.t.label}: under ${FW_BY_ID[a].short}, ${lower(g.a[1])} Under ${FW_BY_ID[b].short} this is ${lower(LEVEL[g.b[0]])}${g.b[0] ? `: ${lower(g.b[1])}` : '.'}`).join('\n\n')
    : `No topic where ${FW_BY_ID[a].short} is two or more levels firmer than ${FW_BY_ID[b].short}.`;
  return (
    <div className="card card-pad gap">
      <div className="gap-pick">
        <label>If you already comply with <select value={b} onChange={(e) => setB(e.target.value as FwId)}>{FRAMEWORKS.map((f) => <option key={f.id} value={f.id}>{f.short}</option>)}</select></label>
        <label>what extra does <select value={a} onChange={(e) => setA(e.target.value as FwId)}>{FRAMEWORKS.map((f) => <option key={f.id} value={f.id}>{f.short}</option>)}</select> ask?</label>
        <button className="btn" onClick={async () => { if (await copyText(`${FW_BY_ID[a].short} compared with ${FW_BY_ID[b].short}\n\n${text}\n`)) toast('Gaps copied'); }}>Copy</button>
      </div>
      <div aria-live="polite">
        {list.length === 0 ? (
          <p className="muted" style={{ marginTop: 14 }}>{text}</p>
        ) : (
          <ul className="gap-list">
            {list.map((g) => (
              <li key={g.t.id}>
                <div className="gap-h"><b>{g.t.label}</b><span className="mono small dim">{LEVEL[g.a[0]]} vs {LEVEL[g.b[0]].toLowerCase()}</span></div>
                <p className="small">Under <b>{FW_BY_ID[a].short}</b> you must: {g.a[1]}</p>
                <p className="small muted">Under <b>{FW_BY_ID[b].short}</b> this is {LEVEL[g.b[0]].toLowerCase()}{g.b[0] ? `: ${g.b[1]}` : '.'}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function download(name: string, blob: Blob) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
/** Draws the grid straight onto a canvas (no libraries) and downloads it as a PNG. */
function gridPng() {
  const cw = 92, rh = 44, lw = 230, top = 70, pad = 24;
  const W = pad * 2 + lw + cw * FRAMEWORKS.length, H = top + rh * TOPICS.length + 60;
  const cv = document.createElement('canvas');
  const k = 2;
  cv.width = W * k; cv.height = H * k;
  const g = cv.getContext('2d')!;
  g.scale(k, k);
  g.fillStyle = '#0c0e11'; g.fillRect(0, 0, W, H);
  g.font = '600 15px Sora Variable, Sora, sans-serif'; g.fillStyle = '#eceef1';
  g.fillText('AI Risk Explorer · how firmly each framework addresses each topic', pad, 32);
  g.font = '700 12px Manrope Variable, Manrope, sans-serif';
  FRAMEWORKS.forEach((f, i) => { g.fillStyle = '#c8ccd3'; g.textAlign = 'center'; g.fillText(f.short.length > 12 ? f.short.slice(0, 11) + '…' : f.short, pad + lw + cw * i + cw / 2, top - 12); });
  g.textAlign = 'left';
  TOPICS.forEach((t, r) => {
    const y = top + rh * r;
    g.fillStyle = '#c8ccd3'; g.font = '700 13px Manrope Variable, Manrope, sans-serif';
    g.fillText(t.label, pad, y + rh / 2 + 4);
    FRAMEWORKS.forEach((f, c) => {
      const lv = COMPARE[t.id][f.id][0];
      const x = pad + lw + cw * c;
      g.fillStyle = `rgba(108,197,176,${0.03 + lv * 0.07})`;
      g.beginPath(); g.roundRect(x + 2, y + 2, cw - 4, rh - 4, 8); g.fill();
      for (let i = 1; i <= 3; i++) {
        g.fillStyle = i <= lv ? '#6cc5b0' : 'rgba(255,255,255,.12)';
        const bh = 5 + i * 4;
        g.fillRect(x + cw / 2 - 13 + (i - 1) * 9, y + rh / 2 + 8 - bh, 6, bh);
      }
    });
  });
  g.fillStyle = '#9298a3'; g.font = '12px Manrope Variable, Manrope, sans-serif';
  g.fillText('Bars: 0 not addressed · 1 guidance only · 2 required in some cases · 3 detailed binding rule. Editorial scores for learning, not legal advice.', pad, H - 22);
  cv.toBlob((b) => b && download('ai-risk-explorer-compare.png', b), 'image/png');
}

export function Compare({ fw, query }: { fw?: string; query?: URLSearchParams }) {
  const qTopic = query?.get('topic');
  const [topic, setTopic] = useState(qTopic && TOPICS.some((t) => t.id === qTopic) ? qTopic : 'transparency');
  const fwHi = fw && FW_BY_ID[fw as FwId] ? (fw as FwId) : undefined;
  const t = TOPICS.find((x) => x.id === topic)!;
  const rows = FRAMEWORKS.map((f) => ({ f, cell: COMPARE[topic][f.id] })).sort((a, b) => b.cell[0] - a.cell[0]);
  const pick = (id: string) => { setTopic(id); document.getElementById('topic')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const initial: FwId[] = fwHi ? [fwHi, ...(['eu', 'us', 'cn'] as FwId[]).filter((x) => x !== fwHi)].slice(0, 3) : ['eu', 'us', 'cn'];
  const lab = LAB_BY_ID[TOPIC_LAB[topic]];
  return (
    <div className="wrap" style={{ padding: '30px 0 44px' }}>
      <div className="narrow stack">
        {fwHi && <Breadcrumbs trail={[{ to: '/compare', label: 'Compare' }, { label: FW_BY_ID[fwHi].short }]} />}
        <div className="eyebrow">Compare</div>
        <h1>{FRAMEWORKS.length} frameworks, {TOPICS.length} questions</h1>
        <p className="lead">How firmly does each framework deal with transparency, human oversight, bias and the rest? Three bars mean a detailed binding rule; no bars mean the topic is not addressed.</p>
      </div>

      <details className="rubric">
        <summary>How the scores work</summary>
        <ol start={0}>
          <li><b>0 · Not addressed.</b> The framework says nothing specific on the topic.</li>
          <li><b>1 · Guidance only.</b> Recommended practice, with no duty.</li>
          <li><b>2 · Required in some cases.</b> Binding for some uses or some organisations, or required inside a voluntary certification.</li>
          <li><b>3 · Detailed binding rule.</b> A specific requirement that applies generally where the law applies.</li>
        </ol>
        <p className="dim small">The strength scores are our editorial judgement to support learning, not a legal assessment.</p>
      </details>

      <div className="card" style={{ marginTop: 16, padding: '20px 20px 18px' }}>
        <div className="grid-tools">
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {LEVEL.map((l, i) => <span key={l} className="small muted" style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><Bars lv={i} />{l}</span>)}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-sm" onClick={() => download('ai-risk-explorer-compare.csv', new Blob([compareCsv()], { type: 'text/csv;charset=utf-8' }))}>Download CSV</button>
            <button className="btn btn-sm" onClick={gridPng}>Download PNG</button>
          </div>
        </div>
        <div className="scroll-x" tabIndex={0} role="region" aria-label="Strength grid, scrolls sideways" style={{ marginTop: 14 }}><Grid topic={topic} setTopic={pick} fwHi={fwHi} /></div>
      </div>

      <section className="section">
        <h2>Overlay frameworks</h2>
        <p className="muted" style={{ marginTop: 6, marginBottom: 18 }}>Each shape is one framework across all {TOPICS.length} topics.</p>
        <div className="card card-pad"><Radar initial={initial} /></div>
      </section>

      <section className="section">
        <h2>Gap finder</h2>
        <p className="muted" style={{ marginTop: 6, marginBottom: 18 }}>Topics where one framework is at least two levels firmer than another: the extra work for an organisation moving between them.</p>
        <GapFinder initial={fwHi ?? 'eu'} />
      </section>

      <section className="section" id="topic">
        <div className="tabs" role="tablist">
          {TOPICS.map((x) => <button key={x.id} role="tab" aria-selected={x.id === topic} className={x.id === topic ? 'on' : ''} onClick={() => setTopic(x.id)}>{x.label}</button>)}
        </div>
        <h2 style={{ marginTop: 22 }}>{t.label}</h2>
        <p className="muted" style={{ marginTop: 6 }}>{t.q}</p>
        {lab && <p className="small" style={{ marginTop: 8 }}>See this topic in a model: <a href={url(`/model/${lab.id}`)}>{lab.model}: {lab.app} →</a></p>}
        <div className="grid2" style={{ marginTop: 20 }}>
          <AnimatePresence mode="popLayout">
            {rows.map(({ f, cell }, i) => (
              <motion.div layout key={topic + f.id} className="card card-pad" style={{ borderColor: f.id === fwHi ? 'rgba(108,197,176,.5)' : undefined }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <h3><a href={url(`/rules/${f.id}`)} style={{ color: 'inherit' }}>{f.short}</a></h3>
                  <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span className="dim small">{LEVEL[cell[0]]}</span><Bars lv={cell[0]} /></span>
                </div>
                <p className="muted small" style={{ marginTop: 8 }}>{cell[1]}</p>
                {lab && <p className="small" style={{ marginTop: 8 }}><a href={url(`/model/${lab.id}`)} onClick={() => setLens(f.id)}>See {lab.app.toLowerCase()} through {f.short} →</a></p>}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
      <p className="dim small">The strength scores are our editorial judgement to support learning, not a legal assessment.</p>
    </div>
  );
}
