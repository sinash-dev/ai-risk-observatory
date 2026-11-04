import { FRAMEWORKS } from '../data/frameworks';
import { LABS } from '../data/labs';
import { RISKS, TIERS } from '../data/risks';
import { SHORT_NAME } from './Home';

function Pipeline() {
  const steps = [
    { t: 'Data', d: 'Past examples, e.g. 10 years of loan applications and whether each was repaid' },
    { t: 'Training', d: 'The algorithm searches for patterns that link inputs to outcomes' },
    { t: 'Model', d: 'The learned patterns, stored as numbers (weights, rules, trees)' },
    { t: 'Prediction', d: 'For a new case, the model produces a score, label or text' },
    { t: 'Decision', d: 'A person or system acts on it: approve, reject, send, book' },
  ];
  return (
    <svg viewBox="0 0 1000 170" className="viz-svg" role="img" aria-label="Data, training, model, prediction, decision">
      <defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#6cc5b0" /></marker></defs>
      {steps.map((s, i) => {
        const x = 10 + i * 200;
        return (
          <g key={s.t}>
            <rect x={x} y={10} width={170} height={150} rx={12} fill="#14171c" stroke="rgba(255,255,255,.12)" />
            <text x={x + 14} y={38} fontSize="17" fontWeight={600} fill="#eceef1" fontFamily="Sora, sans-serif">{i + 1}. {s.t}</text>
            <foreignObject x={x + 12} y={50} width={148} height={105}>
              <div style={{ fontSize: 13, color: '#9298a3', lineHeight: 1.4, fontFamily: 'Manrope, sans-serif' }}>{s.d}</div>
            </foreignObject>
            {i < steps.length - 1 && <line x1={x + 172} y1={85} x2={x + 198} y2={85} stroke="#6cc5b0" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arr)" />}
          </g>
        );
      })}
    </svg>
  );
}

const STAGE_ROWS = [
  { s: 'Data', what: 'The training data is biased, incomplete, outdated or collected without permission.', ex: 'Historic pay data with a gender gap; skin images mostly of light skin.', fix: 'Check data for gaps and bias, document where it came from, remove what is not needed.' },
  { s: 'Design', what: 'The model optimises the wrong goal, uses proxy features, or is given too much power.', ex: 'A pricing agent rewarded on revenue alone; an agent with an unlimited company card.', fix: 'Choose objectives and features deliberately; give systems only the access they need.' },
  { s: 'Testing', what: 'Problems are not found because the tests looked at the wrong thing.', ex: 'A fraud model that is "99% accurate" but catches 1% of fraud.', fix: 'Test with the right metrics, across groups, and try to break the system on purpose.' },
  { s: 'Deployment', what: 'The output is trusted blindly or used for something it was not built for.', ex: 'Automatic rejections with no human review; a forecast used without a safety buffer.', fix: 'Keep people in charge of important decisions; tell people when AI is used.' },
  { s: 'Monitoring', what: 'The world changes, or attackers adapt, and nobody notices.', ex: 'A recession, a new scam, a pandemic, poisoned documents.', fix: 'Watch performance, set alerts, keep a way to stop or roll back the system.' },
];

const GLOSSARY: [string, string][] = [
  ['Provider and deployer', 'In the EU AI Act, the provider builds an AI system and puts it on the market; the deployer is the organisation that uses it. They have different duties.'],
  ['High-risk', 'In the EU AI Act, a use listed in the law (such as hiring or credit) that must meet strict requirements. It describes the use, not the technology.'],
  ['Human oversight', 'Arrangements that let trained people understand an AI system’s output, overrule it and stop it.'],
  ['Proxy', 'A feature that stands in for a protected trait, such as a postcode that closely tracks ethnicity.'],
  ['Drift', 'When the data a model sees in use starts to differ from the data it was trained on, so its performance quietly drops.'],
  ['Threshold', 'The cut-off that turns a score into a decision, such as "approve if the probability of repayment is above 0.5". Moving it changes who is affected.'],
  ['Hallucination (confabulation)', 'When a generative model produces fluent, confident content that is false.'],
  ['Prompt injection', 'Hiding instructions in text a model reads (a message, web page or document) so it does something its owner did not intend.'],
  ['Red-teaming', 'Deliberately trying to make a system fail or misbehave before attackers or users do.'],
  ['Impact assessment', 'A structured look at how a system could affect people and society before it is used. GDPR calls one a DPIA; the EU AI Act requires a fundamental-rights impact assessment in some cases.'],
  ['General-purpose AI model', 'A model, such as a large language model, that can be used for many different tasks. The EU AI Act sets duties for the companies that develop them.'],
  ['Agent', 'An AI system that plans and takes actions with tools, such as sending emails or making payments, with limited human input.'],
];

