package com.secureinsure.chatbot.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
public class ChatbotRequest {
    
    @NotBlank(message = "Message text is required")
    private String text;
    
    private String sessionId;
    
    private Boolean isVoice = false;
    
    private LocalDateTime timestamp;
    
    private String language = "en-US";
    
    private String context;
    
    // Getters and Setters
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    
    public Boolean getIsVoice() { return isVoice; }
    public void setIsVoice(Boolean isVoice) { this.isVoice = isVoice; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    
    public String getContext() { return context; }
    public void setContext(String context) { this.context = context; }
}
