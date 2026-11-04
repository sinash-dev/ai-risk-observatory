import { FRAMEWORKS, FW_BY_ID, OTHER_FRAMEWORKS, type FwId } from '../data/frameworks';
import { LABS, fwEntry } from '../data/labs';
import { setLens, useLens } from '../lib/lens';
import { go } from '../lib/util';

const SORTS: Record<FwId, string> = {
  eu: 'By risk of the use: banned, high-risk, transparency, minimal',
  us: 'By sector and state; no single classification',
  nist: 'Does not classify; looks at trustworthiness qualities',
  iso: 'Does not classify; scales controls to impact',
  owasp: 'By type of system: ML, LLM application, agent',
  gdpr: 'By how personal data is used, with extra rules for sensitive data and automated decisions',
};

export function Frameworks() {
  return (
    <div className="wrap" style={{ padding: '40px 0' }}>
      <div className="narrow stack">
        <h1>Rules and frameworks</h1>
        <p className="lead">There is no single rulebook for AI. Laws set binding duties in a particular place. Standards and frameworks describe good practice and help you organise the work. Security lists describe how systems actually get attacked. Most organisations use several at once.</p>
      </div>

      <div className="card" style={{ marginTop: 28, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, minWidth: 760 }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              {['Framework', 'Type', 'Where', 'Binding?', 'How it sorts AI systems'].map((h) => <th key={h} className="label" style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {FRAMEWORKS.map((f) => (
              <tr key={f.id} onClick={() => go(`/rules/${f.id}`)} style={{ cursor: 'pointer' }}>
                <td style={{ padding: '14px 16px', borderTop: '1px solid var(--line)', fontWeight: 600 }}><a href={`#/rules/${f.id}`}>{f.name}</a></td>
                <td style={{ padding: '14px 16px', borderTop: '1px solid var(--line)' }}>{f.type}</td>
                <td style={{ padding: '14px 16px', borderTop: '1px solid var(--line)' }}>{f.where}</td>
                <td style={{ padding: '14px 16px', borderTop: '1px solid var(--line)' }}>{f.binding}</td>
                <td style={{ padding: '14px 16px', borderTop: '1px solid var(--line)' }} className="muted">{SORTS[f.id]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="section">
        <div className="grid2">
          <div className="stack">
            <h2>How they fit together</h2>
            <p>A typical European company might use all six. <b>GDPR</b> and the <b>EU AI Act</b> say what it must legally do. <b>ISO/IEC 42001</b> is the management system it runs to do that consistently, and can be certified. The <b>NIST AI RMF</b> is a practical method for analysing each system’s risks. <b>OWASP</b> is what the security team tests against. A company selling in the US adds the relevant <b>US federal and state laws</b> for each use.</p>
            <p className="muted">The laws overlap in places. The EU AI Act, for example, says that a high-risk system’s data must be examined for bias, while GDPR governs whether the personal data can be used at all.</p>
          </div>
          <div className="stack">
            <h2>Reading the site through one framework</h2>
            <p>Use the <b>View through</b> menu at the top of every page. The overview map is recoloured by that framework’s categories, and each example shows only that framework’s requirements, linked to the safeguards in its simulation.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>The six frameworks covered in detail</h2>
        <div className="grid3" style={{ marginTop: 20 }}>
          {FRAMEWORKS.map((f) => (
            <div key={f.id} className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="label">{f.type} · {f.where}</div>
              <h3>{f.name}</h3>
              <p className="muted small" style={{ flex: 1 }}>{f.intro.split('. ').slice(0, 2).join('. ')}.</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a className="btn btn-primary" href={`#/rules/${f.id}`}>Read the guide</a>
                <button className="btn" onClick={() => { setLens(f.id); go('/'); }}>View all models through it</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Other frameworks worth knowing</h2>
        <p className="muted" style={{ marginTop: 6 }}>Not covered in the simulations, but often relevant depending on where you operate and what sector you are in.</p>
        <div className="card" style={{ marginTop: 18 }}>
          {OTHER_FRAMEWORKS.map((o, i) => (
            <div key={o.name} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,2fr)', gap: 20, padding: '14px 18px', borderTop: i ? '1px solid var(--line)' : 'none' }} className="other-row">
              <div>
                <div style={{ fontWeight: 600 }}>{o.name}</div>
                <div className="dim small">{o.where} · {o.type}</div>
              </div>
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
  if (!f) return <div className="wrap section"><h1>Not found</h1><p><a href="#/rules">All frameworks</a></p></div>;
  return (
    <div className="wrap" style={{ padding: '30px 0 40px' }}>
      <div className="crumbs"><a href="#/rules">Rules and frameworks</a> / {f.short}</div>
      <div className="narrow stack" style={{ marginTop: 10 }}>
        <h1>{f.name}</h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="tag">{f.type}</span><span className="tag">{f.where}</span><span className="tag">{f.binding}</span>
        </div>
        <p className="lead">{f.intro}</p>
        <div>
          {lens === f.id
            ? <span className="muted small">You are viewing the whole site through the {f.short}. <a href="#" onClick={(e) => { e.preventDefault(); setLens('all'); }}>Switch back to all frameworks</a></span>
            : <button className="btn btn-primary" onClick={() => { setLens(f.id); go('/'); }}>View all models through the {f.short}</button>}
        </div>
      </div>

      <section className="section">
        <div className="grid2">
          <div className="stack"><h2>Who it applies to</h2><p>{f.who}</p></div>
          <div className="stack"><h2>How it works</h2><p>{f.approach}</p></div>
        </div>
      </section>

      <section className="section">
        <h2>{f.catsTitle}</h2>
        <div className="grid3" style={{ marginTop: 18 }}>
          {f.cats.map((c) => {
            const labs = LABS.filter((l) => fwEntry(f.id, l.id).cat === c.id);
            return (
              <div key={c.id} className="card" style={{ borderTop: `4px solid ${c.color}` }}>
                <div className="card-pad stack" style={{ paddingBottom: 16 }}>
                  <h3>{c.label}</h3>
                  <p className="muted small">{c.desc}</p>
                  {labs.length > 0 && (
                    <div className="small">
                      <div className="label" style={{ marginBottom: 4 }}>Examples on this site</div>
                      {labs.map((l, i) => <span key={l.id}>{i ? ', ' : ''}<a href={`#/model/${l.id}`}>{l.app}</a></span>)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section">
        <h2>{f.keyTitle}</h2>
        <div className="card" style={{ marginTop: 18 }}>
          {f.keyReqs.map((k, i) => (
            <div key={k.t} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,2fr)', gap: 20, padding: '14px 18px', borderTop: i ? '1px solid var(--line)' : 'none' }} className="other-row">
              <div style={{ fontWeight: 600 }}>{k.t}</div>
              <p className="muted">{k.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="grid2">
          <div>
            <h2>Timeline</h2>
            <div style={{ marginTop: 16, borderLeft: '2px solid var(--line2)', paddingLeft: 18 }}>
              {f.timeline.map((t) => (
                <div key={t.date + t.text} style={{ position: 'relative', paddingBottom: 14 }}>
                  <span style={{ position: 'absolute', left: -25, top: 7, width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)' }} />
                  <div className="mono small" style={{ color: 'var(--accent)' }}>{t.date}</div>
                  <div>{t.text}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="stack">
            <h2>Penalties</h2>
            <p>{f.penalties}</p>
            <div className="small">
              <div className="label" style={{ marginBottom: 4 }}>Official sources</div>
              {f.sources.map((s) => <div key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label} ↗</a></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>How it treats each example on this site</h2>
        <div className="card" style={{ marginTop: 18, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14.5, minWidth: 720 }}>
            <thead>
              <tr style={{ textAlign: 'left' }}>
                {['Example', 'Model', 'Classification', 'Main requirement'].map((h) => <th key={h} className="label" style={{ padding: '12px 14px', borderBottom: '1px solid var(--line)' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {LABS.map((l) => {
                const e = fwEntry(f.id, l.id);
                const c = f.cats.find((x) => x.id === e.cat)!;
                return (
                  <tr key={l.id}>
                    <td style={{ padding: '11px 14px', borderTop: '1px solid var(--line)' }}><a href={`#/model/${l.id}`}>{l.app}</a></td>
                    <td style={{ padding: '11px 14px', borderTop: '1px solid var(--line)' }} className="muted">{l.model}</td>
                    <td style={{ padding: '11px 14px', borderTop: '1px solid var(--line)', whiteSpace: 'nowrap' }}><span className="tag"><span className="swatch" style={{ background: c.color }} />{c.label}</span></td>
                    <td style={{ padding: '11px 14px', borderTop: '1px solid var(--line)' }} className="small">{e.reqs[0]?.[0]} <span className="dim mono">{e.reqs[0]?.[1]}</span></td>
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