export function Basics() {
  return (
    <div>
      <section className="wrap" style={{ padding: '40px 0 10px' }}>
        <div className="narrow stack">
          <h1>The basics</h1>
          <p className="lead">A short guide to how AI models work, where their risks come from, and how rules and frameworks deal with them. It takes about ten minutes to read, and every section links to working examples.</p>
          <ol className="muted" style={{ paddingLeft: 20, margin: 0 }}>
            <li><a href="#/basics" onClick={(e) => { e.preventDefault(); document.getElementById('m1')?.scrollIntoView({ behavior: 'smooth' }); }}>What a machine learning model is</a></li>
            <li><a href="#/basics" onClick={(e) => { e.preventDefault(); document.getElementById('m2')?.scrollIntoView({ behavior: 'smooth' }); }}>Four families of AI</a></li>
            <li><a href="#/basics" onClick={(e) => { e.preventDefault(); document.getElementById('m3')?.scrollIntoView({ behavior: 'smooth' }); }}>Where things go wrong</a></li>
            <li><a href="#/basics" onClick={(e) => { e.preventDefault(); document.getElementById('m4')?.scrollIntoView({ behavior: 'smooth' }); }}>Eight kinds of harm</a></li>
            <li><a href="#/basics" onClick={(e) => { e.preventDefault(); document.getElementById('m5')?.scrollIntoView({ behavior: 'smooth' }); }}>Laws, standards and security guides</a></li>
            <li><a href="#/basics" onClick={(e) => { e.preventDefault(); document.getElementById('m6')?.scrollIntoView({ behavior: 'smooth' }); }}>How to use this site</a></li>
            <li><a href="#/basics" onClick={(e) => { e.preventDefault(); document.getElementById('m8')?.scrollIntoView({ behavior: 'smooth' }); }}>Running a 60-minute workshop</a></li>
            <li><a href="#/basics" onClick={(e) => { e.preventDefault(); document.getElementById('m7')?.scrollIntoView({ behavior: 'smooth' }); }}>Glossary</a></li>
          </ol>
        </div>
      </section>

      <section className="wrap section" id="m1">
        <div className="narrow stack">
          <h2>1. What a machine learning model is</h2>
          <p>A traditional program follows rules a person wrote. A machine learning model writes its own rules by finding patterns in examples. Show it thousands of past loan applications and whether each loan was repaid, and it learns which combinations of income, debt and history tend to go with repayment. Given a new application, it produces a score.</p>
          <p>That is both the strength and the weakness. The model learns whatever patterns are in the data, including unfair ones and accidental ones, and it has no idea when the world has changed since it was trained.</p>
        </div>
        <div className="scroll-x" style={{ marginTop: 24 }}><div style={{ minWidth: 760 }}><Pipeline /></div></div>
      </section>

      <section className="wrap section" id="m2">
        <div className="narrow stack">
          <h2>2. Four families of AI</h2>
          <p>This site groups models into four families. Moving from the first to the last, systems become more capable and more independent. They also fail in more ways, because the risks of the earlier families do not go away: a biased score becomes a biased decision, and then a biased action taken without anyone checking.</p>
        </div>
        <div className="grid2" style={{ marginTop: 20 }}>
          {TIERS.map((t) => (
            <div key={t.id} className="card card-pad" style={{ borderLeft: `4px solid ${t.color}` }}>
              <h3>{t.label}</h3>
              <p className="muted" style={{ marginTop: 6 }}>{t.tagline}</p>
              <p className="small" style={{ marginTop: 10 }}>
                Examples: {LABS.filter((l) => l.tier === t.id).map((l, i) => <span key={l.id}>{i ? ', ' : ''}<a href={`#/model/${l.id}`}>{SHORT_NAME[l.id]}</a></span>)}
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
        <div className="card" style={{ marginTop: 20, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, minWidth: 760 }}>
            <thead><tr style={{ textAlign: 'left' }}>{['Stage', 'What goes wrong', 'Example', 'Typical safeguard'].map((h) => <th key={h} className="label" style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)' }}>{h}</th>)}</tr></thead>
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
          <p><b>Laws</b> such as the EU AI Act and GDPR are binding where they apply and come with penalties. <b>Frameworks and standards</b> such as the NIST AI RMF and ISO/IEC 42001 are voluntary, but they describe recognised good practice, and ISO/IEC 42001 can be certified. <b>Security guides</b> such as the OWASP lists describe how attackers actually break AI systems.</p>
          <p>They ask different questions. The EU AI Act and Korea’s AI Basic Act ask <i>what is this used for?</i> China’s rules ask <i>what kind of service is offered to the public?</i> Singapore asks <i>how much should a human be involved?</i> GDPR asks <i>whose data is this?</i> NIST asks <i>which qualities of a trustworthy system are at stake?</i> ISO asks <i>is the organisation managing AI consistently?</i> OWASP asks <i>how could someone attack it?</i></p>
        </div>
        <div className="grid3" style={{ marginTop: 20 }}>
          {FRAMEWORKS.map((f) => (
            <a key={f.id} href={`#/rules/${f.id}`} className="card card-pad lift" style={{ color: 'inherit', display: 'block' }}>
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
          <ol style={{ paddingLeft: 20, margin: 0 }} className="stack">
            <li><b>Pick an example</b> from the <a href="#/">overview</a>. Each one pairs a model with a realistic use.</li>
            <li><b>Read the situation.</b> It explains what the organisation wants and who is affected.</li>
            <li><b>Switch on a problem</b> in the simulation and watch what changes. Problems are labelled as design choices, real-world changes or attacks.</li>
            <li><b>Switch on a safeguard</b> to see whether it fixes the problem. The summary below the simulation tells you what is still unhandled.</li>
            <li><b>Check how the rules apply.</b> Each framework’s requirements are listed, with the safeguards in the simulation that meet them.</li>
            <li><b>Change the view.</b> Use “View through” at the top to see the whole site from one framework’s point of view, then follow that framework’s learning path in its guide.</li>
            <li><b>Compare.</b> The Compare page shows how all ten frameworks answer the same question, such as transparency or human oversight.</li>
          </ol>
        </div>
      </section>

      <section className="wrap section" id="m8">
        <div className="narrow stack">
          <h2>Running a 60-minute workshop</h2>
          <p>A format that has worked well for mixed groups of managers, lawyers and engineers. You need a screen and, ideally, laptops in small groups.</p>
        </div>
        <div className="grid3" style={{ marginTop: 20 }}>
          {[
            ['0–10 min', 'Warm-up', 'Open the home page. Ask the group to place three AI systems they use at work on the rings. Read section 2 of this page together.'],
            ['10–25 min', 'Break and fix', 'In groups, open Credit scoring. Switch on the postcode problem, watch approvals change, then find the safeguard. Each group reports one surprise.'],
            ['25–40 min', 'One framework', 'Set “View through” to the framework that matters most to you. Follow the first four steps of its learning path.'],
            ['40–50 min', 'Compare', 'Open Compare and pick Transparency. Ask: where would we be compliant in one country and not another?'],
            ['50–55 min', 'The hard case', 'Open Emotion recognition. Discuss: what do you do when no safeguard works?'],
            ['55–60 min', 'Take away', 'Each person names one system at work, its likely category, and one safeguard they would check on Monday.'],
          ].map(([time, t, d]) => (
            <div key={t} className="card card-pad">
              <div className="mono accent small">{time}</div>
              <h3 style={{ marginTop: 4 }}>{t}</h3>
              <p className="muted small" style={{ marginTop: 6 }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap section" id="m7">
        <h2>7. Glossary</h2>
        <div className="grid2" style={{ marginTop: 18 }}>
          {GLOSSARY.map(([t, d]) => (
            <div key={t}><b>{t}</b><p className="muted small" style={{ marginTop: 2 }}>{d}</p></div>
          ))}
        </div>
      </section>
    </div>
  );
}
