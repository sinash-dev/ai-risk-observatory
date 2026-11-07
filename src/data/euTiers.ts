/**
 * The four risk levels of the EU AI Act, top (most restricted) to bottom.
 * Dates and articles checked against the consolidated text of 27 July 2026
 * (Arts. 5, 6, 50, 99, 111 and 113, as amended by Regulation (EU) 2026/1744).
 */
import { SEV } from './palette';

export type TierKey = 'prohibited' | 'high' | 'limited' | 'minimal';
export interface EuTier {
  key: TierKey;
  label: string;
  color: string;
  /** one line under the label */
  rule: string;
  when: string;
  covers: string;
  duties: string[];
  fine: string;
  refs: string;
}

export const EU_TIERS: EuTier[] = [
  {
    key: 'prohibited', label: 'Banned', color: SEV.severe,
    rule: 'Not allowed at all',
    when: 'Since 2 February 2025. Two further bans, on AI that creates non-consensual intimate images or child sexual abuse material, apply from 2 December 2026.',
    covers: 'Practices judged incompatible with fundamental rights: social scoring, manipulation that causes significant harm, exploiting people’s vulnerabilities, emotion recognition at work or in education, untargeted scraping of faces, some uses of biometrics and predictive policing.',
    duties: ['Do not place on the market, put into service or use.', 'Narrow exceptions exist only for some police uses of real-time biometric identification.'],
    fine: 'Up to €35 million or 7% of worldwide annual turnover, whichever is higher.',
    refs: 'Art. 5',
  },
  {
    key: 'high', label: 'High-risk', color: SEV.high,
    rule: 'Allowed, with strict duties',
    when: 'From 2 December 2027 for the uses listed in Annex III; from 2 August 2028 for AI inside products such as medical devices and machinery (Annex I).',
    covers: 'Uses where a mistake can seriously affect people’s lives: hiring and managing staff, credit scoring, life and health insurance pricing, education, access to public benefits, biometrics, critical infrastructure, law enforcement, migration and justice.',
    duties: ['Providers: risk management, data governance, technical documentation, logging, human oversight, accuracy and security, a quality management system, conformity assessment, CE marking and registration.', 'Deployers: use as instructed, assign trained human oversight, keep logs, inform workers and affected people, and in some cases assess the impact on fundamental rights.'],
    fine: 'Up to €15 million or 3% of worldwide annual turnover, whichever is higher.',
    refs: 'Arts. 6–27, 43–49, Annexes I and III',
  },
  {
    key: 'limited', label: 'Transparency duties', color: SEV.mid,
    rule: 'Allowed, if people are told',
    when: 'Since 2 August 2026. Generative systems already on the market before then must add machine-readable marking by 2 December 2026.',
    covers: 'Chatbots and other systems that talk to people, AI-generated or manipulated content such as deepfakes, and emotion recognition or biometric categorisation where these are allowed.',
    duties: ['Tell people they are dealing with an AI unless it is obvious.', 'Mark generated content in a machine-readable way and disclose deepfakes.'],
    fine: 'Up to €15 million or 3% of worldwide annual turnover, whichever is higher.',
    refs: 'Art. 50',
  },
  {
    key: 'minimal', label: 'Minimal risk', color: SEV.neutral,
    rule: 'Allowed, no specific duties',
    when: 'The AI literacy duty has applied to every provider and deployer since 2 February 2025.',
    covers: 'Most AI in use today: spam filters, recommendations, forecasting, translation, code assistants and similar tools.',
    duties: ['Take measures to support the AI literacy of staff (Art. 4).', 'Voluntary codes of conduct are encouraged. Other laws, such as the GDPR and consumer law, still apply.'],
    fine: 'No AI Act fine for the system itself; other laws still apply.',
    refs: 'Arts. 4 and 95',
  },
];

export const TIER_BY_KEY = Object.fromEntries(EU_TIERS.map((t) => [t.key, t])) as Record<TierKey, EuTier>;

/** register / classifier category -> pyramid level (general-purpose models sit outside the pyramid) */
export function tierOfCategory(c: string): TierKey | null {
  return c === 'banned' || c === 'prohibited' ? 'prohibited' : c === 'high' ? 'high' : c === 'limited' ? 'limited' : c === 'minimal' ? 'minimal' : null;
}
