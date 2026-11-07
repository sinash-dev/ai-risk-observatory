/** Case library: every real incident across the examples, with filters. Derived from LABS plus the fields below. */
import { LABS } from './labs';
import { RISKS } from './risks';
import type { Incident, LabDef, RiskKey, TierId } from './types';

export type OutcomeType = 'fine' | 'court' | 'withdrawn' | 'report' | 'law';
export const OUTCOME_LABEL: Record<OutcomeType, string> = {
  fine: 'Fine or settlement',
  court: 'Court or tribunal case',
  withdrawn: 'Withdrawn or fixed',
  report: 'Report or research',
  law: 'Law or guidance',
};

export const SECTOR: Record<string, string> = {
  spam: 'IT and security', salary: 'Employment', credit: 'Finance', benefits: 'Public sector', fraud: 'Finance', segments: 'Retail and marketing',
  staffing: 'Health', lesion: 'Health', face: 'Retail and marketing', emotion: 'Employment', cv: 'Employment', feed: 'Media and platforms',
  pricing: 'Retail and marketing', foundation: 'AI development', chatbot: 'Customer service', rag: 'IT and security', imagegen: 'Media and platforms',
  code: 'IT and security', 'travel-agent': 'Operations', 'devops-agent': 'IT and security', swarm: 'Operations',
  exam: 'Education', insurance: 'Finance', voice: 'Customer service', 'browser-agent': 'Operations',
};

