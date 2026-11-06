import { describe, expect, it } from 'vitest';
import { COMPARE, TOPICS } from '../../data/compare';
import { FRAMEWORKS } from '../../data/frameworks';
import { compareCsv, gaps } from '../compareTools';

describe('compare tools', () => {
  it('has 11 topics, each with a cell for every framework', () => {
    expect(TOPICS.length).toBe(11);
    for (const t of TOPICS) for (const f of FRAMEWORKS) expect(COMPARE[t.id][f.id]).toBeTruthy();
  });
  it('gap finder returns only topics with a difference of 2 or more, for any pair', () => {
    for (const a of FRAMEWORKS) for (const b of FRAMEWORKS) {
      for (const g of gaps(a.id, b.id)) expect(g.a[0] - g.b[0]).toBeGreaterThanOrEqual(2);
    }
    expect(gaps('gdpr', 'owasp').map((g) => g.t.id)).toContain('redress');
    expect(gaps('eu', 'eu')).toEqual([]);
  });
  it('CSV has a BOM, a header with every framework and quotes cells with commas', () => {
    const csv = compareCsv();
    expect(csv.startsWith('\uFEFF')).toBe(true);
    const lines = csv.slice(1).split('\r\n');
    expect(lines[1].split(',').length).toBe(FRAMEWORKS.length + 1);
    expect(lines[2]).toMatch(/^Transparency,(\d,){9}\d$/);
    expect(csv).toMatch(/"[^"]*,[^"]*"/);
  });
});
