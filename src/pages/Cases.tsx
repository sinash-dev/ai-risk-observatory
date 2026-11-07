import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Breadcrumbs } from '../components/Nav';
import { CASES, OUTCOME_LABEL, type Case, type OutcomeType } from '../data/cases';
import { RISK_BY_KEY, TIERS, TIER_BY_ID } from '../data/risks';
import type { RiskKey, TierId } from '../data/types';
import { url } from '../lib/util';

const uniq = <T,>(xs: T[]) => Array.from(new Set(xs));
const YEARS = CASES.map((c) => c.y);
const MIN = Math.min(...YEARS), MAX = Math.max(...YEARS);

function Chips<T extends string>({ label, all, value, set, name }: { label: string; all: T[]; value: T | 'all'; set: (v: T | 'all') => void; name: (v: T) => string }) {
  return (
    <div className="chips" role="group" aria-label={label}>
      <span className="label chips-l">{label}</span>
      <button className={`chip-btn ${value === 'all' ? 'on' : ''}`} aria-pressed={value === 'all'} onClick={() => set('all')}>All</button>
      {all.map((v) => <button key={v} className={`chip-btn ${value === v ? 'on' : ''}`} aria-pressed={value === v} onClick={() => set(v)}>{name(v)}</button>)}
    </div>
  );
}

function CaseCard({ c }: { c: Case }) {
  const tier = TIER_BY_ID[c.family];
  return (
    <article className="card card-pad case case-lib" style={{ borderTop: `3px solid ${tier.color}` }}>
      <div className="case-top"><span className="year">{c.year}</span><span className="dim small">{c.jur} · {OUTCOME_LABEL[c.type]}</span></div>
      <h3>{c.title}</h3>
      <p className="muted small">{c.text}</p>
      <div className="case-tags">{c.harms.map((h) => <span key={h} className="tag" style={{ fontSize: 12 }}><span className="swatch" style={{ background: RISK_BY_KEY[h].color }} />{RISK_BY_KEY[h].short}</span>)}</div>
      <div className="case-links small">
        <a href={url(`/model/${c.lab.id}`)}>See it in: {c.lab.app} →</a>
        {c.url && <a href={c.url} target="_blank" rel="noopener noreferrer">Source{c.source ? ` (${c.source})` : ''} ↗</a>}
      </div>
    </article>
  );
}

export default function Cases() {
  const [harm, setHarm] = useState<RiskKey | 'all'>('all');
  const [family, setFamily] = useState<TierId | 'all'>('all');
  const [sector, setSector] = useState<string | 'all'>('all');
  const [jur, setJur] = useState<string | 'all'>('all');
  const [type, setType] = useState<OutcomeType | 'all'>('all');
  const [from, setFrom] = useState(MIN);
  const [to, setTo] = useState(MAX);
  const [view, setView] = useState<'grid' | 'timeline'>('grid');

  const shown = useMemo(() => CASES.filter((c) =>
    (harm === 'all' || c.harms.includes(harm)) && (family === 'all' || c.family === family) && (sector === 'all' || c.sector === sector)
    && (jur === 'all' || c.jur === jur) && (type === 'all' || c.type === type) && c.y >= from && c.y <= to), [harm, family, sector, jur, type, from, to]);

  const harms = uniq(CASES.flatMap((c) => c.harms));
  const sectors = uniq(CASES.map((c) => c.sector)).sort();
  const jurs = uniq(CASES.map((c) => c.jur)).sort();
  const types = uniq(CASES.map((c) => c.type));
  const reset = () => { setHarm('all'); setFamily('all'); setSector('all'); setJur('all'); setType('all'); setFrom(MIN); setTo(MAX); };
  const pct = (y: number) => ((y - MIN) / Math.max(1, MAX - MIN)) * 100;

  return (
    <div className="wrap" style={{ padding: '30px 0 44px' }}>
      <div className="narrow stack">
        <Breadcrumbs trail={[{ label: 'Tools' }, { label: 'Case library' }]} />
        <h1>Case library</h1>
        <p className="lead">{CASES.length} real incidents, rulings and reports behind the examples on this site. Filter them, then open the example that shows the same failure.</p>
      </div>

      <div className="card card-pad filters">
        <Chips label="Harm" all={harms} value={harm} set={setHarm} name={(k) => RISK_BY_KEY[k].short} />
        <Chips label="Model family" all={TIERS.map((t) => t.id)} value={family} set={setFamily} name={(k) => TIER_BY_ID[k].label} />
        <Chips label="Sector" all={sectors} value={sector} set={setSector} name={(s) => s} />
        <Chips label="Where" all={jurs} value={jur} set={setJur} name={(s) => s} />
        <Chips label="Outcome" all={types} value={type} set={setType} name={(t) => OUTCOME_LABEL[t]} />
        <fieldset className="years">
          <legend className="label">Years {from}–{to}</legend>
          <div className="dual">
            <div className="dual-fill" style={{ left: `${pct(from)}%`, right: `${100 - pct(to)}%` }} />
            <input type="range" min={MIN} max={MAX} value={from} aria-label="From year" onChange={(e) => setFrom(Math.min(+e.target.value, to))} />
            <input type="range" min={MIN} max={MAX} value={to} aria-label="To year" onChange={(e) => setTo(Math.max(+e.target.value, from))} />
          </div>
        </fieldset>
        <div className="filters-foot">
          <span className="small muted" aria-live="polite">{shown.length} of {CASES.length} cases</span>
          <button className="btn btn-sm" onClick={reset}>Clear filters</button>
          <div className="tabs" role="tablist" style={{ marginInlineStart: 'auto' }}>
            <button role="tab" aria-selected={view === 'grid'} className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')}>Cards</button>
            <button role="tab" aria-selected={view === 'timeline'} className={view === 'timeline' ? 'on' : ''} onClick={() => setView('timeline')}>Timeline</button>
          </div>
        </div>
      </div>

      <h2 className="sr-only">Cases ({shown.length})</h2>
      {view === 'grid' ? (
        <div className="masonry">
          <AnimatePresence initial={false}>
            {shown.map((c) => (
              <motion.div key={c.title} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <CaseCard c={c} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="case-tl scroll-x" tabIndex={0} role="region" aria-label="Cases by year, scrolls sideways">
          <div className="case-tl-in">
            <div className="case-axis" />
            {uniq(shown.map((c) => c.y)).sort().map((y) => (
              <div key={y} className="case-year">
                <span className="mono small">{y}</span>
                <ul>
                  {shown.filter((c) => c.y === y).map((c, i) => (
                    <motion.li key={c.title} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <a href={url(`/model/${c.lab.id}`)} title={c.text}><span className="dot" style={{ background: TIER_BY_ID[c.family].color }} />{c.title}</a>
                    </motion.li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
      {shown.length === 0 && <p className="muted" style={{ marginTop: 20 }}>No cases match these filters. <button className="based-btn" onClick={reset}>Clear filters</button></p>}

      <section className="section">
        <h2>More incident collections</h2>
        <div className="grid2" style={{ marginTop: 16 }}>
          <a className="card card-pad lift" href="https://incidentdatabase.ai/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}><h3>AI Incident Database ↗</h3><p className="muted small" style={{ marginTop: 4 }}>A public, searchable collection of reported AI incidents.</p></a>
          <a className="card card-pad lift" href="https://oecd.ai/en/incidents" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}><h3>OECD AI Incidents Monitor ↗</h3><p className="muted small" style={{ marginTop: 4 }}>Incidents and hazards detected in news reports worldwide.</p></a>
        </div>
      </section>
    </div>
  );
}
