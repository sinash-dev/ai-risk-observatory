import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { markdownToHtml } from '../../lib/markdown';

const DIR = join(__dirname, '../../../public/toolkit');
const files = readdirSync(DIR);
const page = readFileSync(join(__dirname, '../templates.ts'), 'utf8');

describe('toolkit templates', () => {
  it('every file is listed on the toolkit page and every listed file exists', () => {
    for (const f of files) expect(page, f).toContain(`file: '${f}'`);
    const listed = [...page.matchAll(/file: '([^']+)'/g)].map((m) => m[1]);
    for (const f of listed) expect(files, f).toContain(f);
  });

  it('Markdown templates carry the licence line and render without stray table rows', () => {
    for (const f of files.filter((x) => x.endsWith('.md'))) {
      const md = readFileSync(join(DIR, f), 'utf8');
      expect(md, f).toMatch(/CC BY 4\.0\. Free to adapt\. Not legal advice\./);
      // the previewer only understands tables that start at the beginning of a line
      expect(md, f).not.toMatch(/^[ \t]+\|/m);
      const html = markdownToHtml(md);
      expect(html, f).not.toMatch(/<p>\|/);
    }
  });

  it('CSV templates have the same number of columns on every row', () => {
    for (const f of files.filter((x) => x.endsWith('.csv'))) {
      const rows = readFileSync(join(DIR, f), 'utf8').trim().split(/\r?\n/);
      const n = rows[0].split(',').length;
      for (const r of rows) expect(r.split(',').length, `${f}: ${r}`).toBe(n);
    }
  });
});
