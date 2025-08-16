package com.secureinsure.admin.controller;

import com.secureinsure.admin.dto.SystemAuditDto;
import com.secureinsure.admin.dto.SystemConfigurationDto;
import com.secureinsure.admin.service.AdminService;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Management", description = "APIs for system administration")
public class AdminController {

    private final AdminService adminService;

    // System Audit Endpoints
    @PostMapping("/audits")
    @Operation(summary = "Create a new system audit", description = "Creates a new system audit entry")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemAuditDto> createAudit(@Valid @RequestBody SystemAuditDto auditDto) {
        log.info("Creating system audit: {}", auditDto.getAuditId());
        SystemAuditDto createdAudit = adminService.createAudit(auditDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdAudit);
    }

    @GetMapping("/audits/{id}")
    @Operation(summary = "Get audit by ID", description = "Retrieves a system audit by its ID")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemAuditDto> getAuditById(@PathVariable Long id) {
        log.debug("Retrieving audit by ID: {}", id);
        SystemAuditDto audit = adminService.getAuditById(id);
        return ResponseEntity.ok(audit);
    }

    @GetMapping("/audits/audit-id/{auditId}")
    @Operation(summary = "Get audit by audit ID", description = "Retrieves a system audit by its audit ID")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemAuditDto> getAuditByAuditId(@PathVariable String auditId) {
        log.debug("Retrieving audit by audit ID: {}", auditId);
        SystemAuditDto audit = adminService.getAuditByAuditId(auditId);
        return ResponseEntity.ok(audit);
    }

    @GetMapping("/audits")
    @Operation(summary = "Get all audits", description = "Retrieves all system audits with pagination")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<SystemAuditDto>> getAllAudits(
            @PageableDefault(size = 20) Pageable pageable) {
        log.debug("Retrieving all audits with pagination");
        Page<SystemAuditDto> audits = adminService.getAllAudits(pageable);
        return ResponseEntity.ok(audits);
    }

    @GetMapping("/audits/search")
    @Operation(summary = "Search audits", description = "Search system audits with filters")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<SystemAuditDto>> searchAudits(
            @Parameter(description = "Search query") @RequestParam String query,
            @PageableDefault(size = 20) Pageable pageable) {
        log.debug("Searching audits with query: {}", query);
        Page<SystemAuditDto> audits = adminService.searchAudits(query, pageable);
        return ResponseEntity.ok(audits);
    }

    @GetMapping("/audits/user/{userId}")
    @Operation(summary = "Get audits by user ID", description = "Retrieves all audits for a specific user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SystemAuditDto>> getAuditsByUserId(@PathVariable Long userId) {
        log.debug("Retrieving audits for user ID: {}", userId);
        List<SystemAuditDto> audits = adminService.getAuditsByUserId(userId);
        return ResponseEntity.ok(audits);
    }

    @GetMapping("/audits/action/{action}")
    @Operation(summary = "Get audits by action", description = "Retrieves all audits for a specific action")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SystemAuditDto>> getAuditsByAction(@PathVariable String action) {
        log.debug("Retrieving audits by action: {}", action);
        List<SystemAuditDto> audits = adminService.getAuditsByAction(action);
        return ResponseEntity.ok(audits);
    }

    @GetMapping("/audits/successful")
    @Operation(summary = "Get successful audits", description = "Retrieves all successful system audits")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SystemAuditDto>> getSuccessfulAudits() {
        log.debug("Retrieving successful audits");
        List<SystemAuditDto> audits = adminService.getSuccessfulAudits();
        return ResponseEntity.ok(audits);
    }

    @GetMapping("/audits/failed")
    @Operation(summary = "Get failed audits", description = "Retrieves all failed system audits")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SystemAuditDto>> getFailedAudits() {
        log.debug("Retrieving failed audits");
        List<SystemAuditDto> audits = adminService.getFailedAudits();
        return ResponseEntity.ok(audits);
    }

