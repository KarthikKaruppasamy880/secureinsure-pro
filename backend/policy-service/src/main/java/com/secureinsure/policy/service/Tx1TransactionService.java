package com.secureinsure.policy.service;

import com.secureinsure.policy.dto.Tx1TransactionDto;
import com.secureinsure.policy.entity.Tx1Transaction;
import com.secureinsure.policy.entity.Tx1Status;
import com.secureinsure.policy.repository.Tx1TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class Tx1TransactionService {
    
    private final Tx1TransactionRepository tx1TransactionRepository;
    
    @Transactional
    public Tx1TransactionDto createTx1Transaction(Tx1TransactionDto tx1TransactionDto) {
        log.info("Creating new TX1 transaction for case: {}", tx1TransactionDto.getCaseNumber());
        
        Tx1Transaction tx1Transaction = new Tx1Transaction();
        mapDtoToEntity(tx1TransactionDto, tx1Transaction);
        tx1Transaction.setStatus(Tx1Status.PENDING);
        
        Tx1Transaction savedTransaction = tx1TransactionRepository.save(tx1Transaction);
        log.info("Created TX1 transaction with ID: {}", savedTransaction.getId());
        
        return mapEntityToDto(savedTransaction);
    }
    
    @Transactional(readOnly = true)
    public Tx1TransactionDto getTx1TransactionById(Long id) {
        log.debug("Fetching TX1 transaction by ID: {}", id);
        
        Tx1Transaction tx1Transaction = tx1TransactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("TX1 transaction not found with ID: " + id));
        
        return mapEntityToDto(tx1Transaction);
    }
    
    @Transactional(readOnly = true)
    public Tx1TransactionDto getTx1TransactionByCaseNumber(String caseNumber) {
        log.debug("Fetching TX1 transaction by case number: {}", caseNumber);
        
        Tx1Transaction tx1Transaction = tx1TransactionRepository.findByCaseNumber(caseNumber)
                .orElseThrow(() -> new RuntimeException("TX1 transaction not found with case number: " + caseNumber));
        
        return mapEntityToDto(tx1Transaction);
    }
    
    @Transactional(readOnly = true)
    public List<Tx1TransactionDto> getAllTx1Transactions() {
        log.debug("Fetching all TX1 transactions");
        
        List<Tx1Transaction> transactions = tx1TransactionRepository.findAll();
        return transactions.stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<Tx1TransactionDto> getTx1TransactionsByStatus(String status) {
        log.debug("Fetching TX1 transactions by status: {}", status);
        
        List<Tx1Transaction> transactions = tx1TransactionRepository.findByStatus(status);
        return transactions.stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public Tx1TransactionDto updateTx1TransactionStatus(Long id, Tx1Status status, String notes) {
        log.info("Updating TX1 transaction status to {} for ID: {}", status, id);
        
        Tx1Transaction tx1Transaction = tx1TransactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("TX1 transaction not found with ID: " + id));
        
        tx1Transaction.setStatus(status);
        if (notes != null) {
            tx1Transaction.setProcessingNotes(notes);
        }
        
        Tx1Transaction updatedTransaction = tx1TransactionRepository.save(tx1Transaction);
        log.info("Updated TX1 transaction status for ID: {}", id);
        
        return mapEntityToDto(updatedTransaction);
    }
    
    @Transactional
    public void deleteTx1Transaction(Long id) {
        log.info("Deleting TX1 transaction with ID: {}", id);
        
        if (!tx1TransactionRepository.existsById(id)) {
            throw new RuntimeException("TX1 transaction not found with ID: " + id);
        }
        
        tx1TransactionRepository.deleteById(id);
        log.info("Deleted TX1 transaction with ID: {}", id);
    }
    
    @Transactional(readOnly = true)
    public List<Tx1TransactionDto> searchTx1Transactions(String searchTerm) {
        log.debug("Searching TX1 transactions with term: {}", searchTerm);
        
        List<Tx1Transaction> transactions = tx1TransactionRepository.searchByTerm(searchTerm);
        return transactions.stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<Tx1TransactionDto> getTx1TransactionsByDateRange(String startDate, String endDate) {
        log.debug("Fetching TX1 transactions from {} to {}", startDate, endDate);
        
        List<Tx1Transaction> transactions = tx1TransactionRepository.findByApplicationDateRange(startDate, endDate);
        return transactions.stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }
    
    private void mapDtoToEntity(Tx1TransactionDto dto, Tx1Transaction entity) {
        entity.setCaseNumber(dto.getCaseNumber());
        entity.setZinniaCaseId(dto.getZinniaCaseId());
        entity.setPolicyNumber(dto.getPolicyNumber());
        entity.setApplicationDate(dto.getApplicationDate());
        entity.setProductType(dto.getProductType());
        entity.setFaceAmount(dto.getFaceAmount());
        entity.setPremiumMode(dto.getPremiumMode());
        entity.setAgentName(dto.getAgentName());
        entity.setBranch(dto.getBranch());
        
        // Insured Information
        entity.setInsuredFirstName(dto.getInsuredFirstName());
        entity.setInsuredLastName(dto.getInsuredLastName());
        entity.setInsuredDateOfBirth(dto.getInsuredDateOfBirth());
        entity.setInsuredAge(dto.getInsuredAge());
        entity.setInsuredGender(dto.getInsuredGender());
        entity.setInsuredSsn(dto.getInsuredSsn());
        entity.setInsuredEmail(dto.getInsuredEmail());
        entity.setInsuredPhone(dto.getInsuredPhone());
        entity.setInsuredAddress(dto.getInsuredAddress());
        entity.setInsuredCity(dto.getInsuredCity());
        entity.setInsuredState(dto.getInsuredState());
        entity.setInsuredZip(dto.getInsuredZip());
        entity.setInsuredOccupation(dto.getInsuredOccupation());
        entity.setInsuredAnnualIncome(dto.getInsuredAnnualIncome());
        
        // Owner Information
        entity.setOwnerFirstName(dto.getOwnerFirstName());
        entity.setOwnerLastName(dto.getOwnerLastName());
        entity.setOwnerDateOfBirth(dto.getOwnerDateOfBirth());
        entity.setOwnerSsn(dto.getOwnerSsn());
        entity.setOwnerEmail(dto.getOwnerEmail());
        entity.setOwnerPhone(dto.getOwnerPhone());
        entity.setOwnerAddress(dto.getOwnerAddress());
        entity.setOwnerCity(dto.getOwnerCity());
        entity.setOwnerState(dto.getOwnerState());
        entity.setOwnerZip(dto.getOwnerZip());
        entity.setOwnerRelationship(dto.getOwnerRelationship());
        
        // Payor Information
        entity.setPayorFirstName(dto.getPayorFirstName());
        entity.setPayorLastName(dto.getPayorLastName());
        entity.setPayorDateOfBirth(dto.getPayorDateOfBirth());
        entity.setPayorSsn(dto.getPayorSsn());
        entity.setPayorEmail(dto.getPayorEmail());
        entity.setPayorPhone(dto.getPayorPhone());
        entity.setPayorAddress(dto.getPayorAddress());
        entity.setPayorCity(dto.getPayorCity());
        entity.setPayorState(dto.getPayorState());
        entity.setPayorZip(dto.getPayorZip());
        entity.setPayorRelationship(dto.getPayorRelationship());
        
        // Beneficiary Information
        entity.setPrimaryBeneficiaryName(dto.getPrimaryBeneficiaryName());
        entity.setPrimaryBeneficiaryRelationship(dto.getPrimaryBeneficiaryRelationship());
        entity.setPrimaryBeneficiaryPercentage(dto.getPrimaryBeneficiaryPercentage());
        entity.setPrimaryBeneficiaryDateOfBirth(dto.getPrimaryBeneficiaryDateOfBirth());
        entity.setPrimaryBeneficiarySsn(dto.getPrimaryBeneficiarySsn());
    }
    
    private Tx1TransactionDto mapEntityToDto(Tx1Transaction entity) {
        Tx1TransactionDto dto = new Tx1TransactionDto();
        dto.setId(entity.getId());
        dto.setCaseNumber(entity.getCaseNumber());
        dto.setZinniaCaseId(entity.getZinniaCaseId());
        dto.setPolicyNumber(entity.getPolicyNumber());
        dto.setApplicationDate(entity.getApplicationDate());
        dto.setProductType(entity.getProductType());
        dto.setFaceAmount(entity.getFaceAmount());
        dto.setPremiumMode(entity.getPremiumMode());
        dto.setAgentName(entity.getAgentName());
        dto.setBranch(entity.getBranch());
        
        // Insured Information
        dto.setInsuredFirstName(entity.getInsuredFirstName());
        dto.setInsuredLastName(entity.getInsuredLastName());
        dto.setInsuredDateOfBirth(entity.getInsuredDateOfBirth());
        dto.setInsuredAge(entity.getInsuredAge());
        dto.setInsuredGender(entity.getInsuredGender());
        dto.setInsuredSsn(entity.getInsuredSsn());
        dto.setInsuredEmail(entity.getInsuredEmail());
        dto.setInsuredPhone(entity.getInsuredPhone());
        dto.setInsuredAddress(entity.getInsuredAddress());
        dto.setInsuredCity(entity.getInsuredCity());
        dto.setInsuredState(entity.getInsuredState());
        dto.setInsuredZip(entity.getInsuredZip());
        dto.setInsuredOccupation(entity.getInsuredOccupation());
        dto.setInsuredAnnualIncome(entity.getInsuredAnnualIncome());
        
        // Owner Information
        dto.setOwnerFirstName(entity.getOwnerFirstName());
        dto.setOwnerLastName(entity.getOwnerLastName());
        dto.setOwnerDateOfBirth(entity.getOwnerDateOfBirth());
        dto.setOwnerSsn(entity.getOwnerSsn());
        dto.setOwnerEmail(entity.getOwnerEmail());
        dto.setOwnerPhone(entity.getOwnerPhone());
        dto.setOwnerAddress(entity.getOwnerAddress());
        dto.setOwnerCity(entity.getOwnerCity());
        dto.setOwnerState(entity.getOwnerState());
        dto.setOwnerZip(entity.getOwnerZip());
        dto.setOwnerRelationship(entity.getOwnerRelationship());
        
        // Payor Information
        dto.setPayorFirstName(entity.getPayorFirstName());
        dto.setPayorLastName(entity.getPayorLastName());
        dto.setPayorDateOfBirth(entity.getPayorDateOfBirth());
        dto.setPayorSsn(entity.getPayorSsn());
        dto.setPayorEmail(entity.getPayorEmail());
        dto.setPayorPhone(entity.getPayorPhone());
        dto.setPayorAddress(entity.getPayorAddress());
        dto.setPayorCity(entity.getPayorCity());
        dto.setPayorState(entity.getPayorState());
        dto.setPayorZip(entity.getPayorZip());
        dto.setPayorRelationship(entity.getPayorRelationship());
        
        // Beneficiary Information
        dto.setPrimaryBeneficiaryName(entity.getPrimaryBeneficiaryName());
        dto.setPrimaryBeneficiaryRelationship(entity.getPrimaryBeneficiaryRelationship());
        dto.setPrimaryBeneficiaryPercentage(entity.getPrimaryBeneficiaryPercentage());
        dto.setPrimaryBeneficiaryDateOfBirth(entity.getPrimaryBeneficiaryDateOfBirth());
        dto.setPrimaryBeneficiarySsn(entity.getPrimaryBeneficiarySsn());
        
        // Status
        dto.setStatus(entity.getStatus());
        dto.setProcessingNotes(entity.getProcessingNotes());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        return dto;
    }
}
