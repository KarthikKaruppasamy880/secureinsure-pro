import { test, expect } from '@playwright/test';

test('Dashboard loads and shows content', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Check if the dashboard title is visible
  await expect(page.locator('h1').filter({ hasText: 'Welcome back' })).toBeVisible();
  
  // Check if there are any case links
  const caseLinks = page.locator('[data-testid^="case-link-"]');
  const count = await caseLinks.count();
  
  console.log(`Found ${count} case links`);
  
  if (count > 0) {
    // If we have case links, test clicking one
    const firstLink = caseLinks.first();
    const href = await firstLink.getAttribute('href');
    console.log(`First case link href: ${href}`);
    
    await firstLink.click();
    await expect(page).toHaveURL(/\/cases\/.+/);
  } else {
    // If no case links, just verify the dashboard loaded
    await expect(page.locator('text=Active Cases')).toBeVisible();
  }
});
