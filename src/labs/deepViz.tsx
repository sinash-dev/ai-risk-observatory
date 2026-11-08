import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Seg, Stat } from '../components/ui';
import type { VizProps } from '../data/types';
import { clamp, rng } from '../lib/util';
import { AxisX, AxisY, C, Flag, VizHead, scale } from '../viz/kit';

/* =====================================================================
   7. CNN — skin-lesion triage
   ===================================================================== */
const TONES = ['#f7dcc8', '#ebbe9b', '#d29d72', '#a8704a', '#7a4b2c', '#4b2d1b'];
const TILES = [
  { tone: 0, mal: true, ruler: true }, { tone: 1, mal: false, ruler: true }, { tone: 2, mal: true, ruler: false },
  { tone: 3, mal: false, ruler: false }, { tone: 4, mal: true, ruler: false }, { tone: 5, mal: true, ruler: false },
  { tone: 0, mal: false, ruler: false }, { tone: 1, mal: true, ruler: false }, { tone: 2, mal: false, ruler: true },
  { tone: 3, mal: true, ruler: false }, { tone: 4, mal: false, ruler: false }, { tone: 5, mal: true, ruler: false },
].map((t, i) => {
  const r = rng(100 + i);
  const harm = Array.from({ length: 5 }, () => ({ a: r() * (t.mal ? 0.28 : 0.09), ph: r() * 6.28 }));
  const pts = Array.from({ length: 48 }, (_, k) => {
    const th = (k / 48) * Math.PI * 2;
    const rad = 22 * (1 + harm.reduce((s, h, j) => s + h.a * Math.sin((j + 2) * th + h.ph), 0));
    return [50 + Math.cos(th) * rad, 46 + Math.sin(th) * rad * 0.9];
  });
  return { ...t, path: 'M' + pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join('L') + 'Z', base: t.mal ? 0.86 + r() * 0.09 : 0.06 + r() * 0.09 };
});

function lesionColor(tone: number, mal: boolean) {
  const dark = ['#8a5a3c', '#7a4a30', '#5e3520', '#3e2214', '#2a160c', '#1a0d06'][tone];
  return mal ? dark : ['#b07a58', '#a06a48', '#84543a', '#5e3a26', '#40261a', '#2c1910'][tone];
}

