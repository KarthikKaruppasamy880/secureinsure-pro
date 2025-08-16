package com.secureinsure.policy.controller;

import com.secureinsure.policy.dto.Tx1TransactionDto;
import com.secureinsure.policy.entity.Tx1Status;
import com.secureinsure.policy.service.Tx1TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tx1-transactions")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "TX1 Transaction Management", description = "APIs for managing TX1 transactions")
public class Tx1TransactionController {
    
    private final Tx1TransactionService tx1TransactionService;
    
    @PostMapping
    @Operation(summary = "Create a new TX1 transaction", description = "Creates a new TX1 transaction from external system")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Tx1TransactionDto> createTx1Transaction(@Valid @RequestBody Tx1TransactionDto tx1TransactionDto) {
        log.info("Creating new TX1 transaction for case: {}", tx1TransactionDto.getCaseNumber());
        Tx1TransactionDto createdTransaction = tx1TransactionService.createTx1Transaction(tx1TransactionDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTransaction);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get TX1 transaction by ID", description = "Retrieves a TX1 transaction by its ID")
    @PreAuthorize("hasRole('USER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Tx1TransactionDto> getTx1TransactionById(@PathVariable Long id) {
        log.debug("Fetching TX1 transaction by ID: {}", id);
        Tx1TransactionDto transaction = tx1TransactionService.getTx1TransactionById(id);
        return ResponseEntity.ok(transaction);
    }
    
    @GetMapping("/case/{caseNumber}")
    @Operation(summary = "Get TX1 transaction by case number", description = "Retrieves a TX1 transaction by its case number")
    @PreAuthorize("hasRole('USER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Tx1TransactionDto> getTx1TransactionByCaseNumber(@PathVariable String caseNumber) {
        log.debug("Fetching TX1 transaction by case number: {}", caseNumber);
        Tx1TransactionDto transaction = tx1TransactionService.getTx1TransactionByCaseNumber(caseNumber);
        return ResponseEntity.ok(transaction);
    }
    
    @GetMapping
    @Operation(summary = "Get all TX1 transactions", description = "Retrieves all TX1 transactions")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<Tx1TransactionDto>> getAllTx1Transactions() {
        log.debug("Fetching all TX1 transactions");
        List<Tx1TransactionDto> transactions = tx1TransactionService.getAllTx1Transactions();
        return ResponseEntity.ok(transactions);
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Get TX1 transactions by status", description = "Retrieves TX1 transactions by status")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<Tx1TransactionDto>> getTx1TransactionsByStatus(@PathVariable String status) {
        log.debug("Fetching TX1 transactions by status: {}", status);
        List<Tx1TransactionDto> transactions = tx1TransactionService.getTx1TransactionsByStatus(status);
        return ResponseEntity.ok(transactions);
    }
    
    @PutMapping("/{id}/status")
    @Operation(summary = "Update TX1 transaction status", description = "Updates the status of a TX1 transaction")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Tx1TransactionDto> updateTx1TransactionStatus(
            @PathVariable Long id,
            @RequestParam Tx1Status status,
            @RequestParam(required = false) String notes) {
        log.info("Updating TX1 transaction status to {} for ID: {}", status, id);
        Tx1TransactionDto updatedTransaction = tx1TransactionService.updateTx1TransactionStatus(id, status, notes);
        return ResponseEntity.ok(updatedTransaction);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete TX1 transaction", description = "Deletes a TX1 transaction")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTx1Transaction(@PathVariable Long id) {
        log.info("Deleting TX1 transaction with ID: {}", id);
        tx1TransactionService.deleteTx1Transaction(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search TX1 transactions", description = "Searches TX1 transactions by term")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<Tx1TransactionDto>> searchTx1Transactions(@RequestParam String searchTerm) {
        log.debug("Searching TX1 transactions with term: {}", searchTerm);
        List<Tx1TransactionDto> transactions = tx1TransactionService.searchTx1Transactions(searchTerm);
        return ResponseEntity.ok(transactions);
    }
    
    @GetMapping("/date-range")
    @Operation(summary = "Get TX1 transactions by date range", description = "Retrieves TX1 transactions within a date range")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<Tx1TransactionDto>> getTx1TransactionsByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        log.debug("Fetching TX1 transactions from {} to {}", startDate, endDate);
        List<Tx1TransactionDto> transactions = tx1TransactionService.getTx1TransactionsByDateRange(startDate, endDate);
        return ResponseEntity.ok(transactions);
    }
}
