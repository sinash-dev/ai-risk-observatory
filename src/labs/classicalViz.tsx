import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Stat, Seg } from '../components/ui';
import type { VizProps } from '../data/types';
import { cart, kmeansSteps, linreg, logreg, predictLin, treePredict, treeStats, type TreeNode } from '../lib/ml';
import { clamp, gauss, rng, sigmoid, useClock } from '../lib/util';
import { AxisX, AxisY, C, Flag, VizHead, phi, scale } from '../viz/kit';

/* =====================================================================
   1. LINEAR REGRESSION — salary setting
   ===================================================================== */
const SAL = (() => {
  const r = rng(11);
  const pts = Array.from({ length: 120 }, () => {
    const years = r() * 20;
    const B = r() < 0.45;
    const gap = B ? (r() < 0.75 ? 1 + r() * 3 : 0) : r() < 0.1 ? r() * 1.5 : 0;
    const fair = 38 + 3.2 * years + gauss(r) * 5;
    const hist = fair - (B ? 6.5 : 0) - 2.4 * gap + gauss(r) * 2;
    return { years, B, gap, fair, hist, out: false };
  });
  const outs = Array.from({ length: 6 }, (_, i) => ({ years: 8 + i * 2, B: false, gap: 0, fair: 150 + r() * 40, hist: 150 + r() * 40, out: true }));
  return { pts, outs };
})();
const truePay = (y: number) => 38 + 3.2 * Math.min(y, 20) + 0.7 * Math.max(0, y - 20);

export function SalaryViz({ s, m }: VizProps) {
  const proxy = s.has('hist') && !m.has('equity');
  const withOut = s.has('outliers');
  const huber = m.has('robust');
  const extrap = s.has('extrap');
  const bounded = m.has('bounds');
  const data = withOut ? [...SAL.pts, ...SAL.outs] : SAL.pts;
  const X = data.map((p) => (proxy ? [p.years, p.gap] : [p.years]));
  const Y = data.map((p) => (proxy ? p.hist : p.fair));
  const beta = linreg(X, Y, huber);
  const gapB = SAL.pts.filter((p) => p.B).reduce((a, p) => a + p.gap, 0) / SAL.pts.filter((p) => p.B).length;
  const predA = (y: number) => predictLin(beta, proxy ? [y, 0] : [y]);
  const predB = (y: number) => predictLin(beta, proxy ? [y, gapB] : [y]);
  const xMax = extrap ? 35 : 22;
  const W = 680, H = 360, l = 56, rr = 16, t = 18, b = 42;
  const x = scale(0, xMax, l, W - rr);
  const y = scale(10, 200, H - b, t);
  const mae = SAL.pts.reduce((a, p) => a + Math.abs(predictLin(beta, proxy ? [p.years, p.gap] : [p.years]) - p.fair), 0) / SAL.pts.length;
  const gapPct = (predB(10) - predA(10)) / predA(10);
  const senior = predA(30) - truePay(30);
  const lineEnd = extrap && !bounded ? xMax : 20;
  return (
    <div>
      <VizHead title="salary (k€) vs years of experience · OLS fit, live">
        <div className="legend">
          <span><i className="dot" style={{ background: C.A }} /> Group A</span>
          <span><i className="dot" style={{ background: C.B }} /> Group B</span>
          {withOut && <span><i className="dot" style={{ background: C.warn, borderRadius: 2 }} /> Executive rows</span>}
        </div>
      </VizHead>
      <svg viewBox={`0 0 ${W} ${H}`} className="viz-svg">
        <AxisY x={l} y={y} w={W - l - rr} ticks={[25, 50, 75, 100, 125, 150, 175]} fmt={(v) => `${v}k`} />
        <AxisX x={x} y={H - b} ticks={extrap ? [0, 5, 10, 15, 20, 25, 30, 35] : [0, 5, 10, 15, 20]} label="years" />
        {extrap && (
          <g>
            <rect x={x(20)} y={t} width={x(xMax) - x(20)} height={H - b - t} fill={bounded ? 'rgba(46,230,197,.06)' : 'rgba(255,90,110,.07)'} />
            <text x={x(27.5)} y={t + 18} textAnchor="middle" fontSize="11" fill={bounded ? C.good : C.bad} fontFamily="JetBrains Mono">
              {bounded ? 'OUT OF RANGE → REFER TO PAY COMMITTEE' : 'NO TRAINING DATA — EXTRAPOLATING'}
            </text>
            {!bounded && (
              <path d={`M${x(20)},${y(predA(20))} L${x(35)},${y(predA(35) + 32)} L${x(35)},${y(predA(35) - 32)} Z`} fill="rgba(255,90,110,.12)" />
            )}
            <path d={Array.from({ length: 16 }, (_, i) => `${i ? 'L' : 'M'}${x(20 + i)},${y(truePay(20 + i))}`).join(' ')} stroke="#fff" strokeOpacity=".5" strokeDasharray="2 4" fill="none" />
            <text x={x(34)} y={y(truePay(34)) + 16} fontSize="10" fill="#c9d1f2" textAnchor="end">actual market pay</text>
          </g>
        )}
        {data.map((p, i) => (
          <motion.circle
            key={i}
            initial={false}
            animate={{ cx: x(p.years), cy: y(proxy ? p.hist : p.fair) }}
            transition={{ duration: 0.7, delay: (i % 30) * 0.01 }}
            r={p.out ? 6 : 3.6}
            fill={p.out ? C.warn : p.B ? C.B : C.A}
            fillOpacity={p.out ? 0.95 : 0.75}
            stroke={p.out ? '#fff' : 'none'}
          />
        ))}
        <motion.line initial={false} animate={{ x1: x(0), y1: y(predA(0)), x2: x(lineEnd), y2: y(predA(lineEnd)) }} transition={{ duration: 0.8 }} stroke={C.A} strokeWidth="3" />
        {proxy && (
          <motion.line initial={{ opacity: 0 }} animate={{ opacity: 1, x1: x(0), y1: y(predB(0)), x2: x(lineEnd), y2: y(predB(lineEnd)) }} transition={{ duration: 0.8 }} stroke={C.B} strokeWidth="3" />
        )}
        {proxy && (
          <g>
            <line x1={x(14)} x2={x(14)} y1={y(predA(14))} y2={y(predB(14))} stroke="#fff" strokeWidth="1.5" />
            <rect x={x(14) + 8} y={(y(predA(14)) + y(predB(14))) / 2 - 12} width="132" height="24" rx="6" fill="rgba(255,90,110,.18)" stroke={C.bad} />
            <text x={x(14) + 74} y={(y(predA(14)) + y(predB(14))) / 2 + 4} textAnchor="middle" fontSize="11.5" fill="#fff" fontWeight={600}>
              learned gap {(gapPct * 100).toFixed(1)}%
            </text>
          </g>
        )}
      </svg>
      <div className="stats" style={{ marginTop: 10 }}>
        <Stat l="Error vs fair pay" v={mae} d={1} suffix="k€" tone={mae > 6 ? 'bad' : 'good'} s="mean abs. error" />
        <Stat l="Gap at equal exp." v={Math.abs(gapPct * 100)} d={1} suffix="%" tone={Math.abs(gapPct) > 0.05 ? 'bad' : 'good'} s="EU threshold: 5%" />
        <Stat l="Senior offer error" v={extrap && !bounded ? senior : 0} d={0} prefix="+" suffix="k€" tone={extrap && !bounded && senior > 8 ? 'bad' : ''} s={extrap ? (bounded ? 'referred to humans' : '30-year hire') : 'not in scope'} />
        <Stat l="Slope" v={beta[1]} d={2} suffix="k/yr" s={huber ? 'Huber robust fit' : 'ordinary least squares'} />
      </div>
    </div>
  );
}

