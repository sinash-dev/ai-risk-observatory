import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { QUIZZES, QUIZ_BY_ID } from '../../data/quizzes';
import { manifest, scoData, scoHtml, scormZip } from '../scorm';
import { crc32, zip } from '../zip';

describe('zip writer', () => {
  it('computes the standard CRC-32', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
  });
  it('produces an archive that a standard reader opens', async () => {
    const z = await JSZip.loadAsync(zip([{ path: 'a.txt', content: 'héllo' }, { path: 'dir/b.txt', content: 'x' }]));
    expect(await z.file('a.txt')!.async('string')).toBe('héllo');
    expect(await z.file('dir/b.txt')!.async('string')).toBe('x');
  });
});

describe('SCORM 1.2 package', () => {
  it('has the manifest at the root and one SCO that it points to', async () => {
    const z = await JSZip.loadAsync(scormZip(QUIZ_BY_ID.eu));
    expect(Object.keys(z.files).sort()).toEqual(['imsmanifest.xml', 'index.html']);
    const m = await z.file('imsmanifest.xml')!.async('string');
    expect(m).toContain('<schema>ADL SCORM</schema>');
    expect(m).toContain('<schemaversion>1.2</schemaversion>');
    expect(m).toContain('<adlcp:masteryscore>80</adlcp:masteryscore>');
    const ref = m.match(/identifierref="([^"]+)"/)![1];
    expect(m).toContain(`<resource identifier="${ref}" type="webcontent" adlcp:scormtype="sco" href="index.html">`);
    expect(m.match(/<organizations default="([^"]+)"/)![1]).toBe(m.match(/<organization identifier="([^"]+)"/)![1]);
  });

  it('escapes titles in the manifest', () => {
    const q = { ...QUIZ_BY_ID.eu, title: 'A & B <test>' };
    expect(manifest(q)).toContain('Quiz: A &amp; B &lt;test&gt;');
  });

  it('keeps the right answer after the options are reordered', () => {
    for (const quiz of QUIZZES) {
      scoData(quiz).questions.forEach((q, k) => {
        expect(q.options[q.answer]).toBe(quiz.questions[k].options[quiz.questions[k].answer]);
        expect(q.link).toMatch(/^https:\/\/sinash-dev\.github\.io\/ai-risk-observatory\/.+\/(\?|#|$)/);
      });
    }
  });

  it('cannot break out of its script tags', () => {
    const q = { ...QUIZ_BY_ID.eu, questions: QUIZ_BY_ID.eu.questions.map((x, i) => (i ? x : { ...x, explain: '</script><script>alert(1)</script>' })) };
    const h = scoHtml(q);
    expect(h.match(/<\/script>/g)!.length).toBe(2);
  });
});
