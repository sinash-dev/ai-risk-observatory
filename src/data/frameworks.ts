export type FwId = 'eu' | 'us' | 'nist' | 'iso' | 'owasp' | 'gdpr';
export type Lens = 'all' | FwId;

export interface FwCat { id: string; label: string; color: string; desc: string }
/** [requirement in plain words, reference, safeguard ids in the demo that address it] */
export type Req = [string, string, string[]?];
export interface FwEntry { cat: string; status: string; summary: string; reqs: Req[] }

export interface Framework {
  id: FwId;
  name: string;
  short: string;
  type: string;
  where: string;
  binding: string;
  intro: string;
  who: string;
  approach: string;
  cats: FwCat[];
  catsTitle: string;
  keyReqs: { t: string; d: string }[];
  keyTitle: string;
  timeline: { date: string; text: string }[];
  penalties: string;
  sources: { label: string; url: string }[];
}

export const FRAMEWORKS: Framework[] = [
  {
    id: 'eu',
    name: 'EU AI Act',
    short: 'EU AI Act',
    type: 'Law',
    where: 'European Union',
    binding: 'Binding law',
    intro:
      'The EU AI Act (Regulation (EU) 2024/1689) is the first broad law on artificial intelligence. It sorts AI uses by how much harm they could cause and sets duties to match. A few uses are banned outright. A defined list of high-risk uses must meet strict requirements before and after launch. Some systems only need to be transparent with the people using them. Everything else is left largely alone. Separate rules apply to the general-purpose models, such as large language models, that many products are built on.',
    who:
      'Anyone who puts an AI system on the EU market or uses one in the EU, including companies based outside the EU. Duties depend on your role. The provider (the organisation that develops the system and sells it under its name) carries most of them. The deployer (the organisation that uses it in its work) has a shorter list. Importers and distributors have checking duties.',
    approach:
      'Risk-based. You first work out which category your use falls into. The category, not the technology, decides what you must do. A logistic regression used to score loans is high-risk; a large language model used to write marketing copy is not.',
    catsTitle: 'The risk categories',
    cats: [
      { id: 'prohibited', label: 'Banned', color: '#7d1d1d', desc: 'Not allowed since 2 February 2025. Examples: social scoring, emotion recognition at work or in schools, manipulative techniques that cause significant harm, untargeted scraping of faces to build databases.' },
      { id: 'high', label: 'High-risk', color: '#c0392b', desc: 'Uses listed in Annex III (employment, credit, public benefits, education, biometrics, critical infrastructure, policing, migration, justice) and safety components of regulated products such as medical devices.' },
      { id: 'gpai', label: 'General-purpose AI model', color: '#7e57a8', desc: 'Duties for the providers of models such as large language models: documentation, a copyright policy and a public summary of training data. The most capable models have extra safety duties.' },
      { id: 'limited', label: 'Transparency duties', color: '#c98a1b', desc: 'People must be told when they are talking to an AI, and AI-generated or manipulated content must be marked or disclosed.' },
      { id: 'minimal', label: 'Minimal risk', color: '#8a9099', desc: 'No specific duties beyond AI literacy for staff. Voluntary codes of conduct are encouraged. Other laws, such as GDPR and consumer law, still apply.' },
      { id: 'depends', label: 'Depends on use', color: '#5f7387', desc: 'The category follows the task. The same agent can be minimal risk in one job and high-risk in another.' },
    ],
    keyTitle: 'What high-risk systems need',
    keyReqs: [
      { t: 'Risk management system (Art. 9)', d: 'A documented process to identify, assess and reduce risks, run for the whole life of the system.' },
      { t: 'Data and data governance (Art. 10)', d: 'Training, validation and test data must be relevant, representative, as error-free as possible and examined for bias.' },
      { t: 'Technical documentation and logs (Arts. 11–12)', d: 'Enough documentation for an authority to check compliance, and automatic event logs to trace what happened.' },
      { t: 'Transparency to deployers (Art. 13)', d: 'Clear instructions for use, including accuracy, known limits and the human oversight needed.' },
      { t: 'Human oversight (Art. 14)', d: 'People must be able to understand the output, decide not to use it, override it and stop the system.' },
      { t: 'Accuracy, robustness and cybersecurity (Art. 15)', d: 'Declared accuracy levels, resilience to errors and to attacks such as data poisoning and adversarial inputs.' },
      { t: 'Quality management, conformity assessment and registration (Arts. 17, 43, 49)', d: 'A quality system, a conformity check before launch (CE marking) and registration in the EU database.' },
      { t: 'Monitoring and incident reporting (Arts. 72–73)', d: 'Watch performance after launch and report serious incidents to the authorities.' },
      { t: 'Deployer duties (Arts. 26–27)', d: 'Use it as instructed, assign trained people to oversee it, keep logs, inform workers and affected people. Public bodies and credit or insurance deployers must assess the impact on fundamental rights first.' },
      { t: 'AI literacy for everyone (Art. 4)', d: 'All providers and deployers, whatever the risk level, must make sure their staff understand the AI they work with.' },
    ],
    timeline: [
      { date: 'Aug 2024', text: 'Enters into force.' },
      { date: 'Feb 2025', text: 'Bans and AI-literacy duty apply.' },
      { date: 'Aug 2025', text: 'Rules for general-purpose AI models, governance and penalties apply.' },
      { date: 'Aug 2026', text: 'Most remaining rules apply, including Annex III high-risk systems and transparency duties.' },
      { date: 'Aug 2027', text: 'High-risk rules for AI inside regulated products (Annex I), such as medical devices.' },
    ],
    penalties:
      'Up to €35 million or 7% of worldwide annual turnover for banned practices. Up to €15 million or 3% for most other breaches. Up to €7.5 million or 1% for giving regulators incorrect information. Lower caps apply to small companies. Note: in November 2025 the European Commission proposed a "Digital Omnibus" package that would push back some high-risk deadlines. Check the current status before relying on the dates above.',
    sources: [
      { label: 'Regulation (EU) 2024/1689 on EUR-Lex', url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj' },
      { label: 'European Commission: AI Act overview', url: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai' },
    ],
  },
  {
    id: 'us',
    name: 'United States: federal and state rules',
    short: 'US laws',
    type: 'Law (patchwork)',
    where: 'United States',
    binding: 'Binding, varies by sector and state',
    intro:
      'There is no single federal AI law in the United States. AI is governed mainly by existing laws that apply to the decision being made, such as lending, hiring, health care and consumer protection, plus a growing number of state and city laws written for AI. Federal policy since 2025 has favoured fewer rules: the 2023 AI executive order was revoked in January 2025, and a December 2025 executive order directed federal agencies to challenge state AI laws seen as burdensome. Expect this picture to keep changing.',
    who:
      'It depends on the law. Sector laws apply to lenders, employers and health providers whatever technology they use. State AI laws mostly apply to companies that build or use AI to make important decisions about residents of that state, or to the largest model developers.',
    approach:
      'Use-based and fragmented. Ask two questions: which existing law already governs this decision, and does a state or city have an AI-specific rule for it?',
    catsTitle: 'How we classify each use',
    cats: [
      { id: 'specific', label: 'AI-specific law applies', color: '#1f4e8c', desc: 'A federal, state or city law written for AI or automated decisions covers this use, for example NYC Local Law 144, the Colorado AI Act, Illinois BIPA or California SB 53.' },
      { id: 'sector', label: 'Existing sector or privacy law', color: '#6b8fc4', desc: 'No AI-specific law, but established rules for this area (credit, employment, health, competition, privacy) apply to decisions made with AI.' },
      { id: 'general', label: 'General law only', color: '#9aa3ad', desc: 'Only general rules apply, mainly the FTC’s ban on unfair or deceptive practices, contract law and product liability.' },
    ],
    keyTitle: 'The main laws to know',
    keyReqs: [
      { t: 'FTC Act, Section 5', d: 'Bans unfair or deceptive practices, including false claims about AI and harmful AI use. The FTC has ordered companies to delete models trained on improperly obtained data.' },
      { t: 'Equal Credit Opportunity Act and FCRA', d: 'Lenders must give specific reasons for declining credit and must not discriminate, however complex the model.' },
      { t: 'Civil rights in employment (Title VII, ADA, ADEA)', d: 'Employers are responsible for discriminatory effects of hiring and HR tools, including tools bought from vendors.' },
      { t: 'FDA medical device rules', d: 'AI that diagnoses or treats needs FDA clearance. A predetermined change control plan can pre-approve planned model updates.' },
      { t: 'NYC Local Law 144 (2023)', d: 'Automated hiring and promotion tools need a yearly independent bias audit, a published summary and notice to candidates.' },
      { t: 'Colorado AI Act (SB 24-205)', d: 'Developers and deployers of high-risk AI used in consequential decisions must take reasonable care against algorithmic discrimination, run impact assessments and notify consumers. Effective 30 June 2026 after a delay.' },
      { t: 'California', d: 'SB 53 (2026): large frontier-model developers must publish safety frameworks and report critical safety incidents. AB 2013 (2026): training-data disclosure. SB 942: AI-content detection and disclosures. Privacy-agency rules on automated decision-making technology phase in from 2026–2027. Civil Rights Council rules on automated decisions in employment apply from October 2025.' },
      { t: 'Illinois', d: 'BIPA requires written consent before collecting biometric data such as face geometry, with private lawsuits allowed. HB 3773 (2026) bans discriminatory AI use in employment decisions.' },
      { t: 'Texas Responsible AI Governance Act (2026)', d: 'Bans certain intentionally harmful AI uses and sets disclosure duties for government agencies.' },
      { t: 'Utah AI Policy Act', d: 'Businesses in regulated professions must disclose when a consumer is dealing with generative AI.' },
    ],
    timeline: [
      { date: 'Jul 2023', text: 'NYC Local Law 144 enforcement begins.' },
      { date: 'May 2024', text: 'Colorado AI Act signed.' },
      { date: 'Jan 2025', text: 'Federal AI executive order of 2023 revoked.' },
      { date: 'Sep 2025', text: 'California SB 53 (frontier AI transparency) signed.' },
      { date: 'Dec 2025', text: 'Executive order targets state AI laws.' },
      { date: 'Jan 2026', text: 'California SB 53 and AB 2013, Texas TRAIGA and Illinois HB 3773 take effect.' },
      { date: 'Jun 2026', text: 'Colorado AI Act takes effect.' },
    ],
    penalties:
      'Varies by law. FTC orders can force companies to delete data and models. Credit and employment laws allow regulator action and lawsuits. Illinois BIPA allows $1,000–$5,000 per violation in private lawsuits. California SB 53 allows civil penalties of up to $1 million per violation. Colorado’s law is enforced by the state Attorney General.',
    sources: [
      { label: 'FTC: AI and your business', url: 'https://www.ftc.gov/business-guidance/artificial-intelligence' },
      { label: 'Colorado SB 24-205', url: 'https://leg.colorado.gov/bills/sb24-205' },
      { label: 'NYC Local Law 144 (AEDT)', url: 'https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page' },
    ],
  },
  {
    id: 'nist',
    name: 'NIST AI Risk Management Framework',
    short: 'NIST AI RMF',
    type: 'Voluntary framework',
    where: 'United States (used worldwide)',
    binding: 'Voluntary',
    intro:
      'The NIST AI Risk Management Framework (AI RMF 1.0, January 2023) is a voluntary guide from the US National Institute of Standards and Technology. It does not classify systems or create legal duties. Instead it gives organisations a shared way to find, measure and manage AI risks, organised in four functions. A Generative AI Profile (NIST AI 600-1, July 2024) adds twelve risks specific to generative models, such as confabulation and information integrity.',
    who:
      'Any organisation in any country. It is a common reference for US agencies and companies, and some state laws (Colorado, Texas) treat following a recognised framework like this one as evidence of reasonable care.',
    approach:
      'Process-based. Instead of asking "which category is this?", it asks "which qualities of a trustworthy system are most at stake here, and what are we doing in each of the four functions to protect them?"',
    catsTitle: 'The seven qualities of trustworthy AI (we show the one most at stake)',
    cats: [
      { id: 'fair', label: 'Fair, with harmful bias managed', color: '#b4446c', desc: 'Outcomes do not systematically disadvantage groups of people.' },
      { id: 'valid', label: 'Valid and reliable', color: '#2f6f9f', desc: 'The system does what it is meant to do, accurately, under expected conditions.' },
      { id: 'safe', label: 'Safe', color: '#b03a3a', desc: 'It does not endanger human life, health, property or the environment.' },
      { id: 'secure', label: 'Secure and resilient', color: '#b8612a', desc: 'It withstands attacks and recovers from unexpected events.' },
      { id: 'accountable', label: 'Accountable and transparent', color: '#8a6d1f', desc: 'Information about the system is available, and someone answers for its outcomes.' },
      { id: 'explainable', label: 'Explainable and interpretable', color: '#6d5bb0', desc: 'People can understand how it works and why it produced an output.' },
      { id: 'privacy', label: 'Privacy-enhanced', color: '#2f7d5b', desc: 'It protects people’s autonomy, identity and data.' },
    ],
    keyTitle: 'The four functions',
    keyReqs: [
      { t: 'Govern', d: 'Set the culture, policies, roles and accountability for AI risk across the organisation. This function supports the other three.' },
      { t: 'Map', d: 'Understand the context: what the system is for, who it affects, what could go wrong and how likely and severe that would be.' },
      { t: 'Measure', d: 'Test and track the system against the trustworthiness qualities, with metrics, independent review and ongoing evaluation.' },
      { t: 'Manage', d: 'Decide which risks to treat, treat them, monitor after launch, respond to incidents and retire systems safely.' },
      { t: 'Generative AI Profile (AI 600-1)', d: 'Twelve extra risks: CBRN information, confabulation, dangerous content, data privacy, environmental impact, harmful bias and homogenisation, human-AI configuration, information integrity, information security, intellectual property, obscene content, and value-chain integration.' },
    ],
    timeline: [
      { date: 'Jan 2023', text: 'AI RMF 1.0 published.' },
      { date: 'Mar 2023', text: 'Playbook with suggested actions released.' },
      { date: 'Jul 2024', text: 'Generative AI Profile (NIST AI 600-1) published.' },
    ],
    penalties: 'None. It is voluntary. But regulators, courts and customers may ask whether you followed recognised practice, and this is the most widely recognised in the US.',
    sources: [
      { label: 'NIST AI RMF', url: 'https://www.nist.gov/itl/ai-risk-management-framework' },
      { label: 'NIST AI 600-1 Generative AI Profile', url: 'https://doi.org/10.6028/NIST.AI.600-1' },
    ],
  },
  {
    id: 'iso',
    name: 'ISO/IEC 42001 AI management system',
    short: 'ISO/IEC 42001',
    type: 'Certifiable standard',
    where: 'International',
    binding: 'Voluntary, certifiable',
    intro:
      'ISO/IEC 42001:2023 is the international standard for an AI management system: the policies, roles and processes an organisation uses to develop or use AI responsibly. Like ISO 27001 for information security, an independent auditor can certify you against it. It is about how you run AI across the organisation, not about one model. Annex A lists 38 controls grouped into nine areas.',
    who:
      'Any organisation that develops, provides or uses AI. Certification is voluntary, but customers and procurement teams increasingly ask for it, and it helps show compliance with laws such as the EU AI Act.',
    approach:
      'Management-system based. You define your scope, assess AI risks and impacts, pick controls from Annex A (or justify leaving them out), run them, audit them and keep improving.',
    catsTitle: 'How much impact assessment each use needs',
    cats: [
      { id: 'high', label: 'Full impact assessment', color: '#1f5e5b', desc: 'Significant effects on individuals or society. Needs a documented impact assessment (A.5) and strong controls on data, oversight and monitoring.' },
      { id: 'medium', label: 'Standard controls', color: '#5fa39f', desc: 'Moderate effects. Standard life-cycle, data and monitoring controls, with a lighter impact assessment.' },
      { id: 'low', label: 'Light touch', color: '#a9c9c6', desc: 'Little direct effect on people. Basic policy, ownership and monitoring are enough.' },
    ],
    keyTitle: 'Annex A control areas',
    keyReqs: [
      { t: 'A.2 Policies related to AI', d: 'An AI policy approved by leadership, aligned with other policies.' },
      { t: 'A.3 Internal organisation', d: 'Clear roles and responsibilities, and a way for staff to report concerns.' },
      { t: 'A.4 Resources for AI systems', d: 'Documented data, tools, computing and people needed for each system.' },
      { t: 'A.5 Assessing impacts of AI systems', d: 'A process to assess effects on individuals, groups and society, and to record the results.' },
      { t: 'A.6 AI system life cycle', d: 'Responsible design, verification and validation, deployment, operation, monitoring, technical documentation and event logs.' },
      { t: 'A.7 Data for AI systems', d: 'Rules for acquiring data, its quality, provenance and preparation.' },
      { t: 'A.8 Information for interested parties', d: 'Documentation for users, a way to report adverse effects, and communicating incidents.' },
      { t: 'A.9 Use of AI systems', d: 'Processes and objectives for responsible use, and keeping to the intended use.' },
      { t: 'A.10 Third-party and customer relationships', d: 'Allocating responsibilities with suppliers and customers, and managing suppliers.' },
      { t: 'Related standards', d: 'ISO/IEC 23894 (AI risk management guidance), ISO/IEC 42005 (AI impact assessment, 2025) and ISO/IEC 42006 (rules for certification bodies, 2025).' },
    ],
    timeline: [
      { date: 'Dec 2023', text: 'ISO/IEC 42001 published.' },
      { date: '2024', text: 'First accredited certifications issued.' },
      { date: '2025', text: 'ISO/IEC 42005 (impact assessment) and 42006 (certification bodies) published.' },
    ],
    penalties: 'None. The consequence of falling short is failing or losing certification, which can matter in tenders and customer contracts.',
    sources: [{ label: 'ISO/IEC 42001:2023', url: 'https://www.iso.org/standard/81230.html' }],
  },
  {
    id: 'owasp',
    name: 'OWASP security guidance for AI',
    short: 'OWASP',
    type: 'Security guidance',
    where: 'International',
    binding: 'Voluntary',
    intro:
      'OWASP is a non-profit security community. Its Top 10 lists are practical summaries of the most important attacks and weaknesses, used by developers, security teams and auditors. Three lists matter for AI: the Machine Learning Security Top 10 (2023) for classical and deep learning models, the Top 10 for LLM Applications (2025) for generative AI, and the agentic AI threat guidance (2025) for agents.',
    who: 'Anyone building or securing AI systems. It is not law, but it is the reference most security reviews and penetration tests are based on.',
    approach: 'Threat-based. It lists how attackers and failures actually break AI systems, with prevention advice for each.',
    catsTitle: 'Which list applies',
    cats: [
      { id: 'ml', label: 'ML Security Top 10', color: '#3f6e8c', desc: 'Attacks on trained models and their data: input manipulation, data poisoning, model inversion, membership inference, model theft and more.' },
      { id: 'llm', label: 'LLM Top 10 (2025)', color: '#c27c2c', desc: 'Weaknesses of applications built on large language models, from prompt injection to unbounded consumption.' },
      { id: 'agentic', label: 'Agentic AI threats', color: '#a33c2a', desc: 'Threats that appear when models act with tools and autonomy: goal hijacking, tool misuse, privilege abuse, memory poisoning and cascading failures.' },
    ],
    keyTitle: 'The lists',
    keyReqs: [
      { t: 'ML Security Top 10 (2023)', d: 'ML01 Input manipulation · ML02 Data poisoning · ML03 Model inversion · ML04 Membership inference · ML05 Model theft · ML06 AI supply chain attacks · ML07 Transfer learning attack · ML08 Model skewing · ML09 Output integrity attack · ML10 Model poisoning.' },
      { t: 'Top 10 for LLM Applications (2025)', d: 'LLM01 Prompt injection · LLM02 Sensitive information disclosure · LLM03 Supply chain · LLM04 Data and model poisoning · LLM05 Improper output handling · LLM06 Excessive agency · LLM07 System prompt leakage · LLM08 Vector and embedding weaknesses · LLM09 Misinformation · LLM10 Unbounded consumption.' },
      { t: 'Agentic AI threats (2025)', d: 'Goal hijacking through injected instructions · tool misuse · identity and privilege abuse · memory and context poisoning · cascading failures · insecure communication between agents · rogue agents · exploiting human trust in the agent.' },
    ],
    timeline: [
      { date: '2023', text: 'Machine Learning Security Top 10 published.' },
      { date: 'Nov 2024', text: 'Top 10 for LLM Applications, 2025 edition.' },
      { date: '2025', text: 'Agentic AI threats and mitigations guidance.' },
    ],
    penalties: 'None. It is guidance. But a breach caused by a well-known weakness on these lists is hard to defend to regulators, customers or a court.',
    sources: [
      { label: 'OWASP ML Security Top 10', url: 'https://owasp.org/www-project-machine-learning-security-top-10/' },
      { label: 'OWASP GenAI Security Project', url: 'https://genai.owasp.org/' },
    ],
  },
  {
    id: 'gdpr',
    name: 'General Data Protection Regulation',
    short: 'GDPR',
    type: 'Law',
    where: 'European Union and EEA (UK has its own version)',
    binding: 'Binding law',
    intro:
      'The GDPR applies whenever personal data is used, including to train, test or run an AI model. In Europe it is often the first law that applies to AI in practice: data protection authorities have already fined and restricted AI companies under it, and the EU’s top court has ruled on how it covers credit scores and automated decisions.',
    who: 'Any organisation that processes personal data of people in the EU, wherever the organisation is based.',
    approach:
      'Principle-based. Every use of personal data needs a lawful basis and must respect the core principles. Extra protection applies to sensitive data and to decisions made about people without human involvement.',
    catsTitle: 'How much GDPR matters for each use',
    cats: [
      { id: 'art22', label: 'Automated decisions about people', color: '#2c5f8a', desc: 'The system makes or heavily shapes decisions with legal or similarly significant effects on people. Article 22 safeguards apply: human review, the right to contest and an explanation of the logic.' },
      { id: 'special', label: 'Sensitive data', color: '#5b3f8c', desc: 'Uses special-category data such as health, biometrics for identification, or data revealing ethnicity or religion. Article 9 forbids this unless a specific exception applies.' },
      { id: 'personal', label: 'Personal data, standard duties', color: '#7f9bb8', desc: 'Uses personal data, so the normal rules apply: lawful basis, transparency, minimisation, security and people’s rights.' },
      { id: 'low', label: 'Little personal data', color: '#b7c2cc', desc: 'Mainly uses aggregated or non-personal data. GDPR plays a minor role.' },
    ],
    keyTitle: 'The duties that matter most for AI',
    keyReqs: [
      { t: 'Lawful basis (Art. 6)', d: 'Every use of personal data, including model training, needs a legal basis such as consent, contract or legitimate interest.' },
      { t: 'Core principles (Art. 5)', d: 'Use data only for clear purposes, collect no more than needed, keep it accurate, and do not keep it longer than necessary.' },
      { t: 'Transparency (Arts. 13–15)', d: 'Tell people how their data is used, including meaningful information about the logic of automated decisions.' },
      { t: 'Automated decisions (Art. 22)', d: 'People have the right not to be subject to solely automated decisions with legal or similarly significant effects, unless an exception applies, and then only with safeguards: human review, the chance to give their view and to contest.' },
      { t: 'Sensitive data (Art. 9)', d: 'Health, biometric, genetic and similar data is forbidden unless a specific exception, such as explicit consent, applies.' },
      { t: 'Data protection impact assessment (Art. 35)', d: 'Required before high-risk processing, including large-scale profiling and systematic monitoring.' },
      { t: 'Privacy by design and security (Arts. 25, 32)', d: 'Build protection in from the start and secure the data, including against model attacks that leak training data.' },
      { t: 'Breach notification (Art. 33)', d: 'Report personal data breaches to the authority within 72 hours.' },
    ],
    timeline: [
      { date: 'May 2018', text: 'GDPR applies.' },
      { date: 'Dec 2023', text: 'EU Court of Justice (SCHUFA): a credit score can itself be an automated decision under Art. 22.' },
      { date: 'Dec 2024', text: 'EDPB Opinion 28/2024 on using personal data to develop AI models.' },
      { date: 'Dec 2024', text: 'Italian authority fines OpenAI €15 million.' },
      { date: 'Feb 2025', text: 'EU Court of Justice (Dun & Bradstreet Austria): people are entitled to an explanation of how an automated decision was reached.' },
    ],
    penalties: 'Up to €20 million or 4% of worldwide annual turnover, whichever is higher. Authorities can also order processing to stop.',
    sources: [
      { label: 'GDPR text on EUR-Lex', url: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj' },
      { label: 'EDPB Opinion 28/2024 on AI models', url: 'https://www.edpb.europa.eu/our-work-tools/our-documents/opinion-board-art-64/opinion-282024-certain-data-protection-aspects_en' },
    ],
  },
];

export const FW_BY_ID = Object.fromEntries(FRAMEWORKS.map((f) => [f.id, f])) as Record<FwId, Framework>;

export const OTHER_FRAMEWORKS: { name: string; where: string; type: string; text: string }[] = [
  { name: 'UK approach and Data (Use and Access) Act 2025', where: 'United Kingdom', type: 'Principles + data law', text: 'No AI law yet. Existing regulators apply five principles (safety, transparency, fairness, accountability, contestability). UK GDPR applies; the 2025 Act relaxed some rules on automated decisions while keeping safeguards.' },
  { name: 'Council of Europe Framework Convention on AI', where: 'International', type: 'Treaty', text: 'The first binding international treaty on AI, human rights, democracy and the rule of law. Opened for signature in September 2024.' },
  { name: 'China: algorithm, deep synthesis and generative AI rules', where: 'China', type: 'Law', text: 'Rules on recommendation algorithms (2022), deep synthesis (2023) and generative AI services (2023), plus mandatory labelling of AI-generated content (from September 2025). Algorithm filing with regulators is required.' },
  { name: 'South Korea AI Basic Act', where: 'South Korea', type: 'Law', text: 'In force from January 2026. Duties for "high-impact" AI and transparency for generative AI, including labelling.' },
  { name: 'Japan AI Promotion Act', where: 'Japan', type: 'Law (light-touch)', text: 'Passed in 2025. Focuses on promoting AI and government coordination, with few direct duties on companies.' },
  { name: 'Canada', where: 'Canada', type: 'Directive', text: 'The proposed Artificial Intelligence and Data Act lapsed in January 2025. Federal agencies follow the Directive on Automated Decision-Making, including an algorithmic impact assessment.' },
  { name: 'Brazil AI Bill (PL 2338/2023)', where: 'Brazil', type: 'Bill', text: 'Risk-based bill similar to the EU AI Act. Passed by the Senate in December 2024; under review in the Chamber of Deputies.' },
  { name: 'OECD AI Principles and G7 Hiroshima Code of Conduct', where: 'International', type: 'Principles', text: 'Widely adopted principles (2019, updated 2024) and a voluntary code for developers of advanced AI (2023). Many national rules build on them.' },
  { name: 'Singapore Model AI Governance Framework and AI Verify', where: 'Singapore', type: 'Voluntary', text: 'Practical governance guidance, a generative AI version (2024) and an open-source testing toolkit.' },
  { name: 'UNESCO Recommendation on the Ethics of AI', where: 'International', type: 'Recommendation', text: 'Adopted by 193 countries in 2021. Covers human rights, fairness, environment and oversight.' },
  { name: 'US banking: SR 11-7 and UK PRA SS1/23', where: 'US / UK', type: 'Supervisory guidance', text: 'Model risk management rules for banks: model inventory, independent validation, ongoing monitoring and governance. They apply to AI models used by banks.' },
  { name: 'EU sector laws: DSA, MDR, DORA, NIS2, Product Liability Directive', where: 'European Union', type: 'Law', text: 'Rules for online platforms, medical devices, financial-sector resilience and cybersecurity apply alongside the AI Act. The revised Product Liability Directive (2024) covers software, including AI.' },
];
