package com.secureinsure.chatbot.repository;

import com.secureinsure.chatbot.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    
    Optional<ChatSession> findBySessionId(String sessionId);
    
    List<ChatSession> findByUserIdAndIsActiveTrue(Long userId);
    
    List<ChatSession> findByUserIdOrderByLastActivityDesc(Long userId);
    
    @Query("SELECT s FROM ChatSession s WHERE s.userId = :userId AND s.isActive = true AND s.lastActivity > :since")
    List<ChatSession> findActiveSessionsSince(@Param("userId") Long userId, @Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(s) FROM ChatSession s WHERE s.userId = :userId AND s.isActive = true")
    Long countActiveSessionsByUserId(@Param("userId") Long userId);
    
    @Query("SELECT s FROM ChatSession s WHERE s.lastActivity < :threshold AND s.isActive = true")
    List<ChatSession> findInactiveSessions(@Param("threshold") LocalDateTime threshold);
}
