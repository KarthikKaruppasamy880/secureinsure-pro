package com.secureinsure.chatbot.service;

import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Service
@RestController
public class SimpleChatbotService {
    
    @GetMapping("/health")
    public String health() {
        return "Chatbot service is running!";
    }
    
    @GetMapping("/chat")
    public String chat() {
        return "Hello! I'm your SecureInsure AI assistant. How can I help you today?";
    }
}
