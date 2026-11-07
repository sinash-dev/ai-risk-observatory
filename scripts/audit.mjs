// Whole-site audit against a running preview: node scripts/audit.mjs [port]
// Checks every route at phone and desktop width for problems a reader would notice.
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

const port = process.argv[2] ?? '4174';
const ORIGIN = `http://localhost:${port}`;
const BASE = '/ai-risk-observatory/';
// AUDIT_LOCALE=ar audits the pages under /ar/ in preview mode (layout check before translations are published)
const LOC = process.env.AUDIT_LOCALE ? process.env.AUDIT_LOCALE + '/' : '';
const routes = JSON.parse(readFileSync('dist/route-manifest.json', 'utf8'));
const paths = (Array.isArray(routes) ? routes : routes.routes ?? Object.keys(routes)).map((r) => (typeof r === 'string' ? r : r.path));

const browser = await chromium.launch();
const issues = [];
const titles = new Map();
const internal = new Set();
for (const [label, viewport] of [['phone', { width: 375, height: 812 }], ['desktop', { width: 1366, height: 860 }]]) {
  const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  if (LOC) await ctx.addInitScript(() => localStorage.setItem('are-preview-locales', '1'));
  for (const p of paths) {
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error' && !/goatcounter|gc\.zgo\.at|ERR_NAME|net::/i.test(m.text())) errs.push(m.text()); });
    const url = ORIGIN + BASE + LOC + p.replace(/^\//, '') + (p === '/' ? '' : '/');
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(700);
    const r = await page.evaluate(() => {
      const text = document.body.innerText;
      const out = {
        title: document.title,
        over: document.documentElement.scrollWidth - innerWidth,
        bad: (text.match(/\b(undefined|NaN|\[object Object\]|null)\b|©\)|\d©/g) || []).slice(0, 5),
        h1: document.querySelectorAll('h1').length,
        skips: [],
        small: [],
        noAlt: [...document.querySelectorAll('img:not([alt])')].length,
        links: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => h && h.startsWith('/ai-risk-observatory/')),
      };
      let last = 1;
      for (const h of document.querySelectorAll('main h1, main h2, main h3, main h4')) {
        const n = +h.tagName[1];
        if (n > last + 1) out.skips.push(`${h.tagName} "${h.textContent.trim().slice(0, 40)}" after H${last}`);
        last = n;
      }
      for (const el of document.querySelectorAll('main button, main a.btn, main [role=tab]')) {
        if (el.closest('p, li') && el.classList.contains('link-btn')) continue; // inline text links are exempt
        const b = el.getBoundingClientRect();
        if (b.width && b.height && (b.height < 24 || b.width < 24)) out.small.push(`${el.tagName} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}" ${Math.round(b.width)}x${Math.round(b.height)}`);
      }
      return out;
    });
    r.links.forEach((l) => internal.add(l.split('#')[0].split('?')[0]));
    if (label === 'desktop') { const t = titles.get(r.title) ?? []; t.push(p); titles.set(r.title, t); }
    const pre = `[${label}] ${p}`;
    if (errs.length) issues.push(`${pre} console: ${errs.slice(0, 2).join(' | ')}`);
    if (r.over > 1) issues.push(`${pre} horizontal overflow ${r.over}px`);
    if (r.bad.length) issues.push(`${pre} suspicious text: ${r.bad.join(', ')}`);
    if (r.h1 !== 1) issues.push(`${pre} ${r.h1} h1 elements`);
    if (r.skips.length) issues.push(`${pre} heading skips: ${r.skips.slice(0, 3).join('; ')}`);
    if (r.small.length) issues.push(`${pre} small targets: ${r.small.slice(0, 4).join('; ')}`);
    if (r.noAlt) issues.push(`${pre} ${r.noAlt} images without alt`);
    await page.close();
  }
  await ctx.close();
}
for (const [t, ps] of titles) if (ps.length > 1) issues.push(`duplicate title "${t}": ${ps.join(', ')}`);
// internal links must resolve to a real file
for (const l of internal) {
  const res = await fetch(ORIGIN + l);
  if (res.status >= 400) issues.push(`broken internal link ${l} (${res.status})`);
}
await browser.close();
console.log(`${paths.length} routes x 2 widths, ${internal.size} internal links checked`);
console.log(issues.length ? issues.join('\n') : 'No issues found');
