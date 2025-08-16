package com.secureinsure.policy.entity;

public enum DocumentType {
    APPLICATION_FORM("Application Form"),
    ID_PROOF("ID Proof"),
    ADDRESS_PROOF("Address Proof"),
    INCOME_PROOF("Income Proof"),
    MEDICAL_REPORT("Medical Report"),
    VEHICLE_REGISTRATION("Vehicle Registration"),
    DRIVING_LICENSE("Driving License"),
    PROPERTY_DOCUMENTS("Property Documents"),
    BUSINESS_LICENSE("Business License"),
    FINANCIAL_STATEMENTS("Financial Statements"),
    TAX_RETURNS("Tax Returns"),
    BANK_STATEMENTS("Bank Statements"),
    EMPLOYMENT_LETTER("Employment Letter"),
    PAY_STUBS("Pay Stubs"),
    MEDICAL_CERTIFICATE("Medical Certificate"),
    DISABILITY_CERTIFICATE("Disability Certificate"),
    DEATH_CERTIFICATE("Death Certificate"),
    BIRTH_CERTIFICATE("Birth Certificate"),
    MARRIAGE_CERTIFICATE("Marriage Certificate"),
    DIVORCE_DECREE("Divorce Decree"),
    ADOPTION_PAPERS("Adoption Papers"),
    WILL_DOCUMENT("Will Document"),
    TRUST_DOCUMENT("Trust Document"),
    POWER_OF_ATTORNEY("Power of Attorney"),
    GUARDIANSHIP_PAPERS("Guardianship Papers"),
    COURT_ORDERS("Court Orders"),
    LEGAL_SETTLEMENTS("Legal Settlements"),
    INSURANCE_HISTORY("Insurance History"),
    CLAIMS_HISTORY("Claims History"),
    CREDIT_REPORT("Credit Report"),
    BACKGROUND_CHECK("Background Check"),
    DRUG_TEST_RESULTS("Drug Test Results"),
    ALCOHOL_TEST_RESULTS("Alcohol Test Results"),
    PHYSICAL_EXAMINATION("Physical Examination"),
    EYE_EXAMINATION("Eye Examination"),
    DENTAL_EXAMINATION("Dental Examination"),
    PSYCHOLOGICAL_EVALUATION("Psychological Evaluation"),
    RISK_ASSESSMENT("Risk Assessment"),
    UNDERWRITING_REPORT("Underwriting Report"),
    ACTUARIAL_REPORT("Actuarial Report"),
    LEGAL_OPINION("Legal Opinion"),
    COMPLIANCE_REPORT("Compliance Report"),
    AUDIT_REPORT("Audit Report"),
    SURVEY_REPORT("Survey Report"),
    INSPECTION_REPORT("Inspection Report"),
    VALUATION_REPORT("Valuation Report"),
    APPRAISAL_REPORT("Appraisal Report"),
    ENGINEERING_REPORT("Engineering Report"),
    ENVIRONMENTAL_REPORT("Environmental Report"),
    SECURITY_REPORT("Security Report"),
    FIRE_SAFETY_REPORT("Fire Safety Report"),
    ELECTRICAL_REPORT("Electrical Report"),
    PLUMBING_REPORT("Plumbing Report"),
    HVAC_REPORT("HVAC Report"),
    ROOFING_REPORT("Roofing Report"),
    FOUNDATION_REPORT("Foundation Report"),
    STRUCTURAL_REPORT("Structural Report"),
    SOIL_REPORT("Soil Report"),
    WATER_QUALITY_REPORT("Water Quality Report"),
    AIR_QUALITY_REPORT("Air Quality Report"),
    NOISE_REPORT("Noise Report"),
    TRAFFIC_REPORT("Traffic Report"),
    CRIME_REPORT("Crime Report"),
    WEATHER_REPORT("Weather Report"),
    FLOOD_REPORT("Flood Report"),
    EARTHQUAKE_REPORT("Earthquake Report"),
    HURRICANE_REPORT("Hurricane Report"),
    TORNADO_REPORT("Tornado Report"),
    WILDFIRE_REPORT("Wildfire Report"),
    LANDSLIDE_REPORT("Landslide Report"),
    SINKHOLE_REPORT("Sinkhole Report"),
    RADON_REPORT("Radon Report"),
    ASBESTOS_REPORT("Asbestos Report"),
    LEAD_REPORT("Lead Report"),
    MOLD_REPORT("Mold Report"),
    PEST_REPORT("Pest Report"),
    TERMITE_REPORT("Termite Report"),
    WOOD_DESTROYING_INSECT_REPORT("Wood Destroying Insect Report"),
    OTHER("Other Document");

    private final String displayName;

    DocumentType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }
} 