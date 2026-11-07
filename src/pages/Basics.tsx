import { SEV } from '../data/palette';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { LABS } from '../data/labs';
import { STAGES } from '../data/risks'; // eslint-disable-line
import type { LabDef, Stage } from '../data/types';
import { prefersReducedMotion, url } from '../lib/util';
import { Breadcrumbs, Toc } from '../components/Nav';
import { Term } from '../components/Term';
import { GLOSSARY } from '../data/glossary';
import { FRAMEWORKS } from '../data/frameworks';
import { RISKS, TIERS } from '../data/risks';
import { SHORT_NAME } from '../data/shortNames';

const PIPE = [
  { t: 'Data', d: 'Past examples, e.g. 10 years of loan applications and whether each was repaid' },
  { t: 'Training', d: 'The algorithm searches for patterns that link inputs to outcomes' },
  { t: 'Model', d: 'The learned patterns, stored as numbers (weights, rules, trees)' },
  { t: 'Prediction', d: 'For a new case, the model produces a score, label or text' },
  { t: 'Decision', d: 'A person or system acts on it: approve, reject, send, book' },
];
/** where each lifecycle stage's risk enters the pipeline */
const STAGE_NODE: Record<Stage, number> = { data: 0, design: 1, validate: 2, monitor: 3, deploy: 4 };

/** three safeguards for a stage, each from a different example */
function safeguardsFor(stage: Stage) {
  const seen = new Set<string>();
  const out: { lab: LabDef; label: string; desc: string }[] = [];
  for (const tier of ['classical', 'deep', 'genai', 'agentic']) {
    for (const l of LABS.filter((x) => x.tier === tier)) {
      const m = l.mitigations.find((x) => x.stage === stage);
      if (m && !seen.has(l.id)) { out.push({ lab: l, label: m.label, desc: m.desc }); seen.add(l.id); break; }
    }
  }
  return out.slice(0, 3);
}

