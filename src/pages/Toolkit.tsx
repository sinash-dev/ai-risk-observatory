import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Breadcrumbs } from '../components/Nav';
import { csvToHtml, markdownToHtml } from '../lib/markdown';
import { track } from '../lib/track';
import { BASE } from '../lib/util';
import { TEMPLATES } from '../data/templates';

export { TEMPLATES } from '../data/templates';

const GROUPS = [
  { id: 'everyday', title: 'Everyday governance', intro: 'For any organisation that builds or uses AI: from the first intake form to incident reports.', items: TEMPLATES.filter((t) => !t.pack) },
  { id: 'packs', title: 'Framework packs', intro: 'Outlines that follow a specific law or standard, clause by clause. Each field names the clause it comes from, so you can check it against the official text.', items: TEMPLATES.filter((t) => t.pack) },
];

const href = (file: string) => `${BASE}toolkit/${file}`;

function Preview({ file, title, onClose }: { file: string; title: string; onClose: () => void }) {
  const [html, setHtml] = useState<string | null>(null);
  const [err, setErr] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    fetch(href(file)).then((r) => (r.ok ? r.text() : Promise.reject())).then((t) => setHtml(file.endsWith('.csv') ? csvToHtml(t) : markdownToHtml(t))).catch(() => setErr(true));
    const prev = document.activeElement as HTMLElement | null;
    const body = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setTimeout(() => box.current?.querySelector<HTMLElement>('button')?.focus(), 30);
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    return () => { document.body.style.overflow = body; document.removeEventListener('keydown', esc); prev?.focus?.(); };
  }, [file, onClose]);
  const trap = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const f = Array.from(box.current?.querySelectorAll<HTMLElement>('a, button') ?? []);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  };
  return (
    <motion.div className="palette-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div ref={box} role="dialog" aria-modal="true" aria-label={`Preview: ${title}`} className="tk-modal" onKeyDown={trap} initial={{ y: 12, scale: 0.98 }} animate={{ y: 0, scale: 1 }}>
        <div className="tk-modal-top">
          <b>{title}</b>
          <span style={{ flex: 1 }} />
          <a className="btn btn-sm" href={href(file)} download onClick={() => track(`template-${file.replace(/\.[a-z]+$/, '')}`)}>Download</a>
          <button className="btn btn-sm" onClick={onClose}>Close</button>
        </div>
        <div className="tk-doc" tabIndex={0}>
          {err ? <p className="muted">The template could not be loaded. Try downloading it instead.</p> : html === null ? <div className="skel" style={{ height: 300 }} /> : <div dangerouslySetInnerHTML={{ __html: html }} />}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Toolkit() {
  const [open, setOpen] = useState<(typeof TEMPLATES)[number] | null>(null);
  // warm the browser cache so the templates also work offline after the page has loaded
  useEffect(() => { const t = setTimeout(() => TEMPLATES.forEach((x) => fetch(href(x.file)).catch(() => {})), 1500); return () => clearTimeout(t); }, []);
  return (
    <div className="wrap" style={{ padding: '30px 0 44px' }}>
      <div className="narrow stack">
        <Breadcrumbs trail={[{ label: 'Tools' }, { label: 'Toolkit' }]} />
        <h1>Toolkit</h1>
        <p className="lead">{TEMPLATES.length} templates for running AI governance, including outlines that follow the EU AI Act, ISO/IEC 42001, NYC Local Law 144 and Korea's AI Basic Act. Placeholders are in [brackets].</p>
        <p className="small muted">The templates are free to adapt (CC BY 4.0). They are starting points, not legal advice.</p>
      </div>
      {GROUPS.map((g) => (
        <section key={g.id} id={g.id} className="tk-group" aria-labelledby={`${g.id}-h`}>
          <div className="narrow stack">
            <h2 id={`${g.id}-h`}>{g.title}</h2>
            <p className="muted">{g.intro}</p>
          </div>
          <div className="grid3 tk-grid">
            {g.items.map((t, i) => (
              <motion.div key={t.file} className="card card-pad tk" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.06 }}>
                <span className="tk-ic" aria-hidden>{t.icon}</span>
                {t.pack && <span className="label">{t.pack}</span>}
                <h3 className="tk-t">{t.title}</h3>
                <p className="muted small">{t.desc}</p>
                <div className="tk-actions">
                  <button className="btn btn-sm" onClick={() => setOpen(t)}>Preview</button>
                  <a className="btn btn-sm" href={href(t.file)} download onClick={() => track(`template-${t.file.replace(/\.[a-z]+$/, '')}`)}>Download {t.file.endsWith('.csv') ? 'CSV' : 'Markdown'}</a>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      ))}
      <AnimatePresence>{open && <Preview key={open.file} file={open.file} title={open.title} onClose={() => setOpen(null)} />}</AnimatePresence>
    </div>
  );
}
