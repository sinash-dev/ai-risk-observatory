import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useMemo, useState } from 'react';
import { RiskPyramid } from '../components/RiskPyramid';
import { WorldTimeline } from '../components/WorldTimeline';
import { tierOfCategory } from '../data/euTiers';
import { solid } from '../data/palette';
import { BindMeter, ExamplesTable, MythCard } from '../components/GuideParts';
import { FW_GUIDE } from '../data/fwGuide';
import { allRoutes } from '../data/routes';
import { COMPARE, TOPICS } from '../data/compare';
import { KIND_COLOR, fwColor, fwKind, type FwKind } from '../data/fwKind';
import { SceneShell } from '../three/SceneShell';
import { useWebGL } from '../three/useWebGL';
import type { GlobeMarker, GlobeOther } from '../three/Globe';
import { Breadcrumbs, Toc } from '../components/Nav';
import { HTimeline, Roadmap, TODAY, TODAY_LABEL, parseDate } from '../components/Timeline';
import { FRAMEWORKS, FW_BY_ID, OTHER_FRAMEWORKS, fwName, type Framework, type FwId } from '../data/frameworks';
import { LABS, LAB_BY_ID, fwEntry } from '../data/labs';
import { setLens, useLens } from '../lib/lens';
import { go, url } from '../lib/util';
import { SHORT_NAME } from '../data/shortNames';
import { fmtDate } from '../data/site';

const SORTS: Record<FwId, string> = {
  eu: 'By risk of the use: banned, high-risk, transparency, minimal',
  us: 'By sector and state; no single classification',
  nist: 'Does not classify; looks at trustworthiness qualities',
  iso: 'Does not classify; scales controls to impact',
  owasp: 'By type of system: ML, LLM application, agent',
  gdpr: 'By how personal data is used',
  cn: 'By type of public service: recommendation, synthesis, generative AI',
  kr: 'High-impact AI, generative AI, everything else',
  sg: 'By how much human involvement the harm calls for',
  uk: 'By sector regulator, against five principles',
};
const REGION: Record<FwId, string> = { eu: 'Europe', gdpr: 'Europe', uk: 'Europe', us: 'Americas', nist: 'Americas', cn: 'Asia-Pacific', kr: 'Asia-Pacific', sg: 'Asia-Pacific', iso: 'International', owasp: 'International' };
const REGIONS = ['Europe', 'Americas', 'Asia-Pacific', 'International'];

function TiltCard({ f, i }: { f: Framework; i: number }) {
  return (
    <motion.div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 10, transformStyle: 'preserve-3d' }}
      initial={{ opacity: 0, y: 18, rotateX: 8 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.5 }}
      whileHover={{ y: -4, rotateX: 3, rotateY: -3, boxShadow: '0 24px 50px -24px rgba(0,0,0,.9)' }}>
      <div className="label">{f.type}</div>
      <h3>{f.short}</h3>
      <p className="muted small" style={{ flex: 1 }}>{f.intro.split('. ')[0]}.</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <a className="btn btn-primary" href={url(`/rules/${f.id}`)}>Open guide</a>
        <button className="btn" onClick={() => { setLens(f.id); go('/'); }}>View site through it</button>
      </div>
    </motion.div>
  );
}


