package com.secureinsure.claims.entity;

public enum ClaimStatus {
    DRAFT("Draft"),
    SUBMITTED("Submitted"),
    UNDER_REVIEW("Under Review"),
    INVESTIGATION("Investigation"),
    PENDING_APPROVAL("Pending Approval"),
    APPROVED("Approved"),
    REJECTED("Rejected"),
    PENDING_PAYMENT("Pending Payment"),
    PAID("Paid"),
    CLOSED("Closed"),
    CANCELLED("Cancelled"),
    REOPENED("Reopened"),
    ESCALATED("Escalated"),
    ON_HOLD("On Hold"),
    PENDING_DOCUMENTS("Pending Documents"),
    PENDING_INFORMATION("Pending Information"),
    PENDING_INVESTIGATION("Pending Investigation"),
    PENDING_LEGAL_REVIEW("Pending Legal Review"),
    PENDING_MEDICAL_REVIEW("Pending Medical Review"),
    PENDING_ENGINEERING_REVIEW("Pending Engineering Review"),
    PENDING_APPRAISAL("Pending Appraisal"),
    PENDING_SURVEY("Pending Survey"),
    PENDING_CLAIMANT_RESPONSE("Pending Claimant Response"),
    PENDING_THIRD_PARTY_RESPONSE("Pending Third Party Response"),
    PENDING_COURT_DECISION("Pending Court Decision"),
    PENDING_ARBITRATION("Pending Arbitration"),
    PENDING_MEDIATION("Pending Mediation"),
    PENDING_SETTLEMENT_NEGOTIATION("Pending Settlement Negotiation"),
    PENDING_RECOVERY("Pending Recovery"),
    PENDING_SUBROGATION("Pending Subrogation"),
    PENDING_FRAUD_INVESTIGATION("Pending Fraud Investigation"),
    PENDING_COMPLIANCE_REVIEW("Pending Compliance Review"),
    PENDING_AUDIT("Pending Audit"),
    PENDING_FINAL_REVIEW("Pending Final Review"),
    PENDING_CLOSURE("Pending Closure"),
    PENDING_ARCHIVE("Pending Archive");
    
    private final String displayName;
    
    ClaimStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public boolean isOpen() {
        return this == SUBMITTED || this == UNDER_REVIEW || this == INVESTIGATION || 
               this == PENDING_APPROVAL || this == PENDING_PAYMENT || this == REOPENED ||
               this == ESCALATED || this == ON_HOLD || this == PENDING_DOCUMENTS ||
               this == PENDING_INFORMATION || this == PENDING_INVESTIGATION ||
               this == PENDING_LEGAL_REVIEW || this == PENDING_MEDICAL_REVIEW ||
               this == PENDING_ENGINEERING_REVIEW || this == PENDING_APPRAISAL ||
               this == PENDING_SURVEY || this == PENDING_CLAIMANT_RESPONSE ||
               this == PENDING_THIRD_PARTY_RESPONSE || this == PENDING_COURT_DECISION ||
               this == PENDING_ARBITRATION || this == PENDING_MEDIATION ||
               this == PENDING_SETTLEMENT_NEGOTIATION || this == PENDING_RECOVERY ||
               this == PENDING_SUBROGATION || this == PENDING_FRAUD_INVESTIGATION ||
               this == PENDING_COMPLIANCE_REVIEW || this == PENDING_AUDIT ||
               this == PENDING_FINAL_REVIEW || this == PENDING_CLOSURE ||
               this == PENDING_ARCHIVE;
    }
    
    public boolean isClosed() {
        return this == APPROVED || this == REJECTED || this == PAID || 
               this == CLOSED || this == CANCELLED;
    }
    
    public boolean isPending() {
        return this == PENDING_APPROVAL || this == PENDING_PAYMENT || 
               this == PENDING_DOCUMENTS || this == PENDING_INFORMATION ||
               this == PENDING_INVESTIGATION || this == PENDING_LEGAL_REVIEW ||
               this == PENDING_MEDICAL_REVIEW || this == PENDING_ENGINEERING_REVIEW ||
               this == PENDING_APPRAISAL || this == PENDING_SURVEY ||
               this == PENDING_CLAIMANT_RESPONSE || this == PENDING_THIRD_PARTY_RESPONSE ||
               this == PENDING_COURT_DECISION || this == PENDING_ARBITRATION ||
               this == PENDING_MEDIATION || this == PENDING_SETTLEMENT_NEGOTIATION ||
               this == PENDING_RECOVERY || this == PENDING_SUBROGATION ||
               this == PENDING_FRAUD_INVESTIGATION || this == PENDING_COMPLIANCE_REVIEW ||
               this == PENDING_AUDIT || this == PENDING_FINAL_REVIEW ||
               this == PENDING_CLOSURE || this == PENDING_ARCHIVE;
    }
    
    public boolean requiresAction() {
        return this == SUBMITTED || this == UNDER_REVIEW || this == INVESTIGATION ||
               this == PENDING_APPROVAL || this == PENDING_PAYMENT || this == REOPENED ||
               this == ESCALATED || this == ON_HOLD;
    }
    
    public boolean isFinal() {
        return this == APPROVED || this == REJECTED || this == PAID || 
               this == CLOSED || this == CANCELLED;
    }
} 