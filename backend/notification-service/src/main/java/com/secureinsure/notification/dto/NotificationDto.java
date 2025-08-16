package com.secureinsure.notification.dto;

import com.secureinsure.notification.entity.DeliveryMethod;
import com.secureinsure.notification.entity.NotificationCategory;
import com.secureinsure.notification.entity.NotificationStatus;
import com.secureinsure.notification.entity.NotificationType;
import com.secureinsure.notification.entity.PriorityLevel;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Notification Data Transfer Object")
public class NotificationDto {

    private Long id;

    @NotBlank(message = "Notification ID is required")
    @Pattern(regexp = "^NOT-[A-Z]{2}-\\d{6}$", message = "Notification ID must follow format NOT-XX-XXXXXX")
    @Schema(description = "Notification ID", example = "NOT-AU-123456")
    private String notificationId;

    @NotNull(message = "User ID is required")
    @Schema(description = "User ID", example = "1")
    private Long userId;

    @NotNull(message = "Notification type is required")
    @Schema(description = "Notification type", example = "POLICY_CREATED")
    private NotificationType type;

    @NotNull(message = "Notification category is required")
    @Schema(description = "Notification category", example = "POLICY")
    private NotificationCategory category;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    @Schema(description = "Notification title", example = "Policy Created Successfully")
    private String title;

    @NotBlank(message = "Message is required")
    @Size(max = 1000, message = "Message must not exceed 1000 characters")
    @Schema(description = "Notification message", example = "Your policy POL-AU-123456 has been created successfully.")
    private String message;

    @Size(max = 5000, message = "Content must not exceed 5000 characters")
    @Schema(description = "Detailed content", example = "Your auto insurance policy has been created with coverage starting from 2024-01-01.")
    private String content;

    @Size(max = 100, message = "Template ID must not exceed 100 characters")
    @Schema(description = "Template ID", example = "policy_created_email")
    private String templateId;

    @Schema(description = "Template data as JSON", example = "{\"policyNumber\":\"POL-AU-123456\",\"coverageType\":\"Auto\"}")
    private String templateData;

    @NotNull(message = "Priority is required")
    @Schema(description = "Priority level", example = "NORMAL")
    private PriorityLevel priority;

    @Schema(description = "Notification status", example = "PENDING")
    private NotificationStatus status;

    @NotEmpty(message = "At least one delivery method is required")
    @Schema(description = "Delivery methods", example = "[\"EMAIL\", \"SMS\"]")
    private List<DeliveryMethod> deliveryMethods;

    @Email(message = "Email address must be valid")
    @Schema(description = "Email address", example = "user@example.com")
    private String emailAddress;

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Phone number must be valid")
    @Schema(description = "Phone number", example = "+1234567890")
    private String phoneNumber;

    @Size(max = 500, message = "Device token must not exceed 500 characters")
    @Schema(description = "Device token for push notifications")
    private String deviceToken;

    @Pattern(regexp = "^https?://.*", message = "Webhook URL must be a valid HTTP/HTTPS URL")
    @Schema(description = "Webhook URL", example = "https://api.example.com/webhook")
    private String webhookUrl;

    @Future(message = "Scheduled time must be in the future")
    @Schema(description = "Scheduled delivery time")
    private LocalDateTime scheduledAt;

    @Schema(description = "Sent time")
    private LocalDateTime sentAt;

    @Schema(description = "Delivered time")
    private LocalDateTime deliveredAt;

    @Schema(description = "Read time")
    private LocalDateTime readAt;

    @Schema(description = "Acknowledged time")
    private LocalDateTime acknowledgedAt;

    @Min(value = 0, message = "Retry count must be non-negative")
    @Max(value = 10, message = "Retry count must not exceed 10")
    @Schema(description = "Retry count", example = "0")
    private Integer retryCount;

    @Min(value = 1, message = "Max retries must be at least 1")
    @Max(value = 10, message = "Max retries must not exceed 10")
    @Schema(description = "Maximum retry attempts", example = "3")
    private Integer maxRetries;

    @Schema(description = "Next retry time")
    private LocalDateTime nextRetryAt;

    @Size(max = 1000, message = "Error message must not exceed 1000 characters")
    @Schema(description = "Error message")
    private String errorMessage;

    @Schema(description = "Metadata as JSON", example = "{\"source\":\"policy-service\",\"version\":\"1.0\"}")
    private String metadata;

    @Size(max = 100, message = "Related entity type must not exceed 100 characters")
    @Schema(description = "Related entity type", example = "Policy")
    private String relatedEntityType;

    @Schema(description = "Related entity ID", example = "1")
    private Long relatedEntityId;

    @Size(max = 100, message = "Source service must not exceed 100 characters")
    @Schema(description = "Source service", example = "policy-service")
    private String sourceService;

    @Schema(description = "Created by user ID", example = "1")
    private Long createdBy;

    @Schema(description = "Created time")
    private LocalDateTime createdAt;

    @Schema(description = "Updated time")
    private LocalDateTime updatedAt;

    // Computed properties
    @Schema(description = "Is notification pending", example = "true")
    private Boolean isPending;

    @Schema(description = "Is notification sent", example = "false")
    private Boolean isSent;

    @Schema(description = "Is notification delivered", example = "false")
    private Boolean isDelivered;

    @Schema(description = "Is notification failed", example = "false")
    private Boolean isFailed;

    @Schema(description = "Is notification read", example = "false")
    private Boolean isRead;

    @Schema(description = "Is notification acknowledged", example = "false")
    private Boolean isAcknowledged;

    @Schema(description = "Can notification be retried", example = "true")
    private Boolean canRetry;

    @Schema(description = "Is notification scheduled", example = "false")
    private Boolean isScheduled;

    @Schema(description = "Is notification urgent", example = "false")
    private Boolean isUrgent;

    @Schema(description = "Supports email delivery", example = "true")
    private Boolean supportsEmail;

    @Schema(description = "Supports SMS delivery", example = "true")
    private Boolean supportsSMS;

    @Schema(description = "Supports push delivery", example = "false")
    private Boolean supportsPush;

    @Schema(description = "Supports webhook delivery", example = "false")
    private Boolean supportsWebhook;

    @Schema(description = "Should retry notification", example = "false")
    private Boolean shouldRetry;

    @Schema(description = "Delivery status summary")
    private Map<String, Object> deliveryStatus;
} 