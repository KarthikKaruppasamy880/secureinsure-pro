package com.secureinsure.policy.entity;

public enum CoverageType {
    BASIC("Basic Coverage"),
    STANDARD("Standard Coverage"),
    PREMIUM("Premium Coverage"),
    COMPREHENSIVE("Comprehensive Coverage"),
    CUSTOM("Custom Coverage"),
    MINIMUM("Minimum Required"),
    EXTENDED("Extended Coverage"),
    FULL("Full Coverage"),
    LIMITED("Limited Coverage"),
    SPECIALIZED("Specialized Coverage"),
    COMPREHENSIVE_PLUS("Comprehensive Plus"),
    PREMIUM_PLUS("Premium Plus"),
    ULTIMATE("Ultimate Coverage"),
    ESSENTIAL("Essential Coverage"),
    ADVANCED("Advanced Coverage"),
    PROFESSIONAL("Professional Coverage"),
    ENTERPRISE("Enterprise Coverage"),
    PERSONAL("Personal Coverage"),
    FAMILY("Family Coverage"),
    INDIVIDUAL("Individual Coverage"),
    GROUP("Group Coverage"),
    CORPORATE("Corporate Coverage"),
    SMALL_BUSINESS("Small Business Coverage"),
    LARGE_BUSINESS("Large Business Coverage"),
    STARTUP("Startup Coverage"),
    ESTABLISHED("Established Business Coverage"),
    HIGH_RISK("High Risk Coverage"),
    LOW_RISK("Low Risk Coverage"),
    MEDIUM_RISK("Medium Risk Coverage"),
    CUSTOMIZED("Customized Coverage"),
    TAILORED("Tailored Coverage");

    private final String displayName;

    CoverageType(String displayName) {
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