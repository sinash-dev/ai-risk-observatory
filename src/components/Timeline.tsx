import { motion } from 'framer-motion';
import { useInView } from '../lib/util';

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
/** "Aug 2024" | "2024" -> fractional year */
export function parseDate(d: string) {
  const m = d.trim().toLowerCase().match(/^([a-z]{3})?\s*(\d{4})$/);
  if (!m) return 2024;
  const mi = m[1] ? MONTHS.indexOf(m[1]) : 6;
  return +m[2] + Math.max(0, mi) / 12;
}
const NOW = new Date();
/** current date as a fractional year */
export const TODAY = NOW.getFullYear() + NOW.getMonth() / 12;
/** e.g. "November 2026" */
export const TODAY_LABEL = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(NOW);

/** Horizontal animated timeline with a "today" marker. */
export function HTimeline({ events }: { events: { date: string; text: string }[] }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  const ev = events.map((e) => ({ ...e, y: parseDate(e.date) })).sort((a, b) => a.y - b.y);
  const n = ev.length;
  const x = (i: number) => ((i + 0.5) / n) * 100;
  const past = ev.filter((e) => e.y <= TODAY).length;
  const todayX = (past / n) * 100;
  return (
    <div ref={ref} className="scroll-x" dir="ltr" tabIndex={0} role="region" aria-label="Timeline, scrolls sideways">
      <div style={{ minWidth: Math.max(640, n * 128 + 152), position: 'relative', padding: '8px 0 0' }}>
        <div style={{ position: 'relative', height: 2, background: 'var(--wash-3)', margin: '120px 76px 0' }}>
          <motion.div initial={{ width: 0 }} animate={seen ? { width: `${todayX}%` } : {}} transition={{ duration: 1.4, ease: 'easeOut' }} style={{ position: 'absolute', left: 0, top: 0, height: 2, background: 'var(--accent)' }} />
          {past < n && (
            <div style={{ position: 'absolute', left: `${todayX}%`, top: -9, transform: 'translateX(-50%)' }}>
              <div style={{ width: 2, height: 20, background: 'var(--ink)', opacity: 0.6, margin: '0 auto' }} />
            </div>
          )}
        {ev.map((e, i) => {
            const up = i % 2 === 0;
            const future = e.y > TODAY;
            return (
              <motion.div key={e.date + e.text} initial={{ opacity: 0, y: up ? 10 : -10 }} animate={seen ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.25 + i * 0.12 }}
                style={{ position: 'absolute', left: `${x(i)}%`, top: up ? -112 : 30, width: 126, transform: 'translateX(-50%)', textAlign: 'center' }}>
                <div style={{ position: 'absolute', left: '50%', top: up ? 'auto' : -30, bottom: up ? -14 : 'auto', width: 1, height: up ? 24 : 26, background: 'var(--line2)' }} />
                <div className="mono" style={{ fontSize: 11.5, color: future ? 'var(--c-mid, #d6c06a)' : 'var(--accent)', fontWeight: 600 }}>{e.date}{future ? ' · upcoming' : ''}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink2)', lineHeight: 1.35, marginTop: 2 }}>{e.text}</div>
              </motion.div>
            );
          })}
          {ev.map((e, i) => (
            <span key={'d' + e.date + e.text} style={{ position: 'absolute', left: `${x(i)}%`, top: -5, width: 12, height: 12, borderRadius: '50%', transform: 'translateX(-50%)', background: e.y > TODAY ? 'var(--bg)' : 'var(--accent)', border: `2px solid ${e.y > TODAY ? 'var(--c-mid, #d6c06a)' : 'var(--accent)'}` }} />
          ))}
        </div>
        <div style={{ height: 120 }} />
      </div>
    </div>
  );
}

/** Vertical step-by-step roadmap with a drawing line. */
export function Roadmap({ steps }: { steps: { t: string; d: string }[] }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} style={{ position: 'relative', paddingInlineStart: 46 }}>
      <motion.div initial={{ height: 0 }} animate={seen ? { height: 'calc(100% - 30px)' } : {}} transition={{ duration: 1.2, ease: 'easeOut' }} style={{ position: 'absolute', insetInlineStart: 17, top: 14, width: 2, background: 'linear-gradient(var(--accent), rgba(108,197,176,.15))' }} />
      {steps.map((s, i) => (
        <motion.div key={s.t} initial={{ opacity: 0, x: -12 }} animate={seen ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.15 + i * 0.12 }} style={{ position: 'relative', paddingBottom: 18 }}>
          <span style={{ position: 'absolute', insetInlineStart: -46, top: 0, width: 36, height: 36, borderRadius: '50%', background: 'var(--paper)', border: '1.5px solid var(--accent)', display: 'grid', placeItems: 'center', fontFamily: 'var(--serif)', fontWeight: 700, color: 'var(--accent)', fontSize: 14 }}>{i + 1}</span>
          <div style={{ fontWeight: 700, paddingTop: 6 }}>{s.t}</div>
          <p className="muted small" style={{ marginTop: 2 }}>{s.d}</p>
        </motion.div>
      ))}
    </div>
  );
}
