/** Model page panels: risk radar, trade-off gauges, newsroom, checklist and progress ring. */
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { RISKS, level } from '../../data/risks';
import type { LabDef, RiskKey } from '../../data/types';
import { useTweenArray } from '../../lib/util';
import { copyText, toast } from '../Toast';

type Scores = Record<RiskKey, number>;

/** 8-axis radar: ghost polygon for the baseline, current polygon morphs as toggles change. */
export function RiskRadar({ scores, base, relevant }: { scores: Scores; base: Scores; relevant: Set<RiskKey> }) {
  const R = 92, C = 130;
  const vals = useTweenArray(RISKS.map((r) => scores[r.key]), 0.16);
  const pt = (i: number, v: number) => {
    const a = -Math.PI / 2 + (i / RISKS.length) * Math.PI * 2;
    return [C + Math.cos(a) * (v / 100) * R, C + Math.sin(a) * (v / 100) * R] as const;
  };
  const poly = (vs: number[]) => vs.map((v, i) => pt(i, Math.max(4, v)).join(',')).join(' ');
  const top = RISKS.reduce((a, r) => (scores[r.key] > scores[a.key] ? r : a), RISKS[0]);
  const fill = level(scores[top.key]).color;
  const summary = RISKS.map((r) => `${r.short} ${Math.round(scores[r.key])}`).join(', ');
  return (
    <svg viewBox="-58 -10 376 280" className="radar" role="img" aria-label={`Risk radar. ${summary}.`}>
      {[25, 50, 75, 100].map((g) => <polygon key={g} points={poly(RISKS.map(() => g))} fill="none" stroke="rgba(255,255,255,.08)" />)}
      {RISKS.map((r, i) => { const [x, y] = pt(i, 100); return <line key={r.key} x1={C} y1={C} x2={x} y2={y} stroke="rgba(255,255,255,.08)" />; })}
      <polygon points={poly(RISKS.map((r) => base[r.key]))} fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.3)" strokeDasharray="3 3" />
      <polygon points={poly(vals)} fill={fill} fillOpacity={0.25} stroke={fill} strokeWidth={1.8} style={{ transition: 'fill .3s, stroke .3s' }} />
      {RISKS.map((r, i) => {
        const [x, y] = pt(i, 122);
        return <text key={r.key} x={x} y={y + 4} textAnchor="middle" fontSize="13" fill={relevant.has(r.key) ? '#c8ccd3' : '#6b717c'} fontFamily="Manrope Variable, Manrope, sans-serif">{r.short}</text>;
      })}
    </svg>
  );
}

function Gauge({ label, v, color }: { label: string; v: number; color: string }) {
  const [t] = useTweenArray([v], 0.14);
  const a = Math.PI * (1 - t / 100);
  const x = 60 + Math.cos(a) * 46, y = 60 - Math.sin(a) * 46;
  return (
    <div className="gauge">
      <svg viewBox="0 0 120 70" role="img" aria-label={`${label}: ${Math.round(v)} out of 100`}>
        <path d="M14,60 A46,46 0 0 1 106,60" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="9" strokeLinecap="round" />
        <path d={`M14,60 A46,46 0 0 1 ${x.toFixed(2)},${y.toFixed(2)}`} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" />
        <text x="60" y="56" textAnchor="middle" fontSize="20" fontWeight="700" fill="#eceef1" fontFamily="Sora Variable, Sora, sans-serif">{Math.round(t)}</text>
      </svg>
      <div className="gauge-l">{label}</div>
    </div>
  );
}

export function tradeOff(lab: LabDef, s: Set<string>, m: Set<string>, scores: Scores) {
  const shortcutValue = lab.stressors.filter((x) => s.has(x.id) && x.kind === 'shortcut').reduce((n, x) => n + (x.value ?? 0), 0);
  const cost = lab.mitigations.filter((x) => m.has(x.id)).reduce((n, x) => n + x.cost, 0);
  const value = Math.max(0, Math.min(100, 50 + shortcutValue - 2 * cost));
  const trust = 100 - RISKS.reduce((n, r) => n + scores[r.key], 0) / RISKS.length;
  return { value, trust };
}
export const letterFor = (trust: number) => (trust >= 85 ? 'A' : trust >= 75 ? 'B' : trust >= 65 ? 'C' : trust >= 55 ? 'D' : 'E');

