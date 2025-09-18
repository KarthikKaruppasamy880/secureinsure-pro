import { test, expect, Page } from '@playwright/test';

// Helper function to wait for application to be ready
async function waitForAppReady(page: Page) {
  // Wait for the React app to load
  await page.waitForFunction(() => {
    return document.querySelector('#root')?.children.length > 0;
  }, { timeout: 30000 });
  
  // Wait for any loading indicators to disappear
  await page.waitForFunction(() => {
    const loadingElements = document.querySelectorAll('[data-testid*="loading"], .loading, .spinner');
    return loadingElements.length === 0;
  }, { timeout: 10000 });
}

// Helper function to handle login
async function performLogin(page: Page) {
  try {
    // Check if already logged in
    const dashboard = page.locator('[data-testid="dashboard"]');
    if (await dashboard.isVisible({ timeout: 2000 })) {
      return true;
    }

    // Navigate to login page
    await page.goto('/login');
    await waitForAppReady(page);

    // Fill login form
    const username = page.locator('[data-testid="username"]');
    const password = page.locator('[data-testid="password"]');
    const loginButton = page.locator('[data-testid="login-button"]');

    await expect(username).toBeVisible({ timeout: 10000 });
    await expect(password).toBeVisible({ timeout: 10000 });
    await expect(loginButton).toBeVisible({ timeout: 10000 });

    await username.fill('admin');
    await password.fill('admin123');
    await loginButton.click();

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await waitForAppReady(page);

    return true;
  } catch (error) {
    console.log('Login failed:', error);
    return false;
  }
}

// Helper function to find case links with multiple strategies
async function findCaseLink(page: Page) {
  const strategies = [
    () => page.locator('[data-testid^="case-link-"]').first(),
    () => page.locator('a[href*="/cases/"]').first(),
    () => page.locator('a[href*="/case/"]').first(),
    () => page.locator('tr').filter({ hasText: 'CS-' }).locator('a').first(),
    () => page.locator('td').filter({ hasText: 'CS-' }).locator('a').first(),
    () => page.locator('a').filter({ hasText: 'CS-' }).first()
  ];

  for (const strategy of strategies) {
    try {
      const element = strategy();
      if (await element.isVisible({ timeout: 2000 })) {
        return element;
      }
    } catch (error) {
      // Try next strategy
    }
  }

  throw new Error('No case link found with any strategy');
}

// Test 1: Dashboard loads and shows case links
test('Dashboard loads with case links', async ({ page }) => {
  await page.goto('/dashboard');
  await waitForAppReady(page);

  // Check for dashboard title
  const title = page.locator('h1').filter({ hasText: 'Welcome back' });
  await expect(title).toBeVisible({ timeout: 10000 });

  // Find and verify case links exist
  const caseLink = await findCaseLink(page);
  await expect(caseLink).toBeVisible({ timeout: 10000 });
  
  // Verify the link has proper href
  const href = await caseLink.getAttribute('href');
  expect(href).toMatch(/\/cases\/|case\//);
});

// Test 2: Click case ID navigates to Application Details
test('Case ID click navigates to Application Details', async ({ page }) => {
  await page.goto('/dashboard');
  await waitForAppReady(page);

  // Find case link
  const caseLink = await findCaseLink(page);
  const href = await caseLink.getAttribute('href');
  
  // Click the case link
  await caseLink.click();
  
  // Wait for navigation
  await page.waitForURL(href!, { timeout: 15000 });
  await waitForAppReady(page);

  // Verify Application Details page loaded
  const appTitle = page.locator('[data-testid="app-details-title"]');
  await expect(appTitle).toBeVisible({ timeout: 10000 });
  
  const caseId = page.locator('[data-testid="app-details-caseid"]');
  await expect(caseId).toBeVisible({ timeout: 10000 });
});

// Test 3: Application Details shows sections
test('Application Details shows all sections', async ({ page }) => {
  await page.goto('/cases/CS-TX1-1757444260432');
  await waitForAppReady(page);

  // Check for main title
  const appTitle = page.locator('[data-testid="app-details-title"]');
  await expect(appTitle).toBeVisible({ timeout: 10000 });

  // Check for case ID
  const caseId = page.locator('[data-testid="app-details-caseid"]');
  await expect(caseId).toBeVisible({ timeout: 10000 });

  // Check for sections
  const sections = [
    'sec-case-setup',
    'sec-insured',
    'sec-owner',
    'sec-payor',
    'sec-beneficiary'
  ];

  for (const section of sections) {
    const sectionElement = page.locator(`[data-testid="${section}"]`);
    await expect(sectionElement).toBeVisible({ timeout: 5000 });
  }
});

// Test 4: Edit functionality works
test('Edit functionality works', async ({ page }) => {
  await page.goto('/cases/CS-TX1-1757444260432');
  await waitForAppReady(page);

  // Find first edit button
  const editButton = page.locator('button').filter({ hasText: 'Edit' }).first();
  await expect(editButton).toBeVisible({ timeout: 10000 });
  
  // Click edit
  await editButton.click();
  
  // Verify save/cancel buttons appear
  const saveButton = page.locator('button').filter({ hasText: 'Save' });
  const cancelButton = page.locator('button').filter({ hasText: 'Cancel' });
  
  await expect(saveButton).toBeVisible({ timeout: 5000 });
  await expect(cancelButton).toBeVisible({ timeout: 5000 });
});

// Test 5: ExamOne popup opens
test('ExamOne popup opens', async ({ page }) => {
  await page.goto('/cases/CS-TX1-1757444260432');
  await waitForAppReady(page);

  // Find Premium Mode section (where Lab/ExamOne button is located)
  const premiumSection = page.locator('[data-testid="sec-premium-mode"]');
  await expect(premiumSection).toBeVisible({ timeout: 10000 });

  // Find Lab/ExamOne button
  const labButton = page.locator('[data-testid="lab-order"]');
  await expect(labButton).toBeVisible({ timeout: 10000 });

  // Set up popup listener
  const popupPromise = page.context().waitForEvent('page');
  
  // Click lab button
  await labButton.click();
  
  // Wait for popup
  const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded');
  
  // Verify popup opened
  expect(popup.url()).toContain('/examone/result');
  
  // Close popup
  await popup.close();
});

// Test 6: Back button works
test('Back button navigates to dashboard', async ({ page }) => {
  await page.goto('/cases/CS-TX1-1757444260432');
  await waitForAppReady(page);

  // Find back button
  const backButton = page.locator('button').filter({ hasText: '← Back' });
  await expect(backButton).toBeVisible({ timeout: 10000 });
  
  // Click back button
  await backButton.click();
  
  // Verify navigation to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  
  // Verify dashboard loaded
  const dashboardTitle = page.locator('h1').filter({ hasText: 'Welcome back' });
  await expect(dashboardTitle).toBeVisible({ timeout: 10000 });
});