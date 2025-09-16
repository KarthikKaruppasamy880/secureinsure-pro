import { test, expect } from '@playwright/test';

test('1. Dashboard ➜ click Case ID ➜ Application Details with data', async ({ page }) => {
  await page.goto('/dashboard');
  const link = page.locator('[data-testid^="case-link-"]').first();
  const href = await link.getAttribute('href');
  await link.click();
  await expect(page).toHaveURL(href!);
  await expect(page.getByTestId('app-details-title')).toBeVisible();
  await expect(page.getByTestId('sec-insured')).toBeVisible();
});

test('2. TX1 Import ➜ redirect ➜ fields populated', async ({ page }) => {
  await page.goto('/dashboard');
  // your existing import UI:
  await page.getByRole('button', { name: /Import TX1/i }).click();
  await page.setInputFiles('input[type="file"]', 'e2e/fixtures/sample.tx1.xml');
  await page.getByRole('button', { name: /Upload/i }).click();
  await page.waitForURL(/\/cases\/.+$/);
  await expect(page.getByTestId('sec-case-setup')).toBeVisible();
  await expect(page.getByTestId('sec-insured')).toBeVisible();
  await expect(page.locator('[data-testid="field-firstName"]')).not.toHaveValue('');
});

test('3. Order Lab ➜ opens results screen and table renders', async ({ page, context }) => {
  await page.goto('/cases/CS-2024-001');
  const [popup] = await Promise.all([
    context.waitForEvent('page'),
    page.getByRole('button', { name: /Order Lab/i }).click()
  ]);
  await popup.waitForLoadState('domcontentloaded');
  await expect(popup.getByTestId('examone-title')).toBeVisible();
  await expect(popup.getByTestId('examone-table')).toBeVisible();
});