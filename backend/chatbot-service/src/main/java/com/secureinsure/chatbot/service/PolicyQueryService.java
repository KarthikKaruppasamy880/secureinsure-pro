package com.secureinsure.chatbot.service;

import org.springframework.stereotype.Service;

@Service
public class PolicyQueryService {
    
    public String queryPolicies(Long userId) {
        return "You have 2 active policies:\n" +
               "• Auto Policy #AUTO-001 (Expires: Dec 2024)\n" +
               "• Home Policy #HOME-001 (Expires: Mar 2025)";
    }
    
    public String queryPaymentDue(Long userId) {
        return "Your next payment is due on October 15, 2024:\n" +
               "• Auto Policy: $125.00\n" +
               "• Home Policy: $89.50";
    }
}
