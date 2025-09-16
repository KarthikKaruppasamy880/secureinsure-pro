package com.secureinsure.chatbot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@NoArgsConstructor
@AllArgsConstructor
public class NLPResult {
    
    private String intent;
    
    private List<Map<String, Object>> entities;
    
    private Double confidence;
    
    private String originalText;
    
    private String processedText;
    
    private Map<String, Object> context;
    
    // Getters and Setters
    public String getIntent() { return intent; }
    public void setIntent(String intent) { this.intent = intent; }
    
    public List<Map<String, Object>> getEntities() { return entities; }
    public void setEntities(List<Map<String, Object>> entities) { this.entities = entities; }
    
    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }
    
    public String getOriginalText() { return originalText; }
    public void setOriginalText(String originalText) { this.originalText = originalText; }
    
    public String getProcessedText() { return processedText; }
    public void setProcessedText(String processedText) { this.processedText = processedText; }
    
    public Map<String, Object> getContext() { return context; }
    public void setContext(Map<String, Object> context) { this.context = context; }
}
