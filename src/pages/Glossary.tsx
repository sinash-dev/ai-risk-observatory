import { useEffect, useMemo, useState } from 'react';
import { Breadcrumbs } from '../components/Nav';
import { FW_BY_ID } from '../data/frameworks';
import { GLOSSARY } from '../data/glossary';
import { allRoutes } from '../data/routes';
import { url } from '../lib/util';

const titleFor = (path: string) => allRoutes().find((r) => r.path === path)?.title ?? path;

export default function Glossary() {
  const [q, setQ] = useState('');
  const terms = useMemo(() => [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term)), []);
  const shown = terms.filter((t) => !q || (t.term + ' ' + t.def).toLowerCase().includes(q.toLowerCase()));
  const letters = Array.from(new Set(terms.map((t) => t.term[0].toUpperCase())));
  const present = new Set(shown.map((t) => t.term[0].toUpperCase()));

  // open at a term when the address has #term-id
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      el?.scrollIntoView({ block: 'start' });
      el?.classList.add('flash');
    }, 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="wrap" style={{ padding: '30px 0 44px' }}>
      <div className="narrow stack">
        <Breadcrumbs trail={[{ label: 'Learn' }, { label: 'Glossary' }]} />
        <h1>Glossary</h1>
        <p className="lead">{GLOSSARY.length} terms used across the site, in plain words, with links to where you can see each idea at work.</p>
      </div>
      <div className="gl-tools">
        <input type="search" className="gl-search" placeholder="Filter terms…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filter terms" />
        <nav className="az" aria-label="Jump to letter">
          {letters.map((l) => present.has(l)
            ? <a key={l} href={`#letter-${l}`} onClick={(e) => { e.preventDefault(); document.getElementById(`letter-${l}`)?.scrollIntoView({ behavior: 'smooth' }); }}>{l}</a>
            : <span key={l} aria-hidden>{l}</span>)}
        </nav>
      </div>
      <p className="sr-only" aria-live="polite">{shown.length} terms shown</p>
      {letters.filter((l) => present.has(l)).map((l) => (
        <section key={l} id={`letter-${l}`} className="gl-letter">
          <h2 className="gl-l">{l}</h2>
          <dl className="gl-list">
            {shown.filter((t) => t.term[0].toUpperCase() === l).map((t) => (
              <div key={t.id} id={t.id} className="gl-item">
                <dt><a href={`#${t.id}`} className="gl-anchor" aria-label={`Link to ${t.term}`}>#</a>{t.term}</dt>
                <dd>
                  <p>{t.def}</p>
                  {(t.see?.length || t.fw?.length) ? (
                    <p className="small gl-see">
                      {t.see?.map((p) => <a key={p} href={url(p)}>{titleFor(p)}</a>)}
                      {t.fw?.map((f) => <span key={f} className="tag">{FW_BY_ID[f].short}</span>)}
                    </p>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
      {shown.length === 0 && <p className="muted">No terms match “{q}”.</p>}
    </div>
  );
}
