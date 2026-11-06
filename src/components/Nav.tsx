/** Breadcrumbs and the sticky in-page table of contents. */
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link } from './Link';

export function Breadcrumbs({ trail }: { trail: { to?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="crumbs">
      <ol>
        <li><Link to="/">Home</Link></li>
        {trail.map((t, i) => (
          <li key={i}>
            {t.to && i < trail.length - 1 ? <Link to={t.to}>{t.label}</Link> : <span aria-current={i === trail.length - 1 ? 'page' : undefined}>{t.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Highlights the section currently in view. */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  const key = ids.join(',');
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!els.length || typeof IntersectionObserver === 'undefined') return;
    const seen = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.isIntersecting ? e.boundingClientRect.top : Infinity));
        // the topmost section that is in the viewport band wins
        const best = ids.filter((id) => (seen.get(id) ?? Infinity) !== Infinity).sort((a, b) => (seen.get(a)! - seen.get(b)!))[0];
        if (best) setActive(best);
      },
      { rootMargin: '-90px 0px -55% 0px', threshold: [0, 0.01] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return active;
}

/**
 * Sticky table of contents. Rendered as a horizontal chip bar under the header;
 * on wide screens (≥ 1200 px) CSS moves it into a right rail.
 */
export function Toc({ items, label = 'On this page' }: { items: { id: string; label: string }[]; label?: string }) {
  const active = useActiveSection(items.map((i) => i.id));
  const list = useRef<HTMLUListElement>(null);
  // keep the active chip visible in the horizontal bar
  useEffect(() => {
    const ul = list.current;
    const a = ul?.querySelector<HTMLElement>('a.on');
    if (!ul || !a || ul.scrollWidth <= ul.clientWidth) return;
    ul.scrollTo({ left: a.offsetLeft - ul.clientWidth / 2 + a.offsetWidth / 2, behavior: 'smooth' });
  }, [active]);
  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(history.state, '', `#${id}`);
    el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  };
  return (
    <nav className="toc no-print" aria-label={label}>
      <div className="toc-label label">{label}</div>
      <ul ref={list}>
        {items.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`} onClick={(e) => go(e, i.id)} className={active === i.id ? 'on' : ''} aria-current={active === i.id ? 'location' : undefined}>
              {active === i.id && <motion.span layoutId="toc-pill" className="toc-pill" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
              <span className="toc-t">{i.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
