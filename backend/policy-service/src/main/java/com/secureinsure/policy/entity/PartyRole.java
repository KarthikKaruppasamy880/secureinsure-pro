package com.secureinsure.policy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "party_roles")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartyRole extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Party is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "party_id", nullable = false)
    private Party party;

    @NotNull(message = "Case is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private InsuranceCase insuranceCase;

    @NotNull(message = "Role type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "role_type", nullable = false)
    private RoleType roleType;

    @Column(name = "beneficiary_percentage")
    private BigDecimal beneficiaryPercentage;

    @Column(name = "beneficiary_type")
    @Enumerated(EnumType.STRING)
    private BeneficiaryType beneficiaryType;

    @Column(name = "relationship_to_insured")
    private String relationshipToInsured;

    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    @Column(name = "effective_date")
    private LocalDateTime effectiveDate;

    @Column(name = "termination_date")
    private LocalDateTime terminationDate;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (effectiveDate == null) {
            effectiveDate = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum RoleType {
        INSURED("Insured"),
        OWNER("Owner"),
        PAYOR("Payor"),
        BENEFICIARY("Beneficiary"),
        CONTINGENT_BENEFICIARY("Contingent Beneficiary"),
        TRUSTEE("Trustee"),
        POWER_OF_ATTORNEY("Power of Attorney"),
        GUARDIAN("Guardian");

        private final String displayName;

        RoleType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum BeneficiaryType {
        PRIMARY("Primary"),
        CONTINGENT("Contingent"),
        REVOCABLE("Revocable"),
        IRREVOCABLE("Irrevocable");

        private final String displayName;

        BeneficiaryType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}
