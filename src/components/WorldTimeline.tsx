/** Worldwide timeline of AI rules: a pinned, scroll-driven horizontal track (vertical list on small screens or reduced motion). */
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { FRAMEWORKS, type FwId } from '../data/frameworks';
import { prefersReducedMotion } from '../lib/util';
import { TODAY, TODAY_LABEL, parseDate } from './Timeline';

interface Ev { date: string; text: string; f: string; id: FwId; y: number; today?: boolean }
const ROWS = 5; // cards per sub-column
const SUB_W = 268; // px per sub-column
const GAP = 28;

function useMedia(q: string) {
  const [m, setM] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(q).matches);
  useEffect(() => {
    const mq = matchMedia(q);
    const h = () => setM(mq.matches);
    h();
    mq.addEventListener?.('change', h);
    return () => mq.removeEventListener?.('change', h);
  }, [q]);
  return m;
}

function Card({ e }: { e: Ev }) {
  if (e.today) return <div className="wt-card wt-now" role="note"><span className="mono">Today · {TODAY_LABEL}</span></div>;
  const future = e.y > TODAY;
  return (
    <div className={`wt-card ${future ? 'future' : ''}`}>
      <div className="wt-card-h"><span className="mono">{e.date}</span><span className="tag">{e.f}</span></div>
      <p>{e.text}</p>
    </div>
  );
}

function Column({ year, events, x, center, progress }: { year: number; events: Ev[]; x: number; center: number; progress: MotionValue<number> }) {
  const span = 0.18;
  const opacity = useTransform(progress, [center - span, center, center + span], [0.45, 1, 0.45]);
  const scale = useTransform(progress, [center - span, center, center + span], [0.94, 1, 0.94]);
  const cols = Math.max(1, Math.ceil(events.length / ROWS));
  return (
    <motion.div className="wt-col" style={{ left: x, width: cols * SUB_W, opacity, scale }}>
      <div className="wt-year" aria-hidden>{year}</div>
      <h3 className="sr-only">{year}</h3>
      <div className="wt-cards" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${Math.min(ROWS, events.length)}, auto)` }}>
        {events.map((e) => <Card key={(e.today ? 'now' : e.id) + e.date + e.text} e={e} />)}
      </div>
    </motion.div>
  );
}

function Track({ events }: { events: Ev[] }) {
  const outer = useRef<HTMLDivElement>(null);
  const [vw, setVw] = useState(1200);
  const years = useMemo(() => Array.from(new Set(events.map((e) => Math.floor(e.y)))).sort(), [events]);
  const layout = useMemo(() => {
    let x = 0;
    return years.map((yr) => {
      const ev = events.filter((e) => Math.floor(e.y) === yr);
      const w = Math.max(1, Math.ceil(ev.length / ROWS)) * SUB_W;
      const col = { yr, ev, x, w };
      x += w + GAP;
      return col;
    });
  }, [events, years]);
  const trackW = layout.length ? layout[layout.length - 1].x + layout[layout.length - 1].w + 40 : 0;
  useLayoutEffect(() => {
    const m = () => setVw(outer.current?.clientWidth ?? window.innerWidth);
    m();
    window.addEventListener('resize', m);
    return () => window.removeEventListener('resize', m);
  }, []);
  const travel = Math.max(0, trackW - vw);
  const { scrollYProgress } = useScroll({ target: outer, offset: ['start start', 'end end'] });
  const tx = useTransform(scrollYProgress, (p) => -p * travel);
  return (
    <div ref={outer} className="wt-outer" style={{ height: `calc(${travel}px + 100vh - 64px)` }}>
      <div className="wt-sticky">
        <motion.div className="wt-track" style={{ x: tx, width: trackW }}>
          <div className="wt-axis" />
          {layout.map((c) => (
            <Column key={c.yr} year={c.yr} events={c.ev} x={c.x} center={travel ? Math.min(1, Math.max(0, (c.x + c.w / 2 - vw / 2) / travel)) : 0} progress={scrollYProgress} />
          ))}
        </motion.div>
        <div className="wt-hint muted small" aria-hidden>Scroll to move through time</div>
      </div>
    </div>
  );
}

function List({ events }: { events: Ev[] }) {
  const years = Array.from(new Set(events.map((e) => Math.floor(e.y))));
  let todayShown = false;
  return (
    <div className="wt-list">
      {years.map((yr) => (
        <div key={yr} className="wt-list-year">
          <h3 className="wt-list-y">{yr}</h3>
          <ul>
            {events.filter((e) => Math.floor(e.y) === yr && !e.today).map((e) => {
              const future = e.y > TODAY;
              const marker = future && !todayShown;
              if (marker) todayShown = true;
              return (
                <li key={e.id + e.date + e.text}>
                  {marker && <div className="wt-list-today mono small">today · {TODAY_LABEL}</div>}
                  <span className={`wt-dot ${future ? 'future' : ''}`} aria-hidden />
                  <span className="mono small" style={{ color: future ? 'var(--c-mid, #d6c06a)' : 'var(--muted)' }}>{e.date}{future ? ' (upcoming)' : ''}</span>
                  <span className="tag">{e.f}</span>
                  <span>{e.text}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function WorldTimeline() {
  const [filter, setFilter] = useState<FwId | 'all'>('all');
  const wide = useMedia('(min-width: 768px)');
  const [reduced, setReduced] = useState(false);
  useEffect(() => { setReduced(prefersReducedMotion()); }, []);
  const events: Ev[] = useMemo(
    () => FRAMEWORKS.filter((f) => filter === 'all' || f.id === filter)
      .flatMap((f) => f.timeline.map((t): Ev => ({ ...t, f: f.short, id: f.id, y: parseDate(t.date) })))
      .concat([{ date: TODAY_LABEL, text: '', f: '', id: 'eu', y: TODAY + 0.0001, today: true }])
      .sort((a, b) => a.y - b.y),
    [filter],
  );
  return (
    <div>
      <div className="chips" role="group" aria-label="Filter the timeline by framework">
        <button className={`chip-btn ${filter === 'all' ? 'on' : ''}`} aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>All</button>
        {FRAMEWORKS.map((f) => (
          <button key={f.id} className={`chip-btn ${filter === f.id ? 'on' : ''}`} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{f.short}</button>
        ))}
      </div>
      {wide && !reduced ? <Track key={filter} events={events} /> : <List events={events} />}
    </div>
  );
}
