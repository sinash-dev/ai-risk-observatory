import { FRAMEWORKS } from './frameworks';
import { LABS } from './labs';
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
