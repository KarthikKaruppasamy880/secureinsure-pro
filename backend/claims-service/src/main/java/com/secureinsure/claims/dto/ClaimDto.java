package com.secureinsure.claims.dto;

import com.secureinsure.claims.entity.ClaimStatus;
import com.secureinsure.claims.entity.ClaimType;
import com.secureinsure.claims.entity.PriorityLevel;
import com.secureinsure.claims.entity.RiskLevel;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Claim Data Transfer Object")
public class ClaimDto {
    
    private Long id;
    
    @NotBlank(message = "Claim number is required")
    @Pattern(regexp = "^CLM-[A-Z]{2}-\\d{6}$", message = "Claim number must follow format CLM-XX-XXXXXX")
    @Schema(description = "Claim number", example = "CLM-AU-123456")
    private String claimNumber;
    
    @NotNull(message = "Policy ID is required")
    @Schema(description = "Policy ID", example = "1")
    private Long policyId;
    
    @NotNull(message = "Customer ID is required")
    @Schema(description = "Customer ID", example = "1")
    private Long customerId;
    
    @NotNull(message = "Claim type is required")
    @Schema(description = "Type of claim", example = "AUTO_COLLISION")
    private ClaimType claimType;
    
    @NotNull(message = "Claim status is required")
    @Schema(description = "Status of the claim", example = "SUBMITTED")
    private ClaimStatus status;
    
    @NotNull(message = "Priority level is required")
    @Schema(description = "Priority level of the claim", example = "NORMAL")
    private PriorityLevel priorityLevel;
    
    @NotNull(message = "Risk level is required")
    @Schema(description = "Risk level of the claim", example = "MEDIUM")
    private RiskLevel riskLevel;
    
    @NotNull(message = "Incident date is required")
    @PastOrPresent(message = "Incident date cannot be in the future")
    @Schema(description = "Date of the incident", example = "2024-01-15")
    private LocalDate incidentDate;
    
    @NotNull(message = "Reported date is required")
    @PastOrPresent(message = "Reported date cannot be in the future")
    @Schema(description = "Date when claim was reported", example = "2024-01-16T10:30:00")
    private LocalDateTime reportedDate;
    
    @NotBlank(message = "Incident location is required")
    @Size(max = 500, message = "Incident location cannot exceed 500 characters")
    @Schema(description = "Location of the incident", example = "123 Main St, Sydney, NSW 2000")
    private String incidentLocation;
    
    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
    @Schema(description = "Detailed description of the incident", example = "Vehicle collision at intersection")
    private String description;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Estimated amount must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Estimated amount must have at most 10 digits and 2 decimal places")
    @Schema(description = "Estimated claim amount", example = "5000.00")
    private BigDecimal estimatedAmount;
    
    @DecimalMin(value = "0.0", inclusive = true, message = "Approved amount cannot be negative")
    @Digits(integer = 10, fraction = 2, message = "Approved amount must have at most 10 digits and 2 decimal places")
    @Schema(description = "Approved claim amount", example = "4500.00")
    private BigDecimal approvedAmount;
    
    @DecimalMin(value = "0.0", inclusive = true, message = "Paid amount cannot be negative")
    @Digits(integer = 10, fraction = 2, message = "Paid amount must have at most 10 digits and 2 decimal places")
    @Schema(description = "Amount paid to date", example = "3000.00")
    private BigDecimal paidAmount;
    
    @DecimalMin(value = "0.0", inclusive = true, message = "Deductible cannot be negative")
    @Digits(integer = 10, fraction = 2, message = "Deductible must have at most 10 digits and 2 decimal places")
    @Schema(description = "Deductible amount", example = "500.00")
    private BigDecimal deductible;
    
    @DecimalMin(value = "0.0", inclusive = true, message = "Co-pay cannot be negative")
    @Digits(integer = 10, fraction = 2, message = "Co-pay must have at most 10 digits and 2 decimal places")
    @Schema(description = "Co-pay amount", example = "100.00")
    private BigDecimal coPay;
    
    @Min(value = 0, message = "Fraud score cannot be negative")
    @Max(value = 100, message = "Fraud score cannot exceed 100")
    @Schema(description = "Fraud risk score (0-100)", example = "15.5")
    private Double fraudScore;
    
