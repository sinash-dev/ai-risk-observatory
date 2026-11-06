import { expect, test } from '@playwright/test';

const BASE = process.env.E2E_BASE ?? '/ai-risk-observatory/';
type U = { frames: () => number; project: (id: string) => { x: number; y: number } | null };

test.describe('3D scenes (motion allowed, desktop)', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 900 } });

  test('home universe renders, hover shows a tooltip, click navigates, pauses off-screen', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(BASE);
    await page.waitForFunction(() => !!(window as unknown as { __universe?: U }).__universe, null, { timeout: 15000 });
    await expect(page.locator('.universe canvas')).toBeVisible();
    // hover: track the moving node until the tooltip shows
    let shown = false;
    for (let i = 0; i < 12 && !shown; i++) {
      const p = await page.evaluate(() => (window as unknown as { __universe: U }).__universe.project('credit'));
      if (p) await page.mouse.move(p.x, p.y);
      shown = await page.locator('.u-tip').isVisible();
      if (!shown) await page.waitForTimeout(150);
    }
    expect(shown).toBe(true);
    await expect(page.locator('.u-tip')).toContainText('Credit scoring');
    const p = await page.evaluate(() => (window as unknown as { __universe: U }).__universe.project('credit'));
    await page.mouse.click(p!.x, p!.y);
    await expect(page).toHaveURL(/model\/credit\/$/);
    expect(errors).toEqual([]);
  });

  test('universe stops rendering when scrolled out of view', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForFunction(() => !!(window as unknown as { __universe?: U }).__universe, null, { timeout: 15000 });
    const f = () => page.evaluate(() => (window as unknown as { __universe: U }).__universe.frames());
    const a = await f(); await page.waitForTimeout(400);
    expect(await f()).toBeGreaterThan(a);
    await page.locator('#all-examples').scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const b = await f(); await page.waitForTimeout(600);
    expect(await f()).toBe(b);
  });
});

test.describe('Frameworks globe and timeline (motion allowed, desktop)', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 900 } });
  type G = U & { camera: () => number[] };

  test('clicking a marker turns the globe and opens the panel', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(BASE + 'rules/');
    await page.waitForFunction(() => !!(window as unknown as { __globe?: G }).__globe, null, { timeout: 15000 });
    await page.waitForTimeout(800);
    const cam0 = await page.evaluate(() => (window as unknown as { __globe: G }).__globe.camera());
    // Singapore is on the far side at the start; clicking it must rotate the view
    let opened = false;
    for (let i = 0; i < 20 && !opened; i++) {
      const p = await page.evaluate(() => (window as unknown as { __globe: G }).__globe.project('eu'));
      if (p) { await page.mouse.click(p.x, p.y); }
      opened = await page.locator('.globe-panel h2', { hasText: 'EU AI Act' }).isVisible();
      if (!opened) await page.waitForTimeout(200);
    }
    expect(opened).toBe(true);
    await expect(page.locator('.globe-panel')).toContainText('Open guide');
    await page.waitForTimeout(1100);
    const cam1 = await page.evaluate(() => (window as unknown as { __globe: G }).__globe.camera());
    expect(cam1.join()).not.toBe(cam0.join());
    expect(errors).toEqual([]);
  });

  test('timeline track is pinned and moves sideways while scrolling', async ({ page }) => {
    await page.goto(BASE + 'rules/');
    const track = page.locator('.wt-track');
    await track.scrollIntoViewIfNeeded();
    const outer = page.locator('.wt-outer');
    const top = await outer.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    await page.evaluate((y) => window.scrollTo(0, y + 10), top);
    await page.waitForTimeout(300);
    const x0 = await track.evaluate((el) => el.getBoundingClientRect().left);
    await page.evaluate((y) => window.scrollTo(0, y + 900), top);
    await page.waitForTimeout(400);
    const x1 = await track.evaluate((el) => el.getBoundingClientRect().left);
    expect(x1).toBeLessThan(x0 - 300);
  });
});

test.describe('2D fallbacks', () => {
  test('reduced motion: no canvas, SVG orbit instead, no errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(BASE);
    await expect(page.getByRole('img', { name: /All models orbiting/ })).toBeVisible();
    await expect(page.locator('canvas')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});
