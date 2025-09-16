package com.secureinsure.chatbot.repository;

import com.secureinsure.chatbot.entity.ChatMessage;
import com.secureinsure.chatbot.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    List<ChatMessage> findBySessionOrderByCreatedAtAsc(ChatSession session);
    
    @Query("SELECT m FROM ChatMessage m WHERE m.session.sessionId = :sessionId ORDER BY m.createdAt ASC")
    List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(@Param("sessionId") String sessionId);
    
    @Query("SELECT m FROM ChatMessage m WHERE m.session.userId = :userId AND m.createdAt >= :since ORDER BY m.createdAt DESC")
    List<ChatMessage> findByUserIdAndCreatedAtAfter(@Param("userId") Long userId, @Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.session.sessionId = :sessionId")
    Long countBySessionId(@Param("sessionId") String sessionId);
    
    @Query("SELECT m FROM ChatMessage m WHERE m.session.sessionId = :sessionId AND m.sender = 'USER' ORDER BY m.createdAt DESC")
    List<ChatMessage> findUserMessagesBySessionId(@Param("sessionId") String sessionId);
}
