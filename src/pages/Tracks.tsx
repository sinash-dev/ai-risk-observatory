import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Breadcrumbs } from '../components/Nav';
import type { Lens } from '../data/frameworks';
import { setLens } from '../lib/lens';
import { url } from '../lib/util';

interface Step { t: string; to: string; min: number; lens?: Lens }
interface Track { id: string; title: string; who: string; steps: Step[] }

export const TRACKS: Track[] = [
  { id: 'exec', title: 'Executives and board', who: 'The 15-minute version: what can go wrong, what the law expects, and the decisions only leadership can take.', steps: [
    { t: 'Skim the map of examples and the deadlines strip', to: '/', min: 2 },
    { t: 'Break and fix credit scoring', to: '/model/credit?p=zip,opaque', min: 4 },
    { t: 'See a case with no fix: emotion recognition', to: '/model/emotion?p=rank', min: 3 },
    { t: 'Compare frameworks on enforcement', to: '/compare?topic=enforcement', min: 3 },
    { t: 'Quiz: EU AI Act', to: '/quiz/eu', min: 3 },
  ] },
  { id: 'legal', title: 'Legal and compliance', who: 'Classification, duties by role, overlaps between laws and what to document.', steps: [
    { t: 'Read the EU AI Act guide, including the Omnibus changes', to: '/rules/eu', min: 12 },
    { t: 'Classify a system with the wizard', to: '/classify', min: 5 },
    { t: 'Credit scoring under the EU lens: requirements and status pills', to: '/model/credit', min: 6, lens: 'eu' },
    { t: 'GDPR and automated decisions', to: '/rules/gdpr', min: 8 },
    { t: 'Use the gap finder between two frameworks', to: '/compare', min: 5 },
    { t: 'Crosswalk: one control, ten frameworks', to: '/crosswalk', min: 5 },
    { t: 'Quiz: GDPR', to: '/quiz/gdpr', min: 3 },
  ] },
  { id: 'ds', title: 'Data science and ML engineering', who: 'Proxies, drift, thresholds, evaluation by group and documentation.', steps: [
    { t: 'The basics: where risk enters the pipeline', to: '/basics', min: 8 },
    { t: 'Proxies and labels in credit scoring', to: '/model/credit?p=zip,labels', min: 6 },
    { t: 'Accuracy that lies: fraud detection', to: '/model/fraud?p=accuracy', min: 5 },
    { t: 'What the model looks at: skin-lesion triage', to: '/model/lesion?p=ruler', min: 5 },
    { t: 'Fill in a model card', to: '/toolkit', min: 10 },
    { t: 'Quiz: classical machine learning', to: '/quiz/classical', min: 3 },
  ] },
  { id: 'security', title: 'Security', who: 'Attacks on models, LLM applications and agents, mapped to the OWASP lists.', steps: [
    { t: 'OWASP guide: the three lists', to: '/rules/owasp', min: 8 },
    { t: 'Jailbreaks and data leaks in a chatbot', to: '/model/chatbot?p=jailbreak,pii', min: 5, lens: 'owasp' },
    { t: 'Poisoned documents in retrieval', to: '/model/rag?p=poison,perm', min: 5, lens: 'owasp' },
    { t: 'Hidden instructions hijack an agent', to: '/model/travel-agent?p=inject,perms', min: 5, lens: 'owasp' },
    { t: 'Slopsquatting and secrets in a code assistant', to: '/model/code?p=pkg,secret', min: 5, lens: 'owasp' },
    { t: 'Agent authorisation matrix template', to: '/toolkit', min: 5 },
    { t: 'Quiz: OWASP AI security', to: '/quiz/owasp', min: 3 },
  ] },
  { id: 'product', title: 'Product management', who: 'Trade-offs, disclosure, human oversight and what to check before launch.', steps: [
    { t: 'Customer-service chatbot: disclosure and hand-off', to: '/model/chatbot?p=hallu,noescalate', min: 6 },
    { t: 'News-feed ranking and engagement goals', to: '/model/feed?p=engage', min: 5 },
    { t: 'Dynamic pricing and what the agent is rewarded for', to: '/model/pricing?p=revenue', min: 5 },
    { t: 'Classify your product', to: '/classify', min: 5 },
    { t: 'Use-case intake template', to: '/toolkit', min: 5 },
    { t: 'Quiz: generative AI', to: '/quiz/genai', min: 3 },
  ] },
  { id: 'procurement', title: 'Procurement', who: 'What to ask vendors, who is responsible, and how to compare suppliers.', steps: [
    { t: 'Provider, deployer and becoming a provider by accident', to: '/rules/eu#more-1', min: 5 },
    { t: 'Buying a face-recognition system', to: '/model/face?p=skewdata', min: 5 },
    { t: 'Buying a hiring tool: who is liable?', to: '/model/cv?p=history', min: 5, lens: 'us' },
    { t: 'Vendor AI questionnaire', to: '/toolkit', min: 8 },
    { t: 'ISO/IEC 42001 as a supplier requirement', to: '/rules/iso', min: 6 },
    { t: 'Quiz: ISO/IEC 42001', to: '/quiz/iso', min: 3 },
  ] },
  { id: 'audit', title: 'Internal audit', who: 'Evidence, controls, monitoring and accountability across the AI estate.', steps: [
    { t: 'NIST AI RMF: Govern, Map, Measure, Manage', to: '/rules/nist', min: 8 },
    { t: 'Who owns the agents? Multi-agent procurement', to: '/model/swarm?p=noowner,cascade', min: 5 },
    { t: 'An agent that grades its own work', to: '/model/devops-agent?p=cover,noreview', min: 5 },
    { t: 'Controls crosswalk and CSV export', to: '/crosswalk', min: 6 },
    { t: 'Case library: what went wrong elsewhere', to: '/cases', min: 6 },
    { t: 'Quiz: AI agents', to: '/quiz/agentic', min: 3 },
  ] },
];

