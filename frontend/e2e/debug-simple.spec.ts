import { test, expect } from '@playwright/test';

test('Debug simple page load', async ({ page }) => {
  // Navigate to dashboard first
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  
  console.log('Dashboard URL:', page.url());
  console.log('Dashboard title:', await page.title());
  
  // Check if dashboard loads
  const dashboardContent = await page.locator('body').textContent();
  console.log('Dashboard content length:', dashboardContent?.length);
  console.log('Dashboard content preview:', dashboardContent?.substring(0, 200));
  
  // Now try to navigate to a case
  await page.goto('/cases/CS-TX1-1757444260432');
  await page.waitForLoadState('networkidle');
  
  console.log('Case URL:', page.url());
  console.log('Case title:', await page.title());
  
  // Check if case page loads
  const caseContent = await page.locator('body').textContent();
  console.log('Case content length:', caseContent?.length);
  console.log('Case content preview:', caseContent?.substring(0, 200));
  
  // Check for any JavaScript errors
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // Take a screenshot
  await page.screenshot({ path: 'debug-simple.png' });
  
  console.log('JavaScript errors:', errors);
  
  expect(true).toBe(true);
});
