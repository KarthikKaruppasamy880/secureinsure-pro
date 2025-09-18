import { test, expect } from '@playwright/test';

test('Test ApplicationDetails component directly', async ({ page }) => {
  // Navigate directly to a case details page
  await page.goto('/cases/CS-TX1-1757444260432');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Check if we're on the right page
  const url = page.url();
  console.log(`Current URL: ${url}`);
  
  // Check for ApplicationDetails specific elements
  const appDetailsTitle = await page.locator('[data-testid="app-details-title"]').count();
  console.log(`Found ${appDetailsTitle} app-details-title elements`);
  
  const labOrderButton = await page.locator('[data-testid="lab-order"]').count();
  console.log(`Found ${labOrderButton} lab-order buttons`);
  
  const backButton = await page.locator('button:has-text("← Back")').count();
  console.log(`Found ${backButton} back buttons`);
  
  // Check for any error messages
  const errorElements = await page.locator('[data-testid="app-details-error"]').count();
  console.log(`Found ${errorElements} error elements`);
  
  const loadingElements = await page.locator('[data-testid="app-details-loading"]').count();
  console.log(`Found ${loadingElements} loading elements`);
  
  // Get page content
  const bodyText = await page.locator('body').textContent();
  console.log(`Body text length: ${bodyText?.length || 0}`);
  console.log(`Body text preview: ${bodyText?.substring(0, 200)}...`);
  
  // Take a screenshot
  await page.screenshot({ path: 'test-app-details-direct.png' });
  
  // Just pass for now to see the output
  expect(true).toBe(true);
});
