package com.secureinsure.search.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Search Index Data Transfer Object")
public class SearchIndexDto {

    private Long id;

    @NotBlank(message = "Index ID is required")
    @Schema(description = "Unique index ID", example = "IDX-POL-123456")
    private String indexId;

    @NotBlank(message = "Entity type is required")
    @Schema(description = "Type of entity being indexed", example = "POLICY")
    private String entityType;

    @NotBlank(message = "Entity ID is required")
    @Schema(description = "ID of the entity being indexed", example = "POL-123456")
    private String entityId;

    @NotBlank(message = "Title is required")
    @Schema(description = "Title of the indexed content", example = "Auto Insurance Policy")
    private String title;

    @Schema(description = "Content to be indexed", example = "Comprehensive auto insurance policy covering...")
    private String content;

    @Schema(description = "Keywords for search", example = "auto,insurance,comprehensive,coverage")
    private String keywords;

    @Schema(description = "Category of the content", example = "POLICY")
    private String category;

    @Schema(description = "Tags for categorization", example = "auto,comprehensive,premium")
    private String tags;

    @Schema(description = "Status of the index", example = "ACTIVE")
    private String status;

    @Schema(description = "Priority level (1-10)", example = "8")
    private Integer priority;

    @Schema(description = "User ID associated with the content", example = "100")
    private Long userId;

    @Schema(description = "Username associated with the content", example = "john.doe")
    private String username;

    @Schema(description = "User who created the index", example = "admin")
    private String createdBy;

    @Schema(description = "User who last updated the index", example = "admin")
    private String updatedBy;

    @Schema(description = "Additional metadata", example = "{\"policyType\": \"AUTO\", \"premium\": 1200.00}")
    private Map<String, Object> metadata;

    @Schema(description = "Search relevance score", example = "0.95")
    private Double searchScore;

    @Schema(description = "Last indexed timestamp")
    private LocalDateTime lastIndexedAt;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;

    // Computed properties
    @Schema(description = "Is active", example = "true")
    private Boolean isActive;

    @Schema(description = "Is pending", example = "false")
    private Boolean isPending;

    @Schema(description = "Is deleted", example = "false")
    private Boolean isDeleted;

    @Schema(description = "Search summary", example = "Comprehensive auto insurance policy covering...")
    private String searchSummary;

    @Schema(description = "Formatted tags", example = "auto, comprehensive, premium")
    private String formattedTags;

    @Schema(description = "Priority label", example = "HIGH")
    private String priorityLabel;

    @Schema(description = "Is high priority", example = "true")
    private Boolean hasHighPriority;

    @Schema(description = "Is medium priority", example = "false")
    private Boolean hasMediumPriority;

    @Schema(description = "Is low priority", example = "false")
    private Boolean hasLowPriority;

    @Schema(description = "Is recently updated", example = "true")
    private Boolean isRecentlyUpdated;

    @Schema(description = "Index summary", example = "Index IDX-POL-123456: Auto Insurance Policy (POLICY) - ACTIVE")
    private String indexSummary;
} 