import { FRAMEWORKS } from './frameworks';
import { LABS } from './labs';
import { QUIZZES } from './quizzes';
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
  { path: '/', title: 'AI Risk Explorer', description: `Working simulations of how ${LABS.length} AI and machine learning systems fail, and how ${FRAMEWORKS.length} governance frameworks, from the EU AI Act to China, Korea, Singapore and the UK, deal with them.`, og: 'default' },
  { path: '/rules', title: 'Frameworks', description: `${FRAMEWORKS.length} ways of governing AI: laws, standards and security guides, grouped by region, with a worldwide timeline of AI rules.`, og: 'default' },
  { path: '/compare', title: 'Compare frameworks', description: `How ${FRAMEWORKS.length} AI governance frameworks treat transparency, human oversight, bias, risk assessment and more, side by side.`, og: 'default' },
  { path: '/basics', title: 'The basics', description: 'A short guide to how AI models work, where their risks come from, and how laws, standards and security guides deal with them.', og: 'default' },
  { path: '/classify', title: 'Classify your system', description: 'Ten short questions give an indicative classification under the EU AI Act and the other frameworks that apply where you operate, with next steps.', og: 'default' },
  { path: '/cases', title: 'Case library', description: 'Real AI incidents, rulings and reports, filterable by harm, model family, sector, jurisdiction, year and outcome.', og: 'default' },
  { path: '/crosswalk', title: 'Controls crosswalk', description: 'Twenty common AI governance controls mapped to the clauses of ten frameworks, with a CSV export.', og: 'default' },
  { path: '/toolkit', title: 'Toolkit', description: 'Free templates for AI governance: intake, inventory, risk assessment, FRIA, DPIA supplement, model card, oversight checklist, vendor questions and more.', og: 'default' },
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

/** Site navigation. Items appear in the header and footer once their page is in STATIC_PAGES. */
export interface NavItem { path: string; label: string; desc: string; group: 'main' | 'learn' | 'tools' | 'about' }
export const NAV: NavItem[] = [
  { path: '/', label: 'Models', desc: 'All examples on one map', group: 'main' },
  { path: '/rules', label: 'Frameworks', desc: 'Laws, standards and guides by region', group: 'main' },
  { path: '/compare', label: 'Compare', desc: 'Frameworks side by side', group: 'main' },
  { path: '/basics', label: 'Basics', desc: 'How models work and where risk comes from', group: 'learn' },
  { path: '/tracks', label: 'Learning tracks', desc: 'Routes through the site by role', group: 'learn' },
  { path: '/glossary', label: 'Glossary', desc: 'Plain definitions of the terms used here', group: 'learn' },
  { path: '/quiz', label: 'Quizzes', desc: 'Check what you have learned', group: 'learn' },
  { path: '/classify', label: 'Classify your system', desc: 'A short wizard across all frameworks', group: 'tools' },
  { path: '/crosswalk', label: 'Controls crosswalk', desc: 'One control, ten frameworks', group: 'tools' },
  { path: '/toolkit', label: 'Toolkit', desc: 'Templates you can download and adapt', group: 'tools' },
  { path: '/cases', label: 'Case library', desc: 'Real incidents behind the examples', group: 'tools' },
  { path: '/about', label: 'About', desc: 'Who made this and how it is kept accurate', group: 'about' },
  { path: '/updates', label: 'Updates', desc: 'What changed and when', group: 'about' },
];
export const liveNav = (group?: NavItem['group']) => NAV.filter((n) => (!group || n.group === group) && STATIC_PAGES.some((p) => p.path === n.path));