    @GetMapping("/audits/statistics")
    @Operation(summary = "Get audit statistics", description = "Retrieves comprehensive audit statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAuditStatistics() {
        log.debug("Retrieving audit statistics");
        Map<String, Object> statistics = adminService.getAuditStatistics();
        return ResponseEntity.ok(statistics);
    }

    @DeleteMapping("/audits/cleanup")
    @Operation(summary = "Cleanup old audits", description = "Deletes old audit records before the specified date")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> cleanupOldAudits(
            @Parameter(description = "Cutoff date for cleanup") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime cutoffDate) {
        log.info("Cleaning up old audits before: {}", cutoffDate);
        adminService.cleanupOldAudits(cutoffDate);
        return ResponseEntity.noContent().build();
    }

    // System Configuration Endpoints
    @PostMapping("/configurations")
    @Operation(summary = "Create a new configuration", description = "Creates a new system configuration")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemConfigurationDto> createConfiguration(@Valid @RequestBody SystemConfigurationDto configDto) {
        log.info("Creating system configuration: {}", configDto.getConfigKey());
        SystemConfigurationDto createdConfig = adminService.createConfiguration(configDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdConfig);
    }

    @GetMapping("/configurations/{id}")
    @Operation(summary = "Get configuration by ID", description = "Retrieves a system configuration by its ID")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemConfigurationDto> getConfigurationById(@PathVariable Long id) {
        log.debug("Retrieving configuration by ID: {}", id);
        SystemConfigurationDto config = adminService.getConfigurationById(id);
        return ResponseEntity.ok(config);
    }

    @GetMapping("/configurations/key/{configKey}")
    @Operation(summary = "Get configuration by key", description = "Retrieves a system configuration by its key")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemConfigurationDto> getConfigurationByKey(@PathVariable String configKey) {
        log.debug("Retrieving configuration by key: {}", configKey);
        SystemConfigurationDto config = adminService.getConfigurationByKey(configKey);
        return ResponseEntity.ok(config);
    }

    @GetMapping("/configurations")
    @Operation(summary = "Get all configurations", description = "Retrieves all system configurations with pagination")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<SystemConfigurationDto>> getAllConfigurations(
            @PageableDefault(size = 20) Pageable pageable) {
        log.debug("Retrieving all configurations with pagination");
        Page<SystemConfigurationDto> configs = adminService.getAllConfigurations(pageable);
        return ResponseEntity.ok(configs);
    }

    @GetMapping("/configurations/category/{category}")
    @Operation(summary = "Get configurations by category", description = "Retrieves all configurations for a specific category")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SystemConfigurationDto>> getConfigurationsByCategory(@PathVariable String category) {
        log.debug("Retrieving configurations by category: {}", category);
        List<SystemConfigurationDto> configs = adminService.getConfigurationsByCategory(category);
        return ResponseEntity.ok(configs);
    }

    @GetMapping("/configurations/encrypted")
    @Operation(summary = "Get encrypted configurations", description = "Retrieves all encrypted system configurations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SystemConfigurationDto>> getEncryptedConfigurations() {
        log.debug("Retrieving encrypted configurations");
        List<SystemConfigurationDto> configs = adminService.getEncryptedConfigurations();
        return ResponseEntity.ok(configs);
    }

    @GetMapping("/configurations/sensitive")
    @Operation(summary = "Get sensitive configurations", description = "Retrieves all sensitive system configurations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SystemConfigurationDto>> getSensitiveConfigurations() {
        log.debug("Retrieving sensitive configurations");
        List<SystemConfigurationDto> configs = adminService.getSensitiveConfigurations();
        return ResponseEntity.ok(configs);
    }

    @PutMapping("/configurations/{configKey}")
    @Operation(summary = "Update configuration", description = "Updates an existing system configuration")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemConfigurationDto> updateConfiguration(
            @PathVariable String configKey,
            @Valid @RequestBody SystemConfigurationDto configDto) {
        log.info("Updating configuration: {}", configKey);
        SystemConfigurationDto updatedConfig = adminService.updateConfiguration(configKey, configDto);
        return ResponseEntity.ok(updatedConfig);
    }

