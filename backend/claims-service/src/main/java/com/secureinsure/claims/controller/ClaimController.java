package com.secureinsure.claims.controller;

import com.secureinsure.claims.dto.ClaimDto;
import com.secureinsure.claims.entity.ClaimStatus;
import com.secureinsure.claims.entity.ClaimType;
import com.secureinsure.claims.entity.PriorityLevel;
import com.secureinsure.claims.entity.RiskLevel;
import com.secureinsure.claims.service.ClaimService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/claims")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Claim Management", description = "APIs for managing insurance claims")
public class ClaimController {
    
    private final ClaimService claimService;
    
    @PostMapping
    @Operation(summary = "Create a new claim", description = "Creates a new insurance claim")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<ClaimDto> createClaim(@Valid @RequestBody ClaimDto claimDto) {
        log.info("Creating new claim for customer: {}", claimDto.getCustomerId());
        ClaimDto createdClaim = claimService.createClaim(claimDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdClaim);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get claim by ID", description = "Retrieves a claim by its ID")
    @PreAuthorize("hasRole('USER') or hasRole('AGENT') or hasRole('ADMIN') or hasRole('ADJUSTER')")
    public ResponseEntity<ClaimDto> getClaimById(@PathVariable Long id) {
        log.info("Retrieving claim by ID: {}", id);
        ClaimDto claim = claimService.getClaimById(id);
        return ResponseEntity.ok(claim);
    }
    
    @GetMapping("/number/{claimNumber}")
    @Operation(summary = "Get claim by number", description = "Retrieves a claim by its claim number")
    @PreAuthorize("hasRole('USER') or hasRole('AGENT') or hasRole('ADMIN') or hasRole('ADJUSTER')")
    public ResponseEntity<ClaimDto> getClaimByNumber(@PathVariable String claimNumber) {
        log.info("Retrieving claim by number: {}", claimNumber);
        ClaimDto claim = claimService.getClaimByNumber(claimNumber);
        return ResponseEntity.ok(claim);
    }
    
    @GetMapping
    @Operation(summary = "Get all claims", description = "Retrieves all claims with pagination")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN') or hasRole('ADJUSTER')")
    public ResponseEntity<Page<ClaimDto>> getAllClaims(@PageableDefault Pageable pageable) {
        log.info("Retrieving all claims with pagination");
        Page<ClaimDto> claims = claimService.getAllClaims(pageable);
        return ResponseEntity.ok(claims);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update claim", description = "Updates an existing claim")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN') or hasRole('ADJUSTER')")
    public ResponseEntity<ClaimDto> updateClaim(@PathVariable Long id, @Valid @RequestBody ClaimDto claimDto) {
        log.info("Updating claim with ID: {}", id);
        ClaimDto updatedClaim = claimService.updateClaim(id, claimDto);
        return ResponseEntity.ok(updatedClaim);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete claim", description = "Deletes a claim")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteClaim(@PathVariable Long id) {
        log.info("Deleting claim with ID: {}", id);
        claimService.deleteClaim(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search claims", description = "Search claims with various filters")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN') or hasRole('ADJUSTER')")
    public ResponseEntity<Page<ClaimDto>> searchClaims(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long policyId,
            @RequestParam(required = false) ClaimType claimType,
            @RequestParam(required = false) ClaimStatus status,
            @RequestParam(required = false) Long agentId,
            @RequestParam(required = false) Long adjusterId,
            @RequestParam(required = false) PriorityLevel priorityLevel,
            @RequestParam(required = false) RiskLevel riskLevel,
            @RequestParam(required = false) BigDecimal minEstimatedAmount,
            @RequestParam(required = false) BigDecimal maxEstimatedAmount,
            @RequestParam(required = false) BigDecimal minApprovedAmount,
            @RequestParam(required = false) BigDecimal maxApprovedAmount,
            @RequestParam(required = false) BigDecimal minPaidAmount,
            @RequestParam(required = false) BigDecimal maxPaidAmount,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String incidentLocation,
            @RequestParam(required = false) String description,
            @PageableDefault Pageable pageable) {
        
        log.info("Searching claims with filters");
        Page<ClaimDto> claims = claimService.searchClaims(
                customerId, policyId, claimType, status, agentId, adjusterId,
                priorityLevel, riskLevel, minEstimatedAmount, maxEstimatedAmount,
                minApprovedAmount, maxApprovedAmount, minPaidAmount, maxPaidAmount,
                startDate, endDate, incidentLocation, description, pageable
        );
        return ResponseEntity.ok(claims);
    }
    
    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get claims by customer", description = "Retrieves all claims for a specific customer")
    @PreAuthorize("hasRole('USER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<ClaimDto>> getClaimsByCustomerId(@PathVariable Long customerId) {
        log.info("Retrieving claims for customer: {}", customerId);
        List<ClaimDto> claims = claimService.getClaimsByCustomerId(customerId);
        return ResponseEntity.ok(claims);
    }
    
    @GetMapping("/policy/{policyId}")
    @Operation(summary = "Get claims by policy", description = "Retrieves all claims for a specific policy")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN') or hasRole('ADJUSTER')")
    public ResponseEntity<List<ClaimDto>> getClaimsByPolicyId(@PathVariable Long policyId) {
        log.info("Retrieving claims for policy: {}", policyId);
        List<ClaimDto> claims = claimService.getClaimsByPolicyId(policyId);
        return ResponseEntity.ok(claims);
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Get claims by status", description = "Retrieves all claims with a specific status")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN') or hasRole('ADJUSTER')")
    public ResponseEntity<List<ClaimDto>> getClaimsByStatus(@PathVariable ClaimStatus status) {
        log.info("Retrieving claims by status: {}", status);
        List<ClaimDto> claims = claimService.getClaimsByStatus(status);
        return ResponseEntity.ok(claims);
    }
    
    @GetMapping("/type/{claimType}")
    @Operation(summary = "Get claims by type", description = "Retrieves all claims of a specific type")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN') or hasRole('ADJUSTER')")
    public ResponseEntity<List<ClaimDto>> getClaimsByType(@PathVariable ClaimType claimType) {
        log.info("Retrieving claims by type: {}", claimType);
        List<ClaimDto> claims = claimService.getClaimsByType(claimType);
        return ResponseEntity.ok(claims);
    }
    
    @PostMapping("/{id}/submit")
    @Operation(summary = "Submit claim", description = "Submits a draft claim for processing")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<ClaimDto> submitClaim(@PathVariable Long id) {
        log.info("Submitting claim with ID: {}", id);
        ClaimDto submittedClaim = claimService.submitClaim(id);
        return ResponseEntity.ok(submittedClaim);
    }
    
    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve claim", description = "Approves a submitted claim")
    @PreAuthorize("hasRole('ADMIN') or hasRole('UNDERWRITER')")
    public ResponseEntity<ClaimDto> approveClaim(
            @PathVariable Long id,
            @RequestParam Long approvedBy,
            @RequestParam(required = false) String approvalNotes) {
        log.info("Approving claim with ID: {} by user: {}", id, approvedBy);
        ClaimDto approvedClaim = claimService.approveClaim(id, approvedBy, approvalNotes);
        return ResponseEntity.ok(approvedClaim);
    }
    
    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject claim", description = "Rejects a submitted claim")
    @PreAuthorize("hasRole('ADMIN') or hasRole('UNDERWRITER')")
    public ResponseEntity<ClaimDto> rejectClaim(
            @PathVariable Long id,
            @RequestParam Long rejectedBy,
            @RequestParam(required = false) String rejectionNotes) {
        log.info("Rejecting claim with ID: {} by user: {}", id, rejectedBy);
        ClaimDto rejectedClaim = claimService.rejectClaim(id, rejectedBy, rejectionNotes);
        return ResponseEntity.ok(rejectedClaim);
    }
    
    @PostMapping("/{id}/close")
    @Operation(summary = "Close claim", description = "Closes a processed claim")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN') or hasRole('ADJUSTER')")
    public ResponseEntity<ClaimDto> closeClaim(
            @PathVariable Long id,
            @RequestParam Long closedBy) {
        log.info("Closing claim with ID: {} by user: {}", id, closedBy);
        ClaimDto closedClaim = claimService.closeClaim(id, closedBy);
        return ResponseEntity.ok(closedClaim);
    }
    
    @GetMapping("/urgent")
    @Operation(summary = "Get urgent claims", description = "Retrieves all urgent claims requiring immediate attention")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN') or hasRole('ADJUSTER')")
    public ResponseEntity<List<ClaimDto>> getUrgentClaims() {
        log.info("Retrieving urgent claims");
        List<ClaimDto> claims = claimService.getUrgentClaims();
        return ResponseEntity.ok(claims);
    }
    
    @GetMapping("/requiring-action")
    @Operation(summary = "Get claims requiring action", description = "Retrieves all claims that require immediate action")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN') or hasRole('ADJUSTER')")
    public ResponseEntity<List<ClaimDto>> getClaimsRequiringAction() {
        log.info("Retrieving claims requiring action");
        List<ClaimDto> claims = claimService.getClaimsRequiringAction();
        return ResponseEntity.ok(claims);
    }
    
    @GetMapping("/{id}/outstanding-amount")
    @Operation(summary = "Get outstanding amount", description = "Calculates the outstanding amount for a claim")
    @PreAuthorize("hasRole('USER') or hasRole('AGENT') or hasRole('ADMIN') or hasRole('ADJUSTER')")
    public ResponseEntity<BigDecimal> getOutstandingAmount(@PathVariable Long id) {
        log.info("Calculating outstanding amount for claim: {}", id);
        BigDecimal outstandingAmount = claimService.getOutstandingAmount(id);
        return ResponseEntity.ok(outstandingAmount);
    }
    
    @GetMapping("/{id}/processing-percentage")
    @Operation(summary = "Get processing percentage", description = "Calculates the processing percentage for a claim")
    @PreAuthorize("hasRole('USER') or hasRole('AGENT') or hasRole('ADMIN') or hasRole('ADJUSTER')")
    public ResponseEntity<Double> getProcessingPercentage(@PathVariable Long id) {
        log.info("Calculating processing percentage for claim: {}", id);
        Double processingPercentage = claimService.getProcessingPercentage(id);
        return ResponseEntity.ok(processingPercentage);
    }
    
    @GetMapping("/{id}/processing-time")
    @Operation(summary = "Get processing time", description = "Calculates the processing time in days for a claim")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN') or hasRole('ADJUSTER')")
    public ResponseEntity<Long> getProcessingTimeDays(@PathVariable Long id) {
        log.info("Calculating processing time for claim: {}", id);
        Long processingTime = claimService.getProcessingTimeDays(id);
        return ResponseEntity.ok(processingTime);
    }
    
    @PostMapping("/{id}/assign-agent")
    @Operation(summary = "Assign to agent", description = "Assigns a claim to a specific agent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClaimDto> assignToAgent(
            @PathVariable Long id,
            @RequestParam Long agentId) {
        log.info("Assigning claim {} to agent: {}", id, agentId);
        ClaimDto updatedClaim = claimService.assignToAgent(id, agentId);
        return ResponseEntity.ok(updatedClaim);
    }
    
    @PostMapping("/{id}/assign-adjuster")
    @Operation(summary = "Assign to adjuster", description = "Assigns a claim to a specific adjuster")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClaimDto> assignToAdjuster(
            @PathVariable Long id,
            @RequestParam Long adjusterId) {
        log.info("Assigning claim {} to adjuster: {}", id, adjusterId);
        ClaimDto updatedClaim = claimService.assignToAdjuster(id, adjusterId);
        return ResponseEntity.ok(updatedClaim);
    }
    
    @PostMapping("/{id}/update-priority")
    @Operation(summary = "Update priority level", description = "Updates the priority level of a claim")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN') or hasRole('ADJUSTER')")
    public ResponseEntity<ClaimDto> updatePriorityLevel(
            @PathVariable Long id,
            @RequestParam PriorityLevel priorityLevel) {
        log.info("Updating priority level for claim {} to: {}", id, priorityLevel);
        ClaimDto updatedClaim = claimService.updatePriorityLevel(id, priorityLevel);
        return ResponseEntity.ok(updatedClaim);
    }
    
    @PostMapping("/{id}/update-risk-level")
    @Operation(summary = "Update risk level", description = "Updates the risk level of a claim")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN') or hasRole('ADJUSTER')")
    public ResponseEntity<ClaimDto> updateRiskLevel(
            @PathVariable Long id,
            @RequestParam RiskLevel riskLevel) {
        log.info("Updating risk level for claim {} to: {}", id, riskLevel);
        ClaimDto updatedClaim = claimService.updateRiskLevel(id, riskLevel);
        return ResponseEntity.ok(updatedClaim);
    }
    
    @PostMapping("/{id}/calculate-fraud-score")
    @Operation(summary = "Calculate fraud score", description = "Calculates the fraud score for a claim")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADJUSTER')")
    public ResponseEntity<ClaimDto> calculateFraudScore(@PathVariable Long id) {
        log.info("Calculating fraud score for claim: {}", id);
        ClaimDto updatedClaim = claimService.calculateFraudScore(id);
        return ResponseEntity.ok(updatedClaim);
    }
    
    @PostMapping("/{id}/update-estimated-amount")
    @Operation(summary = "Update estimated amount", description = "Updates the estimated amount of a claim")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN') or hasRole('ADJUSTER')")
    public ResponseEntity<ClaimDto> updateEstimatedAmount(
            @PathVariable Long id,
            @RequestParam BigDecimal estimatedAmount) {
        log.info("Updating estimated amount for claim {} to: {}", id, estimatedAmount);
        ClaimDto updatedClaim = claimService.updateEstimatedAmount(id, estimatedAmount);
        return ResponseEntity.ok(updatedClaim);
    }
    
    @PostMapping("/{id}/update-approved-amount")
    @Operation(summary = "Update approved amount", description = "Updates the approved amount of a claim")
    @PreAuthorize("hasRole('ADMIN') or hasRole('UNDERWRITER')")
    public ResponseEntity<ClaimDto> updateApprovedAmount(
            @PathVariable Long id,
            @RequestParam BigDecimal approvedAmount) {
        log.info("Updating approved amount for claim {} to: {}", id, approvedAmount);
        ClaimDto updatedClaim = claimService.updateApprovedAmount(id, approvedAmount);
        return ResponseEntity.ok(updatedClaim);
    }
    
    @PostMapping("/{id}/update-paid-amount")
    @Operation(summary = "Update paid amount", description = "Updates the paid amount of a claim")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<ClaimDto> updatePaidAmount(
            @PathVariable Long id,
            @RequestParam BigDecimal paidAmount) {
        log.info("Updating paid amount for claim {} to: {}", id, paidAmount);
        ClaimDto updatedClaim = claimService.updatePaidAmount(id, paidAmount);
        return ResponseEntity.ok(updatedClaim);
    }
    
    @PostMapping("/{id}/add-investigation-notes")
    @Operation(summary = "Add investigation notes", description = "Adds investigation notes to a claim")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN') or hasRole('ADJUSTER')")
    public ResponseEntity<ClaimDto> addInvestigationNotes(
            @PathVariable Long id,
            @RequestParam String notes) {
        log.info("Adding investigation notes to claim: {}", id);
        ClaimDto updatedClaim = claimService.addInvestigationNotes(id, notes);
        return ResponseEntity.ok(updatedClaim);
    }
    
    @PostMapping("/{id}/add-approval-notes")
    @Operation(summary = "Add approval notes", description = "Adds approval notes to a claim")
    @PreAuthorize("hasRole('ADMIN') or hasRole('UNDERWRITER')")
    public ResponseEntity<ClaimDto> addApprovalNotes(
            @PathVariable Long id,
            @RequestParam String notes) {
        log.info("Adding approval notes to claim: {}", id);
        ClaimDto updatedClaim = claimService.addApprovalNotes(id, notes);
        return ResponseEntity.ok(updatedClaim);
    }
    
    @PostMapping("/{id}/add-rejection-notes")
    @Operation(summary = "Add rejection notes", description = "Adds rejection notes to a claim")
    @PreAuthorize("hasRole('ADMIN') or hasRole('UNDERWRITER')")
    public ResponseEntity<ClaimDto> addRejectionNotes(
            @PathVariable Long id,
            @RequestParam String notes) {
        log.info("Adding rejection notes to claim: {}", id);
        ClaimDto updatedClaim = claimService.addRejectionNotes(id, notes);
        return ResponseEntity.ok(updatedClaim);
    }
    
    @GetMapping("/statistics")
    @Operation(summary = "Get claim statistics", description = "Retrieves comprehensive claim statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getClaimStatistics() {
        log.info("Retrieving claim statistics");
        Map<String, Object> statistics = claimService.getClaimStatistics();
        return ResponseEntity.ok(statistics);
    }
    
    @GetMapping("/statistics/status")
    @Operation(summary = "Get statistics by status", description = "Retrieves claim statistics grouped by status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getClaimStatisticsByStatus() {
        log.info("Retrieving claim statistics by status");
        Map<String, Object> statistics = claimService.getClaimStatisticsByStatus();
        return ResponseEntity.ok(statistics);
    }
    
    @GetMapping("/statistics/type")
    @Operation(summary = "Get statistics by type", description = "Retrieves claim statistics grouped by type")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getClaimStatisticsByType() {
        log.info("Retrieving claim statistics by type");
        Map<String, Object> statistics = claimService.getClaimStatisticsByType();
        return ResponseEntity.ok(statistics);
    }
    
    @GetMapping("/statistics/date-range")
    @Operation(summary = "Get statistics by date range", description = "Retrieves claim statistics for a specific date range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getClaimStatisticsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Retrieving claim statistics for date range: {} to {}", startDate, endDate);
        Map<String, Object> statistics = claimService.getClaimStatisticsByDateRange(startDate, endDate);
        return ResponseEntity.ok(statistics);
    }
    
    @GetMapping("/validate/{id}")
    @Operation(summary = "Validate claim", description = "Validates a claim for submission")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<Boolean> validateClaimForSubmission(@PathVariable Long id) {
        log.info("Validating claim for submission: {}", id);
        boolean isValid = claimService.validateClaimForSubmission(id);
        return ResponseEntity.ok(isValid);
    }
    
    @GetMapping("/validate-approval/{id}")
    @Operation(summary = "Validate claim for approval", description = "Validates a claim for approval")
    @PreAuthorize("hasRole('ADMIN') or hasRole('UNDERWRITER')")
    public ResponseEntity<Boolean> validateClaimForApproval(@PathVariable Long id) {
        log.info("Validating claim for approval: {}", id);
        boolean isValid = claimService.validateClaimForApproval(id);
        return ResponseEntity.ok(isValid);
    }
    
    @GetMapping("/validate-payment/{id}")
    @Operation(summary = "Validate claim for payment", description = "Validates a claim for payment")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Boolean> validateClaimForPayment(@PathVariable Long id) {
        log.info("Validating claim for payment: {}", id);
        boolean isValid = claimService.validateClaimForPayment(id);
        return ResponseEntity.ok(isValid);
    }
} 