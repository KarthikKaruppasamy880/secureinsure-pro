package com.secureinsure.notification.entity;

public enum NotificationType {
    POLICY_CREATED("Policy Created"),
    POLICY_UPDATED("Policy Updated"),
    POLICY_RENEWED("Policy Renewed"),
    POLICY_EXPIRED("Policy Expired"),
    POLICY_CANCELLED("Policy Cancelled"),
    CLAIM_SUBMITTED("Claim Submitted"),
    CLAIM_APPROVED("Claim Approved"),
    CLAIM_REJECTED("Claim Rejected"),
    CLAIM_PROCESSING("Claim Processing"),
    CLAIM_SETTLED("Claim Settled"),
    PAYMENT_RECEIVED("Payment Received"),
    PAYMENT_DUE("Payment Due"),
    PAYMENT_OVERDUE("Payment Overdue"),
    DOCUMENT_UPLOADED("Document Uploaded"),
    DOCUMENT_APPROVED("Document Approved"),
    DOCUMENT_REJECTED("Document Rejected"),
    ACCOUNT_ACTIVATED("Account Activated"),
    ACCOUNT_SUSPENDED("Account Suspended"),
    WELCOME("Welcome"),
    PASSWORD_RESET("Password Reset"),
    EMAIL_VERIFICATION("Email Verification"),
    PHONE_VERIFICATION("Phone Verification"),
    MFA_ENABLED("MFA Enabled"),
    MFA_DISABLED("MFA Disabled"),
    LOGIN_ALERT("Login Alert"),
    SECURITY_ALERT("Security Alert"),
    SYSTEM_MAINTENANCE("System Maintenance"),
    SYSTEM_UPDATE("System Update"),
    PROMOTIONAL("Promotional"),
    NEWSLETTER("Newsletter"),
    SURVEY("Survey"),
    REMINDER("Reminder"),
    ALERT("Alert"),
    INFO("Information"),
    SUCCESS("Success"),
    WARNING("Warning"),
    ERROR("Error"),
    CUSTOM("Custom");

    private final String displayName;

    NotificationType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
} 