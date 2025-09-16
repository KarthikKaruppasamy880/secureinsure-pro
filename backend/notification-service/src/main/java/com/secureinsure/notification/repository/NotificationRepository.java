package com.secureinsure.notification.repository;

import com.secureinsure.notification.entity.Notification;
import com.secureinsure.notification.entity.NotificationCategory;
import com.secureinsure.notification.entity.NotificationStatus;
import com.secureinsure.notification.entity.NotificationType;
import com.secureinsure.notification.entity.PriorityLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Optional<Notification> findByNotificationId(String notificationId);

    List<Notification> findByUserId(Long userId);

    Page<Notification> findByUserId(Long userId, Pageable pageable);

    List<Notification> findByUserIdAndStatus(Long userId, NotificationStatus status);

    Page<Notification> findByUserIdAndStatus(Long userId, NotificationStatus status, Pageable pageable);

    List<Notification> findByUserIdAndType(Long userId, NotificationType type);

    Page<Notification> findByUserIdAndType(Long userId, NotificationType type, Pageable pageable);

    List<Notification> findByUserIdAndCategory(Long userId, NotificationCategory category);

    Page<Notification> findByUserIdAndCategory(Long userId, NotificationCategory category, Pageable pageable);

    List<Notification> findByUserIdAndPriority(Long userId, PriorityLevel priority);

    Page<Notification> findByUserIdAndPriority(Long userId, PriorityLevel priority, Pageable pageable);

    List<Notification> findByStatus(NotificationStatus status);

    Page<Notification> findByStatus(NotificationStatus status, Pageable pageable);

    List<Notification> findByType(NotificationType type);

    Page<Notification> findByType(NotificationType type, Pageable pageable);

    List<Notification> findByCategory(NotificationCategory category);

    Page<Notification> findByCategory(NotificationCategory category, Pageable pageable);

    List<Notification> findByPriority(PriorityLevel priority);

    Page<Notification> findByPriority(PriorityLevel priority, Pageable pageable);

    List<Notification> findBySourceService(String sourceService);

    Page<Notification> findBySourceService(String sourceService, Pageable pageable);

    List<Notification> findByRelatedEntityTypeAndRelatedEntityId(String relatedEntityType, Long relatedEntityId);

    List<Notification> findByScheduledAtBeforeAndStatus(LocalDateTime scheduledAt, NotificationStatus status);

    List<Notification> findByNextRetryAtBeforeAndStatus(LocalDateTime nextRetryAt, NotificationStatus status);

    List<Notification> findByRetryCountLessThanAndStatus(Integer maxRetries, NotificationStatus status);

    List<Notification> findByEmailAddress(String emailAddress);

    Page<Notification> findByEmailAddress(String emailAddress, Pageable pageable);

    List<Notification> findByPhoneNumber(String phoneNumber);

    Page<Notification> findByPhoneNumber(String phoneNumber, Pageable pageable);

    List<Notification> findByDeviceToken(String deviceToken);

    Page<Notification> findByDeviceToken(String deviceToken, Pageable pageable);

    List<Notification> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    Page<Notification> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    List<Notification> findBySentAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    Page<Notification> findBySentAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    List<Notification> findByDeliveredAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    Page<Notification> findByDeliveredAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    List<Notification> findByReadAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    Page<Notification> findByReadAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    List<Notification> findByAcknowledgedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    Page<Notification> findByAcknowledgedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    @Query("SELECT n FROM Notification n WHERE " +
           "(:userId IS NULL OR n.userId = :userId) AND " +
           "(:type IS NULL OR n.type = :type) AND " +
           "(:category IS NULL OR n.category = :category) AND " +
           "(:status IS NULL OR n.status = :status) AND " +
           "(:priority IS NULL OR n.priority = :priority) AND " +
           "(:sourceService IS NULL OR n.sourceService = :sourceService) AND " +
           "(:relatedEntityType IS NULL OR n.relatedEntityType = :relatedEntityType) AND " +
           "(:relatedEntityId IS NULL OR n.relatedEntityId = :relatedEntityId) AND " +
           "(:emailAddress IS NULL OR LOWER(n.emailAddress) LIKE LOWER(CONCAT('%', :emailAddress, '%'))) AND " +
           "(:phoneNumber IS NULL OR LOWER(n.phoneNumber) LIKE LOWER(CONCAT('%', :phoneNumber, '%'))) AND " +
           "(:title IS NULL OR LOWER(n.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
           "(:message IS NULL OR LOWER(n.message) LIKE LOWER(CONCAT('%', :message, '%'))) AND " +
           "(:startDate IS NULL OR n.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR n.createdAt <= :endDate)")
    Page<Notification> findNotificationsByFilters(
            @Param("userId") Long userId,
            @Param("type") NotificationType type,
            @Param("category") NotificationCategory category,
            @Param("status") NotificationStatus status,
            @Param("priority") PriorityLevel priority,
            @Param("sourceService") String sourceService,
            @Param("relatedEntityType") String relatedEntityType,
            @Param("relatedEntityId") Long relatedEntityId,
            @Param("emailAddress") String emailAddress,
            @Param("phoneNumber") String phoneNumber,
            @Param("title") String title,
            @Param("message") String message,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.status = :status")
    Long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") NotificationStatus status);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.type = :type")
    Long countByUserIdAndType(@Param("userId") Long userId, @Param("type") NotificationType type);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.category = :category")
    Long countByUserIdAndCategory(@Param("userId") Long userId, @Param("category") NotificationCategory category);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.priority = :priority")
    Long countByUserIdAndPriority(@Param("userId") Long userId, @Param("priority") PriorityLevel priority);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.status = :status")
    Long countByStatus(@Param("status") NotificationStatus status);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.type = :type")
    Long countByType(@Param("type") NotificationType type);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.category = :category")
    Long countByCategory(@Param("category") NotificationCategory category);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.priority = :priority")
    Long countByPriority(@Param("priority") PriorityLevel priority);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.sourceService = :sourceService")
    Long countBySourceService(@Param("sourceService") String sourceService);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.retryCount >= n.maxRetries AND n.status = 'FAILED'")
    Long countFailedNotifications();

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.scheduledAt IS NOT NULL AND n.status = 'SCHEDULED'")
    Long countScheduledNotifications();

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.nextRetryAt IS NOT NULL AND n.status = 'FAILED'")
    Long countRetryNotifications();

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.readAt IS NULL AND n.status = 'DELIVERED'")
    Long countUnreadNotifications();

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.acknowledgedAt IS NULL AND n.status = 'DELIVERED'")
    Long countUnacknowledgedNotifications();

    @Query("SELECT n.type, COUNT(n) FROM Notification n WHERE n.createdAt BETWEEN :startDate AND :endDate GROUP BY n.type")
    List<Object[]> getNotificationTypeStats(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT n.category, COUNT(n) FROM Notification n WHERE n.createdAt BETWEEN :startDate AND :endDate GROUP BY n.category")
    List<Object[]> getNotificationCategoryStats(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT n.status, COUNT(n) FROM Notification n WHERE n.createdAt BETWEEN :startDate AND :endDate GROUP BY n.status")
    List<Object[]> getNotificationStatusStats(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT n.priority, COUNT(n) FROM Notification n WHERE n.createdAt BETWEEN :startDate AND :endDate GROUP BY n.priority")
    List<Object[]> getNotificationPriorityStats(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT n.sourceService, COUNT(n) FROM Notification n WHERE n.createdAt BETWEEN :startDate AND :endDate GROUP BY n.sourceService")
    List<Object[]> getNotificationSourceStats(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT n.userId, COUNT(n) FROM Notification n WHERE n.createdAt BETWEEN :startDate AND :endDate GROUP BY n.userId ORDER BY COUNT(n) DESC")
    List<Object[]> getTopUsersByNotificationCount(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    @Query("SELECT DATE(n.createdAt), COUNT(n) FROM Notification n WHERE n.createdAt BETWEEN :startDate AND :endDate GROUP BY DATE(n.createdAt) ORDER BY DATE(n.createdAt)")
    List<Object[]> getNotificationTrendByDate(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT HOUR(n.createdAt), COUNT(n) FROM Notification n WHERE n.createdAt BETWEEN :startDate AND :endDate GROUP BY HOUR(n.createdAt) ORDER BY HOUR(n.createdAt)")
    List<Object[]> getNotificationTrendByHour(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT n FROM Notification n WHERE n.scheduledAt <= :now AND n.status = 'SCHEDULED'")
    List<Notification> findScheduledNotificationsToSend(@Param("now") LocalDateTime now);

    @Query("SELECT n FROM Notification n WHERE n.nextRetryAt <= :now AND n.status = 'FAILED' AND n.retryCount < n.maxRetries")
    List<Notification> findFailedNotificationsToRetry(@Param("now") LocalDateTime now);

    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.readAt IS NULL ORDER BY n.createdAt DESC")
    List<Notification> findUnreadNotificationsByUserId(@Param("userId") Long userId);

    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.acknowledgedAt IS NULL ORDER BY n.createdAt DESC")
    List<Notification> findUnacknowledgedNotificationsByUserId(@Param("userId") Long userId);

    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.priority IN ('URGENT', 'CRITICAL') ORDER BY n.createdAt DESC")
    List<Notification> findUrgentNotificationsByUserId(@Param("userId") Long userId);

    @Query("DELETE FROM Notification n WHERE n.createdAt < :cutoffDate AND n.status IN ('DELIVERED', 'READ', 'ACKNOWLEDGED', 'CANCELLED')")
    void deleteOldNotifications(@Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("UPDATE Notification n SET n.status = 'CANCELLED' WHERE n.id = :id AND n.status IN ('PENDING', 'SCHEDULED')")
    void cancelNotification(@Param("id") Long id);
    
    // Missing methods for the service implementation
    List<Notification> findByUserIdAndReadAtIsNull(Long userId);
    List<Notification> findByUserIdAndAcknowledgedAtIsNull(Long userId);
    Long countByUserIdAndReadAtIsNull(Long userId);
    Long countByUserIdAndAcknowledgedAtIsNull(Long userId);
    List<Notification> findByStatusAndScheduledAtBefore(NotificationStatus status, LocalDateTime dateTime);
    List<Notification> findByStatusAndNextRetryAtBefore(NotificationStatus status, LocalDateTime dateTime);
    Long countByUserId(Long userId);
    List<Notification> findByCreatedAtBefore(LocalDateTime dateTime);
} 