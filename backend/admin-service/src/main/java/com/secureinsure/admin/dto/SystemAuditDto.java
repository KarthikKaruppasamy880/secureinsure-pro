package com.secureinsure.admin.dto;

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
@Schema(description = "System Audit Data Transfer Object")
public class SystemAuditDto {

    private Long id;

    @NotBlank(message = "Audit ID is required")
    @Schema(description = "Audit ID", example = "AUD-AU-123456")
    private String auditId;

    @Schema(description = "User ID", example = "1")
    private Long userId;

    @Schema(description = "Username", example = "john_doe")
    private String username;

    @NotBlank(message = "Action is required")
    @Schema(description = "Action performed", example = "CREATE")
    private String action;

    @Schema(description = "Entity type", example = "POLICY")
    private String entityType;

    @Schema(description = "Entity ID", example = "1")
    private Long entityId;

    @Schema(description = "Old values (JSON)")
    private String oldValues;

    @Schema(description = "New values (JSON)")
    private String newValues;

    @Schema(description = "IP address", example = "192.168.1.1")
    private String ipAddress;

    @Schema(description = "User agent")
    private String userAgent;

    @Schema(description = "Session ID")
    private String sessionId;

    @Schema(description = "Request URL")
    private String requestUrl;

    @Schema(description = "Request method", example = "POST")
    private String requestMethod;

    @Schema(description = "Request parameters (JSON)")
    private String requestParams;

    @Schema(description = "Response status", example = "200")
    private Integer responseStatus;

    @Schema(description = "Execution time in milliseconds", example = "150")
    private Long executionTimeMs;

    @Schema(description = "Additional details (JSON)")
    private String details;

    @Schema(description = "Success status", example = "true")
    private Boolean success;

    @Schema(description = "Error message")
    private String errorMessage;

    @Schema(description = "Metadata (JSON)")
    private String metadata;

    @Schema(description = "Created at")
    private LocalDateTime createdAt;

    @Schema(description = "Updated at")
    private LocalDateTime updatedAt;

    // Computed properties
    @Schema(description = "Is successful", example = "true")
    private Boolean isSuccessful;

    @Schema(description = "Is error", example = "false")
    private Boolean isError;

    @Schema(description = "Audit summary", example = "CREATE - POLICY by john_doe")
    private String auditSummary;

    @Schema(description = "Is data change", example = "true")
    private Boolean isDataChange;

    @Schema(description = "Is login action", example = "false")
    private Boolean isLoginAction;

    @Schema(description = "Is data access", example = "false")
    private Boolean isDataAccess;

    @Schema(description = "Is data modification", example = "true")
    private Boolean isDataModification;

    @Schema(description = "Formatted execution time", example = "150ms")
    private String formattedExecutionTime;

    @Schema(description = "Formatted timestamp", example = "2024-01-15 10:30:00")
    private String formattedTimestamp;
} 