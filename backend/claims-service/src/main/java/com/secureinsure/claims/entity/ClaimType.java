package com.secureinsure.claims.entity;

public enum ClaimType {
    AUTO("Auto"),
    AUTO_COLLISION("Auto Collision"),
    AUTO_THEFT("Auto Theft"),
    AUTO_VANDALISM("Auto Vandalism"),
    AUTO_GLASS("Auto Glass"),
    AUTO_MECHANICAL("Auto Mechanical"),
    HOME("Home"),
    HOME_FIRE("Home Fire"),
    HOME_THEFT("Home Theft"),
    HOME_WATER_DAMAGE("Home Water Damage"),
    HOME_STORM_DAMAGE("Home Storm Damage"),
    HOME_VANDALISM("Home Vandalism"),
    LIFE_DEATH("Life Death"),
    LIFE_DISABILITY("Life Disability"),
    LIFE_CRITICAL_ILLNESS("Life Critical Illness"),
    HEALTH("Health"),
    HEALTH_MEDICAL("Health Medical"),
    HEALTH_DENTAL("Health Dental"),
    HEALTH_VISION("Health Vision"),
    HEALTH_PRESCRIPTION("Health Prescription"),
    LIABILITY("Liability"),
    BUSINESS_PROPERTY("Business Property"),
    BUSINESS_LIABILITY("Business Liability"),
    BUSINESS_INTERRUPTION("Business Interruption"),
    BUSINESS_CYBER("Business Cyber"),
    TRAVEL_MEDICAL("Travel Medical"),
    TRAVEL_CANCELLATION("Travel Cancellation"),
    TRAVEL_BAGGAGE("Travel Baggage"),
    PET_MEDICAL("Pet Medical"),
    PET_ACCIDENT("Pet Accident"),
    BOAT_DAMAGE("Boat Damage"),
    BOAT_THEFT("Boat Theft"),
    MOTORCYCLE_COLLISION("Motorcycle Collision"),
    MOTORCYCLE_THEFT("Motorcycle Theft"),
    RENTAL_PROPERTY("Rental Property"),
    RENTAL_LIABILITY("Rental Liability"),
    UMBRELLA_LIABILITY("Umbrella Liability"),
    FLOOD("Flood"),
    EARTHQUAKE("Earthquake"),
    HURRICANE("Hurricane"),
    TORNADO("Tornado"),
    OTHER("Other");
    
    private final String displayName;
    
    ClaimType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
} 