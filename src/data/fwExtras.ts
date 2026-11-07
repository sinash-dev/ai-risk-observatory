import type { Framework, FwId } from './frameworks';

type Extra = Pick<Framework, 'roadmap' | 'learn' | 'extras'>;

export const EXTRAS: Partial<Record<FwId, Extra>> = {
  eu: {
    roadmap: [
      { t: 'List your AI systems', d: 'Build an inventory of every AI system you build, buy or use, and who owns each one.' },
      { t: 'Find your role', d: 'For each system, decide whether you are the provider, deployer, importer or distributor. A company can be both provider and deployer.' },
      { t: 'Classify the use', d: 'Check Article 5 (banned), Annex I and III (high-risk), Article 50 (transparency) and whether you develop a general-purpose model.' },
      { t: 'Stop anything banned', d: 'Banned practices have been illegal since February 2025. There is no compliance route for them.' },
      { t: 'Close the gaps for high-risk systems', d: 'Risk management, data governance, documentation, logging, human oversight, accuracy and security. Deployers: oversight, logs, informing people, and a fundamental-rights assessment where required. Annex III deadline: 2 December 2027; Annex I: 2 August 2028.' },
      { t: 'Assess conformity and register', d: 'Run the conformity assessment, sign the EU declaration, add the CE mark and register in the EU database.' },
      { t: 'Monitor and report', d: 'Monitor after launch, report serious incidents and repeat the assessment after substantial changes.' },
    ],
    learn: [
      ['emotion', 'A banned practice. Notice that the only safeguard that works is switching it off.'],
      ['credit', 'A high-risk use (Annex III). Read how Articles 9, 10, 14, 15 and 86 map to the safeguards.'],
      ['insurance', 'Annex III 5(c), and the fundamental-rights impact assessment that Art. 27 requires of insurers.'],
      ['exam', 'Annex III 3(d) proctoring, with the emotion-recognition ban in education right next to it.'],
      ['lesion', 'High-risk through a product law (medical devices), applying from 2 August 2028.'],
      ['face', 'High-risk biometrics, and the two-person rule in Article 14(5).'],
      ['chatbot', 'Transparency duties only: the user must know it is an AI.'],
      ['foundation', 'General-purpose model duties, and the 10²⁵ threshold for systemic risk.'],
      ['fraud', 'A deliberate exception: fraud detection is excluded from the credit category.'],
      ['travel-agent', 'Agents are classified by the task, not the technology.'],
    ],
    extras: [
      {
        title: 'What the 2026 Omnibus changed, and what it did not',
        intro: 'The Digital Omnibus on AI (Regulation (EU) 2026/1744) entered into force on 27 July 2026. It amends the AI Act; it does not replace it.',
        items: [
          { t: 'High-risk deadlines moved', d: 'Stand-alone high-risk systems (Annex III) from 2 December 2027; high-risk AI inside regulated products (Annex I) from 2 August 2028.' },
          { t: 'Transparency was not delayed', d: 'Telling people they are talking to an AI and disclosing deepfakes apply from 2 August 2026. Marking AI-generated content applies from 2 December 2026 for systems already on the market before 2 August 2026.' },
          { t: 'A new ban', d: 'AI practices that generate non-consensual intimate or sexual content or child sexual abuse material, from 2 December 2026.' },
          { t: 'Systems already in use', d: 'High-risk systems already in service are covered only if their design changes significantly after the application date. Public-authority deployers have a separate transitional rule (Art. 111) and should check it.' },
          { t: 'Machinery', d: 'AI-enabled machinery follows the Machinery Regulation route instead of the AI Act’s direct high-risk regime.' },
          { t: 'AI literacy reworded', d: 'Providers and deployers must still take measures to support their staff’s AI literacy, but the law no longer requires a guaranteed level.' },
          { t: 'Common misreading', d: '“The AI Act was delayed” is wrong. Only part of Chapter III moved, and preparing for high-risk compliance realistically takes 12–18 months.' },
        ],
      },
      {
        title: 'Who does what: roles',
        intro: 'Most duties follow your role in the supply chain, not the size of your company.',
        items: [
          { t: 'Provider', d: 'Develops a system or model, or has it developed, and places it on the market under its own name. Carries the full list of high-risk duties, including conformity assessment and post-market monitoring.' },
          { t: 'Deployer', d: 'Uses a system in a professional activity. Must follow the instructions, assign competent human oversight, keep logs, inform workers and affected people, and in some cases assess the impact on fundamental rights.' },
          { t: 'Importer and distributor', d: 'Must check that the provider has done its job (CE mark, documentation) before passing the system on.' },
          { t: 'Becoming a provider by accident', d: 'A deployer that puts its own name on a high-risk system, makes a substantial change, or uses a system for a high-risk purpose it was not designed for becomes the provider.' },
        ],
      },
      {
        title: 'General-purpose AI: the Code of Practice',
        intro: 'Published in July 2025, the voluntary Code gives model providers a practical way to show they meet Articles 53 and 55.',
        items: [
          { t: 'Transparency chapter', d: 'A model documentation form covering training, capabilities, limits and energy use.' },
          { t: 'Copyright chapter', d: 'A copyright policy, respecting robots.txt and other machine-readable opt-outs, and a way for rights holders to complain.' },
          { t: 'Safety and security chapter', d: 'For systemic-risk models only: a safety and security framework, risk assessment, evaluations, incident reporting and protection of model weights.' },
        ],
      },
      {
        title: 'Standards and official guidance',
        intro: 'The law sets the goals. Harmonised standards and Commission guidelines explain how to meet them in practice.',
        items: [
          { t: 'First harmonised standard: EN 18286', d: 'EN 18286:2026 covers the quality management system that providers of high-risk AI must have (Art. 17). It was published in July 2026, and Implementing Decision (EU) 2026/2274 put its reference in the Official Journal in October 2026. A quality management system built on it is presumed to meet Art. 17. Using it is voluntary.' },
          { t: 'More standards are on the way', d: 'CEN-CENELEC JTC 21 is still working on standards for risk management, data, logging, transparency, human oversight, accuracy, robustness, cybersecurity and conformity assessment. The standardisation request runs until 28 February 2027.' },
          { t: 'Draft guidelines on what counts as high-risk', d: 'On 19 May 2026 the Commission published draft guidelines on Art. 6, with examples of systems that are and are not high-risk. They are still a draft for consultation, so treat them as a strong hint, not the final word.' },
          { t: 'Free official help', d: 'The Commission’s AI Act Service Desk offers a compliance checker, an AI Act explorer and a helpdesk where you can send questions. Its results are not a legal assessment of your situation.' },
        ],
      },
    ],
  },
  us: {
    roadmap: [
      { t: 'Map each use to existing law', d: 'Credit, employment, housing, health, insurance and consumer protection laws apply to AI decisions in those areas.' },
      { t: 'Check the states you operate in', d: 'Colorado, California, Illinois, New York City, Texas and Utah have AI-specific rules; more are on the way.' },
      { t: 'Test for disparate impact', d: 'Measure outcomes across protected groups. Regulators and courts look at effects, not intentions.' },
      { t: 'Prepare explanations and notices', d: 'Adverse-action reasons for credit, candidate notices for hiring, bot disclosures for sales.' },
      { t: 'Check your marketing claims', d: 'Everything you say about your AI must be true and supported (FTC Act).' },
      { t: 'Use a recognised framework', d: 'Following the NIST AI RMF or ISO/IEC 42001 helps show reasonable care; Texas TRAIGA recognises substantial compliance with the NIST AI RMF.' },
    ],
    learn: [
      ['credit', 'Old law, new technology: adverse-action reasons and fair lending.'],
      ['cv', 'The most regulated area: NYC bias audits, Illinois, Colorado (from 2027), Title VII.'],
      ['face', 'Biometric privacy laws with private lawsuits (Illinois BIPA) and the FTC’s Rite Aid order.'],
      ['foundation', 'California’s frontier-model law (SB 53) and training-data disclosure (AB 2013).'],
      ['pricing', 'Algorithmic pricing: price gouging, antitrust and New York’s disclosure law.'],
      ['chatbot', 'Bot disclosure and liability for what the bot says.'],
    ],
    extras: [
      {
        title: 'State by state',
        items: [
          { t: 'Colorado', d: 'ADMT law SB 26-189 (from 1 January 2027): notice, explanation of adverse outcomes, data correction and human review for consequential decisions. It replaced the 2024 AI Act before that act took effect.' },
          { t: 'California', d: 'SB 53 (frontier models), AB 2013 (training data), SB 942 (AI content), privacy-agency rules on automated decisions, civil-rights rules for employment, the B.O.T. Act.' },
          { t: 'Illinois', d: 'BIPA (biometrics), AI Video Interview Act, HB 3773 (AI in employment, 2026).' },
          { t: 'New York', d: 'NYC Local Law 144 (hiring audits), SAFE for Kids Act (minors’ feeds), Algorithmic Pricing Disclosure Act.' },
          { t: 'Texas', d: 'Responsible AI Governance Act (2026) and the biometric privacy law (CUBI).' },
          { t: 'Utah', d: 'AI Policy Act: disclosure of generative AI in regulated services.' },
        ],
      },
    ],
  },
  nist: {
    roadmap: [
      { t: 'Govern: set the foundations', d: 'An AI policy, roles, risk tolerance and an inventory of systems.' },
      { t: 'Map each system', d: 'Purpose, context, users, affected people, likely harms and their size.' },
      { t: 'Measure', d: 'Choose metrics for each trustworthiness quality at stake; test, red-team and review independently.' },
      { t: 'Manage', d: 'Decide which risks to treat, accept or avoid; monitor after launch; respond to incidents.' },
      { t: 'Use profiles', d: 'Apply the Generative AI Profile for generative systems, or build a profile for your sector.' },
    ],
    learn: [
      ['emotion', 'Validity: if a system cannot be shown to measure what it claims, Manage 1.1 says do not deploy.'],
      ['cv', 'Fairness: Measure 2.11 in practice with counterfactual tests.'],
      ['chatbot', 'Generative AI Profile: confabulation and information security.'],
      ['staffing', 'Safety and the Manage function: alerts and human override.'],
      ['swarm', 'Govern: one accountable owner when many agents interact.'],
    ],
    extras: [
      {
        title: 'The Generative AI Profile’s twelve risks',
        items: [
          { t: 'CBRN information', d: 'Easier access to chemical, biological, radiological or nuclear weapons knowledge.' },
          { t: 'Confabulation', d: 'Confident but false output.' },
          { t: 'Dangerous, violent or hateful content', d: 'Content that incites or glorifies harm.' },
          { t: 'Data privacy', d: 'Leaking or inferring personal information.' },
          { t: 'Environmental impacts', d: 'Energy and resource use of training and running models.' },
          { t: 'Harmful bias and homogenisation', d: 'Amplified stereotypes and uniform outputs.' },
          { t: 'Human-AI configuration', d: 'Over-reliance, automation bias and emotional entanglement.' },
          { t: 'Information integrity', d: 'Making misinformation and deepfakes cheaper.' },
          { t: 'Information security', d: 'New attack surfaces and easier offensive cyber operations.' },
          { t: 'Intellectual property', d: 'Copying or reproducing protected work.' },
          { t: 'Obscene or abusive content', d: 'Including non-consensual intimate imagery.' },
          { t: 'Value chain and component integration', d: 'Opaque third-party models, data and tools.' },
        ],
      },
    ],
  },
  iso: {
    roadmap: [
      { t: 'Define the scope', d: 'Which organisation units, AI systems and roles (developer, provider, user) are covered.' },
      { t: 'Leadership and policy', d: 'Top management approves an AI policy and assigns responsibilities.' },
      { t: 'Assess risks and impacts', d: 'An AI risk assessment and an AI system impact assessment for each system.' },
      { t: 'Choose controls', d: 'Select Annex A controls and write a Statement of Applicability explaining any exclusions.' },
      { t: 'Run and record', d: 'Operate the controls, keep evidence, train staff.' },
      { t: 'Audit and review', d: 'Internal audit, management review, corrective actions.' },
      { t: 'Certification audit', d: 'An accredited body audits in two stages; certificates are valid for three years with yearly surveillance audits.' },
    ],
    learn: [
      ['face', 'Impact assessment (A.5) deciding whether a system should be used at all.'],
      ['cv', 'Supplier controls (A.10): most hiring AI is bought in.'],
      ['rag', 'Data controls (A.7): the documents are the system.'],
      ['spam', 'Proportionality: light touch for low-impact systems.'],
    ],
  },
  owasp: {
    roadmap: [
      { t: 'Model the threats', d: 'For each AI system, list who might attack it, how, and what they would gain.' },
      { t: 'Pick the right list', d: 'ML Top 10 for trained models, LLM Top 10 for generative applications, agentic guidance for agents.' },
      { t: 'Test against it', d: 'Red-team, run adversarial and prompt-injection test suites, review the supply chain.' },
      { t: 'Fix and harden', d: 'Input validation, least privilege, output handling, monitoring and rate limits.' },
      { t: 'Retest regularly', d: 'Attacks change quickly; retest after every model or prompt change.' },
    ],
    learn: [
      ['spam', 'ML01 and ML02: the oldest attacks on machine learning.'],
      ['lesion', 'Adversarial examples (ML01) on medical images.'],
      ['chatbot', 'LLM01:2026 prompt injection and LLM02:2026 data leakage.'],
      ['rag', 'Indirect prompt injection and LLM09:2026 embedding weaknesses.'],
      ['travel-agent', 'Excessive agency (LLM03:2026) and goal hijacking.'],
    ],
  },
  gdpr: {
    roadmap: [
      { t: 'Map the personal data', d: 'What personal data goes into training, testing and running each system.' },
      { t: 'Choose a lawful basis', d: 'For each purpose, including training. Legitimate interest needs a documented balancing test.' },
      { t: 'Check for special categories', d: 'Health, biometrics, ethnicity and similar data need an Article 9 condition.' },
      { t: 'Run a DPIA', d: 'Required for large-scale profiling, systematic monitoring and new technologies.' },
      { t: 'Build in Article 22 safeguards', d: 'Human review, the right to contest and explanations for significant automated decisions.' },
      { t: 'Tell people', d: 'Privacy notices that explain AI use in plain words.' },
      { t: 'Secure and monitor', d: 'Protect data and models, and be ready to report breaches within 72 hours.' },
    ],
    learn: [
      ['credit', 'Article 22 and the SCHUFA ruling on credit scores.'],
      ['face', 'Article 9: biometric identification is usually off-limits in retail.'],
      ['foundation', 'Training on web data and the EDPB’s 2024 opinion.'],
      ['rag', 'Purpose limitation: who can see what.'],
    ],
  },
  cn: {
    roadmap: [
      { t: 'Identify the service type', d: 'Recommendation algorithm, deep synthesis, public generative AI, or internal use.' },
      { t: 'File the algorithm', d: 'Register with the CAC algorithm filing system: provider details, algorithm type, purpose and a self-assessment.' },
      { t: 'Security assessment', d: 'Required for services that can shape public opinion or mobilise people.' },
      { t: 'Content and data controls', d: 'Lawful training data, content moderation, complaint handling, real-identity checks where required.' },
      { t: 'Labelling', d: 'Visible and hidden labels on AI-generated content since September 2025.' },
      { t: 'Personal information', d: 'Impact assessments, separate consent for sensitive data, explanations for automated decisions.' },
    ],
    learn: [
      ['feed', 'The 2022 recommendation rules: filing, user controls, minors.'],
      ['pricing', 'The ban on "big-data price discrimination".'],
      ['foundation', 'Filing and security assessment for public generative AI.'],
      ['imagegen', 'Deep synthesis consent rules and mandatory labels.'],
      ['voice', 'Consent before cloning a voice, and labels on synthetic audio.'],
      ['face', 'The 2025 facial recognition measures.'],
    ],
    extras: [
      {
        title: 'What makes China’s approach different',
        items: [
          { t: 'Registration before launch', d: 'Algorithms with public-opinion attributes must be filed, and the regulator publishes lists of filed services.' },
          { t: 'Content rules', d: 'Generated content must not violate content regulations; providers are responsible for moderation.' },
          { t: 'Service-by-service rules', d: 'Instead of one horizontal law, rules target specific services as they appear, which lets regulators move fast.' },
        ],
      },
    ],
  },
  kr: {
    roadmap: [
      { t: 'Check if your AI is high-impact', d: 'Compare the use with the listed areas; ask the ministry to confirm if unsure.' },
      { t: 'Prepare notices and labels', d: 'Advance notice for high-impact and generative AI; labels on generated content and deepfakes.' },
      { t: 'Risk management for high-impact AI', d: 'Risk plan, explanation measures, user protection, human oversight, records.' },
      { t: 'Appoint a representative', d: 'Foreign companies above the thresholds need a local representative.' },
      { t: 'Large models', d: 'Above the compute threshold, set up life-cycle risk management and incident response.' },
    ],
    learn: [
      ['cv', 'Hiring is a named high-impact area.'],
      ['credit', 'Loan screening is a named high-impact area.'],
      ['imagegen', 'Deepfake labelling under Article 31.'],
      ['voice', 'Notice and labelling for synthetic voices.'],
      ['exam', 'Student evaluation is a named high-impact area.'],
      ['foundation', 'Safety duties for very large models.'],
    ],
    extras: [
      {
        title: 'The ten high-impact areas',
        intro: 'As listed by the Ministry of Science and ICT when the Act and its Enforcement Decree took effect on 22 January 2026.',
        items: [
          { t: 'Energy', d: 'Supply of energy.' },
          { t: 'Drinking water', d: 'Production and supply of drinking water.' },
          { t: 'Healthcare', d: 'Health care provision, including medical devices.' },
          { t: 'Nuclear', d: 'Safety of nuclear facilities.' },
          { t: 'Crime investigation', d: 'Analysis of biometric information for criminal investigation or arrest.' },
          { t: 'Recruitment', d: 'Hiring decisions and other judgements that affect people’s rights at work.' },
          { t: 'Credit assessment', d: 'Loan screening and similar judgements about people’s finances.' },
          { t: 'Transportation', d: 'Major transport systems and vehicles.' },
          { t: 'Public services', d: 'Decisions by public bodies that affect citizens.' },
          { t: 'Education', d: 'Evaluation of students.' },
        ],
      },
    ],
  },
  sg: {
    roadmap: [
      { t: 'Set up internal governance', d: 'Roles, responsibilities and training.' },
      { t: 'Decide the level of human involvement', d: 'Use the severity-and-probability matrix for each use.' },
      { t: 'Manage operations', d: 'Data quality, explainability, robustness, monitoring.' },
      { t: 'Communicate', d: 'Tell people, explain, offer feedback and appeal.' },
      { t: 'Test', d: 'Use AI Verify (and Project Moonshot for language models) to test and report.' },
    ],
    learn: [
      ['benefits', 'Human in the loop for severe, hard-to-reverse decisions.'],
      ['fraud', 'Human over the loop: automated, but monitored.'],
      ['spam', 'Human out of the loop for low-harm uses.'],
      ['foundation', 'The 2024 generative AI framework.'],
    ],
    extras: [
      {
        title: 'Choosing the level of human involvement',
        intro: 'The framework’s matrix weighs how severe and how likely harm is.',
        items: [
          { t: 'High severity, high probability', d: 'Human in the loop: the AI recommends, a person decides.' },
          { t: 'High severity, low probability, or the reverse', d: 'Usually human over the loop: the AI acts, a person supervises and can intervene.' },
          { t: 'Low severity, low probability', d: 'Human out of the loop: the AI acts on its own.' },
        ],
      },
      {
        title: 'AI Verify',
        items: [
          { t: 'What it is', d: 'An open-source toolkit that combines technical tests (fairness, robustness, explainability) with process checks.' },
          { t: 'Who runs it', d: 'The AI Verify Foundation, set up by IMDA in 2023, with industry members.' },
          { t: 'Why it matters', d: 'Its test reports are mapped to other frameworks, including the NIST AI RMF and ISO/IEC 42001.' },
        ],
      },
    ],
  },
  uk: {
    roadmap: [
      { t: 'Identify your regulators', d: 'Which of the ICO, FCA, CMA, MHRA, Ofcom, EHRC and others oversee the setting you work in.' },
      { t: 'Read their AI guidance', d: 'Each regulator publishes how it applies the five principles.' },
      { t: 'Data protection', d: 'Lawful basis, DPIA, and the new automated-decision safeguards.' },
      { t: 'Equality', d: 'Test for discrimination under the Equality Act; public bodies also have the equality duty.' },
      { t: 'Document and be ready to explain', d: 'Regulators expect to see accountability and the ability to contest decisions.' },
    ],
    learn: [
      ['credit', 'The FCA’s Consumer Duty applied to credit models.'],
      ['emotion', 'The ICO’s warning about emotion analysis.'],
      ['feed', 'Ofcom and the Online Safety Act.'],
      ['cv', 'Automated-decision rules after the 2025 Act.'],
    ],
    extras: [
      {
        title: 'Who regulates what',
        items: [
          { t: 'ICO', d: 'Personal data, automated decisions, biometrics.' },
          { t: 'FCA and PRA', d: 'Financial services, consumer outcomes, model risk.' },
          { t: 'CMA', d: 'Competition and consumer protection, foundation-model markets.' },
          { t: 'MHRA', d: 'AI as a medical device.' },
          { t: 'Ofcom', d: 'Online platforms and recommender systems under the Online Safety Act.' },
          { t: 'EHRC', d: 'Equality and human rights.' },
          { t: 'AI Security Institute', d: 'Testing advanced models for national security risks (not a regulator).' },
        ],
      },
    ],
  },
};
