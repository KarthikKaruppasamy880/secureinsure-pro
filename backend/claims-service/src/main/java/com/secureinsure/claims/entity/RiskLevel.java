package com.secureinsure.claims.entity;

public enum RiskLevel {
    LOW("Low"),
    MEDIUM("Medium"),
    HIGH("High"),
    CRITICAL("Critical");
    
    private final String displayName;
    
    RiskLevel(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public boolean isHighRisk() {
        return this == HIGH || this == CRITICAL;
    }
    
    public boolean isLowRisk() {
        return this == LOW;
    }
    
    public boolean isMediumRisk() {
        return this == MEDIUM;
    }
    
    public boolean isCritical() {
        return this == CRITICAL;
    }
} 