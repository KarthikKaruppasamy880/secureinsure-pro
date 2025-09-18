package com.secureinsure.claims.repository;

import com.secureinsure.claims.entity.Claim;
import com.secureinsure.claims.entity.ClaimStatus;
import com.secureinsure.claims.entity.ClaimType;
import com.secureinsure.claims.entity.PriorityLevel;
import com.secureinsure.claims.entity.RiskLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {
    
    // Basic CRUD operations
    Optional<Claim> findByClaimNumber(String claimNumber);
    List<Claim> findByPolicyId(Long policyId);
    List<Claim> findByCustomerId(Long customerId);
    List<Claim> findByAgentId(Long agentId);
    List<Claim> findByAdjusterId(Long adjusterId);
    
    // Status-based queries
    List<Claim> findByStatus(ClaimStatus status);
    List<Claim> findByStatusIn(List<ClaimStatus> statuses);
    long countByStatus(ClaimStatus status);
    long countByStatusIn(List<ClaimStatus> statuses);
    
    // Type-based queries
    List<Claim> findByClaimType(ClaimType claimType);
    long countByClaimType(ClaimType claimType);
    
    // Priority and Risk queries
    List<Claim> findByPriorityLevel(PriorityLevel priorityLevel);
    List<Claim> findByRiskLevel(RiskLevel riskLevel);
    long countByPriorityLevel(PriorityLevel priorityLevel);
    long countByRiskLevel(RiskLevel riskLevel);
    
    // Date-based queries
    List<Claim> findByIncidentDateBetween(LocalDate startDate, LocalDate endDate);
    List<Claim> findByReportedDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<Claim> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<Claim> findByUpdatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    // Amount-based queries
    List<Claim> findByEstimatedAmountBetween(BigDecimal minAmount, BigDecimal maxAmount);
    List<Claim> findByApprovedAmountBetween(BigDecimal minAmount, BigDecimal maxAmount);
    List<Claim> findByPaidAmountBetween(BigDecimal minAmount, BigDecimal maxAmount);
    
    // Customer and Policy queries
    List<Claim> findByCustomerIdAndStatus(Long customerId, ClaimStatus status);
    List<Claim> findByPolicyIdAndStatus(Long policyId, ClaimStatus status);
    List<Claim> findByCustomerIdAndClaimType(Long customerId, ClaimType claimType);
    List<Claim> findByPolicyIdAndClaimType(Long policyId, ClaimType claimType);
    
    // Agent and Adjuster queries
    List<Claim> findByAgentIdAndStatus(Long agentId, ClaimStatus status);
    List<Claim> findByAdjusterIdAndStatus(Long adjusterId, ClaimStatus status);
    List<Claim> findByAgentIdAndClaimType(Long agentId, ClaimType claimType);
    List<Claim> findByAdjusterIdAndClaimType(Long adjusterId, ClaimType claimType);
    
    // Complex search with filters
    @Query("SELECT c FROM Claim c WHERE " +
           "(:customerId IS NULL OR c.customerId = :customerId) AND " +
           "(:policyId IS NULL OR c.policyId = :policyId) AND " +
           "(:claimType IS NULL OR c.claimType = :claimType) AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:agentId IS NULL OR c.agentId = :agentId) AND " +
           "(:adjusterId IS NULL OR c.adjusterId = :adjusterId) AND " +
           "(:priorityLevel IS NULL OR c.priorityLevel = :priorityLevel) AND " +
           "(:riskLevel IS NULL OR c.riskLevel = :riskLevel) AND " +
           "(:minEstimatedAmount IS NULL OR c.estimatedAmount >= :minEstimatedAmount) AND " +
           "(:maxEstimatedAmount IS NULL OR c.estimatedAmount <= :maxEstimatedAmount) AND " +
           "(:minApprovedAmount IS NULL OR c.approvedAmount >= :minApprovedAmount) AND " +
           "(:maxApprovedAmount IS NULL OR c.approvedAmount <= :maxApprovedAmount) AND " +
           "(:minPaidAmount IS NULL OR c.paidAmount >= :minPaidAmount) AND " +
           "(:maxPaidAmount IS NULL OR c.paidAmount <= :maxPaidAmount) AND " +
           "(:startDate IS NULL OR c.incidentDate >= :startDate) AND " +
           "(:endDate IS NULL OR c.incidentDate <= :endDate) AND " +
           "(:incidentLocation IS NULL OR LOWER(c.incidentLocation) LIKE LOWER(CONCAT('%', :incidentLocation, '%'))) AND " +
           "(:description IS NULL OR LOWER(c.description) LIKE LOWER(CONCAT('%', :description, '%')))")
    Page<Claim> findClaimsByFilters(
            @Param("customerId") Long customerId,
            @Param("policyId") Long policyId,
            @Param("claimType") ClaimType claimType,
            @Param("status") ClaimStatus status,
            @Param("agentId") Long agentId,
            @Param("adjusterId") Long adjusterId,
            @Param("priorityLevel") PriorityLevel priorityLevel,
            @Param("riskLevel") RiskLevel riskLevel,
            @Param("minEstimatedAmount") BigDecimal minEstimatedAmount,
            @Param("maxEstimatedAmount") BigDecimal maxEstimatedAmount,
            @Param("minApprovedAmount") BigDecimal minApprovedAmount,
            @Param("maxApprovedAmount") BigDecimal maxApprovedAmount,
            @Param("minPaidAmount") BigDecimal minPaidAmount,
            @Param("maxPaidAmount") BigDecimal maxPaidAmount,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("incidentLocation") String incidentLocation,
            @Param("description") String description,
            Pageable pageable
    );
    
    // Statistics queries
    @Query("SELECT COUNT(c) FROM Claim c WHERE c.status IN :statuses")
    long countByStatuses(@Param("statuses") List<ClaimStatus> statuses);
    
    @Query("SELECT AVG(c.estimatedAmount) FROM Claim c WHERE c.status = :status")
    BigDecimal getAverageEstimatedAmountByStatus(@Param("status") ClaimStatus status);
    
    @Query("SELECT AVG(c.approvedAmount) FROM Claim c WHERE c.status = :status")
    BigDecimal getAverageApprovedAmountByStatus(@Param("status") ClaimStatus status);
    
    @Query("SELECT AVG(c.paidAmount) FROM Claim c WHERE c.status = :status")
    BigDecimal getAveragePaidAmountByStatus(@Param("status") ClaimStatus status);
    
    @Query("SELECT SUM(c.estimatedAmount) FROM Claim c WHERE c.status = :status")
    BigDecimal getTotalEstimatedAmountByStatus(@Param("status") ClaimStatus status);
    
    @Query("SELECT SUM(c.approvedAmount) FROM Claim c WHERE c.status = :status")
    BigDecimal getTotalApprovedAmountByStatus(@Param("status") ClaimStatus status);
    
    @Query("SELECT SUM(c.paidAmount) FROM Claim c WHERE c.status = :status")
    BigDecimal getTotalPaidAmountByStatus(@Param("status") ClaimStatus status);
    
    // Customer-specific statistics
    @Query("SELECT COUNT(c) FROM Claim c WHERE c.customerId = :customerId AND c.status IN :statuses")
    long countByCustomerIdAndStatuses(@Param("customerId") Long customerId, @Param("statuses") List<ClaimStatus> statuses);
    
    @Query("SELECT SUM(c.estimatedAmount) FROM Claim c WHERE c.customerId = :customerId AND c.status = :status")
    BigDecimal getTotalEstimatedAmountByCustomerAndStatus(@Param("customerId") Long customerId, @Param("status") ClaimStatus status);
    
    @Query("SELECT SUM(c.approvedAmount) FROM Claim c WHERE c.customerId = :customerId AND c.status = :status")
    BigDecimal getTotalApprovedAmountByCustomerAndStatus(@Param("customerId") Long customerId, @Param("status") ClaimStatus status);
    
    @Query("SELECT SUM(c.paidAmount) FROM Claim c WHERE c.customerId = :customerId AND c.status = :status")
    BigDecimal getTotalPaidAmountByCustomerAndStatus(@Param("customerId") Long customerId, @Param("status") ClaimStatus status);
    
    // Policy-specific statistics
    @Query("SELECT COUNT(c) FROM Claim c WHERE c.policyId = :policyId AND c.status IN :statuses")
    long countByPolicyIdAndStatuses(@Param("policyId") Long policyId, @Param("statuses") List<ClaimStatus> statuses);
    
    @Query("SELECT SUM(c.estimatedAmount) FROM Claim c WHERE c.policyId = :policyId AND c.status = :status")
    BigDecimal getTotalEstimatedAmountByPolicyAndStatus(@Param("policyId") Long policyId, @Param("status") ClaimStatus status);
    
    @Query("SELECT SUM(c.approvedAmount) FROM Claim c WHERE c.policyId = :policyId AND c.status = :status")
    BigDecimal getTotalApprovedAmountByPolicyAndStatus(@Param("policyId") Long policyId, @Param("status") ClaimStatus status);
    
    @Query("SELECT SUM(c.paidAmount) FROM Claim c WHERE c.policyId = :policyId AND c.status = :status")
    BigDecimal getTotalPaidAmountByPolicyAndStatus(@Param("policyId") Long policyId, @Param("status") ClaimStatus status);
    
    // Agent and Adjuster statistics
    @Query("SELECT COUNT(c) FROM Claim c WHERE c.agentId = :agentId AND c.status IN :statuses")
    long countByAgentIdAndStatuses(@Param("agentId") Long agentId, @Param("statuses") List<ClaimStatus> statuses);
    
    @Query("SELECT COUNT(c) FROM Claim c WHERE c.adjusterId = :adjusterId AND c.status IN :statuses")
    long countByAdjusterIdAndStatuses(@Param("adjusterId") Long adjusterId, @Param("statuses") List<ClaimStatus> statuses);
    
    // Date range statistics
    @Query("SELECT COUNT(c) FROM Claim c WHERE c.incidentDate BETWEEN :startDate AND :endDate")
    long countByIncidentDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT SUM(c.estimatedAmount) FROM Claim c WHERE c.incidentDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalEstimatedAmountByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT SUM(c.approvedAmount) FROM Claim c WHERE c.incidentDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalApprovedAmountByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT SUM(c.paidAmount) FROM Claim c WHERE c.incidentDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalPaidAmountByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Urgent claims (high priority or risk)
    @Query("SELECT c FROM Claim c WHERE c.priorityLevel IN ('HIGH', 'URGENT', 'CRITICAL') OR c.riskLevel IN ('HIGH', 'CRITICAL') ORDER BY c.priorityLevel DESC, c.riskLevel DESC, c.createdAt DESC")
    List<Claim> findUrgentClaims();
    
    // Expiring claims (claims that need attention soon)
    @Query("SELECT c FROM Claim c WHERE c.status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'PENDING_DOCUMENTS', 'PENDING_APPROVAL') AND c.updatedAt < :threshold ORDER BY c.updatedAt ASC")
    List<Claim> findExpiringClaims(@Param("threshold") LocalDateTime threshold);
    
    // Claims requiring action
    @Query("SELECT c FROM Claim c WHERE c.status IN ('PENDING_DOCUMENTS', 'PENDING_APPROVAL', 'PENDING_PAYMENT', 'PENDING_INVESTIGATION') ORDER BY c.priorityLevel DESC, c.createdAt ASC")
    List<Claim> findClaimsRequiringAction();
    
    // Fraud detection queries
    @Query("SELECT c FROM Claim c WHERE c.fraudScore > :threshold ORDER BY c.fraudScore DESC")
    List<Claim> findHighRiskFraudClaims(@Param("threshold") Double threshold);
    
    @Query("SELECT c FROM Claim c WHERE c.fraudScore > :threshold AND c.status IN ('SUBMITTED', 'UNDER_REVIEW') ORDER BY c.fraudScore DESC")
    List<Claim> findPendingHighRiskFraudClaims(@Param("threshold") Double threshold);
    
    // Missing methods needed by service implementation
    long countByCustomerId(Long customerId);
    long countByCustomerIdAndIncidentDateAfter(Long customerId, LocalDate date);
} 