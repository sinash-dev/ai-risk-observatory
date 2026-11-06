import { expect, test } from '@playwright/test';

const BASE = process.env.E2E_BASE ?? '/ai-risk-observatory/';

test('classify: credit scoring wizard ends in high-risk 2027 and the URL reproduces it', async ({ page }) => {
  await page.goto(BASE + 'classify/');
  const next = async () => { await page.getByRole('button', { name: /^(Next|See the result)$/ }).click(); await page.waitForTimeout(350); await expect(page.locator('.wiz-step')).toHaveCount(await page.locator('.result').count() ? 0 : 1); };
  await page.getByLabel('EU or EEA').check(); await next();
  await page.getByLabel(/We use a system built by someone else/).check(); await next();
  await page.getByLabel('None of these').check(); await next();
  await page.getByRole('radio', { name: 'No', exact: true }).check(); await next();
  await page.getByLabel(/Access to essential private and public services/).check();
  await page.getByLabel(/Credit scoring or creditworthiness/).check(); await next();
  await page.getByLabel('No', { exact: true }).check(); await next(); // narrow task
  await page.getByLabel('No', { exact: true }).check(); await next(); // gpai
  await page.getByLabel('None of these').check(); await next();
  await next(); // personal data defaults
  await next(); // agent
  await expect(page.locator('.res').first()).toContainText('High-risk from 2 December 2027');
  await expect(page.locator('.result')).toContainText('Credit scoring');
  await page.waitForTimeout(300);
  const link = page.url();
  await page.goto(link);
  await expect(page.locator('.res').first()).toContainText('High-risk from 2 December 2027');
});

test('quiz: scoring, result and certificate', async ({ page }) => {
  await page.goto(BASE + 'quiz/kr/');
  for (let i = 0; i < 5; i++) {
    const opts = page.locator('.quiz-opt');
    await opts.first().click();
    await expect(page.locator('.quiz-explain')).toBeVisible();
    await page.getByRole('button', { name: /Next question|See my score/ }).click();
  }
  await expect(page.locator('.quiz-result')).toContainText('You scored');
  await page.goto(BASE + 'quiz/');
  await expect(page.locator('.quiz-card', { hasText: 'Korea AI Basic Act' })).toContainText(/\d\/5/);
});

test('certificate lists passed modules', async ({ page }) => {
  await page.goto(BASE);
  await page.evaluate(() => localStorage.setItem('are-quiz', JSON.stringify({ eu: { score: 5, total: 5, at: Date.now() }, us: { score: 2, total: 5, at: Date.now() } })));
  await page.goto(BASE + 'certificate/');
  await page.getByPlaceholder('Your name').fill('Test Person');
  await expect(page.locator('.cert-table tbody tr')).toHaveCount(1);
  await expect(page.locator('.cert-name')).toHaveText('Test Person');
  await expect(page.locator('.cert-note')).toContainText('Not an accredited qualification');
});

test('toolkit: preview renders and download link works', async ({ page, request }) => {
  await page.goto(BASE + 'toolkit/');
  await page.locator('.tk', { hasText: 'Human oversight checklist' }).getByRole('button', { name: 'Preview' }).click();
  await expect(page.getByRole('dialog')).toContainText('automation bias');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  for (const f of ['ai-system-inventory.csv', 'workshop-facilitator-guide.md']) expect((await request.get(BASE + 'toolkit/' + f)).status()).toBe(200);
});

test('glossary: anchor and filter', async ({ page }) => {
  await page.goto(BASE + 'glossary/#prompt-injection');
  await expect(page.locator('#prompt-injection')).toBeInViewport();
  await page.getByLabel('Filter terms').fill('fairness');
  await expect(page.locator('.gl-item').first()).toBeVisible();
  expect(await page.locator('.gl-item').count()).toBeLessThan(10);
});

test('crosswalk: popover and column toggle', async ({ page }) => {
  await page.goto(BASE + 'crosswalk/');
  await page.locator('.xw-cell').first().click();
  await expect(page.getByRole('dialog')).toContainText('See it in the simulations');
  await page.keyboard.press('Escape');
  const cols = await page.locator('.xw thead th').count();
  await page.locator('.xw-tools .chip-btn', { hasText: 'OWASP' }).click();
  expect(await page.locator('.xw thead th').count()).toBe(cols - 1);
});

test('cases: filters narrow the list', async ({ page }) => {
  await page.goto(BASE + 'cases/');
  const all = await page.locator('.case-lib').count();
  await page.locator('.chips', { hasText: 'Outcome' }).getByRole('button', { name: 'Fine or settlement' }).click();
  await expect(async () => expect(await page.locator('.case-lib').count()).toBeLessThan(all)).toPass();
  await page.getByRole('tab', { name: 'Timeline' }).click();
  await expect(page.locator('.case-year').first()).toBeVisible();
});

test('RSS feed and sitemap include the new pages', async ({ request }) => {
  const rss = await (await request.get(BASE + 'updates.xml')).text();
  expect(rss).toContain('<rss version="2.0">');
  const sm = await (await request.get(BASE + 'sitemap.xml')).text();
  for (const p of ['classify/', 'crosswalk/', 'quiz/eu/', 'glossary/']) expect(sm).toContain(p);
});
