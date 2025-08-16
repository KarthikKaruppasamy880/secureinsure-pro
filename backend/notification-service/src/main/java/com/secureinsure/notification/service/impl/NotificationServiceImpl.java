package com.secureinsure.notification.service.impl;

import com.secureinsure.notification.dto.NotificationDto;
import com.secureinsure.notification.entity.Notification;
import com.secureinsure.notification.entity.NotificationCategory;
import com.secureinsure.notification.entity.NotificationStatus;
import com.secureinsure.notification.entity.NotificationType;
import com.secureinsure.notification.entity.PriorityLevel;
import com.secureinsure.notification.repository.NotificationRepository;
import com.secureinsure.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final Random random = new Random();

    @Override
    public NotificationDto createNotification(NotificationDto notificationDto) {
        log.info("Creating notification for user: {}", notificationDto.getUserId());
        
        Notification notification = convertToEntity(notificationDto);
        notification.setNotificationId(generateNotificationId());
        notification.setStatus(NotificationStatus.PENDING);
        notification.setCreatedAt(LocalDateTime.now());
        
        Notification savedNotification = notificationRepository.save(notification);
        log.info("Notification created with ID: {}", savedNotification.getNotificationId());
        
        return convertToDto(savedNotification);
    }

    @Override
    public NotificationDto getNotificationById(Long id) {
        log.info("Getting notification by ID: {}", id);
        
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + id));
        
        return convertToDto(notification);
    }

    @Override
    public NotificationDto getNotificationByNotificationId(String notificationId) {
        log.info("Getting notification by notification ID: {}", notificationId);
        
        Notification notification = notificationRepository.findByNotificationId(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + notificationId));
        
        return convertToDto(notification);
    }

    @Override
    public Page<NotificationDto> getAllNotifications(Pageable pageable) {
        log.info("Getting all notifications with pagination");
        
        Page<Notification> notifications = notificationRepository.findAll(pageable);
        return notifications.map(this::convertToDto);
    }

    @Override
    public NotificationDto updateNotification(Long id, NotificationDto notificationDto) {
        log.info("Updating notification with ID: {}", id);
        
        Notification existingNotification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + id));
        
        updateNotificationFromDto(existingNotification, notificationDto);
        existingNotification.setUpdatedAt(LocalDateTime.now());
        
        Notification savedNotification = notificationRepository.save(existingNotification);
        log.info("Notification updated successfully");
        
        return convertToDto(savedNotification);
    }

    @Override
    public void deleteNotification(Long id) {
        log.info("Deleting notification with ID: {}", id);
        
        if (!notificationRepository.existsById(id)) {
            throw new RuntimeException("Notification not found with ID: " + id);
        }
        
        notificationRepository.deleteById(id);
        log.info("Notification deleted successfully");
    }

    // User-specific operations
    @Override
    public Page<NotificationDto> getNotificationsByUserId(Long userId, Pageable pageable) {
        log.info("Getting notifications by user ID with pagination: {}", userId);
        
        Page<Notification> notifications = notificationRepository.findByUserId(userId, pageable);
        return notifications.map(this::convertToDto);
    }

    @Override
    public List<NotificationDto> getUnreadNotificationsByUserId(Long userId) {
        log.info("Getting unread notifications by user ID: {}", userId);
        
        List<Notification> notifications = notificationRepository.findByUserIdAndReadAtIsNull(userId);
        return notifications.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<NotificationDto> getUnacknowledgedNotificationsByUserId(Long userId) {
        log.info("Getting unacknowledged notifications by user ID: {}", userId);
        
        List<Notification> notifications = notificationRepository.findByUserIdAndAcknowledgedAtIsNull(userId);
        return notifications.stream().map(this::convertToDto).toList();
    }

    @Override
    public List<NotificationDto> getUrgentNotificationsByUserId(Long userId) {
        log.info("Getting urgent notifications by user ID: {}", userId);
        
        List<Notification> notifications = notificationRepository.findByUserIdAndPriority(userId, PriorityLevel.URGENT);
        return notifications.stream().map(this::convertToDto).toList();
    }

    @Override
    public Long getUnreadNotificationCount(Long userId) {
        log.info("Getting unread notification count for user: {}", userId);
        
        return notificationRepository.countByUserIdAndReadAtIsNull(userId);
    }

    @Override
    public Long getUnacknowledgedNotificationCount(Long userId) {
        log.info("Getting unacknowledged notification count for user: {}", userId);
        
        return notificationRepository.countByUserIdAndAcknowledgedAtIsNull(userId);
    }

    // Status-based operations
    @Override
    public Page<NotificationDto> getNotificationsByStatus(NotificationStatus status, Pageable pageable) {
        log.info("Getting notifications by status with pagination: {}", status);
        
        Page<Notification> notifications = notificationRepository.findByStatus(status, pageable);
        return notifications.map(this::convertToDto);
    }

    @Override
    public Page<NotificationDto> getNotificationsByType(NotificationType type, Pageable pageable) {
        log.info("Getting notifications by type with pagination: {}", type);
        
        Page<Notification> notifications = notificationRepository.findByType(type, pageable);
        return notifications.map(this::convertToDto);
    }

    @Override
    public Page<NotificationDto> getNotificationsByCategory(NotificationCategory category, Pageable pageable) {
        log.info("Getting notifications by category with pagination: {}", category);
        
        Page<Notification> notifications = notificationRepository.findByCategory(category, pageable);
        return notifications.map(this::convertToDto);
    }

    @Override
    public Page<NotificationDto> getNotificationsByPriority(PriorityLevel priority, Pageable pageable) {
        log.info("Getting notifications by priority with pagination: {}", priority);
        
        Page<Notification> notifications = notificationRepository.findByPriority(priority, pageable);
        return notifications.map(this::convertToDto);
    }

    @Override
    public Page<NotificationDto> getNotificationsByUserIdAndStatus(Long userId, NotificationStatus status, Pageable pageable) {
        log.info("Getting notifications by user ID and status with pagination: {} - {}", userId, status);
        
        Page<Notification> notifications = notificationRepository.findByUserIdAndStatus(userId, status, pageable);
        return notifications.map(this::convertToDto);
    }

    @Override
    public Page<NotificationDto> getNotificationsByUserIdAndType(Long userId, NotificationType type, Pageable pageable) {
        log.info("Getting notifications by user ID and type with pagination: {} - {}", userId, type);
        
        Page<Notification> notifications = notificationRepository.findByUserIdAndType(userId, type, pageable);
        return notifications.map(this::convertToDto);
    }

    @Override
    public Page<NotificationDto> getNotificationsByUserIdAndCategory(Long userId, NotificationCategory category, Pageable pageable) {
        log.info("Getting notifications by user ID and category with pagination: {} - {}", userId, category);
        
        Page<Notification> notifications = notificationRepository.findByUserIdAndCategory(userId, category, pageable);
        return notifications.map(this::convertToDto);
    }

    @Override
    public Page<NotificationDto> getNotificationsByUserIdAndPriority(Long userId, PriorityLevel priority, Pageable pageable) {
        log.info("Getting notifications by user ID and priority with pagination: {} - {}", userId, priority);
        
        Page<Notification> notifications = notificationRepository.findByUserIdAndPriority(userId, priority, pageable);
        return notifications.map(this::convertToDto);
    }

    // Search and filter operations
    @Override
    public Page<NotificationDto> searchNotifications(
            Long userId, NotificationType type, NotificationCategory category, NotificationStatus status,
            PriorityLevel priority, String sourceService, String relatedEntityType, Long relatedEntityId,
            String emailAddress, String phoneNumber, String title, String message,
            LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        
        log.info("Searching notifications with filters");
        
        // Simplified implementation - in practice, you'd use a complex query
        Page<Notification> notifications = notificationRepository.findAll(pageable);
        return notifications.map(this::convertToDto);
    }

    // Delivery operations
    @Override
    public NotificationDto sendNotification(Long notificationId) {
        log.info("Sending notification: {}", notificationId);
        
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + notificationId));
        
        notification.setStatus(NotificationStatus.SENT);
        notification.setSentAt(LocalDateTime.now());
        
        Notification savedNotification = notificationRepository.save(notification);
        return convertToDto(savedNotification);
    }

    @Override
    public List<NotificationDto> sendBatchNotifications(List<NotificationDto> notifications) {
        log.info("Sending batch notifications: {} items", notifications.size());
        
        List<NotificationDto> sentNotifications = new ArrayList<>();
        for (NotificationDto notificationDto : notifications) {
            try {
                NotificationDto sent = sendNotification(notificationDto.getId());
                sentNotifications.add(sent);
            } catch (Exception e) {
                log.error("Failed to send notification {}: {}", notificationDto.getId(), e.getMessage());
            }
        }
        
        return sentNotifications;
    }

    @Override
    public NotificationDto markAsRead(Long notificationId) {
        log.info("Marking notification as read: {}", notificationId);
        
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + notificationId));
        
        notification.setReadAt(LocalDateTime.now());
        
        Notification savedNotification = notificationRepository.save(notification);
        return convertToDto(savedNotification);
    }

    @Override
    public void markAllAsRead(Long userId) {
        log.info("Marking all notifications as read for user: {}", userId);
        
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndReadAtIsNull(userId);
        for (Notification notification : unreadNotifications) {
            notification.setReadAt(LocalDateTime.now());
        }
        
        notificationRepository.saveAll(unreadNotifications);
    }

    @Override
    public NotificationDto markAsAcknowledged(Long notificationId) {
        log.info("Marking notification as acknowledged: {}", notificationId);
        
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + notificationId));
        
        notification.setAcknowledgedAt(LocalDateTime.now());
        
        Notification savedNotification = notificationRepository.save(notification);
        return convertToDto(savedNotification);
    }

    @Override
    public void markAllAsAcknowledged(Long userId) {
        log.info("Marking all notifications as acknowledged for user: {}", userId);
        
        List<Notification> unacknowledgedNotifications = notificationRepository.findByUserIdAndAcknowledgedAtIsNull(userId);
        for (Notification notification : unacknowledgedNotifications) {
            notification.setAcknowledgedAt(LocalDateTime.now());
        }
        
        notificationRepository.saveAll(unacknowledgedNotifications);
    }

    @Override
    public NotificationDto retryFailedNotification(Long notificationId) {
        log.info("Retrying failed notification: {}", notificationId);
        
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + notificationId));
        
        if (notification.getStatus() == NotificationStatus.FAILED && notification.canRetry()) {
            notification.setStatus(NotificationStatus.PENDING);
            notification.setRetryCount(notification.getRetryCount() + 1);
            notification.setNextRetryAt(LocalDateTime.now().plusMinutes(5 * notification.getRetryCount()));
            
            Notification savedNotification = notificationRepository.save(notification);
            return convertToDto(savedNotification);
        }
        
        throw new RuntimeException("Notification cannot be retried");
    }

    // Scheduled operations
    @Override
    public NotificationDto scheduleNotification(NotificationDto notificationDto, LocalDateTime scheduledAt) {
        log.info("Scheduling notification for: {}", scheduledAt);
        
        Notification notification = convertToEntity(notificationDto);
        notification.setNotificationId(generateNotificationId());
        notification.setStatus(NotificationStatus.SCHEDULED);
        notification.setScheduledAt(scheduledAt);
        notification.setCreatedAt(LocalDateTime.now());
        
        Notification savedNotification = notificationRepository.save(notification);
        return convertToDto(savedNotification);
    }

    @Override
    public List<NotificationDto> scheduleBatchNotifications(List<NotificationDto> notifications, LocalDateTime scheduledAt) {
        log.info("Scheduling batch notifications for: {}", scheduledAt);
        
        List<NotificationDto> scheduledNotifications = new ArrayList<>();
        for (NotificationDto notificationDto : notifications) {
            try {
                NotificationDto scheduled = scheduleNotification(notificationDto, scheduledAt);
                scheduledNotifications.add(scheduled);
            } catch (Exception e) {
                log.error("Failed to schedule notification: {}", e.getMessage());
            }
        }
        
        return scheduledNotifications;
    }

    @Override
    public void cancelScheduledNotification(Long notificationId) {
        log.info("Canceling scheduled notification: {}", notificationId);
        
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + notificationId));
        
        if (notification.getStatus() == NotificationStatus.SCHEDULED) {
            notification.setStatus(NotificationStatus.CANCELLED);
            notificationRepository.save(notification);
        } else {
            throw new RuntimeException("Notification is not scheduled");
        }
    }

    @Override
    public void cancelBatchNotifications(List<Long> notificationIds) {
        log.info("Canceling batch notifications: {} items", notificationIds.size());
        
        for (Long notificationId : notificationIds) {
            try {
                cancelScheduledNotification(notificationId);
            } catch (Exception e) {
                log.error("Failed to cancel notification {}: {}", notificationId, e.getMessage());
            }
        }
    }

    @Override
    public void processScheduledNotifications() {
        log.info("Processing scheduled notifications");
        
        LocalDateTime now = LocalDateTime.now();
        List<Notification> scheduledNotifications = notificationRepository.findByStatusAndScheduledAtBefore(
                NotificationStatus.SCHEDULED, now);
        
        for (Notification notification : scheduledNotifications) {
            try {
                notification.setStatus(NotificationStatus.PENDING);
                notificationRepository.save(notification);
                sendNotification(notification.getId());
            } catch (Exception e) {
                log.error("Failed to process scheduled notification {}: {}", notification.getId(), e.getMessage());
            }
        }
    }

    @Override
    public void processFailedNotifications() {
        log.info("Processing failed notifications for retry");
        
        List<Notification> failedNotifications = notificationRepository.findByStatusAndNextRetryAtBefore(
                NotificationStatus.FAILED, LocalDateTime.now());
        
        for (Notification notification : failedNotifications) {
            try {
                if (notification.canRetry()) {
                    retryFailedNotification(notification.getId());
                }
            } catch (Exception e) {
                log.error("Failed to retry notification {}: {}", notification.getId(), e.getMessage());
            }
        }
    }

    // Statistics and reporting
    @Override
    public Map<String, Object> getNotificationStatistics() {
        log.info("Getting notification statistics");
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", notificationRepository.count());
        stats.put("pending", notificationRepository.countByStatus(NotificationStatus.PENDING));
        stats.put("sent", notificationRepository.countByStatus(NotificationStatus.SENT));
        stats.put("delivered", notificationRepository.countByStatus(NotificationStatus.DELIVERED));
        stats.put("failed", notificationRepository.countByStatus(NotificationStatus.FAILED));
        stats.put("scheduled", notificationRepository.countByStatus(NotificationStatus.SCHEDULED));
        
        return stats;
    }

    @Override
    public Map<String, Object> getUserNotificationStatistics(Long userId) {
        log.info("Getting notification statistics for user: {}", userId);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", notificationRepository.countByUserId(userId));
        stats.put("unread", notificationRepository.countByUserIdAndReadAtIsNull(userId));
        stats.put("unacknowledged", notificationRepository.countByUserIdAndAcknowledgedAtIsNull(userId));
        
        return stats;
    }

    @Override
    public Map<String, Object> getNotificationStatisticsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting notification statistics by date range: {} - {}", startDate, endDate);
        
        Map<String, Object> stats = new HashMap<>();
        List<Notification> notifications = notificationRepository.findByCreatedAtBetween(startDate, endDate);
        
        stats.put("total", notifications.size());
        stats.put("sent", notifications.stream().filter(n -> n.getStatus() == NotificationStatus.SENT).count());
        stats.put("delivered", notifications.stream().filter(n -> n.getStatus() == NotificationStatus.DELIVERED).count());
        stats.put("failed", notifications.stream().filter(n -> n.getStatus() == NotificationStatus.FAILED).count());
        
        return stats;
    }

    @Override
    public Map<String, Object> getNotificationStatusStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting notification status statistics: {} - {}", startDate, endDate);
        
        Map<String, Object> stats = new HashMap<>();
        List<Notification> notifications = notificationRepository.findByCreatedAtBetween(startDate, endDate);
        
        for (NotificationStatus status : NotificationStatus.values()) {
            long count = notifications.stream().filter(n -> n.getStatus() == status).count();
            stats.put(status.name(), count);
        }
        
        return stats;
    }

    @Override
    public Map<String, Object> getNotificationTypeStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting notification type statistics: {} - {}", startDate, endDate);
        
        Map<String, Object> stats = new HashMap<>();
        List<Notification> notifications = notificationRepository.findByCreatedAtBetween(startDate, endDate);
        
        for (NotificationType type : NotificationType.values()) {
            long count = notifications.stream().filter(n -> n.getType() == type).count();
            stats.put(type.name(), count);
        }
        
        return stats;
    }

    @Override
    public Map<String, Object> getNotificationCategoryStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting notification category statistics: {} - {}", startDate, endDate);
        
        Map<String, Object> stats = new HashMap<>();
        List<Notification> notifications = notificationRepository.findByCreatedAtBetween(startDate, endDate);
        
        for (NotificationCategory category : NotificationCategory.values()) {
            long count = notifications.stream().filter(n -> n.getCategory() == category).count();
            stats.put(category.name(), count);
        }
        
        return stats;
    }

    @Override
    public Map<String, Object> getNotificationPriorityStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting notification priority statistics: {} - {}", startDate, endDate);
        
        Map<String, Object> stats = new HashMap<>();
        List<Notification> notifications = notificationRepository.findByCreatedAtBetween(startDate, endDate);
        
        for (PriorityLevel priority : PriorityLevel.values()) {
            long count = notifications.stream().filter(n -> n.getPriority() == priority).count();
            stats.put(priority.name(), count);
        }
        
        return stats;
    }

    @Override
    public Map<String, Object> getNotificationSourceStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting notification source statistics: {} - {}", startDate, endDate);
        
        Map<String, Object> stats = new HashMap<>();
        List<Notification> notifications = notificationRepository.findByCreatedAtBetween(startDate, endDate);
        
        Map<String, Long> sourceStats = notifications.stream()
                .filter(n -> n.getSourceService() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        Notification::getSourceService,
                        java.util.stream.Collectors.counting()));
        
        stats.putAll(sourceStats);
        return stats;
    }

    @Override
    public List<Map<String, Object>> getTopUsersByNotificationCount(LocalDateTime startDate, LocalDateTime endDate, int limit) {
        log.info("Getting top users by notification count: {} - {}, limit: {}", startDate, endDate, limit);
        
        // Simplified implementation
        return new ArrayList<>();
    }

    @Override
    public List<Map<String, Object>> getNotificationTrendByDate(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting notification trend by date: {} - {}", startDate, endDate);
        
        // Simplified implementation
        return new ArrayList<>();
    }

    @Override
    public List<Map<String, Object>> getNotificationTrendByHour(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting notification trend by hour: {} - {}", startDate, endDate);
        
        // Simplified implementation
        return new ArrayList<>();
    }

    // Template and bulk operations
    @Override
    public NotificationDto createNotificationFromTemplate(String templateId, Map<String, Object> templateData, Long userId) {
        log.info("Creating notification from template: {} for user: {}", templateId, userId);
        
        // Simplified implementation
        NotificationDto notificationDto = NotificationDto.builder()
                .userId(userId)
                .type(NotificationType.CUSTOM)
                .category(NotificationCategory.GENERAL)
                .title("Template Notification")
                .message("Generated from template: " + templateId)
                .priority(PriorityLevel.NORMAL)
                .templateId(templateId)
                .build();
        
        return createNotification(notificationDto);
    }

    @Override
    public List<NotificationDto> createNotificationsFromTemplate(String templateId, Map<String, Object> templateData, List<Long> userIds) {
        log.info("Creating notifications from template: {} for {} users", templateId, userIds.size());
        
        List<NotificationDto> notifications = new ArrayList<>();
        for (Long userId : userIds) {
            try {
                NotificationDto notification = createNotificationFromTemplate(templateId, templateData, userId);
                notifications.add(notification);
            } catch (Exception e) {
                log.error("Failed to create notification for user {}: {}", userId, e.getMessage());
            }
        }
        
        return notifications;
    }

    // Delivery status and tracking
    @Override
    public Map<String, Object> getDeliveryStatus(Long notificationId) {
        log.info("Getting delivery status for notification: {}", notificationId);
        
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + notificationId));
        
        Map<String, Object> deliveryStatus = new HashMap<>();
        deliveryStatus.put("status", notification.getStatus());
        deliveryStatus.put("sentAt", notification.getSentAt());
        deliveryStatus.put("deliveredAt", notification.getDeliveredAt());
        deliveryStatus.put("readAt", notification.getReadAt());
        deliveryStatus.put("acknowledgedAt", notification.getAcknowledgedAt());
        deliveryStatus.put("retryCount", notification.getRetryCount());
        deliveryStatus.put("errorMessage", notification.getErrorMessage());
        
        return deliveryStatus;
    }

    // Maintenance operations
    @Override
    public void cleanupOldNotifications(LocalDateTime cutoffDate) {
        log.info("Cleaning up old notifications before: {}", cutoffDate);
        
        List<Notification> oldNotifications = notificationRepository.findByCreatedAtBefore(cutoffDate);
        notificationRepository.deleteAll(oldNotifications);
        
        log.info("Cleaned up {} old notifications", oldNotifications.size());
    }

    // Predefined notification methods
    @Override
    public void sendWelcomeNotification(Long userId, String username, String email, String firstName) {
        log.info("Sending welcome notification to user: {}", userId);
        
        NotificationDto notificationDto = NotificationDto.builder()
                .userId(userId)
                .type(NotificationType.WELCOME)
                .category(NotificationCategory.SYSTEM)
                .title("Welcome to SecureInsure Pro!")
                .message(String.format("Welcome %s! Your account has been successfully created.", firstName))
                .priority(PriorityLevel.NORMAL)
                .emailAddress(email)
                .build();
        
        createNotification(notificationDto);
    }

    @Override
    public void sendPasswordResetNotification(Long userId, String email, String resetToken) {
        log.info("Sending password reset notification to user: {}", userId);
        
        NotificationDto notificationDto = NotificationDto.builder()
                .userId(userId)
                .type(NotificationType.PASSWORD_RESET)
                .category(NotificationCategory.SECURITY)
                .title("Password Reset Request")
                .message("A password reset has been requested for your account. Use the provided token to reset your password.")
                .priority(PriorityLevel.HIGH)
                .emailAddress(email)
                .build();
        
        createNotification(notificationDto);
    }

    @Override
    public void sendSecurityAlertNotification(Long userId, String alertType, String description) {
        log.info("Sending security alert notification to user: {}", userId);
        
        NotificationDto notificationDto = NotificationDto.builder()
                .userId(userId)
                .type(NotificationType.SECURITY_ALERT)
                .category(NotificationCategory.SECURITY)
                .title("Security Alert: " + alertType)
                .message(description)
                .priority(PriorityLevel.URGENT)
                .build();
        
        createNotification(notificationDto);
    }

    @Override
    public void sendPolicyCreatedNotification(Long userId, String policyNumber, String policyType, String customerName, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Sending policy created notification to user: {}", userId);
        
        NotificationDto notificationDto = NotificationDto.builder()
                .userId(userId)
                .type(NotificationType.POLICY_CREATED)
                .category(NotificationCategory.POLICY)
                .title("New Policy Created")
                .message(String.format("Policy %s (%s) has been created for %s", policyNumber, policyType, customerName))
                .priority(PriorityLevel.NORMAL)
                .build();
        
        createNotification(notificationDto);
    }

    @Override
    public void sendClaimSubmittedNotification(Long userId, String claimNumber, String claimType, String customerName, String policyNumber, LocalDateTime submittedAt) {
        log.info("Sending claim submitted notification to user: {}", userId);
        
        NotificationDto notificationDto = NotificationDto.builder()
                .userId(userId)
                .type(NotificationType.CLAIM_SUBMITTED)
                .category(NotificationCategory.CLAIM)
                .title("New Claim Submitted")
                .message(String.format("Claim %s (%s) has been submitted by %s for policy %s", claimNumber, claimType, customerName, policyNumber))
                .priority(PriorityLevel.HIGH)
                .build();
        
        createNotification(notificationDto);
    }

    @Override
    public void sendPaymentDueNotification(Long userId, String policyNumber, String customerName, LocalDateTime dueDate, String amount) {
        log.info("Sending payment due notification to user: {}", userId);
        
        NotificationDto notificationDto = NotificationDto.builder()
                .userId(userId)
                .type(NotificationType.PAYMENT_DUE)
                .category(NotificationCategory.PAYMENT)
                .title("Payment Due")
                .message(String.format("Payment of %s is due for policy %s (%s) on %s", amount, policyNumber, customerName, dueDate))
                .priority(PriorityLevel.HIGH)
                .build();
        
        createNotification(notificationDto);
    }

    @Override
    public void sendSystemMaintenanceNotification(List<Long> userIds, String maintenanceDetails, LocalDateTime startTime, LocalDateTime endTime) {
        log.info("Sending system maintenance notification to {} users", userIds.size());
        
        for (Long userId : userIds) {
            NotificationDto notificationDto = NotificationDto.builder()
                    .userId(userId)
                    .type(NotificationType.SYSTEM_MAINTENANCE)
                    .category(NotificationCategory.SYSTEM)
                    .title("Scheduled System Maintenance")
                    .message(String.format("System maintenance scheduled from %s to %s. %s", startTime, endTime, maintenanceDetails))
                    .priority(PriorityLevel.NORMAL)
                    .scheduledAt(startTime.minusHours(1)) // Send 1 hour before maintenance
                    .build();
            
            try {
                createNotification(notificationDto);
            } catch (Exception e) {
                log.error("Failed to create maintenance notification for user {}: {}", userId, e.getMessage());
            }
        }
    }

    // Validation and health check
    @Override
    public boolean validateNotification(NotificationDto notificationDto) {
        log.info("Validating notification");
        
        if (notificationDto.getUserId() == null) {
            return false;
        }
        if (notificationDto.getType() == null) {
            return false;
        }
        if (notificationDto.getTitle() == null || notificationDto.getTitle().trim().isEmpty()) {
            return false;
        }
        if (notificationDto.getMessage() == null || notificationDto.getMessage().trim().isEmpty()) {
            return false;
        }
        
        return true;
    }

    @Override
    public void healthCheck() {
        log.info("Performing notification service health check");
        // Implementation would check service health
    }

    // Helper methods
    private String generateNotificationId() {
        return "NOTIF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private Notification convertToEntity(NotificationDto dto) {
        Notification notification = new Notification();
        notification.setNotificationId(dto.getNotificationId());
        notification.setUserId(dto.getUserId());
        notification.setType(dto.getType());
        notification.setCategory(dto.getCategory());
        notification.setTitle(dto.getTitle());
        notification.setMessage(dto.getMessage());
        notification.setContent(dto.getContent());
        notification.setTemplateId(dto.getTemplateId());
        notification.setTemplateData(dto.getTemplateData());
        notification.setPriority(dto.getPriority());
        notification.setStatus(dto.getStatus());
        notification.setEmailAddress(dto.getEmailAddress());
        notification.setPhoneNumber(dto.getPhoneNumber());
        notification.setDeviceToken(dto.getDeviceToken());
        notification.setWebhookUrl(dto.getWebhookUrl());
        notification.setScheduledAt(dto.getScheduledAt());
        notification.setRetryCount(dto.getRetryCount() != null ? dto.getRetryCount() : 0);
        notification.setMaxRetries(dto.getMaxRetries() != null ? dto.getMaxRetries() : 3);
        notification.setNextRetryAt(dto.getNextRetryAt());
        notification.setErrorMessage(dto.getErrorMessage());
        notification.setMetadata(dto.getMetadata());
        notification.setRelatedEntityType(dto.getRelatedEntityType());
        notification.setRelatedEntityId(dto.getRelatedEntityId());
        notification.setSourceService(dto.getSourceService());
        notification.setCreatedBy(dto.getCreatedBy());
        return notification;
    }

    private NotificationDto convertToDto(Notification entity) {
        return NotificationDto.builder()
                .id(entity.getId())
                .notificationId(entity.getNotificationId())
                .userId(entity.getUserId())
                .type(entity.getType())
                .category(entity.getCategory())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .content(entity.getContent())
                .templateId(entity.getTemplateId())
                .templateData(entity.getTemplateData())
                .priority(entity.getPriority())
                .status(entity.getStatus())
                .emailAddress(entity.getEmailAddress())
                .phoneNumber(entity.getPhoneNumber())
                .deviceToken(entity.getDeviceToken())
                .webhookUrl(entity.getWebhookUrl())
                .scheduledAt(entity.getScheduledAt())
                .sentAt(entity.getSentAt())
                .deliveredAt(entity.getDeliveredAt())
                .readAt(entity.getReadAt())
                .acknowledgedAt(entity.getAcknowledgedAt())
                .retryCount(entity.getRetryCount())
                .maxRetries(entity.getMaxRetries())
                .nextRetryAt(entity.getNextRetryAt())
                .errorMessage(entity.getErrorMessage())
                .metadata(entity.getMetadata())
                .relatedEntityType(entity.getRelatedEntityType())
                .relatedEntityId(entity.getRelatedEntityId())
                .sourceService(entity.getSourceService())
                .createdBy(entity.getCreatedBy())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private void updateNotificationFromDto(Notification notification, NotificationDto dto) {
        notification.setType(dto.getType());
        notification.setCategory(dto.getCategory());
        notification.setTitle(dto.getTitle());
        notification.setMessage(dto.getMessage());
        notification.setContent(dto.getContent());
        notification.setTemplateId(dto.getTemplateId());
        notification.setTemplateData(dto.getTemplateData());
        notification.setPriority(dto.getPriority());
        notification.setStatus(dto.getStatus());
        notification.setEmailAddress(dto.getEmailAddress());
        notification.setPhoneNumber(dto.getPhoneNumber());
        notification.setDeviceToken(dto.getDeviceToken());
        notification.setWebhookUrl(dto.getWebhookUrl());
        notification.setScheduledAt(dto.getScheduledAt());
        notification.setRetryCount(dto.getRetryCount() != null ? dto.getRetryCount() : notification.getRetryCount());
        notification.setMaxRetries(dto.getMaxRetries() != null ? dto.getMaxRetries() : notification.getMaxRetries());
        notification.setNextRetryAt(dto.getNextRetryAt());
        notification.setErrorMessage(dto.getErrorMessage());
        notification.setMetadata(dto.getMetadata());
        notification.setRelatedEntityType(dto.getRelatedEntityType());
        notification.setRelatedEntityId(dto.getRelatedEntityId());
        notification.setSourceService(dto.getSourceService());
    }
}

