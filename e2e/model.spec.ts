import { expect, test } from '@playwright/test';

const BASE = process.env.E2E_BASE ?? '/ai-risk-observatory/';

test('a shared setup URL reproduces the same problems and safeguards', async ({ page }) => {
  await page.goto(BASE + 'model/credit/?p=zip,drift&s=dropzip');
  await expect(page.locator('.toggle.problem', { hasText: 'Add postcode as a feature' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.toggle.problem', { hasText: 'Recession: incomes fall' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.toggle.fix', { hasText: 'Proxy test & remove proxies' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('sim-summary')).toContainText('handled');
  // toggling updates the address bar
  await page.locator('.toggle.problem', { hasText: 'Auto-decline without stated reasons' }).click();
  await expect(page).toHaveURL(/p=zip,drift,opaque&s=dropzip/);
});

test('model page shows memo, residual risk, trade-off, checklist and prompts', async ({ page }) => {
  await page.goto(BASE + 'model/face/');
  await expect(page.locator('.memo')).toContainText('From:');
  await expect(page.locator('#residual')).toContainText('Residual risk');
  await expect(page.getByText('Business value')).toBeVisible();
  await expect(page.locator('.check')).toHaveCount(5);
  await page.locator('.discuss summary').click();
  await expect(page.locator('.discuss li').first()).toBeVisible();
});

test('checklist state is kept in this browser', async ({ page }) => {
  await page.goto(BASE + 'model/credit/');
  const first = page.locator('.check input').first();
  await first.check();
  await page.reload();
  await expect(page.locator('.check input').first()).toBeChecked();
});

test('emotion: staff scoring cannot be made acceptable', async ({ page }) => {
  await page.goto(BASE + 'model/emotion/?p=rank&s=validate');
  await expect(page.getByText('No safeguard makes this acceptable here')).toBeVisible();
});

test('requirement status pills follow the safeguards', async ({ page }) => {
  await page.goto(BASE + 'model/credit/?s=dropzip,reweigh,monitor,explain');
  await page.locator('#rules').scrollIntoViewIfNeeded();
  await expect(page.locator('#rules .pill.met').first()).toBeVisible();
});

test('guide: myth cards flip with the keyboard and the table sorts and filters', async ({ page }) => {
  await page.goto(BASE + 'rules/gdpr/');
  const card = page.locator('.flip-inner').first();
  await card.focus();
  await page.keyboard.press('Enter');
  await expect(card).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.flip').first()).toHaveClass(/on/);
  const firstRow = () => page.locator('.ex-table tbody tr').first().locator('td').first().innerText();
  await page.locator('.th-btn', { hasText: 'Example' }).click();
  const a = await firstRow();
  await page.locator('.th-btn', { hasText: 'Example' }).click();
  expect(await firstRow()).not.toBe(a);
  const all = await page.locator('.ex-table tbody tr').count();
  await page.locator('#examples .chip-btn').nth(1).click();
  expect(await page.locator('.ex-table tbody tr').count()).toBeLessThan(all);
});

test('compare: CSV downloads, PNG downloads, gap finder reacts', async ({ page }) => {
  await page.goto(BASE + 'compare/');
  const [csv] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download CSV' }).click()]);
  expect(csv.suggestedFilename()).toBe('ai-risk-explorer-compare.csv');
  const [png] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download PNG' }).click()]);
  expect(png.suggestedFilename()).toBe('ai-risk-explorer-compare.png');
  const gap = page.locator('.gap');
  await gap.locator('select').first().selectOption('gdpr');
  await gap.locator('select').nth(1).selectOption('gdpr');
  await expect(gap).toContainText('No topic where');
  await gap.locator('select').nth(1).selectOption('eu');
  await gap.locator('select').first().selectOption('owasp');
  await expect(gap.locator('.gap-list li').first()).toBeVisible();
});

test('compare: ?topic= opens that topic', async ({ page }) => {
  await page.goto(BASE + 'compare/?topic=redress');
  await expect(page.locator('#topic h2')).toHaveText('Individual rights and redress');
});
