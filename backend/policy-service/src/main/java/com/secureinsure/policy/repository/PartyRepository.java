package com.secureinsure.policy.repository;

import com.secureinsure.policy.entity.Party;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PartyRepository extends JpaRepository<Party, Long> {

    /**
     * Find party by SSN
     */
    Optional<Party> findBySsn(String ssn);

    /**
     * Find party by email
     */
    Optional<Party> findByEmail(String email);

    /**
     * Check if party exists by SSN
     */
    boolean existsBySsn(String ssn);

    /**
     * Check if party exists by email
     */
    boolean existsByEmail(String email);

    /**
     * Check if party exists by SSN excluding a specific ID
     */
    boolean existsBySsnAndIdNot(String ssn, Long id);

    /**
     * Check if party exists by email excluding a specific ID
     */
    boolean existsByEmailAndIdNot(String email, Long id);

    /**
     * Find parties by first name or last name containing the search term (case-insensitive)
     */
    Page<Party> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
            String firstName, String lastName, Pageable pageable);

    /**
     * Find parties by email containing the search term (case-insensitive)
     */
    Page<Party> findByEmailContainingIgnoreCase(String email, Pageable pageable);

    /**
     * Find parties by SSN containing the search term
     */
    Page<Party> findBySsnContaining(String ssn, Pageable pageable);

    /**
     * Find active parties
     */
    Page<Party> findByIsActiveTrue(Pageable pageable);

    /**
     * Find parties by first name and last name (exact match)
     */
    List<Party> findByFirstNameAndLastName(String firstName, String lastName);

    /**
     * Find parties by first name, last name, and date of birth (exact match)
     */
    Optional<Party> findByFirstNameAndLastNameAndDateOfBirth(String firstName, String lastName, String dateOfBirth);

    /**
     * Find parties by phone number
     */
    List<Party> findByPhoneOrMobilePhone(String phone, String mobilePhone);

    /**
     * Find parties by city and state
     */
    List<Party> findByCityAndState(String city, String state);

    /**
     * Find parties by occupation
     */
    List<Party> findByOccupationContainingIgnoreCase(String occupation);

    /**
     * Find parties by employer name
     */
    List<Party> findByEmployerNameContainingIgnoreCase(String employerName);

    /**
     * Custom query to find parties with multiple roles
     */
    @Query("SELECT p FROM Party p JOIN p.roles r WHERE r.roleType IN :roleTypes AND r.isActive = true")
    List<Party> findByRoleTypes(@Param("roleTypes") List<String> roleTypes);

    /**
     * Custom query to find parties by case number
     */
    @Query("SELECT p FROM Party p JOIN p.roles r JOIN r.insuranceCase c WHERE c.caseNumber = :caseNumber AND r.isActive = true")
    List<Party> findByCaseNumber(@Param("caseNumber") String caseNumber);

    /**
     * Custom query to find parties by Zinnia case ID
     */
    @Query("SELECT p FROM Party p JOIN p.roles r JOIN r.insuranceCase c WHERE c.zinniaCaseId = :zinniaCaseId AND r.isActive = true")
    List<Party> findByZinniaCaseId(@Param("zinniaCaseId") String zinniaCaseId);
}
