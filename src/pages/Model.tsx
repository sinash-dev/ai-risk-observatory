import { motion } from 'framer-motion';
import { useState } from 'react';
import { Toggle } from '../components/ui';
import { FRAMEWORKS, FW_BY_ID, fwName, type FwId } from '../data/frameworks';
import { LABS, LAB_BY_ID, fwEntry } from '../data/labs';
import { KIND_LABEL, RISKS, TIER_BY_ID, computeScores, isCountered, level } from '../data/risks';
import type { LabDef } from '../data/types';
import { setLens, useLens } from '../lib/lens';
import { SHORT_NAME } from './Home';

function FrameworkBlock({ lab, fw, m }: { lab: LabDef; fw: FwId; m: Set<string> }) {
  const f = FW_BY_ID[fw];
  const e = fwEntry(fw, lab.id);
  const cat = f.cats.find((c) => c.id === e.cat)!;
  const sgName = (id: string) => lab.mitigations.find((x) => x.id === id)?.label ?? id;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
        <span className="tag"><span className="swatch" style={{ background: cat.color }} />{cat.label}</span>
        <span className="muted small">{e.status}</span>
      </div>
      <p style={{ marginBottom: 16 }}>{e.summary}</p>
      <div className="label" style={{ marginBottom: 4 }}>What it asks of you</div>
      <div>
        {e.reqs.map(([text, ref, sgs], i) => (
          <div key={i} className="req">
            <span>{text}</span>
            <span className="req-ref">{ref}</span>
            {sgs && sgs.length > 0 && (
              <span className="req-sg">
                In the simulation: {sgs.map((id, k) => (
                  <span key={id}>{k ? ', ' : ''}<b>{sgName(id)}</b>{m.has(id) ? ' (on ✓)' : ''}</span>
                ))}
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="small" style={{ marginTop: 14 }}><a href={`#/rules/${fw}`}>Read the full guide to {fwName(fw)} →</a></p>
    </div>
  );
}

export function ModelPage({ id }: { id: string }) {
  const lab = LAB_BY_ID[id];
  const lens = useLens();
  const [s, setS] = useState<Set<string>>(new Set());
  const [m, setM] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<FwId>('eu');
  if (!lab) return <div className="wrap section"><h1>Not found</h1><p><a href="#/">Back to all models</a></p></div>;
  const tier = TIER_BY_ID[lab.tier];
  const idx = LABS.indexOf(lab);
  const prev = LABS[idx - 1], next = LABS[idx + 1];
  const flip = (setter: typeof setS, k: string) => setter((p) => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const Viz = lab.Viz;
  const live = (sid: string) => s.has(sid) && !isCountered(lab, sid, m);
  const scores = computeScores(lab, s, m).risk;
  const base = computeScores(lab, new Set(), new Set()).risk;
  const affected = RISKS.filter((r) => scores[r.key] - base[r.key] > 3 || s.size === 0).sort((a, b) => scores[b.key] - scores[a.key]).slice(0, 4);
  const active = lab.stressors.filter((x) => s.has(x.id));
  const shownFw: FwId[] = lens === 'all' ? FRAMEWORKS.map((f) => f.id) : [lens];
  const curTab = lens === 'all' ? tab : lens;
  const lensReqsFor = (sgId: string) => (lens === 'all' ? [] : fwEntry(lens, lab.id).reqs.filter((r) => r[2]?.includes(sgId)).map((r) => r[1]));

  return (
    <div>
      <section className="wrap" style={{ padding: '30px 0 8px' }}>
        <div className="crumbs"><a href="#/">All models</a> / {tier.label}</div>
        <h1 style={{ marginTop: 10 }}>{lab.model}</h1>
        <p className="lead" style={{ marginTop: 6 }}>Example: {lab.app.charAt(0).toLowerCase() + lab.app.slice(1)}</p>
      </section>

      <section className="wrap" style={{ padding: '18px 0 8px' }}>
        <div className="grid2">
          <div className="stack">
            <div>
              <div className="label">How it works</div>
              <p style={{ marginTop: 6 }}>{lab.primer}</p>
            </div>
            <div>
              <div className="label">The situation</div>
              <p style={{ marginTop: 6 }}>{lab.brief.text}</p>
            </div>
            <div>
              <div className="label">Who is affected</div>
              <p style={{ marginTop: 6 }}>{lab.stakeholders.join(', ')}.</p>
            </div>
          </div>
          <div className="card card-pad">
            <div className="label" style={{ marginBottom: 10 }}>{lens === 'all' ? 'How each framework classifies this use' : `Under ${fwName(lens)}`}</div>
            {shownFw.map((fw) => {
              const e = fwEntry(fw, lab.id);
              const cat = FW_BY_ID[fw].cats.find((c) => c.id === e.cat)!;
              return (
                <button key={fw} onClick={() => { setTab(fw); document.getElementById('rules')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ display: 'grid', gridTemplateColumns: '120px minmax(0,1fr)', gap: 12, width: '100%', textAlign: 'left', padding: '9px 0', border: 'none', borderTop: '1px solid var(--line)', background: 'none', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{FW_BY_ID[fw].short}</span>
                  <span className="small" style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}><span className="swatch" style={{ background: cat.color, transform: 'translateY(1px)' }} />{e.status}</span>
                </button>
              );
            })}
            {lens !== 'all' && <p className="small" style={{ marginTop: 12 }}>{fwEntry(lens, lab.id).summary}</p>}
          </div>
        </div>
      </section>

      <section className="wrap section">
        <h2>Try it: what can go wrong</h2>
        <p className="muted" style={{ marginTop: 8, maxWidth: 820 }}>
          The dark panel is a small working simulation of this system. <b>Step 1:</b> switch on a problem from the list on the right and watch the results change. <b>Step 2:</b> switch on a safeguard and see whether it fixes the problem. You can combine as many as you like; nothing is saved.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.65fr) minmax(280px, 1fr)', gap: 22, marginTop: 22, alignItems: 'start' }} className="try-grid">
          <div className="figure sticky-fig"><Viz s={s} m={m} live={live} /></div>
          <div className="stack">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3>1. Problems</h3>
                {(s.size > 0 || m.size > 0) && <button className="btn" style={{ padding: '4px 10px', fontSize: 13 }} onClick={() => { setS(new Set()); setM(new Set()); }}>Reset</button>}
              </div>
              <div className="stack" style={{ marginTop: 10 }}>
                {lab.stressors.map((st) => {
                  const on = s.has(st.id);
                  const fixers = lab.mitigations.filter((x) => x.counters.includes(st.id));
                  const handled = on && isCountered(lab, st.id, m);
                  return (
                    <Toggle key={st.id} kind="problem" on={on} title={st.label} desc={st.desc} onClick={() => flip(setS, st.id)}
                      note={!on ? <span className="dim">{KIND_LABEL[st.kind]}</span> : handled ? <span style={{ color: 'var(--good)' }}>Handled by a safeguard</span> : <span style={{ color: 'var(--bad)' }}>Not handled. Try: {fixers.map((f) => f.label).join(' or ')}</span>} />
                  );
                })}
              </div>
            </div>
            <div>
              <h3>2. Safeguards</h3>
              <div className="stack" style={{ marginTop: 10 }}>
                {lab.mitigations.map((mit) => {
                  const refs = lensReqsFor(mit.id);
                  return (
                    <Toggle key={mit.id} kind="fix" on={m.has(mit.id)} title={mit.label} desc={mit.desc} onClick={() => flip(setM, mit.id)}
                      note={<span className="dim">Fixes: {mit.counters.map((c) => lab.stressors.find((x) => x.id === c)?.label).join('; ')}{refs.length ? ` · ${FW_BY_ID[lens as FwId].short}: ${refs.join(', ')}` : ''}</span>} />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="card card-pad" style={{ marginTop: 22 }}>
          <div className="grid2" style={{ alignItems: 'start' }}>
            <div>
              <h3>What this means</h3>
              {active.length === 0 ? (
                <p className="muted" style={{ marginTop: 8 }}>No problems switched on yet. The system is running as designed. Switch on a problem to see its effect.</p>
              ) : (
                <ul style={{ margin: '10px 0 0', paddingLeft: 18 }}>
                  {active.map((st) => (
                    <li key={st.id} style={{ marginBottom: 10 }}>
                      <b>{st.label}</b>: {live(st.id) ? <span style={{ color: 'var(--bad)' }}>not handled.</span> : <span style={{ color: 'var(--good)' }}>handled.</span>}
                      {live(st.id) && <div className="muted small" style={{ marginTop: 2 }}>What this looks like in practice: “{st.headline}”</div>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3>Risk level</h3>
              <div style={{ marginTop: 10, display: 'grid', gap: 9 }}>
                {affected.map((r) => {
                  const v = scores[r.key];
                  const lv = level(v);
                  return (
                    <div key={r.key} style={{ display: 'grid', gridTemplateColumns: '170px minmax(0,1fr) 64px', gap: 10, alignItems: 'center', fontSize: 14 }}>
                      <span title={r.desc}>{r.label}</span>
                      <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,.08)' }}>
                        <motion.div animate={{ width: `${Math.max(4, v)}%`, backgroundColor: lv.color }} style={{ height: 8, borderRadius: 4 }} />
                      </div>
                      <span style={{ color: lv.color, fontWeight: 600, fontSize: 13 }}>{lv.label}</span>
                    </div>
                  );
                })}
              </div>
              <p className="dim small" style={{ marginTop: 10 }}>An indicative score for teaching, not a formal assessment.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap section" id="rules">
        <h2>How the rules apply</h2>
        {lens === 'all' ? (
          <>
            <p className="muted" style={{ marginTop: 8, maxWidth: 820 }}>Each framework looks at this system differently. Pick one to see how it classifies the use, what it requires, and which safeguards in the simulation meet those requirements.</p>
            <div className="tabs" style={{ marginTop: 18 }}>
              {FRAMEWORKS.map((f) => <button key={f.id} className={curTab === f.id ? 'on' : ''} onClick={() => setTab(f.id)}>{f.short}</button>)}
            </div>
          </>
        ) : (
          <p className="muted" style={{ marginTop: 8 }}>Showing {fwName(lens)} only. <a href="#" onClick={(ev) => { ev.preventDefault(); setLens('all'); }}>Show all frameworks</a></p>
        )}
        <div className="card card-pad" style={{ marginTop: lens === 'all' ? 0 : 18, borderTopLeftRadius: lens === 'all' ? 0 : 10, borderTopRightRadius: lens === 'all' ? 0 : 10 }}>
          <FrameworkBlock key={curTab} lab={lab} fw={curTab} m={m} />
        </div>
      </section>

      <section className="wrap section">
        <div className="grid2">
          <div>
            <h2>Real cases</h2>
            <div className="stack" style={{ marginTop: 14 }}>
              {lab.incidents.map((inc) => (
                <div key={inc.title}>
                  <div style={{ fontWeight: 600 }}>{inc.title} <span className="dim">({inc.year})</span></div>
                  <p className="muted" style={{ marginTop: 2 }}>{inc.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2>In short</h2>
            <p style={{ marginTop: 14, fontFamily: 'var(--serif)', fontSize: 20, lineHeight: 1.5, fontWeight: 500 }}>{lab.lesson}</p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 40, flexWrap: 'wrap' }}>
          {prev ? <a className="btn" href={`#/model/${prev.id}`}>← {SHORT_NAME[prev.id]}</a> : <span />}
          {next && <a className="btn" href={`#/model/${next.id}`}>{SHORT_NAME[next.id]} →</a>}
        </div>
      </section>
      <style>{'@media (min-width: 1001px){.sticky-fig{position:sticky;top:80px}} @media (max-width: 1000px){.try-grid{grid-template-columns:minmax(0,1fr) !important}}'}</style>
    </div>
  );
}
