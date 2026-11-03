import type { LabDef, RiskKey, Stage, TierId } from './types';

export const RISKS: { key: RiskKey; label: string; short: string; color: string; desc: string }[] = [
  { key: 'fairness', label: 'Fairness & bias', short: 'Fairness', color: '#ff6b9a', desc: 'Unequal outcomes or errors across groups of people.' },
  { key: 'robustness', label: 'Robustness & drift', short: 'Robustness', color: '#4cc9f0', desc: 'Breaks when data, context or the world changes.' },
  { key: 'transparency', label: 'Transparency', short: 'Transparency', color: '#b892ff', desc: 'Decisions cannot be explained, contested or disclosed.' },
  { key: 'privacy', label: 'Privacy', short: 'Privacy', color: '#4ade80', desc: 'Personal or confidential data exposed or misused.' },
  { key: 'security', label: 'Security', short: 'Security', color: '#ff8a4c', desc: 'Attacks: poisoning, evasion, injection, exfiltration.' },
  { key: 'safety', label: 'Safety & harm', short: 'Safety', color: '#ff4d4d', desc: 'Physical, financial or psychological harm to people.' },
  { key: 'accountability', label: 'Accountability', short: 'Accountability', color: '#ffd166', desc: 'No clear owner, oversight or audit trail.' },
  { key: 'misuse', label: 'Misuse & IP', short: 'Misuse', color: '#2ee6c5', desc: 'Deception, deepfakes, collusion or IP infringement.' },
];

export const RISK_BY_KEY = Object.fromEntries(RISKS.map((r) => [r.key, r])) as Record<RiskKey, (typeof RISKS)[number]>;

export const TIERS: { id: TierId; label: string; color: string; glow: string; ring: number; tagline: string; autonomy: string }[] = [
  { id: 'classical', label: 'Classical ML', color: '#2ee6c5', glow: 'rgba(46,230,197,.45)', ring: 1, tagline: 'Predicts a number or a class from tabular data.', autonomy: 'Scores — humans decide' },
  { id: 'deep', label: 'Deep Learning', color: '#9b7bff', glow: 'rgba(155,123,255,.45)', ring: 2, tagline: 'Learns its own features from images, text, behaviour.', autonomy: 'Perceives & ranks at scale' },
  { id: 'genai', label: 'Generative AI', color: '#ffc857', glow: 'rgba(255,200,87,.45)', ring: 3, tagline: 'Creates text, images and code on demand.', autonomy: 'Speaks & creates for you' },
  { id: 'agentic', label: 'Agentic AI', color: '#ff7a59', glow: 'rgba(255,122,89,.45)', ring: 4, tagline: 'Plans and acts with tools, money and other agents.', autonomy: 'Acts on its own' },
];

export const TIER_BY_ID = Object.fromEntries(TIERS.map((t) => [t.id, t])) as Record<TierId, (typeof TIERS)[number]>;

export const STAGES: { id: Stage; label: string; desc: string }[] = [
  { id: 'data', label: 'Data', desc: 'Collect, label, govern' },
  { id: 'design', label: 'Design', desc: 'Features, objectives, permissions' },
  { id: 'validate', label: 'Validate', desc: 'Test, red-team, audit' },
  { id: 'deploy', label: 'Deploy', desc: 'Guardrails, oversight, disclosure' },
  { id: 'monitor', label: 'Monitor', desc: 'Drift, incidents, kill switch' },
];

export const RESIDUAL = 0.15;

export function isCountered(lab: LabDef, stressorId: string, m: Set<string>) {
  return lab.mitigations.some((mit) => m.has(mit.id) && mit.counters.includes(stressorId));
}

export function computeScores(lab: LabDef, s: Set<string>, m: Set<string>) {
  const risk: Record<RiskKey, number> = {} as Record<RiskKey, number>;
  for (const r of RISKS) risk[r.key] = lab.baseRisk[r.key] ?? 8;
  let value = 55;
  for (const st of lab.stressors) {
    if (!s.has(st.id)) continue;
    const factor = isCountered(lab, st.id, m) ? RESIDUAL : 1;
    for (const [k, v] of Object.entries(st.risk)) risk[k as RiskKey] += (v ?? 0) * factor;
    if (st.value) value += st.value;
  }
  for (const mit of lab.mitigations) if (m.has(mit.id)) value -= mit.cost;
  for (const r of RISKS) risk[r.key] = Math.max(0, Math.min(100, risk[r.key]));
  const vals = Object.values(risk);
  const peak = Math.max(...vals);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const trust = Math.round(Math.max(0, Math.min(100, 100 - (avg * 0.55 + peak * 0.6))));
  value = Math.round(Math.max(0, Math.min(100, value)));
  return { risk, trust, value };
}

/** max possible exposure of a lab (all stressors on, nothing mitigated) — used by the atlas */
export function exposure(lab: LabDef) {
  return computeScores(lab, new Set(lab.stressors.map((x) => x.id)), new Set()).risk;
}

export function grade(trust: number, value: number) {
  const g = trust * 0.65 + value * 0.35;
  if (trust < 35) return { letter: 'F', label: 'Blocked by the Board', color: '#ff4d4d' };
  if (g >= 78) return { letter: 'A', label: 'Trusted launch', color: '#2ee6c5' };
  if (g >= 66) return { letter: 'B', label: 'Approved with conditions', color: '#4cc9f0' };
  if (g >= 54) return { letter: 'C', label: 'Remediation required', color: '#ffc857' };
  return { letter: 'D', label: 'Launch paused', color: '#ff8a4c' };
}
