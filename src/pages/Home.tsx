import { useState } from 'react';
import { FW_BY_ID, type FwId } from '../data/frameworks';
import { LABS, fwEntry } from '../data/labs';
import { TIERS, TIER_BY_ID } from '../data/risks';
import type { LabDef } from '../data/types';
import { useLens } from '../lib/lens';
import { go } from '../lib/util';

export const SHORT_NAME: Record<string, string> = {
  spam: 'Naive Bayes', salary: 'Linear regression', credit: 'Logistic regression', benefits: 'Decision tree', fraud: 'Gradient boosting',
  segments: 'k-means clustering', staffing: 'Time-series forecast', lesion: 'Image classifier (CNN)', face: 'Face recognition', emotion: 'Emotion recognition',
  cv: 'Text classifier', feed: 'Recommender system', pricing: 'Reinforcement learning', foundation: 'Foundation model', chatbot: 'LLM chatbot',
  rag: 'Retrieval (RAG) assistant', imagegen: 'Image generator', code: 'Code assistant', 'travel-agent': 'Tool-using agent', 'devops-agent': 'Coding agent', swarm: 'Multi-agent system',
};

const W = 1100, H = 690, CX = 550, CY = 330, RY = 0.6;
const RX = [160, 280, 390, 500];
const EXTRA = [0, 0.51, 0, 0];

function positions() {
  const pos: Record<string, { x: number; y: number }> = {};
  TIERS.forEach((t, ti) => {
    const labs = LABS.filter((l) => l.tier === t.id);
    labs.forEach((l, k) => {
      const a = -Math.PI / 2 + Math.PI / labs.length + EXTRA[ti] + (k / labs.length) * Math.PI * 2;
      pos[l.id] = { x: CX + Math.cos(a) * RX[ti], y: CY + Math.sin(a) * RX[ti] * RY };
    });
  });
  return pos;
}
const POS = positions();

function colourFor(lab: LabDef, lens: FwId | 'all') {
  if (lens === 'all') return { stroke: TIER_BY_ID[lab.tier].color, fill: '#fff', status: TIER_BY_ID[lab.tier].label };
  const e = fwEntry(lens, lab.id);
  const cat = FW_BY_ID[lens].cats.find((c) => c.id === e.cat)!;
  return { stroke: cat.color, fill: cat.color, status: e.status };
}

function ModelMap() {
  const lens = useLens();
  const [hover, setHover] = useState<string | null>(null);
  const hl = hover ? LABS.find((l) => l.id === hover)! : null;
  return (
    <div className="map-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="viz-svg" role="img" aria-label="Map of all models, from classical machine learning at the centre to AI agents at the edge">
        {TIERS.map((t, i) => (
          <g key={t.id}>
            <ellipse cx={CX} cy={CY} rx={RX[i]} ry={RX[i] * RY} fill="none" stroke={lens === 'all' ? t.color : '#d8d4ca'} strokeOpacity={lens === 'all' ? 0.35 : 1} strokeWidth="1.4" strokeDasharray="4 5" />
          </g>
        ))}
        
        
        {LABS.map((lab) => {
          const p = POS[lab.id];
          const c = colourFor(lab, lens);
          const on = hover === lab.id;
          return (
            <g key={lab.id} style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHover(lab.id)} onMouseLeave={() => setHover(null)} onClick={() => go(`/model/${lab.id}`)}>
              <circle cx={p.x} cy={p.y} r={on ? 23 : 20} fill={lens === 'all' ? '#fff' : c.fill} fillOpacity={lens === 'all' ? 1 : 0.9} stroke={c.stroke} strokeWidth={2.2} style={{ transition: 'r .2s, fill .4s, stroke .4s' }} />
              <text x={p.x} y={p.y + 4.5} textAnchor="middle" fontSize="12" fontWeight={700} fill={lens === 'all' ? '#1d2028' : '#fff'} style={{ pointerEvents: 'none' }}>{lab.glyph}</text>
              <text x={p.x} y={p.y + 37} textAnchor="middle" fontSize="12.5" fill="#2c303a" fontWeight={500} stroke="#f6f5f1" strokeWidth="4" style={{ paintOrder: 'stroke', pointerEvents: 'none' }}>{SHORT_NAME[lab.id]}</text>
            </g>
          );
        })}
      </svg>
      {hl && (
        <div className="tooltip" style={{ left: `min(calc(${(POS[hl.id].x / W) * 100}% + 26px), calc(100% - 270px))`, top: `${(POS[hl.id].y / H) * 100}%`, transform: 'translateY(-50%)' }}>
          <div style={{ fontWeight: 600 }}>{hl.model}</div>
          <div className="muted small">Example: {hl.app}</div>
          <div className="small" style={{ marginTop: 6 }}>{colourFor(hl, lens).status}</div>
        </div>
      )}
    </div>
  );
}