export function TradeOff({ value, trust }: { value: number; trust: number }) {
  return (
    <div className="tradeoff">
      <div className="gauges">
        <Gauge label="Business value" v={value} color="#d6c06a" />
        <Gauge label="Trust" v={trust} color="#6cc5b0" />
      </div>
      <p className="small muted">Shortcuts add value fast; safeguards cost effort. Governance is choosing the balance on purpose.</p>
      <p className="dim small">Indicative, for teaching.</p>
    </div>
  );
}

/** Fictional headlines for problems that are live; a "Resolved" stamp when handled, then the card collapses. */
export function Newsroom({ lab, s, live }: { lab: LabDef; s: Set<string>; live: (id: string) => boolean }) {
  const active = lab.stressors.filter((x) => s.has(x.id));
  const [resolved, setResolved] = useState<Record<string, number>>({});
  const handledKey = active.filter((x) => !live(x.id)).map((x) => x.id).join(',');
  useEffect(() => {
    const now = Date.now();
    setResolved((r) => {
      const n: Record<string, number> = {};
      for (const id of handledKey ? handledKey.split(',') : []) n[id] = r[id] ?? now;
      return n;
    });
    const t = setTimeout(() => setResolved((r) => ({ ...r })), 1900);
    return () => clearTimeout(t);
  }, [handledKey]);
  const shown = active.filter((x) => live(x.id) || (resolved[x.id] && Date.now() - resolved[x.id] < 1800));
  if (!active.length) return null;
  return (
    <div className="newsroom">
      <div className="label">In the news (fictional)</div>
      <AnimatePresence initial={false}>
        {shown.map((x) => {
          const ok = !live(x.id);
          return (
            <motion.article key={x.id} className={`news ${ok ? 'ok' : ''}`} layout initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }} transition={{ duration: 0.3 }}>
              <div className="news-outlet">{x.outlet || 'Trade press'}</div>
              <h4 className="news-h">{x.headline}</h4>
              {x.quote && <p className="news-q">“{x.quote.text}” <span>— {x.quote.who}</span></p>}
              <AnimatePresence>{ok && <motion.span className="stamp" initial={{ opacity: 0, scale: 1.6, rotate: -18 }} animate={{ opacity: 1, scale: 1, rotate: -8 }} transition={{ type: 'spring', stiffness: 420, damping: 18 }}>Resolved</motion.span>}</AnimatePresence>
            </motion.article>
          );
        })}
      </AnimatePresence>
      {shown.length === 0 && <p className="dim small">No live problems are making headlines.</p>}
    </div>
  );
}

export function Ring({ n, total, size = 46 }: { n: number; total: number; size?: number }) {
  const r = size / 2 - 4, c = 2 * Math.PI * r;
  const p = total ? n / total : 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${n} of ${total}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="4" />
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#6cc5b0" strokeWidth="4" strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} strokeDasharray={c} initial={false} animate={{ strokeDashoffset: c * (1 - p) }} />
      <text x="50%" y="50%" dy="4" textAnchor="middle" fontSize={size > 40 ? 12 : 10} fontWeight="700" fill="#eceef1">{n}/{total}</text>
    </svg>
  );
}

/** Before go-live checklist, saved per example in this browser. */
export function Checklist({ lab }: { lab: LabDef }) {
  const key = `are-check-${lab.id}`;
  const [done, setDone] = useState<number[]>(() => { try { return JSON.parse(localStorage.getItem(key) ?? '[]'); } catch { return []; } });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(done)); } catch { /* ignore */ } }, [key, done]);
  const md = useMemo(() => `## Before go-live: ${lab.model} (${lab.app})\n\n` + lab.checklist.map((c, i) => `- [${done.includes(i) ? 'x' : ' '}] ${c}`).join('\n') + '\n', [lab, done]);
  return (
    <div className="checklist">
      <div className="checklist-top">
        <Ring n={done.length} total={lab.checklist.length} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700 }}>{done.length === lab.checklist.length ? 'Ready for review' : `${lab.checklist.length - done.length} to go`}</div>
          <div className="dim small">Saved in this browser only.</div>
        </div>
        <button className="btn" onClick={async () => { if (await copyText(md)) toast('Checklist copied as Markdown'); }}>Copy as Markdown</button>
        <button className="btn no-print" onClick={() => window.print()}>Print</button>
      </div>
      <fieldset>
        <legend className="sr-only">Before go-live checklist for {lab.app}</legend>
        {lab.checklist.map((c, i) => (
          <label key={i} className={`check ${done.includes(i) ? 'on' : ''}`}>
            <input type="checkbox" checked={done.includes(i)} onChange={() => setDone((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]))} />
            <span>{c}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}
