package com.secureinsure.admin.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_configuration")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemConfiguration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "config_key", unique = true, nullable = false)
    private String configKey;

    @Column(name = "config_value", columnDefinition = "TEXT")
    private String configValue;

    @Column(name = "config_type")
    private String configType;

    @Column(name = "description")
    private String description;

    @Column(name = "category")
    private String category;

    @Column(name = "is_encrypted")
    private Boolean isEncrypted;

    @Column(name = "is_sensitive")
    private Boolean isSensitive;

    @Column(name = "is_readonly")
    private Boolean isReadonly;

    @Column(name = "validation_regex")
    private String validationRegex;

    @Column(name = "default_value")
    private String defaultValue;

    @Column(name = "min_value")
    private String minValue;

    @Column(name = "max_value")
    private String maxValue;

    @Column(name = "allowed_values", columnDefinition = "TEXT")
    private String allowedValues;

    @Column(name = "environment")
    private String environment;

    @Column(name = "version")
    private String version;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Business methods
    public boolean isEncrypted() {
        return isEncrypted != null && isEncrypted;
    }

    public boolean isSensitive() {
        return isSensitive != null && isSensitive;
    }

    public boolean isReadonly() {
        return isReadonly != null && isReadonly;
    }

    public boolean isModifiable() {
        return !isReadonly();
    }

    public String getDisplayValue() {
        if (isSensitive()) {
            return "***SENSITIVE***";
        }
        return configValue;
    }

    public boolean isValidValue(String value) {
        if (validationRegex != null && !validationRegex.isEmpty()) {
            return value != null && value.matches(validationRegex);
        }
        return true;
    }

    public boolean isInAllowedValues(String value) {
        if (allowedValues != null && !allowedValues.isEmpty()) {
            String[] allowed = allowedValues.split(",");
            for (String allowedValue : allowed) {
                if (allowedValue.trim().equals(value)) {
                    return true;
                }
            }
            return false;
        }
        return true;
    }

    public boolean isNumeric() {
        return "NUMBER".equalsIgnoreCase(configType) || "INTEGER".equalsIgnoreCase(configType) || "DECIMAL".equalsIgnoreCase(configType);
    }

    public boolean isBoolean() {
        return "BOOLEAN".equalsIgnoreCase(configType);
    }

    public boolean isString() {
        return "STRING".equalsIgnoreCase(configType) || "TEXT".equalsIgnoreCase(configType);
    }

    public boolean isJson() {
        return "JSON".equalsIgnoreCase(configType);
    }

    public String getConfigSummary() {
        return String.format("%s: %s (%s)", configKey, getDisplayValue(), category);
    }
} 