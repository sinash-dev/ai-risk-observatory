/**
 * Controls crosswalk: one control, ten frameworks. Seeded with scripts/crosswalk-seed.ts from the
 * references already in the site's data, then curated by hand. A null cell means no reference on
 * this site supports a mapping; no clause numbers are invented. Strength uses the Compare rubric (0–3).
 */
import type { FwId } from './frameworks';

export type XCell = [ref: string, strength: 0 | 1 | 2 | 3] | null;
export interface Control { id: string; name: string; desc: string; labs: string[]; cells: Record<FwId, XCell> }

const C = (id: string, name: string, desc: string, labs: string[], cells: Record<FwId, XCell>): Control => ({ id, name, desc, labs, cells });

export const CONTROLS: Control[] = [
  C('inventory', 'AI system inventory', 'A register of every AI system in use, with owner, purpose and risk level.', ['rag', 'swarm'], {
    eu: ['Art. 49 (registration of high-risk systems)', 2], us: ['OMB M-25-21 (federal agencies)', 2], nist: ['MAP 4.1', 1], iso: ['A.4', 2], owasp: null,
    gdpr: null, cn: ['Algorithm Recommendation Provisions Art. 24 (filing)', 3], kr: null, sg: null, uk: ['Algorithmic Transparency Recording Standard (public sector)', 1],
  }),
  C('owner', 'Role and owner assigned', 'A named person accountable for each system, with clear roles for approval and monitoring.', ['spam', 'swarm', 'staffing'], {
    eu: ['Arts. 14, 26', 3], us: null, nist: ['GOVERN 2.1', 1], iso: ['A.3.2', 2], owasp: ['ASI10', 1],
    gdpr: null, cn: null, kr: null, sg: ['Model Framework: internal governance', 1], uk: ['Accountability principle', 1],
  }),
  C('risk', 'Risk and impact assessment before use', 'A documented assessment of what could go wrong, how likely and how severe, before launch.', ['credit', 'cv', 'benefits'], {
    eu: ['Art. 9', 3], us: ['OMB M-25-21 (federal agencies)', 2], nist: ['MAP 1.1', 1], iso: ['A.5', 2], owasp: null,
    gdpr: ['Art. 35', 3], cn: ['PIPL Art. 55', 3], kr: ['AI Basic Act Art. 34', 2], sg: ['Model Framework: human involvement', 1], uk: ['UK GDPR Art. 35', 2],
  }),
  C('fria', 'Fundamental-rights or data-protection impact assessment', 'An assessment focused on people’s rights or personal data, such as a FRIA or DPIA.', ['face', 'benefits', 'segments'], {
    eu: ['Art. 27', 2], us: null, nist: null, iso: ['A.5', 2], owasp: null,
    gdpr: ['Art. 35', 3], cn: ['PIPL Art. 55', 3], kr: null, sg: null, uk: ['UK GDPR Art. 35', 3],
  }),
  C('data', 'Data quality and bias examination', 'Checks that training and test data are relevant, representative, accurate and examined for bias.', ['salary', 'credit', 'lesion'], {
    eu: ['Art. 10', 3], us: null, nist: ['MEASURE 2.11', 1], iso: ['A.7', 2], owasp: ['LLM05:2026, ML02', 1],
    gdpr: ['Art. 5(1)(d)', 3], cn: ['GenAI Measures Art. 7', 2], kr: null, sg: ['Model Framework: operations management', 1], uk: ['UK GDPR Art. 5(1)(d)', 3],
  }),
  C('proxy', 'Proxy and protected-attribute testing', 'Tests for features that stand in for protected traits, and for unequal outcomes between groups.', ['credit', 'cv', 'segments'], {
    eu: ['Art. 10(2)(f), 10(5)', 3], us: ['ECOA; Fair Housing Act; NYC Local Law 144', 3], nist: ['MEASURE 2.11', 1], iso: null, owasp: null,
    gdpr: ['Art. 9', 2], cn: ['PIPL Art. 24', 2], kr: null, sg: ['MAS FEAT: fairness', 1], uk: ['Equality Act 2010', 3],
  }),
  C('docs', 'Technical documentation and model card', 'A record of how the system was built and tested, its limits and its intended use.', ['foundation', 'lesion'], {
    eu: ['Arts. 11, 53(1)(a)–(b)', 3], us: ['California AB 2013 (training data)', 2], nist: ['MAP 4.1', 1], iso: ['A.6.2.7, A.8.2', 2], owasp: null,
    gdpr: null, cn: ['GenAI Measures Arts. 10, 17 (filing)', 2], kr: ['AI Basic Act Art. 34', 2], sg: ['GenAI framework: data', 1], uk: null,
  }),
  C('logs', 'Event logging', 'Automatic logs that let you trace what the system did and why.', ['travel-agent', 'devops-agent'], {
    eu: ['Art. 12', 3], us: null, nist: null, iso: ['A.6.2.8', 2], owasp: null,
    gdpr: null, cn: null, kr: ['AI Basic Act Art. 34 (records)', 2], sg: null, uk: null,
  }),
  C('notice', 'Transparency notice to affected people', 'Telling people that AI is used in decisions about them, and how.', ['cv', 'credit', 'chatbot'], {
    eu: ['Arts. 26(11), 86', 3], us: ['Colorado SB 26-189; NYC Local Law 144', 2], nist: ['MEASURE 2.9', 1], iso: ['A.8', 2], owasp: null,
    gdpr: ['Arts. 13–15', 3], cn: ['PIPL Art. 24', 3], kr: ['AI Basic Act Art. 31', 3], sg: ['Model Framework: stakeholder communication', 1], uk: ['UK GDPR Arts. 22A–22D', 2],
  }),
  C('label', 'AI-interaction disclosure and content labelling', 'Telling people they are talking to AI, and marking AI-generated content.', ['imagegen', 'chatbot'], {
    eu: ['Art. 50', 3], us: ['California SB 942; B.O.T. Act; Utah AI Policy Act', 2], nist: ['AI 600-1', 1], iso: null, owasp: null,
    gdpr: null, cn: ['AIGC Labelling Measures (2025)', 3], kr: ['AI Basic Act Art. 31', 3], sg: ['GenAI framework: content provenance', 1], uk: ['Transparency principle', 1],
  }),
  C('oversight', 'Human oversight and override', 'Trained people who can understand, overrule and stop the system.', ['benefits', 'cv', 'face'], {
    eu: ['Art. 14', 3], us: ['Colorado SB 26-189; OMB M-25-21', 2], nist: ['MANAGE 2.4', 1], iso: ['A.9', 2], owasp: ['LLM03:2026', 1],
    gdpr: ['Art. 22', 3], cn: ['PIPL Art. 24', 2], kr: ['AI Basic Act Art. 34', 2], sg: ['Model Framework: human involvement', 1], uk: ['UK GDPR Arts. 22A–22D', 2],
  }),
  C('robust', 'Accuracy, robustness and adversarial testing', 'Declared accuracy, tests across conditions and groups, and resilience to manipulated inputs.', ['lesion', 'fraud', 'spam'], {
    eu: ['Art. 15', 3], us: ['SR 11-7 (banks)', 2], nist: ['MEASURE 2.5, 2.7', 1], iso: ['A.6.2.4', 2], owasp: ['ML01', 1],
    gdpr: null, cn: null, kr: ['AI Basic Act Art. 32 (largest models)', 2], sg: ['GenAI framework: testing and assurance', 1], uk: ['PRA SS1/23 (banks)', 2],
  }),
  C('security', 'Security testing (prompt injection, poisoning)', 'Testing the system against the attacks on the OWASP lists before and after launch.', ['chatbot', 'rag', 'code'], {
    eu: ['Art. 15(5)', 3], us: ['FTC Act §5; state data-security laws', 2], nist: ['MEASURE 2.7', 1], iso: null, owasp: ['LLM01:2026, LLM05:2026, ML02', 1],
    gdpr: ['Art. 32', 3], cn: ['Cybersecurity Law', 3], kr: ['Information and Communications Network Act', 2], sg: ['CSA guidelines on securing AI systems', 1], uk: ['AI Cyber Security Code of Practice (2025)', 1],
  }),
  C('privilege', 'Least privilege for agents and tools', 'Giving agents only the tools, data and spending power the task needs.', ['travel-agent', 'devops-agent'], {
    eu: null, us: null, nist: ['MAP 3.5', 1], iso: ['A.4', 2], owasp: ['LLM03:2026, ASI03', 1],
    gdpr: ['Arts. 5, 32', 2], cn: null, kr: null, sg: ['CSA guidelines on securing AI systems', 1], uk: ['UK GDPR Arts. 5, 32', 2],
  }),
  C('monitor', 'Post-deployment monitoring and drift', 'Watching performance after launch and acting when the world changes.', ['credit', 'fraud', 'staffing'], {
    eu: ['Art. 72', 3], us: ['SR 11-7 (banks)', 2], nist: ['MANAGE 4.1', 1], iso: ['A.6.2.6', 2], owasp: ['ML08', 1],
    gdpr: null, cn: null, kr: null, sg: ['Model Framework: operations management', 1], uk: ['MHRA post-market surveillance (medical)', 2],
  }),
  C('incident', 'Incident reporting', 'Reporting serious incidents and breaches to the right authority on time.', ['foundation', 'devops-agent'], {
    eu: ['Arts. 73, 55(1)(c)', 3], us: ['California SB 53; SEC rules (2023)', 2], nist: ['MANAGE 4.3', 1], iso: ['A.8', 2], owasp: null,
    gdpr: ['Art. 33', 3], cn: ['Cybersecurity Law; incident reporting measures (2025)', 3], kr: ['AI Basic Act Art. 32; PIPA Art. 34', 2], sg: ['GenAI framework: incident reporting', 1], uk: ['UK GDPR Art. 33', 3],
  }),
  C('explain', 'Explanation and appeal for individuals', 'A clear explanation of individual decisions and a way to challenge them.', ['credit', 'fraud', 'benefits'], {
    eu: ['Art. 86', 2], us: ['ECOA / Regulation B; Colorado SB 26-189', 2], nist: ['MEASURE 2.9', 1], iso: ['A.8', 1], owasp: null,
    gdpr: ['Arts. 15, 22', 3], cn: ['PIPL Art. 24', 2], kr: ['PIPA Art. 37-2', 2], sg: ['MAS FEAT: transparency', 1], uk: ['UK GDPR Arts. 22A–22D', 2],
  }),
  C('literacy', 'AI literacy training', 'Training for the people who build, run or rely on AI systems.', ['emotion', 'code'], {
    eu: ['Art. 4', 3], us: null, nist: ['Govern function', 1], iso: ['Competence and awareness requirements', 2], owasp: null,
    gdpr: ['Art. 39 (DPO tasks)', 1], cn: null, kr: null, sg: ['Model Framework: internal governance', 1], uk: null,
  }),
  C('vendor', 'Third-party and vendor assessment', 'Checking what suppliers of models, data and tools provide, and agreeing responsibilities.', ['cv', 'code', 'chatbot'], {
    eu: ['Arts. 26, 53(1)(b)', 2], us: ['Title VII (vendor tools)', 2], nist: ['GOVERN 6.1', 1], iso: ['A.10', 2], owasp: ['LLM04:2026, ML06', 1],
    gdpr: ['Art. 28', 3], cn: ['GenAI Measures Arts. 10, 17', 2], kr: null, sg: null, uk: null,
  }),
  C('change', 'Change management and re-assessment', 'Re-checking classification and risks after a significant change or a new use.', ['devops-agent', 'travel-agent'], {
    eu: ['Art. 6, Annex III (re-check for new tasks)', 2], us: ['FDA PCCP guidance (medical devices)', 2], nist: null, iso: ['A.6.2.5', 2], owasp: ['ASI05', 1],
    gdpr: null, cn: null, kr: null, sg: ['Model Framework: operations management', 1], uk: null,
  }),
];
