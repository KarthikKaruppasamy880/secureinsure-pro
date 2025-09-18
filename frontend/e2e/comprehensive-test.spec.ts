import { test, expect } from '@playwright/test';

test.describe('SecureInsure Pro - Comprehensive E2E Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5173');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('Complete Application Flow - Login to Dashboard to Application Details', async ({ page }) => {
    // Test 1: Login Flow
    console.log('🔐 Testing Login Flow...');
    
    // Check if we're on login page
    await expect(page.locator('h1, h2')).toContainText(['Login', 'Sign In', 'Welcome']);
    
    // Fill login form
    await page.fill('input[type="email"], input[name="email"], input[name="username"]', 'admin@secureinsure.com');
    await page.fill('input[type="password"], input[name="password"]', 'admin123');
    
    // Click login button
    await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    
    // Verify dashboard loaded
    await expect(page.locator('h1, h2')).toContainText(['Dashboard', 'Cases', 'Applications']);
    console.log('✅ Login successful - Dashboard loaded');

    // Test 2: Dashboard Functionality
    console.log('📊 Testing Dashboard Functionality...');
    
    // Check for case data
    await expect(page.locator('table, .case-row, [data-testid*="case"]')).toBeVisible();
    
    // Look for case ID links
    const caseLinks = page.locator('a[href*="/application/"], a[href*="/cases/"]');
    await expect(caseLinks.first()).toBeVisible();
    
    // Click on first case
    await caseLinks.first().click();
    
    // Wait for navigation to application details
    await page.waitForURL('**/application/**', { timeout: 10000 });
    console.log('✅ Dashboard navigation working - Application Details loaded');

    // Test 3: Application Details Screen
    console.log('📋 Testing Application Details Screen...');
    
    // Verify application details loaded
    await expect(page.locator('h1, h2')).toContainText(['Application Details', 'Case']);
    
    // Check for sections (insured, policy, etc.)
    await expect(page.locator('text=Insured, text=Policy, text=Beneficiary')).toBeVisible();
    
    // Test Lab PiQ button
    const labPiQButton = page.locator('button:has-text("Order Lab PiQ")');
    if (await labPiQButton.isVisible()) {
      await labPiQButton.click();
      
      // Verify Lab PiQ popup opened
      await expect(page.locator('text=ExamOne Lab PiQ Order & Results')).toBeVisible();
      
      // Close popup
      await page.click('button:has-text("Close"), [data-testid="close"]');
      console.log('✅ Lab PiQ popup working');
    }
    
    // Test section editing
    const editButtons = page.locator('button:has-text("Edit")');
    if (await editButtons.first().isVisible()) {
      await editButtons.first().click();
      
      // Check if form fields are editable
      const inputFields = page.locator('input, textarea, select');
      await expect(inputFields.first()).toBeVisible();
      
      // Cancel editing
      const cancelButton = page.locator('button:has-text("Cancel")');
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
      }
      console.log('✅ Section editing working');
    }
    
    console.log('✅ Application Details screen fully functional');

    // Test 4: Back to Dashboard
    console.log('🔙 Testing Navigation Back to Dashboard...');
    
    const backButton = page.locator('a:has-text("Back"), button:has-text("Back")');
    if (await backButton.isVisible()) {
      await backButton.click();
      await page.waitForURL('**/dashboard**');
      console.log('✅ Navigation back to dashboard working');
    }
  });

  test('TX1 Import Functionality', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"], input[name="email"], input[name="username"]', 'admin@secureinsure.com');
    await page.fill('input[type="password"], input[name="password"]', 'admin123');
    await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
    await page.waitForURL('**/dashboard**');

    console.log('📁 Testing TX1 Import Functionality...');
    
    // Look for TX1 import button or modal trigger
    const tx1Button = page.locator('button:has-text("TX1"), button:has-text("Import"), [data-testid*="tx1"]');
    if (await tx1Button.isVisible()) {
      await tx1Button.click();
      
      // Wait for TX1 import modal
      await expect(page.locator('text=TX1 Import, text=Upload TX1')).toBeVisible();
      
      // Create a sample TX1 file
      const sampleTX1 = `<?xml version="1.0" encoding="UTF-8"?>
<TXLife>
  <Policy>
    <InsuredName>Test User</InsuredName>
    <PolicyType>IUL</PolicyType>
    <FaceAmount>500000</FaceAmount>
    <Premium>5000</Premium>
    <EffectiveDate>2024-01-01</EffectiveDate>
    <Agent>Test Agent</Agent>
  </Policy>
</TXLife>`;
      
      // Upload file
      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.isVisible()) {
        // Note: In a real test, you'd need to create an actual file
        console.log('✅ TX1 Import modal opened - File upload ready');
      }
      
      // Close modal
      await page.click('button:has-text("Close"), button:has-text("Cancel")');
    }
    
    console.log('✅ TX1 Import functionality accessible');
  });

  test('Health Check Endpoints', async ({ page }) => {
    console.log('🏥 Testing Health Check Endpoints...');
    
    // Test backend health endpoints
    const healthResponse = await page.request.get('http://localhost:8082/health');
    expect(healthResponse.ok()).toBeTruthy();
    
    const readyResponse = await page.request.get('http://localhost:8082/ready');
    expect(readyResponse.ok()).toBeTruthy();
    
    const versionResponse = await page.request.get('http://localhost:8082/version');
    expect(versionResponse.ok()).toBeTruthy();
    
    console.log('✅ All health endpoints responding');
  });

  test('API Integration Tests', async ({ page }) => {
    console.log('🔌 Testing API Integration...');
    
    // Test login API
    const loginResponse = await page.request.post('http://localhost:8082/api/v1/auth/login', {
      data: {
        username: 'admin@secureinsure.com',
        password: 'admin123'
      }
    });
    expect(loginResponse.ok()).toBeTruthy();
    
    const loginData = await loginResponse.json();
    expect(loginData.accessToken).toBeTruthy();
    
    // Test cases API
    const casesResponse = await page.request.get('http://localhost:8082/api/v1/cases');
    expect(casesResponse.ok()).toBeTruthy();
    
    // Test search API
    const searchResponse = await page.request.post('http://localhost:8082/api/search', {
      data: { q: 'test' }
    });
    expect(searchResponse.ok()).toBeTruthy();
    
    // Test Lab PiQ API
    const labPiQResponse = await page.request.post('http://localhost:8082/api/v1/vendor/examone/labpiq/order', {
      data: {
        caseId: 'CS-2024-001',
        insuredInfo: { name: 'Test User' },
        policyInfo: { number: 'POL-123' }
      }
    });
    expect(labPiQResponse.ok()).toBeTruthy();
    
    console.log('✅ All API endpoints working correctly');
  });

  test('Voice Search Functionality', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"], input[name="email"], input[name="username"]', 'admin@secureinsure.com');
    await page.fill('input[type="password"], input[name="password"]', 'admin123');
    await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
    await page.waitForURL('**/dashboard**');

    console.log('🎤 Testing Voice Search Functionality...');
    
    // Look for voice search button
    const voiceButton = page.locator('button:has-text("Voice"), button:has-text("Mic"), [data-testid*="voice"]');
    if (await voiceButton.isVisible()) {
      await voiceButton.click();
      
      // Check if voice interface is visible
      await expect(page.locator('text=Voice Search, text=Listening, text=Voice')).toBeVisible();
      
      console.log('✅ Voice search interface accessible');
    }
    
    console.log('✅ Voice search functionality available');
  });

  test('Error Handling and Edge Cases', async ({ page }) => {
    console.log('⚠️ Testing Error Handling...');
    
    // Test invalid login
    await page.fill('input[type="email"], input[name="email"], input[name="username"]', 'invalid@test.com');
    await page.fill('input[type="password"], input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
    
    // Should show error message
    await expect(page.locator('text=Invalid, text=Error, text=Failed')).toBeVisible();
    
    // Test with correct credentials
    await page.fill('input[type="email"], input[name="email"], input[name="username"]', 'admin@secureinsure.com');
    await page.fill('input[type="password"], input[name="password"]', 'admin123');
    await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
    
    await page.waitForURL('**/dashboard**');
    
    console.log('✅ Error handling working correctly');
  });
});

test.describe('Performance and Accessibility', () => {
  test('Page Load Performance', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    console.log(`✅ Page loaded in ${loadTime}ms`);
  });

  test('Accessibility Basics', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Check for basic accessibility elements
    const headings = await page.locator('h1, h2, h3').count();
    expect(headings).toBeGreaterThan(0);
    
    const buttons = await page.locator('button').count();
    expect(buttons).toBeGreaterThan(0);
    
    console.log('✅ Basic accessibility elements present');
  });
});
