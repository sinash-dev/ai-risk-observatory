import { motion } from 'framer-motion';
import { Gauge } from '../components/ui';
import { LABS } from '../data/labs';
import { TIERS, TIER_BY_ID } from '../data/risks';
import { go, loadProgress, saveProgress, useProgress } from '../lib/util';

export function Passport() {
  const p = useProgress();
  const done = LABS.filter((l) => p.labs[l.id]);
  const avg = (k: 'trust' | 'value') => (done.length ? done.reduce((a, l) => a + p.labs[l.id][k], 0) / done.length : 0);
  const setName = (name: string) => { const q = loadProgress(); q.name = name; saveProgress(q); };
  const reset = () => { if (confirm('Clear all your Passport results on this device?')) saveProgress({ labs: {}, name: p.name }); };
  return (
    <div className="wrap" style={{ padding: '40px 0' }}>
      <div className="no-print">
        <div className="eyebrow">AI Governance Passport</div>
        <h1 className="h2" style={{ marginTop: 10 }}>Your launches, stamped.</h1>
        <p className="lead" style={{ marginTop: 10 }}>Ship a model from any lab to earn its stamp. Your best grade per lab is kept on this device.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: 18, marginTop: 30 }} className="pp-grid">
          <div className="panel" style={{ padding: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 16 }}>
              {LABS.map((l, i) => {
                const r = p.labs[l.id];
                const t = TIER_BY_ID[l.tier];
                return (
                  <motion.button key={l.id} onClick={() => go(`/lab/${l.id}`)} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} whileHover={{ scale: 1.05 }} style={{ background: 'none', border: 'none', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ width: 104, height: 104, margin: '0 auto', borderRadius: '50%', border: `3px ${r ? 'solid' : 'dashed'} ${r ? t.color : 'rgba(130,160,255,.25)'}`, display: 'grid', placeItems: 'center', transform: r ? `rotate(${(i % 5) * 4 - 8}deg)` : undefined, boxShadow: r ? `0 0 30px -10px ${t.color}, inset 0 0 0 6px rgba(255,255,255,.02)` : 'none', position: 'relative' }}>
                      {r ? (
                        <div>
                          <div style={{ fontFamily: 'var(--display)', fontSize: 38, fontWeight: 700, color: t.color, lineHeight: 1 }}>{r.letter}</div>
                          <div className="mono" style={{ fontSize: 9, color: t.color }}>{l.glyph} · T{r.trust}</div>
                        </div>
                      ) : (
                        <span className="mono dim" style={{ fontSize: 14 }}>{l.glyph}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, marginTop: 8 }}>{l.model.replace(/ \(.*\)/, '')}</div>
                    <div className="dim" style={{ fontSize: 11 }}>{l.app}</div>
                  </motion.button>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
            <div className="panel" style={{ padding: 20 }}>
              <div className="mono dim" style={{ fontSize: 11 }}>PROGRESS</div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 40, fontWeight: 600 }}>{done.length}<span className="dim" style={{ fontSize: 22 }}> / {LABS.length}</span></div>
              <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,.08)', overflow: 'hidden', marginTop: 6 }}>
                <motion.div animate={{ width: `${(done.length / LABS.length) * 100}%` }} style={{ height: 8, background: 'linear-gradient(90deg,#2ee6c5,#6b8cff,#ff7a59)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 14 }}>
                <Gauge v={avg('trust')} label="avg trust" color="#2ee6c5" size={140} />
                <Gauge v={avg('value')} label="avg value" color="#ffc857" size={140} />
              </div>
              <div style={{ display: 'grid', gap: 6, marginTop: 10 }}>
                {TIERS.map((t) => {
                  const ls = LABS.filter((l) => l.tier === t.id);
                  const n = ls.filter((l) => p.labs[l.id]).length;
                  return (
                    <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 34px', gap: 8, alignItems: 'center', fontSize: 12 }}>
                      <span style={{ color: t.color }}>{t.label}</span>
                      <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,.06)' }}><div style={{ width: `${(n / ls.length) * 100}%`, height: 6, borderRadius: 3, background: t.color }} /></div>
                      <span className="mono dim">{n}/{ls.length}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="panel" style={{ padding: 20 }}>
              <div className="mono dim" style={{ fontSize: 11, marginBottom: 8 }}>CERTIFICATE</div>
              <input defaultValue={p.name ?? ''} onBlur={(e) => setName(e.target.value)} placeholder="Your name for the certificate" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line2)', background: 'rgba(255,255,255,.04)', color: 'var(--text)', font: 'inherit' }} />
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button className="btn btn-primary btn-sm" onClick={() => window.print()} disabled={!done.length}>⎙ Print certificate</button>
                <button className="btn btn-sm" onClick={reset}>Reset</button>
              </div>
              {!done.length && <div className="dim" style={{ fontSize: 12, marginTop: 8 }}>Complete at least one lab to unlock.</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="print-only" style={{ border: '6px double #1d2747', padding: 50, textAlign: 'center', fontFamily: 'Georgia, serif', color: '#111' }}>
        <div style={{ letterSpacing: '.3em', fontSize: 12 }}>AI RISK OBSERVATORY</div>
        <h1 style={{ fontSize: 40, margin: '20px 0 10px' }}>Certificate of Completion</h1>
        <p>This certifies that</p>
        <h2 style={{ fontSize: 30, margin: '10px 0' }}>{p.name || '________________'}</h2>
        <p>completed {done.length} of {LABS.length} AI governance labs — from classical machine learning to agentic AI —<br />with an average Trust score of {Math.round(avg('trust'))} and Value score of {Math.round(avg('value'))}.</p>
        <p style={{ marginTop: 30, fontSize: 12 }}>{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <style>{'@media (max-width: 900px){.pp-grid{grid-template-columns:1fr !important}}'}</style>
    </div>
  );
}
