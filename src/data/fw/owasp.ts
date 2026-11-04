import type { FwEntry } from '../frameworks';

export const OWASP: Record<string, FwEntry> = {
  spam: { cat: 'ml', status: 'ML Security Top 10', summary: 'Spam filters were among the first ML systems ever attacked. Attackers manipulate inputs to slip through and manipulate feedback to change what the model learns.', reqs: [
    ['Input manipulation: disguised words fool the classifier', 'ML01', ['normalise']],
    ['Data poisoning: fake spam reports retrain the model', 'ML02', ['reportguard']],
    ['Model skewing: feedback loops pushed in one direction over time', 'ML08', ['reportguard', 'retrain']],
  ] },
  salary: { cat: 'ml', status: 'ML Security Top 10 (low attack interest)', summary: 'Security is not the main risk here, but pay data is sensitive and the model could leak it.', reqs: [
    ['Data poisoning: tampered HR records shift recommendations', 'ML02', ['robust']],
    ['Model inversion: reconstructing individuals’ salaries from the model', 'ML03'],
  ] },
  credit: { cat: 'ml', status: 'ML Security Top 10', summary: 'Applicants have a reason to game the model, and the model holds sensitive financial information.', reqs: [
    ['Input manipulation: applicants tune inputs to cross the threshold', 'ML01', ['monitor']],
    ['Membership inference: learning whether someone’s data was in the training set', 'ML04'],
    ['Model theft: copying the scorecard by querying it repeatedly', 'ML05'],
  ] },
  benefits: { cat: 'ml', status: 'ML Security Top 10', summary: 'Public-sector models hold sensitive data and decisions can be gamed or tampered with.', reqs: [
    ['Data poisoning: biased or tampered investigation labels', 'ML02', ['features', 'cv']],
    ['Output integrity: tampering with risk scores between model and caseworker', 'ML09', ['hitl']],
  ] },
  fraud: { cat: 'ml', status: 'ML Security Top 10', summary: 'Fraud detection is a constant contest with attackers. Evasion and feedback manipulation are the main threats.', reqs: [
    ['Input manipulation: fraudsters probe and stay under the threshold', 'ML01', ['redteam']],
    ['Data poisoning: injecting mislabelled transactions', 'ML02', ['champion']],
    ['Model skewing: manipulating feedback so fraud is learned as normal', 'ML08', ['champion']],
  ] },
  segments: { cat: 'ml', status: 'ML Security Top 10 (privacy focus)', summary: 'The main security concern is the personal data the model and its segments reveal.', reqs: [
    ['Model inversion: segments reveal sensitive traits of individuals', 'ML03', ['dpia']],
    ['AI supply chain: unvetted third-party data sources', 'ML06', ['dpia']],
  ] },
  staffing: { cat: 'ml', status: 'ML Security Top 10 (low attack interest)', summary: 'Few attackers target admission forecasts, but hospital systems are frequent ransomware targets and the forecast pipeline should be protected.', reqs: [
    ['Data poisoning: corrupted admission records', 'ML02', ['anomaly']],
    ['Output integrity: altered forecasts reaching the rota', 'ML09', ['hitl']],
  ] },
  lesion: { cat: 'ml', status: 'ML Security Top 10', summary: 'Medical image models are well studied targets for adversarial examples.', reqs: [
    ['Input manipulation: invisible noise flips the diagnosis', 'ML01', ['advtrain']],
    ['Transfer learning attack: weaknesses inherited from a pre-trained base model', 'ML07', ['saliency']],
    ['AI supply chain: unverified public datasets and model weights', 'ML06', ['diverse']],
  ] },
  face: { cat: 'ml', status: 'ML Security Top 10', summary: 'Face systems are attacked to avoid detection or to impersonate someone, and they hold biometric data worth stealing.', reqs: [
    ['Input manipulation: masks, make-up patterns or printed photos (presentation attacks)', 'ML01', ['threshold']],
    ['Model inversion: reconstructing faces from stored templates', 'ML03', ['dpia']],
    ['AI supply chain: a vendor model with unknown training data', 'ML06', ['demotest']],
  ] },
  emotion: { cat: 'ml', status: 'ML Security Top 10', summary: 'Security is secondary to validity here, but voice data must be protected.', reqs: [
    ['Model inversion: inferring health or identity from voice features', 'ML03', ['notice']],
    ['AI supply chain: vendor models trained on undisclosed data', 'ML06', ['validate']],
  ] },
  cv: { cat: 'ml', status: 'ML Security Top 10', summary: 'Candidates have a strong reason to game CV screening, for example with hidden keywords.', reqs: [
    ['Input manipulation: hidden white-text keywords in CVs', 'ML01', ['human']],
    ['Data poisoning: biased historic hiring labels', 'ML02', ['cf']],
    ['AI supply chain: third-party screening model', 'ML06', ['cf']],
  ] },
  feed: { cat: 'ml', status: 'ML Security Top 10', summary: 'Recommenders are manipulated at scale by fake engagement.', reqs: [
    ['Model skewing: bot networks inflate engagement to push content', 'ML08', ['quality']],
    ['Data poisoning: coordinated campaigns shape what the model learns', 'ML02', ['diversity']],
  ] },
  pricing: { cat: 'ml', status: 'ML Security Top 10', summary: 'Competitors and bots can feed the agent misleading signals.', reqs: [
    ['Model skewing: fake demand signals push prices', 'ML08', ['audit']],
    ['Model theft: competitors reverse-engineer the pricing policy', 'ML05'],
  ] },
  foundation: { cat: 'llm', status: 'LLM Top 10 (2025)', summary: 'For a model developer, the training pipeline and data supply chain are the main attack surface.', reqs: [
    ['Data and model poisoning: planted content in scraped web data', 'LLM04', ['optout']],
    ['Supply chain: unvetted datasets and third-party components', 'LLM03', ['optout']],
    ['Sensitive information disclosure: memorised personal data', 'LLM02', ['piifilter']],
    ['Model theft and weight security', 'ML05 / LLM03', ['frontier']],
  ] },
  chatbot: { cat: 'llm', status: 'LLM Top 10 (2025)', summary: 'A customer chatbot is exposed to everyone on the internet. Prompt injection and data leakage are the first things attackers try.', reqs: [
    ['Prompt injection: "ignore previous instructions"', 'LLM01', ['guard']],
    ['Sensitive information disclosure: other customers’ bookings', 'LLM02', ['authz']],
    ['System prompt leakage: revealing internal rules', 'LLM07', ['guard']],
    ['Misinformation: invented policies', 'LLM09', ['rag']],
  ] },
  rag: { cat: 'llm', status: 'LLM Top 10 (2025)', summary: 'Retrieval adds its own weaknesses: what is in the index and who can reach it.', reqs: [
    ['Prompt injection (indirect): instructions hidden in documents', 'LLM01', ['sanitize']],
    ['Vector and embedding weaknesses: retrieval ignores access rights', 'LLM08', ['acl']],
    ['Sensitive information disclosure', 'LLM02', ['acl']],
    ['Misinformation: outdated or ungrounded answers', 'LLM09', ['fresh', 'cite']],
  ] },
  imagegen: { cat: 'llm', status: 'LLM Top 10 (2025)', summary: 'The list was written for language models but its themes apply to image generation too.', reqs: [
    ['Prompt injection: getting around content filters', 'LLM01', ['policy']],
    ['Improper output handling: publishing outputs without checks', 'LLM05', ['review']],
    ['Misinformation: realistic fakes', 'LLM09', ['c2pa']],
  ] },
  code: { cat: 'llm', status: 'LLM Top 10 (2025)', summary: 'AI-written code must be treated as untrusted input to your codebase.', reqs: [
    ['Improper output handling: generated code merged without checks', 'LLM05', ['sast', 'review']],
    ['Supply chain: hallucinated or malicious packages', 'LLM03', ['deps']],
    ['Sensitive information disclosure: secrets in the context window', 'LLM02', ['secrets']],
  ] },
  'travel-agent': { cat: 'agentic', status: 'Agentic AI threats + LLM Top 10', summary: 'Agents combine every LLM weakness with the power to act. Injected instructions can now trigger real actions.', reqs: [
    ['Goal hijacking through instructions hidden in web pages', 'Agentic · LLM01', ['untrusted']],
    ['Excessive agency: more permissions than the task needs', 'LLM06', ['least']],
    ['Tool misuse: payments and email used outside the task', 'Agentic', ['approval', 'least']],
    ['Identity and privilege abuse; missing audit trail', 'Agentic', ['log']],
  ] },
  'devops-agent': { cat: 'agentic', status: 'Agentic AI threats + LLM Top 10', summary: 'An agent with shell and database access can cause damage at machine speed.', reqs: [
    ['Excessive agency: production credentials', 'LLM06', ['sandbox']],
    ['Unexpected code execution and tool misuse', 'Agentic', ['gates']],
    ['Misleading reporting: trusting the agent’s own summary', 'Agentic · human trust', ['verify']],
    ['Improper output handling: unreviewed deploys', 'LLM05', ['review']],
  ] },
  swarm: { cat: 'agentic', status: 'Agentic AI threats', summary: 'Multi-agent systems add threats that do not exist with a single model.', reqs: [
    ['Cascading failures: one hallucination spreads through the network', 'Agentic', ['verify']],
    ['Insecure communication between agents, including outside agents', 'Agentic', ['protocol']],
    ['Unbounded consumption: runaway loops', 'LLM10', ['breaker']],
    ['Rogue agents: no owner, no kill switch', 'Agentic', ['raci']],
  ] },
};
