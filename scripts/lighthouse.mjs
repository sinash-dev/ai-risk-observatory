// Lighthouse (mobile) against a running `vite preview`. Usage: node scripts/lighthouse.mjs [port]
import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';
import { mkdirSync, writeFileSync } from 'node:fs';

const port = process.argv[2] ?? '4174';
const pages = { home: '', 'model-credit': 'model/credit/', 'rules-eu': 'rules/eu/', classify: 'classify/', start: 'start/', register: 'register/', sectors: 'sectors/finance/', toolkit: 'toolkit/' };
mkdirSync('docs/lighthouse', { recursive: true });
const browser = await chromium.launch({ args: ['--remote-debugging-port=9333'] });
const rows = [];
const RUNS = 3; // Lighthouse varies between runs; keep the median performance run
for (const [name, path] of Object.entries(pages)) {
  const runs = [];
  for (let i = 0; i < RUNS; i++) runs.push(await lighthouse(`http://localhost:${port}/ai-risk-observatory/${path}`, { port: 9333, output: ['html', 'json'], onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'], formFactor: 'mobile', logLevel: 'error' }));
  runs.sort((a, b) => a.lhr.categories.performance.score - b.lhr.categories.performance.score);
  const r = runs[Math.floor(RUNS / 2)];
  writeFileSync(`docs/lighthouse/${name}.html`, r.report[0]);
  const c = r.lhr.categories;
  rows.push(`${name}: perf ${Math.round(c.performance.score * 100)}, a11y ${Math.round(c.accessibility.score * 100)}, best ${Math.round(c['best-practices'].score * 100)}, seo ${Math.round(c.seo.score * 100)} | LCP ${r.lhr.audits['largest-contentful-paint'].displayValue}, TBT ${r.lhr.audits['total-blocking-time'].displayValue}, CLS ${r.lhr.audits['cumulative-layout-shift'].displayValue}`);
}
await browser.close();
writeFileSync('docs/lighthouse/summary.txt', rows.join('\n') + '\n');
console.log(rows.join('\n'));
