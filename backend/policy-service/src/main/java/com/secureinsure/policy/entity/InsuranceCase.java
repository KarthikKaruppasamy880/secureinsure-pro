package com.secureinsure.policy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "insurance_cases")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsuranceCase extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Case number is required")
    @Column(name = "case_number", unique = true, nullable = false)
    private String caseNumber;

    @Column(name = "zinnia_case_id", unique = true)
    private String zinniaCaseId;

    @Column(name = "policy_number")
    private String policyNumber;

    @NotBlank(message = "Product type is required")
    @Column(name = "product_type", nullable = false)
    private String productType;

    @NotBlank(message = "Plan name is required")
    @Column(name = "plan_name", nullable = false)
    private String planName;

    @NotNull(message = "Face amount is required")
    @Column(name = "face_amount", nullable = false)
    private BigDecimal faceAmount;

    @Column(name = "premium_amount")
    private BigDecimal premiumAmount;

    @Column(name = "premium_mode")
    @Enumerated(EnumType.STRING)
    private PremiumMode premiumMode;

    @NotNull(message = "Application date is required")
    @Column(name = "application_date", nullable = false)
    private LocalDate applicationDate;

    @Column(name = "date_received")
    private LocalDate dateReceived;

    @Column(name = "application_state")
    private String applicationState;

    @Column(name = "language")
    private String language;

    @Column(name = "priority")
    @Enumerated(EnumType.STRING)
    private Priority priority;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private CaseStatus status;

    @Column(name = "submission_type")
    @Enumerated(EnumType.STRING)
    private SubmissionType submissionType;

    @Column(name = "insurance_age_basis")
    private String insuranceAgeBasis;

    @Column(name = "insurance_age_effective_date")
    private LocalDate insuranceAgeEffectiveDate;

    @Column(name = "group_name")
    private String groupName;

    @Column(name = "notes")
    @Lob
    private String notes;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "insuranceCase", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<PartyRole> partyRoles = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = CaseStatus.DRAFT;
        }
        if (priority == null) {
            priority = Priority.NORMAL;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum CaseStatus {
        DRAFT("Draft"),
        SUBMITTED("Submitted"),
        UNDER_REVIEW("Under Review"),
        APPROVED("Approved"),
        DECLINED("Declined"),
        WITHDRAWN("Withdrawn"),
        PENDING_DOCUMENTS("Pending Documents"),
        PENDING_MEDICAL("Pending Medical"),
        ISSUED("Issued");

        private final String displayName;

        CaseStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum Priority {
        LOW("Low"),
        NORMAL("Normal"),
        HIGH("High"),
        URGENT("Urgent");

        private final String displayName;

        Priority(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum PremiumMode {
        MONTHLY("Monthly"),
        QUARTERLY("Quarterly"),
        SEMI_ANNUAL("Semi-Annual"),
        ANNUAL("Annual");

        private final String displayName;

        PremiumMode(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum SubmissionType {
        PAPER("Paper"),
        ELECTRONIC("Electronic"),
        AGENT("Agent"),
        ONLINE("Online");

        private final String displayName;

        SubmissionType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}
