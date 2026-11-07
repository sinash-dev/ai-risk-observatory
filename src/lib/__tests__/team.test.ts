import { describe, expect, it } from 'vitest';
import { TRACK_BY_ID } from '../../data/tracks';
import { buildRecord, decodePlan, encodePlan, mergeRecords, parseRecord, planId, progressOfRecord, teamCsv, teamMarkdown, type TeamPlan } from '../team';

const NOW = new Date(Date.UTC(2026, 10, 7, 12));
const plan: TeamPlan = { org: 'Müller & Söhne', team: 'Claims', tracks: ['exec'], quizzes: ['eu', 'gdpr'], due: '2026-12-01', note: 'Bitte bis Dezember – danke!' };

describe('team plans', () => {
  it('round-trips through a link, including non-English text', () => {
    const p = decodePlan(encodePlan(plan));
    expect(p).toEqual(plan);
    expect(encodePlan(plan)).toMatch(/^[A-Za-z0-9_-]+$/);
  });
  it('drops unknown tracks and quizzes, and rejects empty or broken links', () => {
    const p = decodePlan(encodePlan({ ...plan, tracks: ['exec', 'nope'], quizzes: ['eu', 'zz'], due: 'soon' } as TeamPlan))!;
    expect(p.tracks).toEqual(['exec']);
    expect(p.quizzes).toEqual(['eu']);
    expect(p.due).toBe('');
    expect(decodePlan(encodePlan({ ...plan, tracks: [], quizzes: [] }))).toBeNull();
    expect(decodePlan('%%%')).toBeNull();
    expect(decodePlan(null)).toBeNull();
  });
});

describe('learning records', () => {
  const quiz = { eu: { score: 4, total: 5, at: NOW.getTime() } };
  const rec = buildRecord(plan, ' Ana ', 'Claims handler', 'Ask the vendor for results by group', { exec: [0, 1, 1, 99] }, quiz, NOW);

  it('counts only real steps and passes at 80%', () => {
    expect(rec.name).toBe('Ana');
    expect(rec.tracks[0]).toEqual({ id: 'exec', done: 2, total: TRACK_BY_ID.exec.steps.length });
    expect(rec.quizzes.find((q) => q.id === 'eu')!.passed).toBe(true);
    expect(rec.quizzes.find((q) => q.id === 'gdpr')).toMatchObject({ passed: false, at: '' });
    expect(progressOfRecord(rec).complete).toBe(false);
  });

  it('survives export and import, and refuses other files', () => {
    expect(parseRecord(JSON.stringify(rec))).toEqual(rec);
    expect(() => parseRecord('{}')).toThrow('not a learning record');
    expect(() => parseRecord('nope')).toThrow('not valid JSON');
    const forged = parseRecord(JSON.stringify({ ...rec, quizzes: [{ id: 'eu', score: 99, total: 1, at: rec.exported }] }));
    expect(forged.quizzes[0]).toMatchObject({ score: 5, total: 5 });
  });

  it('keeps the newest record per person and plan', () => {
    const later = { ...rec, exported: '2026-11-20T00:00:00.000Z', reflection: 'later' };
    const merged = mergeRecords([rec], [later, { ...rec, name: 'Ben' }]);
    expect(merged.map((r) => r.name)).toEqual(['Ana', 'Ben']);
    expect(merged[0].reflection).toBe('later');
    expect(rec.planId).toBe(planId(plan));
  });

  it('exports a record with the Art. 4 note and safe CSV', () => {
    const md = teamMarkdown([rec], NOW);
    expect(md).toContain('no certificate is needed');
    expect(md).toContain('| Ana | Claims handler |');
    expect(md).toContain('Ask the vendor for results by group');
    const csv = teamCsv([{ ...rec, name: 'Ana, "A"' }]);
    expect(csv).toContain('"Ana, ""A"""');
  });
});
