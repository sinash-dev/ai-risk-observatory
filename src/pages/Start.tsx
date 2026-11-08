import { useEffect } from 'react';
import { Breadcrumbs } from '../components/Nav';
import { startTour } from '../components/Tour';
import { setLens } from '../lib/lens';
import { url } from '../lib/util';

interface Step { t: string; d: string; to: string; lens?: 'eu' }
interface Audience { id: string; title: string; lead: string; steps: Step[] }

/** The main reader: the person who has just been handed AI compliance. */
export const MAIN: Audience = {
  id: 'compliance',
  title: 'Start with your AI inventory',
  lead: 'For compliance, privacy, risk or legal staff, often the person who has just been told “you own AI now”. You get the rules that apply to each of your AI systems, the next step for each, and templates to adapt.',
  steps: [
    { t: 'List your AI systems', d: 'Add each system to your register and answer a few questions. It stays in your browser.', to: '/register' },
    { t: 'Check one system in depth', d: 'Run the classification wizard and keep the result as a link or a Markdown file.', to: '/classify' },
    { t: 'Read the guide for your main law', d: 'Definitions, deadlines, who enforces it and common misreadings, including the 2026 changes to the EU AI Act.', to: '/rules/eu' },
    { t: 'Reuse one control for many laws', d: 'The crosswalk shows where one control, such as human oversight, meets several frameworks at once.', to: '/crosswalk' },
    { t: 'Take the templates', d: 'Intake form, inventory, risk assessment, fundamental-rights impact assessment and more.', to: '/toolkit' },
  ],
};

export const OTHERS: Audience[] = [
  {
    id: 'trainers',
    title: 'You run training',
    lead: 'For trainers, L&D teams, consultants and lecturers. You get simulations people can break and fix, workshop slides with notes, team plans, quizzes for your learning platform and a printable certificate.',
    steps: [
      { t: 'Run the 60-minute workshop', d: 'Presenter slides with learning objectives, timings, group tasks and notes for you, plus a printable handout.', to: '/workshop' },
      { t: 'Pick a learning track for each role', d: 'Seven routes, from a 15-minute board briefing to a full track for legal teams.', to: '/tracks' },
      { t: 'Send a pre-set scenario', d: 'Set up any example, press “Share this setup” and send the link. Everyone starts from the same state.', to: '/model/credit?p=zip' },
      { t: 'Check what people learned', d: 'Short quizzes with explanations. A score of 80% adds the module to a printable certificate.', to: '/quiz' },
      { t: 'Train a whole team', d: 'Pick tracks and quizzes, send one link, and collect a record of who completed what. The quizzes also come as SCORM packages.', to: '/team' },
    ],
  },
  {
    id: 'builders',
    title: 'You build or buy AI systems',
    lead: 'For product managers, data scientists, engineers and security teams. You get the ways your type of system fails, the controls that work, and the security weaknesses attackers use.',
    steps: [
      { t: 'Find the example closest to your system', d: 'Examples from classical models to agents, each showing what goes wrong and which safeguard fixes it.', to: '/' },
      { t: 'See it through the security lens', d: 'The OWASP guide covers the LLM and agent weaknesses that apply.', to: '/rules/owasp' },
      { t: 'Run through a pre-launch checklist', d: 'Every example ends with a “Before go-live” checklist you can tick off and copy.', to: '/model/travel-agent#checklist' },
      { t: 'Ask vendors the right questions', d: 'Fifteen questions for suppliers of AI systems and features.', to: '/toolkit' },
    ],
  },
  {
    id: 'learners',
    title: 'You study or teach AI governance',
    lead: 'For students, researchers and lecturers. You get free, citable material that compares frameworks on the same examples.',
    steps: [
      { t: 'Start with the basics', d: 'How models work and where risk enters, in about ten minutes.', to: '/basics' },
      { t: 'Compare frameworks', d: 'Topics side by side, a scoring rubric, a gap finder and data you can download as CSV.', to: '/compare' },
      { t: 'Browse real cases', d: 'Incidents, rulings and reports, filterable by harm, sector and country.', to: '/cases' },
      { t: 'Cite the site', d: 'Citation details and the content licence are on the About page.', to: '/about' },
    ],
  },
];

/** kept for anything that still imports the full list */
export const AUDIENCES: Audience[] = [MAIN, ...OTHERS];

function Steps({ a, className }: { a: Audience; className: string }) {
  return (
    <ol className={className}>
      {a.steps.map((s, i) => (
        <li key={s.t}>
          <a href={url(s.to)} className="start-step" onClick={() => { if (s.lens) setLens(s.lens); }}>
            <span className="aud-n" aria-hidden>{i + 1}</span>
            <span><b>{s.t}</b><span className="muted small" style={{ display: 'block', marginTop: 2 }}>{s.d}</span></span>
          </a>
        </li>
      ))}
    </ol>
  );
}

export default function Start() {
  // old links such as /start/#trainers open the matching card
  useEffect(() => {
    const id = location.hash.slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    if (el instanceof HTMLDetailsElement) el.open = true;
    setTimeout(() => el?.scrollIntoView({ block: 'start' }), 150);
  }, []);
  return (
    <div className="wrap" style={{ padding: '30px 0 44px' }}>
      <div className="narrow stack">
        <Breadcrumbs trail={[{ label: 'Start here' }]} />
        <h1>Start here</h1>
        <p className="lead">Most visitors arrive with one job. Find yours below and follow the steps.</p>
      </div>

      <section id={MAIN.id} className="card card-pad start-main" aria-labelledby="start-main-h">
        <h2 id="start-main-h">{MAIN.title}</h2>
        <p className="muted">{MAIN.lead}</p>
        <Steps a={MAIN} className="start-steps" />
      </section>

      <section className="start-others" aria-labelledby="start-others-h">
        <h2 id="start-others-h" className="start-others-h">Here for something else?</h2>
        {OTHERS.map((a) => (
          <details key={a.id} id={a.id} className="card start-other">
            <summary><span><b>{a.title}</b><span className="muted small" style={{ display: 'block', marginTop: 4 }}>{a.lead}</span></span></summary>
            <Steps a={a} className="start-list" />
          </details>
        ))}
      </section>

      <p className="small muted" style={{ marginTop: 22 }}>
        New to the site? <button className="link-btn" onClick={startTour}>Take the 60-second tour</button> of the examples map.
      </p>
    </div>
  );
}
