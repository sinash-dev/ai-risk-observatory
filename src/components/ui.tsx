import { useEffect, useRef, type ReactNode } from 'react';
import { RISKS } from '../data/risks';
import type { RiskKey } from '../data/types';
import { useTween, useTweenArray } from '../lib/util';

/* ---------- animated number ---------- */
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

export function Stat({ l, v, s, tone, d = 0, suffix = '', prefix = '' }: { l: string; v: number; s?: ReactNode; tone?: 'bad' | 'good' | ''; d?: number; suffix?: string; prefix?: string }) {
  return (
    <div className={`stat ${tone ?? ''}`} style={{ transition: 'all .4s' }}>
      <div className="stat-l">{l}</div>
      <div className="stat-v">
        <Num v={v} d={d} suffix={suffix} prefix={prefix} />
      </div>
      {s && <div className="stat-s">{s}</div>}
    </div>
  );
}

/* ---------- brand mark ---------- */
export function Mark({ size = 30 }: { size?: number }) {
  return (
    <svg className="brand-mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <radialGradient id="bm" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#7cf7e4" />
          <stop offset="1" stopColor="#2b6cff" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="26" fill="none" stroke="#2a3b6b" strokeWidth="2" />
      <circle cx="32" cy="32" r="15" fill="none" stroke="#3b5296" strokeWidth="2" />
      <circle cx="32" cy="32" r="6" fill="url(#bm)">
        <animate attributeName="r" values="5.5;7;5.5" dur="3s" repeatCount="indefinite" />
      </circle>
      <g style={{ transformOrigin: '32px 32px', animation: 'spin 14s linear infinite' }}>
        <circle cx="58" cy="32" r="3.5" fill="#ff7a59" />
      </g>
      <g style={{ transformOrigin: '32px 32px', animation: 'spin 8s linear infinite reverse' }}>
        <circle cx="32" cy="17" r="2.8" fill="#ffc857" />
      </g>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </svg>
  );
}

/* ---------- risk radar ---------- */
export function RiskRadar({ risk, size = 300, compare, labels = true }: { risk: Record<RiskKey, number>; size?: number; compare?: Record<RiskKey, number>; labels?: boolean }) {
  const vals = useTweenArray(RISKS.map((r) => risk[r.key]));
  const cmp = compare ? RISKS.map((r) => compare[r.key]) : null;
  const c = size / 2;
  const R = size / 2 - (labels ? 66 : 8);
  const pt = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / RISKS.length - Math.PI / 2;
    return [c + Math.cos(a) * R * (v / 100), c + Math.sin(a) * R * (v / 100)];
  };
  const poly = (arr: number[]) => arr.map((v, i) => pt(i, Math.max(3, v)).join(',')).join(' ');
  const peak = Math.max(...vals);
  const hot = peak > 60 ? '#ff5a6e' : peak > 38 ? '#ffc857' : '#2ee6c5';
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="viz-svg" role="img" aria-label="Risk radar" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`rg-${size}`}>
          <stop offset="0" stopColor={hot} stopOpacity=".05" />
          <stop offset="1" stopColor={hot} stopOpacity=".38" />
        </radialGradient>
      </defs>
      {[20, 40, 60, 80, 100].map((g) => (
        <polygon key={g} points={poly(RISKS.map(() => g))} fill="none" stroke="rgba(130,160,255,.13)" strokeDasharray={g === 60 ? '3 4' : undefined} />
      ))}
      {RISKS.map((r, i) => {
        const [x, y] = pt(i, 100);
        return <line key={r.key} x1={c} y1={c} x2={x} y2={y} stroke="rgba(130,160,255,.1)" />;
      })}
      {cmp && <polygon points={poly(cmp)} fill="none" stroke="rgba(255,255,255,.35)" strokeDasharray="4 4" />}
      <polygon points={poly(vals)} fill={`url(#rg-${size})`} stroke={hot} strokeWidth="2" strokeLinejoin="round" style={{ transition: 'stroke .5s' }} />
      {vals.map((v, i) => {
        const [x, y] = pt(i, Math.max(3, v));
        return <circle key={i} cx={x} cy={y} r={3.5} fill={RISKS[i].color} stroke="#050816" strokeWidth="1.5" />;
      })}
      {labels &&
        RISKS.map((r, i) => {
          const [x, y] = pt(i, 124);
          return (
            <g key={r.key}>
              <text x={x} y={y - 2} textAnchor="middle" fontSize="10.5" fill="#c9d1f2" fontWeight={600}>
                {r.short}
              </text>
              <text x={x} y={y + 11} textAnchor="middle" fontSize="10" fill={vals[i] > 60 ? '#ff8796' : '#7f8bb8'} fontFamily="JetBrains Mono">
                {Math.round(vals[i])}
              </text>
            </g>
          );
        })}
    </svg>
  );
}

