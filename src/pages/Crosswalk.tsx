import { SEV } from '../data/palette';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Breadcrumbs } from '../components/Nav';
import { CONTROLS, type Control } from '../data/crosswalk';
import { FRAMEWORKS, FW_BY_ID, type FwId } from '../data/frameworks';
import { LAB_BY_ID } from '../data/labs';
import { url } from '../lib/util';

const LEVEL = ['Not addressed', 'Guidance only', 'Required in some cases', 'Detailed binding rule'];
const DOT = ['var(--line2)', SEV.info, SEV.mid, 'var(--accent)'];

export function crosswalkCsv(fws: FwId[] = FRAMEWORKS.map((f) => f.id)) {
  const q = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  const rows = [['Control', ...fws.map((f) => FW_BY_ID[f].short)], ...CONTROLS.map((c) => [c.name, ...fws.map((f) => { const x = c.cells[f]; return x ? `${x[0]} (${x[1]})` : '—'; })])];
  return '﻿' + rows.map((r) => r.map(q).join(',')).join('\r\n') + '\r\n';
}

export default function Crosswalk() {
  const [shown, setShown] = useState<FwId[]>(FRAMEWORKS.map((f) => f.id));
  const [q, setQ] = useState('');
  const [pop, setPop] = useState<{ c: Control; f: FwId } | null>(null);
  const controls = CONTROLS.filter((c) => !q || (c.name + ' ' + c.desc).toLowerCase().includes(q.toLowerCase()));
  const fws = FRAMEWORKS.filter((f) => shown.includes(f.id));
  useEffect(() => {
    if (!pop) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setPop(null); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [pop]);
  const download = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([crosswalkCsv(shown)], { type: 'text/csv;charset=utf-8' }));
    a.download = 'ai-risk-explorer-crosswalk.csv';
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };
  const cell = pop ? pop.c.cells[pop.f] : null;

  return (
    <div className="wrap" style={{ padding: '30px 0 44px' }}>
      <div className="narrow stack">
        <Breadcrumbs trail={[{ label: 'Tools' }, { label: 'Controls crosswalk' }]} />
        <h1>Controls crosswalk</h1>
        <p className="lead">{CONTROLS.length} common AI governance controls, and where each of the {FRAMEWORKS.length} frameworks asks for them. Build a control once, then show how it meets several frameworks.</p>
        <p className="small muted">References come from the guides on this site. A dash means this site has no supported reference, not necessarily that the framework is silent.</p>
      </div>

      <div className="xw-tools">
        <input type="search" className="gl-search" placeholder="Filter controls…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filter controls" />
        <div className="chips" role="group" aria-label="Show frameworks" style={{ margin: 0 }}>
          {FRAMEWORKS.map((f) => {
            const on = shown.includes(f.id);
            return <button key={f.id} className={`chip-btn ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => setShown((s) => (on ? (s.length > 1 ? s.filter((x) => x !== f.id) : s) : [...s, f.id]))}>{f.short}</button>;
          })}
        </div>
        <button className="btn btn-sm" onClick={download}>Download CSV</button>
      </div>

      <div className="xw-wrap" tabIndex={0} role="region" aria-label="Crosswalk table, scrolls sideways">
        <table className="xw">
          <thead>
            <tr><th scope="col" className="xw-corner">Control</th>{fws.map((f) => <th key={f.id} scope="col"><a href={url(`/rules/${f.id}`)}>{f.short}</a></th>)}</tr>
          </thead>
          <tbody>
            {controls.map((c, r) => (
              <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: r * 0.015 }}>
                <th scope="row" className="xw-row"><span className="xw-name">{c.name}</span><span className="xw-desc">{c.desc}</span></th>
                {fws.map((f) => {
                  const x = c.cells[f.id];
                  return (
                    <td key={f.id}>
                      {x ? (
                        <button className="xw-cell" onClick={() => setPop({ c, f: f.id })} aria-label={`${c.name} under ${f.short}: ${x[0]}, ${LEVEL[x[1]]}`}>
                          <span className="xw-dot" style={{ background: DOT[x[1]] }} aria-hidden />
                          <span className="xw-ref">{x[0]}</span>
                        </button>
                      ) : <span className="xw-none" aria-label="No supported reference">—</span>}
                    </td>
                  );
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="legend" style={{ marginTop: 12 }}>
        {LEVEL.slice(1).map((l, i) => <span key={l}><i className="dot" style={{ background: DOT[i + 1] }} />{l}</span>)}
      </div>

      <AnimatePresence>
        {pop && cell && (
          <motion.div className="xw-pop-back" onMouseDown={(e) => { if (e.target === e.currentTarget) setPop(null); }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div role="dialog" aria-modal="true" aria-label={`${pop.c.name} under ${FW_BY_ID[pop.f].short}`} className="xw-pop card card-pad" initial={{ y: 10, scale: 0.98 }} animate={{ y: 0, scale: 1 }}>
              <div className="label">{FW_BY_ID[pop.f].name}</div>
              <h2 style={{ fontSize: 20, marginTop: 4 }}>{pop.c.name}</h2>
              <p className="muted small">{pop.c.desc}</p>
              <p style={{ marginTop: 10 }}><code className="ref-chip">{cell[0]}</code> <span className="small" style={{ color: DOT[cell[1]] }}>· {LEVEL[cell[1]]}</span></p>
              <div className="label" style={{ marginTop: 14 }}>See it in the simulations</div>
              <ul className="stage-sg">{pop.c.labs.map((id) => LAB_BY_ID[id] && <li key={id}><a href={url(`/model/${id}`)}>{LAB_BY_ID[id].app}</a> <span className="muted small">· {LAB_BY_ID[id].model}</span></li>)}</ul>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <a className="btn btn-sm" href={url(`/rules/${pop.f}`)}>Open the guide</a>
                <button className="btn btn-sm" autoFocus onClick={() => setPop(null)}>Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
