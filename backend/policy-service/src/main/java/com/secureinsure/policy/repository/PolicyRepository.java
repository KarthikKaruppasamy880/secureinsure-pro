package com.secureinsure.policy.repository;

import com.secureinsure.policy.entity.Policy;
import com.secureinsure.policy.entity.PolicyStatus;
import com.secureinsure.policy.entity.PolicyType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, Long> {
    
    // Basic CRUD operations
    Optional<Policy> findByPolicyNumber(String policyNumber);
    boolean existsByPolicyNumber(String policyNumber);
    
    // Customer-related queries
    Page<Policy> findByCustomerId(Long customerId, Pageable pageable);
    List<Policy> findByCustomerIdAndStatus(Long customerId, PolicyStatus status);
    long countByCustomerId(Long customerId);
    
    // Status-based queries
    Page<Policy> findByStatus(PolicyStatus status, Pageable pageable);
    List<Policy> findByStatusIn(List<PolicyStatus> statuses);
    long countByStatus(PolicyStatus status);
    
    // Type-based queries
    Page<Policy> findByPolicyType(PolicyType policyType, Pageable pageable);
    List<Policy> findByPolicyTypeAndStatus(PolicyType policyType, PolicyStatus status);
    long countByPolicyType(PolicyType policyType);
    
    // Date-based queries
    Page<Policy> findByEffectiveDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);
    Page<Policy> findByExpiryDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);
    List<Policy> findByExpiryDateBefore(LocalDate date);
    List<Policy> findByExpiryDateBetween(LocalDate startDate, LocalDate endDate);
    
    // Amount-based queries
    Page<Policy> findByPremiumAmountBetween(BigDecimal minAmount, BigDecimal maxAmount, Pageable pageable);
    Page<Policy> findBySumInsuredBetween(BigDecimal minAmount, BigDecimal maxAmount, Pageable pageable);
    
    // Agent and Underwriter queries
    Page<Policy> findByAgentId(Long agentId, Pageable pageable);
    Page<Policy> findByUnderwriterId(Long underwriterId, Pageable pageable);
    List<Policy> findByAgentIdAndStatus(Long agentId, PolicyStatus status);
    
    // Approval queries
    Page<Policy> findByApprovalStatus(String approvalStatus, Pageable pageable);
    List<Policy> findByApprovalStatusAndApprovedBy(String approvalStatus, Long approvedBy);
    
    // Risk-based queries
    Page<Policy> findByRiskLevel(String riskLevel, Pageable pageable);
    List<Policy> findByRiskLevelAndStatus(String riskLevel, PolicyStatus status);
    
    // Complex search queries
    @Query("SELECT p FROM Policy p WHERE " +
           "(:customerId IS NULL OR p.customerId = :customerId) AND " +
           "(:policyType IS NULL OR p.policyType = :policyType) AND " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:agentId IS NULL OR p.agentId = :agentId) AND " +
           "(:riskLevel IS NULL OR p.riskLevel = :riskLevel) AND " +
           "(:minPremium IS NULL OR p.premiumAmount >= :minPremium) AND " +
           "(:maxPremium IS NULL OR p.premiumAmount <= :maxPremium) AND " +
           "(:startDate IS NULL OR p.effectiveDate >= :startDate) AND " +
           "(:endDate IS NULL OR p.effectiveDate <= :endDate)")
    Page<Policy> findPoliciesByFilters(
            @Param("customerId") Long customerId,
            @Param("policyType") PolicyType policyType,
            @Param("status") PolicyStatus status,
            @Param("agentId") Long agentId,
            @Param("riskLevel") String riskLevel,
            @Param("minPremium") BigDecimal minPremium,
            @Param("maxPremium") BigDecimal maxPremium,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable
    );
    
    // Statistics queries
    @Query("SELECT COUNT(p) FROM Policy p WHERE p.status = :status AND p.effectiveDate >= :startDate")
    long countActivePoliciesByDateRange(@Param("status") PolicyStatus status, @Param("startDate") LocalDate startDate);
    
    @Query("SELECT SUM(p.premiumAmount) FROM Policy p WHERE p.status = :status AND p.effectiveDate >= :startDate")
    BigDecimal sumPremiumAmountByStatusAndDateRange(@Param("status") PolicyStatus status, @Param("startDate") LocalDate startDate);
    
    @Query("SELECT p.policyType, COUNT(p) FROM Policy p WHERE p.status = :status GROUP BY p.policyType")
    List<Object[]> countPoliciesByTypeAndStatus(@Param("status") PolicyStatus status);
    
    // Expiring policies
    @Query("SELECT p FROM Policy p WHERE p.status = :status AND p.expiryDate BETWEEN :startDate AND :endDate ORDER BY p.expiryDate")
    List<Policy> findExpiringPolicies(@Param("status") PolicyStatus status, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // High-value policies
    @Query("SELECT p FROM Policy p WHERE p.sumInsured >= :minAmount ORDER BY p.sumInsured DESC")
    Page<Policy> findHighValuePolicies(@Param("minAmount") BigDecimal minAmount, Pageable pageable);
    
    // Policy renewal candidates
    @Query("SELECT p FROM Policy p WHERE p.status = :status AND p.expiryDate BETWEEN :startDate AND :endDate AND p.autoRenewal = true")
    List<Policy> findRenewalCandidates(@Param("status") PolicyStatus status, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
} 