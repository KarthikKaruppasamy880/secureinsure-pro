package com.secureinsure.policy.dto;

import com.secureinsure.policy.entity.PartyRole;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartyRoleDto {

    private Long id;
    private Long partyId;
    private Long caseId;
    
    @NotNull(message = "Role type is required")
    private String roleType;
    
    private BigDecimal beneficiaryPercentage;
    private String beneficiaryType;
    private String relationshipToInsured;
    private Boolean isPrimary;
    private LocalDateTime effectiveDate;
    private LocalDateTime terminationDate;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Related data
    private PartyDto party;
    private InsuranceCaseDto insuranceCase;

    public static PartyRoleDto fromEntity(PartyRole partyRole) {
        if (partyRole == null) {
            return null;
        }

        return PartyRoleDto.builder()
                .id(partyRole.getId())
                .partyId(partyRole.getParty() != null ? partyRole.getParty().getId() : null)
                .caseId(partyRole.getInsuranceCase() != null ? partyRole.getInsuranceCase().getId() : null)
                .roleType(partyRole.getRoleType().name())
                .beneficiaryPercentage(partyRole.getBeneficiaryPercentage())
                .beneficiaryType(partyRole.getBeneficiaryType() != null ? partyRole.getBeneficiaryType().name() : null)
                .relationshipToInsured(partyRole.getRelationshipToInsured())
                .isPrimary(partyRole.getIsPrimary())
                .effectiveDate(partyRole.getEffectiveDate())
                .terminationDate(partyRole.getTerminationDate())
                .isActive(partyRole.getIsActive())
                .createdAt(partyRole.getCreatedAt())
                .updatedAt(partyRole.getUpdatedAt())
                .build();
    }

    public PartyRole toEntity() {
        return PartyRole.builder()
                .id(this.id)
                .roleType(PartyRole.RoleType.valueOf(this.roleType))
                .beneficiaryPercentage(this.beneficiaryPercentage)
                .beneficiaryType(this.beneficiaryType != null ? 
                    PartyRole.BeneficiaryType.valueOf(this.beneficiaryType) : null)
                .relationshipToInsured(this.relationshipToInsured)
                .isPrimary(this.isPrimary)
                .effectiveDate(this.effectiveDate)
                .terminationDate(this.terminationDate)
                .isActive(this.isActive)
                .createdAt(this.createdAt)
                .updatedAt(this.updatedAt)
                .build();
    }
}
