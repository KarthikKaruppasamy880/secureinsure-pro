package com.secureinsure.chatbot.service;

import org.springframework.stereotype.Service;

@Service
public class VoiceProcessingService {
    
    public String speechToText(byte[] audioData) {
        // Mock implementation - in real app this would use speech recognition API
        return "Hello, I need help with my insurance policy";
    }
}
