// Comprehensive TX1 XML parser for ACORD standard
export type Tx1 = Record<string, any>;

export function parseTx1(xml: string): Tx1 {
  if (!xml || xml.trim() === "") {
    return {
      policy: {},
      insured: {},
      child: {},
      owner: {},
      payor: {},
      beneficiary: {}
    };
  }

  const doc = new DOMParser().parseFromString(xml, "text/xml");

  const pick = (q: string) => {
    const element = doc.querySelector(q);
    return element?.textContent?.trim() || "Not Applicable";
  };
  
  const attr = (q: string, a: string) => {
    const element = doc.querySelector(q);
    return element?.getAttribute(a) || "";
  };

  const pickAll = (q: string) => {
    const elements = doc.querySelectorAll(q);
    return Array.from(elements).map(el => el.textContent?.trim() || "");
  };

  // Policy Information
  const policy = {
    productCode: pick("Policy > ProductCode"),
    planName: pick("Policy > PlanName"),
    shortName: pick("Policy > ShortName"),
    status: pick("Policy > PolicyStatus"),
    faceAmount: pick("Policy > Life > FaceAmt"),
    deathBenefitOption: pick('Policy > Life > Coverage > DeathBenefitOptType'),
    underwritingClass: pick('Policy > Life > Coverage > CovOption > UnderwritingClass'),
    trackingId: pick("Policy > ApplicationInfo > TrackingID"),
    appJurisdiction: pick("Policy > ApplicationInfo > ApplicationJurisdiction"),
    formNumber: pick("FormInstance > ProviderFormNumber"),
    applicationDate: pick("Policy > ApplicationInfo > ApplicationCollectionDate"),
    quoteId: pick("Policy > ApplicationInfo > OLifEExtension > QuoteID"),
    quoteDate: pick("Policy > ApplicationInfo > OLifEExtension > QuoteDate"),
  };

  // Helper function to get party data by ID
  const getPartyData = (partyId: string) => {
    const base = `Party[id='${partyId}']`;
    const name = `${pick(`${base} > Person > FirstName`)} ${pick(`${base} > Person > LastName`)}`.trim();
    
    return {
      name: name || "Not Applicable",
      firstName: pick(`${base} > Person > FirstName`),
      lastName: pick(`${base} > Person > LastName`),
      gender: pick(`${base} > Person > Gender`),
      dob: pick(`${base} > Person > BirthDate`),
      age: pick(`${base} > Person > Age`),
      ssn: pick(`${base} > GovtIDInfo > GovtID`),
      occupation: pick(`${base} > Employment > Occupation`),
      householdIncome: pick(`${base} > Person > OLifEExtension > HouseholdIncome`) || pick(`${base} > OLifEExtension > HouseholdIncome`),
      personalIncome: pick(`${base} > Person > NetIncomeAmt`),
      phone: `${pick(`${base} > Phone > AreaCode`)}-${pick(`${base} > Phone > DialNumber`)}`.replace(/^Not Applicable-Not Applicable$/, "Not Applicable"),
      email: pick(`${base} > EMailAddress > AddrLine`),
      address: {
        line1: pick(`${base} > Address > Line1`),
        line2: pick(`${base} > Address > Line2`),
        city: pick(`${base} > Address > City`),
        state: pick(`${base} > Address > AddressStateTC`),
        zip: pick(`${base} > Address > Zip`),
        country: "US"
      }
    };
  };

  // Primary Insured (Party_PI_1)
  const insured = getPartyData("Party_PI_1");

  // Child Insured (Party_Child_1)
  const child = getPartyData("Party_Child_1");

  // Owner (usually same as insured in this case)
  const owner = getPartyData("Party_PI_1");

  // Payor (if different from owner)
  const payor = getPartyData("Party_PI_1"); // Default to same as owner

  // Beneficiary (if present)
  const beneficiary = getPartyData("Party_PI_1"); // Default to same as owner

  return { 
    policy, 
    insured, 
    child, 
    owner, 
    payor, 
    beneficiary 
  };
}
