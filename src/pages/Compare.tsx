import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { COMPARE, TOPICS } from '../data/compare';
import { FRAMEWORKS, FW_BY_ID, type FwId } from '../data/frameworks';
import { useInView, useTween } from '../lib/util';

const LEVEL = ['Not addressed', 'Guidance only', 'Required in some cases', 'Detailed binding rule'];
const SHADE = [
  { top: '#2a2f37', l: '#20242b', r: '#1a1d23' },
  { top: '#3c5c56', l: '#2c4540', r: '#243934' },
  { top: '#51917f', l: '#3c6d60', r: '#335d52' },
  { top: '#79d0bb', l: '#56a593', r: '#4a8f80' },
];

/** isometric 3D bar matrix: rows = topics, columns = frameworks */
function Iso({ topic, setTopic, fwHi }: { topic: string; setTopic: (t: string) => void; fwHi?: FwId }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  const grow = useTween(seen ? 1 : 0, 0.09);
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null);
  const [rot, setRot] = useState({ x: 0, y: 0 });
  const FW = FRAMEWORKS.map((f) => f.id);
  const R = TOPICS.length, Cn = FW.length;
  const dx = 40, dy = 20, w = 0.62, unit = 30;
  const ox = 230 + R * dx, oy = 170;
  const iso = (r: number, c: number) => ({ x: ox + (c - r) * dx, y: oy + (c + r) * dy });
  const cells: { r: number; c: number }[] = [];
  for (let r = 0; r < R; r++) for (let c = 0; c < Cn; c++) cells.push({ r, c });
  cells.sort((a, b) => a.r + a.c - (b.r + b.c));
  const Wd = ox + Cn * dx + 120, Hd = oy + (R + Cn) * dy + 40;
  const hv = hover ? COMPARE[TOPICS[hover.r].id][FW[hover.c]] : null;
  return (
    <div ref={ref} style={{ perspective: 1400, position: 'relative' }}
      onMouseMove={(e) => { const b = e.currentTarget.getBoundingClientRect(); setRot({ x: ((e.clientY - b.top) / b.height - 0.5) * -6, y: ((e.clientX - b.left) / b.width - 0.5) * 8 }); }}
      onMouseLeave={() => setRot({ x: 0, y: 0 })}>
      <div style={{ transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`, transition: 'transform .3s ease-out', transformStyle: 'preserve-3d' }}>
        <svg viewBox={`0 0 ${Wd} ${Hd}`} className="viz-svg" role="img" aria-label="3D comparison of frameworks by topic">
          {/* floor */}
          <polygon points={[iso(-0.5, -0.5), iso(-0.5, Cn - 0.5), iso(R - 0.5, Cn - 0.5), iso(R - 0.5, -0.5)].map((p) => `${p.x},${p.y}`).join(' ')} fill="rgba(255,255,255,.02)" stroke="rgba(255,255,255,.08)" />
          {cells.map(({ r, c }) => {
            const [lv] = COMPARE[TOPICS[r].id][FW[c]];
            const h = (4 + lv * unit) * grow;
            const p = iso(r, c);
            const hw = (w * dx), hh = (w * dy);
            const top = [[p.x, p.y - hh - h], [p.x + hw, p.y - h], [p.x, p.y + hh - h], [p.x - hw, p.y - h]];
            const left = [[p.x - hw, p.y - h], [p.x, p.y + hh - h], [p.x, p.y + hh], [p.x - hw, p.y]];
            const right = [[p.x + hw, p.y - h], [p.x, p.y + hh - h], [p.x, p.y + hh], [p.x + hw, p.y]];
            const sel = TOPICS[r].id === topic || FW[c] === fwHi;
            const isHover = hover?.r === r && hover?.c === c;
            const sh = SHADE[lv];
            const op = isHover ? 1 : sel ? 1 : 0.45;
            const pts = (a: number[][]) => a.map((q) => q.join(',')).join(' ');
            return (
              <g key={`${r}-${c}`} opacity={op} style={{ cursor: 'pointer', transition: 'opacity .3s' }} onMouseEnter={() => setHover({ r, c })} onMouseLeave={() => setHover(null)} onClick={() => setTopic(TOPICS[r].id)}>
                <polygon points={pts(left)} fill={sh.l} />
                <polygon points={pts(right)} fill={sh.r} />
                <polygon points={pts(top)} fill={isHover ? '#ffffff' : sh.top} fillOpacity={isHover ? 0.9 : 1} />
              </g>
            );
          })}
          {/* topic labels (left edge) */}
          {TOPICS.map((t, r) => {
            const p = iso(r, -1.1);
            const on = t.id === topic;
            return (
              <text key={t.id} x={p.x - 6} y={p.y + 4} textAnchor="end" fontSize="13" fontWeight={on ? 700 : 500} fill={on ? '#6cc5b0' : '#b4b9c2'} stroke="#14171c" strokeWidth="5" style={{ cursor: 'pointer', paintOrder: 'stroke' }} onClick={() => setTopic(t.id)}>{t.label}</text>
            );
          })}
          {/* framework labels (right/top edge) */}
          {FW.map((f, c) => {
            const p = iso(-1.5, c);
            const on = f === fwHi;
            return <text key={f} x={p.x + 4} y={p.y - 4} fontSize="12.5" fontWeight={on ? 700 : 500} fill={on ? '#6cc5b0' : '#b4b9c2'} stroke="#14171c" strokeWidth="5" style={{ paintOrder: 'stroke' }} transform={`rotate(-26 ${p.x + 4} ${p.y - 4})`}>{FW_BY_ID[f].short}</text>;
          })}
        </svg>
      </div>
      <AnimatePresence>
        {hover && hv && (
          <motion.div className="tooltip" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ right: 10, top: 10, width: 320 }}>
            <div className="label">{TOPICS[hover.r].label} · {FW_BY_ID[FW[hover.c]].short}</div>
            <div style={{ fontWeight: 700, margin: '4px 0' }}>{LEVEL[hv[0]]}</div>
            <div className="muted small">{hv[1]}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Bars({ lv }: { lv: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 3, alignItems: 'flex-end' }} title={LEVEL[lv]}>
      {[1, 2, 3].map((i) => <span key={i} style={{ width: 6, height: 5 + i * 4, borderRadius: 2, background: i <= lv ? '#6cc5b0' : 'rgba(255,255,255,.12)' }} />)}
    </span>
  );
}

export function Compare({ fw }: { fw?: string }) {
  const [topic, setTopic] = useState('transparency');
  const fwHi = fw && FW_BY_ID[fw as FwId] ? (fw as FwId) : undefined;
  const t = TOPICS.find((x) => x.id === topic)!;
  const rows = FRAMEWORKS.map((f) => ({ f, cell: COMPARE[topic][f.id] })).sort((a, b) => b.cell[0] - a.cell[0]);
  return (
    <div className="wrap" style={{ padding: '44px 0' }}>
      <div className="narrow stack">
        <div className="label accent">Compare</div>
        <h1>Ten frameworks, eight questions</h1>
        <p className="lead">Each block is one framework’s answer to one question. The taller the block, the stronger and more binding the rule. Hover a block to read the answer; click a row to compare that topic in detail below.</p>
      </div>

      <div className="card" style={{ marginTop: 26, padding: '18px 12px 6px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', padding: '0 12px 6px' }}>
          {LEVEL.map((l, i) => <span key={l} className="small muted" style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><span style={{ width: 12, height: 12, borderRadius: 3, background: SHADE[i].top }} />{l}</span>)}
        </div>
        <div className="scroll-x"><div style={{ minWidth: 820 }}><Iso topic={topic} setTopic={setTopic} fwHi={fwHi} /></div></div>
      </div>

      <section className="section">
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