export function LesionViz({ s, m }: VizProps) {
  const [view, setView] = useState<'img' | 'sal'>('img');
  const skew = s.has('skew') && !m.has('diverse');
  const ruler = s.has('ruler') && !m.has('saliency');
  const adv = s.has('adv') && !m.has('advtrain');
  const auto = s.has('auto') && !m.has('clinician');
  const preds = TILES.map((t, i) => {
    let p = t.base;
    if (skew && t.tone >= 4 && t.mal) p = 0.31;
    if (ruler) p = t.ruler ? 0.93 : t.mal && i % 2 === 1 ? p * 0.45 : p;
    if (adv && i === 2) p = 0.03;
    return p;
  });
  let sens = [0.92, 0.91, 0.9, 0.88, 0.86, 0.85];
  if (s.has('skew')) sens = skew ? [0.94, 0.93, 0.88, 0.74, 0.62, 0.57] : [0.92, 0.92, 0.91, 0.9, 0.89, 0.88];
  if (ruler) sens = sens.map((v) => v - 0.13);
  const overall = sens.reduce((a, b) => a + b, 0) / 6;
  const darkSens = (sens[4] + sens[5]) / 2;
  const discharged = auto ? preds.filter((p) => p < 0.5).length : 0;
  return (
    <div>
      <VizHead title="convolutional network · 12 test images · P(malignant)">
        <Seg options={[{ v: 'img', l: 'Image' }, { v: 'sal', l: 'What the model looks at' }]} value={view} onChange={setView} />
      </VizHead>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
        {TILES.map((t, i) => {
          const p = preds[i];
          const predMal = p >= 0.5;
          const correct = predMal === t.mal;
          const isAdv = adv && i === 2;
          return (
            <motion.div key={i} layout style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${correct ? 'var(--line)' : 'rgba(239,91,107,.7)'}`, background: 'rgba(255,255,255,.02)', boxShadow: correct ? 'none' : '0 0 18px -6px rgba(239,91,107,.8)' }}>
              <svg viewBox="0 0 100 92" className="viz-svg">
                <defs>
                  <radialGradient id={`skin${i}`} cx="40%" cy="35%" r="80%">
                    <stop offset="0" stopColor={TONES[t.tone]} />
                    <stop offset="1" stopColor={TONES[t.tone]} stopOpacity=".82" />
                  </radialGradient>
                  <radialGradient id={`heat${i}`}>
                    <stop offset="0" stopColor="#ff2d2d" stopOpacity=".9" />
                    <stop offset=".45" stopColor="#f0b44c" stopOpacity=".55" />
                    <stop offset="1" stopColor="#f0b44c" stopOpacity="0" />
                  </radialGradient>
                  <pattern id={`noise${i}`} width="4" height="4" patternUnits="userSpaceOnUse">
                    <rect width="2" height="2" fill="#ff00ff" opacity=".35" />
                    <rect x="2" y="2" width="2" height="2" fill="#00ffcc" opacity=".35" />
                  </pattern>
                </defs>
                <rect width="100" height="92" fill={`url(#skin${i})`} />
                {[...Array(7)].map((_, k) => <circle key={k} cx={(k * 37 + i * 13) % 100} cy={(k * 23 + i * 29) % 92} r="0.8" fill="#000" opacity=".12" />)}
                <path d={t.path} fill={lesionColor(t.tone, t.mal)} opacity=".92" />
                {t.mal && <path d={t.path} fill="#2a0f0a" opacity=".35" transform="translate(50 46) scale(.55) translate(-50 -46)" />}
                {t.ruler && (
                  <g>
                    <rect x="62" y="74" width="34" height="9" rx="1" fill="#f4f1e8" opacity=".95" />
                    {[...Array(9)].map((_, k) => <line key={k} x1={64 + k * 3.8} x2={64 + k * 3.8} y1="74" y2={k % 2 ? 78 : 80} stroke="#333" strokeWidth=".6" />)}
                  </g>
                )}
                {isAdv && view === 'img' && <rect width="100" height="92" fill={`url(#noise${i})`}><animate attributeName="opacity" values=".4;.9;.4" dur="1.4s" repeatCount="indefinite" /></rect>}
                {view === 'sal' && <rect width="100" height="92" fill="#15171d" opacity=".55" />}
                {view === 'sal' && (ruler && t.ruler ? <ellipse cx="79" cy="78" rx="26" ry="18" fill={`url(#heat${i})`} /> : isAdv ? <rect width="100" height="92" fill={`url(#heat${i})`} opacity=".5" /> : <ellipse cx="50" cy="46" rx="30" ry="27" fill={`url(#heat${i})`} />)}
              </svg>
              <div style={{ padding: '6px 8px', fontSize: 10.5, fontFamily: 'var(--mono)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
                <span style={{ color: predMal ? '#f39aa4' : '#8fdcf7', fontWeight: 600 }}>{predMal ? 'MALIG.' : 'BENIGN'} {(predMal ? p : 1 - p).toFixed(2)}</span>
                <span style={{ color: correct ? C.good : C.bad }}>{correct ? '✓' : '✗'}</span>
              </div>
              <div style={{ padding: '0 8px 7px', fontSize: 9.5, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                type {['I', 'II', 'III', 'IV', 'V', 'VI'][t.tone]} · {isAdv ? <span style={{ color: C.bad }}>perturbed</span> : auto && !predMal ? <span style={{ color: C.warn }}>auto-discharged</span> : t.mal ? 'truth: malig.' : 'truth: benign'}
              </div>
            </motion.div>
          );
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16, marginTop: 14 }}>
        <div>
          <div className="mono dim" style={{ fontSize: 10.5, marginBottom: 8 }}>SENSITIVITY BY FITZPATRICK SKIN TYPE</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 110 }}>
            {sens.map((v, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div className="mono" style={{ fontSize: 10, color: v < 0.75 ? '#f39aa4' : 'var(--muted)' }}>{Math.round(v * 100)}</div>
                <motion.div animate={{ height: `${(v - 0.4) * 140}px` }} transition={{ type: 'spring', stiffness: 120, damping: 16 }} style={{ borderRadius: '6px 6px 2px 2px', background: `linear-gradient(180deg, ${v < 0.75 ? C.bad : C.good}, ${TONES[i]})` }} />
                <div className="mono dim" style={{ fontSize: 10, marginTop: 4 }}>{['I', 'II', 'III', 'IV', 'V', 'VI'][i]}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', display: 'grid', gap: 8, alignContent: 'start' }}>
          {ruler && <Flag tone="bad">Shortcut learning: model keys on ruler marks, not the lesion</Flag>}
          {skew && <Flag tone="bad">Training data: 90% skin types I–III</Flag>}
          {adv && <Flag tone="bad">Invisible noise flipped a melanoma to “benign 0.97”</Flag>}
          {auto && <Flag tone="warn">{discharged} patients discharged with no clinician review</Flag>}
          {!ruler && !skew && !adv && !auto && <span>Toggle a risk in <b>Break it</b> to see how this model fails, then switch to “What the model looks at”.</span>}
        </div>
      </div>
      <div className="stats" style={{ marginTop: 12 }}>
        <Stat l="Sensitivity" v={overall * 100} suffix="%" tone={overall < 0.8 ? 'bad' : 'good'} s="melanomas caught" />
        <Stat l="Types V–VI" v={darkSens * 100} suffix="%" tone={darkSens < 0.75 ? 'bad' : ''} s="darker skin" />
        <Stat l="Attack success" v={s.has('adv') ? (adv ? 89 : 6) : 0} suffix="%" tone={adv ? 'bad' : ''} />
        <Stat l="Unreviewed discharges" v={discharged} tone={discharged ? 'bad' : 'good'} s="of 12 patients" />
      </div>
    </div>
  );
}

/* =====================================================================
   8. NLP — CV screening
   ===================================================================== */
type Tok = { t: string; k?: 'gender' | 'masc' | 'proxy-gap' | 'proxy-uni' };
const CV: Tok[][] = [
  [{ t: 'Led analytics for a 40-person ' }, { t: "women's", k: 'gender' }, { t: ' health non-profit and ' }, { t: 'executed', k: 'masc' }, { t: ' its cloud migration.' }],
  [{ t: 'Captain of the ' }, { t: "women's", k: 'gender' }, { t: ' chess club — national finalist 2022.' }],
  [{ t: 'Career break 2019–2021 (parental leave)', k: 'proxy-gap' }, { t: '; freelance dashboards for local charities.' }],
  [{ t: 'MSc Statistics, ' }, { t: 'Riverside Polytechnic', k: 'proxy-uni' }, { t: ' — distinction.' }],
  [{ t: 'SQL · Python · forecasting · stakeholder workshops · mentoring.' }],
];

export function CvViz({ s, m }: VizProps) {
  const [twin, setTwin] = useState(false);
  const hist = s.has('history') && !m.has('cf');
  const prox = s.has('proxies') && !m.has('proxy');
  const auto = s.has('auto') && !m.has('human');
  const w = (k?: Tok['k'], isTwin = false) => {
    if (k === 'gender') return hist && !isTwin ? -9 : 0;
    if (k === 'masc') return hist ? 4 : 0;
    if (k === 'proxy-gap') return prox ? -10 : 0;
    if (k === 'proxy-uni') return prox ? -6 : 0;
    return 0;
  };
  const score = (isTwin: boolean) => 64 + CV.flat().reduce((a, tk) => a + w(tk.k, isTwin), 0);
  const sJ = score(false), sT = score(true);
  const men = 0.48 + (prox ? 0.02 : 0);
  const women = 0.48 - (hist ? 0.17 : 0) - (prox ? 0.08 : 0) + (s.has('history') && !hist ? 0.01 : 0);
  const flips = hist ? 23 : s.has('history') ? 1 : 0;
  const status = (v: number) => (v >= 60 ? 'Shortlisted' : auto ? 'Auto-rejected' : 'Recruiter review');
  return (
    <div>
      <VizHead title="transformer text classifier · token attributions (integrated gradients)">
        <Seg options={[{ v: false, l: 'Original CV' }, { v: true, l: 'Counterfactual twin' }]} value={twin} onChange={setTwin} />
      </VizHead>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 230px', gap: 16 }}>
        <div style={{ background: '#f4f6fb', color: '#1b2238', borderRadius: 14, padding: '22px 24px', boxShadow: '0 20px 50px -20px rgba(0,0,0,.6)', fontSize: 14, lineHeight: 1.9 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #d9deea', paddingBottom: 10, marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 20, fontWeight: 700 }}>Jordan Ellis</div>
              <div style={{ fontSize: 12.5, color: '#5b6480' }}>Senior Data Analyst · 9 years’ experience</div>
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#5b6480' }}>REQ-2291</div>
          </div>
          {CV.map((line, li) => (
            <div key={li} style={{ marginBottom: 2 }}>
              <span style={{ color: '#9aa3bf', marginRight: 8 }}>▸</span>
              {line.map((tk, ti) => {
                const v = w(tk.k, twin);
                const txt = twin && tk.k === 'gender' ? "men's" : tk.t;
                const bg = v < 0 ? `rgba(255,70,90,${Math.min(0.55, -v / 16)})` : v > 0 ? `rgba(20,190,160,${Math.min(0.5, v / 9)})` : 'transparent';
                return (
                  <motion.span key={ti + txt} initial={false} animate={{ backgroundColor: bg }} transition={{ duration: 0.5 }} style={{ borderRadius: 4, padding: tk.k ? '1px 3px' : 0, fontWeight: tk.k && v ? 600 : 400, position: 'relative' }} title={v ? `attribution ${v > 0 ? '+' : ''}${v}` : undefined}>
                    {txt}
                    {tk.k && v !== 0 && <sup style={{ fontFamily: 'var(--mono)', fontSize: 9, color: v < 0 ? '#c0142f' : '#0b8f78', marginLeft: 2 }}>{v > 0 ? '+' : ''}{v}</sup>}
                  </motion.span>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
          {[{ l: 'Jordan (original)', v: sJ }, { l: 'Twin (gender words swapped)', v: sT }].map((c) => (
            <div key={c.l} style={{ padding: 12, borderRadius: 12, border: '1px solid var(--line)', background: 'rgba(255,255,255,.03)' }}>
              <div className="mono dim" style={{ fontSize: 10.5 }}>{c.l.toUpperCase()}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: 'var(--display)', fontSize: 30, fontWeight: 600 }}>{c.v}</span>
                <span className="dim">/ 100</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,.08)', position: 'relative', marginTop: 4 }}>
                <motion.div animate={{ width: `${c.v}%` }} style={{ height: 6, borderRadius: 3, background: c.v >= 60 ? C.good : C.bad }} />
                <div style={{ position: 'absolute', left: '60%', top: -3, width: 2, height: 12, background: '#fff' }} />
              </div>
              <div style={{ marginTop: 8 }}><Flag tone={c.v >= 60 ? 'good' : auto ? 'bad' : 'warn'}>{status(c.v)}</Flag></div>
            </div>
          ))}
          {sJ !== sT && <div style={{ fontSize: 12, color: '#f39aa4' }}>Changing only gendered words moves the score by <b>{sT - sJ}</b> points.</div>}
        </div>
      </div>
      <div className="stats" style={{ marginTop: 14 }}>
        <Stat l="Shortlist · men" v={men * 100} suffix="%" />
        <Stat l="Shortlist · women" v={women * 100} suffix="%" tone={women / men < 0.8 ? 'bad' : ''} />
        <Stat l="Impact ratio" v={women / men} d={2} tone={women / men < 0.8 ? 'bad' : 'good'} s="≥ 0.80 required" />
        <Stat l="Counterfactual flips" v={flips} suffix="%" tone={flips > 5 ? 'bad' : 'good'} s="decision changes on swap" />
      </div>
    </div>
  );
}

/* =====================================================================
   9. RECOMMENDER — news feed
   ===================================================================== */
const TOPICS = [
  { n: 'Politics', c: '#e07799' }, { n: 'Science', c: '#4cc9f0' }, { n: 'Sport', c: '#3cc6ad' }, { n: 'Culture', c: '#b892ff' }, { n: 'Local', c: '#f0b44c' },
];
function simulateFeed(alpha: number, eps: number, boost: number) {
  let p = [0.22, 0.2, 0.2, 0.2, 0.18];
  const out: { p: number[]; div: number; eng: number }[] = [];
  for (let d = 0; d <= 60; d++) {
    const H = -p.reduce((a, v) => a + (v > 0 ? v * Math.log(v) : 0), 0) / Math.log(5);
    out.push({ p: p.slice(), div: H, eng: 31 + 26 * (1 - H) + boost * 120 * (p[0] - 0.2) });
    let q = p.map((v, i) => Math.pow(v, alpha) * (i === 0 ? 1 + boost : 1));
    const sum = q.reduce((a, b) => a + b, 0);
    q = q.map((v) => v / sum);
    p = q.map((v) => (1 - eps) * v + eps / 5);
  }
  return out;
}

export function FeedViz({ s, m }: VizProps) {
  const engage = s.has('engage') && !m.has('diversity');
  const loop = s.has('loop') && !m.has('nonprof');
  const outrage = s.has('outrage') && !m.has('quality');
  const alpha = 1 + (engage ? 0.07 : 0.01) + (loop ? 0.05 : 0);
  const eps = m.has('diversity') ? 0.1 : 0.01;
  const boost = outrage ? 0.05 : 0;
  const sim = useMemo(() => simulateFeed(alpha, eps, boost), [alpha, eps, boost]);
  const [day, setDay] = useState(0);
  useEffect(() => {
    setDay(0);
    const iv = setInterval(() => setDay((d) => (d < 60 ? d + 1 : d)), 55);
    return () => clearInterval(iv);
  }, [sim]);
  const cur = sim[day];
  const W = 420, H = 250, l = 34, rr = 34, t = 14, b = 30;
  const x = scale(0, 60, l, W - rr);
  const yD = scale(0, 1, H - b, t);
  const yE = scale(20, 80, H - b, t);
  const lineD = sim.slice(0, day + 1).map((v, i) => `${i ? 'L' : 'M'}${x(i)},${yD(v.div)}`).join(' ');
  const lineE = sim.slice(0, day + 1).map((v, i) => `${i ? 'L' : 'M'}${x(i)},${yE(v.eng)}`).join(' ');
  // donut
  let acc = 0;
  const arcs = cur.p.map((v, i) => {
    const a0 = acc * Math.PI * 2 - Math.PI / 2;
    acc += v;
    const a1 = acc * Math.PI * 2 - Math.PI / 2;
    const R = 92, r = 64;
    const big = a1 - a0 > Math.PI ? 1 : 0;
    const P = (a: number, rad: number) => `${130 + Math.cos(a) * rad},${130 + Math.sin(a) * rad}`;
    return <path key={i} d={`M${P(a0, R)} A${R},${R} 0 ${big} 1 ${P(a1, R)} L${P(a1, r)} A${r},${r} 0 ${big} 0 ${P(a0, r)} Z`} fill={TOPICS[i].c} opacity=".88" stroke="#15171d" strokeWidth="2" />;
  });
  const top = Math.max(...cur.p);
  return (
    <div>
      <VizHead title={`simulated population feed · day ${day}/60 · retrained daily on clicks`}>
        <div className="legend">{TOPICS.map((tp) => <span key={tp.n}><i className="dot" style={{ background: tp.c }} />{tp.n}</span>)}</div>
      </VizHead>
      <div style={{ display: 'grid', gridTemplateColumns: '260px minmax(0,1fr)', gap: 16, alignItems: 'center' }}>
        <svg viewBox="0 0 260 260" className="viz-svg">
          <defs>
            <radialGradient id="bub"><stop offset="0" stopColor="#6f8ff0" stopOpacity=".05" /><stop offset="1" stopColor="#6f8ff0" stopOpacity=".3" /></radialGradient>
          </defs>
          {arcs}
          <circle cx="130" cy="130" r={58 - (1 - cur.div) * 26} fill="url(#bub)" stroke="rgba(160,180,255,.5)" />
          {Array.from({ length: 18 }, (_, i) => {
            const a = (i / 18) * Math.PI * 2 + day * 0.05;
            const rad = (58 - (1 - cur.div) * 26) * (0.35 + ((i * 37) % 10) / 16);
            let c = 0, cum = 0;
            const u = ((i * 0.618) % 1);
            for (let k = 0; k < 5; k++) { cum += cur.p[k]; if (u <= cum) { c = k; break; } }
            return <circle key={i} cx={130 + Math.cos(a) * rad} cy={130 + Math.sin(a) * rad} r="3.4" fill={TOPICS[c].c} />;
          })}
          <text x="130" y="128" textAnchor="middle" fontSize="20" fill="#fff" fontFamily="Manrope Variable, Manrope, sans-serif" fontWeight={600}>{Math.round(cur.div * 100)}%</text>
          <text x="130" y="144" textAnchor="middle" fontSize="9" fill="#a3a9b8" fontFamily="IBM Plex Mono">DIVERSITY</text>
        </svg>
        <svg viewBox={`0 0 ${W} ${H}`} className="viz-svg">
          <AxisX x={x} y={H - b} ticks={[0, 15, 30, 45, 60]} label="day" />
          <AxisY x={l} y={yD} w={W - l - rr} ticks={[0, 0.25, 0.5, 0.75, 1]} fmt={(v) => `${v * 100}`} />
          {[20, 40, 60, 80].map((v) => <text key={v} x={W - rr + 6} y={yE(v) + 3} fontSize="10" fill="#f0b44c" fontFamily="IBM Plex Mono">{v}</text>)}
          <path d={lineD} stroke="#4cc9f0" strokeWidth="2.5" fill="none" />
          <path d={lineE} stroke="#f0b44c" strokeWidth="2.5" fill="none" />
          <circle cx={x(day)} cy={yD(cur.div)} r="4" fill="#4cc9f0" />
          <circle cx={x(day)} cy={yE(cur.eng)} r="4" fill="#f0b44c" />
          <text x={l + 4} y={t + 4} fontSize="10.5" fill="#4cc9f0" fontFamily="IBM Plex Mono">topic diversity %</text>
          <text x={W - rr} y={t + 4} textAnchor="end" fontSize="10.5" fill="#f0b44c" fontFamily="IBM Plex Mono">watch-time min/day</text>
        </svg>
      </div>
      <div className="stats" style={{ marginTop: 10 }}>
        <Stat l="Watch-time" v={cur.eng} d={0} suffix=" min" s="business KPI ↑" />
        <Stat l="Topic diversity" v={cur.div * 100} suffix="%" tone={cur.div < 0.6 ? 'bad' : 'good'} />
        <Stat l="Top topic share" v={top * 100} suffix="%" tone={top > 0.5 ? 'bad' : ''} s={TOPICS[cur.p.indexOf(top)].n} />
        <Stat l="Users in a bubble" v={clamp((top - 0.3) * 160, 0, 95)} suffix="%" tone={top > 0.5 ? 'bad' : ''} s="> 60% one topic" />
      </div>
    </div>
  );
}

/* =====================================================================
   10. REINFORCEMENT LEARNING — dynamic pricing
   ===================================================================== */
export function PricingViz({ s, m }: VizProps) {
  const revenue = s.has('revenue') && !m.has('reward');
  const storm = s.has('storm');
  const capped = storm && m.has('caps');
  const collude = s.has('collude') && !m.has('audit');
  const N = 56;
  const stormC = (i: number) => (storm ? Math.exp(-((i - 28) ** 2) / 22) : 0);
  const drift = (i: number) => (collude ? 0.38 * clamp(i / 46) : 0);
  const markup = revenue ? 2.6 : 0.3;
  const series = Array.from({ length: N }, (_, i) => {
    const sc = stormC(i);
    let mu = markup * sc;
    if (capped) mu = Math.min(mu, 0.1);
    const ours = 100 * (1 + drift(i)) * (1 + mu) * (1 + Math.sin(i * 1.3) * 0.015);
    const c1 = 100 * (1 + drift(i) * 0.97) * (1 + Math.min(mu, 0.6) * 0.8) * (1 + Math.cos(i * 0.9) * 0.02);
    const c2 = 100 * (1 + drift(i) * 1.02) * (1 + Math.min(mu, 0.6) * 0.6) * (1 + Math.sin(i * 0.7 + 1) * 0.02);
    const demand = 1 + sc * 2.4;
    return { ours, c1, c2, demand, sc };
  });
  const W = 680, H = 300, l = 44, rr = 14, t = 30, b = 34;
  const x = scale(0, N - 1, l, W - rr);
  const y = scale(60, 480, H - b, t);
  const yd = scale(0, 4, H - b, H - b - 70);
  const path = (k: 'ours' | 'c1' | 'c2') => series.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(Math.min(480, v[k]))}`).join(' ');
  const demandPath = series.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${yd(v.demand)}`).join(' ') + `L${x(N - 1)},${yd(0)}L${x(0)},${yd(0)}Z`;
  const peak = Math.max(...series.map((v) => v.ours));
  const rev = series.reduce((a, v) => a + v.ours * v.demand / (1 + 0.004 * (v.ours - 100)), 0) / series.reduce((a, v) => a + 100 * v.demand, 0);
  const harm = series.reduce((a, v) => a + Math.max(0, v.ours - 110) * v.demand * v.sc, 0) * 120;
  const avg = series.reduce((a, v) => a + v.ours, 0) / N;
  // learning curve
  const LC = Array.from({ length: 60 }, (_, i) => 1 - Math.exp(-i / 12) + Math.sin(i * 1.7) * 0.03);
  const key = `${revenue}${storm}${capped}${collude}`;
  return (
    <div>
      <VizHead title="RL pricing agent · bottled water, 14 days (4 decisions/day) · competitors also algorithmic">
        <div className="legend">
          <span><i className="dot" style={{ background: C.warn }} /> our agent</span>
          <span><i className="dot" style={{ background: '#6f8ff0' }} /> competitor bots</span>
          <span><i className="dot" style={{ background: 'rgba(76,201,240,.6)' }} /> demand</span>
        </div>
      </VizHead>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 180px', gap: 14 }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="viz-svg">
          <AxisY x={l} y={y} w={W - l - rr} ticks={[100, 200, 300, 400, 480]} fmt={(v) => `${v}`} label="price index" />
          <AxisX x={x} y={H - b} ticks={[0, 8, 16, 24, 32, 40, 48, 55]} fmt={(i) => `d${Math.round(i / 4) + 1}`} />
          <path d={demandPath} fill="rgba(76,201,240,.13)" stroke="rgba(76,201,240,.5)" />
          {storm && (
            <g>
              <rect x={x(22)} y={t} width={x(34) - x(22)} height={H - t - b} fill="rgba(239,91,107,.07)" />
              <text x={x(28)} y={t + 14} textAnchor="middle" fontSize="10.5" fill="#f39aa4" fontFamily="IBM Plex Mono">⛈ STORM · STATE OF EMERGENCY</text>
            </g>
          )}
          <line x1={l} x2={W - rr} y1={y(100)} y2={y(100)} stroke="rgba(255,255,255,.3)" strokeDasharray="3 4" />
          <motion.path key={`c1${key}`} d={path('c1')} stroke="#6f8ff0" strokeWidth="1.6" fill="none" opacity=".75" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4 }} />
          <motion.path key={`c2${key}`} d={path('c2')} stroke="#9a86e0" strokeWidth="1.6" fill="none" opacity=".75" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4 }} />
          <motion.path key={`o${key}`} d={path('ours')} stroke={C.warn} strokeWidth="3" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4 }} style={{ filter: 'drop-shadow(0 0 6px rgba(240,180,76,.6))' }} />
          {collude && <text x={x(50)} y={y(series[50].ours) - 12} textAnchor="end" fontSize="10.5" fill="#f39aa4" fontFamily="IBM Plex Mono">prices rise in lock-step — no agreement needed</text>}
          {capped && <text x={x(28)} y={y(118) - 8} textAnchor="middle" fontSize="10.5" fill={C.good} fontFamily="IBM Plex Mono">emergency cap +10%</text>}
        </svg>
        <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
          <div style={{ padding: 10, borderRadius: 12, border: '1px solid var(--line)' }}>
            <div className="mono dim" style={{ fontSize: 10, marginBottom: 4 }}>TRAINING REWARD</div>
            <svg viewBox="0 0 160 80" className="viz-svg">
              <path d={LC.map((v, i) => `${i ? 'L' : 'M'}${i * 2.7},${72 - v * 60}`).join(' ')} stroke={revenue ? C.warn : C.good} strokeWidth="2" fill="none" />
            </svg>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{revenue ? 'reward = revenue only' : 'reward = revenue − harm penalty'}</div>
          </div>
          <div style={{ padding: 10, borderRadius: 12, border: '1px solid var(--line)', fontSize: 11.5, color: 'var(--muted)' }}>
            <div className="mono dim" style={{ fontSize: 10, marginBottom: 4 }}>AGENT POLICY (LEARNED)</div>
            {revenue ? 'When demand spikes and supply is short, raise price until sales fall.' : 'Balance margin with fairness constraints; no surge above cap in emergencies.'}
          </div>
        </div>
      </div>
      <div className="stats" style={{ marginTop: 10 }}>
        <Stat l="Revenue index" v={rev * 100} suffix="" s="vs. flat pricing = 100" />
        <Stat l="Peak price" v={peak - 100} prefix="+" suffix="%" tone={peak > 160 ? 'bad' : ''} s="above normal" />
        <Stat l="Avg price vs market" v={avg - 100} prefix="+" suffix="%" tone={avg > 120 ? 'bad' : ''} />
        <Stat l="Consumer harm" v={harm / 1000} d={0} prefix="€" suffix="k" tone={harm > 40000 ? 'bad' : ''} s="overpaid in emergency" />
      </div>
    </div>
  );
}

export { AnimatePresence };
