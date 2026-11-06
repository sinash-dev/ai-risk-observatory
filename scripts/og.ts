/** Open Graph images (1200×630 PNG) rendered from an SVG template with resvg. */
import { Resvg } from '@resvg/resvg-js';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { RouteMeta } from '../src/data/routes';

const ACCENT = '#6cc5b0';
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Greedy word wrap by approximate character width. */
function wrap(text: string, max: number, lines: number) {
  const out: string[] = [];
  let cur = '';
  for (const w of text.split(/\s+/)) {
    if ((cur + ' ' + w).trim().length > max) { out.push(cur.trim()); cur = w; } else cur += ' ' + w;
    if (out.length === lines) break;
  }
  if (out.length < lines && cur.trim()) out.push(cur.trim());
  if (out.length === lines && text.length > out.join(' ').length + 2) out[lines - 1] = out[lines - 1].replace(/[,.;:]?\s*\S*$/, '') + '…';
  return out;
}

function svg(title: string, subtitle: string, bar: string) {
  const t = wrap(title, 30, 3);
  const st = wrap(subtitle, 62, 3);
  const ty = 250 - (t.length - 1) * 34;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="g" cx="50%" cy="-20%" r="85%"><stop offset="0" stop-color="#ffffff" stop-opacity=".07"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0c0e11"/>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect x="0" y="0" width="14" height="630" fill="${bar}"/>
  <g transform="translate(80 70)">
    <rect width="64" height="64" rx="14" fill="#14171c" stroke="#ffffff" stroke-opacity=".15"/>
    <circle cx="32" cy="32" r="17" fill="none" stroke="${ACCENT}" stroke-width="3" stroke-dasharray="6 4"/>
    <circle cx="32" cy="32" r="6" fill="#eceef1"/>
    <circle cx="47" cy="22" r="4" fill="#d9a441"/>
    <text x="84" y="42" font-size="28" font-weight="700" fill="#eceef1">AI Risk Explorer</text>
  </g>
  ${t.map((l, i) => `<text x="80" y="${ty + i * 68}" font-size="58" font-weight="700" fill="#ffffff">${esc(l)}</text>`).join('\n  ')}
  ${st.map((l, i) => `<text x="80" y="${ty + t.length * 68 + 30 + i * 40}" font-size="28" fill="#c8ccd3">${esc(l)}</text>`).join('\n  ')}
  <line x1="80" y1="548" x2="1120" y2="548" stroke="#ffffff" stroke-opacity=".1"/>
  <text x="80" y="590" font-size="24" fill="#9298a3">AI Risk Explorer · Training resource</text>
</svg>`;
}

export async function renderOgImages(routes: RouteMeta[], outDir: string) {
  mkdirSync(outDir, { recursive: true });
  const font = { loadSystemFonts: true, defaultFontFamily: process.platform === 'win32' ? 'Segoe UI' : 'DejaVu Sans' };
  const seen = new Set<string>();
  let n = 0;
  const jobs: { slug: string; title: string; sub: string; bar: string }[] = [
    { slug: 'default', title: 'How AI systems go wrong, and what the rules say', sub: 'Working simulations of real AI uses, mapped to the EU AI Act, US law, NIST, ISO/IEC 42001, OWASP, GDPR and Asian frameworks.', bar: ACCENT },
  ];
  for (const r of routes) {
    if (r.og === 'default' || seen.has(r.og)) continue;
    seen.add(r.og);
    jobs.push({ slug: r.og, title: r.title.replace(/: guide$/, ''), sub: r.description, bar: r.color ?? ACCENT });
  }
  for (const j of jobs) {
    const png = new Resvg(svg(j.title, j.sub, j.bar), { font, fitTo: { mode: 'width', value: 1200 } }).render().asPng();
    writeFileSync(join(outDir, `${j.slug}.png`), png);
    n++;
  }
  return n;
}
