/** Framework guide pieces: bindingness meter, myth flip cards, sortable examples table. */
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import type { Framework } from '../data/frameworks';
import { LABS, fwEntry } from '../data/labs';
import { setLens } from '../lib/lens';
import { url } from '../lib/util';

const BIND_LABEL = ['Voluntary', 'Voluntary, with some binding parts', 'Partly binding', 'Binding law'];

export function BindMeter({ n, binding }: { n: 0 | 1 | 2 | 3; binding: string }) {
  return (
    <div className="bind" role="img" aria-label={`How binding: ${n} of 3. ${binding}`}>
      <span className="bind-segs" aria-hidden>
        {[1, 2, 3].map((i) => <motion.i key={i} className={i <= n ? 'on' : ''} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.15 * i, duration: 0.3 }} />)}
      </span>
      <span className="small muted">{BIND_LABEL[n]}</span>
    </div>
  );
}

export function MythCard({ myth, fact }: { myth: string; fact: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className={`flip ${flipped ? 'on' : ''}`}>
      <button className="flip-inner" aria-expanded={flipped} onClick={() => setFlipped((f) => !f)}>
        <span className="flip-face flip-front" aria-hidden={flipped}>
          <span className="label" style={{ color: '#e0716b' }}>Myth</span>
          <span className="flip-text">“{myth}”</span>
          <span className="flip-hint small">Show the facts ↻</span>
        </span>
        <span className="flip-face flip-back" aria-hidden={!flipped}>
          <span className="label accent">Fact</span>
          <span className="flip-text small">{fact}</span>
          <span className="flip-hint small">Back to the myth ↺</span>
        </span>
      </button>
      <span className="sr-only" aria-live="polite">{flipped ? `Fact: ${fact}` : ''}</span>
    </div>
  );
}

type SortKey = 'example' | 'model' | 'category';
export function ExamplesTable({ f }: { f: Framework }) {
  const [sort, setSort] = useState<{ k: SortKey; dir: 1 | -1 }>({ k: 'category', dir: 1 });
  const [cat, setCat] = useState<string>('all');
  const catIdx = (id: string) => f.cats.findIndex((c) => c.id === id);
  const rows = useMemo(() => {
    const r = LABS.map((l) => ({ l, e: fwEntry(f.id, l.id) })).filter((x) => cat === 'all' || x.e.cat === cat);
    const val = (x: (typeof r)[number]) => (sort.k === 'example' ? x.l.app : sort.k === 'model' ? x.l.model : String(catIdx(x.e.cat)).padStart(2, '0') + x.l.app);
    return r.sort((a, b) => val(a).localeCompare(val(b)) * sort.dir);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f, cat, sort]);
  const th = (k: SortKey, label: string) => (
    <th aria-sort={sort.k === k ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>
      <button className="th-btn" onClick={() => setSort((s) => ({ k, dir: s.k === k ? (s.dir === 1 ? -1 : 1) : 1 }))}>
        {label} <span aria-hidden>{sort.k === k ? (sort.dir === 1 ? '▲' : '▼') : '↕'}</span>
      </button>
    </th>
  );
  const used = f.cats.filter((c) => LABS.some((l) => fwEntry(f.id, l.id).cat === c.id));
  return (
    <div>
      <div className="chips" role="group" aria-label="Filter by category">
        <button className={`chip-btn ${cat === 'all' ? 'on' : ''}`} aria-pressed={cat === 'all'} onClick={() => setCat('all')}>All ({LABS.length})</button>
        {used.map((c) => (
          <button key={c.id} className={`chip-btn ${cat === c.id ? 'on' : ''}`} aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>
            <span className="swatch" style={{ background: c.color, marginRight: 6 }} />{c.label} ({LABS.filter((l) => fwEntry(f.id, l.id).cat === c.id).length})
          </button>
        ))}
      </div>
      <div className="card" tabIndex={0} role="region" aria-label="How it treats each example, scrolls sideways" style={{ overflowX: 'auto' }}>
        <table className="ex-table">
          <thead><tr>{th('example', 'Example')}{th('model', 'Model')}{th('category', 'Classification')}<th><span className="label">In short</span></th></tr></thead>
          <tbody>
            {rows.map(({ l, e }) => {
              const c = f.cats.find((x) => x.id === e.cat)!;
              return (
                <tr key={l.id}>
                  <td><a href={url(`/model/${l.id}`)} onClick={() => setLens(f.id)}>{l.app}</a></td>
                  <td className="muted small">{l.model}</td>
                  <td style={{ whiteSpace: 'nowrap' }}><span className="tag"><span className="swatch" style={{ background: c.color }} />{c.label}</span></td>
                  <td className="muted small">{e.summary.split('. ')[0]}.</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="dim small" style={{ marginTop: 8 }}>Opening an example from this table switches the site’s view to {f.short}.</p>
    </div>
  );
}
