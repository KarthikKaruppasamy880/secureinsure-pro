package com.secureinsure.claims.entity;

public enum PriorityLevel {
    LOW("Low"),
    NORMAL("Normal"),
    MEDIUM("Medium"),
    HIGH("High"),
    URGENT("Urgent"),
    CRITICAL("Critical");
    
    private final String displayName;
    
    PriorityLevel(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public boolean isHighPriority() {
        return this == HIGH || this == URGENT || this == CRITICAL;
    }
    
    public boolean isLowPriority() {
        return this == LOW;
    }
    
    public boolean isNormalPriority() {
        return this == NORMAL;
    }
    
    public boolean isMediumPriority() {
        return this == MEDIUM;
    }
    
    public boolean isUrgent() {
        return this == URGENT || this == CRITICAL;
    }
    
    public boolean isCritical() {
        return this == CRITICAL;
    }
} 