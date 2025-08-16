package com.secureinsure.notification.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "notification_id", unique = true, nullable = false)
    private String notificationId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "notification_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @Column(name = "notification_category", nullable = false)
    @Enumerated(EnumType.STRING)
    private NotificationCategory category;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "template_id")
    private String templateId;

    @Column(name = "template_data", columnDefinition = "JSONB")
    private String templateData;

    @Column(name = "priority", nullable = false)
    @Enumerated(EnumType.STRING)
    private PriorityLevel priority;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private NotificationStatus status;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "notification_delivery_methods", joinColumns = @JoinColumn(name = "notification_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_method")
    @Builder.Default
    private List<DeliveryMethod> deliveryMethods = new ArrayList<>();

    @Column(name = "email_address")
    private String emailAddress;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "device_token")
    private String deviceToken;

    @Column(name = "webhook_url")
    private String webhookUrl;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @Column(name = "retry_count", nullable = false)
    @Builder.Default
    private Integer retryCount = 0;

    @Column(name = "max_retries", nullable = false)
    @Builder.Default
    private Integer maxRetries = 3;

    @Column(name = "next_retry_at")
    private LocalDateTime nextRetryAt;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(name = "metadata", columnDefinition = "JSONB")
    private String metadata;

    @Column(name = "related_entity_type")
    private String relatedEntityType;

    @Column(name = "related_entity_id")
    private Long relatedEntityId;

    @Column(name = "source_service")
    private String sourceService;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Business methods
    public boolean isPending() {
        return status == NotificationStatus.PENDING;
    }

    public boolean isSent() {
        return status == NotificationStatus.SENT;
    }

    public boolean isDelivered() {
        return status == NotificationStatus.DELIVERED;
    }

    public boolean isFailed() {
        return status == NotificationStatus.FAILED;
    }

    public boolean isRead() {
        return readAt != null;
    }

    public boolean isAcknowledged() {
        return acknowledgedAt != null;
    }

    public boolean canRetry() {
        return retryCount < maxRetries && status == NotificationStatus.FAILED;
    }

    public boolean isScheduled() {
        return scheduledAt != null && scheduledAt.isAfter(LocalDateTime.now());
    }

    public boolean isUrgent() {
        return priority == PriorityLevel.URGENT || priority == PriorityLevel.CRITICAL;
    }

    public boolean supportsEmail() {
        return deliveryMethods.contains(DeliveryMethod.EMAIL);
    }

    public boolean supportsSMS() {
        return deliveryMethods.contains(DeliveryMethod.SMS);
    }

    public boolean supportsPush() {
        return deliveryMethods.contains(DeliveryMethod.PUSH);
    }

    public boolean supportsWebhook() {
        return deliveryMethods.contains(DeliveryMethod.WEBHOOK);
    }

    public void markAsSent() {
        this.status = NotificationStatus.SENT;
        this.sentAt = LocalDateTime.now();
    }

    public void markAsDelivered() {
        this.status = NotificationStatus.DELIVERED;
        this.deliveredAt = LocalDateTime.now();
    }

    public void markAsFailed(String errorMessage) {
        this.status = NotificationStatus.FAILED;
        this.errorMessage = errorMessage;
        this.retryCount++;
        if (canRetry()) {
            this.nextRetryAt = LocalDateTime.now().plusMinutes(5 * retryCount);
        }
    }

    public void markAsRead() {
        this.readAt = LocalDateTime.now();
    }

    public void markAsAcknowledged() {
        this.acknowledgedAt = LocalDateTime.now();
    }

    public void incrementRetryCount() {
        this.retryCount++;
    }

    public boolean shouldRetry() {
        return canRetry() && (nextRetryAt == null || LocalDateTime.now().isAfter(nextRetryAt));
    }
} 