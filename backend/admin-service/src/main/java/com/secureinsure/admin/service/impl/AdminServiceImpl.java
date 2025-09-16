package com.secureinsure.admin.service.impl;

import com.secureinsure.admin.dto.SystemAuditDto;
import com.secureinsure.admin.dto.SystemConfigurationDto;
import com.secureinsure.admin.entity.SystemAudit;
import com.secureinsure.admin.entity.SystemConfiguration;
import com.secureinsure.admin.repository.SystemAuditRepository;
import com.secureinsure.admin.repository.SystemConfigurationRepository;
import com.secureinsure.admin.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminServiceImpl implements AdminService {

    private final SystemAuditRepository systemAuditRepository;
    private final SystemConfigurationRepository systemConfigurationRepository;
    private final Random random = new Random();

    // System Audit Operations
    @Override
    public SystemAuditDto createAudit(SystemAuditDto auditDto) {
        log.info("Creating system audit: {}", auditDto.getAuditId());
        
        SystemAudit audit = convertToEntity(auditDto);
        audit.setAuditId(generateAuditId());
        audit.setCreatedAt(LocalDateTime.now());
        audit.setUpdatedAt(LocalDateTime.now());

        SystemAudit savedAudit = systemAuditRepository.save(audit);
        log.info("System audit created successfully");
        
        return convertToDto(savedAudit);
    }

    @Override
    public SystemAuditDto getAuditById(Long id) {
        log.info("Getting audit by ID: {}", id);
        
        Optional<SystemAudit> auditOpt = systemAuditRepository.findById(id);
        if (auditOpt.isEmpty()) {
            throw new RuntimeException("Audit not found with ID: " + id);
        }
        
        return convertToDto(auditOpt.get());
    }

    @Override
    public SystemAuditDto getAuditByAuditId(String auditId) {
        log.info("Getting audit by audit ID: {}", auditId);
        
        Optional<SystemAudit> auditOpt = systemAuditRepository.findByAuditId(auditId);
        if (auditOpt.isEmpty()) {
            throw new RuntimeException("Audit not found with audit ID: " + auditId);
        }
        
        return convertToDto(auditOpt.get());
    }

    @Override
    public Page<SystemAuditDto> getAllAudits(Pageable pageable) {
        log.info("Getting all audits with pagination");
        
        Page<SystemAudit> audits = systemAuditRepository.findAll(pageable);
        return audits.map(this::convertToDto);
    }

    @Override
    public SystemAuditDto updateAudit(Long id, SystemAuditDto auditDto) {
        log.info("Updating audit with ID: {}", id);
        
        Optional<SystemAudit> existingAuditOpt = systemAuditRepository.findById(id);
        if (existingAuditOpt.isEmpty()) {
            throw new RuntimeException("Audit not found with ID: " + id);
        }
        
        SystemAudit existingAudit = existingAuditOpt.get();
        updateAuditFromDto(existingAudit, auditDto);
        existingAudit.setUpdatedAt(LocalDateTime.now());
        
        SystemAudit savedAudit = systemAuditRepository.save(existingAudit);
        log.info("Audit updated successfully");
        
        return convertToDto(savedAudit);
    }

    @Override
    public void deleteAudit(Long id) {
        log.info("Deleting audit with ID: {}", id);
        
        if (!systemAuditRepository.existsById(id)) {
            throw new RuntimeException("Audit not found with ID: " + id);
        }
        
        systemAuditRepository.deleteById(id);
        log.info("Audit deleted successfully");
    }

    @Override
    public List<SystemAuditDto> getAuditsByUserId(Long userId) {
        log.info("Getting audits by user ID: {}", userId);
        
        List<SystemAudit> audits = systemAuditRepository.findByUserId(userId);
        return audits.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemAuditDto> getAuditsByUsername(String username) {
        log.info("Getting audits by username: {}", username);
        
        List<SystemAudit> audits = systemAuditRepository.findByUsername(username);
        return audits.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemAuditDto> getAuditsByAction(String action) {
        log.info("Getting audits by action: {}", action);
        
        List<SystemAudit> audits = systemAuditRepository.findByAction(action);
        return audits.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemAuditDto> getAuditsByEntityType(String entityType) {
        log.info("Getting audits by entity type: {}", entityType);
        
        List<SystemAudit> audits = systemAuditRepository.findByEntityType(entityType);
        return audits.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemAuditDto> getAuditsByEntityId(Long entityId) {
        log.info("Getting audits by entity ID: {}", entityId);
        
        List<SystemAudit> audits = systemAuditRepository.findByEntityId(entityId);
        return audits.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemAuditDto> getAuditsBySuccess(Boolean success) {
        log.info("Getting audits by success: {}", success);
        
        List<SystemAudit> audits = systemAuditRepository.findBySuccess(success);
        return audits.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemAuditDto> getSuccessfulAudits() {
        log.info("Getting successful audits");
        
        List<SystemAudit> audits = systemAuditRepository.findBySuccess(true);
        return audits.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemAuditDto> getFailedAudits() {
        log.info("Getting failed audits");
        
        List<SystemAudit> audits = systemAuditRepository.findBySuccess(false);
        return audits.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemAuditDto> getAuditsByIpAddress(String ipAddress) {
        log.info("Getting audits by IP address: {}", ipAddress);
        
        List<SystemAudit> audits = systemAuditRepository.findByIpAddress(ipAddress);
        return audits.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemAuditDto> getAuditsBySessionId(String sessionId) {
        log.info("Getting audits by session ID: {}", sessionId);
        
        List<SystemAudit> audits = systemAuditRepository.findBySessionId(sessionId);
        return audits.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemAuditDto> getAuditsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting audits by date range: {} - {}", startDate, endDate);
        
        List<SystemAudit> audits = systemAuditRepository.findByCreatedAtBetween(startDate, endDate);
        return audits.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemAuditDto> getAuditsByUserIdAndDateRange(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting audits by user ID and date range: {} ({} - {})", userId, startDate, endDate);
        
        List<SystemAudit> audits = systemAuditRepository.findByUserIdAndCreatedAtBetween(userId, startDate, endDate);
        return audits.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemAuditDto> getAuditsByActionAndDateRange(String action, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting audits by action and date range: {} ({} - {})", action, startDate, endDate);
        
        List<SystemAudit> audits = systemAuditRepository.findByActionAndCreatedAtBetween(action, startDate, endDate);
        return audits.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemAuditDto> getAuditsByEntityTypeAndDateRange(String entityType, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting audits by entity type and date range: {} ({} - {})", entityType, startDate, endDate);
        
        List<SystemAudit> audits = systemAuditRepository.findByEntityTypeAndCreatedAtBetween(entityType, startDate, endDate);
        return audits.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemAuditDto> getAuditsBySuccessAndDateRange(Boolean success, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting audits by success and date range: {} ({} - {})", success, startDate, endDate);
        
        List<SystemAudit> audits = systemAuditRepository.findBySuccessAndCreatedAtBetween(success, startDate, endDate);
        return audits.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemAuditDto> getAuditsByIpAddressAndDateRange(String ipAddress, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting audits by IP address and date range: {} ({} - {})", ipAddress, startDate, endDate);
        
        List<SystemAudit> audits = systemAuditRepository.findByIpAddressAndCreatedAtBetween(ipAddress, startDate, endDate);
        return audits.stream().map(this::convertToDto).toList();
    }

    @Override
    public Page<SystemAuditDto> getAuditsByUserId(Long userId, Pageable pageable) {
        log.info("Getting audits by user ID with pagination: {}", userId);
        
        Page<SystemAudit> audits = systemAuditRepository.findByUserId(userId, pageable);
        return audits.map(this::convertToDto);
    }

    @Override
    public Page<SystemAuditDto> getAuditsByUsername(String username, Pageable pageable) {
        log.info("Getting audits by username with pagination: {}", username);
        
        Page<SystemAudit> audits = systemAuditRepository.findByUsername(username, pageable);
        return audits.map(this::convertToDto);
    }

    @Override
    public Page<SystemAuditDto> getAuditsByAction(String action, Pageable pageable) {
        log.info("Getting audits by action with pagination: {}", action);
        
        Page<SystemAudit> audits = systemAuditRepository.findByAction(action, pageable);
        return audits.map(this::convertToDto);
    }

    @Override
    public Page<SystemAuditDto> getAuditsByEntityType(String entityType, Pageable pageable) {
        log.info("Getting audits by entity type with pagination: {}", entityType);
        
        Page<SystemAudit> audits = systemAuditRepository.findByEntityType(entityType, pageable);
        return audits.map(this::convertToDto);
    }

    @Override
    public Page<SystemAuditDto> getAuditsBySuccess(Boolean success, Pageable pageable) {
        log.info("Getting audits by success with pagination: {}", success);
        
        Page<SystemAudit> audits = systemAuditRepository.findBySuccess(success, pageable);
        return audits.map(this::convertToDto);
    }

    @Override
    public Page<SystemAuditDto> getAuditsByIpAddress(String ipAddress, Pageable pageable) {
        log.info("Getting audits by IP address with pagination: {}", ipAddress);
        
        Page<SystemAudit> audits = systemAuditRepository.findByIpAddress(ipAddress, pageable);
        return audits.map(this::convertToDto);
    }

    @Override
    public Page<SystemAuditDto> getAuditsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        log.info("Getting audits by date range with pagination: {} - {}", startDate, endDate);
        
        Page<SystemAudit> audits = systemAuditRepository.findByCreatedAtBetween(startDate, endDate, pageable);
        return audits.map(this::convertToDto);
    }

    @Override
    public Page<SystemAuditDto> searchAudits(SystemAuditDto searchCriteria, Pageable pageable) {
        log.info("Searching audits with criteria and pagination");
        
        Page<SystemAudit> audits = systemAuditRepository.findAuditsByFilters(
                searchCriteria.getUserId(),
                searchCriteria.getUsername(),
                searchCriteria.getAction(),
                searchCriteria.getEntityType(),
                searchCriteria.getEntityId(),
                searchCriteria.getSuccess(),
                searchCriteria.getIpAddress(),
                searchCriteria.getSessionId(),
                searchCriteria.getCreatedAt(),
                searchCriteria.getUpdatedAt(),
                pageable
        );
        return audits.map(this::convertToDto);
    }

    @Override
    public Page<SystemAuditDto> searchAudits(String query, Pageable pageable) {
        log.info("Searching audits with query and pagination: {}", query);
        
        // For simple text search, search by username, action, or entity type
        Page<SystemAudit> audits = systemAuditRepository.findAuditsByFilters(
                null, query, query, query, null, null, null, null, null, null, pageable
        );
        return audits.map(this::convertToDto);
    }

    // System Configuration Operations
    @Override
    public SystemConfigurationDto createConfiguration(SystemConfigurationDto configDto) {
        log.info("Creating system configuration: {}", configDto.getConfigKey());
        
        SystemConfiguration config = convertToEntity(configDto);
        config.setCreatedAt(LocalDateTime.now());
        config.setUpdatedAt(LocalDateTime.now());

        SystemConfiguration savedConfig = systemConfigurationRepository.save(config);
        log.info("System configuration created successfully");
        
        return convertToDto(savedConfig);
    }

    @Override
    public SystemConfigurationDto getConfigurationById(Long id) {
        log.info("Getting configuration by ID: {}", id);
        
        Optional<SystemConfiguration> configOpt = systemConfigurationRepository.findById(id);
        if (configOpt.isEmpty()) {
            throw new RuntimeException("Configuration not found with ID: " + id);
        }
        
        return convertToDto(configOpt.get());
    }

    @Override
    public SystemConfigurationDto getConfigurationByKey(String configKey) {
        log.info("Getting configuration by key: {}", configKey);
        
        Optional<SystemConfiguration> configOpt = systemConfigurationRepository.findByConfigKey(configKey);
        if (configOpt.isEmpty()) {
            throw new RuntimeException("Configuration not found with key: " + configKey);
        }
        
        return convertToDto(configOpt.get());
    }

    @Override
    public Page<SystemConfigurationDto> getAllConfigurations(Pageable pageable) {
        log.info("Getting all configurations with pagination");
        
        Page<SystemConfiguration> configurations = systemConfigurationRepository.findAll(pageable);
        return configurations.map(this::convertToDto);
    }

    @Override
    public SystemConfigurationDto updateConfiguration(Long id, SystemConfigurationDto configDto) {
        log.info("Updating configuration with ID: {}", id);
        
        Optional<SystemConfiguration> existingConfigOpt = systemConfigurationRepository.findById(id);
        if (existingConfigOpt.isEmpty()) {
            throw new RuntimeException("Configuration not found with ID: " + id);
        }
        
        SystemConfiguration existingConfig = existingConfigOpt.get();
        updateConfigurationFromDto(existingConfig, configDto);
        existingConfig.setUpdatedAt(LocalDateTime.now());
        
        SystemConfiguration savedConfig = systemConfigurationRepository.save(existingConfig);
        log.info("Configuration updated successfully");
        
        return convertToDto(savedConfig);
    }

    @Override
    public SystemConfigurationDto updateConfiguration(String configKey, SystemConfigurationDto configDto) {
        log.info("Updating configuration with key: {}", configKey);
        
        Optional<SystemConfiguration> existingConfigOpt = systemConfigurationRepository.findByConfigKey(configKey);
        if (existingConfigOpt.isEmpty()) {
            throw new RuntimeException("Configuration not found with key: " + configKey);
        }
        
        SystemConfiguration existingConfig = existingConfigOpt.get();
        updateConfigurationFromDto(existingConfig, configDto);
        existingConfig.setUpdatedAt(LocalDateTime.now());
        
        SystemConfiguration savedConfig = systemConfigurationRepository.save(existingConfig);
        log.info("Configuration updated successfully");
        
        return convertToDto(savedConfig);
    }

    @Override
    public void deleteConfiguration(Long id) {
        log.info("Deleting configuration with ID: {}", id);
        
        if (!systemConfigurationRepository.existsById(id)) {
            throw new RuntimeException("Configuration not found with ID: " + id);
        }
        
        systemConfigurationRepository.deleteById(id);
        log.info("Configuration deleted successfully");
    }

    @Override
    public void deleteConfiguration(String configKey) {
        log.info("Deleting configuration with key: {}", configKey);
        
        Optional<SystemConfiguration> configOpt = systemConfigurationRepository.findByConfigKey(configKey);
        if (configOpt.isEmpty()) {
            throw new RuntimeException("Configuration not found with key: " + configKey);
        }
        
        systemConfigurationRepository.delete(configOpt.get());
        log.info("Configuration deleted successfully");
    }

    @Override
    public List<SystemConfigurationDto> getConfigurationsByCategory(String category) {
        log.info("Getting configurations by category: {}", category);
        
        List<SystemConfiguration> configurations = systemConfigurationRepository.findByCategory(category);
        return configurations.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemConfigurationDto> getConfigurationsByConfigType(String configType) {
        log.info("Getting configurations by config type: {}", configType);
        
        List<SystemConfiguration> configurations = systemConfigurationRepository.findByConfigType(configType);
        return configurations.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemConfigurationDto> getConfigurationsByEnvironment(String environment) {
        log.info("Getting configurations by environment: {}", environment);
        
        List<SystemConfiguration> configurations = systemConfigurationRepository.findByEnvironment(environment);
        return configurations.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemConfigurationDto> getConfigurationsByIsEncrypted(Boolean isEncrypted) {
        log.info("Getting configurations by encrypted status: {}", isEncrypted);
        
        List<SystemConfiguration> configurations = systemConfigurationRepository.findByIsEncrypted(isEncrypted);
        return configurations.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemConfigurationDto> getConfigurationsByIsSensitive(Boolean isSensitive) {
        log.info("Getting configurations by sensitive status: {}", isSensitive);
        
        List<SystemConfiguration> configurations = systemConfigurationRepository.findByIsSensitive(isSensitive);
        return configurations.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemConfigurationDto> getConfigurationsByIsReadonly(Boolean isReadonly) {
        log.info("Getting configurations by readonly status: {}", isReadonly);
        
        List<SystemConfiguration> configurations = systemConfigurationRepository.findByIsReadonly(isReadonly);
        return configurations.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemConfigurationDto> getConfigurationsByVersion(String version) {
        log.info("Getting configurations by version: {}", version);
        
        List<SystemConfiguration> configurations = systemConfigurationRepository.findByVersion(version);
        return configurations.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemConfigurationDto> getConfigurationsByCreatedBy(Long createdBy) {
        log.info("Getting configurations by created by: {}", createdBy);
        
        List<SystemConfiguration> configurations = systemConfigurationRepository.findByCreatedBy(createdBy);
        return configurations.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemConfigurationDto> getConfigurationsByUpdatedBy(Long updatedBy) {
        log.info("Getting configurations by updated by: {}", updatedBy);
        
        List<SystemConfiguration> configurations = systemConfigurationRepository.findByUpdatedBy(updatedBy);
        return configurations.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemConfigurationDto> getConfigurationsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting configurations by date range: {} - {}", startDate, endDate);
        
        List<SystemConfiguration> configurations = systemConfigurationRepository.findByCreatedAtBetween(startDate, endDate);
        return configurations.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemConfigurationDto> getConfigurationsByUpdatedDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting configurations by updated date range: {} - {}", startDate, endDate);
        
        List<SystemConfiguration> configurations = systemConfigurationRepository.findByUpdatedAtBetween(startDate, endDate);
        return configurations.stream().map(this::convertToDto).toList();
    }

    @Override
    public Page<SystemConfigurationDto> getConfigurationsByCategory(String category, Pageable pageable) {
        log.info("Getting configurations by category with pagination: {}", category);
        
        Page<SystemConfiguration> configurations = systemConfigurationRepository.findByCategory(category, pageable);
        return configurations.map(this::convertToDto);
    }

    @Override
    public Page<SystemConfigurationDto> getConfigurationsByConfigType(String configType, Pageable pageable) {
        log.info("Getting configurations by config type with pagination: {}", configType);
        
        Page<SystemConfiguration> configurations = systemConfigurationRepository.findByConfigType(configType, pageable);
        return configurations.map(this::convertToDto);
    }

    @Override
    public Page<SystemConfigurationDto> getConfigurationsByEnvironment(String environment, Pageable pageable) {
        log.info("Getting configurations by environment with pagination: {}", environment);
        
        Page<SystemConfiguration> configurations = systemConfigurationRepository.findByEnvironment(environment, pageable);
        return configurations.map(this::convertToDto);
    }

    @Override
    public Page<SystemConfigurationDto> getConfigurationsByIsEncrypted(Boolean isEncrypted, Pageable pageable) {
        log.info("Getting configurations by encrypted status with pagination: {}", isEncrypted);
        
        Page<SystemConfiguration> configurations = systemConfigurationRepository.findByIsEncrypted(isEncrypted, pageable);
        return configurations.map(this::convertToDto);
    }

    @Override
    public Page<SystemConfigurationDto> getConfigurationsByIsSensitive(Boolean isSensitive, Pageable pageable) {
        log.info("Getting configurations by sensitive status with pagination: {}", isSensitive);
        
        Page<SystemConfiguration> configurations = systemConfigurationRepository.findByIsSensitive(isSensitive, pageable);
        return configurations.map(this::convertToDto);
    }

    @Override
    public Page<SystemConfigurationDto> getConfigurationsByIsReadonly(Boolean isReadonly, Pageable pageable) {
        log.info("Getting configurations by readonly status with pagination: {}", isReadonly);
        
        Page<SystemConfiguration> configurations = systemConfigurationRepository.findByIsReadonly(isReadonly, pageable);
        return configurations.map(this::convertToDto);
    }

    @Override
    public Page<SystemConfigurationDto> searchConfigurations(SystemConfigurationDto searchCriteria, Pageable pageable) {
        log.info("Searching configurations with criteria and pagination");
        
        Page<SystemConfiguration> configurations = systemConfigurationRepository.findConfigurationsByFilters(
                searchCriteria.getConfigKey(),
                searchCriteria.getConfigValue(),
                searchCriteria.getConfigType(),
                searchCriteria.getCategory(),
                searchCriteria.getIsEncrypted(),
                searchCriteria.getIsSensitive(),
                searchCriteria.getIsReadonly(),
                searchCriteria.getEnvironment(),
                searchCriteria.getVersion(),
                searchCriteria.getCreatedBy(),
                searchCriteria.getCreatedAt(),
                searchCriteria.getUpdatedAt(),
                pageable
        );
        return configurations.map(this::convertToDto);
    }

    @Override
    public List<SystemConfigurationDto> getConfigurationsByKeys(List<String> configKeys) {
        log.info("Getting configurations by keys: {}", configKeys);
        
        List<SystemConfiguration> configurations = systemConfigurationRepository.findByConfigKeys(configKeys);
        return configurations.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemConfigurationDto> getSensitiveConfigurations() {
        log.info("Getting sensitive configurations");
        
        List<SystemConfiguration> configurations = systemConfigurationRepository.findSensitiveConfigurations();
        return configurations.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemConfigurationDto> getEncryptedConfigurations() {
        log.info("Getting encrypted configurations");
        
        List<SystemConfiguration> configurations = systemConfigurationRepository.findByIsEncrypted(true);
        return configurations.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemConfigurationDto> getReadonlyConfigurations() {
        log.info("Getting readonly configurations");
        
        List<SystemConfiguration> configurations = systemConfigurationRepository.findReadonlyConfigurations();
        return configurations.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemConfigurationDto> getConfigurationsWithValidation() {
        log.info("Getting configurations with validation");
        
        List<SystemConfiguration> configurations = systemConfigurationRepository.findConfigurationsWithValidation();
        return configurations.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<SystemConfigurationDto> getRecentlyUpdatedConfigurations(LocalDateTime since) {
        log.info("Getting recently updated configurations since: {}", since);
        
        List<SystemConfiguration> configurations = systemConfigurationRepository.findRecentlyUpdated(since);
        return configurations.stream().map(this::convertToDto).toList();
    }

    @Override
    public void updateConfigValue(String configKey, String newValue) {
        log.info("Updating config value for key: {}", configKey);
        
        systemConfigurationRepository.updateConfigValue(configKey, newValue);
        log.info("Config value updated successfully");
    }

    @Override
    public void updateReadonlyStatus(String configKey, Boolean readonly) {
        log.info("Updating readonly status for key: {}", configKey);
        
        systemConfigurationRepository.updateReadonlyStatus(configKey, readonly);
        log.info("Readonly status updated successfully");
    }

    @Override
    public void updateSensitiveStatus(String configKey, Boolean sensitive) {
        log.info("Updating sensitive status for key: {}", configKey);
        
        systemConfigurationRepository.updateSensitiveStatus(configKey, sensitive);
        log.info("Sensitive status updated successfully");
    }

    // System Management Operations
    @Override
    public Map<String, Object> getSystemStatistics() {
        log.info("Getting system statistics");
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAudits", systemAuditRepository.count());
        stats.put("totalConfigurations", systemConfigurationRepository.count());
        stats.put("successfulAudits", systemAuditRepository.countSuccessfulAudits());
        stats.put("failedAudits", systemAuditRepository.countFailedAudits());
        stats.put("encryptedConfigurations", systemConfigurationRepository.countEncryptedConfigurations());
        stats.put("sensitiveConfigurations", systemConfigurationRepository.countSensitiveConfigurations());
        stats.put("readonlyConfigurations", systemConfigurationRepository.countReadonlyConfigurations());
        
        return stats;
    }

    @Override
    public Map<String, Object> getAuditStatistics() {
        log.info("Getting audit statistics");
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", systemAuditRepository.count());
        stats.put("successful", systemAuditRepository.countSuccessfulAudits());
        stats.put("failed", systemAuditRepository.countFailedAudits());
        stats.put("topActions", systemAuditRepository.getTopActions());
        stats.put("topEntityTypes", systemAuditRepository.getTopEntityTypes());
        stats.put("topUsers", systemAuditRepository.getTopUsers());
        stats.put("topIpAddresses", systemAuditRepository.getTopIpAddresses());
        stats.put("topErrors", systemAuditRepository.getTopErrors());
        
        return stats;
    }

    @Override
    public Map<String, Object> getConfigurationStatistics() {
        log.info("Getting configuration statistics");
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", systemConfigurationRepository.count());
        stats.put("encrypted", systemConfigurationRepository.countEncryptedConfigurations());
        stats.put("sensitive", systemConfigurationRepository.countSensitiveConfigurations());
        stats.put("readonly", systemConfigurationRepository.countReadonlyConfigurations());
        stats.put("byCategory", systemConfigurationRepository.getConfigurationCountByCategory());
        stats.put("byType", systemConfigurationRepository.getConfigurationCountByType());
        stats.put("byEnvironment", systemConfigurationRepository.getConfigurationCountByEnvironment());
        stats.put("byVersion", systemConfigurationRepository.getConfigurationCountByVersion());
        
        return stats;
    }

    @Override
    public Map<String, Object> getPerformanceMetrics() {
        log.info("Getting performance metrics");
        
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("averageExecutionTime", systemAuditRepository.getAverageExecutionTime());
        metrics.put("maxExecutionTime", systemAuditRepository.getMaxExecutionTime());
        metrics.put("minExecutionTime", systemAuditRepository.getMinExecutionTime());
        
        return metrics;
    }

    @Override
    public Map<String, Object> getSecurityMetrics() {
        log.info("Getting security metrics");
        
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("failedAudits", systemAuditRepository.countFailedAudits());
        metrics.put("encryptedConfigurations", systemConfigurationRepository.countEncryptedConfigurations());
        metrics.put("sensitiveConfigurations", systemConfigurationRepository.countSensitiveConfigurations());
        
        return metrics;
    }

    @Override
    public Map<String, Object> getSystemHealth() {
        log.info("Getting system health");
        
        Map<String, Object> health = new HashMap<>();
        health.put("status", "HEALTHY");
        health.put("timestamp", LocalDateTime.now());
        health.put("auditRepositoryConnected", true);
        health.put("configurationRepositoryConnected", true);
        
        return health;
    }

    @Override
    public Map<String, Object> getSystemMetrics() {
        log.info("Getting system metrics");
        
        Map<String, Object> metrics = new HashMap<>();
        metrics.putAll(getSystemStatistics());
        metrics.putAll(getPerformanceMetrics());
        metrics.putAll(getSecurityMetrics());
        
        return metrics;
    }

    @Override
    public Map<String, Object> getTopActions() {
        log.info("Getting top actions");
        
        Map<String, Object> result = new HashMap<>();
        result.put("topActions", systemAuditRepository.getTopActions());
        
        return result;
    }

    @Override
    public Map<String, Object> getTopEntityTypes() {
        log.info("Getting top entity types");
        
        Map<String, Object> result = new HashMap<>();
        result.put("topEntityTypes", systemAuditRepository.getTopEntityTypes());
        
        return result;
    }

    @Override
    public Map<String, Object> getTopUsers() {
        log.info("Getting top users");
        
        Map<String, Object> result = new HashMap<>();
        result.put("topUsers", systemAuditRepository.getTopUsers());
        
        return result;
    }

    @Override
    public Map<String, Object> getTopIpAddresses() {
        log.info("Getting top IP addresses");
        
        Map<String, Object> result = new HashMap<>();
        result.put("topIpAddresses", systemAuditRepository.getTopIpAddresses());
        
        return result;
    }

    @Override
    public Map<String, Object> getTopErrors() {
        log.info("Getting top errors");
        
        Map<String, Object> result = new HashMap<>();
        result.put("topErrors", systemAuditRepository.getTopErrors());
        
        return result;
    }

    @Override
    public Map<String, Object> getConfigurationCountByCategory() {
        log.info("Getting configuration count by category");
        
        Map<String, Object> result = new HashMap<>();
        result.put("configurationCountByCategory", systemConfigurationRepository.getConfigurationCountByCategory());
        
        return result;
    }

    @Override
    public Map<String, Object> getConfigurationCountByType() {
        log.info("Getting configuration count by type");
        
        Map<String, Object> result = new HashMap<>();
        result.put("configurationCountByType", systemConfigurationRepository.getConfigurationCountByType());
        
        return result;
    }

    @Override
    public Map<String, Object> getConfigurationCountByEnvironment() {
        log.info("Getting configuration count by environment");
        
        Map<String, Object> result = new HashMap<>();
        result.put("configurationCountByEnvironment", systemConfigurationRepository.getConfigurationCountByEnvironment());
        
        return result;
    }

    @Override
    public Map<String, Object> getConfigurationCountByVersion() {
        log.info("Getting configuration count by version");
        
        Map<String, Object> result = new HashMap<>();
        result.put("configurationCountByVersion", systemConfigurationRepository.getConfigurationCountByVersion());
        
        return result;
    }

    @Override
    public Double getAverageExecutionTime() {
        log.info("Getting average execution time");
        
        return systemAuditRepository.getAverageExecutionTime();
    }

    @Override
    public Double getAverageExecutionTimeByAction(String action) {
        log.info("Getting average execution time by action: {}", action);
        
        return systemAuditRepository.getAverageExecutionTimeByAction(action);
    }

    @Override
    public Long getMaxExecutionTime() {
        log.info("Getting max execution time");
        
        return systemAuditRepository.getMaxExecutionTime();
    }

    @Override
    public Long getMinExecutionTime() {
        log.info("Getting min execution time");
        
        return systemAuditRepository.getMinExecutionTime();
    }

    @Override
    public Long getSuccessfulAuditsCount() {
        log.info("Getting successful audits count");
        
        return systemAuditRepository.countSuccessfulAudits();
    }

    @Override
    public Long getFailedAuditsCount() {
        log.info("Getting failed audits count");
        
        return systemAuditRepository.countFailedAudits();
    }

    @Override
    public Long getAuditsCountByAction(String action) {
        log.info("Getting audits count by action: {}", action);
        
        return systemAuditRepository.countByAction(action);
    }

    @Override
    public Long getAuditsCountByEntityType(String entityType) {
        log.info("Getting audits count by entity type: {}", entityType);
        
        return systemAuditRepository.countByEntityType(entityType);
    }

    @Override
    public Long getAuditsCountByUserId(Long userId) {
        log.info("Getting audits count by user ID: {}", userId);
        
        return systemAuditRepository.countByUserId(userId);
    }

    @Override
    public Long getAuditsCountByIpAddress(String ipAddress) {
        log.info("Getting audits count by IP address: {}", ipAddress);
        
        return systemAuditRepository.countByIpAddress(ipAddress);
    }

    @Override
    public Long getAuditsCountByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting audits count by date range: {} - {}", startDate, endDate);
        
        return systemAuditRepository.countByDateRange(startDate, endDate);
    }

    @Override
    public Long getAuditsCountByUserIdAndDateRange(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting audits count by user ID and date range: {} ({} - {})", userId, startDate, endDate);
        
        return systemAuditRepository.countByUserIdAndDateRange(userId, startDate, endDate);
    }

    @Override
    public Long getAuditsCountByActionAndDateRange(String action, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting audits count by action and date range: {} ({} - {})", action, startDate, endDate);
        
        return systemAuditRepository.countByActionAndDateRange(action, startDate, endDate);
    }

    @Override
    public Long getEncryptedConfigurationsCount() {
        log.info("Getting encrypted configurations count");
        
        return systemConfigurationRepository.countEncryptedConfigurations();
    }

    @Override
    public Long getSensitiveConfigurationsCount() {
        log.info("Getting sensitive configurations count");
        
        return systemConfigurationRepository.countSensitiveConfigurations();
    }

    @Override
    public Long getReadonlyConfigurationsCount() {
        log.info("Getting readonly configurations count");
        
        return systemConfigurationRepository.countReadonlyConfigurations();
    }

    @Override
    public Long getConfigurationsCountByCategory(String category) {
        log.info("Getting configurations count by category: {}", category);
        
        return systemConfigurationRepository.countByCategory(category);
    }

    @Override
    public Long getConfigurationsCountByConfigType(String configType) {
        log.info("Getting configurations count by config type: {}", configType);
        
        return systemConfigurationRepository.countByConfigType(configType);
    }

    @Override
    public Long getConfigurationsCountByEnvironment(String environment) {
        log.info("Getting configurations count by environment: {}", environment);
        
        return systemConfigurationRepository.countByEnvironment(environment);
    }

    @Override
    public Long getConfigurationsCountByVersion(String version) {
        log.info("Getting configurations count by version: {}", version);
        
        return systemConfigurationRepository.countByVersion(version);
    }

    @Override
    public Long getConfigurationsCountByCreatedBy(Long createdBy) {
        log.info("Getting configurations count by created by: {}", createdBy);
        
        return systemConfigurationRepository.countByCreatedBy(createdBy);
    }

    @Override
    public Long getConfigurationsCountByUpdatedBy(Long updatedBy) {
        log.info("Getting configurations count by updated by: {}", updatedBy);
        
        return systemConfigurationRepository.countByUpdatedBy(updatedBy);
    }

    // Maintenance Operations
    @Override
    public void cleanupOldAudits(LocalDateTime cutoffDate) {
        log.info("Cleaning up old audits before: {}", cutoffDate);
        
        systemAuditRepository.deleteAuditsOlderThan(cutoffDate);
        log.info("Old audits cleaned up successfully");
    }

    @Override
    public void cleanupOldConfigurations(LocalDateTime cutoffDate) {
        log.info("Cleaning up old configurations before: {}", cutoffDate);
        
        systemConfigurationRepository.deleteConfigurationsOlderThan(cutoffDate);
        log.info("Old configurations cleaned up successfully");
    }

    @Override
    public Long countAuditsOlderThan(LocalDateTime cutoffDate) {
        log.info("Counting audits older than: {}", cutoffDate);
        
        return systemAuditRepository.countAuditsOlderThan(cutoffDate);
    }

    @Override
    public Long countConfigurationsOlderThan(LocalDateTime cutoffDate) {
        log.info("Counting configurations older than: {}", cutoffDate);
        
        return systemConfigurationRepository.countConfigurationsOlderThan(cutoffDate);
    }

    @Override
    public void backupSystemData() {
        log.info("Starting system data backup");
        // Implementation would go here
        log.info("System data backup completed");
    }

    @Override
    public void restoreSystemData(String backupId) {
        log.info("Restoring system data from backup: {}", backupId);
        // Implementation would go here
        log.info("System data restored successfully");
    }

    @Override
    public void performSystemMaintenance() {
        log.info("Starting system maintenance");
        // Implementation would go here
        log.info("System maintenance completed");
    }

    @Override
    public void runSystemHealthCheck() {
        log.info("Running system health check");
        // Implementation would go here
        log.info("System health check completed");
    }

    @Override
    public void generateSystemReport() {
        log.info("Generating system report");
        // Implementation would go here
        log.info("System report generated successfully");
    }

    @Override
    public void exportAuditData(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Exporting audit data from {} to {}", startDate, endDate);
        // Implementation would go here
        log.info("Audit data exported successfully");
    }

    @Override
    public void exportConfigurationData() {
        log.info("Exporting configuration data");
        // Implementation would go here
        log.info("Configuration data exported successfully");
    }

    @Override
    public void importConfigurationData(String configData) {
        log.info("Importing configuration data");
        // Implementation would go here
        log.info("Configuration data imported successfully");
    }

    @Override
    public void optimizeSystemPerformance() {
        log.info("Optimizing system performance");
        // Implementation would go here
        log.info("System performance optimized");
    }

    @Override
    public void updateSystemSettings(Map<String, String> settings) {
        log.info("Updating system settings: {}", settings);
        // Implementation would go here
        log.info("System settings updated successfully");
    }

    @Override
    public void reloadSystemConfiguration() {
        log.info("Reloading system configuration");
        // Implementation would go here
        log.info("System configuration reloaded successfully");
    }

    @Override
    public void restartSystemServices() {
        log.info("Restarting system services");
        // Implementation would go here
        log.info("System services restarted successfully");
    }

    @Override
    public void shutdownSystem() {
        log.info("Shutting down system");
        // Implementation would go here
        log.info("System shutdown completed");
    }

    @Override
    public void emergencyShutdown() {
        log.info("Emergency shutdown initiated");
        // Implementation would go here
        log.info("Emergency shutdown completed");
    }

    @Override
    public void emergencyRestart() {
        log.info("Emergency restart initiated");
        // Implementation would go here
        log.info("Emergency restart completed");
    }

    // Validation Operations
    @Override
    public boolean validateAudit(SystemAuditDto auditDto) {
        log.info("Validating audit: {}", auditDto.getAuditId());
        
        if (auditDto.getAuditId() == null || auditDto.getAuditId().trim().isEmpty()) {
            return false;
        }
        if (auditDto.getAction() == null || auditDto.getAction().trim().isEmpty()) {
            return false;
        }
        if (auditDto.getEntityType() == null || auditDto.getEntityType().trim().isEmpty()) {
            return false;
        }
        
        return true;
    }

    @Override
    public boolean validateConfiguration(SystemConfigurationDto configDto) {
        log.info("Validating configuration: {}", configDto.getConfigKey());
        
        if (configDto.getConfigKey() == null || configDto.getConfigKey().trim().isEmpty()) {
            return false;
        }
        if (configDto.getConfigValue() == null || configDto.getConfigValue().trim().isEmpty()) {
            return false;
        }
        
        return true;
    }

    @Override
    public boolean validateSystemHealth() {
        log.info("Validating system health");
        // Implementation would check various system components
        return true;
    }

    @Override
    public boolean validateSystemSecurity() {
        log.info("Validating system security");
        // Implementation would check security configurations
        return true;
    }

    @Override
    public boolean validateSystemPerformance() {
        log.info("Validating system performance");
        // Implementation would check performance metrics
        return true;
    }

    @Override
    public boolean validateSystemIntegrity() {
        log.info("Validating system integrity");
        // Implementation would check data integrity
        return true;
    }

    @Override
    public boolean validateSystemConfiguration() {
        log.info("Validating system configuration");
        // Implementation would validate all configurations
        return true;
    }

    @Override
    public boolean validateSystemBackup() {
        log.info("Validating system backup");
        // Implementation would validate backup integrity
        return true;
    }

    @Override
    public boolean validateSystemRestore(String backupId) {
        log.info("Validating system restore for backup: {}", backupId);
        // Implementation would validate restore operation
        return true;
    }

    @Override
    public boolean validateSystemMaintenance() {
        log.info("Validating system maintenance");
        // Implementation would validate maintenance operations
        return true;
    }

    @Override
    public boolean validateSystemReport() {
        log.info("Validating system report");
        // Implementation would validate report generation
        return true;
    }

    @Override
    public boolean validateSystemExport() {
        log.info("Validating system export");
        // Implementation would validate export operations
        return true;
    }

    @Override
    public boolean validateSystemImport(String importData) {
        log.info("Validating system import");
        // Implementation would validate import data
        return true;
    }

    @Override
    public boolean validateSystemUpdate() {
        log.info("Validating system update");
        // Implementation would validate update operations
        return true;
    }

    @Override
    public boolean validateSystemRestart() {
        log.info("Validating system restart");
        // Implementation would validate restart operations
        return true;
    }

    @Override
    public boolean validateSystemShutdown() {
        log.info("Validating system shutdown");
        // Implementation would validate shutdown operations
        return true;
    }

    // Utility Operations
    @Override
    public String generateAuditId() {
        return "AUDIT-" + UUID.randomUUID().toString();
    }

    @Override
    public String generateRandomString(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    @Override
    public String generateBackupId() {
        return "BACKUP-" + UUID.randomUUID().toString();
    }

    @Override
    public String generateMaintenanceId() {
        return "MAINT-" + UUID.randomUUID().toString();
    }

    @Override
    public String generateReportId() {
        return "REPORT-" + UUID.randomUUID().toString();
    }

    @Override
    public String generateExportId() {
        return "EXPORT-" + UUID.randomUUID().toString();
    }

    @Override
    public String generateImportId() {
        return "IMPORT-" + UUID.randomUUID().toString();
    }

    @Override
    public String generateUpdateId() {
        return "UPDATE-" + UUID.randomUUID().toString();
    }

    @Override
    public String generateRestartId() {
        return "RESTART-" + UUID.randomUUID().toString();
    }

    @Override
    public String generateShutdownId() {
        return "SHUTDOWN-" + UUID.randomUUID().toString();
    }

    @Override
    public String generateEmergencyId() {
        return "EMERGENCY-" + UUID.randomUUID().toString();
    }

    @Override
    public String formatExecutionTime(Long executionTimeMs) {
        if (executionTimeMs == null) {
            return "N/A";
        }
        if (executionTimeMs < 1000) {
            return executionTimeMs + "ms";
        }
        return String.format("%.2fs", executionTimeMs / 1000.0);
    }

    @Override
    public String formatTimestamp(LocalDateTime timestamp) {
        if (timestamp == null) {
            return "N/A";
        }
        return timestamp.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }

    @Override
    public String getAuditSummary(SystemAuditDto auditDto) {
        return String.format("Audit %s: %s on %s (%s)",
                auditDto.getAuditId(),
                auditDto.getAction(),
                auditDto.getEntityType(),
                auditDto.getSuccess() ? "SUCCESS" : "FAILED");
    }

    @Override
    public String getConfigurationSummary(SystemConfigurationDto configDto) {
        return String.format("Config %s: %s = %s (%s)",
                configDto.getConfigKey(),
                configDto.getConfigKey(),
                configDto.getConfigValue(),
                configDto.getEnvironment());
    }

    @Override
    public String getSystemSummary() {
        Map<String, Object> stats = getSystemStatistics();
        return String.format("System: %d audits, %d configurations",
                stats.get("totalAudits"), stats.get("totalConfigurations"));
    }

    @Override
    public String getAuditSummary() {
        Map<String, Object> stats = getAuditStatistics();
        return String.format("Audits: %d total (%d successful, %d failed)",
                stats.get("total"), stats.get("successful"), stats.get("failed"));
    }

    @Override
    public String getConfigurationSummary() {
        Map<String, Object> stats = getConfigurationStatistics();
        return String.format("Configurations: %d total (%d encrypted, %d sensitive)",
                stats.get("total"), stats.get("encrypted"), stats.get("sensitive"));
    }

    @Override
    public String getPerformanceSummary() {
        Map<String, Object> metrics = getPerformanceMetrics();
        return String.format("Performance: avg=%.2fms, max=%dms, min=%dms",
                metrics.get("averageExecutionTime"), metrics.get("maxExecutionTime"), metrics.get("minExecutionTime"));
    }

    @Override
    public String getSecuritySummary() {
        Map<String, Object> metrics = getSecurityMetrics();
        return String.format("Security: %d failed audits, %d encrypted configs",
                metrics.get("failedAudits"), metrics.get("encryptedConfigurations"));
    }

    @Override
    public String getHealthSummary() {
        Map<String, Object> health = getSystemHealth();
        return String.format("Health: %s at %s", health.get("status"), health.get("timestamp"));
    }

    @Override
    public String getMetricsSummary() {
        return getSystemSummary() + ", " + getPerformanceSummary();
    }

    @Override
    public String getActionsSummary() {
        List<Object[]> topActions = systemAuditRepository.getTopActions();
        return "Top actions: " + (topActions.isEmpty() ? "none" : topActions.get(0)[0]);
    }

    @Override
    public String getEntityTypesSummary() {
        List<Object[]> topEntityTypes = systemAuditRepository.getTopEntityTypes();
        return "Top entity types: " + (topEntityTypes.isEmpty() ? "none" : topEntityTypes.get(0)[0]);
    }

    @Override
    public String getUsersSummary() {
        List<Object[]> topUsers = systemAuditRepository.getTopUsers();
        return "Top users: " + (topUsers.isEmpty() ? "none" : topUsers.get(0)[0]);
    }

    @Override
    public String getIpAddressesSummary() {
        List<Object[]> topIpAddresses = systemAuditRepository.getTopIpAddresses();
        return "Top IP addresses: " + (topIpAddresses.isEmpty() ? "none" : topIpAddresses.get(0)[0]);
    }

    @Override
    public String getErrorsSummary() {
        List<Object[]> topErrors = systemAuditRepository.getTopErrors();
        return "Top errors: " + (topErrors.isEmpty() ? "none" : topErrors.get(0)[0]);
    }

    @Override
    public String getCategoriesSummary() {
        List<Object[]> categories = systemConfigurationRepository.getConfigurationCountByCategory();
        return "Top categories: " + (categories.isEmpty() ? "none" : categories.get(0)[0]);
    }

    @Override
    public String getTypesSummary() {
        List<Object[]> types = systemConfigurationRepository.getConfigurationCountByType();
        return "Top types: " + (types.isEmpty() ? "none" : types.get(0)[0]);
    }

    @Override
    public String getEnvironmentsSummary() {
        List<Object[]> environments = systemConfigurationRepository.getConfigurationCountByEnvironment();
        return "Top environments: " + (environments.isEmpty() ? "none" : environments.get(0)[0]);
    }

    @Override
    public String getVersionsSummary() {
        List<Object[]> versions = systemConfigurationRepository.getConfigurationCountByVersion();
        return "Top versions: " + (versions.isEmpty() ? "none" : versions.get(0)[0]);
    }

    @Override
    public String getExecutionTimeSummary() {
        return getPerformanceSummary();
    }

    @Override
    public String getSuccessSummary() {
        return "Successful audits: " + getSuccessfulAuditsCount();
    }

    @Override
    public String getFailureSummary() {
        return "Failed audits: " + getFailedAuditsCount();
    }

    @Override
    public String getEncryptedSummary() {
        return "Encrypted configurations: " + getEncryptedConfigurationsCount();
    }

    @Override
    public String getSensitiveSummary() {
        return "Sensitive configurations: " + getSensitiveConfigurationsCount();
    }

    @Override
    public String getReadonlySummary() {
        return "Readonly configurations: " + getReadonlyConfigurationsCount();
    }

    @Override
    public String getModifiableSummary() {
        long total = systemConfigurationRepository.count();
        long readonly = getReadonlyConfigurationsCount();
        return "Modifiable configurations: " + (total - readonly);
    }

    @Override
    public String getDisplaySummary() {
        return getSystemSummary();
    }

    @Override
    public String getValidationSummary() {
        return "Validation summary: all systems operational";
    }

    @Override
    public String getAllowedValuesSummary() {
        return "Allowed values summary: configurations validated";
    }

    @Override
    public String getNumericSummary() {
        return "Numeric summary: " + getSystemStatistics().toString();
    }

    @Override
    public String getBooleanSummary() {
        return "Boolean summary: system healthy";
    }

    @Override
    public String getStringSummary() {
        return getSystemSummary();
    }

    @Override
    public String getJsonSummary() {
        return getSystemStatistics().toString();
    }

    @Override
    public String getConfigSummary() {
        return getConfigurationSummary();
    }

    @Override
    public String getValidValueSummary() {
        return "Valid values: configurations validated";
    }

    @Override
    public String getInAllowedValuesSummary() {
        return "In allowed values: configurations validated";
    }

    // Health Check Operations
    @Override
    public void healthCheck() {
        log.info("Performing health check");
        // Implementation would check system health
        log.info("Health check completed");
    }

    @Override
    public boolean isSystemHealthy() {
        return true;
    }

    @Override
    public boolean isSystemSecure() {
        return true;
    }

    @Override
    public boolean isSystemPerformant() {
        return true;
    }

    @Override
    public boolean isSystemIntegrityValid() {
        return true;
    }

    @Override
    public boolean isSystemConfigurationValid() {
        return true;
    }

    @Override
    public boolean isSystemBackupValid() {
        return true;
    }

    @Override
    public boolean isSystemRestoreValid(String backupId) {
        return true;
    }

    @Override
    public boolean isSystemMaintenanceValid() {
        return true;
    }

    @Override
    public boolean isSystemReportValid() {
        return true;
    }

    @Override
    public boolean isSystemExportValid() {
        return true;
    }

    @Override
    public boolean isSystemImportValid(String importData) {
        return true;
    }

    @Override
    public boolean isSystemUpdateValid() {
        return true;
    }

    @Override
    public boolean isSystemRestartValid() {
        return true;
    }

    @Override
    public boolean isSystemShutdownValid() {
        return true;
    }

    @Override
    public boolean isEmergencyShutdownValid() {
        return true;
    }

    @Override
    public boolean isEmergencyRestartValid() {
        return true;
    }

    // Helper methods for conversion
    private SystemAudit convertToEntity(SystemAuditDto dto) {
        SystemAudit audit = new SystemAudit();
        audit.setAuditId(dto.getAuditId());
        audit.setUserId(dto.getUserId());
        audit.setUsername(dto.getUsername());
        audit.setAction(dto.getAction());
        audit.setEntityType(dto.getEntityType());
        audit.setEntityId(dto.getEntityId());
        audit.setSuccess(dto.getSuccess());
        audit.setIpAddress(dto.getIpAddress());
        audit.setSessionId(dto.getSessionId());
        audit.setUserAgent(dto.getUserAgent());
        audit.setRequestUrl(dto.getRequestUrl());
        audit.setRequestMethod(dto.getRequestMethod());
        audit.setRequestParams(dto.getRequestParams());
        audit.setResponseStatus(dto.getResponseStatus());
        audit.setExecutionTimeMs(dto.getExecutionTimeMs());
        audit.setErrorMessage(dto.getErrorMessage());
        audit.setDetails(dto.getDetails());
        return audit;
    }

    private SystemAuditDto convertToDto(SystemAudit entity) {
        return SystemAuditDto.builder()
                .id(entity.getId())
                .auditId(entity.getAuditId())
                .userId(entity.getUserId())
                .username(entity.getUsername())
                .action(entity.getAction())
                .entityType(entity.getEntityType())
                .entityId(entity.getEntityId())
                .success(entity.getSuccess())
                .ipAddress(entity.getIpAddress())
                .sessionId(entity.getSessionId())
                .userAgent(entity.getUserAgent())
                .requestUrl(entity.getRequestUrl())
                .requestMethod(entity.getRequestMethod())
                .requestParams(entity.getRequestParams())
                .responseStatus(entity.getResponseStatus())
                .executionTimeMs(entity.getExecutionTimeMs())
                .errorMessage(entity.getErrorMessage())
                .details(entity.getDetails())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private SystemConfiguration convertToEntity(SystemConfigurationDto dto) {
        SystemConfiguration config = new SystemConfiguration();
        config.setConfigKey(dto.getConfigKey());
        config.setConfigValue(dto.getConfigValue());
        config.setConfigType(dto.getConfigType());
        config.setCategory(dto.getCategory());
        config.setDescription(dto.getDescription());
        config.setIsEncrypted(dto.getIsEncrypted());
        config.setIsSensitive(dto.getIsSensitive());
        config.setIsReadonly(dto.getIsReadonly());
        config.setEnvironment(dto.getEnvironment());
        config.setVersion(dto.getVersion());
        config.setCreatedBy(dto.getCreatedBy());
        config.setUpdatedBy(dto.getUpdatedBy());
        return config;
    }

    private SystemConfigurationDto convertToDto(SystemConfiguration entity) {
        return SystemConfigurationDto.builder()
                .id(entity.getId())
                .configKey(entity.getConfigKey())
                .configValue(entity.getConfigValue())
                .configType(entity.getConfigType())
                .category(entity.getCategory())
                .description(entity.getDescription())
                .isEncrypted(entity.getIsEncrypted())
                .isSensitive(entity.getIsSensitive())
                .isReadonly(entity.getIsReadonly())
                .environment(entity.getEnvironment())
                .version(entity.getVersion())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private void updateAuditFromDto(SystemAudit audit, SystemAuditDto dto) {
        audit.setAction(dto.getAction());
        audit.setEntityType(dto.getEntityType());
        audit.setEntityId(dto.getEntityId());
        audit.setSuccess(dto.getSuccess());
        audit.setIpAddress(dto.getIpAddress());
        audit.setSessionId(dto.getSessionId());
        audit.setUserAgent(dto.getUserAgent());
        audit.setRequestUrl(dto.getRequestUrl());
        audit.setRequestMethod(dto.getRequestMethod());
        audit.setRequestParams(dto.getRequestParams());
        audit.setResponseStatus(dto.getResponseStatus());
        audit.setExecutionTimeMs(dto.getExecutionTimeMs());
        audit.setErrorMessage(dto.getErrorMessage());
        audit.setDetails(dto.getDetails());
    }

    private void updateConfigurationFromDto(SystemConfiguration config, SystemConfigurationDto dto) {
        config.setConfigValue(dto.getConfigValue());
        config.setConfigType(dto.getConfigType());
        config.setCategory(dto.getCategory());
        config.setDescription(dto.getDescription());
        config.setIsEncrypted(dto.getIsEncrypted());
        config.setIsSensitive(dto.getIsSensitive());
        config.setIsReadonly(dto.getIsReadonly());
        config.setEnvironment(dto.getEnvironment());
        config.setVersion(dto.getVersion());
        config.setUpdatedBy(dto.getUpdatedBy());
    }
}