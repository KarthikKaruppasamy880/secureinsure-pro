package com.secureinsure.policy.service;

import com.secureinsure.policy.dto.PartyDto;
import com.secureinsure.policy.dto.PartyRoleDto;

import java.util.List;
import java.util.Set;

public interface PartyService {

    /**
     * Creates a new party
     * @param partyDto the party data
     * @return the created party
     */
    PartyDto createParty(PartyDto partyDto);

    /**
     * Retrieves a party by ID
     * @param partyId the party ID
     * @return the party data
     */
    PartyDto getPartyById(Long partyId);

    /**
     * Updates an existing party
     * @param partyDto the updated party data
     * @return the updated party
     */
    PartyDto updateParty(PartyDto partyDto);

    /**
     * Soft deletes a party
     * @param partyId the party ID
     */
    void deleteParty(Long partyId);

    /**
     * Searches parties by various criteria
     * @param name the name to search for
     * @param email the email to search for
     * @param ssn the SSN to search for
     * @param page the page number (0-based)
     * @param size the page size
     * @return list of matching parties
     */
    List<PartyDto> searchParties(String name, String email, String ssn, int page, int size);

    /**
     * Adds a role to an existing party
     * @param roleDto the role data
     * @return the created role
     */
    PartyRoleDto addRoleToParty(PartyRoleDto roleDto);

    /**
     * Retrieves all roles for a specific party
     * @param partyId the party ID
     * @return set of party roles
     */
    Set<PartyRoleDto> getPartyRoles(Long partyId);

    /**
     * Updates an existing party role
     * @param roleDto the updated role data
     * @return the updated role
     */
    PartyRoleDto updatePartyRole(PartyRoleDto roleDto);

    /**
     * Removes a role from a party
     * @param partyId the party ID
     * @param roleId the role ID
     */
    void removeRoleFromParty(Long partyId, Long roleId);

    /**
     * Retrieves all party roles for a specific insurance case
     * @param caseId the case ID
     * @return set of case roles
     */
    Set<PartyRoleDto> getCaseRoles(Long caseId);

    /**
     * Adds a new party role to a specific insurance case
     * @param roleDto the role data
     * @return the created role
     */
    PartyRoleDto addRoleToCase(PartyRoleDto roleDto);

    /**
     * Validates beneficiary allocation percentages for a case
     * @param caseId the case ID
     * @return true if allocation is valid (sums to 100%), false otherwise
     */
    boolean validateBeneficiaryAllocation(Long caseId);

    /**
     * Checks if a party can be deleted (no dependent data)
     * @param partyId the party ID
     * @return true if party can be deleted, false otherwise
     */
    boolean canDeleteParty(Long partyId);
}