/* =====================================================================
   2. LOGISTIC REGRESSION — credit scoring
   ===================================================================== */
const CR = (() => {
  const r = rng(7);
  return Array.from({ length: 320 }, () => {
    const B = r() < 0.4;
    const x1 = clamp(0.55 + gauss(r) * 0.17 - (B ? 0.05 : 0), 0.02, 0.98);
    const x2 = clamp(0.42 + gauss(r) * 0.17, 0.02, 0.98);
    const zip = B ? (r() < 0.85 ? 1 : 0) : r() < 0.15 ? 1 : 0;
    const u = r();
    const flip = r();
    const xd = clamp(x1 - 0.12, 0.02, 0.98);
    return { B, x1, x2, zip, u, flip, xd };
  });
})();

export function CreditViz({ s, m }: VizProps) {
  const [thr, setThr] = useState(0.5);
  const useZip = s.has('zip') && !m.has('dropzip');
  const biased = s.has('labels') && !m.has('reweigh');
  const drift = s.has('drift');
  const retrained = drift && m.has('monitor');
  const opaque = s.has('opaque') && !m.has('explain');
  const model = useMemo(() => {
    const rows = CR.map((p, i) => {
      const isTest = i >= 220;
      const shifted = drift && (isTest || retrained);
      const x1 = shifted ? p.xd : p.x1;
      const trueP = sigmoid(7 * (x1 - p.x2) + 0.6);
      const yTrue = p.u < trueP ? 1 : 0;
      let yLab = yTrue;
      // historic local shock: a plant closure caused extra defaults in Southfield years ago
      if (!isTest && p.zip && yTrue === 1 && (p.flip * 7.3) % 1 < 0.45) yLab = 0;
      if (biased && p.B && yTrue === 1 && p.flip < 0.4) yLab = 0;
      return { ...p, x1, yTrue, yLab, isTest };
    });
    const train = rows.filter((r) => !r.isTest);
    let w: number[] | undefined;
    if (m.has('reweigh')) {
      const n = train.length;
      w = train.map((r) => {
        const pg = train.filter((q) => q.B === r.B).length / n;
        const py = train.filter((q) => q.yLab === r.yLab).length / n;
        const pgy = train.filter((q) => q.B === r.B && q.yLab === r.yLab).length / n;
        return (pg * py) / pgy;
      });
    }
    const beta = logreg(train.map((r) => (useZip ? [r.x1, r.x2, r.zip] : [r.x1, r.x2])), train.map((r) => r.yLab), w, 500, 1.2);
    return { rows, beta };
  }, [useZip, biased, drift, retrained, m]);
  const { rows, beta } = model;
  const p = (r: { x1: number; x2: number; zip: number }) => sigmoid(predictLin(beta, useZip ? [r.x1, r.x2, r.zip] : [r.x1, r.x2]));
  const test = rows.filter((r) => r.isTest);
  const acc = test.filter((r) => (p(r) >= thr ? 1 : 0) === r.yTrue).length / test.length;
  const appr = (g: boolean) => {
    const grp = test.filter((r) => r.B === g);
    return grp.filter((r) => p(r) >= thr).length / grp.length;
  };
  const aA = appr(false), aB = appr(true);
  const di = aA ? aB / aA : 0;
  const W = 680, H = 380, l = 50, rr = 16, t = 26, b = 40;
  const x = scale(0, 1, l, W - rr);
  const y = scale(0, 1, H - b, t);
  const N = 34;
  const logit = Math.log(thr / (1 - thr));
  const bnd = (zip: number) => {
    const b2 = beta[2] || -1e-6;
    const f = (x1: number) => (logit - beta[0] - beta[1] * x1 - (useZip ? beta[3] * zip : 0)) / b2;
    return `M${x(0)},${y(f(0))} L${x(1)},${y(f(1))}`;
  };
  return (
    <div>
      <VizHead title="income score × debt ratio · probability of repayment (trained live)">
        <div className="legend">
          <span><i className="dot" style={{ background: C.good }} /> repaid</span>
          <span><i className="dot" style={{ background: C.bad }} /> defaulted</span>
          <span>● group A</span>
          <span>◆ group B</span>
        </div>
      </VizHead>
      <svg viewBox={`0 0 ${W} ${H}`} className="viz-svg">
        <defs>
          <clipPath id="crclip"><rect x={l} y={t} width={W - l - rr} height={H - t - b} /></clipPath>
        </defs>
        <g clipPath="url(#crclip)">
          {Array.from({ length: N * N }, (_, k) => {
            const i = k % N, j = Math.floor(k / N);
            const cx = (i + 0.5) / N, cy = (j + 0.5) / N;
            const pv = p({ x1: cx, x2: cy, zip: 0 });
            return <rect key={k} x={x(i / N)} y={y((j + 1) / N)} width={(W - l - rr) / N + 0.5} height={(H - t - b) / N + 0.5} fill={pv >= thr ? C.good : C.bad} opacity={0.05 + Math.abs(pv - thr) * 0.32} style={{ transition: 'fill .4s, opacity .4s' }} />;
          })}
          <path d={bnd(0)} stroke="#fff" strokeWidth="2.5" style={{ transition: 'd .5s' }} />
          {useZip && <path d={bnd(1)} stroke={C.B} strokeWidth="2.5" strokeDasharray="6 5" />}
        </g>
        <AxisX x={x} y={H - b} ticks={[0, 0.25, 0.5, 0.75, 1]} label="income score →" />
        <AxisY x={l} y={y} w={0} ticks={[0, 0.25, 0.5, 0.75, 1]} label="debt ratio" />
        {rows.map((r, i) => {
          const col = r.yLab ? C.good : C.bad;
          const flipped = r.yLab !== r.yTrue;
          return r.B ? (
            <motion.rect key={i} initial={false} animate={{ x: x(r.x1) - 3.5, y: y(r.x2) - 3.5 }} transition={{ duration: 0.6 }} width="7" height="7" transform={`rotate(45 ${x(r.x1)} ${y(r.x2)})`} fill={col} stroke={flipped ? '#fff' : '#050816'} strokeWidth={flipped ? 1.6 : 0.8} opacity={r.isTest ? 1 : 0.55} />
          ) : (
            <motion.circle key={i} initial={false} animate={{ cx: x(r.x1), cy: y(r.x2) }} transition={{ duration: 0.6 }} r="3.6" fill={col} stroke="#050816" strokeWidth="0.8" opacity={r.isTest ? 1 : 0.55} />
          );
        })}
        {useZip && (
          <g>
            <rect x={W - rr - 238} y={t + 8} width="230" height="40" rx="8" fill="rgba(10,16,40,.9)" stroke={C.B} />
            <text x={W - rr - 226} y={t + 24} fontSize="11" fill="#fff" fontWeight={600}>Dashed = Southfield postcode</text>
            <text x={W - rr - 226} y={t + 39} fontSize="10.5" fill="#c9d1f2">same income & debt → stricter boundary</text>
          </g>
        )}
      </svg>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 260px', gap: 16, alignItems: 'end', marginTop: 8 }}>
        <div className="ctrl">
          <div className="ctrl-l"><span>Approval threshold — P(repay) ≥</span><b>{thr.toFixed(2)}</b></div>
          <input type="range" min={0.2} max={0.85} step={0.01} value={thr} onChange={(e) => setThr(+e.target.value)} />
        </div>
        <div style={{ fontSize: 12, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line)', background: 'rgba(255,255,255,.03)' }}>
          <div className="mono dim" style={{ fontSize: 10.5, marginBottom: 4 }}>DECISION LETTER · APPLICANT #4471</div>
          {opaque ? <span>Your application has been <b style={{ color: C.bad }}>declined</b>.</span> : <span>Declined. Main reasons: <b>debt ratio 0.61</b> (limit 0.45); income score 0.38. You may request human review.</span>}
        </div>
      </div>
      <div className="stats" style={{ marginTop: 12 }}>
        <Stat l="Accuracy (test)" v={acc * 100} d={1} suffix="%" tone={acc < 0.72 ? 'bad' : ''} s={drift ? (retrained ? 'recalibrated' : 'drifted data') : 'held-out applicants'} />
        <Stat l="Approval A" v={aA * 100} suffix="%" />
        <Stat l="Approval B" v={aB * 100} suffix="%" tone={di < 0.8 ? 'bad' : ''} />
        <Stat l="Disparate impact" v={di} d={2} tone={di < 0.8 ? 'bad' : 'good'} s="4/5ths rule: ≥ 0.80" />
      </div>
    </div>
  );
}

/* =====================================================================
   3. DECISION TREE — benefit-claim risk flags
   ===================================================================== */
const BEN = (() => {
  const r = rng(3);
  return Array.from({ length: 330 }, () => {
    const nat = r() < 0.3 ? 1 : 0;
    const income = clamp(0.5 + gauss(r) * 0.2 - nat * 0.04);
    const history = clamp(0.55 + gauss(r) * 0.22);
    const hours = clamp(r());
    const age = clamp(r());
    const score = 2.4 * income + 2.6 * history + 0.6 * hours - 2.75 + gauss(r) * 0.55;
    const ok = score > 0 ? 1 : 0;
    const u = r();
    return { f: [income, history, hours, age, nat], ok, u };
  });
})();
const FEAT = ['Income', 'Claim history', 'Childcare hrs', 'Age', 'Nationality'];

function layoutTree(root: TreeNode, maxD: number, W: number) {
  const nodes: { n: TreeNode; x: number; y: number; px?: number; py?: number; cut: number }[] = [];
  let leaf = 0;
  const count = (n: TreeNode): number => (n.feature === undefined || !n.left ? 1 : count(n.left) + count(n.right!));
  const total = (n: TreeNode, d: number): number => (n.feature === undefined || d >= maxD ? 1 : total(n.left!, d + 1) + total(n.right!, d + 1));
  const L = total(root, 0);
  const walk = (n: TreeNode, d: number, px?: number, py?: number): number => {
    const yy = 34 + d * 66;
    let xx: number;
    const isCut = n.feature !== undefined && d >= maxD;
    if (n.feature === undefined || d >= maxD) {
      xx = ((leaf + 0.5) / L) * (W - 40) + 20;
      leaf++;
    } else {
      const a = walk(n.left!, d + 1, undefined, undefined);
      const b = walk(n.right!, d + 1, undefined, undefined);
      xx = (a + b) / 2;
    }
    nodes.push({ n, x: xx, y: yy, px, py, cut: isCut ? count(n) : 0 });
    return xx;
  };
  walk(root, 0);
  // parents
  const pos = new Map(nodes.map((q) => [q.n.id, q]));
  for (const q of nodes) {
    if (q.n.left && q.n.depth < maxD) {
      const a = pos.get(q.n.left.id), b = pos.get(q.n.right!.id);
      if (a) { a.px = q.x; a.py = q.y; }
      if (b) { b.px = q.x; b.py = q.y; }
    }
  }
  return nodes;
}

export function TreeViz({ s, m }: VizProps) {
  const protectedIn = s.has('protected') && !m.has('features');
  const biased = s.has('protected') && !m.has('features');
  const small = s.has('small') && !m.has('cv');
  const depth = s.has('deep') ? (m.has('prune') ? 4 : 14) : 3;
  const nf = protectedIn ? 5 : 3;
  const { tree, trainAcc, testAcc, st, flagNat, flagOth } = useMemo(() => {
    const lab = BEN.map((p) => {
      let y = p.ok;
      if (biased && p.f[4] === 1 && y === 1 && p.u < 0.45) y = 0;
      if (biased && p.f[3] > 0.82 && y === 1 && p.u < 0.25) y = 0;
      return y;
    });
    const trainIdx = small ? BEN.slice(0, 50).map((_, i) => i) : BEN.slice(0, 230).map((_, i) => i);
    const Xtr = trainIdx.map((i) => BEN[i].f.slice(0, nf));
    const ytr = trainIdx.map((i) => lab[i]);
    const tree = cart(Xtr, ytr, depth, depth > 10 ? 1 : 4);
    const pr = (i: number) => (treePredict(tree, BEN[i].f.slice(0, nf)) >= 0.5 ? 1 : 0);
    const trainAcc = trainIdx.filter((i) => pr(i) === lab[i]).length / trainIdx.length;
    const testIdx = BEN.map((_, i) => i).slice(230);
    const testAcc = testIdx.filter((i) => pr(i) === BEN[i].ok).length / testIdx.length;
    const flag = (nat: number) => {
      const g = testIdx.filter((i) => BEN[i].f[4] === nat);
      return g.filter((i) => pr(i) === 0).length / g.length;
    };
    return { tree, trainAcc, testAcc, st: treeStats(tree), flagNat: flag(1), flagOth: flag(0) };
  }, [biased, small, depth, nf]);
  const W = 680;
  const nodes = layoutTree(tree, 4, W);
  const sig = `${depth}-${nf}-${small}-${biased}`;
  const protSplits = (st.features.get(3) ?? 0) + (st.features.get(4) ?? 0);
  return (
    <div>
      <VizHead title={`CART decision tree · depth limit ${depth > 10 ? '∞' : depth} · trained on ${small ? 50 : 230} claims`}>
        <div className="legend">
          <span><i className="dot" style={{ background: C.good }} /> claim in order</span>
          <span><i className="dot" style={{ background: C.bad }} /> flag for investigation</span>
          <span><i className="dot" style={{ background: 'transparent', border: '2px solid #ff5a6e' }} /> protected attribute</span>
        </div>
      </VizHead>
      <svg viewBox={`0 0 ${W} 330`} className="viz-svg" key={sig}>
        {nodes.map((q) =>
          q.px !== undefined ? (
            <motion.path key={`e${q.n.id}`} d={`M${q.px},${q.py! + 13} C${q.px},${(q.py! + q.y) / 2} ${q.x},${(q.py! + q.y) / 2} ${q.x},${q.y - 13}`} stroke="rgba(160,180,255,.35)" strokeWidth={1 + Math.sqrt(q.n.n) / 5} fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: q.n.depth * 0.18 }} />
          ) : null,
        )}
        {nodes.map((q) => {
          const prot = q.n.feature !== undefined && q.n.depth < 4 && q.n.feature >= 3;
          const col = `hsl(${Math.round(q.n.p * 165) - 5}, 85%, 60%)`;
          const internal = q.n.feature !== undefined && q.n.depth < 4;
          return (
            <motion.g key={q.n.id} initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: q.n.depth * 0.18 + 0.1, type: 'spring', stiffness: 200, damping: 16 }} style={{ transformOrigin: `${q.x}px ${q.y}px` }}>
              {prot && <circle cx={q.x} cy={q.y} r="22" fill="rgba(255,90,110,.18)"><animate attributeName="r" values="17;24;17" dur="1.6s" repeatCount="indefinite" /></circle>}
              <circle cx={q.x} cy={q.y} r={13} fill={col} fillOpacity={0.9} stroke={prot ? C.bad : '#050816'} strokeWidth={prot ? 3 : 2} />
              <text x={q.x} y={q.y + 3.5} textAnchor="middle" fontSize="9" fill="#050816" fontWeight={700} fontFamily="JetBrains Mono">{q.n.n}</text>
              {internal && (
                <text x={q.x} y={q.y - 19} textAnchor="middle" fontSize={q.n.depth < 2 ? 11 : 9} fill={prot ? '#ff9aa6' : '#c9d1f2'} fontWeight={600}>
                  {prot ? '⚠ ' : ''}{FEAT[q.n.feature!]} ≤ {q.n.thr!.toFixed(2)}
                </text>
              )}
              {q.cut > 0 && <text x={q.x} y={q.y + 28} textAnchor="middle" fontSize="9.5" fill={C.warn} fontFamily="JetBrains Mono">+{q.cut} leaves</text>}
            </motion.g>
          );
        })}
      </svg>
      <div className="stats" style={{ marginTop: 6 }}>
        <Stat l="Train accuracy" v={trainAcc * 100} d={1} suffix="%" />
        <Stat l="Test accuracy" v={testAcc * 100} d={1} suffix="%" tone={trainAcc - testAcc > 0.08 ? 'bad' : 'good'} s={`gap ${((trainAcc - testAcc) * 100).toFixed(1)} pts`} />
        <Stat l="Leaves" v={st.leaves} s={`depth ${st.depth}`} tone={st.leaves > 30 ? 'bad' : ''} />
        <Stat l="Flag rate · dual nat." v={flagNat * 100} suffix="%" tone={flagNat > flagOth * 1.35 ? 'bad' : ''} s={`others ${(flagOth * 100).toFixed(0)}%`} />
        <Stat l="Protected splits" v={protSplits} tone={protSplits ? 'bad' : 'good'} />
      </div>
    </div>
  );
}

