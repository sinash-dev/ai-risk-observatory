import { agenticLabs } from '../labs/agentic';
import { classicalLabs } from '../labs/classical';
import { deepLabs } from '../labs/deep';
import { emotionLab, faceLab, foundationLab, spamLab } from '../labs/extra';
import { genaiLabs } from '../labs/genai';
import type { FwEntry, FwId } from './frameworks';
import { EU } from './fw/eu';
import { GDPR } from './fw/gdpr';
import { ISO } from './fw/iso';
import { NIST } from './fw/nist';
import { OWASP } from './fw/owasp';
import { US } from './fw/us';
import type { LabDef } from './types';

const deep = [deepLabs[0], faceLab, emotionLab, ...deepLabs.slice(1)];
export const LABS: LabDef[] = [spamLab, ...classicalLabs, ...deep, foundationLab, ...genaiLabs, ...agenticLabs];
export const LAB_BY_ID = Object.fromEntries(LABS.map((l) => [l.id, l])) as Record<string, LabDef>;

export const FW_DATA: Record<FwId, Record<string, FwEntry>> = { eu: EU, us: US, nist: NIST, iso: ISO, owasp: OWASP, gdpr: GDPR };
export const fwEntry = (fw: FwId, id: string) => FW_DATA[fw][id];

// sanity: every model has an entry for every framework (dev only)
if (import.meta.env.DEV) {
  for (const fw of Object.keys(FW_DATA) as FwId[]) for (const l of LABS) if (!FW_DATA[fw][l.id]) console.warn('missing', fw, l.id);
}
