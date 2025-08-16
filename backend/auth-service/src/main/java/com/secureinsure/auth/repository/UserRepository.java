package com.secureinsure.auth.repository;

import com.secureinsure.auth.entity.User;
import com.secureinsure.auth.entity.UserStatus;
import com.secureinsure.auth.entity.UserType;
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
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Basic CRUD operations
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByUsernameOrEmail(String username, String email);
    
    // Status-based queries
    List<User> findByStatus(UserStatus status);
    Page<User> findByStatus(UserStatus status, Pageable pageable);
    List<User> findByStatusIn(List<UserStatus> statuses);
    Page<User> findByStatusIn(List<UserStatus> statuses, Pageable pageable);
    
    // User type queries
    List<User> findByUserType(UserType userType);
    Page<User> findByUserType(UserType userType, Pageable pageable);
    List<User> findByUserTypeIn(List<UserType> userTypes);
    Page<User> findByUserTypeIn(List<UserType> userTypes, Pageable pageable);
    
    // Role-based queries
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r = :role")
    List<User> findByRole(String role);
    
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r = :role")
    Page<User> findByRole(String role, Pageable pageable);
    
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r IN :roles")
    List<User> findByRolesIn(List<String> roles);
    
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r IN :roles")
    Page<User> findByRolesIn(List<String> roles, Pageable pageable);
    
    // MFA and biometric queries
    List<User> findByMfaEnabled(Boolean mfaEnabled);
    List<User> findByBiometricEnabled(Boolean biometricEnabled);
    
    // Verification queries
    List<User> findByEmailVerified(Boolean emailVerified);
    List<User> findByPhoneVerified(Boolean phoneVerified);
    
    // Account lock queries
    List<User> findByAccountLockedUntilIsNotNull();
    List<User> findByAccountLockedUntilBefore(LocalDateTime dateTime);
    
    // Login-related queries
    List<User> findByLastLoginBefore(LocalDateTime dateTime);
    List<User> findByLastLoginIsNull();
    List<User> findByFailedLoginAttemptsGreaterThan(Integer attempts);
    
    // Password expiry queries
    List<User> findByPasswordChangedAtBefore(LocalDateTime dateTime);
    List<User> findByPasswordChangedAtIsNull();
    
    // Search queries
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<User> searchUsers(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    // Complex filter queries
    @Query("SELECT u FROM User u WHERE " +
           "(:username IS NULL OR LOWER(u.username) LIKE LOWER(CONCAT('%', :username, '%'))) AND " +
           "(:email IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
           "(:firstName IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :firstName, '%'))) AND " +
           "(:lastName IS NULL OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :lastName, '%'))) AND " +
           "(:userType IS NULL OR u.userType = :userType) AND " +
           "(:status IS NULL OR u.status = :status) AND " +
           "(:mfaEnabled IS NULL OR u.mfaEnabled = :mfaEnabled) AND " +
           "(:biometricEnabled IS NULL OR u.biometricEnabled = :biometricEnabled) AND " +
           "(:emailVerified IS NULL OR u.emailVerified = :emailVerified) AND " +
           "(:phoneVerified IS NULL OR u.phoneVerified = :phoneVerified) AND " +
           "(:createdBy IS NULL OR u.createdBy = :createdBy) AND " +
           "(:startDate IS NULL OR u.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR u.createdAt <= :endDate)")
    Page<User> findUsersByFilters(
            @Param("username") String username,
            @Param("email") String email,
            @Param("firstName") String firstName,
            @Param("lastName") String lastName,
            @Param("userType") UserType userType,
            @Param("status") UserStatus status,
            @Param("mfaEnabled") Boolean mfaEnabled,
            @Param("biometricEnabled") Boolean biometricEnabled,
            @Param("emailVerified") Boolean emailVerified,
            @Param("phoneVerified") Boolean phoneVerified,
            @Param("createdBy") Long createdBy,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );
    
    // Statistics queries
    @Query("SELECT COUNT(u) FROM User u WHERE u.status = :status")
    Long countByStatus(@Param("status") UserStatus status);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.userType = :userType")
    Long countByUserType(@Param("userType") UserType userType);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.mfaEnabled = true")
    Long countByMfaEnabled();
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.biometricEnabled = true")
    Long countByBiometricEnabled();
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.emailVerified = false")
    Long countByEmailNotVerified();
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.phoneVerified = false")
    Long countByPhoneNotVerified();
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.accountLockedUntil IS NOT NULL AND u.accountLockedUntil > CURRENT_TIMESTAMP")
    Long countLockedAccounts();
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.lastLogin < :dateTime")
    Long countInactiveUsers(@Param("dateTime") LocalDateTime dateTime);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.passwordChangedAt < :dateTime OR u.passwordChangedAt IS NULL")
    Long countUsersWithExpiredPasswords(@Param("dateTime") LocalDateTime dateTime);
    
    // Dashboard statistics
    @Query("SELECT " +
           "COUNT(u) as totalUsers, " +
           "COUNT(CASE WHEN u.status = 'ACTIVE' THEN 1 END) as activeUsers, " +
           "COUNT(CASE WHEN u.status = 'INACTIVE' THEN 1 END) as inactiveUsers, " +
           "COUNT(CASE WHEN u.status = 'SUSPENDED' THEN 1 END) as suspendedUsers, " +
           "COUNT(CASE WHEN u.mfaEnabled = true THEN 1 END) as mfaEnabledUsers, " +
           "COUNT(CASE WHEN u.biometricEnabled = true THEN 1 END) as biometricEnabledUsers, " +
           "COUNT(CASE WHEN u.emailVerified = false THEN 1 END) as unverifiedEmailUsers, " +
           "COUNT(CASE WHEN u.phoneVerified = false THEN 1 END) as unverifiedPhoneUsers, " +
           "COUNT(CASE WHEN u.accountLockedUntil IS NOT NULL AND u.accountLockedUntil > CURRENT_TIMESTAMP THEN 1 END) as lockedUsers, " +
           "COUNT(CASE WHEN u.lastLogin < :inactiveThreshold THEN 1 END) as inactiveUsers, " +
           "COUNT(CASE WHEN u.passwordChangedAt < :passwordExpiryThreshold OR u.passwordChangedAt IS NULL THEN 1 END) as expiredPasswordUsers " +
           "FROM User u")
    Object[] getUserStatistics(
            @Param("inactiveThreshold") LocalDateTime inactiveThreshold,
            @Param("passwordExpiryThreshold") LocalDateTime passwordExpiryThreshold
    );
    
    // Recent activity queries
    @Query("SELECT u FROM User u WHERE u.createdAt >= :startDate ORDER BY u.createdAt DESC")
    List<User> findRecentlyCreatedUsers(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT u FROM User u WHERE u.lastLogin >= :startDate ORDER BY u.lastLogin DESC")
    List<User> findRecentlyActiveUsers(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT u FROM User u WHERE u.updatedAt >= :startDate ORDER BY u.updatedAt DESC")
    List<User> findRecentlyUpdatedUsers(@Param("startDate") LocalDateTime startDate);
    
    // Bulk operations
    @Query("UPDATE User u SET u.status = :status WHERE u.id IN :userIds")
    int updateUserStatus(@Param("userIds") List<Long> userIds, @Param("status") UserStatus status);
    
    @Query("UPDATE User u SET u.mfaEnabled = :enabled WHERE u.id IN :userIds")
    int updateMfaStatus(@Param("userIds") List<Long> userIds, @Param("enabled") Boolean enabled);
    
    @Query("UPDATE User u SET u.biometricEnabled = :enabled WHERE u.id IN :userIds")
    int updateBiometricStatus(@Param("userIds") List<Long> userIds, @Param("enabled") Boolean enabled);
    
    // Cleanup queries
    @Query("DELETE FROM User u WHERE u.status = 'DELETED' AND u.updatedAt < :cutoffDate")
    int deleteSoftDeletedUsers(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    @Query("UPDATE User u SET u.failedLoginAttempts = 0, u.accountLockedUntil = NULL WHERE u.accountLockedUntil < CURRENT_TIMESTAMP")
    int unlockExpiredAccounts();
} 