package com.secureinsure.auth.service;

import com.secureinsure.auth.dto.LoginRequest;
import com.secureinsure.auth.dto.LoginResponse;
import com.secureinsure.auth.dto.UserDto;
import com.secureinsure.auth.entity.UserStatus;
import com.secureinsure.auth.entity.UserType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface AuthService {
    
    // Authentication operations
    LoginResponse login(LoginRequest loginRequest);
    LoginResponse loginWithMfa(String username, String mfaCode);
    LoginResponse loginWithBiometric(String username, String biometricToken);
    LoginResponse refreshToken(String refreshToken);
    void logout(String sessionId);
    void logoutAllSessions(Long userId);
    
    // User management
    UserDto createUser(UserDto userDto);
    UserDto getUserById(Long id);
    UserDto getUserByUsername(String username);
    UserDto getUserByEmail(String email);
    Page<UserDto> getAllUsers(Pageable pageable);
    UserDto updateUser(Long id, UserDto userDto);
    void deleteUser(Long id);
    
    // User search and filtering
    Page<UserDto> searchUsers(String searchTerm, Pageable pageable);
    Page<UserDto> getUsersByFilters(String username, String email, String firstName, String lastName,
                                   UserType userType, UserStatus status, Boolean mfaEnabled,
                                   Boolean biometricEnabled, Boolean emailVerified, Boolean phoneVerified,
                                   Long createdBy, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    // Status and type-based queries
    Page<UserDto> getUsersByStatus(UserStatus status, Pageable pageable);
    Page<UserDto> getUsersByType(UserType userType, Pageable pageable);
    Page<UserDto> getUsersByRole(String role, Pageable pageable);
    Page<UserDto> getUsersByRoles(List<String> roles, Pageable pageable);
    
    // Account management
    UserDto activateUser(Long userId);
    UserDto deactivateUser(Long userId);
    UserDto suspendUser(Long userId, String reason);
    UserDto unlockUser(Long userId);
    UserDto lockUser(Long userId, int lockDurationMinutes);
    
    // MFA and biometric management
    UserDto enableMfa(Long userId);
    UserDto disableMfa(Long userId);
    String generateMfaSecret(Long userId);
    boolean verifyMfaCode(Long userId, String code);
    UserDto enableBiometric(Long userId);
    UserDto disableBiometric(Long userId);
    boolean verifyBiometricToken(Long userId, String token);
    
    // Verification management
    UserDto verifyEmail(Long userId);
    UserDto verifyPhone(Long userId);
    String generateEmailVerificationToken(Long userId);
    String generatePhoneVerificationToken(Long userId);
    boolean verifyEmailToken(String token);
    boolean verifyPhoneToken(String token);
    
    // Password management
    UserDto changePassword(Long userId, String oldPassword, String newPassword);
    UserDto resetPassword(String email);
    UserDto resetPasswordWithToken(String token, String newPassword);
    String generatePasswordResetToken(String email);
    boolean isPasswordExpired(Long userId);
    Long getDaysUntilPasswordExpiry(Long userId);
    
    // Additional password reset methods
    void forgotPassword(String email);
    boolean verifyPasswordReset(String token, String newPassword);
    
    // Session management
    List<String> getUserSessions(Long userId);
    void invalidateSession(String sessionId);
    void invalidateAllSessions(Long userId);
    boolean isSessionValid(String sessionId);
    
    // Security operations
    void recordLoginAttempt(Long userId, String ipAddress, String userAgent, boolean successful, String failureReason);
    void incrementFailedLoginAttempts(Long userId);
    void resetFailedLoginAttempts(Long userId);
    boolean isAccountLocked(Long userId);
    LocalDateTime getAccountLockedUntil(Long userId);
    
    // Statistics and analytics
    Map<String, Object> getUserStatistics();
    Map<String, Object> getLoginStatistics(LocalDateTime startDate, LocalDateTime endDate);
    List<UserDto> getRecentlyCreatedUsers(int days);
    List<UserDto> getRecentlyActiveUsers(int days);
    List<UserDto> getInactiveUsers(int days);
    List<UserDto> getUsersWithExpiredPasswords();
    List<UserDto> getLockedUsers();
    List<UserDto> getUsersRequiringVerification();
    
    // Bulk operations
    int updateUserStatus(List<Long> userIds, UserStatus status);
    int enableMfaForUsers(List<Long> userIds);
    int disableMfaForUsers(List<Long> userIds);
    int enableBiometricForUsers(List<Long> userIds);
    int disableBiometricForUsers(List<Long> userIds);
    
    // Validation operations
    boolean validateUser(UserDto userDto);
    boolean validatePassword(String password);
    boolean validateEmail(String email);
    boolean validatePhone(String phone);
    boolean validateUsername(String username);
    
    // Token operations
    String generateAccessToken(Long userId);
    String generateRefreshToken(Long userId);
    boolean validateAccessToken(String token);
    boolean validateRefreshToken(String token);
    Long getUserIdFromToken(String token);
    
    // Cleanup operations
    void cleanupExpiredTokens();
    void cleanupExpiredSessions();
    void cleanupSoftDeletedUsers();
    void unlockExpiredAccounts();
    
    // Health checks
    boolean isServiceHealthy();
    Map<String, Object> getServiceHealth();
} 