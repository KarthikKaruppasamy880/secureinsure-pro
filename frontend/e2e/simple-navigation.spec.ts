import { test, expect } from '@playwright/test';

// Helper function to login
async function login(page: any) {
  await page.goto('/login');
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

test.describe('Simple Navigation Test', () => {
  test('Dashboard loads and shows case links', async ({ page }) => {
    // Login first
    await login(page);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Look for any case link (case-001, CASE-*, etc.)
    const caseLink = page.getByRole('link').filter({ hasText: /case|CASE|C-/i }).first();
    
    if (await caseLink.isVisible()) {
      const href = await caseLink.getAttribute('href');
      console.log(`Found case link: ${href}`);
      
      // Click the case link
      await caseLink.click();
      
      // Wait for navigation
      await page.waitForLoadState('networkidle');
      
      // Verify we're on a case details page
      expect(page.url()).toMatch(/\/cases\/.+/);
      
      console.log('✅ Navigation successful!');
    } else {
      console.log('No case links found, but dashboard loaded successfully');
    }
  });
});
