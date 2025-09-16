import { test, expect } from '@playwright/test';

test('Debug Application Details page', async ({ page }) => {
  const consoleMessages: string[] = [];
  const errors: string[] = [];
  
  // Capture console messages
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(`${msg.type()}: ${text}`);
    if (msg.type() === 'error') {
      errors.push(text);
    }
  });
  
  // Navigate to a case details page
  await page.goto('/cases/CS-TX1-1757444260432');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Get the page content
  const bodyText = await page.locator('body').textContent();
  console.log(`Body text length: ${bodyText?.length || 0}`);
  console.log(`Body text preview: ${bodyText?.substring(0, 500)}...`);
  
  // Check for any elements with "Application Details"
  const appDetailsElements = await page.locator('text=Application Details').count();
  console.log(`Found ${appDetailsElements} elements with "Application Details" text`);
  
  // Check for any h1 elements
  const h1Elements = await page.locator('h1').count();
  console.log(`Found ${h1Elements} h1 elements`);
  
  // Check for loading state
  const loadingElements = await page.locator('[data-testid="app-details-loading"]').count();
  console.log(`Found ${loadingElements} loading elements`);
  
  // Check for error state
  const errorElements = await page.locator('[data-testid="app-details-error"]').count();
  console.log(`Found ${errorElements} error elements`);
  
  // Print console messages
  console.log('\nConsole messages:');
  consoleMessages.forEach(msg => console.log(msg));
  
  if (errors.length > 0) {
    console.log('\nErrors found:');
    errors.forEach(error => console.log(error));
  }
  
  // Take a screenshot
  await page.screenshot({ path: 'debug-app-details.png' });
  
  // Just pass for now
  expect(true).toBe(true);
});