    @Schema(description = "Agent ID assigned to the claim", example = "1")
    private Long agentId;
    
    @Schema(description = "Adjuster ID assigned to the claim", example = "2")
    private Long adjusterId;
    
    @Schema(description = "Underwriter ID for the claim", example = "3")
    private Long underwriterId;
    
    @Size(max = 1000, message = "Investigation notes cannot exceed 1000 characters")
    @Schema(description = "Investigation notes", example = "Initial investigation completed")
    private String investigationNotes;
    
    @Size(max = 1000, message = "Approval notes cannot exceed 1000 characters")
    @Schema(description = "Approval notes", example = "Claim approved based on policy terms")
    private String approvalNotes;
    
    @Size(max = 1000, message = "Rejection notes cannot exceed 1000 characters")
    @Schema(description = "Rejection notes", example = "Claim rejected due to policy exclusions")
    private String rejectionNotes;
    
    @Schema(description = "Date when claim was approved", example = "2024-01-20T14:30:00")
    private LocalDateTime approvedAt;
    
    @Schema(description = "Date when claim was rejected", example = "2024-01-20T14:30:00")
    private LocalDateTime rejectedAt;
    
    @Schema(description = "Date when claim was closed", example = "2024-01-25T16:45:00")
    private LocalDateTime closedAt;
    
    @Schema(description = "Date when claim was archived", example = "2024-02-01T09:00:00")
    private LocalDateTime archivedAt;
    
    @Schema(description = "ID of user who approved the claim", example = "1")
    private Long approvedBy;
    
    @Schema(description = "ID of user who rejected the claim", example = "1")
    private Long rejectedBy;
    
    @Schema(description = "ID of user who closed the claim", example = "1")
    private Long closedBy;
    
    @Schema(description = "ID of user who archived the claim", example = "1")
    private Long archivedBy;
    
    @Schema(description = "Date when claim was created", example = "2024-01-16T10:30:00")
    private LocalDateTime createdAt;
    
    @Schema(description = "Date when claim was last updated", example = "2024-01-20T14:30:00")
    private LocalDateTime updatedAt;
    
    @Schema(description = "List of claim documents")
    private List<ClaimDocumentDto> documents;
    
    @Schema(description = "List of claim notes")
    private List<ClaimNoteDto> notes;
    
    @Schema(description = "List of claim payments")
    private List<ClaimPaymentDto> payments;
    
    @Schema(description = "List of claim activities")
    private List<ClaimActivityDto> activities;
    
    // Additional fields for enhanced functionality
    @Schema(description = "Whether the claim is urgent", example = "false")
    private Boolean isUrgent;
    
    @Schema(description = "Whether the claim requires immediate attention", example = "false")
    private Boolean requiresImmediateAttention;
    
    @Schema(description = "Days since the claim was last updated", example = "5")
    private Long daysSinceLastUpdate;
    
    @Schema(description = "Days until claim expires", example = "25")
    private Long daysUntilExpiry;
    
    @Schema(description = "Whether the claim is expiring soon", example = "false")
    private Boolean isExpiringSoon;
    
    @Schema(description = "Outstanding amount to be paid", example = "1500.00")
    private BigDecimal outstandingAmount;
    
    @Schema(description = "Percentage of claim processed", example = "66.67")
    private Double processingPercentage;
    
    @Schema(description = "Whether fraud detection is enabled", example = "true")
    private Boolean fraudDetectionEnabled;
    
    @Schema(description = "Risk assessment score", example = "75.5")
    private Double riskAssessmentScore;
    
    @Schema(description = "Customer satisfaction score", example = "4.5")
    private Double customerSatisfactionScore;
    
    @Schema(description = "Processing time in days", example = "10")
    private Long processingTimeDays;
    
    @Schema(description = "Whether the claim is under investigation", example = "false")
    private Boolean isUnderInvestigation;
    
    @Schema(description = "Whether the claim requires additional documents", example = "true")
    private Boolean requiresAdditionalDocuments;
    
    @Schema(description = "Whether the claim is ready for payment", example = "false")
    private Boolean isReadyForPayment;
    
    @Schema(description = "Whether the claim is ready for approval", example = "true")
    private Boolean isReadyForApproval;
} 