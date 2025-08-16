package com.secureinsure.policy.dto;

import com.secureinsure.policy.entity.PolicyStatus;
import com.secureinsure.policy.entity.PolicyType;
import com.secureinsure.policy.entity.CoverageType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Policy Data Transfer Object")
public class PolicyDto {
    
    @Schema(description = "Policy ID", example = "1")
    private Long id;
    
    @NotBlank(message = "Policy number is required")
    @Pattern(regexp = "^POL-[A-Z]{2}-\\d{6}$", message = "Policy number must follow format POL-XX-XXXXXX")
    @Schema(description = "Policy number", example = "POL-AU-123456")
    private String policyNumber;
    
    @NotNull(message = "Customer ID is required")
    @Schema(description = "Customer ID", example = "1001")
    private Long customerId;
    
    @NotNull(message = "Policy type is required")
    @Schema(description = "Policy type", example = "AUTO")
    private PolicyType policyType;
    
    @NotEmpty(message = "Coverage types are required")
    @Schema(description = "Coverage types", example = "[\"LIABILITY\", \"COLLISION\"]")
    private List<CoverageType> coverageTypes;
    
    @NotNull(message = "Effective date is required")
    @FutureOrPresent(message = "Effective date must be today or in the future")
    @Schema(description = "Policy effective date", example = "2024-01-01")
    private LocalDate effectiveDate;
    
    @NotNull(message = "Expiry date is required")
    @Future(message = "Expiry date must be in the future")
    @Schema(description = "Policy expiry date", example = "2025-01-01")
    private LocalDate expiryDate;
    
    @NotNull(message = "Premium amount is required")
    @DecimalMin(value = "0.01", message = "Premium amount must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Premium amount must have up to 10 digits and 2 decimal places")
    @Schema(description = "Premium amount", example = "1200.00")
    private BigDecimal premiumAmount;
    
    @NotNull(message = "Sum insured is required")
    @DecimalMin(value = "1000.00", message = "Sum insured must be at least 1000")
    @Digits(integer = 15, fraction = 2, message = "Sum insured must have up to 15 digits and 2 decimal places")
    @Schema(description = "Sum insured amount", example = "50000.00")
    private BigDecimal sumInsured;
    
    @NotNull(message = "Deductible amount is required")
    @DecimalMin(value = "0.00", message = "Deductible amount must be 0 or greater")
    @Digits(integer = 10, fraction = 2, message = "Deductible amount must have up to 10 digits and 2 decimal places")
    @Schema(description = "Deductible amount", example = "500.00")
    private BigDecimal deductibleAmount;
    
    @Schema(description = "Policy status", example = "ACTIVE")
    private PolicyStatus status;
    
    @NotBlank(message = "Risk level is required")
    @Pattern(regexp = "^(LOW|MEDIUM|HIGH)$", message = "Risk level must be LOW, MEDIUM, or HIGH")
    @Schema(description = "Risk level", example = "MEDIUM")
    private String riskLevel;
    
    @DecimalMin(value = "0.00", message = "Discount percentage must be 0 or greater")
    @DecimalMax(value = "100.00", message = "Discount percentage cannot exceed 100")
    @Digits(integer = 3, fraction = 2, message = "Discount percentage must have up to 3 digits and 2 decimal places")
    @Schema(description = "Discount percentage", example = "10.00")
    private BigDecimal discountPercentage;
    
    @Schema(description = "Agent ID", example = "2001")
    private Long agentId;
    
    @Schema(description = "Underwriter ID", example = "3001")
    private Long underwriterId;
    
    @Schema(description = "Approval status", example = "APPROVED")
    private String approvalStatus;
    
    @Schema(description = "Approved by user ID", example = "4001")
    private Long approvedBy;
    
    @Schema(description = "Approval date", example = "2024-01-01T10:00:00")
    private String approvalDate;
    
    @Schema(description = "Auto renewal flag", example = "true")
    private Boolean autoRenewal;
    
    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    @Schema(description = "Policy notes", example = "Special conditions apply")
    private String notes;
    
    @Schema(description = "Created date", example = "2024-01-01T10:00:00")
    private String createdAt;
    
    @Schema(description = "Updated date", example = "2024-01-01T10:00:00")
    private String updatedAt;
    
    // Additional fields for response
    @Schema(description = "Customer name", example = "John Doe")
    private String customerName;
    
    @Schema(description = "Agent name", example = "Jane Smith")
    private String agentName;
    
    @Schema(description = "Underwriter name", example = "Mike Johnson")
    private String underwriterName;
    
    @Schema(description = "Days until expiry", example = "30")
    private Long daysUntilExpiry;
    
    @Schema(description = "Is policy expiring soon", example = "true")
    private Boolean isExpiringSoon;
    
    @Schema(description = "Total documents count", example = "5")
    private Long documentsCount;
    
    @Schema(description = "Total payments count", example = "3")
    private Long paymentsCount;
    
    @Schema(description = "Last payment date", example = "2024-01-01")
    private LocalDate lastPaymentDate;
    
    @Schema(description = "Next payment due date", example = "2024-02-01")
    private LocalDate nextPaymentDueDate;
    
    @Schema(description = "Outstanding premium amount", example = "300.00")
    private BigDecimal outstandingPremium;
} 