package com.secureinsure.policy.repository;

import com.secureinsure.policy.entity.InsuranceCase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InsuranceCaseRepository extends JpaRepository<InsuranceCase, Long> {

    /**
     * Find case by case number
     */
    Optional<InsuranceCase> findByCaseNumber(String caseNumber);

    /**
     * Find case by Zinnia case ID
     */
    Optional<InsuranceCase> findByZinniaCaseId(String zinniaCaseId);

    /**
     * Find case by policy number
     */
    Optional<InsuranceCase> findByPolicyNumber(String policyNumber);

    /**
     * Check if case exists by case number
     */
    boolean existsByCaseNumber(String caseNumber);

    /**
     * Check if case exists by Zinnia case ID
     */
    boolean existsByZinniaCaseId(String zinniaCaseId);

    /**
     * Check if case exists by policy number
     */
    boolean existsByPolicyNumber(String policyNumber);

    /**
     * Find cases by status
     */
    Page<InsuranceCase> findByStatusAndIsActiveTrue(InsuranceCase.CaseStatus status, Pageable pageable);

    /**
     * Find cases by priority
     */
    Page<InsuranceCase> findByPriorityAndIsActiveTrue(InsuranceCase.Priority priority, Pageable pageable);

    /**
     * Find cases by product type
     */
    List<InsuranceCase> findByProductTypeAndIsActiveTrue(String productType);

    /**
     * Find cases by plan name
     */
    List<InsuranceCase> findByPlanNameAndIsActiveTrue(String planName);

    /**
     * Find cases by application date range
     */
    List<InsuranceCase> findByApplicationDateBetweenAndIsActiveTrue(LocalDate startDate, LocalDate endDate);

    /**
     * Find cases by date received range
     */
    List<InsuranceCase> findByDateReceivedBetweenAndIsActiveTrue(LocalDate startDate, LocalDate endDate);

    /**
     * Find cases by application state
     */
    List<InsuranceCase> findByApplicationStateAndIsActiveTrue(String applicationState);

    /**
     * Find cases by submission type
     */
    List<InsuranceCase> findBySubmissionTypeAndIsActiveTrue(InsuranceCase.SubmissionType submissionType);

    /**
     * Find cases by group name
     */
    List<InsuranceCase> findByGroupNameAndIsActiveTrue(String groupName);

    /**
     * Find cases by face amount range
     */
    @Query("SELECT ic FROM InsuranceCase ic WHERE ic.faceAmount BETWEEN :minAmount AND :maxAmount AND ic.isActive = true")
    List<InsuranceCase> findByFaceAmountRange(@Param("minAmount") Double minAmount, @Param("maxAmount") Double maxAmount);

    /**
     * Find cases by premium amount range
     */
    @Query("SELECT ic FROM InsuranceCase ic WHERE ic.premiumAmount BETWEEN :minAmount AND :maxAmount AND ic.isActive = true")
    List<InsuranceCase> findByPremiumAmountRange(@Param("minAmount") Double minAmount, @Param("maxAmount") Double maxAmount);

    /**
     * Find cases by multiple statuses
     */
    @Query("SELECT ic FROM InsuranceCase ic WHERE ic.status IN :statuses AND ic.isActive = true")
    Page<InsuranceCase> findByStatusesIn(@Param("statuses") List<InsuranceCase.CaseStatus> statuses, Pageable pageable);

    /**
     * Find cases by multiple priorities
     */
    @Query("SELECT ic FROM InsuranceCase ic WHERE ic.priority IN :priorities AND ic.isActive = true")
    Page<InsuranceCase> findByPrioritiesIn(@Param("priorities") List<InsuranceCase.Priority> priorities, Pageable pageable);

    /**
     * Find cases by insured party name (search in party roles)
     */
    @Query("SELECT DISTINCT ic FROM InsuranceCase ic JOIN ic.partyRoles pr JOIN pr.party p " +
           "WHERE (p.firstName LIKE %:name% OR p.lastName LIKE %:name% OR CONCAT(p.firstName, ' ', p.lastName) LIKE %:name%) " +
           "AND pr.roleType = 'INSURED' AND ic.isActive = true")
    List<InsuranceCase> findByInsuredPartyNameContaining(@Param("name") String name);

    /**
     * Find cases by owner party name (search in party roles)
     */
    @Query("SELECT DISTINCT ic FROM InsuranceCase ic JOIN ic.partyRoles pr JOIN pr.party p " +
           "WHERE (p.firstName LIKE %:name% OR p.lastName LIKE %:name% OR CONCAT(p.firstName, ' ', p.lastName) LIKE %:name%) " +
           "AND pr.roleType = 'OWNER' AND ic.isActive = true")
    List<InsuranceCase> findByOwnerPartyNameContaining(@Param("name") String name);

    /**
     * Find cases by payor party name (search in party roles)
     */
    @Query("SELECT DISTINCT ic FROM InsuranceCase ic JOIN ic.partyRoles pr JOIN pr.party p " +
           "WHERE (p.firstName LIKE %:name% OR p.lastName LIKE %:name% OR CONCAT(p.firstName, ' ', p.lastName) LIKE %:name%) " +
           "AND pr.roleType = 'PAYOR' AND ic.isActive = true")
    List<InsuranceCase> findByPayorPartyNameContaining(@Param("name") String name);

    /**
     * Find cases by beneficiary party name (search in party roles)
     */
    @Query("SELECT DISTINCT ic FROM InsuranceCase ic JOIN ic.partyRoles pr JOIN pr.party p " +
           "WHERE (p.firstName LIKE %:name% OR p.lastName LIKE %:name% OR CONCAT(p.firstName, ' ', p.lastName) LIKE %:name%) " +
           "AND pr.roleType = 'BENEFICIARY' AND ic.isActive = true")
    List<InsuranceCase> findByBeneficiaryPartyNameContaining(@Param("name") String name);

    /**
     * Find cases by party SSN (search in party roles)
     */
    @Query("SELECT DISTINCT ic FROM InsuranceCase ic JOIN ic.partyRoles pr JOIN pr.party p " +
           "WHERE p.ssn = :ssn AND ic.isActive = true")
    List<InsuranceCase> findByPartySsn(@Param("ssn") String ssn);

    /**
     * Find cases by party email (search in party roles)
     */
    @Query("SELECT DISTINCT ic FROM InsuranceCase ic JOIN ic.partyRoles pr JOIN pr.party p " +
           "WHERE p.email = :email AND ic.isActive = true")
    List<InsuranceCase> findByPartyEmail(@Param("email") String email);

    /**
     * Find cases created in date range
     */
    @Query("SELECT ic FROM InsuranceCase ic WHERE ic.createdAt BETWEEN :startDate AND :endDate AND ic.isActive = true")
    List<InsuranceCase> findByCreatedDateRange(@Param("startDate") String startDate, @Param("endDate") String endDate);

    /**
     * Find cases updated in date range
     */
    @Query("SELECT ic FROM InsuranceCase ic WHERE ic.updatedAt BETWEEN :startDate AND :endDate AND ic.isActive = true")
    List<InsuranceCase> findByUpdatedDateRange(@Param("startDate") String startDate, @Param("endDate") String endDate);

    /**
     * Count cases by status
     */
    long countByStatusAndIsActiveTrue(InsuranceCase.CaseStatus status);

    /**
     * Count cases by priority
     */
    long countByPriorityAndIsActiveTrue(InsuranceCase.Priority priority);

    /**
     * Count cases by product type
     */
    long countByProductTypeAndIsActiveTrue(String productType);

    /**
     * Find cases that need attention (pending documents, medical, etc.)
     */
    @Query("SELECT ic FROM InsuranceCase ic WHERE ic.status IN ('PENDING_DOCUMENTS', 'PENDING_MEDICAL') AND ic.isActive = true")
    List<InsuranceCase> findCasesNeedingAttention();

    /**
     * Find cases expiring soon
     */
    @Query("SELECT ic FROM InsuranceCase ic WHERE ic.insuranceAgeEffectiveDate <= :expiryDate AND ic.isActive = true")
    List<InsuranceCase> findCasesExpiringSoon(@Param("expiryDate") LocalDate expiryDate);
}
