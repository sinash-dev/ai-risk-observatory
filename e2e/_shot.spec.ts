/** Full-page screenshots for manual review. Runs only when SHOTS is set, e.g. SHOTS="guide:rules/eu/;home:" */
import { test } from '@playwright/test';

const OUT = process.env.SHOT_DIR ?? 'test-results/shots';
const list = (process.env.SHOTS ?? '').split(';').filter(Boolean).map((x) => { const i = x.indexOf(':'); return [x.slice(0, i), x.slice(i + 1)] as const; });
for (const [name, path] of list) {
  test(`shot ${name}`, async ({ page }, info) => {
    test.skip(info.project.name !== (process.env.SHOT_PROJECT ?? 'desktop'));
    await page.goto('/ai-risk-observatory/' + path);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/${name}-${info.project.name}.png`, fullPage: true });
  });
}
