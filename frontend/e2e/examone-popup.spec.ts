import { test, expect } from '@playwright/test';
import { clickSmart, expectVisibleSmart } from './utils/locators';

test('ExamOne opens as popup and returns', async ({ page, context }) => {
  await page.goto('/cases/CS-TX1-1757444260432');

  // Medical section button should be visible
  await expectVisibleSmart(page, ["text=Medical Information", "role=heading[name=/Medical/ i]"]);

  // Intercept popup
  const popupPromise = context.waitForEvent('page');
  await clickSmart(page, 'button:has-text("Lab/ExamOne")', ['role=button[name=/ExamOne|Lab/ i]', '[data-testid="lab-order"]']);

  const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded');

  // Assert we are NOT on dashboard and title is correct
  await expect(popup).toHaveTitle(/ExamOne|Lab Order/i);
  await expect(popup.locator('text=Order')).toBeVisible();

  // Smoke submit
  await popup.getByRole('button', { name: /submit order/i }).click();
  await popup.waitForSelector('pre >> text=Request', { timeout: 10000 });

  // Close popup and ensure primary page is still on Application Details
  await popup.close();
  await expect(page).toHaveURL(/cases/);
});