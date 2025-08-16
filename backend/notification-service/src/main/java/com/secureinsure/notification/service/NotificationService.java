package com.secureinsure.notification.service;

import com.secureinsure.notification.dto.NotificationDto;
import com.secureinsure.notification.entity.NotificationCategory;
import com.secureinsure.notification.entity.NotificationStatus;
import com.secureinsure.notification.entity.NotificationType;
import com.secureinsure.notification.entity.PriorityLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface NotificationService {

    // Basic CRUD operations
    NotificationDto createNotification(NotificationDto notificationDto);
    NotificationDto getNotificationById(Long id);
    NotificationDto getNotificationByNotificationId(String notificationId);
    Page<NotificationDto> getAllNotifications(Pageable pageable);
    NotificationDto updateNotification(Long id, NotificationDto notificationDto);
    void deleteNotification(Long id);

    // User-specific operations
    Page<NotificationDto> getNotificationsByUserId(Long userId, Pageable pageable);
    List<NotificationDto> getUnreadNotificationsByUserId(Long userId);
    List<NotificationDto> getUnacknowledgedNotificationsByUserId(Long userId);
    List<NotificationDto> getUrgentNotificationsByUserId(Long userId);
    Long getUnreadNotificationCount(Long userId);
    Long getUnacknowledgedNotificationCount(Long userId);

    // Status-based operations
    Page<NotificationDto> getNotificationsByStatus(NotificationStatus status, Pageable pageable);
    Page<NotificationDto> getNotificationsByType(NotificationType type, Pageable pageable);
    Page<NotificationDto> getNotificationsByCategory(NotificationCategory category, Pageable pageable);
    Page<NotificationDto> getNotificationsByPriority(PriorityLevel priority, Pageable pageable);
    Page<NotificationDto> getNotificationsByUserIdAndStatus(Long userId, NotificationStatus status, Pageable pageable);
    Page<NotificationDto> getNotificationsByUserIdAndType(Long userId, NotificationType type, Pageable pageable);
    Page<NotificationDto> getNotificationsByUserIdAndCategory(Long userId, NotificationCategory category, Pageable pageable);
    Page<NotificationDto> getNotificationsByUserIdAndPriority(Long userId, PriorityLevel priority, Pageable pageable);

    // Search and filter operations
    Page<NotificationDto> searchNotifications(
            Long userId, NotificationType type, NotificationCategory category, NotificationStatus status,
            PriorityLevel priority, String sourceService, String relatedEntityType, Long relatedEntityId,
            String emailAddress, String phoneNumber, String title, String message,
            LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    // Delivery operations
    void sendNotification(Long notificationId);
    void sendNotificationImmediately(NotificationDto notificationDto);
    void scheduleNotification(NotificationDto notificationDto, LocalDateTime scheduledAt);
    void cancelNotification(Long notificationId);
    void retryFailedNotification(Long notificationId);
    void markAsRead(Long notificationId);
    void markAsAcknowledged(Long notificationId);
    void markAllAsRead(Long userId);
    void markAllAsAcknowledged(Long userId);

    // Batch operations
    void sendBatchNotifications(List<NotificationDto> notifications);
    void scheduleBatchNotifications(List<NotificationDto> notifications, LocalDateTime scheduledAt);
    void cancelBatchNotifications(List<Long> notificationIds);

    // Template operations
    NotificationDto createNotificationFromTemplate(String templateId, Map<String, Object> templateData, Long userId);
    List<NotificationDto> createNotificationsFromTemplate(String templateId, Map<String, Object> templateData, List<Long> userIds);

    // Business-specific operations
    void sendPolicyCreatedNotification(Long userId, String policyNumber, String coverageType, String premiumAmount, LocalDateTime startDate, LocalDateTime endDate);
    void sendClaimSubmittedNotification(Long userId, String claimNumber, String policyNumber, String claimType, String estimatedAmount, LocalDateTime incidentDate);
    void sendPaymentDueNotification(Long userId, String policyNumber, String amount, LocalDateTime dueDate, String paymentMethod);
    void sendPasswordResetNotification(Long userId, String resetLink, String expiryTime);
    void sendWelcomeNotification(Long userId, String username, String email, String verificationLink);
    void sendSecurityAlertNotification(Long userId, String alertType, String description);
    void sendSystemMaintenanceNotification(List<Long> userIds, String maintenanceType, LocalDateTime startTime, LocalDateTime endTime);

    // Analytics and statistics
    Map<String, Object> getNotificationStatistics();
    Map<String, Object> getNotificationStatisticsByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    Map<String, Object> getUserNotificationStatistics(Long userId);
    Map<String, Object> getNotificationTypeStatistics(LocalDateTime startDate, LocalDateTime endDate);
    Map<String, Object> getNotificationCategoryStatistics(LocalDateTime startDate, LocalDateTime endDate);
    Map<String, Object> getNotificationStatusStatistics(LocalDateTime startDate, LocalDateTime endDate);
    Map<String, Object> getNotificationPriorityStatistics(LocalDateTime startDate, LocalDateTime endDate);
    Map<String, Object> getNotificationSourceStatistics(LocalDateTime startDate, LocalDateTime endDate);
    List<Map<String, Object>> getTopUsersByNotificationCount(LocalDateTime startDate, LocalDateTime endDate, int limit);
    List<Map<String, Object>> getNotificationTrendByDate(LocalDateTime startDate, LocalDateTime endDate);
    List<Map<String, Object>> getNotificationTrendByHour(LocalDateTime startDate, LocalDateTime endDate);

    // Maintenance operations
    void processScheduledNotifications();
    void processFailedNotifications();
    void cleanupOldNotifications(LocalDateTime cutoffDate);
    void validateNotification(NotificationDto notificationDto);
    String generateNotificationId();
    Map<String, Object> getDeliveryStatus(Long notificationId);

    // Health check
    Map<String, Object> healthCheck();
} 