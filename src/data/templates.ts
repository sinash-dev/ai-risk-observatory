/** Toolkit templates (files in public/toolkit). */
export interface Template { file: string; title: string; desc: string; icon: string; pack?: string }
export const TEMPLATES: Template[] = [
  { file: 'ai-use-case-intake.md', title: 'AI use case intake', desc: 'A one-page screening form for new AI ideas, purchases and pilots.', icon: '◎' },
  { file: 'ai-system-inventory.csv', title: 'AI system inventory', desc: 'A spreadsheet register of every AI system: owner, purpose, category and review dates.', icon: '▦' },
  { file: 'ai-risk-assessment.md', title: 'AI risk assessment', desc: 'Context, a risk table with likelihood and severity, testing evidence and residual risk sign-off.', icon: '△' },
  { file: 'fundamental-rights-impact-assessment.md', title: 'Fundamental-rights impact assessment', desc: 'Structured on the six elements of EU AI Act Art. 27(1).', icon: '⚖' },
  { file: 'dpia-ai-supplement.md', title: 'DPIA supplement for AI', desc: 'AI-specific questions to add to a GDPR data protection impact assessment.', icon: '🔒' },
  { file: 'model-card.md', title: 'Model card', desc: 'Intended use, data, performance by group, limits and monitoring.', icon: '▤' },
  { file: 'human-oversight-checklist.md', title: 'Human oversight checklist', desc: 'What overseers must be able to do under EU AI Act Art. 14.', icon: '◉' },
  { file: 'vendor-ai-questionnaire.md', title: 'Vendor AI questionnaire', desc: 'Fifteen questions to ask suppliers of AI systems and features.', icon: '⇄' },
  { file: 'ai-incident-report.md', title: 'AI incident report', desc: 'Impact, immediate actions, reporting duties and root cause.', icon: '!' },
  { file: 'agent-authorisation-matrix.md', title: 'Agent authorisation matrix', desc: 'Tools, scope, limits, approval gates, logging and kill switch for each AI agent.', icon: '⌘' },
  { file: 'workshop-facilitator-guide.md', title: 'Workshop facilitator guide', desc: 'A 60-minute session plan with learning objectives, timings, notes for each activity, common misconceptions and follow-up.', icon: '✎' },
  { file: 'evidence-checklist.md', title: 'Evidence checklist', desc: 'What an auditor or regulator may ask to see under the EU AI Act, GDPR, ISO/IEC 42001 and NYC Local Law 144.', icon: '✓' },
  { file: 'eu-deployer-pack-art26.md', title: 'Deployer pack (Art. 26)', desc: 'Every duty of an organisation that uses a high-risk system, with room for evidence, plus a notice to affected people.', icon: '◧', pack: 'EU AI Act' },
  { file: 'eu-transparency-notices-art50.md', title: 'Transparency notices (Art. 50)', desc: 'Sample wording for chatbots, deepfakes, published AI text and emotion recognition, with the exceptions.', icon: '◫', pack: 'EU AI Act' },
  { file: 'eu-technical-documentation-annex-iv.md', title: 'Technical documentation (Annex IV)', desc: 'An outline of the nine Annex IV points for providers of high-risk systems.', icon: '▥', pack: 'EU AI Act' },
  { file: 'eu-quality-management-system-art17.md', title: 'Quality management system (Art. 17)', desc: 'Map the 13 required aspects to your documents and find the gaps. Notes on EN 18286.', icon: '▣', pack: 'EU AI Act' },
  { file: 'eu-post-market-monitoring-plan-art72.md', title: 'Post-market monitoring plan (Art. 72)', desc: 'What to monitor, where the data comes from, and serious incident deadlines.', icon: '◔', pack: 'EU AI Act' },
  { file: 'eu-declaration-of-conformity-annex-v.md', title: 'Declaration of conformity (Annex V)', desc: 'The eight required elements, with a check before signing.', icon: '✍', pack: 'EU AI Act' },
  { file: 'iso42001-statement-of-applicability.csv', title: 'Statement of Applicability (ISO/IEC 42001)', desc: 'A spreadsheet for the Annex A controls you select, with justification, status and evidence.', icon: '▦', pack: 'ISO/IEC 42001' },
  { file: 'nyc-ll144-notice-and-audit-summary.md', title: 'NYC Local Law 144 notice and audit summary', desc: 'Candidate notice and the published bias audit summary for automated hiring tools.', icon: '⌂', pack: 'United States' },
  { file: 'kr-ai-basic-act-notices.md', title: 'Korea AI Basic Act notices (Art. 31)', desc: 'Advance notice, output labels and deepfake marking, drafted in English to translate.', icon: '◇', pack: 'Korea' },
];
export const TEMPLATE_BY_FILE = Object.fromEntries(TEMPLATES.map((t) => [t.file, t])) as Record<string, Template>;
