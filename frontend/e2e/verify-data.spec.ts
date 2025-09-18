import { test, expect } from '@playwright/test';

// Helper function to login
async function login(page: any) {
  await page.goto('/login');
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

test.describe('Verify Data Structure', () => {
  test('Check case data and links', async ({ page }) => {
    // Listen to all console logs and errors
    page.on('console', msg => {
      console.log(`Browser ${msg.type()}: ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
      console.log(`Page error: ${error.message}`);
    });
    
    await login(page);
    
    // Wait for dashboard to load
    await expect(page.getByText(/Active Cases/i)).toBeVisible();
    
    // Wait for cases to load
    await page.waitForTimeout(3000);
    
    // Check if table has rows
    const tableRows = page.locator('table tbody tr');
    const rowCount = await tableRows.count();
    console.log(`Table rows found: ${rowCount}`);
    
    if (rowCount > 0) {
      // Get the first row content
      const firstRow = tableRows.first();
      const rowText = await firstRow.textContent();
      console.log(`First row: ${rowText}`);
      
      // Check for links in the first row
      const linksInRow = firstRow.locator('a');
      const linkCount = await linksInRow.count();
      console.log(`Links in first row: ${linkCount}`);
      
      if (linkCount > 0) {
        const firstLink = linksInRow.first();
        const href = await firstLink.getAttribute('href');
        const linkText = await firstLink.textContent();
        const testId = await firstLink.getAttribute('data-testid');
        
        console.log(`First link: "${linkText}" -> ${href} (testid: ${testId})`);
      }
      
      // Check for specific case ID patterns
      const caseIdLinks = page.locator('a[data-testid^="case-link-"]');
      const caseIdLinkCount = await caseIdLinks.count();
      console.log(`Case ID links found: ${caseIdLinkCount}`);
      
      if (caseIdLinkCount > 0) {
        const firstCaseLink = caseIdLinks.first();
        const caseId = await firstCaseLink.textContent();
        console.log(`First case ID link: ${caseId}`);
        
        // Try clicking it
        await firstCaseLink.click();
        await page.waitForLoadState('networkidle');
        
        const currentUrl = page.url();
        console.log(`Navigated to: ${currentUrl}`);
        
        // Check if Application Details loaded
        const appDetailsTitle = page.getByTestId('app-details-title');
        if (await appDetailsTitle.isVisible()) {
          console.log('✅ Application Details loaded successfully');
        } else {
          console.log('❌ Application Details not found');
        }
      }
    }
  });
});
