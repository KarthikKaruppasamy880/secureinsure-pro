package com.secureinsure.policy.entity;

public enum PolicyStatus {
    DRAFT("Draft"),
    PENDING("Pending"),
    UNDER_REVIEW("Under Review"),
    APPROVED("Approved"),
    ACTIVE("Active"),
    SUSPENDED("Suspended"),
    CANCELLED("Cancelled"),
    EXPIRED("Expired"),
    RENEWED("Renewed"),
    MODIFIED("Modified"),
    REJECTED("Rejected"),
    PENDING_PAYMENT("Pending Payment"),
    PAYMENT_RECEIVED("Payment Received"),
    PENDING_DOCUMENTS("Pending Documents"),
    DOCUMENTS_RECEIVED("Documents Received"),
    PENDING_APPROVAL("Pending Approval"),
    APPROVAL_PENDING("Approval Pending"),
    UNDERWRITING("Underwriting"),
    UNDERWRITING_APPROVED("Underwriting Approved"),
    UNDERWRITING_REJECTED("Underwriting Rejected"),
    PENDING_ACTIVATION("Pending Activation"),
    ACTIVATED("Activated"),
    PENDING_RENEWAL("Pending Renewal"),
    RENEWAL_PROCESSED("Renewal Processed"),
    PENDING_CANCELLATION("Pending Cancellation"),
    CANCELLATION_PROCESSED("Cancellation Processed"),
    PENDING_MODIFICATION("Pending Modification"),
    MODIFICATION_PROCESSED("Modification Processed"),
    PENDING_CLAIM("Pending Claim"),
    CLAIM_PROCESSED("Claim Processed"),
    LAPSED("Lapsed"),
    REINSTATED("Reinstated"),
    TRANSFERRED("Transferred"),
    CONVERTED("Converted"),
    TERMINATED("Terminated");

    private final String displayName;

    PolicyStatus(String displayName) {
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