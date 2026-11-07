import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Breadcrumbs } from '../components/Nav';
import { SLIDES, WORKSHOP_SUB, WORKSHOP_TITLE, type Slide } from '../data/workshop';
import { track } from '../lib/track';
import { BASE, url } from '../lib/util';

/** the timed activities, to scale, for the agenda bar */
const AGENDA = [
  { from: 0, to: 10, label: 'Warm-up', slide: 'warmup' },
  { from: 10, to: 25, label: 'Break and fix', slide: 'credit' },
  { from: 25, to: 40, label: 'One framework', slide: 'framework' },
  { from: 40, to: 50, label: 'Compare', slide: 'compare' },
  { from: 50, to: 55, label: 'Hard case', slide: 'hard' },
  { from: 55, to: 60, label: 'Take away', slide: 'takeaway' },
];
const fromHash = () => { const n = Number(location.hash.slice(1)); return Number.isInteger(n) && n >= 1 && n <= SLIDES.length ? n - 1 : 0; };

function SlideBody({ s }: { s: Slide }) {
  return (
    <>
      <div className="ws-kicker">{s.kicker}{s.time && <span className="ws-time">{s.time}</span>}</div>
      <h2 className="ws-title">{s.title}</h2>
      {s.points && <ul className="ws-points">{s.points.map((p) => <li key={p}>{p}</li>)}</ul>}
      {s.task && <div className="ws-task"><span className="label">Your task</span><p>{s.task}</p></div>}
      {s.link && <p className="ws-link"><a href={url(s.link.to)} target="_blank" rel="noopener">{s.link.label} ↗</a></p>}
    </>
  );
}

export default function Workshop() {
  const [i, setI] = useState(fromHash);
  const [notes, setNotes] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const go = useCallback((n: number) => setI(Math.max(0, Math.min(SLIDES.length - 1, n))), []);
  useEffect(() => { history.replaceState(history.state, '', `${location.pathname}${location.search}#${i + 1}`); }, [i]);
  // follow the address when only the #slide number changes, e.g. a pasted link or the back button
  useEffect(() => {
    const h = () => setI(fromHash());
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.ctrlKey || e.metaKey || e.altKey || (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key === ' ' && t && /^(BUTTON|A)$/.test(t.tagName)) return;
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(i + 1); }
      else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(i - 1); }
      else if (e.key === 'Home') { e.preventDefault(); go(0); }
      else if (e.key === 'End') { e.preventDefault(); go(SLIDES.length - 1); }
      else if (e.key.toLowerCase() === 'n') setNotes((x) => !x);
      else if (e.key.toLowerCase() === 'f') full();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  const full = () => {
    const el = stage.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else { el.requestFullscreen?.().catch(() => {}); track('workshop-present'); }
  };
  const s = SLIDES[i];

  return (
    <div className="wrap" style={{ padding: '30px 0 44px' }}>
      <div className="narrow stack no-print">
        <Breadcrumbs trail={[{ label: 'Learn' }, { label: 'Workshop slides' }]} />
        <h1>Workshop slides</h1>
        <p className="lead">Everything you need to run a 60-minute, hands-on session on AI risk: {SLIDES.length} slides with timings, tasks for small groups, and notes for the person running it.</p>
        <p className="small muted">Keys: → or space for the next slide, ← to go back, N for notes, F for full screen. Print the handout for a copy with all the notes. You can also <a href={`${BASE}toolkit/workshop-facilitator-guide.md`} download>download the facilitator guide</a>.</p>
      </div>

      <div ref={stage} className="ws-stage no-print" role="region" aria-roledescription="slide deck" aria-label={WORKSHOP_TITLE}>
        <div className="ws-slide" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div key={s.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
              <SlideBody s={s} />
            </motion.div>
          </AnimatePresence>
        </div>
        {notes && (
          <aside className="ws-notes" aria-label="Facilitator notes">
            <span className="label">Notes for the facilitator</span>
            <ul>{s.notes.map((n) => <li key={n}>{n}</li>)}</ul>
          </aside>
        )}
        <div className="ws-bar">
          <button className="btn btn-sm" onClick={() => go(i - 1)} disabled={i === 0} aria-label="Previous slide">←</button>
          <span className="mono small" aria-live="polite">{i + 1} / {SLIDES.length}</span>
          <button className="btn btn-sm" onClick={() => go(i + 1)} disabled={i === SLIDES.length - 1} aria-label="Next slide">→</button>
          <span style={{ flex: 1 }} />
          <button className="btn btn-sm" onClick={() => setNotes((x) => !x)} aria-pressed={notes}>{notes ? 'Hide notes' : 'Show notes'}</button>
          <button className="btn btn-sm" onClick={full}>Full screen</button>
          <button className="btn btn-sm" onClick={() => { track('workshop-handout'); window.print(); }}>Print handout</button>
        </div>
        <ol className="ws-agenda" aria-label="The hour at a glance">
          {AGENDA.map((a) => {
            const on = s.time ? (() => { const st = Number(s.time.split(/[–\s]/)[0]); return st >= a.from && st < a.to; })() : false;
            return (
              <li key={a.slide} style={{ flexGrow: a.to - a.from }} className={on ? 'on' : ''}>
                <button onClick={() => go(SLIDES.findIndex((x) => x.id === a.slide))} aria-current={on ? 'step' : undefined}>
                  <span className="ws-ag-t">{a.from}–{a.to}</span><span className="ws-ag-l">{a.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="ws-dots" role="tablist" aria-label="Slides">
          {SLIDES.map((x, k) => <button key={x.id} role="tab" aria-selected={k === i} aria-label={`Slide ${k + 1}: ${x.title}`} className={k === i ? 'on' : ''} onClick={() => go(k)} />)}
        </div>
      </div>

      <section className="print-only ws-handout">
        <p className="ws-hand-title">{WORKSHOP_TITLE}</p>
        <p>{WORKSHOP_SUB}. Facilitator handout from AI Risk Explorer (https://sinash-dev.github.io/ai-risk-observatory/), CC BY 4.0.</p>
        {SLIDES.map((x, k) => (
          <div key={x.id} className="ws-print-slide">
            <h2>{k + 1}. {x.title}{x.time ? ` (${x.time})` : ''}</h2>
            {x.points && <ul>{x.points.map((p) => <li key={p}>{p}</li>)}</ul>}
            {x.task && <p><b>Task:</b> {x.task}</p>}
            {x.link && <p><b>Link:</b> https://sinash-dev.github.io/ai-risk-observatory{url(x.link.to).replace(BASE.replace(/\/$/, ''), '')}</p>}
            <p><b>Notes:</b></p>
            <ul>{x.notes.map((n) => <li key={n}>{n}</li>)}</ul>
          </div>
        ))}
      </section>
    </div>
  );
}