/* ---------- arc gauge ---------- */
export function Gauge({ v, label, color, size = 150 }: { v: number; label: string; color: string; size?: number }) {
  const t = useTween(v, 0.1);
  const r = size / 2 - 12;
  const c = size / 2;
  const arc = (p: number) => {
    const a0 = Math.PI * 0.8;
    const a1 = a0 + Math.PI * 1.4 * p;
    const x0 = c + r * Math.cos(a0), y0 = c + r * Math.sin(a0);
    const x1 = c + r * Math.cos(a1), y1 = c + r * Math.sin(a1);
    return `M${x0},${y0} A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1},${y1}`;
  };
  return (
    <svg viewBox={`0 0 ${size} ${size * 0.82}`} className="viz-svg" style={{ maxWidth: size }}>
      <path d={arc(1)} stroke="rgba(255,255,255,.08)" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d={arc(Math.max(0.001, t / 100))} stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      <text x={c} y={c + 4} textAnchor="middle" fontSize={size * 0.22} fontWeight={600} fill="#fff" fontFamily="Space Grotesk">
        {Math.round(t)}
      </text>
      <text x={c} y={c + 24} textAnchor="middle" fontSize="11" fill="#9aa6cf" fontFamily="JetBrains Mono" letterSpacing="1.5">
        {label.toUpperCase()}
      </text>
    </svg>
  );
}

/* ---------- starfield canvas ---------- */
export function Starfield({ density = 0.00018, style }: { density?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext('2d')!;
    let raf = 0;
    let stars: { x: number; y: number; r: number; p: number; s: number }[] = [];
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = cv.offsetWidth * dpr;
      cv.height = cv.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.floor(cv.offsetWidth * cv.offsetHeight * density);
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * cv.offsetWidth,
        y: Math.random() * cv.offsetHeight,
        r: Math.random() * 1.3 + 0.2,
        p: Math.random() * Math.PI * 2,
        s: Math.random() * 0.15 + 0.03,
      }));
    };
    resize();
    window.addEventListener('resize', resize);
    const draw = (t: number) => {
      ctx.clearRect(0, 0, cv.offsetWidth, cv.offsetHeight);
      for (const st of stars) {
        const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t / 900 + st.p));
        st.x -= st.s;
        if (st.x < 0) st.x = cv.offsetWidth;
        ctx.globalAlpha = a * 0.8;
        ctx.fillStyle = st.r > 1.2 ? '#cfe0ff' : '#8fa3d9';
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [density]);
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', ...style }} />;
}

/* ---------- toggle card ---------- */
export function ToggleCard({
  on, mode, title, desc, onClick, badge, meta, countered,
}: {
  on: boolean; mode: 'break' | 'fix'; title: string; desc: string; onClick: () => void; badge?: ReactNode; meta?: ReactNode; countered?: boolean;
}) {
  return (
    <button className={`tcard ${mode} ${on ? 'on' : ''} ${countered ? 'countered' : ''}`} onClick={onClick} aria-pressed={on}>
      <div className="tcard-t">
        {badge}
        {title}
      </div>
      <span className="switch" />
      <div className="tcard-d">{desc}</div>
      {meta && <div className="tcard-meta">{meta}</div>}
    </button>
  );
}

export function Seg<T extends string | number | boolean>({ options, value, onChange }: { options: { v: T; l: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div style={{ display: 'inline-flex', padding: 3, borderRadius: 10, background: 'rgba(255,255,255,.05)', border: '1px solid var(--line)' }}>
      {options.map((o) => (
        <button
          key={String(o.v)}
          onClick={() => onChange(o.v)}
          style={{
            border: 'none', padding: '6px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
            background: value === o.v ? 'rgba(124,247,228,.16)' : 'transparent', color: value === o.v ? '#7cf7e4' : 'var(--muted)',
          }}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}
