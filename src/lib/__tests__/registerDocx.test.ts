import { Packer } from 'docx';
import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { EMPTY } from '../classify';
import { actionsOf, hash, newSystem } from '../register';
import { registerDocument } from '../registerDocx';

const NOW = new Date(Date.UTC(2026, 10, 7, 12));

describe('register Word export', () => {
  it('produces a valid .docx with the summary, actions and disclaimer', async () => {
    const s = { ...newSystem(NOW), id: hash('cv'), name: 'CV screening tool', owner: 'HR & Talent <team>', answers: { ...EMPTY, where: ['eu' as const], area: 'employment' as const, narrow: 'no' as const } };
    const a = actionsOf(s);
    s.done = { [a[0].id]: true };
    const buf = await Packer.toBuffer(registerDocument([s], 'Acme', NOW));
    const zip = await JSZip.loadAsync(buf);
    const xml = await zip.file('word/document.xml')!.async('string');
    expect(xml).toContain('AI register: Acme');
    expect(xml).toContain('CV screening tool');
    expect(xml).toContain('HR &amp; Talent &lt;team&gt;');
    expect(xml).toContain('High-risk (from 2 December 2027)');
    expect(xml).toContain('not legal advice');
    expect(xml).toContain(`☑  ${a[0].text.replace(/&/g, '&amp;')}`);
    expect(xml).toContain('2027-12-02');
  });
});
