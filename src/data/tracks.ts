/** Learning tracks by role, and their progress in this browser. */
import type { Lens } from './frameworks';

export interface Step { t: string; to: string; min: number; lens?: Lens }
export interface Track { id: string; title: string; who: string; goals: string[]; steps: Step[] }

export const TRACKS: Track[] = [
  { id: 'exec', title: 'Executives and board', who: 'The 15-minute version: what can go wrong, what the law expects, and the decisions only leadership can take.', goals: ['Explain in two minutes how an AI system can cause harm even when it works as designed.', 'Name the AI Act deadlines that affect your organisation and who will be accountable for each.', 'Decide which risks the leadership team must accept, reduce or refuse, and ask for the evidence behind that choice.'], steps: [
    { t: 'Skim the map of examples and the deadlines strip', to: '/', min: 2 },
    { t: 'Break and fix credit scoring', to: '/model/credit?p=zip,opaque', min: 4 },
    { t: 'See a case with no fix: emotion recognition', to: '/model/emotion?p=rank', min: 3 },
    { t: 'Compare frameworks on enforcement', to: '/compare?topic=enforcement', min: 3 },
    { t: 'Quiz: EU AI Act', to: '/quiz/eu', min: 3 },
  ] },
  { id: 'legal', title: 'Legal and compliance', who: 'Classification, duties by role, overlaps between laws and what to document.', goals: ['Classify an AI system under the EU AI Act and say which role (provider or deployer) your organisation plays.', 'Tell where the AI Act and the GDPR overlap on automated decisions, and what each one asks for.', 'Map one control to several frameworks so the same evidence serves more than one law.'], steps: [
    { t: 'Read the EU AI Act guide, including the Omnibus changes', to: '/rules/eu', min: 12 },
    { t: 'Classify a system with the wizard', to: '/classify', min: 5 },
    { t: 'Credit scoring under the EU lens: requirements and status pills', to: '/model/credit', min: 6, lens: 'eu' },
    { t: 'GDPR and automated decisions', to: '/rules/gdpr', min: 8 },
    { t: 'Use the gap finder between two frameworks', to: '/compare', min: 5 },
    { t: 'Crosswalk: one control, ten frameworks', to: '/crosswalk', min: 5 },
    { t: 'Quiz: GDPR', to: '/quiz/gdpr', min: 3 },
  ] },
  { id: 'ds', title: 'Data science and ML engineering', who: 'Proxies, drift, thresholds, evaluation by group and documentation.', goals: ['Spot proxy variables and label problems that turn into unfair outcomes.', 'Choose evaluation metrics that reveal failures, including results broken down by group.', 'Document a model so a reviewer can check its intended use, limits and performance.'], steps: [
    { t: 'The basics: where risk enters the pipeline', to: '/basics', min: 8 },
    { t: 'Proxies and labels in credit scoring', to: '/model/credit?p=zip,labels', min: 6 },
    { t: 'Accuracy that lies: fraud detection', to: '/model/fraud?p=accuracy', min: 5 },
    { t: 'What the model looks at: skin-lesion triage', to: '/model/lesion?p=ruler', min: 5 },
    { t: 'Fill in a model card', to: '/toolkit', min: 10 },
    { t: 'Quiz: classical machine learning', to: '/quiz/classical', min: 3 },
  ] },
  { id: 'security', title: 'Security', who: 'Attacks on models, LLM applications and agents, mapped to the OWASP lists.', goals: ['Describe the main attacks on LLM applications and agents, using the OWASP lists.', 'Recognise prompt injection and data poisoning in a working example and pick the control that stops them.', 'Set limits on what an AI agent may do, with approval steps and logging.'], steps: [
    { t: 'OWASP guide: the three lists', to: '/rules/owasp', min: 8 },
    { t: 'Jailbreaks and data leaks in a chatbot', to: '/model/chatbot?p=jailbreak,pii', min: 5, lens: 'owasp' },
    { t: 'Poisoned documents in retrieval', to: '/model/rag?p=poison,perm', min: 5, lens: 'owasp' },
    { t: 'Hidden instructions hijack an agent', to: '/model/travel-agent?p=inject,perms', min: 5, lens: 'owasp' },
    { t: 'Slopsquatting and secrets in a code assistant', to: '/model/code?p=pkg,secret', min: 5, lens: 'owasp' },
    { t: 'Agent authorisation matrix template', to: '/toolkit', min: 5 },
    { t: 'Quiz: OWASP AI security', to: '/quiz/owasp', min: 3 },
  ] },
  { id: 'product', title: 'Product management', who: 'Trade-offs, disclosure, human oversight and what to check before launch.', goals: ['Decide when users must be told they are dealing with AI, and how to tell them.', 'Weigh business goals such as engagement or revenue against the harm a system can cause.', 'Run a use case through intake and classification before building it.'], steps: [
    { t: 'Customer-service chatbot: disclosure and hand-off', to: '/model/chatbot?p=hallu,noescalate', min: 6 },
    { t: 'News-feed ranking and engagement goals', to: '/model/feed?p=engage', min: 5 },
    { t: 'Dynamic pricing and what the agent is rewarded for', to: '/model/pricing?p=revenue', min: 5 },
    { t: 'Classify your product', to: '/classify', min: 5 },
    { t: 'Use-case intake template', to: '/toolkit', min: 5 },
    { t: 'Quiz: generative AI', to: '/quiz/genai', min: 3 },
  ] },
  { id: 'procurement', title: 'Procurement', who: 'What to ask vendors, who is responsible, and how to compare suppliers.', goals: ['Work out who is legally responsible when you buy an AI system, and when you would become the provider.', 'Ask vendors questions that produce evidence, not marketing claims.', 'Use ISO/IEC 42001 and contract terms to make suppliers accountable.'], steps: [
    { t: 'Provider, deployer and becoming a provider by accident', to: '/rules/eu#more-1', min: 5 },
    { t: 'Buying a face-recognition system', to: '/model/face?p=skewdata', min: 5 },
    { t: 'Buying a hiring tool: who is liable?', to: '/model/cv?p=history', min: 5, lens: 'us' },
    { t: 'Vendor AI questionnaire', to: '/toolkit', min: 8 },
    { t: 'ISO/IEC 42001 as a supplier requirement', to: '/rules/iso', min: 6 },
    { t: 'Quiz: ISO/IEC 42001', to: '/quiz/iso', min: 3 },
  ] },
  { id: 'audit', title: 'Internal audit', who: 'Evidence, controls, monitoring and accountability across the AI estate.', goals: ['Plan an audit of AI systems around the NIST AI RMF functions: govern, map, measure and manage.', 'Test whether controls exist and work, including for AI agents that act on their own.', 'Use real cases and the crosswalk to decide what evidence to request.'], steps: [
    { t: 'NIST AI RMF: Govern, Map, Measure, Manage', to: '/rules/nist', min: 8 },
    { t: 'Who owns the agents? Multi-agent procurement', to: '/model/swarm?p=noowner,cascade', min: 5 },
    { t: 'An agent that grades its own work', to: '/model/devops-agent?p=cover,noreview', min: 5 },
    { t: 'Controls crosswalk and CSV export', to: '/crosswalk', min: 6 },
    { t: 'Case library: what went wrong elsewhere', to: '/cases', min: 6 },
    { t: 'Quiz: AI agents', to: '/quiz/agentic', min: 3 },
  ] },
];

export const TRACK_KEY = 'are-track';
export const loadTrackProgress = (): Record<string, number[]> => { try { return JSON.parse(localStorage.getItem(TRACK_KEY) ?? '{}'); } catch { return {}; } };
export const TRACK_BY_ID = Object.fromEntries(TRACKS.map((t) => [t.id, t])) as Record<string, Track>;
