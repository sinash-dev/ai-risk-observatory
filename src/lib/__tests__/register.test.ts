import { describe, expect, it } from 'vitest';
import { EMPTY, type Answers } from '../classify';
import { actionsOf, deadlines, hash, newSystem, parseImport, parseLongDate, progressOf, registerCsv, registerMarkdown, resultOf, type RegSystem } from '../register';

const NOW = new Date(Date.UTC(2026, 10, 7, 12));
const sys = (name: string, a: Partial<Answers>, extra: Partial<RegSystem> = {}): RegSystem => ({
  ...newSystem(NOW), id: hash(name), name, answers: { ...EMPTY, where: ['eu'], ...a }, assessed: true, ...extra,
});
const credit = () => sys('Credit model', { area: 'services', service: 'credit', narrow: 'no', personal: 'yes', automated: 'yes' }, { owner: 'Risk team', status: 'live' });

describe('register', () => {
  it('builds a stable action list from the classification', () => {
    const s = credit();
    const a = actionsOf(s);
    expect(a.length).toBeGreaterThan(3);
    expect(new Set(a.map((x) => x.id)).size).toBe(a.length);
    expect(actionsOf(s).map((x) => x.id)).toEqual(a.map((x) => x.id));
    expect(a.some((x) => /Art\. 27/.test(x.text))).toBe(true);
  });

  it('counts progress only for actions that still apply', () => {
    const s = credit();
    const a = actionsOf(s);
    s.done = { [a[0].id]: true, [a[1].id]: true, stale: true };
    expect(progressOf(s)).toEqual({ done: 2, total: a.length });
  });

  it('parses long dates in UTC', () => {
    expect(parseLongDate('2 December 2027')?.toISOString()).toBe('2027-12-02T12:00:00.000Z');
    expect(parseLongDate('Dec 2027')).toBeNull();
    expect(parseLongDate('2 Decembre 2027')).toBeNull();
  });

  it('lists only future dates, sorted, and skips retired systems', () => {
    const us = sys('Hiring tool', { where: ['eu', 'us'], area: 'employment', narrow: 'no' });
    const chat = sys('Chatbot', { interact: ['chat'] });
    const old = sys('Old scorer', { area: 'services', service: 'credit', narrow: 'no' }, { status: 'retired' });
    const d = deadlines([us, chat, old], NOW);
    expect(d.map((x) => x.date.toISOString().slice(0, 10))).toEqual(['2027-01-01', '2027-12-02']);
    expect(d[0].label).toMatch(/Colorado SB 26-189/);
    expect(d[1].label).toMatch(/high-risk rules apply from 2 December 2027/);
    // transparency duties started on 2 August 2026, so nothing is upcoming for the chatbot
    expect(resultOf(chat).euFrom).toBe('2 August 2026');
    expect(d.some((x) => x.system === 'Chatbot')).toBe(false);
  });

  it('writes a Markdown report with a summary row and checkboxes', () => {
    const s = credit();
    const a = actionsOf(s);
    s.done = { [a[0].id]: true };
    const md = registerMarkdown([s], 'Acme', NOW);
    expect(md).toContain('# AI register: Acme');
    expect(md).toContain('| Credit model | Risk team | In use | High-risk | 1/');
    expect(md).toContain(`- [x] ${a[0].text}`);
    expect(md).toContain(`- [ ] ${a[1].text}`);
    expect(md).toMatch(/not legal advice/);
  });

  it('escapes CSV cells and keeps one row per system', () => {
    const s = sys('Tool, "beta"', {}, { purpose: 'Line one\nline two' });
    const csv = registerCsv([s]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    const rows = csv.slice(1).trim().split('\r\n');
    expect(rows).toHaveLength(2);
    expect(rows[1]).toContain('"Tool, ""beta"""');
    expect(rows[1]).toContain('Line one line two');
  });

  it('imports its own export and drops malformed entries', () => {
    const s = credit();
    const text = JSON.stringify({ org: 'Acme', systems: [s, { id: 1, name: 'bad' }, null, { id: 'x', name: 'no answers' }] });
    const { systems, skipped } = parseImport(text);
    expect(systems).toHaveLength(1);
    expect(skipped).toBe(3);
    expect(systems[0].name).toBe('Credit model');
    expect(resultOf(systems[0]).eu).toBe('high');
  });

  it('cleans imported values', () => {
    const raw = { ...credit(), name: 'x'.repeat(500), status: 'hacked', nextReview: 'tomorrow', done: { a: true, b: 'yes' } };
    const { systems } = parseImport(JSON.stringify([raw]));
    expect(systems[0].name).toHaveLength(200);
    expect(systems[0].status).toBe('idea');
    expect(systems[0].nextReview).toBe('');
    expect(systems[0].done).toEqual({ a: true });
  });

  it('rejects files that are not registers', () => {
    expect(() => parseImport('not json')).toThrow('This file is not valid JSON.');
    expect(() => parseImport('{"foo": 1}')).toThrow('No systems found in this file.');
  });
});
