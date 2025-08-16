package com.secureinsure.gateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping("/auth")
    public Mono<ResponseEntity<Map<String, Object>>> authFallback() {
        return createFallbackResponse("Auth Service", "Authentication service is temporarily unavailable");
    }

    @GetMapping("/policy")
    public Mono<ResponseEntity<Map<String, Object>>> policyFallback() {
        return createFallbackResponse("Policy Service", "Policy management service is temporarily unavailable");
    }

    @GetMapping("/claims")
    public Mono<ResponseEntity<Map<String, Object>>> claimsFallback() {
        return createFallbackResponse("Claims Service", "Claims processing service is temporarily unavailable");
    }

    @GetMapping("/admin")
    public Mono<ResponseEntity<Map<String, Object>>> adminFallback() {
        return createFallbackResponse("Admin Service", "Administrative service is temporarily unavailable");
    }

    @GetMapping("/notification")
    public Mono<ResponseEntity<Map<String, Object>>> notificationFallback() {
        return createFallbackResponse("Notification Service", "Notification service is temporarily unavailable");
    }

    @GetMapping("/search")
    public Mono<ResponseEntity<Map<String, Object>>> searchFallback() {
        return createFallbackResponse("Search Service", "Search service is temporarily unavailable");
    }

    private Mono<ResponseEntity<Map<String, Object>>> createFallbackResponse(String serviceName, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", "SERVICE_UNAVAILABLE");
        response.put("service", serviceName);
        response.put("message", message);
        response.put("error", "Circuit breaker activated - service is down");
        response.put("path", "/fallback/" + serviceName.toLowerCase().replace(" ", "-"));
        
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response));
    }
} 