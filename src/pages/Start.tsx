import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Breadcrumbs } from '../components/Nav';
import { setLens } from '../lib/lens';
import { url } from '../lib/util';

interface Step { t: string; d: string; to: string; lens?: 'eu' }
interface Audience { id: string; short: string; title: string; who: string; get: string; steps: Step[] }

export const AUDIENCES: Audience[] = [
  {
    id: 'compliance',
    short: 'Compliance',
    title: 'You look after compliance',
    who: 'Compliance, privacy, risk or legal staff, often the person who has just been told “you own AI now”.',
    get: 'A clear view of which rules apply to each AI system you use, what to do next, and documents you can adapt.',
    steps: [
      { t: 'List your AI systems', d: 'Add each system to your register, answer a few questions and get its category under each framework. It stays in your browser.', to: '/register' },
      { t: 'Check one system in depth', d: 'Run the classification wizard and keep the result as a link or a Markdown file.', to: '/classify' },
      { t: 'Read the guide for your main law', d: 'Definitions, deadlines, who enforces it and common misreadings. The EU AI Act guide also covers the 2026 changes.', to: '/rules/eu' },
      { t: 'Reuse one control for many frameworks', d: 'The crosswalk shows where a single control, such as human oversight, meets several frameworks at once.', to: '/crosswalk' },
      { t: 'Take the templates', d: 'Intake form, inventory, risk assessment, fundamental-rights impact assessment, DPIA supplement and more.', to: '/toolkit' },
    ],
  },
  {
    id: 'trainers',
    short: 'Training',
    title: 'You run training',
    who: 'Trainers, L&D teams, consultants and lecturers who need people to understand AI risk, not just read about it.',
    get: 'Hands-on material: simulations people can break and fix, ready-made workshop links, quizzes and a printable certificate.',
    steps: [
      { t: 'Use the 60-minute workshop plan', d: 'Timings, links to scenarios with problems already switched on, and debrief questions.', to: '/basics#m8' },
      { t: 'Pick a learning track for each role', d: 'Seven routes, from a 15-minute board briefing to a full track for legal teams.', to: '/tracks' },
      { t: 'Send a pre-set scenario', d: 'Set up any example, press “Share this setup” and send the link. Everyone starts from the same state.', to: '/model/credit?p=zip' },
      { t: 'Check what people learned', d: 'Fourteen short quizzes with explanations. A score of 80% adds the module to a printable certificate.', to: '/quiz' },
      { t: 'Download the facilitator guide', d: 'A Markdown guide you can adapt, with materials, timings and follow-up.', to: '/toolkit' },
    ],
  },
  {
    id: 'builders',
    short: 'Building or buying AI',
    title: 'You build or buy AI systems',
    who: 'Product managers, data scientists, engineers and security teams.',
    get: 'The failure modes of your type of system, the controls that work, and the security weaknesses attackers use.',
    steps: [
      { t: 'Find the example closest to your system', d: '25 examples from classical models to agents. Each one shows what goes wrong and which safeguard fixes it.', to: '/' },
      { t: 'See it through the security lens', d: 'Switch the view to OWASP to see the 2026 LLM and agent weaknesses that apply.', to: '/rules/owasp' },
      { t: 'Run through a pre-launch checklist', d: 'Every example ends with a “Before go-live” checklist you can tick off and copy.', to: '/model/travel-agent#checklist' },
      { t: 'Ask vendors the right questions', d: 'Fifteen questions for suppliers of AI systems and features.', to: '/toolkit' },
    ],
  },
  {
    id: 'learners',
    short: 'Study and teaching',
    title: 'You study or teach AI governance',
    who: 'Students, researchers and lecturers.',
    get: 'Free, citable material that compares ten frameworks on the same examples.',
    steps: [
      { t: 'Start with the basics', d: 'How models work and where risk enters, in about ten minutes.', to: '/basics' },
      { t: 'Compare frameworks', d: 'Eleven topics, a scoring rubric, a gap finder and data you can download as CSV.', to: '/compare' },
      { t: 'Browse real cases', d: 'Incidents, rulings and reports, filterable by harm, sector and country.', to: '/cases' },
      { t: 'Cite the site', d: 'Citation details and the content licence are on the About page.', to: '/about' },
    ],
  },
];

export default function Start() {
  // jump to the audience in the address, e.g. /start/#trainers
  useEffect(() => {
    const id = location.hash.slice(1);
    if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }), 150);
  }, []);
  return (
    <div className="wrap" style={{ padding: '30px 0 44px' }}>
      <div className="narrow stack">
        <Breadcrumbs trail={[{ label: 'Start here' }]} />
        <h1>Start here</h1>
        <p className="lead">The site serves different people in different ways. Pick the description that fits you best and follow the steps in order.</p>
      </div>
      <nav className="aud-jump" aria-label="Choose your role">
        {AUDIENCES.map((a) => <a key={a.id} href={`#${a.id}`} className="chip-btn">{a.short}</a>)}
      </nav>
      {AUDIENCES.map((a) => (
        <section key={a.id} id={a.id} className="section aud">
          <div className="aud-head">
            <h2>{a.title}</h2>
            <p className="muted">{a.who}</p>
            <p className="aud-get"><b>What you get:</b> {a.get}</p>
          </div>
          <ol className="aud-steps">
            {a.steps.map((s, i) => (
              <motion.li key={s.t} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <a href={url(s.to)} className="card card-pad lift aud-step" onClick={() => { if (s.lens) setLens(s.lens); }}>
                  <span className="aud-n" aria-hidden>{i + 1}</span>
                  <span><b>{s.t}</b><span className="muted small" style={{ display: 'block', marginTop: 2 }}>{s.d}</span></span>
                </a>
              </motion.li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
