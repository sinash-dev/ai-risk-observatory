import type { LabDef, RiskKey, Stage, TierId } from './types';

export const RISKS: { key: RiskKey; label: string; short: string; color: string; desc: string }[] = [
  { key: 'fairness', label: 'Unfair treatment', short: 'Fairness', color: '#b4446c', desc: 'Some groups of people get worse outcomes or more errors than others.' },
  { key: 'robustness', label: 'Errors and breakdowns', short: 'Reliability', color: '#2f6f9f', desc: 'The system gets things wrong, or stops working when conditions change.' },
  { key: 'transparency', label: 'Lack of transparency', short: 'Transparency', color: '#6d5bb0', desc: 'People cannot tell that AI is involved, or cannot understand or challenge a decision.' },
  { key: 'privacy', label: 'Privacy', short: 'Privacy', color: '#2f7d5b', desc: 'Personal or confidential information is collected, exposed or used in ways people did not expect.' },
  { key: 'security', label: 'Security attacks', short: 'Security', color: '#b8612a', desc: 'Someone deliberately tricks, poisons, steals from or takes over the system.' },
  { key: 'safety', label: 'Harm to people', short: 'Safety', color: '#b03a3a', desc: 'People lose money, health, access to services or are otherwise hurt.' },
  { key: 'accountability', label: 'Unclear responsibility', short: 'Accountability', color: '#8a6d1f', desc: 'Nobody clearly owns the system, checks it, or can stop it.' },
  { key: 'misuse', label: 'Misuse and IP', short: 'Misuse', color: '#4f6b7a', desc: 'The system is used to deceive, collude or copy other people’s work.' },
];

export const RISK_BY_KEY = Object.fromEntries(RISKS.map((r) => [r.key, r])) as Record<RiskKey, (typeof RISKS)[number]>;

export const TIERS: { id: TierId; label: string; color: string; ring: number; tagline: string }[] = [
  { id: 'classical', label: 'Classical machine learning', color: '#2f7d6d', ring: 1, tagline: 'Learns patterns from tables of data to predict a number or a category. A person usually acts on the result.' },
  { id: 'deep', label: 'Deep learning', color: '#6a4fb3', ring: 2, tagline: 'Neural networks that learn directly from images, text, sound or behaviour. Powerful, but harder to explain.' },
  { id: 'genai', label: 'Generative AI', color: '#a8741a', ring: 3, tagline: 'Models that produce new text, images or code in response to a prompt.' },
  { id: 'agentic', label: 'AI agents', color: '#b9472f', ring: 4, tagline: 'Systems that plan and carry out tasks on their own, using tools such as email, payments or code.' },
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
  if (v >= 50) return { label: 'High', color: '#b03a3a' };
  if (v >= 28) return { label: 'Medium', color: '#b8761f' };
  return { label: 'Low', color: '#3d7d5b' };
}
