package com.secureinsure.claims.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Claim Payment Data Transfer Object")
public class ClaimPaymentDto {
    
    private Long id;
    
    @NotNull(message = "Claim ID is required")
    @Schema(description = "Associated claim ID")
    private Long claimId;
    
    @NotBlank(message = "Payment number is required")
    @Size(max = 50, message = "Payment number must not exceed 50 characters")
    @Schema(description = "Payment reference number", example = "PAY-CLM-123456-001")
    private String paymentNumber;
    
    @NotNull(message = "Payment amount is required")
    @DecimalMin(value = "0.01", message = "Payment amount must be positive")
    @Schema(description = "Payment amount", example = "1500.00")
    private BigDecimal amount;
    
    @NotBlank(message = "Currency is required")
    @Size(max = 3, message = "Currency must be 3 characters")
    @Schema(description = "Payment currency", example = "USD")
    private String currency = "USD";
    
    @NotBlank(message = "Payment type is required")
    @Size(max = 50, message = "Payment type must not exceed 50 characters")
    @Schema(description = "Payment type", example = "SETTLEMENT")
    private String paymentType;
    
    @Size(max = 50, message = "Payment method must not exceed 50 characters")
    @Schema(description = "Payment method", example = "BANK_TRANSFER")
    private String paymentMethod;
    
    @NotBlank(message = "Payment status is required")
    @Size(max = 20, message = "Payment status must not exceed 20 characters")
    @Schema(description = "Payment status", example = "PENDING")
    private String status = "PENDING";
    
    @Schema(description = "Payment date")
    private LocalDate paymentDate;
    
    @Schema(description = "Scheduled payment date")
    private LocalDate scheduledDate;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    @Schema(description = "Payment description")
    private String description;
    
    @Size(max = 100, message = "Payee name must not exceed 100 characters")
    @Schema(description = "Payee name")
    private String payeeName;
    
    @Size(max = 50, message = "Account number must not exceed 50 characters")
    @Schema(description = "Payee account number")
    private String accountNumber;
    
    @Size(max = 20, message = "Routing number must not exceed 20 characters")
    @Schema(description = "Bank routing number")
    private String routingNumber;
    
    @Size(max = 100, message = "Bank name must not exceed 100 characters")
    @Schema(description = "Bank name")
    private String bankName;
    
    @Schema(description = "Transaction reference from payment gateway")
    private String transactionReference;
    
    @Schema(description = "Whether payment requires approval")
    private Boolean requiresApproval = true;
    
    @Schema(description = "Approval timestamp")
    private LocalDateTime approvedAt;
    
    @Schema(description = "User who approved the payment")
    private Long approvedBy;
    
    @Schema(description = "Payment processing timestamp")
    private LocalDateTime processedAt;
    
    @Schema(description = "Failure reason if payment failed")
    private String failureReason;
    
    @Schema(description = "Payment retry count")
    private Integer retryCount = 0;
    
    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;
    
    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;
    
    @Schema(description = "User who created the payment")
    private Long createdBy;
    
    @Schema(description = "User who last updated the payment")
    private Long updatedBy;
}











