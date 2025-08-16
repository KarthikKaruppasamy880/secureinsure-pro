package com.secureinsure.admin.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "System Configuration Data Transfer Object")
public class SystemConfigurationDto {

    private Long id;

    @NotBlank(message = "Config key is required")
    @Schema(description = "Configuration key", example = "system.name")
    private String configKey;

    @Schema(description = "Configuration value", example = "SecureInsure Pro")
    private String configValue;

    @Schema(description = "Configuration type", example = "STRING")
    private String configType;

    @Schema(description = "Description", example = "System name")
    private String description;

    @Schema(description = "Category", example = "GENERAL")
    private String category;

    @Schema(description = "Is encrypted", example = "false")
    private Boolean isEncrypted;

    @Schema(description = "Is sensitive", example = "false")
    private Boolean isSensitive;

    @Schema(description = "Is readonly", example = "false")
    private Boolean isReadonly;

    @Schema(description = "Validation regex")
    private String validationRegex;

    @Schema(description = "Default value")
    private String defaultValue;

    @Schema(description = "Minimum value")
    private String minValue;

    @Schema(description = "Maximum value")
    private String maxValue;

    @Schema(description = "Allowed values (comma-separated)")
    private String allowedValues;

    @Schema(description = "Environment", example = "ALL")
    private String environment;

    @Schema(description = "Version", example = "1.0")
    private String version;

    @Schema(description = "Created by", example = "1")
    private Long createdBy;

    @Schema(description = "Updated by", example = "1")
    private Long updatedBy;

    @Schema(description = "Created at")
    private LocalDateTime createdAt;

    @Schema(description = "Updated at")
    private LocalDateTime updatedAt;

    // Computed properties
    @Schema(description = "Is modifiable", example = "true")
    private Boolean isModifiable;

    @Schema(description = "Display value", example = "SecureInsure Pro")
    private String displayValue;

    @Schema(description = "Is numeric", example = "false")
    private Boolean isNumeric;

    @Schema(description = "Is boolean", example = "false")
    private Boolean isBoolean;

    @Schema(description = "Is string", example = "true")
    private Boolean isString;

    @Schema(description = "Is JSON", example = "false")
    private Boolean isJson;

    @Schema(description = "Configuration summary", example = "system.name: SecureInsure Pro (GENERAL)")
    private String configSummary;

    @Schema(description = "Is valid value", example = "true")
    private Boolean isValidValue;

    @Schema(description = "Is in allowed values", example = "true")
    private Boolean isInAllowedValues;
} 