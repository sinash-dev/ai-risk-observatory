import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { RISK_BY_KEY, computeScores, grade, isCountered } from '../data/risks';
import type { LabDef, RiskKey } from '../data/types';
import { recordLab } from '../lib/util';
import { Gauge } from './ui';

export function Reel({ lab, s, m, onClose, onNext }: { lab: LabDef; s: Set<string>; m: Set<string>; onClose: () => void; onNext?: () => void }) {
  // In production the world does not ask: every event and attack happens. Shortcuts only if taken.
  const shipped = useMemo(() => new Set([...s, ...lab.stressors.filter((x) => x.kind !== 'shortcut').map((x) => x.id)]), [lab, s]);
  const scores = computeScores(lab, shipped, m);
  const g = grade(scores.trust, scores.value);
  const items = lab.stressors.filter((x) => shipped.has(x.id)).map((x, i) => ({ st: x, ok: isCountered(lab, x.id, m), month: 1 + Math.floor((i * 6) / Math.max(1, shipped.size)),surprise: !s.has(x.id) }));
  const [phase, setPhase] = useState(0);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1500);
    return () => clearTimeout(t1);
  }, []);
  useEffect(() => {
    if (phase !== 1) return;
    if (shown >= items.length) {
      const t = setTimeout(() => setPhase(2), 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setShown((v) => v + 1), 1100);
    return () => clearTimeout(t);
  }, [phase, shown, items.length]);
  useEffect(() => {
    if (phase === 2) recordLab(lab.id, { trust: scores.trust, value: scores.value, letter: g.letter, at: Date.now() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const live = items.filter((i) => !i.ok);
  const lensHit = (min: number, keys: RiskKey[]) => live.filter((i) => keys.some((k) => (i.st.risk[k] ?? 0) >= min));
  const legal = lensHit(25, ['fairness', 'privacy', 'transparency', 'accountability', 'misuse', 'security']);
  const ethics = lensHit(18, ['fairness', 'safety']);
  const board = [
    { who: 'CFO', name: 'Luca Ferraro', ok: scores.value >= 62 ? 2 : scores.value >= 48 ? 1 : 0, say: scores.value >= 62 ? 'Strong business case — delivered.' : scores.value >= 48 ? 'Acceptable return, slower than promised.' : 'Controls ate the business case.' },
    { who: 'Chief Risk Officer', name: 'Ken Adeyemi', ok: scores.trust >= 70 ? 2 : scores.trust >= 50 ? 1 : 0, say: scores.trust >= 70 ? 'Residual risk within appetite.' : scores.trust >= 50 ? 'Residual risk needs a remediation plan.' : 'Risk appetite breached. Escalating.' },
    { who: 'General Counsel', name: 'Amara Osei', ok: legal.length === 0 ? 2 : lab.euTier === 'High' ? 0 : 1, say: legal.length === 0 ? 'No material legal exposure found.' : lab.euTier === 'High' ? 'Not defensible for a high-risk system under the EU AI Act.' : `Legal exposure: ${RISK_BY_KEY[(Object.entries(legal[0].st.risk).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0][0] as RiskKey)].label.toLowerCase()}.` },
    { who: 'Ethics Lead', name: 'Dr. Lin Zhao', ok: ethics.length === 0 ? 2 : 0, say: ethics.length === 0 ? 'Affected people were considered and protected.' : `People were harmed${ethics[0].st.quote ? ` — ${ethics[0].st.quote.who.split(',')[0]} among them` : ''}.` },
  ];
  const letter = lab.euTier === 'High' && scores.trust < 50;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(3,5,14,.86)', backdropFilter: 'blur(10px)', overflowY: 'auto' }} role="dialog" aria-modal="true">
      <div className="wrap" style={{ padding: '40px 0 60px', maxWidth: 1060 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 }}>
          <div className="eyebrow">{lab.model} · {lab.app}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {phase < 2 && <button className="btn btn-sm" onClick={() => { setShown(items.length); setPhase(2); }}>Skip to verdict</button>}
            <button className="btn btn-sm" onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {phase === 0 && (
            <motion.div key="deploy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ textAlign: 'center', padding: '120px 0' }}>
              <div className="mono" style={{ color: 'var(--accent)', marginBottom: 18 }}>DEPLOYING TO PRODUCTION…</div>
              <div style={{ width: 360, maxWidth: '80%', height: 6, borderRadius: 4, background: 'rgba(255,255,255,.08)', margin: '0 auto', overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.3, ease: 'easeInOut' }} style={{ height: 6, background: 'linear-gradient(90deg,#7cf7e4,#ffc857,#ff7a59)' }} />
              </div>
              <div className="muted" style={{ marginTop: 18, fontSize: 14 }}>In the real world, every event and attack happens — whether you tested for it or not.</div>
            </motion.div>
          )}
        </AnimatePresence>

        {phase >= 1 && (
          <div>
            <motion.h2 initial={{ opacity: 0, letterSpacing: '0.2em' }} animate={{ opacity: 1, letterSpacing: '-0.02em' }} transition={{ duration: 0.9 }} style={{ fontSize: 'clamp(34px,5vw,58px)', marginBottom: 6 }} className="grad-text">
              Six months later…
            </motion.h2>
            <div className="muted" style={{ marginBottom: 26 }}>What happened after {lab.org.split('·')[0].trim()} launched {lab.app.toLowerCase()}.</div>
            <div style={{ position: 'relative', paddingLeft: 30 }}>
              <div style={{ position: 'absolute', left: 9, top: 0, bottom: 0, width: 2, background: 'linear-gradient(#6b8cff,#ff7a59)', opacity: 0.4 }} />
              {items.length === 0 && <div className="muted">No risk events this period.</div>}
              {items.slice(0, shown).map((it, i) => (
                <motion.div key={it.st.id} initial={{ opacity: 0, x: 30, rotate: 0.6 }} animate={{ opacity: 1, x: 0, rotate: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 16 }} style={{ position: 'relative', marginBottom: 16 }}>
                  <span style={{ position: 'absolute', left: -27, top: 18, width: 14, height: 14, borderRadius: '50%', background: it.ok ? '#2ee6c5' : '#ff5a6e', boxShadow: `0 0 14px ${it.ok ? '#2ee6c5' : '#ff5a6e'}` }} />
                  {it.ok ? (
                    <div className="panel" style={{ padding: '14px 18px', borderColor: 'rgba(46,230,197,.4)', display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="mono" style={{ color: '#2ee6c5', fontSize: 11 }}>MONTH {it.month} · AVERTED</span>
                      <span style={{ fontWeight: 600 }}>{it.st.label}</span>
                      <span className="muted" style={{ fontSize: 13 }}>— handled by your controls. The headline “{it.st.headline}” never ran.</span>
                    </div>
                  ) : (
                    <div style={{ background: '#f3efe6', color: '#16120c', borderRadius: 12, padding: '16px 22px', boxShadow: '0 24px 60px -20px rgba(0,0,0,.8)', fontFamily: 'Georgia, "Times New Roman", serif' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #16120c', paddingBottom: 6, marginBottom: 8, fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase' }}>
                        <b>{it.st.outlet}</b>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>Month {it.month}{it.surprise ? ' · not tested' : ''}</span>
                      </div>
                      <div style={{ fontSize: 'clamp(19px,2.4vw,26px)', fontWeight: 700, lineHeight: 1.18 }}>{it.st.headline}</div>
                      {it.st.quote && (
                        <div style={{ marginTop: 10, fontStyle: 'italic', fontSize: 15, color: '#3b3226' }}>
                          “{it.st.quote.text}” <span style={{ fontStyle: 'normal', fontSize: 13 }}>— {it.st.quote.who}</span>
                        </div>
                      )}
                      <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap', fontFamily: 'var(--mono)', fontSize: 10.5 }}>
                        {Object.entries(it.st.risk).map(([k, v]) => (
                          <span key={k} style={{ padding: '2px 8px', borderRadius: 99, background: RISK_BY_KEY[k as RiskKey].color + '33', border: `1px solid ${RISK_BY_KEY[k as RiskKey].color}` }}>
                            {RISK_BY_KEY[k as RiskKey].short} +{v}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {phase === 2 && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ marginTop: 34 }}>
            {letter && (
              <motion.div initial={{ rotate: -2, opacity: 0 }} animate={{ rotate: -1, opacity: 1 }} style={{ background: '#fff', color: '#111', borderRadius: 6, padding: '18px 22px', maxWidth: 560, marginBottom: 26, boxShadow: '0 30px 60px -20px rgba(0,0,0,.9)', fontFamily: 'Georgia, serif', borderTop: '6px solid #003399' }}>
                <div style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#003399', fontFamily: 'var(--mono)' }}>Market Surveillance Authority · Notice</div>
                <div style={{ fontSize: 19, fontWeight: 700, margin: '6px 0' }}>Request for information — high-risk AI system</div>
                <div style={{ fontSize: 14, lineHeight: 1.5 }}>Following complaints, we require your risk-management file (Art. 9), data-governance records (Art. 10) and human-oversight measures (Art. 14) within 15 working days. Fines can reach €15M or 3% of global turnover.</div>
              </motion.div>
            )}
            <div className="panel" style={{ padding: 26 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 28, alignItems: 'center' }} className="verdict-grid">
                <div style={{ textAlign: 'center' }}>
                  <motion.div initial={{ scale: 2.2, opacity: 0, rotate: -18 }} animate={{ scale: 1, opacity: 1, rotate: -8 }} transition={{ type: 'spring', stiffness: 160, damping: 12, delay: 0.2 }} style={{ width: 132, height: 132, borderRadius: '50%', border: `5px solid ${g.color}`, display: 'grid', placeItems: 'center', fontFamily: 'var(--display)', fontSize: 72, fontWeight: 700, color: g.color, boxShadow: `0 0 50px -10px ${g.color}`, margin: '0 auto' }}>
                    {g.letter}
                  </motion.div>
                  <div style={{ marginTop: 12, fontWeight: 600, color: g.color }}>{g.label}</div>
                </div>
                <div>
                  <div className="eyebrow" style={{ marginBottom: 10 }}>Governance Board verdict</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 140px)', gap: 18, marginBottom: 16 }}>
                    <Gauge v={scores.trust} label="Trust" color="#2ee6c5" size={140} />
                    <Gauge v={scores.value} label="Value" color="#ffc857" size={140} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 10 }}>
                    {board.map((b, i) => (
                      <motion.div key={b.who} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.15 }} style={{ padding: '10px 12px', borderRadius: 12, border: `1px solid ${['#ff5a6e', '#ffc857', '#2ee6c5'][b.ok]}55`, background: 'rgba(255,255,255,.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                          <b>{b.who}</b>
                          <span style={{ color: ['#ff5a6e', '#ffc857', '#2ee6c5'][b.ok] }}>{['✗ Against', '~ Conditional', '✓ Approve'][b.ok]}</span>
                        </div>
                        <div className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>“{b.say}”</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={onClose}>⟲ Rewind & improve</button>
                {onNext && <button className="btn" onClick={onNext}>Next lab →</button>}
                <span className="muted" style={{ fontSize: 12.5, alignSelf: 'center' }}>Result saved to your Passport.</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      <style>{'@media (max-width: 700px){.verdict-grid{grid-template-columns:1fr !important}}'}</style>
    </motion.div>
  );
}
