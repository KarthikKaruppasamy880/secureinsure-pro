import { XMLParser } from "fast-xml-parser";

// Minimal helpers for safe reads
const val = (x?: any) => (x ?? "") as string;
const join = (a?: string, b?: string) => [a, b].filter(Boolean).join(" ");

export type TxLife = Record<string, any>;

export function parseTxLifeXml(xml: string): TxLife {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    removeNSPrefix: true,
    // ACORD files mix arrays/singletons; this keeps structure predictable
    isArray: (name) =>
      new Set(["Holding", "Coverage", "LifeParticipant", "Party", "Address", "Phone", "EMailAddress", "Relation"]).has(
        name
      ),
  });
  return parser.parse(xml) as TxLife;
}

/** Pulls the primary insured Party by following LifeParticipant/Relation pointers */
export function extractPrimaryInsured(tx: TxLife) {
  const req = tx?.TXLife?.TXLifeRequest;
  const olife = req?.OLifE ?? {};
  const holding = (olife.Holding || [])[0] ?? {};
  const policy = holding.Policy ?? {};
  const life = policy.Life ?? {};
  const coverage = (life.Coverage || [])[0] ?? {};
  const lp = (coverage.LifeParticipant || []).find(
    (p: any) => p?.LifeParticipantRoleCode?.tc === "1" // Primary Insured
  );

  const primaryPartyId =
    lp?.PartyID ||
    (olife.Relation || []).find((r: any) => r.RelationRoleCode?.tc === "32")?.RelatedObjectID;

  const party = (olife.Party || []).find((p: any) => p.id === primaryPartyId) || {};
  const person = party.Person ?? {};
  const addr = (party.Address || [])[0] ?? {};
  const phone = (party.Phone || [])[0] ?? {};
  const email = (party.EMailAddress || [])[0] ?? {};
  const risk = party.Risk ?? {};
  const employment = party.Employment ?? {};

  return {
    // Case Setup (left)
    "Language of the Application": "Not Applicable", // not in sample
    "Policy Number": val(policy.PolNumber) || "Not Applicable",
    "Application State of Signing": val((policy.ApplicationInfo ?? {}).ApplicationJurisdiction?.tc),
    "Application Signing Date": val((policy.ApplicationInfo ?? {}).ApplicationCollectionDate),
    "Date Received": val((policy.ApplicationInfo ?? {}).ApplicationCollectionDate),
    "Product Type": val(policy.ProductType),
    "Plan Name": val(policy.ShortName || policy.PlanName),
    "Amount of coverage applied for": currency(life.FaceAmt),
    "Restricted View": "No",

    // Case Setup (right)
    "Zinnia Case ID": val((policy.ApplicationInfo ?? {}).HOAppFormNumber),
    "Priority": "Not Applicable",
    "Submission": val((policy.ApplicationInfo ?? {}).SubmissionType) || "eApp",
    "Death Benefit": policy?.Life?.Coverage?.DeathBenefitOptType ? val(policy.Life.Coverage.DeathBenefitOptType) : "Increasing",
    "Life Insurance Qualification Test": "CVAT",
    "Rate Class Applied For": textFromUnderwriting(coverage),
    "Insurance Age Basis": "Not Applicable",
    "Insurance Age Effective Date": "Not Applicable",
    "Group": "Not Applicable",

    // Insured (Personal)
    "Insured Type": "Primary Insured",
    "Name": join(person.FirstName, person.LastName),
    "Date of Birth": val(person.BirthDate),
    "Age": val(person.Age),
    "Country if born outside the U.S.": person.BirthCountry?.tc === "1" ? "United States" : "Not Applicable",
    "U.S. State of Birth": val(person.BirthJurisdictionTC),
    "Gender": person.Gender?.tc === "1" ? "Male" : person.Gender?.tc === "2" ? "Female" : "Not Applicable",
    "SSN": maskSSN((party.GovtIDInfo ?? {}).GovtID || party.GovtID),

    // Insured (Address)
    "Street Address 1": val(addr.Line1),
    "Street Address 2": val(addr.Line2) || "Not Applicable",
    "Country": "United States",
    "State": val(addr.AddressStateTC),
    "City": val(addr.City),
    "Zip": val(addr.Zip),

    // Driving
    "Driver's License Number": val(person.DriversLicenseNum),
    "Issuing State": val(person.DriversLicenseState?.tc),
    "U.S. Passport Number": "Not Applicable",
    "State Issued ID Number": "Not Applicable",

    // Employment & Contact
    "Are you currently employed, a full-time student, or a domestic partner?":
      employment?.OccupClass?.tc ? "Yes" : "Not Applicable",
    "Occupation": val(employment.Occupation),
    "Annual Household Income": currency(person.OLifEExtension?.HouseholdIncome),
    "Personal Annual Income": currency(person.NetIncomeAmt),
    "Mobile Phone": phone ? fmtPhone(phone.AreaCode, phone.DialNumber) : "Not Applicable",
    "Email Address": val(email.AddrLine),

    // Owner / Payor (sample shows self)
    "Owner Name": join(person.FirstName, person.LastName),
    "Owner Relationship to Insured": "Self",
    "Owner Date of Birth": val(person.BirthDate),
    "Owner SSN": maskSSN((party.GovtIDInfo ?? {}).GovtID || party.GovtID),
    "Owner Address": val(addr.Line1),
    "Owner City": val(addr.City),
    "Owner State": val(addr.AddressStateTC),
    "Owner ZIP": val(addr.Zip),

    "Payor Name": join(person.FirstName, person.LastName),
    "Payor Relationship to Insured": "Self",
    "Payor Date of Birth": val(person.BirthDate),
    "Payor SSN": maskSSN((party.GovtIDInfo ?? {}).GovtID || party.GovtID),

    // Premium Mode
    "Premium Payment Frequency": mapPaymentMode(policy.PaymentMode?.tc),
    "Premium Amount": currency(policy.PaymentAmt),

    // Misc used in ExamOne payload
    __internal: {
      firstName: val(person.FirstName),
      lastName: val(person.LastName),
      ssnRaw: (party.GovtIDInfo ?? {}).GovtID || party.GovtID,
    },
  };
}

function textFromUnderwriting(cov: any) {
  const uc = cov?.CovOption?.UnderwritingClass;
  if (!uc) return "Not Applicable";
  const tc = typeof uc === "object" ? uc.tc : undefined;
  switch (tc) {
    case "7":
      return "Elite Non-Tobacco";
    default:
      return val(uc);
  }
}

function mapPaymentMode(tc?: string) {
  switch (tc) {
    case "4":
      return "Monthly";
    case "2":
      return "Quarterly";
    case "1":
      return "Annual";
    default:
      return "Not Applicable";
  }
}

function currency(n?: any) {
  if (!n && n !== 0) return "Not Applicable";
  const v = Number(n);
  return isFinite(v) ? v.toLocaleString(undefined, { style: "currency", currency: "USD" }) : String(n);
}

function maskSSN(ssn?: string) {
  const s = (ssn || "").replace(/[^\d]/g, "");
  if (s.length !== 9) return "Not Applicable";
  return `${s.slice(0,3)}-${s.slice(3,5)}-${s.slice(5)}`;
}

function fmtPhone(area?: string, num?: string) {
  const s = `${area || ""}${num || ""}`.replace(/[^\d]/g, "");
  if (s.length < 10) return "Not Applicable";
  return `(${s.slice(0,3)}) ${s.slice(3,6)}-${s.slice(6,10)}`;
}
