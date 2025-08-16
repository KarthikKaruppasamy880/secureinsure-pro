package com.secureinsure.policy.service;

import com.secureinsure.policy.dto.PolicyDto;
import com.secureinsure.policy.entity.Policy;
import com.secureinsure.policy.entity.PolicyStatus;
import com.secureinsure.policy.entity.PolicyType;
import com.secureinsure.policy.repository.PolicyRepository;
import com.secureinsure.policy.service.impl.PolicyServiceImpl;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PolicyServiceTest {

    @Mock
    private PolicyRepository policyRepository;

    @InjectMocks
    private PolicyServiceImpl policyService;

    private PolicyDto testPolicyDto;
    private Policy testPolicy;

    @BeforeEach
    void setUp() {
        testPolicyDto = PolicyDto.builder()
                .id(1L)
                .policyNumber("POL-AU-123456")
                .customerId(1001L)
                .policyType(PolicyType.AUTO)
                .effectiveDate(LocalDate.now())
                .expiryDate(LocalDate.now().plusYears(1))
                .premiumAmount(new BigDecimal("1200.00"))
                .sumInsured(new BigDecimal("50000.00"))
                .deductibleAmount(new BigDecimal("500.00"))
                .status(PolicyStatus.DRAFT)
                .riskLevel("MEDIUM")
                .discountPercentage(new BigDecimal("10.00"))
                .agentId(2001L)
                .underwriterId(3001L)
                .autoRenewal(true)
                .notes("Test policy")
                .build();

        testPolicy = new Policy();
        testPolicy.setId(1L);
        testPolicy.setPolicyNumber("POL-AU-123456");
        testPolicy.setCustomerId(1001L);
        testPolicy.setPolicyType(PolicyType.AUTO);
        testPolicy.setStartDate(LocalDate.now());
        testPolicy.setEndDate(LocalDate.now().plusYears(1));
        testPolicy.setPremiumAmount(new BigDecimal("1200.00"));
        testPolicy.setCoverageAmount(new BigDecimal("50000.00"));
        testPolicy.setDeductibleAmount(new BigDecimal("500.00"));
        testPolicy.setStatus(PolicyStatus.DRAFT);
        testPolicy.setRiskScore(5);
        testPolicy.setDiscountPercentage(new BigDecimal("10.00"));
        testPolicy.setAgentId(2001L);
        testPolicy.setUnderwriterId(3001L);
        testPolicy.setNotes("Test policy");
        testPolicy.setCreatedAt(LocalDateTime.now());
        testPolicy.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    void createPolicy_Success() {
        when(policyRepository.save(any(Policy.class))).thenReturn(testPolicy);

        PolicyDto result = policyService.createPolicy(testPolicyDto);

        assertNotNull(result);
        assertEquals(testPolicyDto.getPolicyNumber(), result.getPolicyNumber());
        verify(policyRepository).save(any(Policy.class));
    }

    @Test
    void getPolicyById_Success() {
        when(policyRepository.findById(1L)).thenReturn(Optional.of(testPolicy));

        PolicyDto result = policyService.getPolicyById(1L);

        assertNotNull(result);
        assertEquals(testPolicy.getId(), result.getId());
        verify(policyRepository).findById(1L);
    }

    @Test
    void getPolicyById_NotFound_ThrowsException() {
        when(policyRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            policyService.getPolicyById(1L);
        });
    }

    @Test
    void updatePolicy_Success() {
        when(policyRepository.findById(1L)).thenReturn(Optional.of(testPolicy));
        when(policyRepository.save(any(Policy.class))).thenReturn(testPolicy);

        PolicyDto result = policyService.updatePolicy(1L, testPolicyDto);

        assertNotNull(result);
        assertEquals(testPolicyDto.getPolicyType(), result.getPolicyType());
        verify(policyRepository).save(any(Policy.class));
    }

    @Test
    void deletePolicy_Success() {
        when(policyRepository.existsById(1L)).thenReturn(true);

        policyService.deletePolicy(1L);

        verify(policyRepository).deleteById(1L);
    }

    @Test
    void calculatePremium_Success() {
        testPolicyDto.setRiskLevel("MEDIUM");
        testPolicyDto.setPolicyType(PolicyType.AUTO);

        BigDecimal result = policyService.calculatePremium(testPolicyDto);

        assertNotNull(result);
        assertTrue(result.compareTo(BigDecimal.ZERO) > 0);
    }

    @Test
    void approvePolicy_Success() {
        when(policyRepository.findById(1L)).thenReturn(Optional.of(testPolicy));
        when(policyRepository.save(any(Policy.class))).thenReturn(testPolicy);

        PolicyDto result = policyService.approvePolicy(1L, 4001L, "Approved");

        assertNotNull(result);
        assertEquals("APPROVED", result.getApprovalStatus());
        assertEquals(PolicyStatus.ACTIVE, result.getStatus());
    }

    @Test
    void activatePolicy_Success() {
        when(policyRepository.findById(1L)).thenReturn(Optional.of(testPolicy));
        when(policyRepository.save(any(Policy.class))).thenReturn(testPolicy);

        PolicyDto result = policyService.activatePolicy(1L);

        assertNotNull(result);
        assertEquals(PolicyStatus.ACTIVE, result.getStatus());
    }

    @Test
    void validatePolicy_ValidPolicy_ReturnsTrue() {
        boolean result = policyService.validatePolicy(testPolicyDto);
        assertTrue(result);
    }

    @Test
    void validatePolicy_InvalidPolicy_ReturnsFalse() {
        testPolicyDto.setCustomerId(null);
        boolean result = policyService.validatePolicy(testPolicyDto);
        assertFalse(result);
    }

    @Test
    void generatePolicyNumber_Success() {
        String result = policyService.generatePolicyNumber();
        assertNotNull(result);
        assertTrue(result.startsWith("POL-AU-"));
    }

    @Test
    void getDaysUntilExpiry_Success() {
        when(policyRepository.findById(1L)).thenReturn(Optional.of(testPolicy));

        Long result = policyService.getDaysUntilExpiry(1L);

        assertNotNull(result);
        assertTrue(result > 0);
    }

    @Test
    void isExpiringSoon_ExpiringSoon_ReturnsTrue() {
        testPolicy.setEndDate(LocalDate.now().plusDays(15));
        when(policyRepository.findById(1L)).thenReturn(Optional.of(testPolicy));

        boolean result = policyService.isExpiringSoon(1L);

        assertTrue(result);
    }

    @Test
    void getPolicyStatistics_Success() {
        when(policyRepository.count()).thenReturn(100L);
        when(policyRepository.countByStatus(PolicyStatus.ACTIVE)).thenReturn(80L);
        when(policyRepository.countByStatus(PolicyStatus.DRAFT)).thenReturn(10L);
        when(policyRepository.countByStatus(PolicyStatus.EXPIRED)).thenReturn(10L);

        var result = policyService.getPolicyStatistics();

        assertNotNull(result);
        assertEquals(100L, result.get("totalPolicies"));
        assertEquals(80L, result.get("activePolicies"));
    }
} 