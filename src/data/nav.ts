/** Site navigation (light: no data imports). */
/** Site navigation. Items appear in the header and footer once their page is in STATIC_PAGES. */
export interface NavItem { path: string; label: string; desc: string; group: 'main' | 'learn' | 'tools' | 'about' }
export const NAV: NavItem[] = [
  { path: '/start', label: 'Start here', desc: 'Where to begin for your role', group: 'main' },
  { path: '/', label: 'Models', desc: 'All examples on one map', group: 'main' },
  { path: '/rules', label: 'Frameworks', desc: 'Laws, standards and guides by region', group: 'main' },
  { path: '/compare', label: 'Compare', desc: 'Frameworks side by side', group: 'main' },
  { path: '/basics', label: 'Basics', desc: 'How models work and where risk comes from', group: 'learn' },
  { path: '/tracks', label: 'Learning tracks', desc: 'Routes through the site by role', group: 'learn' },
  { path: '/glossary', label: 'Glossary', desc: 'Plain definitions of the terms used here', group: 'learn' },
  { path: '/quiz', label: 'Quizzes', desc: 'Check what you have learned', group: 'learn' },
  { path: '/register', label: 'My AI register', desc: 'Your AI systems, rules and to-dos', group: 'tools' },
  { path: '/classify', label: 'Classify your system', desc: 'A short wizard across all frameworks', group: 'tools' },
  { path: '/crosswalk', label: 'Controls crosswalk', desc: 'One control, ten frameworks', group: 'tools' },
  { path: '/toolkit', label: 'Toolkit', desc: 'Templates you can download and adapt', group: 'tools' },
  { path: '/cases', label: 'Case library', desc: 'Real incidents behind the examples', group: 'tools' },
  { path: '/about', label: 'About', desc: 'Who made this and how it is kept accurate', group: 'about' },
  { path: '/updates', label: 'Updates', desc: 'What changed and when', group: 'about' },
];
/** Paths of the top-level pages that exist (must match STATIC_PAGES; checked by the integrity test). */
export const LIVE_PATHS = ['/', '/start', '/register', '/rules', '/compare', '/basics', '/classify', '/cases', '/crosswalk', '/toolkit', '/tracks', '/quiz', '/certificate', '/glossary', '/about', '/updates'];
export const liveNav = (group?: NavItem['group']) => NAV.filter((n) => (!group || n.group === group) && LIVE_PATHS.includes(n.path));
