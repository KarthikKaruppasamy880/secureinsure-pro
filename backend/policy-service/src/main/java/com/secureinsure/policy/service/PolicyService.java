package com.secureinsure.policy.service;

import com.secureinsure.policy.dto.PolicyDto;
import com.secureinsure.policy.entity.PolicyStatus;
import com.secureinsure.policy.entity.PolicyType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface PolicyService {
    
    // Basic CRUD operations
    PolicyDto createPolicy(PolicyDto policyDto);
    PolicyDto getPolicyById(Long id);
    PolicyDto getPolicyByNumber(String policyNumber);
    Page<PolicyDto> getAllPolicies(Pageable pageable);
    PolicyDto updatePolicy(Long id, PolicyDto policyDto);
    void deletePolicy(Long id);
    
    // Policy search and filtering
    Page<PolicyDto> searchPolicies(
            Long customerId,
            PolicyType policyType,
            PolicyStatus status,
            Long agentId,
            String riskLevel,
            BigDecimal minPremium,
            BigDecimal maxPremium,
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable
    );
    
    // Customer-related operations
    Page<PolicyDto> getPoliciesByCustomerId(Long customerId, Pageable pageable);
    List<PolicyDto> getActivePoliciesByCustomerId(Long customerId);
    long getPolicyCountByCustomerId(Long customerId);
    
    // Status-based operations
    Page<PolicyDto> getPoliciesByStatus(PolicyStatus status, Pageable pageable);
    List<PolicyDto> getPoliciesByStatuses(List<PolicyStatus> statuses);
    long getPolicyCountByStatus(PolicyStatus status);
    
    // Type-based operations
    Page<PolicyDto> getPoliciesByType(PolicyType policyType, Pageable pageable);
    List<PolicyDto> getPoliciesByTypeAndStatus(PolicyType policyType, PolicyStatus status);
    long getPolicyCountByType(PolicyType policyType);
    
    // Date-based operations
    Page<PolicyDto> getPoliciesByEffectiveDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable);
    Page<PolicyDto> getPoliciesByExpiryDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable);
    List<PolicyDto> getExpiringPolicies(LocalDate startDate, LocalDate endDate);
    List<PolicyDto> getExpiredPolicies();
    
    // Amount-based operations
    Page<PolicyDto> getPoliciesByPremiumRange(BigDecimal minAmount, BigDecimal maxAmount, Pageable pageable);
    Page<PolicyDto> getPoliciesBySumInsuredRange(BigDecimal minAmount, BigDecimal maxAmount, Pageable pageable);
    
    // Agent and Underwriter operations
    Page<PolicyDto> getPoliciesByAgentId(Long agentId, Pageable pageable);
    Page<PolicyDto> getPoliciesByUnderwriterId(Long underwriterId, Pageable pageable);
    List<PolicyDto> getPoliciesByAgentIdAndStatus(Long agentId, PolicyStatus status);
    
    // Approval operations
    Page<PolicyDto> getPoliciesByApprovalStatus(String approvalStatus, Pageable pageable);
    List<PolicyDto> getPoliciesByApprovalStatusAndApprover(String approvalStatus, Long approvedBy);
    PolicyDto approvePolicy(Long policyId, Long approvedBy, String approvalNotes);
    PolicyDto rejectPolicy(Long policyId, Long rejectedBy, String rejectionReason);
    
    // Risk-based operations
    Page<PolicyDto> getPoliciesByRiskLevel(String riskLevel, Pageable pageable);
    List<PolicyDto> getPoliciesByRiskLevelAndStatus(String riskLevel, PolicyStatus status);
    
    // Premium calculation and billing
    BigDecimal calculatePremium(PolicyDto policyDto);
    BigDecimal calculateDiscount(PolicyDto policyDto);
    PolicyDto applyDiscount(Long policyId, BigDecimal discountPercentage);
    PolicyDto updatePremium(Long policyId, BigDecimal newPremiumAmount);
    
    // Policy lifecycle operations
    PolicyDto activatePolicy(Long policyId);
    PolicyDto suspendPolicy(Long policyId, String reason);
    PolicyDto cancelPolicy(Long policyId, String reason);
    PolicyDto renewPolicy(Long policyId, LocalDate newExpiryDate);
    PolicyDto extendPolicy(Long policyId, int additionalDays);
    
    // High-value and special policies
    Page<PolicyDto> getHighValuePolicies(BigDecimal minAmount, Pageable pageable);
    List<PolicyDto> getRenewalCandidates(LocalDate startDate, LocalDate endDate);
    
    // Statistics and reporting
    Map<String, Object> getPolicyStatistics();
    Map<String, Object> getPolicyStatisticsByDateRange(LocalDate startDate, LocalDate endDate);
    Map<String, Object> getPolicyStatisticsByStatus(PolicyStatus status);
    Map<String, Object> getPolicyStatisticsByType(PolicyType policyType);
    BigDecimal getTotalPremiumByStatusAndDateRange(PolicyStatus status, LocalDate startDate);
    long getActivePolicyCountByDateRange(PolicyStatus status, LocalDate startDate);
    List<Map<String, Object>> getPolicyCountByTypeAndStatus(PolicyStatus status);
    
    // Policy validation
    boolean validatePolicy(PolicyDto policyDto);
    boolean validatePolicyNumber(String policyNumber);
    boolean validatePolicyDates(LocalDate effectiveDate, LocalDate expiryDate);
    boolean validatePremiumAmount(BigDecimal premiumAmount, BigDecimal sumInsured);
    
    // Policy generation
    String generatePolicyNumber();
    PolicyDto generatePolicyFromTemplate(String templateName, PolicyDto policyDto);
    
    // Document management
    long getDocumentCountByPolicyId(Long policyId);
    boolean hasRequiredDocuments(Long policyId);
    List<String> getMissingDocuments(Long policyId);
    
    // Payment tracking
    long getPaymentCountByPolicyId(Long policyId);
    LocalDate getLastPaymentDate(Long policyId);
    LocalDate getNextPaymentDueDate(Long policyId);
    BigDecimal getOutstandingPremium(Long policyId);
    
    // Expiry tracking
    Long getDaysUntilExpiry(Long policyId);
    boolean isExpiringSoon(Long policyId);
    List<PolicyDto> getPoliciesExpiringInDays(int days);
    
    // Bulk operations
    List<PolicyDto> createBulkPolicies(List<PolicyDto> policyDtos);
    List<PolicyDto> updateBulkPolicies(List<PolicyDto> policyDtos);
    void deleteBulkPolicies(List<Long> policyIds);
    List<PolicyDto> renewBulkPolicies(List<Long> policyIds, LocalDate newExpiryDate);
    
    // Export operations
    byte[] exportPoliciesToExcel(List<PolicyDto> policies);
    byte[] exportPoliciesToPdf(List<PolicyDto> policies);
    String generatePolicyReport(Long policyId);
    
    // Notification triggers
    void sendPolicyCreationNotification(PolicyDto policyDto);
    void sendPolicyExpiryNotification(PolicyDto policyDto);
    void sendPolicyRenewalNotification(PolicyDto policyDto);
    void sendPaymentDueNotification(PolicyDto policyDto);
} 