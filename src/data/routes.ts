import { FRAMEWORKS } from './frameworks';
import { LABS } from './labs';
import { QUIZZES } from './quizzes';
import { SECTORS } from './sectors';
import { TIER_BY_ID } from './risks';

export interface RouteMeta {
  /** site path without base, leading slash, no trailing slash ("/" for home) */
  path: string;
  title: string;
  description: string;
  /** Open Graph image slug in /og/ */
  og: string;
  /** accent colour for the OG image */
  color?: string;
}

/** Top-level pages. New pages are added here so the router, search, sitemap and postbuild all see them. */
export const STATIC_PAGES: RouteMeta[] = [
  { path: '/', title: 'AI Risk Explorer', description: `Find out which AI rules apply to the AI systems you use, and what to do about them: a free register, a classification wizard and templates, with ${LABS.length} worked examples and ${FRAMEWORKS.length} frameworks from the EU AI Act to China, Korea, Singapore and the UK.`, og: 'default' },
  { path: '/rules', title: 'Frameworks', description: `${FRAMEWORKS.length} ways of governing AI: laws, standards and security guides, grouped by region, with a worldwide timeline of AI rules.`, og: 'default' },
  { path: '/compare', title: 'Compare frameworks', description: `How ${FRAMEWORKS.length} AI governance frameworks treat transparency, human oversight, bias, risk assessment and more, side by side.`, og: 'default' },
  { path: '/basics', title: 'The basics', description: 'A short guide to how AI models work, where their risks come from, and how laws, standards and security guides deal with them.', og: 'default' },
  { path: '/start', title: 'Start here', description: 'Where to begin, depending on whether you look after compliance, run training, build AI systems or study the subject.', og: 'default' },
  { path: '/register', title: 'My AI register', description: 'List the AI systems your organisation uses, see which rules apply to each, and track what to do. Everything stays in your browser.', og: 'default' },
  { path: '/sectors', title: 'Sector guides', description: 'The AI rules that matter most in banking, insurance, HR, health care, the public sector and education, with examples, real cases and templates.', og: 'default' },
  { path: '/team', title: 'Team training', description: 'Set up AI literacy training for a team: choose tracks and quizzes, share one link, and collect a record of who completed what. No accounts, nothing stored on a server.', og: 'default' },
  { path: '/workshop', title: 'Workshop slides', description: 'Presenter slides for a 60-minute AI risk workshop, with learning objectives, timings, facilitator notes, discussion questions and follow-up.', og: 'default' },
  { path: '/classify', title: 'Classify your system', description: 'Ten short questions give an indicative classification under the EU AI Act and the other frameworks that apply where you operate, with next steps.', og: 'default' },
  { path: '/cases', title: 'Case library', description: 'Real AI incidents, rulings and reports, filterable by harm, model family, sector, jurisdiction, year and outcome.', og: 'default' },
  { path: '/crosswalk', title: 'Controls crosswalk', description: 'Twenty common AI governance controls mapped to the clauses of ten frameworks, with a CSV export.', og: 'default' },
  { path: '/toolkit', title: 'Toolkit', description: 'Free templates for AI governance, from intake forms and risk assessments to EU AI Act packs (Annex IV, Art. 17, Art. 26, Art. 50, Art. 72), an ISO/IEC 42001 Statement of Applicability and an evidence checklist.', og: 'default' },
  { path: '/tracks', title: 'Learning tracks', description: 'Routes through the site for executives, legal, data science, security, product, procurement and internal audit.', og: 'default' },
  { path: '/quiz', title: 'Quizzes', description: 'Short scenario quizzes on each framework and each type of model, with explanations for every answer.', og: 'default' },
  { path: '/certificate', title: 'Certificate', description: 'A printable record of the AI Risk Explorer modules you have completed. Nothing leaves your browser.', og: 'default' },
  { path: '/glossary', title: 'Glossary', description: 'Plain definitions of the terms used in AI governance, from conformity assessment to prompt injection.', og: 'default' },
  { path: '/about', title: 'About', description: 'Who made AI Risk Explorer, how it works, how it is kept accurate, and how to cite it.', og: 'default' },
  { path: '/updates', title: 'Updates', description: 'Changes to the site and the legal developments they reflect, also available as an RSS feed.', og: 'default' },
];

export function allRoutes(): RouteMeta[] {
  return [
    ...STATIC_PAGES,
    ...LABS.map((l) => ({
      path: `/model/${l.id}`,
      title: `${l.model}: ${l.app}`,
      description: `${l.model}, ${l.app.toLowerCase()}: how it fails, the safeguards that help, and how ${FRAMEWORKS.length} frameworks classify it.`,
      og: `model-${l.id}`,
      color: TIER_BY_ID[l.tier].color,
    })),
    ...FRAMEWORKS.map((f) => ({
      path: `/rules/${f.id}`,
      title: `${f.name}: guide`,
      description: `${f.intro.split('. ')[0]}. Categories, key requirements, timeline, roadmap and how it treats ${LABS.length} AI examples.`,
      og: `fw-${f.id}`,
    })),
    ...SECTORS.map((s) => ({
      path: `/sectors/${s.id}`,
      title: `${s.name}: AI rules, cases and templates`,
      description: `${s.intro.split('. ')[0]}. Which EU AI Act points apply, other laws, examples, real cases and templates.`,
      og: 'default',
    })),
    ...QUIZZES.map((q) => ({
      path: `/quiz/${q.id}`,
      title: `Quiz: ${q.title}`,
      description: `Five scenario questions on ${q.title}, with an explanation for every answer.`,
      og: 'default',
    })),
    ...FRAMEWORKS.map((f) => ({
      path: `/compare/${f.id}`,
      title: `Compare ${f.short} with other frameworks`,
      description: `How ${f.short} compares with ${FRAMEWORKS.length - 1} other AI governance frameworks, topic by topic.`,
      og: `fw-${f.id}`,
    })),
  ];
}

const NOT_FOUND: RouteMeta = { path: '/404', title: 'Page not found', description: 'This page does not exist. Search the site or start from the overview.', og: 'default' };

export function routeMeta(path: string): RouteMeta {
  const p = path === '' ? '/' : path;
  return allRoutes().find((r) => r.path === p) ?? NOT_FOUND;
}

export { NAV, liveNav, type NavItem } from './nav';
