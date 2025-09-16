import { test, expect } from '@playwright/test';

// Helper function to login
async function login(page: any) {
  await page.goto('/login');
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

test.describe('Debug Dashboard', () => {
  test('Debug dashboard content', async ({ page }) => {
    await login(page);
    
    // Wait for dashboard to load
    await expect(page.getByText(/Active Cases/i)).toBeVisible();
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-dashboard.png' });
    
    // Log all links on the page
    const allLinks = page.locator('a');
    const linkCount = await allLinks.count();
    console.log(`Total links found: ${linkCount}`);
    
    for (let i = 0; i < linkCount; i++) {
      const link = allLinks.nth(i);
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      console.log(`Link ${i}: "${text}" -> ${href}`);
    }
    
    // Log all buttons on the page
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    console.log(`Total buttons found: ${buttonCount}`);
    
    for (let i = 0; i < buttonCount; i++) {
      const button = allButtons.nth(i);
      const text = await button.textContent();
      console.log(`Button ${i}: "${text}"`);
    }
    
    // Check table content
    const tableRows = page.locator('table tbody tr');
    const rowCount = await tableRows.count();
    console.log(`Table rows found: ${rowCount}`);
    
    if (rowCount > 0) {
      const firstRow = tableRows.first();
      const rowText = await firstRow.textContent();
      console.log(`First row content: ${rowText}`);
    }
    
    // Check for specific case IDs
    const caseIdElements = page.locator('text=CS-2024-001');
    const caseIdCount = await caseIdElements.count();
    console.log(`CS-2024-001 elements found: ${caseIdCount}`);
    
    // Check for Import TX1 button
    const importButtons = page.locator('button:has-text("Import TX1")');
    const importButtonCount = await importButtons.count();
    console.log(`Import TX1 buttons found: ${importButtonCount}`);
    
    // Check for Voice status
    const voiceElements = page.locator('text=Voice:');
    const voiceCount = await voiceElements.count();
    console.log(`Voice status elements found: ${voiceCount}`);
  });
});



