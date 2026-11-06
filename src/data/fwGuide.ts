/**
 * Guide additions per framework: the question it asks, how binding it is, key definitions,
 * who enforces it and common misconceptions. Written from the guide text already on the site
 * and the frameworks' own definitions (paraphrased). Last reviewed with SITE.reviewed.
 */
import type { FwId } from './frameworks';

export interface FwGuide {
  ask: string;
  /** 0–3 filled segments of the bindingness meter */
  bind: 0 | 1 | 2 | 3;
  definitions: { t: string; d: string }[];
  enforcement: { t: string; d: string }[];
  myths: { myth: string; fact: string }[];
}

export const FW_GUIDE: Record<FwId, FwGuide> = {
  eu: {
    ask: 'What is this AI used for?',
    bind: 3,
    definitions: [
      { t: 'AI system (Art. 3(1))', d: 'A machine-based system designed to operate with some autonomy, which may adapt after deployment, and which infers from its input how to produce outputs such as predictions, content, recommendations or decisions that can affect physical or virtual environments.' },
      { t: 'Provider and deployer (Art. 3(3)–(4))', d: 'The provider develops a system or model, or has it developed, and places it on the market under its own name. The deployer uses an AI system in a professional activity.' },
      { t: 'High-risk AI system (Art. 6)', d: 'A system used in an area listed in Annex III (such as hiring, credit or education), or a safety component of a product covered by the EU product laws in Annex I. Some Annex III uses are not high-risk if they pose no significant risk, for example when they only perform a narrow procedural task.' },
      { t: 'General-purpose AI model (Art. 3(63))', d: 'A model trained on large amounts of data that can competently perform a wide range of distinct tasks and can be built into many different systems, such as a large language model.' },
      { t: 'Systemic risk (Art. 51)', d: 'The extra category for the most capable general-purpose models. A model is presumed to have high-impact capabilities when its training used more than 10²⁵ floating-point operations.' },
    ],
    enforcement: [
      { t: 'AI Office (European Commission)', d: 'Supervises providers of general-purpose AI models and coordinates enforcement across the EU.' },
      { t: 'National market surveillance authorities', d: 'Each member state names authorities that check high-risk systems, banned practices and transparency duties, and can order changes, withdrawals and fines.' },
      { t: 'Notified bodies', d: 'Independent organisations that carry out third-party conformity assessments where the Act requires one.' },
      { t: 'European AI Board', d: 'Representatives of the member states who help apply the Act consistently.' },
      { t: 'Data protection authorities', d: 'Enforce the GDPR wherever an AI system uses personal data, alongside the AI Act.' },
    ],
    myths: [
      { myth: 'The 2026 Omnibus delayed the AI Act.', fact: 'Only part of Chapter III moved: the high-risk deadlines are now 2 December 2027 (Annex III) and 2 August 2028 (Annex I). The bans, general-purpose AI duties and transparency duties were not delayed.' },
      { myth: 'Whether a system is high-risk depends on the technology.', fact: 'It depends on the use. A logistic regression that scores loan applicants is high-risk; a large language model that drafts marketing copy is not.' },
      { myth: 'Open-source models are exempt.', fact: 'The exemptions are limited. They do not cover general-purpose models with systemic risk, banned practices or systems used for high-risk purposes, and transparency duties still apply.' },
    ],
  },
  us: {
    ask: 'Which existing law governs this decision, and does a state have an AI rule for it?',
    bind: 2,
    definitions: [
      { t: 'No single definition', d: 'Each law sets its own scope. A system can be covered by a lending law in one use and by a hiring law in another.' },
      { t: 'Adverse action (ECOA and FCRA)', d: 'A refusal of credit or a worse offer than requested. The lender must give the specific main reasons, however complex the model.' },
      { t: 'Automated employment decision tool (NYC Local Law 144)', d: 'A computational process, including machine learning, that produces a score, classification or recommendation used to substantially assist or replace decisions on hiring or promotion.' },
      { t: 'Consequential decision (Colorado SB 26-189)', d: 'A decision with a significant effect on a person, such as one about a job, credit or housing. The Colorado law covers automated decision-making technology that materially influences such decisions.' },
      { t: 'Unfair or deceptive practice (FTC Act, Section 5)', d: 'The basis for most federal action on AI: misleading claims about what a product can do, or harmful practices that consumers cannot reasonably avoid.' },
    ],
    enforcement: [
      { t: 'Federal Trade Commission', d: 'Acts against unfair or deceptive AI practices and can order companies to delete data and models built from it.' },
      { t: 'Sector regulators', d: 'Banking and consumer-finance regulators for lending, the Equal Employment Opportunity Commission for discrimination at work, the FDA for medical AI.' },
      { t: 'State attorneys general', d: 'Enforce state AI and consumer laws; Colorado’s Attorney General enforces SB 26-189 after issuing rules.' },
      { t: 'City agencies', d: 'New York City’s Department of Consumer and Worker Protection enforces Local Law 144 on hiring tools.' },
      { t: 'Courts and private lawsuits', d: 'Some laws, such as Illinois BIPA, let individuals sue directly.' },
    ],
    myths: [
      { myth: 'Without a federal AI law, AI is unregulated in the US.', fact: 'Existing laws on lending, hiring, health care and consumer protection apply whatever technology is used, and the FTC has ordered companies to delete models.' },
      { myth: 'If we bought the tool, discrimination is the vendor’s problem.', fact: 'Employers are responsible for the discriminatory effects of hiring and HR tools, including tools bought from vendors.' },
      { myth: 'Colorado’s AI Act takes effect in 2026.', fact: 'It was repealed and replaced by SB 26-189 before it took effect. The new law applies from 1 January 2027 and dropped the duty of care, risk programmes and impact assessments.' },
    ],
  },
  nist: {
    ask: 'Which qualities of a trustworthy system are at stake?',
    bind: 0,
    definitions: [
      { t: 'AI system', d: 'An engineered or machine-based system that can, for a given set of objectives, generate outputs such as predictions, recommendations or decisions that influence real or virtual environments, with varying levels of autonomy.' },
      { t: 'Risk', d: 'A combined measure of how likely an event is and how serious its consequences would be.' },
      { t: 'Trustworthiness characteristics', d: 'Valid and reliable; safe; secure and resilient; accountable and transparent; explainable and interpretable; privacy-enhanced; and fair with harmful bias managed.' },
      { t: 'Functions: Govern, Map, Measure, Manage', d: 'The four groups of activities the framework is organised around. Govern supports the other three.' },
      { t: 'Profile', d: 'A version of the framework tailored to a setting or technology, such as the Generative AI Profile (NIST AI 600-1).' },
    ],
    enforcement: [
      { t: 'No enforcement body', d: 'The framework is voluntary. NIST publishes it but does not audit or certify anyone.' },
      { t: 'Contracts and procurement', d: 'Customers and public buyers can require suppliers to follow it.' },
      { t: 'State laws', d: 'Some state laws, such as Texas’s, treat following a recognised framework like this one as evidence of reasonable care.' },
    ],
    myths: [
      { myth: 'NIST certifies AI systems.', fact: 'There is no NIST certification for the AI RMF. It is a voluntary guide for managing risk.' },
      { myth: 'It is only for US federal agencies.', fact: 'Any organisation in any country can use it, and many private companies do.' },
      { myth: 'Because it is voluntary, it does not matter.', fact: 'Regulators, courts and customers may ask whether you followed recognised practice, and some state laws give credit for following it.' },
    ],
  },
  iso: {
    ask: 'Is the organisation managing AI consistently?',
    bind: 1,
    definitions: [
      { t: 'AI management system', d: 'The policies, objectives, roles and processes an organisation uses to develop, provide or use AI systems responsibly.' },
      { t: 'Annex A controls', d: '38 controls in nine areas, from AI policy to data, life cycle and third-party relationships.' },
      { t: 'Statement of Applicability', d: 'The document that lists which Annex A controls you apply and why any are left out.' },
      { t: 'AI system impact assessment', d: 'A recorded assessment of how a system could affect individuals, groups and society.' },
      { t: 'Interested parties', d: 'People and organisations that can affect, or be affected by, your use of AI, such as customers, staff and regulators.' },
    ],
    enforcement: [
      { t: 'Certification bodies', d: 'Independent auditors check your management system and issue, maintain or withdraw certification.' },
      { t: 'Accreditation bodies', d: 'National bodies accredit the certification bodies. ISO/IEC 42006 (2025) sets requirements for bodies certifying against ISO/IEC 42001.' },
      { t: 'Customers', d: 'In practice the pressure comes from tenders and contracts that ask for certification.' },
    ],
    myths: [
      { myth: 'An ISO/IEC 42001 certificate means a model is safe.', fact: 'It certifies how the organisation manages AI, not any one model or its outputs.' },
      { myth: 'You must implement all 38 Annex A controls.', fact: 'You choose the controls that address your risks and justify any you leave out in the Statement of Applicability.' },
      { myth: 'Certification equals EU AI Act compliance.', fact: 'It helps show good governance, but the AI Act has its own requirements and conformity assessment for high-risk systems.' },
    ],
  },
  owasp: {
    ask: 'How could someone attack it, or how could it fail?',
    bind: 0,
    definitions: [
      { t: 'Prompt injection (LLM01:2026)', d: 'Input that changes a model’s behaviour in ways its designers did not intend, either typed by a user or hidden in content the model reads, such as a web page or document.' },
      { t: 'Excessive agency (LLM03:2026)', d: 'Giving an LLM-based system more functions, permissions or autonomy than it needs, so that a bad output turns into a harmful action.' },
      { t: 'Agent goal hijack (ASI01)', d: 'An attacker redirects what an agent is trying to achieve, for example through instructions planted in the content it processes.' },
      { t: 'Data and model poisoning', d: 'Tampering with training data or the model itself to plant weaknesses, backdoors or bias.' },
      { t: 'Top 10 list', d: 'An awareness document ranking the most important weaknesses, with prevention advice. It is not a standard or a law.' },
    ],
    enforcement: [
      { t: 'No enforcement body', d: 'OWASP is a non-profit community. Its lists are guidance.' },
      { t: 'Security reviews and penetration tests', d: 'Most AI security assessments are structured around these lists.' },
      { t: 'Regulators and courts, indirectly', d: 'A breach caused by a well-known weakness on these lists is hard to defend.' },
    ],
    myths: [
      { myth: 'OWASP lists are only about web applications.', fact: 'There are three AI lists: machine learning (2023), LLM applications (2026) and agentic applications (2026).' },
      { myth: 'A better system prompt stops prompt injection.', fact: 'No prompt or filter reliably prevents it. Limit what the system can do, treat outside content as untrusted and require approval for sensitive actions.' },
      { myth: 'It is not law, so it does not matter.', fact: 'It is the reference most security reviews use, and failing on a well-known weakness weakens your position with regulators, customers and courts.' },
    ],
  },
  gdpr: {
    ask: 'Whose data is this, and on what basis is it used?',
    bind: 3,
    definitions: [
      { t: 'Personal data (Art. 4(1))', d: 'Any information relating to an identified or identifiable living person.' },
      { t: 'Processing (Art. 4(2))', d: 'Anything done with personal data, from collection and storage to use, including training and running a model.' },
      { t: 'Controller and processor (Art. 4(7)–(8))', d: 'The controller decides why and how personal data is processed. The processor processes it on the controller’s behalf.' },
      { t: 'Profiling (Art. 4(4))', d: 'Automated processing that evaluates personal aspects of someone, such as predicting their work performance, finances, health, preferences or behaviour.' },
      { t: 'Special categories (Art. 9)', d: 'Sensitive data such as health, biometric data used to identify someone, genetic data, ethnic origin and religious beliefs.' },
    ],
    enforcement: [
      { t: 'National data protection authorities', d: 'Investigate, order processing to stop and issue fines. For cross-border cases, a lead authority works with the others.' },
      { t: 'European Data Protection Board', d: 'Brings the authorities together and issues opinions, such as Opinion 28/2024 on AI models.' },
      { t: 'Courts', d: 'The EU Court of Justice has ruled on how the GDPR covers credit scores and automated decisions. Individuals can complain to an authority and claim compensation.' },
    ],
    myths: [
      { myth: 'A model trained on personal data is anonymous, so the GDPR no longer applies.', fact: 'Only if it is truly anonymous. The EDPB’s Opinion 28/2024 says this must be assessed case by case, including whether personal data can be extracted from the model.' },
      { myth: 'Public data on the internet is free to use for training.', fact: 'Public personal data is still personal data. Training needs a lawful basis, and legitimate interest requires a careful balancing test.' },
      { myth: 'Any human click takes a decision outside Article 22.', fact: 'Human involvement must be meaningful. A person who routinely approves whatever the system says does not make the decision any less automated.' },
    ],
  },
  cn: {
    ask: 'What kind of service is offered to the public?',
    bind: 3,
    definitions: [
      { t: 'Generative AI service', d: 'Using generative models to provide text, images, audio, video or other content to the public in mainland China.' },
      { t: 'Deep synthesis', d: 'Technology that uses deep learning or similar methods to generate or edit text, images, audio, video or virtual scenes, such as deepfakes.' },
      { t: 'Algorithm filing', d: 'Registration of an algorithm with the Cyberspace Administration of China before launch, required for services with public-opinion attributes.' },
      { t: 'Public-opinion attributes', d: 'Services that can shape public opinion or mobilise people. They face filing and security assessment duties.' },
      { t: 'Personal information (PIPL)', d: 'Information about an identified or identifiable person, not including anonymised information.' },
    ],
    enforcement: [
      { t: 'Cyberspace Administration of China (CAC)', d: 'The lead regulator. It issued the algorithm, deep synthesis, generative AI and labelling rules with other ministries, runs the filing system and publishes lists of filed services.' },
      { t: 'Other ministries', d: 'Departments such as industry and public security share enforcement in their areas.' },
      { t: 'Local offices', d: 'Provincial and city cyberspace offices handle much day-to-day supervision.' },
    ],
    myths: [
      { myth: 'China has no AI rules.', fact: 'It has several binding rules: for recommendation algorithms, deep synthesis, generative AI services and content labelling, plus the PIPL.' },
      { myth: 'Every company chatbot must be filed.', fact: 'The generative AI rules focus on services offered to the public. Purely internal tools are mostly outside them, although the PIPL still applies to personal data.' },
      { myth: 'Labelling AI content is optional.', fact: 'Since September 2025, AI-generated content needs visible labels and hidden labels in the file metadata, and platforms must check for them.' },
    ],
  },
  kr: {
    ask: 'Is this high-impact or generative AI?',
    bind: 3,
    definitions: [
      { t: 'Artificial intelligence', d: 'The electronic implementation of human intellectual abilities such as learning, reasoning, perception, judgement and understanding language.' },
      { t: 'High-impact AI', d: 'AI used in one of ten listed areas, such as hiring, credit assessment, healthcare or education, that may significantly affect people’s lives, physical safety or fundamental rights.' },
      { t: 'Generative AI', d: 'AI that imitates the structure and features of its input data to produce new text, sound, images, video and other outputs.' },
      { t: 'AI business operator', d: 'A company that develops AI or provides products and services that use it. The Act applies to foreign operators whose AI affects the Korean market.' },
      { t: 'Domestic representative', d: 'A local representative that foreign operators above revenue or user thresholds must appoint.' },
    ],
    enforcement: [
      { t: 'Ministry of Science and ICT', d: 'Confirms whether systems are high-impact, investigates, issues corrective orders and imposes fines of up to KRW 30 million, after a grace period of at least a year.' },
      { t: 'Personal Information Protection Commission', d: 'Enforces the Personal Information Protection Act, including the right to refuse or question fully automated decisions.' },
    ],
    myths: [
      { myth: 'Korea bans risky AI like the EU does.', fact: 'The AI Basic Act bans no uses. It sets duties for high-impact AI, generative AI and very large models.' },
      { myth: 'Foreign companies are not covered.', fact: 'It applies to foreign companies whose AI affects the Korean market, and larger ones must appoint a local representative.' },
      { myth: 'Fines started in January 2026.', fact: 'The government announced a grace period of at least a year, with guidance instead of fines except in serious cases.' },
    ],
  },
  sg: {
    ask: 'How much should a human be involved?',
    bind: 1,
    definitions: [
      { t: 'Human in the loop', d: 'The AI recommends; a person makes the decision.' },
      { t: 'Human over the loop', d: 'The AI acts; a person supervises and can step in.' },
      { t: 'Human out of the loop', d: 'The AI acts on its own, suitable only when harm is unlikely and not severe.' },
      { t: 'AI Verify', d: 'An open-source toolkit that combines technical tests of fairness, robustness and explainability with process checks, producing a test report.' },
      { t: 'Personal data (PDPA)', d: 'Data about a person who can be identified from it, alone or with other information the organisation can access.' },
    ],
    enforcement: [
      { t: 'Personal Data Protection Commission', d: 'Enforces the PDPA, the binding layer, with fines of up to 10% of turnover in Singapore or SGD 1 million.' },
      { t: 'Infocomm Media Development Authority', d: 'Publishes the frameworks and set up the AI Verify Foundation.' },
      { t: 'Monetary Authority of Singapore', d: 'Sets the FEAT principles for financial institutions.' },
    ],
    myths: [
      { myth: 'Singapore has no binding rules on AI.', fact: 'The AI frameworks are voluntary, but the PDPA is binding and covers personal data used in AI, with substantial fines.' },
      { myth: 'AI Verify certifies that a system is fair.', fact: 'It is a testing toolkit. It produces a report on the tests and checks, not a pass mark.' },
      { myth: 'A human in the loop is always the safest choice.', fact: 'The framework matches involvement to risk. For low-severity, low-probability uses, a human out of the loop is acceptable.' },
    ],
  },
  uk: {
    ask: 'Which regulator’s rules apply in this sector?',
    bind: 2,
    definitions: [
      { t: 'Artificial intelligence (white paper)', d: 'Defined by two characteristics rather than a technology list: adaptivity (it learns patterns not obvious to humans) and autonomy (it can make decisions without express human intent).' },
      { t: 'The five principles', d: 'Safety, security and robustness; transparency and explainability; fairness; accountability and governance; contestability and redress.' },
      { t: 'Solely automated decision', d: 'A decision with no meaningful human involvement. Since the Data (Use and Access) Act 2025 these are allowed more widely, with safeguards.' },
      { t: 'Consumer Duty', d: 'The FCA’s rule that firms must deliver good outcomes for retail customers, including when they use AI.' },
    ],
    enforcement: [
      { t: 'Information Commissioner’s Office', d: 'Personal data, automated decisions and biometrics.' },
      { t: 'Financial Conduct Authority and Prudential Regulation Authority', d: 'Financial services, consumer outcomes and model risk.' },
      { t: 'Competition and Markets Authority', d: 'Competition and consumer protection, including foundation-model markets.' },
      { t: 'Ofcom, MHRA and EHRC', d: 'Online platforms under the Online Safety Act, AI as a medical device, and equality and human rights.' },
      { t: 'AI Security Institute', d: 'Tests advanced models for national security risks. It is not a regulator.' },
    ],
    myths: [
      { myth: 'The UK has no AI regulation.', fact: 'There is no AI act, but UK GDPR, the Equality Act, consumer law, the Online Safety Act and sector rules all apply, and regulators apply the five principles.' },
      { myth: 'The AI Security Institute regulates AI.', fact: 'It tests advanced models and advises government. It has no regulatory powers.' },
      { myth: 'UK GDPR still forbids most automated decisions.', fact: 'The Data (Use and Access) Act 2025 allows them more widely, with safeguards: information, the chance to make representations, to contest and to get human review. Stricter limits remain for sensitive data.' },
    ],
  },
};
