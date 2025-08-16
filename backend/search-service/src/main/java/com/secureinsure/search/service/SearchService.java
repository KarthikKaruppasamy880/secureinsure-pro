package com.secureinsure.search.service;

import com.secureinsure.search.dto.SearchIndexDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface SearchService {

    // Basic CRUD Operations
    SearchIndexDto createIndex(SearchIndexDto indexDto);
    SearchIndexDto getIndexById(Long id);
    SearchIndexDto getIndexByIndexId(String indexId);
    Page<SearchIndexDto> getAllIndexes(Pageable pageable);
    SearchIndexDto updateIndex(String indexId, SearchIndexDto indexDto);
    void deleteIndex(String indexId);

    // Search Operations
    List<SearchIndexDto> searchByQuery(String query);
    Page<SearchIndexDto> searchByQueryWithPagination(String query, Pageable pageable);
    Page<SearchIndexDto> advancedSearch(String query, String entityType, String category, 
                                       String status, Long userId, Integer priority, Pageable pageable);

    // Filter-based Operations
    List<SearchIndexDto> getIndexesByEntityType(String entityType);
    List<SearchIndexDto> getIndexesByCategory(String category);
    List<SearchIndexDto> getIndexesByStatus(String status);
    List<SearchIndexDto> getIndexesByUserId(Long userId);
    List<SearchIndexDto> getIndexesByUsername(String username);
    List<SearchIndexDto> getIndexesByPriority(Integer priority);
    List<SearchIndexDto> getIndexesByPriorityRange(Integer minPriority, Integer maxPriority);
    List<SearchIndexDto> getIndexesBySearchScore(Double minScore);

    // Date-based Operations
    List<SearchIndexDto> getIndexesCreatedAfter(LocalDateTime date);
    List<SearchIndexDto> getIndexesCreatedBefore(LocalDateTime date);
    List<SearchIndexDto> getIndexesCreatedBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<SearchIndexDto> getIndexesUpdatedAfter(LocalDateTime date);
    List<SearchIndexDto> getIndexesUpdatedBefore(LocalDateTime date);
    List<SearchIndexDto> getIndexesUpdatedBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<SearchIndexDto> getIndexesIndexedAfter(LocalDateTime date);
    List<SearchIndexDto> getIndexesIndexedBefore(LocalDateTime date);
    List<SearchIndexDto> getIndexesIndexedBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Priority Operations
    List<SearchIndexDto> getHighPriorityIndexes();
    List<SearchIndexDto> getMediumPriorityIndexes();
    List<SearchIndexDto> getLowPriorityIndexes();
    List<SearchIndexDto> getIndexesByPriorityGreaterThanEqual(Integer priority);
    List<SearchIndexDto> getIndexesByPriorityLessThanEqual(Integer priority);

    // Status Operations
    List<SearchIndexDto> getActiveIndexes();
    List<SearchIndexDto> getPendingIndexes();
    List<SearchIndexDto> getDeletedIndexes();
    List<SearchIndexDto> getIndexesByStatusIn(List<String> statuses);

    // Category Operations
    List<SearchIndexDto> getIndexesByCategoryIn(List<String> categories);
    List<SearchIndexDto> getIndexesByCategoryNot(String category);

    // Entity Type Operations
    List<SearchIndexDto> getIndexesByEntityTypeIn(List<String> entityTypes);
    List<SearchIndexDto> getIndexesByEntityTypeNot(String entityType);

    // User Operations
    List<SearchIndexDto> getIndexesByUserIdIn(List<Long> userIds);
    List<SearchIndexDto> getIndexesByUsernameIn(List<String> usernames);

    // Score Operations
    List<SearchIndexDto> getIndexesBySearchScoreGreaterThanEqual(Double score);
    List<SearchIndexDto> getIndexesBySearchScoreLessThanEqual(Double score);
    List<SearchIndexDto> getIndexesBySearchScoreBetween(Double minScore, Double maxScore);

    // Complex Filter Operations
    Page<SearchIndexDto> getIndexesByFilters(String entityType, String category, String status,
                                            Long userId, Integer priority, Double searchScore,
                                            LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    // Statistics Operations
    Map<String, Object> getSearchStatistics();
    Map<String, Object> getIndexStatistics();
    Map<String, Object> getEntityTypeStatistics();
    Map<String, Object> getCategoryStatistics();
    Map<String, Object> getStatusStatistics();
    Map<String, Object> getPriorityStatistics();
    Map<String, Object> getScoreStatistics();
    Map<String, Object> getUserStatistics();

    // Count Operations
    long getTotalIndexCount();
    long getIndexCountByStatus(String status);
    long getIndexCountByEntityType(String entityType);
    long getIndexCountByCategory(String category);
    long getIndexCountByUserId(Long userId);
    long getIndexCountByPriorityGreaterThanEqual(Integer priority);
    long getIndexCountBySearchScoreGreaterThanEqual(Double score);
    long getIndexCountCreatedAfter(LocalDateTime date);
    long getIndexCountUpdatedAfter(LocalDateTime date);
    long getIndexCountIndexedAfter(LocalDateTime date);

    // Top Operations
    List<Object[]> getTopEntityTypesByCount();
    List<Object[]> getTopCategoriesByCount();
    List<Object[]> getTopStatusesByCount();
    List<Object[]> getTopUsersByCount();
    List<Object[]> getTopPrioritiesByCount();

    // Average Operations
    Double getAveragePriority();
    Double getAverageSearchScore();

    // Max/Min Operations
    Integer getMaxPriority();
    Integer getMinPriority();
    Double getMaxSearchScore();
    Double getMinSearchScore();

    // Recent Activity Operations
    long getRecentIndexCount(LocalDateTime since);
    long getRecentUpdateCount(LocalDateTime since);
    long getRecentIndexingCount(LocalDateTime since);

    // Cleanup Operations
    void cleanupDeletedIndexes(LocalDateTime cutoffDate);
    void cleanupOldIndexes(LocalDateTime cutoffDate);
    void reindexAll();
    void reindexByEntityType(String entityType);
    void reindexByCategory(String category);
    void reindexByStatus(String status);

    // Bulk Operations
    void updateStatusByEntityType(String status, String entityType);
    void updateSearchScoreByEntityType(Double score, String entityType);
    void updatePriorityByEntityType(Integer priority, String entityType);
    void updateCategoryByEntityType(String category, String entityType);

    // Validation Operations
    boolean validateIndex(SearchIndexDto indexDto);
    boolean validateSearchQuery(String query);
    boolean validateFilters(String entityType, String category, String status);

    // Utility Operations
    String generateIndexId();
    String generateRandomString(int length);
    Double calculateSearchScore(String title, String content, String keywords, String tags);
    String formatSearchSummary(String content);
    String formatTags(String tags);
    String getPriorityLabel(Integer priority);
    boolean isHighPriority(Integer priority);
    boolean isMediumPriority(Integer priority);
    boolean isLowPriority(Integer priority);
    String generateIndexSummary(SearchIndexDto indexDto);

    // Health Check Operations
    void healthCheck();
    Map<String, Object> getSearchHealth();
    Map<String, Object> getIndexHealth();
    Map<String, Object> getPerformanceMetrics();

    // Exists Operations
    boolean indexExists(String indexId);
    boolean indexExistsByEntityTypeAndEntityId(String entityType, String entityId);
    boolean indexExistsByStatus(String status);
    boolean indexExistsByCategory(String category);
    boolean indexExistsByUserId(Long userId);
} 