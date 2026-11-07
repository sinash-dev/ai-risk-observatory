import { useEffect, useState } from 'react';
import { FW_LIST } from '../data/fwList';
import { liveNav } from '../data/nav';
import { SITE, fmtDate } from '../data/site';
import { Link } from './Link';
import { Logo } from './ui';

const GC = 'https://ai-risk-explorer.goatcounter.com';

/** Public total from GoatCounter. Hidden if the counter is unavailable. */
function VisitCount() {
  const [n, setN] = useState<string | null>(null);
  useEffect(() => {
    fetch(`${GC}/counter/TOTAL.json`).then((r) => (r.ok ? r.json() : null)).then((d) => d?.count && setN(String(d.count).trim())).catch(() => {});
  }, []);
  return n && n !== '0' ? <span className="mono">{n} visits so far</span> : null;
}

export function Footer() {
  const cols: [string, { to: string; label: string; ext?: boolean }[]][] = [
    ['Explore', liveNav('main').map((n) => ({ to: n.path, label: n.label })).concat(liveNav('tools').map((n) => ({ to: n.path, label: n.label })))],
    ['Learn', liveNav('learn').map((n) => ({ to: n.path, label: n.label }))],
    [
      'About',
      [
        ...liveNav('about').map((n) => ({ to: n.path, label: n.label })),
        { to: SITE.repo, label: 'Source on GitHub', ext: true },
        { to: `${SITE.repo}/issues/new?title=Error%20report`, label: 'Report an error', ext: true },
      ],
    ],
  ];
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="brand"><Logo /> AI Risk Explorer</div>
            <p className="muted small">Working simulations of how AI systems fail, and what {FW_LIST.length} governance frameworks say about them.</p>
          </div>
          {cols.filter(([, l]) => l.length).map(([h, links]) => (
            <nav key={h} aria-label={h}>
              <div className="label">{h}</div>
              <ul>
                {links.map((l) => (
                  <li key={l.to}>{l.ext ? <a href={l.to} target="_blank" rel="noopener noreferrer">{l.label} <span aria-hidden>↗</span></a> : <Link to={l.to}>{l.label}</Link>}</li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="footer-fine">
          <p>AI Risk Explorer is a training resource. The organisation “Meridian” and the people and headlines in the simulations are fictional; the real cases are summarised from public reporting.</p>
          <p>Legal summaries cover {FW_LIST.length} frameworks, are simplified, and were last reviewed on {fmtDate(SITE.reviewed)}. They are not legal advice; check official sources before relying on them.</p>
          <p className="footer-meta">
            <span>Content <a href={`${SITE.repo}/blob/main/CONTENT_LICENSE.md`} target="_blank" rel="noopener noreferrer">CC BY 4.0</a>, code <a href={`${SITE.repo}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer">MIT</a></span>
            <VisitCount />
          </p>
        </div>
      </div>
    </footer>
  );
}
