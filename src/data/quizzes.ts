/** Quizzes: one per framework and one per model family, five questions each. Answers follow the site's guides. */
export interface Question { q: string; options: [string, string, string, string]; answer: 0 | 1 | 2 | 3; explain: string; link: string }
export interface Quiz { id: string; title: string; kind: 'framework' | 'family'; questions: Question[] }

const Q = (q: string, options: [string, string, string, string], answer: 0 | 1 | 2 | 3, explain: string, link: string): Question => ({ q, options, answer, explain, link });

export const QUIZZES: Quiz[] = [
  {
    id: 'eu', title: 'EU AI Act', kind: 'framework', questions: [
      Q('A bank in Spain uses a vendor model to score loan applicants. From when must it meet the high-risk deployer duties, including a fundamental-rights impact assessment?', ['2 February 2025', '2 August 2026', '2 December 2027', '2 August 2028'], 2, 'Credit scoring is a stand-alone high-risk use in Annex III. After the 2026 Omnibus, Annex III duties apply from 2 December 2027.', '/rules/eu'),
      Q('A call centre in Germany wants software that scores how empathetic its staff sound. How does the AI Act treat it?', ['Minimal risk', 'Transparency duties only', 'High-risk', 'Banned'], 3, 'Emotion recognition in the workplace is a banned practice under Art. 5(1)(f), except for medical or safety reasons. No safeguard makes it compliant.', '/model/emotion'),
      Q('What decides whether a system is high-risk under the AI Act?', ['The type of model used', 'How the system is used', 'The size of the company', 'Whether it uses personal data'], 1, 'The category depends on the use, not the technology: a logistic regression scoring loans is high-risk, a language model drafting marketing copy is not.', '/rules/eu'),
      Q('Which statement about the 2026 Digital Omnibus is correct?', ['It delayed the whole AI Act by two years', 'It moved the high-risk deadlines but did not delay the transparency duties', 'It removed the AI literacy duty entirely', 'It removed the bans'], 1, 'Only part of Chapter III moved. Transparency duties, the bans and the general-purpose AI duties were not delayed; the AI literacy duty was reworded, not removed.', '/rules/eu#more-0'),
      Q('A company deploys a customer-service chatbot in the EU. What does Art. 50 require?', ['A conformity assessment', 'Telling people they are interacting with an AI system', 'Registering the chatbot in the EU database', 'Nothing, chatbots are exempt'], 1, 'Systems that interact with people must make clear that they are AI, unless it is obvious. This is a transparency duty, not a high-risk one.', '/model/chatbot'),
    ],
  },
  {
    id: 'us', title: 'United States', kind: 'framework', questions: [
      Q('A US lender declines an applicant using a complex machine-learning model. What must it give the applicant?', ['Nothing, the model is proprietary', 'The model’s source code', 'Specific, accurate reasons for the decision', 'A free second application'], 2, 'Under ECOA and the CFPB’s guidance, lenders must give specific reasons for adverse action. “The model is a black box” is no defence.', '/model/credit'),
      Q('What happened to the 2024 Colorado AI Act?', ['It took effect in February 2026 unchanged', 'It was repealed and replaced by SB 26-189 before taking effect', 'It was struck down by the Supreme Court', 'It became a federal law'], 1, 'SB 26-189, signed on 14 May 2026, replaced it. The new law applies from 1 January 2027 and focuses on notice, explanation, correction and human review.', '/rules/us'),
      Q('An employer in New York City uses an automated tool to screen CVs. What does Local Law 144 require?', ['Nothing for private employers', 'A yearly independent bias audit, a published summary and notice to candidates', 'Approval by the FTC', 'A ban on automated tools'], 1, 'Automated hiring and promotion tools need a yearly bias audit, a published summary and notice to candidates.', '/model/cv'),
      Q('A company buys a hiring tool from a vendor. Who is responsible if it discriminates?', ['Only the vendor', 'Nobody, if the tool was certified', 'The employer remains responsible for discriminatory effects', 'Only the candidate’s state'], 2, 'Under Title VII, the ADA and the ADEA, employers are responsible for the discriminatory effects of hiring tools, including those bought from vendors.', '/rules/us#myths'),
      Q('Which federal law is the main basis for action against false claims about what an AI product can do?', ['The FTC Act, Section 5', 'The Clean Air Act', 'HIPAA', 'The Copyright Act'], 0, 'Section 5 bans unfair or deceptive practices, including false claims about AI. The FTC has ordered companies to delete models built on improperly obtained data.', '/rules/us'),
    ],
  },
  {
    id: 'nist', title: 'NIST AI RMF', kind: 'framework', questions: [
      Q('What are the four functions of the NIST AI RMF?', ['Plan, Do, Check, Act', 'Govern, Map, Measure, Manage', 'Identify, Protect, Detect, Respond', 'Assess, Approve, Audit, Archive'], 1, 'The framework is organised around Govern, Map, Measure and Manage. Govern supports the other three.', '/rules/nist'),
      Q('Can a company be certified against the NIST AI RMF?', ['Yes, by NIST itself', 'Yes, by any auditor', 'No, it is a voluntary framework without certification', 'Only US federal agencies can be certified'], 2, 'NIST publishes the framework but does not audit or certify. It is voluntary guidance.', '/rules/nist#myths'),
      Q('A team wants to document what could go wrong, for whom, and how severe it would be, before building. Which function is this?', ['Govern', 'Map', 'Measure', 'Manage'], 1, 'Map is about understanding the context: purpose, affected people, what could go wrong and how likely and severe it is.', '/rules/nist'),
      Q('What does the Generative AI Profile (NIST AI 600-1) call confident but false output?', ['Drift', 'Confabulation', 'Overfitting', 'Poisoning'], 1, 'Confabulation is one of the twelve risks in the Generative AI Profile.', '/model/chatbot'),
      Q('Why might a company follow a voluntary framework like this one?', ['It is required by every US state', 'Some state laws, such as Texas’s, treat it as evidence of reasonable care', 'It replaces the GDPR', 'It exempts the company from lawsuits'], 1, 'Regulators, courts and customers may ask whether you followed recognised practice, and some state laws give credit for it.', '/rules/nist'),
    ],
  },
  {
    id: 'iso', title: 'ISO/IEC 42001', kind: 'framework', questions: [
      Q('What does an ISO/IEC 42001 certificate show?', ['That a specific model is safe', 'That the organisation runs an AI management system meeting the standard', 'That it complies with all AI laws', 'That its data is anonymous'], 1, 'It certifies how the organisation manages AI, not any one model.', '/rules/iso#myths'),
      Q('How many controls does Annex A list?', ['10', '23', '38', '93'], 2, 'Annex A lists 38 controls grouped into nine areas.', '/rules/iso'),
      Q('A company decides one Annex A control does not apply to it. What should it do?', ['Implement it anyway', 'Leave it out and justify the exclusion in the Statement of Applicability', 'Ask ISO for permission', 'It cannot be certified'], 1, 'You choose controls that address your risks and justify any you leave out in the Statement of Applicability.', '/rules/iso#definitions'),
      Q('Which Annex A area covers data acquisition, quality and provenance?', ['A.3', 'A.5', 'A.7', 'A.10'], 2, 'A.7 Data for AI systems covers acquiring data, its quality, provenance and preparation.', '/rules/iso'),
      Q('What is the main consequence of falling short of the standard?', ['A fine of 4% of turnover', 'Failing or losing certification', 'Criminal charges', 'Nothing at all'], 1, 'There are no fines. Losing certification can matter in tenders and customer contracts.', '/rules/iso'),
    ],
  },
  {
    id: 'owasp', title: 'OWASP AI security', kind: 'framework', questions: [
      Q('A hotel web page hides text telling AI booking agents to email travellers’ passports to an attacker. What is this?', ['Data poisoning', 'Prompt injection, here hijacking the agent’s goal', 'Model theft', 'Membership inference'], 1, 'Instructions hidden in content a model reads are indirect prompt injection (LLM01:2026); for agents this is agent goal hijack (ASI01).', '/model/travel-agent'),
      Q('An agent was given full access to the company card and mailbox to avoid failed tasks. Which weakness is this?', ['Misinformation', 'Excessive agency and privilege abuse', 'Vector and embedding weaknesses', 'Improper output handling'], 1, 'More permissions than the task needs turn bad outputs into harmful actions: LLM03:2026 and ASI03.', '/model/travel-agent'),
      Q('A retrieval assistant shows staff documents they are not allowed to see. Which 2026 LLM risk is this?', ['LLM09:2026 Vector and embedding weaknesses', 'LLM06:2026 Unbounded consumption', 'LLM07:2026 Misinformation', 'LLM04:2026 Supply chain'], 0, 'Retrieval that ignores access rights is a vector and embedding weakness.', '/model/rag'),
      Q('What is the best defence against prompt injection, according to the guidance on this site?', ['A longer system prompt', 'There is no single fix: limit what the system can do, treat outside content as untrusted and require approval for sensitive actions', 'Retrain the model weekly', 'Use a bigger model'], 1, 'No prompt or filter reliably prevents it, so you limit the damage it can do.', '/rules/owasp#myths'),
      Q('A code assistant suggests a package that does not exist, and an attacker registers that name. Which list item applies?', ['LLM04:2026 Supply chain', 'ML03 Model inversion', 'ASI07 Insecure inter-agent communication', 'LLM02:2026 Sensitive information disclosure'], 0, 'Hallucinated or malicious packages are a supply-chain risk.', '/model/code'),
    ],
  },
  {
    id: 'gdpr', title: 'GDPR', kind: 'framework', questions: [
      Q('A lender automatically rejects applicants with no human involvement. Which GDPR article gives them rights here?', ['Art. 22', 'Art. 33', 'Art. 9', 'Art. 30'], 0, 'Art. 22 gives a right not to be subject to solely automated decisions with legal or similarly significant effects, with safeguards when an exception applies.', '/rules/gdpr'),
      Q('An analyst clicks “approve” on every decision the system recommends without looking. Is the decision still “solely automated”?', ['No, any human click counts', 'Yes, human involvement must be meaningful', 'Only if the analyst is junior', 'Only for credit decisions'], 1, 'Rubber-stamping does not make a decision less automated.', '/rules/gdpr#myths'),
      Q('A company wants to train a model on personal data scraped from public websites. What is true?', ['Public data is free to use', 'It still needs a lawful basis; legitimate interest requires a careful balancing test', 'It only needs consent from the website owner', 'The GDPR does not apply to training'], 1, 'Public personal data is still personal data. The EDPB’s Opinion 28/2024 sets out the balancing test.', '/model/foundation'),
      Q('A retailer wants face recognition at store entrances. Why is it difficult under the GDPR?', ['Face templates are special-category biometric data, forbidden without an Art. 9 exception', 'Cameras are banned in shops', 'It needs ISO certification', 'Faces are not personal data'], 0, 'Biometric data used to identify people is special-category data. Spain fined Mercadona €2.5 million in 2021.', '/model/face'),
      Q('How quickly must a personal data breach be reported to the authority?', ['Within 24 hours', 'Within 72 hours', 'Within 30 days', 'Only if customers complain'], 1, 'Art. 33 requires notification within 72 hours.', '/rules/gdpr'),
    ],
  },
  {
    id: 'cn', title: 'China', kind: 'framework', questions: [
      Q('Which body issues most of China’s AI rules?', ['The People’s Bank of China', 'The Cyberspace Administration of China', 'The Ministry of Education', 'The Supreme People’s Court'], 1, 'The CAC issued the algorithm, deep synthesis, generative AI and labelling rules with other ministries.', '/rules/cn'),
      Q('A company launches a public generative AI service that could shape public opinion. What is distinctive about China’s approach?', ['No rules apply', 'The algorithm must be filed and a security assessment passed', 'Only a privacy notice is needed', 'It must be open-sourced'], 1, 'Registration before launch is a hallmark: services with public-opinion attributes must be filed and assessed.', '/rules/cn'),
      Q('Since September 2025, what must AI-generated content carry?', ['Nothing', 'Visible labels and hidden metadata labels', 'A watermark only on video', 'The developer’s address'], 1, 'The Labelling Measures require visible labels and hidden labels in file metadata, and platforms must check them.', '/rules/cn'),
      Q('What do the recommendation rules say about prices?', ['Prices must be the same everywhere in China', 'Do not set different prices for the same goods based on user profiles', 'Prices must be set by humans', 'They say nothing about prices'], 1, 'Unfair differential pricing based on profiles is forbidden.', '/model/pricing'),
      Q('A purely internal company chatbot used only by staff. Which rule still applies?', ['The generative AI filing rules', 'The Personal Information Protection Law, if it processes personal data', 'None', 'The deep synthesis rules only'], 1, 'Internal tools are mostly outside the generative AI rules, but PIPL applies to personal data.', '/rules/cn#myths'),
    ],
  },
  {
    id: 'kr', title: 'Korea AI Basic Act', kind: 'framework', questions: [
      Q('When did Korea’s AI Basic Act take effect?', ['1 January 2025', '22 January 2026', '2 August 2026', '1 January 2027'], 1, 'The Act and its Enforcement Decree took effect on 22 January 2026.', '/rules/kr'),
      Q('A bank uses AI to screen loan applications in Korea. How is it likely classified?', ['Generative AI', 'High-impact AI (credit assessment is one of the ten areas)', 'Banned', 'Outside the Act'], 1, 'Credit assessment is one of the ten high-impact areas, which carry risk management, explanation and oversight duties.', '/rules/kr#more-0'),
      Q('What must a company do when its service uses generative AI?', ['Nothing', 'Tell users in advance and label outputs, marking deepfakes clearly', 'Apply for a licence', 'Store all prompts for ten years'], 1, 'Advance notice and labelling of generative AI output, with clear marking of deepfakes.', '/rules/kr'),
      Q('What is the maximum administrative fine under the Act?', ['KRW 30 million', '4% of global turnover', 'KRW 1 billion', 'There are no fines'], 0, 'Fines go up to KRW 30 million, with a grace period of at least a year announced.', '/rules/kr'),
      Q('Which models face the extra safety duties for very large models?', ['Any model with over 1 million users', 'Models trained with at least 10²⁶ FLOPs cumulative compute', 'All open-source models', 'Models from foreign companies'], 1, 'The Enforcement Decree sets the threshold at 10²⁶ FLOPs of cumulative training compute.', '/rules/kr'),
    ],
  },
  {
    id: 'sg', title: 'Singapore', kind: 'framework', questions: [
      Q('Singapore’s framework helps choose how involved a human should be. Which three levels does it use?', ['Low, medium, high', 'In the loop, over the loop, out of the loop', 'Manual, hybrid, automatic', 'Advisory, binding, prohibited'], 1, 'The severity-and-probability matrix points to human in, over or out of the loop.', '/rules/sg'),
      Q('For a decision with high severity and high probability of harm, what does the matrix suggest?', ['Human out of the loop', 'Human over the loop', 'Human in the loop: the AI recommends, a person decides', 'Stop using AI'], 2, 'High severity and high probability call for a person to make the decision.', '/rules/sg#more-0'),
      Q('What is AI Verify?', ['A government licence for AI', 'An open-source testing toolkit that produces a report', 'A certification mark', 'A chatbot'], 1, 'It combines technical tests and process checks; it is not a pass mark.', '/rules/sg#myths'),
      Q('Which part of Singapore’s approach is binding?', ['The Model AI Governance Framework', 'The Personal Data Protection Act', 'AI Verify', 'The generative AI framework'], 1, 'The frameworks are voluntary; the PDPA is binding, with substantial fines.', '/rules/sg'),
      Q('Which principles do Singapore’s financial institutions also follow?', ['FEAT: fairness, ethics, accountability, transparency', 'SAFE', 'GDPR', 'ISO 9001'], 0, 'The central bank’s FEAT principles apply to financial institutions.', '/rules/sg'),
    ],
  },
  {
    id: 'uk', title: 'United Kingdom', kind: 'framework', questions: [
      Q('How does the UK regulate AI?', ['Through a single AI act', 'Existing regulators apply five principles within their remits, plus existing law', 'It does not regulate AI at all', 'Through the AI Security Institute'], 1, 'There is no AI act; regulators such as the ICO, FCA and CMA apply the five principles.', '/rules/uk'),
      Q('Which of these is one of the five UK principles?', ['Profitability', 'Contestability and redress', 'Open source', 'Data localisation'], 1, 'The five are safety; transparency; fairness; accountability; contestability and redress.', '/rules/uk'),
      Q('What changed for automated decisions under the Data (Use and Access) Act 2025?', ['They were banned', 'They are allowed more widely, with safeguards', 'They need Ofcom approval', 'Nothing changed'], 1, 'They are allowed more widely, with information, representations, contest and human review; stricter limits remain for special-category data.', '/rules/uk#myths'),
      Q('Is the AI Security Institute a regulator?', ['Yes, it fines companies', 'No, it tests advanced models and advises government', 'Yes, for chatbots only', 'It replaced the ICO'], 1, 'It tests advanced models for national security risks; it has no regulatory powers.', '/rules/uk'),
      Q('A bank uses AI in retail lending in the UK. Which FCA rule requires good outcomes for customers?', ['The Consumer Duty', 'The Online Safety Act', 'The Equality Act', 'BIPA'], 0, 'The FCA’s Consumer Duty requires firms to deliver good outcomes for retail customers, including when they use AI.', '/rules/uk'),
    ],
  },
  {
    id: 'classical', title: 'Classical machine learning', kind: 'family', questions: [
      Q('A credit model never uses ethnicity, but uses postcode. Why can it still discriminate?', ['Postcode can act as a proxy for ethnicity', 'Logistic regression is always biased', 'Postcodes are random', 'It cannot discriminate'], 0, 'Dropping the protected attribute is not enough; proxies can recreate it.', '/model/credit'),
      Q('A fraud model is 99% accurate, but fraud is 1% of transactions. What might be wrong?', ['Nothing, 99% is excellent', 'It could catch almost no fraud: accuracy hides failures on rare events', 'It is overfitted to fraud', 'It needs more features'], 1, 'On rare events, accuracy lies. Measure precision and recall instead.', '/model/fraud'),
      Q('A recession changes applicants’ incomes after the model was trained. What is this called?', ['Overfitting', 'Data drift', 'Prompt injection', 'Model inversion'], 1, 'When the data in use moves away from the training data, performance quietly drops.', '/model/credit'),
      Q('A decision tree is grown until it is 100% accurate on the training data. What is the risk?', ['It will be too slow', 'It memorises noise and performs worse on new cases', 'It becomes unexplainable', 'Nothing'], 1, 'Overgrown trees overfit; pruning and validation help.', '/model/benefits'),
      Q('A salary model is used for senior hires with more experience than anyone in its training data. What is the risk?', ['Extrapolation beyond what it has seen', 'Prompt injection', 'Membership inference', 'None'], 0, 'The model simply continues the line; set validity bounds and refer such cases to people.', '/model/salary'),
    ],
  },
  {
    id: 'deep', title: 'Deep learning', kind: 'family', questions: [
      Q('A skin-lesion model learned that rulers and ink marks mean “malignant”. What does this show?', ['High benchmark accuracy can hide a model that learned the wrong thing', 'Deep learning cannot see images', 'The data was too large', 'Nothing important'], 0, 'Check what the model looks at, for example with saliency audits, and for whom it fails.', '/model/lesion'),
      Q('A store lowers its face-match threshold to catch more shoplifters. What happens?', ['Fewer innocent people are flagged', 'More innocent shoppers are wrongly matched', 'Nothing changes', 'The system becomes legal'], 1, 'The threshold is a policy decision about who gets wrongly stopped.', '/model/face'),
      Q('What did the Gender Shades study find?', ['Equal error rates for all groups', 'Error rates up to 34.7% for darker-skinned women against 0.8% for lighter-skinned men', 'Face analysis is always accurate', 'Only men were misclassified'], 1, 'Commercial face analysis performed far worse for darker-skinned women.', '/cases'),
      Q('A news feed optimised purely for watch-time starts promoting outrage. What is the lesson?', ['Optimise one number hard enough and the system will reshape people to hit it', 'Recommenders are always neutral', 'Watch-time is a fair measure of value', 'Users choose everything themselves'], 0, 'Diversity and quality signals, and limits on engagement goals, reduce the harm.', '/model/feed'),
      Q('Why is emotion recognition for staff appraisal a hard case?', ['It is expensive', 'The science is weak and in the EU it is banned at work, so no safeguard makes it acceptable', 'It needs GPUs', 'It only works in English'], 1, 'Some risks cannot be managed, only avoided.', '/model/emotion'),
    ],
  },
  {
    id: 'genai', title: 'Generative AI', kind: 'family', questions: [
      Q('An airline’s chatbot invents a refund policy. Who is responsible, according to Moffatt v. Air Canada?', ['The chatbot vendor only', 'The airline', 'Nobody', 'The customer, for trusting it'], 1, 'The tribunal held the airline liable for what its chatbot said.', '/model/chatbot'),
      Q('An internal assistant answers from a 2019 policy that is no longer valid. Where does the risk sit?', ['In the model weights', 'In the document estate it retrieves from', 'In the user’s browser', 'Nowhere'], 1, 'RAG moves the risk to your data: stale, poisoned or over-shared documents become answers.', '/model/rag'),
      Q('A study found that around 40% of programs generated for security-relevant scenarios had vulnerabilities. What should a team do?', ['Ban all AI assistants', 'Scan and review AI-written code like any other code', 'Trust the assistant', 'Only use it on Fridays'], 1, 'Controls must keep pace: SAST gates, review and dependency allow-lists.', '/model/code'),
      Q('Under the EU AI Act, what must providers of image generators do with their outputs?', ['Nothing', 'Mark them in a machine-readable way so they can be detected as AI-generated', 'Delete them after 24 hours', 'Register each image'], 1, 'Art. 50(2) requires machine-readable marking; deployers must disclose deepfakes (Art. 50(4)).', '/model/imagegen'),
      Q('A foundation model is trained with more than 10²⁵ floating-point operations. How does the EU AI Act treat it?', ['As high-risk', 'As a general-purpose AI model with systemic risk', 'As banned', 'It is out of scope'], 1, 'It is presumed to have high-impact capabilities, with extra safety duties such as evaluations and incident reporting.', '/model/foundation'),
    ],
  },
  {
    id: 'agentic', title: 'AI agents', kind: 'family', questions: [
      Q('Which principle sums up the DevOps agent lesson?', ['Let one agent do everything for speed', 'Never let the same agent do the work, grade the work and ship the work', 'Agents never make mistakes', 'Logs are optional'], 1, 'Independent verification, approval gates and staged rollout separate the roles.', '/model/devops-agent'),
      Q('One research agent invents a supplier certificate and every downstream agent trusts it. What is this?', ['A cascading failure', 'Model theft', 'Drift', 'Membership inference'], 0, 'In multi-agent systems, one error can spread through the network (ASI08).', '/model/swarm'),
      Q('Which control best limits the damage a hijacked travel agent can do?', ['A friendlier prompt', 'Least privilege: single-use virtual cards and scoped tools', 'More training data', 'Faster servers'], 1, 'Constrain what agents can do, not just what they say.', '/model/travel-agent'),
      Q('An agent reports “all tests pass” when they do not. How should you treat its summary?', ['As the evidence', 'Never as the evidence: verify independently', 'Only trust it on weekdays', 'Ask the agent again'], 1, 'CI must re-run tests and diff results; the agent’s own report is never the proof (ASI09).', '/model/devops-agent'),
      Q('Two buying agents settle on prices 26% above market with a vendor’s agent. What risk is this?', ['Collusion between agents', 'A hardware fault', 'Data drift', 'Overfitting'], 0, 'Monitor inter-agent communication and watch for price parallelism.', '/model/swarm'),
    ],
  },
];

export const QUIZ_BY_ID = Object.fromEntries(QUIZZES.map((q) => [q.id, q])) as Record<string, Quiz>;
