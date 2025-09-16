import { test, expect } from '@playwright/test';
import { clickFirst, expectVisible } from './utils/robust';

test('Dashboard → Case → Application Details → ExamOne popup', async ({ page }) => {
  // Mock TX1 XML data
  const mockTx1Xml = `<?xml version="1.0" encoding="UTF-8"?>
<TXLife xmlns="http://ACORD.org/Standards/Life/2" Version="2.10.00">
  <TXLifeRequest PrimaryObjectID="Holding_1">
    <OLifE>
      <Holding id="Holding_1">
        <Policy id="Policy1">
          <PolNumber>PN-12345</PolNumber>
          <ApplicationInfo>
            <TrackingID>CS-TX1-TEST</TrackingID>
            <ApplicationJurisdiction tc="CA">California</ApplicationJurisdiction>
          </ApplicationInfo>
          <ProductType tc="UL">Universal Life</ProductType>
          <ShortName>SecureUL</ShortName>
          <PolicyStatus>Active</PolicyStatus>
          <Life>
            <FaceAmt>500000</FaceAmt>
            <Coverage>
              <LifeParticipant id="LP1">
                <LifeParticipantRoleCode tc="1">Primary Insured</LifeParticipantRoleCode>
                <PartyID>Party_PI_1</PartyID>
              </LifeParticipant>
              <DeathBenefitOptType tc="INCREASING">Increasing</DeathBenefitOptType>
              <CovOption>
                <UnderwritingClass tc="7">Preferred Plus</UnderwritingClass>
              </CovOption>
            </Coverage>
          </Life>
        </Policy>
      </Holding>
      <Party id="Party_PI_1">
        <Person>
          <FirstName>John</FirstName>
          <LastName>Doe</LastName>
          <Gender tc="1">Male</Gender>
          <BirthDate>1980-01-15</BirthDate>
          <Age>43</Age>
        </Person>
        <GovtIDInfo>
          <GovtID>123-45-6789</GovtID>
        </GovtIDInfo>
        <Employment>
          <Occupation>Software Engineer</Occupation>
        </Employment>
        <Person>
          <OLifEExtension>
            <HouseholdIncome>120000</HouseholdIncome>
          </OLifEExtension>
        </Person>
        <Address AddressTypeCode="1">
          <Line1>123 Main St</Line1>
          <Line2>Apt 4B</Line2>
          <City>San Francisco</City>
          <AddressStateTC tc="CA">California</AddressStateTC>
          <Zip>94102</Zip>
        </Address>
        <Phone PhoneTypeCode="12">
          <AreaCode>415</AreaCode>
          <DialNumber>5551234</DialNumber>
        </Phone>
        <EMailAddress>
          <AddrLine>john.doe@example.com</AddrLine>
        </EMailAddress>
      </Party>
    </OLifE>
  </TXLifeRequest>
</TXLife>`;

  // Inject TX1 XML into window object
  await page.addInitScript((xml) => {
    (window as any).__TX1_XML = xml;
  }, mockTx1Xml);

  await page.goto('/');
  
  // Navigate to case (self-healing: try multiple selectors)
  await clickFirst(page, ['[data-testid="case-link"]', 'a:has-text("CS-TX1")', 'a[href*="/cases/"]']);

  // Application Details sections present (self-healing)
  await expectVisible(page, ['h2:has-text("Case Setup")', 'text=Case Setup']);
  await expectVisible(page, ['h2:has-text("Insured")', 'text=Insured']);

  // Verify data is populated from TX1
  await expect(page.locator('text=John Doe')).toBeVisible();
  await expect(page.locator('text=Software Engineer')).toBeVisible();
  await expect(page.locator('text=San Francisco')).toBeVisible();

  // Edit/Save one field (self-healing)
  await clickFirst(page, ['section:has(h2:has-text("Insured")) button:has-text("Edit")', 'button:has-text("Edit")']);
  await page.getByLabel('Email Address').fill('antoinawynn@gmail.com');
  await clickFirst(page, ['section:has(h2:has-text("Insured")) button:has-text("Save")', 'button:has-text("Save")']);
  await expect(page.getByText('antoinawynn@gmail.com')).toBeVisible();

  // ExamOne popup opens (self-healing)
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    clickFirst(page, ['section:has(h2:has-text("Premium Mode")) button:has-text("Lab / ExamOne")', 'button:has-text("Lab / ExamOne")'])
  ]);
  await popup.waitForLoadState('domcontentloaded');
  await expect(popup).toHaveURL(/\/examone\/order/);

  // Back to dashboard (self-healing)
  await page.bringToFront();
  await clickFirst(page, ['button:has-text("Back")', 'a[href="/"]', 'a:has-text("Dashboard")']);
  await expectVisible(page, ['text=Dashboard', 'h1:has-text("Dashboard")']);
});

