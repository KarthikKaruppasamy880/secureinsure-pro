import { test, expect } from '@playwright/test';

test('TX1 import populates Application Details V2 and opens ExamOne', async ({ page }) => {
  // 1) import TX1
  await page.request.post('/api/v1/tx1/import', {
    data: { caseId: 'CS-TX1-LOCAL', xml: await (await fetch('http://localhost:3000/fixtures/tx1.xml')).text() }
  });

  // 2) visit
  await page.goto('/cases/CS-TX1-LOCAL');

  // self-healing: wait for one of several anchors
  await Promise.any([
    page.getByText('Application Details').waitFor(),
    page.locator('text=Case Setup').waitFor(),
  ]);

  await expect(page.locator('text=Case Setup')).toBeVisible();

  // ensure mapped values render
  await expect(page.locator('text=Face Amount').locator('..')).toContainText('$');

  // open ExamOne popup
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('button', { name: /Lab \/ ExamOne/i }).click(),
  ]);

  await popup.waitForLoadState('domcontentloaded');
  await expect(popup.locator('text=LabPiQture')).toBeVisible();
});

test('Application Details V2 displays all sections correctly', async ({ page }) => {
  // Mock data for testing
  await page.request.post('/api/v1/tx1/import', {
    data: { 
      caseId: 'CS-TX1-TEST', 
      xml: `<?xml version="1.0" encoding="UTF-8"?>
      <TXLife>
        <TXLifeRequest>
          <OLifE>
            <Holding id="Holding_1">
              <Policy id="Policy1">
                <PolNumber>PN-12345</PolNumber>
                <ApplicationInfo>
                  <TrackingID>CS-TX1-TEST</TrackingID>
                  <ApplicationJurisdiction tc="CA"/>
                </ApplicationInfo>
                <ProductType tc="UL">Universal Life</ProductType>
                <ShortName>SecureUL</ShortName>
                <PaymentMode tc="4">Monthly</PaymentMode>
                <Life>
                  <FaceAmt>500000</FaceAmt>
                  <Coverage>
                    <LifeParticipant id="LP1">
                      <LifeParticipantRoleCode tc="1"/>
                      <PartyID>Party1</PartyID>
                    </LifeParticipant>
                  </Coverage>
                </Life>
              </Policy>
            </Holding>
            <Party id="Party1">
              <Person>
                <FirstName>John</FirstName>
                <LastName>Doe</LastName>
                <Gender tc="1">Male</Gender>
                <BirthDate>1980-01-15</BirthDate>
              </Person>
              <Address AddressTypeCode="1">
                <Line1>123 Main St</Line1>
                <City>Anytown</City>
                <AddressStateTC tc="CA">California</AddressStateTC>
                <Zip>90210</Zip>
              </Address>
            </Party>
          </OLifE>
        </TXLifeRequest>
      </TXLife>`
    }
  });

  await page.goto('/cases/CS-TX1-TEST');

  // Wait for page to load
  await page.waitForLoadState('domcontentloaded');

  // Check all major sections are present
  const sections = [
    'Case Setup',
    'Insured', 
    'Owner',
    'Payor',
    'Beneficiary',
    'Secondary Address',
    'Life Insurance History',
    'Non-Medical Information',
    'Medical Information',
    'Premium Mode'
  ];

  for (const section of sections) {
    await expect(page.locator(`text=${section}`)).toBeVisible();
  }

  // Check that fields are displayed in 2-column layout
  await expect(page.locator('.grid.md\\:grid-cols-2')).toBeVisible();
  
  // Check Lab/ExamOne button is present
  await expect(page.getByRole('button', { name: /Lab \/ ExamOne/i })).toBeVisible();
});

test('ExamOne popup opens and displays results', async ({ page }) => {
  // Mock ExamOne results
  await page.route('/api/v1/examone/results*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'Completed',
        nicotine: 'NEGATIVE',
        action: 'Refer To Underwriter',
        physicians: [],
        drugs: []
      })
    });
  });

  await page.goto('/examone?caseId=CS-TX1-TEST');

  await page.waitForLoadState('domcontentloaded');

  // Check ExamOne results are displayed
  await expect(page.locator('text=LabPiQture (ExamOne) Results')).toBeVisible();
  await expect(page.locator('text=Status:')).toBeVisible();
  await expect(page.locator('text=Completed')).toBeVisible();
  await expect(page.locator('text=Nicotine Test:')).toBeVisible();
  await expect(page.locator('text=NEGATIVE').first()).toBeVisible();
});
