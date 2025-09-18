import { test, expect } from './setup';

test.describe('Application Details - Direct Navigation', () => {
  test('Application Details page loads correctly', async ({ page }) => {
    // Navigate directly to a case details page
    await page.goto('/cases/CS-2024-001');
    
    // Check if the page loads without errors
    await expect(page.getByTestId('app-details-title')).toBeVisible();
    await expect(page.getByTestId('app-details-caseid')).toContainText('CS-2024-001');
    
    // Check if the page has the expected structure
    await expect(page.locator('text=Application Details')).toBeVisible();
    await expect(page.locator('text=Order Lab')).toBeVisible();
  });

  test('Application Details page handles invalid case ID', async ({ page }) => {
    // Navigate to a non-existent case
    await page.goto('/cases/invalid-case-id');
    
    // Should show error message
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test('Application Details page has proper navigation', async ({ page }) => {
    // Navigate to a case details page
    await page.goto('/cases/CS-2024-001');
    
    // Check if back link exists
    await expect(page.locator('text=← Back')).toBeVisible();
    
    // Click back button
    await page.locator('button:has-text("← Back")').click();
    
    // Should navigate back to dashboard
    await expect(page).toHaveURL('/dashboard');
  });
});
