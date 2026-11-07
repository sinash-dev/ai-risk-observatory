/** Large radio and checkbox cards used by the classification wizard and the AI register. */
import type { Opt } from '../lib/classifyOptions';

export function Radio<T extends string>({ name, opts, value, set }: { name: string; opts: Opt<T>[]; value: T | undefined; set: (v: T) => void }) {
  return (
    <div className="opts">
      {opts.map((o) => (
        <label key={o.v} className={`opt ${value === o.v ? 'on' : ''}`}>
          <input type="radio" name={name} checked={value === o.v} onChange={() => set(o.v)} />
          <span><b>{o.l}</b>{o.d && <span className="muted small"> · {o.d}</span>}</span>
        </label>
      ))}
    </div>
  );
}
export function Multi<T extends string>({ opts, value, set, none }: { opts: Opt<T>[]; value: T[]; set: (v: T[]) => void; none?: string }) {
  return (
    <div className="opts">
      {opts.map((o) => (
        <label key={o.v} className={`opt ${value.includes(o.v) ? 'on' : ''}`}>
          <input type="checkbox" checked={value.includes(o.v)} onChange={() => set(value.includes(o.v) ? value.filter((x) => x !== o.v) : [...value, o.v])} />
          <span><b>{o.l}</b></span>
        </label>
      ))}
      {none && (
        <label className={`opt ${value.length === 0 ? 'on' : ''}`}>
          <input type="checkbox" checked={value.length === 0} onChange={() => set([])} />
          <span><b>{none}</b></span>
        </label>
      )}
    </div>
  );
}

