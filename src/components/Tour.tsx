/** First-visit tour: a dismissible pill, then four popovers anchored to real elements. Never blocks the page. */
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const KEY = 'tour-done';
const STEPS = [
  { sel: '[data-tour="orbit"]', t: 'The map of examples', d: 'Each dot is a working simulation of a real kind of AI system, from simple statistical models (inner ring) to autonomous agents (outer ring). Pick any one.' },
  { sel: '[data-tour="lens"]', t: 'View through a framework', d: 'Choose a law or standard here and the whole site re-colours to show how that framework classifies each example.' },
  { sel: '[data-tour="model-card"]', t: 'Open an example', d: 'Each example lets you switch on problems, add safeguards and see what the rules require. Credit scoring is a good first one.' },
  { sel: '[data-tour="search"]', t: 'Search anything', d: 'Find models, frameworks, articles such as “Art. 27” and terms. Shortcut: Ctrl K, or ⌘K on a Mac, or press /.' },
];

const done = () => { try { return localStorage.getItem(KEY) === '1'; } catch { return true; } };
const finish = () => { try { localStorage.setItem(KEY, '1'); } catch { /* ignore */ } };

function visible(el: Element | null) {
  if (!el) return false;
  const r = (el as HTMLElement).getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

export function Tour() {
  const [pill, setPill] = useState(false);
  const [step, setStep] = useState(-1);
  const [pos, setPos] = useState<{ top: number; left: number; w: number } | null>(null);
  const pop = useRef<HTMLDivElement>(null);
  const steps = STEPS;

  useEffect(() => { const t = setTimeout(() => setPill(!done()), 1200); return () => clearTimeout(t); }, []);

  const close = () => { finish(); setStep(-1); setPill(false); };

  // position next to the current anchor; skip anchors that are hidden at this screen size
  useLayoutEffect(() => {
    if (step < 0) return;
    const el = document.querySelector(steps[step].sel);
    if (!visible(el)) { if (step < steps.length - 1) setStep(step + 1); else close(); return; }
    el!.scrollIntoView({ block: 'center', behavior: 'auto' });
    const place = () => {
      const r = el!.getBoundingClientRect();
      const w = Math.min(320, window.innerWidth - 32);
      const below = r.bottom + 12 + 200 < window.innerHeight;
      const top = below ? r.bottom + 12 : Math.max(12, r.top - 12 - 190);
      const left = Math.min(Math.max(16, r.left + r.width / 2 - w / 2), window.innerWidth - w - 16);
      setPos({ top, left, w });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, { passive: true });
    setTimeout(() => pop.current?.focus(), 30);
    return () => { window.removeEventListener('resize', place); window.removeEventListener('scroll', place); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <>
      <AnimatePresence>
        {pill && step < 0 && (
          <motion.div className="tour-pill no-print" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>
            <button onClick={() => setStep(0)}>New here? Take the 60-second tour</button>
            <button className="tour-x" onClick={close} aria-label="Dismiss the tour">✕</button>
          </motion.div>
        )}
      </AnimatePresence>
      {step >= 0 && pos && (
        <motion.div
          ref={pop}
          key={step}
          className="tour-pop"
          role="dialog"
          aria-label={`Tour step ${step + 1} of ${steps.length}: ${steps[step].t}`}
          tabIndex={-1}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.w }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          onKeyDown={(e) => { if (e.key === 'Escape') close(); }}
        >
          <div className="label">Step {step + 1} of {steps.length}</div>
          <h2 className="tour-t">{steps[step].t}</h2>
          <p>{steps[step].d}</p>
          <div className="tour-actions">
            <button className="tour-skip" onClick={close}>Skip</button>
            <span style={{ flex: 1 }} />
            {step > 0 && <button className="btn" onClick={() => setStep(step - 1)}>Back</button>}
            <button className="btn btn-primary" onClick={() => (step < steps.length - 1 ? setStep(step + 1) : close())}>{step < steps.length - 1 ? 'Next' : 'Done'}</button>
          </div>
        </motion.div>
      )}
    </>
  );
}
