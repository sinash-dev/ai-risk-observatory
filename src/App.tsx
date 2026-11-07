import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { Suspense, lazy, useEffect, useState } from 'react';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { PageSkeleton } from './components/PageSkeleton';
import { ToastHost } from './components/Toast';
import { Tour } from './components/Tour';
import { REGISTRY } from './pages/registry';
import { setDocumentMeta } from './lib/meta';
import { installSearchShortcut, useSearchOpen } from './lib/searchStore';
import { useTilt } from './lib/tilt';
import { BASE, currentLocale, localeOfPath, navigate, routeParts, useRoute } from './lib/util';
import { LOCALE_BY_CODE, isLocale } from './i18n/locales';

const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })));
const ModelPage = lazy(() => import('./pages/Model').then((m) => ({ default: m.ModelPage })));
const Frameworks = lazy(() => import('./pages/Frameworks').then((m) => ({ default: m.Frameworks })));
const FrameworkPage = lazy(() => import('./pages/Frameworks').then((m) => ({ default: m.FrameworkPage })));
const Compare = lazy(() => import('./pages/Compare').then((m) => ({ default: m.Compare })));
const Basics = lazy(() => import('./pages/Basics').then((m) => ({ default: m.Basics })));
installSearchShortcut();


/**
 * The search dialog is loaded on demand with a plain state update rather than React.lazy:
 * pages that animate every frame (the home orbit) can starve a Suspense retry for seconds.
 */
type SearchComp = typeof import('./components/Search').default;
let searchMod: Promise<SearchComp> | null = null;
const loadSearch = () => (searchMod ??= import('./components/Search').then((m) => m.default));
function SearchHost() {
  const open = useSearchOpen();
  const [Comp, setComp] = useState<SearchComp | null>(null);
  useEffect(() => { if (open && !Comp) loadSearch().then((c) => setComp(() => c)); }, [open, Comp]);
  return open && Comp ? <Comp /> : null;
}
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));

/** Send one page view to GoatCounter (cookieless, no personal data). */
function countView(path: string, tries = 0) {
  const gc = (window as unknown as { goatcounter?: { count?: (o: object) => void } }).goatcounter;
  if (gc?.count) gc.count({ path, title: document.title });
  else if (tries < 20) setTimeout(() => countView(path, tries + 1), 500);
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
      if (localeOfPath(u.pathname) !== currentLocale()) return; // another language: full load, so lang and dir come from the page
      e.preventDefault();
      navigate('/' + routeParts(u.pathname).join('/') + u.search + u.hash);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
}

export default function App() {
  const { page, param, hash, query, locale } = useRoute();
  // language and direction of the document follow the address
  useEffect(() => {
    const info = LOCALE_BY_CODE[locale];
    document.documentElement.lang = info.tag;
    document.documentElement.dir = info.dir;
  }, [locale]);
  // an address in a language that is not published yet goes to the English page
  useEffect(() => {
    const first = location.pathname.slice(BASE.length).split('/')[0];
    if (isLocale(first) && first !== 'en' && first !== locale) navigate(hash + location.search + location.hash, { replace: true });
  }, [locale, hash]);
  // titles come from the route table, loaded on demand (the static HTML already has the first one)
  useEffect(() => { let live = true; import('./data/routes').then((m) => { if (live) { const meta = m.routeMeta(hash); setDocumentMeta(meta.title, meta.description); } }); return () => { live = false; }; }, [hash]);
  useLinkInterception();
  useTilt();
  useEffect(() => { countView(hash); }, [hash]);

  let view;
  if (page === '') view = <Home />;
  else if ((page === 'model' || page === 'lab') && param) view = <ModelPage key={param} id={param} query={query} />;
  else if (page === 'rules' && param) view = <FrameworkPage id={param} />;
  else if (page === 'rules') view = <Frameworks />;
  else if (page === 'basics') view = <Basics />;
  else if (page === 'compare') view = <Compare key={param ?? 'all'} fw={param} query={query} />;
  else if (REGISTRY[page]) { const P = REGISTRY[page]; view = <P key={page + (param ?? '')} param={param} query={query} />; }
  else view = <NotFound />;

  return (
    <MotionConfig reducedMotion="user">
      <Header page={page === 'lab' ? 'model' : page} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main id="main" tabIndex={-1} key={hash} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          <Suspense fallback={<PageSkeleton />}>{view}</Suspense>
        </motion.main>
      </AnimatePresence>
      <Footer />
      {page === '' && <Tour />}
      <SearchHost />
      <ToastHost />
    </MotionConfig>
  );
}
