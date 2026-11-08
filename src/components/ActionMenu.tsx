import { useEffect, useId, useRef, useState } from 'react';

export interface MenuAction { label: string; onSelect: () => void; disabled?: boolean }

/**
 * A button that opens a short list of actions, keyboard-accessible like the header menus:
 * the button carries aria-expanded, arrow keys move between items (and open the list),
 * Escape closes it and returns focus to the button, a click outside closes it.
 */
export function ActionMenu({ label, items, primary = false }: { label: string; items: MenuAction[]; primary?: boolean }) {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const buttons = () => Array.from(box.current?.querySelectorAll<HTMLButtonElement>('.act-pop button:not(:disabled)') ?? []);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && open) { e.preventDefault(); setOpen(false); btn.current?.focus(); return; }
    if (e.key === 'Tab' && open) { setOpen(false); return; }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    if (!open) { setOpen(true); setTimeout(() => buttons()[0]?.focus(), 0); return; }
    const l = buttons();
    const i = l.indexOf(document.activeElement as HTMLButtonElement);
    const n = e.key === 'ArrowDown' ? (i + 1) % l.length : (i - 1 + l.length) % l.length;
    l[n]?.focus();
  };

  return (
    <div className="act-menu" ref={box} onKeyDown={onKey}>
      <button ref={btn} type="button" className={`btn ${primary ? 'btn-primary' : ''}`} aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        {label} <span className={`caret ${open ? 'up' : ''}`} aria-hidden>▾</span>
      </button>
      {open && (
        <ul id={id} className="act-pop">
          {items.map((it) => (
            <li key={it.label}>
              <button type="button" disabled={it.disabled} onClick={() => { setOpen(false); btn.current?.focus(); it.onSelect(); }}>{it.label}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
