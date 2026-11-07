import { alpha } from '../data/palette';
import { AnimatePresence, motion } from 'framer-motion';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Checklist, Newsroom, RiskRadar, TradeOff, letterFor, tradeOff } from '../components/model/Panels';
import { Breadcrumbs, Toc } from '../components/Nav';
import { copyText, toast } from '../components/Toast';
import { Toggle } from '../components/ui';
import { FRAMEWORKS, FW_BY_ID, fwName, type FwId } from '../data/frameworks';
import { fwColor } from '../data/fwKind';
import { FW_DATA, LABS, LAB_BY_ID, fwEntry } from '../data/labs';
import { KIND_LABEL, RISKS, STAGES, TIER_BY_ID, computeScores, isCountered, level } from '../data/risks';
import { SHORT_NAME } from '../data/shortNames';
import type { LabDef, Mitigation, RiskKey, Stressor } from '../data/types';
import { VIZ } from '../labs/viz';
import { setLens, useLens } from '../lib/lens';
import { recordLab, url, useProgress } from '../lib/util';

const STAGE_LABEL = Object.fromEntries(STAGES.map((s) => [s.id, s.label])) as Record<string, string>;
const isCode = (r: string) => /OWASP|LLM\d|ASI\d|\bML\d|NIST AI RMF (GOVERN|MAP|MEASURE|MANAGE)/.test(r);

/** Every place a safeguard is grounded: its own refs plus each framework requirement that names it. */
function basedOn(lab: LabDef, mit: Mitigation) {
  const out = [...mit.refs];
  for (const f of FRAMEWORKS) {
    for (const [, ref, sgs] of FW_DATA[f.id][lab.id].reqs) {
      if (ref && sgs?.includes(mit.id)) out.push(`${f.short} ${ref}`);
    }
  }
  return Array.from(new Set(out));
}

function KindIcon({ kind }: { kind: Stressor['kind'] }) {
  const d = { shortcut: 'M4 12h10M10 6l6 6-6 6', event: 'M12 3v10M12 17v.5M4 20h16L12 3z', attack: 'M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z' }[kind];
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>;
}
function PersonIcon({ org }: { org: boolean }) {
  return org
    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M4 21V5l8-3 8 3v16M9 21v-5h6v5M8 9h.01M12 9h.01M16 9h.01M8 13h.01M16 13h.01" /></svg>
    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>;
}
const looksLikeOrg = (s: string) => /authorit|team|department|regulator|office|council|compan|provider|board|bank|store|developer|holders|staff representatives|works council|publishers/i.test(s);

function Cost({ n }: { n: number }) {
  return <span className="cost" aria-label={`Effort ${n} of 5`} title={`Effort ${n} of 5`}>{[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= n ? 'on' : ''} />)}</span>;
}

function SafeguardNote({ lab, mit, lensFw }: { lab: LabDef; mit: Mitigation; lensFw: FwId | null }) {
  const fixes = mit.counters.map((c) => lab.stressors.find((x) => x.id === c)?.label).filter(Boolean).join('; ');
  const lensRefs = lensFw ? fwEntry(lensFw, lab.id).reqs.filter((r) => r[2]?.includes(mit.id)).map((r) => r[1]) : [];
  return (
    <span className="sg-note">
      <span className="sg-meta">
        <span className="chip">{STAGE_LABEL[mit.stage]}</span>
        <Cost n={mit.cost} />
        <span className="dim">Fixes: {fixes}</span>
      </span>
      {lensFw && (lensRefs.length
        ? <span className="small" style={{ color: 'var(--good)' }}>{FW_BY_ID[lensFw].short}: {lensRefs.join(', ')}</span>
        : <span className="dim small">Not required by {FW_BY_ID[lensFw].short}, still good practice</span>)}
    </span>
  );
}

