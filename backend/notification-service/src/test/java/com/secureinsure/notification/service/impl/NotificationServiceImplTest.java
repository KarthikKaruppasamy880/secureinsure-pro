package com.secureinsure.notification.service.impl;

import com.secureinsure.notification.dto.NotificationDto;
import com.secureinsure.notification.entity.Notification;
import com.secureinsure.notification.entity.NotificationCategory;
import com.secureinsure.notification.entity.NotificationStatus;
import com.secureinsure.notification.entity.NotificationType;
import com.secureinsure.notification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.never;
import com.secureinsure.notification.entity.DeliveryMethod;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private NotificationDto testNotificationDto;
    private Notification testNotification;

    @BeforeEach
    void setUp() {
        testNotification = Notification.builder()
                .id(1L)
                .notificationId("NOTIF-001")
                .userId(1001L)
                .type(NotificationType.INFO)
                .category(NotificationCategory.SYSTEM)
                .title("Test Notification")
                .message("This is a test notification")
                .status(NotificationStatus.PENDING)
                .deliveryMethods(List.of(DeliveryMethod.EMAIL))
                .emailAddress("test@example.com")
                .createdAt(LocalDateTime.now())
                .build();

        testNotificationDto = NotificationDto.builder()
                .id(1L)
                .notificationId("NOTIF-001")
                .userId(1001L)
                .type(NotificationType.INFO)
                .category(NotificationCategory.SYSTEM)
                .title("Test Notification")
                .message("This is a test notification")
                .status(NotificationStatus.PENDING)
                .deliveryMethods(List.of(DeliveryMethod.EMAIL))
                .emailAddress("test@example.com")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createNotification_Success() {
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        NotificationDto result = notificationService.createNotification(testNotificationDto);

        assertNotNull(result);
        assertEquals(testNotificationDto.getUserId(), result.getUserId());
        assertEquals(testNotificationDto.getType(), result.getType());
        assertEquals(testNotificationDto.getTitle(), result.getTitle());
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void getNotificationById_Success() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));

        NotificationDto result = notificationService.getNotificationById(1L);

        assertNotNull(result);
        assertEquals(testNotification.getId(), result.getId());
        verify(notificationRepository).findById(1L);
    }

    @Test
    void getNotificationById_NotFound() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> notificationService.getNotificationById(1L));
        verify(notificationRepository).findById(1L);
    }

    @Test
    void getNotificationByNotificationId_Success() {
        when(notificationRepository.findByNotificationId("NOT-AU-123456")).thenReturn(Optional.of(testNotification));

        NotificationDto result = notificationService.getNotificationByNotificationId("NOT-AU-123456");

        assertNotNull(result);
        assertEquals(testNotification.getNotificationId(), result.getNotificationId());
        verify(notificationRepository).findByNotificationId("NOT-AU-123456");
    }

    @Test
    void getAllNotifications_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Notification> notificationPage = new PageImpl<>(List.of(testNotification), pageable, 1);
        when(notificationRepository.findAll(pageable)).thenReturn(notificationPage);

        Page<NotificationDto> result = notificationService.getAllNotifications(pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(notificationRepository).findAll(pageable);
    }

    @Test
    void updateNotification_Success() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        NotificationDto result = notificationService.updateNotification(1L, testNotificationDto);

        assertNotNull(result);
        verify(notificationRepository).findById(1L);
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void deleteNotification_Success() {
        when(notificationRepository.existsById(1L)).thenReturn(true);

        notificationService.deleteNotification(1L);

        verify(notificationRepository).existsById(1L);
        verify(notificationRepository).deleteById(1L);
    }

    @Test
    void deleteNotification_NotFound() {
        when(notificationRepository.existsById(1L)).thenReturn(false);

        assertThrows(RuntimeException.class, () -> notificationService.deleteNotification(1L));
        verify(notificationRepository).existsById(1L);
        verify(notificationRepository, never()).deleteById(any());
    }

    @Test
    void getNotificationsByUserId_Success() {
        when(notificationRepository.findByUserId(1L)).thenReturn(List.of(testNotification));

        List<NotificationDto> result = notificationService.getNotificationsByUserId(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(notificationRepository).findByUserId(1L);
    }

    @Test
    void getNotificationsByStatus_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Notification> notificationPage = new PageImpl<>(List.of(testNotification), pageable, 1);
        when(notificationRepository.findByStatus(NotificationStatus.PENDING, pageable)).thenReturn(notificationPage);

        Page<NotificationDto> result = notificationService.getNotificationsByStatus(NotificationStatus.PENDING, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(notificationRepository).findByStatus(NotificationStatus.PENDING, pageable);
    }

    @Test
    void getNotificationsByType_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Notification> notificationPage = new PageImpl<>(List.of(testNotification), pageable, 1);
        when(notificationRepository.findByType(NotificationType.POLICY_CREATED, pageable)).thenReturn(notificationPage);

        Page<NotificationDto> result = notificationService.getNotificationsByType(NotificationType.POLICY_CREATED, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(notificationRepository).findByType(NotificationType.POLICY_CREATED, pageable);
    }

    @Test
    void getNotificationsByCategory_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Notification> notificationPage = new PageImpl<>(List.of(testNotification), pageable, 1);
        when(notificationRepository.findByCategory(NotificationCategory.POLICY, pageable)).thenReturn(notificationPage);

        Page<NotificationDto> result = notificationService.getNotificationsByCategory(NotificationCategory.POLICY, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(notificationRepository).findByCategory(NotificationCategory.POLICY, pageable);
    }

    @Test
    void sendNotification_Success() {
        testNotification.setStatus(NotificationStatus.PENDING);
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        notificationService.sendNotification(1L);

        verify(notificationRepository).findById(1L);
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void sendNotification_NotPending() {
        testNotification.setStatus(NotificationStatus.SENT);
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));

        assertThrows(RuntimeException.class, () -> notificationService.sendNotification(1L));
        verify(notificationRepository).findById(1L);
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void sendNotificationImmediately_Success() {
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        notificationService.sendNotificationImmediately(testNotificationDto);

        verify(notificationRepository, times(2)).save(any(Notification.class));
    }

    @Test
    void scheduleNotification_Success() {
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));

        LocalDateTime scheduledAt = LocalDateTime.now().plusHours(1);
        notificationService.scheduleNotification(testNotificationDto, scheduledAt);

        verify(notificationRepository, times(2)).save(any(Notification.class));
    }

    @Test
    void cancelNotification_Success() {
        testNotification.setStatus(NotificationStatus.SCHEDULED);
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        notificationService.cancelNotification(1L);

        verify(notificationRepository).findById(1L);
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void cancelNotification_AlreadySent() {
        testNotification.setStatus(NotificationStatus.SENT);
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));

        assertThrows(RuntimeException.class, () -> notificationService.cancelNotification(1L));
        verify(notificationRepository).findById(1L);
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void retryNotification_Success() {
        testNotification.setStatus(NotificationStatus.FAILED);
        testNotification.setRetryCount(0);
        testNotification.setMaxRetries(3);
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        notificationService.retryNotification(1L);

        verify(notificationRepository).findById(1L);
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void retryNotification_NotFailed() {
        testNotification.setStatus(NotificationStatus.PENDING);
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));

        assertThrows(RuntimeException.class, () -> notificationService.retryNotification(1L));
        verify(notificationRepository).findById(1L);
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void retryNotification_MaxRetriesExceeded() {
        testNotification.setStatus(NotificationStatus.FAILED);
        testNotification.setRetryCount(3);
        testNotification.setMaxRetries(3);
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));

        assertThrows(RuntimeException.class, () -> notificationService.retryNotification(1L));
        verify(notificationRepository).findById(1L);
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void markAsRead_Success() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        notificationService.markAsRead(1L);

        verify(notificationRepository).findById(1L);
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void markAsAcknowledged_Success() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        notificationService.markAsAcknowledged(1L);

        verify(notificationRepository).findById(1L);
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void processScheduledNotifications_Success() {
        when(notificationRepository.findScheduledNotificationsToSend(any(LocalDateTime.class)))
                .thenReturn(List.of(testNotification));

        notificationService.processScheduledNotifications();

        verify(notificationRepository).findScheduledNotificationsToSend(any(LocalDateTime.class));
    }

    @Test
    void processFailedNotifications_Success() {
        when(notificationRepository.findFailedNotificationsToRetry(any(LocalDateTime.class)))
                .thenReturn(List.of(testNotification));

        notificationService.processFailedNotifications();

        verify(notificationRepository).findFailedNotificationsToRetry(any(LocalDateTime.class));
    }

    @Test
    void getNotificationStatistics_Success() {
        when(notificationRepository.count()).thenReturn(100L);
        when(notificationRepository.countByStatus(NotificationStatus.PENDING)).thenReturn(10L);
        when(notificationRepository.countByStatus(NotificationStatus.SENT)).thenReturn(50L);
        when(notificationRepository.countByStatus(NotificationStatus.DELIVERED)).thenReturn(40L);
        when(notificationRepository.countByStatus(NotificationStatus.FAILED)).thenReturn(5L);
        when(notificationRepository.countByStatus(NotificationStatus.SCHEDULED)).thenReturn(5L);
        when(notificationRepository.countByType(NotificationType.POLICY_CREATED)).thenReturn(20L);
        when(notificationRepository.countByCategory(NotificationCategory.POLICY)).thenReturn(30L);
        when(notificationRepository.countByStatus(NotificationStatus.DELIVERED)).thenReturn(40L);

        Map<String, Object> result = notificationService.getNotificationStatistics();

        assertNotNull(result);
        assertEquals(100L, result.get("totalNotifications"));
        assertEquals(10L, result.get("pendingNotifications"));
        assertEquals(50L, result.get("sentNotifications"));
        verify(notificationRepository).count();
    }

    @Test
    void generateNotificationId_Success() {
        String result = notificationService.generateNotificationId();

        assertNotNull(result);
        assertTrue(result.startsWith("NOT-"));
        assertTrue(result.matches("^NOT-[A-Z]{2}-\\d{6}$"));
    }

    @Test
    void validateNotification_Valid() {
        boolean result = notificationService.validateNotification(testNotificationDto);

        assertTrue(result);
    }

    @Test
    void validateNotification_InvalidUserId() {
        testNotificationDto.setUserId(null);
        boolean result = notificationService.validateNotification(testNotificationDto);

        assertFalse(result);
    }

    @Test
    void validateNotification_InvalidType() {
        testNotificationDto.setType(null);
        boolean result = notificationService.validateNotification(testNotificationDto);

        assertFalse(result);
    }

    @Test
    void validateNotification_InvalidTitle() {
        testNotificationDto.setTitle(null);
        boolean result = notificationService.validateNotification(testNotificationDto);

        assertFalse(result);
    }

    @Test
    void validateNotification_InvalidMessage() {
        testNotificationDto.setMessage(null);
        boolean result = notificationService.validateNotification(testNotificationDto);

        assertFalse(result);
    }

    @Test
    void validateNotification_InvalidDeliveryMethods() {
        testNotificationDto.setDeliveryMethods(null);
        boolean result = notificationService.validateNotification(testNotificationDto);

        assertFalse(result);
    }

    @Test
    void healthCheck_Success() {
        when(notificationRepository.count()).thenReturn(100L);

        notificationService.healthCheck();

        verify(notificationRepository).count();
    }

    @Test
    void healthCheck_Failure() {
        when(notificationRepository.count()).thenThrow(new RuntimeException("Database error"));

        assertThrows(RuntimeException.class, () -> notificationService.healthCheck());
        verify(notificationRepository).count();
    }
} 