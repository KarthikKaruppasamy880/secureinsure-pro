package com.secureinsure.policy.controller;

import com.secureinsure.policy.dto.PartyDto;
import com.secureinsure.policy.dto.PartyRoleDto;
import com.secureinsure.policy.service.PartyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/party")
@RequiredArgsConstructor
@Slf4j
@Validated
@Tag(name = "Party Management", description = "APIs for managing parties and their roles in insurance cases")
public class PartyController {

    private final PartyService partyService;

    @PostMapping
    @Operation(summary = "Create a new party", description = "Creates a new party with basic information")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENT')")
    public ResponseEntity<PartyDto> createParty(@Valid @RequestBody PartyDto partyDto) {
        log.info("Creating new party: {}", partyDto.getFullName());
        PartyDto createdParty = partyService.createParty(partyDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdParty);
    }

    @GetMapping("/{partyId}")
    @Operation(summary = "Get party by ID", description = "Retrieves party information by party ID")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENT') or hasRole('USER')")
    public ResponseEntity<PartyDto> getParty(@PathVariable Long partyId) {
        log.info("Retrieving party with ID: {}", partyId);
        PartyDto party = partyService.getPartyById(partyId);
        return ResponseEntity.ok(party);
    }

    @PutMapping("/{partyId}")
    @Operation(summary = "Update party", description = "Updates existing party information")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENT')")
    public ResponseEntity<PartyDto> updateParty(@PathVariable Long partyId, @Valid @RequestBody PartyDto partyDto) {
        log.info("Updating party with ID: {}", partyId);
        partyDto.setId(partyId);
        PartyDto updatedParty = partyService.updateParty(partyDto);
        return ResponseEntity.ok(updatedParty);
    }

    @DeleteMapping("/{partyId}")
    @Operation(summary = "Delete party", description = "Soft deletes a party (marks as inactive)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteParty(@PathVariable Long partyId) {
        log.info("Deleting party with ID: {}", partyId);
        partyService.deleteParty(partyId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @Operation(summary = "Search parties", description = "Search parties by various criteria")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENT')")
    public ResponseEntity<List<PartyDto>> searchParties(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String ssn,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Searching parties with criteria: name={}, email={}, page={}, size={}", name, email, page, size);
        List<PartyDto> parties = partyService.searchParties(name, email, ssn, page, size);
        return ResponseEntity.ok(parties);
    }

    @PostMapping("/{partyId}/roles")
    @Operation(summary = "Add role to party", description = "Adds a new role to an existing party for a specific case")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENT')")
    public ResponseEntity<PartyRoleDto> addRoleToParty(
            @PathVariable Long partyId,
            @Valid @RequestBody PartyRoleDto roleDto) {
        log.info("Adding role {} to party with ID: {}", roleDto.getRoleType(), partyId);
        roleDto.setPartyId(partyId);
        PartyRoleDto createdRole = partyService.addRoleToParty(roleDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRole);
    }

    @GetMapping("/{partyId}/roles")
    @Operation(summary = "Get party roles", description = "Retrieves all roles for a specific party")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENT') or hasRole('USER')")
    public ResponseEntity<Set<PartyRoleDto>> getPartyRoles(@PathVariable Long partyId) {
        log.info("Retrieving roles for party with ID: {}", partyId);
        Set<PartyRoleDto> roles = partyService.getPartyRoles(partyId);
        return ResponseEntity.ok(roles);
    }

    @PutMapping("/{partyId}/roles/{roleId}")
    @Operation(summary = "Update party role", description = "Updates an existing role for a party")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENT')")
    public ResponseEntity<PartyRoleDto> updatePartyRole(
            @PathVariable Long partyId,
            @PathVariable Long roleId,
            @Valid @RequestBody PartyRoleDto roleDto) {
        log.info("Updating role {} for party with ID: {}", roleId, partyId);
        roleDto.setId(roleId);
        roleDto.setPartyId(partyId);
        PartyRoleDto updatedRole = partyService.updatePartyRole(roleDto);
        return ResponseEntity.ok(updatedRole);
    }

    @DeleteMapping("/{partyId}/roles/{roleId}")
    @Operation(summary = "Remove role from party", description = "Removes a specific role from a party")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENT')")
    public ResponseEntity<Void> removeRoleFromParty(
            @PathVariable Long partyId,
            @PathVariable Long roleId) {
        log.info("Removing role {} from party with ID: {}", roleId, partyId);
        partyService.removeRoleFromParty(partyId, roleId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/case/{caseId}/roles")
    @Operation(summary = "Get case roles", description = "Retrieves all party roles for a specific insurance case")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENT') or hasRole('USER')")
    public ResponseEntity<Set<PartyRoleDto>> getCaseRoles(@PathVariable Long caseId) {
        log.info("Retrieving roles for case with ID: {}", caseId);
        Set<PartyRoleDto> roles = partyService.getCaseRoles(caseId);
        return ResponseEntity.ok(roles);
    }

    @PostMapping("/case/{caseId}/roles")
    @Operation(summary = "Add role to case", description = "Adds a new party role to a specific insurance case")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENT')")
    public ResponseEntity<PartyRoleDto> addRoleToCase(
            @PathVariable Long caseId,
            @Valid @RequestBody PartyRoleDto roleDto) {
        log.info("Adding role {} to case with ID: {}", roleDto.getRoleType(), caseId);
        roleDto.setCaseId(caseId);
        PartyRoleDto createdRole = partyService.addRoleToCase(roleDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRole);
    }
}
