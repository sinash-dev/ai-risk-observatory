import { expect, test, type Page } from '@playwright/test';

const BASE = process.env.E2E_BASE ?? '/ai-risk-observatory/';
const desktopOnly = (name: string) => test.skip(name !== 'desktop', 'checked at fixed desktop widths');

test('home hero: one primary action, to the register', async ({ page }) => {
  await page.goto(BASE);
  const primary = page.locator('.hero .btn-primary');
  await expect(primary).toHaveCount(1);
  await expect(primary).toHaveText('Check your first AI system');
  expect(await primary.getAttribute('href')).toMatch(/\/register\/$/);
  await expect(page.locator('.hero h1')).toContainText('which AI rules apply');
  // the prerendered first paint carries the same headline
  const html = await (await page.request.get(BASE)).text();
  expect(html).toContain('<h1>Find out which AI rules apply to you, and what to do about them.</h1>');
});

test('home headline fits in three lines at 1440 px', async ({ page }, info) => {
  desktopOnly(info.project.name);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE);
  const h1 = page.locator('.hero h1');
  const lh = await h1.evaluate((el) => parseFloat(getComputedStyle(el).lineHeight));
  expect((await h1.boundingBox())!.height).toBeLessThan(3.3 * lh);
});

test('nothing fixed covers the hero buttons on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE);
  await page.waitForTimeout(1500); // the old tour pill appeared after 1.2 s
  const box = (await page.locator('.hero .btn-primary').boundingBox())!;
  const hits = await page.evaluate((b) => [...document.querySelectorAll('*')].filter((e) => {
    if (getComputedStyle(e).position !== 'fixed') return false;
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.left < b.x + b.width && r.right > b.x && r.top < b.y + b.height && r.bottom > b.y;
  }).map((e) => e.className), box);
  expect(hits).toEqual([]);
});

async function headerOverflow(page: Page, path: string) {
  await page.goto(BASE + path);
  return page.evaluate(() => { const h = document.querySelector('.header-in')!; return h.scrollWidth - h.clientWidth; });
}

test('header: search on one line, nothing overflows at common widths', async ({ page }, info) => {
  desktopOnly(info.project.name);
  for (const width of [1121, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['', 'start/', 'rules/eu/']) expect(await headerOverflow(page, path), `${width} ${path}`).toBeLessThanOrEqual(0);
    if (width >= 1280) expect((await page.locator('.search-btn').boundingBox())!.height).toBeLessThanOrEqual(44);
  }
});

test('navigation: register at the top, Examples label, lens only where it works', async ({ page }, info) => {
  desktopOnly(info.project.name);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE + 'start/');
  const nav = page.getByRole('navigation', { name: 'Main' });
  await expect(nav.getByRole('link', { name: 'My AI register' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Examples' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Compare', exact: false })).toHaveCount(0);
  await expect(page.locator('[data-tour="lens"]')).toHaveCount(0); // no lens on /start
  await page.goto(BASE + 'model/credit/');
  await expect(nav.getByRole('link', { name: 'Examples' })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.lens-wide [data-tour="lens"]')).toBeVisible();
  await page.goto(BASE + 'rules/');
  await expect(page.getByRole('link', { name: 'Compare frameworks side by side' })).toBeVisible();
});

test('start: five steps in one row at 1280 px', async ({ page }, info) => {
  desktopOnly(info.project.name);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(BASE + 'start/');
  const tops = await page.locator('.start-main .start-steps > li').evaluateAll((li) => li.map((l) => Math.round(l.getBoundingClientRect().top)));
  expect(tops).toHaveLength(5);
  expect(new Set(tops).size).toBe(1);
});

test('tour: no pill on arrival; the Start page button opens it on the home page', async ({ page }) => {
  await page.goto(BASE);
  await page.waitForTimeout(1500);
  await expect(page.locator('.tour-pill')).toHaveCount(0);
  await page.goto(BASE + 'start/');
  await page.getByRole('main').getByRole('button', { name: 'Take the 60-second tour' }).click();
  await expect(page).toHaveURL(new RegExp(`${BASE}$`));
  await expect(page.getByRole('dialog', { name: /Tour step 1/ })).toBeVisible();
});
