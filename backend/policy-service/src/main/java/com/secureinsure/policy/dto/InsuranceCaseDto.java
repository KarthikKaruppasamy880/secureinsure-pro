package com.secureinsure.policy.dto;

import com.secureinsure.policy.entity.InsuranceCase;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsuranceCaseDto {

    private Long id;

    @NotBlank(message = "Case number is required")
    private String caseNumber;

    private String zinniaCaseId;
    private String policyNumber;

    @NotBlank(message = "Product type is required")
    private String productType;

    @NotBlank(message = "Plan name is required")
    private String planName;

    @NotNull(message = "Face amount is required")
    private BigDecimal faceAmount;

    private BigDecimal premiumAmount;
    private String premiumMode;

    @NotNull(message = "Application date is required")
    private LocalDate applicationDate;

    private LocalDate dateReceived;
    private String applicationState;
    private String language;
    private String priority;
    private String status;
    private String submissionType;
    private String insuranceAgeBasis;
    private LocalDate insuranceAgeEffectiveDate;
    private String groupName;
    private String notes;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Related data
    private Set<PartyRoleDto> partyRoles;

    public static InsuranceCaseDto fromEntity(InsuranceCase insuranceCase) {
        if (insuranceCase == null) {
            return null;
        }

        return InsuranceCaseDto.builder()
                .id(insuranceCase.getId())
                .caseNumber(insuranceCase.getCaseNumber())
                .zinniaCaseId(insuranceCase.getZinniaCaseId())
                .policyNumber(insuranceCase.getPolicyNumber())
                .productType(insuranceCase.getProductType())
                .planName(insuranceCase.getPlanName())
                .faceAmount(insuranceCase.getFaceAmount())
                .premiumAmount(insuranceCase.getPremiumAmount())
                .premiumMode(insuranceCase.getPremiumMode() != null ? insuranceCase.getPremiumMode().name() : null)
                .applicationDate(insuranceCase.getApplicationDate())
                .dateReceived(insuranceCase.getDateReceived())
                .applicationState(insuranceCase.getApplicationState())
                .language(insuranceCase.getLanguage())
                .priority(insuranceCase.getPriority() != null ? insuranceCase.getPriority().name() : null)
                .status(insuranceCase.getStatus() != null ? insuranceCase.getStatus().name() : null)
                .submissionType(insuranceCase.getSubmissionType() != null ? insuranceCase.getSubmissionType().name() : null)
                .insuranceAgeBasis(insuranceCase.getInsuranceAgeBasis())
                .insuranceAgeEffectiveDate(insuranceCase.getInsuranceAgeEffectiveDate())
                .groupName(insuranceCase.getGroupName())
                .notes(insuranceCase.getNotes())
                .isActive(insuranceCase.getIsActive())
                .createdAt(insuranceCase.getCreatedAt())
                .updatedAt(insuranceCase.getUpdatedAt())
                .partyRoles(insuranceCase.getPartyRoles() != null ? 
                    insuranceCase.getPartyRoles().stream()
                        .map(PartyRoleDto::fromEntity)
                        .collect(Collectors.toSet()) : null)
                .build();
    }

    public InsuranceCase toEntity() {
        return InsuranceCase.builder()
                .id(this.id)
                .caseNumber(this.caseNumber)
                .zinniaCaseId(this.zinniaCaseId)
                .policyNumber(this.policyNumber)
                .productType(this.productType)
                .planName(this.planName)
                .faceAmount(this.faceAmount)
                .premiumAmount(this.premiumAmount)
                .premiumMode(this.premiumMode != null ? 
                    InsuranceCase.PremiumMode.valueOf(this.premiumMode) : null)
                .applicationDate(this.applicationDate)
                .dateReceived(this.dateReceived)
                .applicationState(this.applicationState)
                .language(this.language)
                .priority(this.priority != null ? 
                    InsuranceCase.Priority.valueOf(this.priority) : null)
                .status(this.status != null ? 
                    InsuranceCase.CaseStatus.valueOf(this.status) : null)
                .submissionType(this.submissionType != null ? 
                    InsuranceCase.SubmissionType.valueOf(this.submissionType) : null)
                .insuranceAgeBasis(this.insuranceAgeBasis)
                .insuranceAgeEffectiveDate(this.insuranceAgeEffectiveDate)
                .groupName(this.groupName)
                .notes(this.notes)
                .isActive(this.isActive)
                .createdAt(this.createdAt)
                .updatedAt(this.updatedAt)
                .build();
    }
}
