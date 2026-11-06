import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Breadcrumbs } from '../components/Nav';
import { csvToHtml, markdownToHtml } from '../lib/markdown';
import { BASE } from '../lib/util';

export const TEMPLATES: { file: string; title: string; desc: string; icon: string }[] = [
  { file: 'ai-use-case-intake.md', title: 'AI use case intake', desc: 'A one-page screening form for new AI ideas, purchases and pilots.', icon: '◎' },
  { file: 'ai-system-inventory.csv', title: 'AI system inventory', desc: 'A spreadsheet register of every AI system: owner, purpose, category and review dates.', icon: '▦' },
  { file: 'ai-risk-assessment.md', title: 'AI risk assessment', desc: 'Context, a risk table with likelihood and severity, testing evidence and residual risk sign-off.', icon: '△' },
  { file: 'fundamental-rights-impact-assessment.md', title: 'Fundamental-rights impact assessment', desc: 'Structured on the six elements of EU AI Act Art. 27(1).', icon: '⚖' },
  { file: 'dpia-ai-supplement.md', title: 'DPIA supplement for AI', desc: 'AI-specific questions to add to a GDPR data protection impact assessment.', icon: '🔒' },
  { file: 'model-card.md', title: 'Model card', desc: 'Intended use, data, performance by group, limits and monitoring.', icon: '▤' },
  { file: 'human-oversight-checklist.md', title: 'Human oversight checklist', desc: 'What overseers must be able to do under EU AI Act Art. 14.', icon: '◉' },
  { file: 'vendor-ai-questionnaire.md', title: 'Vendor AI questionnaire', desc: 'Fifteen questions to ask suppliers of AI systems and features.', icon: '⇄' },
  { file: 'ai-incident-report.md', title: 'AI incident report', desc: 'Impact, immediate actions, reporting duties and root cause.', icon: '!' },
  { file: 'agent-authorisation-matrix.md', title: 'Agent authorisation matrix', desc: 'Tools, scope, limits, approval gates, logging and kill switch for each AI agent.', icon: '⌘' },
  { file: 'workshop-facilitator-guide.md', title: 'Workshop facilitator guide', desc: 'A 60-minute session plan with links to pre-configured scenarios and debrief questions.', icon: '✎' },
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
          <a className="btn btn-sm" href={href(file)} download>Download</a>
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
        <p className="lead">{TEMPLATES.length} practical templates for running AI governance: from the first intake form to incident reports. Placeholders are in [brackets].</p>
        <p className="small muted">The templates are free to adapt (CC BY 4.0). They are starting points, not legal advice.</p>
      </div>
      <div className="grid3 tk-grid">
        {TEMPLATES.map((t, i) => (
          <motion.div key={t.file} className="card card-pad tk" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.06 }}>
            <span className="tk-ic" aria-hidden>{t.icon}</span>
            <h2 className="tk-t">{t.title}</h2>
            <p className="muted small">{t.desc}</p>
            <div className="tk-actions">
              <button className="btn btn-sm" onClick={() => setOpen(t)}>Preview</button>
              <a className="btn btn-sm" href={href(t.file)} download>Download {t.file.endsWith('.csv') ? 'CSV' : 'Markdown'}</a>
            </div>
          </motion.div>
        ))}
      </div>
      <AnimatePresence>{open && <Preview key={open.file} file={open.file} title={open.title} onClose={() => setOpen(null)} />}</AnimatePresence>
    </div>
  );
}