const KEY = 'are-track';
const load = (): Record<string, number[]> => { try { return JSON.parse(localStorage.getItem(KEY) ?? '{}'); } catch { return {}; } };

export default function Tracks() {
  const [done, setDone] = useState<Record<string, number[]>>(load);
  const [open, setOpen] = useState<string>(TRACKS[0].id);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(done)); } catch { /* ignore */ } }, [done]);
  const toggle = (t: string, i: number) => setDone((d) => { const cur = d[t] ?? []; return { ...d, [t]: cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i] }; });
  const tr = TRACKS.find((t) => t.id === open)!;
  const n = (done[tr.id] ?? []).length;

  return (
    <div className="wrap" style={{ padding: '30px 0 44px' }}>
      <div className="narrow stack">
        <Breadcrumbs trail={[{ label: 'Learn' }, { label: 'Learning tracks' }]} />
        <h1>Learning tracks</h1>
        <p className="lead">Seven routes through the site, one per role. Each step opens the right page, often with a problem already switched on, and ends with a quiz.</p>
      </div>
      <div className="tracks">
        <div className="tabs track-tabs" role="tablist" aria-label="Tracks">
          {TRACKS.map((t) => {
            const k = (done[t.id] ?? []).length;
            return <button key={t.id} role="tab" aria-selected={t.id === open} className={t.id === open ? 'on' : ''} onClick={() => setOpen(t.id)}>{t.title}{k ? ` · ${k}/${t.steps.length}` : ''}</button>;
          })}
        </div>
        <div className="card card-pad" role="tabpanel">
          <div className="track-head">
            <div>
              <h2 style={{ fontSize: 24 }}>{tr.title}</h2>
              <p className="muted">{tr.who}</p>
            </div>
            <span className="tag">About {tr.steps.reduce((a, s) => a + s.min, 0)} minutes</span>
          </div>
          <ol className="stepper">
            <motion.span className="stepper-fill" aria-hidden animate={{ height: `${(n / tr.steps.length) * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
            {tr.steps.map((s, i) => {
              const on = (done[tr.id] ?? []).includes(i);
              return (
                <li key={i} className={on ? 'on' : ''}>
                  <label className="step-check">
                    <input type="checkbox" checked={on} onChange={() => toggle(tr.id, i)} />
                    <span className="sr-only">Mark step {i + 1} as done</span>
                  </label>
                  <div>
                    <a href={url(s.to)} onClick={() => { if (s.lens) setLens(s.lens); }}><b>{i + 1}. {s.t}</b></a>
                    <span className="muted small"> · {s.min} min{s.lens ? ' · view set to this framework' : ''}</span>
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="dim small">Progress is saved in this browser only.</p>
        </div>
      </div>
    </div>
  );
}
