package com.secureinsure.chatbot.service;

import com.secureinsure.chatbot.dto.NLPResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

@Service
@Slf4j
public class NLPService {
    
    private final Map<String, List<String>> intentPatterns = Map.of(
        "greeting", Arrays.asList(
            "hello", "hi", "hey", "good morning", "good afternoon", "good evening",
            "how are you", "what's up", "greetings"
        ),
        "policy_inquiry", Arrays.asList(
            "policy", "policies", "coverage", "insurance", "premium", "plan",
            "my policy", "show policies", "policy details", "coverage details"
        ),
        "claim_status", Arrays.asList(
            "claim", "claims", "claim status", "my claim", "claim progress",
            "file claim", "new claim", "claim history", "claim number"
        ),
        "payment_info", Arrays.asList(
            "payment", "pay", "bill", "due", "premium", "payment due",
            "when is payment due", "payment history", "billing"
        ),
        "help", Arrays.asList(
            "help", "assist", "support", "what can you do", "how can you help",
            "commands", "options", "guide"
        ),
        "navigation", Arrays.asList(
            "navigate", "go to", "show me", "take me to", "dashboard",
            "policies page", "claims page", "profile", "settings"
        )
    );
    
    private final Map<String, List<String>> entityPatterns = Map.of(
        "policy_number", Arrays.asList("policy #", "policy number", "policy no"),
        "claim_number", Arrays.asList("claim #", "claim number", "claim no"),
        "amount", Arrays.asList("$", "dollar", "amount", "cost", "price"),
        "date", Arrays.asList("date", "when", "on", "by", "until")
    );
    
    public NLPResult processText(String text) {
        String normalizedText = text.toLowerCase().trim();
        
        // Determine intent
        String intent = determineIntent(normalizedText);
        
        // Extract entities
        List<Map<String, Object>> entities = extractEntities(normalizedText);
        
        // Calculate confidence
        double confidence = calculateConfidence(normalizedText, intent);
        
        NLPResult result = new NLPResult();
        result.setIntent(intent);
        result.setEntities(entities);
        result.setConfidence(confidence);
        result.setOriginalText(text);
        result.setProcessedText(normalizedText);
        return result;
    }
    
    public List<String> getSuggestions(String partialText) {
        String normalized = partialText.toLowerCase().trim();
        List<String> suggestions = new ArrayList<>();
        
        // If text is very short, provide general suggestions
        if (normalized.length() < 3) {
            return Arrays.asList("Check my policies", "View claim status", "Payment due date", "Help");
        }
        
        // Check for partial matches with intents
        for (Map.Entry<String, List<String>> entry : intentPatterns.entrySet()) {
            String intent = entry.getKey();
            List<String> patterns = entry.getValue();
            
            for (String pattern : patterns) {
                if (pattern.contains(normalized) || normalized.contains(pattern)) {
                    suggestions.addAll(getIntentSuggestions(intent));
                    break;
                }
            }
        }
        
        // If no specific matches, provide general suggestions
        if (suggestions.isEmpty()) {
            suggestions.addAll(Arrays.asList(
                "Show my policies",
                "Check claim status", 
                "When is payment due",
                "Help with insurance"
            ));
        }
        
        return suggestions.stream().distinct().limit(4).toList();
    }
    
    private String determineIntent(String text) {
        Map<String, Integer> intentScores = new HashMap<>();
        
        for (Map.Entry<String, List<String>> entry : intentPatterns.entrySet()) {
            String intent = entry.getKey();
            List<String> patterns = entry.getValue();
            
            int score = 0;
            for (String pattern : patterns) {
                if (text.contains(pattern)) {
                    score += pattern.length(); // Longer patterns get higher scores
                }
            }
            intentScores.put(intent, score);
        }
        
        // Find intent with highest score
        return intentScores.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("general");
    }
    
    private List<Map<String, Object>> extractEntities(String text) {
        List<Map<String, Object>> entities = new ArrayList<>();
        
        for (Map.Entry<String, List<String>> entry : entityPatterns.entrySet()) {
            String entityType = entry.getKey();
            List<String> patterns = entry.getValue();
            
            for (String pattern : patterns) {
                if (text.contains(pattern)) {
                    Map<String, Object> entity = new HashMap<>();
                    entity.put("type", entityType);
                    entity.put("pattern", pattern);
                    entity.put("confidence", 0.8);
                    entities.add(entity);
                }
            }
        }
        
        // Extract policy numbers (format: alphanumeric)
        Pattern policyPattern = Pattern.compile("\\b[A-Z0-9]{6,12}\\b");
        if (policyPattern.matcher(text.toUpperCase()).find()) {
            Map<String, Object> entity = new HashMap<>();
            entity.put("type", "policy_number");
            entity.put("confidence", 0.9);
            entities.add(entity);
        }
        
        // Extract claim numbers (format: CLM followed by numbers)
        Pattern claimPattern = Pattern.compile("\\bCLM\\d{6,10}\\b");
        if (claimPattern.matcher(text.toUpperCase()).find()) {
            Map<String, Object> entity = new HashMap<>();
            entity.put("type", "claim_number");
            entity.put("confidence", 0.9);
            entities.add(entity);
        }
        
        // Extract amounts (format: $X or X dollars)
        Pattern amountPattern = Pattern.compile("\\$\\d+(?:\\.\\d{2})?|\\d+(?:\\.\\d{2})?\\s*dollars?");
        if (amountPattern.matcher(text).find()) {
            Map<String, Object> entity = new HashMap<>();
            entity.put("type", "amount");
            entity.put("confidence", 0.8);
            entities.add(entity);
        }
        
        return entities;
    }
    
    private double calculateConfidence(String text, String intent) {
        if ("general".equals(intent)) {
            return 0.3; // Low confidence for general intent
        }
        
        List<String> patterns = intentPatterns.get(intent);
        if (patterns == null) {
            return 0.3;
        }
        
        int matches = 0;
        int totalPatterns = patterns.size();
        
        for (String pattern : patterns) {
            if (text.contains(pattern)) {
                matches++;
            }
        }
        
        double baseConfidence = (double) matches / totalPatterns;
        
        // Boost confidence for longer, more specific patterns
        double lengthBoost = Math.min(text.length() / 50.0, 0.3);
        
        return Math.min(baseConfidence + lengthBoost, 1.0);
    }
    
    private List<String> getIntentSuggestions(String intent) {
        return switch (intent) {
            case "greeting" -> Arrays.asList("Check my policies", "View claim status", "Payment due date", "Help");
            case "policy_inquiry" -> Arrays.asList("Show coverage details", "Premium information", "Policy documents", "Make changes");
            case "claim_status" -> Arrays.asList("File new claim", "Upload documents", "Check processing time", "Contact adjuster");
            case "payment_info" -> Arrays.asList("Payment history", "Update payment method", "Set up autopay", "Payment options");
            case "help" -> Arrays.asList("Policies", "Claims", "Payments", "Navigation");
            case "navigation" -> Arrays.asList("Dashboard", "Policies page", "Claims page", "Profile");
            default -> Arrays.asList("Help", "Policies", "Claims", "Payments");
        };
    }
}