/* =====================================================================
   4. GRADIENT BOOSTING — card fraud
   ===================================================================== */
const STREAM = (() => {
  const r = rng(21);
  return Array.from({ length: 46 }, (_, i) => ({ off: i / 46 + r() * 0.01, lane: r(), fraud: r() < 0.16, z: gauss(r), mix: r() }));
})();

export function FraudViz({ s, m }: VizProps) {
  const [thrUser, setThr] = useState(0.5);
  const accOnly = s.has('accuracy') && !m.has('cost');
  const thr = accOnly ? 0.97 : thrUser;
  const drift = s.has('drift');
  const fixedDrift = drift && m.has('champion');
  const probe = s.has('probe') && !m.has('redteam');
  const shap = m.has('shap');
  const blackbox = s.has('blackbox') && !shap;
  const base = 0.006;
  // fraud score mixture
  const comps: { w: number; mu: number; sd: number }[] = [];
  let rest = 1;
  if (probe) { comps.push({ w: 0.25, mu: thr - 0.06, sd: 0.03 }); rest -= 0.25; }
  if (drift && !fixedDrift) { comps.push({ w: rest * 0.6, mu: 0.36, sd: 0.09 }); rest *= 0.4; }
  comps.push({ w: rest, mu: fixedDrift ? 0.69 : 0.74, sd: 0.11 });
  const recall = comps.reduce((a, c) => a + c.w * (1 - phi((thr - c.mu) / c.sd)), 0);
  const fpr = 1 - phi((thr - 0.2) / 0.1);
  const acc = (1 - base) * (1 - fpr) + base * recall;
  const prec = (base * recall) / (base * recall + (1 - base) * fpr || 1);
  const blocked = 10000 * (1 - base) * fpr;
  const t = useClock();
  const W = 680, H = 210;
  const x = scale(0, 1, 40, W - 16);
  const yD = scale(0, 4.2, H - 30, 14);
  const pdf = (v: number, mu: number, sd: number) => Math.exp(-((v - mu) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI));
  const xs = Array.from({ length: 101 }, (_, i) => i / 100);
  const legitPath = xs.map((v, i) => `${i ? 'L' : 'M'}${x(v)},${yD(pdf(v, 0.2, 0.1))}`).join(' ');
  const fraudPath = xs.map((v, i) => `${i ? 'L' : 'M'}${x(v)},${yD(comps.reduce((a, c) => a + c.w * pdf(v, c.mu, c.sd), 0) * 0.7)}`).join(' ');
  return (
    <div>
      <VizHead title="live transaction stream → boosted-tree score → decision gate">
        <div className="legend">
          <span><i className="dot" style={{ background: '#8fa3d9' }} /> legit</span>
          <span><i className="dot" style={{ background: C.bad }} /> fraud</span>
        </div>
      </VizHead>
      <svg viewBox={`0 0 ${W} 150`} className="viz-svg" style={{ borderRadius: 12, background: 'rgba(255,255,255,.02)' }}>
        <rect x={W * 0.52} y={8} width="10" height="134" rx="5" fill="url(#gate)" />
        <defs>
          <linearGradient id="gate" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#7cf7e4" /><stop offset="1" stopColor="#6b8cff" /></linearGradient>
        </defs>
        <text x={W * 0.52 + 5} y={146} textAnchor="middle" fontSize="9" fill="#9aa6cf" fontFamily="JetBrains Mono">MODEL</text>
        <text x={W - 10} y={30} textAnchor="end" fontSize="10.5" fill="#9aa6cf" fontFamily="JetBrains Mono">APPROVED</text>
        <text x={W - 10} y={128} textAnchor="end" fontSize="10.5" fill={C.bad} fontFamily="JetBrains Mono">{blackbox ? 'CARD FROZEN' : 'ANALYST REVIEW'}</text>
        <line x1={W * 0.56} x2={W - 10} y1={108} y2={108} stroke="rgba(255,90,110,.3)" strokeDasharray="3 4" />
        {STREAM.map((d, i) => {
          const ph = (t * 0.09 + d.off) % 1;
          let score: number;
          if (d.fraud) {
            let acc2 = 0, chosen = comps[comps.length - 1];
            for (const c of comps) { acc2 += c.w; if (d.mix <= acc2) { chosen = c; break; } }
            score = chosen.mu + d.z * chosen.sd;
          } else score = 0.2 + d.z * 0.1;
          const flagged = score >= thr;
          const px = 10 + ph * (W - 20);
          const baseY = 30 + d.lane * 50;
          const py = px > W * 0.55 && flagged ? baseY + Math.min(1, (px - W * 0.55) / 60) * (112 - baseY) : baseY;
          return <circle key={i} cx={px} cy={py} r={d.fraud ? 4.2 : 3.2} fill={d.fraud ? C.bad : '#8fa3d9'} opacity={d.fraud ? 1 : 0.65} />;
        })}
      </svg>
      <svg viewBox={`0 0 ${W} ${H}`} className="viz-svg" style={{ marginTop: 8 }}>
        <AxisX x={x} y={H - 30} ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]} label="fraud score" />
        <path d={`${legitPath} L${x(1)},${yD(0)} L${x(0)},${yD(0)} Z`} fill="rgba(143,163,217,.18)" stroke="#8fa3d9" />
        <motion.path animate={{ d: `${fraudPath} L${x(1)},${yD(0)} L${x(0)},${yD(0)} Z` }} transition={{ duration: 0.6 }} fill="rgba(255,90,110,.2)" stroke={C.bad} strokeWidth="1.5" />
        <motion.line animate={{ x1: x(thr), x2: x(thr) }} y1={10} y2={H - 30} stroke="#fff" strokeWidth="2" strokeDasharray="5 4" />
        <motion.text animate={{ x: thr > 0.75 ? x(thr) - 6 : x(thr) + 6 }} y={22} fontSize="11" fill="#fff" fontFamily="JetBrains Mono" textAnchor={thr > 0.75 ? 'end' : 'start'}>threshold {thr.toFixed(2)}</motion.text>
        <text x={W - 16} y={H - 40} textAnchor="end" fontSize="10" fill="#9aa6cf">fraud density not to scale (0.6% of volume)</text>
      </svg>
      <div style={{ display: 'grid', gridTemplateColumns: shap ? 'minmax(0,1fr) 280px' : '1fr', gap: 16, marginTop: 4 }}>
        <div className="ctrl">
          <div className="ctrl-l"><span>Decision threshold {accOnly && <Flag tone="warn">auto-tuned for accuracy</Flag>}</span><b>{thr.toFixed(2)}</b></div>
          <input type="range" min={0.2} max={0.95} step={0.01} value={thr} disabled={accOnly} onChange={(e) => setThr(+e.target.value)} />
        </div>
        {shap && (
          <div style={{ fontSize: 11.5, border: '1px solid var(--line)', borderRadius: 10, padding: 10 }}>
            <div className="mono dim" style={{ fontSize: 10.5, marginBottom: 6 }}>SHAP · TXN 88-201 · score 0.81</div>
            {[['New device', 0.31], ['Foreign merchant', 0.22], ['Amount €1,940', 0.18], ['Night-time', 0.07], ['Customer tenure 9y', -0.12]].map(([k, v]) => (
              <div key={k as string} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 36px', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <span className="muted">{k}</span>
                <div style={{ height: 8, position: 'relative' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.abs(v as number) * 260}%` }} style={{ position: 'absolute', left: (v as number) < 0 ? undefined : '30%', right: (v as number) < 0 ? '70%' : undefined, height: 8, borderRadius: 3, background: (v as number) > 0 ? C.bad : C.good }} />
                </div>
                <span className="mono" style={{ color: (v as number) > 0 ? '#ff9aa6' : C.good }}>{(v as number) > 0 ? '+' : ''}{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="stats" style={{ marginTop: 12 }}>
        <Stat l="Accuracy" v={acc * 100} d={2} suffix="%" s="looks great…" />
        <Stat l="Fraud caught" v={recall * 100} d={0} suffix="%" tone={recall < 0.6 ? 'bad' : 'good'} s="recall" />
        <Stat l="Precision" v={prec * 100} d={0} suffix="%" s="of flagged = fraud" />
        <Stat l="Good customers hit" v={blocked} d={0} s="per 10k transactions" tone={blocked > 150 ? 'bad' : ''} />
      </div>
    </div>
  );
}

/* =====================================================================
   5. K-MEANS — customer segmentation
   ===================================================================== */
const DISTRICTS = [
  { name: 'Northgate', x: 175, y: 105, b: 0.18, inc: 0.75 },
  { name: 'Riverside', x: 485, y: 120, b: 0.5, inc: 0.52 },
  { name: 'Southfield', x: 320, y: 275, b: 0.82, inc: 0.32 },
];
const HH = (() => {
  const r = rng(5);
  return Array.from({ length: 240 }, (_, i) => {
    const d = DISTRICTS[i % 3];
    const B = r() < d.b;
    const inc = clamp(d.inc + gauss(r) * 0.13);
    return {
      x: d.x + gauss(r) * 62,
      y: d.y + gauss(r) * 42,
      B,
      spend: clamp(inc * 0.75 + gauss(r) * 0.12 + 0.1),
      freq: clamp(0.5 + gauss(r) * 0.2),
    };
  });
})();
const KC = ['#7cf7e4', '#ffc857', '#b892ff'];

export function SegmentViz({ s, m }: VizProps) {
  const loc = s.has('location') && !m.has('behaviour');
  const auto = s.has('autooffer') && !m.has('audit');
  const broker = s.has('broker') && !m.has('dpia');
  const [color, setColor] = useState<'seg' | 'demo'>('seg');
  const steps = useMemo(() => {
    const P = HH.map((h) => (loc ? [h.x / 260, h.y / 260, h.spend * 0.6] : [h.spend * 2, h.freq * 2]));
    return kmeansSteps(P, 3, [3, 100, 200], 9);
  }, [loc]);
  const [step, setStep] = useState(0);
  useEffect(() => {
    setStep(0);
    const iv = setInterval(() => setStep((v) => (v < steps.length - 1 ? v + 1 : v)), 380);
    return () => clearInterval(iv);
  }, [steps]);
  const A = steps[step].A;
  const clusters = [0, 1, 2].map((k) => {
    const mem = HH.filter((_, i) => A[i] === k);
    return { k, n: mem.length, b: mem.filter((h) => h.B).length / (mem.length || 1), spend: mem.reduce((a, h) => a + h.spend, 0) / (mem.length || 1) };
  });
  const top = [...clusters].sort((a, b) => b.spend - a.spend)[0].k;
  const offer = (h: (typeof HH)[number], i: number) => (auto ? A[i] === top : h.spend > 0.55);
  const access = (B: boolean) => {
    const g = HH.map((h, i) => ({ h, i })).filter(({ h }) => h.B === B);
    return g.filter(({ h, i }) => offer(h, i)).length / g.length;
  };
  const aA = access(false), aB = access(true);
  const overallB = HH.filter((h) => h.B).length / HH.length;
  const align = clusters.reduce((a, c) => a + Math.abs(c.b - overallB) * c.n, 0) / HH.length / overallB;
  const W = 680, H = 360;
  const fx = scale(0, 2, 18, 202), fy = scale(0, 2, 202, 18);
  return (
    <div>
      <VizHead title={`k-means (k = 3) · iteration ${step + 1}/${steps.length} · features: ${loc ? 'location + spend' : 'spend + visit frequency'}`}>
        <Seg options={[{ v: 'seg', l: 'Colour: segment' }, { v: 'demo', l: 'Colour: demographic' }]} value={color} onChange={setColor} />
      </VizHead>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 220px', gap: 14 }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="viz-svg" style={{ background: 'rgba(255,255,255,.02)', borderRadius: 12 }}>
          <defs>
            <filter id="blur"><feGaussianBlur stdDeviation="22" /></filter>
            <pattern id="streets" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="rgba(130,160,255,.06)" /></pattern>
          </defs>
          <rect width={W} height={H} fill="url(#streets)" />
          <path d="M0,205 C150,175 260,230 400,195 S600,160 680,190" stroke="rgba(76,201,240,.25)" strokeWidth="14" fill="none" />
          {DISTRICTS.map((d) => (
            <g key={d.name}>
              <ellipse cx={d.x} cy={d.y} rx="120" ry="78" fill={`rgba(${Math.round(107 + d.b * 148)},${Math.round(140 - d.b * 40)},${Math.round(255 - d.b * 100)},.16)`} filter="url(#blur)" />
              <text x={d.x} y={d.y - 74} textAnchor="middle" fontSize="12" fill="#c9d1f2" fontWeight={600} letterSpacing="1">{d.name.toUpperCase()}</text>
            </g>
          ))}
          {HH.map((h, i) => {
            const fill = color === 'seg' ? KC[A[i]] : h.B ? C.B : C.A;
            return <circle key={i} cx={h.x} cy={h.y} r={offer(h, i) ? 4.6 : 3.2} fill={fill} stroke={offer(h, i) ? '#fff' : 'none'} strokeWidth="1" style={{ transition: 'fill .35s, r .35s' }} />;
          })}
          {broker && (
            <g>
              <rect x={W - 250} y={H - 52} width="236" height="40" rx="8" fill="rgba(10,16,40,.92)" stroke={C.bad} />
              <text x={W - 238} y={H - 36} fontSize="11" fill="#ff9aa6" fontWeight={600}>+ broker data: inferred religion, health,</text>
              <text x={W - 238} y={H - 21} fontSize="11" fill="#ff9aa6" fontWeight={600}>ethnicity · 2.1M profiles</text>
            </g>
          )}
          <text x={14} y={H - 14} fontSize="10.5" fill="#9aa6cf" fontFamily="JetBrains Mono">○ white ring = receives premium offer & same-day delivery</text>
        </svg>
        <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
          <svg viewBox="0 0 220 220" className="viz-svg" style={{ background: 'rgba(255,255,255,.02)', borderRadius: 12 }}>
            <text x={10} y={14} fontSize="9.5" fill="#9aa6cf" fontFamily="JetBrains Mono">FEATURE SPACE</text>
            {HH.map((h, i) => {
              const P = loc ? [h.x / 340, 2 - h.y / 190] : [h.spend * 2, h.freq * 2];
              return <circle key={i} cx={fx(P[0])} cy={fy(P[1])} r="2.2" fill={KC[A[i]]} opacity=".7" />;
            })}
            {steps[step].C.map((c, k) => {
              const P = loc ? [c[0] * 260 / 340, 2 - c[1] * 260 / 190] : [c[0], c[1]];
              return (
                <motion.g key={k} animate={{ x: fx(P[0]), y: fy(P[1]) }} transition={{ duration: 0.35 }}>
                  <circle r="9" fill="none" stroke={KC[k]} strokeWidth="2.5" />
                  <path d="M-5,0H5M0,-5V5" stroke="#fff" strokeWidth="2" />
                </motion.g>
              );
            })}
          </svg>
          <div>
            <div className="mono dim" style={{ fontSize: 10.5, marginBottom: 6 }}>GROUP B SHARE PER SEGMENT</div>
            {clusters.map((c) => (
              <div key={c.k} style={{ display: 'grid', gridTemplateColumns: '14px 1fr 38px', gap: 8, alignItems: 'center', marginBottom: 5 }}>
                <span className="dot" style={{ background: KC[c.k] }} />
                <div style={{ height: 8, borderRadius: 4, background: 'rgba(107,140,255,.3)', overflow: 'hidden' }}>
                  <motion.div animate={{ width: `${c.b * 100}%` }} style={{ height: 8, background: C.B }} />
                </div>
                <span className="mono" style={{ fontSize: 11 }}>{Math.round(c.b * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="stats" style={{ marginTop: 12 }}>
        <Stat l="Demographic alignment" v={align * 100} suffix="%" tone={align > 0.4 ? 'bad' : 'good'} s="segments ≈ groups?" />
        <Stat l="Offer access A" v={aA * 100} suffix="%" />
        <Stat l="Offer access B" v={aB * 100} suffix="%" tone={aB < aA * 0.7 ? 'bad' : ''} s={auto ? 'routed by segment' : 'by individual eligibility'} />
        <Stat l="Special-category data" v={broker ? 3 : 0} s="attributes in use" tone={broker ? 'bad' : 'good'} />
      </div>
    </div>
  );
}

/* =====================================================================
   6. TIME-SERIES — hospital staffing
   ===================================================================== */
const ADM = (() => {
  const r = rng(9);
  const wk = [8, 6, 2, 0, -2, -9, -5];
  return Array.from({ length: 455 }, (_, d) => ({ base: 120 + 24 * Math.cos((2 * Math.PI * (d - 440)) / 365) + wk[d % 7], noise: gauss(r) * 5 }));
})();

export function StaffingViz({ s, m }: VizProps) {
  const shock = s.has('shock');
  const adapt = shock && m.has('anomaly');
  const auto = s.has('auto') && !m.has('hitl');
  const hitl = m.has('hitl');
  const short = s.has('short') && !m.has('backtest');
  const T0 = 365;
  const actual = ADM.map((a, d) => {
    let v = a.base + a.noise;
    if (shock && d >= 385) v *= 1 + 0.55 * clamp((d - 385) / 22);
    return v;
  });
  const fc = useMemo(() => {
    const feats = (d: number) => {
      const wd = Array.from({ length: 6 }, (_, k) => (d % 7 === k ? 1 : 0));
      return short ? wd : [Math.cos((2 * Math.PI * d) / 365), Math.sin((2 * Math.PI * d) / 365), ...wd];
    };
    const from = short ? T0 - 90 : 0;
    const X: number[][] = [], Y: number[] = [];
    for (let d = from; d < T0; d++) { X.push(feats(d)); Y.push(actual[d]); }
    const beta = linreg(X, Y);
    return ADM.map((_, d) => predictLin(beta, feats(d)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [short]);
  const forecast = fc.map((v, d) => {
    // rolling recalibration: scale by last week's observed / forecast ratio
    if (adapt && d >= 393) {
      let ra = 0, rf = 0;
      for (let k = 1; k <= 7; k++) { ra += actual[d - k]; rf += fc[d - k]; }
      return v * Math.max(1, ra / rf);
    }
    return v;
  });
  const cap = forecast.map((f, d) => {
    let c = f * (auto ? 1.0 : 1.12);
    if (hitl && d > T0 + 1) c = Math.max(c, actual[d - 1] * 1.03);
    return c;
  });
  const win = Array.from({ length: 90 }, (_, i) => T0 + i);
  const under = win.filter((d) => actual[d] > cap[d]);
  const waiting = win.reduce((a, d) => a + Math.max(0, actual[d] - cap[d]), 0);
  const over = win.reduce((a, d) => a + Math.max(0, cap[d] - actual[d]), 0);
  const mape = win.reduce((a, d) => a + Math.abs(forecast[d] - actual[d]) / actual[d], 0) / win.length;
  const W = 680, H = 340, l = 46, rr = 14, t = 16, b = 36;
  const x = scale(T0 - 110, T0 + 90, l, W - rr);
  const y = scale(60, 260, H - b, t);
  const line = (arr: number[], from: number, to: number) => {
    let p = '';
    for (let d = from; d < to; d++) p += `${d === from ? 'M' : 'L'}${x(d).toFixed(1)},${y(arr[d]).toFixed(1)}`;
    return p;
  };
  const band = (() => {
    let p = '';
    for (let d = T0; d < T0 + 90; d++) p += `${d === T0 ? 'M' : 'L'}${x(d)},${y(forecast[d] * 1.09)}`;
    for (let d = T0 + 89; d >= T0; d--) p += `L${x(d)},${y(forecast[d] * 0.91)}`;
    return p + 'Z';
  })();
  const key = `${shock}${adapt}${auto}${hitl}${short}`;
  return (
    <div>
      <VizHead title="daily admissions · history | forecast window (90 days) · staffed capacity">
        <div className="legend">
          <span><i className="dot" style={{ background: '#c9d1f2' }} /> actual</span>
          <span><i className="dot" style={{ background: '#6b8cff' }} /> forecast ± band</span>
          <span><i className="dot" style={{ background: C.warn }} /> staffed beds</span>
          <span><i className="dot" style={{ background: C.bad }} /> understaffed</span>
        </div>
      </VizHead>
      <svg viewBox={`0 0 ${W} ${H}`} className="viz-svg">
        <AxisY x={l} y={y} w={W - l - rr} ticks={[80, 120, 160, 200, 240]} />
        <AxisX x={x} y={H - b} ticks={[T0 - 98, T0 - 56, T0 - 14, T0, T0 + 28, T0 + 56, T0 + 84]} fmt={(d) => (d === T0 ? 'today' : `${d < T0 ? '' : '+'}${Math.round((d - T0) / 7)}w`)} />
        <rect x={x(T0)} y={t} width={x(T0 + 90) - x(T0)} height={H - t - b} fill="rgba(107,140,255,.05)" />
        <line x1={x(T0)} x2={x(T0)} y1={t} y2={H - b} stroke="rgba(255,255,255,.35)" strokeDasharray="3 4" />
        {short && <rect x={x(T0 - 90)} y={H - b - 6} width={x(T0) - x(T0 - 90)} height="4" rx="2" fill={C.warn} />}
        {short && <text x={x(T0 - 45)} y={H - b - 10} textAnchor="middle" fontSize="9.5" fill={C.warn} fontFamily="JetBrains Mono">training window</text>}
        <path d={band} fill="rgba(107,140,255,.16)" />
        {win.map((d) =>
          actual[d] > cap[d] ? <rect key={d} x={x(d) - 1.6} y={y(actual[d])} width="3.2" height={y(cap[d]) - y(actual[d])} fill={C.bad} opacity=".75" /> : null,
        )}
        <path d={line(actual, T0 - 110, T0)} stroke="#c9d1f2" strokeWidth="1.6" fill="none" />
        <motion.path key={`a${key}`} d={line(actual, T0, T0 + 90)} stroke="#fff" strokeWidth="2" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: 'easeOut' }} />
        <path d={line(forecast, T0, T0 + 90)} stroke="#6b8cff" strokeWidth="2" strokeDasharray="6 4" fill="none" />
        <path d={line(cap, T0, T0 + 90)} stroke={C.warn} strokeWidth="2" fill="none" />
        {shock && (
          <g>
            <line x1={x(385)} x2={x(385)} y1={t} y2={H - b} stroke={C.bad} strokeDasharray="2 3" />
            <text x={x(385) + 6} y={t + 14} fontSize="10.5" fill="#ff9aa6" fontFamily="JetBrains Mono">virus wave begins</text>
            {adapt && <text x={x(393) + 6} y={t + 30} fontSize="10.5" fill={C.good} fontFamily="JetBrains Mono">anomaly alert → re-forecast</text>}
          </g>
        )}
      </svg>
      <div className="stats" style={{ marginTop: 8 }}>
        <Stat l="Forecast error" v={mape * 100} d={1} suffix="%" tone={mape > 0.12 ? 'bad' : 'good'} s="MAPE, next 90 days" />
        <Stat l="Understaffed days" v={under.length} tone={under.length > 12 ? 'bad' : under.length > 4 ? '' : 'good'} s="of 90" />
        <Stat l="Patients waiting" v={waiting} tone={waiting > 200 ? 'bad' : ''} s="bed-days without staff" />
        <Stat l="Idle staff" v={over} s="bed-days over capacity" />
      </div>
    </div>
  );
}
