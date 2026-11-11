import { Packer } from 'docx';
import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { EMPTY } from '../classify';
import { actionsOf, categoryOf, deadlines, hash, newSystem, parseImport, progressOf, registerCsv, registerMarkdown, summary, summaryLines, untouched, type RegSystem } from '../register';
import { registerDocument } from '../registerDocx';

const NOW = new Date(Date.UTC(2026, 10, 11, 12));
const fresh = (name: string): RegSystem => ({ ...newSystem(NOW), id: hash(name), name });
const credit = (): RegSystem => ({ ...fresh('Credit model'), answers: { ...EMPTY, where: ['eu'], area: 'services', service: 'credit', narrow: 'no' }, assessed: true });

describe('systems whose questions are not answered yet', () => {
  it('start as not assessed, with no category, actions or dates', () => {
    const s = fresh('New tool');
    expect(s.assessed).toBe(false);
    expect(categoryOf(s)).toBe('unassessed');
    expect(actionsOf(s)).toEqual([]);
    expect(progressOf(s)).toEqual({ done: 0, total: 0 });
    expect(deadlines([s], NOW)).toEqual([]);
  });

  it('are counted separately in the management summary, never as Minimal risk', () => {
    const m = summary([fresh('New tool'), credit()], NOW);
    expect(m.unassessed).toBe(1);
    expect(m.byCategory.map((c) => c.cat)).toEqual(['high']);
    const { facts } = summaryLines(m);
    expect(facts.join('\n')).toContain('Not yet assessed: 1.');
    expect(facts.join('\n')).not.toContain('Minimal risk');
  });

  it('show as not assessed in the Markdown, CSV and Word reports', async () => {
    const list = [fresh('New tool'), credit()];
    const md = registerMarkdown(list, 'Acme', NOW);
    expect(md).toContain('| New tool | - | Idea or procurement | Not yet assessed | 0/0 |');
    expect(md).toContain('Not yet assessed: the questions for this system are not answered');
    expect(md).not.toContain('Minimal risk');
    const csv = registerCsv(list);
    expect(csv.split('\r\n')[1]).toContain(',Not yet assessed,,0,0,');
    const zip = await JSZip.loadAsync(await Packer.toBuffer(registerDocument(list, 'Acme', NOW)));
    const xml = await zip.file('word/document.xml')!.async('string');
    expect(xml).toContain('Not yet assessed');
    expect(xml).not.toContain('Minimal risk');
  });

  it('a minimal-risk system is shown as such once its answers are confirmed', () => {
    const s = { ...fresh('Spam filter'), assessed: true };
    expect(categoryOf(s)).toBe('minimal');
    expect(actionsOf(s).length).toBeGreaterThan(0);
  });
});

describe('importing registers saved before "assessed" existed', () => {
  const legacy = (answers: object) => JSON.stringify([{ id: 'a1', name: 'Old', answers }]);

  it('treats untouched start answers as not assessed', () => {
    expect(untouched({ ...EMPTY, where: ['eu'] })).toBe(true);
    expect(parseImport(legacy({ ...EMPTY, where: ['eu'] })).systems[0].assessed).toBe(false);
  });

  it('treats changed answers as assessed', () => {
    const s = parseImport(legacy({ ...EMPTY, where: ['eu'], area: 'employment', narrow: 'no' })).systems[0];
    expect(s.assessed).toBe(true);
    expect(categoryOf(s)).toBe('high');
  });

  it('keeps an explicit assessed value', () => {
    const text = JSON.stringify([{ id: 'a1', name: 'Old', answers: { ...EMPTY, where: ['eu'] }, assessed: true }]);
    expect(parseImport(text).systems[0].assessed).toBe(true);
  });
});
