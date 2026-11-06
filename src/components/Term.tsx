/** Inline glossary term: dotted underline, definition on hover, focus or tap. */
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { GLOSSARY_BY_ID } from '../data/glossary';
import { url } from '../lib/util';

export function Term({ id, children }: { id: string; children: ReactNode }) {
  const g = GLOSSARY_BY_ID[id];
  const [open, setOpen] = useState(false);
  const tip = useId();
  const box = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return;
    const off = (e: Event) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', off);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', off); document.removeEventListener('keydown', esc); };
  }, [open]);
  if (!g) return <>{children}</>;
  return (
    <span className="term" ref={box} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" className="term-btn" aria-describedby={open ? tip : undefined} aria-expanded={open} onClick={() => setOpen((o) => !o)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>
        {children}
      </button>
      {open && (
        <span role="tooltip" id={tip} className="term-pop">
          <b>{g.term}</b>
          <span>{g.def}</span>
          <a href={url(`/glossary#${g.id}`)} tabIndex={-1}>In the glossary →</a>
        </span>
      )}
    </span>
  );
}
