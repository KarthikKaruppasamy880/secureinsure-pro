package com.secureinsure.chatbot.controller;

import com.secureinsure.chatbot.dto.*;
import com.secureinsure.chatbot.entity.ChatMessage;
import com.secureinsure.chatbot.service.ChatbotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/chatbot")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Chatbot", description = "AI-powered insurance chatbot endpoints")
public class ChatbotController {
    
    private final ChatbotService chatbotService;
    
    @PostMapping("/session/start")
    @Operation(summary = "Start a new chat session", description = "Creates a new chat session for the authenticated user")
    public ResponseEntity<SessionResponse> startSession() {
        try {
            Long userId = getCurrentUserId();
            SessionResponse response = chatbotService.startSession(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error starting chat session: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/message")
    @Operation(summary = "Send a message to the chatbot", description = "Processes a text message and returns AI response")
    public ResponseEntity<ChatbotResponse> sendMessage(
            @Valid @RequestBody ChatbotRequest request) {
        try {
            Long userId = getCurrentUserId();
            ChatbotResponse response = chatbotService.processMessage(request, userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error processing message: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping(value = "/voice", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Process voice input", description = "Converts speech to text and processes the message")
    public ResponseEntity<ChatbotResponse> processVoiceInput(
            @RequestParam("audio") MultipartFile audioFile,
            @RequestParam(value = "sessionId", required = false) String sessionId) {
        try {
            Long userId = getCurrentUserId();
            
            if (audioFile.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            byte[] audioData = audioFile.getBytes();
            ChatbotResponse response = chatbotService.processVoiceInput(audioData, sessionId, userId);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error processing voice input: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/session/{sessionId}/history")
    @Operation(summary = "Get chat history", description = "Retrieves the chat history for a specific session")
    public ResponseEntity<List<ChatMessage>> getChatHistory(
            @Parameter(description = "Session ID") @PathVariable String sessionId) {
        try {
            Long userId = getCurrentUserId();
            List<ChatMessage> history = chatbotService.getChatHistory(sessionId, userId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            log.error("Error getting chat history: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/action")
    @Operation(summary = "Execute chatbot action", description = "Executes a specific action requested by the chatbot")
    public ResponseEntity<ChatbotResponse> executeAction(
            @RequestBody Map<String, Object> request) {
        try {
            Long userId = getCurrentUserId();
            String sessionId = (String) request.get("sessionId");
            
            @SuppressWarnings("unchecked")
            Map<String, Object> actionMap = (Map<String, Object>) request.get("action");
            
            ChatbotResponse.ChatAction action = new ChatbotResponse.ChatAction();
            action.setType((String) actionMap.get("type"));
            action.setLabel((String) actionMap.get("label"));
            action.setDescription((String) actionMap.get("description"));
            action.setData((Map<String, Object>) actionMap.get("data"));
            
            ChatbotResponse response = chatbotService.executeAction(action, sessionId, userId);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error executing action: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/suggestions")
    @Operation(summary = "Get suggestions", description = "Returns suggestions based on partial text input")
    public ResponseEntity<Map<String, List<String>>> getSuggestions(
            @RequestBody Map<String, String> request) {
        try {
            String partialText = request.get("text");
            List<String> suggestions = chatbotService.getSuggestions(partialText);
            
            Map<String, List<String>> response = Map.of("suggestions", suggestions);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting suggestions: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/policy-query")
    @Operation(summary = "Query policy information", description = "Processes policy-related queries")
    public ResponseEntity<ChatbotResponse> queryPolicy(
            @RequestBody Map<String, String> request) {
        try {
            Long userId = getCurrentUserId();
            String query = request.get("query");
            
            ChatbotRequest chatbotRequest = new ChatbotRequest();
            chatbotRequest.setText(query);
            chatbotRequest.setTimestamp(java.time.LocalDateTime.now());
            
            ChatbotResponse response = chatbotService.processMessage(chatbotRequest, userId);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error querying policy: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/claim-query")
    @Operation(summary = "Query claim information", description = "Processes claim-related queries")
    public ResponseEntity<ChatbotResponse> queryClaim(
            @RequestBody Map<String, String> request) {
        try {
            Long userId = getCurrentUserId();
            String query = request.get("query");
            
            ChatbotRequest chatbotRequest = new ChatbotRequest();
            chatbotRequest.setText(query);
            chatbotRequest.setTimestamp(java.time.LocalDateTime.now());
            
            ChatbotResponse response = chatbotService.processMessage(chatbotRequest, userId);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error querying claim: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/nlp")
    @Operation(summary = "Process natural language", description = "Processes text using natural language processing")
    public ResponseEntity<Map<String, Object>> processNaturalLanguage(
            @RequestBody Map<String, String> request) {
        try {
            String text = request.get("text");
            // This would typically call the NLP service directly
            // For now, we'll return a mock response
            
            Map<String, Object> response = Map.of(
                "intent", "general",
                "entities", List.of(),
                "confidence", 0.8,
                "response", "I understand your request. How can I help you further?"
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error processing natural language: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/capabilities")
    @Operation(summary = "Get chatbot capabilities", description = "Returns the capabilities and features of the chatbot")
    public ResponseEntity<Map<String, Object>> getCapabilities() {
        try {
            Map<String, Object> capabilities = chatbotService.getCapabilities();
            return ResponseEntity.ok(capabilities);
        } catch (Exception e) {
            log.error("Error getting capabilities: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/voice/start")
    @Operation(summary = "Start voice chat", description = "Initiates voice chat mode")
    public ResponseEntity<Map<String, String>> startVoiceChat(
            @RequestBody Map<String, String> request) {
        try {
            String sessionId = request.get("sessionId");
            // In a real implementation, this would set up voice chat mode
            
            Map<String, String> response = Map.of(
                "sessionId", sessionId != null ? sessionId : "new-session",
                "message", "Voice chat mode activated. You can now speak to the assistant."
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error starting voice chat: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/voice/end")
    @Operation(summary = "End voice chat", description = "Ends voice chat mode")
    public ResponseEntity<Map<String, String>> endVoiceChat(
            @RequestBody Map<String, String> request) {
        try {
            String sessionId = request.get("sessionId");
            // In a real implementation, this would end voice chat mode
            
            Map<String, String> response = Map.of(
                "sessionId", sessionId,
                "message", "Voice chat mode deactivated."
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error ending voice chat: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
            // Extract user ID from authentication
            // This is a simplified implementation - in production, you would
            // properly extract the user ID from the JWT token or user details
            return 1L; // Placeholder user ID
        }
        throw new RuntimeException("User not authenticated");
    }
}
