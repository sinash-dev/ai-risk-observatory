import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
import { RiskRadar, Starfield } from '../components/ui';
import { LABS } from '../data/labs';
import { RISKS, RISK_BY_KEY, TIERS, TIER_BY_ID, exposure } from '../data/risks';
import type { LabDef, RiskKey } from '../data/types';
import { go, useClock, useProgress } from '../lib/util';

const W = 1100, H = 700, CX = 550, CY = 350;
const RX = [170, 275, 375, 470];
const RY = 0.58;

function cosine(a: number[], b: number[]) {
  const d = a.reduce((s, v, i) => s + v * b[i], 0);
  return d / (Math.hypot(...a) * Math.hypot(...b));
}

export function Observatory() {
  const [lens, setLens] = useState<RiskKey | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const progress = useProgress();
  const t = useClock();
  const frozen = useRef({ at: 0, offset: 0 });
  // freeze rotation while hovering
  if (hover && frozen.current.at === 0) frozen.current.at = t;
  if (!hover && frozen.current.at) { frozen.current.offset += t - frozen.current.at; frozen.current.at = 0; }
  const time = hover ? frozen.current.at - frozen.current.offset : t - frozen.current.offset;

  const exp = useMemo(() => Object.fromEntries(LABS.map((l) => [l.id, exposure(l)])), []);
  const pos = (lab: LabDef) => {
    const tier = TIER_BY_ID[lab.tier];
    const peers = LABS.filter((l) => l.tier === lab.tier);
    const k = peers.indexOf(lab);
    const a = (k / peers.length) * Math.PI * 2 + tier.ring * 0.9 + time * (0.05 / tier.ring);
    const rx = RX[tier.ring - 1];
    const x = CX + Math.cos(a) * rx;
    const y = CY + Math.sin(a) * rx * RY;
    const depth = (Math.sin(a) + 1) / 2; // 0 back → 1 front
    return { x, y, depth };
  };
  const links = useMemo(() => {
    const out: { a: LabDef; b: LabDef; c: number }[] = [];
    for (let i = 0; i < LABS.length; i++)
      for (let j = i + 1; j < LABS.length; j++) {
        const va = RISKS.map((r) => exp[LABS[i].id][r.key]);
        const vb = RISKS.map((r) => exp[LABS[j].id][r.key]);
        const c = cosine(va, vb);
        if (c > 0.9 && LABS[i].tier !== LABS[j].tier) out.push({ a: LABS[i], b: LABS[j], c });
      }
    return out;
  }, [exp]);
  const hovered = LABS.find((l) => l.id === hover);
  const hp = hovered ? pos(hovered) : null;

  return (
    <div>
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <Starfield />
        <div className="wrap" style={{ position: 'relative', paddingTop: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <div className="eyebrow">The Observatory</div>
              <h1 className="h2" style={{ marginTop: 10 }}>Pick a model. Every orbit adds autonomy.</h1>
              <p className="lead" style={{ marginTop: 10 }}>
                {LABS.length} models on four orbits — from classical ML at the core to agentic AI at the edge. Lines connect models across tiers with near-identical risk fingerprints.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: 520 }}>
              <button className="chip" onClick={() => setLens(null)} style={{ cursor: 'pointer', background: !lens ? 'rgba(124,247,228,.14)' : 'transparent', color: !lens ? '#7cf7e4' : undefined }}>All lenses</button>
              {RISKS.map((r) => (
                <button key={r.key} className="chip" onClick={() => setLens(lens === r.key ? null : r.key)} style={{ cursor: 'pointer', color: lens === r.key ? '#050816' : r.color, background: lens === r.key ? r.color : 'transparent', borderColor: r.color + '66' }}>
                  {r.short}
                </button>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative', marginTop: 10 }}>
            <svg viewBox={`0 0 ${W} ${H}`} className="viz-svg" style={{ overflow: 'visible' }}>
              <defs>
                <radialGradient id="core">
                  <stop offset="0" stopColor="#fff" />
                  <stop offset=".25" stopColor="#7cf7e4" />
                  <stop offset="1" stopColor="#2b6cff" stopOpacity="0" />
                </radialGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              {TIERS.map((tier, i) => (
                <g key={tier.id}>
                  <ellipse cx={CX} cy={CY} rx={RX[i]} ry={RX[i] * RY} fill="none" stroke={tier.color} strokeOpacity=".22" strokeWidth="1.2" strokeDasharray={i % 2 ? '2 6' : undefined} />
                  <text x={CX} y={CY - RX[i] * RY - 7} textAnchor="middle" fontSize="10.5" fill={tier.color} fontFamily="JetBrains Mono" letterSpacing="2" opacity=".75">{tier.label.toUpperCase()}</text>
                </g>
              ))}
              <circle cx={CX} cy={CY} r="70" fill="url(#core)" opacity=".5">
                <animate attributeName="r" values="62;76;62" dur="5s" repeatCount="indefinite" />
              </circle>
              <circle cx={CX} cy={CY} r="9" fill="#fff" filter="url(#glow)" />
              <text x={CX} y={CY + 34} textAnchor="middle" fontSize="11" fill="#c9d1f2" fontFamily="JetBrains Mono" letterSpacing="2">DATA</text>
              {links.map(({ a, b, c }, i) => {
                const pa = pos(a), pb = pos(b);
                const hl = hover === a.id || hover === b.id;
                return (
                  <path key={i} d={`M${pa.x},${pa.y} Q${CX},${CY - 40} ${pb.x},${pb.y}`} fill="none" stroke={hl ? '#ffffff' : '#9db1ff'} strokeOpacity={hl ? 0.8 : (c - 0.9) * 3} strokeWidth={hl ? 1.6 : 1} strokeDasharray="3 5" />
                );
              })}
              {[...LABS].sort((a, b) => pos(a).depth - pos(b).depth).map((lab) => {
                const p = pos(lab);
                const tier = TIER_BY_ID[lab.tier];
                const lensV = lens ? exp[lab.id][lens] : 50;
                const dim = lens ? lensV < 35 : false;
                const r = (18 + (lens ? lensV / 5 : 4)) * (0.78 + p.depth * 0.32);
                const done = progress.labs[lab.id];
                const col = lens ? RISK_BY_KEY[lens].color : tier.color;
                return (
                  <g key={lab.id} style={{ cursor: 'pointer' }} opacity={dim ? 0.3 : 0.55 + p.depth * 0.45} onMouseEnter={() => setHover(lab.id)} onMouseLeave={() => setHover(null)} onClick={() => go(`/lab/${lab.id}`)}>
                    <circle cx={p.x} cy={p.y} r={r + 12} fill={col} opacity={hover === lab.id ? 0.28 : 0.1} />
                    <circle cx={p.x} cy={p.y} r={r} fill="#0b1230" stroke={col} strokeWidth={hover === lab.id ? 3 : 2} filter={hover === lab.id ? 'url(#glow)' : undefined} />
                    <text x={p.x} y={p.y + 4.5} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff" fontFamily="Space Grotesk">{lab.glyph}</text>
                    <text x={p.x} y={p.y + r + 15} textAnchor="middle" fontSize="11" fill="#dfe5ff" fontWeight={600} style={{ paintOrder: 'stroke' }} stroke="#050816" strokeWidth="3">{lab.app}</text>
                    {done && <circle cx={p.x + r * 0.75} cy={p.y - r * 0.75} r="8" fill="#2ee6c5" stroke="#050816" strokeWidth="2" />}
                    {done && <text x={p.x + r * 0.75} y={p.y - r * 0.75 + 3.5} textAnchor="middle" fontSize="9" fontWeight={700} fill="#050816">{done.letter}</text>}
                  </g>
                );
              })}
            </svg>
            <AnimatePresence>
              {hovered && hp && (
                <motion.div key={hovered.id} className="tooltip" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ left: `min(calc(${(hp.x / W) * 100}% + 30px), calc(100% - 270px))`, top: `${(hp.y / H) * 100}%`, transform: 'translateY(-50%)' }}>
                  <div className="mono" style={{ fontSize: 10.5, color: TIER_BY_ID[hovered.tier].color }}>{TIER_BY_ID[hovered.tier].label.toUpperCase()} · EU {hovered.euTier.toUpperCase()}</div>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: 600, fontSize: 17, marginTop: 2 }}>{hovered.model}</div>
                  <div className="muted" style={{ fontSize: 12.5 }}>{hovered.app}</div>
                  <div style={{ width: 170, margin: '6px auto 0' }}><RiskRadar risk={exp[hovered.id]} size={170} labels={false} /></div>
                  <div className="dim" style={{ fontSize: 11, textAlign: 'center' }}>unmitigated risk fingerprint · click to open</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 40 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18 }}>
          {TIERS.map((tier) => (
            <div key={tier.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ width: 26, height: 26, borderRadius: 8, border: `2px solid ${tier.color}`, display: 'grid', placeItems: 'center', color: tier.color, fontFamily: 'var(--mono)', fontSize: 12 }}>{tier.ring}</span>
                <div>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: 600 }}>{tier.label}</div>
                  <div className="dim" style={{ fontSize: 12 }}>{tier.autonomy}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {LABS.filter((l) => l.tier === tier.id).map((lab) => {
                  const done = progress.labs[lab.id];
                  return (
                    <motion.button key={lab.id} whileHover={{ x: 4 }} onClick={() => go(`/lab/${lab.id}`)} className="panel" style={{ textAlign: 'left', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', borderColor: done ? tier.color + '55' : undefined }}>
                      <span style={{ width: 34, height: 34, borderRadius: 10, background: tier.color + '1f', color: tier.color, display: 'grid', placeItems: 'center', fontFamily: 'var(--display)', fontWeight: 700, fontSize: 13, flex: 'none' }}>{lab.glyph}</span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', fontWeight: 600, fontSize: 13.5 }}>{lab.model}</span>
                        <span className="muted" style={{ fontSize: 12 }}>{lab.app}</span>
                      </span>
                      {done ? <span className="mono" style={{ color: tier.color, fontWeight: 700 }}>{done.letter}</span> : <span className="dim">→</span>}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
