import { XMLParser } from 'fast-xml-parser';

export type AppDetails = {
  case: {
    zinniaCaseId?: string;
    policyNumber?: string;
    productType?: string;
    planName?: string;
    paymentMode?: string;
    faceAmount?: number | string;
    applicationJurisdiction?: string;
    deathBenefit?: string;
    rateClass?: string;
  };
  insured?: PersonBlock;
  owner?: PersonBlock;
  payor?: PersonBlock;
  beneficiary?: Partial<PersonBlock>;
  secondaryAddress?: Address;
  lifeInsuranceHistory?: Record<string, unknown>;
  nonMedical?: Record<string, unknown>;
  medical?: Record<string, unknown>;
  premiumMode?: {
    amount?: string;
    frequency?: string;
    comments?: string;
  };
};

type Address = {
  line1?: string; line2?: string; city?: string; state?: string; zip?: string; country?: string;
};
type PersonBlock = {
  firstName?: string; middleName?: string; lastName?: string; gender?: string; dob?: string; ssn?: string;
  address?: Address;
  employment?: { occupation?: string; householdIncome?: string; personalIncome?: string };
  contact?: { email?: string; mobile?: string };
};

export function tx1ToApp(xml: string): AppDetails {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
  const root = parser.parse(xml);

  // nudge helper to navigate ACORD safely
  const req = root?.TXLife?.TXLifeRequest;
  const oLife = req?.OLifE ?? {};
  const holding = (Array.isArray(oLife.Holding) ? oLife.Holding : [oLife.Holding]).find((h:any)=>h?.id==="Holding_1") || {};
  const policy = holding?.Policy ?? {};
  const life = policy?.Life ?? {};
  const coverage = Array.isArray(life?.Coverage) ? life?.Coverage?.[0] : life?.Coverage;

  const parties = Array.isArray(oLife.Party) ? oLife.Party : [oLife.Party];
  const byId: Record<string, any> = {};
  for (const p of parties.filter(Boolean)) byId[p.id] = p;

  // role → party mapping from LifeParticipant
  const lp = Array.isArray(coverage?.LifeParticipant) ? coverage.LifeParticipant : [coverage?.LifeParticipant];
  const getPartyByRole = (roleTc: string) => {
    const hit = lp?.find((r:any)=> String(r?.LifeParticipantRoleCode?.tc) === roleTc);
    return hit?.PartyID ? byId[hit.PartyID] : undefined;
  };

  const mapPerson = (party:any): PersonBlock | undefined => {
    if (!party) return;
    const person = party.Person ?? {};
    const addr = Array.isArray(party.Address) ? party.Address[0] : party.Address;
    const phone = Array.isArray(party.Phone) ? party.Phone.find((p:any)=>p.PhoneTypeCode?.tc==="12") : party.Phone;
    const email = Array.isArray(party.EMailAddress) ? party.EMailAddress[0] : party.EMailAddress;

    return {
      firstName: person.FirstName, middleName: person.MiddleName, lastName: person.LastName,
      gender: person.Gender?.['#text'] || person.Gender, dob: person.BirthDate,
      ssn: (Array.isArray(party.GovtIDInfo) ? party.GovtIDInfo[0] : party.GovtIDInfo)?.GovtID,
      address: addr ? {
        line1: addr.Line1, line2: addr.Line2, city: addr.City,
        state: addr.AddressStateTC?.['#text'] || addr.AddressStateTC, zip: addr.Zip, country: 'United States',
      } : undefined,
      employment: {
        occupation: party.Employment?.Occupation,
        householdIncome: party.Person?.OLifEExtension?.HouseholdIncome,
        personalIncome: party.Person?.NetIncomeAmt
      },
      contact: {
        email: email?.AddrLine,
        mobile: phone ? `${phone.AreaCode ?? ''}${phone.DialNumber ?? ''}`.trim() : undefined,
      }
    };
  };

  return {
    case: {
      zinniaCaseId: policy?.ApplicationInfo?.TrackingID,
      policyNumber: policy?.PolNumber,
      productType: policy?.ProductType?.['#text'] || policy?.ProductType,
      planName: policy?.PlanName || policy?.ShortName,
      paymentMode: policy?.PaymentMode?.['#text'] || policy?.PaymentMode,
      faceAmount: life?.FaceAmt || coverage?.CurrentAmt,
      applicationJurisdiction: policy?.ApplicationInfo?.ApplicationJurisdiction?.['#text'],
      deathBenefit: coverage?.DeathBenefitOptType?.['#text'],
      rateClass: (coverage?.CovOption?.UnderwritingClass?.['#text'])
    },
    insured: mapPerson(getPartyByRole('1')),  // Primary Insured
    owner:   mapPerson(getPartyByRole('18')),
    payor:   mapPerson(getPartyByRole('12')),
    // other blocks can be filled as required
  };
}
