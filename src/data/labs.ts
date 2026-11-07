import { agenticLabs } from '../labs/agentic';
import { classicalLabs } from '../labs/classical';
import { deepLabs } from '../labs/deep';
import { emotionLab, faceLab, foundationLab, spamLab } from '../labs/extra';
import { genaiLabs } from '../labs/genai';
import { browserAgentLab, examLab, insuranceLab, voiceLab } from '../labs/newLabs';
import type { FwEntry, FwId } from './frameworks';
import { EU } from './fw/eu';
import { GDPR } from './fw/gdpr';
import { ISO } from './fw/iso';
import { NIST } from './fw/nist';
import { OWASP } from './fw/owasp';
import { US } from './fw/us';
import { CN, KR, SG, UK } from './fw/more';
import { LAB_EXTRAS } from './labExtras';
import type { LabDef } from './types';

const ins = <T extends { id: string }>(list: T[], afterId: string, item: T) => { const i = list.findIndex((x) => x.id === afterId); return [...list.slice(0, i + 1), item, ...list.slice(i + 1)]; };
const classical = ins(classicalLabs, 'credit', insuranceLab);
const deep = [deepLabs[0], faceLab, emotionLab, examLab, ...deepLabs.slice(1)];
const genai = ins(genaiLabs, 'imagegen', voiceLab);
const agentic = ins(agenticLabs, 'travel-agent', browserAgentLab);
/** merge the case-study additions (residual risk, prompts, codes, missing memo fields) into a lab */
function withExtras(l: LabDef): LabDef {
  const x = LAB_EXTRAS[l.id];
  if (!x) return l;
  return {
    ...l,
    residual: x.residual,
    discuss: x.discuss,
    brief: { ...l.brief, role: l.brief.role || x.role || '', kpi: l.brief.kpi || x.kpi || '' },
    checklist: l.checklist.length ? l.checklist : x.checklist ?? [],
    stressors: l.stressors.map((st) => ({ ...st, codes: st.codes ?? x.codes?.[st.id], unmitigable: st.unmitigable || x.unmitigable?.includes(st.id) || undefined })),
  };
}
export const LABS: LabDef[] = [spamLab, ...classical, ...deep, foundationLab, ...genai, ...agentic].map(withExtras);
export const LAB_BY_ID = Object.fromEntries(LABS.map((l) => [l.id, l])) as Record<string, LabDef>;

export const FW_DATA: Record<FwId, Record<string, FwEntry>> = { eu: EU, us: US, nist: NIST, iso: ISO, owasp: OWASP, gdpr: GDPR, cn: CN, kr: KR, sg: SG, uk: UK };
export const fwEntry = (fw: FwId, id: string) => FW_DATA[fw][id];

