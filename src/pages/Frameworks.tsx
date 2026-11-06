import { motion } from 'framer-motion';
import { HTimeline, Roadmap, TODAY, TODAY_LABEL, parseDate } from '../components/Timeline';
import { FRAMEWORKS, FW_BY_ID, OTHER_FRAMEWORKS, fwName, type Framework, type FwId } from '../data/frameworks';
import { LABS, LAB_BY_ID, fwEntry } from '../data/labs';
import { setLens, useLens } from '../lib/lens';
import { go, url } from '../lib/util';
import { SHORT_NAME } from './Home';
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

function WorldTimeline() {
  const all = FRAMEWORKS.flatMap((f) => f.timeline.map((t) => ({ ...t, f: f.short, y: parseDate(t.date) }))).sort((a, b) => a.y - b.y);
  const years = Array.from(new Set(all.map((e) => Math.floor(e.y))));
  let todayShown = false;
  return (
    <div style={{ position: 'relative', paddingLeft: 90 }}>
      <div style={{ position: 'absolute', left: 70, top: 6, bottom: 6, width: 2, background: 'linear-gradient(rgba(108,197,176,.6), rgba(214,192,106,.6))' }} />
      {years.map((yr) => {
        const items = all.filter((e) => Math.floor(e.y) === yr);
        return (
          <div key={yr} style={{ position: 'relative', marginBottom: 18 }}>
            <div style={{ position: 'absolute', left: -90, top: 0, width: 60, textAlign: 'right', fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 20 }}>{yr}</div>
            {items.map((e, i) => {
              const future = e.y > TODAY;
              const marker = future && !todayShown;
              if (marker) todayShown = true;
              return (
                <div key={e.f + e.date + e.text}>
                  {marker && <div className="mono small" style={{ margin: '6px 0 10px -26px', color: '#fff', opacity: 0.8 }}>── today ({TODAY_LABEL}) ──</div>}
                  <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: i * 0.04 }}
                    style={{ position: 'relative', display: 'grid', gridTemplateColumns: '78px 150px minmax(0,1fr)', gap: 12, padding: '7px 0', alignItems: 'baseline' }} className="wt-row">
                    <span style={{ position: 'absolute', left: -25, top: 13, width: 10, height: 10, borderRadius: '50%', background: future ? '#0c0e11' : 'var(--accent)', border: `2px solid ${future ? '#d6c06a' : 'var(--accent)'}` }} />
                    <span className="mono small" style={{ color: future ? '#d6c06a' : 'var(--muted)' }}>{e.date}</span>
                    <span className="tag" style={{ justifySelf: 'start' }}>{e.f}</span>
                    <span>{e.text}</span>
                  </motion.div>
                </div>
              );
            })}
          </div>
        );
      })}
      <style>{'@media (max-width: 760px){.wt-row{grid-template-columns:minmax(0,1fr) !important; gap:2px !important}}'}</style>
    </div>
  );
}

