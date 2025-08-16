package com.secureinsure.policy.dto;

import com.secureinsure.policy.entity.Tx1Status;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class Tx1TransactionDto {
    private Long id;
    private String caseNumber;
    private String zinniaCaseId;
    private String policyNumber;
    private LocalDate applicationDate;
    private String productType;
    private BigDecimal faceAmount;
    private String premiumMode;
    private String agentName;
    private String branch;
    
    // Insured Information
    private String insuredFirstName;
    private String insuredLastName;
    private LocalDate insuredDateOfBirth;
    private Integer insuredAge;
    private String insuredGender;
    private String insuredSsn;
    private String insuredEmail;
    private String insuredPhone;
    private String insuredAddress;
    private String insuredCity;
    private String insuredState;
    private String insuredZip;
    private String insuredOccupation;
    private BigDecimal insuredAnnualIncome;
    
    // Owner Information
    private String ownerFirstName;
    private String ownerLastName;
    private LocalDate ownerDateOfBirth;
    private String ownerSsn;
    private String ownerEmail;
    private String ownerPhone;
    private String ownerAddress;
    private String ownerCity;
    private String ownerState;
    private String ownerZip;
    private String ownerRelationship;
    
    // Payor Information
    private String payorFirstName;
    private String payorLastName;
    private LocalDate payorDateOfBirth;
    private String payorSsn;
    private String payorEmail;
    private String payorPhone;
    private String payorAddress;
    private String payorCity;
    private String payorState;
    private String payorZip;
    private String payorRelationship;
    
    // Beneficiary Information
    private String primaryBeneficiaryName;
    private String primaryBeneficiaryRelationship;
    private String primaryBeneficiaryPercentage;
    private LocalDate primaryBeneficiaryDateOfBirth;
    private String primaryBeneficiarySsn;
    
    // Status
    private Tx1Status status;
    private String processingNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
