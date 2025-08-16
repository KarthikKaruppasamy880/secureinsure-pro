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
@Table(name = "claim_activities")
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"claim"})
@ToString(exclude = {"claim"})
@EntityListeners(AuditingEntityListener.class)
public class ClaimActivity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_id", nullable = false)
    @NotNull
    private Claim claim;
    
    @NotBlank
    @Size(max = 50)
    @Column(name = "activity_type", nullable = false)
    private String activityType;
    
    @NotBlank
    @Size(max = 1000)
    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;
    
    @Size(max = 50)
    @Column(name = "old_value")
    private String oldValue;
    
    @Size(max = 50)
    @Column(name = "new_value")
    private String newValue;
    
    @Column(name = "activity_date")
    private LocalDateTime activityDate;
    
    @Column(name = "performed_by")
    private Long performedBy;
    
    @Size(max = 100)
    @Column(name = "performed_by_name")
    private String performedByName;
    
    @Builder.Default
    @Column(name = "is_system_generated")
    private Boolean isSystemGenerated = false;
    
    @Builder.Default
    @Column(name = "is_customer_visible")
    private Boolean isCustomerVisible = true;
    
    @Builder.Default
    @Size(max = 20)
    @Column(name = "priority")
    private String priority = "NORMAL";
    
    @Size(max = 50)
    @Column(name = "category")
    private String category;
    
    @Size(max = 200)
    @Column(name = "tags")
    private String tags;
    
    @Column(name = "related_entity_id")
    private Long relatedEntityId;
    
    @Size(max = 50)
    @Column(name = "related_entity_type")
    private String relatedEntityType;
    
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;
    
    @Size(max = 45)
    @Column(name = "ip_address")
    private String ipAddress;
    
    @Size(max = 500)
    @Column(name = "user_agent")
    private String userAgent;
    
    @Size(max = 100)
    @Column(name = "session_id")
    private String sessionId;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        if (activityDate == null) {
            activityDate = LocalDateTime.now();
        }
    }
}

