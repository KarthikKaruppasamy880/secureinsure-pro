package com.secureinsure.policy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "policies")
public class Policy {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "policy_number", unique = true, nullable = false)
    @NotBlank(message = "Policy number is required")
    private String policyNumber;
    
    @Column(name = "customer_id", nullable = false)
    @NotNull(message = "Customer ID is required")
    private Long customerId;
    
    @Column(name = "customer_name", nullable = false)
    @NotBlank(message = "Customer name is required")
    private String customerName;
    
    @Column(name = "customer_email", nullable = false)
    @Email(message = "Valid email is required")
    private String customerEmail;
    
    @Column(name = "customer_phone")
    private String customerPhone;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "policy_type", nullable = false)
    @NotNull(message = "Policy type is required")
    private PolicyType policyType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "coverage_type", nullable = false)
    @NotNull(message = "Coverage type is required")
    private CoverageType coverageType;
    
    @Column(name = "coverage_amount", nullable = false)
    @DecimalMin(value = "0.01", message = "Coverage amount must be greater than 0")
    private BigDecimal coverageAmount;
    
    @Column(name = "premium_amount", nullable = false)
    @DecimalMin(value = "0.01", message = "Premium amount must be greater than 0")
    private BigDecimal premiumAmount;
    
    @Column(name = "deductible_amount")
    @DecimalMin(value = "0.0", message = "Deductible amount cannot be negative")
    private BigDecimal deductibleAmount;
    
    @Column(name = "start_date", nullable = false)
    @NotNull(message = "Start date is required")
    private LocalDate startDate;
    
    @Column(name = "end_date", nullable = false)
    @NotNull(message = "End date is required")
    private LocalDate endDate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @NotNull(message = "Status is required")
    private PolicyStatus status = PolicyStatus.DRAFT;
    
    @Column(name = "risk_score")
    @Min(value = 1, message = "Risk score must be between 1 and 10")
    @Max(value = 10, message = "Risk score must be between 1 and 10")
    private Integer riskScore;
    
    @Column(name = "discount_percentage")
    @DecimalMin(value = "0.0", message = "Discount percentage cannot be negative")
    @DecimalMax(value = "100.0", message = "Discount percentage cannot exceed 100")
    private BigDecimal discountPercentage = BigDecimal.ZERO;
    
    @Column(name = "agent_id")
    private Long agentId;
    
    @Column(name = "agent_name")
    private String agentName;
    
    @Column(name = "underwriter_id")
    private Long underwriterId;
    
    @Column(name = "underwriter_name")
    private String underwriterName;
    
    @Column(name = "approval_date")
    private LocalDateTime approvalDate;
    
    @Column(name = "approval_status")
    private String approvalStatus;
    
    @Column(name = "approved_by")
    private Long approvedBy;
    
    @Column(name = "sum_insured")
    private BigDecimal sumInsured;
    
    @Column(name = "risk_level")
    private String riskLevel;
    
    @Column(name = "auto_renewal")
    private Boolean autoRenewal = false;
    
    @Column(name = "rejection_reason")
    private String rejectionReason;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "policy", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<PolicyDocument> documents = new HashSet<>();
    
    @OneToMany(mappedBy = "policy", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<PolicyEndorsement> endorsements = new HashSet<>();
    
    @OneToMany(mappedBy = "policy", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<PolicyPayment> payments = new HashSet<>();
    
    // Constructors
    public Policy() {}
    
    public Policy(String policyNumber, Long customerId, String customerName, String customerEmail) {
        this.policyNumber = policyNumber;
        this.customerId = customerId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getPolicyNumber() {
        return policyNumber;
    }
    
    public void setPolicyNumber(String policyNumber) {
        this.policyNumber = policyNumber;
    }
    
    public Long getCustomerId() {
        return customerId;
    }
    
    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }
    
    public String getCustomerName() {
        return customerName;
    }
    
    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }
    
    public String getCustomerEmail() {
        return customerEmail;
    }
    
    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }
    
    public String getCustomerPhone() {
        return customerPhone;
    }
    
    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }
    
    public PolicyType getPolicyType() {
        return policyType;
    }
    
    public void setPolicyType(PolicyType policyType) {
        this.policyType = policyType;
    }
    
    public CoverageType getCoverageType() {
        return coverageType;
    }
    
    public void setCoverageType(CoverageType coverageType) {
        this.coverageType = coverageType;
    }
    
    public BigDecimal getCoverageAmount() {
        return coverageAmount;
    }
    
    public void setCoverageAmount(BigDecimal coverageAmount) {
        this.coverageAmount = coverageAmount;
    }
    
    public BigDecimal getPremiumAmount() {
        return premiumAmount;
    }
    
    public void setPremiumAmount(BigDecimal premiumAmount) {
        this.premiumAmount = premiumAmount;
    }
    
    public BigDecimal getDeductibleAmount() {
        return deductibleAmount;
    }
    
    public void setDeductibleAmount(BigDecimal deductibleAmount) {
        this.deductibleAmount = deductibleAmount;
    }
    
    public LocalDate getStartDate() {
        return startDate;
    }
    
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }
    
    public LocalDate getEndDate() {
        return endDate;
    }
    
    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
    
    public PolicyStatus getStatus() {
        return status;
    }
    
    public void setStatus(PolicyStatus status) {
        this.status = status;
    }
    
    public Integer getRiskScore() {
        return riskScore;
    }
    
    public void setRiskScore(Integer riskScore) {
        this.riskScore = riskScore;
    }
    
    public BigDecimal getDiscountPercentage() {
        return discountPercentage;
    }
    
    public void setDiscountPercentage(BigDecimal discountPercentage) {
        this.discountPercentage = discountPercentage;
    }
    
    public Long getAgentId() {
        return agentId;
    }
    
    public void setAgentId(Long agentId) {
        this.agentId = agentId;
    }
    
    public String getAgentName() {
        return agentName;
    }
    
    public void setAgentName(String agentName) {
        this.agentName = agentName;
    }
    
    public Long getUnderwriterId() {
        return underwriterId;
    }
    
    public void setUnderwriterId(Long underwriterId) {
        this.underwriterId = underwriterId;
    }
    
    public String getUnderwriterName() {
        return underwriterName;
    }
    
    public void setUnderwriterName(String underwriterName) {
        this.underwriterName = underwriterName;
    }
    
    public LocalDateTime getApprovalDate() {
        return approvalDate;
    }
    
    public void setApprovalDate(LocalDateTime approvalDate) {
        this.approvalDate = approvalDate;
    }
    
    public String getApprovalStatus() {
        return approvalStatus;
    }
    
    public void setApprovalStatus(String approvalStatus) {
        this.approvalStatus = approvalStatus;
    }
    
    public Long getApprovedBy() {
        return approvedBy;
    }
    
    public void setApprovedBy(Long approvedBy) {
        this.approvedBy = approvedBy;
    }
    
    public BigDecimal getSumInsured() {
        return sumInsured;
    }
    
    public void setSumInsured(BigDecimal sumInsured) {
        this.sumInsured = sumInsured;
    }
    
    public String getRiskLevel() {
        return riskLevel;
    }
    
    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }
    
    public Boolean getAutoRenewal() {
        return autoRenewal;
    }
    
    public void setAutoRenewal(Boolean autoRenewal) {
        this.autoRenewal = autoRenewal;
    }
    
    public String getRejectionReason() {
        return rejectionReason;
    }
    
    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public Set<PolicyDocument> getDocuments() {
        return documents;
    }
    
    public void setDocuments(Set<PolicyDocument> documents) {
        this.documents = documents;
    }
    
    public Set<PolicyEndorsement> getEndorsements() {
        return endorsements;
    }
    
    public void setEndorsements(Set<PolicyEndorsement> endorsements) {
        this.endorsements = endorsements;
    }
    
    public Set<PolicyPayment> getPayments() {
        return payments;
    }
    
    public void setPayments(Set<PolicyPayment> payments) {
        this.payments = payments;
    }
    
    // Business methods
    public boolean isActive() {
        return PolicyStatus.ACTIVE.equals(this.status);
    }
    
    public boolean isExpired() {
        return LocalDate.now().isAfter(this.endDate);
    }
    
    public boolean isExpiringSoon() {
        return LocalDate.now().plusDays(30).isAfter(this.endDate);
    }
    
    public BigDecimal getDiscountedPremium() {
        if (discountPercentage == null || discountPercentage.compareTo(BigDecimal.ZERO) == 0) {
            return premiumAmount;
        }
        return premiumAmount.multiply(BigDecimal.ONE.subtract(discountPercentage.divide(BigDecimal.valueOf(100))));
    }
    
    @Override
    public String toString() {
        return "Policy{" +
                "id=" + id +
                ", policyNumber='" + policyNumber + '\'' +
                ", customerId=" + customerId +
                ", customerName='" + customerName + '\'' +
                ", policyType=" + policyType +
                ", status=" + status +
                ", premiumAmount=" + premiumAmount +
                '}';
    }
} 