function Pipeline() {
  const [stage, setStage] = useState<Stage | null>(null);
  const [still, setStill] = useState(true);
  useEffect(() => { setStill(prefersReducedMotion()); }, []);
  const hot = stage ? STAGE_NODE[stage] : -1;
  const row = stage ? STAGE_ROWS[STAGES.findIndex((x) => x.id === stage)] : null;
  const path = 'M95,85 L295,85 L495,85 L695,85 L895,85';
  return (
    <div>
      <div className="scroll-x" tabIndex={0} role="region" aria-label="Pipeline diagram, scrolls sideways" style={{ marginTop: 24 }}>
        <div style={{ minWidth: 760 }}>
          <svg viewBox="0 0 1000 170" className="viz-svg" role="img" aria-label={`Data, training, model, prediction, decision${stage ? `. Risk from the ${row?.s.toLowerCase()} stage enters at ${PIPE[hot].t.toLowerCase()}.` : ''}`}>
            <defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker></defs>
            {PIPE.map((p, i) => {
              const x = 10 + i * 200;
              const on = i === hot;
              return (
                <g key={p.t}>
                  <rect x={x} y={10} width={170} height={150} rx={12} fill={on ? 'rgba(224,113,107,.1)' : 'var(--paper)'} stroke={on ? SEV.severe : 'var(--line2)'} strokeWidth={on ? 2 : 1} style={{ transition: 'all .3s' }} />
                  {on && !still && (
                    <rect x={x} y={10} width={170} height={150} rx={12} fill="none" stroke="#e0716b" strokeWidth="2">
                      <animate attributeName="opacity" values="0.9;0;0.9" dur="1.6s" repeatCount="indefinite" />
                      <animate attributeName="stroke-width" values="2;10;2" dur="1.6s" repeatCount="indefinite" />
                    </rect>
                  )}
                  <text x={x + 14} y={38} fontSize="17" fontWeight={600} fill="var(--ink)" fontFamily="Sora Variable, Sora, sans-serif">{i + 1}. {p.t}</text>
                  <foreignObject x={x + 12} y={50} width={148} height={105}>
                    <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.4, fontFamily: 'Manrope Variable, Manrope, sans-serif' }}>{p.d}</div>
                  </foreignObject>
                  {i < PIPE.length - 1 && <line x1={x + 172} y1={85} x2={x + 198} y2={85} stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arr)" />}
                </g>
              );
            })}
            {/* particles travelling through the pipeline */}
            {[0, 1, 2, 3, 4, 5].map((k) => (
              still
                ? <circle key={k} cx={182 + (k % 4) * 200} cy={85} r={3} fill="var(--accent)" opacity={0.7} />
                : (
                  <circle key={k} r={3.2} fill={hot >= 0 ? SEV.severe : 'var(--accent)'}>
                    <animateMotion dur="4.2s" begin={`${k * 0.7}s`} repeatCount="indefinite" path={path} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
                    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.9;1" dur="4.2s" begin={`${k * 0.7}s`} repeatCount="indefinite" />
                  </circle>
                )
            ))}
          </svg>
        </div>
      </div>
      <div className="stage-btns" role="group" aria-label="Show where risk enters">
        <span className="small muted">Where does risk enter?</span>
        {STAGES.map((st) => (
          <button key={st.id} className={`chip-btn ${stage === st.id ? 'on bad' : ''}`} aria-pressed={stage === st.id} onClick={() => setStage(stage === st.id ? null : st.id)}>{st.label}</button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {stage && row && (
          <motion.div key={stage} className="card card-pad stage-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }} aria-live="polite">
            <div className="grid2" style={{ gap: 20 }}>
              <div className="stack">
                <div className="label" style={{ color: '#e0716b' }}>{row.s} stage · enters at “{PIPE[hot].t}”</div>
                <p>{row.what}</p>
                <p className="muted small"><b>Example:</b> {row.ex}</p>
                <p className="small"><b>Typical safeguard:</b> {row.fix}</p>
              </div>
              <div>
                <div className="label">Safeguards you can try at this stage</div>
                <ul className="stage-sg">
                  {safeguardsFor(stage).map((g) => (
                    <li key={g.lab.id}><a href={url(`/model/${g.lab.id}`)}><b>{g.label}</b></a><span className="muted small"> · {g.lab.app}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const STAGE_ROWS = [
  { s: 'Data', what: 'The training data is biased, incomplete, outdated or collected without permission.', ex: 'Historic pay data with a gender gap; skin images mostly of light skin.', fix: 'Check data for gaps and bias, document where it came from, remove what is not needed.' },
  { s: 'Design', what: 'The model optimises the wrong goal, uses proxy features, or is given too much power.', ex: 'A pricing agent rewarded on revenue alone; an agent with an unlimited company card.', fix: 'Choose objectives and features deliberately; give systems only the access they need.' },
  { s: 'Testing', what: 'Problems are not found because the tests looked at the wrong thing.', ex: 'A fraud model that is "99% accurate" but catches 1% of fraud.', fix: 'Test with the right metrics, across groups, and try to break the system on purpose.' },
  { s: 'Deployment', what: 'The output is trusted blindly or used for something it was not built for.', ex: 'Automatic rejections with no human review; a forecast used without a safety buffer.', fix: 'Keep people in charge of important decisions; tell people when AI is used.' },
  { s: 'Monitoring', what: 'The world changes, or attackers adapt, and nobody notices.', ex: 'A recession, a new scam, a pandemic, poisoned documents.', fix: 'Watch performance, set alerts, keep a way to stop or roll back the system.' },
];

const BASIC_TERMS = ['provider', 'deployer', 'high-risk', 'human-oversight', 'proxy', 'drift', 'threshold', 'hallucination', 'prompt-injection', 'red-teaming', 'impact-assessment', 'agent'];

const BASICS_TOC = [
  { id: 'm1', label: 'What a model is' },
  { id: 'm2', label: 'Four families' },
  { id: 'm3', label: 'Where things go wrong' },
  { id: 'm4', label: 'Kinds of harm' },
  { id: 'm5', label: 'Laws and standards' },
  { id: 'm6', label: 'Using this site' },
  { id: 'm8', label: 'Workshop' },
  { id: 'm7', label: 'Glossary' },
];

export function Basics() {
  return (
    <div className="with-rail">
      <Toc items={BASICS_TOC} />
      <div className="rail-main">
      <section className="wrap" style={{ padding: '30px 0 10px' }}>
        <div className="narrow stack">
          <Breadcrumbs trail={[{ label: 'Learn' }, { label: 'The basics' }]} />
          <h1>The basics</h1>
          <p className="lead">A short guide to how AI models work, where their risks come from, and how rules and frameworks deal with them. It takes about ten minutes to read, and every section links to working examples.</p>
        </div>
      </section>

      <section className="wrap section" id="m1">
        <div className="narrow stack">
          <h2>1. What a machine learning model is</h2>
          <p>A traditional program follows rules a person wrote. A machine learning model writes its own rules by finding patterns in examples. Show it thousands of past loan applications and whether each loan was repaid, and it learns which combinations of income, debt and history tend to go with repayment. Given a new application, it produces a score.</p>
          <p>That is both the strength and the weakness. The model learns whatever patterns are in the data, including unfair ones and accidental ones, and it has no idea when the world has changed since it was trained: the problem known as <Term id="drift">drift</Term>.</p>
        </div>
        <Pipeline />
      </section>

      <section className="wrap section" id="m2">
        <div className="narrow stack">
          <h2>2. Four families of AI</h2>
          <p>This site groups models into four families. Moving from the first to the last, systems become more capable and more independent. They also fail in more ways, because the risks of the earlier families do not go away: a biased score becomes a biased decision, and then a biased action taken without anyone checking.</p>
        </div>
        <div className="grid2" style={{ marginTop: 20 }}>
          {TIERS.map((t) => (
            <div key={t.id} className="card card-pad" style={{ borderInlineStart: `4px solid ${t.color}` }}>
              <h3>{t.label}</h3>
              <p className="muted" style={{ marginTop: 6 }}>{t.tagline}</p>
              <p className="small" style={{ marginTop: 10 }}>
                Examples: {LABS.filter((l) => l.tier === t.id).map((l, i) => <span key={l.id}>{i ? ', ' : ''}<a href={url(`/model/${l.id}`)}>{SHORT_NAME[l.id]}</a></span>)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap section" id="m3">
        <div className="narrow stack">
          <h2>3. Where things go wrong</h2>
          <p>Risk can enter at every stage of a system’s life. Each safeguard in the simulations is tagged to one of these stages.</p>
        </div>
        <div className="card" tabIndex={0} role="region" aria-label="Risk stages table, scrolls sideways" style={{ marginTop: 20, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, minWidth: 760 }}>
            <thead><tr style={{ textAlign: 'start' }}>{['Stage', 'What goes wrong', 'Example', 'Typical safeguard'].map((h) => <th key={h} className="label" style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)' }}>{h}</th>)}</tr></thead>
            <tbody>
              {STAGE_ROWS.map((r) => (
                <tr key={r.s}>
                  <td style={{ padding: '12px 16px', borderTop: '1px solid var(--line)', fontWeight: 600 }}>{r.s}</td>
                  <td style={{ padding: '12px 16px', borderTop: '1px solid var(--line)' }}>{r.what}</td>
                  <td style={{ padding: '12px 16px', borderTop: '1px solid var(--line)' }} className="muted">{r.ex}</td>
                  <td style={{ padding: '12px 16px', borderTop: '1px solid var(--line)' }}>{r.fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="wrap section" id="m4">
        <div className="narrow stack">
          <h2>4. Eight kinds of harm</h2>
          <p>Different frameworks use different words, but they describe roughly the same harms. This site uses these eight, and each example shows which ones it touches.</p>
        </div>
        <div className="grid2" style={{ marginTop: 20 }}>
          {RISKS.map((r) => (
            <div key={r.key} style={{ display: 'grid', gridTemplateColumns: '12px 1fr', gap: 12 }}>
              <span className="swatch" style={{ background: r.color, marginTop: 7 }} />
              <div><b>{r.label}</b><p className="muted small">{r.desc}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap section" id="m5">
        <div className="narrow stack">
          <h2>5. Laws, standards and security guides</h2>
          <p><b>Laws</b> such as the EU AI Act and GDPR are binding where they apply and come with penalties. The EU AI Act sorts uses into categories such as <Term id="high-risk">high-risk</Term>. <b>Frameworks and standards</b> such as the NIST AI RMF and ISO/IEC 42001 are voluntary, but they describe recognised good practice, and ISO/IEC 42001 can be certified. <b>Security guides</b> such as the OWASP lists describe how attackers actually break AI systems.</p>
          <p>They ask different questions. The EU AI Act and Korea’s AI Basic Act ask <i>what is this used for?</i> China’s rules ask <i>what kind of service is offered to the public?</i> Singapore asks <i>how much should a human be involved?</i> GDPR asks <i>whose data is this?</i> NIST asks <i>which qualities of a trustworthy system are at stake?</i> ISO asks <i>is the organisation managing AI consistently?</i> OWASP asks <i>how could someone attack it?</i></p>
        </div>
        <div className="grid3" style={{ marginTop: 20 }}>
          {FRAMEWORKS.map((f) => (
            <a key={f.id} href={url(`/rules/${f.id}`)} className="card card-pad lift" style={{ color: 'inherit', display: 'block' }}>
              <div className="label">{f.type}</div>
              <h3 style={{ marginTop: 4 }}>{f.short}</h3>
              <p className="muted small" style={{ marginTop: 6 }}>{f.approach.split('. ')[0]}.</p>
            </a>
          ))}
        </div>
      </section>

      <section className="wrap section" id="m6">
        <div className="narrow stack">
          <h2>6. How to use this site</h2>
          <ol style={{ paddingInlineStart: 20, margin: 0 }} className="stack">
            <li><b>Pick an example</b> from the <a href={url('/')}>overview</a>. Each one pairs a model with a realistic use.</li>
            <li><b>Read the situation.</b> It explains what the organisation wants and who is affected.</li>
            <li><b>Switch on a problem</b> in the simulation and watch what changes. Problems are labelled as design choices, real-world changes or attacks.</li>
            <li><b>Switch on a safeguard</b> to see whether it fixes the problem. The summary below the simulation tells you what is still unhandled.</li>
            <li><b>Check how the rules apply.</b> Each framework’s requirements are listed, with the safeguards in the simulation that meet them.</li>
            <li><b>Change the view.</b> Use “View through” at the top to see the whole site from one framework’s point of view, then follow that framework’s learning path in its guide.</li>
            <li><b>Compare.</b> The Compare page shows how all the frameworks answer the same question, such as transparency or human oversight.</li>
          </ol>
        </div>
      </section>

      <section className="wrap section" id="m8">
        <div className="narrow stack">
          <h2>Running a 60-minute workshop</h2>
          <p>A format for mixed groups of managers, lawyers and engineers. You need a screen and, ideally, laptops in small groups. The <a href={url('/workshop')}>workshop slides</a> have the same plan with learning objectives and notes for the facilitator.</p>
        </div>
        <div className="grid3" style={{ marginTop: 20 }}>
          {([
            ['0–10 min', 'Warm-up', 'Open the home page. Ask the group to place three AI systems they use at work on the rings. Read section 2 of this page together.', null],
            ['10–25 min', 'Break and fix', 'In groups, open Credit scoring with the postcode problem already on. Watch approvals change, then find the safeguard. Each group reports one surprise.', { to: '/model/credit?p=zip', l: 'Open the credit scenario' }],
            ['25–40 min', 'One framework', 'Set “View through” to the framework that matters most to you. Follow the first four steps of its learning path.', { to: '/rules', l: 'Choose a framework' }],
            ['40–50 min', 'Compare', 'Open Compare and pick Transparency. Ask: where would we be compliant in one country and not another?', { to: '/compare', l: 'Open Compare' }],
            ['50–55 min', 'The hard case', 'Open Emotion recognition with staff scoring switched on. Discuss: what do you do when no safeguard works?', { to: '/model/emotion?p=rank', l: 'Open the hard case' }],
            ['55–60 min', 'Take away', 'Each person names one system at work, its likely category, and one safeguard they would check on Monday.', null],
          ] as [string, string, string, { to: string; l: string } | null][]).map(([time, t, d, link]) => (
            <div key={t} className="card card-pad">
              <div className="mono accent small">{time}</div>
              <h3 style={{ marginTop: 4 }}>{t}</h3>
              <p className="muted small" style={{ marginTop: 6 }}>{d}</p>
              {link && <p className="small" style={{ marginTop: 8 }}><a href={url(link.to)}>{link.l} →</a></p>}
            </div>
          ))}
        </div>
      </section>

      <section className="wrap section" id="m7">
        <h2>7. Glossary</h2>
        <p className="muted" style={{ marginTop: 6 }}>A few of the terms used most. The full <a href={url('/glossary')}>glossary</a> has {GLOSSARY.length}.</p>
        <div className="grid2" style={{ marginTop: 18 }}>
          {GLOSSARY.filter((g) => BASIC_TERMS.includes(g.id)).map((g) => (
            <div key={g.id}><b><a href={url(`/glossary#${g.id}`)} style={{ color: 'inherit' }}>{g.term}</a></b><p className="muted small" style={{ marginTop: 2 }}>{g.def}</p></div>
          ))}
        </div>
      </section>
      </div>
    </div>
  );
}
