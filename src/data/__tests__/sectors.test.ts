import { describe, expect, it } from 'vitest';
import { LAB_BY_ID } from '../labs';
import { SECTORS } from '../sectors';
import { TEMPLATE_BY_FILE } from '../templates';

describe('sector guides', () => {
  it('link only to examples and templates that exist', () => {
    for (const s of SECTORS) {
      for (const id of s.labs) expect(LAB_BY_ID[id], `${s.id}: ${id}`).toBeTruthy();
      for (const f of s.templates) expect(TEMPLATE_BY_FILE[f], `${s.id}: ${f}`).toBeTruthy();
      expect(s.eu.length).toBeGreaterThan(0);
    }
  });
  it('have unique ids', () => {
    expect(new Set(SECTORS.map((s) => s.id)).size).toBe(SECTORS.length);
  });
});
