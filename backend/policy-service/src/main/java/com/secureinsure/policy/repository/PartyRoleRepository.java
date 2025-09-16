package com.secureinsure.policy.repository;

import com.secureinsure.policy.entity.PartyRole;
import com.secureinsure.policy.entity.Party;
import com.secureinsure.policy.entity.InsuranceCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface PartyRoleRepository extends JpaRepository<PartyRole, Long> {

    /**
     * Find party roles by party ID
     */
    Set<PartyRole> findByPartyIdAndIsActiveTrue(Long partyId);

    /**
     * Find party roles by case ID
     */
    Set<PartyRole> findByInsuranceCaseIdAndIsActiveTrue(Long caseId);

    /**
     * Find party roles by party and case
     */
    Set<PartyRole> findByPartyAndInsuranceCaseAndIsActiveTrue(Party party, InsuranceCase insuranceCase);

    /**
     * Find party roles by party, case, and role type
     */
    boolean existsByPartyAndInsuranceCaseAndRoleType(Party party, InsuranceCase insuranceCase, PartyRole.RoleType roleType);

    /**
     * Find party roles by case ID and role type
     */
    Set<PartyRole> findByInsuranceCaseIdAndRoleTypeAndIsActiveTrue(Long caseId, PartyRole.RoleType roleType);

    /**
     * Find party roles by party ID and role type
     */
    Set<PartyRole> findByPartyIdAndRoleTypeAndIsActiveTrue(Long partyId, PartyRole.RoleType roleType);

    /**
     * Find primary party roles by case ID
     */
    Set<PartyRole> findByInsuranceCaseIdAndIsPrimaryTrueAndIsActiveTrue(Long caseId);

    /**
     * Find party roles by beneficiary type
     */
    Set<PartyRole> findByBeneficiaryTypeAndIsActiveTrue(PartyRole.BeneficiaryType beneficiaryType);

    /**
     * Find party roles by relationship to insured
     */
    List<PartyRole> findByRelationshipToInsuredContainingIgnoreCaseAndIsActiveTrue(String relationship);

    /**
     * Find party roles by effective date range
     */
    @Query("SELECT pr FROM PartyRole pr WHERE pr.effectiveDate BETWEEN :startDate AND :endDate AND pr.isActive = true")
    List<PartyRole> findByEffectiveDateRange(@Param("startDate") String startDate, @Param("endDate") String endDate);

    /**
     * Find party roles by termination date range
     */
    @Query("SELECT pr FROM PartyRole pr WHERE pr.terminationDate BETWEEN :startDate AND :endDate AND pr.isActive = true")
    List<PartyRole> findByTerminationDateRange(@Param("startDate") String startDate, @Param("endDate") String endDate);

    /**
     * Find active party roles for a specific party and case
     */
    @Query("SELECT pr FROM PartyRole pr WHERE pr.party.id = :partyId AND pr.insuranceCase.id = :caseId AND pr.isActive = true")
    Set<PartyRole> findByPartyIdAndCaseIdAndIsActiveTrue(@Param("partyId") Long partyId, @Param("caseId") Long caseId);

    /**
     * Find party roles by multiple role types for a case
     */
    @Query("SELECT pr FROM PartyRole pr WHERE pr.insuranceCase.id = :caseId AND pr.roleType IN :roleTypes AND pr.isActive = true")
    Set<PartyRole> findByCaseIdAndRoleTypesIn(@Param("caseId") Long caseId, @Param("roleTypes") List<PartyRole.RoleType> roleTypes);

    /**
     * Find party roles by beneficiary percentage range
     */
    @Query("SELECT pr FROM PartyRole pr WHERE pr.beneficiaryPercentage BETWEEN :minPercentage AND :maxPercentage AND pr.isActive = true")
    List<PartyRole> findByBeneficiaryPercentageRange(@Param("minPercentage") Double minPercentage, @Param("maxPercentage") Double maxPercentage);

    /**
     * Count party roles by case ID and role type
     */
    long countByInsuranceCaseIdAndRoleTypeAndIsActiveTrue(Long caseId, PartyRole.RoleType roleType);

    /**
     * Count party roles by party ID
     */
    long countByPartyIdAndIsActiveTrue(Long partyId);

    /**
     * Find party roles that are expiring soon
     */
    @Query("SELECT pr FROM PartyRole pr WHERE pr.terminationDate IS NOT NULL AND pr.terminationDate <= :expiryDate AND pr.isActive = true")
    List<PartyRole> findExpiringRoles(@Param("expiryDate") String expiryDate);
}
