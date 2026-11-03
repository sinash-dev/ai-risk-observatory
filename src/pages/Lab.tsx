import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Reel } from '../components/Reel';
import { Gauge, RiskRadar, ToggleCard } from '../components/ui';
import { LABS, LAB_BY_ID } from '../data/labs';
import { RISKS, RISK_BY_KEY, STAGES, TIER_BY_ID, computeScores, isCountered } from '../data/risks';
import type { RiskKey } from '../data/types';
import { go, useProgress } from '../lib/util';

const EU_COL: Record<string, string> = { High: '#ff5a6e', Limited: '#ffc857', Minimal: '#2ee6c5', Context: '#b892ff' };

export function LabPage({ id }: { id: string }) {
  const lab = LAB_BY_ID[id];
  const [s, setS] = useState<Set<string>>(new Set());
  const [m, setM] = useState<Set<string>>(new Set());
  const [ship, setShip] = useState(false);
  const [checks, setChecks] = useState<Set<number>>(new Set());
  const progress = useProgress();
  if (!lab) {
    return (
      <div className="wrap section">
        <h2 className="h2">Lab not found</h2>
        <button className="btn" style={{ marginTop: 20 }} onClick={() => go('/observatory')}>Back to the Observatory</button>
      </div>
    );
  }
  const tier = TIER_BY_ID[lab.tier];
  const idx = LABS.indexOf(lab);
  const prev = LABS[idx - 1], next = LABS[idx + 1];
  const scores = computeScores(lab, s, m);
  const base = computeScores(lab, new Set(), new Set());
  const toggle = (_: Set<string>, setter: (f: (v: Set<string>) => Set<string>) => void, k: string) =>
    setter((prev) => {
      const n = new Set(prev);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });
  const live = (sid: string) => s.has(sid) && !isCountered(lab, sid, m);
  const Viz = lab.Viz;
  const done = progress.labs[lab.id];
  const refs = Array.from(new Set(lab.mitigations.flatMap((x) => x.refs)));
  const untested = lab.stressors.filter((x) => x.kind !== 'shortcut' && !isCountered(lab, x.id, m)).length;

  return (
    <div>
      {/* ---------- header ---------- */}
      <section style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--line)' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(700px 300px at 15% 0%, ${tier.glow}, transparent 70%)`, opacity: 0.55 }} />
        <div className="wrap" style={{ position: 'relative', padding: '30px 0 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
            <div className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>
              <a href="#/observatory" style={{ color: 'var(--muted)' }}>Observatory</a> <span className="dim">/</span> <span style={{ color: tier.color }}>{tier.label}</span> <span className="dim">/</span> {lab.model}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {prev && <button className="btn btn-sm" onClick={() => go(`/lab/${prev.id}`)}>← {prev.short}</button>}
              {next && <button className="btn btn-sm" onClick={() => go(`/lab/${next.id}`)}>{next.short} →</button>}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)', gap: 30, alignItems: 'start' }} className="lab-head">
            <div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                <span className="chip" style={{ color: tier.color, borderColor: tier.color + '66' }}>
                  <i className="dot" style={{ background: tier.color }} /> Tier {tier.ring} · {tier.label}
                </span>
                <span className="chip" style={{ color: EU_COL[lab.euTier], borderColor: EU_COL[lab.euTier] + '66' }} title={lab.euNote}>
                  EU AI Act · {lab.euTier === 'Context' ? 'Context-dependent' : `${lab.euTier} risk`}
                </span>
                {done && <span className="chip" style={{ color: '#2ee6c5' }}>✓ Passport: grade {done.letter}</span>}
              </div>
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: 'clamp(32px,4.6vw,54px)', fontWeight: 600 }}>
                {lab.model}
              </motion.h1>
              <div style={{ fontSize: 20, color: 'var(--muted)', marginTop: 6 }}>
                applied to <span style={{ color: '#fff' }}>{lab.app}</span> <span className="dim">· {lab.org}</span>
              </div>
              <p className="muted" style={{ marginTop: 16, maxWidth: 640, fontSize: 14.5 }}>
                <b style={{ color: '#c9d1f2' }}>How it works — </b>
                {lab.primer}
              </p>
              <p className="dim" style={{ marginTop: 10, maxWidth: 640, fontSize: 12.5 }}>{lab.euNote}</p>
            </div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="panel" style={{ padding: 20, background: 'rgba(14,22,52,.8)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${tier.color}, #6b8cff)`, display: 'grid', placeItems: 'center', fontWeight: 700, color: '#050816' }}>
                  {lab.brief.from.split(' ').map((w) => w[0]).slice(-2).join('')}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{lab.brief.from}</div>
                  <div className="mono dim" style={{ fontSize: 11 }}>{lab.brief.role} · MISSION BRIEF</div>
                </div>
                <span className="chip" style={{ marginLeft: 'auto', color: '#ffc857' }}>KPI · {lab.brief.kpi}</span>
              </div>
              <p style={{ marginTop: 14, fontSize: 15.5, lineHeight: 1.55 }}>“{lab.brief.text}”</p>
              <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <span className="mono dim" style={{ fontSize: 10.5 }}>AFFECTED:</span>
                {lab.stakeholders.map((x) => <span key={x} className="chip" style={{ fontSize: 10.5 }}>{x}</span>)}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ---------- stage ---------- */}
      <section className="wrap" style={{ padding: '26px 0' }}>
        <div className="lab-grid">
          <div className="panel stage">
            <div className="panel-h">
              <div className="panel-t"><span className="dot" style={{ background: tier.color, boxShadow: `0 0 10px ${tier.color}` }} /> Live model</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className="chip">{s.size} risks on</span>
                <span className="chip">{m.size} controls on</span>
                {(s.size > 0 || m.size > 0) && <button className="btn btn-sm" onClick={() => { setS(new Set()); setM(new Set()); }}>Reset</button>}
              </div>
            </div>
            <div className="panel-b">
              <Viz s={s} m={m} live={live} />
            </div>
          </div>
          <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
            <div className="panel">
              <div className="panel-h">
                <div className="panel-t">Risk radar</div>
                <span className="mono dim" style={{ fontSize: 10.5 }}>dashed = baseline</span>
              </div>
              <div className="panel-b" style={{ paddingTop: 4 }}>
                <RiskRadar risk={scores.risk} compare={base.risk} size={320} />
              </div>
            </div>
            <div className="panel">
              <div className="panel-b" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <Gauge v={scores.trust} label="Trust" color="#2ee6c5" size={150} />
                <Gauge v={scores.value} label="Value" color="#ffc857" size={150} />
              </div>
              <div style={{ padding: '0 20px 20px' }}>
                <button className="btn btn-ship" style={{ width: '100%' }} onClick={() => setShip(true)}>🚀 Ship to production</button>
                <div className="dim" style={{ fontSize: 12, marginTop: 10, lineHeight: 1.45 }}>
                  On launch, all <b style={{ color: '#8fdcf7' }}>events</b> and <b style={{ color: '#ff9aa6' }}>attacks</b> happen. Shortcuts happen only if you took them.
                  {untested > 0 && <span style={{ color: '#ffc857' }}> {untested} real-world risk{untested > 1 ? 's are' : ' is'} not yet controlled.</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- break / fix ---------- */}
        <div className="lab-cols" style={{ marginTop: 18 }}>
          <div className="panel">
            <div className="panel-h">
              <div className="panel-t"><span style={{ color: '#ff5a6e' }}>⚡</span> Break it <span className="dim" style={{ fontWeight: 400, fontSize: 13 }}>— shortcuts, events & attacks</span></div>
            </div>
            <div className="panel-b" style={{ display: 'grid', gap: 10 }}>
              {lab.stressors.map((st) => {
                const on = s.has(st.id);
                const ctr = on && isCountered(lab, st.id, m);
                const top = (Object.entries(st.risk) as [RiskKey, number][]).sort((a, b) => b[1] - a[1]).slice(0, 3);
                return (
                  <ToggleCard
                    key={st.id}
                    on={on}
                    mode="break"
                    countered={ctr}
                    title={st.label}
                    desc={st.desc}
                    badge={<span className={`kind ${st.kind}`}>{st.kind}</span>}
                    onClick={() => toggle(s, setS, st.id)}
                    meta={
                      <>
                        {top.map(([k, v]) => (
                          <span key={k} className="chip" style={{ color: RISK_BY_KEY[k].color, borderColor: RISK_BY_KEY[k].color + '55', fontSize: 10.5, textDecoration: ctr ? 'line-through' : 'none' }}>
                            {RISK_BY_KEY[k].short} +{v}
                          </span>
                        ))}
                        {st.value ? <span className="chip" style={{ color: '#ffc857', fontSize: 10.5 }}>Value +{st.value}</span> : null}
                        {ctr && <span className="chip" style={{ color: '#2ee6c5', borderColor: '#2ee6c566', fontSize: 10.5 }}>✓ contained</span>}
                      </>
                    }
                  />
                );
              })}
            </div>
          </div>
          <div className="panel">
            <div className="panel-h">
              <div className="panel-t"><span style={{ color: '#2ee6c5' }}>🛡</span> Fix it <span className="dim" style={{ fontWeight: 400, fontSize: 13 }}>— governance controls</span></div>
            </div>
            <div className="panel-b" style={{ display: 'grid', gap: 10 }}>
              {lab.mitigations.map((mit) => {
                const on = m.has(mit.id);
                return (
                  <ToggleCard
                    key={mit.id}
                    on={on}
                    mode="fix"
                    title={mit.label}
                    desc={mit.desc}
                    badge={<span className="kind" style={{ background: 'rgba(124,247,228,.12)', color: '#9cfbee' }}>{STAGES.find((x) => x.id === mit.stage)?.label}</span>}
                    onClick={() => toggle(m, setM, mit.id)}
                    meta={
                      <>
                        {mit.counters.map((c) => {
                          const st = lab.stressors.find((x) => x.id === c);
                          const act = s.has(c);
                          return (
                            <span key={c} className="chip" style={{ fontSize: 10.5, color: act ? '#fff' : undefined, borderColor: act ? '#ff5a6e88' : undefined, background: act ? 'rgba(255,90,110,.12)' : undefined }}>
                              counters: {st?.label.split(/[(:—]/)[0].trim().slice(0, 34)}
                            </span>
                          );
                        })}
                        <span className="chip" style={{ color: '#ffc857', fontSize: 10.5 }}>Value −{mit.cost}</span>
                      </>
                    }
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* ---------- debrief ---------- */}
        <div style={{ marginTop: 40 }}>
          <div className="eyebrow">Debrief</div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ margin: '14px 0 22px', padding: '22px 26px', borderRadius: 18, background: `linear-gradient(110deg, ${tier.glow}, rgba(107,140,255,.12))`, border: '1px solid var(--line2)' }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>KEY LESSON</div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 'clamp(20px,2.4vw,28px)', fontWeight: 600, lineHeight: 1.25 }}>{lab.lesson}</div>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
            <div className="panel">
              <div className="panel-h"><div className="panel-t">It happened for real</div></div>
              <div className="panel-b" style={{ display: 'grid', gap: 14 }}>
                {lab.incidents.map((inc) => (
                  <div key={inc.title} style={{ display: 'grid', gridTemplateColumns: '54px 1fr', gap: 12 }}>
                    <div className="mono" style={{ color: tier.color, fontSize: 13, fontWeight: 600 }}>{inc.year}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{inc.title}</div>
                      <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{inc.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel">
              <div className="panel-h"><div className="panel-t">Governance checklist</div><span className="mono dim" style={{ fontSize: 11 }}>{checks.size}/{lab.checklist.length}</span></div>
              <div className="panel-b" style={{ display: 'grid', gap: 8 }}>
                {lab.checklist.map((c, i) => (
                  <label key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13.5, cursor: 'pointer' }}>
                    <input type="checkbox" checked={checks.has(i)} onChange={() => { const n = new Set(checks); n.has(i) ? n.delete(i) : n.add(i); setChecks(n); }} style={{ marginTop: 3, accentColor: '#2ee6c5' }} />
                    <span style={{ color: checks.has(i) ? 'var(--muted)' : 'var(--text)', textDecoration: checks.has(i) ? 'line-through' : 'none' }}>{c}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="panel">
              <div className="panel-h"><div className="panel-t">Framework mapping</div></div>
              <div className="panel-b" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {refs.map((r) => <span key={r} className="chip" style={{ fontSize: 11 }}>{r}</span>)}
              </div>
              <div style={{ padding: '0 20px 20px' }}>
                <button className="btn btn-sm" onClick={() => window.print()}>⎙ Print Model Risk Card</button>
              </div>
            </div>
          </div>
          {next && (
            <motion.button whileHover={{ scale: 1.01 }} onClick={() => go(`/lab/${next.id}`)} className="panel" style={{ width: '100%', marginTop: 22, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', cursor: 'pointer' }}>
              <div>
                <div className="mono dim" style={{ fontSize: 11 }}>NEXT LAB · {TIER_BY_ID[next.tier].label.toUpperCase()}</div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 600, marginTop: 4 }}>{next.model} <span className="muted" style={{ fontWeight: 400 }}>· {next.app}</span></div>
              </div>
              <span style={{ fontSize: 26 }}>→</span>
            </motion.button>
          )}
        </div>
      </section>

      {/* ---------- print-only risk card ---------- */}
      <div className="print-only" style={{ padding: 30, fontFamily: 'Inter, sans-serif', color: '#000' }}>
        <h1 style={{ fontSize: 26 }}>Model Risk Card — {lab.model} · {lab.app}</h1>
        <p>{lab.org} · EU AI Act: {lab.euTier} — {lab.euNote}</p>
        <h3>Risk profile (current configuration)</h3>
        <ul>{RISKS.map((r) => <li key={r.key}>{r.label}: {Math.round(scores.risk[r.key])}/100</li>)}</ul>
        <h3>Risks considered</h3>
        <ul>{lab.stressors.map((x) => <li key={x.id}>{x.label} — {isCountered(lab, x.id, m) ? 'controlled' : s.has(x.id) ? 'ACTIVE, uncontrolled' : 'not tested'}</li>)}</ul>
        <h3>Controls in place</h3>
        <ul>{lab.mitigations.filter((x) => m.has(x.id)).map((x) => <li key={x.id}>{x.label} ({x.refs.join('; ')})</li>)}</ul>
        <p>Trust {scores.trust} · Value {scores.value}</p>
      </div>

      <AnimatePresence>
        {ship && <Reel lab={lab} s={s} m={m} onClose={() => setShip(false)} onNext={next ? () => { setShip(false); go(`/lab/${next.id}`); } : undefined} />}
      </AnimatePresence>
      <style>{'@media (max-width: 900px){.lab-head{grid-template-columns:minmax(0,1fr) !important}}'}</style>
    </div>
  );
}
