import { describe, expect, it } from 'vitest';
import { EMPTY, type Answers } from '../classify';
import { actionsOf, hash, newSystem, registerMarkdown, resultOf, summary, type RegSystem } from '../register';

const NOW = new Date(Date.UTC(2026, 10, 7, 12));
const sys = (name: string, a: Partial<Answers>, extra: Partial<RegSystem> = {}): RegSystem => ({
  ...newSystem(NOW), id: hash(name), name, answers: { ...EMPTY, where: ['eu'], ...a }, ...extra,
});

describe('register summary', () => {
  it('handles an empty register', () => {
    const m = summary([], NOW);
    expect(m).toEqual({ systems: 0, retired: 0, byCategory: [], withOpenActions: 0, next: [], topActions: [] });
    const md = registerMarkdown([], '', NOW);
    expect(md).toContain('## Summary for management');
    expect(md).toContain('EU AI Act categories: none yet');
    expect(md).toContain('No upcoming EU AI Act or Colorado dates');
  });

  it('puts a banned system and its actions first', () => {
    const banned = sys('Mood monitor', { banned: ['emotion-work'] });
    expect(resultOf(banned).eu).toBe('banned');
    const chat = sys('Chatbot', { interact: ['chat'] });
    const m = summary([chat, banned], NOW);
    expect(m.byCategory[0]).toMatchObject({ cat: 'banned', n: 1 });
    expect(m.topActions[0].system).toBe('Mood monitor');
    expect(m.topActions.length).toBeLessThanOrEqual(5);
  });

  it('counts mixed tiers, skips retired systems for actions and ignores ticked actions', () => {
    const credit = sys('Credit model', { area: 'services', service: 'credit', narrow: 'no' }, { status: 'live' });
    const chat = sys('Chatbot', { interact: ['chat'] });
    const old = sys('Old scorer', { area: 'services', service: 'credit', narrow: 'no' }, { status: 'retired' });
    const quiet = sys('Spam filter', {});
    quiet.done = Object.fromEntries(actionsOf(quiet).map((a) => [a.id, true]));
    const m = summary([chat, credit, old, quiet], NOW);
    expect(m.systems).toBe(4);
    expect(m.retired).toBe(1);
    expect(m.byCategory.map((c) => c.cat)).toEqual(['high', 'limited', 'minimal']);
    expect(m.byCategory.find((c) => c.cat === 'high')!.n).toBe(2);
    expect(m.withOpenActions).toBe(2);
    expect(m.topActions.every((a) => a.system !== 'Old scorer' && a.system !== 'Spam filter')).toBe(true);
    // one action per system in turn: the high-risk system first, then the chatbot
    expect(m.topActions.slice(0, 2).map((a) => a.system)).toEqual(['Credit model', 'Chatbot']);
  });

  it('lists the next three dates in order', () => {
    const us = sys('Hiring tool', { where: ['eu', 'us'], area: 'employment', narrow: 'no' });
    const credit = sys('Credit model', { area: 'services', service: 'credit', narrow: 'no' });
    const chat = sys('Chatbot', { interact: ['chat'] });
    const m = summary([credit, chat, us], NOW);
    const dates = m.next.map((d) => d.date.getTime());
    expect(m.next.length).toBeLessThanOrEqual(3);
    expect(dates).toEqual([...dates].sort((a, b) => a - b));
    expect(m.next[0].label).toMatch(/Colorado SB 26-189/);
  });
});
