import type { ReactNode } from 'react';

export const scale = (d0: number, d1: number, r0: number, r1: number) => (v: number) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);

export function AxisX({ x, y, ticks, fmt = String, label }: { x: (v: number) => number; y: number; ticks: number[]; fmt?: (v: number) => string; label?: string }) {
  return (
    <g fontSize="10" fill="#7f8bb8" fontFamily="JetBrains Mono">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={y} y2={y + 4} stroke="rgba(130,160,255,.3)" />
          <text x={x(t)} y={y + 16} textAnchor="middle">{fmt(t)}</text>
        </g>
      ))}
      {label && <text x={x(ticks[ticks.length - 1])} y={y + 30} textAnchor="end" fill="#9aa6cf">{label}</text>}
    </g>
  );
}
export function AxisY({ x, y, ticks, fmt = String, w, label }: { x: number; y: (v: number) => number; ticks: number[]; fmt?: (v: number) => string; w: number; label?: string }) {
  return (
    <g fontSize="10" fill="#7f8bb8" fontFamily="JetBrains Mono">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x} x2={x + w} y1={y(t)} y2={y(t)} stroke="rgba(130,160,255,.08)" />
          <text x={x - 8} y={y(t) + 3} textAnchor="end">{fmt(t)}</text>
        </g>
      ))}
      {label && <text x={x} y={y(ticks[ticks.length - 1]) - 12} fill="#9aa6cf">{label}</text>}
    </g>
  );
}

export function VizHead({ title, children }: { title: ReactNode; children?: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
      <div style={{ fontSize: 12.5, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{title}</div>
      {children}
    </div>
  );
}

export const C = {
  A: '#6b8cff',
  B: '#ff6b9a',
  good: '#2ee6c5',
  bad: '#ff5a6e',
  warn: '#ffc857',
  grid: 'rgba(130,160,255,.1)',
  text: '#c9d1f2',
};

export function Flag({ tone, children }: { tone: 'bad' | 'good' | 'warn' | 'info'; children: ReactNode }) {
  const col = tone === 'bad' ? '#ff5a6e' : tone === 'good' ? '#2ee6c5' : tone === 'warn' ? '#ffc857' : '#6b8cff';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 999, color: col, background: `${col}1f`, border: `1px solid ${col}55`, fontFamily: 'var(--mono)' }}>
      <span className="dot" style={{ background: col, width: 6, height: 6 }} />
      {children}
    </span>
  );
}

/** standard normal CDF */
export function phi(z: number) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}
