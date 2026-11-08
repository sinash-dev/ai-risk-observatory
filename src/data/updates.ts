import type { FwId } from './frameworks';

export interface Update { date: string; title: string; body: string; fw?: FwId[]; links?: { label: string; to: string }[] }

/** Newest first. Also published as an RSS feed (updates.xml) by scripts/postbuild.ts. */
export const UPDATES: Update[] = [
  {
    date: '2026-11-08',
    title: 'A report your manager can read in a minute',
    body: 'Register reports, in Markdown and Word, now open with a summary for management: how many systems you have, how they fall under the EU AI Act, how many still have open actions, the next three dates and the five actions to take first. The register page itself is simpler: one button to add your first system, then an Export menu and a Backup menu. The classification tool has a shorter introduction and one note on how far to rely on the result.',
    links: [{ label: 'My AI register', to: '/register' }, { label: 'Classify your system', to: '/classify' }],
  },
  {
    date: '2026-11-08',
    title: 'Easier to read',
    body: 'Text is a little larger and spacing more even across the site. The examples map now hides any label that would overlap another, so the names you can see are readable. Each example lists four frameworks first, with a button to show the rest, and each framework guide opens with a short summary: what it is, who it covers and, where there is one, the next date to watch.',
    links: [{ label: 'EU AI Act guide', to: '/rules/eu' }, { label: 'Credit scoring example', to: '/model/credit' }],
  },
  {
    date: '2026-11-08',
    title: 'A clearer start',
    body: 'The home page now says who the site is for and what to do first: check your first AI system in the register. The menu puts My AI register at the top, calls the map of simulations Examples, and shows the framework lens only on pages where it changes something. The Start here page leads with the compliance path as five steps, with the other roles one click away. The guided tour now starts from a button on the Start page or in the footer instead of popping up.',
    links: [{ label: 'Start here', to: '/start' }, { label: 'My AI register', to: '/register' }],
  },
  {
    date: '2026-11-07',
    title: 'Light theme',
    body: 'The site now has a light theme as well as the dark one. It follows your device setting until you choose, and the sun and moon button in the header switches between them; your choice is remembered in this browser. The simulations, the globe and the 3D scenes keep their dark panels in both themes so their charts read the same. Every page was checked for colour contrast in both themes.',
  },
  {
    date: '2026-11-07',
    title: 'New visuals: the EU risk pyramid and more',
    body: 'The EU AI Act guide now shows the four risk levels as a pyramid you can turn and explore, with dates, duties and fines for each level. Results in the classification tool and My AI register show where a system sits on it. The register gained a timeline of upcoming dates, the toolkit a map of which template to use at which stage, the sector guides a comparison across sectors, and the workshop slides a 60-minute agenda bar. Legal references such as 5(c) no longer display as a copyright sign.',
    fw: ['eu'],
    links: [{ label: 'EU AI Act guide', to: '/rules/eu' }, { label: 'Toolkit', to: '/toolkit' }, { label: 'Sector guides', to: '/sectors' }],
  },
  {
    date: '2026-11-07',
    title: 'New: team training, workshop slides and quizzes for your learning platform',
    body: 'Trainers and managers can now set up AI literacy training for a team: choose role-based tracks and quizzes, share one link, and collect each person’s record, including what they will do differently at work. The 60-minute workshop is now a set of presenter slides with learning objectives, timings, group tasks and notes for the facilitator. Every quiz can be downloaded as a SCORM 1.2 package for learning platforms such as Moodle. Each learning track now starts with clear learning objectives.',
    fw: ['eu'],
    links: [{ label: 'Team training', to: '/team' }, { label: 'Workshop slides', to: '/workshop' }, { label: 'Quizzes', to: '/quiz' }],
  },
  {
    date: '2026-11-07',
    title: 'New: framework packs, sector guides and a Word report',
    body: 'Nine new templates follow the law clause by clause: EU AI Act technical documentation (Annex IV), quality management (Art. 17), declaration of conformity (Annex V), post-market monitoring (Art. 72), a deployer pack (Art. 26) and transparency notices (Art. 50), plus an ISO/IEC 42001 Statement of Applicability, NYC Local Law 144 notices and Korea AI Basic Act notices. An evidence checklist lists what auditors and regulators may ask to see. Six sector guides cover banking, insurance, HR, health care, the public sector and education. My AI register now exports a Word report. The EU templates were checked against the consolidated AI Act of 27 July 2026, which includes the Omnibus changes.',
    fw: ['eu', 'iso', 'us', 'kr'],
    links: [{ label: 'Toolkit', to: '/toolkit' }, { label: 'Sector guides', to: '/sectors' }],
  },
  {
    date: '2026-11-07',
    title: 'New: My AI register and a Start here page',
    body: 'List the AI systems your organisation builds or uses, see each one’s category under the EU AI Act and the other rules that apply where you work, and tick off what needs doing. Exports as a Markdown report, CSV or JSON. Everything stays in your browser. A new Start here page suggests a route through the site for compliance leads, trainers, product teams and students.',
    links: [{ label: 'My AI register', to: '/register' }, { label: 'Start here', to: '/start' }],
  },
  {
    date: '2026-11-07',
    title: 'EU AI Act: first harmonised standard and draft high-risk guidelines',
    body: 'The EU guide now covers EN 18286, the quality management standard whose reference was published in the Official Journal in October 2026, and the Commission’s draft guidelines on what counts as high-risk (19 May 2026, still a draft). The classification tool now points to the Commission’s own free checker as a second opinion.',
    fw: ['eu'],
    links: [{ label: 'EU AI Act guide', to: '/rules/eu' }],
  },
  {
    date: '2026-11-06',
    title: 'Four new examples',
    body: 'Online exam proctoring, life and health insurance pricing, voice cloning for customer calls, and a back-office browser agent that uses tools through MCP. Each comes with a simulation, all ten framework mappings and real cases.',
    links: [{ label: 'All examples', to: '/' }],
  },
  {
    date: '2026-11-06',
    title: 'EU AI Act: the 2026 Digital Omnibus',
    body: 'Regulation (EU) 2026/1744 moved the high-risk deadlines to 2 December 2027 (Annex III) and 2 August 2028 (Annex I), added a ban on AI that generates non-consensual intimate content or child sexual abuse material from 2 December 2026, and reworded the AI literacy duty. Transparency duties were not delayed.',
    fw: ['eu'],
    links: [{ label: 'EU AI Act guide', to: '/rules/eu' }],
  },
  {
    date: '2026-11-06',
    title: 'Colorado: SB 26-189 replaces the 2024 AI Act',
    body: 'Signed on 14 May 2026, the new law applies from 1 January 2027 to automated decision-making technology that materially influences consequential decisions. It focuses on notice, explanation of adverse outcomes, data correction and human review; the duty of care, risk programme and impact assessments were dropped.',
    fw: ['us'],
    links: [{ label: 'US guide', to: '/rules/us' }],
  },
  {
    date: '2026-11-06',
    title: 'OWASP: LLM Top 10 (2026) and Agentic Top 10 (2026)',
    body: 'All references now use the 2026 LLM list (published August 2026) and the Top 10 for Agentic Applications (ASI01–ASI10, published December 2025). Problems in the generative AI and agent examples show their codes under the OWASP view.',
    fw: ['owasp'],
    links: [{ label: 'OWASP guide', to: '/rules/owasp' }],
  },
  {
    date: '2026-11-06',
    title: 'Korea: Enforcement Decree details',
    body: 'The AI Basic Act and its Enforcement Decree took effect on 22 January 2026. The guide now lists the ten high-impact areas, the 10²⁶ FLOPs threshold for the largest models, and the grace period of at least a year before fines.',
    fw: ['kr'],
    links: [{ label: 'Korea guide', to: '/rules/kr' }],
  },
];
