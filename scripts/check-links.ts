/**
 * Checks every external URL in the site data. Run by hand (not in CI, to avoid flaky builds):
 *   npx tsx scripts/check-links.ts
 * Some official sites block automated requests (403/401/202); those are listed separately and
 * should be checked in a browser.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const files: string[] = [];
const walk = (d: string) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) { if (f !== '__tests__') walk(p); } else if (/\.(ts|tsx)$/.test(f)) files.push(p); } };
walk('src');
const urls = new Set<string>();
for (const f of files) for (const m of readFileSync(f, 'utf8').matchAll(/https:\/\/[^\s'"`<>]+/g)) {
  let u = m[0].replace(/[.,;]+$/, '');
  // drop a closing parenthesis that is not part of the URL
  while (u.endsWith(')') && (u.match(/\(/g) ?? []).length < (u.match(/\)/g) ?? []).length) u = u.slice(0, -1);
  if (!/example|goatcounter|\$\{/.test(u)) urls.add(u);
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';
async function check(u: string) {
  try {
    const r = await fetch(u, { redirect: 'follow', headers: { 'user-agent': UA, accept: 'text/html,*/*' }, signal: AbortSignal.timeout(20000) });
    return r.status;
  } catch { return 0; }
}

const results = await Promise.all([...urls].map(async (u) => [u, await check(u)] as const));
const ok = results.filter(([, s]) => s >= 200 && s < 300 && s !== 202);
const blocked = results.filter(([, s]) => [202, 401, 403, 429].includes(s));
const broken = results.filter(([, s]) => !(s >= 200 && s < 300) && ![202, 401, 403, 429].includes(s));
console.log(`${urls.size} URLs: ${ok.length} OK, ${blocked.length} blocked automated checks, ${broken.length} broken`);
for (const [u, s] of blocked) console.log(`  BLOCKED ${s} ${u}`);
for (const [u, s] of broken) console.log(`  BROKEN  ${s} ${u}`);
process.exitCode = broken.length ? 1 : 0;
