/** Small charts for the AI register overview. Both have a text equivalent next to them. */
import { useState } from 'react';
import type { Deadline } from '../lib/register';

/** One bar split by category, 2px gaps between segments, legend with counts underneath. */
export function CategoryBar({ items }: { items: { key: string; label: string; color: string; n: number }[] }) {
  const total = items.reduce((a, x) => a + x.n, 0);
  if (!total) return null;
  const shown = items.filter((x) => x.n > 0);
  return (
    <div className="cat-bar-wrap">
      <div className="cat-bar" role="img" aria-label={shown.map((x) => `${x.label}: ${x.n}`).join(', ')}>
        {shown.map((x) => <span key={x.key} style={{ flexGrow: x.n, background: x.color }} title={`${x.label}: ${x.n} of ${total}`} />)}
      </div>
      <ul className="cat-legend">
        {shown.map((x) => <li key={x.key}><span className="swatch" style={{ background: x.color }} />{x.label} <b>{x.n}</b></li>)}
      </ul>
    </div>
  );
}

const DAY = 86400000;
const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

/** One marker per date on a time axis starting today; the number shows how many systems share it. */
export function DeadlineChart({ items, today = new Date() }: { items: Deadline[]; today?: Date }) {
  const [hi, setHi] = useState<number | null>(null);
  if (!items.length) return null;
  const W = 520, H = 92, L = 18, R = 22, axisY = 60;
  const start = today.getTime();
  const lastYear = Math.max(...items.map((d) => d.date.getUTCFullYear())) + 1;
  const end = Date.UTC(lastYear, 0, 1);
  const x = (t: number) => L + ((t - start) / (end - start)) * (W - L - R);
  const years: number[] = [];
  for (let y = today.getUTCFullYear() + 1; y <= lastYear; y++) years.push(y);
  const byDate = new Map<string, Deadline[]>();
  for (const d of items) { const k = d.date.toISOString().slice(0, 10); byDate.set(k, [...(byDate.get(k) ?? []), d]); }
  const marks = [...byDate.entries()].map(([k, ds]) => ({ k, ds, date: ds[0].date, cx: x(ds[0].date.getTime()) }));
  const h = hi === null ? null : marks[hi];
  return (
    <div className="dl-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`Timeline of ${items.length} upcoming dates; the list below has the details`}>
        <line x1={L} x2={W - R} y1={axisY} y2={axisY} className="dl-axis" />
        <line x1={L} x2={L} y1={axisY - 6} y2={axisY + 6} className="dl-axis" />
        <text x={L} y={axisY + 22} className="dl-tick">Today</text>
        {years.map((y) => { const tx = x(Date.UTC(y, 0, 1)); return (
          <g key={y}><line x1={tx} x2={tx} y1={axisY - 4} y2={axisY + 4} className="dl-axis" /><text x={tx} y={axisY + 22} className="dl-tick" textAnchor="middle">{y}</text></g>
        ); })}
        {marks.map((m, i) => (
          <g key={m.k} className={`dl-mark ${hi === i ? 'on' : ''}`} tabIndex={0} role="img"
            aria-label={`${fmt(m.date)}: ${m.ds.map((d) => d.system || 'Unnamed system').join(', ')}`}
            onMouseEnter={() => setHi(i)} onMouseLeave={() => setHi(null)} onFocus={() => setHi(i)} onBlur={() => setHi(null)}>
            <line x1={m.cx} x2={m.cx} y1={axisY} y2={axisY - 16} className="dl-stem" />
            <circle cx={m.cx} cy={axisY - 28} r={12} className="dl-dot" />
            <text x={m.cx} y={axisY - 24} textAnchor="middle" className="dl-n">{m.ds.length}</text>
          </g>
        ))}
      </svg>
      <div className="dl-tip" aria-hidden="true" style={{ opacity: h ? 1 : 0, left: h ? `${Math.min(80, Math.max(12, (h.cx / W) * 100))}%` : 0 }}>
        {h && (
          <>
            <b>{fmt(h.date)}</b> <span className="dl-days">in {Math.ceil((h.date.getTime() - start) / DAY)} days</span>
            <ul>{h.ds.slice(0, 4).map((d, k) => <li key={k}>{d.system || 'Unnamed system'}: {d.label.replace(/^EU AI Act: /, '')}</li>)}{h.ds.length > 4 && <li>and {h.ds.length - 4} more</li>}</ul>
          </>
        )}
      </div>
    </div>
  );
}