export function Frameworks() {
  return (
    <div className="wrap" style={{ padding: '44px 0' }}>
      <div className="narrow stack">
        <div className="label accent">Rules and frameworks</div>
        <h1>{FRAMEWORKS.length} ways of governing AI</h1>
        <p className="lead">Some are laws with fines, some are standards you can be certified against, some are practical guides. Most organisations need several at once. Pick one to read its guide, or view the whole site through it.</p>
      </div>

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
            <thead><tr style={{ textAlign: 'left' }}>{['Framework', 'Type', 'Where', 'Binding?', 'How it sorts AI systems'].map((h) => <th key={h} className="label" style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>{h}</th>)}</tr></thead>
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
            <div key={o.name} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,2fr)', gap: 20, padding: '14px 18px', borderTop: i ? '1px solid var(--line)' : 'none' }} className="other-row">
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
  return (
    <div className="wrap" style={{ padding: '30px 0 40px' }}>
      <div className="crumbs"><a href={url('/rules')}>Rules and frameworks</a> / {f.short}</div>
      <motion.div className="narrow stack" style={{ marginTop: 12 }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1>{f.name}</h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><span className="tag">{f.type}</span><span className="tag">{f.where}</span><span className="tag">{f.binding}</span>{f.reviewed && <span className="tag">Last reviewed {fmtDate(f.reviewed)}</span>}</div>
        <p className="lead">{f.intro}</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {lens === f.id
            ? <span className="muted small">You are viewing the site through {fwName(f.id)}. <a href="#" onClick={(e) => { e.preventDefault(); setLens('all'); }}>Switch back to all frameworks</a></span>
            : <button className="btn btn-primary" onClick={() => { setLens(f.id); go('/'); }}>View the whole site through {fwName(f.id)}</button>}
          <a className="btn" href={url(`/compare/${f.id}`)}>Compare with the others</a>
        </div>
      </motion.div>

      <section className="section">
        <div className="grid2">
          <div className="stack"><h2>Who it applies to</h2><p className="muted">{f.who}</p></div>
          <div className="stack"><h2>How it works</h2><p className="muted">{f.approach}</p></div>
        </div>
      </section>

      <section className="section">
        <h2>{f.catsTitle}</h2>
        <p className="muted small" style={{ marginTop: 6 }}>How the {total} examples on this site are distributed:</p>
        <div style={{ display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden', marginTop: 12, background: 'rgba(255,255,255,.05)' }}>
          {f.cats.map((c, i) => counts[i] ? <motion.div key={c.id} title={`${c.label}: ${counts[i]}`} initial={{ width: 0 }} whileInView={{ width: `${(counts[i] / total) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.9, delay: i * 0.1 }} style={{ background: c.color }} /> : null)}
        </div>
        <div className="grid3" style={{ marginTop: 18 }}>
          {f.cats.map((c, i) => {
            const labs = LABS.filter((l) => fwEntry(f.id, l.id).cat === c.id);
            return (
              <motion.div key={c.id} className="card card-pad stack" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span className="swatch" style={{ background: c.color, width: 11, height: 11 }} /><h3>{c.label}</h3><span className="dim small" style={{ marginLeft: 'auto' }}>{labs.length}</span></div>
                <p className="muted small">{c.desc}</p>
                {labs.length > 0 && <div className="small">{labs.map((l, k) => <span key={l.id}>{k ? ' · ' : ''}<a href={url(`/model/${l.id}`)}>{l.app}</a></span>)}</div>}
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="section">
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

      <section className="section">
        <h2>Timeline</h2>
        <div style={{ marginTop: 10 }}><HTimeline events={f.timeline} /></div>
      </section>

      {(f.roadmap || f.learn) && (
        <section className="section">
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

      {f.extras?.map((x) => (
        <section key={x.title} className="section">
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

      <section className="section">
        <div className="grid2">
          <div className="stack"><h2>Penalties and enforcement</h2><p className="muted">{f.penalties}</p></div>
          <div className="stack">
            <h2>Official sources</h2>
            {f.sources.map((s) => <div key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label} ↗</a></div>)}
          </div>
        </div>
      </section>

      <section className="section">
        <h2>How it treats each example</h2>
        <div className="card" style={{ marginTop: 18, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14.5, minWidth: 760 }}>
            <thead><tr style={{ textAlign: 'left' }}>{['Example', 'Classification', 'In short'].map((h) => <th key={h} className="label" style={{ padding: '12px 14px', borderBottom: '1px solid var(--line)' }}>{h}</th>)}</tr></thead>
            <tbody>
              {LABS.map((l) => {
                const e = fwEntry(f.id, l.id);
                const c = f.cats.find((x) => x.id === e.cat)!;
                return (
                  <tr key={l.id}>
                    <td style={{ padding: '11px 14px', borderTop: '1px solid var(--line)', verticalAlign: 'top' }}><a href={url(`/model/${l.id}`)}>{l.app}</a><div className="dim small">{l.model}</div></td>
                    <td style={{ padding: '11px 14px', borderTop: '1px solid var(--line)', whiteSpace: 'nowrap', verticalAlign: 'top' }}><span className="tag"><span className="swatch" style={{ background: c.color }} />{c.label}</span></td>
                    <td style={{ padding: '11px 14px', borderTop: '1px solid var(--line)', verticalAlign: 'top' }} className="muted small">{e.summary.split('. ')[0]}.</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <style>{'@media (max-width: 760px){.other-row{grid-template-columns:minmax(0,1fr) !important; gap:4px !important}}'}</style>
    </div>
  );
}
