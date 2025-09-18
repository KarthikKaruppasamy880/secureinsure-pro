package com.secureinsure.notification.entity;

public enum NotificationCategory {
    POLICY("Policy"),
    CLAIM("Claim"),
    PAYMENT("Payment"),
    DOCUMENT("Document"),
    ACCOUNT("Account"),
    SECURITY("Security"),
    SYSTEM("System"),
    MARKETING("Marketing"),
    REMINDER("Reminder"),
    ALERT("Alert"),
    INFO("Information"),
    GENERAL("General"),
    CUSTOM("Custom");

    private final String displayName;

    NotificationCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
} 