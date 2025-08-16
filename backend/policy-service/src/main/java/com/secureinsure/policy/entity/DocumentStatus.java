package com.secureinsure.policy.entity;

public enum DocumentStatus {
    UPLOADED("Uploaded"),
    PENDING("Pending Verification"),
    VERIFIED("Verified"),
    REJECTED("Rejected"),
    EXPIRED("Expired"),
    INVALID("Invalid"),
    DUPLICATE("Duplicate"),
    INCOMPLETE("Incomplete"),
    PROCESSING("Processing"),
    APPROVED("Approved"),
    DISAPPROVED("Disapproved"),
    UNDER_REVIEW("Under Review"),
    NEEDS_ADDITIONAL_INFO("Needs Additional Information"),
    RESUBMITTED("Resubmitted"),
    ARCHIVED("Archived"),
    DELETED("Deleted");

    private final String displayName;

    DocumentStatus(String displayName) {
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