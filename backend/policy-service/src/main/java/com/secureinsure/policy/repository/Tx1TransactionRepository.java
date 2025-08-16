package com.secureinsure.policy.repository;

import com.secureinsure.policy.entity.Tx1Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface Tx1TransactionRepository extends JpaRepository<Tx1Transaction, Long> {
    
    Optional<Tx1Transaction> findByCaseNumber(String caseNumber);
    
    Optional<Tx1Transaction> findByZinniaCaseId(String zinniaCaseId);
    
    Optional<Tx1Transaction> findByPolicyNumber(String policyNumber);
    
    List<Tx1Transaction> findByStatus(String status);
    
    @Query("SELECT t FROM Tx1Transaction t WHERE t.insuredFirstName LIKE %:searchTerm% OR t.insuredLastName LIKE %:searchTerm% OR t.caseNumber LIKE %:searchTerm%")
    List<Tx1Transaction> searchByTerm(@Param("searchTerm") String searchTerm);
    
    @Query("SELECT t FROM Tx1Transaction t WHERE t.applicationDate >= :startDate AND t.applicationDate <= :endDate")
    List<Tx1Transaction> findByApplicationDateRange(@Param("startDate") String startDate, @Param("endDate") String endDate);
}
