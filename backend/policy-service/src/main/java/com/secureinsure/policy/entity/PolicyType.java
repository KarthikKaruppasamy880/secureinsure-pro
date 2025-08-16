package com.secureinsure.policy.entity;

public enum PolicyType {
    AUTO("Auto Insurance"),
    HOME("Home Insurance"),
    LIFE("Life Insurance"),
    HEALTH("Health Insurance"),
    BUSINESS("Business Insurance"),
    TRAVEL("Travel Insurance"),
    PET("Pet Insurance"),
    CYBER("Cyber Insurance"),
    LIABILITY("Liability Insurance"),
    PROPERTY("Property Insurance"),
    WORKERS_COMP("Workers Compensation"),
    PROFESSIONAL("Professional Liability"),
    UMBRELLA("Umbrella Insurance"),
    FLOOD("Flood Insurance"),
    EARTHQUAKE("Earthquake Insurance"),
    BOAT("Boat Insurance"),
    MOTORCYCLE("Motorcycle Insurance"),
    RV("RV Insurance"),
    CLASSIC_CAR("Classic Car Insurance"),
    RENTERS("Renters Insurance"),
    CONDO("Condo Insurance"),
    LANDLORD("Landlord Insurance"),
    DISABILITY("Disability Insurance"),
    CRITICAL_ILLNESS("Critical Illness Insurance"),
    ACCIDENT("Accident Insurance"),
    DENTAL("Dental Insurance"),
    VISION("Vision Insurance"),
    MEDICARE_SUPPLEMENT("Medicare Supplement"),
    LONG_TERM_CARE("Long Term Care Insurance"),
    ANNUITY("Annuity"),
    INVESTMENT("Investment Insurance"),
    SPECIALTY("Specialty Insurance");

    private final String displayName;

    PolicyType(String displayName) {
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