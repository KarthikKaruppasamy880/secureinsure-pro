package com.secureinsure.policy.service.impl;

import com.secureinsure.policy.dto.PolicyDto;
import com.secureinsure.policy.entity.Policy;
import com.secureinsure.policy.entity.PolicyStatus;
import com.secureinsure.policy.entity.PolicyType;
import com.secureinsure.policy.repository.PolicyRepository;
import com.secureinsure.policy.service.PolicyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PolicyServiceImpl implements PolicyService {
    
    private final PolicyRepository policyRepository;
    
    @Override
    public PolicyDto createPolicy(PolicyDto policyDto) {
        log.info("Creating new policy for customer: {}", policyDto.getCustomerId());
        
        // Validate policy data
        if (!validatePolicy(policyDto)) {
            throw new IllegalArgumentException("Invalid policy data");
        }
        
        // Generate policy number if not provided
        if (policyDto.getPolicyNumber() == null || policyDto.getPolicyNumber().isEmpty()) {
            policyDto.setPolicyNumber(generatePolicyNumber());
        }
        
        // Set default values
        policyDto.setStatus(PolicyStatus.DRAFT);
        policyDto.setCreatedAt(LocalDateTime.now().toString());
        policyDto.setUpdatedAt(LocalDateTime.now().toString());
        
        // Calculate premium if not provided
        if (policyDto.getPremiumAmount() == null) {
            policyDto.setPremiumAmount(calculatePremium(policyDto));
        }
        
        // Convert DTO to entity
        Policy policy = convertToEntity(policyDto);
        policy = policyRepository.save(policy);
        
        // Send notification
        sendPolicyCreationNotification(policyDto);
        
        log.info("Policy created successfully with ID: {}", policy.getId());
        return convertToDto(policy);
    }
    
    @Override
    public PolicyDto getPolicyById(Long id) {
        log.debug("Fetching policy by ID: {}", id);
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found with ID: " + id));
        return convertToDto(policy);
    }
    
    @Override
    public PolicyDto getPolicyByNumber(String policyNumber) {
        log.debug("Fetching policy by number: {}", policyNumber);
        Policy policy = policyRepository.findByPolicyNumber(policyNumber)
                .orElseThrow(() -> new RuntimeException("Policy not found with number: " + policyNumber));
        return convertToDto(policy);
    }
    
    @Override
    public Page<PolicyDto> getAllPolicies(Pageable pageable) {
        log.debug("Fetching all policies with pagination");
        Page<Policy> policies = policyRepository.findAll(pageable);
        return policies.map(this::convertToDto);
    }
    
    @Override
    public PolicyDto updatePolicy(Long id, PolicyDto policyDto) {
        log.info("Updating policy with ID: {}", id);
        
        Policy existingPolicy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found with ID: " + id));
        
        // Update fields
        existingPolicy.setPolicyType(policyDto.getPolicyType());
        existingPolicy.setStartDate(policyDto.getEffectiveDate());
        existingPolicy.setEndDate(policyDto.getExpiryDate());
        existingPolicy.setPremiumAmount(policyDto.getPremiumAmount());
        existingPolicy.setSumInsured(policyDto.getSumInsured());
        existingPolicy.setDeductibleAmount(policyDto.getDeductibleAmount());
        existingPolicy.setRiskLevel(policyDto.getRiskLevel());
        existingPolicy.setDiscountPercentage(policyDto.getDiscountPercentage());
        existingPolicy.setAgentId(policyDto.getAgentId());
        existingPolicy.setUnderwriterId(policyDto.getUnderwriterId());
        existingPolicy.setAutoRenewal(policyDto.getAutoRenewal());
        existingPolicy.setNotes(policyDto.getNotes());
        existingPolicy.setUpdatedAt(LocalDateTime.now());
        
        Policy updatedPolicy = policyRepository.save(existingPolicy);
        log.info("Policy updated successfully with ID: {}", id);
        
        return convertToDto(updatedPolicy);
    }
    
    @Override
    public void deletePolicy(Long id) {
        log.info("Deleting policy with ID: {}", id);
        if (!policyRepository.existsById(id)) {
            throw new RuntimeException("Policy not found with ID: " + id);
        }
        policyRepository.deleteById(id);
        log.info("Policy deleted successfully with ID: {}", id);
    }
    
    @Override
    public Page<PolicyDto> searchPolicies(Long customerId, PolicyType policyType, PolicyStatus status,
                                        Long agentId, String riskLevel, BigDecimal minPremium,
                                        BigDecimal maxPremium, LocalDate startDate, LocalDate endDate,
                                        Pageable pageable) {
        log.debug("Searching policies with filters");
        Page<Policy> policies = policyRepository.findPoliciesByFilters(
                customerId, policyType, status, agentId, riskLevel,
                minPremium, maxPremium, startDate, endDate, pageable);
        return policies.map(this::convertToDto);
    }
    
    @Override
    public Page<PolicyDto> getPoliciesByCustomerId(Long customerId, Pageable pageable) {
        log.debug("Fetching policies for customer: {}", customerId);
        Page<Policy> policies = policyRepository.findByCustomerId(customerId, pageable);
        return policies.map(this::convertToDto);
    }
    
    @Override
    public List<PolicyDto> getActivePoliciesByCustomerId(Long customerId) {
        log.debug("Fetching active policies for customer: {}", customerId);
        List<Policy> policies = policyRepository.findByCustomerIdAndStatus(customerId, PolicyStatus.ACTIVE);
        return policies.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    @Override
    public long getPolicyCountByCustomerId(Long customerId) {
        return policyRepository.countByCustomerId(customerId);
    }
    
    @Override
    public Page<PolicyDto> getPoliciesByStatus(PolicyStatus status, Pageable pageable) {
        log.debug("Fetching policies by status: {}", status);
        Page<Policy> policies = policyRepository.findByStatus(status, pageable);
        return policies.map(this::convertToDto);
    }
    
    @Override
    public List<PolicyDto> getPoliciesByStatuses(List<PolicyStatus> statuses) {
        log.debug("Fetching policies by statuses: {}", statuses);
        List<Policy> policies = policyRepository.findByStatusIn(statuses);
        return policies.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    @Override
    public long getPolicyCountByStatus(PolicyStatus status) {
        return policyRepository.countByStatus(status);
    }
    
    @Override
    public Page<PolicyDto> getPoliciesByType(PolicyType policyType, Pageable pageable) {
        log.debug("Fetching policies by type: {}", policyType);
        Page<Policy> policies = policyRepository.findByPolicyType(policyType, pageable);
        return policies.map(this::convertToDto);
    }
    
    @Override
    public List<PolicyDto> getPoliciesByTypeAndStatus(PolicyType policyType, PolicyStatus status) {
        log.debug("Fetching policies by type: {} and status: {}", policyType, status);
        List<Policy> policies = policyRepository.findByPolicyTypeAndStatus(policyType, status);
        return policies.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    @Override
    public long getPolicyCountByType(PolicyType policyType) {
        return policyRepository.countByPolicyType(policyType);
    }
    
    @Override
    public Page<PolicyDto> getPoliciesByEffectiveDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        log.debug("Fetching policies by effective date range: {} to {}", startDate, endDate);
        Page<Policy> policies = policyRepository.findByEffectiveDateBetween(startDate, endDate, pageable);
        return policies.map(this::convertToDto);
    }
    
    @Override
    public Page<PolicyDto> getPoliciesByExpiryDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        log.debug("Fetching policies by expiry date range: {} to {}", startDate, endDate);
        Page<Policy> policies = policyRepository.findByExpiryDateBetween(startDate, endDate, pageable);
        return policies.map(this::convertToDto);
    }
    
    @Override
    public List<PolicyDto> getExpiringPolicies(LocalDate startDate, LocalDate endDate) {
        log.debug("Fetching expiring policies between: {} and {}", startDate, endDate);
        List<Policy> policies = policyRepository.findExpiringPolicies(PolicyStatus.ACTIVE, startDate, endDate);
        return policies.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    @Override
    public List<PolicyDto> getExpiredPolicies() {
        log.debug("Fetching expired policies");
        List<Policy> policies = policyRepository.findByExpiryDateBefore(LocalDate.now());
        return policies.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    @Override
    public Page<PolicyDto> getPoliciesByPremiumRange(BigDecimal minAmount, BigDecimal maxAmount, Pageable pageable) {
        log.debug("Fetching policies by premium range: {} to {}", minAmount, maxAmount);
        Page<Policy> policies = policyRepository.findByPremiumAmountBetween(minAmount, maxAmount, pageable);
        return policies.map(this::convertToDto);
    }
    
    @Override
    public Page<PolicyDto> getPoliciesBySumInsuredRange(BigDecimal minAmount, BigDecimal maxAmount, Pageable pageable) {
        log.debug("Fetching policies by sum insured range: {} to {}", minAmount, maxAmount);
        Page<Policy> policies = policyRepository.findBySumInsuredBetween(minAmount, maxAmount, pageable);
        return policies.map(this::convertToDto);
    }
    
    @Override
    public Page<PolicyDto> getPoliciesByAgentId(Long agentId, Pageable pageable) {
        log.debug("Fetching policies by agent ID: {}", agentId);
        Page<Policy> policies = policyRepository.findByAgentId(agentId, pageable);
        return policies.map(this::convertToDto);
    }
    
    @Override
    public Page<PolicyDto> getPoliciesByUnderwriterId(Long underwriterId, Pageable pageable) {
        log.debug("Fetching policies by underwriter ID: {}", underwriterId);
        Page<Policy> policies = policyRepository.findByUnderwriterId(underwriterId, pageable);
        return policies.map(this::convertToDto);
    }
    
    @Override
    public List<PolicyDto> getPoliciesByAgentIdAndStatus(Long agentId, PolicyStatus status) {
        log.debug("Fetching policies by agent ID: {} and status: {}", agentId, status);
        List<Policy> policies = policyRepository.findByAgentIdAndStatus(agentId, status);
        return policies.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    @Override
    public Page<PolicyDto> getPoliciesByApprovalStatus(String approvalStatus, Pageable pageable) {
        log.debug("Fetching policies by approval status: {}", approvalStatus);
        Page<Policy> policies = policyRepository.findByApprovalStatus(approvalStatus, pageable);
        return policies.map(this::convertToDto);
    }
    
    @Override
    public List<PolicyDto> getPoliciesByApprovalStatusAndApprover(String approvalStatus, Long approvedBy) {
        log.debug("Fetching policies by approval status: {} and approver: {}", approvalStatus, approvedBy);
        List<Policy> policies = policyRepository.findByApprovalStatusAndApprovedBy(approvalStatus, approvedBy);
        return policies.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    @Override
    public PolicyDto approvePolicy(Long policyId, Long approvedBy, String approvalNotes) {
        log.info("Approving policy with ID: {} by user: {}", policyId, approvedBy);
        
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found with ID: " + policyId));
        
        policy.setApprovalStatus("APPROVED");
        policy.setApprovedBy(approvedBy);
        policy.setApprovalDate(LocalDateTime.now());
        policy.setStatus(PolicyStatus.ACTIVE);
        policy.setUpdatedAt(LocalDateTime.now());
        
        Policy approvedPolicy = policyRepository.save(policy);
        log.info("Policy approved successfully with ID: {}", policyId);
        
        return convertToDto(approvedPolicy);
    }
    
    @Override
    public PolicyDto rejectPolicy(Long policyId, Long rejectedBy, String rejectionReason) {
        log.info("Rejecting policy with ID: {} by user: {}", policyId, rejectedBy);
        
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found with ID: " + policyId));
        
        policy.setApprovalStatus("REJECTED");
        policy.setApprovedBy(rejectedBy);
        policy.setApprovalDate(LocalDateTime.now());
        policy.setStatus(PolicyStatus.REJECTED);
        policy.setNotes(rejectionReason);
        policy.setUpdatedAt(LocalDateTime.now());
        
        Policy rejectedPolicy = policyRepository.save(policy);
        log.info("Policy rejected successfully with ID: {}", policyId);
        
        return convertToDto(rejectedPolicy);
    }
    
    @Override
    public Page<PolicyDto> getPoliciesByRiskLevel(String riskLevel, Pageable pageable) {
        log.debug("Fetching policies by risk level: {}", riskLevel);
        Page<Policy> policies = policyRepository.findByRiskLevel(riskLevel, pageable);
        return policies.map(this::convertToDto);
    }
    
    @Override
    public List<PolicyDto> getPoliciesByRiskLevelAndStatus(String riskLevel, PolicyStatus status) {
        log.debug("Fetching policies by risk level: {} and status: {}", riskLevel, status);
        List<Policy> policies = policyRepository.findByRiskLevelAndStatus(riskLevel, status);
        return policies.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    @Override
    public BigDecimal calculatePremium(PolicyDto policyDto) {
        log.debug("Calculating premium for policy type: {}", policyDto.getPolicyType());
        
        // Base premium calculation logic
        BigDecimal basePremium = policyDto.getSumInsured().multiply(new BigDecimal("0.02")); // 2% base rate
        
        // Risk level adjustment
        BigDecimal riskMultiplier = switch (policyDto.getRiskLevel()) {
            case "LOW" -> new BigDecimal("0.8");
            case "MEDIUM" -> new BigDecimal("1.0");
            case "HIGH" -> new BigDecimal("1.5");
            default -> new BigDecimal("1.0");
        };
        
        // Policy type adjustment
        BigDecimal typeMultiplier = switch (policyDto.getPolicyType()) {
            case AUTO -> new BigDecimal("1.2");
            case HOME -> new BigDecimal("1.0");
            case LIFE -> new BigDecimal("1.5");
            case HEALTH -> new BigDecimal("1.3");
            case BUSINESS -> new BigDecimal("1.4");
            default -> new BigDecimal("1.0");
        };
        
        BigDecimal calculatedPremium = basePremium.multiply(riskMultiplier).multiply(typeMultiplier);
        
        log.debug("Calculated premium: {}", calculatedPremium);
        return calculatedPremium;
    }
    
    @Override
    public BigDecimal calculateDiscount(PolicyDto policyDto) {
        log.debug("Calculating discount for policy");
        
        BigDecimal discountPercentage = policyDto.getDiscountPercentage() != null ? 
                policyDto.getDiscountPercentage() : BigDecimal.ZERO;
        
        return policyDto.getPremiumAmount().multiply(discountPercentage).divide(new BigDecimal("100"));
    }
    
    @Override
    public PolicyDto applyDiscount(Long policyId, BigDecimal discountPercentage) {
        log.info("Applying discount to policy ID: {}", policyId);
        
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found with ID: " + policyId));
        
        policy.setDiscountPercentage(discountPercentage);
        policy.setUpdatedAt(LocalDateTime.now());
        
        Policy updatedPolicy = policyRepository.save(policy);
        log.info("Discount applied successfully to policy ID: {}", policyId);
        
        return convertToDto(updatedPolicy);
    }
    
    @Override
    public PolicyDto updatePremium(Long policyId, BigDecimal newPremiumAmount) {
        log.info("Updating premium for policy ID: {}", policyId);
        
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found with ID: " + policyId));
        
        policy.setPremiumAmount(newPremiumAmount);
        policy.setUpdatedAt(LocalDateTime.now());
        
        Policy updatedPolicy = policyRepository.save(policy);
        log.info("Premium updated successfully for policy ID: {}", policyId);
        
        return convertToDto(updatedPolicy);
    }
    
    @Override
    public PolicyDto activatePolicy(Long policyId) {
        log.info("Activating policy with ID: {}", policyId);
        
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found with ID: " + policyId));
        
        policy.setStatus(PolicyStatus.ACTIVE);
        policy.setUpdatedAt(LocalDateTime.now());
        
        Policy activatedPolicy = policyRepository.save(policy);
        log.info("Policy activated successfully with ID: {}", policyId);
        
        return convertToDto(activatedPolicy);
    }
    
    @Override
    public PolicyDto suspendPolicy(Long policyId, String reason) {
        log.info("Suspending policy with ID: {}", policyId);
        
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found with ID: " + policyId));
        
        policy.setStatus(PolicyStatus.SUSPENDED);
        policy.setNotes(reason);
        policy.setUpdatedAt(LocalDateTime.now());
        
        Policy suspendedPolicy = policyRepository.save(policy);
        log.info("Policy suspended successfully with ID: {}", policyId);
        
        return convertToDto(suspendedPolicy);
    }
    
    @Override
    public PolicyDto cancelPolicy(Long policyId, String reason) {
        log.info("Cancelling policy with ID: {}", policyId);
        
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found with ID: " + policyId));
        
        policy.setStatus(PolicyStatus.CANCELLED);
        policy.setNotes(reason);
        policy.setUpdatedAt(LocalDateTime.now());
        
        Policy cancelledPolicy = policyRepository.save(policy);
        log.info("Policy cancelled successfully with ID: {}", policyId);
        
        return convertToDto(cancelledPolicy);
    }
    
    @Override
    public PolicyDto renewPolicy(Long policyId, LocalDate newExpiryDate) {
        log.info("Renewing policy with ID: {}", policyId);
        
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found with ID: " + policyId));
        
        policy.setEndDate(newExpiryDate);
        policy.setUpdatedAt(LocalDateTime.now());
        
        Policy renewedPolicy = policyRepository.save(policy);
        log.info("Policy renewed successfully with ID: {}", policyId);
        
        return convertToDto(renewedPolicy);
    }
    
    @Override
    public PolicyDto extendPolicy(Long policyId, int additionalDays) {
        log.info("Extending policy with ID: {} by {} days", policyId, additionalDays);
        
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found with ID: " + policyId));
        
        policy.setEndDate(policy.getEndDate().plusDays(additionalDays));
        policy.setUpdatedAt(LocalDateTime.now());
        
        Policy extendedPolicy = policyRepository.save(policy);
        log.info("Policy extended successfully with ID: {}", policyId);
        
        return convertToDto(extendedPolicy);
    }
    
    @Override
    public Page<PolicyDto> getHighValuePolicies(BigDecimal minAmount, Pageable pageable) {
        log.debug("Fetching high value policies with minimum amount: {}", minAmount);
        Page<Policy> policies = policyRepository.findHighValuePolicies(minAmount, pageable);
        return policies.map(this::convertToDto);
    }
    
    @Override
    public List<PolicyDto> getRenewalCandidates(LocalDate startDate, LocalDate endDate) {
        log.debug("Fetching renewal candidates between: {} and {}", startDate, endDate);
        List<Policy> policies = policyRepository.findRenewalCandidates(PolicyStatus.ACTIVE, startDate, endDate);
        return policies.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    @Override
    public Map<String, Object> getPolicyStatistics() {
        log.debug("Generating policy statistics");
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalPolicies", policyRepository.count());
        statistics.put("activePolicies", policyRepository.countByStatus(PolicyStatus.ACTIVE));
        statistics.put("draftPolicies", policyRepository.countByStatus(PolicyStatus.DRAFT));
        statistics.put("expiredPolicies", policyRepository.countByStatus(PolicyStatus.EXPIRED));
        
        return statistics;
    }
    
    @Override
    public Map<String, Object> getPolicyStatisticsByDateRange(LocalDate startDate, LocalDate endDate) {
        log.debug("Generating policy statistics for date range: {} to {}", startDate, endDate);
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("policiesInRange", policyRepository.countActivePoliciesByDateRange(PolicyStatus.ACTIVE, startDate));
        statistics.put("totalPremium", policyRepository.sumPremiumAmountByStatusAndDateRange(PolicyStatus.ACTIVE, startDate));
        
        return statistics;
    }
    
    @Override
    public Map<String, Object> getPolicyStatisticsByStatus(PolicyStatus status) {
        log.debug("Generating policy statistics for status: {}", status);
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("policyCount", policyRepository.countByStatus(status));
        statistics.put("status", status);
        
        return statistics;
    }
    
    @Override
    public Map<String, Object> getPolicyStatisticsByType(PolicyType policyType) {
        log.debug("Generating policy statistics for type: {}", policyType);
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("policyCount", policyRepository.countByPolicyType(policyType));
        statistics.put("policyType", policyType);
        
        return statistics;
    }
    
    @Override
    public BigDecimal getTotalPremiumByStatusAndDateRange(PolicyStatus status, LocalDate startDate) {
        return policyRepository.sumPremiumAmountByStatusAndDateRange(status, startDate);
    }
    
    @Override
    public long getActivePolicyCountByDateRange(PolicyStatus status, LocalDate startDate) {
        return policyRepository.countActivePoliciesByDateRange(status, startDate);
    }
    
    @Override
    public List<Map<String, Object>> getPolicyCountByTypeAndStatus(PolicyStatus status) {
        List<Object[]> results = policyRepository.countPoliciesByTypeAndStatus(status);
        return results.stream().map(result -> {
            Map<String, Object> map = new HashMap<>();
            map.put("policyType", result[0]);
            map.put("count", result[1]);
            return map;
        }).collect(Collectors.toList());
    }
    
    @Override
    public boolean validatePolicy(PolicyDto policyDto) {
        log.debug("Validating policy data");
        
        if (policyDto == null) return false;
        if (policyDto.getCustomerId() == null) return false;
        if (policyDto.getPolicyType() == null) return false;
        if (policyDto.getEffectiveDate() == null) return false;
        if (policyDto.getExpiryDate() == null) return false;
        if (policyDto.getPremiumAmount() == null || policyDto.getPremiumAmount().compareTo(BigDecimal.ZERO) <= 0) return false;
        if (policyDto.getSumInsured() == null || policyDto.getSumInsured().compareTo(BigDecimal.ZERO) <= 0) return false;
        
        return validatePolicyDates(policyDto.getEffectiveDate(), policyDto.getExpiryDate());
    }
    
    @Override
    public boolean validatePolicyNumber(String policyNumber) {
        if (policyNumber == null || policyNumber.isEmpty()) return false;
        return policyNumber.matches("^POL-[A-Z]{2}-\\d{6}$");
    }
    
    @Override
    public boolean validatePolicyDates(LocalDate effectiveDate, LocalDate expiryDate) {
        if (effectiveDate == null || expiryDate == null) return false;
        return !effectiveDate.isAfter(expiryDate);
    }
    
    @Override
    public boolean validatePremiumAmount(BigDecimal premiumAmount, BigDecimal sumInsured) {
        if (premiumAmount == null || sumInsured == null) return false;
        return premiumAmount.compareTo(BigDecimal.ZERO) > 0 && 
               premiumAmount.compareTo(sumInsured) < 0;
    }
    
    @Override
    public String generatePolicyNumber() {
        log.debug("Generating new policy number");
        String prefix = "POL-AU-";
        String timestamp = String.valueOf(System.currentTimeMillis());
        String randomSuffix = String.valueOf((int) (Math.random() * 1000));
        return prefix + timestamp.substring(timestamp.length() - 6) + randomSuffix;
    }
    
    @Override
    public PolicyDto generatePolicyFromTemplate(String templateName, PolicyDto policyDto) {
        log.debug("Generating policy from template: {}", templateName);
        // Template-based policy generation logic would go here
        return policyDto;
    }
    
    @Override
    public long getDocumentCountByPolicyId(Long policyId) {
        // This would typically call a document service
        return 0L;
    }
    
    @Override
    public boolean hasRequiredDocuments(Long policyId) {
        // This would typically call a document service
        return true;
    }
    
    @Override
    public List<String> getMissingDocuments(Long policyId) {
        // This would typically call a document service
        return new ArrayList<>();
    }
    
    @Override
    public long getPaymentCountByPolicyId(Long policyId) {
        // This would typically call a payment service
        return 0L;
    }
    
    @Override
    public LocalDate getLastPaymentDate(Long policyId) {
        // This would typically call a payment service
        return LocalDate.now();
    }
    
    @Override
    public LocalDate getNextPaymentDueDate(Long policyId) {
        // This would typically call a payment service
        return LocalDate.now().plusMonths(1);
    }
    
    @Override
    public BigDecimal getOutstandingPremium(Long policyId) {
        // This would typically call a payment service
        return BigDecimal.ZERO;
    }
    
    @Override
    public Long getDaysUntilExpiry(Long policyId) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found with ID: " + policyId));
        
        return ChronoUnit.DAYS.between(LocalDate.now(), policy.getEndDate());
    }
    
    @Override
    public boolean isExpiringSoon(Long policyId) {
        Long daysUntilExpiry = getDaysUntilExpiry(policyId);
        return daysUntilExpiry != null && daysUntilExpiry <= 30;
    }
    
    @Override
    public List<PolicyDto> getPoliciesExpiringInDays(int days) {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(days);
        return getExpiringPolicies(startDate, endDate);
    }
    
    @Override
    public List<PolicyDto> createBulkPolicies(List<PolicyDto> policyDtos) {
        log.info("Creating {} policies in bulk", policyDtos.size());
        List<PolicyDto> createdPolicies = new ArrayList<>();
        
        for (PolicyDto policyDto : policyDtos) {
            try {
                PolicyDto createdPolicy = createPolicy(policyDto);
                createdPolicies.add(createdPolicy);
            } catch (Exception e) {
                log.error("Failed to create policy: {}", e.getMessage());
            }
        }
        
        log.info("Successfully created {} out of {} policies", createdPolicies.size(), policyDtos.size());
        return createdPolicies;
    }
    
    @Override
    public List<PolicyDto> updateBulkPolicies(List<PolicyDto> policyDtos) {
        log.info("Updating {} policies in bulk", policyDtos.size());
        List<PolicyDto> updatedPolicies = new ArrayList<>();
        
        for (PolicyDto policyDto : policyDtos) {
            try {
                if (policyDto.getId() != null) {
                    PolicyDto updatedPolicy = updatePolicy(policyDto.getId(), policyDto);
                    updatedPolicies.add(updatedPolicy);
                }
            } catch (Exception e) {
                log.error("Failed to update policy: {}", e.getMessage());
            }
        }
        
        log.info("Successfully updated {} out of {} policies", updatedPolicies.size(), policyDtos.size());
        return updatedPolicies;
    }
    
    @Override
    public void deleteBulkPolicies(List<Long> policyIds) {
        log.info("Deleting {} policies in bulk", policyIds.size());
        
        for (Long policyId : policyIds) {
            try {
                deletePolicy(policyId);
            } catch (Exception e) {
                log.error("Failed to delete policy {}: {}", policyId, e.getMessage());
            }
        }
        
        log.info("Bulk delete operation completed");
    }
    
    @Override
    public List<PolicyDto> renewBulkPolicies(List<Long> policyIds, LocalDate newExpiryDate) {
        log.info("Renewing {} policies in bulk", policyIds.size());
        List<PolicyDto> renewedPolicies = new ArrayList<>();
        
        for (Long policyId : policyIds) {
            try {
                PolicyDto renewedPolicy = renewPolicy(policyId, newExpiryDate);
                renewedPolicies.add(renewedPolicy);
            } catch (Exception e) {
                log.error("Failed to renew policy {}: {}", policyId, e.getMessage());
            }
        }
        
        log.info("Successfully renewed {} out of {} policies", renewedPolicies.size(), policyIds.size());
        return renewedPolicies;
    }
    
    @Override
    public byte[] exportPoliciesToExcel(List<PolicyDto> policies) {
        log.info("Exporting {} policies to Excel", policies.size());
        // Excel export logic would go here
        return new byte[0];
    }
    
    @Override
    public byte[] exportPoliciesToPdf(List<PolicyDto> policies) {
        log.info("Exporting {} policies to PDF", policies.size());
        // PDF export logic would go here
        return new byte[0];
    }
    
    @Override
    public String generatePolicyReport(Long policyId) {
        log.info("Generating policy report for ID: {}", policyId);
        // Report generation logic would go here
        return "Policy report content";
    }
    
    @Override
    public void sendPolicyCreationNotification(PolicyDto policyDto) {
        log.info("Sending policy creation notification for policy: {}", policyDto.getPolicyNumber());
        // Notification logic would go here
    }
    
    @Override
    public void sendPolicyExpiryNotification(PolicyDto policyDto) {
        log.info("Sending policy expiry notification for policy: {}", policyDto.getPolicyNumber());
        // Notification logic would go here
    }
    
    @Override
    public void sendPolicyRenewalNotification(PolicyDto policyDto) {
        log.info("Sending policy renewal notification for policy: {}", policyDto.getPolicyNumber());
        // Notification logic would go here
    }
    
    @Override
    public void sendPaymentDueNotification(PolicyDto policyDto) {
        log.info("Sending payment due notification for policy: {}", policyDto.getPolicyNumber());
        // Notification logic would go here
    }
    
    // Helper methods for entity-DTO conversion
    private Policy convertToEntity(PolicyDto dto) {
        Policy entity = new Policy();
        entity.setId(dto.getId());
        entity.setPolicyNumber(dto.getPolicyNumber());
        entity.setCustomerId(dto.getCustomerId());
        entity.setPolicyType(dto.getPolicyType());
        entity.setStartDate(dto.getEffectiveDate());
        entity.setEndDate(dto.getExpiryDate());
        entity.setPremiumAmount(dto.getPremiumAmount());
        entity.setSumInsured(dto.getSumInsured());
        entity.setDeductibleAmount(dto.getDeductibleAmount());
        entity.setStatus(dto.getStatus());
        entity.setRiskLevel(dto.getRiskLevel());
        entity.setDiscountPercentage(dto.getDiscountPercentage());
        entity.setAgentId(dto.getAgentId());
        entity.setUnderwriterId(dto.getUnderwriterId());
        entity.setApprovalStatus(dto.getApprovalStatus());
        entity.setApprovedBy(dto.getApprovedBy());
        if (dto.getApprovalDate() != null) {
            entity.setApprovalDate(LocalDateTime.parse(dto.getApprovalDate()));
        }
        entity.setAutoRenewal(dto.getAutoRenewal());
        entity.setNotes(dto.getNotes());
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        return entity;
    }
    
    private PolicyDto convertToDto(Policy entity) {
        PolicyDto dto = new PolicyDto();
        dto.setId(entity.getId());
        dto.setPolicyNumber(entity.getPolicyNumber());
        dto.setCustomerId(entity.getCustomerId());
        dto.setPolicyType(entity.getPolicyType());
        dto.setEffectiveDate(entity.getStartDate());
        dto.setExpiryDate(entity.getEndDate());
        dto.setPremiumAmount(entity.getPremiumAmount());
        dto.setSumInsured(entity.getSumInsured());
        dto.setDeductibleAmount(entity.getDeductibleAmount());
        dto.setStatus(entity.getStatus());
        dto.setRiskLevel(entity.getRiskLevel());
        dto.setDiscountPercentage(entity.getDiscountPercentage());
        dto.setAgentId(entity.getAgentId());
        dto.setUnderwriterId(entity.getUnderwriterId());
        dto.setApprovalStatus(entity.getApprovalStatus());
        dto.setApprovedBy(entity.getApprovedBy());
        if (entity.getApprovalDate() != null) {
            dto.setApprovalDate(entity.getApprovalDate().toString());
        }
        dto.setAutoRenewal(entity.getAutoRenewal());
        dto.setNotes(entity.getNotes());
        dto.setCreatedAt(entity.getCreatedAt().toString());
        dto.setUpdatedAt(entity.getUpdatedAt().toString());
        
        // Calculate additional fields
        if (entity.getEndDate() != null) {
            dto.setDaysUntilExpiry(getDaysUntilExpiry(entity.getId()));
            dto.setIsExpiringSoon(isExpiringSoon(entity.getId()));
        }
        
        return dto;
    }
} 