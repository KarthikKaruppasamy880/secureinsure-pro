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
@Schema(description = "Claim Note Data Transfer Object")
public class ClaimNoteDto {
    
    private Long id;
    
    @NotNull(message = "Claim ID is required")
    @Schema(description = "Associated claim ID")
    private Long claimId;
    
    @NotBlank(message = "Note content is required")
    @Size(max = 2000, message = "Note content must not exceed 2000 characters")
    @Schema(description = "Note content")
    private String content;
    
    @Size(max = 50, message = "Note type must not exceed 50 characters")
    @Schema(description = "Note type", example = "INTERNAL")
    private String noteType = "GENERAL";
    
    @Schema(description = "Note priority level")
    private String priority = "NORMAL";
    
    @Schema(description = "Whether note is internal only")
    private Boolean isInternal = false;
    
    @Schema(description = "Whether note is system generated")
    private Boolean isSystemGenerated = false;
    
    @Schema(description = "Associated user ID")
    private Long userId;
    
    @Schema(description = "User name who created the note")
    private String userName;
    
    @Schema(description = "Note category")
    private String category;
    
    @Schema(description = "Note tags for categorization")
    private String tags;
    
    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;
    
    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;
    
    @Schema(description = "User who created the note")
    private Long createdBy;
    
    @Schema(description = "User who last updated the note")
    private Long updatedBy;
}

