package com.secureinsure.search.service.impl;

import com.secureinsure.search.dto.SearchIndexDto;
import com.secureinsure.search.entity.SearchIndex;
import com.secureinsure.search.repository.SearchIndexRepository;
import com.secureinsure.search.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SearchServiceImpl implements SearchService {

    private final SearchIndexRepository searchIndexRepository;

    @Override
    public SearchIndexDto createIndex(SearchIndexDto indexDto) {
        log.info("Creating search index for entity: {} - {}", indexDto.getEntityType(), indexDto.getEntityId());
        
        SearchIndex searchIndex = convertToEntity(indexDto);
        searchIndex.setIndexId(generateIndexId());
        searchIndex.setCreatedAt(LocalDateTime.now());
        searchIndex.setUpdatedAt(LocalDateTime.now());
        
        SearchIndex savedIndex = searchIndexRepository.save(searchIndex);
        log.info("Search index created successfully: {}", savedIndex.getIndexId());
        
        return convertToDto(savedIndex);
    }

    @Override
    public SearchIndexDto getIndexById(Long id) {
        log.info("Getting search index by ID: {}", id);
        
        Optional<SearchIndex> indexOpt = searchIndexRepository.findById(id);
        if (indexOpt.isEmpty()) {
            throw new RuntimeException("Search index not found");
        }
        
        return convertToDto(indexOpt.get());
    }

    @Override
    public SearchIndexDto getIndexByIndexId(String indexId) {
        log.info("Getting search index by index ID: {}", indexId);
        
        Optional<SearchIndex> indexOpt = searchIndexRepository.findByIndexId(indexId);
        if (indexOpt.isEmpty()) {
            throw new RuntimeException("Search index not found");
        }
        
        return convertToDto(indexOpt.get());
    }

    @Override
    public Page<SearchIndexDto> getAllIndexes(Pageable pageable) {
        log.info("Getting all search indexes");
        
        Page<SearchIndex> indexes = searchIndexRepository.findAll(pageable);
        return indexes.map(this::convertToDto);
    }

    @Override
    public SearchIndexDto updateIndex(String indexId, SearchIndexDto indexDto) {
        log.info("Updating search index: {}", indexId);
        
        Optional<SearchIndex> indexOpt = searchIndexRepository.findByIndexId(indexId);
        if (indexOpt.isEmpty()) {
            throw new RuntimeException("Search index not found");
        }
        
        SearchIndex searchIndex = indexOpt.get();
        updateIndexFromDto(searchIndex, indexDto);
        searchIndex.setUpdatedAt(LocalDateTime.now());
        
        SearchIndex savedIndex = searchIndexRepository.save(searchIndex);
        log.info("Search index updated successfully: {}", savedIndex.getIndexId());
        
        return convertToDto(savedIndex);
    }

    @Override
    public void deleteIndex(String indexId) {
        log.info("Deleting search index: {}", indexId);
        
        Optional<SearchIndex> indexOpt = searchIndexRepository.findByIndexId(indexId);
        if (indexOpt.isEmpty()) {
            throw new RuntimeException("Search index not found");
        }
        
        searchIndexRepository.deleteById(indexOpt.get().getId());
        log.info("Search index deleted successfully: {}", indexId);
    }

    @Override
    public List<SearchIndexDto> searchByQuery(String query) {
        log.info("Searching indexes by query: {}", query);
        
        if (!validateSearchQuery(query)) {
            throw new IllegalArgumentException("Invalid search query");
        }
        
        List<SearchIndex> indexes = searchIndexRepository.findBySearchQuery(query);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public Page<SearchIndexDto> searchByQueryWithPagination(String query, Pageable pageable) {
        log.info("Searching indexes by query with pagination: {}", query);
        
        if (!validateSearchQuery(query)) {
            throw new IllegalArgumentException("Invalid search query");
        }
        
        Page<SearchIndex> indexes = searchIndexRepository.findBySearchQueryWithPagination(query, pageable);
        return indexes.map(this::convertToDto);
    }

    @Override
    public Page<SearchIndexDto> advancedSearch(String query, String entityType, String category, 
                                             String status, Long userId, Integer priority, Pageable pageable) {
        log.info("Advanced search with query: {}", query);
        
        if (!validateFilters(entityType, category, status)) {
            throw new IllegalArgumentException("Invalid search filters");
        }
        
        Page<SearchIndex> indexes = searchIndexRepository.findByAdvancedFilters(query, entityType, category, 
                                                                       status, userId, priority, pageable);
        return indexes.map(this::convertToDto);
    }

    @Override
    public List<SearchIndexDto> getIndexesByEntityType(String entityType) {
        log.info("Getting indexes by entity type: {}", entityType);
        
        List<SearchIndex> indexes = searchIndexRepository.findByEntityType(entityType);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getIndexesByCategory(String category) {
        log.info("Getting indexes by category: {}", category);
        
        List<SearchIndex> indexes = searchIndexRepository.findByCategory(category);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getIndexesByStatus(String status) {
        log.info("Getting indexes by status: {}", status);
        
        List<SearchIndex> indexes = searchIndexRepository.findByStatus(status);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getIndexesByUserId(Long userId) {
        log.info("Getting indexes by user ID: {}", userId);
        
        List<SearchIndex> indexes = searchIndexRepository.findByUserId(userId);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getIndexesByUsername(String username) {
        log.info("Getting indexes by username: {}", username);
        
        List<SearchIndex> indexes = searchIndexRepository.findByUsername(username);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getIndexesByPriority(Integer priority) {
        log.info("Getting indexes by priority: {}", priority);
        
        List<SearchIndex> indexes = searchIndexRepository.findByPriority(priority);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getIndexesByPriorityRange(Integer minPriority, Integer maxPriority) {
        log.info("Getting indexes by priority range: {} - {}", minPriority, maxPriority);
        
        List<SearchIndex> indexes = searchIndexRepository.findByPriorityBetween(minPriority, maxPriority);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getIndexesBySearchScore(Double minScore) {
        log.info("Getting indexes by search score >= {}", minScore);
        
        List<SearchIndex> indexes = searchIndexRepository.findBySearchScoreGreaterThanEqual(minScore);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getIndexesCreatedAfter(LocalDateTime date) {
        log.info("Getting indexes created after: {}", date);
        
        List<SearchIndex> indexes = searchIndexRepository.findByCreatedAtAfter(date);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getIndexesCreatedBefore(LocalDateTime date) {
        log.info("Getting indexes created before: {}", date);
        
        List<SearchIndex> indexes = searchIndexRepository.findByCreatedAtBefore(date);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getIndexesCreatedBetween(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting indexes created between: {} - {}", startDate, endDate);
        
        List<SearchIndex> indexes = searchIndexRepository.findByCreatedAtBetween(startDate, endDate);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getIndexesUpdatedAfter(LocalDateTime date) {
        log.info("Getting indexes updated after: {}", date);
        
        List<SearchIndex> indexes = searchIndexRepository.findByUpdatedAtAfter(date);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getIndexesUpdatedBefore(LocalDateTime date) {
        log.info("Getting indexes updated before: {}", date);
        
        List<SearchIndex> indexes = searchIndexRepository.findByUpdatedAtBefore(date);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getIndexesUpdatedBetween(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting indexes updated between: {} - {}", startDate, endDate);
        
        List<SearchIndex> indexes = searchIndexRepository.findByUpdatedAtBetween(startDate, endDate);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getIndexesIndexedAfter(LocalDateTime date) {
        log.info("Getting indexes indexed after: {}", date);
        
        List<SearchIndex> indexes = searchIndexRepository.findByIndexedAtAfter(date);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getIndexesIndexedBefore(LocalDateTime date) {
        log.info("Getting indexes indexed before: {}", date);
        
        List<SearchIndex> indexes = searchIndexRepository.findByIndexedAtBefore(date);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getIndexesIndexedBetween(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting indexes indexed between: {} - {}", startDate, endDate);
        
        List<SearchIndex> indexes = searchIndexRepository.findByIndexedAtBetween(startDate, endDate);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getHighPriorityIndexes() {
        log.info("Getting high priority indexes");
        
        List<SearchIndex> indexes = searchIndexRepository.findByPriorityGreaterThanEqual(8);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getMediumPriorityIndexes() {
        log.info("Getting medium priority indexes");
        
        List<SearchIndex> indexes = searchIndexRepository.findByPriorityBetween(4, 7);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getLowPriorityIndexes() {
        log.info("Getting low priority indexes");
        
        List<SearchIndex> indexes = searchIndexRepository.findByPriorityLessThanEqual(3);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getIndexesByPriorityGreaterThanEqual(Integer priority) {
        log.info("Getting indexes with priority >= {}", priority);
        
        List<SearchIndex> indexes = searchIndexRepository.findByPriorityGreaterThanEqual(priority);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getIndexesByPriorityLessThanEqual(Integer priority) {
        log.info("Getting indexes with priority <= {}", priority);
        
        List<SearchIndex> indexes = searchIndexRepository.findByPriorityLessThanEqual(priority);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getActiveIndexes() {
        log.info("Getting active indexes");
        
        List<SearchIndex> indexes = searchIndexRepository.findByStatus("ACTIVE");
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getPendingIndexes() {
        log.info("Getting pending indexes");
        
        List<SearchIndex> indexes = searchIndexRepository.findByStatus("PENDING");
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getDeletedIndexes() {
        log.info("Getting deleted indexes");
        
        List<SearchIndex> indexes = searchIndexRepository.findByStatus("DELETED");
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getIndexesByStatusIn(List<String> statuses) {
        log.info("Getting indexes by statuses: {}", statuses);
        
        List<SearchIndex> indexes = searchIndexRepository.findByStatusIn(statuses);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getIndexesByCategoryIn(List<String> categories) {
        log.info("Getting indexes by categories: {}", categories);
        
        List<SearchIndex> indexes = searchIndexRepository.findByCategoryIn(categories);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getIndexesByCategoryNot(String category) {
        log.info("Getting indexes not in category: {}", category);
        
        List<SearchIndex> indexes = searchIndexRepository.findByCategoryNot(category);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getIndexesByEntityTypeIn(List<String> entityTypes) {
        log.info("Getting indexes by entity types: {}", entityTypes);
        
        List<SearchIndex> indexes = searchIndexRepository.findByEntityTypeIn(entityTypes);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getIndexesByEntityTypeNot(String entityType) {
        log.info("Getting indexes not in entity type: {}", entityType);
        
        List<SearchIndex> indexes = searchIndexRepository.findByEntityTypeNot(entityType);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getIndexesByUserIdIn(List<Long> userIds) {
        log.info("Getting indexes by user IDs: {}", userIds);
        
        List<SearchIndex> indexes = searchIndexRepository.findByUserIdIn(userIds);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getIndexesByUsernameIn(List<String> usernames) {
        log.info("Getting indexes by usernames: {}", usernames);
        
        List<SearchIndex> indexes = searchIndexRepository.findByUsernameIn(usernames);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getIndexesBySearchScoreGreaterThanEqual(Double score) {
        log.info("Getting indexes with search score >= {}", score);
        
        List<SearchIndex> indexes = searchIndexRepository.findBySearchScoreGreaterThanEqual(score);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getIndexesBySearchScoreLessThanEqual(Double score) {
        log.info("Getting indexes with search score <= {}", score);
        
        List<SearchIndex> indexes = searchIndexRepository.findBySearchScoreLessThanEqual(score);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<SearchIndexDto> getIndexesBySearchScoreBetween(Double minScore, Double maxScore) {
        log.info("Getting indexes with search score between: {} - {}", minScore, maxScore);
        
        List<SearchIndex> indexes = searchIndexRepository.findBySearchScoreBetween(minScore, maxScore);
        return indexes.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public Page<SearchIndexDto> getIndexesByFilters(String entityType, String category, String status,
                                                   Long userId, Integer priority, Double searchScore,
                                                   LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        log.info("Getting indexes by filters");
        
        if (!validateFilters(entityType, category, status)) {
            throw new IllegalArgumentException("Invalid search filters");
        }
        
        Page<SearchIndex> indexes = searchIndexRepository.findByFilters(entityType, category, status,
                                                                      userId, priority, searchScore,
                                                                      startDate, endDate, pageable);
        return indexes.map(this::convertToDto);
    }

    @Override
    public Map<String, Object> getSearchStatistics() {
        log.info("Getting search statistics");
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalIndexes", searchIndexRepository.count());
        stats.put("activeIndexes", searchIndexRepository.countByStatus("ACTIVE"));
        stats.put("pendingIndexes", searchIndexRepository.countByStatus("PENDING"));
        stats.put("deletedIndexes", searchIndexRepository.countByStatus("DELETED"));
        
        return stats;
    }

    @Override
    public Map<String, Object> getIndexStatistics() {
        log.info("Getting index statistics");
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalIndexes", searchIndexRepository.count());
        stats.put("indexedToday", searchIndexRepository.countByIndexedAtAfter(LocalDateTime.now().withHour(0).withMinute(0)));
        stats.put("updatedToday", searchIndexRepository.countByUpdatedAtAfter(LocalDateTime.now().withHour(0).withMinute(0)));
        
        return stats;
    }

    @Override
    public Map<String, Object> getEntityTypeStatistics() {
        log.info("Getting entity type statistics");
        
        Map<String, Object> stats = new HashMap<>();
        List<Object[]> topEntityTypes = searchIndexRepository.findTopEntityTypesByCount();
        
        for (Object[] result : topEntityTypes) {
            stats.put((String) result[0], result[1]);
        }
        
        return stats;
    }

    @Override
    public Map<String, Object> getCategoryStatistics() {
        log.info("Getting category statistics");
        
        Map<String, Object> stats = new HashMap<>();
        List<Object[]> topCategories = searchIndexRepository.findTopCategoriesByCount();
        
        for (Object[] result : topCategories) {
            stats.put((String) result[0], result[1]);
        }
        
        return stats;
    }

    @Override
    public Map<String, Object> getStatusStatistics() {
        log.info("Getting status statistics");
        
        Map<String, Object> stats = new HashMap<>();
        List<Object[]> topStatuses = searchIndexRepository.findTopStatusesByCount();
        
        for (Object[] result : topStatuses) {
            stats.put((String) result[0], result[1]);
        }
        
        return stats;
    }

    @Override
    public Map<String, Object> getPriorityStatistics() {
        log.info("Getting priority statistics");
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("averagePriority", searchIndexRepository.findAveragePriority());
        stats.put("maxPriority", searchIndexRepository.findMaxPriority());
        stats.put("minPriority", searchIndexRepository.findMinPriority());
        
        return stats;
    }

    @Override
    public Map<String, Object> getScoreStatistics() {
        log.info("Getting score statistics");
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("averageSearchScore", searchIndexRepository.findAverageSearchScore());
        stats.put("maxSearchScore", searchIndexRepository.findMaxSearchScore());
        stats.put("minSearchScore", searchIndexRepository.findMinSearchScore());
        
        return stats;
    }

    @Override
    public Map<String, Object> getUserStatistics() {
        log.info("Getting user statistics");
        
        Map<String, Object> stats = new HashMap<>();
        List<Object[]> topUsers = searchIndexRepository.findTopUsersByCount();
        
        for (Object[] result : topUsers) {
            stats.put(result[0].toString(), result[1]);
        }
        
        return stats;
    }

    @Override
    public long getTotalIndexCount() {
        return searchIndexRepository.count();
    }

    @Override
    public long getIndexCountByStatus(String status) {
        return searchIndexRepository.countByStatus(status);
    }

    @Override
    public long getIndexCountByEntityType(String entityType) {
        return searchIndexRepository.countByEntityType(entityType);
    }

    @Override
    public long getIndexCountByCategory(String category) {
        return searchIndexRepository.countByCategory(category);
    }

    @Override
    public long getIndexCountByUserId(Long userId) {
        return searchIndexRepository.countByUserId(userId);
    }

    @Override
    public long getIndexCountByPriorityGreaterThanEqual(Integer priority) {
        return searchIndexRepository.countByPriorityGreaterThanEqual(priority);
    }

    @Override
    public long getIndexCountBySearchScoreGreaterThanEqual(Double score) {
        return searchIndexRepository.countBySearchScoreGreaterThanEqual(score);
    }

    @Override
    public long getIndexCountCreatedAfter(LocalDateTime date) {
        return searchIndexRepository.countByCreatedAtAfter(date);
    }

    @Override
    public long getIndexCountUpdatedAfter(LocalDateTime date) {
        return searchIndexRepository.countByUpdatedAtAfter(date);
    }

    @Override
    public long getIndexCountIndexedAfter(LocalDateTime date) {
        return searchIndexRepository.countByIndexedAtAfter(date);
    }

    @Override
    public List<Object[]> getTopEntityTypesByCount() {
        return searchIndexRepository.findTopEntityTypesByCount();
    }

    @Override
    public List<Object[]> getTopCategoriesByCount() {
        return searchIndexRepository.findTopCategoriesByCount();
    }

    @Override
    public List<Object[]> getTopStatusesByCount() {
        return searchIndexRepository.findTopStatusesByCount();
    }

    @Override
    public List<Object[]> getTopUsersByCount() {
        return searchIndexRepository.findTopUsersByCount();
    }

    @Override
    public List<Object[]> getTopPrioritiesByCount() {
        return searchIndexRepository.findTopPrioritiesByCount();
    }

    @Override
    public Double getAveragePriority() {
        return searchIndexRepository.findAveragePriority();
    }

    @Override
    public Double getAverageSearchScore() {
        return searchIndexRepository.findAverageSearchScore();
    }

    @Override
    public Integer getMaxPriority() {
        return searchIndexRepository.findMaxPriority();
    }

    @Override
    public Integer getMinPriority() {
        return searchIndexRepository.findMinPriority();
    }

    @Override
    public Double getMaxSearchScore() {
        return searchIndexRepository.findMaxSearchScore();
    }

    @Override
    public Double getMinSearchScore() {
        return searchIndexRepository.findMinSearchScore();
    }

    @Override
    public long getRecentIndexCount(LocalDateTime since) {
        return searchIndexRepository.countByCreatedAtAfter(since);
    }

    @Override
    public long getRecentUpdateCount(LocalDateTime since) {
        return searchIndexRepository.countByUpdatedAtAfter(since);
    }

    @Override
    public long getRecentIndexingCount(LocalDateTime since) {
        return searchIndexRepository.countByIndexedAtAfter(since);
    }

    @Override
    public void cleanupDeletedIndexes(LocalDateTime cutoffDate) {
        log.info("Cleaning up deleted indexes before: {}", cutoffDate);
        
        List<SearchIndex> deletedIndexes = searchIndexRepository.findByStatusAndUpdatedAtBefore("DELETED", cutoffDate);
        searchIndexRepository.deleteAll(deletedIndexes);
        
        log.info("Cleaned up {} deleted indexes", deletedIndexes.size());
    }

    @Override
    public void cleanupOldIndexes(LocalDateTime cutoffDate) {
        log.info("Cleaning up old indexes before: {}", cutoffDate);
        
        List<SearchIndex> oldIndexes = searchIndexRepository.findByUpdatedAtBefore(cutoffDate);
        searchIndexRepository.deleteAll(oldIndexes);
        
        log.info("Cleaned up {} old indexes", oldIndexes.size());
    }

    @Override
    public void reindexAll() {
        log.info("Reindexing all indexes");
        
        List<SearchIndex> allIndexes = searchIndexRepository.findAll();
        for (SearchIndex index : allIndexes) {
            index.setIndexedAt(LocalDateTime.now());
            index.setSearchScore(calculateSearchScore(index.getTitle(), index.getContent(), index.getKeywords(), index.getTags()));
        }
        
        searchIndexRepository.saveAll(allIndexes);
        log.info("Reindexed {} indexes", allIndexes.size());
    }

    @Override
    public void reindexByEntityType(String entityType) {
        log.info("Reindexing indexes by entity type: {}", entityType);
        
        List<SearchIndex> indexes = searchIndexRepository.findByEntityType(entityType);
        for (SearchIndex index : indexes) {
            index.setIndexedAt(LocalDateTime.now());
            index.setSearchScore(calculateSearchScore(index.getTitle(), index.getContent(), index.getKeywords(), index.getTags()));
        }
        
        searchIndexRepository.saveAll(indexes);
        log.info("Reindexed {} indexes for entity type: {}", indexes.size(), entityType);
    }

    @Override
    public void reindexByCategory(String category) {
        log.info("Reindexing indexes by category: {}", category);
        
        List<SearchIndex> indexes = searchIndexRepository.findByCategory(category);
        for (SearchIndex index : indexes) {
            index.setIndexedAt(LocalDateTime.now());
            index.setSearchScore(calculateSearchScore(index.getTitle(), index.getContent(), index.getKeywords(), index.getTags()));
        }
        
        searchIndexRepository.saveAll(indexes);
        log.info("Reindexed {} indexes for category: {}", indexes.size(), category);
    }

    @Override
    public void reindexByStatus(String status) {
        log.info("Reindexing indexes by status: {}", status);
        
        List<SearchIndex> indexes = searchIndexRepository.findByStatus(status);
        for (SearchIndex index : indexes) {
            index.setIndexedAt(LocalDateTime.now());
            index.setSearchScore(calculateSearchScore(index.getTitle(), index.getContent(), index.getKeywords(), index.getTags()));
        }
        
        searchIndexRepository.saveAll(indexes);
        log.info("Reindexed {} indexes for status: {}", indexes.size(), status);
    }

    @Override
    public void updateStatusByEntityType(String status, String entityType) {
        log.info("Updating status to {} for entity type: {}", status, entityType);
        
        List<SearchIndex> indexes = searchIndexRepository.findByEntityType(entityType);
        for (SearchIndex index : indexes) {
            index.setStatus(status);
            index.setUpdatedAt(LocalDateTime.now());
        }
        
        searchIndexRepository.saveAll(indexes);
        log.info("Updated status for {} indexes", indexes.size());
    }

    @Override
    public void updateSearchScoreByEntityType(Double score, String entityType) {
        log.info("Updating search score to {} for entity type: {}", score, entityType);
        
        List<SearchIndex> indexes = searchIndexRepository.findByEntityType(entityType);
        for (SearchIndex index : indexes) {
            index.setSearchScore(score);
            index.setUpdatedAt(LocalDateTime.now());
        }
        
        searchIndexRepository.saveAll(indexes);
        log.info("Updated search score for {} indexes", indexes.size());
    }

    @Override
    public void updatePriorityByEntityType(Integer priority, String entityType) {
        log.info("Updating priority to {} for entity type: {}", priority, entityType);
        
        List<SearchIndex> indexes = searchIndexRepository.findByEntityType(entityType);
        for (SearchIndex index : indexes) {
            index.setPriority(priority);
            index.setUpdatedAt(LocalDateTime.now());
        }
        
        searchIndexRepository.saveAll(indexes);
        log.info("Updated priority for {} indexes", indexes.size());
    }

    @Override
    public void updateCategoryByEntityType(String category, String entityType) {
        log.info("Updating category to {} for entity type: {}", category, entityType);
        
        List<SearchIndex> indexes = searchIndexRepository.findByEntityType(entityType);
        for (SearchIndex index : indexes) {
            index.setCategory(category);
            index.setUpdatedAt(LocalDateTime.now());
        }
        
        searchIndexRepository.saveAll(indexes);
        log.info("Updated category for {} indexes", indexes.size());
    }

    @Override
    public boolean validateIndex(SearchIndexDto indexDto) {
        return indexDto != null &&
               indexDto.getEntityType() != null &&
               indexDto.getEntityId() != null &&
               indexDto.getTitle() != null &&
               indexDto.getContent() != null;
    }

    @Override
    public boolean validateSearchQuery(String query) {
        return query != null && !query.trim().isEmpty() && query.length() >= 2;
    }

    @Override
    public boolean validateFilters(String entityType, String category, String status) {
        // Basic validation - in a real implementation, you might check against allowed values
        return true;
    }

    @Override
    public String generateIndexId() {
        return "IDX-" + System.currentTimeMillis() + "-" + generateRandomString(6);
    }

    @Override
    public String generateRandomString(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder();
        Random random = new Random();
        
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        
        return sb.toString();
    }

    @Override
    public Double calculateSearchScore(String title, String content, String keywords, String tags) {
        // Simplified scoring algorithm
        double score = 0.0;
        
        if (title != null && !title.isEmpty()) score += 30.0;
        if (content != null && !content.isEmpty()) score += 40.0;
        if (keywords != null && !keywords.isEmpty()) score += 20.0;
        if (tags != null && !tags.isEmpty()) score += 10.0;
        
        return Math.min(score, 100.0);
    }

    @Override
    public String formatSearchSummary(String content) {
        if (content == null || content.isEmpty()) {
            return "";
        }
        
        // Simple summary - first 200 characters
        return content.length() > 200 ? content.substring(0, 200) + "..." : content;
    }

    @Override
    public String formatTags(String tags) {
        if (tags == null || tags.isEmpty()) {
            return "";
        }
        
        // Convert comma-separated tags to proper format
        return tags.replaceAll("\\s*,\\s*", ", ").trim();
    }

    @Override
    public String getPriorityLabel(Integer priority) {
        if (priority == null) return "UNKNOWN";
        
        if (priority >= 8) return "HIGH";
        if (priority >= 4) return "MEDIUM";
        return "LOW";
    }

    @Override
    public boolean isHighPriority(Integer priority) {
        return priority != null && priority >= 8;
    }

    @Override
    public boolean isMediumPriority(Integer priority) {
        return priority != null && priority >= 4 && priority < 8;
    }

    @Override
    public boolean isLowPriority(Integer priority) {
        return priority != null && priority < 4;
    }

    @Override
    public String generateIndexSummary(SearchIndexDto indexDto) {
        if (indexDto == null) return "";
        
        StringBuilder summary = new StringBuilder();
        summary.append("Entity: ").append(indexDto.getEntityType()).append(" - ").append(indexDto.getEntityId());
        
        if (indexDto.getTitle() != null) {
            summary.append(" | Title: ").append(formatSearchSummary(indexDto.getTitle()));
        }
        
        if (indexDto.getCategory() != null) {
            summary.append(" | Category: ").append(indexDto.getCategory());
        }
        
        if (indexDto.getPriority() != null) {
            summary.append(" | Priority: ").append(getPriorityLabel(indexDto.getPriority()));
        }
        
        return summary.toString();
    }

    @Override
    public void healthCheck() {
        log.info("Performing search service health check");
        
        try {
            long count = searchIndexRepository.count();
            log.info("Health check passed - {} indexes found", count);
        } catch (Exception e) {
            log.error("Health check failed", e);
            throw new RuntimeException("Search service health check failed", e);
        }
    }

    @Override
    public Map<String, Object> getSearchHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now());
        health.put("totalIndexes", searchIndexRepository.count());
        
        return health;
    }

    @Override
    public Map<String, Object> getIndexHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now());
        health.put("indexedToday", searchIndexRepository.countByIndexedAtAfter(LocalDateTime.now().withHour(0).withMinute(0)));
        
        return health;
    }

    @Override
    public Map<String, Object> getPerformanceMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("timestamp", LocalDateTime.now());
        metrics.put("totalIndexes", searchIndexRepository.count());
        metrics.put("averagePriority", searchIndexRepository.findAveragePriority());
        metrics.put("averageSearchScore", searchIndexRepository.findAverageSearchScore());
        
        return metrics;
    }

    @Override
    public boolean indexExists(String indexId) {
        return searchIndexRepository.existsByIndexId(indexId);
    }

    @Override
    public boolean indexExistsByEntityTypeAndEntityId(String entityType, String entityId) {
        return searchIndexRepository.existsByEntityTypeAndEntityId(entityType, entityId);
    }

    @Override
    public boolean indexExistsByStatus(String status) {
        return searchIndexRepository.existsByStatus(status);
    }

    @Override
    public boolean indexExistsByCategory(String category) {
        return searchIndexRepository.existsByCategory(category);
    }

    @Override
    public boolean indexExistsByUserId(Long userId) {
        return searchIndexRepository.existsByUserId(userId);
    }

    // Helper methods
    private SearchIndex convertToEntity(SearchIndexDto dto) {
        SearchIndex entity = new SearchIndex();
        entity.setId(dto.getId());
        entity.setIndexId(dto.getIndexId());
        entity.setEntityType(dto.getEntityType());
        entity.setEntityId(dto.getEntityId());
        entity.setTitle(dto.getTitle());
        entity.setContent(dto.getContent());
        entity.setKeywords(dto.getKeywords());
        entity.setTags(dto.getTags());
        entity.setCategory(dto.getCategory());
        entity.setStatus(dto.getStatus());
        entity.setPriority(dto.getPriority());
        entity.setSearchScore(dto.getSearchScore());
        entity.setUserId(dto.getUserId());
        entity.setUsername(dto.getUsername());
        entity.setCreatedAt(dto.getCreatedAt());
        entity.setUpdatedAt(dto.getUpdatedAt());
        entity.setIndexedAt(dto.getIndexedAt());
        
        return entity;
    }

    private SearchIndexDto convertToDto(SearchIndex entity) {
        return SearchIndexDto.builder()
                .id(entity.getId())
                .indexId(entity.getIndexId())
                .entityType(entity.getEntityType())
                .entityId(entity.getEntityId())
                .title(entity.getTitle())
                .content(entity.getContent())
                .keywords(entity.getKeywords())
                .tags(entity.getTags())
                .category(entity.getCategory())
                .status(entity.getStatus())
                .priority(entity.getPriority())
                .searchScore(entity.getSearchScore())
                .userId(entity.getUserId())
                .username(entity.getUsername())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .indexedAt(entity.getIndexedAt())
                .build();
    }

    private void updateIndexFromDto(SearchIndex entity, SearchIndexDto dto) {
        if (dto.getTitle() != null) entity.setTitle(dto.getTitle());
        if (dto.getContent() != null) entity.setContent(dto.getContent());
        if (dto.getKeywords() != null) entity.setKeywords(dto.getKeywords());
        if (dto.getTags() != null) entity.setTags(dto.getTags());
        if (dto.getCategory() != null) entity.setCategory(dto.getCategory());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
        if (dto.getPriority() != null) entity.setPriority(dto.getPriority());
        if (dto.getSearchScore() != null) entity.setSearchScore(dto.getSearchScore());
        if (dto.getUserId() != null) entity.setUserId(dto.getUserId());
        if (dto.getUsername() != null) entity.setUsername(dto.getUsername());
    }
}