/** Where each framework sits on the globe. ISO and OWASP are international, so they orbit as satellites. */
const PLACE: Record<FwId, { lat?: number; lon?: number; satellite?: number }> = {
  eu: { lat: 50.85, lon: 3.35 }, gdpr: { lat: 50.85, lon: 5.35 }, uk: { lat: 51.51, lon: -0.13 },
  us: { lat: 38.91, lon: -78.04 }, nist: { lat: 38.91, lon: -76.04 },
  cn: { lat: 39.9, lon: 116.4 }, kr: { lat: 37.57, lon: 126.98 }, sg: { lat: 1.35, lon: 103.82 },
  iso: { satellite: 0 }, owasp: { satellite: 1 },
};
/** "Other frameworks" list entries that have a clear home city */
const OTHER_PLACES: { match: RegExp; label: string; lat: number; lon: number }[] = [
  { match: /Council of Europe/, label: 'Council of Europe (Strasbourg)', lat: 48.58, lon: 7.75 },
  { match: /^Japan/, label: 'Japan (Tokyo)', lat: 35.68, lon: 139.69 },
  { match: /^Brazil/, label: 'Brazil (Brasília)', lat: -15.79, lon: -47.88 },
  { match: /^Canada/, label: 'Canada (Ottawa)', lat: 45.42, lon: -75.7 },
  { match: /^Australia/, label: 'Australia (Canberra)', lat: -35.28, lon: 149.13 },
  { match: /^OECD/, label: 'OECD (Paris)', lat: 48.86, lon: 2.35 },
];
/** frameworks that set firm rules (strength 2 or more) on at least half of the same topics */
function firmArcs() {
  const ids = FRAMEWORKS.map((f) => f.id);
  const out: Record<string, string[]> = {};
  for (const a of ids) {
    out[a] = ids.filter((b) => b !== a && TOPICS.filter((t) => COMPARE[t.id][a][0] >= 2 && COMPARE[t.id][b][0] >= 2).length >= TOPICS.length / 2);
  }
  return out;
}

