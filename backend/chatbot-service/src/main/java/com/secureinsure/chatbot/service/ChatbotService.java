package com.secureinsure.chatbot.service;

import com.secureinsure.chatbot.dto.*;
import com.secureinsure.chatbot.entity.ChatMessage;
import com.secureinsure.chatbot.entity.ChatSession;
import com.secureinsure.chatbot.repository.ChatMessageRepository;
import com.secureinsure.chatbot.repository.ChatSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ChatbotService {
    
    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final NLPService nlpService;
    private final PolicyQueryService policyQueryService;
    private final ClaimQueryService claimQueryService;
    private final VoiceProcessingService voiceProcessingService;
    
    public SessionResponse startSession(Long userId) {
        String sessionId = UUID.randomUUID().toString();
        
        ChatSession session = new ChatSession();
        session.setSessionId(sessionId);
        session.setUserId(userId);
        session.setIsActive(true);
        session.setVoiceEnabled(true);
        session.setLanguage("en-US");
        session.setLastActivity(LocalDateTime.now());
        session.setContext("{}");
        
        session = sessionRepository.save(session);
        
        String welcomeMessage = generateWelcomeMessage();
        
        // Create welcome message
        ChatMessage welcomeMsg = new ChatMessage();
        welcomeMsg.setMessageId(UUID.randomUUID().toString());
        welcomeMsg.setSession(session);
        welcomeMsg.setText(welcomeMessage);
        welcomeMsg.setSender(ChatMessage.MessageSender.BOT);
        welcomeMsg.setMessageType(ChatMessage.MessageType.TEXT);
        
        messageRepository.save(welcomeMsg);
        
        SessionResponse response = new SessionResponse();
        response.setSessionId(sessionId);
        response.setWelcomeMessage(welcomeMessage);
        response.setVoiceEnabled(true);
        response.setLanguage("en-US");
        response.setUserId(userId);
        
        return response;
    }
    
    public ChatbotResponse processMessage(ChatbotRequest request, Long userId) {
        long startTime = System.currentTimeMillis();
        
        try {
            // Get or create session
            ChatSession session = getOrCreateSession(request.getSessionId(), userId);
            
            // Save user message
            ChatMessage userMessage = saveUserMessage(session, request);
            
            // Process with NLP
            NLPResult nlpResult = nlpService.processText(request.getText());
            
            // Generate response based on intent
            ChatbotResponse response = generateResponse(nlpResult, session, request);
            
            // Save bot response
            saveBotMessage(session, response, nlpResult);
            
            // Update session activity
            updateSessionActivity(session);
            
            long processingTime = System.currentTimeMillis() - startTime;
            response.setProcessingTimeMs(processingTime);
            response.setSessionId(session.getSessionId());
            
            return response;
            
        } catch (Exception e) {
            log.error("Error processing message: {}", e.getMessage(), e);
            return createErrorResponse("Sorry, I encountered an error processing your message. Please try again.");
        }
    }
    
    public ChatbotResponse processVoiceInput(byte[] audioData, String sessionId, Long userId) {
        try {
            // Convert speech to text
            String transcript = voiceProcessingService.speechToText(audioData);
            
            if (transcript == null || transcript.trim().isEmpty()) {
                return createErrorResponse("I couldn't understand your voice input. Please try again.");
            }
            
            // Process as regular message
            ChatbotRequest request = new ChatbotRequest();
            request.setText(transcript);
            request.setSessionId(sessionId);
            request.setIsVoice(true);
            request.setTimestamp(LocalDateTime.now());
            
            ChatbotResponse response = processMessage(request, userId);
            response.setNeedsVoiceResponse(true);
            
            return response;
            
        } catch (Exception e) {
            log.error("Error processing voice input: {}", e.getMessage(), e);
            return createErrorResponse("Sorry, I couldn't process your voice input. Please try again.");
        }
    }
    
    public List<ChatMessage> getChatHistory(String sessionId, Long userId) {
        ChatSession session = sessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        if (!session.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to session");
        }
        
        return messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
    }
    
    public ChatbotResponse executeAction(ChatbotResponse.ChatAction action, String sessionId, Long userId) {
        try {
            ChatSession session = sessionRepository.findBySessionId(sessionId)
                    .orElseThrow(() -> new RuntimeException("Session not found"));
            
            if (!session.getUserId().equals(userId)) {
                throw new RuntimeException("Unauthorized access to session");
            }
            
            String responseText = switch (action.getType()) {
                case "policy_lookup" -> policyQueryService.queryPolicies(userId);
                case "claim_status" -> claimQueryService.queryClaims(userId);
                case "payment_due" -> policyQueryService.queryPaymentDue(userId);
                case "navigation" -> "I can help you navigate to different sections of the application.";
                case "help" -> generateHelpMessage();
                default -> "I'm not sure how to help with that action.";
            };
            
            ChatbotResponse response = new ChatbotResponse();
            response.setMessage(responseText);
            response.setSessionId(sessionId);
            response.setNeedsVoiceResponse(true);
            return response;
                    
        } catch (Exception e) {
            log.error("Error executing action: {}", e.getMessage(), e);
            return createErrorResponse("Sorry, I couldn't execute that action. Please try again.");
        }
    }
    
    public List<String> getSuggestions(String partialText) {
        return nlpService.getSuggestions(partialText);
    }
    
    public Map<String, Object> getCapabilities() {
        Map<String, Object> capabilities = new HashMap<>();
        capabilities.put("features", Arrays.asList("text", "voice", "policy_queries", "claim_queries", "natural_language"));
        capabilities.put("languages", Arrays.asList("en", "es", "fr"));
        capabilities.put("intents", Arrays.asList("greeting", "policy_inquiry", "claim_status", "payment_info", "help", "navigation"));
        return capabilities;
    }
    
    private ChatSession getOrCreateSession(String sessionId, Long userId) {
        if (sessionId != null && !sessionId.isEmpty()) {
            return sessionRepository.findBySessionId(sessionId)
                    .orElseGet(() -> createNewSession(userId));
        }
        return createNewSession(userId);
    }
    
    private ChatSession createNewSession(Long userId) {
        String newSessionId = UUID.randomUUID().toString();
        ChatSession session = new ChatSession();
        session.setSessionId(newSessionId);
        session.setUserId(userId);
        session.setIsActive(true);
        session.setVoiceEnabled(true);
        session.setLanguage("en-US");
        session.setLastActivity(LocalDateTime.now());
        session.setContext("{}");
        return sessionRepository.save(session);
    }
    
    private ChatMessage saveUserMessage(ChatSession session, ChatbotRequest request) {
        ChatMessage message = new ChatMessage();
        message.setMessageId(UUID.randomUUID().toString());
        message.setSession(session);
        message.setText(request.getText());
        message.setSender(ChatMessage.MessageSender.USER);
        message.setMessageType(request.getIsVoice() ? ChatMessage.MessageType.VOICE : ChatMessage.MessageType.TEXT);
        message.setIsVoiceInput(request.getIsVoice());
        
        return messageRepository.save(message);
    }
    
    private void saveBotMessage(ChatSession session, ChatbotResponse response, NLPResult nlpResult) {
        ChatMessage message = new ChatMessage();
        message.setMessageId(UUID.randomUUID().toString());
        message.setSession(session);
        message.setText(response.getMessage());
        message.setSender(ChatMessage.MessageSender.BOT);
        message.setMessageType(ChatMessage.MessageType.TEXT);
        message.setConfidence(nlpResult.getConfidence());
        message.setIntent(nlpResult.getIntent());
        message.setEntities(nlpResult.getEntities() != null ? nlpResult.getEntities().toString() : null);
        message.setActions(response.getActions() != null ? response.getActions().toString() : null);
        message.setProcessingTimeMs(response.getProcessingTimeMs());
        
        messageRepository.save(message);
    }
    
    private void updateSessionActivity(ChatSession session) {
        session.setLastActivity(LocalDateTime.now());
        sessionRepository.save(session);
    }
    
    private ChatbotResponse generateResponse(NLPResult nlpResult, ChatSession session, ChatbotRequest request) {
        String intent = nlpResult.getIntent();
        String text = request.getText().toLowerCase();
        
        String responseText = switch (intent) {
            case "greeting" -> generateGreetingResponse();
            case "policy_inquiry" -> policyQueryService.queryPolicies(session.getUserId());
            case "claim_status" -> claimQueryService.queryClaims(session.getUserId());
            case "payment_info" -> policyQueryService.queryPaymentDue(session.getUserId());
            case "help" -> generateHelpMessage();
            case "navigation" -> generateNavigationResponse();
            default -> generateDefaultResponse(text);
        };
        
        List<ChatbotResponse.ChatAction> actions = generateActions(intent, nlpResult);
        List<String> suggestions = generateSuggestions(intent);
        
        ChatbotResponse response = new ChatbotResponse();
        response.setMessage(responseText);
        response.setActions(actions);
        response.setEntities(nlpResult.getEntities());
        response.setIntent(intent);
        response.setConfidence(nlpResult.getConfidence());
        response.setSuggestions(suggestions);
        response.setNeedsVoiceResponse(request.getIsVoice());
        return response;
    }
    
    private String generateWelcomeMessage() {
        return "Hello! I'm your SecureInsure AI assistant. I can help you with:\n" +
               "• Checking your policy information\n" +
               "• Viewing claim status\n" +
               "• Payment due dates\n" +
               "• General insurance questions\n\n" +
               "How can I assist you today?";
    }
    
    private String generateGreetingResponse() {
        List<String> greetings = Arrays.asList(
            "Hello! How can I help you today?",
            "Hi there! What can I assist you with?",
            "Good to see you! How may I help?",
            "Welcome! What would you like to know about your insurance?"
        );
        return greetings.get(new Random().nextInt(greetings.size()));
    }
    
    private String generateHelpMessage() {
        return "I can help you with:\n\n" +
               "🔍 **Policy Information**\n" +
               "• View your active policies\n" +
               "• Check coverage details\n" +
               "• Premium information\n\n" +
               "📋 **Claims**\n" +
               "• Check claim status\n" +
               "• File new claims\n" +
               "• View claim history\n\n" +
               "💳 **Payments**\n" +
               "• Due dates\n" +
               "• Payment history\n" +
               "• Payment methods\n\n" +
               "Just ask me anything about your insurance!";
    }
    
    private String generateNavigationResponse() {
        return "I can help you navigate to different sections:\n\n" +
               "• **Dashboard** - Overview of your account\n" +
               "• **Policies** - Manage your insurance policies\n" +
               "• **Claims** - File and track claims\n" +
               "• **Payments** - View payment information\n" +
               "• **Profile** - Update your personal information\n\n" +
               "What section would you like to access?";
    }
    
    private String generateDefaultResponse(String text) {
        if (text.contains("policy") || text.contains("coverage")) {
            return "I can help you with policy information. Would you like me to show your active policies or check specific coverage details?";
        } else if (text.contains("claim")) {
            return "I can assist with claims. Would you like to check the status of existing claims or file a new one?";
        } else if (text.contains("payment") || text.contains("bill")) {
            return "I can help with payment information. Would you like to check your payment due date or view payment history?";
        } else {
            return "I'm here to help with your insurance needs. You can ask me about policies, claims, payments, or general insurance questions. What would you like to know?";
        }
    }
    
    private List<ChatbotResponse.ChatAction> generateActions(String intent, NLPResult nlpResult) {
        List<ChatbotResponse.ChatAction> actions = new ArrayList<>();
        
        switch (intent) {
            case "policy_inquiry" -> {
                ChatbotResponse.ChatAction action = new ChatbotResponse.ChatAction();
                action.setType("policy_lookup");
                action.setLabel("View My Policies");
                action.setDescription("Show all active policies");
                action.setData(Map.of("action", "view_policies"));
                actions.add(action);
            }
            case "claim_status" -> {
                ChatbotResponse.ChatAction action = new ChatbotResponse.ChatAction();
                action.setType("claim_status");
                action.setLabel("Check Claim Status");
                action.setDescription("View status of recent claims");
                action.setData(Map.of("action", "view_claims"));
                actions.add(action);
            }
            case "payment_info" -> {
                ChatbotResponse.ChatAction action = new ChatbotResponse.ChatAction();
                action.setType("payment_due");
                action.setLabel("Payment Information");
                action.setDescription("Check payment due dates");
                action.setData(Map.of("action", "view_payments"));
                actions.add(action);
            }
        }
        
        return actions;
    }
    
    private List<String> generateSuggestions(String intent) {
        return switch (intent) {
            case "greeting" -> Arrays.asList("Check my policies", "View claim status", "Payment due date", "Help");
            case "policy_inquiry" -> Arrays.asList("Show coverage details", "Premium information", "Policy documents", "Make changes");
            case "claim_status" -> Arrays.asList("File new claim", "Upload documents", "Check processing time", "Contact adjuster");
            case "payment_info" -> Arrays.asList("Payment history", "Update payment method", "Set up autopay", "Payment options");
            default -> Arrays.asList("Help", "Policies", "Claims", "Payments");
        };
    }
    
    private ChatbotResponse createErrorResponse(String message) {
        ChatbotResponse response = new ChatbotResponse();
        response.setMessage(message);
        response.setConfidence(0.0);
        response.setNeedsVoiceResponse(false);
        return response;
    }
}
