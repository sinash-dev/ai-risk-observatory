import { agenticLabs } from '../labs/agentic';
import { classicalLabs } from '../labs/classical';
import { deepLabs } from '../labs/deep';
import { genaiLabs } from '../labs/genai';
import type { LabDef } from './types';

export const LABS: LabDef[] = [...classicalLabs, ...deepLabs, ...genaiLabs, ...agenticLabs];
export const LAB_BY_ID = Object.fromEntries(LABS.map((l) => [l.id, l])) as Record<string, LabDef>;
