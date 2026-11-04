import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Logo } from './components/ui';
import { FRAMEWORKS, fwName, type Lens } from './data/frameworks';
import { setLens, useLens } from './lib/lens';
import { useRoute } from './lib/util';
import { Basics } from './pages/Basics';
import { Compare } from './pages/Compare';
import { FrameworkPage, Frameworks } from './pages/Frameworks';
import { Home } from './pages/Home';
import { ModelPage } from './pages/Model';

function Header({ page }: { page: string }) {
  const lens = useLens();
  const links = [
    { href: '#/', l: 'Models', on: page === '' || page === 'model' },
    { href: '#/rules', l: 'Frameworks', on: page === 'rules' },
    { href: '#/compare', l: 'Compare', on: page === 'compare' },
    { href: '#/basics', l: 'Basics', on: page === 'basics' },
  ];
  return (
    <>
      <header className="header">
        <div className="wrap header-in">
          <a href="#/" className="brand"><Logo /> AI Risk Explorer</a>
          <nav className="nav">
            {links.map((x) => <a key={x.href} href={x.href} className={x.on ? 'active' : ''}>{x.l}</a>)}
          </nav>
          <label className="lens">
            View through
            <select value={lens} onChange={(e) => setLens(e.target.value as Lens)} aria-label="View the site through a framework">
              <option value="all">All frameworks</option>
              {FRAMEWORKS.map((f) => <option key={f.id} value={f.id}>{f.short}</option>)}
            </select>
          </label>
        </div>
      </header>
      {lens !== 'all' && (
        <div className="lens-bar">
          <div className="wrap">
            <span>You are viewing everything through <b>{fwName(lens)}</b>.</span>
            <a href={`#/rules/${lens}`}>About it</a>
            <button onClick={() => setLens('all')}>Show all frameworks</button>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  const { page, param, hash } = useRoute();
  useEffect(() => { window.scrollTo(0, 0); }, [hash]);
  let view;
  if ((page === 'model' || page === 'lab') && param) view = <ModelPage key={param} id={param} />;
  else if (page === 'rules' && param) view = <FrameworkPage id={param} />;
  else if (page === 'rules') view = <Frameworks />;
  else if (page === 'basics') view = <Basics />;
  else if (page === 'compare') view = <Compare key={param ?? 'all'} fw={param} />;
  else view = <Home />;
  return (
    <>
      <Header page={page === 'lab' ? 'model' : page} />
      <motion.main key={page + (param ?? '')} initial={{ opacity: 0.4, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>{view}</motion.main>
      <footer className="footer">
        <div className="wrap" style={{ display: 'grid', gap: 6 }}>
          <span><b>AI Risk Explorer</b> is a training resource. The organisation “Meridian” and the people and headlines in the simulations are fictional; the real cases are summarised from public reporting.</span>
          <span>Legal summaries cover ten frameworks, are simplified and are dated November 2026. They are not legal advice; check official sources before relying on them.</span>
        </div>
      </footer>
    </>
  );
}
