/**
 * Rules behind "Classify your system". Pure and unit-tested. Indicative only:
 * it follows the guides on this site, not every nuance of each law.
 */
import { fwEntry, LABS } from '../data/labs';
import type { TierId } from '../data/types';

export type Where = 'eu' | 'uk' | 'us' | 'cn' | 'kr' | 'sg' | 'other';
export type Role = 'provider' | 'deployer' | 'both' | 'distributor';
export type Banned = 'social-scoring' | 'emotion-work' | 'manipulation' | 'vulnerabilities' | 'face-scraping' | 'biometric-sensitive' | 'crime-prediction' | 'rbi-police' | 'ncii';
export type Area = 'biometrics' | 'infrastructure' | 'education' | 'employment' | 'services' | 'law' | 'migration' | 'justice' | 'none';
export type Service = 'credit' | 'insurance' | 'benefits' | 'emergency' | 'fraud';
export type Interact = 'chat' | 'generate' | 'deepfake' | 'emotion' | 'biometric-cat';

export interface Answers {
  where: Where[];
  role: Role;
  banned: Banned[];
  product: 'yes' | 'no' | 'unsure';
  area: Area;
  service?: Service;
  narrow?: 'yes' | 'no';
  gpai: 'no' | 'yes' | 'systemic';
  interact: Interact[];
  personal: 'yes' | 'no';
  automated: 'yes' | 'no';
  agent: 'yes' | 'no';
}

export const EMPTY: Answers = { where: [], role: 'deployer', banned: [], product: 'no', area: 'none', gpai: 'no', interact: [], personal: 'no', automated: 'no', agent: 'no' };

export type EuCat = 'banned' | 'high' | 'gpai-systemic' | 'gpai' | 'limited' | 'minimal' | 'outside';
export interface Card { id: string; title: string; verdict: string; tone: 'bad' | 'warn' | 'ok' | 'info'; why: string[]; next: string[]; link: string }
export interface Result { eu: EuCat; euFrom?: string; cards: Card[]; tier: TierId; examples: string[]; notes: string[] }

const BANNED_TEXT: Record<Banned, string> = {
  'social-scoring': 'social scoring that leads to unfair treatment',
  'emotion-work': 'emotion recognition at work or in education (other than for medical or safety reasons)',
  manipulation: 'manipulative or deceptive techniques that cause significant harm',
  vulnerabilities: 'exploiting vulnerabilities due to age, disability or social or economic situation',
  'face-scraping': 'untargeted scraping of facial images to build recognition databases',
  'biometric-sensitive': 'biometric categorisation to infer sensitive traits such as ethnicity or beliefs',
  'crime-prediction': 'predicting that someone will commit a crime from profiling alone',
  'rbi-police': 'real-time remote biometric identification in public spaces for law enforcement (narrow exceptions)',
  ncii: 'generating non-consensual intimate or sexual content or child sexual abuse material (banned from 2 December 2026)',
};
export const AREA_TEXT: Record<Exclude<Area, 'none'>, string> = {
  biometrics: 'biometrics (identification, categorisation, emotion recognition)',
  infrastructure: 'critical infrastructure (energy, water, transport, digital)',
  education: 'education and vocational training',
  employment: 'employment and management of workers',
  services: 'access to essential private and public services',
  law: 'law enforcement',
  migration: 'migration, asylum and border control',
  justice: 'justice and democratic processes, including elections',
};
const KR_AREAS: Area[] = ['infrastructure', 'education', 'employment', 'law'];

/** which family of model the answers point to */
export function tierOf(a: Answers): TierId {
  if (a.agent === 'yes') return 'agentic';
  if (a.gpai !== 'no' || a.interact.includes('chat') || a.interact.includes('generate') || a.interact.includes('deepfake')) return 'genai';
  if (a.area === 'biometrics' || a.interact.includes('emotion') || a.interact.includes('biometric-cat')) return 'deep';
  return 'classical';
}

/** the Annex III area an example belongs to, for "closest examples" */
const LAB_AREA: Record<string, Area> = {
  salary: 'employment', cv: 'employment', emotion: 'employment', credit: 'services', benefits: 'services', fraud: 'services', insurance: 'services',
  face: 'biometrics', exam: 'education', lesion: 'none',
};

