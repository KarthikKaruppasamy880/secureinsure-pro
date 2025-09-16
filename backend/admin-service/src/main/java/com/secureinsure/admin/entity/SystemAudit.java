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
@Table(name = "system_audit")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "audit_id", unique = true, nullable = false)
    private String auditId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "username")
    private String username;

    @Column(name = "action", nullable = false)
    private String action;

    @Column(name = "entity_type")
    private String entityType;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "old_values", columnDefinition = "TEXT")
    private String oldValues;

    @Column(name = "new_values", columnDefinition = "TEXT")
    private String newValues;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "session_id")
    private String sessionId;

    @Column(name = "request_url")
    private String requestUrl;

    @Column(name = "request_method")
    private String requestMethod;

    @Column(name = "request_params", columnDefinition = "TEXT")
    private String requestParams;

    @Column(name = "response_status")
    private Integer responseStatus;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    @Column(name = "execution_time_ms")
    private Long executionTimeMs;

    @Column(name = "success")
    private Boolean success;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Business methods
    public boolean isSuccessful() {
        return success != null && success;
    }

    public boolean isError() {
        return success != null && !success;
    }

    public String getAuditSummary() {
        return String.format("%s - %s by %s", action, entityType, username);
    }

    public boolean isDataChange() {
        return oldValues != null || newValues != null;
    }

    public boolean isLoginAction() {
        return "LOGIN".equalsIgnoreCase(action) || "LOGOUT".equalsIgnoreCase(action);
    }

    public boolean isDataAccess() {
        return "READ".equalsIgnoreCase(action) || "SEARCH".equalsIgnoreCase(action);
    }

    public boolean isDataModification() {
        return "CREATE".equalsIgnoreCase(action) || "UPDATE".equalsIgnoreCase(action) || "DELETE".equalsIgnoreCase(action);
    }
} 