import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FREE_FOR_NOW, PREMIUM_SLOTS, SHOW_PREMIUM_HINTS, hasFeature, type Feature } from '../entitlements';

// every feature id; TypeScript rejects this object if one is missing or misspelt
const ALL: Record<Feature, true> = {
  'export.word': true, 'export.board-pack': true, 'register.multi-register': true,
  'team.shared-workspace': true, 'toolkit.prefilled': true, 'workshop.white-label': true,
};
const FEATURES = Object.keys(ALL) as Feature[];

describe('entitlements', () => {
  it('gates nothing while everything is free', () => {
    expect(FREE_FOR_NOW).toBe(true);
    expect(SHOW_PREMIUM_HINTS).toBe(false);
    for (const f of FEATURES) expect(hasFeature(f), f).toBe(true);
  });

  it('lists exactly the same features as the insertion points', () => {
    expect(Object.keys(PREMIUM_SLOTS).sort()).toEqual([...FEATURES].sort());
  });

  it('marks each insertion point in the file it names', () => {
    for (const [f, slot] of Object.entries(PREMIUM_SLOTS)) {
      expect(readFileSync(slot.file, 'utf8'), `${f} in ${slot.file}`).toContain(f);
    }
  });
});
