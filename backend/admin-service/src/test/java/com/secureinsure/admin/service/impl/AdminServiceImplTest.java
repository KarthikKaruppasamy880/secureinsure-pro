package com.secureinsure.admin.service.impl;

import com.secureinsure.admin.dto.SystemAuditDto;
import com.secureinsure.admin.dto.SystemConfigurationDto;
import com.secureinsure.admin.entity.SystemAudit;
import com.secureinsure.admin.entity.SystemConfiguration;
import com.secureinsure.admin.repository.SystemAuditRepository;
import com.secureinsure.admin.repository.SystemConfigurationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceImplTest {

    @Mock
    private SystemAuditRepository systemAuditRepository;

    @Mock
    private SystemConfigurationRepository systemConfigurationRepository;

    @InjectMocks
    private AdminServiceImpl adminService;

    private SystemAuditDto testAuditDto;
    private SystemAudit testAudit;
    private SystemConfigurationDto testConfigDto;
    private SystemConfiguration testConfig;

    @BeforeEach
    void setUp() {
        // Setup test audit data
        testAuditDto = SystemAuditDto.builder()
                .id(1L)
                .auditId("AUD-TEST-123")
                .userId(100L)
                .username("testuser")
                .action("LOGIN")
                .entityType("USER")
                .entityId(100L)
                .ipAddress("192.168.1.1")
                .userAgent("Mozilla/5.0")
                .sessionId("session123")
                .requestUrl("/api/auth/login")
                .requestMethod("POST")
                .responseStatus(200)
                .executionTimeMs(150L)
                .success(true)
                .errorMessage(null)
                .metadata("{\"browser\": \"Chrome\"}")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        testAudit = SystemAudit.builder()
                .id(1L)
                .auditId("AUD-TEST-123")
                .userId(100L)
                .username("testuser")
                .action("LOGIN")
                .entityType("USER")
                .entityId(100L)
                .ipAddress("192.168.1.1")
                .userAgent("Mozilla/5.0")
                .sessionId("session123")
                .requestUrl("/api/auth/login")
                .requestMethod("POST")
                .responseStatus(200)
                .executionTimeMs(150L)
                .success(true)
                .errorMessage(null)
                .metadata("{\"browser\": \"Chrome\"}")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Setup test configuration data
        testConfigDto = SystemConfigurationDto.builder()
                .id(1L)
                .configKey("system.name")
                .configValue("SecureInsure Pro")
                .configType("STRING")
                .description("System name")
                .category("GENERAL")
                .isEncrypted(false)
                .isSensitive(false)
                .isReadonly(false)
                .validationRegex("^[a-zA-Z0-9\\s]+$")
                .defaultValue("SecureInsure Pro")
                .minValue(null)
                .maxValue(null)
                .allowedValues(null)
                .environment("ALL")
                .version("1.0")
                .createdBy(1L)
                .updatedBy(1L)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        testConfig = SystemConfiguration.builder()
                .id(1L)
                .configKey("system.name")
                .configValue("SecureInsure Pro")
                .configType("STRING")
                .description("System name")
                .category("GENERAL")
                .isEncrypted(false)
                .isSensitive(false)
                .isReadonly(false)
                .validationRegex("^[a-zA-Z0-9\\s]+$")
                .defaultValue("SecureInsure Pro")
                .minValue(null)
                .maxValue(null)
                .allowedValues(null)
                .environment("ALL")
                .version("1.0")
                .createdBy(1L)
                .updatedBy(1L)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    // Core Audit Tests
    @Test
    void createAudit_Success() {
        when(systemAuditRepository.save(any(SystemAudit.class))).thenReturn(testAudit);

        SystemAuditDto result = adminService.createAudit(testAuditDto);

        assertNotNull(result);
        assertEquals(testAuditDto.getAuditId(), result.getAuditId());
        verify(systemAuditRepository).save(any(SystemAudit.class));
    }

    @Test
    void getAuditById_Success() {
        when(systemAuditRepository.findById(1L)).thenReturn(Optional.of(testAudit));

        SystemAuditDto result = adminService.getAuditById(1L);

        assertNotNull(result);
        assertEquals(testAudit.getAuditId(), result.getAuditId());
    }

    @Test
    void getAuditById_NotFound_ThrowsException() {
        when(systemAuditRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> adminService.getAuditById(999L));
    }

    @Test
    void getAllAudits_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<SystemAudit> auditPage = new PageImpl<>(List.of(testAudit), pageable, 1);
        when(systemAuditRepository.findAll(pageable)).thenReturn(auditPage);

        Page<SystemAuditDto> result = adminService.getAllAudits(pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    // Core Configuration Tests
    @Test
    void createConfiguration_Success() {
        when(systemConfigurationRepository.save(any(SystemConfiguration.class))).thenReturn(testConfig);

        SystemConfigurationDto result = adminService.createConfiguration(testConfigDto);

        assertNotNull(result);
        assertEquals(testConfigDto.getConfigKey(), result.getConfigKey());
        verify(systemConfigurationRepository).save(any(SystemConfiguration.class));
    }

    @Test
    void getConfigurationByKey_Success() {
        when(systemConfigurationRepository.findByConfigKey("system.name")).thenReturn(Optional.of(testConfig));

        SystemConfigurationDto result = adminService.getConfigurationByKey("system.name");

        assertNotNull(result);
        assertEquals(testConfig.getConfigKey(), result.getConfigKey());
    }

    @Test
    void getAllConfigurations_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<SystemConfiguration> configPage = new PageImpl<>(List.of(testConfig), pageable, 1);
        when(systemConfigurationRepository.findAll(pageable)).thenReturn(configPage);

        Page<SystemConfigurationDto> result = adminService.getAllConfigurations(pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    // Validation Tests
    @Test
    void validateAudit_ValidData_ReturnsTrue() {
        boolean result = adminService.validateAudit(testAuditDto);
        assertTrue(result);
    }

    @Test
    void validateAudit_NullData_ReturnsFalse() {
        boolean result = adminService.validateAudit(null);
        assertFalse(result);
    }

    @Test
    void validateConfiguration_ValidData_ReturnsTrue() {
        boolean result = adminService.validateConfiguration(testConfigDto);
        assertTrue(result);
    }

    @Test
    void validateConfiguration_NullData_ReturnsFalse() {
        boolean result = adminService.validateConfiguration(null);
        assertFalse(result);
    }

    // Utility Tests
    @Test
    void generateAuditId_Success() {
        String result = adminService.generateAuditId();
        assertNotNull(result);
        assertTrue(result.startsWith("AUD-"));
    }

    @Test
    void generateRandomString_Success() {
        String result = adminService.generateRandomString(10);
        assertNotNull(result);
        assertEquals(10, result.length());
    }

    @Test
    void formatTimestamp_Success() {
        LocalDateTime timestamp = LocalDateTime.of(2023, 12, 25, 10, 30, 45);
        String result = adminService.formatTimestamp(timestamp);
        assertEquals("2023-12-25 10:30:45", result);
    }

    // Health Check Tests
    @Test
    void healthCheck_Success() {
        when(systemAuditRepository.count()).thenReturn(100L);
        when(systemConfigurationRepository.count()).thenReturn(50L);

        assertDoesNotThrow(() -> adminService.healthCheck());
    }

    @Test
    void healthCheck_DatabaseError_ThrowsException() {
        when(systemAuditRepository.count()).thenThrow(new RuntimeException("Database error"));

        assertThrows(RuntimeException.class, () -> adminService.healthCheck());
    }
} 