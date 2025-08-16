package com.secureinsure.claims.entity;

public enum PaymentStatus {
    PENDING("Pending"),
    PROCESSING("Processing"),
    PAID("Paid"),
    FAILED("Failed"),
    CANCELLED("Cancelled"),
    REFUNDED("Refunded"),
    PARTIALLY_PAID("Partially Paid"),
    OVERDUE("Overdue"),
    DISPUTED("Disputed"),
    ON_HOLD("On Hold"),
    SCHEDULED("Scheduled"),
    AUTHORIZED("Authorized"),
    DECLINED("Declined"),
    EXPIRED("Expired"),
    VOIDED("Voided"),
    REVERSED("Reversed"),
    CHARGEBACK("Chargeback"),
    RECONCILED("Reconciled"),
    CLEARED("Cleared"),
    SETTLED("Settled"),
    COMPLETED("Completed"),
    IN_TRANSIT("In Transit"),
    DELIVERED("Delivered"),
    LOST("Lost"),
    STOLEN("Stolen"),
    DAMAGED("Damaged"),
    RETURNED("Returned"),
    OTHER("Other");
    
    private final String displayName;
    
    PaymentStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public boolean isPending() {
        return this == PENDING || this == PROCESSING || this == SCHEDULED ||
               this == AUTHORIZED || this == ON_HOLD || this == IN_TRANSIT;
    }
    
    public boolean isCompleted() {
        return this == PAID || this == COMPLETED || this == SETTLED ||
               this == RECONCILED || this == CLEARED || this == DELIVERED;
    }
    
    public boolean isFailed() {
        return this == FAILED || this == DECLINED || this == EXPIRED ||
               this == VOIDED || this == REVERSED || this == CHARGEBACK;
    }
    
    public boolean isCancelled() {
        return this == CANCELLED || this == VOIDED || this == REFUNDED;
    }
    
    public boolean isProblematic() {
        return this == FAILED || this == DECLINED || this == EXPIRED ||
               this == VOIDED || this == REVERSED || this == CHARGEBACK ||
               this == LOST || this == STOLEN || this == DAMAGED ||
               this == DISPUTED || this == OVERDUE;
    }
    
    public boolean requiresAction() {
        return this == PENDING || this == PROCESSING || this == SCHEDULED ||
               this == AUTHORIZED || this == ON_HOLD || this == IN_TRANSIT ||
               this == DISPUTED || this == OVERDUE;
    }
    
    public boolean isFinal() {
        return this == PAID || this == COMPLETED || this == SETTLED ||
               this == CANCELLED || this == VOIDED || this == REFUNDED ||
               this == FAILED || this == DECLINED || this == EXPIRED;
    }
} 