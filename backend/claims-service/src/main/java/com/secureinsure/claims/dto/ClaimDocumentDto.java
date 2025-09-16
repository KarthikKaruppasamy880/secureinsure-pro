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
@Schema(description = "Claim Document Data Transfer Object")
public class ClaimDocumentDto {
    
    private Long id;
    
    @NotNull(message = "Claim ID is required")
    @Schema(description = "Associated claim ID")
    private Long claimId;
    
    @NotBlank(message = "Document name is required")
    @Size(max = 255, message = "Document name must not exceed 255 characters")
    @Schema(description = "Document name", example = "police_report.pdf")
    private String documentName;
    
    @NotBlank(message = "Document type is required")
    @Size(max = 50, message = "Document type must not exceed 50 characters")
    @Schema(description = "Document type", example = "POLICE_REPORT")
    private String documentType;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    @Schema(description = "Document description")
    private String description;
    
    @NotBlank(message = "File path is required")
    @Schema(description = "File storage path")
    private String filePath;
    
    @Schema(description = "File size in bytes")
    private Long fileSize;
    
    @Size(max = 10, message = "File extension must not exceed 10 characters")
    @Schema(description = "File extension", example = "pdf")
    private String fileExtension;
    
    @Size(max = 100, message = "MIME type must not exceed 100 characters")
    @Schema(description = "MIME type", example = "application/pdf")
    private String mimeType;
    
    @Schema(description = "Upload timestamp")
    private LocalDateTime uploadedAt;
    
    @Schema(description = "User who uploaded the document")
    private Long uploadedBy;
    
    @Schema(description = "Whether document is verified")
    private Boolean isVerified = false;
    
    @Schema(description = "Document verification timestamp")
    private LocalDateTime verifiedAt;
    
    @Schema(description = "User who verified the document")
    private Long verifiedBy;
    
    @Schema(description = "Document status", example = "PENDING")
    private String status = "PENDING";
    
    @Schema(description = "Document tags for categorization")
    private String tags;
    
    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;
    
    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;
}











