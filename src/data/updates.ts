import type { FwId } from './frameworks';

export interface Update { date: string; title: string; body: string; fw?: FwId[]; links?: { label: string; to: string }[] }

/** Newest first. Also published as an RSS feed (updates.xml) by scripts/postbuild.ts. */
export const UPDATES: Update[] = [
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