/** Extra facts per case, keyed by incident title. URLs only when verified. */
const META: Record<string, { jur: string; type: OutcomeType; url?: string; source?: string }> = {
  'Bayesian poisoning': { jur: 'International', type: 'report' },
  'Political emails and Gmail’s filter': { jur: 'United States', type: 'court' },
  'EU Pay Transparency Directive': { jur: 'European Union', type: 'law' },
  'Zillow Offers wind-down': { jur: 'United States', type: 'withdrawn' },
  'Apple Card credit limits': { jur: 'United States', type: 'report' },
  'CFPB Circular 2022-03': { jur: 'United States', type: 'law' },
  'Dutch childcare-benefits scandal': { jur: 'Netherlands', type: 'report' },
  'SyRI ruling': { jur: 'Netherlands', type: 'court' },
  'Robodebt Royal Commission': { jur: 'Australia', type: 'report', url: 'https://robodebt.royalcommission.gov.au/publications/report', source: 'Royal Commission' },
  'UK DWP fairness analysis': { jur: 'United Kingdom', type: 'report' },
  'Same-day delivery gaps': { jur: 'United States', type: 'report' },
  'Housing-ad delivery settlement': { jur: 'United States', type: 'fine' },
  'The pandemic broke the forecasts': { jur: 'International', type: 'report' },
  'Sepsis model external validation': { jur: 'United States', type: 'report' },
  'Surgical-marking bias': { jur: 'International', type: 'report' },
  'Gender Shades': { jur: 'International', type: 'report', url: 'https://proceedings.mlr.press/v81/buolamwini18a.html', source: 'PMLR' },
  'FTC v. Rite Aid': { jur: 'United States', type: 'fine', url: 'https://www.ftc.gov/news-events/news/press-releases/2023/12/rite-aid-banned-using-ai-facial-recognition-after-ftc-says-retailer-deployed-technology-without', source: 'FTC' },
  'Mercadona fined in Spain': { jur: 'Spain', type: 'fine' },
  'Scientific review of emotion reading': { jur: 'International', type: 'report' },
  'HireVue drops facial analysis': { jur: 'United States', type: 'withdrawn' },
  'Amazon recruiting model': { jur: 'United States', type: 'withdrawn' },
  'NYC Local Law 144': { jur: 'United States', type: 'law', url: 'https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page', source: 'NYC DCWP' },
  'The Facebook Files': { jur: 'United States', type: 'report' },
  'DSA proceedings': { jur: 'European Union', type: 'law' },
  'The $23.7M fly book': { jur: 'United States', type: 'report' },
  'Surge pricing in a crisis': { jur: 'Australia', type: 'withdrawn' },
  'Algorithmic rent pricing': { jur: 'United States', type: 'court' },
  'New York Times v. OpenAI and Microsoft': { jur: 'United States', type: 'court' },
  'Italy fines OpenAI €15 million': { jur: 'Italy', type: 'fine' },
  'Moffatt v. Air Canada': { jur: 'Canada', type: 'court', url: 'https://www.canlii.org/en/bc/bccrt/doc/2024/2024bccrt149/2024bccrt149.html', source: 'CanLII' },
  'The $1 SUV': { jur: 'United States', type: 'report' },
  'Indirect prompt injection': { jur: 'International', type: 'report', url: 'https://arxiv.org/abs/2302.12173', source: 'arXiv' },
  'EchoLeak (CVE-2025-32711)': { jur: 'International', type: 'withdrawn', url: 'https://nvd.nist.gov/vuln/detail/CVE-2025-32711', source: 'NIST NVD' },
  'Stereotypes, amplified': { jur: 'International', type: 'report' },
  'The $25M deepfake call': { jur: 'Hong Kong', type: 'report' },
  'Getty Images v. Stability AI': { jur: 'United Kingdom', type: 'court' },
  '“Asleep at the Keyboard?”': { jur: 'International', type: 'report', url: 'https://arxiv.org/abs/2108.09293', source: 'arXiv' },
  'Package hallucinations': { jur: 'International', type: 'report', url: 'https://arxiv.org/abs/2406.10279', source: 'arXiv' },
  'Browsing-agent hijacks': { jur: 'International', type: 'report' },
  'Agent-hijacking evaluations': { jur: 'United States', type: 'report' },
  'Production database deleted': { jur: 'United States', type: 'withdrawn' },
  'CrowdStrike outage': { jur: 'International', type: 'report' },
  'The Flash Crash': { jur: 'United States', type: 'report' },
  'OWASP agentic threat taxonomy': { jur: 'International', type: 'law' },
  'Test-Achats ruling': { jur: 'European Union', type: 'court' },
  'NAIC AI Model Bulletin': { jur: 'United States', type: 'law' },
  'Ogletree v. Cleveland State University': { jur: 'United States', type: 'court' },
  'VU Amsterdam proctoring complaint': { jur: 'Netherlands', type: 'court' },
  'Biden robocall deepfake': { jur: 'United States', type: 'fine' },
  'FCC ruling on AI voices': { jur: 'United States', type: 'law' },
  'MCP tool poisoning disclosure': { jur: 'International', type: 'report' },
};

export interface Case extends Incident {
  lab: LabDef;
  sector: string;
  family: TierId;
  harms: RiskKey[];
  jur: string;
  type: OutcomeType;
  y: number;
}

/** the two or three harms that matter most for an example */
function harmsOf(lab: LabDef): RiskKey[] {
  const sum: Partial<Record<RiskKey, number>> = {};
  for (const s of lab.stressors) for (const [k, v] of Object.entries(s.risk)) sum[k as RiskKey] = (sum[k as RiskKey] ?? 0) + (v ?? 0);
  return RISKS.map((r) => r.key).filter((k) => (sum[k] ?? 0) >= 25).sort((a, b) => (sum[b] ?? 0) - (sum[a] ?? 0)).slice(0, 3);
}

export const CASES: Case[] = LABS.flatMap((lab) => lab.incidents.map((inc) => {
  const m = META[inc.title] ?? { jur: 'International', type: 'report' as OutcomeType };
  return {
    ...inc,
    url: inc.url ?? m.url,
    source: inc.source ?? m.source,
    lab,
    sector: SECTOR[lab.id] ?? 'Other',
    family: lab.tier,
    harms: harmsOf(lab),
    jur: m.jur,
    type: m.type,
    y: parseInt(inc.year, 10) || 2000,
  };
})).sort((a, b) => b.y - a.y);
