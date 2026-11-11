import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const BASE = process.env.E2E_BASE ?? '/ai-risk-observatory/';

// E1: the home persona links became one "Start here" link, and other roles are collapsed cards on /start
test('start here: the home link leads to /start, and old role links open the right card', async ({ page }) => {
  await page.goto(BASE);
  await page.getByRole('link', { name: 'Teaching, building or studying AI? Start here' }).click();
  await expect(page).toHaveURL(/\/start\/$/);
  await page.goto(BASE + 'start/#trainers');
  await expect(page.locator('details#trainers')).toHaveAttribute('open', '');
  await expect(page.locator('#trainers .start-step')).toHaveCount(5);
});

test('register: add, classify, tick, export, reload and import', async ({ page }) => {
  await page.goto(BASE + 'register/');
  await expect(page.getByRole('heading', { name: 'No systems yet' })).toBeVisible();
  await page.getByRole('button', { name: 'Add your first system' }).click();

  await page.getByLabel('Name of the system').fill('CV screening tool');
  await page.getByLabel('Owner').fill('HR, team "talent"');
  await page.getByRole('tab', { name: '2. Questions' }).click();
  await page.getByLabel(/Employment and management of workers/).check();
  await page.locator('fieldset', { hasText: 'narrow procedural' }).getByLabel('No', { exact: true }).check();
  await page.getByRole('button', { name: 'See what to do' }).click();

  const editor = page.locator('.reg-editor');
  await expect(editor).toContainText('EU AI Act: High-risk (from 2 December 2027)');
  const boxes = editor.locator('.check input');
  const total = await boxes.count();
  expect(total).toBeGreaterThan(2);
  await boxes.first().check();
  await expect(page.getByRole('tab', { name: `3. Actions (1/${total})` })).toBeVisible();
  await expect(page.locator('.reg-summary .cat-legend')).toContainText(/High-risk\s*1/);

  // the register survives a reload
  await page.waitForTimeout(200);
  await page.reload();
  await expect(page.locator('.reg-row')).toHaveCount(1);
  await expect(page.locator('.reg-row')).toContainText(`1/${total}`);

  // Markdown export
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  const [md] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Markdown report' }).click()]);
  const text = readFileSync((await md.path())!, 'utf8');
  expect(text).toContain('| CV screening tool | HR, team "talent" | Idea or procurement | High-risk | 1/');
  expect(text).toContain('- [x] ');
  expect(text).toContain('## Summary for management');

  // JSON backup, then import it into an empty register
  await page.getByRole('button', { name: 'Backup', exact: true }).click();
  const [js] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Back up (JSON)' }).click()]);
  const backup = readFileSync((await js.path())!, 'utf8');
  await page.evaluate(() => localStorage.removeItem('are-register-v1'));
  await page.reload();
  await expect(page.getByRole('heading', { name: 'No systems yet' })).toBeVisible();
  await page.locator('input[type=file]').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(backup) });
  await expect(page.locator('.reg-row')).toHaveCount(1);
  await expect(page.locator('.reg-row')).toContainText(`1/${total}`);

  // a bad file is refused with a message
  await page.locator('input[type=file]').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('not json') });
  await expect(page.locator('.toast-host')).toContainText('This file is not valid JSON.');
  await expect(page.locator('.reg-row')).toHaveCount(1);

  // delete asks first
  await page.locator('.reg-open').click();
  await page.getByRole('tab', { name: '1. Details' }).click();
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Delete system' }).click();
  await expect(page.getByRole('heading', { name: 'No systems yet' })).toBeVisible();
});

test('register: an unanswered system is "Not yet assessed", and a Classify result can be added', async ({ page }) => {
  await page.goto(BASE + 'register/');
  await page.getByRole('button', { name: 'Add your first system' }).click();
  await expect(page.locator('.reg-editor')).toContainText('EU AI Act: Not yet assessed');
  await expect(page.locator('.reg-summary .cat-legend')).toContainText(/Not yet assessed\s*1/);
  await expect(page.locator('.reg-summary .cat-legend')).not.toContainText('Minimal risk');

  // a finished Classify result, opened from a shared link, goes straight into the register
  const answers = { where: ['eu'], role: 'deployer', banned: [], product: 'no', area: 'employment', narrow: 'no', gpai: 'no', interact: [], personal: 'yes', automated: 'no', agent: 'no' };
  const a = Buffer.from(JSON.stringify(answers)).toString('base64').replace(/=+$/, '');
  await page.goto(BASE + `classify/?a=${a}&r=1`);
  await page.getByRole('button', { name: 'Add to my register' }).click();
  await expect(page).toHaveURL(/\/register\/$/);
  await expect(page.locator('.reg-row')).toHaveCount(2);
  await expect(page.locator('.reg-editor')).toContainText('EU AI Act: High-risk (from 2 December 2027)');
  await expect(page.getByText('Indicative, not legal advice.')).toBeVisible();
  await expect(page.locator('.reg-summary .cat-legend')).toContainText(/High-risk\s*1/);
  await expect(page.locator('.reg-summary .cat-legend')).toContainText(/Not yet assessed\s*1/);
});

test('register: one button when empty, then keyboard-accessible Export and Backup menus', async ({ page }) => {
  await page.goto(BASE + 'register/');
  await expect(page.getByRole('button', { name: 'Export', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Add a system' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Add your first system' }).click();
  await page.getByLabel('Name of the system').fill('Chat assistant');
  // a new system is not assessed yet, so the header asks for answers instead of showing a category
  await expect(page.getByText('Answer the questions to see the category.')).toBeVisible();
  const exp = page.getByRole('button', { name: 'Export', exact: true });
  await exp.focus();
  await page.keyboard.press('ArrowDown');
  await expect(exp).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('button', { name: 'Markdown report' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('button', { name: 'Word report' })).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');
  await expect(page.getByRole('button', { name: 'Print' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(exp).toHaveAttribute('aria-expanded', 'false');
  await expect(exp).toBeFocused();
  await expect(page.getByRole('button', { name: 'Markdown report' })).toHaveCount(0);
});
