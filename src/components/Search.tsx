/** Command-palette search (⌘K / Ctrl K / "/"). Modal dialog with the ARIA combobox + listbox pattern. */
import Fuse from 'fuse.js';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { POPULAR, buildIndex, type HitType, type SearchItem } from '../lib/searchIndex';
import { closeSearch } from '../lib/searchStore';
import { navigate } from '../lib/util';

const RECENT_KEY = 'are-recent-searches';
const BOOST: Partial<Record<HitType, number>> = { Page: 0.5, Model: 0.6, Framework: 0.6, Term: 0.8 };
const ICON: Record<HitType, string> = { Page: '▤', Model: '◉', Framework: '§', Requirement: '¶', Topic: '⇄', Term: 'Aa', Case: '!' };

function readRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]').slice(0, 5); } catch { return []; }
}
function saveRecent(q: string) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...readRecent().filter((x) => x !== q)].slice(0, 5))); } catch { /* ignore */ }
}

export default function Search() {
  const items = useMemo(buildIndex, []);
  const fuse = useMemo(
    () => new Fuse(items, { keys: [{ name: 'title', weight: 3 }, { name: 'keys', weight: 1.5 }, { name: 'snippet', weight: 1 }, { name: 'body', weight: 0.6 }], threshold: 0.34, ignoreLocation: true, minMatchCharLength: 2, includeScore: true }),
    [items],
  );
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const recent = useMemo(readRecent, []);

  const results: SearchItem[] = useMemo(() => {
    if (q.trim().length < 2) return [];
    // small boost for whole pages, models and frameworks over single clauses
    const hits = fuse.search(q.trim(), { limit: 60 })
      .map((r) => ({ item: r.item, s: (r.score ?? 1) * (BOOST[r.item.type] ?? 1) + 0.001 }))
      .sort((a, b) => a.s - b.s)
      .map((r) => r.item);
    // group by type; groups appear in order of their best match, at most 6 per group
    const order = [...new Set(hits.map((h) => h.type))];
    return order.flatMap((t) => hits.filter((h) => h.type === t).slice(0, 6));
  }, [q, fuse]);

  useEffect(() => { setActive(0); }, [q]);
  useEffect(() => {
    input.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);
  useEffect(() => {
    document.getElementById(`sr-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const open = (it: { to: string }) => {
    if (q.trim().length >= 2) saveRecent(q.trim());
    closeSearch();
    navigate(it.to);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      // keep focus inside the dialog
      const f = dialog.current?.querySelectorAll<HTMLElement>('input, button');
      if (!f || f.length === 0) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      return;
    }
    if (!results.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % results.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a - 1 + results.length) % results.length); }
    else if (e.key === 'Enter') { e.preventDefault(); open(results[active]); }
  };

  let lastType: HitType | null = null;
  return (
    <div className="palette-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) closeSearch(); }}>
      <motion.div
        ref={dialog}
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Search the site"
        onKeyDown={onKey}
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18 }}
      >
        <div className="palette-in">
          <span aria-hidden className="palette-mag">⌕</span>
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search models, frameworks, articles, terms…"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="search-results"
            aria-autocomplete="list"
            aria-activedescendant={results.length ? `sr-${active}` : undefined}
            aria-label="Search"
          />
          <button className="palette-esc" onClick={closeSearch} aria-label="Esc: close search">Esc</button>
        </div>
        <div className="palette-body" tabIndex={0} aria-label="Search results">
          {q.trim().length < 2 ? (
            <div className="palette-empty">
              {recent.length > 0 && (
                <>
                  <div className="label">Recent searches</div>
                  <div className="palette-chips">{recent.map((r) => <button key={r} className="tag" onClick={() => setQ(r)}>{r}</button>)}</div>
                </>
              )}
              <div className="label" style={{ marginTop: recent.length ? 16 : 0 }}>Popular</div>
              <ul className="palette-pop">
                {POPULAR.map((p) => <li key={p.to}><button onClick={() => open(p)}>{p.title} <span aria-hidden>→</span></button></li>)}
              </ul>
            </div>
          ) : results.length === 0 ? (
            <div className="palette-empty muted" role="status">No results for “{q}”. Try a model name, a framework or a term such as “bias”.</div>
          ) : (
            <ul id="search-results" role="listbox" aria-label="Results" className="palette-list">
              {results.map((r, i) => {
                const head = r.type !== lastType;
                lastType = r.type;
                return (
                  <li key={r.type + r.title + i} role="presentation">
                    {head && <div className="palette-group" role="presentation">{r.type === 'Requirement' ? 'Articles and clauses' : r.type + 's'}</div>}
                    <div
                      id={`sr-${i}`}
                      role="option"
                      aria-selected={i === active}
                      className={`palette-item ${i === active ? 'on' : ''}`}
                      onMouseMove={() => setActive(i)}
                      onClick={() => open(r)}
                    >
                      <span className="palette-ic" aria-hidden>{ICON[r.type]}</span>
                      <span>
                        <span className="palette-t">{r.title}</span>
                        <span className="palette-s">{r.snippet}</span>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="palette-foot" aria-hidden>
          <span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span>
        </div>
      </motion.div>
    </div>
  );
}
