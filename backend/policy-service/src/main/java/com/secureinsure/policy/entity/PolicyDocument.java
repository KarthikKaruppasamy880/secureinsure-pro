package com.secureinsure.policy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "policy_documents")
public class PolicyDocument {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_id", nullable = false)
    @NotNull(message = "Policy is required")
    private Policy policy;
    
    @Column(name = "document_name", nullable = false)
    @NotBlank(message = "Document name is required")
    private String documentName;
    
    @Column(name = "document_type", nullable = false)
    @Enumerated(EnumType.STRING)
    @NotNull(message = "Document type is required")
    private DocumentType documentType;
    
    @Column(name = "file_path", nullable = false)
    @NotBlank(message = "File path is required")
    private String filePath;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @Column(name = "mime_type")
    private String mimeType;
    
    @Column(name = "file_extension")
    private String fileExtension;
    
    @Column(name = "document_status", nullable = false)
    @Enumerated(EnumType.STRING)
    @NotNull(message = "Document status is required")
    private DocumentStatus status = DocumentStatus.UPLOADED;
    
    @Column(name = "uploaded_by")
    private Long uploadedBy;
    
    @Column(name = "uploaded_by_name")
    private String uploadedByName;
    
    @Column(name = "verified_by")
    private Long verifiedBy;
    
    @Column(name = "verified_by_name")
    private String verifiedByName;
    
    @Column(name = "verification_date")
    private LocalDateTime verificationDate;
    
    @Column(name = "rejection_reason")
    private String rejectionReason;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // Constructors
    public PolicyDocument() {}
    
    public PolicyDocument(Policy policy, String documentName, DocumentType documentType, String filePath) {
        this.policy = policy;
        this.documentName = documentName;
        this.documentType = documentType;
        this.filePath = filePath;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Policy getPolicy() {
        return policy;
    }
    
    public void setPolicy(Policy policy) {
        this.policy = policy;
    }
    
    public String getDocumentName() {
        return documentName;
    }
    
    public void setDocumentName(String documentName) {
        this.documentName = documentName;
    }
    
    public DocumentType getDocumentType() {
        return documentType;
    }
    
    public void setDocumentType(DocumentType documentType) {
        this.documentType = documentType;
    }
    
    public String getFilePath() {
        return filePath;
    }
    
    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
    
    public Long getFileSize() {
        return fileSize;
    }
    
    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }
    
    public String getMimeType() {
        return mimeType;
    }
    
    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }
    
    public String getFileExtension() {
        return fileExtension;
    }
    
    public void setFileExtension(String fileExtension) {
        this.fileExtension = fileExtension;
    }
    
    public DocumentStatus getStatus() {
        return status;
    }
    
    public void setStatus(DocumentStatus status) {
        this.status = status;
    }
    
    public Long getUploadedBy() {
        return uploadedBy;
    }
    
    public void setUploadedBy(Long uploadedBy) {
        this.uploadedBy = uploadedBy;
    }
    
    public String getUploadedByName() {
        return uploadedByName;
    }
    
    public void setUploadedByName(String uploadedByName) {
        this.uploadedByName = uploadedByName;
    }
    
    public Long getVerifiedBy() {
        return verifiedBy;
    }
    
    public void setVerifiedBy(Long verifiedBy) {
        this.verifiedBy = verifiedBy;
    }
    
    public String getVerifiedByName() {
        return verifiedByName;
    }
    
    public void setVerifiedByName(String verifiedByName) {
        this.verifiedByName = verifiedByName;
    }
    
    public LocalDateTime getVerificationDate() {
        return verificationDate;
    }
    
    public void setVerificationDate(LocalDateTime verificationDate) {
        this.verificationDate = verificationDate;
    }
    
    public String getRejectionReason() {
        return rejectionReason;
    }
    
    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    // Business methods
    public boolean isVerified() {
        return DocumentStatus.VERIFIED.equals(this.status);
    }
    
    public boolean isRejected() {
        return DocumentStatus.REJECTED.equals(this.status);
    }
    
    public boolean isPending() {
        return DocumentStatus.PENDING.equals(this.status);
    }
    
    @Override
    public String toString() {
        return "PolicyDocument{" +
                "id=" + id +
                ", documentName='" + documentName + '\'' +
                ", documentType=" + documentType +
                ", status=" + status +
                ", filePath='" + filePath + '\'' +
                '}';
    }
} 