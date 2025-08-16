package com.secureinsure.auth.controller;

import com.secureinsure.auth.dto.LoginRequest;
import com.secureinsure.auth.dto.LoginResponse;
import com.secureinsure.auth.dto.UserDto;
import com.secureinsure.auth.entity.UserStatus;
import com.secureinsure.auth.entity.UserType;
import com.secureinsure.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication & Authorization", description = "APIs for authentication and user management")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticates a user and returns access token")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Login attempt for user: {}", loginRequest.getUsername());
        LoginResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login/mfa")
    @Operation(summary = "MFA login", description = "Complete login with MFA code")
    public ResponseEntity<LoginResponse> loginWithMfa(
            @RequestParam String username,
            @RequestParam String mfaCode) {
        log.info("MFA login attempt for user: {}", username);
        LoginResponse response = authService.loginWithMfa(username, mfaCode);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login/biometric")
    @Operation(summary = "Biometric login", description = "Authenticate using biometric token")
    public ResponseEntity<LoginResponse> loginWithBiometric(
            @RequestParam String username,
            @RequestParam String biometricToken) {
        log.info("Biometric login attempt for user: {}", username);
        LoginResponse response = authService.loginWithBiometric(username, biometricToken);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Refresh access token using refresh token")
    public ResponseEntity<LoginResponse> refreshToken(@RequestParam String refreshToken) {
        log.info("Token refresh attempt");
        LoginResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "User logout", description = "Logout user and invalidate tokens")
    @PreAuthorize("hasRole('USER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Void> logout(@RequestParam String sessionId) {
        log.info("Logout attempt for session: {}", sessionId);
        authService.logout(sessionId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/register")
    @Operation(summary = "User registration", description = "Register a new user")
    public ResponseEntity<UserDto> register(@Valid @RequestBody UserDto userDto) {
        log.info("User registration attempt for: {}", userDto.getUsername());
        UserDto createdUser = authService.createUser(userDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @GetMapping("/users")
    @Operation(summary = "Get all users", description = "Retrieve all users with pagination")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserDto>> getAllUsers(
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Get all users request");
        Page<UserDto> users = authService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Get user by ID", description = "Retrieve a user by their ID")
    @PreAuthorize("hasRole('USER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        log.info("Get user by ID: {}", id);
        UserDto user = authService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/users/username/{username}")
    @Operation(summary = "Get user by username", description = "Retrieve a user by their username")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> getUserByUsername(@PathVariable String username) {
        log.info("Get user by username: {}", username);
        UserDto user = authService.getUserByUsername(username);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/users/email/{email}")
    @Operation(summary = "Get user by email", description = "Retrieve a user by their email")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> getUserByEmail(@PathVariable String email) {
        log.info("Get user by email: {}", email);
        UserDto user = authService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{id}")
    @Operation(summary = "Update user", description = "Update an existing user")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserDto userDto) {
        log.info("Update user request for ID: {}", id);
        UserDto updatedUser = authService.updateUser(id, userDto);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete user", description = "Delete a user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        log.info("Delete user request for ID: {}", id);
        authService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users/search")
    @Operation(summary = "Search users", description = "Search users with filters")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserDto>> searchUsers(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String lastName,
            @RequestParam(required = false) UserType userType,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(required = false) Boolean mfaEnabled,
            @RequestParam(required = false) Boolean biometricEnabled,
            @RequestParam(required = false) Boolean emailVerified,
            @RequestParam(required = false) Boolean phoneVerified,
            @RequestParam(required = false) Long createdBy,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Search users request");
        Page<UserDto> users = authService.getUsersByFilters(
                username, email, firstName, lastName, userType, status,
                mfaEnabled, biometricEnabled, emailVerified, phoneVerified,
                createdBy, startDate, endDate, pageable);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/status/{status}")
    @Operation(summary = "Get users by status", description = "Get users filtered by status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserDto>> getUsersByStatus(
            @PathVariable UserStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Get users by status: {}", status);
        Page<UserDto> users = authService.getUsersByStatus(status, pageable);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/type/{userType}")
    @Operation(summary = "Get users by type", description = "Get users filtered by user type")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserDto>> getUsersByType(
            @PathVariable UserType userType,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Get users by type: {}", userType);
        Page<UserDto> users = authService.getUsersByType(userType, pageable);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/role/{role}")
    @Operation(summary = "Get users by role", description = "Get users filtered by role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserDto>> getUsersByRole(
            @PathVariable String role,
            @PageableDefault(size = 20) Pageable pageable) {
        log.info("Get users by role: {}", role);
        Page<UserDto> users = authService.getUsersByRole(role, pageable);
        return ResponseEntity.ok(users);
    }

    @PostMapping("/users/{id}/activate")
    @Operation(summary = "Activate user", description = "Activate a user account")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> activateUser(@PathVariable Long id) {
        log.info("Activate user request for ID: {}", id);
        UserDto user = authService.activateUser(id);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/users/{id}/deactivate")
    @Operation(summary = "Deactivate user", description = "Deactivate a user account")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> deactivateUser(@PathVariable Long id) {
        log.info("Deactivate user request for ID: {}", id);
        UserDto user = authService.deactivateUser(id);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/users/{id}/suspend")
    @Operation(summary = "Suspend user", description = "Suspend a user account")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> suspendUser(@PathVariable Long id, @RequestParam String reason) {
        log.info("Suspend user request for ID: {} with reason: {}", id, reason);
        UserDto user = authService.suspendUser(id, reason);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/users/{id}/lock")
    @Operation(summary = "Lock user", description = "Lock a user account")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> lockUser(@PathVariable Long id, @RequestParam(defaultValue = "30") int lockDurationMinutes) {
        log.info("Lock user request for ID: {} for {} minutes", id, lockDurationMinutes);
        UserDto user = authService.lockUser(id, lockDurationMinutes);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/users/{id}/unlock")
    @Operation(summary = "Unlock user", description = "Unlock a user account")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> unlockUser(@PathVariable Long id) {
        log.info("Unlock user request for ID: {}", id);
        UserDto user = authService.unlockUser(id);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/users/{id}/mfa/enable")
    @Operation(summary = "Enable MFA", description = "Enable MFA for a user")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<UserDto> enableMfa(@PathVariable Long id) {
        log.info("Enable MFA request for user ID: {}", id);
        UserDto user = authService.enableMfa(id);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/users/{id}/mfa/disable")
    @Operation(summary = "Disable MFA", description = "Disable MFA for a user")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<UserDto> disableMfa(@PathVariable Long id) {
        log.info("Disable MFA request for user ID: {}", id);
        UserDto user = authService.disableMfa(id);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/users/{id}/mfa/verify")
    @Operation(summary = "Verify MFA", description = "Verify MFA code for a user")
    public ResponseEntity<Boolean> verifyMfa(
            @PathVariable Long id,
            @RequestParam String mfaCode) {
        log.info("Verify MFA request for user ID: {}", id);
        boolean isValid = authService.verifyMfaCode(id, mfaCode);
        return ResponseEntity.ok(isValid);
    }

    @PostMapping("/users/{id}/biometric/enable")
    @Operation(summary = "Enable biometric", description = "Enable biometric authentication for a user")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<UserDto> enableBiometric(@PathVariable Long id) {
        log.info("Enable biometric request for user ID: {}", id);
        UserDto user = authService.enableBiometric(id);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/users/{id}/biometric/disable")
    @Operation(summary = "Disable biometric", description = "Disable biometric authentication for a user")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<UserDto> disableBiometric(@PathVariable Long id) {
        log.info("Disable biometric request for user ID: {}", id);
        UserDto user = authService.disableBiometric(id);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/users/{id}/password/change")
    @Operation(summary = "Change password", description = "Change user password")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<Void> changePassword(
            @PathVariable Long id,
            @RequestParam String currentPassword,
            @RequestParam String newPassword) {
        log.info("Change password request for user ID: {}", id);
        authService.changePassword(id, currentPassword, newPassword);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users/{id}/password/reset")
    @Operation(summary = "Reset password", description = "Reset user password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> resetPassword(
            @PathVariable Long id,
            @RequestParam String newPassword) {
        log.info("Reset password request for user ID: {}", id);
        authService.resetPasswordWithToken(id.toString(), newPassword);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/password/forgot")
    @Operation(summary = "Forgot password", description = "Initiate password reset process")
    public ResponseEntity<Void> forgotPassword(@RequestParam String email) {
        log.info("Forgot password request for email: {}", email);
        authService.resetPassword(email);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/password/reset/verify")
    @Operation(summary = "Verify password reset", description = "Verify password reset token")
    public ResponseEntity<Boolean> verifyPasswordReset(
            @RequestParam String token,
            @RequestParam String newPassword) {
        log.info("Verify password reset request");
        UserDto user = authService.resetPasswordWithToken(token, newPassword);
        return ResponseEntity.ok(user != null);
    }

    @PostMapping("/email/verify")
    @Operation(summary = "Verify email", description = "Verify user email address")
    public ResponseEntity<Boolean> verifyEmail(@RequestParam String token) {
        log.info("Email verification request");
        boolean success = authService.verifyEmailToken(token);
        return ResponseEntity.ok(success);
    }

    @PostMapping("/phone/verify")
    @Operation(summary = "Verify phone", description = "Verify user phone number")
    public ResponseEntity<Boolean> verifyPhone(@RequestParam String token) {
        log.info("Phone verification request");
        boolean success = authService.verifyPhoneToken(token);
        return ResponseEntity.ok(success);
    }

    @GetMapping("/sessions/{sessionId}")
    @Operation(summary = "Get session", description = "Get user session information")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Boolean> getSession(@PathVariable String sessionId) {
        log.info("Get session request for: {}", sessionId);
        boolean isValid = authService.isSessionValid(sessionId);
        return ResponseEntity.ok(isValid);
    }

    @DeleteMapping("/sessions/{sessionId}")
    @Operation(summary = "Invalidate session", description = "Invalidate a user session")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> invalidateSession(@PathVariable String sessionId) {
        log.info("Invalidate session request for: {}", sessionId);
        authService.invalidateSession(sessionId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/users/{id}/sessions")
    @Operation(summary = "Get user sessions", description = "Get all sessions for a user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<String>> getUserSessions(@PathVariable Long id) {
        log.info("Get user sessions request for ID: {}", id);
        List<String> sessions = authService.getUserSessions(id);
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get user statistics", description = "Get comprehensive user statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getUserStatistics() {
        log.info("Get user statistics request");
        Map<String, Object> statistics = authService.getUserStatistics();
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/statistics/login")
    @Operation(summary = "Get login statistics", description = "Get login activity statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getLoginStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        log.info("Get login statistics request");
        Map<String, Object> statistics = authService.getLoginStatistics(startDate, endDate);
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check authentication service health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        log.info("Health check request");
        Map<String, Object> health = authService.getServiceHealth();
        return ResponseEntity.ok(health);
    }
} 