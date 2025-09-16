package com.secureinsure.chatbot.service;

import org.springframework.stereotype.Service;

@Service
public class ClaimQueryService {
    
    public String queryClaims(Long userId) {
        return "You have 1 active claim:\n" +
               "• Claim #CLM-2024-001 (Auto Accident)\n" +
               "• Status: Under Review\n" +
               "• Filed: September 15, 2024\n" +
               "• Estimated completion: 2-3 weeks";
    }
}
