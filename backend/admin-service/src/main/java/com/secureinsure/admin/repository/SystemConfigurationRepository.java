package com.secureinsure.admin.repository;

import com.secureinsure.admin.entity.SystemConfiguration;
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
public interface SystemConfigurationRepository extends JpaRepository<SystemConfiguration, Long> {

    Optional<SystemConfiguration> findByConfigKey(String configKey);

    List<SystemConfiguration> findByCategory(String category);

    List<SystemConfiguration> findByConfigType(String configType);

    List<SystemConfiguration> findByEnvironment(String environment);

    List<SystemConfiguration> findByIsEncrypted(Boolean isEncrypted);

    List<SystemConfiguration> findByIsSensitive(Boolean isSensitive);

    List<SystemConfiguration> findByIsReadonly(Boolean isReadonly);

    List<SystemConfiguration> findByVersion(String version);

    List<SystemConfiguration> findByCreatedBy(Long createdBy);

    List<SystemConfiguration> findByUpdatedBy(Long updatedBy);

    List<SystemConfiguration> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    List<SystemConfiguration> findByUpdatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Paginated queries
    Page<SystemConfiguration> findByCategory(String category, Pageable pageable);

    Page<SystemConfiguration> findByConfigType(String configType, Pageable pageable);

    Page<SystemConfiguration> findByEnvironment(String environment, Pageable pageable);

    Page<SystemConfiguration> findByIsEncrypted(Boolean isEncrypted, Pageable pageable);

    Page<SystemConfiguration> findByIsSensitive(Boolean isSensitive, Pageable pageable);

    Page<SystemConfiguration> findByIsReadonly(Boolean isReadonly, Pageable pageable);

