package com.secureinsure.claims.service.impl;

import com.secureinsure.claims.dto.ClaimDto;
import com.secureinsure.claims.entity.Claim;
import com.secureinsure.claims.entity.ClaimStatus;
import com.secureinsure.claims.entity.ClaimType;
import com.secureinsure.claims.entity.PriorityLevel;
import com.secureinsure.claims.entity.RiskLevel;
import com.secureinsure.claims.repository.ClaimRepository;
import com.secureinsure.claims.service.ClaimService;
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
import java.util.List;
import java.util.Optional;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doNothing;

@ExtendWith(MockitoExtension.class)
class ClaimServiceImplTest {

    @Mock
    private ClaimRepository claimRepository;

    @InjectMocks
    private ClaimServiceImpl claimService;

    private ClaimDto testClaimDto;
    private Claim testClaim;

    @BeforeEach
    void setUp() {
        testClaimDto = ClaimDto.builder()
                .id(1L)
                .claimNumber("CLM-AU-123456")
                .policyId(1L)
                .customerId(1L)
                .claimType(ClaimType.AUTO_COLLISION)
                .status(ClaimStatus.DRAFT)
                .priorityLevel(PriorityLevel.NORMAL)
                .riskLevel(RiskLevel.MEDIUM)
                .estimatedAmount(new BigDecimal("5000.00"))
                .approvedAmount(new BigDecimal("4500.00"))
                .paidAmount(new BigDecimal("3000.00"))
                .incidentDate(LocalDate.now().minusDays(5))
                .incidentLocation("123 Main St, City")
                .description("Vehicle collision at intersection")
                .build();

        testClaim = Claim.builder()
                .id(1L)
                .claimNumber("CLM-001")
                .policyId(1001L)
                .customerId(2001L)
                .claimType(ClaimType.AUTO_COLLISION)
                .status(ClaimStatus.SUBMITTED)
                .incidentDate(LocalDate.now().minusDays(5))
                .reportedDate(LocalDate.now().minusDays(3))
                .claimAmount(new BigDecimal("5000.00"))
                .approvedAmount(new BigDecimal("4500.00"))
                .paidAmount(new BigDecimal("0.00"))
                .deductibleAmount(new BigDecimal("500.00"))
                .description("Test claim description")
                .incidentLocation("Test location")
                .riskLevel(RiskLevel.MEDIUM)
                .priorityLevel(PriorityLevel.NORMAL)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createClaim_Success() {
        when(claimRepository.save(any(Claim.class))).thenReturn(testClaim);

        ClaimDto result = claimService.createClaim(testClaimDto);

        assertNotNull(result);
        assertEquals(testClaimDto.getClaimNumber(), result.getClaimNumber());
        verify(claimRepository).save(any(Claim.class));
    }

    @Test
    void getClaimById_Success() {
        when(claimRepository.findById(1L)).thenReturn(Optional.of(testClaim));

        ClaimDto result = claimService.getClaimById(1L);

        assertNotNull(result);
        assertEquals(testClaim.getId(), result.getId());
        verify(claimRepository).findById(1L);
    }

    @Test
    void getClaimById_NotFound() {
        when(claimRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> claimService.getClaimById(1L));
        verify(claimRepository).findById(1L);
    }

    @Test
    void getClaimByNumber_Success() {
        when(claimRepository.findByClaimNumber("CLM-AU-123456")).thenReturn(Optional.of(testClaim));

        ClaimDto result = claimService.getClaimByNumber("CLM-AU-123456");

        assertNotNull(result);
        assertEquals(testClaim.getClaimNumber(), result.getClaimNumber());
        verify(claimRepository).findByClaimNumber("CLM-AU-123456");
    }

    @Test
    void updateClaim_Success() {
        when(claimRepository.findById(1L)).thenReturn(Optional.of(testClaim));
        when(claimRepository.save(any(Claim.class))).thenReturn(testClaim);

        ClaimDto result = claimService.updateClaim(1L, testClaimDto);

        assertNotNull(result);
        assertEquals(testClaimDto.getClaimNumber(), result.getClaimNumber());
        verify(claimRepository).findById(1L);
        verify(claimRepository).save(any(Claim.class));
    }

    @Test
    void deleteClaim_Success() {
        when(claimRepository.findById(1L)).thenReturn(Optional.of(testClaim));
        doNothing().when(claimRepository).deleteById(1L);

        claimService.deleteClaim(1L);

        verify(claimRepository).deleteById(1L);
    }

    @Test
    void submitClaim_Success() {
        testClaim.setStatus(ClaimStatus.DRAFT);
        when(claimRepository.findById(1L)).thenReturn(Optional.of(testClaim));
        when(claimRepository.save(any(Claim.class))).thenReturn(testClaim);

        ClaimDto result = claimService.submitClaim(1L);

        assertNotNull(result);
        assertEquals(ClaimStatus.SUBMITTED, result.getStatus());
        verify(claimRepository).findById(1L);
        verify(claimRepository).save(any(Claim.class));
    }

    @Test
    void approveClaim_Success() {
        testClaim.setStatus(ClaimStatus.UNDER_REVIEW);
        when(claimRepository.findById(1L)).thenReturn(Optional.of(testClaim));
        when(claimRepository.save(any(Claim.class))).thenReturn(testClaim);

        ClaimDto result = claimService.approveClaim(1L, 1L, "Approved");

        assertNotNull(result);
        assertEquals(ClaimStatus.APPROVED, result.getStatus());
        verify(claimRepository).findById(1L);
        verify(claimRepository).save(any(Claim.class));
    }

    @Test
    void generateClaimNumber_Success() {
        String claimNumber = claimService.generateClaimNumber();
        
        assertNotNull(claimNumber);
        assertTrue(claimNumber.matches("^CLM-[A-Z]{2}-\\d{6}$"));
    }

    @Test
    void calculateFraudScore_Success() {
        Double result = claimService.calculateFraudScore(testClaimDto);
        
        assertNotNull(result);
        assertTrue(result >= 0.0 && result <= 100.0);
    }

    @Test
    void validateClaim_Success() {
        boolean result = claimService.validateClaim(testClaimDto);
        
        assertTrue(result);
    }

    @Test
    void getClaimsByCustomerId_Success() {
        when(claimRepository.findByCustomerId(2001L)).thenReturn(List.of(testClaim));

        List<ClaimDto> result = claimService.getClaimsByCustomerId(2001L);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(claimRepository).findByCustomerId(2001L);
    }

    @Test
    void getAllClaims_Success() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<Claim> claimPage = new PageImpl<>(List.of(testClaim), pageable, 1);
        when(claimRepository.findAll(pageable)).thenReturn(claimPage);

        Page<ClaimDto> result = claimService.getAllClaims(pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(claimRepository).findAll(pageable);
    }
} 