function Row({ lab, lens }: { lab: LabDef; lens: FwId | 'all' }) {
  const e = lens === 'all' ? null : fwEntry(lens, lab.id);
  const cat = e ? FW_BY_ID[lens as FwId].cats.find((c) => c.id === e.cat) : null;
  return (
    <a href={`#/model/${lab.id}`} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 16, padding: '12px 16px', borderTop: '1px solid var(--line)', color: 'inherit' }} className="row-link">
      <span>
        <span style={{ fontWeight: 600 }}>{lab.model}</span>
        <span className="muted"> · {lab.app}</span>
      </span>
      {cat ? <span className="tag"><span className="swatch" style={{ background: cat.color }} />{cat.label}</span> : <span className="dim small">Open →</span>}
    </a>
  );
}

export function Home() {
  const lens = useLens();
  const fw = lens === 'all' ? null : FW_BY_ID[lens];
  const groups = fw
    ? fw.cats.map((c) => ({ key: c.id, title: c.label, color: c.color, desc: c.desc, labs: LABS.filter((l) => fwEntry(fw.id, l.id).cat === c.id) })).filter((g) => g.labs.length)
    : TIERS.map((t) => ({ key: t.id, title: t.label, color: t.color, desc: t.tagline, labs: LABS.filter((l) => l.tier === t.id) }));
  return (
    <div>
      <section className="wrap" style={{ padding: '44px 0 10px' }}>
        <div className="narrow stack">
          <h1>{fw ? `AI systems under the ${fw.short}` : 'How AI systems go wrong, and what the rules say'}</h1>
          {fw ? (
            <p className="lead">{fw.intro.split('. ').slice(0, 2).join('. ')}. Each circle below is coloured by how the {fw.short} treats that use. <a href={`#/rules/${fw.id}`}>Read the full guide to the {fw.short}</a>.</p>
          ) : (
            <p className="lead">
              Below are {LABS.length} common uses of AI, from a simple spam filter to a team of AI agents. Each one has a working simulation: switch on a problem, see what goes wrong, then add a safeguard and check whether it helps. Use the <b>View through</b> menu at the top to see everything from the point of view of one framework, such as the EU AI Act.
            </p>
          )}
          {!fw && <p className="muted small">New to the topic? <a href="#/basics">Start with the basics</a>, a short guide to how models work and where risk comes from.</p>}
        </div>
      </section>

      <section className="wrap">
        {!fw && (
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 18 }}>
            <span className="small muted">From the centre outwards:</span>
            {TIERS.map((t) => <span key={t.id} className="small" style={{ display: 'inline-flex', gap: 7, alignItems: 'center' }}><span className="swatch" style={{ background: t.color, borderRadius: '50%' }} />{t.label}</span>)}
          </div>
        )}
        {fw && (
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 18 }}>
            {fw.cats.map((c) => {
              const n = LABS.filter((l) => fwEntry(fw.id, l.id).cat === c.id).length;
              return n ? <span key={c.id} className="small" style={{ display: 'inline-flex', gap: 7, alignItems: 'center' }}><span className="swatch" style={{ background: c.color }} />{c.label} ({n})</span> : null;
            })}
          </div>
        )}
        <div className="scroll-x"><div style={{ minWidth: 760 }}><ModelMap /></div></div>
      </section>

      <section className="wrap" style={{ paddingBottom: 30 }}>
        <h2 style={{ marginBottom: 6 }}>{fw ? `All ${LABS.length} examples, grouped by ${fw.short} category` : `All ${LABS.length} examples, by type of model`}</h2>
        <p className="muted" style={{ marginBottom: 20 }}>Click any example to open its simulation and see how the rules apply.</p>
        <div className="grid2" style={{ alignItems: 'start' }}>
          {groups.map((g) => (
            <div key={g.key} className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px 16px 12px', borderTop: `4px solid ${g.color}` }}>
                <h3>{g.title}</h3>
                <p className="muted small" style={{ marginTop: 4 }}>{g.desc}</p>
              </div>
              {g.labs.map((l) => <Row key={l.id} lab={l} lens={lens} />)}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
