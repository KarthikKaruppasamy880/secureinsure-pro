import { test, expect } from './setup';

test.beforeEach(async ({ page }) => {
  page.on('console', msg => {
    // Ignore CORS warnings as they're expected in development
    if (['error','warning'].includes(msg.type()) && !msg.text().includes('CORS Warning')) {
      throw new Error('Console: ' + msg.text());
    }
  });
});

test('1) Dashboard → Case click → Application Details with data', async ({ page }) => {
  await page.goto('/dashboard');
  const link = page.locator('[data-testid^="case-link-"]').first();
  await expect(link).toBeVisible();
  await link.click();
  await expect(page.locator('[data-testid="app-details-title"]')).toBeVisible();
  await expect(page.locator('[data-testid="app-details-caseid"]')).not.toHaveText('');
});

test('2) TX1 import → redirect → populated', async ({ page }) => {
  await page.goto('/dashboard');
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: /Import TX1/i }).click();
  const chooser = await fileChooserPromise;
  await chooser.setFiles('e2e/fixtures/sample.tx1.xml');
  await expect(page).toHaveURL(/\/cases\/.+$/);
  await expect(page.locator('text=Insured')).toBeVisible();
  await expect(page.locator('text=Face Amount')).toBeVisible();
});

test('3) Order Lab → ExamOne results visible', async ({ page }) => {
  await page.goto('/dashboard');
  await page.locator('[data-testid^="case-link-"]').first().click();
  await page.getByRole('button', { name:/Order Lab/i }).click();
  await expect(page).toHaveURL(/\/examone$/);
  await expect(page.locator('[data-testid="examone-table"]')).toBeVisible();
});