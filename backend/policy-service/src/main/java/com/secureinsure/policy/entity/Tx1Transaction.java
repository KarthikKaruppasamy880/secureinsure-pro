package com.secureinsure.policy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tx1_transactions")
public class Tx1Transaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "case_number", unique = true, nullable = false)
    @NotBlank(message = "Case number is required")
    private String caseNumber;
    
    @Column(name = "zinnia_case_id")
    private String zinniaCaseId;
    
    @Column(name = "policy_number")
    private String policyNumber;
    
    @Column(name = "application_date", nullable = false)
    @NotNull(message = "Application date is required")
    private LocalDate applicationDate;
    
    @Column(name = "product_type", nullable = false)
    @NotBlank(message = "Product type is required")
    private String productType;
    
    @Column(name = "face_amount", nullable = false)
    @NotNull(message = "Face amount is required")
    private BigDecimal faceAmount;
    
    @Column(name = "premium_mode", nullable = false)
    @NotBlank(message = "Premium mode is required")
    private String premiumMode;
    
    @Column(name = "agent_name")
    private String agentName;
    
    @Column(name = "branch")
    private String branch;
    
    // Insured Information
    @Column(name = "insured_first_name", nullable = false)
    @NotBlank(message = "Insured first name is required")
    private String insuredFirstName;
    
    @Column(name = "insured_last_name", nullable = false)
    @NotBlank(message = "Insured last name is required")
    private String insuredLastName;
    
    @Column(name = "insured_date_of_birth", nullable = false)
    @NotNull(message = "Insured date of birth is required")
    private LocalDate insuredDateOfBirth;
    
    @Column(name = "insured_age")
    private Integer insuredAge;
    
    @Column(name = "insured_gender")
    private String insuredGender;
    
    @Column(name = "insured_ssn")
    private String insuredSsn;
    
    @Column(name = "insured_email")
    private String insuredEmail;
    
    @Column(name = "insured_phone")
    private String insuredPhone;
    
    @Column(name = "insured_address")
    private String insuredAddress;
    
    @Column(name = "insured_city")
    private String insuredCity;
    
    @Column(name = "insured_state")
    private String insuredState;
    
    @Column(name = "insured_zip")
    private String insuredZip;
    
    @Column(name = "insured_occupation")
    private String insuredOccupation;
    
    @Column(name = "insured_annual_income")
    private BigDecimal insuredAnnualIncome;
    
    // Owner Information
    @Column(name = "owner_first_name")
    private String ownerFirstName;
    
    @Column(name = "owner_last_name")
    private String ownerLastName;
    
    @Column(name = "owner_date_of_birth")
    private LocalDate ownerDateOfBirth;
    
    @Column(name = "owner_ssn")
    private String ownerSsn;
    
    @Column(name = "owner_email")
    private String ownerEmail;
    
    @Column(name = "owner_phone")
    private String ownerPhone;
    
    @Column(name = "owner_address")
    private String ownerAddress;
    
    @Column(name = "owner_city")
    private String ownerCity;
    
    @Column(name = "owner_state")
    private String ownerState;
    
    @Column(name = "owner_zip")
    private String ownerZip;
    
    @Column(name = "owner_relationship")
    private String ownerRelationship;
    
    // Payor Information
    @Column(name = "payor_first_name")
    private String payorFirstName;
    
    @Column(name = "payor_last_name")
    private String payorLastName;
    
    @Column(name = "payor_date_of_birth")
    private LocalDate payorDateOfBirth;
    
    @Column(name = "payor_ssn")
    private String payorSsn;
    
    @Column(name = "payor_email")
    private String payorEmail;
    
    @Column(name = "payor_phone")
    private String payorPhone;
    
    @Column(name = "payor_address")
    private String payorAddress;
    
    @Column(name = "payor_city")
    private String payorCity;
    
    @Column(name = "payor_state")
    private String payorState;
    
    @Column(name = "payor_zip")
    private String payorZip;
    
    @Column(name = "payor_relationship")
    private String payorRelationship;
    
    // Beneficiary Information
    @Column(name = "primary_beneficiary_name")
    private String primaryBeneficiaryName;
    
    @Column(name = "primary_beneficiary_relationship")
    private String primaryBeneficiaryRelationship;
    
    @Column(name = "primary_beneficiary_percentage")
    private String primaryBeneficiaryPercentage;
    
    @Column(name = "primary_beneficiary_date_of_birth")
    private LocalDate primaryBeneficiaryDateOfBirth;
    
    @Column(name = "primary_beneficiary_ssn")
    private String primaryBeneficiarySsn;
    
    // Status
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Tx1Status status = Tx1Status.PENDING;
    
    @Column(name = "processing_notes", columnDefinition = "TEXT")
    private String processingNotes;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // Constructors
    public Tx1Transaction() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getCaseNumber() {
        return caseNumber;
    }
    
    public void setCaseNumber(String caseNumber) {
        this.caseNumber = caseNumber;
    }
    
    public String getZinniaCaseId() {
        return zinniaCaseId;
    }
    
    public void setZinniaCaseId(String zinniaCaseId) {
        this.zinniaCaseId = zinniaCaseId;
    }
    
    public String getPolicyNumber() {
        return policyNumber;
    }
    
    public void setPolicyNumber(String policyNumber) {
        this.policyNumber = policyNumber;
    }
    
    public LocalDate getApplicationDate() {
        return applicationDate;
    }
    
    public void setApplicationDate(LocalDate applicationDate) {
        this.applicationDate = applicationDate;
    }
    
    public String getProductType() {
        return productType;
    }
    
    public void setProductType(String productType) {
        this.productType = productType;
    }
    
    public BigDecimal getFaceAmount() {
        return faceAmount;
    }
    
    public void setFaceAmount(BigDecimal faceAmount) {
        this.faceAmount = faceAmount;
    }
    
    public String getPremiumMode() {
        return premiumMode;
    }
    
    public void setPremiumMode(String premiumMode) {
        this.premiumMode = premiumMode;
    }
    
    public String getAgentName() {
        return agentName;
    }
    
    public void setAgentName(String agentName) {
        this.agentName = agentName;
    }
    
    public String getBranch() {
        return branch;
    }
    
    public void setBranch(String branch) {
        this.branch = branch;
    }
    
    public String getInsuredFirstName() {
        return insuredFirstName;
    }
    
    public void setInsuredFirstName(String insuredFirstName) {
        this.insuredFirstName = insuredFirstName;
    }
    
    public String getInsuredLastName() {
        return insuredLastName;
    }
    
    public void setInsuredLastName(String insuredLastName) {
        this.insuredLastName = insuredLastName;
    }
    
    public LocalDate getInsuredDateOfBirth() {
        return insuredDateOfBirth;
    }
    
    public void setInsuredDateOfBirth(LocalDate insuredDateOfBirth) {
        this.insuredDateOfBirth = insuredDateOfBirth;
    }
    
    public Integer getInsuredAge() {
        return insuredAge;
    }
    
    public void setInsuredAge(Integer insuredAge) {
        this.insuredAge = insuredAge;
    }
    
    public String getInsuredGender() {
        return insuredGender;
    }
    
    public void setInsuredGender(String insuredGender) {
        this.insuredGender = insuredGender;
    }
    
    public String getInsuredSsn() {
        return insuredSsn;
    }
    
    public void setInsuredSsn(String insuredSsn) {
        this.insuredSsn = insuredSsn;
    }
    
    public String getInsuredEmail() {
        return insuredEmail;
    }
    
    public void setInsuredEmail(String insuredEmail) {
        this.insuredEmail = insuredEmail;
    }
    
    public String getInsuredPhone() {
        return insuredPhone;
    }
    
    public void setInsuredPhone(String insuredPhone) {
        this.insuredPhone = insuredPhone;
    }
    
    public String getInsuredAddress() {
        return insuredAddress;
    }
    
    public void setInsuredAddress(String insuredAddress) {
        this.insuredAddress = insuredAddress;
    }
    
    public String getInsuredCity() {
        return insuredCity;
    }
    
    public void setInsuredCity(String insuredCity) {
        this.insuredCity = insuredCity;
    }
    
    public String getInsuredState() {
        return insuredState;
    }
    
    public void setInsuredState(String insuredState) {
        this.insuredState = insuredState;
    }
    
    public String getInsuredZip() {
        return insuredZip;
    }
    
    public void setInsuredZip(String insuredZip) {
        this.insuredZip = insuredZip;
    }
    
    public String getInsuredOccupation() {
        return insuredOccupation;
    }
    
    public void setInsuredOccupation(String insuredOccupation) {
        this.insuredOccupation = insuredOccupation;
    }
    
    public BigDecimal getInsuredAnnualIncome() {
        return insuredAnnualIncome;
    }
    
    public void setInsuredAnnualIncome(BigDecimal insuredAnnualIncome) {
        this.insuredAnnualIncome = insuredAnnualIncome;
    }
    
    public String getOwnerFirstName() {
        return ownerFirstName;
    }
    
    public void setOwnerFirstName(String ownerFirstName) {
        this.ownerFirstName = ownerFirstName;
    }
    
    public String getOwnerLastName() {
        return ownerLastName;
    }
    
    public void setOwnerLastName(String ownerLastName) {
        this.ownerLastName = ownerLastName;
    }
    
    public LocalDate getOwnerDateOfBirth() {
        return ownerDateOfBirth;
    }
    
    public void setOwnerDateOfBirth(LocalDate ownerDateOfBirth) {
        this.ownerDateOfBirth = ownerDateOfBirth;
    }
    
    public String getOwnerSsn() {
        return ownerSsn;
    }
    
    public void setOwnerSsn(String ownerSsn) {
        this.ownerSsn = ownerSsn;
    }
    
    public String getOwnerEmail() {
        return ownerEmail;
    }
    
    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }
    
    public String getOwnerPhone() {
        return ownerPhone;
    }
    
    public void setOwnerPhone(String ownerPhone) {
        this.ownerPhone = ownerPhone;
    }
    
    public String getOwnerAddress() {
        return ownerAddress;
    }
    
    public void setOwnerAddress(String ownerAddress) {
        this.ownerAddress = ownerAddress;
    }
    
    public String getOwnerCity() {
        return ownerCity;
    }
    
    public void setOwnerCity(String ownerCity) {
        this.ownerCity = ownerCity;
    }
    
    public String getOwnerState() {
        return ownerState;
    }
    
    public void setOwnerState(String ownerState) {
        this.ownerState = ownerState;
    }
    
    public String getOwnerZip() {
        return ownerZip;
    }
    
    public void setOwnerZip(String ownerZip) {
        this.ownerZip = ownerZip;
    }
    
    public String getOwnerRelationship() {
        return ownerRelationship;
    }
    
    public void setOwnerRelationship(String ownerRelationship) {
        this.ownerRelationship = ownerRelationship;
    }
    
    public String getPayorFirstName() {
        return payorFirstName;
    }
    
    public void setPayorFirstName(String payorFirstName) {
        this.payorFirstName = payorFirstName;
    }
    
    public String getPayorLastName() {
        return payorLastName;
    }
    
    public void setPayorLastName(String payorLastName) {
        this.payorLastName = payorLastName;
    }
    
    public LocalDate getPayorDateOfBirth() {
        return payorDateOfBirth;
    }
    
    public void setPayorDateOfBirth(LocalDate payorDateOfBirth) {
        this.payorDateOfBirth = payorDateOfBirth;
    }
    
    public String getPayorSsn() {
        return payorSsn;
    }
    
    public void setPayorSsn(String payorSsn) {
        this.payorSsn = payorSsn;
    }
    
    public String getPayorEmail() {
        return payorEmail;
    }
    
    public void setPayorEmail(String payorEmail) {
        this.payorEmail = payorEmail;
    }
    
    public String getPayorPhone() {
        return payorPhone;
    }
    
    public void setPayorPhone(String payorPhone) {
        this.payorPhone = payorPhone;
    }
    
    public String getPayorAddress() {
        return payorAddress;
    }
    
    public void setPayorAddress(String payorAddress) {
        this.payorAddress = payorAddress;
    }
    
    public String getPayorCity() {
        return payorCity;
    }
    
    public void setPayorCity(String payorCity) {
        this.payorCity = payorCity;
    }
    
    public String getPayorState() {
        return payorState;
    }
    
    public void setPayorState(String payorState) {
        this.payorState = payorState;
    }
    
    public String getPayorZip() {
        return payorZip;
    }
    
    public void setPayorZip(String payorZip) {
        this.payorZip = payorZip;
    }
    
    public String getPayorRelationship() {
        return payorRelationship;
    }
    
    public void setPayorRelationship(String payorRelationship) {
        this.payorRelationship = payorRelationship;
    }
    
    public String getPrimaryBeneficiaryName() {
        return primaryBeneficiaryName;
    }
    
    public void setPrimaryBeneficiaryName(String primaryBeneficiaryName) {
        this.primaryBeneficiaryName = primaryBeneficiaryName;
    }
    
    public String getPrimaryBeneficiaryRelationship() {
        return primaryBeneficiaryRelationship;
    }
    
    public void setPrimaryBeneficiaryRelationship(String primaryBeneficiaryRelationship) {
        this.primaryBeneficiaryRelationship = primaryBeneficiaryRelationship;
    }
    
    public String getPrimaryBeneficiaryPercentage() {
        return primaryBeneficiaryPercentage;
    }
    
    public void setPrimaryBeneficiaryPercentage(String primaryBeneficiaryPercentage) {
        this.primaryBeneficiaryPercentage = primaryBeneficiaryPercentage;
    }
    
    public LocalDate getPrimaryBeneficiaryDateOfBirth() {
        return primaryBeneficiaryDateOfBirth;
    }
    
    public void setPrimaryBeneficiaryDateOfBirth(LocalDate primaryBeneficiaryDateOfBirth) {
        this.primaryBeneficiaryDateOfBirth = primaryBeneficiaryDateOfBirth;
    }
    
    public String getPrimaryBeneficiarySsn() {
        return primaryBeneficiarySsn;
    }
    
    public void setPrimaryBeneficiarySsn(String primaryBeneficiarySsn) {
        this.primaryBeneficiarySsn = primaryBeneficiarySsn;
    }
    
    public Tx1Status getStatus() {
        return status;
    }
    
    public void setStatus(Tx1Status status) {
        this.status = status;
    }
    
    public String getProcessingNotes() {
        return processingNotes;
    }
    
    public void setProcessingNotes(String processingNotes) {
        this.processingNotes = processingNotes;
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
}
