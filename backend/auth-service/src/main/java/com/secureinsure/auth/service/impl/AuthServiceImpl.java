package com.secureinsure.auth.service.impl;

import com.secureinsure.auth.dto.LoginRequest;
import com.secureinsure.auth.dto.LoginResponse;
import com.secureinsure.auth.dto.UserDto;
import com.secureinsure.auth.entity.User;
import com.secureinsure.auth.entity.UserStatus;
import com.secureinsure.auth.entity.UserType;
import com.secureinsure.auth.repository.UserRepository;
import com.secureinsure.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public LoginResponse login(LoginRequest loginRequest) {
        log.info("Login attempt for user: {}", loginRequest.getUsername());
        
        try {
            // Find user by username or email
            Optional<User> userOpt = userRepository.findByUsernameOrEmail(
                loginRequest.getUsername(), loginRequest.getUsername());
            
            if (userOpt.isEmpty()) {
                log.warn("Login failed: User not found - {}", loginRequest.getUsername());
                return LoginResponse.builder()
                    .success(false)
                    .errorMessage("Invalid credentials")
                    .build();
            }
            
            User user = userOpt.get();
            
            // Check if account is locked
            if (user.isLocked()) {
                log.warn("Login failed: Account locked - {}", user.getUsername());
                return LoginResponse.builder()
                    .success(false)
                    .errorMessage("Account is locked")
                    .build();
            }
            
            // Check if account is active
            if (!user.isEnabled()) {
                log.warn("Login failed: Account not active - {}", user.getUsername());
                return LoginResponse.builder()
                    .success(false)
                    .errorMessage("Account is not active")
                    .build();
            }
            
            // Verify password
            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                user.incrementFailedLoginAttempts();
                userRepository.save(user);
                log.warn("Login failed: Invalid password - {}", user.getUsername());
                return LoginResponse.builder()
                    .success(false)
                    .errorMessage("Invalid credentials")
                    .build();
            }
            
            // Reset failed login attempts
            user.resetFailedLoginAttempts();
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
            
            // Generate tokens
            String accessToken = generateAccessToken(user.getId());
            String refreshToken = generateRefreshToken(user.getId());
            
            // Build response
            LoginResponse response = LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .accessTokenExpiresAt(LocalDateTime.now().plusHours(1))
                .refreshTokenExpiresAt(LocalDateTime.now().plusDays(30))
                .user(convertToDto(user))
                .roles(user.getRoles())
                .mfaRequired(user.isMfaEnabled())
                .biometricRequired(user.isBiometricEnabled())
                .emailVerificationRequired(!user.isEmailVerified())
                .phoneVerificationRequired(!user.isPhoneVerified())
                .passwordChangeRequired(isPasswordExpired(user.getId()))
                .sessionId(UUID.randomUUID().toString())
                .lastLogin(user.getLastLogin())
                .success(true)
                .build();
            
            log.info("Login successful for user: {}", user.getUsername());
            return response;
            
        } catch (Exception e) {
            log.error("Login error for user: {}", loginRequest.getUsername(), e);
            return LoginResponse.builder()
                .success(false)
                .errorMessage("Login failed due to system error")
                .build();
        }
    }

    @Override
    public LoginResponse loginWithMfa(String username, String mfaCode) {
        log.info("MFA login attempt for user: {}", username);
        
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return LoginResponse.builder()
                .success(false)
                .errorMessage("User not found")
                .build();
        }
        
        User user = userOpt.get();
        if (!user.isMfaEnabled()) {
            return LoginResponse.builder()
                .success(false)
                .errorMessage("MFA not enabled for user")
                .build();
        }
        
        if (!verifyMfaCode(user.getId(), mfaCode)) {
            return LoginResponse.builder()
                .success(false)
                .errorMessage("Invalid MFA code")
                .build();
        }
        
        // Generate tokens and return response
        String accessToken = generateAccessToken(user.getId());
        String refreshToken = generateRefreshToken(user.getId());
        
        return LoginResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .accessTokenExpiresAt(LocalDateTime.now().plusHours(1))
            .refreshTokenExpiresAt(LocalDateTime.now().plusDays(30))
            .user(convertToDto(user))
            .roles(user.getRoles())
            .success(true)
            .build();
    }

    @Override
    public LoginResponse loginWithBiometric(String username, String biometricToken) {
        log.info("Biometric login attempt for user: {}", username);
        
        // Simplified biometric verification
        if (biometricToken == null || biometricToken.isEmpty()) {
            return LoginResponse.builder()
                .success(false)
                .errorMessage("Invalid biometric token")
                .build();
        }
        
        // In a real implementation, you would verify the biometric token
        // For now, we'll return a generic response
        return LoginResponse.builder()
            .success(false)
            .errorMessage("Biometric authentication not implemented")
            .build();
    }

    @Override
    public LoginResponse refreshToken(String refreshToken) {
        log.info("Token refresh attempt");
        
        if (!validateRefreshToken(refreshToken)) {
            return LoginResponse.builder()
                .success(false)
                .errorMessage("Invalid refresh token")
                .build();
        }
        
        Long userId = getUserIdFromToken(refreshToken);
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isEmpty()) {
            return LoginResponse.builder()
                .success(false)
                .errorMessage("User not found")
                .build();
        }
        
        User user = userOpt.get();
        String newAccessToken = generateAccessToken(user.getId());
        String newRefreshToken = generateRefreshToken(user.getId());
        
        return LoginResponse.builder()
            .accessToken(newAccessToken)
            .refreshToken(newRefreshToken)
            .accessTokenExpiresAt(LocalDateTime.now().plusHours(1))
            .refreshTokenExpiresAt(LocalDateTime.now().plusDays(30))
            .user(convertToDto(user))
            .roles(user.getRoles())
            .success(true)
            .build();
    }

    @Override
    public void logout(String sessionId) {
        log.info("Logout for session: {}", sessionId);
        // In a real implementation, you would invalidate the session
    }

    @Override
    public void logoutAllSessions(Long userId) {
        log.info("Logout all sessions for user: {}", userId);
        // In a real implementation, you would invalidate all sessions for the user
    }

    @Override
    public UserDto createUser(UserDto userDto) {
        log.info("Creating user: {}", userDto.getUsername());
        
        // Validate user data
        if (!validateUser(userDto)) {
            throw new IllegalArgumentException("Invalid user data");
        }
        
        // Check if username or email already exists
        if (userRepository.findByUsername(userDto.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }
        
        if (userRepository.findByEmail(userDto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }
        
        // Create user entity
        User user = User.builder()
            .username(userDto.getUsername())
            .email(userDto.getEmail())
            .password(passwordEncoder.encode(userDto.getPassword()))
            .firstName(userDto.getFirstName())
            .lastName(userDto.getLastName())
            .phoneNumber(userDto.getPhoneNumber())
            .userType(userDto.getUserType())
            .status(UserStatus.PENDING)
            .roles(userDto.getRoles() != null ? userDto.getRoles() : List.of("USER"))
            .mfaEnabled(false)
            .biometricEnabled(false)
            .emailVerified(false)
            .phoneVerified(false)
            .timezone(userDto.getTimezone() != null ? userDto.getTimezone() : "UTC")
            .language(userDto.getLanguage() != null ? userDto.getLanguage() : "en")
            .passwordChangedAt(LocalDateTime.now())
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        
        User savedUser = userRepository.save(user);
        log.info("User created successfully: {}", savedUser.getUsername());
        
        return convertToDto(savedUser);
    }

    @Override
    public UserDto getUserById(Long id) {
        log.info("Getting user by ID: {}", id);
        
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        return convertToDto(userOpt.get());
    }

    @Override
    public UserDto getUserByUsername(String username) {
        log.info("Getting user by username: {}", username);
        
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        return convertToDto(userOpt.get());
    }

    @Override
    public UserDto getUserByEmail(String email) {
        log.info("Getting user by email: {}", email);
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        return convertToDto(userOpt.get());
    }

    @Override
    public Page<UserDto> getAllUsers(Pageable pageable) {
        log.info("Getting all users");
        
        Page<User> users = userRepository.findAll(pageable);
        return users.map(this::convertToDto);
    }

    @Override
    public UserDto updateUser(Long id, UserDto userDto) {
        log.info("Updating user: {}", id);
        
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        
        // Update fields
        if (userDto.getFirstName() != null) user.setFirstName(userDto.getFirstName());
        if (userDto.getLastName() != null) user.setLastName(userDto.getLastName());
        if (userDto.getPhoneNumber() != null) user.setPhoneNumber(userDto.getPhoneNumber());
        if (userDto.getUserType() != null) user.setUserType(userDto.getUserType());
        if (userDto.getStatus() != null) user.setStatus(userDto.getStatus());
        if (userDto.getRoles() != null) user.setRoles(userDto.getRoles());
        if (userDto.getTimezone() != null) user.setTimezone(userDto.getTimezone());
        if (userDto.getLanguage() != null) user.setLanguage(userDto.getLanguage());
        if (userDto.getPreferences() != null) user.setPreferences(userDto.getPreferences());
        if (userDto.getProfilePictureUrl() != null) user.setProfilePictureUrl(userDto.getProfilePictureUrl());
        
        user.setUpdatedAt(LocalDateTime.now());
        user.setUpdatedBy(userDto.getUpdatedBy());
        
        User savedUser = userRepository.save(user);
        log.info("User updated successfully: {}", savedUser.getUsername());
        
        return convertToDto(savedUser);
    }

    @Override
    public void deleteUser(Long id) {
        log.info("Deleting user: {}", id);
        
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        user.setStatus(UserStatus.DELETED);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        log.info("User deleted successfully: {}", user.getUsername());
    }

    @Override
    public Page<UserDto> searchUsers(String searchTerm, Pageable pageable) {
        log.info("Searching users with term: {}", searchTerm);
        
        Page<User> users = userRepository.searchUsers(searchTerm, pageable);
        return users.map(this::convertToDto);
    }

    @Override
    public Page<UserDto> getUsersByFilters(String username, String email, String firstName, String lastName,
                                         UserType userType, UserStatus status, Boolean mfaEnabled,
                                         Boolean biometricEnabled, Boolean emailVerified, Boolean phoneVerified,
                                         Long createdBy, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        log.info("Getting users by filters");
        
        Page<User> users = userRepository.findUsersByFilters(
            username, email, firstName, lastName, userType, status, mfaEnabled,
            biometricEnabled, emailVerified, phoneVerified, createdBy, startDate, endDate, pageable);
        
        return users.map(this::convertToDto);
    }

    @Override
    public Page<UserDto> getUsersByStatus(UserStatus status, Pageable pageable) {
        log.info("Getting users by status: {}", status);
        
        Page<User> users = userRepository.findByStatus(status, pageable);
        return users.map(this::convertToDto);
    }

    @Override
    public Page<UserDto> getUsersByType(UserType userType, Pageable pageable) {
        log.info("Getting users by type: {}", userType);
        
        Page<User> users = userRepository.findByUserType(userType, pageable);
        return users.map(this::convertToDto);
    }

    @Override
    public Page<UserDto> getUsersByRole(String role, Pageable pageable) {
        log.info("Getting users by role: {}", role);
        
        Page<User> users = userRepository.findByRole(role, pageable);
        return users.map(this::convertToDto);
    }

    @Override
    public Page<UserDto> getUsersByRoles(List<String> roles, Pageable pageable) {
        log.info("Getting users by roles: {}", roles);
        
        Page<User> users = userRepository.findByRolesIn(roles, pageable);
        return users.map(this::convertToDto);
    }

    @Override
    public UserDto activateUser(Long userId) {
        log.info("Activating user: {}", userId);
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        user.setStatus(UserStatus.ACTIVE);
        user.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        log.info("User activated successfully: {}", savedUser.getUsername());
        
        return convertToDto(savedUser);
    }

    @Override
    public UserDto deactivateUser(Long userId) {
        log.info("Deactivating user: {}", userId);
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        user.setStatus(UserStatus.INACTIVE);
        user.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        log.info("User deactivated successfully: {}", savedUser.getUsername());
        
        return convertToDto(savedUser);
    }

    @Override
    public UserDto suspendUser(Long userId, String reason) {
        log.info("Suspending user: {} - Reason: {}", userId, reason);
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        user.setStatus(UserStatus.SUSPENDED);
        user.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        log.info("User suspended successfully: {}", savedUser.getUsername());
        
        return convertToDto(savedUser);
    }

    @Override
    public UserDto unlockUser(Long userId) {
        log.info("Unlocking user: {}", userId);
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        user.resetFailedLoginAttempts();
        user.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        log.info("User unlocked successfully: {}", savedUser.getUsername());
        
        return convertToDto(savedUser);
    }

    @Override
    public UserDto lockUser(Long userId, int lockDurationMinutes) {
        log.info("Locking user: {} for {} minutes", userId, lockDurationMinutes);
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        user.lockAccount(lockDurationMinutes);
        user.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        log.info("User locked successfully: {}", savedUser.getUsername());
        
        return convertToDto(savedUser);
    }

    @Override
    public UserDto enableMfa(Long userId) {
        log.info("Enabling MFA for user: {}", userId);
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        user.setMfaEnabled(true);
        user.setMfaSecret(generateMfaSecret(userId));
        user.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        log.info("MFA enabled successfully for user: {}", savedUser.getUsername());
        
        return convertToDto(savedUser);
    }

    @Override
    public UserDto disableMfa(Long userId) {
        log.info("Disabling MFA for user: {}", userId);
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        user.setMfaEnabled(false);
        user.setMfaSecret(null);
        user.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        log.info("MFA disabled successfully for user: {}", savedUser.getUsername());
        
        return convertToDto(savedUser);
    }

    @Override
    public String generateMfaSecret(Long userId) {
        // Generate a random 32-character secret for TOTP
        return UUID.randomUUID().toString().replace("-", "").substring(0, 32);
    }

    @Override
    public boolean verifyMfaCode(Long userId, String code) {
        // Simplified MFA verification
        // In a real implementation, you would use a TOTP library
        return code != null && code.length() == 6 && code.matches("\\d{6}");
    }

    @Override
    public UserDto enableBiometric(Long userId) {
        log.info("Enabling biometric for user: {}", userId);
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        user.setBiometricEnabled(true);
        user.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        log.info("Biometric enabled successfully for user: {}", savedUser.getUsername());
        
        return convertToDto(savedUser);
    }

    @Override
    public UserDto disableBiometric(Long userId) {
        log.info("Disabling biometric for user: {}", userId);
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        user.setBiometricEnabled(false);
        user.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        log.info("Biometric disabled successfully for user: {}", savedUser.getUsername());
        
        return convertToDto(savedUser);
    }

    @Override
    public boolean verifyBiometricToken(Long userId, String token) {
        // Simplified biometric verification
        return token != null && !token.isEmpty();
    }

    @Override
    public UserDto verifyEmail(Long userId) {
        log.info("Verifying email for user: {}", userId);
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        user.setEmailVerified(true);
        user.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        log.info("Email verified successfully for user: {}", savedUser.getUsername());
        
        return convertToDto(savedUser);
    }

    @Override
    public UserDto verifyPhone(Long userId) {
        log.info("Verifying phone for user: {}", userId);
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        user.setPhoneVerified(true);
        user.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        log.info("Phone verified successfully for user: {}", savedUser.getUsername());
        
        return convertToDto(savedUser);
    }

    @Override
    public String generateEmailVerificationToken(Long userId) {
        return UUID.randomUUID().toString();
    }

    @Override
    public String generatePhoneVerificationToken(Long userId) {
        // Generate a 6-digit code
        return String.format("%06d", new Random().nextInt(1000000));
    }

    @Override
    public boolean verifyEmailToken(String token) {
        // Simplified email token verification
        return token != null && !token.isEmpty();
    }

    @Override
    public boolean verifyPhoneToken(String token) {
        // Simplified phone token verification
        return token != null && token.matches("\\d{6}");
    }

    @Override
    public UserDto changePassword(Long userId, String oldPassword, String newPassword) {
        log.info("Changing password for user: {}", userId);
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        
        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Invalid old password");
        }
        
        // Validate new password
        if (!validatePassword(newPassword)) {
            throw new RuntimeException("Invalid new password");
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordChangedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        log.info("Password changed successfully for user: {}", savedUser.getUsername());
        
        return convertToDto(savedUser);
    }

    @Override
    public UserDto resetPassword(String email) {
        log.info("Resetting password for email: {}", email);
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        // Generate reset token and send email
        String resetToken = generatePasswordResetToken(email);
        
        // In a real implementation, you would send an email with the reset token
        log.info("Password reset token generated: {}", resetToken);
        
        return convertToDto(userOpt.get());
    }

    @Override
    public UserDto resetPasswordWithToken(String token, String newPassword) {
        log.info("Resetting password with token");
        
        // In a real implementation, you would validate the token
        // For now, we'll return null to indicate not implemented
        return null;
    }

    @Override
    public void forgotPassword(String email) {
        log.info("Forgot password request for email: {}", email);
        // In a real implementation, you would send a password reset email
    }

    @Override
    public boolean verifyPasswordReset(String token, String newPassword) {
        log.info("Verifying password reset token");
        // In a real implementation, you would validate the token and update the password
        return false;
    }

    @Override
    public String generatePasswordResetToken(String email) {
        return UUID.randomUUID().toString();
    }

    @Override
    public boolean isPasswordExpired(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return false;
        }
        
        User user = userOpt.get();
        if (user.getPasswordChangedAt() == null) {
            return true;
        }
        
        // Password expires after 90 days
        return user.getPasswordChangedAt().plusDays(90).isBefore(LocalDateTime.now());
    }

    @Override
    public Long getDaysUntilPasswordExpiry(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return 0L;
        }
        
        User user = userOpt.get();
        if (user.getPasswordChangedAt() == null) {
            return 0L;
        }
        
        LocalDateTime expiryDate = user.getPasswordChangedAt().plusDays(90);
        return ChronoUnit.DAYS.between(LocalDateTime.now(), expiryDate);
    }

    @Override
    public List<String> getUserSessions(Long userId) {
        // Simplified session management
        return List.of();
    }

    @Override
    public void invalidateSession(String sessionId) {
        log.info("Invalidating session: {}", sessionId);
    }

    @Override
    public void invalidateAllSessions(Long userId) {
        log.info("Invalidating all sessions for user: {}", userId);
    }

    @Override
    public boolean isSessionValid(String sessionId) {
        // Simplified session validation
        return sessionId != null && !sessionId.isEmpty();
    }

    @Override
    public void recordLoginAttempt(Long userId, String ipAddress, String userAgent, boolean successful, String failureReason) {
        log.info("Recording login attempt for user: {} - Success: {} - IP: {}", userId, successful, ipAddress);
    }

    @Override
    public void incrementFailedLoginAttempts(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.incrementFailedLoginAttempts();
            userRepository.save(user);
        }
    }

    @Override
    public void resetFailedLoginAttempts(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.resetFailedLoginAttempts();
            userRepository.save(user);
        }
    }

    @Override
    public boolean isAccountLocked(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        return userOpt.map(User::isLocked).orElse(false);
    }

    @Override
    public LocalDateTime getAccountLockedUntil(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        return userOpt.map(User::getAccountLockedUntil).orElse(null);
    }

    @Override
    public Map<String, Object> getUserStatistics() {
        log.info("Getting user statistics");
        
        LocalDateTime inactiveThreshold = LocalDateTime.now().minusDays(30);
        LocalDateTime passwordExpiryThreshold = LocalDateTime.now().minusDays(90);
        
        Object[] stats = userRepository.getUserStatistics(inactiveThreshold, passwordExpiryThreshold);
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalUsers", stats[0]);
        statistics.put("activeUsers", stats[1]);
        statistics.put("inactiveUsers", stats[2]);
        statistics.put("suspendedUsers", stats[3]);
        statistics.put("mfaEnabledUsers", stats[4]);
        statistics.put("biometricEnabledUsers", stats[5]);
        statistics.put("unverifiedEmailUsers", stats[6]);
        statistics.put("unverifiedPhoneUsers", stats[7]);
        statistics.put("lockedUsers", stats[8]);
        statistics.put("inactiveUsers", stats[9]);
        statistics.put("expiredPasswordUsers", stats[10]);
        
        return statistics;
    }

    @Override
    public Map<String, Object> getLoginStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting login statistics from {} to {}", startDate, endDate);
        
        // Simplified login statistics
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalLogins", 0L);
        statistics.put("successfulLogins", 0L);
        statistics.put("failedLogins", 0L);
        statistics.put("uniqueUsers", 0L);
        
        return statistics;
    }

    @Override
    public List<UserDto> getRecentlyCreatedUsers(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<User> users = userRepository.findRecentlyCreatedUsers(startDate);
        return users.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<UserDto> getRecentlyActiveUsers(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<User> users = userRepository.findRecentlyActiveUsers(startDate);
        return users.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<UserDto> getInactiveUsers(int days) {
        LocalDateTime threshold = LocalDateTime.now().minusDays(days);
        List<User> users = userRepository.findByLastLoginBefore(threshold);
        return users.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<UserDto> getUsersWithExpiredPasswords() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(90);
        List<User> users = userRepository.findByPasswordChangedAtBefore(threshold);
        return users.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<UserDto> getLockedUsers() {
        List<User> users = userRepository.findByAccountLockedUntilIsNotNull();
        return users.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<UserDto> getUsersRequiringVerification() {
        List<User> users = userRepository.findByEmailVerified(false);
        users.addAll(userRepository.findByPhoneVerified(false));
        return users.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public int updateUserStatus(List<Long> userIds, UserStatus status) {
        return userRepository.updateUserStatus(userIds, status);
    }

    @Override
    public int enableMfaForUsers(List<Long> userIds) {
        return userRepository.updateMfaStatus(userIds, true);
    }

    @Override
    public int disableMfaForUsers(List<Long> userIds) {
        return userRepository.updateMfaStatus(userIds, false);
    }

    @Override
    public int enableBiometricForUsers(List<Long> userIds) {
        return userRepository.updateBiometricStatus(userIds, true);
    }

    @Override
    public int disableBiometricForUsers(List<Long> userIds) {
        return userRepository.updateBiometricStatus(userIds, false);
    }

    @Override
    public boolean validateUser(UserDto userDto) {
        return userDto != null &&
               userDto.getUsername() != null &&
               userDto.getEmail() != null &&
               userDto.getPassword() != null &&
               userDto.getFirstName() != null &&
               userDto.getLastName() != null &&
               userDto.getUserType() != null;
    }

    @Override
    public boolean validatePassword(String password) {
        return password != null &&
               password.length() >= 8 &&
               password.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$");
    }

    @Override
    public boolean validateEmail(String email) {
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }

    @Override
    public boolean validatePhone(String phone) {
        return phone != null && phone.matches("^\\+?[1-9]\\d{1,14}$");
    }

    @Override
    public boolean validateUsername(String username) {
        return username != null &&
               username.length() >= 3 &&
               username.length() <= 50 &&
               username.matches("^[a-zA-Z0-9_]+$");
    }

    @Override
    public String generateAccessToken(Long userId) {
        // Simplified token generation
        return "access_token_" + userId + "_" + System.currentTimeMillis();
    }

    @Override
    public String generateRefreshToken(Long userId) {
        // Simplified token generation
        return "refresh_token_" + userId + "_" + System.currentTimeMillis();
    }

    @Override
    public boolean validateAccessToken(String token) {
        // Simplified token validation
        return token != null && token.startsWith("access_token_");
    }

    @Override
    public boolean validateRefreshToken(String token) {
        // Simplified token validation
        return token != null && token.startsWith("refresh_token_");
    }

    @Override
    public Long getUserIdFromToken(String token) {
        // Simplified token parsing
        if (token == null || !token.contains("_")) {
            return null;
        }
        
        try {
            String[] parts = token.split("_");
            if (parts.length >= 3) {
                return Long.parseLong(parts[2]);
            }
        } catch (NumberFormatException e) {
            log.warn("Invalid token format: {}", token);
        }
        
        return null;
    }

    @Override
    public void cleanupExpiredTokens() {
        log.info("Cleaning up expired tokens");
    }

    @Override
    public void cleanupExpiredSessions() {
        log.info("Cleaning up expired sessions");
    }

    @Override
    public void cleanupSoftDeletedUsers() {
        log.info("Cleaning up soft deleted users");
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        int deletedCount = userRepository.deleteSoftDeletedUsers(cutoffDate);
        log.info("Deleted {} soft deleted users", deletedCount);
    }

    @Override
    public void unlockExpiredAccounts() {
        log.info("Unlocking expired accounts");
        int unlockedCount = userRepository.unlockExpiredAccounts();
        log.info("Unlocked {} expired accounts", unlockedCount);
    }

    @Override
    public boolean isServiceHealthy() {
        try {
            userRepository.count();
            return true;
        } catch (Exception e) {
            log.error("Service health check failed", e);
            return false;
        }
    }

    @Override
    public Map<String, Object> getServiceHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", isServiceHealthy() ? "UP" : "DOWN");
        health.put("timestamp", LocalDateTime.now());
        health.put("database", "UP");
        return health;
    }

    // Helper methods
    private UserDto convertToDto(User user) {
        return UserDto.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .phoneNumber(user.getPhoneNumber())
            .userType(user.getUserType())
            .status(user.getStatus())
            .roles(user.getRoles())
            .mfaEnabled(user.isMfaEnabled())
            .biometricEnabled(user.isBiometricEnabled())
            .lastLogin(user.getLastLogin())
            .failedLoginAttempts(user.getFailedLoginAttempts())
            .accountLockedUntil(user.getAccountLockedUntil())
            .passwordChangedAt(user.getPasswordChangedAt())
            .emailVerified(user.isEmailVerified())
            .phoneVerified(user.isPhoneVerified())
            .profilePictureUrl(user.getProfilePictureUrl())
            .timezone(user.getTimezone())
            .language(user.getLanguage())
            .preferences(user.getPreferences())
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .createdBy(user.getCreatedBy())
            .updatedBy(user.getUpdatedBy())
            .fullName(user.getFullName())
            .isLocked(user.isLocked())
            .isActive(user.isEnabled())
            .daysUntilPasswordExpiry(getDaysUntilPasswordExpiry(user.getId()))
            .build();
    }
} 