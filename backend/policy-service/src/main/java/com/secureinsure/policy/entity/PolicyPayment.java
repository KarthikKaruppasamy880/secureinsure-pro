package com.secureinsure.policy.entity;

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
@Table(name = "policy_payments")
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"policy"})
@ToString(exclude = {"policy"})
@EntityListeners(AuditingEntityListener.class)
public class PolicyPayment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_id", nullable = false)
    @NotNull
    private Policy policy;
    
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
    
    @Column(name = "due_date")
    private LocalDate dueDate;
    
    @Column(name = "payment_date")
    private LocalDate paymentDate;
    
    @Column(name = "processed_date")
    private LocalDate processedDate;
    
    @Size(max = 500)
    @Column(name = "description")
    private String description;
    
    @Size(max = 100)
    @Column(name = "payer_name")
    private String payerName;
    
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
    
    @Column(name = "confirmation_number")
    private String confirmationNumber;
    
    @Size(max = 500)
    @Column(name = "failure_reason")
    private String failureReason;
    
    @Builder.Default
    @Column(name = "retry_count")
    private Integer retryCount = 0;
    
    @Column(name = "next_retry_date")
    private LocalDate nextRetryDate;
    
    @Builder.Default
    @Column(name = "is_recurring")
    private Boolean isRecurring = false;
    
    @Column(name = "recurring_frequency")
    private String recurringFrequency;
    
    @Column(name = "next_payment_date")
    private LocalDate nextPaymentDate;
    
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