function GlobeSection() {
  const [sel, setSel] = useState<FwId | null>(null);
  const markers: GlobeMarker[] = useMemo(() => FRAMEWORKS.map((f) => ({ id: f.id, label: f.short, type: f.type, binding: f.binding, color: solid(fwColor(f)), ...PLACE[f.id] })), []);
  const others: GlobeOther[] = useMemo(() => OTHER_FRAMEWORKS.flatMap((o, idx) => {
    const p = OTHER_PLACES.find((x) => x.match.test(o.name));
    return p ? [{ idx, label: p.label, lat: p.lat, lon: p.lon }] : [];
  }), []);
  const arcs = useMemo(firmArcs, []);
  const onSelect = useCallback((id: string) => setSel(id as FwId), []);
  const onOther = useCallback((idx: number) => {
    const el = document.getElementById(`other-${idx}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el?.classList.add('flash');
    setTimeout(() => el?.classList.remove('flash'), 1600);
  }, []);
  const props = useMemo(() => ({ markers, others, arcs, selected: sel, onSelect, onOther }), [markers, others, arcs, sel, onSelect, onOther]);
  const f = sel ? FW_BY_ID[sel] : null;
  const next = f?.timeline.map((e) => ({ ...e, y: parseDate(e.date) })).filter((e) => e.y > TODAY).sort((a, b) => a.y - b.y)[0];
  const kinds = Object.keys(KIND_COLOR) as FwKind[];
  const allowed = useWebGL();
  if (!allowed) return null; // the region cards below are the 2D version
  return (
    <section className="section globe-section" aria-label="Rules around the world">
      <div className="globe-grid">
        <div className="globe-stage">
          <SceneShell className="globe-wrap stage" height="clamp(420px, 46vw, 560px)" load={() => import('../three/Globe')} props={props} fallback={null} />
          <div className="globe-legend" aria-hidden>
            {kinds.map((k) => <span key={k}><span className="swatch" style={{ background: KIND_COLOR[k] }} />{k}</span>)}
            <span><span className="swatch" style={{ background: '#7c838e' }} />Other frameworks</span>
          </div>
        </div>
        <AnimatePresence mode="wait">
          {f ? (
            <motion.aside key={f.id} className="globe-panel card card-pad stack" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.3 }} aria-live="polite">
              <div className="label" style={{ color: fwColor(f) }}>{fwKind(f)}</div>
              <h2 style={{ fontSize: 24 }}>{f.name}</h2>
              <p className="muted">{f.intro.split('. ').slice(0, 2).join('. ')}.</p>
              {next && <p className="small"><span className="mono" style={{ color: 'var(--c-mid, #d6c06a)' }}>Next: {next.date}</span> · {next.text}</p>}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a className="btn btn-primary" href={url(`/rules/${f.id}`)}>Open guide</a>
                <button className="btn" onClick={() => { setLens(f.id); go('/'); }}>View site through it</button>
              </div>
              {(arcs[f.id] ?? []).length > 0 && <p className="dim small">Arcs show frameworks that set firm rules on the same topics: {arcs[f.id].map((id) => FW_BY_ID[id as FwId].short).join(', ')}.</p>}
              <button className="tour-skip" style={{ alignSelf: 'flex-start' }} onClick={() => setSel(null)}>Clear selection</button>
            </motion.aside>
          ) : (
            <motion.aside key="intro" className="globe-panel stack" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="eyebrow">Rules around the world</div>
              <h2 style={{ fontSize: 24 }}>Where each framework comes from</h2>
              <p className="muted">Drag the globe to turn it. Pick a marker to read about that framework; the colour shows how binding it is. ISO/IEC 42001 and the OWASP lists are international, so they circle the globe.</p>
              <p className="muted small">Every framework is also listed by region below.</p>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export function Frameworks() {
  return (
    <div className="wrap" style={{ padding: '44px 0' }}>
      <div className="narrow stack">
        <div className="label accent">Rules and frameworks</div>
        <h1>{FRAMEWORKS.length} ways of governing AI</h1>
        <p className="lead">Some are laws with fines, some are standards you can be certified against, some are practical guides. Most organisations need several at once. Pick one to read its guide, or view the whole site through it.</p>
        <p className="fw-sub"><a className="btn btn-sm" href={url('/compare')}>Compare frameworks side by side</a></p>
      </div>

      <GlobeSection />

      {REGIONS.map((reg) => (
        <section key={reg} className="section" style={{ paddingBottom: 10 }}>
          <h2 style={{ fontSize: 20 }}>{reg}</h2>
          <div className="grid3" style={{ marginTop: 16, perspective: 1200 }}>
            {FRAMEWORKS.filter((f) => REGION[f.id] === reg).map((f, i) => <TiltCard key={f.id} f={f} i={i} />)}
          </div>
        </section>
      ))}

      <section className="section">
        <h2>At a glance</h2>
        <div className="card" style={{ marginTop: 18, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, minWidth: 780 }}>
            <thead><tr style={{ textAlign: 'start' }}>{['Framework', 'Type', 'Where', 'Binding?', 'How it sorts AI systems'].map((h) => <th key={h} className="label" style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>{h}</th>)}</tr></thead>
            <tbody>
              {FRAMEWORKS.map((f) => (
                <tr key={f.id} className="row-link" onClick={() => go(`/rules/${f.id}`)} style={{ cursor: 'pointer' }}>
                  <td style={{ padding: '13px 16px', borderTop: '1px solid var(--line)', fontWeight: 700 }}><a href={url(`/rules/${f.id}`)}>{f.short}</a></td>
                  <td style={{ padding: '13px 16px', borderTop: '1px solid var(--line)' }}>{f.type}</td>
                  <td style={{ padding: '13px 16px', borderTop: '1px solid var(--line)' }}>{f.where}</td>
                  <td style={{ padding: '13px 16px', borderTop: '1px solid var(--line)' }}>{f.binding}</td>
                  <td style={{ padding: '13px 16px', borderTop: '1px solid var(--line)' }} className="muted">{SORTS[f.id]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small" style={{ marginTop: 14 }}>Want to see them side by side on a single topic, such as transparency? <a href={url('/compare')}>Open the comparison →</a></p>
      </section>

      <section className="section">
        <div className="grid2">
          <div className="stack">
            <h2>How they fit together</h2>
            <p>Take a European bank that also sells in the US and Asia. GDPR and the EU AI Act set what it must do in Europe; US fair-lending law and state AI laws apply to its American customers; China’s and Korea’s rules apply where it offers services there. To do all of that consistently it runs an ISO/IEC 42001 management system, uses the NIST AI RMF to analyse each system, and has its security team test against OWASP. Singapore’s framework offers practical tools, such as its human-involvement matrix, that work anywhere.</p>
          </div>
          <div className="stack">
            <h2>Learning one framework</h2>
            <p>Every guide has a learning path: a short list of examples on this site that together show how that framework works, with a note on what to look for in each one. Choose the framework under <b>View through</b> first, so every page shows only its rules.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Timeline of AI rules worldwide</h2>
        <p className="muted" style={{ marginTop: 6, marginBottom: 24 }}>Every date from the {FRAMEWORKS.length} frameworks, in order. Teal dates have passed; yellow ones are still to come.</p>
        <WorldTimeline />
      </section>

      <section className="section">
        <h2>Other frameworks worth knowing</h2>
        <div className="card" style={{ marginTop: 18 }}>
          {OTHER_FRAMEWORKS.map((o, i) => (
            <div key={o.name} id={`other-${i}`} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,2fr)', gap: 20, padding: '14px 18px', borderTop: i ? '1px solid var(--line)' : 'none' }} className="other-row">
              <div><div style={{ fontWeight: 700 }}>{o.name}</div><div className="dim small">{o.where} · {o.type}</div></div>
              <p className="muted small">{o.text}</p>
            </div>
          ))}
        </div>
        <p className="dim small" style={{ marginTop: 12 }}>Laws and dates are summarised for training and change often. Check official sources before relying on them.</p>
      </section>
      <style>{'@media (max-width: 760px){.other-row{grid-template-columns:minmax(0,1fr) !important; gap:4px !important}}'}</style>
    </div>
  );
}

export function FrameworkPage({ id }: { id: string }) {
  const f = FW_BY_ID[id as FwId];
  const lens = useLens();
  if (!f) return <div className="wrap section"><h1>Not found</h1><p><a href={url('/rules')}>All frameworks</a></p></div>;
  const counts = f.cats.map((c) => LABS.filter((l) => fwEntry(f.id, l.id).cat === c.id).length);
  const total = LABS.length;
  const toc = [
    { id: 'overview', label: 'Overview' },
    { id: 'definitions', label: 'Definitions' },
    { id: 'categories', label: 'Categories' },
    { id: 'requirements', label: 'Key requirements' },
    { id: 'timeline', label: 'Timeline' },
    ...(f.roadmap || f.learn ? [{ id: 'roadmap', label: 'Roadmap' }] : []),
    ...(f.extras ?? []).map((x, i) => ({ id: `more-${i}`, label: x.title.length > 28 ? x.title.slice(0, 26).replace(/\s+\S*$/, '') + '…' : x.title })),
    { id: 'enforcement', label: 'Who enforces it' },
    { id: 'myths', label: 'Myths' },
    { id: 'examples', label: 'Examples' },
  ];
  const g = FW_GUIDE[f.id];
  const hasQuiz = allRoutes().some((r) => r.path === `/quiz/${f.id}`);
  return (
    <div className="with-rail">
    <Toc items={toc} />
    <div className="rail-main">
    <div className="wrap" style={{ padding: '30px 0 40px' }}>
      <Breadcrumbs trail={[{ to: '/rules', label: 'Frameworks' }, { label: f.short }]} />
      <motion.div className="narrow stack" style={{ marginTop: 12 }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1>{f.name}</h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><span className="tag">{f.type}</span><span className="tag">{f.where}</span><span className="tag">{f.binding}</span>{f.reviewed && <span className="tag">Last reviewed {fmtDate(f.reviewed)}</span>}</div>
        <div className="asks">
          <span className="label">Asks</span>
          <span className="asks-q">{g.ask}</span>
          <BindMeter n={g.bind} binding={f.binding} />
        </div>
        <p className="lead">{f.intro}</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {lens === f.id
            ? <span className="muted small">You are viewing the site through {fwName(f.id)}. <a href="#" onClick={(e) => { e.preventDefault(); setLens('all'); }}>Switch back to all frameworks</a></span>
            : <button className="btn btn-primary" onClick={() => { setLens(f.id); go('/'); }}>View the whole site through {fwName(f.id)}</button>}
          <a className="btn" href={url(`/compare/${f.id}`)}>Compare with the others</a>
        </div>
      </motion.div>

      <section className="section" id="overview">
        <div className="grid2">
          <div className="stack"><h2>Who it applies to</h2><p className="muted">{f.who}</p></div>
          <div className="stack"><h2>How it works</h2><p className="muted">{f.approach}</p></div>
        </div>
      </section>

      <section className="section" id="definitions">
        <h2>Key definitions</h2>
        <p className="muted small" style={{ marginTop: 6 }}>In plain words. Check the official text for the exact wording.</p>
        <dl className="defs">
          {g.definitions.map((d, i) => (
            <motion.div key={d.t} className="card card-pad" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <dt>{d.t}</dt>
              <dd className="muted small">{d.d}</dd>
            </motion.div>
          ))}
        </dl>
      </section>

      <section className="section" id="categories">
        <h2>{f.catsTitle}</h2>
        {f.id === 'eu' && (
          <RiskPyramid examples={LABS.flatMap((l) => { const k = tierOfCategory(fwEntry('eu', l.id).cat); return k ? [{ id: l.id, app: l.app, tier: k }] : []; })} />
        )}
        <p className="muted small" style={{ marginTop: 6 }}>How the {total} examples on this site are distributed:</p>
        <div style={{ display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden', marginTop: 12, background: 'rgba(255,255,255,.05)' }}>
          {f.cats.map((c, i) => counts[i] ? <motion.div key={c.id} title={`${c.label}: ${counts[i]}`} initial={{ width: 0 }} whileInView={{ width: `${(counts[i] / total) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.9, delay: i * 0.1 }} style={{ background: c.color }} /> : null)}
        </div>
        <div className="grid3" style={{ marginTop: 18 }}>
          {f.cats.map((c, i) => {
            const labs = LABS.filter((l) => fwEntry(f.id, l.id).cat === c.id);
            return (
              <motion.div key={c.id} className="card card-pad stack" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span className="swatch" style={{ background: c.color, width: 11, height: 11 }} /><h3>{c.label}</h3><span className="dim small" style={{ marginInlineStart: 'auto' }}>{labs.length}</span></div>
                <p className="muted small">{c.desc}</p>
                {labs.length > 0 && <div className="small">{labs.map((l, k) => <span key={l.id}>{k ? ' · ' : ''}<a href={url(`/model/${l.id}`)}>{l.app}</a></span>)}</div>}
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="section" id="requirements">
        <h2>{f.keyTitle}</h2>
        <div className="card" style={{ marginTop: 18 }}>
          {f.keyReqs.map((k, i) => (
            <motion.div key={k.t} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,2fr)', gap: 20, padding: '15px 20px', borderTop: i ? '1px solid var(--line)' : 'none' }} className="other-row">
              <div style={{ fontWeight: 700 }}>{k.t}</div>
              <p className="muted">{k.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section" id="timeline">
        <h2>Timeline</h2>
        <div style={{ marginTop: 10 }}><HTimeline events={f.timeline} /></div>
      </section>

      {(f.roadmap || f.learn) && (
        <section className="section" id="roadmap">
          <div className="grid2" style={{ alignItems: 'start' }}>
            {f.roadmap && (
              <div>
                <h2>Roadmap to compliance</h2>
                <p className="muted small" style={{ margin: '6px 0 20px' }}>The order most organisations work through.</p>
                <Roadmap steps={f.roadmap} />
              </div>
            )}
            {f.learn && (
              <div>
                <h2>Learn it with this site</h2>
                <p className="muted small" style={{ margin: '6px 0 20px' }}>Open these examples in order, with the view set to {fwName(f.id)}. Together they cover the framework’s main ideas.</p>
                <div className="stack">
                  {f.learn.map(([mid, note], i) => (
                    <motion.a key={mid} href={url(`/model/${mid}`)} onClick={() => setLens(f.id)} className="card lift" style={{ display: 'grid', gridTemplateColumns: '34px minmax(0,1fr)', gap: 12, padding: '12px 14px', color: 'inherit' }} initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                      <span className="mono accent" style={{ fontWeight: 600 }}>{String(i + 1).padStart(2, '0')}</span>
                      <span><b>{SHORT_NAME[mid]}</b> <span className="muted small">· {LAB_BY_ID[mid]?.app}</span><span className="muted small" style={{ display: 'block', marginTop: 2 }}>{note}</span></span>
                    </motion.a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {f.extras?.map((x, xi) => (
        <section key={x.title} className="section" id={`more-${xi}`}>
          <h2>{x.title}</h2>
          {x.intro && <p className="muted" style={{ marginTop: 6 }}>{x.intro}</p>}
          <div className="grid3" style={{ marginTop: 18 }}>
            {x.items.map((it, i) => (
              <motion.div key={it.t} className="card card-pad" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <div style={{ fontWeight: 700 }}>{it.t}</div>
                <p className="muted small" style={{ marginTop: 4 }}>{it.d}</p>
              </motion.div>
            ))}
          </div>
        </section>
      ))}

      <section className="section" id="enforcement">
        <h2>Who enforces it</h2>
        <div className="grid3" style={{ marginTop: 16 }}>
          {g.enforcement.map((x) => (
            <div key={x.t} className="card card-pad enf">
              <div style={{ fontWeight: 700 }}>{x.t}</div>
              <p className="muted small" style={{ marginTop: 4 }}>{x.d}</p>
            </div>
          ))}
        </div>
        <div className="grid2" style={{ marginTop: 28 }}>
          <div className="stack"><h3>Penalties</h3><p className="muted">{f.penalties}</p></div>
          <div className="stack">
            <h3>Official sources</h3>
            {f.sources.map((s) => <div key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label} ↗</a></div>)}
          </div>
        </div>
      </section>

      <section className="section" id="myths">
        <h2>Common misconceptions</h2>
        <p className="muted small" style={{ marginTop: 6 }}>Select a card to see the facts.</p>
        <div className="grid3" style={{ marginTop: 16 }}>
          {g.myths.map((x) => <MythCard key={x.myth} myth={x.myth} fact={x.fact} />)}
        </div>
      </section>

      <section className="section" id="examples">
        <h2>How it treats each example</h2>
        <div style={{ marginTop: 16 }}><ExamplesTable f={f} /></div>
      </section>

      <section className="section quiz-cta">
        <div className="card card-pad cta-card">
          <div>
            <div className="eyebrow">Test yourself</div>
            <h2 style={{ fontSize: 22, marginTop: 4 }}>Five questions on {fwName(f.id)}</h2>
            <p className="muted small" style={{ marginTop: 4 }}>Check what you have learned, with an explanation for every answer.</p>
          </div>
          {hasQuiz ? <a className="btn btn-primary" href={url(`/quiz/${f.id}`)}>Start the quiz</a> : <a className="btn" href={url(`/compare/${f.id}`)}>Compare it with the others</a>}
        </div>
      </section>
      <style>{'@media (max-width: 760px){.other-row{grid-template-columns:minmax(0,1fr) !important; gap:4px !important}}'}</style>
    </div>
    </div>
    </div>
  );
}