export function classify(a: Answers): Result {
  const cards: Card[] = [];
  const notes: string[] = [];
  const inEU = a.where.includes('eu');
  const provider = a.role === 'provider' || a.role === 'both';

  // ---------- EU AI Act ----------
  let eu: EuCat = 'outside';
  let euFrom: string | undefined;
  const why: string[] = [];
  const next: string[] = [];
  const high = (() => {
    if (a.product === 'yes') return { annex: 'I' as const };
    if (a.area === 'none') return null;
    if (a.area === 'services' && a.service === 'fraud') return null; // Annex III 5(b) excludes fraud detection
    if (a.area === 'services' && a.service === undefined) return { annex: 'III' as const };
    if (a.narrow === 'yes') return null; // Art. 6(3) derogation
    return { annex: 'III' as const };
  })();
  const transparency = a.interact.some((x) => x === 'chat' || x === 'generate' || x === 'deepfake' || x === 'emotion' || x === 'biometric-cat');

  if (inEU) {
    if (a.banned.length) {
      eu = 'banned';
      why.push(`It does something on the banned list (Art. 5): ${a.banned.map((b) => BANNED_TEXT[b]).join('; ')}.`);
      next.push('Do not place it on the market or use it in the EU. No safeguard makes a banned practice compliant.', 'Check the narrow exceptions in Art. 5 with a lawyer before concluding otherwise.');
      euFrom = a.banned.every((b) => b === 'ncii') ? '2 December 2026' : '2 February 2025';
    } else if (high) {
      eu = 'high';
      euFrom = high.annex === 'I' ? '2 August 2028' : '2 December 2027';
      why.push(high.annex === 'I'
        ? 'It is, or is a safety component of, a product under EU product law that needs third-party conformity assessment (Art. 6(1), Annex I).'
        : `It makes or supports decisions in an Annex III area: ${AREA_TEXT[a.area as Exclude<Area, 'none'>]}.`);
      if (provider) next.push('Set up a risk management system, data governance, technical documentation, logging and human oversight (Arts. 9–15).', 'Run the conformity assessment, affix the CE mark and register in the EU database (Arts. 43, 49).', 'Monitor after launch and report serious incidents (Arts. 72–73).');
      if (a.role !== 'provider') next.push('As deployer: use it as instructed, assign trained people to oversee it, keep logs, and inform workers and affected people (Art. 26).');
      if (a.role !== 'provider') next.push(a.area === 'services' && (a.service === 'credit' || a.service === 'insurance' || a.service === 'benefits')
        ? 'Assess the impact on fundamental rights before first use (Art. 27): it is required for public bodies and for deployers who score credit or price life and health insurance.'
        : 'If you are a public body or provide public services, assess the impact on fundamental rights before first use (Art. 27).');
      if (a.role === 'distributor') next.push('As importer or distributor: check the CE mark and documentation before passing it on.');
    } else if (a.gpai !== 'no' && provider) {
      eu = a.gpai === 'systemic' ? 'gpai-systemic' : 'gpai';
      euFrom = '2 August 2025';
      why.push(a.gpai === 'systemic' ? 'You develop a general-purpose AI model trained with more than 10²⁵ floating-point operations, so it is presumed to have systemic risk (Art. 51).' : 'You develop and place on the market a general-purpose AI model.');
      next.push('Prepare technical documentation for the AI Office and for downstream providers, a copyright policy and a public summary of training content (Art. 53).');
      if (a.gpai === 'systemic') next.push('Evaluate and red-team the model, assess and reduce systemic risks, report serious incidents and protect the weights (Art. 55). The Code of Practice shows how.');
    } else if (transparency) {
      eu = 'limited';
      euFrom = '2 August 2026';
      why.push('It interacts with people, generates or alters content, or recognises emotions or categorises people where that is allowed (Art. 50).');
      next.push('Tell people when they are dealing with an AI system, unless it is obvious.', 'Mark AI-generated content in a machine-readable way and disclose deepfakes.');
    } else {
      eu = 'minimal';
      why.push('None of the banned practices, high-risk areas, general-purpose model duties or transparency triggers apply.');
      next.push('No specific duties beyond AI literacy. Voluntary codes of conduct are encouraged (Art. 95).');
    }
    if (eu !== 'banned' && a.area !== 'none' && a.narrow === 'yes' && a.product !== 'yes') notes.push('You answered that it only performs a narrow or preparatory task and does not profile people (Art. 6(3)). If so, you must document this assessment and still register the system.');
    if (a.area === 'services' && a.service === 'fraud') notes.push('Annex III point 5(b) covers creditworthiness and credit scoring but excludes AI used to detect financial fraud.');
    if (eu === 'high' && high?.annex === 'III') notes.push('The Commission published draft guidelines on what counts as high-risk, with practical examples, on 19 May 2026. They are still a draft, but worth checking against your use case.');
    if (a.product === 'unsure') notes.push('Check whether your product falls under one of the EU laws listed in Annex I (such as medical devices, machinery, toys, lifts or vehicles). If it does and needs third-party conformity assessment, it is high-risk from 2 August 2028.');
    if (eu !== 'banned' && eu !== 'minimal' && transparency && eu !== 'limited') next.push('The transparency duties in Art. 50 also apply: disclose AI interaction and mark generated content.');
    next.push('Everyone: take measures to support the AI literacy of staff who build or use the system (Art. 4).');
    const label: Record<EuCat, string> = { banned: 'Banned', high: `High-risk from ${euFrom}`, 'gpai-systemic': 'General-purpose AI model with systemic risk', gpai: 'General-purpose AI model', limited: 'Transparency duties', minimal: 'Minimal risk', outside: '' };
    cards.push({ id: 'eu', title: 'EU AI Act', verdict: label[eu], tone: eu === 'banned' ? 'bad' : eu === 'high' || eu === 'gpai-systemic' ? 'warn' : eu === 'minimal' ? 'ok' : 'info', why, next, link: '/rules/eu' });
  }

  // ---------- GDPR / UK GDPR ----------
  if (a.personal === 'yes' && (inEU || a.where.includes('uk'))) {
    const g: Card = { id: 'gdpr', title: inEU ? 'GDPR' : 'UK GDPR', verdict: 'Applies', tone: 'info', why: ['The system uses personal data.'], next: ['Identify a lawful basis for each use of personal data, including training (Art. 6).', 'Tell people how their data is used (Arts. 13–15).'], link: '/rules/gdpr' };
    if (a.automated === 'yes') { g.tone = 'warn'; g.why.push('It makes decisions with legal or similarly significant effects without meaningful human involvement.'); g.next.push('Article 22: offer human review, a chance to give their view and to contest, or redesign so a person genuinely decides.'); }
    if (a.automated === 'yes' || a.area !== 'none' || a.interact.includes('biometric-cat') || a.interact.includes('emotion')) g.next.push('A data protection impact assessment is likely to be required (Art. 35).');
    if (a.area === 'biometrics' || a.interact.includes('biometric-cat') || a.interact.includes('emotion')) g.next.push('Biometric and other special-category data is forbidden unless an Article 9 exception applies.');
    cards.push(g);
  }

  // ---------- Korea ----------
  if (a.where.includes('kr')) {
    const highImpact = KR_AREAS.includes(a.area) || (a.area === 'services' && (a.service === 'credit' || a.service === 'benefits')) || a.product === 'yes';
    const gen = a.interact.includes('generate') || a.interact.includes('deepfake') || a.gpai !== 'no';
    const k: Card = { id: 'kr', title: 'Korea AI Basic Act', verdict: highImpact ? 'Likely high-impact AI' : gen ? 'Generative AI duties' : 'General duties only', tone: highImpact ? 'warn' : 'info', why: [], next: [], link: '/rules/kr' };
    if (highImpact) { k.why.push('The use falls in or near one of the ten high-impact areas, such as hiring, credit assessment, education, public services, energy or transport.'); k.next.push('Assess whether it is high-impact (you can ask the Ministry of Science and ICT to confirm), then put in place a risk management plan, explanation measures, user protection and human oversight.'); }
    if (gen) { k.why.push('It produces generative AI output.'); k.next.push('Tell users in advance that the service uses generative AI, label outputs and clearly mark deepfakes.'); }
    if (highImpact) k.next.push('Give users advance notice that the product or service is based on high-impact AI.');
    if (!highImpact && !gen) k.why.push('It is not in a high-impact area and does not generate content.');
    k.next.push('Foreign operators above the size thresholds must appoint a domestic representative.');
    cards.push(k);
  }

  // ---------- United States ----------
  if (a.where.includes('us')) {
    const u: Card = { id: 'us', title: 'United States', verdict: 'Sector and state rules', tone: 'info', why: ['There is no single federal AI law; existing laws apply to the decision being made.'], next: [], link: '/rules/us' };
    if (a.area === 'employment') u.next.push('Employment: civil-rights law (Title VII, ADA, ADEA) applies to discriminatory effects, including of vendor tools. In New York City, automated hiring tools need a yearly bias audit and candidate notice (Local Law 144). Illinois HB 3773 bans discriminatory AI use in employment.');
    if (a.area === 'services' && a.service === 'credit') u.next.push('Credit: the Equal Credit Opportunity Act and FCRA require specific reasons for adverse decisions, however complex the model.');
    if (a.area !== 'none' && a.area !== 'biometrics') u.next.push('Colorado SB 26-189 (from 1 January 2027): if it materially influences consequential decisions about Colorado residents, give notice, explain adverse outcomes, allow data correction and offer human review.');
    if (a.area === 'biometrics' || a.interact.includes('biometric-cat')) u.next.push('Biometrics: Illinois BIPA requires written consent before collecting face geometry and similar data, with private lawsuits allowed.');
    if (a.interact.includes('chat')) u.next.push('Bots: Utah and California require disclosure that people are dealing with AI in some settings.');
    if (a.gpai === 'systemic' && provider) u.next.push('California SB 53: large frontier-model developers must publish safety frameworks and report critical safety incidents.');
    u.next.push('The FTC Act bans unfair or deceptive AI practices, including false claims about what the system can do.');
    cards.push(u);
  }

  // ---------- OWASP ----------
  const tier = tierOf(a);
  const lists = tier === 'agentic' ? 'Top 10 for Agentic Applications (2026) and Top 10 for LLM Applications (2026)' : tier === 'genai' ? 'Top 10 for LLM Applications (2026)' : 'Machine Learning Security Top 10 (2023)';
  cards.push({
    id: 'owasp', title: 'OWASP security testing', verdict: lists, tone: 'info',
    why: [tier === 'agentic' ? 'It acts autonomously with tools, so agent-specific attacks such as goal hijack and privilege abuse apply.' : tier === 'genai' ? 'It uses a generative model, so prompt injection, sensitive information disclosure and excessive agency apply.' : 'It is a predictive model, so input manipulation, data poisoning and model theft apply.'],
    next: tier === 'agentic' ? ['Give tools least privilege, treat tool output as untrusted, and require approval for irreversible actions.'] : tier === 'genai' ? ['Test for prompt injection, keep secrets out of the context, and check outputs before acting on them.'] : ['Test robustness to manipulated inputs and protect the training pipeline from poisoning.'],
    link: '/rules/owasp',
  });

  // ---------- closest examples ----------
  const euCatOf: Record<EuCat, string> = { banned: 'prohibited', high: 'high', 'gpai-systemic': 'gpai', gpai: 'gpai', limited: 'limited', minimal: 'minimal', outside: '' };
  const scored = LABS.map((l) => {
    let s = 0;
    if (LAB_AREA[l.id] && LAB_AREA[l.id] === a.area) s += 3;
    if (inEU && fwEntry('eu', l.id).cat === euCatOf[eu]) s += 2;
    if (l.tier === tier) s += 2;
    if (a.agent === 'yes' && l.tier === 'agentic') s += 1;
    if (a.service === 'fraud' && l.id === 'fraud') s += 3;
    if (a.service === 'credit' && l.id === 'credit') s += 2;
    if (a.service === 'insurance' && l.id === 'insurance') s += 2;
    if (a.service === 'benefits' && l.id === 'benefits') s += 2;
    if (a.banned.includes('emotion-work') && l.id === 'emotion') s += 3;
    if (a.gpai !== 'no' && l.id === 'foundation') s += 3;
    if (a.interact.includes('chat') && l.id === 'chatbot') s += 1;
    if (a.interact.includes('generate') && l.id === 'imagegen') s += 1;
    if (a.product === 'yes' && l.id === 'lesion') s += 2;
    return { id: l.id, s };
  }).sort((x, y) => y.s - x.s);
  const examples = scored.slice(0, 3).map((x) => x.id);

  return { eu, euFrom, cards, tier, examples, notes };
}
