import { themed } from './palette';
import type { LabDef, RiskKey, Stage, TierId } from './types';

export const RISKS: { key: RiskKey; label: string; short: string; color: string; desc: string }[] = [
  { key: 'fairness', label: 'Unfair treatment', short: 'Fairness', color: themed('risk-fairness', '#e08aa8'), desc: 'Some groups of people get worse outcomes or more errors than others.' },
  { key: 'robustness', label: 'Errors and breakdowns', short: 'Reliability', color: themed('risk-robustness', '#7fb0d8'), desc: 'The system gets things wrong, or stops working when conditions change.' },
  { key: 'transparency', label: 'Lack of transparency', short: 'Transparency', color: themed('risk-transparency', '#a99be0'), desc: 'People cannot tell that AI is involved, or cannot understand or challenge a decision.' },
  { key: 'privacy', label: 'Privacy', short: 'Privacy', color: themed('risk-privacy', '#7cc49a'), desc: 'Personal or confidential information is collected, exposed or used in ways people did not expect.' },
  { key: 'security', label: 'Security attacks', short: 'Security', color: themed('risk-security', '#e0a070'), desc: 'Someone deliberately tricks, poisons, steals from or takes over the system.' },
  { key: 'safety', label: 'Harm to people', short: 'Safety', color: themed('risk-safety', '#e0716b'), desc: 'People lose money, health, access to services or are otherwise hurt.' },
  { key: 'accountability', label: 'Unclear responsibility', short: 'Accountability', color: themed('risk-accountability', '#d6c06a'), desc: 'Nobody clearly owns the system, checks it, or can stop it.' },
  { key: 'misuse', label: 'Misuse and IP', short: 'Misuse', color: themed('risk-misuse', '#95aebb'), desc: 'The system is used to deceive, collude or copy other people’s work.' },
];

export const RISK_BY_KEY = Object.fromEntries(RISKS.map((r) => [r.key, r])) as Record<RiskKey, (typeof RISKS)[number]>;

export const TIERS: { id: TierId; label: string; color: string; ring: number; tagline: string }[] = [
  { id: 'classical', label: 'Classical machine learning', color: themed('tier-classical', '#6fb59d'), ring: 1, tagline: 'Learns patterns from tables of data to predict a number or a category. A person usually acts on the result.' },
  { id: 'deep', label: 'Deep learning', color: themed('tier-deep', '#9c8fd0'), ring: 2, tagline: 'Neural networks that learn directly from images, text, sound or behaviour. Powerful, but harder to explain.' },
  { id: 'genai', label: 'Generative AI', color: themed('tier-genai', '#d6b06a'), ring: 3, tagline: 'Models that produce new text, images or code in response to a prompt.' },
  { id: 'agentic', label: 'AI agents', color: themed('tier-agentic', '#e0896b'), ring: 4, tagline: 'Systems that plan and carry out tasks on their own, using tools such as email, payments or code.' },
];

export const TIER_BY_ID = Object.fromEntries(TIERS.map((t) => [t.id, t])) as Record<TierId, (typeof TIERS)[number]>;

export const STAGES: { id: Stage; label: string }[] = [
  { id: 'data', label: 'Data' },
  { id: 'design', label: 'Design' },
  { id: 'validate', label: 'Testing' },
  { id: 'deploy', label: 'Deployment' },
  { id: 'monitor', label: 'Monitoring' },
];

export const KIND_LABEL = { shortcut: 'Design choice', event: 'Real-world change', attack: 'Attack' } as const;

export const RESIDUAL = 0.15;

export function isCountered(lab: LabDef, stressorId: string, m: Set<string>) {
  return lab.mitigations.some((mit) => m.has(mit.id) && mit.counters.includes(stressorId));
}

export function computeScores(lab: LabDef, s: Set<string>, m: Set<string>) {
  const risk = {} as Record<RiskKey, number>;
  for (const r of RISKS) risk[r.key] = lab.baseRisk[r.key] ?? 8;
  for (const st of lab.stressors) {
    if (!s.has(st.id)) continue;
    const factor = isCountered(lab, st.id, m) ? RESIDUAL : 1;
    for (const [k, v] of Object.entries(st.risk)) risk[k as RiskKey] += (v ?? 0) * factor;
  }
  for (const r of RISKS) risk[r.key] = Math.max(0, Math.min(100, risk[r.key]));
  return { risk };
}

export function level(v: number) {
  if (v >= 50) return { label: 'High', color: themed('level-high', '#e0716b') };
  if (v >= 28) return { label: 'Medium', color: themed('level-medium', '#e0b25c') };
  return { label: 'Low', color: themed('level-low', '#6cc5b0') };
}
