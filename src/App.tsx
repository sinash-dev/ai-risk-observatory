import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { Mark } from './components/ui';
import { LABS } from './data/labs';
import { useProgress, useRoute } from './lib/util';
import { Atlas } from './pages/Atlas';
import { LabPage } from './pages/Lab';
import { Landing } from './pages/Landing';
import { Observatory } from './pages/Observatory';
import { Passport } from './pages/Passport';

function Nav({ page }: { page: string }) {
  const p = useProgress();
  const n = Object.keys(p.labs).length;
  const links = [
    { href: '#/observatory', l: 'Observatory', k: 'observatory' },
    { href: '#/atlas', l: 'Risk Atlas', k: 'atlas' },
    { href: '#/passport', l: 'Passport', k: 'passport' },
  ];
  return (
    <nav className="nav no-print">
      <div className="wrap nav-in">
        <a href="#/" className="brand">
          <Mark />
          <span className="brand-text">AI Risk Observatory</span>
        </a>
        <div className="nav-links">
          {links.map((x) => (
            <a key={x.k} href={x.href} className={`nav-link ${page === x.k || (x.k === 'observatory' && page === 'lab') ? 'active' : ''}`}>{x.l}</a>
          ))}
        </div>
        <div className="nav-score" title="Labs completed">
          <span>Passport</span> <b>{n}/{LABS.length}</b>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  const { page, param, hash } = useRoute();
  useEffect(() => { window.scrollTo(0, 0); }, [hash]);
  let view;
  if (page === 'observatory') view = <Observatory />;
  else if (page === 'lab' && param) view = <LabPage key={param} id={param} />;
  else if (page === 'atlas') view = <Atlas />;
  else if (page === 'passport') view = <Passport />;
  else view = <Landing />;
  return (
    <>
      <Nav page={page} />
      <AnimatePresence mode="wait">
        <motion.main key={hash} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }}>
          {view}
        </motion.main>
      </AnimatePresence>
      <footer className="footer no-print">
        <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <span>AI Risk Observatory — an interactive AI governance training lab. Meridian Group and all people, outlets and quotes in scenarios are fictional; “It happened for real” cases are summarised from public reporting.</span>
          <span className="mono">EU AI Act · NIST AI RMF · ISO/IEC 42001 · OWASP LLM Top 10</span>
        </div>
      </footer>
    </>
  );
}
