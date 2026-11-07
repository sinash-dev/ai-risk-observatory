export const SITE = {
  name: 'AI Risk Explorer',
  /** content review date, shown in footer and guides */
  reviewed: '2026-11-07',
  repo: 'https://github.com/sinash-dev/ai-risk-observatory',
  url: 'https://sinash-dev.github.io/ai-risk-observatory/',
} as const;

/** "6 Nov 2026" */
export const fmtDate = (iso: string) => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
