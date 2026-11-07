/**
 * Sector guides: which rules bite in each sector, which examples and templates to use.
 * EU references checked against the consolidated AI Act of 27 July 2026 (including Regulation (EU) 2026/1744).
 */
export interface SectorRule { ref: string; text: string }
export type Level = 'yes' | 'some' | 'no';
export interface MatrixCell { level: Level; note: string }
export interface Sector {
  id: string;
  /** at-a-glance comparison on the index page */
  matrix: { banned: MatrixCell; high: MatrixCell; fria: MatrixCell; product: MatrixCell };
  name: string;
  intro: string;
  uses: string[];
  /** EU AI Act points that apply */
  eu: SectorRule[];
  /** other laws and guidance */
  other: SectorRule[];
  /** example ids on this site */
  labs: string[];
  /** toolkit files */
  templates: string[];
  steps: string[];
}

const HR_DATES = 'High-risk duties for Annex III systems apply from 2 December 2027.';

export const SECTORS: Sector[] = [
  {
    id: 'finance',
    matrix: { banned: { level: 'no', note: 'None specific' }, high: { level: 'yes', note: 'Credit scoring, 5(b)' }, fria: { level: 'yes', note: 'Every deployer of 5(b)' }, product: { level: 'no', note: 'Not usually' } },
    name: 'Banking and credit',
    intro: 'Credit decisions are one of the clearest high-risk uses in the EU AI Act, and they also sit under data protection and consumer credit rules that already apply today.',
    uses: ['Credit scoring and affordability checks', 'Fraud and money-laundering detection', 'Customer segmentation and marketing', 'Customer-service chatbots'],
    eu: [
      { ref: 'Annex III, point 5(b)', text: `Evaluating the creditworthiness of people or setting their credit score is high-risk. Systems used to detect financial fraud are excluded. ${HR_DATES}` },
      { ref: 'Art. 27', text: 'Deployers that use credit scoring must carry out a fundamental-rights impact assessment before first use.' },
      { ref: 'Arts. 17(4), 26(5) and (6), 72(4)', text: 'Financial institutions under EU internal-governance rules can meet parts of the quality management, monitoring and log-keeping duties through those existing rules.' },
      { ref: 'Art. 50', text: 'Chatbots must tell customers they are dealing with an AI, already since 2 August 2026.' },
    ],
    other: [
      { ref: 'GDPR Art. 22; CJEU C-634/21 (SCHUFA, 7 December 2023)', text: 'A credit score can itself be an automated decision when a lender draws strongly on it to decide on a contract. Then people have the right to human intervention and to contest the decision.' },
      { ref: 'US: ECOA and Regulation B; CFPB Circular 2022-03', text: 'Lenders must give specific reasons for adverse action, even when a complex model made the decision.' },
      { ref: 'US: Colorado SB 26-189', text: 'From 1 January 2027, covers automated decision-making that materially influences consequential decisions about Colorado residents. Check whether your use falls under its definitions.' },
    ],
    labs: ['credit', 'fraud', 'segments', 'chatbot'],
    templates: ['eu-deployer-pack-art26.md', 'fundamental-rights-impact-assessment.md', 'dpia-ai-supplement.md', 'model-card.md', 'vendor-ai-questionnaire.md'],
    steps: ['List every model that feeds a credit decision, including scores bought from credit bureaus.', 'Check which ones are fraud-only (excluded from Annex III, point 5(b)) and which affect creditworthiness.', 'Test performance by group and keep the results; regulators and courts ask for them.', 'Make sure staff can explain and override a decision, and that customers can contest it.'],
  },
  {
    id: 'insurance',
    matrix: { banned: { level: 'no', note: 'None specific' }, high: { level: 'some', note: 'Life and health only, 5(c)' }, fria: { level: 'some', note: 'Every deployer of 5(c)' }, product: { level: 'no', note: 'Not usually' } },
    name: 'Insurance',
    intro: 'Only life and health insurance pricing and risk assessment are high-risk under the EU AI Act. Motor, home and other lines are not in Annex III, but discrimination and data protection rules still apply to them.',
    uses: ['Risk assessment and pricing', 'Claims triage and fraud detection', 'Customer-service chatbots', 'Marketing and retention models'],
    eu: [
      { ref: 'Annex III, point 5(c)', text: `Risk assessment and pricing for individuals in life and health insurance is high-risk. ${HR_DATES}` },
      { ref: 'Art. 27', text: 'Deployers using these systems must carry out a fundamental-rights impact assessment before first use.' },
      { ref: 'Art. 50', text: 'Chatbots must disclose that they are AI.' },
    ],
    other: [
      { ref: 'CJEU C-236/09 (Test-Achats, 1 March 2011)', text: 'Insurers in the EU may not use sex as a factor that leads to different premiums and benefits for individuals. Watch for models that rebuild it from proxies.' },
      { ref: 'GDPR Art. 9', text: 'Health data is a special category of personal data with stricter conditions for processing.' },
      { ref: 'US: NAIC Model Bulletin on AI (December 2023)', text: 'Adopted by many US states. Insurers need a written AI programme with governance, risk management and controls over third-party models.' },
    ],
    labs: ['insurance', 'fraud', 'chatbot'],
    templates: ['eu-deployer-pack-art26.md', 'fundamental-rights-impact-assessment.md', 'ai-risk-assessment.md', 'model-card.md'],
    steps: ['Separate life and health pricing models (high-risk) from other lines.', 'Check rating factors for proxies of sex, ethnicity or health that the law does not allow.', 'Document how a customer can ask for a human review of their price or claim.'],
  },
  {
    id: 'employment',
    matrix: { banned: { level: 'yes', note: 'Emotion recognition at work' }, high: { level: 'yes', note: 'Points 4(a) and 4(b)' }, fria: { level: 'some', note: 'Public bodies and public services' }, product: { level: 'no', note: 'Not usually' } },
    name: 'Employment and HR',
    intro: 'Most AI used on job candidates or staff is high-risk in the EU, and one practice is banned outright. Hiring tools are also among the most regulated uses in the US.',
    uses: ['CV screening and candidate ranking', 'Targeted job adverts', 'Performance monitoring and task allocation', 'Pay and promotion decisions'],
    eu: [
      { ref: 'Annex III, point 4(a)', text: `Recruitment and selection, including targeted job adverts, filtering applications and evaluating candidates, is high-risk. ${HR_DATES}` },
      { ref: 'Annex III, point 4(b)', text: 'Decisions on terms of work, promotion or termination, allocating tasks based on behaviour or personal traits, and monitoring or evaluating performance are high-risk.' },
      { ref: 'Art. 5(1)(f)', text: 'Inferring emotions of people at work is banned, except for medical or safety reasons. Banned since 2 February 2025.' },
      { ref: 'Art. 26(7)', text: 'Employers must inform workers’ representatives and affected workers before using a high-risk system at work.' },
    ],
    other: [
      { ref: 'US: NYC Local Law 144', text: 'Automated hiring and promotion tools need a yearly independent bias audit, a published summary and notice to candidates 10 business days before use.' },
      { ref: 'US: Colorado SB 26-189', text: 'From 1 January 2027, covers automated decision-making that materially influences consequential decisions about Colorado residents. Check whether your use falls under its definitions.' },
      { ref: 'GDPR Arts. 22 and 88', text: 'Limits on solely automated decisions, and room for national rules on processing employees’ data.' },
    ],
    labs: ['cv', 'salary', 'emotion', 'staffing'],
    templates: ['nyc-ll144-notice-and-audit-summary.md', 'eu-deployer-pack-art26.md', 'vendor-ai-questionnaire.md', 'human-oversight-checklist.md'],
    steps: ['Ask every HR software vendor which features use AI; many are switched on by default.', 'Stop any emotion recognition of staff in the EU.', 'Plan the information to works councils or worker representatives early; national consultation rules may apply too.', 'Keep selection rates by group so you can spot adverse impact.'],
  },
  {
    id: 'health',
    matrix: { banned: { level: 'no', note: 'None specific' }, high: { level: 'some', note: 'Triage 5(d), public eligibility 5(a)' }, fria: { level: 'some', note: 'Public bodies and public services' }, product: { level: 'yes', note: 'Medical devices (MDR, IVDR)' } },
    name: 'Health care',
    intro: 'AI that is a medical device follows the medical device rules first; the AI Act adds to them. Hospitals also use AI for planning and triage, which raises different questions.',
    uses: ['Diagnostic support and image analysis', 'Emergency triage', 'Staffing and capacity forecasts', 'Patient chatbots'],
    eu: [
      { ref: 'Art. 6(1); Annex I, Section A (MDR and IVDR)', text: 'AI that is, or is a safety component of, a medical device needing a notified body assessment is high-risk. These duties apply from 2 August 2028.' },
      { ref: 'Annex III, point 5(d)', text: `Emergency healthcare patient triage systems, and systems that dispatch or set priorities for emergency services, are high-risk. ${HR_DATES}` },
      { ref: 'Annex III, point 5(a)', text: 'Public authorities using AI to decide eligibility for essential public services, including healthcare services, are using a high-risk system.' },
    ],
    other: [
      { ref: 'GDPR Art. 9', text: 'Health data is a special category of personal data with stricter conditions for processing.' },
      { ref: 'MDR (Regulation (EU) 2017/745) and IVDR (Regulation (EU) 2017/746)', text: 'Software intended for diagnosis or treatment may be a medical device, with its own classification, clinical evaluation and post-market duties.' },
    ],
    labs: ['lesion', 'staffing', 'chatbot'],
    templates: ['ai-risk-assessment.md', 'model-card.md', 'eu-post-market-monitoring-plan-art72.md', 'dpia-ai-supplement.md'],
    steps: ['Check whether the software is a medical device before anything else.', 'Validate on your own patients; models often perform worse outside the hospital that built them.', 'Report performance by skin tone, sex and age where relevant.'],
  },
  {
    id: 'public',
    matrix: { banned: { level: 'yes', note: 'Social scoring' }, high: { level: 'yes', note: 'Points 5(a), 6, 7 and 8' }, fria: { level: 'yes', note: 'Public bodies, for Annex III systems' }, product: { level: 'no', note: 'Not usually' } },
    name: 'Public sector',
    intro: 'Public bodies face extra duties under the EU AI Act, and the best-known AI failures in Europe happened in public administration.',
    uses: ['Eligibility for benefits and services', 'Fraud and risk flags', 'Citizen chatbots and internal assistants', 'Law enforcement and migration'],
    eu: [
      { ref: 'Annex III, point 5(a)', text: `Evaluating eligibility for essential public benefits and services, or granting, reducing, revoking or reclaiming them, is high-risk. ${HR_DATES}` },
      { ref: 'Annex III, points 6, 7 and 8', text: 'Many uses in law enforcement, migration, asylum and border control, and the administration of justice are high-risk.' },
      { ref: 'Art. 27', text: 'Public bodies, and private entities providing public services, must carry out a fundamental-rights impact assessment before using a high-risk system (except for critical infrastructure).' },
      { ref: 'Arts. 26(8) and 49(3)', text: 'Public authorities must register their use of Annex III systems in the EU database, and must not use a system the provider has not registered.' },
      { ref: 'Art. 5(1)(c)', text: 'Social scoring is banned where it leads to unfavourable treatment in unrelated contexts, or to treatment that is unjustified or disproportionate.' },
    ],
    other: [
      { ref: 'District Court of The Hague, SyRI (5 February 2020)', text: 'The Dutch welfare-fraud risk system was struck down for breaching the right to private life under the European Convention on Human Rights.' },
      { ref: 'US: OMB M-25-21', text: 'Federal agencies must apply minimum risk practices, including human oversight, to high-impact AI.' },
    ],
    labs: ['benefits', 'face', 'chatbot', 'rag'],
    templates: ['fundamental-rights-impact-assessment.md', 'eu-deployer-pack-art26.md', 'ai-use-case-intake.md', 'ai-incident-report.md'],
    steps: ['Build a public register of the AI systems you use; several cities already do.', 'Run the fundamental-rights impact assessment before first use, not after a complaint.', 'Give people a clear way to challenge a decision and reach a person.'],
  },
  {
    id: 'education',
    matrix: { banned: { level: 'yes', note: 'Emotion recognition of students' }, high: { level: 'yes', note: 'Points 3(a) to 3(d)' }, fria: { level: 'some', note: 'Public bodies and public services' }, product: { level: 'no', note: 'Not usually' } },
    name: 'Education',
    intro: 'Admissions, grading and exam proctoring are high-risk in the EU, and emotion recognition of students is banned.',
    uses: ['Admissions and placement', 'Automated marking and feedback', 'Exam proctoring', 'Student-facing chatbots'],
    eu: [
      { ref: 'Annex III, point 3', text: `High-risk uses include deciding access or admission (3(a)), evaluating learning outcomes (3(b)), assessing the level of education someone will receive (3(c)) and monitoring for prohibited behaviour during tests (3(d)). ${HR_DATES}` },
      { ref: 'Art. 5(1)(f)', text: 'Inferring the emotions of students in education institutions is banned, except for medical or safety reasons.' },
      { ref: 'Art. 4', text: 'Schools and universities that use AI must take measures to support the AI literacy of their staff.' },
    ],
    other: [
      { ref: 'US: Ogletree v. Cleveland State University (2022)', text: 'A federal court held that a remote room scan before an online exam was an unreasonable search under the Fourth Amendment.' },
      { ref: 'GDPR', text: 'Students’ data, often of minors, needs a clear lawful basis; webcam proctoring usually needs a data protection impact assessment.' },
    ],
    labs: ['exam', 'chatbot', 'rag'],
    templates: ['dpia-ai-supplement.md', 'eu-deployer-pack-art26.md', 'human-oversight-checklist.md', 'eu-transparency-notices-art50.md'],
    steps: ['Offer a non-AI alternative for proctored exams where you can.', 'Have a person review every flag before it affects a student.', 'Tell students in plain language what is monitored and why.'],
  },
];

export const SECTOR_BY_ID = Object.fromEntries(SECTORS.map((s) => [s.id, s])) as Record<string, Sector>;
