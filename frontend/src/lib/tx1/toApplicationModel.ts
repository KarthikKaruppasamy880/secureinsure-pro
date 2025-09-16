import { parseTx1 } from "./tx1Parser";

export function tx1ToAppModel(xml: string) {
  const { policy, insured, child, owner, payor, beneficiary } = parseTx1(xml);

  return {
    // Case setup
    "Policy Number": policy.trackingId || "Not Applicable",
    "Zinnia Case ID": policy.trackingId || "Not Applicable",
    "Application State of Signing": policy.appJurisdiction || "Not Applicable",
    "Application Signing Date": policy.applicationDate || "Not Applicable",
    "Product Type": policy.productCode || "Not Applicable",
    "Plan Name": policy.planName || "Not Applicable",
    "Short Name": policy.shortName || "Not Applicable",
    "Policy Status": policy.status || "Not Applicable",
    "Death Benefit": policy.deathBenefitOption || "Not Applicable",
    "Face Amount": policy.faceAmount ? Number(policy.faceAmount).toLocaleString("en-US", { style: "currency", currency: "USD" }) : "Not Applicable",

    // Insured
    "Name": insured.name || "Not Applicable",
    "Gender": insured.gender || "Not Applicable",
    "Date of Birth": insured.dob || "Not Applicable",
    "Age": insured.age || "Not Applicable",
    "SSN": insured.ssn || "Not Applicable",
    "Occupation": insured.occupation || "Not Applicable",
    "Household Income": insured.householdIncome ? Number(insured.householdIncome).toLocaleString("en-US", { style: "currency", currency: "USD" }) : "Not Applicable",
    "Personal Income": insured.personalIncome ? Number(insured.personalIncome).toLocaleString("en-US", { style: "currency", currency: "USD" }) : "Not Applicable",
    "Street Address 1": insured.address?.line1 || "Not Applicable",
    "Street Address 2": insured.address?.line2 || "Not Applicable",
    "City": insured.address?.city || "Not Applicable",
    "State": insured.address?.state || "Not Applicable",
    "Zip": insured.address?.zip || "Not Applicable",
    "Country": insured.address?.country || "Not Applicable",
    "Mobile Phone": insured.phone || "Not Applicable",
    "Email Address": insured.email || "Not Applicable",

    // Child Insured (if present)
    "Child Name": child.name || "Not Applicable",
    "Child Gender": child.gender || "Not Applicable",
    "Child Date of Birth": child.dob || "Not Applicable",
    "Child Age": child.age || "Not Applicable",
    "Child Street Address 1": child.address?.line1 || "Not Applicable",
    "Child City": child.address?.city || "Not Applicable",
    "Child State": child.address?.state || "Not Applicable",
    "Child Zip": child.address?.zip || "Not Applicable",

    // Owner
    "Owner Name": owner.name || "Not Applicable",
    "Owner Date of Birth": owner.dob || "Not Applicable",
    "Owner SSN": owner.ssn || "Not Applicable",
    "Owner Address": owner.address?.line1 || "Not Applicable",
    "Owner City": owner.address?.city || "Not Applicable",
    "Owner State": owner.address?.state || "Not Applicable",
    "Owner ZIP": owner.address?.zip || "Not Applicable",

    // Payor
    "Payor Name": payor.name || "Not Applicable",
    "Payor Date of Birth": payor.dob || "Not Applicable",
    "Payor SSN": payor.ssn || "Not Applicable",

    // Beneficiary
    "Primary Beneficiary Name": beneficiary.name || "Not Applicable",
    "Primary Beneficiary Relationship": "Self", // Default relationship
    "Primary Beneficiary Percentage": "100%", // Default percentage
  };
}
