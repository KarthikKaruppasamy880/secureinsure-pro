package com.secureinsure.claims.service;

import com.secureinsure.claims.dto.ClaimDto;
import com.secureinsure.claims.entity.ClaimStatus;
import com.secureinsure.claims.entity.ClaimType;
import com.secureinsure.claims.entity.PriorityLevel;
import com.secureinsure.claims.entity.RiskLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface ClaimService {
    
    // Basic CRUD operations
    ClaimDto createClaim(ClaimDto claimDto);
    ClaimDto getClaimById(Long id);
    ClaimDto getClaimByNumber(String claimNumber);
    Page<ClaimDto> getAllClaims(Pageable pageable);
    ClaimDto updateClaim(Long id, ClaimDto claimDto);
    void deleteClaim(Long id);
    
    // Search and filter operations
    Page<ClaimDto> searchClaims(
            Long customerId, Long policyId, ClaimType claimType, ClaimStatus status,
            Long agentId, Long adjusterId, PriorityLevel priorityLevel, RiskLevel riskLevel,
            BigDecimal minEstimatedAmount, BigDecimal maxEstimatedAmount,
            BigDecimal minApprovedAmount, BigDecimal maxApprovedAmount,
            BigDecimal minPaidAmount, BigDecimal maxPaidAmount,
            LocalDate startDate, LocalDate endDate,
            String incidentLocation, String description, Pageable pageable
    );
    
    // Customer-related operations
    List<ClaimDto> getClaimsByCustomerId(Long customerId);
    Page<ClaimDto> getClaimsByCustomerId(Long customerId, Pageable pageable);
    List<ClaimDto> getClaimsByCustomerIdAndStatus(Long customerId, ClaimStatus status);
    List<ClaimDto> getClaimsByCustomerIdAndType(Long customerId, ClaimType claimType);
    
    // Policy-related operations
    List<ClaimDto> getClaimsByPolicyId(Long policyId);
    Page<ClaimDto> getClaimsByPolicyId(Long policyId, Pageable pageable);
    List<ClaimDto> getClaimsByPolicyIdAndStatus(Long policyId, ClaimStatus status);
    List<ClaimDto> getClaimsByPolicyIdAndType(Long policyId, ClaimType claimType);
    
    // Status-based operations
    List<ClaimDto> getClaimsByStatus(ClaimStatus status);
    List<ClaimDto> getClaimsByStatuses(List<ClaimStatus> statuses);
    long countClaimsByStatus(ClaimStatus status);
    long countClaimsByStatuses(List<ClaimStatus> statuses);
    
    // Type-based operations
    List<ClaimDto> getClaimsByType(ClaimType claimType);
    long countClaimsByType(ClaimType claimType);
    
    // Priority and Risk operations
    List<ClaimDto> getClaimsByPriority(PriorityLevel priorityLevel);
    List<ClaimDto> getClaimsByRiskLevel(RiskLevel riskLevel);
    long countClaimsByPriority(PriorityLevel priorityLevel);
    long countClaimsByRiskLevel(RiskLevel riskLevel);
    
    // Date-based operations
    List<ClaimDto> getClaimsByIncidentDateRange(LocalDate startDate, LocalDate endDate);
    List<ClaimDto> getClaimsByReportedDateRange(LocalDate startDate, LocalDate endDate);
    List<ClaimDto> getClaimsByCreatedDateRange(LocalDate startDate, LocalDate endDate);
    
    // Amount-based operations
    List<ClaimDto> getClaimsByEstimatedAmountRange(BigDecimal minAmount, BigDecimal maxAmount);
    List<ClaimDto> getClaimsByApprovedAmountRange(BigDecimal minAmount, BigDecimal maxAmount);
    List<ClaimDto> getClaimsByPaidAmountRange(BigDecimal minAmount, BigDecimal maxAmount);
    
    // Agent and Adjuster operations
    List<ClaimDto> getClaimsByAgentId(Long agentId);
    List<ClaimDto> getClaimsByAdjusterId(Long adjusterId);
    List<ClaimDto> getClaimsByAgentIdAndStatus(Long agentId, ClaimStatus status);
    List<ClaimDto> getClaimsByAdjusterIdAndStatus(Long adjusterId, ClaimStatus status);
    
    // Claim lifecycle operations
    ClaimDto submitClaim(Long claimId);
    ClaimDto approveClaim(Long claimId, Long approvedBy, String approvalNotes);
    ClaimDto rejectClaim(Long claimId, Long rejectedBy, String rejectionNotes);
    ClaimDto closeClaim(Long claimId, Long closedBy);
    ClaimDto reopenClaim(Long claimId, Long reopenedBy);
    ClaimDto archiveClaim(Long claimId, Long archivedBy);
    
    // Status transitions
    ClaimDto updateClaimStatus(Long claimId, ClaimStatus newStatus, Long updatedBy, String notes);
    ClaimDto assignToAgent(Long claimId, Long agentId);
    ClaimDto assignToAdjuster(Long claimId, Long adjusterId);
    ClaimDto assignToUnderwriter(Long claimId, Long underwriterId);
    
    // Priority and Risk management
    ClaimDto updatePriorityLevel(Long claimId, PriorityLevel priorityLevel);
    ClaimDto updateRiskLevel(Long claimId, RiskLevel riskLevel);
    ClaimDto calculateFraudScore(Long claimId);
    ClaimDto updateFraudScore(Long claimId, Double fraudScore);
    
    // Amount management
    ClaimDto updateEstimatedAmount(Long claimId, BigDecimal estimatedAmount);
    ClaimDto updateApprovedAmount(Long claimId, BigDecimal approvedAmount);
    ClaimDto updatePaidAmount(Long claimId, BigDecimal paidAmount);
    ClaimDto updateDeductible(Long claimId, BigDecimal deductible);
    ClaimDto updateCoPay(Long claimId, BigDecimal coPay);
    
    // Investigation and notes
    ClaimDto addInvestigationNotes(Long claimId, String notes);
    ClaimDto updateInvestigationNotes(Long claimId, String notes);
    ClaimDto addApprovalNotes(Long claimId, String notes);
    ClaimDto addRejectionNotes(Long claimId, String notes);
    
    // Special operations
    List<ClaimDto> getUrgentClaims();
    List<ClaimDto> getExpiringClaims();
    List<ClaimDto> getClaimsRequiringAction();
    List<ClaimDto> getHighRiskFraudClaims(Double threshold);
    List<ClaimDto> getPendingHighRiskFraudClaims(Double threshold);
    
    // Validation operations
    boolean validateClaim(ClaimDto claimDto);
    boolean validateClaimForSubmission(Long claimId);
    boolean validateClaimForApproval(Long claimId);
    boolean validateClaimForPayment(Long claimId);
    
    // Generation operations
    String generateClaimNumber();
    BigDecimal calculateEstimatedAmount(ClaimDto claimDto);
    BigDecimal calculateApprovedAmount(ClaimDto claimDto);
    Double calculateFraudScore(ClaimDto claimDto);
    PriorityLevel calculatePriorityLevel(ClaimDto claimDto);
    RiskLevel calculateRiskLevel(ClaimDto claimDto);
    
    // Statistics and analytics
    Map<String, Object> getClaimStatistics();
    Map<String, Object> getClaimStatisticsByStatus();
    Map<String, Object> getClaimStatisticsByType();
    Map<String, Object> getClaimStatisticsByPriority();
    Map<String, Object> getClaimStatisticsByRiskLevel();
    Map<String, Object> getClaimStatisticsByDateRange(LocalDate startDate, LocalDate endDate);
    Map<String, Object> getClaimStatisticsByCustomer(Long customerId);
    Map<String, Object> getClaimStatisticsByPolicy(Long policyId);
    Map<String, Object> getClaimStatisticsByAgent(Long agentId);
    Map<String, Object> getClaimStatisticsByAdjuster(Long adjusterId);
    
    // Amount statistics
    BigDecimal getTotalEstimatedAmountByStatus(ClaimStatus status);
    BigDecimal getTotalApprovedAmountByStatus(ClaimStatus status);
    BigDecimal getTotalPaidAmountByStatus(ClaimStatus status);
    BigDecimal getAverageEstimatedAmountByStatus(ClaimStatus status);
    BigDecimal getAverageApprovedAmountByStatus(ClaimStatus status);
    BigDecimal getAveragePaidAmountByStatus(ClaimStatus status);
    
    // Customer statistics
    BigDecimal getTotalEstimatedAmountByCustomerAndStatus(Long customerId, ClaimStatus status);
    BigDecimal getTotalApprovedAmountByCustomerAndStatus(Long customerId, ClaimStatus status);
    BigDecimal getTotalPaidAmountByCustomerAndStatus(Long customerId, ClaimStatus status);
    long countClaimsByCustomerAndStatuses(Long customerId, List<ClaimStatus> statuses);
    
    // Policy statistics
    BigDecimal getTotalEstimatedAmountByPolicyAndStatus(Long policyId, ClaimStatus status);
    BigDecimal getTotalApprovedAmountByPolicyAndStatus(Long policyId, ClaimStatus status);
    BigDecimal getTotalPaidAmountByPolicyAndStatus(Long policyId, ClaimStatus status);
    long countClaimsByPolicyAndStatuses(Long policyId, List<ClaimStatus> statuses);
    
    // Date range statistics
    long countClaimsByIncidentDateRange(LocalDate startDate, LocalDate endDate);
    BigDecimal getTotalEstimatedAmountByDateRange(LocalDate startDate, LocalDate endDate);
    BigDecimal getTotalApprovedAmountByDateRange(LocalDate startDate, LocalDate endDate);
    BigDecimal getTotalPaidAmountByDateRange(LocalDate startDate, LocalDate endDate);
    
    // Agent and Adjuster statistics
    long countClaimsByAgentAndStatuses(Long agentId, List<ClaimStatus> statuses);
    long countClaimsByAdjusterAndStatuses(Long adjusterId, List<ClaimStatus> statuses);
    
    // Business logic operations
    boolean isClaimUrgent(Long claimId);
    boolean isClaimExpiringSoon(Long claimId);
    boolean isClaimUnderInvestigation(Long claimId);
    boolean isClaimReadyForPayment(Long claimId);
    boolean isClaimReadyForApproval(Long claimId);
    boolean requiresAdditionalDocuments(Long claimId);
    
    // Calculation operations
    BigDecimal getOutstandingAmount(Long claimId);
    Double getProcessingPercentage(Long claimId);
    Long getProcessingTimeDays(Long claimId);
    Long getDaysSinceLastUpdate(Long claimId);
    Long getDaysUntilExpiry(Long claimId);
    
    // Bulk operations
    List<ClaimDto> bulkUpdateStatus(List<Long> claimIds, ClaimStatus newStatus, Long updatedBy);
    List<ClaimDto> bulkAssignToAgent(List<Long> claimIds, Long agentId);
    List<ClaimDto> bulkAssignToAdjuster(List<Long> claimIds, Long adjusterId);
    List<ClaimDto> bulkUpdatePriority(List<Long> claimIds, PriorityLevel priorityLevel);
    List<ClaimDto> bulkUpdateRiskLevel(List<Long> claimIds, RiskLevel riskLevel);
    
    // Export operations
    byte[] exportClaimsToExcel(List<Long> claimIds);
    byte[] exportClaimsToPdf(List<Long> claimIds);
    byte[] exportClaimStatisticsToExcel(LocalDate startDate, LocalDate endDate);
    
    // Notification triggers
    void triggerClaimSubmittedNotification(Long claimId);
    void triggerClaimApprovedNotification(Long claimId);
    void triggerClaimRejectedNotification(Long claimId);
    void triggerClaimClosedNotification(Long claimId);
    void triggerClaimPaymentNotification(Long claimId);
    void triggerClaimDocumentRequestNotification(Long claimId);
    void triggerClaimInvestigationNotification(Long claimId);
    void triggerClaimFraudAlertNotification(Long claimId);
    void triggerClaimExpiryNotification(Long claimId);
    void triggerClaimUrgentNotification(Long claimId);
} 