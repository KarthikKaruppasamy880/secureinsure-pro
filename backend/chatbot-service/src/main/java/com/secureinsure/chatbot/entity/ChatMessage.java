package com.secureinsure.chatbot.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"session"})
@ToString(exclude = {"session"})
@EntityListeners(AuditingEntityListener.class)
public class ChatMessage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Column(name = "message_id", nullable = false, unique = true)
    private String messageId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    @NotNull
    private ChatSession session;
    
    @NotBlank
    @Column(name = "text", nullable = false, columnDefinition = "TEXT")
    private String text;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "sender", nullable = false)
    private MessageSender sender;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", nullable = false)
    private MessageType messageType;
    
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;
    
    @Column(name = "confidence")
    private Double confidence;
    
    @Column(name = "intent")
    private String intent;
    
    @Column(name = "entities", columnDefinition = "TEXT")
    private String entities;
    
    @Column(name = "actions", columnDefinition = "TEXT")
    private String actions;
    
    @Column(name = "is_voice_input")
    private Boolean isVoiceInput = false;
    
    @Column(name = "processing_time_ms")
    private Long processingTimeMs;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    public enum MessageSender {
        USER, BOT
    }
    
    public enum MessageType {
        TEXT, VOICE, ACTION, SYSTEM
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getMessageId() { return messageId; }
    public void setMessageId(String messageId) { this.messageId = messageId; }
    
    public ChatSession getSession() { return session; }
    public void setSession(ChatSession session) { this.session = session; }
    
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    
    public MessageSender getSender() { return sender; }
    public void setSender(MessageSender sender) { this.sender = sender; }
    
    public MessageType getMessageType() { return messageType; }
    public void setMessageType(MessageType messageType) { this.messageType = messageType; }
    
    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }
    
    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }
    
    public String getIntent() { return intent; }
    public void setIntent(String intent) { this.intent = intent; }
    
    public String getEntities() { return entities; }
    public void setEntities(String entities) { this.entities = entities; }
    
    public String getActions() { return actions; }
    public void setActions(String actions) { this.actions = actions; }
    
    public Boolean getIsVoiceInput() { return isVoiceInput; }
    public void setIsVoiceInput(Boolean isVoiceInput) { this.isVoiceInput = isVoiceInput; }
    
    public Long getProcessingTimeMs() { return processingTimeMs; }
    public void setProcessingTimeMs(Long processingTimeMs) { this.processingTimeMs = processingTimeMs; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