/** Collapsible list of what a safeguard is grounded in (kept outside the toggle button). */
function BasedOn({ lab, mit }: { lab: LabDef; mit: Mitigation }) {
  const [open, setOpen] = useState(false);
  const refs = basedOn(lab, mit);
  if (!refs.length) return null;
  const id = `based-${mit.id}`;
  return (
    <div className="based">
      <button className="based-btn" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>{open ? '▾' : '▸'} Based on ({refs.length})</button>
      {open && (
        <div className="based-list" id={id}>
          {refs.map((r) => (isCode(r) ? <code key={r} className="ref-chip">{r}</code> : <span key={r} className="ref-text">{r}</span>))}
        </div>
      )}
    </div>
  );
}

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
        {e.reqs.map(([text, ref, sgs], i) => {
          const on = (sgs ?? []).filter((id) => m.has(id)).length;
          const status = !sgs?.length ? null : on === sgs.length ? 'met' : on ? 'partly' : 'not';
          return (
            <div key={i} className="req">
              <span>{text}</span>
              <span className="req-ref">{ref}</span>
              {sgs && sgs.length > 0 && (
                <span className="req-sg">
                  <span className={`pill ${status}`}>{status === 'met' ? 'Met' : status === 'partly' ? 'Partly met' : 'Not met'}</span>
                  In the simulation: {sgs.map((id, k) => <span key={id}>{k ? ', ' : ''}<b>{sgName(id)}</b>{m.has(id) ? ' (on)' : ''}</span>)}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <p className="small" style={{ marginTop: 14 }}><a href={url(`/rules/${fw}`)}>Read the full guide to {fwName(fw)} →</a></p>
    </div>
  );
}

const TOC = [
  { id: 'overview', label: 'Overview' },
  { id: 'simulation', label: 'Simulation' },
  { id: 'rules', label: 'Rules' },
  { id: 'cases', label: 'Cases' },
  { id: 'checklist', label: 'Checklist' },
];

/** "?p=zip,drift&s=dropzip" (ids are plain words, so no escaping is needed) */
const setupQuery = (s: Set<string>, m: Set<string>) => {
  const parts = [s.size ? `p=${[...s].join(',')}` : '', m.size ? `s=${[...m].join(',')}` : ''].filter(Boolean);
  return parts.length ? `?${parts.join('&')}` : '';
};

function parseSet(q: URLSearchParams | undefined, key: string, valid: string[]) {
  const v = q?.get(key);
  return new Set((v ? v.split(',') : []).filter((x) => valid.includes(x)));
}

export function ModelPage({ id, query }: { id: string; query?: URLSearchParams }) {
  const lab = LAB_BY_ID[id];
  const lens = useLens();
  const progress = useProgress();
  const [s, setS] = useState<Set<string>>(() => parseSet(query, 'p', lab?.stressors.map((x) => x.id) ?? []));
  const [m, setM] = useState<Set<string>>(() => parseSet(query, 's', lab?.mitigations.map((x) => x.id) ?? []));
  const [tab, setTab] = useState<FwId>('eu');
  const [say, setSay] = useState('');
  const first = useRef(true);

  // keep the setup in the address bar so it can be shared
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const t = setTimeout(() => {
      const qs = setupQuery(s, m);
      history.replaceState(history.state, '', location.pathname + qs + location.hash);
    }, 200);
    return () => clearTimeout(t);
  }, [s, m]);

  const scores = useMemo(() => (lab ? computeScores(lab, s, m).risk : null), [lab, s, m]);
  const to = lab && scores ? tradeOff(lab, s, m, scores) : { value: 50, trust: 100 };

  // record progress once at least one problem and one safeguard are on
  useEffect(() => {
    if (!lab || !s.size || !m.size) return;
    recordLab(lab.id, { trust: to.trust, value: to.value, letter: letterFor(to.trust), at: Date.now() });
  }, [lab, s, m, to.trust, to.value]);

  if (!lab || !scores) return <div className="wrap section"><h1>Not found</h1><p><a href={url('/')}>Back to all models</a></p></div>;
  const tier = TIER_BY_ID[lab.tier];
  const idx = LABS.indexOf(lab);
  const prev = LABS[idx - 1], next = LABS[idx + 1];
  const Viz = VIZ[lab.id];
  const live = (sid: string) => s.has(sid) && !isCountered(lab, sid, m);
  const base = computeScores(lab, new Set(), new Set()).risk;
  const relevant = new Set<RiskKey>([...(Object.keys(lab.baseRisk) as RiskKey[]), ...lab.stressors.flatMap((x) => Object.keys(x.risk) as RiskKey[])]);
  const bars = [...RISKS].sort((a, b) => scores[b.key] - scores[a.key]);
  const active = lab.stressors.filter((x) => s.has(x.id));
  const allHandled = active.length > 0 && active.every((x) => !live(x.id));
  const shownFw: FwId[] = lens === 'all' ? FRAMEWORKS.map((f) => f.id) : [lens];
  const curTab = lens === 'all' ? tab : lens;
  const lensFw = lens === 'all' ? null : lens;
  const eu = fwEntry('eu', lab.id);
  const euCat = FW_BY_ID.eu.cats.find((c) => c.id === eu.cat)!;
  const owaspStatus = fwEntry('owasp', lab.id).status;
  const explored = !!progress.labs?.[lab.id];

  const flipProblem = (st: Stressor) => {
    const on = !s.has(st.id);
    const n = new Set(s); on ? n.add(st.id) : n.delete(st.id);
    setS(n);
    const handled = on && isCountered(lab, st.id, m);
    setSay(on ? `Problem “${st.label}” switched on. It is ${handled ? 'handled' : 'not handled'}.` : `Problem “${st.label}” switched off.`);
  };
  const flipSafeguard = (mit: Mitigation) => {
    const on = !m.has(mit.id);
    const n = new Set(m); on ? n.add(mit.id) : n.delete(mit.id);
    setM(n);
    const fixed = mit.counters.filter((c) => s.has(c)).map((c) => lab.stressors.find((x) => x.id === c)!.label);
    setSay(`Safeguard “${mit.label}” ${on ? 'on' : 'off'}.${fixed.length ? ` ${fixed.join(' and ')} ${on ? 'now handled' : 'no longer handled by it'}.` : ''}`);
  };
  const share = async () => {
    const link = location.origin + location.pathname + setupQuery(s, m);
    if (await copyText(link)) toast('Link copied');
  };

  return (
    <div>
      <Toc items={TOC} />
      <section className="wrap" style={{ padding: '26px 0 8px' }}>
        <Breadcrumbs trail={[{ to: '/', label: 'Models' }, { label: tier.label }, { label: SHORT_NAME[lab.id] ?? lab.model }]} />
        <div className="eyebrow" style={{ color: tier.color, marginTop: 14 }}>{tier.label}</div>
        <h1 style={{ marginTop: 6 }}>{lab.model}</h1>
        <p className="lead" style={{ marginTop: 6 }}>Example: {lab.app.charAt(0).toLowerCase() + lab.app.slice(1)}</p>
        <div className="chip-row">
          <span className="tag"><span className="swatch" style={{ background: euCat.color }} />EU AI Act: {euCat.label}</span>
          <span className="tag"><span className="swatch" style={{ background: fwColor(FW_BY_ID.owasp) }} />OWASP: {owaspStatus}</span>
          {explored && <span className="tag explored">Explored ✓</span>}
          <button className="btn share-btn" onClick={share}>Share this setup</button>
        </div>
      </section>

      <section className="wrap section" id="overview" style={{ paddingTop: 28 }}>
        <div className="grid2">
          <div className="stack">
            <div>
              <div className="label">How it works</div>
              <p style={{ marginTop: 6 }}>{lab.primer}</p>
            </div>
            <div className="memo">
              <div className="memo-head">
                <span className="label">Memo</span>
                <span className="memo-from">From: <b>{lab.brief.from}</b>{lab.brief.role ? `, ${lab.brief.role}` : ''} · {lab.org}</span>
              </div>
              <p>{lab.brief.text}</p>
              {lab.brief.kpi && <div className="memo-kpi">Target: {lab.brief.kpi}</div>}
            </div>
            <div>
              <div className="label">Who is affected</div>
              <div className="people">{lab.stakeholders.map((p) => <span key={p} className="person"><PersonIcon org={looksLikeOrg(p)} />{p}</span>)}</div>
            </div>
          </div>
          <div className="card card-pad">
            <div className="label" style={{ marginBottom: 10 }}>{lens === 'all' ? 'How each framework classifies this use' : `Under ${fwName(lens)}`}</div>
            {shownFw.map((fw) => {
              const e = fwEntry(fw, lab.id);
              const cat = FW_BY_ID[fw].cats.find((c) => c.id === e.cat)!;
              return (
                <button key={fw} className="fw-row" onClick={() => { setTab(fw); document.getElementById('rules')?.scrollIntoView({ behavior: 'smooth' }); }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{FW_BY_ID[fw].short}</span>
                  <span className="small" style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}><span className="swatch" style={{ background: cat.color, transform: 'translateY(1px)' }} />{e.status}</span>
                </button>
              );
            })}
            {lens !== 'all' && <p className="small" style={{ marginTop: 12 }}>{fwEntry(lens, lab.id).summary}</p>}
          </div>
        </div>
      </section>

      <section className="wrap section" id="simulation">
        <h2>Try it: what can go wrong</h2>
        <p className="muted" style={{ marginTop: 8, maxWidth: 820 }}>
          The dark panel is a small working simulation of this system. <b>Step 1:</b> switch on a problem from the list on the right and watch the results change. <b>Step 2:</b> switch on a safeguard and see whether it fixes the problem. Use <b>Share this setup</b> to send someone exactly what you see.
        </p>
        <div className="sr-only" aria-live="polite">{say}</div>
        <div className="try-grid">
          <div className={`figure sticky-fig ${allHandled ? 'complete' : ''}`}>
            <Suspense fallback={<div className="viz-skeleton" aria-label="Loading simulation" />}><Viz s={s} m={m} live={live} /></Suspense>
          </div>
          <div className="stack">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3>1. Problems</h3>
                {(s.size > 0 || m.size > 0) && <button className="btn btn-sm" onClick={() => { setS(new Set()); setM(new Set()); setSay('Simulation reset.'); }}>Reset</button>}
              </div>
              <div className="stack" style={{ marginTop: 10 }}>
                {lab.stressors.map((st) => {
                  const on = s.has(st.id);
                  const fixers = lab.mitigations.filter((x) => x.counters.includes(st.id));
                  const handled = on && isCountered(lab, st.id, m);
                  const kind = <span className="kind"><KindIcon kind={st.kind} />{KIND_LABEL[st.kind]}{lens === 'owasp' && st.codes?.length ? <>{st.codes.map((c) => <code key={c} className="ref-chip">{c}</code>)}</> : null}</span>;
                  const note = !on ? kind
                    : st.unmitigable && !handled ? <span style={{ color: 'var(--bad)' }}>No safeguard makes this acceptable here. The only option is not to deploy it.</span>
                    : handled ? <span style={{ color: 'var(--good)' }}>{st.unmitigable ? 'Removed: the use has been dropped' : 'Handled by a safeguard'}</span>
                    : <span style={{ color: 'var(--bad)' }}>Not handled. Try: {fixers.map((f) => f.label).join(' or ')}</span>;
                  return <Toggle key={st.id} kind="problem" on={on} title={st.label} desc={st.desc} onClick={() => flipProblem(st)} note={<>{on && kind}{on ? <span style={{ display: 'block', marginTop: 4 }}>{note}</span> : note}</>} />;
                })}
              </div>
            </div>
            <div>
              <h3>2. Safeguards</h3>
              <div className="stack" style={{ marginTop: 10 }}>
                {lab.mitigations.map((mit) => {
                  const inLens = !lensFw || fwEntry(lensFw, lab.id).reqs.some((r) => r[2]?.includes(mit.id));
                  return (
                    <div key={mit.id} style={{ opacity: inLens ? 1 : 0.7 }}>
                      <Toggle kind="fix" on={m.has(mit.id)} title={mit.label} desc={mit.desc} onClick={() => flipSafeguard(mit)} note={<SafeguardNote lab={lab} mit={mit} lensFw={lensFw} />} />
                      <BasedOn lab={lab} mit={mit} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {allHandled && (
            <motion.a href="#residual" className="complete-chip" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              All active problems handled · residual risk remains
            </motion.a>
          )}
        </AnimatePresence>

        <div className="results">
          <div className="card card-pad" data-testid="sim-summary">
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
            {lab.residual && (
              <p className="residual" id="residual"><b>Residual risk.</b> {lab.residual}</p>
            )}
            <Newsroom lab={lab} s={s} live={live} />
          </div>
          <div className="results-side">
          <div className="card card-pad">
            <h3>Risk level</h3>
            <div className="risk-split">
              <RiskRadar scores={scores} base={base} relevant={relevant} />
              <div className="bars">
                {bars.map((r) => {
                  const v = scores[r.key];
                  const lv = level(v);
                  const rel = relevant.has(r.key);
                  return (
                    <div key={r.key} className="bar-row" style={{ opacity: rel ? 1 : 0.45 }}>
                      <span title={r.desc}>{r.label}</span>
                      <div className="bar-track"><motion.div animate={{ width: `${Math.max(4, v)}%`, backgroundColor: lv.color }} className="bar-fill" /></div>
                      <span style={{ color: lv.color, fontWeight: 600, fontSize: 13 }}>{lv.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="dim small" style={{ marginTop: 10 }}>Dashed outline: the system as designed. Faded rows: harms this example does not mainly involve. An indicative score for teaching, not a formal assessment.</p>
          </div>
          <div className="card card-pad">
            <h3>The trade-off</h3>
            <TradeOff value={to.value} trust={to.trust} />
          </div>
          </div>
        </div>
      </section>

      <section className="wrap section" id="rules">
        <h2>How the rules apply</h2>
        {lens === 'all' ? (
          <>
            <p className="muted" style={{ marginTop: 8, maxWidth: 820 }}>Each framework looks at this system differently. Pick one to see how it classifies the use, what it requires, and whether the safeguards you switched on meet it.</p>
            <div className="tabs" role="tablist" style={{ marginTop: 18 }}>
              {FRAMEWORKS.map((f) => (
                <button key={f.id} role="tab" aria-selected={curTab === f.id} className={curTab === f.id ? 'on' : ''} onClick={() => setTab(f.id)}>
                  <span className="tab-dot" style={{ background: fwColor(f) }} aria-hidden />{f.short}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="muted" style={{ marginTop: 8 }}>Showing {fwName(lens)} only. <a href="#" onClick={(ev) => { ev.preventDefault(); setLens('all'); }}>Show all frameworks</a></p>
        )}
        <div className="card card-pad" role={lens === 'all' ? 'tabpanel' : undefined} style={{ marginTop: lens === 'all' ? 0 : 18, borderTopLeftRadius: lens === 'all' ? 0 : 10 }}>
          <FrameworkBlock key={curTab} lab={lab} fw={curTab} m={m} />
        </div>
      </section>

      <section className="wrap section" id="cases">
        <h2>Real cases</h2>
        <div className="grid2 cases" style={{ marginTop: 18 }}>
          {lab.incidents.map((inc) => (
            <article key={inc.title} className="card card-pad case">
              <span className="year">{inc.year}</span>
              <h3>{inc.title}</h3>
              <p className="muted">{inc.text}</p>
              {inc.outcome && <p className="small"><b>Outcome:</b> {inc.outcome}</p>}
              {inc.url && <a className="small" href={inc.url} target="_blank" rel="noopener noreferrer">Read the source{inc.source ? ` (${inc.source})` : ''} ↗</a>}
            </article>
          ))}
        </div>
      </section>

      <section className="wrap section" id="checklist">
        <div className="grid2" style={{ alignItems: 'start' }}>
          <div>
            <h2>Before go-live</h2>
            <p className="muted" style={{ margin: '8px 0 16px' }}>What a careful team would check before switching this system on.</p>
            <Checklist lab={lab} />
          </div>
          <div className="stack">
            <h2>In short</h2>
            <blockquote className="pull">{lab.lesson}</blockquote>
            {lab.discuss && lab.discuss.length > 0 && (
              <details className="discuss">
                <summary>Workshop prompts ({lab.discuss.length})</summary>
                <ol>{lab.discuss.map((q) => <li key={q}>{q}</li>)}</ol>
              </details>
            )}
          </div>
        </div>
        <nav className="prevnext" aria-label="Other examples">
          {prev ? (
            <a className="card lift pn" href={url(`/model/${prev.id}`)} style={{ borderColor: alpha(TIER_BY_ID[prev.tier].color, 0.33) }}>
              <span className="dim small">← Previous</span>
              <span className="pn-row"><span className="u-glyph" style={{ borderColor: TIER_BY_ID[prev.tier].color, color: TIER_BY_ID[prev.tier].color }}>{prev.glyph}</span><span><b>{SHORT_NAME[prev.id]}</b><span className="muted small" style={{ display: 'block' }}>{prev.app}</span></span></span>
            </a>
          ) : <span />}
          {next && (
            <a className="card lift pn next" href={url(`/model/${next.id}`)} style={{ borderColor: alpha(TIER_BY_ID[next.tier].color, 0.33) }}>
              <span className="dim small">Next →</span>
              <span className="pn-row"><span className="u-glyph" style={{ borderColor: TIER_BY_ID[next.tier].color, color: TIER_BY_ID[next.tier].color }}>{next.glyph}</span><span><b>{SHORT_NAME[next.id]}</b><span className="muted small" style={{ display: 'block' }}>{next.app}</span></span></span>
            </a>
          )}
        </nav>
      </section>
    </div>
  );
}
