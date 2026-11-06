import { MotionConfig, motion } from 'framer-motion';
import { Suspense, lazy, useEffect, useState } from 'react';
import { Link } from './components/Link';
import { PageSkeleton } from './components/PageSkeleton';
import { Logo } from './components/ui';
import { FRAMEWORKS, fwName, type Lens } from './data/frameworks';
import { routeMeta } from './data/routes';
import { SITE, fmtDate } from './data/site';
import { setLens, useLens } from './lib/lens';
import { useDocumentMeta } from './lib/meta';
import { BASE, navigate, routeParts, useRoute } from './lib/util';

const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })));
const ModelPage = lazy(() => import('./pages/Model').then((m) => ({ default: m.ModelPage })));
const Frameworks = lazy(() => import('./pages/Frameworks').then((m) => ({ default: m.Frameworks })));
const FrameworkPage = lazy(() => import('./pages/Frameworks').then((m) => ({ default: m.FrameworkPage })));
const Compare = lazy(() => import('./pages/Compare').then((m) => ({ default: m.Compare })));
const Basics = lazy(() => import('./pages/Basics').then((m) => ({ default: m.Basics })));
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));

const GC = 'https://ai-risk-explorer.goatcounter.com';

/** Send one page view to GoatCounter (cookieless, no personal data). */
function countView(path: string, tries = 0) {
  const gc = (window as unknown as { goatcounter?: { count?: (o: object) => void } }).goatcounter;
  if (gc?.count) gc.count({ path, title: document.title });
  else if (tries < 20) setTimeout(() => countView(path, tries + 1), 500);
}

/** Public total from GoatCounter. Hidden if the counter is unavailable. */
function VisitCount() {
  const [n, setN] = useState<string | null>(null);
  useEffect(() => {
    fetch(`${GC}/counter/TOTAL.json`).then((r) => (r.ok ? r.json() : null)).then((d) => d?.count && setN(String(d.count).trim())).catch(() => {});
  }, []);
  return n && n !== '0' ? <span className="mono">{n} visits so far</span> : null;
}

/** Turn clicks on internal links into client-side navigation. */
function useLinkInterception() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a');
      if (!a || a.target || a.hasAttribute('download')) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:')) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || !u.pathname.startsWith(BASE)) return;
      if (/\.[a-z0-9]{2,5}$/i.test(u.pathname)) return; // files such as templates, feeds, images
      e.preventDefault();
      navigate('/' + routeParts(u.pathname).join('/') + u.search + u.hash);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
}

function Header({ page }: { page: string }) {
  const lens = useLens();
  const links = [
    { to: '/', l: 'Models', on: page === '' || page === 'model' },
    { to: '/rules', l: 'Frameworks', on: page === 'rules' },
    { to: '/compare', l: 'Compare', on: page === 'compare' },
    { to: '/basics', l: 'Basics', on: page === 'basics' },
  ];
  return (
    <>
      <header className="header">
        <div className="wrap header-in">
          <Link to="/" className="brand"><Logo /> AI Risk Explorer</Link>
          <nav className="nav">
            {links.map((x) => <Link key={x.to} to={x.to} className={x.on ? 'active' : ''} aria-current={x.on ? 'page' : undefined}>{x.l}</Link>)}
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
            <Link to={`/rules/${lens}`}>About it</Link>
            <button onClick={() => setLens('all')}>Show all frameworks</button>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  const { page, param, hash, query } = useRoute();
  const meta = routeMeta(hash);
  useDocumentMeta(meta.title, meta.description);
  useLinkInterception();
  useEffect(() => { countView(hash); }, [hash]);

  let view;
  if (page === '') view = <Home />;
  else if ((page === 'model' || page === 'lab') && param) view = <ModelPage key={param} id={param} query={query} />;
  else if (page === 'rules' && param) view = <FrameworkPage id={param} />;
  else if (page === 'rules') view = <Frameworks />;
  else if (page === 'basics') view = <Basics />;
  else if (page === 'compare') view = <Compare key={param ?? 'all'} fw={param} />;
  else view = <NotFound />;

  return (
    <MotionConfig reducedMotion="user">
      <Header page={page === 'lab' ? 'model' : page} />
      <motion.main id="main" key={hash} initial={{ opacity: 0.4, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Suspense fallback={<PageSkeleton />}>{view}</Suspense>
      </motion.main>
      <footer className="footer">
        <div className="wrap" style={{ display: 'grid', gap: 6 }}>
          <span><b>AI Risk Explorer</b> is a training resource. The organisation “Meridian” and the people and headlines in the simulations are fictional; the real cases are summarised from public reporting.</span>
          <span>Legal summaries cover {FRAMEWORKS.length} frameworks, are simplified, and were last reviewed on {fmtDate(SITE.reviewed)}. They are not legal advice; check official sources before relying on them.</span>
          <VisitCount />
        </div>
      </footer>
    </MotionConfig>
  );
}
