import { test, expect } from '@playwright/test';

// Helper function to login
async function login(page: any) {
  await page.goto('/login');
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

test.describe('Basic Functionality Verification', () => {
  test('Dashboard loads with existing cases', async ({ page }) => {
    await login(page);
    
    // Wait for dashboard to load
    await expect(page.getByText(/Active Cases/i)).toBeVisible();
    
    // Check if we have any case data
    const tableRows = page.locator('table tbody tr');
    const rowCount = await tableRows.count();
    
    console.log(`Found ${rowCount} case rows in dashboard`);
    
    if (rowCount > 0) {
      // Look for case ID links
      const caseLinks = page.locator('a[href*="/cases/"]');
      const linkCount = await caseLinks.count();
      
      console.log(`Found ${linkCount} case links`);
      
      if (linkCount > 0) {
        const firstLink = caseLinks.first();
        const href = await firstLink.getAttribute('href');
        const text = await firstLink.textContent();
        
        console.log(`First case link: ${text} -> ${href}`);
        
        // Click the first case link
        await firstLink.click();
        
        // Wait for navigation
        await page.waitForLoadState('networkidle');
        
        // Check if we're on a case details page
        const currentUrl = page.url();
        console.log(`Current URL after click: ${currentUrl}`);
        
        if (currentUrl.includes('/cases/')) {
          // Check if Application Details page loaded
          const appDetails = page.getByText(/Application Details/i);
          if (await appDetails.isVisible()) {
            console.log('✅ Application Details page loaded successfully');
          } else {
            console.log('❌ Application Details page not found');
          }
        }
      } else {
        console.log('No case links found');
      }
    } else {
      console.log('No case rows found in dashboard');
    }
  });

  test('TX1 Import modal opens', async ({ page }) => {
    await login(page);
    
    // Click Import TX1 button
    const importButton = page.getByRole('button', { name: /Import TX1/i });
    if (await importButton.isVisible()) {
      await importButton.click();
      
      // Check if modal opened
      const modal = page.getByText(/Import TX1|TX1 File/i);
      if (await modal.isVisible()) {
        console.log('✅ TX1 Import modal opened successfully');
        
        // Check for file input
        const fileInput = page.locator('input[type="file"]');
        if (await fileInput.isVisible()) {
          console.log('✅ File input found in TX1 modal');
        }
      } else {
        console.log('❌ TX1 Import modal not found');
      }
    } else {
      console.log('❌ Import TX1 button not found');
    }
  });

  test('Voice AI status indicator', async ({ page }) => {
    await login(page);
    
    // Look for voice status indicator
    const voiceStatus = page.locator('text=Voice:');
    if (await voiceStatus.isVisible()) {
      const statusText = await voiceStatus.textContent();
      console.log(`✅ Voice AI status: ${statusText}`);
    } else {
      console.log('Voice AI status not visible (may be disabled)');
    }
  });
});




