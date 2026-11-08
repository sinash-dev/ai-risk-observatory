/** Site navigation (light: no data imports). */
/** Site navigation. Items appear in the header and footer once their page is in STATIC_PAGES. */
/** 'main' is the top bar; 'more' items (such as Compare) appear in the footer, the mobile menu and search, not the top bar. */
export interface NavItem { path: string; label: string; desc: string; group: 'main' | 'more' | 'learn' | 'tools' | 'about' }
export const NAV: NavItem[] = [
  { path: '/start', label: 'Start here', desc: 'Where to begin for your role', group: 'main' },
  { path: '/register', label: 'My AI register', desc: 'Your AI systems, rules and to-dos', group: 'main' },
  { path: '/rules', label: 'Frameworks', desc: 'Laws, standards and guides by region', group: 'main' },
  { path: '/', label: 'Examples', desc: 'Working simulations of real kinds of AI system', group: 'main' },
  { path: '/compare', label: 'Compare frameworks', desc: 'Frameworks side by side', group: 'more' },
  { path: '/basics', label: 'Basics', desc: 'How models work and where risk comes from', group: 'learn' },
  { path: '/tracks', label: 'Learning tracks', desc: 'Routes through the site by role', group: 'learn' },
  { path: '/sectors', label: 'Sector guides', desc: 'The rules that matter in your sector', group: 'learn' },
  { path: '/team', label: 'Team training', desc: 'Plans, links and a record for your team', group: 'learn' },
  { path: '/workshop', label: 'Workshop slides', desc: 'Run a 60-minute session', group: 'learn' },
  { path: '/glossary', label: 'Glossary', desc: 'Plain definitions of the terms used here', group: 'learn' },
  { path: '/quiz', label: 'Quizzes', desc: 'Check what you have learned', group: 'learn' },
  { path: '/classify', label: 'Classify your system', desc: 'A short wizard across all frameworks', group: 'tools' },
  { path: '/crosswalk', label: 'Controls crosswalk', desc: 'One control, ten frameworks', group: 'tools' },
  { path: '/toolkit', label: 'Toolkit', desc: 'Templates you can download and adapt', group: 'tools' },
  { path: '/cases', label: 'Case library', desc: 'Real incidents behind the examples', group: 'tools' },
  { path: '/about', label: 'About', desc: 'Who made this and how it is kept accurate', group: 'about' },
  { path: '/updates', label: 'Updates', desc: 'What changed and when', group: 'about' },
];
/** Paths of the top-level pages that exist (must match STATIC_PAGES; checked by the integrity test). */
export const LIVE_PATHS = ['/', '/start', '/register', '/sectors', '/team', '/workshop', '/rules', '/compare', '/basics', '/classify', '/cases', '/crosswalk', '/toolkit', '/tracks', '/quiz', '/certificate', '/glossary', '/about', '/updates'];
export const liveNav = (group?: NavItem['group']) => NAV.filter((n) => (!group || n.group === group) && LIVE_PATHS.includes(n.path));
