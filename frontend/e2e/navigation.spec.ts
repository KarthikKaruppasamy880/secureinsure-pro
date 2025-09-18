import { test, expect } from '@playwright/test';

test.describe('Dashboard Navigation', () => {
  test('Dashboard → Application Details navigation works', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Wait for dashboard to load
    await expect(page.locator('h1').filter({ hasText: 'Welcome back' })).toBeVisible();
    
    // Wait for cases table to load
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    
    // Find the first case ID link
    const firstCaseLink = page.locator('a[data-testid^="case-link-"]').first();
    await expect(firstCaseLink).toBeVisible();
    
    // Get the case ID from the link
    const caseId = await firstCaseLink.textContent();
    console.log(`Found case ID: ${caseId}`);
    
    // Click the case ID link
    await firstCaseLink.click();
    
    // Verify we're on the Application Details page
    await expect(page).toHaveURL(/\/cases\/.+/);
    await expect(page.locator('[data-testid="app-details-title"]')).toBeVisible();
    
    // Verify case ID is displayed
    await expect(page.locator('[data-testid="app-details-caseid"]')).toBeVisible();
    
    // Verify we can see application sections
    await expect(page.locator('[data-testid="sec-case-setup"]')).toBeVisible();
    
    console.log('✅ Dashboard → Application Details navigation successful');
  });

  test('Application Details page loads with data', async ({ page }) => {
    // Navigate directly to a case
    await page.goto('/cases/CS-2024-001');
    
    // Wait for page to load
    await expect(page.locator('[data-testid="app-details-title"]')).toBeVisible();
    
    // Verify back link exists
    await expect(page.locator('a:has-text("← Back")')).toBeVisible();
    
    // Verify case ID is displayed
    await expect(page.locator('text=Case: CS-2024-001')).toBeVisible();
    
    // Verify sections are loaded (should have at least one section)
    const sections = page.locator('.border.rounded-xl.p-4.bg-white');
    await expect(sections).toHaveCount({ min: 1 });
    
    console.log('✅ Application Details page loads with data');
  });

  test('Application Details edit functionality works', async ({ page }) => {
    // Navigate to a case
    await page.goto('/cases/CS-2024-001');
    
    // Wait for page to load
    await expect(page.locator('[data-testid="app-details-title"]')).toBeVisible();
    
    // Find the first section with an Edit button
    const editButton = page.locator('button:has-text("Edit")').first();
    await expect(editButton).toBeVisible();
    
    // Click Edit
    await editButton.click();
    
    // Verify we're in edit mode (Save and Cancel buttons should appear)
    await expect(page.locator('button:has-text("Save")')).toBeVisible();
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
    
    // Find an input field and modify it
    const inputField = page.locator('input').first();
    await expect(inputField).toBeVisible();
    
    const originalValue = await inputField.inputValue();
    const newValue = originalValue + ' (Modified)';
    
    // Clear and type new value
    await inputField.clear();
    await inputField.fill(newValue);
    
    // Click Save
    await page.locator('button:has-text("Save")').first().click();
    
    // Verify we're back to view mode
    await expect(page.locator('button:has-text("Edit")')).toBeVisible();
    
    console.log('✅ Application Details edit functionality works');
  });
});
