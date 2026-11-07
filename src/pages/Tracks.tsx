import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Breadcrumbs } from '../components/Nav';
import { TRACKS, TRACK_KEY, loadTrackProgress as load } from '../data/tracks';
import { setLens } from '../lib/lens';
import { url } from '../lib/util';

export { TRACKS } from '../data/tracks';

export default function Tracks() {
  const [done, setDone] = useState<Record<string, number[]>>(load);
  const [open, setOpen] = useState<string>(TRACKS[0].id);
  useEffect(() => { try { localStorage.setItem(TRACK_KEY, JSON.stringify(done)); } catch { /* ignore */ } }, [done]);
  const toggle = (t: string, i: number) => setDone((d) => { const cur = d[t] ?? []; return { ...d, [t]: cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i] }; });
  const tr = TRACKS.find((t) => t.id === open)!;
  const n = (done[tr.id] ?? []).length;

  return (
    <div className="wrap" style={{ padding: '30px 0 44px' }}>
      <div className="narrow stack">
        <Breadcrumbs trail={[{ label: 'Learn' }, { label: 'Learning tracks' }]} />
        <h1>Learning tracks</h1>
        <p className="lead">Seven routes through the site, one per role. Each step opens the right page, often with a problem already switched on, and ends with a quiz.</p>
      </div>
      <div className="tracks">
        <div className="tabs track-tabs" role="tablist" aria-label="Tracks">
          {TRACKS.map((t) => {
            const k = (done[t.id] ?? []).length;
            return <button key={t.id} role="tab" aria-selected={t.id === open} className={t.id === open ? 'on' : ''} onClick={() => setOpen(t.id)}>{t.title}{k ? ` · ${k}/${t.steps.length}` : ''}</button>;
          })}
        </div>
        <div className="card card-pad" role="tabpanel">
          <div className="track-head">
            <div>
              <h2 style={{ fontSize: 24 }}>{tr.title}</h2>
              <p className="muted">{tr.who}</p>
              <div className="track-goals">
                <span className="label">By the end you will be able to</span>
                <ul>{tr.goals.map((g) => <li key={g}>{g}</li>)}</ul>
              </div>
            </div>
            <span className="tag">About {tr.steps.reduce((a, s) => a + s.min, 0)} minutes</span>
          </div>
          <ol className="stepper">
            <motion.span className="stepper-fill" aria-hidden animate={{ height: `${(n / tr.steps.length) * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
            {tr.steps.map((s, i) => {
              const on = (done[tr.id] ?? []).includes(i);
              return (
                <li key={i} className={on ? 'on' : ''}>
                  <label className="step-check">
                    <input type="checkbox" checked={on} onChange={() => toggle(tr.id, i)} />
                    <span className="sr-only">Mark step {i + 1} as done</span>
                  </label>
                  <div>
                    <a href={url(s.to)} onClick={() => { if (s.lens) setLens(s.lens); }}><b>{i + 1}. {s.t}</b></a>
                    <span className="muted small"> · {s.min} min{s.lens ? ' · view set to this framework' : ''}</span>
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="dim small">Progress is saved in this browser only.</p>
        </div>
      </div>
    </div>
  );
}
