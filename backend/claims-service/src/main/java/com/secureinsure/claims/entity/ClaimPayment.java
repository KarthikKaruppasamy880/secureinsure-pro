package com.secureinsure.claims.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
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
@Table(name = "claim_payments")
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"claim"})
@ToString(exclude = {"claim"})
@EntityListeners(AuditingEntityListener.class)
public class ClaimPayment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_id", nullable = false)
    @NotNull
    private Claim claim;
    
    @NotBlank
    @Size(max = 50)
    @Column(name = "payment_number", nullable = false, unique = true)
    private String paymentNumber;
    
    @NotNull
    @DecimalMin(value = "0.01")
    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;
    
    @Builder.Default
    @NotBlank
    @Size(max = 3)
    @Column(name = "currency", nullable = false)
    private String currency = "USD";
    
    @NotBlank
    @Size(max = 50)
    @Column(name = "payment_type", nullable = false)
    private String paymentType;
    
    @Size(max = 50)
    @Column(name = "payment_method")
    private String paymentMethod;
    
    @Builder.Default
    @NotBlank
    @Size(max = 20)
    @Column(name = "status", nullable = false)
    private String status = "PENDING";
    
    @Column(name = "payment_date")
    private LocalDate paymentDate;
    
    @Column(name = "scheduled_date")
    private LocalDate scheduledDate;
    
    @Size(max = 500)
    @Column(name = "description")
    private String description;
    
    @Size(max = 100)
    @Column(name = "payee_name")
    private String payeeName;
    
    @Size(max = 50)
    @Column(name = "account_number")
    private String accountNumber;
    
    @Size(max = 20)
    @Column(name = "routing_number")
    private String routingNumber;
    
    @Size(max = 100)
    @Column(name = "bank_name")
    private String bankName;
    
    @Column(name = "transaction_reference")
    private String transactionReference;
    
    @Builder.Default
    @Column(name = "requires_approval")
    private Boolean requiresApproval = true;
    
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
    
    @Column(name = "approved_by")
    private Long approvedBy;
    
    @Column(name = "processed_at")
    private LocalDateTime processedAt;
    
    @Size(max = 500)
    @Column(name = "failure_reason")
    private String failureReason;
    
    @Builder.Default
    @Column(name = "retry_count")
    private Integer retryCount = 0;
    
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











