package com.secureinsure.claims.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "claims")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Claim {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "claim_number", unique = true, nullable = false)
    private String claimNumber;
    
    @Column(name = "policy_id", nullable = false)
    private Long policyId;
    
    @Column(name = "customer_id", nullable = false)
    private Long customerId;
    
    @Column(name = "claim_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ClaimType claimType;
    
    @Column(name = "claim_status", nullable = false)
    @Enumerated(EnumType.STRING)
    private ClaimStatus status;
    
    @Column(name = "incident_date", nullable = false)
    private LocalDate incidentDate;
    
    @Column(name = "reported_date", nullable = false)
    private LocalDate reportedDate;
    
    @Column(name = "claim_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal claimAmount;
    
    @Column(name = "approved_amount", precision = 15, scale = 2)
    private BigDecimal approvedAmount;
    
    @Column(name = "paid_amount", precision = 15, scale = 2)
    private BigDecimal paidAmount;
    
    @Column(name = "deductible_amount", precision = 15, scale = 2)
    private BigDecimal deductibleAmount;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "incident_location")
    private String incidentLocation;
    
    @Column(name = "police_report_number")
    private String policeReportNumber;
    
    @Column(name = "witness_details", columnDefinition = "TEXT")
    private String witnessDetails;
    
    @Column(name = "damage_description", columnDefinition = "TEXT")
    private String damageDescription;
    
    @Column(name = "estimated_repair_cost", precision = 15, scale = 2)
    private BigDecimal estimatedRepairCost;
    
    @Column(name = "actual_repair_cost", precision = 15, scale = 2)
    private BigDecimal actualRepairCost;
    
    @Column(name = "medical_expenses", precision = 15, scale = 2)
    private BigDecimal medicalExpenses;
    
    @Column(name = "legal_expenses", precision = 15, scale = 2)
    private BigDecimal legalExpenses;
    
    @Column(name = "other_expenses", precision = 15, scale = 2)
    private BigDecimal otherExpenses;
    
    @Column(name = "fraud_score")
    private Integer fraudScore;
    
    @Column(name = "fraud_detection_result")
    private String fraudDetectionResult;
    
    @Column(name = "risk_level")
    @Enumerated(EnumType.STRING)
    private RiskLevel riskLevel;
    
    @Column(name = "priority_level")
    @Enumerated(EnumType.STRING)
    private PriorityLevel priorityLevel;
    
    @Column(name = "assigned_to")
    private Long assignedTo;
    
    @Column(name = "assigned_date")
    private LocalDateTime assignedDate;
    
    @Column(name = "investigation_required")
    private Boolean investigationRequired;
    
    @Column(name = "investigation_start_date")
    private LocalDate investigationStartDate;
    
    @Column(name = "investigation_end_date")
    private LocalDate investigationEndDate;
    
    @Column(name = "investigation_notes", columnDefinition = "TEXT")
    private String investigationNotes;
    
    @Column(name = "approval_required")
    private Boolean approvalRequired;
    
    @Column(name = "approved_by")
    private Long approvedBy;
    
    @Column(name = "approval_date")
    private LocalDateTime approvalDate;
    
    @Column(name = "approval_notes", columnDefinition = "TEXT")
    private String approvalNotes;
    
    @Column(name = "payment_method")
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;
    
    @Column(name = "payment_status")
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;
    
    @Column(name = "payment_date")
    private LocalDate paymentDate;
    
    @Column(name = "payment_reference")
    private String paymentReference;
    
    @Column(name = "recovery_amount", precision = 15, scale = 2)
    private BigDecimal recoveryAmount;
    
    @Column(name = "recovery_date")
    private LocalDate recoveryDate;
    
    @Column(name = "recovery_notes", columnDefinition = "TEXT")
    private String recoveryNotes;
    
    @Column(name = "closure_date")
    private LocalDate closureDate;
    
    @Column(name = "closure_reason")
    private String closureReason;
    
    @Column(name = "reopened_date")
    private LocalDate reopenedDate;
    
    @Column(name = "reopened_reason")
    private String reopenedReason;
    
    @Column(name = "escalation_level")
    private Integer escalationLevel;
    
    @Column(name = "escalation_date")
    private LocalDateTime escalationDate;
    
    @Column(name = "escalation_reason")
    private String escalationReason;
    
    @Column(name = "customer_satisfaction_score")
    private Integer customerSatisfactionScore;
    
    @Column(name = "customer_feedback", columnDefinition = "TEXT")
    private String customerFeedback;
    
    @Column(name = "internal_notes", columnDefinition = "TEXT")
    private String internalNotes;
    
    @Column(name = "external_notes", columnDefinition = "TEXT")
    private String externalNotes;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "claim", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ClaimDocument> documents = new ArrayList<>();
    
    @OneToMany(mappedBy = "claim", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ClaimNote> notes = new ArrayList<>();
    
    @OneToMany(mappedBy = "claim", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ClaimPayment> payments = new ArrayList<>();
    
    @OneToMany(mappedBy = "claim", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ClaimActivity> activities = new ArrayList<>();
    
    // Business methods
    public boolean isOpen() {
        return status == ClaimStatus.SUBMITTED || status == ClaimStatus.UNDER_REVIEW || 
               status == ClaimStatus.INVESTIGATION || status == ClaimStatus.PENDING_APPROVAL;
    }
    
    public boolean isClosed() {
        return status == ClaimStatus.APPROVED || status == ClaimStatus.REJECTED || 
               status == ClaimStatus.CLOSED || status == ClaimStatus.CANCELLED;
    }
    
    public boolean isPendingPayment() {
        return status == ClaimStatus.APPROVED && paymentStatus == PaymentStatus.PENDING;
    }
    
    public boolean isPaid() {
        return paymentStatus == PaymentStatus.PAID;
    }
    
    public BigDecimal getOutstandingAmount() {
        if (approvedAmount == null || paidAmount == null) {
            return BigDecimal.ZERO;
        }
        return approvedAmount.subtract(paidAmount);
    }
    
    public boolean hasOutstandingAmount() {
        return getOutstandingAmount().compareTo(BigDecimal.ZERO) > 0;
    }
    
    public boolean requiresInvestigation() {
        return investigationRequired != null && investigationRequired;
    }
    
    public boolean requiresApproval() {
        return approvalRequired != null && approvalRequired;
    }
    
    public boolean isHighPriority() {
        return priorityLevel == PriorityLevel.HIGH || priorityLevel == PriorityLevel.URGENT;
    }
    
    public boolean isHighRisk() {
        return riskLevel == RiskLevel.HIGH || riskLevel == RiskLevel.CRITICAL;
    }
    
    public boolean hasFraudRisk() {
        return fraudScore != null && fraudScore > 70;
    }
    
    public long getDaysSinceIncident() {
        if (incidentDate == null) return 0;
        return java.time.temporal.ChronoUnit.DAYS.between(incidentDate, LocalDate.now());
    }
    
    public long getDaysSinceReported() {
        if (reportedDate == null) return 0;
        return java.time.temporal.ChronoUnit.DAYS.between(reportedDate, LocalDate.now());
    }
    
    public boolean isOverdue() {
        return getDaysSinceReported() > 30; // Assuming 30 days is the standard processing time
    }
    
    public void addDocument(ClaimDocument document) {
        documents.add(document);
        document.setClaim(this);
    }
    
    public void addNote(ClaimNote note) {
        notes.add(note);
        note.setClaim(this);
    }
    
    public void addPayment(ClaimPayment payment) {
        payments.add(payment);
        payment.setClaim(this);
    }
    
    public void addActivity(ClaimActivity activity) {
        activities.add(activity);
        activity.setClaim(this);
    }
    
    public void updateStatus(ClaimStatus newStatus) {
        this.status = newStatus;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void assignTo(Long assigneeId) {
        this.assignedTo = assigneeId;
        this.assignedDate = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public void approve(Long approverId, String notes) {
        this.approvedBy = approverId;
        this.approvalDate = LocalDateTime.now();
        this.approvalNotes = notes;
        this.status = ClaimStatus.APPROVED;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void reject(Long rejectorId, String reason) {
        this.approvedBy = rejectorId;
        this.approvalDate = LocalDateTime.now();
        this.approvalNotes = reason;
        this.status = ClaimStatus.REJECTED;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void makePayment(BigDecimal amount, PaymentMethod method, String reference) {
        this.paidAmount = this.paidAmount != null ? this.paidAmount.add(amount) : amount;
        this.paymentMethod = method;
        this.paymentReference = reference;
        this.paymentDate = LocalDate.now();
        this.paymentStatus = PaymentStatus.PAID;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void close(String reason) {
        this.status = ClaimStatus.CLOSED;
        this.closureDate = LocalDate.now();
        this.closureReason = reason;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void reopen(String reason) {
        this.status = ClaimStatus.UNDER_REVIEW;
        this.reopenedDate = LocalDate.now();
        this.reopenedReason = reason;
        this.closureDate = null;
        this.closureReason = null;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void escalate(String reason) {
        this.escalationLevel = this.escalationLevel != null ? this.escalationLevel + 1 : 1;
        this.escalationDate = LocalDateTime.now();
        this.escalationReason = reason;
        this.updatedAt = LocalDateTime.now();
    }
} 