test('TX1 parsing and data population', async ({ page }) => {
  const mockTx1Xml = `<?xml version="1.0" encoding="UTF-8"?>
<TXLife xmlns="http://ACORD.org/Standards/Life/2" Version="2.10.00">
  <TXLifeRequest PrimaryObjectID="Holding_1">
    <OLifE>
      <Holding id="Holding_1">
        <Policy id="Policy1">
          <PolNumber>PN-67890</PolNumber>
          <ApplicationInfo>
            <TrackingID>CS-TX1-PARSE-TEST</TrackingID>
            <ApplicationJurisdiction tc="NY">New York</ApplicationJurisdiction>
          </ApplicationInfo>
          <ProductType tc="WL">Whole Life</ProductType>
          <ShortName>SecureWL</ShortName>
          <Life>
            <FaceAmt>1000000</FaceAmt>
            <Coverage>
              <LifeParticipant id="LP1">
                <LifeParticipantRoleCode tc="1">Primary Insured</LifeParticipantRoleCode>
                <PartyID>Party_PI_1</PartyID>
              </LifeParticipant>
              <DeathBenefitOptType tc="LEVEL">Level</DeathBenefitOptType>
            </Coverage>
          </Life>
        </Policy>
      </Holding>
      <Party id="Party_PI_1">
        <Person>
          <FirstName>Jane</FirstName>
          <LastName>Smith</LastName>
          <Gender tc="2">Female</Gender>
          <BirthDate>1985-05-20</BirthDate>
          <Age>38</Age>
        </Person>
        <GovtIDInfo>
          <GovtID>987-65-4321</GovtID>
        </GovtIDInfo>
        <Employment>
          <Occupation>Doctor</Occupation>
        </Employment>
        <Person>
          <OLifEExtension>
            <HouseholdIncome>200000</HouseholdIncome>
          </OLifEExtension>
        </Person>
        <Address AddressTypeCode="1">
          <Line1>456 Oak Ave</Line1>
          <City>New York</City>
          <AddressStateTC tc="NY">New York</AddressStateTC>
          <Zip>10001</Zip>
        </Address>
        <Phone PhoneTypeCode="12">
          <AreaCode>212</AreaCode>
          <DialNumber>5559876</DialNumber>
        </Phone>
        <EMailAddress>
          <AddrLine>jane.smith@example.com</AddrLine>
        </EMailAddress>
      </Party>
    </OLifE>
  </TXLifeRequest>
</TXLife>`;

  await page.addInitScript((xml) => {
    (window as any).__TX1_XML = xml;
  }, mockTx1Xml);

  await page.goto('/cases/CS-TX1-PARSE-TEST');

  // Verify parsed data appears correctly
  await expect(page.locator('text=Jane Smith')).toBeVisible();
  await expect(page.locator('text=Doctor')).toBeVisible();
  await expect(page.locator('text=New York')).toBeVisible();
  await expect(page.locator('text=CS-TX1-PARSE-TEST')).toBeVisible();
  await expect(page.locator('text=Whole Life')).toBeVisible();
  await expect(page.locator('text=Level')).toBeVisible();
  
  // Verify currency formatting
  await expect(page.locator('text=$1,000,000')).toBeVisible();
  await expect(page.locator('text=$200,000')).toBeVisible();
});
