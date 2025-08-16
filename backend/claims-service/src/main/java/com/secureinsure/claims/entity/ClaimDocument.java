package com.secureinsure.claims.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "claim_documents")
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"claim"})
@ToString(exclude = {"claim"})
@EntityListeners(AuditingEntityListener.class)
public class ClaimDocument {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_id", nullable = false)
    @NotNull
    private Claim claim;
    
    @NotBlank
    @Size(max = 255)
    @Column(name = "document_name", nullable = false)
    private String documentName;
    
    @NotBlank
    @Size(max = 50)
    @Column(name = "document_type", nullable = false)
    private String documentType;
    
    @Size(max = 500)
    @Column(name = "description")
    private String description;
    
    @NotBlank
    @Column(name = "file_path", nullable = false)
    private String filePath;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @Size(max = 10)
    @Column(name = "file_extension")
    private String fileExtension;
    
    @Size(max = 100)
    @Column(name = "mime_type")
    private String mimeType;
    
    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;
    
    @Column(name = "uploaded_by")
    private Long uploadedBy;
    
    @Builder.Default
    @Column(name = "is_verified")
    private Boolean isVerified = false;
    
    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;
    
    @Column(name = "verified_by")
    private Long verifiedBy;
    
    @Builder.Default
    @Size(max = 20)
    @Column(name = "status")
    private String status = "PENDING";
    
    @Size(max = 200)
    @Column(name = "tags")
    private String tags;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        if (uploadedAt == null) {
            uploadedAt = LocalDateTime.now();
        }
    }
}

