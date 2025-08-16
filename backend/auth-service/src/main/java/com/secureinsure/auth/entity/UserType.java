package com.secureinsure.auth.entity;

public enum UserType {
    CUSTOMER("Customer"),
    AGENT("Agent"),
    ADMIN("Administrator"),
    UNDERWRITER("Underwriter"),
    ADJUSTER("Claims Adjuster"),
    MANAGER("Manager"),
    SUPPORT("Support"),
    SYSTEM("System");

    private final String displayName;

    UserType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
} 