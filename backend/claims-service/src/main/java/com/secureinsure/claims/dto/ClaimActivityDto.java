package com.secureinsure.claims.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Claim Activity Data Transfer Object")
public class ClaimActivityDto {
    
    private Long id;
    
    @NotNull(message = "Claim ID is required")
    @Schema(description = "Associated claim ID")
    private Long claimId;
    
    @NotBlank(message = "Activity type is required")
    @Size(max = 50, message = "Activity type must not exceed 50 characters")
    @Schema(description = "Activity type", example = "STATUS_CHANGE")
    private String activityType;
    
    @NotBlank(message = "Activity description is required")
    @Size(max = 1000, message = "Activity description must not exceed 1000 characters")
    @Schema(description = "Activity description")
    private String description;
    
    @Size(max = 50, message = "Old value must not exceed 50 characters")
    @Schema(description = "Previous value (for changes)")
    private String oldValue;
    
    @Size(max = 50, message = "New value must not exceed 50 characters")
    @Schema(description = "New value (for changes)")
    private String newValue;
    
    @Schema(description = "Activity timestamp")
    private LocalDateTime activityDate;
    
    @Schema(description = "User who performed the activity")
    private Long performedBy;
    
    @Schema(description = "Name of user who performed the activity")
    private String performedByName;
    
    @Schema(description = "Whether activity is system generated")
    private Boolean isSystemGenerated = false;
    
    @Schema(description = "Whether activity is visible to customer")
    private Boolean isCustomerVisible = true;
    
    @Size(max = 20, message = "Priority must not exceed 20 characters")
    @Schema(description = "Activity priority", example = "NORMAL")
    private String priority = "NORMAL";
    
    @Size(max = 50, message = "Category must not exceed 50 characters")
    @Schema(description = "Activity category")
    private String category;
    
    @Size(max = 200, message = "Tags must not exceed 200 characters")
    @Schema(description = "Activity tags for categorization")
    private String tags;
    
    @Schema(description = "Related entity ID (if any)")
    private Long relatedEntityId;
    
    @Size(max = 50, message = "Related entity type must not exceed 50 characters")
    @Schema(description = "Related entity type", example = "DOCUMENT")
    private String relatedEntityType;
    
    @Schema(description = "Additional metadata in JSON format")
    private String metadata;
    
    @Schema(description = "IP address of user who performed the activity")
    private String ipAddress;
    
    @Schema(description = "User agent of the client")
    private String userAgent;
    
    @Schema(description = "Session ID when activity was performed")
    private String sessionId;
    
    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;
    
    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;
}