    // Complex search with filters
    @Query("SELECT sc FROM SystemConfiguration sc WHERE " +
           "(:configKey IS NULL OR LOWER(sc.configKey) LIKE LOWER(CONCAT('%', :configKey, '%'))) AND " +
           "(:configValue IS NULL OR LOWER(sc.configValue) LIKE LOWER(CONCAT('%', :configValue, '%'))) AND " +
           "(:configType IS NULL OR sc.configType = :configType) AND " +
           "(:category IS NULL OR sc.category = :category) AND " +
           "(:isEncrypted IS NULL OR sc.isEncrypted = :isEncrypted) AND " +
           "(:isSensitive IS NULL OR sc.isSensitive = :isSensitive) AND " +
           "(:isReadonly IS NULL OR sc.isReadonly = :isReadonly) AND " +
           "(:environment IS NULL OR sc.environment = :environment) AND " +
           "(:version IS NULL OR sc.version = :version) AND " +
           "(:createdBy IS NULL OR sc.createdBy = :createdBy) AND " +
           "(:startDate IS NULL OR sc.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR sc.createdAt <= :endDate)")
    Page<SystemConfiguration> findConfigurationsByFilters(
            @Param("configKey") String configKey,
            @Param("configValue") String configValue,
            @Param("configType") String configType,
            @Param("category") String category,
            @Param("isEncrypted") Boolean isEncrypted,
            @Param("isSensitive") Boolean isSensitive,
            @Param("isReadonly") Boolean isReadonly,
            @Param("environment") String environment,
            @Param("version") String version,
            @Param("createdBy") Long createdBy,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    // Statistics queries
    @Query("SELECT COUNT(sc) FROM SystemConfiguration sc WHERE sc.isEncrypted = true")
    Long countEncryptedConfigurations();

    @Query("SELECT COUNT(sc) FROM SystemConfiguration sc WHERE sc.isSensitive = true")
    Long countSensitiveConfigurations();

    @Query("SELECT COUNT(sc) FROM SystemConfiguration sc WHERE sc.isReadonly = true")
    Long countReadonlyConfigurations();

    @Query("SELECT COUNT(sc) FROM SystemConfiguration sc WHERE sc.category = :category")
    Long countByCategory(@Param("category") String category);

    @Query("SELECT COUNT(sc) FROM SystemConfiguration sc WHERE sc.configType = :configType")
    Long countByConfigType(@Param("configType") String configType);

    @Query("SELECT COUNT(sc) FROM SystemConfiguration sc WHERE sc.environment = :environment")
    Long countByEnvironment(@Param("environment") String environment);

    @Query("SELECT COUNT(sc) FROM SystemConfiguration sc WHERE sc.version = :version")
    Long countByVersion(@Param("version") String version);

    @Query("SELECT COUNT(sc) FROM SystemConfiguration sc WHERE sc.createdBy = :createdBy")
    Long countByCreatedBy(@Param("createdBy") Long createdBy);

    @Query("SELECT COUNT(sc) FROM SystemConfiguration sc WHERE sc.updatedBy = :updatedBy")
    Long countByUpdatedBy(@Param("updatedBy") Long updatedBy);

    // Category statistics
    @Query("SELECT sc.category, COUNT(sc) FROM SystemConfiguration sc GROUP BY sc.category ORDER BY COUNT(sc) DESC")
    List<Object[]> getConfigurationCountByCategory();

    @Query("SELECT sc.configType, COUNT(sc) FROM SystemConfiguration sc GROUP BY sc.configType ORDER BY COUNT(sc) DESC")
    List<Object[]> getConfigurationCountByType();

    @Query("SELECT sc.environment, COUNT(sc) FROM SystemConfiguration sc GROUP BY sc.environment ORDER BY COUNT(sc) DESC")
    List<Object[]> getConfigurationCountByEnvironment();

    @Query("SELECT sc.version, COUNT(sc) FROM SystemConfiguration sc GROUP BY sc.version ORDER BY COUNT(sc) DESC")
    List<Object[]> getConfigurationCountByVersion();

    // Search by key patterns
    @Query("SELECT sc FROM SystemConfiguration sc WHERE sc.configKey LIKE :pattern")
    List<SystemConfiguration> findByConfigKeyPattern(@Param("pattern") String pattern);

    @Query("SELECT sc FROM SystemConfiguration sc WHERE sc.configKey LIKE :pattern")
    Page<SystemConfiguration> findByConfigKeyPattern(@Param("pattern") String pattern, Pageable pageable);

    // Find by multiple keys
    @Query("SELECT sc FROM SystemConfiguration sc WHERE sc.configKey IN :configKeys")
    List<SystemConfiguration> findByConfigKeys(@Param("configKeys") List<String> configKeys);

    // Find configurations that need attention
    @Query("SELECT sc FROM SystemConfiguration sc WHERE sc.isSensitive = true OR sc.isEncrypted = true")
    List<SystemConfiguration> findSensitiveConfigurations();

    @Query("SELECT sc FROM SystemConfiguration sc WHERE sc.isReadonly = true")
    List<SystemConfiguration> findReadonlyConfigurations();

    @Query("SELECT sc FROM SystemConfiguration sc WHERE sc.validationRegex IS NOT NULL AND sc.validationRegex != ''")
    List<SystemConfiguration> findConfigurationsWithValidation();

    // Find configurations by value patterns
    @Query("SELECT sc FROM SystemConfiguration sc WHERE sc.configValue LIKE :pattern")
    List<SystemConfiguration> findByConfigValuePattern(@Param("pattern") String pattern);

    // Find configurations that have been updated recently
    @Query("SELECT sc FROM SystemConfiguration sc WHERE sc.updatedAt >= :since")
    List<SystemConfiguration> findRecentlyUpdated(@Param("since") LocalDateTime since);

    // Find configurations by allowed values
    @Query("SELECT sc FROM SystemConfiguration sc WHERE sc.allowedValues LIKE :value")
    List<SystemConfiguration> findByAllowedValue(@Param("value") String value);

    // Cleanup queries
    @Query("DELETE FROM SystemConfiguration sc WHERE sc.createdAt < :cutoffDate")
    void deleteConfigurationsOlderThan(@Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("SELECT COUNT(sc) FROM SystemConfiguration sc WHERE sc.createdAt < :cutoffDate")
    Long countConfigurationsOlderThan(@Param("cutoffDate") LocalDateTime cutoffDate);

    // Bulk operations
    @Query("UPDATE SystemConfiguration sc SET sc.configValue = :newValue, sc.updatedAt = CURRENT_TIMESTAMP WHERE sc.configKey = :configKey")
    void updateConfigValue(@Param("configKey") String configKey, @Param("newValue") String newValue);

    @Query("UPDATE SystemConfiguration sc SET sc.isReadonly = :readonly, sc.updatedAt = CURRENT_TIMESTAMP WHERE sc.configKey = :configKey")
    void updateReadonlyStatus(@Param("configKey") String configKey, @Param("readonly") Boolean readonly);

    @Query("UPDATE SystemConfiguration sc SET sc.isSensitive = :sensitive, sc.updatedAt = CURRENT_TIMESTAMP WHERE sc.configKey = :configKey")
    void updateSensitiveStatus(@Param("configKey") String configKey, @Param("sensitive") Boolean sensitive);
} 