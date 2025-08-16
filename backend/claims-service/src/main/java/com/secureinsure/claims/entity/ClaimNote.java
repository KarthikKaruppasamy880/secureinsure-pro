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
@Table(name = "claim_notes")
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"claim"})
@ToString(exclude = {"claim"})
@EntityListeners(AuditingEntityListener.class)
public class ClaimNote {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_id", nullable = false)
    @NotNull
    private Claim claim;
    
    @NotBlank
    @Size(max = 2000)
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Builder.Default
    @Size(max = 50)
    @Column(name = "note_type")
    private String noteType = "GENERAL";
    
    @Builder.Default
    @Size(max = 20)
    @Column(name = "priority")
    private String priority = "NORMAL";
    
    @Builder.Default
    @Column(name = "is_internal")
    private Boolean isInternal = false;
    
    @Builder.Default
    @Column(name = "is_system_generated")
    private Boolean isSystemGenerated = false;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Size(max = 100)
    @Column(name = "user_name")
    private String userName;
    
    @Size(max = 50)
    @Column(name = "category")
    private String category;
    
    @Size(max = 200)
    @Column(name = "tags")
    private String tags;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "created_by")
    private Long createdBy;
    
    @Column(name = "updated_by")
    private Long updatedBy;
}

