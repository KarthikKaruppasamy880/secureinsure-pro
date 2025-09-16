package com.secureinsure.notification.controller;

import com.secureinsure.notification.dto.NotificationDto;
import com.secureinsure.notification.entity.NotificationCategory;
import com.secureinsure.notification.entity.NotificationStatus;
import com.secureinsure.notification.entity.NotificationType;
import com.secureinsure.notification.entity.PriorityLevel;
import com.secureinsure.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Notification Management", description = "APIs for managing notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @PostMapping
    @Operation(summary = "Create a new notification", description = "Creates a new notification")
    @PreAuthorize("hasRole('USER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<NotificationDto> createNotification(@Valid @RequestBody NotificationDto notificationDto) {
        log.info("Creating notification for user: {}", notificationDto.getUserId());
        NotificationDto createdNotification = notificationService.createNotification(notificationDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdNotification);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get notification by ID", description = "Retrieves a notification by its ID")
    @PreAuthorize("hasRole('USER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<NotificationDto> getNotificationById(@PathVariable Long id) {
        log.info("Getting notification by ID: {}", id);
        NotificationDto notification = notificationService.getNotificationById(id);
        return ResponseEntity.ok(notification);
    }

    @GetMapping("/notification-id/{notificationId}")
    @Operation(summary = "Get notification by notification ID", description = "Retrieves a notification by its notification ID")
    @PreAuthorize("hasRole('USER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<NotificationDto> getNotificationByNotificationId(@PathVariable String notificationId) {
        log.info("Getting notification by notification ID: {}", notificationId);
        NotificationDto notification = notificationService.getNotificationByNotificationId(notificationId);
        return ResponseEntity.ok(notification);
    }

    @GetMapping
    @Operation(summary = "Get all notifications", description = "Retrieves all notifications with pagination")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Page<NotificationDto>> getAllNotifications(
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Getting all notifications with pagination");
        Page<NotificationDto> notifications = notificationService.getAllNotifications(pageable);
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update notification", description = "Updates an existing notification")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<NotificationDto> updateNotification(
            @PathVariable Long id,
            @Valid @RequestBody NotificationDto notificationDto) {
        log.info("Updating notification with ID: {}", id);
        NotificationDto updatedNotification = notificationService.updateNotification(id, notificationDto);
        return ResponseEntity.ok(updatedNotification);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete notification", description = "Deletes a notification")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        log.info("Deleting notification with ID: {}", id);
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get notifications by user ID", description = "Retrieves all notifications for a specific user")
    @PreAuthorize("hasRole('USER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Page<NotificationDto>> getNotificationsByUserId(
            @PathVariable Long userId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Getting notifications for user: {}", userId);
        Page<NotificationDto> notifications = notificationService.getNotificationsByUserId(userId, pageable);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get notifications by status", description = "Retrieves notifications by their status")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Page<NotificationDto>> getNotificationsByStatus(
            @PathVariable NotificationStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Getting notifications by status: {}", status);
        Page<NotificationDto> notifications = notificationService.getNotificationsByStatus(status, pageable);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/type/{type}")
    @Operation(summary = "Get notifications by type", description = "Retrieves notifications by their type")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Page<NotificationDto>> getNotificationsByType(
            @PathVariable NotificationType type,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Getting notifications by type: {}", type);
        Page<NotificationDto> notifications = notificationService.getNotificationsByType(type, pageable);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Get notifications by category", description = "Retrieves notifications by their category")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Page<NotificationDto>> getNotificationsByCategory(
            @PathVariable NotificationCategory category,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Getting notifications by category: {}", category);
        Page<NotificationDto> notifications = notificationService.getNotificationsByCategory(category, pageable);
        return ResponseEntity.ok(notifications);
    }

    @PostMapping("/search")
    @Operation(summary = "Search notifications", description = "Searches notifications based on criteria")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Page<NotificationDto>> searchNotifications(
            @Valid @RequestBody NotificationDto searchCriteria,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Searching notifications with criteria");
        Page<NotificationDto> notifications = notificationService.searchNotifications(
                searchCriteria.getUserId(),
                searchCriteria.getType(),
                searchCriteria.getCategory(),
                searchCriteria.getStatus(),
                searchCriteria.getPriority(),
                searchCriteria.getSourceService(),
                searchCriteria.getRelatedEntityType(),
                searchCriteria.getRelatedEntityId(),
                searchCriteria.getEmailAddress(),
                searchCriteria.getPhoneNumber(),
                searchCriteria.getTitle(),
                searchCriteria.getMessage(),
                searchCriteria.getCreatedAt(),
                null, // endDate
                pageable);
        return ResponseEntity.ok(notifications);
    }

    @PostMapping("/send/{id}")
    @Operation(summary = "Send notification", description = "Sends a notification immediately")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Void> sendNotification(@PathVariable Long id) {
        log.info("Sending notification with ID: {}", id);
        notificationService.sendNotification(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/send-immediate")
    @Operation(summary = "Send notification immediately", description = "Creates and sends a notification immediately")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<NotificationDto> sendNotificationImmediately(@Valid @RequestBody NotificationDto notificationDto) {
        log.info("Sending notification immediately for user: {}", notificationDto.getUserId());
        notificationService.sendNotificationImmediately(notificationDto);
        return ResponseEntity.ok(notificationDto);
    }

    @PostMapping("/schedule")
    @Operation(summary = "Schedule notification", description = "Schedules a notification for later delivery")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<NotificationDto> scheduleNotification(
            @Valid @RequestBody NotificationDto notificationDto,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime scheduledAt) {
        log.info("Scheduling notification for user: {} at {}", notificationDto.getUserId(), scheduledAt);
        notificationService.scheduleNotification(notificationDto, scheduledAt);
        return ResponseEntity.ok(notificationDto);
    }

    @PostMapping("/cancel/{id}")
    @Operation(summary = "Cancel notification", description = "Cancels a scheduled notification")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Void> cancelNotification(@PathVariable Long id) {
        log.info("Canceling notification with ID: {}", id);
        notificationService.cancelNotification(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/retry/{id}")
    @Operation(summary = "Retry notification", description = "Retries a failed notification")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Void> retryNotification(@PathVariable Long id) {
        log.info("Retrying notification with ID: {}", id);
        notificationService.retryFailedNotification(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/mark-read/{id}")
    @Operation(summary = "Mark notification as read", description = "Marks a notification as read")
    @PreAuthorize("hasRole('USER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        log.info("Marking notification as read: {}", id);
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/mark-acknowledged/{id}")
    @Operation(summary = "Mark notification as acknowledged", description = "Marks a notification as acknowledged")
    @PreAuthorize("hasRole('USER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Void> markAsAcknowledged(@PathVariable Long id) {
        log.info("Marking notification as acknowledged: {}", id);
        notificationService.markAsAcknowledged(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/process-scheduled")
    @Operation(summary = "Process scheduled notifications", description = "Processes all scheduled notifications")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> processScheduledNotifications() {
        log.info("Processing scheduled notifications");
        notificationService.processScheduledNotifications();
        return ResponseEntity.ok().build();
    }

    @PostMapping("/process-failed")
    @Operation(summary = "Process failed notifications", description = "Processes all failed notifications for retry")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> processFailedNotifications() {
        log.info("Processing failed notifications");
        notificationService.processFailedNotifications();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get notification statistics", description = "Retrieves notification statistics")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getNotificationStatistics() {
        log.info("Getting notification statistics");
        Map<String, Object> statistics = notificationService.getNotificationStatistics();
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/validate")
    @Operation(summary = "Validate notification", description = "Validates a notification without creating it")
    @PreAuthorize("hasRole('USER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> validateNotification(@Valid @RequestBody NotificationDto notificationDto) {
        log.info("Validating notification");
        boolean isValid = notificationService.validateNotification(notificationDto);
        Map<String, Object> response = Map.of(
                "valid", isValid,
                "message", isValid ? "Notification is valid" : "Notification validation failed"
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Performs a health check on the notification service")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        log.info("Performing notification service health check");
        notificationService.healthCheck();
        Map<String, Object> response = Map.of(
                "status", "UP",
                "service", "notification-service",
                "timestamp", LocalDateTime.now()
        );
        return ResponseEntity.ok(response);
    }

    // Business-specific notification endpoints

    @PostMapping("/policy-created")
    @Operation(summary = "Send policy created notification", description = "Sends a notification when a policy is created")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<NotificationDto> sendPolicyCreatedNotification(
            @RequestParam Long userId,
            @RequestParam String policyNumber,
            @RequestParam String customerName,
            @RequestParam String coverageType,
            @RequestParam String premiumAmount,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        log.info("Sending policy created notification for user: {}", userId);
        
        NotificationDto notificationDto = NotificationDto.builder()
                .userId(userId)
                .type(NotificationType.POLICY_CREATED)
                .category(NotificationCategory.POLICY)
                .title("Policy Created Successfully")
                .message("Your policy " + policyNumber + " has been created successfully.")
                .priority(PriorityLevel.NORMAL)
                .deliveryMethods(List.of(com.secureinsure.notification.entity.DeliveryMethod.EMAIL))
                .templateId("policy_created_email")
                .templateData(convertMapToJson(Map.of(
                        "customerName", customerName,
                        "policyNumber", policyNumber,
                        "coverageType", coverageType,
                        "premiumAmount", premiumAmount,
                        "startDate", startDate,
                        "endDate", endDate
                )))
                .build();
        
        notificationService.sendNotificationImmediately(notificationDto);
        return ResponseEntity.ok(notificationDto);
    }

    @PostMapping("/claim-submitted")
    @Operation(summary = "Send claim submitted notification", description = "Sends a notification when a claim is submitted")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<NotificationDto> sendClaimSubmittedNotification(
            @RequestParam Long userId,
            @RequestParam String claimNumber,
            @RequestParam String policyNumber,
            @RequestParam String claimType,
            @RequestParam String estimatedAmount) {
        log.info("Sending claim submitted notification for user: {}", userId);
        
        NotificationDto notificationDto = NotificationDto.builder()
                .userId(userId)
                .type(NotificationType.CLAIM_SUBMITTED)
                .category(NotificationCategory.CLAIM)
                .title("Claim Submitted Successfully")
                .message("Your claim " + claimNumber + " has been submitted successfully.")
                .priority(PriorityLevel.HIGH)
                .deliveryMethods(List.of(com.secureinsure.notification.entity.DeliveryMethod.EMAIL, 
                                       com.secureinsure.notification.entity.DeliveryMethod.SMS))
                .templateId("claim_submitted_email")
                .templateData(convertMapToJson(Map.of(
                        "claimNumber", claimNumber,
                        "policyNumber", policyNumber,
                        "claimType", claimType,
                        "estimatedAmount", estimatedAmount
                )))
                .build();
        
        notificationService.sendNotificationImmediately(notificationDto);
        return ResponseEntity.ok(notificationDto);
    }

    @PostMapping("/password-reset")
    @Operation(summary = "Send password reset notification", description = "Sends a password reset notification")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NotificationDto> sendPasswordResetNotification(
            @RequestParam Long userId,
            @RequestParam String email,
            @RequestParam String resetToken) {
        log.info("Sending password reset notification for user: {}", userId);
        
        NotificationDto notificationDto = NotificationDto.builder()
                .userId(userId)
                .type(NotificationType.PASSWORD_RESET)
                .category(NotificationCategory.SECURITY)
                .title("Password Reset Request")
                .message("You have requested a password reset. Please use the provided link to reset your password.")
                .priority(PriorityLevel.URGENT)
                .deliveryMethods(List.of(com.secureinsure.notification.entity.DeliveryMethod.EMAIL))
                .emailAddress(email)
                .templateId("password_reset_email")
                .templateData(convertMapToJson(Map.of(
                        "resetToken", resetToken,
                        "email", email
                )))
                .build();
        
        notificationService.sendNotificationImmediately(notificationDto);
        return ResponseEntity.ok(notificationDto);
    }

    @PostMapping("/welcome")
    @Operation(summary = "Send welcome notification", description = "Sends a welcome notification to new users")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<NotificationDto> sendWelcomeNotification(
            @RequestParam Long userId,
            @RequestParam String email,
            @RequestParam String firstName,
            @RequestParam String lastName) {
        log.info("Sending welcome notification for user: {}", userId);
        
        NotificationDto notificationDto = NotificationDto.builder()
                .userId(userId)
                .type(NotificationType.WELCOME)
                .category(NotificationCategory.SYSTEM)
                .title("Welcome to SecureInsure Pro")
                .message("Welcome to SecureInsure Pro! We're excited to have you on board.")
                .priority(PriorityLevel.NORMAL)
                .deliveryMethods(List.of(com.secureinsure.notification.entity.DeliveryMethod.EMAIL))
                .emailAddress(email)
                .templateId("welcome_email")
                .templateData(convertMapToJson(Map.of(
                        "firstName", firstName,
                        "lastName", lastName,
                        "fullName", firstName + " " + lastName
                )))
                .build();
        
        notificationService.sendNotificationImmediately(notificationDto);
        return ResponseEntity.ok(notificationDto);
    }

    @PostMapping("/security-alert")
    @Operation(summary = "Send security alert notification", description = "Sends a security alert notification")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NotificationDto> sendSecurityAlertNotification(
            @RequestParam Long userId,
            @RequestParam String email,
            @RequestParam String alertType,
            @RequestParam String description) {
        log.info("Sending security alert notification for user: {}", userId);
        
        NotificationDto notificationDto = NotificationDto.builder()
                .userId(userId)
                .type(NotificationType.SECURITY_ALERT)
                .category(NotificationCategory.SECURITY)
                .title("Security Alert")
                .message("A security alert has been detected: " + description)
                .priority(PriorityLevel.CRITICAL)
                .deliveryMethods(List.of(com.secureinsure.notification.entity.DeliveryMethod.EMAIL, 
                                       com.secureinsure.notification.entity.DeliveryMethod.SMS))
                .emailAddress(email)
                .templateId("security_alert_email")
                .templateData(convertMapToJson(Map.of(
                        "alertType", alertType,
                        "description", description,
                        "timestamp", LocalDateTime.now().toString()
                )))
                .build();
        
        notificationService.sendNotificationImmediately(notificationDto);
        return ResponseEntity.ok(notificationDto);
    }
    
    private String convertMapToJson(Map<String, String> map) {
        try {
            return objectMapper.writeValueAsString(map);
        } catch (Exception e) {
            log.error("Error converting map to JSON", e);
            return "{}";
        }
    }
} 