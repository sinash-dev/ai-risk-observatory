import { availableLocales, type Locale } from '../i18n/locales';
import { setTheme, useTheme } from '../lib/theme';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { Lens } from '../data/frameworks';
import { FW_LIST, FW_LIST_BY_ID } from '../data/fwList';
import { fwColor } from '../data/fwKind';
import { liveNav, type NavItem } from '../data/nav';
import { setLens, useLens } from '../lib/lens';
import { isMac, openSearch } from '../lib/searchStore';
import { url, useRoute } from '../lib/util';
import { Link } from './Link';
import { Logo } from './ui';

const preload = () => { void import('./Search'); };

const isActive = (path: string, page: string) =>
  path === '/' ? page === '' || page === 'model' : page === path.slice(1);

/** day/night switch; the label says what pressing it will do */
/** language switch; hidden until a second language is published (or preview mode is on) */
function LanguageSwitch() {
  const { hash, locale } = useRoute();
  const langs = availableLocales();
  if (langs.length < 2) return null;
  return (
    <label className="lang-switch">
      <span className="sr-only">Language</span>
      <select value={locale} onChange={(e) => { location.href = url(hash + location.search, e.target.value as Locale); }}>
        {langs.map((l) => <option key={l.code} value={l.code} lang={l.tag}>{l.native}</option>)}
      </select>
    </label>
  );
}

function ThemeToggle() {
  const t = useTheme();
  const next = t === 'dark' ? 'light' : 'dark';
  return (
    <button className="icon-btn theme-btn" onClick={() => setTheme(next)} aria-label={`Switch to ${next} theme`} title={`Switch to ${next} theme`}>
      {t === 'dark' ? (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
      )}
    </button>
  );
}

function LensSelect({ id }: { id: string }) {
  const lens = useLens();
  return (
    <label className="lens" htmlFor={id} data-tour="lens">
      <span>View through</span>
      <select id={id} value={lens} onChange={(e) => setLens(e.target.value as Lens)}>
        <option value="all">All frameworks</option>
        {FW_LIST.map((f) => <option key={f.id} value={f.id}>{f.short}</option>)}
      </select>
    </label>
  );
}

