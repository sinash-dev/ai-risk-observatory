import type { FwId } from './frameworks';

export interface GlossaryTerm {
  id: string;
  term: string;
  def: string;
  /** site paths that show the idea in action */
  see?: string[];
  fw?: FwId[];
}

const T = (term: string, def: string, see?: string[], fw?: FwId[]): GlossaryTerm => ({
  id: term.toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  term, def, see, fw,
});

export const GLOSSARY: GlossaryTerm[] = [
  T('Agent', 'An AI system that plans and takes actions with tools, such as sending emails, making payments or changing code, with limited human input.', ['/model/travel-agent', '/model/devops-agent']),
  T('AI literacy', 'The skills and understanding people need to use AI sensibly and to know its risks. The EU AI Act asks providers and deployers to take measures to support it (Art. 4).', ['/rules/eu'], ['eu']),
  T('Automation bias', 'The tendency to accept a system’s output without enough scrutiny, especially under time pressure. Human oversight only works if people are trained to resist it.', ['/model/benefits']),
  T('Benchmark', 'A standard test set used to compare models. A high benchmark score does not prove a model works for your users or your data.', ['/model/lesion']),
  T('C2PA and Content Credentials', 'An open standard for attaching signed information about how a piece of content was made, including whether AI was used.', ['/model/imagegen']),
  T('Calibration', 'Whether a model’s probabilities match reality: of all cases scored 70%, about 70% should turn out positive. It can differ between groups.', ['/model/credit']),
  T('CE marking', 'The mark showing that a product meets EU requirements. High-risk AI systems need it after a conformity assessment.', ['/rules/eu'], ['eu']),
  T('Champion and challenger', 'Running a new model (the challenger) alongside the current one (the champion) on live data before switching, to check it really is better.', ['/model/fraud']),
  T('Conformity assessment', 'The check that a high-risk AI system meets the EU AI Act’s requirements before it is placed on the market, done by the provider or by a notified body.', ['/rules/eu'], ['eu']),
  T('Counterfactual explanation', 'An explanation of the form “you would have been approved if your debt ratio had been below 0.45”. It tells people what would change the outcome.', ['/model/credit']),
  T('Data poisoning', 'Corrupting training data, or data a system learns from in use, so the model learns something harmful or exploitable.', ['/model/spam', '/model/rag'], ['owasp']),
  T('Deepfake', 'Realistic fake audio, images or video of real people or events, made with AI. Several frameworks require them to be disclosed or labelled.', ['/model/imagegen'], ['eu', 'cn', 'kr']),
  T('Demographic parity', 'A fairness measure that compares the rate of positive outcomes, such as approvals, between groups.', ['/model/credit']),
  T('Deployer', 'In the EU AI Act, the organisation that uses an AI system in its professional activity. It has a shorter list of duties than the provider.', ['/rules/eu'], ['eu']),
  T('Disparate impact', 'When a neutral-looking rule or model produces much worse outcomes for a protected group. US anti-discrimination law judges decisions on these effects.', ['/model/cv', '/model/credit'], ['us']),
  T('Drift', 'When the data a model sees in use starts to differ from the data it was trained on, so its performance quietly drops.', ['/model/credit', '/model/fraud']),
  T('DPIA (data protection impact assessment)', 'A GDPR assessment required before processing that is likely to be high-risk, such as large-scale profiling (Art. 35).', ['/rules/gdpr'], ['gdpr']),
  T('Embedding', 'A list of numbers that represents the meaning of a piece of text or an image, so similar items end up close together. Used for search and retrieval.', ['/model/rag']),
  T('Equalised odds', 'A fairness measure that compares error rates, both false positives and false negatives, between groups.', ['/model/face']),
  T('Evaluation (eval)', 'A structured test of what a model can do and how it fails, including tests for dangerous capabilities.', ['/model/foundation']),
  T('Fairness impossibility result', 'When groups have different base rates, a model cannot generally satisfy calibration and equal error rates at the same time. Someone has to choose which matters most.', ['/model/credit']),
  T('Fine-tuning', 'Further training of an existing model on a smaller, specific dataset to adapt it to a task.', ['/model/foundation']),
  T('Four-fifths rule', 'A rule of thumb from US employment practice: if one group’s selection rate is below 80% of the highest group’s, the gap needs explaining.', ['/model/cv'], ['us']),
  T('FRIA (fundamental-rights impact assessment)', 'An assessment some deployers of high-risk AI must do before first use under EU AI Act Art. 27, covering who is affected, the risks and the oversight measures.', ['/rules/eu', '/toolkit'], ['eu']),
  T('General-purpose AI model', 'A model, such as a large language model, that can perform many different tasks and be built into many systems. The EU AI Act sets duties for its developers.', ['/model/foundation'], ['eu']),
  T('Guardrail', 'A control around a model, such as an input filter, output check or tool restriction, that blocks unwanted behaviour.', ['/model/chatbot']),
  T('Hallucination (confabulation)', 'When a generative model produces fluent, confident content that is false.', ['/model/chatbot', '/model/rag']),
  T('Harmonised standard', 'A European standard whose reference the Commission has published in the Official Journal. Following it gives a presumption of conformity with the parts of the AI Act it covers. EN 18286 on quality management was the first, in October 2026.', ['/rules/eu'], ['eu']),
  T('High-impact AI', 'Under Korea’s AI Basic Act, AI used in one of ten listed areas, such as hiring or credit, that may significantly affect lives, safety or rights.', ['/rules/kr'], ['kr']),
  T('High-risk', 'In the EU AI Act, a use listed in the law (such as hiring or credit) or a safety component of a regulated product. It describes the use, not the technology.', ['/rules/eu', '/classify'], ['eu']),
  T('Human in, on or over the loop', 'How involved a person is: in the loop means a person decides; on or over the loop means the AI acts and a person supervises and can step in; out of the loop means no one checks each decision.', ['/rules/sg'], ['sg']),
  T('Human oversight', 'Arrangements that let trained people understand an AI system’s output, overrule it and stop it.', ['/model/benefits'], ['eu']),
  T('Impact assessment', 'A structured look at how a system could affect people and society before it is used. Examples are the GDPR’s DPIA and the EU AI Act’s FRIA.', ['/toolkit']),
  T('Importer', 'In the EU AI Act, an EU organisation that places on the market an AI system from a provider outside the EU. It must check the provider has done its job.', ['/rules/eu'], ['eu']),
  T('Jailbreak', 'A prompt designed to make a model ignore its safety rules.', ['/model/chatbot'], ['owasp']),
  T('LIME', 'A method that explains a single prediction by fitting a simple model to small changes around that case.', ['/model/fraud']),
  T('MCP (Model Context Protocol)', 'An open protocol for connecting AI applications to tools and data sources. Each connected tool widens what an agent can do, and what an attacker can reach.', ['/model/travel-agent'], ['owasp']),
  T('Membership inference', 'An attack that works out whether a particular person’s data was used to train a model.', ['/model/foundation'], ['owasp', 'gdpr']),
  T('Model card', 'A short document describing what a model is for, how it was trained and tested, its known limits and who should not use it.', ['/toolkit']),
  T('Model inversion', 'An attack that reconstructs sensitive training data from a model’s outputs.', ['/model/foundation'], ['owasp']),
  T('Notified body', 'An independent organisation designated by an EU member state to carry out third-party conformity assessments.', ['/rules/eu'], ['eu']),
  T('Presumption of conformity', 'If you follow a harmonised standard, the law presumes you meet the requirements it covers. You can still comply another way, but then you must show how yourself.', ['/rules/eu'], ['eu']),
  T('Prompt injection', 'Hiding instructions in text a model reads (a message, web page or document) so it does something its owner did not intend.', ['/model/chatbot', '/model/travel-agent'], ['owasp']),
  T('Provider', 'In the EU AI Act, the organisation that develops an AI system or model, or has it developed, and places it on the market under its own name.', ['/rules/eu'], ['eu']),
  T('Proxy', 'A feature that stands in for a protected trait, such as a postcode that closely tracks ethnicity.', ['/model/credit', '/model/cv']),
  T('PSI (population stability index)', 'A number that measures how much the distribution of a feature or score has shifted since training. A common alert for drift.', ['/model/credit']),
  T('RAG (retrieval-augmented generation)', 'Answering questions by first retrieving relevant documents and then asking a language model to answer from them.', ['/model/rag']),
  T('Red-teaming', 'Deliberately trying to make a system fail or misbehave before attackers or users do.', ['/model/foundation', '/model/chatbot']),
  T('RLHF (reinforcement learning from human feedback)', 'Training a model to prefer responses people rated as better. It shapes tone and helpfulness but does not guarantee truth.', ['/model/foundation']),
  T('SHAP', 'A method that splits a prediction into contributions from each feature, so you can see what pushed a score up or down.', ['/model/fraud']),
  T('Substantial modification', 'A change to an AI system after it is on the market that affects compliance or its intended purpose. Under the EU AI Act it can make you the provider.', ['/rules/eu'], ['eu']),
  T('System card', 'Like a model card, but for a whole AI system: the model plus its data, tools, safeguards and intended use.', ['/toolkit']),
  T('Systemic risk', 'The EU AI Act category for the most capable general-purpose models, presumed above 10²⁵ floating-point operations of training compute.', ['/model/foundation'], ['eu']),
  T('Threshold', 'The cut-off that turns a score into a decision, such as “approve if the probability of repayment is above 0.5”. Moving it changes who is affected.', ['/model/credit', '/model/face']),
  T('Tool use', 'A model calling external functions, such as search, email or payments, as part of answering a request.', ['/model/travel-agent']),
  T('Vector store', 'A database of embeddings that finds the items most similar to a query. Access controls must follow the original documents.', ['/model/rag'], ['owasp']),
  T('Watermarking', 'Embedding a hidden signal in AI-generated content so it can be detected later. It can be weakened by editing.', ['/model/imagegen'], ['eu', 'cn']),
];

export const GLOSSARY_BY_ID = Object.fromEntries(GLOSSARY.map((g) => [g.id, g])) as Record<string, GlossaryTerm>;
