/**
 * Lightweight list of the frameworks for the site shell (header, lens bar, footer), so the
 * full framework and lab data load only with the pages that need them.
 * Kept in sync with FRAMEWORKS by the integrity test.
 */
import type { FwId } from './frameworks';

export const FW_LIST: { id: FwId; short: string; name: string; type: string }[] = [
  { id: 'eu', short: 'EU AI Act', name: 'EU AI Act', type: 'Law' },
  { id: 'us', short: 'US laws', name: 'United States: federal and state rules', type: 'Law (patchwork)' },
  { id: 'nist', short: 'NIST AI RMF', name: 'NIST AI Risk Management Framework', type: 'Voluntary framework' },
  { id: 'iso', short: 'ISO/IEC 42001', name: 'ISO/IEC 42001 AI management system', type: 'Certifiable standard' },
  { id: 'owasp', short: 'OWASP', name: 'OWASP security guidance for AI', type: 'Security guidance' },
  { id: 'gdpr', short: 'GDPR', name: 'General Data Protection Regulation', type: 'Law' },
  { id: 'cn', short: 'China', name: 'China: algorithm, generative AI and data rules', type: 'Law (set of regulations)' },
  { id: 'kr', short: 'Korea AI Basic Act', name: 'South Korea AI Basic Act', type: 'Law' },
  { id: 'sg', short: 'Singapore', name: 'Singapore: Model AI Governance Framework and AI Verify', type: 'Voluntary framework' },
  { id: 'uk', short: 'UK', name: 'United Kingdom: principles, regulators and data law', type: 'Principles + existing law' },
];
export const FW_LIST_BY_ID = Object.fromEntries(FW_LIST.map((f) => [f.id, f])) as Record<FwId, (typeof FW_LIST)[number]>;
