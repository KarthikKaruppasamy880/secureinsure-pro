export const FIELD_DICTIONARY = {
  // Case Setup fields
  "Language of the Application": ["language", "language of application", "uscanada", "us/canada", "us", "uscanada"],
  "Policy Number": ["policy no", "policynumber", "policy number"],
  "Application State of Signing": ["state of signing", "signing state", "state"],
  "Application Signing Date": ["signing date", "signing"],
  "Date Received": ["received date", "date received", "received"],
  "Product Type": ["product type", "product"],
  "Plan Name": ["plan name", "plan"],
  "Amount of coverage applied for": ["face amount", "coverage amount", "face", "coverage"],
  "Restricted View": ["restricted view", "restricted"],
  "Zinnia Case ID": ["zinnia case id", "zinnia id", "zinnia"],
  "Priority": ["priority"],
  "Submission": ["submission"],
  "Death Benefit": ["death benefit", "death"],
  "Life Insurance Qualification Test": ["qualification test", "cvat/mec", "qualification"],
  "Rate Class Applied For": ["rate class", "rate"],
  "Insurance Age Basis": ["age basis", "age"],
  "Insurance Age Effective Date": ["age effective date", "age effective"],
  "Group": ["group"],

  // Insured fields
  "Insured Type": ["insured type", "type"],
  "Name": ["name", "full name"],
  "Date of Birth": ["date of birth", "dob", "birth date"],
  "Age": ["age"],
  "Country if born outside the U.S.": ["country if born outside the u.s.", "birth country", "country"],
  "U.S. State of Birth": ["u.s. state of birth", "state of birth", "birth state"],
  "Gender": ["gender"],
  "SSN": ["ssn", "social security number"],
  "Driver's License Number": ["driver's license number", "license number", "dl number"],
  "Issuing State": ["issuing state", "license state"],
  "U.S. Passport Number": ["u.s. passport number", "passport number", "passport"],
  "State Issued ID Number": ["state issued id number", "state id", "id number"],
  "State": ["state"],
  "Street Address 1": ["street address 1", "address 1", "street 1"],
  "Street Address 2": ["street address 2", "address 2", "street 2"],
  "Country": ["country"],
  "City": ["city"],
  "Zip": ["zip", "zip code", "postal code"],
  "Are you currently employed, a full-time student, or a domestic partner?": ["employment status", "employment", "employed"],
  "Occupation": ["occupation", "job"],
  "Annual Household Income": ["annual household income", "household income", "income"],
  "Personal Annual Income": ["personal annual income", "personal income"],
  "Mobile Phone": ["mobile phone", "mobile", "phone"],
  "Email Address": ["email address", "email"]
};

export function normalizeHeader(str: string): string {
  if (!str) return str;
  
  // Normalize the input
  let normalized = str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .replace(/[^\w\s]/g, '') // remove punctuation
    .trim();

  // Check against dictionary synonyms
  for (const [canonical, synonyms] of Object.entries(FIELD_DICTIONARY)) {
    if (synonyms.some(synonym => normalized.includes(synonym.toLowerCase()))) {
      return canonical;
    }
  }

  // If no match found, return original (but never "Us" or "Uscanada")
  if (normalized.includes('us') || normalized.includes('uscanada')) {
    return "Language of the Application";
  }

  return str.trim();
}
