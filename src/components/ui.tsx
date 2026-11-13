import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useTween } from '../lib/util';

export function Num({ v, d = 0, suffix = '', prefix = '' }: { v: number; d?: number; suffix?: string; prefix?: string }) {
  const t = useTween(v, 0.14);
  return (
    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
      {prefix}
      {t.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d })}
      {suffix}
    </span>
  );
}

/** metric tile used inside the dark simulation panels */
export function Stat({ l, v, s, tone, d = 0, suffix = '', prefix = '' }: { l: string; v: number; s?: ReactNode; tone?: 'bad' | 'good' | ''; d?: number; suffix?: string; prefix?: string }) {
  return (
    <div className={`stat ${tone ?? ''}`}>
      <div className="stat-l">{l}</div>
      <div className="stat-v"><Num v={v} d={d} suffix={suffix} prefix={prefix} /></div>
      {s && <div className="stat-s">{s}</div>}
    </div>
  );
}

/** small segmented control used inside the dark simulation panels */
export function Seg<T extends string | number | boolean>({ options, value, onChange }: { options: { v: T; l: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div style={{ display: 'inline-flex', padding: 3, borderRadius: 8, background: 'var(--wash-2)', border: '1px solid var(--line)' }}>
      {options.map((o) => (
        <button key={String(o.v)} onClick={() => onChange(o.v)} style={{ border: 'none', padding: '5px 11px', borderRadius: 6, fontSize: 12.5, fontWeight: 600, background: value === o.v ? 'var(--line2)' : 'transparent', color: value === o.v ? 'var(--ink)' : 'var(--muted)' }}>
          {o.l}
        </button>
      ))}
    </div>
  );
}

export function Logo() {
  return (
    <svg width="26" height="26" viewBox="0 0 64 64" aria-hidden>
      <rect width="64" height="64" rx="14" fill="#14171c" stroke="var(--line2)" />
      <circle cx="32" cy="32" r="17" fill="none" stroke="#7da0f3" strokeWidth="3" strokeDasharray="6 4" />
      <circle cx="32" cy="32" r="6" fill="var(--ink)" />
      <circle cx="47" cy="22" r="4" fill="#d9a441" />
    </svg>
  );
}

export function Toggle({ on, kind, title, desc, note, onClick }: { on: boolean; kind: 'problem' | 'fix'; title: string; desc: string; note?: ReactNode; onClick: () => void }) {
  return (
    <button className={`toggle ${kind} ${on ? 'on' : ''}`} onClick={onClick} aria-pressed={on}>
      <span aria-hidden>
        <span className="sw"><motion.span layout className="knob" transition={{ type: 'spring', stiffness: 600, damping: 32 }} /></span>
        <span className="toggle-state">{on ? 'On' : 'Off'}</span>
      </span>
      <span>
        <span className="toggle-t" style={{ display: 'block' }}>{title}</span>
        <span className="toggle-d" style={{ display: 'block' }}>{desc}</span>
        {note && <span className="toggle-n" style={{ display: 'block' }}>{note}</span>}
      </span>
    </button>
  );
}
