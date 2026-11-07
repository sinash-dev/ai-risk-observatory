/** Answer options shared by the classification wizard and the AI register. */
import { AREA_TEXT, type Answers, type Area, type Banned, type Interact, type Service, type Where } from './classify';

export type Opt<T> = { v: T; l: string; d?: string };
export const WHERE: Opt<Where>[] = [{ v: 'eu', l: 'EU or EEA' }, { v: 'uk', l: 'United Kingdom' }, { v: 'us', l: 'United States' }, { v: 'cn', l: 'China' }, { v: 'kr', l: 'South Korea' }, { v: 'sg', l: 'Singapore' }, { v: 'other', l: 'Somewhere else' }];
export const ROLE: Opt<Answers['role']>[] = [
  { v: 'provider', l: 'We build it and offer it under our name', d: 'Provider' },
  { v: 'deployer', l: 'We use a system built by someone else', d: 'Deployer' },
  { v: 'both', l: 'Both: we build it and use it ourselves', d: 'Provider and deployer' },
  { v: 'distributor', l: 'We import or resell it', d: 'Importer or distributor' },
];
export const BANNED: Opt<Banned>[] = [
  { v: 'social-scoring', l: 'Scores people’s social behaviour or traits in a way that leads to unfair treatment' },
  { v: 'emotion-work', l: 'Recognises emotions of workers or students (not for medical or safety reasons)' },
  { v: 'manipulation', l: 'Uses manipulative or deceptive techniques that can cause significant harm' },
  { v: 'vulnerabilities', l: 'Exploits vulnerabilities due to age, disability or social or economic situation' },
  { v: 'face-scraping', l: 'Builds face-recognition databases by scraping images from the internet or CCTV' },
  { v: 'biometric-sensitive', l: 'Sorts people by biometrics to infer ethnicity, religion, politics or sexual orientation' },
  { v: 'crime-prediction', l: 'Predicts that a person will commit a crime from profiling alone' },
  { v: 'rbi-police', l: 'Identifies people remotely in real time in public spaces, for law enforcement' },
  { v: 'ncii', l: 'Generates non-consensual intimate content or child sexual abuse material' },
];
export const AREAS: Opt<Area>[] = [...(Object.keys(AREA_TEXT) as Exclude<Area, 'none'>[]).map((v) => ({ v: v as Area, l: AREA_TEXT[v].charAt(0).toUpperCase() + AREA_TEXT[v].slice(1) })), { v: 'none', l: 'None of these' }];
export const SERVICES: Opt<Service>[] = [{ v: 'credit', l: 'Credit scoring or creditworthiness' }, { v: 'insurance', l: 'Risk and pricing for life or health insurance' }, { v: 'benefits', l: 'Eligibility for public benefits or services' }, { v: 'emergency', l: 'Triage of emergency calls' }, { v: 'fraud', l: 'Detecting financial fraud' }];
export const INTERACT: Opt<Interact>[] = [{ v: 'chat', l: 'Talks or chats with people directly' }, { v: 'generate', l: 'Generates or alters text, images, audio or video' }, { v: 'deepfake', l: 'Creates realistic content showing real people or events' }, { v: 'emotion', l: 'Recognises emotions (outside work and education)' }, { v: 'biometric-cat', l: 'Categorises people from biometric data (where allowed)' }];

