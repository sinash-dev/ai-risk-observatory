import { describe, expect, it } from 'vitest';
import { EMPTY, classify, type Answers } from '../classify';

const A = (x: Partial<Answers>): Answers => ({ ...EMPTY, where: ['eu'], ...x });
const card = (r: ReturnType<typeof classify>, id: string) => r.cards.find((c) => c.id === id);

describe('classify()', () => {
  it('emotion recognition at work is banned', () => {
    const r = classify(A({ banned: ['emotion-work'], area: 'employment', role: 'deployer' }));
    expect(r.eu).toBe('banned');
    expect(r.euFrom).toBe('2 February 2025');
    expect(r.examples).toContain('emotion');
  });
  it('generating intimate content is banned from 2 December 2026', () => {
    const r = classify(A({ banned: ['ncii'], interact: ['generate'] }));
    expect(r.eu).toBe('banned');
    expect(r.euFrom).toBe('2 December 2026');
  });
  it('credit scoring is high-risk from 2 December 2027, with a fundamental-rights assessment for deployers', () => {
    const r = classify(A({ area: 'services', service: 'credit', narrow: 'no', personal: 'yes', automated: 'yes' }));
    expect(r.eu).toBe('high');
    expect(r.euFrom).toBe('2 December 2027');
    expect(card(r, 'eu')!.next.join(' ')).toMatch(/Art\. 27/);
    expect(card(r, 'gdpr')!.next.join(' ')).toMatch(/Article 22/);
    expect(r.examples[0]).toBe('credit');
  });
  it('a medical-device lesion classifier is high-risk from 2 August 2028', () => {
    const r = classify(A({ product: 'yes', role: 'provider' }));
    expect(r.eu).toBe('high');
    expect(r.euFrom).toBe('2 August 2028');
    expect(r.examples).toContain('lesion');
  });
  it('a customer-service chatbot has transparency duties', () => {
    const r = classify(A({ interact: ['chat'], role: 'deployer' }));
    expect(r.eu).toBe('limited');
    expect(r.tier).toBe('genai');
    expect(card(r, 'owasp')!.verdict).toMatch(/LLM Applications \(2026\)/);
  });
  it('a spam filter is minimal risk', () => {
    const r = classify(A({ personal: 'yes' }));
    expect(r.eu).toBe('minimal');
    expect(card(r, 'owasp')!.verdict).toMatch(/Machine Learning/);
  });
  it('fraud detection in finance is minimal, with a note about Annex III 5(b)', () => {
    const r = classify(A({ area: 'services', service: 'fraud' }));
    expect(r.eu).toBe('minimal');
    expect(r.notes.join(' ')).toMatch(/5\(b\)/);
    expect(r.examples[0]).toBe('fraud');
  });
  it('a foundation model above 10^25 FLOPs is a GPAI model with systemic risk', () => {
    const r = classify(A({ gpai: 'systemic', role: 'provider', where: ['eu', 'us'] }));
    expect(r.eu).toBe('gpai-systemic');
    expect(r.examples[0]).toBe('foundation');
    expect(card(r, 'us')!.next.join(' ')).toMatch(/SB 53/);
  });
  it('a smaller general-purpose model has the general GPAI duties', () => {
    expect(classify(A({ gpai: 'yes', role: 'provider' })).eu).toBe('gpai');
  });
  it('CV screening is high-risk and triggers NYC Local Law 144 in the US', () => {
    const r = classify(A({ area: 'employment', narrow: 'no', where: ['eu', 'us'] }));
    expect(r.eu).toBe('high');
    expect(card(r, 'us')!.next.join(' ')).toMatch(/Local Law 144/);
  });
  it('a narrow procedural task in an Annex III area is not high-risk but must be documented', () => {
    const r = classify(A({ area: 'education', narrow: 'yes' }));
    expect(r.eu).toBe('minimal');
    expect(r.notes.join(' ')).toMatch(/document this assessment and still register/);
  });
  it('a travel agent with tools points to the agentic OWASP list', () => {
    const r = classify(A({ agent: 'yes', interact: ['chat'] }));
    expect(r.tier).toBe('agentic');
    expect(card(r, 'owasp')!.verdict).toMatch(/Agentic/);
    expect(r.examples.some((id) => ['travel-agent', 'devops-agent', 'swarm', 'browser-agent'].includes(id))).toBe(true);
  });
  it('Korea: hiring is high-impact; generative AI needs notice and labels', () => {
    expect(classify(A({ where: ['kr'], area: 'employment', narrow: 'no' })).cards.find((c) => c.id === 'kr')!.verdict).toMatch(/high-impact/);
    expect(classify(A({ where: ['kr'], interact: ['generate'] })).cards.find((c) => c.id === 'kr')!.verdict).toMatch(/Generative/);
  });
  it('outside the EU, no EU card is shown', () => {
    const r = classify({ ...EMPTY, where: ['sg'] });
    expect(r.eu).toBe('outside');
    expect(card(r, 'eu')).toBeUndefined();
  });
  it('face recognition at store entrances is high-risk biometrics and needs a DPIA', () => {
    const r = classify(A({ area: 'biometrics', narrow: 'no', personal: 'yes' }));
    expect(r.eu).toBe('high');
    expect(card(r, 'gdpr')!.next.join(' ')).toMatch(/Art\. 35/);
    expect(r.examples).toContain('face');
  });
});
