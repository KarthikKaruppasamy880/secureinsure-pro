package com.secureinsure.notification.entity;

public enum NotificationStatus {
    DRAFT("Draft"),
    PENDING("Pending"),
    SENT("Sent"),
    DELIVERED("Delivered"),
    READ("Read"),
    ACKNOWLEDGED("Acknowledged"),
    FAILED("Failed"),
    CANCELLED("Cancelled"),
    SCHEDULED("Scheduled"),
    PROCESSING("Processing"),
    RETRY("Retry");

    private final String displayName;

    NotificationStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public boolean isFinal() {
        return this == DELIVERED || this == READ || this == ACKNOWLEDGED || this == CANCELLED;
    }

    public boolean isPending() {
        return this == PENDING || this == SCHEDULED || this == PROCESSING || this == RETRY;
    }

    public boolean isFailed() {
        return this == FAILED;
    }
} 