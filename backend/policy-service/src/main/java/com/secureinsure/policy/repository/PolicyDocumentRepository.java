package com.secureinsure.policy.repository;

import com.secureinsure.policy.entity.PolicyDocument;
import com.secureinsure.policy.entity.DocumentStatus;
import com.secureinsure.policy.entity.DocumentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PolicyDocumentRepository extends JpaRepository<PolicyDocument, Long> {
    
    // Basic CRUD operations
    Optional<PolicyDocument> findByDocumentId(String documentId);
    boolean existsByDocumentId(String documentId);
    
    // Policy-related queries
    List<PolicyDocument> findByPolicyId(Long policyId);
    Page<PolicyDocument> findByPolicyId(Long policyId, Pageable pageable);
    List<PolicyDocument> findByPolicyIdAndStatus(Long policyId, DocumentStatus status);
    long countByPolicyId(Long policyId);
    
    // Document type queries
    List<PolicyDocument> findByDocumentType(DocumentType documentType);
    List<PolicyDocument> findByPolicyIdAndDocumentType(Long policyId, DocumentType documentType);
    Page<PolicyDocument> findByDocumentType(DocumentType documentType, Pageable pageable);
    
    // Status-based queries
    List<PolicyDocument> findByStatus(DocumentStatus status);
    Page<PolicyDocument> findByStatus(DocumentStatus status, Pageable pageable);
    List<PolicyDocument> findByStatusIn(List<DocumentStatus> statuses);
    long countByStatus(DocumentStatus status);
    
    // Upload-related queries
    List<PolicyDocument> findByUploadedBy(Long uploadedBy);
    Page<PolicyDocument> findByUploadedBy(Long uploadedBy, Pageable pageable);
    List<PolicyDocument> findByUploadedByAndStatus(Long uploadedBy, DocumentStatus status);
    
    // Verification queries
    List<PolicyDocument> findByVerifiedBy(Long verifiedBy);
    List<PolicyDocument> findByVerifiedByAndStatus(Long verifiedBy, DocumentStatus status);
    List<PolicyDocument> findByStatusAndVerifiedByIsNull(DocumentStatus status);
    
    // Date-based queries
    List<PolicyDocument> findByUploadedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<PolicyDocument> findByVerifiedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<PolicyDocument> findByUploadedAtAfter(LocalDateTime date);
    
    // File-related queries
    List<PolicyDocument> findByFileNameContainingIgnoreCase(String fileName);
    List<PolicyDocument> findByFileType(String fileType);
    List<PolicyDocument> findByFileSizeGreaterThan(Long minSize);
    List<PolicyDocument> findByFileSizeBetween(Long minSize, Long maxSize);
    
    // Complex search queries
    @Query("SELECT pd FROM PolicyDocument pd WHERE " +
           "(:policyId IS NULL OR pd.policyId = :policyId) AND " +
           "(:documentType IS NULL OR pd.documentType = :documentType) AND " +
           "(:status IS NULL OR pd.status = :status) AND " +
           "(:uploadedBy IS NULL OR pd.uploadedBy = :uploadedBy) AND " +
           "(:fileName IS NULL OR LOWER(pd.fileName) LIKE LOWER(CONCAT('%', :fileName, '%'))) AND " +
           "(:fileType IS NULL OR pd.fileType = :fileType) AND " +
           "(:minSize IS NULL OR pd.fileSize >= :minSize) AND " +
           "(:maxSize IS NULL OR pd.fileSize <= :maxSize) AND " +
           "(:startDate IS NULL OR pd.uploadedAt >= :startDate) AND " +
           "(:endDate IS NULL OR pd.uploadedAt <= :endDate)")
    Page<PolicyDocument> findDocumentsByFilters(
            @Param("policyId") Long policyId,
            @Param("documentType") DocumentType documentType,
            @Param("status") DocumentStatus status,
            @Param("uploadedBy") Long uploadedBy,
            @Param("fileName") String fileName,
            @Param("fileType") String fileType,
            @Param("minSize") Long minSize,
            @Param("maxSize") Long maxSize,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );
    
    // Statistics queries
    @Query("SELECT COUNT(pd) FROM PolicyDocument pd WHERE pd.status = :status AND pd.uploadedAt >= :startDate")
    long countDocumentsByStatusAndDateRange(@Param("status") DocumentStatus status, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT pd.documentType, COUNT(pd) FROM PolicyDocument pd WHERE pd.status = :status GROUP BY pd.documentType")
    List<Object[]> countDocumentsByTypeAndStatus(@Param("status") DocumentStatus status);
    
    @Query("SELECT SUM(pd.fileSize) FROM PolicyDocument pd WHERE pd.policyId = :policyId")
    Long sumFileSizeByPolicyId(@Param("policyId") Long policyId);
    
    // Pending verification documents
    @Query("SELECT pd FROM PolicyDocument pd WHERE pd.status = :status AND pd.verifiedBy IS NULL ORDER BY pd.uploadedAt DESC")
    Page<PolicyDocument> findPendingVerificationDocuments(@Param("status") DocumentStatus status, Pageable pageable);
    
    // Recent documents
    @Query("SELECT pd FROM PolicyDocument pd WHERE pd.uploadedAt >= :since ORDER BY pd.uploadedAt DESC")
    List<PolicyDocument> findRecentDocuments(@Param("since") LocalDateTime since);
    
    // Large files
    @Query("SELECT pd FROM PolicyDocument pd WHERE pd.fileSize >= :minSize ORDER BY pd.fileSize DESC")
    Page<PolicyDocument> findLargeDocuments(@Param("minSize") Long minSize, Pageable pageable);
    
    // Documents by verification status
    @Query("SELECT pd FROM PolicyDocument pd WHERE pd.verifiedBy IS NOT NULL AND pd.verifiedAt BETWEEN :startDate AND :endDate")
    List<PolicyDocument> findVerifiedDocumentsInDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Unverified documents
    @Query("SELECT pd FROM PolicyDocument pd WHERE pd.verifiedBy IS NULL AND pd.status = :status")
    List<PolicyDocument> findUnverifiedDocuments(@Param("status") DocumentStatus status);
} 