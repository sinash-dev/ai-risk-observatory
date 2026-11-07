import type { FwEntry, Req } from '../frameworks';

const ftc: Req = ['Do not make false or unsupported claims about what the AI does, and do not use it in unfair ways', 'FTC Act §5'];
const colorado = (sg?: string[]): Req => ['From 1 January 2027, give notice and the required disclosures when automated decision-making technology materially influences a consequential decision, and offer correction and human review', 'Colorado SB 26-189', sg];

export const US: Record<string, FwEntry> = {
  spam: {
    cat: 'general', status: 'General law only',
    summary: 'No AI-specific rule applies to an internal spam filter. If the filter were sold as a product, claims about its accuracy would have to be true.',
    reqs: [ftc],
  },
  salary: {
    cat: 'specific', status: 'Employment law plus state AI rules',
    summary: 'Pay discrimination is illegal whether a person or a model sets the number. Colorado’s ADMT law (from 2027) adds notice and human-review duties when software materially influences employment decisions, and California’s civil-rights rules explicitly cover automated-decision systems in employment.',
    reqs: [
      ['Pay differences for equal work must be explained by factors other than sex or another protected trait', 'Equal Pay Act; Title VII', ['equity']],
      colorado(['equity']),
      ['Automated-decision systems used in employment decisions are covered by anti-discrimination law; keep the related records for four years', 'California Civil Rights Council regulations (Oct 2025)', ['equity']],
    ],
  },
  credit: {
    cat: 'specific', status: 'Fair-lending law plus state AI rules',
    summary: 'US credit law already demands what many AI rules ask for: lenders must not discriminate and must give each declined applicant specific, accurate reasons. The CFPB has said a complex model is no excuse. From 2027, Colorado adds notice, explanation and human-review duties for lending decisions.',
    reqs: [
      ['Give specific and accurate reasons for each credit denial', 'ECOA / Regulation B; CFPB Circulars 2022-03 and 2023-03', ['explain']],
      ['Do not discriminate, including through proxies such as postcode that produce disparate impact', 'ECOA; Fair Housing Act', ['dropzip', 'reweigh']],
      ['Data used about consumers must be accurate and disputable', 'Fair Credit Reporting Act', ['monitor']],
      colorado(['dropzip', 'reweigh']),
    ],
  },
  benefits: {
    cat: 'sector', status: 'Government rules and due process',
    summary: 'For federal agencies, the Office of Management and Budget sets minimum practices for "high-impact" AI, including testing, impact assessment, human oversight and a way to appeal. People also have a constitutional right to due process before benefits are cut. Michigan’s MiDAS system, which wrongly accused tens of thousands of people of unemployment fraud, ended in a $20 million settlement.',
    reqs: [
      ['Before using high-impact AI, test it in real conditions, assess its impact and keep humans able to intervene', 'OMB Memorandum M-25-21 (2025)', ['cv', 'hitl']],
      ['Give notice and a fair hearing before stopping benefits', 'Due process (14th Amendment)', ['hitl']],
      ['Do not discriminate by national origin', 'Civil Rights Act, Title VI', ['features']],
    ],
  },
  fraud: {
    cat: 'sector', status: 'Banking and consumer-protection law',
    summary: 'No AI-specific rule applies to fraud detection, but banking rules do. Consumers have rights to have errors investigated, and freezing accounts without a fair process can be an unfair practice. Banks’ model-risk guidance (SR 11-7) requires independent validation and monitoring of models like this one.',
    reqs: [
      ['Validate the model independently and monitor it after launch', 'Federal Reserve / OCC SR 11-7', ['champion', 'cost']],
      ['Investigate and resolve customer disputes about blocked transactions', 'Electronic Fund Transfer Act / Regulation E', ['shap']],
      ['Avoid unfair, deceptive or abusive practices towards customers', 'Consumer Financial Protection Act (UDAAP)', ['shap']],
    ],
  },
  segments: {
    cat: 'sector', status: 'State privacy law',
    summary: 'State privacy laws such as California’s give people the right to know about and opt out of the sale and sharing of their data and limit the use of sensitive data. Buying data-broker profiles that infer health or religion is high risk under these laws.',
    reqs: [
      ['Honour opt-outs of sale and sharing, and limit use of sensitive personal information', 'California Consumer Privacy Act (CCPA/CPRA)', ['dpia']],
      ['Do not use data in ways that unfairly harm consumers', 'FTC Act §5', ['audit']],
      ['Check that offers and services are not denied on the basis of protected traits', 'State civil-rights and public-accommodation laws', ['audit', 'behaviour']],
    ],
  },
  staffing: {
    cat: 'sector', status: 'Health and safety rules',
    summary: 'No AI rule applies to admission forecasts, but staffing rules do. California, for example, sets mandatory nurse-to-patient ratios that apply whatever a forecast says.',
    reqs: [
      ['Meet mandated minimum staffing levels regardless of the forecast', 'California nurse-to-patient ratio law (AB 394)', ['hitl']],
      ftc,
    ],
  },
  lesion: {
    cat: 'sector', status: 'FDA medical device rules',
    summary: 'Software that helps diagnose disease is a medical device in the US. It needs FDA clearance or approval, and model updates either need new review or must follow a predetermined change control plan agreed in advance. Patient data is protected by HIPAA.',
    reqs: [
      ['Obtain FDA marketing authorisation, with evidence of performance across patient groups', 'FD&C Act; FDA AI-enabled device guidance', ['diverse']],
      ['Plan and control model updates through a predetermined change control plan', 'FDA PCCP guidance (Dec 2024)', ['saliency', 'advtrain']],
      ['Protect patient data', 'HIPAA'],
    ],
  },
  face: {
    cat: 'specific', status: 'Biometric privacy laws',
    summary: 'Several states regulate face data directly. Illinois requires written consent before collecting it and lets people sue for violations. Portland, Oregon bans private businesses from using facial recognition in places open to the public. The FTC has banned a pharmacy chain from using it after it falsely flagged customers.',
    reqs: [
      ['Get written consent and publish a retention and deletion policy before collecting face data', 'Illinois BIPA (also Texas CUBI, Washington)', ['dpia']],
      ['Test for accuracy and bias, and train staff before relying on matches', 'FTC v. Rite Aid order (2023)', ['demotest', 'threshold', 'tworeview']],
      ['Check local bans on facial recognition in places of public accommodation', 'e.g. Portland City Code (2021)'],
    ],
  },
  emotion: {
    cat: 'sector', status: 'Employment, disability and biometric law',
    summary: 'The US does not ban emotion recognition. Using it to evaluate staff still carries legal risk: scores that disadvantage people with speech differences or disabilities can breach disability law, and voiceprints can count as biometric data.',
    reqs: [
      ['Do not use tools that screen out people with disabilities, and offer reasonable adjustments', 'Americans with Disabilities Act (EEOC guidance)', ['validate', 'stop']],
      ['Get consent before collecting voiceprints', 'Illinois BIPA', ['notice']],
      ['Do not make unsupported claims about what the tool can measure', 'FTC Act §5', ['validate']],
    ],
  },
  cv: {
    cat: 'specific', status: 'AI hiring laws plus civil-rights law',
    summary: 'Hiring is the most regulated area for AI in the US. New York City requires yearly independent bias audits. Illinois regulates AI in video interviews and bans discriminatory AI in employment. Federal civil-rights law makes employers responsible for discriminatory outcomes, even from a vendor’s tool.',
    reqs: [
      ['Commission a yearly independent bias audit, publish the results and notify candidates', 'NYC Local Law 144', ['cf', 'human']],
      ['Do not use AI that has a discriminatory effect in hiring decisions', 'Title VII; Illinois HB 3773 (2026)', ['cf', 'proxy']],
      colorado(['cf', 'human']),
    ],
  },
  feed: {
    cat: 'specific', status: 'State laws on minors’ feeds',
    summary: 'Platforms are largely protected from liability for user content, but several states now regulate how feeds are ranked for minors. New York and California require parental consent before showing minors an algorithmic, personalised feed. Both laws face legal challenges.',
    reqs: [
      ['Offer minors a non-personalised feed unless a parent consents', 'New York SAFE for Kids Act; California SB 976', ['nonprof']],
      ['Do not use deceptive design that harms users', 'FTC Act §5', ['quality', 'diversity']],
    ],
  },
  pricing: {
    cat: 'specific', status: 'Pricing, gouging and antitrust laws',
    summary: 'Pricing algorithms are under growing scrutiny. New York requires a notice when a price is set using personal data. The Justice Department has sued a rent-pricing software company for helping landlords align prices, and California has updated its antitrust law to cover shared pricing algorithms. Most states ban price gouging in emergencies.',
    reqs: [
      ['Respect emergency price-gouging limits', 'State price-gouging laws', ['caps']],
      ['Do not use shared algorithms to coordinate prices with competitors', 'Sherman Act §1; California AB 325 (2025)', ['audit']],
      ['Disclose when a price was set by an algorithm using personal data', 'New York Algorithmic Pricing Disclosure Act (2025)'],
    ],
  },
  foundation: {
    cat: 'specific', status: 'California frontier-model and training-data laws',
    summary: 'California is the main source of rules for model developers. SB 53 applies to developers of frontier models (trained with more than 10²⁶ operations) and adds more duties for those with over $500 million in revenue. AB 2013 requires a public summary of training data for generative AI offered in California. Copyright lawsuits over training data are ongoing.',
    reqs: [
      ['Publish a frontier AI safety framework and a transparency report before release', 'California SB 53', ['frontier', 'evals']],
      ['Report critical safety incidents to the state, and protect whistleblowers', 'California SB 53', ['frontier']],
      ['Publish a high-level summary of the datasets used for training', 'California AB 2013', ['optout']],
      ['Respect copyright; fair use of training data is being decided in the courts', 'Copyright Act (pending cases)', ['optout']],
    ],
  },
  chatbot: {
    cat: 'specific', status: 'Bot disclosure laws plus consumer law',
    summary: 'California requires bots to disclose that they are bots when used to sell something. Utah requires disclosure of generative AI in regulated services. Under general consumer and contract law, a company is usually held to what its chatbot tells customers.',
    reqs: [
      ['Disclose that the customer is talking to a bot when it is used to sell or persuade', 'California B.O.T. Act (SB 1001)', ['handoff']],
      ['Disclose generative AI use in regulated services when asked or required', 'Utah AI Policy Act', ['handoff']],
      ['Do not mislead customers; the company is responsible for its bot’s statements', 'FTC Act §5; contract law', ['rag', 'guard']],
    ],
  },
  rag: {
    cat: 'general', status: 'General law only',
    summary: 'No AI-specific rule applies. The risks are covered by existing duties: protecting employee and customer data, keeping trade secrets confidential and securing systems.',
    reqs: [
      ['Protect personal information of employees and customers, including from internal over-sharing', 'State privacy laws (CCPA covers employee data)', ['acl']],
      ['Take reasonable security measures', 'FTC Act §5; state data-security laws', ['sanitize']],
    ],
  },
  imagegen: {
    cat: 'specific', status: 'AI content and likeness laws',
    summary: 'Several laws target synthetic media. California requires large generative-AI providers to embed disclosures and offer detection tools. Federal law now requires platforms to remove non-consensual intimate deepfakes. Many states ban deceptive election deepfakes, and Tennessee protects people’s voice and likeness. Purely AI-generated images cannot be copyrighted.',
    reqs: [
      ['Large providers: embed latent disclosures and offer a free detection tool', 'California AI Transparency Act (SB 942)', ['c2pa']],
      ['Do not use real people’s likeness or voice without permission', 'State right-of-publicity laws; Tennessee ELVIS Act', ['policy']],
      ['Respect copyright in prompts and outputs', 'Copyright Act', ['review']],
    ],
  },
  code: {
    cat: 'general', status: 'General law only',
    summary: 'No AI-specific rule applies. Companies that sell software to the federal government must attest that it was developed securely, and public companies must disclose material cyber incidents.',
    reqs: [
      ['Follow secure development practices if selling software to federal agencies', 'OMB M-22-18; NIST SSDF', ['sast', 'deps', 'secrets']],
      ['Disclose material cybersecurity incidents within four business days (public companies)', 'SEC rules (2023)'],
    ],
  },
  'travel-agent': {
    cat: 'general', status: 'General law only',
    summary: 'No AI-specific rule applies. Under general contract and agency principles, a company is usually bound by transactions its own systems make on its behalf, so overspending is the company’s problem, not the hotel’s.',
    reqs: [
      ['Expect to be bound by bookings and payments the agent makes', 'Contract and agency law', ['least', 'approval']],
      ['Protect employees’ personal data such as passport scans', 'State data-security and breach laws', ['untrusted']],
    ],
  },
  'devops-agent': {
    cat: 'general', status: 'General law only',
    summary: 'No AI-specific rule applies, but the consequences are regulated. Losing customer data triggers state breach-notification laws, and public companies must disclose material incidents.',
    reqs: [
      ['Notify affected people and regulators after a breach of personal data', 'State breach-notification laws', ['sandbox', 'gates']],
      ['Disclose material cybersecurity incidents (public companies)', 'SEC rules (2023)'],
    ],
  },
  swarm: {
    cat: 'sector', status: 'Antitrust and contract law',
    summary: 'No AI-specific rule applies, but competition law does. If buyer and seller agents end up coordinating prices, or a company’s agents share sensitive pricing information with competitors’ agents, that can breach antitrust law.',
    reqs: [
      ['Do not let agents exchange competitively sensitive information or coordinate prices', 'Sherman Act §1', ['protocol']],
      ['Keep humans accountable for contracts the agents sign', 'Contract and agency law', ['raci']],
    ],
  },
  insurance: {
    cat: 'specific', status: 'State insurance law + NAIC AI bulletin',
    summary: 'Insurance is regulated by the states. Unfair-discrimination law applies to rating factors, the NAIC Model Bulletin (adopted 4 December 2023) sets expectations for AI governance, testing and vendor oversight, and Colorado SB21-169 restricts insurers’ use of external consumer data and algorithms that unfairly discriminate.',
    reqs: [
      ['Rating factors must not unfairly discriminate', 'State insurance unfair-discrimination laws', ['neutral', 'fairvalue']],
      ['Have a written AI governance programme, test models and oversee vendors', 'NAIC Model Bulletin on the Use of AI Systems by Insurers (2023)', ['reprice']],
      ['Do not use external consumer data or algorithms that unfairly discriminate', 'Colorado SB21-169', ['consent', 'neutral']],
    ],
  },
  exam: {
    cat: 'specific', status: 'Constitutional and biometric privacy law',
    summary: 'At public universities, room scans can be an unconstitutional search: a federal judge ruled so in Ogletree v. Cleveland State University (2022). Illinois BIPA requires written consent before collecting face geometry.',
    reqs: [
      ['Public universities: avoid room scans that amount to an unreasonable search', 'Fourth Amendment (Ogletree v. Cleveland State University, 2022)', ['minimal']],
      ['Get written consent before collecting face geometry', 'Illinois BIPA', ['minimal']],
      ['Do not discriminate on race, including through biased tools', 'Civil Rights Act, Title VI', ['pergroup']],
      ftc,
    ],
  },
  voice: {
    cat: 'specific', status: 'Telemarketing and voice-likeness laws',
    summary: 'The FCC ruled in February 2024 (FCC 24-17) that AI-generated voices are “artificial” under the Telephone Consumer Protection Act, so robocalls using them need prior express consent. Tennessee’s ELVIS Act (2024) protects a person’s voice against unauthorised simulation.',
    reqs: [
      ['Get prior express consent for robocalls that use an AI-generated voice', 'TCPA; FCC Declaratory Ruling FCC 24-17', ['disclose']],
      ['Do not use a real person’s voice without permission', 'Tennessee ELVIS Act; state right-of-publicity laws', ['licence']],
      ['Get consent before collecting voiceprints', 'Illinois BIPA', ['noprint']],
      ftc,
    ],
  },
  'browser-agent': {
    cat: 'general', status: 'General law only',
    summary: 'No AI-specific rule applies to back-office automation. The company is bound by payments the agent makes and must protect the data it handles.',
    reqs: [
      ['Expect to be bound by payments and orders the agent makes', 'Contract and agency law', ['approvalux']],
      ['Take reasonable security measures', 'FTC Act §5; state data-security laws', ['pin', 'sandbox', 'identity']],
    ],
  },
};
