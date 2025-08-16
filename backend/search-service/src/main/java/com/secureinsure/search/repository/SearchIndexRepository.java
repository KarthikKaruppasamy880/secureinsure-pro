package com.secureinsure.search.repository;

import com.secureinsure.search.entity.SearchIndex;
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
public interface SearchIndexRepository extends JpaRepository<SearchIndex, Long> {

    // Basic CRUD operations
    Optional<SearchIndex> findByIndexId(String indexId);
    List<SearchIndex> findByEntityType(String entityType);
    List<SearchIndex> findByEntityId(String entityId);
    List<SearchIndex> findByStatus(String status);
    List<SearchIndex> findByCategory(String category);
    List<SearchIndex> findByUserId(Long userId);
    List<SearchIndex> findByUsername(String username);
    List<SearchIndex> findByCreatedBy(String createdBy);

    // Search operations
    @Query("SELECT si FROM SearchIndex si WHERE " +
           "LOWER(si.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(si.content) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(si.keywords) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(si.tags) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<SearchIndex> findBySearchQuery(@Param("query") String query);

    @Query("SELECT si FROM SearchIndex si WHERE " +
           "LOWER(si.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(si.content) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(si.keywords) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(si.tags) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<SearchIndex> findBySearchQueryWithPagination(@Param("query") String query, Pageable pageable);

    // Advanced search with filters
    @Query("SELECT si FROM SearchIndex si WHERE " +
           "(:query IS NULL OR (LOWER(si.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(si.content) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(si.keywords) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(si.tags) LIKE LOWER(CONCAT('%', :query, '%')))) AND " +
           "(:entityType IS NULL OR si.entityType = :entityType) AND " +
           "(:category IS NULL OR si.category = :category) AND " +
           "(:status IS NULL OR si.status = :status) AND " +
           "(:userId IS NULL OR si.userId = :userId) AND " +
           "(:priority IS NULL OR si.priority = :priority)")
    Page<SearchIndex> findByAdvancedFilters(
            @Param("query") String query,
            @Param("entityType") String entityType,
            @Param("category") String category,
            @Param("status") String status,
            @Param("userId") Long userId,
            @Param("priority") Integer priority,
            Pageable pageable);

    // Priority-based queries
    List<SearchIndex> findByPriority(Integer priority);
    List<SearchIndex> findByPriorityGreaterThanEqual(Integer priority);
    List<SearchIndex> findByPriorityLessThanEqual(Integer priority);
    List<SearchIndex> findByPriorityBetween(Integer minPriority, Integer maxPriority);

    // Status-based queries
    List<SearchIndex> findByStatusIn(List<String> statuses);
    List<SearchIndex> findByStatusNot(String status);
    List<SearchIndex> findByStatusAndUpdatedAtBefore(String status, LocalDateTime date);

    // Category-based queries
    List<SearchIndex> findByCategoryIn(List<String> categories);
    List<SearchIndex> findByCategoryNot(String category);

    // Entity type-based queries
    List<SearchIndex> findByEntityTypeIn(List<String> entityTypes);
    List<SearchIndex> findByEntityTypeNot(String entityType);

    // User-based queries
    List<SearchIndex> findByUserIdIn(List<Long> userIds);
    List<SearchIndex> findByUsernameIn(List<String> usernames);

    // Date-based queries
    List<SearchIndex> findByCreatedAtAfter(LocalDateTime date);
    List<SearchIndex> findByCreatedAtBefore(LocalDateTime date);
    List<SearchIndex> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<SearchIndex> findByUpdatedAtAfter(LocalDateTime date);
    List<SearchIndex> findByUpdatedAtBefore(LocalDateTime date);
    List<SearchIndex> findByUpdatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<SearchIndex> findByLastIndexedAtAfter(LocalDateTime date);
    List<SearchIndex> findByLastIndexedAtBefore(LocalDateTime date);
    List<SearchIndex> findByLastIndexedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    // Indexed at methods (aliases for lastIndexedAt for backward compatibility)
    default List<SearchIndex> findByIndexedAtAfter(LocalDateTime date) {
        return findByLastIndexedAtAfter(date);
    }
    default List<SearchIndex> findByIndexedAtBefore(LocalDateTime date) {
        return findByLastIndexedAtBefore(date);
    }
    default List<SearchIndex> findByIndexedAtBetween(LocalDateTime startDate, LocalDateTime endDate) {
        return findByLastIndexedAtBetween(startDate, endDate);
    }

    // Score-based queries
    List<SearchIndex> findBySearchScoreGreaterThanEqual(Double score);
    List<SearchIndex> findBySearchScoreLessThanEqual(Double score);
    List<SearchIndex> findBySearchScoreBetween(Double minScore, Double maxScore);

    // Complex search queries
    @Query("SELECT si FROM SearchIndex si WHERE " +
           "(:entityType IS NULL OR si.entityType = :entityType) AND " +
           "(:category IS NULL OR si.category = :category) AND " +
           "(:status IS NULL OR si.status = :status) AND " +
           "(:userId IS NULL OR si.userId = :userId) AND " +
           "(:priority IS NULL OR si.priority >= :priority) AND " +
           "(:searchScore IS NULL OR si.searchScore >= :searchScore) AND " +
           "(:startDate IS NULL OR si.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR si.createdAt <= :endDate)")
    Page<SearchIndex> findIndexesByFilters(
            @Param("entityType") String entityType,
            @Param("category") String category,
            @Param("status") String status,
            @Param("userId") Long userId,
            @Param("priority") Integer priority,
            @Param("searchScore") Double searchScore,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);
    
    // Alias for backward compatibility
    default Page<SearchIndex> findByFilters(
            String entityType, String category, String status, Long userId,
            Integer priority, Double searchScore, LocalDateTime startDate,
            LocalDateTime endDate, Pageable pageable) {
        return findIndexesByFilters(entityType, category, status, userId, priority, 
                                  searchScore, startDate, endDate, pageable);
    }

    // Statistics queries
    @Query("SELECT COUNT(si) FROM SearchIndex si WHERE si.status = :status")
    long countByStatus(@Param("status") String status);

    @Query("SELECT COUNT(si) FROM SearchIndex si WHERE si.entityType = :entityType")
    long countByEntityType(@Param("entityType") String entityType);

    @Query("SELECT COUNT(si) FROM SearchIndex si WHERE si.category = :category")
    long countByCategory(@Param("category") String category);

    @Query("SELECT COUNT(si) FROM SearchIndex si WHERE si.userId = :userId")
    long countByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(si) FROM SearchIndex si WHERE si.priority >= :priority")
    long countByPriorityGreaterThanEqual(@Param("priority") Integer priority);

    @Query("SELECT COUNT(si) FROM SearchIndex si WHERE si.searchScore >= :score")
    long countBySearchScoreGreaterThanEqual(@Param("score") Double score);

    // Top queries
    @Query("SELECT si.entityType, COUNT(si) FROM SearchIndex si GROUP BY si.entityType ORDER BY COUNT(si) DESC")
    List<Object[]> findTopEntityTypesByCount();

    @Query("SELECT si.category, COUNT(si) FROM SearchIndex si GROUP BY si.category ORDER BY COUNT(si) DESC")
    List<Object[]> findTopCategoriesByCount();

    @Query("SELECT si.status, COUNT(si) FROM SearchIndex si GROUP BY si.status ORDER BY COUNT(si) DESC")
    List<Object[]> findTopStatusesByCount();

    @Query("SELECT si.username, COUNT(si) FROM SearchIndex si GROUP BY si.username ORDER BY COUNT(si) DESC")
    List<Object[]> findTopUsersByCount();

    @Query("SELECT si.priority, COUNT(si) FROM SearchIndex si GROUP BY si.priority ORDER BY si.priority DESC")
    List<Object[]> findTopPrioritiesByCount();

    // Average queries
    @Query("SELECT AVG(si.priority) FROM SearchIndex si")
    Double findAveragePriority();

    @Query("SELECT AVG(si.searchScore) FROM SearchIndex si")
    Double findAverageSearchScore();

    // Max/Min queries
    @Query("SELECT MAX(si.priority) FROM SearchIndex si")
    Integer findMaxPriority();

    @Query("SELECT MIN(si.priority) FROM SearchIndex si")
    Integer findMinPriority();

    @Query("SELECT MAX(si.searchScore) FROM SearchIndex si")
    Double findMaxSearchScore();

    @Query("SELECT MIN(si.searchScore) FROM SearchIndex si")
    Double findMinSearchScore();

    // Recent activity queries
    @Query("SELECT COUNT(si) FROM SearchIndex si WHERE si.createdAt >= :date")
    long countByCreatedAtAfter(@Param("date") LocalDateTime date);

    @Query("SELECT COUNT(si) FROM SearchIndex si WHERE si.updatedAt >= :date")
    long countByUpdatedAtAfter(@Param("date") LocalDateTime date);

    @Query("SELECT COUNT(si) FROM SearchIndex si WHERE si.lastIndexedAt >= :date")
    long countByLastIndexedAtAfter(@Param("date") LocalDateTime date);
    
    // Indexed at count methods (aliases for backward compatibility)
    default long countByIndexedAtAfter(LocalDateTime date) {
        return countByLastIndexedAtAfter(date);
    }

    // Cleanup queries
    @Query("DELETE FROM SearchIndex si WHERE si.status = 'DELETED' AND si.updatedAt < :date")
    long deleteDeletedIndexesBefore(@Param("date") LocalDateTime date);

    @Query("DELETE FROM SearchIndex si WHERE si.lastIndexedAt < :date")
    long deleteIndexesNotIndexedSince(@Param("date") LocalDateTime date);

    // Bulk operations
    @Query("UPDATE SearchIndex si SET si.status = :status WHERE si.entityType = :entityType")
    long updateStatusByEntityType(@Param("status") String status, @Param("entityType") String entityType);

    @Query("UPDATE SearchIndex si SET si.searchScore = :score WHERE si.entityType = :entityType")
    long updateSearchScoreByEntityType(@Param("score") Double score, @Param("entityType") String entityType);

    // Exists queries
    boolean existsByIndexId(String indexId);
    boolean existsByEntityTypeAndEntityId(String entityType, String entityId);
    boolean existsByStatus(String status);
    boolean existsByCategory(String category);
    boolean existsByUserId(Long userId);
} 