    @DeleteMapping("/configurations/{configKey}")
    @Operation(summary = "Delete configuration", description = "Deletes a system configuration")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteConfiguration(@PathVariable String configKey) {
        log.info("Deleting configuration: {}", configKey);
        adminService.deleteConfiguration(configKey);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/configurations/statistics")
    @Operation(summary = "Get configuration statistics", description = "Retrieves comprehensive configuration statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getConfigurationStatistics() {
        log.debug("Retrieving configuration statistics");
        Map<String, Object> statistics = adminService.getConfigurationStatistics();
        return ResponseEntity.ok(statistics);
    }

    // System Management Endpoints
    @GetMapping("/statistics")
    @Operation(summary = "Get system statistics", description = "Retrieves comprehensive system statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSystemStatistics() {
        log.debug("Retrieving system statistics");
        Map<String, Object> statistics = adminService.getSystemStatistics();
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/health")
    @Operation(summary = "Get system health", description = "Retrieves system health information")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        log.debug("Retrieving system health");
        Map<String, Object> health = adminService.getSystemHealth();
        return ResponseEntity.ok(health);
    }

    @GetMapping("/performance")
    @Operation(summary = "Get performance metrics", description = "Retrieves system performance metrics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getPerformanceMetrics() {
        log.debug("Retrieving performance metrics");
        Map<String, Object> metrics = adminService.getPerformanceMetrics();
        return ResponseEntity.ok(metrics);
    }

    // Validation Endpoints
    @PostMapping("/validate/audit")
    @Operation(summary = "Validate audit", description = "Validates audit data")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> validateAudit(@Valid @RequestBody SystemAuditDto auditDto) {
        log.debug("Validating audit data");
        boolean isValid = adminService.validateAudit(auditDto);
        Map<String, Object> response = Map.of("valid", isValid);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/validate/configuration")
    @Operation(summary = "Validate configuration", description = "Validates configuration data")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> validateConfiguration(@Valid @RequestBody SystemConfigurationDto configDto) {
        log.debug("Validating configuration data");
        boolean isValid = adminService.validateConfiguration(configDto);
        Map<String, Object> response = Map.of("valid", isValid);
        return ResponseEntity.ok(response);
    }

    // Utility Endpoints
    @GetMapping("/utils/generate-audit-id")
    @Operation(summary = "Generate audit ID", description = "Generates a new audit ID")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> generateAuditId() {
        log.debug("Generating audit ID");
        String auditId = adminService.generateAuditId();
        Map<String, String> response = Map.of("auditId", auditId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/utils/generate-random-string")
    @Operation(summary = "Generate random string", description = "Generates a random string of specified length")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> generateRandomString(
            @Parameter(description = "Length of the random string") @RequestParam(defaultValue = "10") int length) {
        log.debug("Generating random string of length: {}", length);
        String randomString = adminService.generateRandomString(length);
        Map<String, String> response = Map.of("randomString", randomString);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/utils/format-timestamp")
    @Operation(summary = "Format timestamp", description = "Formats a timestamp to readable string")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> formatTimestamp(
            @Parameter(description = "Timestamp to format") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime timestamp) {
        log.debug("Formatting timestamp: {}", timestamp);
        String formattedTimestamp = adminService.formatTimestamp(timestamp);
        Map<String, String> response = Map.of("formattedTimestamp", formattedTimestamp);
        return ResponseEntity.ok(response);
    }

    // Health Check Endpoint
    @GetMapping("/health-check")
    @Operation(summary = "Health check", description = "Performs a health check on the admin service")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        log.info("Performing admin service health check");
        try {
            adminService.healthCheck();
            Map<String, Object> response = Map.of(
                "status", "HEALTHY",
                "service", "Admin Service",
                "timestamp", LocalDateTime.now()
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Health check failed", e);
            Map<String, Object> response = Map.of(
                "status", "UNHEALTHY",
                "service", "Admin Service",
                "error", e.getMessage(),
                "timestamp", LocalDateTime.now()
            );
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
        }
    }
} 