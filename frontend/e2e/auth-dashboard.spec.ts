import { test, expect } from '@playwright/test';

test('Login and Dashboard flow', async ({ page }) => {
  // Go to dashboard first
  await page.goto('/dashboard');
  
  // Wait a bit to see what happens
  await page.waitForTimeout(2000);
  
  // Check if we're on login page
  const currentUrl = page.url();
  console.log(`Current URL: ${currentUrl}`);
  
  if (currentUrl.includes('/login')) {
    console.log('Redirected to login, attempting to login...');
    
    // Fill in login form
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"]', 'admin123');
    await page.click('[data-testid="login-button"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard');
  }
  
  // Now check if dashboard loaded
  await page.waitForLoadState('networkidle');
  
  // Check if the dashboard title is visible
  await expect(page.locator('h1')).toContainText('Welcome back');
  
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
    
    // Check if Application Details page loaded
    await expect(page.getByTestId('app-details-title')).toBeVisible();
  } else {
    // If no case links, just verify the dashboard loaded
    await expect(page.locator('text=Active Cases')).toBeVisible();
  }
});
