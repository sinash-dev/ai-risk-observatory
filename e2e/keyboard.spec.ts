import { expect, test } from '@playwright/test';

const BASE = process.env.E2E_BASE ?? '/ai-risk-observatory/';

// E5: the menus and search work with the keyboard alone, and Escape returns focus to where it was
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('tour-done', '1'));
});

for (const name of ['Learn', 'Tools']) {
  test(`${name} menu opens, moves and closes with the keyboard`, async ({ page }, info) => {
    test.skip(info.project.name === 'mobile', 'menus are in the sheet on small screens');
    await page.goto(BASE);
    const btn = page.getByRole('button', { name: new RegExp(`^${name}`) });
    await btn.focus();
    await page.keyboard.press('ArrowDown');
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    const links = page.locator('.menu-pop a');
    await expect(links.first()).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(links.nth(1)).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await expect(links.last()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(btn).toBeFocused();
  });
}

test('search opens by shortcut and Escape returns focus to the element that had it', async ({ page }) => {
  await page.goto(BASE + 'rules/');
  const link = page.getByRole('main').getByRole('link').first();
  await link.focus();
  await page.keyboard.press('Control+k');
  const box = page.getByRole('combobox', { name: 'Search' });
  await expect(box).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(link).toBeFocused();
});

test('register Backup menu works with the keyboard', async ({ page }) => {
  await page.goto(BASE + 'register/');
  await page.getByRole('button', { name: 'Add your first system' }).click();
  const btn = page.getByRole('button', { name: 'Backup', exact: true });
  await btn.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('button', { name: 'Back up (JSON)' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('button', { name: 'Import JSON' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
  await expect(btn).toBeFocused();
});
