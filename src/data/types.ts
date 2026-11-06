export type RiskKey =
  | 'fairness'
  | 'robustness'
  | 'transparency'
  | 'privacy'
  | 'security'
  | 'safety'
  | 'accountability'
  | 'misuse';

export type RiskVector = Partial<Record<RiskKey, number>>;

export type TierId = 'classical' | 'deep' | 'genai' | 'agentic';

export type Stage = 'data' | 'design' | 'validate' | 'deploy' | 'monitor';

export interface Stressor {
  id: string;
  kind: 'shortcut' | 'event' | 'attack';
  label: string;
  desc: string;
  risk: RiskVector;
  /** Business value gained when a shortcut is taken */
  value?: number;
  headline: string;
  outlet: string;
  quote?: { who: string; text: string };
  /** no safeguard can make this acceptable (e.g. a banned practice) */
  unmitigable?: boolean;
  /** OWASP or other codes that apply, e.g. 'LLM01:2026', 'ASI03' */
  codes?: string[];
}

export interface Mitigation {
  id: string;
  label: string;
  desc: string;
  counters: string[];
  cost: number;
  stage: Stage;
  refs: string[];
}

export interface Incident {
  year: string;
  title: string;
  text: string;
  /** verified source URL only; never guessed */
  url?: string;
  source?: string;
  outcome?: string;
}

export interface VizProps {
  s: Set<string>;
  m: Set<string>;
  /** stressor is active and not countered */
  live: (stressorId: string) => boolean;
}

export interface LabDef {
  id: string;
  tier: TierId;
  model: string;
  short: string;
  app: string;
  org: string;
  euTier: 'Minimal' | 'Limited' | 'High' | 'Context';
  euNote: string;
  glyph: string;
  primer: string;
  brief: { from: string; role: string; text: string; kpi: string };
  stakeholders: string[];
  baseRisk: RiskVector;
  stressors: Stressor[];
  mitigations: Mitigation[];
  incidents: Incident[];
  checklist: string[];
  lesson: string;
  /** what remains even with every safeguard on, and who must accept it */
  residual?: string;
  /** facilitator questions for workshops */
  discuss?: string[];
}
