package com.secureinsure.auth.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.Map;

@Controller
public class VoiceController {

    @MessageMapping("/voice/command")
    @SendTo("/topic/voice/response")
    public Map<String, Object> handleVoiceCommand(Map<String, Object> message) {
        Map<String, Object> response = new HashMap<>();
        
        String command = (String) message.get("command");
        String sessionId = (String) message.get("sessionId");
        
        // Simple voice command processing
        if (command != null) {
            if (command.toLowerCase().contains("hello") || command.toLowerCase().contains("hi")) {
                response.put("type", "tts_chunk");
                response.put("text", "Hello! How can I help you today?");
                response.put("audio_base64", ""); // Mock audio
            } else if (command.toLowerCase().contains("case")) {
                response.put("type", "nlu_intent");
                response.put("name", "ListCases");
                response.put("confidence", 0.9);
            } else {
                response.put("type", "tts_chunk");
                response.put("text", "I understand you said: " + command);
                response.put("audio_base64", ""); // Mock audio
            }
        } else {
            response.put("type", "error");
            response.put("message", "No command received");
        }
        
        response.put("sessionId", sessionId);
        response.put("timestamp", System.currentTimeMillis());
        
        return response;
    }
}
