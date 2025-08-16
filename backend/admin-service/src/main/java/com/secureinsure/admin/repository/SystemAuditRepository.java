package com.secureinsure.admin.repository;

import com.secureinsure.admin.entity.SystemAudit;
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
public interface SystemAuditRepository extends JpaRepository<SystemAudit, Long> {

    Optional<SystemAudit> findByAuditId(String auditId);

    List<SystemAudit> findByUserId(Long userId);

    List<SystemAudit> findByUsername(String username);

    List<SystemAudit> findByAction(String action);

    List<SystemAudit> findByEntityType(String entityType);

    List<SystemAudit> findByEntityId(Long entityId);

    List<SystemAudit> findBySuccess(Boolean success);

    List<SystemAudit> findByIpAddress(String ipAddress);

    List<SystemAudit> findBySessionId(String sessionId);

    List<SystemAudit> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    List<SystemAudit> findByUserIdAndCreatedAtBetween(Long userId, LocalDateTime startDate, LocalDateTime endDate);

    List<SystemAudit> findByActionAndCreatedAtBetween(String action, LocalDateTime startDate, LocalDateTime endDate);

    List<SystemAudit> findByEntityTypeAndCreatedAtBetween(String entityType, LocalDateTime startDate, LocalDateTime endDate);

    List<SystemAudit> findBySuccessAndCreatedAtBetween(Boolean success, LocalDateTime startDate, LocalDateTime endDate);

    List<SystemAudit> findByIpAddressAndCreatedAtBetween(String ipAddress, LocalDateTime startDate, LocalDateTime endDate);

    // Paginated queries
    Page<SystemAudit> findByUserId(Long userId, Pageable pageable);

    Page<SystemAudit> findByUsername(String username, Pageable pageable);

    Page<SystemAudit> findByAction(String action, Pageable pageable);

    Page<SystemAudit> findByEntityType(String entityType, Pageable pageable);

    Page<SystemAudit> findBySuccess(Boolean success, Pageable pageable);

    Page<SystemAudit> findByIpAddress(String ipAddress, Pageable pageable);

    Page<SystemAudit> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    // Complex search with filters
    @Query("SELECT sa FROM SystemAudit sa WHERE " +
           "(:userId IS NULL OR sa.userId = :userId) AND " +
           "(:username IS NULL OR LOWER(sa.username) LIKE LOWER(CONCAT('%', :username, '%'))) AND " +
           "(:action IS NULL OR sa.action = :action) AND " +
           "(:entityType IS NULL OR sa.entityType = :entityType) AND " +
           "(:entityId IS NULL OR sa.entityId = :entityId) AND " +
           "(:success IS NULL OR sa.success = :success) AND " +
           "(:ipAddress IS NULL OR LOWER(sa.ipAddress) LIKE LOWER(CONCAT('%', :ipAddress, '%'))) AND " +
           "(:sessionId IS NULL OR sa.sessionId = :sessionId) AND " +
           "(:startDate IS NULL OR sa.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR sa.createdAt <= :endDate)")
    Page<SystemAudit> findAuditsByFilters(
            @Param("userId") Long userId,
            @Param("username") String username,
            @Param("action") String action,
            @Param("entityType") String entityType,
            @Param("entityId") Long entityId,
            @Param("success") Boolean success,
            @Param("ipAddress") String ipAddress,
            @Param("sessionId") String sessionId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    // Statistics queries
    @Query("SELECT COUNT(sa) FROM SystemAudit sa WHERE sa.success = true")
    Long countSuccessfulAudits();

    @Query("SELECT COUNT(sa) FROM SystemAudit sa WHERE sa.success = false")
    Long countFailedAudits();

    @Query("SELECT COUNT(sa) FROM SystemAudit sa WHERE sa.action = :action")
    Long countByAction(@Param("action") String action);

    @Query("SELECT COUNT(sa) FROM SystemAudit sa WHERE sa.entityType = :entityType")
    Long countByEntityType(@Param("entityType") String entityType);

    @Query("SELECT COUNT(sa) FROM SystemAudit sa WHERE sa.userId = :userId")
    Long countByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(sa) FROM SystemAudit sa WHERE sa.ipAddress = :ipAddress")
    Long countByIpAddress(@Param("ipAddress") String ipAddress);

    @Query("SELECT COUNT(sa) FROM SystemAudit sa WHERE sa.createdAt BETWEEN :startDate AND :endDate")
    Long countByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(sa) FROM SystemAudit sa WHERE sa.userId = :userId AND sa.createdAt BETWEEN :startDate AND :endDate")
    Long countByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(sa) FROM SystemAudit sa WHERE sa.action = :action AND sa.createdAt BETWEEN :startDate AND :endDate")
    Long countByActionAndDateRange(@Param("action") String action, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Performance metrics
    @Query("SELECT AVG(sa.executionTimeMs) FROM SystemAudit sa WHERE sa.executionTimeMs IS NOT NULL")
    Double getAverageExecutionTime();

    @Query("SELECT AVG(sa.executionTimeMs) FROM SystemAudit sa WHERE sa.action = :action AND sa.executionTimeMs IS NOT NULL")
    Double getAverageExecutionTimeByAction(@Param("action") String action);

    @Query("SELECT MAX(sa.executionTimeMs) FROM SystemAudit sa WHERE sa.executionTimeMs IS NOT NULL")
    Long getMaxExecutionTime();

    @Query("SELECT MIN(sa.executionTimeMs) FROM SystemAudit sa WHERE sa.executionTimeMs IS NOT NULL")
    Long getMinExecutionTime();

    // Top queries
    @Query("SELECT sa.action, COUNT(sa) FROM SystemAudit sa GROUP BY sa.action ORDER BY COUNT(sa) DESC")
    List<Object[]> getTopActions();

    @Query("SELECT sa.entityType, COUNT(sa) FROM SystemAudit sa GROUP BY sa.entityType ORDER BY COUNT(sa) DESC")
    List<Object[]> getTopEntityTypes();

    @Query("SELECT sa.username, COUNT(sa) FROM SystemAudit sa GROUP BY sa.username ORDER BY COUNT(sa) DESC")
    List<Object[]> getTopUsers();

    @Query("SELECT sa.ipAddress, COUNT(sa) FROM SystemAudit sa GROUP BY sa.ipAddress ORDER BY COUNT(sa) DESC")
    List<Object[]> getTopIpAddresses();

    // Error analysis
    @Query("SELECT sa.errorMessage, COUNT(sa) FROM SystemAudit sa WHERE sa.success = false GROUP BY sa.errorMessage ORDER BY COUNT(sa) DESC")
    List<Object[]> getTopErrors();

    // Cleanup queries
    @Query("DELETE FROM SystemAudit sa WHERE sa.createdAt < :cutoffDate")
    void deleteAuditsOlderThan(@Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("SELECT COUNT(sa) FROM SystemAudit sa WHERE sa.createdAt < :cutoffDate")
    Long countAuditsOlderThan(@Param("cutoffDate") LocalDateTime cutoffDate);
} 