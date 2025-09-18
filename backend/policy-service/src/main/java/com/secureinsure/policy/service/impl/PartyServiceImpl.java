package com.secureinsure.policy.service.impl;

import com.secureinsure.policy.dto.PartyDto;
import com.secureinsure.policy.dto.PartyRoleDto;
import com.secureinsure.policy.entity.Party;
import com.secureinsure.policy.entity.PartyRole;
import com.secureinsure.policy.entity.InsuranceCase;
import com.secureinsure.policy.repository.PartyRepository;
import com.secureinsure.policy.repository.PartyRoleRepository;
import com.secureinsure.policy.repository.InsuranceCaseRepository;
import com.secureinsure.policy.service.PartyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PartyServiceImpl implements PartyService {

    private final PartyRepository partyRepository;
    private final PartyRoleRepository partyRoleRepository;
    private final InsuranceCaseRepository insuranceCaseRepository;

    @Override
    public PartyDto createParty(PartyDto partyDto) {
        log.info("Creating new party: {}", partyDto.getFullName());
        
        // Check if party with same SSN or email already exists
        if (partyDto.getSsn() != null && partyRepository.existsBySsn(partyDto.getSsn())) {
            throw new IllegalArgumentException("Party with SSN " + partyDto.getSsn() + " already exists");
        }
        
        if (partyDto.getEmail() != null && partyRepository.existsByEmail(partyDto.getEmail())) {
            throw new IllegalArgumentException("Party with email " + partyDto.getEmail() + " already exists");
        }

        Party party = partyDto.toEntity();
        Party savedParty = partyRepository.save(party);
        
        log.info("Successfully created party with ID: {}", savedParty.getId());
        return PartyDto.fromEntity(savedParty);
    }

    @Override
    @Transactional(readOnly = true)
    public PartyDto getPartyById(Long partyId) {
        log.info("Retrieving party with ID: {}", partyId);
        
        Party party = partyRepository.findById(partyId)
                .orElseThrow(() -> new EntityNotFoundException("Party not found with ID: " + partyId));
        
        return PartyDto.fromEntity(party);
    }

    @Override
    public PartyDto updateParty(PartyDto partyDto) {
        log.info("Updating party with ID: {}", partyDto.getId());
        
        Party existingParty = partyRepository.findById(partyDto.getId())
                .orElseThrow(() -> new EntityNotFoundException("Party not found with ID: " + partyDto.getId()));

        // Check for SSN/email conflicts with other parties
        if (partyDto.getSsn() != null && !partyDto.getSsn().equals(existingParty.getSsn())) {
            if (partyRepository.existsBySsnAndIdNot(partyDto.getSsn(), partyDto.getId())) {
                throw new IllegalArgumentException("Party with SSN " + partyDto.getSsn() + " already exists");
            }
        }
        
        if (partyDto.getEmail() != null && !partyDto.getEmail().equals(existingParty.getEmail())) {
            if (partyRepository.existsByEmailAndIdNot(partyDto.getEmail(), partyDto.getId())) {
                throw new IllegalArgumentException("Party with email " + partyDto.getEmail() + " already exists");
            }
        }

        // Update fields
        Party updatedParty = partyDto.toEntity();
        updatedParty.setCreatedAt(existingParty.getCreatedAt());
        updatedParty.setCreatedBy(existingParty.getCreatedBy());
        
        Party savedParty = partyRepository.save(updatedParty);
        
        log.info("Successfully updated party with ID: {}", savedParty.getId());
        return PartyDto.fromEntity(savedParty);
    }

    @Override
    public void deleteParty(Long partyId) {
        log.info("Deleting party with ID: {}", partyId);
        
        if (!canDeleteParty(partyId)) {
            throw new IllegalStateException("Cannot delete party with ID " + partyId + " - has dependent data");
        }
        
        Party party = partyRepository.findById(partyId)
                .orElseThrow(() -> new EntityNotFoundException("Party not found with ID: " + partyId));
        
        party.setIsActive(false);
        partyRepository.save(party);
        
        log.info("Successfully soft deleted party with ID: {}", partyId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PartyDto> searchParties(String name, String email, String ssn, int page, int size) {
        log.info("Searching parties with criteria: name={}, email={}, ssn={}, page={}, size={}", 
                name, email, ssn, page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Party> partyPage;
        
        if (name != null && !name.trim().isEmpty()) {
            partyPage = partyRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
                    name.trim(), name.trim(), pageable);
        } else if (email != null && !email.trim().isEmpty()) {
            partyPage = partyRepository.findByEmailContainingIgnoreCase(email.trim(), pageable);
        } else if (ssn != null && !ssn.trim().isEmpty()) {
            partyPage = partyRepository.findBySsnContaining(ssn.trim(), pageable);
        } else {
            partyPage = partyRepository.findByIsActiveTrue(pageable);
        }
        
        return partyPage.getContent().stream()
                .map(PartyDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public PartyRoleDto addRoleToParty(PartyRoleDto roleDto) {
        log.info("Adding role {} to party with ID: {}", roleDto.getRoleType(), roleDto.getPartyId());
        
        Party party = partyRepository.findById(roleDto.getPartyId())
                .orElseThrow(() -> new EntityNotFoundException("Party not found with ID: " + roleDto.getPartyId()));
        
        InsuranceCase insuranceCase = insuranceCaseRepository.findById(roleDto.getCaseId())
                .orElseThrow(() -> new EntityNotFoundException("Insurance case not found with ID: " + roleDto.getCaseId()));

        // Check if party already has this role for this case
        if (partyRoleRepository.existsByPartyAndInsuranceCaseAndRoleType(
                party, insuranceCase, PartyRole.RoleType.valueOf(roleDto.getRoleType()))) {
            throw new IllegalArgumentException("Party already has role " + roleDto.getRoleType() + " for this case");
        }

        PartyRole partyRole = roleDto.toEntity();
        partyRole.setParty(party);
        partyRole.setInsuranceCase(insuranceCase);
        
        PartyRole savedRole = partyRoleRepository.save(partyRole);
        
        log.info("Successfully added role {} to party with ID: {}", savedRole.getRoleType(), party.getId());
        return PartyRoleDto.fromEntity(savedRole);
    }

    @Override
    @Transactional(readOnly = true)
    public Set<PartyRoleDto> getPartyRoles(Long partyId) {
        log.info("Retrieving roles for party with ID: {}", partyId);
        
        if (!partyRepository.existsById(partyId)) {
            throw new EntityNotFoundException("Party not found with ID: " + partyId);
        }
        
        Set<PartyRole> roles = partyRoleRepository.findByPartyIdAndIsActiveTrue(partyId);
        return roles.stream()
                .map(PartyRoleDto::fromEntity)
                .collect(Collectors.toSet());
    }

    @Override
    public PartyRoleDto updatePartyRole(PartyRoleDto roleDto) {
        log.info("Updating party role with ID: {}", roleDto.getId());
        
        PartyRole existingRole = partyRoleRepository.findById(roleDto.getId())
                .orElseThrow(() -> new EntityNotFoundException("Party role not found with ID: " + roleDto.getId()));
        
        // Validate that the role belongs to the specified party
        if (!existingRole.getParty().getId().equals(roleDto.getPartyId())) {
            throw new IllegalArgumentException("Role does not belong to the specified party");
        }

        // Update fields
        PartyRole updatedRole = roleDto.toEntity();
        updatedRole.setParty(existingRole.getParty());
        updatedRole.setInsuranceCase(existingRole.getInsuranceCase());
        updatedRole.setCreatedAt(existingRole.getCreatedAt());
        updatedRole.setCreatedBy(existingRole.getCreatedBy());
        
        PartyRole savedRole = partyRoleRepository.save(updatedRole);
        
        log.info("Successfully updated party role with ID: {}", savedRole.getId());
        return PartyRoleDto.fromEntity(savedRole);
    }

    @Override
    public void removeRoleFromParty(Long partyId, Long roleId) {
        log.info("Removing role {} from party with ID: {}", roleId, partyId);
        
        PartyRole partyRole = partyRoleRepository.findById(roleId)
                .orElseThrow(() -> new EntityNotFoundException("Party role not found with ID: " + roleId));
        
        if (!partyRole.getParty().getId().equals(partyId)) {
            throw new IllegalArgumentException("Role does not belong to the specified party");
        }
        
        partyRoleRepository.delete(partyRole);
        
        log.info("Successfully removed role {} from party with ID: {}", roleId, partyId);
    }

    @Override
    @Transactional(readOnly = true)
    public Set<PartyRoleDto> getCaseRoles(Long caseId) {
        log.info("Retrieving roles for case with ID: {}", caseId);
        
        if (!insuranceCaseRepository.existsById(caseId)) {
            throw new EntityNotFoundException("Insurance case not found with ID: " + caseId);
        }
        
        Set<PartyRole> roles = partyRoleRepository.findByInsuranceCaseIdAndIsActiveTrue(caseId);
        return roles.stream()
                .map(PartyRoleDto::fromEntity)
                .collect(Collectors.toSet());
    }

    @Override
    public PartyRoleDto addRoleToCase(PartyRoleDto roleDto) {
        log.info("Adding role {} to case with ID: {}", roleDto.getRoleType(), roleDto.getCaseId());
        
        Party party = partyRepository.findById(roleDto.getPartyId())
                .orElseThrow(() -> new EntityNotFoundException("Party not found with ID: " + roleDto.getPartyId()));
        
        InsuranceCase insuranceCase = insuranceCaseRepository.findById(roleDto.getCaseId())
                .orElseThrow(() -> new EntityNotFoundException("Insurance case not found with ID: " + roleDto.getCaseId()));

        // Check if party already has this role for this case
        if (partyRoleRepository.existsByPartyAndInsuranceCaseAndRoleType(
                party, insuranceCase, PartyRole.RoleType.valueOf(roleDto.getRoleType()))) {
            throw new IllegalArgumentException("Party already has role " + roleDto.getRoleType() + " for this case");
        }

        PartyRole partyRole = roleDto.toEntity();
        partyRole.setParty(party);
        partyRole.setInsuranceCase(insuranceCase);
        
        PartyRole savedRole = partyRoleRepository.save(partyRole);
        
        log.info("Successfully added role {} to case with ID: {}", savedRole.getRoleType(), insuranceCase.getId());
        return PartyRoleDto.fromEntity(savedRole);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean validateBeneficiaryAllocation(Long caseId) {
        log.info("Validating beneficiary allocation for case with ID: {}", caseId);
        
        Set<PartyRole> beneficiaryRoles = partyRoleRepository.findByInsuranceCaseIdAndRoleTypeAndIsActiveTrue(
                caseId, PartyRole.RoleType.BENEFICIARY);
        
        if (beneficiaryRoles.isEmpty()) {
            return true; // No beneficiaries to validate
        }
        
        BigDecimal totalPercentage = beneficiaryRoles.stream()
                .map(role -> role.getBeneficiaryPercentage() != null ? role.getBeneficiaryPercentage() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        boolean isValid = totalPercentage.compareTo(BigDecimal.valueOf(100)) == 0;
        
        log.info("Beneficiary allocation validation for case {}: {} (total: {}%)", 
                caseId, isValid ? "PASSED" : "FAILED", totalPercentage);
        
        return isValid;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canDeleteParty(Long partyId) {
        log.info("Checking if party with ID {} can be deleted", partyId);
        
        // Check if party has active roles
        Set<PartyRole> activeRoles = partyRoleRepository.findByPartyIdAndIsActiveTrue(partyId);
        boolean hasActiveRoles = !activeRoles.isEmpty();
        
        if (hasActiveRoles) {
            log.info("Party with ID {} cannot be deleted - has {} active roles", partyId, activeRoles.size());
            return false;
        }
        
        log.info("Party with ID {} can be deleted - no active roles", partyId);
        return true;
    }
}