/** Disclosure menu (WAI-ARIA): button + list of links; Esc closes, arrows move. */
function Menu({ label, items, page }: { label: string; items: NavItem[]; page: string }) {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const on = items.some((i) => isActive(i.path, page));
  const id = `menu-${label.toLowerCase()}`;

  useEffect(() => { setOpen(false); }, [page]);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const links = () => Array.from(box.current?.querySelectorAll<HTMLAnchorElement>('.menu-pop a') ?? []);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && open) { e.preventDefault(); setOpen(false); btn.current?.focus(); return; }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    if (!open) { setOpen(true); setTimeout(() => links()[0]?.focus(), 0); return; }
    const l = links();
    const i = l.indexOf(document.activeElement as HTMLAnchorElement);
    const n = e.key === 'ArrowDown' ? (i + 1) % l.length : (i - 1 + l.length) % l.length;
    l[n]?.focus();
  };

  if (!items.length) return null;
  return (
    <div className="menu" ref={box} onKeyDown={onKey}>
      <button ref={btn} className={`nav-btn ${on ? 'active' : ''}`} aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        {label} <span className={`caret ${open ? 'up' : ''}`} aria-hidden>▾</span>
        {on && <motion.span layoutId="nav-underline" className="nav-underline" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div id={id} className="menu-pop" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.16 }}>
            <ul>
              {items.map((i) => (
                <li key={i.path}>
                  <Link to={i.path} aria-current={isActive(i.path, page) ? 'page' : undefined} onClick={() => setOpen(false)}>
                    <span className="menu-t">{i.label}</span>
                    <span className="menu-d">{i.desc}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Full-height sheet for small screens. Focus is trapped while open. */
function Sheet({ open, onClose, page }: { open: boolean; onClose: () => void; page: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    setTimeout(() => ref.current?.querySelector<HTMLElement>('button, a')?.focus(), 30);
    const body = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = body; prev?.focus?.(); };
  }, [open]);
  useEffect(() => { onClose(); /* close on navigation */ }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
    if (e.key !== 'Tab') return;
    const f = Array.from(ref.current?.querySelectorAll<HTMLElement>('a, button, select') ?? []);
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
  };
  const groups: [string, NavItem[]][] = [['Explore', liveNav('main')], ['Learn', liveNav('learn')], ['Tools', liveNav('tools')], ['About', liveNav('about')]];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="sheet-backdrop" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            ref={ref}
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            onKeyDown={onKey}
            initial={{ x: document.dir === 'rtl' ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: document.dir === 'rtl' ? '-100%' : '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          >
            <div className="sheet-top">
              <span className="label">Menu</span>
              <button className="icon-btn" onClick={onClose} aria-label="Close menu">✕</button>
            </div>
            <button className="btn sheet-search" onClick={() => { onClose(); setTimeout(openSearch, 50); }}>⌕ Search the site</button>
            <LensSelect id="lens-sheet" />
            <div className="sheet-lang"><LanguageSwitch /></div>
            {groups.filter(([, items]) => items.length).map(([g, items]) => (
              <nav key={g} aria-label={g}>
                <div className="label" style={{ margin: '18px 0 6px' }}>{g}</div>
                {items.map((i) => (
                  <Link key={i.path} to={i.path} className={`sheet-link ${isActive(i.path, page) ? 'active' : ''}`} aria-current={isActive(i.path, page) ? 'page' : undefined}>
                    {i.label}
                  </Link>
                ))}
              </nav>
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function LensBar() {
  const lens = useLens();
  const f = lens !== 'all' ? FW_LIST_BY_ID[lens] : null;
  return (
    <AnimatePresence initial={false}>
      {f && (
        <motion.div className="lens-bar" key="lens" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}>
          <div className="wrap">
            <span className="lens-dot" style={{ background: fwColor(f) }} aria-hidden />
            <span>You are viewing everything through <b>{f.name}</b>.</span>
            <Link to={`/rules/${lens}`}>About it</Link>
            <button onClick={() => setLens('all')}>Show all frameworks</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Header({ page }: { page: string }) {
  const [sheet, setSheet] = useState(false);
  const [kbd, setKbd] = useState('Ctrl K');
  useEffect(() => { if (isMac()) setKbd('⌘K'); }, []);

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="header">
        <div className="wrap header-in">
          <a href={url('/')} className="brand"><Logo /> AI Risk Explorer</a>
          <nav className="nav" aria-label="Main">
            {liveNav('main').map((x) => {
              const on = isActive(x.path, page);
              return (
                <a key={x.path} href={url(x.path)} className={on ? 'active' : ''} aria-current={on ? 'page' : undefined}>
                  {x.label}
                  {on && <motion.span layoutId="nav-underline" className="nav-underline" />}
                </a>
              );
            })}
            <Menu label="Learn" items={liveNav('learn')} page={page} />
            <Menu label="Tools" items={liveNav('tools')} page={page} />
          </nav>
          <div className="header-right">
            <button className="search-btn" onClick={openSearch} onPointerEnter={preload} onFocus={preload} data-tour="search" aria-keyshortcuts="Control+K Meta+K /">
              <span aria-hidden>⌕</span><span className="search-l">Search</span><kbd aria-hidden>{kbd}</kbd>
            </button>
            <div className="lens-wide"><LensSelect id="lens-header" /></div>
            <LanguageSwitch />
            <ThemeToggle />
            <button className="icon-btn burger" onClick={() => setSheet(true)} aria-label="Open menu" aria-expanded={sheet}>☰</button>
          </div>
        </div>
      </header>
      <LensBar />
      <Sheet open={sheet} onClose={() => setSheet(false)} page={page} />
    </>
  );
}
