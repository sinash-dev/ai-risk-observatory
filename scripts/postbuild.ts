/**
 * Runs after `vite build`.
 * - writes dist/<route>/index.html for every route, with route-specific <title>, description, canonical and Open Graph tags
 * - writes 404.html, sitemap.xml, robots.txt, route-manifest.json and updates.xml (RSS)
 * - renders Open Graph images to dist/og/*.png
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { allRoutes, type RouteMeta } from '../src/data/routes';
import { SITE } from '../src/data/site';
import { renderOgImages } from './og';

const DIST = 'dist';
const SITE_URL = SITE.url; // ends with '/'
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const template = readFileSync(join(DIST, 'index.html'), 'utf8');
const assets = readdirSync(join(DIST, 'assets'));
const manrope = assets.find((f) => /^manrope-latin-wght-normal-.*\.woff2$/.test(f));
const base = template.match(/src="([^"]*)assets\//)?.[1] ?? '/ai-risk-observatory/';

const fullTitle = (r: RouteMeta) => (r.path === '/' ? r.title : `${r.title} · ${SITE.name}`);
const routeUrl = (p: string) => SITE_URL + (p === '/' ? '' : p.replace(/^\//, '') + '/');

function page(r: RouteMeta, opts: { noindex?: boolean } = {}) {
  const title = fullTitle(r);
  const u = routeUrl(r.path);
  const img = `${SITE_URL}og/${r.og}.png`;
  const head = [
    `<link rel="canonical" href="${u}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE.name}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(r.description)}" />`,
    `<meta property="og:url" content="${u}" />`,
    `<meta property="og:image" content="${img}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="theme-color" content="#0c0e11" />`,
    `<link rel="alternate" type="application/rss+xml" title="${SITE.name}: updates" href="${base}updates.xml" />`,
    manrope ? `<link rel="preload" href="${base}assets/${manrope}" as="font" type="font/woff2" crossorigin />` : '',
    opts.noindex ? `<meta name="robots" content="noindex" />` : '',
  ].filter(Boolean).join('\n    ');
  return template
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(r.description)}" />`)
    .replace('</head>', `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root"></div>\n    <noscript><h1>${esc(r.title)}</h1><p>${esc(r.description)}</p><p>This site needs JavaScript for its simulations.</p></noscript>`);
}

const routes = allRoutes();
for (const r of routes) {
  const file = r.path === '/' ? join(DIST, 'index.html') : join(DIST, r.path.slice(1), 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, page(r));
}
writeFileSync(join(DIST, '404.html'), page({ path: '/404', title: 'Page not found', description: 'This page does not exist. Search the site or start from the overview.', og: 'default' }, { noindex: true }));

writeFileSync(join(DIST, 'route-manifest.json'), JSON.stringify(routes.map((r) => ({ path: r.path === '/' ? '/' : r.path + '/', title: fullTitle(r) })), null, 2));

writeFileSync(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((r) => `  <url><loc>${routeUrl(r.path)}</loc><lastmod>${SITE.reviewed}</lastmod></url>`).join('\n')}
</urlset>
`);
writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}sitemap.xml\n`);

// RSS feed of content updates (added in WS9; skipped if the module does not exist yet)
const updatesPath = join('src', 'data', 'updates.ts');
if (existsSync(updatesPath)) {
  const { UPDATES } = await import('../src/data/updates');
  const items = UPDATES.map((u) => `    <item><title>${esc(u.title)}</title><link>${SITE_URL}updates/</link><guid isPermaLink="false">${esc(u.date + ' ' + u.title)}</guid><pubDate>${new Date(u.date + 'T12:00:00Z').toUTCString()}</pubDate><description>${esc(u.body)}</description></item>`).join('\n');
  writeFileSync(join(DIST, 'updates.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${SITE.name}: updates</title>
    <link>${SITE_URL}</link>
    <description>Content and legal updates to ${SITE.name}.</description>
${items}
  </channel>
</rss>
`);
}

const n = await renderOgImages(routes, join(DIST, 'og'));
console.log(`postbuild: ${routes.length} route pages, 404, sitemap, robots, manifest, ${n} OG images`);
