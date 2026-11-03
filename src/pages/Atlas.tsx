import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Seg } from '../components/ui';
import { LABS } from '../data/labs';
import { RISKS, STAGES, TIERS, TIER_BY_ID, computeScores, exposure } from '../data/risks';
import type { RiskKey } from '../data/types';
import { go, useInView } from '../lib/util';

function heat(v: number) {
  // 0 → deep blue, 50 → amber, 100 → red
  const t = Math.min(1, v / 90);
  const stops = [[22, 32, 74], [92, 52, 150], [226, 64, 112], [255, 200, 87]];
  const p = t * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(p));
  const f = p - i;
  const c = stops[i].map((a, k) => Math.round(a + (stops[i + 1][k] - a) * f));
  return `rgb(${c.join(',')})`;
}

function Heatmap() {
  const [mode, setMode] = useState<'raw' | 'mit'>('raw');
  const [hover, setHover] = useState<{ l: string; r: RiskKey } | null>(null);
  const data = useMemo(
    () =>
      LABS.map((l) => ({
        l,
        raw: exposure(l),
        mit: computeScores(l, new Set(l.stressors.map((x) => x.id)), new Set(l.mitigations.map((x) => x.id))).risk,
      })),
    [],
  );
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <div className="panel" ref={ref}>
      <div className="panel-h">
        <div className="panel-t">Risk heatmap · model × lens</div>
        <Seg options={[{ v: 'raw', l: 'Unmanaged' }, { v: 'mit', l: 'All controls on' }]} value={mode} onChange={setMode} />
      </div>
      <div className="panel-b scroll-x">
        <div style={{ display: 'grid', gridTemplateColumns: `220px repeat(${RISKS.length}, minmax(62px,1fr))`, gap: 4, minWidth: 760 }}>
          <div />
          {RISKS.map((r) => (
            <div key={r.key} className="mono" style={{ fontSize: 10.5, color: r.color, textAlign: 'center', paddingBottom: 6 }}>{r.short}</div>
          ))}
          {data.map(({ l, raw, mit }, i) => {
            const vals = mode === 'raw' ? raw : mit;
            return (
              <div key={l.id} style={{ display: 'contents' }}>
                <button onClick={() => go(`/lab/${l.id}`)} style={{ textAlign: 'left', background: 'none', border: 'none', padding: '6px 4px', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="dot" style={{ background: TIER_BY_ID[l.tier].color }} />
                  <span style={{ fontSize: 12.5 }}>{l.model.replace(/ \(.*\)/, '')}<span className="dim"> · {l.app}</span></span>
                </button>
                {RISKS.map((r, j) => {
                  const v = vals[r.key];
                  const hl = hover && (hover.l === l.id || hover.r === r.key);
                  return (
                    <motion.div
                      key={r.key}
                      onMouseEnter={() => setHover({ l: l.id, r: r.key })}
                      onMouseLeave={() => setHover(null)}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={seen ? { opacity: hover && !hl ? 0.45 : 1, scale: 1, backgroundColor: heat(v) } : {}}
                      transition={{ delay: seen && !hover ? (i + j) * 0.012 : 0, duration: 0.35 }}
                      style={{ borderRadius: 6, height: 30, display: 'grid', placeItems: 'center', fontFamily: 'var(--mono)', fontSize: 11, color: v > 78 ? '#1a0d10' : v > 20 ? '#fff' : '#9aa6cf', fontWeight: 600, cursor: 'default' }}
                    >
                      {Math.round(v)}
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, fontSize: 11.5 }} className="muted">
          <span>0</span>
          <div style={{ width: 200, height: 8, borderRadius: 4, background: `linear-gradient(90deg, ${heat(0)}, ${heat(30)}, ${heat(60)}, ${heat(90)})` }} />
          <span>90+</span>
          <span style={{ marginLeft: 14 }}>Values = risk score with every scenario switched on. Toggle to see residual risk once all controls are applied.</span>
        </div>
      </div>
    </div>
  );
}

function Flow() {
  const [hover, setHover] = useState<string | null>(null);
  const [ref, seen] = useInView<HTMLDivElement>();
  // flows = sum over labs in tier of (exposure − baseline) per lens
  const flows = TIERS.map((t) =>
    RISKS.map((r) =>
      LABS.filter((l) => l.tier === t.id).reduce((a, l) => a + exposure(l)[r.key] - (l.baseRisk[r.key] ?? 8), 0),
    ),
  );
  const W = 900, H = 460, gap = 10;
  const total = flows.flat().reduce((a, b) => a + b, 0);
  const k = (H - gap * 8) / total;
  // left nodes
  let y = 0;
  const L = TIERS.map((t, i) => { const h = flows[i].reduce((a, b) => a + b, 0) * k; const n = { y, h }; y += h + gap * 2.2; return n; });
  const offL = (H - (y - gap * 2.2)) / 2;
  y = 0;
  const R = RISKS.map((r, j) => { const h = flows.reduce((a, f) => a + f[j], 0) * k; const n = { y, h }; y += h + gap; return n; });
  const offR = (H - (y - gap)) / 2;
  const lc = L.map(() => 0), rc = R.map(() => 0);
  const ribbons: { d: string; c: string; t: string; r: string; v: number }[] = [];
  TIERS.forEach((t, i) =>
    RISKS.forEach((r, j) => {
      const h = flows[i][j] * k;
      if (h < 0.5) return;
      const y0 = offL + L[i].y + lc[i], y1 = offR + R[j].y + rc[j];
      lc[i] += h; rc[j] += h;
      const x0 = 170, x1 = W - 170;
      ribbons.push({ d: `M${x0},${y0} C${(x0 + x1) / 2},${y0} ${(x0 + x1) / 2},${y1} ${x1},${y1} L${x1},${y1 + h} C${(x0 + x1) / 2},${y1 + h} ${(x0 + x1) / 2},${y0 + h} ${x0},${y0 + h} Z`, c: t.color, t: t.id, r: r.key, v: flows[i][j] });
    }),
  );
  return (
    <div className="panel" ref={ref}>
      <div className="panel-h"><div className="panel-t">Where the risk comes from · tier → lens</div><span className="mono dim" style={{ fontSize: 11 }}>hover to trace</span></div>
      <div className="panel-b">
        <svg viewBox={`0 0 ${W} ${H}`} className="viz-svg">
          {ribbons.map((rb, i) => {
            const on = !hover || hover === rb.t || hover === rb.r;
            return <motion.path key={i} d={rb.d} fill={rb.c} initial={{ opacity: 0 }} animate={seen ? { opacity: on ? 0.42 : 0.06 } : {}} transition={{ duration: 0.6, delay: seen && !hover ? i * 0.015 : 0 }} />;
          })}
          {TIERS.map((t, i) => (
            <g key={t.id} onMouseEnter={() => setHover(t.id)} onMouseLeave={() => setHover(null)} style={{ cursor: 'pointer' }}>
              <rect x={156} y={offL + L[i].y} width="14" height={L[i].h} rx="4" fill={t.color} />
              <text x={146} y={offL + L[i].y + L[i].h / 2 + 4} textAnchor="end" fontSize="13" fill="#fff" fontWeight={600}>{t.label}</text>
            </g>
          ))}
          {RISKS.map((r, j) => (
            <g key={r.key} onMouseEnter={() => setHover(r.key)} onMouseLeave={() => setHover(null)} style={{ cursor: 'pointer' }}>
              <rect x={W - 170} y={offR + R[j].y} width="14" height={R[j].h} rx="4" fill={r.color} />
              <text x={W - 148} y={offR + R[j].y + R[j].h / 2 + 4} fontSize="13" fill="#fff" fontWeight={600}>{r.short}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

function Escalation() {
  const [ref, seen] = useInView<HTMLDivElement>();
  const [hover, setHover] = useState<RiskKey | null>(null);
  const avg = RISKS.map((r) => TIERS.map((t) => { const ls = LABS.filter((l) => l.tier === t.id); return ls.reduce((a, l) => a + exposure(l)[r.key], 0) / ls.length; }));
  const W = 560, H = 340, l = 40, rr = 110, t = 20, b = 40;
  const x = (i: number) => l + (i * (W - l - rr)) / 3;
  const y = (v: number) => H - b - (v / 80) * (H - t - b);
  return (
    <div className="panel" ref={ref}>
      <div className="panel-h"><div className="panel-t">Risk escalation across tiers</div></div>
      <div className="panel-b">
        <svg viewBox={`0 0 ${W} ${H}`} className="viz-svg">
          {[0, 20, 40, 60, 80].map((v) => (
            <g key={v}><line x1={l} x2={W - rr} y1={y(v)} y2={y(v)} stroke="rgba(130,160,255,.08)" /><text x={l - 8} y={y(v) + 3} textAnchor="end" fontSize="10" fill="#7f8bb8" fontFamily="JetBrains Mono">{v}</text></g>
          ))}
          {TIERS.map((tr, i) => <text key={tr.id} x={x(i)} y={H - 16} textAnchor="middle" fontSize="11" fill={tr.color} fontFamily="JetBrains Mono">{tr.label.split(' ')[0]}</text>)}
          {RISKS.map((r, j) => {
            const on = !hover || hover === r.key;
            const d = avg[j].map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ');
            return (
              <g key={r.key} onMouseEnter={() => setHover(r.key)} onMouseLeave={() => setHover(null)} style={{ cursor: 'pointer' }}>
                <motion.path d={d} stroke={r.color} strokeWidth={hover === r.key ? 4 : 2.2} fill="none" opacity={on ? 1 : 0.15} initial={{ pathLength: 0 }} animate={seen ? { pathLength: 1 } : {}} transition={{ duration: 1.2, delay: j * 0.08 }} />
                {avg[j].map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3.5" fill={r.color} opacity={on ? 1 : 0.15} />)}
                <text x={W - rr + 10} y={y(avg[j][3]) + 4} fontSize="11" fill={r.color} opacity={on ? 1 : 0.2} fontWeight={600}>{r.short}</text>
              </g>
            );
          })}
        </svg>
        <p className="muted" style={{ fontSize: 12.5 }}>Average unmanaged exposure per lens. Security and accountability climb steeply with autonomy; fairness peaks where models decide about people.</p>
      </div>
    </div>
  );
}

function Correlation() {
  const M = useMemo(() => {
    const vec = RISKS.map((r) => LABS.map((l) => exposure(l)[r.key]));
    const corr = (a: number[], b: number[]) => {
      const ma = a.reduce((s, v) => s + v, 0) / a.length, mb = b.reduce((s, v) => s + v, 0) / b.length;
      let n = 0, da = 0, db = 0;
      a.forEach((v, i) => { n += (v - ma) * (b[i] - mb); da += (v - ma) ** 2; db += (b[i] - mb) ** 2; });
      return n / Math.sqrt(da * db || 1);
    };
    return vec.map((a) => vec.map((b) => corr(a, b)));
  }, []);
  const [ref, seen] = useInView<HTMLDivElement>();
  const col = (c: number) => (c >= 0 ? `rgba(255,122,89,${Math.abs(c)})` : `rgba(76,201,240,${Math.abs(c)})`);
  return (
    <div className="panel" ref={ref}>
      <div className="panel-h"><div className="panel-t">Which risks travel together?</div></div>
      <div className="panel-b">
        <div style={{ display: 'grid', gridTemplateColumns: `90px repeat(8, 1fr)`, gap: 3 }}>
          <div />
          {RISKS.map((r) => <div key={r.key} className="mono" style={{ fontSize: 9, color: r.color, textAlign: 'center', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: 70 }}>{r.short}</div>)}
          {RISKS.map((r, i) => (
            <div key={r.key} style={{ display: 'contents' }}>
              <div className="mono" style={{ fontSize: 10, color: r.color, alignSelf: 'center' }}>{r.short}</div>
              {RISKS.map((q, j) => (
                <motion.div key={q.key} title={`${r.short} × ${q.short}: ${M[i][j].toFixed(2)}`} initial={{ scale: 0 }} animate={seen ? { scale: 1 } : {}} transition={{ delay: (i + j) * 0.02 }} style={{ aspectRatio: '1', borderRadius: 5, background: i === j ? 'rgba(255,255,255,.08)' : col(M[i][j]), display: 'grid', placeItems: 'center', fontSize: 9.5, fontFamily: 'var(--mono)', color: '#fff' }}>
                  {i === j ? '' : M[i][j].toFixed(1)}
                </motion.div>
              ))}
            </div>
          ))}
        </div>
        <p className="muted" style={{ fontSize: 12.5, marginTop: 12 }}>Pearson correlation of risk scores across all {LABS.length} labs. <span style={{ color: '#ff9a7a' }}>Orange</span> = rise together, <span style={{ color: '#8fdcf7' }}>blue</span> = trade off.</p>
      </div>
    </div>
  );
}

function Lifecycle() {
  const all = LABS.flatMap((l) => l.mitigations.map((m) => ({ ...m, lab: l })));
  return (
    <div className="panel">
      <div className="panel-h"><div className="panel-t">Control library across the AI life cycle</div><span className="mono dim" style={{ fontSize: 11 }}>{all.length} controls</span></div>
      <div className="panel-b scroll-x">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(200px, 1fr))', gap: 12, minWidth: 1000 }}>
          {STAGES.map((st, i) => {
            const items = all.filter((x) => x.stage === st.id);
            return (
              <div key={st.id}>
                <div style={{ position: 'relative', padding: '12px 14px', borderRadius: 12, background: `linear-gradient(120deg, rgba(124,247,228,${0.06 + i * 0.03}), rgba(107,140,255,.08))`, border: '1px solid var(--line2)', marginBottom: 10 }}>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--accent)' }}>STAGE {i + 1}</div>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 17 }}>{st.label}</div>
                  <div className="dim" style={{ fontSize: 12 }}>{st.desc} · {items.length}</div>
                </div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {items.map((x) => (
                    <button key={x.lab.id + x.id} onClick={() => go(`/lab/${x.lab.id}`)} style={{ textAlign: 'left', padding: '8px 10px', borderRadius: 9, border: '1px solid var(--line)', background: 'rgba(255,255,255,.02)', fontSize: 12 }}>
                      <span style={{ display: 'block', fontWeight: 600 }}>{x.label}</span>
                      <span className="dim" style={{ fontSize: 11 }}><i className="dot" style={{ background: TIER_BY_ID[x.lab.tier].color, width: 6, height: 6 }} /> {x.lab.model.replace(/ \(.*\)/, '')}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const CROSSWALK: [string, string, string, string, string][] = [
  ['Fairness & bias', 'MEASURE 2.11', 'Art. 10 data governance', 'A.7 data · A.5 impact', '—'],
  ['Robustness & drift', 'MEASURE 2.5 · MANAGE 4.1', 'Art. 15 accuracy & robustness · Art. 72', 'A.6.2.4 V&V · A.6.2.6 monitoring', 'LLM09 Misinformation'],
  ['Transparency', 'MEASURE 2.8–2.9', 'Art. 13 · Art. 50 · Art. 86', 'A.8 information for interested parties', 'LLM07 System prompt leakage'],
  ['Privacy', 'MEASURE 2.10', 'Art. 10(5) + GDPR', 'A.7 data for AI systems', 'LLM02 Sensitive info disclosure'],
  ['Security', 'MEASURE 2.7', 'Art. 15(5) cybersecurity', 'A.6.2 life-cycle controls', 'LLM01 · LLM03 · LLM04 · LLM08'],
  ['Safety & harm', 'MEASURE 2.6 · MANAGE 2.4', 'Art. 9 risk management · Art. 14', 'A.5 impact assessment', 'LLM05 Improper output handling'],
  ['Accountability', 'GOVERN 2.1 · 3.2', 'Art. 12 logging · Art. 26 deployers', 'A.3 roles · A.6.2.8 logs', 'LLM06 Excessive agency'],
  ['Misuse & IP', 'MAP 5.1 · GenAI profile', 'Art. 5 prohibited · Art. 50(4) deepfakes', 'A.9 use of AI systems', 'LLM10 Unbounded consumption'],
];

export function Atlas() {
  return (
    <div className="wrap" style={{ padding: '40px 0' }}>
      <div className="eyebrow">Risk Atlas</div>
      <h1 className="h2" style={{ marginTop: 10 }}>The whole risk landscape, on one page.</h1>
      <p className="lead" style={{ marginTop: 10 }}>Computed live from every lab’s scenarios and controls — the same engine that scores your launches.</p>
      <div style={{ display: 'grid', gap: 18, marginTop: 30 }}>
        <Heatmap />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 18 }} className="atlas-two">
          <Escalation />
          <Correlation />
        </div>
        <Flow />
        <Lifecycle />
        <div className="panel">
          <div className="panel-h"><div className="panel-t">Framework crosswalk</div></div>
          <div className="panel-b scroll-x">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 820 }}>
              <thead>
                <tr>{['Risk lens', 'NIST AI RMF', 'EU AI Act', 'ISO/IEC 42001 (Annex A)', 'OWASP LLM Top 10 (2025)'].map((h) => <th key={h} style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid var(--line2)', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {CROSSWALK.map((row, i) => (
                  <tr key={row[0]}>
                    {row.map((c, j) => (
                      <td key={j} style={{ padding: '10px 12px', borderBottom: '1px solid var(--line)', color: j === 0 ? RISKS[i].color : 'var(--text)', fontWeight: j === 0 ? 600 : 400 }}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="dim" style={{ fontSize: 11.5, marginTop: 10 }}>Indicative mapping for training purposes — always check the current text of each framework.</p>
          </div>
        </div>
      </div>
      <style>{'@media (max-width: 900px){.atlas-two{grid-template-columns:1fr !important}}'}</style>
    </div>
  );
}
