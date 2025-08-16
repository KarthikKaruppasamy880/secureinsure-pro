package com.secureinsure.policy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "policy_endorsements")
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"policy"})
@ToString(exclude = {"policy"})
@EntityListeners(AuditingEntityListener.class)
public class PolicyEndorsement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_id", nullable = false)
    @NotNull
    private Policy policy;
    
    @NotBlank
    @Size(max = 50)
    @Column(name = "endorsement_number", nullable = false, unique = true)
    private String endorsementNumber;
    
    @NotBlank
    @Size(max = 50)
    @Column(name = "endorsement_type", nullable = false)
    private String endorsementType;
    
    @NotBlank
    @Size(max = 500)
    @Column(name = "description", nullable = false)
    private String description;
    
    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;
    
    @Column(name = "expiry_date")
    private LocalDate expiryDate;
    
    @Column(name = "premium_change", precision = 15, scale = 2)
    private BigDecimal premiumChange;
    
    @Column(name = "coverage_change", precision = 15, scale = 2)
    private BigDecimal coverageChange;
    
    @Size(max = 20)
    @Column(name = "status")
    @Builder.Default
    private String status = "PENDING";
    
    @Size(max = 1000)
    @Column(name = "reason")
    private String reason;
    
    @Column(name = "requested_by")
    private Long requestedBy;
    
    @Column(name = "approved_by")
    private Long approvedBy;
    
    @Column(name = "approval_date")
    private LocalDate approvalDate;
    
    @Size(max = 1000)
    @Column(name = "approval_notes")
    private String approvalNotes;
    
    @Size(max = 1000)
    @Column(name = "rejection_notes")
    private String rejectionNotes;
    
    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "documents", columnDefinition = "TEXT")
    private String documents;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "created_by")
    private Long createdBy;
    
    @Column(name = "updated_by")
    private Long updatedBy;
}

