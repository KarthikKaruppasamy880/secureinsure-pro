package com.secureinsure.policy.controller;

import com.secureinsure.policy.dto.PolicyDto;
import com.secureinsure.policy.entity.PolicyStatus;
import com.secureinsure.policy.entity.PolicyType;
import com.secureinsure.policy.service.PolicyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
@RequestMapping("/api/v1/policies")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Policy Management", description = "APIs for managing insurance policies")
public class PolicyController {
    
    private final PolicyService policyService;
    
    @PostMapping
    @Operation(summary = "Create a new policy", description = "Creates a new insurance policy")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<PolicyDto> createPolicy(@Valid @RequestBody PolicyDto policyDto) {
        log.info("Creating new policy for customer: {}", policyDto.getCustomerId());
        PolicyDto createdPolicy = policyService.createPolicy(policyDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPolicy);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get policy by ID", description = "Retrieves a policy by its ID")
    @PreAuthorize("hasRole('USER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<PolicyDto> getPolicyById(@PathVariable Long id) {
        log.debug("Fetching policy by ID: {}", id);
        PolicyDto policy = policyService.getPolicyById(id);
        return ResponseEntity.ok(policy);
    }
    
    @GetMapping("/number/{policyNumber}")
    @Operation(summary = "Get policy by number", description = "Retrieves a policy by its policy number")
    @PreAuthorize("hasRole('USER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<PolicyDto> getPolicyByNumber(@PathVariable String policyNumber) {
        log.debug("Fetching policy by number: {}", policyNumber);
        PolicyDto policy = policyService.getPolicyByNumber(policyNumber);
        return ResponseEntity.ok(policy);
    }
    
    @GetMapping
    @Operation(summary = "Get all policies", description = "Retrieves all policies with pagination")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Page<PolicyDto>> getAllPolicies(@PageableDefault Pageable pageable) {
        log.debug("Fetching all policies with pagination");
        Page<PolicyDto> policies = policyService.getAllPolicies(pageable);
        return ResponseEntity.ok(policies);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update policy", description = "Updates an existing policy")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<PolicyDto> updatePolicy(@PathVariable Long id, @Valid @RequestBody PolicyDto policyDto) {
        log.info("Updating policy with ID: {}", id);
        PolicyDto updatedPolicy = policyService.updatePolicy(id, policyDto);
        return ResponseEntity.ok(updatedPolicy);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete policy", description = "Deletes a policy")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePolicy(@PathVariable Long id) {
        log.info("Deleting policy with ID: {}", id);
        policyService.deletePolicy(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search policies", description = "Searches policies with various filters")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Page<PolicyDto>> searchPolicies(
            @Parameter(description = "Customer ID") @RequestParam(required = false) Long customerId,
            @Parameter(description = "Policy type") @RequestParam(required = false) PolicyType policyType,
            @Parameter(description = "Policy status") @RequestParam(required = false) PolicyStatus status,
            @Parameter(description = "Agent ID") @RequestParam(required = false) Long agentId,
            @Parameter(description = "Risk level") @RequestParam(required = false) String riskLevel,
            @Parameter(description = "Minimum premium amount") @RequestParam(required = false) BigDecimal minPremium,
            @Parameter(description = "Maximum premium amount") @RequestParam(required = false) BigDecimal maxPremium,
            @Parameter(description = "Start date") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault Pageable pageable) {
        
        log.debug("Searching policies with filters");
        Page<PolicyDto> policies = policyService.searchPolicies(
                customerId, policyType, status, agentId, riskLevel,
                minPremium, maxPremium, startDate, endDate, pageable);
        return ResponseEntity.ok(policies);
    }
    
    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get policies by customer", description = "Retrieves all policies for a specific customer")
    @PreAuthorize("hasRole('USER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Page<PolicyDto>> getPoliciesByCustomerId(
            @PathVariable Long customerId, @PageableDefault Pageable pageable) {
        log.debug("Fetching policies for customer: {}", customerId);
        Page<PolicyDto> policies = policyService.getPoliciesByCustomerId(customerId, pageable);
        return ResponseEntity.ok(policies);
    }
    
    @GetMapping("/customer/{customerId}/active")
    @Operation(summary = "Get active policies by customer", description = "Retrieves active policies for a specific customer")
    @PreAuthorize("hasRole('USER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<PolicyDto>> getActivePoliciesByCustomerId(@PathVariable Long customerId) {
        log.debug("Fetching active policies for customer: {}", customerId);
        List<PolicyDto> policies = policyService.getActivePoliciesByCustomerId(customerId);
        return ResponseEntity.ok(policies);
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Get policies by status", description = "Retrieves policies by status")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Page<PolicyDto>> getPoliciesByStatus(
            @PathVariable PolicyStatus status, @PageableDefault Pageable pageable) {
        log.debug("Fetching policies by status: {}", status);
        Page<PolicyDto> policies = policyService.getPoliciesByStatus(status, pageable);
        return ResponseEntity.ok(policies);
    }
    
    @GetMapping("/type/{policyType}")
    @Operation(summary = "Get policies by type", description = "Retrieves policies by type")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Page<PolicyDto>> getPoliciesByType(
            @PathVariable PolicyType policyType, @PageableDefault Pageable pageable) {
        log.debug("Fetching policies by type: {}", policyType);
        Page<PolicyDto> policies = policyService.getPoliciesByType(policyType, pageable);
        return ResponseEntity.ok(policies);
    }
    
    @GetMapping("/expiring")
    @Operation(summary = "Get expiring policies", description = "Retrieves policies expiring within a date range")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<PolicyDto>> getExpiringPolicies(
            @Parameter(description = "Start date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.debug("Fetching expiring policies between: {} and {}", startDate, endDate);
        List<PolicyDto> policies = policyService.getExpiringPolicies(startDate, endDate);
        return ResponseEntity.ok(policies);
    }
    
    @GetMapping("/expired")
    @Operation(summary = "Get expired policies", description = "Retrieves all expired policies")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<PolicyDto>> getExpiredPolicies() {
        log.debug("Fetching expired policies");
        List<PolicyDto> policies = policyService.getExpiredPolicies();
        return ResponseEntity.ok(policies);
    }
    
    @GetMapping("/agent/{agentId}")
    @Operation(summary = "Get policies by agent", description = "Retrieves policies by agent ID")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Page<PolicyDto>> getPoliciesByAgentId(
            @PathVariable Long agentId, @PageableDefault Pageable pageable) {
        log.debug("Fetching policies by agent ID: {}", agentId);
        Page<PolicyDto> policies = policyService.getPoliciesByAgentId(agentId, pageable);
        return ResponseEntity.ok(policies);
    }
    
    @GetMapping("/underwriter/{underwriterId}")
    @Operation(summary = "Get policies by underwriter", description = "Retrieves policies by underwriter ID")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<PolicyDto>> getPoliciesByUnderwriterId(
            @PathVariable Long underwriterId, @PageableDefault Pageable pageable) {
        log.debug("Fetching policies by underwriter ID: {}", underwriterId);
        Page<PolicyDto> policies = policyService.getPoliciesByUnderwriterId(underwriterId, pageable);
        return ResponseEntity.ok(policies);
    }
    
    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve policy", description = "Approves a policy")
    @PreAuthorize("hasRole('UNDERWRITER') or hasRole('ADMIN')")
    public ResponseEntity<PolicyDto> approvePolicy(
            @PathVariable Long id,
            @Parameter(description = "Approver ID") @RequestParam Long approvedBy,
            @Parameter(description = "Approval notes") @RequestParam(required = false) String approvalNotes) {
        log.info("Approving policy with ID: {} by user: {}", id, approvedBy);
        PolicyDto approvedPolicy = policyService.approvePolicy(id, approvedBy, approvalNotes);
        return ResponseEntity.ok(approvedPolicy);
    }
    
    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject policy", description = "Rejects a policy")
    @PreAuthorize("hasRole('UNDERWRITER') or hasRole('ADMIN')")
    public ResponseEntity<PolicyDto> rejectPolicy(
            @PathVariable Long id,
            @Parameter(description = "Rejector ID") @RequestParam Long rejectedBy,
            @Parameter(description = "Rejection reason") @RequestParam String rejectionReason) {
        log.info("Rejecting policy with ID: {} by user: {}", id, rejectedBy);
        PolicyDto rejectedPolicy = policyService.rejectPolicy(id, rejectedBy, rejectionReason);
        return ResponseEntity.ok(rejectedPolicy);
    }
    
    @PostMapping("/{id}/activate")
    @Operation(summary = "Activate policy", description = "Activates a policy")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<PolicyDto> activatePolicy(@PathVariable Long id) {
        log.info("Activating policy with ID: {}", id);
        PolicyDto activatedPolicy = policyService.activatePolicy(id);
        return ResponseEntity.ok(activatedPolicy);
    }
    
    @PostMapping("/{id}/suspend")
    @Operation(summary = "Suspend policy", description = "Suspends a policy")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<PolicyDto> suspendPolicy(
            @PathVariable Long id,
            @Parameter(description = "Suspension reason") @RequestParam String reason) {
        log.info("Suspending policy with ID: {}", id);
        PolicyDto suspendedPolicy = policyService.suspendPolicy(id, reason);
        return ResponseEntity.ok(suspendedPolicy);
    }
    
    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel policy", description = "Cancels a policy")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<PolicyDto> cancelPolicy(
            @PathVariable Long id,
            @Parameter(description = "Cancellation reason") @RequestParam String reason) {
        log.info("Cancelling policy with ID: {}", id);
        PolicyDto cancelledPolicy = policyService.cancelPolicy(id, reason);
        return ResponseEntity.ok(cancelledPolicy);
    }
    
    @PostMapping("/{id}/renew")
    @Operation(summary = "Renew policy", description = "Renews a policy with new expiry date")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<PolicyDto> renewPolicy(
            @PathVariable Long id,
            @Parameter(description = "New expiry date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate newExpiryDate) {
        log.info("Renewing policy with ID: {}", id);
        PolicyDto renewedPolicy = policyService.renewPolicy(id, newExpiryDate);
        return ResponseEntity.ok(renewedPolicy);
    }
    
    @PostMapping("/{id}/extend")
    @Operation(summary = "Extend policy", description = "Extends a policy by additional days")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<PolicyDto> extendPolicy(
            @PathVariable Long id,
            @Parameter(description = "Additional days") @RequestParam int additionalDays) {
        log.info("Extending policy with ID: {} by {} days", id, additionalDays);
        PolicyDto extendedPolicy = policyService.extendPolicy(id, additionalDays);
        return ResponseEntity.ok(extendedPolicy);
    }
    
    @PostMapping("/{id}/discount")
    @Operation(summary = "Apply discount", description = "Applies a discount to a policy")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<PolicyDto> applyDiscount(
            @PathVariable Long id,
            @Parameter(description = "Discount percentage") @RequestParam BigDecimal discountPercentage) {
        log.info("Applying discount to policy ID: {}", id);
        PolicyDto updatedPolicy = policyService.applyDiscount(id, discountPercentage);
        return ResponseEntity.ok(updatedPolicy);
    }
    
    @PutMapping("/{id}/premium")
    @Operation(summary = "Update premium", description = "Updates the premium amount for a policy")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<PolicyDto> updatePremium(
            @PathVariable Long id,
            @Parameter(description = "New premium amount") @RequestParam BigDecimal newPremiumAmount) {
        log.info("Updating premium for policy ID: {}", id);
        PolicyDto updatedPolicy = policyService.updatePremium(id, newPremiumAmount);
        return ResponseEntity.ok(updatedPolicy);
    }
    
    @GetMapping("/high-value")
    @Operation(summary = "Get high value policies", description = "Retrieves high value policies")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Page<PolicyDto>> getHighValuePolicies(
            @Parameter(description = "Minimum amount") @RequestParam BigDecimal minAmount,
            @PageableDefault Pageable pageable) {
        log.debug("Fetching high value policies with minimum amount: {}", minAmount);
        Page<PolicyDto> policies = policyService.getHighValuePolicies(minAmount, pageable);
        return ResponseEntity.ok(policies);
    }
    
    @GetMapping("/renewal-candidates")
    @Operation(summary = "Get renewal candidates", description = "Retrieves policies eligible for renewal")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<PolicyDto>> getRenewalCandidates(
            @Parameter(description = "Start date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.debug("Fetching renewal candidates between: {} and {}", startDate, endDate);
        List<PolicyDto> policies = policyService.getRenewalCandidates(startDate, endDate);
        return ResponseEntity.ok(policies);
    }
    
    @GetMapping("/statistics")
    @Operation(summary = "Get policy statistics", description = "Retrieves policy statistics")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getPolicyStatistics() {
        log.debug("Generating policy statistics");
        Map<String, Object> statistics = policyService.getPolicyStatistics();
        return ResponseEntity.ok(statistics);
    }
    
    @GetMapping("/statistics/date-range")
    @Operation(summary = "Get policy statistics by date range", description = "Retrieves policy statistics for a date range")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getPolicyStatisticsByDateRange(
            @Parameter(description = "Start date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.debug("Generating policy statistics for date range: {} to {}", startDate, endDate);
        Map<String, Object> statistics = policyService.getPolicyStatisticsByDateRange(startDate, endDate);
        return ResponseEntity.ok(statistics);
    }
    
    @GetMapping("/statistics/status/{status}")
    @Operation(summary = "Get policy statistics by status", description = "Retrieves policy statistics by status")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getPolicyStatisticsByStatus(@PathVariable PolicyStatus status) {
        log.debug("Generating policy statistics for status: {}", status);
        Map<String, Object> statistics = policyService.getPolicyStatisticsByStatus(status);
        return ResponseEntity.ok(statistics);
    }
    
    @GetMapping("/statistics/type/{policyType}")
    @Operation(summary = "Get policy statistics by type", description = "Retrieves policy statistics by type")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getPolicyStatisticsByType(@PathVariable PolicyType policyType) {
        log.debug("Generating policy statistics for type: {}", policyType);
        Map<String, Object> statistics = policyService.getPolicyStatisticsByType(policyType);
        return ResponseEntity.ok(statistics);
    }
    
    @PostMapping("/bulk")
    @Operation(summary = "Create bulk policies", description = "Creates multiple policies in bulk")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<PolicyDto>> createBulkPolicies(@Valid @RequestBody List<PolicyDto> policyDtos) {
        log.info("Creating {} policies in bulk", policyDtos.size());
        List<PolicyDto> createdPolicies = policyService.createBulkPolicies(policyDtos);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPolicies);
    }
    
    @PutMapping("/bulk")
    @Operation(summary = "Update bulk policies", description = "Updates multiple policies in bulk")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<PolicyDto>> updateBulkPolicies(@Valid @RequestBody List<PolicyDto> policyDtos) {
        log.info("Updating {} policies in bulk", policyDtos.size());
        List<PolicyDto> updatedPolicies = policyService.updateBulkPolicies(policyDtos);
        return ResponseEntity.ok(updatedPolicies);
    }
    
    @DeleteMapping("/bulk")
    @Operation(summary = "Delete bulk policies", description = "Deletes multiple policies in bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBulkPolicies(@RequestBody List<Long> policyIds) {
        log.info("Deleting {} policies in bulk", policyIds.size());
        policyService.deleteBulkPolicies(policyIds);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/bulk/renew")
    @Operation(summary = "Renew bulk policies", description = "Renews multiple policies in bulk")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<PolicyDto>> renewBulkPolicies(
            @RequestBody List<Long> policyIds,
            @Parameter(description = "New expiry date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate newExpiryDate) {
        log.info("Renewing {} policies in bulk", policyIds.size());
        List<PolicyDto> renewedPolicies = policyService.renewBulkPolicies(policyIds, newExpiryDate);
        return ResponseEntity.ok(renewedPolicies);
    }
    
    @GetMapping("/{id}/calculate-premium")
    @Operation(summary = "Calculate premium", description = "Calculates premium for a policy")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<BigDecimal> calculatePremium(@PathVariable Long id) {
        log.debug("Calculating premium for policy ID: {}", id);
        PolicyDto policyDto = policyService.getPolicyById(id);
        BigDecimal premium = policyService.calculatePremium(policyDto);
        return ResponseEntity.ok(premium);
    }
    
    @GetMapping("/{id}/days-until-expiry")
    @Operation(summary = "Get days until expiry", description = "Calculates days until policy expiry")
    @PreAuthorize("hasRole('USER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Long> getDaysUntilExpiry(@PathVariable Long id) {
        log.debug("Calculating days until expiry for policy ID: {}", id);
        Long daysUntilExpiry = policyService.getDaysUntilExpiry(id);
        return ResponseEntity.ok(daysUntilExpiry);
    }
    
    @GetMapping("/{id}/expiring-soon")
    @Operation(summary = "Check if policy is expiring soon", description = "Checks if a policy is expiring within 30 days")
    @PreAuthorize("hasRole('USER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Boolean> isExpiringSoon(@PathVariable Long id) {
        log.debug("Checking if policy ID: {} is expiring soon", id);
        boolean isExpiringSoon = policyService.isExpiringSoon(id);
        return ResponseEntity.ok(isExpiringSoon);
    }
    
    @GetMapping("/expiring-in-days/{days}")
    @Operation(summary = "Get policies expiring in days", description = "Retrieves policies expiring within specified days")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<PolicyDto>> getPoliciesExpiringInDays(@PathVariable int days) {
        log.debug("Fetching policies expiring in {} days", days);
        List<PolicyDto> policies = policyService.getPoliciesExpiringInDays(days);
        return ResponseEntity.ok(policies);
    }
} 