package com.secureinsure.chatbot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@NoArgsConstructor
@AllArgsConstructor
public class ChatbotResponse {
    
    private String message;
    
    private List<ChatAction> actions;
    
    private List<Map<String, Object>> entities;
    
    private String intent;
    
    private Double confidence;
    
    private List<String> suggestions;
    
    private Boolean needsVoiceResponse = false;
    
    private String sessionId;
    
    private Long processingTimeMs;
    
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatAction {
        private String type;
        private Map<String, Object> data;
        private String label;
        private String description;
        
        // Getters and Setters
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        
        public Map<String, Object> getData() { return data; }
        public void setData(Map<String, Object> data) { this.data = data; }
        
        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
    
    // Getters and Setters
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public List<ChatAction> getActions() { return actions; }
    public void setActions(List<ChatAction> actions) { this.actions = actions; }
    
    public List<Map<String, Object>> getEntities() { return entities; }
    public void setEntities(List<Map<String, Object>> entities) { this.entities = entities; }
    
    public String getIntent() { return intent; }
    public void setIntent(String intent) { this.intent = intent; }
    
    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }
    
    public List<String> getSuggestions() { return suggestions; }
    public void setSuggestions(List<String> suggestions) { this.suggestions = suggestions; }
    
    public Boolean getNeedsVoiceResponse() { return needsVoiceResponse; }
    public void setNeedsVoiceResponse(Boolean needsVoiceResponse) { this.needsVoiceResponse = needsVoiceResponse; }
    
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    
    public Long getProcessingTimeMs() { return processingTimeMs; }
    public void setProcessingTimeMs(Long processingTimeMs) { this.processingTimeMs = processingTimeMs; }
}
