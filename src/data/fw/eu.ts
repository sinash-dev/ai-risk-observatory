import type { FwEntry, Req } from '../frameworks';

const literacy: Req = ['Take measures to support the AI literacy of the staff who run or rely on the system', 'Art. 4'];

function highRisk(m: { data?: string[]; oversight?: string[]; robust?: string[]; monitor?: string[] }, extra: Req[] = []): Req[] {
  return [
    ['Run a documented risk-management process for the whole life of the system', 'Art. 9'],
    ['Use training and test data that is relevant, representative and examined for bias', 'Art. 10', m.data],
    ['Design it so people can understand, override and stop it, and assign trained people to do so', 'Arts. 14, 26', m.oversight],
    ['Declare and achieve suitable accuracy and robustness, and protect it against attacks', 'Art. 15', m.robust],
    ['Keep technical documentation and automatic logs; pass a conformity assessment and register before launch', 'Arts. 11, 12, 43, 49'],
    ['Monitor performance after launch and report serious incidents', 'Arts. 72, 73', m.monitor],
    ...extra,
  ];
}

export const EU: Record<string, FwEntry> = {
  spam: {
    cat: 'minimal', status: 'Minimal risk',
    summary: 'A spam filter is not on any of the Act’s lists, so it carries no specific duties. This is the point of a risk-based law: most AI is left alone. GDPR still applies, because the filter reads personal email.',
    reqs: [literacy, ['Voluntary codes of conduct are encouraged but not required', 'Art. 95']],
  },
  salary: {
    cat: 'high', status: 'High-risk (Annex III, point 4(b): decisions on terms of work), from 2 December 2027',
    summary: 'AI used to make or support decisions about pay, promotion or other terms of employment is high-risk. As the company using a vendor’s tool, Meridian is the deployer; if it builds the tool in-house, it is also the provider and carries the full list.',
    reqs: highRisk({ data: ['equity', 'robust'], oversight: ['bounds'], robust: ['robust', 'bounds'] }, [
      ['Inform workers’ representatives and the affected employees before using it', 'Art. 26(7)'],
      ['Give employees a clear explanation of a decision on request', 'Art. 86'],
    ]),
  },
  credit: {
    cat: 'high', status: 'High-risk (Annex III, point 5(b): creditworthiness), from 2 December 2027',
    summary: 'Scoring people’s creditworthiness is explicitly high-risk. Banks that use such a system must also assess its impact on fundamental rights before first use, and applicants can ask for an explanation of the decision.',
    reqs: highRisk({ data: ['dropzip', 'reweigh'], robust: ['monitor'], monitor: ['monitor'] }, [
      ['Assess the impact on fundamental rights before first use', 'Art. 27'],
      ['Explain individual decisions to applicants who ask', 'Art. 86', ['explain']],
    ]),
  },
  benefits: {
    cat: 'high', status: 'High-risk (Annex III, point 5(a): access to public benefits), from 2 December 2027',
    summary: 'Systems that help public authorities decide on eligibility for benefits, or reduce or revoke them, are high-risk. Public bodies using them must register the use and assess the impact on fundamental rights first. Using nationality as a risk factor would also breach EU non-discrimination law.',
    reqs: highRisk({ data: ['features', 'cv'], oversight: ['hitl'], robust: ['prune', 'cv'] }, [
      ['Assess the impact on fundamental rights before first use', 'Art. 27'],
      ['Public bodies must register the system in the EU database before use', 'Art. 26(8), 49'],
      ['Explain individual decisions to the people affected', 'Art. 86'],
    ]),
  },
  fraud: {
    cat: 'minimal', status: 'Minimal risk (fraud detection is excluded from Annex III)',
    summary: 'The Act deliberately excludes systems used to detect financial fraud from the credit-scoring category. If the same model were also used to decide whether someone gets credit, it would become high-risk.',
    reqs: [literacy, ['Re-check the classification if the model’s output starts feeding credit or account decisions', 'Annex III, 5(b)']],
  },
  segments: {
    cat: 'minimal', status: 'Minimal risk',
    summary: 'Marketing segmentation is not on the high-risk list. The ban on exploiting people’s vulnerabilities can still apply if offers are designed to take advantage of people because of their age, disability or economic situation in a way that causes significant harm.',
    reqs: [literacy, ['Do not use AI to exploit vulnerabilities of specific groups in ways that cause significant harm', 'Art. 5(1)(b)', ['audit']]],
  },
  staffing: {
    cat: 'minimal', status: 'Minimal risk (as used here)',
    summary: 'Forecasting total admissions is not on the high-risk list. It would become high-risk if it were used to allocate shifts to individual nurses based on their behaviour or traits, or to monitor their performance.',
    reqs: [literacy, ['Re-check the classification before using it to assign work to or evaluate individual staff', 'Annex III, 4(b)']],
  },
  lesion: {
    cat: 'high', status: 'High-risk (safety component of a medical device, Art. 6(1) and Annex I), from 2 August 2028',
    summary: 'Diagnostic software is a medical device under the EU Medical Device Regulation. Because it needs a notified body’s assessment under that law, it is high-risk under the AI Act too. Both sets of requirements are checked in one conformity assessment. These duties apply from 2 August 2028 (Annex I, after the 2026 Omnibus).',
    reqs: highRisk({ data: ['diverse'], oversight: ['clinician'], robust: ['advtrain', 'saliency'] }, [
      ['Combine the AI Act checks with the medical-device conformity assessment by a notified body', 'Art. 43(3)'],
    ]),
  },
  face: {
    cat: 'high', status: 'High-risk (Annex III, point 1(a): remote biometric identification), from 2 December 2027',
    summary: 'Identifying people at a distance by their face is high-risk. Some related uses are banned outright: building face databases by untargeted scraping, real-time identification in public spaces for law enforcement (with narrow exceptions) and inferring race or religion from faces. For identification systems, no action may be taken on a match unless at least two qualified people have verified it.',
    reqs: highRisk({ data: ['demotest', 'watchquality'], oversight: ['tworeview'], robust: ['threshold', 'demotest'] }, [
      ['Take no action on a match unless at least two trained people have confirmed it', 'Art. 14(5)', ['tworeview']],
      ['Do not build or expand face databases by untargeted scraping of images', 'Art. 5(1)(e)'],
    ]),
  },
  emotion: {
    cat: 'prohibited', status: 'Banned (Art. 5(1)(f): emotion recognition in the workplace)',
    summary: 'Since 2 February 2025 it is illegal in the EU to use AI to infer the emotions of people at work or in education, except for medical or safety reasons. No safeguard makes it compliant: the system must be switched off for staff. Analysing customers’ emotions is not banned, but it is high-risk and people must be told.',
    reqs: [
      ['Stop using emotion recognition on employees', 'Art. 5(1)(f)', ['stop']],
      ['Emotion recognition outside work and education is high-risk', 'Annex III, 1(c)', ['validate']],
      ['People exposed to emotion recognition must be informed', 'Art. 50(3)', ['notice']],
    ],
  },
  cv: {
    cat: 'high', status: 'High-risk (Annex III, point 4(a): recruitment and selection), from 2 December 2027',
    summary: 'Tools that filter applications, rank candidates or evaluate interviews are high-risk. The employer using the tool must inform candidates and workers’ representatives, and keep a trained person in charge of decisions.',
    reqs: highRisk({ data: ['cf', 'proxy'], oversight: ['human'], robust: ['cf'] }, [
      ['Tell candidates that an AI system is used to assess them', 'Art. 26(11)', ['human']],
      ['Inform workers’ representatives before deployment', 'Art. 26(7)'],
    ]),
  },
  feed: {
    cat: 'minimal', status: 'Minimal risk under the AI Act (platform rules apply)',
    summary: 'Recommender systems are not high-risk under the AI Act. The Digital Services Act covers them instead: very large platforms must assess systemic risks, explain their ranking and offer a feed not based on profiling. The AI Act ban on manipulative techniques that cause significant harm also applies.',
    reqs: [
      ['Do not use manipulative techniques that materially distort behaviour and cause significant harm', 'Art. 5(1)(a)', ['quality']],
      ['Very large platforms: assess and reduce systemic risks, including to minors and public debate', 'DSA Arts. 34–35', ['diversity', 'quality']],
      ['Explain the main ranking parameters and offer a feed not based on profiling', 'DSA Arts. 27, 38', ['nonprof']],
    ],
  },
  pricing: {
    cat: 'minimal', status: 'Minimal risk (consumer and competition law apply)',
    summary: 'Dynamic pricing is not high-risk under the AI Act. Exploiting people’s economic situation or other vulnerabilities in a way that causes significant harm is banned. EU consumer law requires shops to say when a price is personalised, and competition law applies to algorithms that coordinate prices.',
    reqs: [
      ['Do not exploit vulnerabilities due to age, disability or economic situation in ways that cause significant harm', 'Art. 5(1)(b)', ['reward', 'caps']],
      ['Tell customers when a price is personalised by automated decision-making', 'Consumer Rights Directive (as amended 2019)'],
      ['Algorithms must not coordinate prices with competitors', 'TFEU Art. 101', ['audit']],
    ],
  },
  foundation: {
    cat: 'gpai', status: 'General-purpose AI model (systemic risk above 10²⁵ operations)',
    summary: 'Developers of general-purpose models have their own chapter of duties, in force since August 2025. Models trained with more than 10²⁵ floating-point operations are presumed to have systemic risk and carry extra safety duties. Signing the EU’s General-Purpose AI Code of Practice (July 2025) is one way to show compliance.',
    reqs: [
      ['Keep technical documentation for the AI Office and give downstream developers what they need', 'Art. 53(1)(a)–(b)'],
      ['Have a copyright policy, including respecting machine-readable opt-outs', 'Art. 53(1)(c)', ['optout']],
      ['Publish a summary of the content used for training, using the Commission’s template', 'Art. 53(1)(d)', ['optout']],
      ['Systemic-risk models: evaluate the model, including adversarial testing, and reduce systemic risks', 'Art. 55(1)(a)–(b)', ['evals']],
      ['Systemic-risk models: report serious incidents and ensure strong cybersecurity', 'Art. 55(1)(c)–(d)', ['frontier']],
    ],
  },
  chatbot: {
    cat: 'limited', status: 'Transparency duties (Art. 50(1))',
    summary: 'A customer-service chatbot must make clear to people that they are talking to an AI. The model inside it comes from a general-purpose model provider, which carries its own duties. The airline remains responsible under consumer and contract law for what its bot says.',
    reqs: [
      ['Tell people they are interacting with an AI system', 'Art. 50(1)', ['handoff']],
      literacy,
      ['Rely on the model provider’s documentation to understand limits and use it accordingly', 'Art. 53(1)(b)'],
    ],
  },
  rag: {
    cat: 'minimal', status: 'Minimal risk (internal use)',
    summary: 'An internal assistant that answers staff questions is not high-risk. Duties would grow if it were used for high-risk purposes, for example to help decide on promotions. GDPR and confidentiality obligations apply to what it can retrieve.',
    reqs: [literacy, ['Re-check the classification if answers feed decisions about employees', 'Annex III, 4']],
  },
  imagegen: {
    cat: 'limited', status: 'Transparency duties (Art. 50(2) and 50(4))',
    summary: 'The provider of an image generator must mark its outputs in a machine-readable way. A company that publishes realistic images or video of real people, places or events that could pass as authentic (deepfakes) must disclose that they are AI-generated.',
    reqs: [
      ['Providers must mark generated images so they can be detected as AI-generated', 'Art. 50(2)', ['c2pa']],
      ['Deployers must disclose deepfakes', 'Art. 50(4)', ['c2pa', 'policy']],
      literacy,
    ],
  },
  code: {
    cat: 'minimal', status: 'Minimal risk',
    summary: 'A coding assistant used by developers is minimal risk. The security of the software it helps write is covered by other EU law, notably the Cyber Resilience Act for products with digital elements, whose main duties apply from December 2027.',
    reqs: [literacy, ['Software products must be secure by design and handle vulnerabilities (Cyber Resilience Act)', 'Regulation (EU) 2024/2847', ['sast', 'deps']]],
  },
  'travel-agent': {
    cat: 'depends', status: 'Depends on the task',
    summary: 'The Act classifies agents by what they are used for, not by the fact that they are agents. Booking travel is minimal risk. The same agent used to approve or reject employees’ expense claims could fall under the employment category. If the agent writes to people outside the company, they should know it is an AI.',
    reqs: [
      literacy,
      ['Tell people when they are interacting with an AI agent', 'Art. 50(1)'],
      ['Re-check the classification for every new task the agent takes on', 'Art. 6, Annex III'],
    ],
  },
  'devops-agent': {
    cat: 'minimal', status: 'Minimal risk under the AI Act (cyber-resilience law applies)',
    summary: 'An internal engineering agent is minimal risk under the AI Act. The consequences of what it does are covered elsewhere: NIS2 and, for financial firms, DORA require controlled change management and incident reporting for critical systems.',
    reqs: [
      literacy,
      ['Control changes to critical systems and report major incidents', 'NIS2 Art. 21–23; DORA Arts. 9, 19', ['review', 'gates']],
    ],
  },
  swarm: {
    cat: 'depends', status: 'Depends on the task',
    summary: 'There is no special category for multi-agent systems. Procurement is generally minimal risk, but each decision the agents take falls under the rules for that decision. Agents that negotiate with outside companies should disclose that they are AI.',
    reqs: [
      literacy,
      ['Tell counterparts when they are negotiating with an AI agent', 'Art. 50(1)', ['protocol']],
      ['Assign human oversight proportionate to the decisions the agents take', 'Art. 14 (good practice outside high-risk)', ['raci']],
    ],
  },
  insurance: {
    cat: 'high', status: 'High-risk (Annex III, point 5(c): risk assessment and pricing in life and health insurance), from 2 December 2027',
    summary: 'Pricing life and health insurance for individuals is explicitly high-risk, and deployers must assess the impact on fundamental rights before first use (Art. 27). Separately, EU law has banned using sex as a factor that leads to different premiums since 21 December 2012 (Test-Achats, C-236/09; Directive 2004/113/EC).',
    reqs: highRisk({ data: ['neutral', 'consent'], robust: ['reprice'], monitor: ['reprice'] }, [
      ['Assess the impact on fundamental rights before first use', 'Art. 27'],
      ['Do not use sex as a factor that leads to different premiums', 'Directive 2004/113/EC; Test-Achats (C-236/09)', ['neutral']],
    ]),
  },
  exam: {
    cat: 'high', status: 'High-risk (Annex III, point 3(d): monitoring prohibited behaviour during tests), from 2 December 2027',
    summary: 'Monitoring and detecting prohibited behaviour of students during tests is listed in Annex III. Adding emotion or “stress” inference would make it a banned practice: emotion recognition in education is prohibited under Art. 5(1)(f), except for medical or safety reasons.',
    reqs: highRisk({ data: ['pergroup'], oversight: ['review'], robust: ['pergroup', 'assess'] }, [
      ['Do not infer students’ emotions', 'Art. 5(1)(f)', ['noemotion']],
    ]),
  },
  voice: {
    cat: 'limited', status: 'Transparency duties (Art. 50)',
    summary: 'As deployer, Meridian must tell people they are interacting with an AI system (Art. 50(1)) and disclose deep-fake audio (Art. 50(4)). The provider of the text-to-speech system must mark its output in a machine-readable way (Art. 50(2)); for systems placed on the market before 2 August 2026 this applies from 2 December 2026.',
    reqs: [
      ['Tell people they are interacting with an AI system', 'Art. 50(1)', ['disclose']],
      ['Providers must mark generated audio so it can be detected as AI-generated', 'Art. 50(2)', ['disclose']],
      ['Deployers must disclose deep-fake audio', 'Art. 50(4)', ['disclose', 'licence']],
      literacy,
    ],
  },
  'browser-agent': {
    cat: 'depends', status: 'Depends on the task',
    summary: 'As with other agents, the Act classifies the use, not the agent. Processing supplier invoices is minimal risk. If the same agent were used to evaluate staff or assess creditworthiness, it would be high-risk.',
    reqs: [
      ['Re-check the classification for every new task the agent takes on', 'Art. 6, Annex III'],
      ['Assign human oversight proportionate to the decisions the agent takes', 'Art. 14 (good practice outside high-risk)', ['approvalux']],
      literacy,
    ],
  },
};
