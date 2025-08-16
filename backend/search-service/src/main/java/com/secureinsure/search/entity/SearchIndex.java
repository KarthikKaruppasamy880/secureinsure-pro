package com.secureinsure.search.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "search_index")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchIndex {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "index_id", unique = true, nullable = false)
    private String indexId;

    @Column(name = "entity_type", nullable = false)
    private String entityType;

    @Column(name = "entity_id", nullable = false)
    private String entityId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "keywords")
    private String keywords;

    @Column(name = "category")
    private String category;

    @Column(name = "tags")
    private String tags;

    @Column(name = "status")
    private String status;

    @Column(name = "priority")
    private Integer priority;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "username")
    private String username;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "metadata", columnDefinition = "JSONB")
    private Map<String, Object> metadata;

    @Column(name = "search_score")
    private Double searchScore;

    @Column(name = "last_indexed_at")
    private LocalDateTime lastIndexedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Business methods
    public boolean isActive() {
        return "ACTIVE".equals(status);
    }

    public boolean isPending() {
        return "PENDING".equals(status);
    }

    public boolean isDeleted() {
        return "DELETED".equals(status);
    }

    public String getSearchSummary() {
        if (content != null && content.length() > 200) {
            return content.substring(0, 200) + "...";
        }
        return content;
    }

    public String getFormattedTags() {
        if (tags != null && !tags.isEmpty()) {
            return tags.replace(",", ", ");
        }
        return "";
    }

    public boolean hasHighPriority() {
        return priority != null && priority >= 8;
    }

    public boolean hasMediumPriority() {
        return priority != null && priority >= 5 && priority < 8;
    }

    public boolean hasLowPriority() {
        return priority != null && priority < 5;
    }

    public String getPriorityLabel() {
        if (hasHighPriority()) {
            return "HIGH";
        } else if (hasMediumPriority()) {
            return "MEDIUM";
        } else if (hasLowPriority()) {
            return "LOW";
        }
        return "UNKNOWN";
    }

    public boolean containsKeyword(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return false;
        }
        
        String lowerKeyword = keyword.toLowerCase();
        return (title != null && title.toLowerCase().contains(lowerKeyword)) ||
               (content != null && content.toLowerCase().contains(lowerKeyword)) ||
               (keywords != null && keywords.toLowerCase().contains(lowerKeyword)) ||
               (tags != null && tags.toLowerCase().contains(lowerKeyword));
    }

    public boolean matchesCategory(String categoryFilter) {
        if (categoryFilter == null || categoryFilter.trim().isEmpty()) {
            return true;
        }
        return categoryFilter.equalsIgnoreCase(category);
    }

    public boolean matchesStatus(String statusFilter) {
        if (statusFilter == null || statusFilter.trim().isEmpty()) {
            return true;
        }
        return statusFilter.equalsIgnoreCase(status);
    }

    public boolean isRecentlyUpdated() {
        return updatedAt != null && 
               updatedAt.isAfter(LocalDateTime.now().minusDays(7));
    }

    public String getIndexSummary() {
        return String.format("Index %s: %s (%s) - %s", 
                indexId, title, entityType, status);
    }
    
    // Alias methods for backward compatibility
    public LocalDateTime getIndexedAt() {
        return lastIndexedAt;
    }
    
    public void setIndexedAt(LocalDateTime indexedAt) {
        this.lastIndexedAt = indexedAt;
    }
} 